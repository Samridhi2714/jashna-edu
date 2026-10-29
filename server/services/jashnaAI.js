// ============================================================
// JASHNA SPARK AI SERVICE (v2)
// ------------------------------------------------------------
// - Model fallback chain + retry + timeout (bot never "goes off")
// - Per-model cooldown after rate limit (429)
// - Lightweight intent router (Hinglish aware)
// - Markers ([LINK:], [CTA:WHATSAPP]) validated and attached in code
// - Languages: English and Roman Hinglish ONLY (no Devanagari)
// - Friendly fallback reply if every model fails
// ============================================================

import Groq from "groq-sdk";

// ------------------------------------------------------------
// GROQ CLIENT
// maxRetries: 0 because we handle retries ourselves
// ------------------------------------------------------------

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: 0,
});

// ------------------------------------------------------------
// MODEL CHAIN (priority order)
// Optional env: GROQ_MODEL, GROQ_FALLBACK_MODELS="a,b,c"
// ------------------------------------------------------------

const PRIMARY_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const FALLBACK_MODELS = (
  process.env.GROQ_FALLBACK_MODELS ||
  "llama-3.3-70b-versatile,llama-3.1-8b-instant"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const MODEL_CHAIN = [PRIMARY_MODEL, ...FALLBACK_MODELS].filter(
  (m, i, arr) => arr.indexOf(m) === i,
);

const REQUEST_TIMEOUT_MS = 15000;
const COOLDOWN_MS = 60 * 1000; // pause a rate-limited model for 60s
const modelCooldown = {}; // model -> timestamp until which it is skipped

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------
// ALLOWED WEBSITE PAGES
// ------------------------------------------------------------

const ALLOWED_PATHS = [
  "/programs",
  "/ielts",
  "/assessment",
  "/weekly-challenge",
  "/events",
  "/testimonials",
  "/resources",
  "/about",
  "/careers",
];

// ------------------------------------------------------------
// SYSTEM PROMPT (compressed to save tokens)
// ------------------------------------------------------------

const SYSTEM_PROMPT = `
You are Jashna Spark, the friendly AI learning assistant of Jashna Edu,
an English communication coaching company.

PERSONALITY: warm, friendly, encouraging, patient, slightly playful,
professional, human. Never pushy, never salesy.

YOU HELP WITH: spoken English, IELTS, public speaking, presentations,
interview preparation, business English, writing, pronunciation,
vocabulary, grammar, learning confidence.

RESPONSE STYLE (STRICT):
- Every reply under 90 words. Never exceed 120.
- Max 3 short bullets. One tip is often enough.
- For improvement tips: only the 2-3 most useful, one short line each.
- No long intro, no summary at the end.
- Teach in small steps. Give more detail only if the learner asks.
- Ask at most ONE short follow-up question.
- Simple English when teaching. Correct mistakes gently in one line.
- At most 1 emoji. Do not keep promoting Jashna.

LANGUAGE (ONLY TWO STYLES ARE ALLOWED):
1. User writes English -> reply in plain English only. No Hindi words.
2. User writes Hinglish (Hindi in English letters) -> reply in natural
   Roman Hinglish, same casual tone as the user.
3. If the user writes Devanagari Hindi -> reply in Roman Hinglish.
4. Mixed English + Hindi -> mirror the mix in Roman letters.
5. NEVER output Devanagari script. Never use pure/formal Hindi.
6. Follow the language of the CURRENT message, not older ones.

Examples:
User: "I want to improve my spoken English."
You: "Absolutely! We can work on fluency and confidence step by step. What feels hardest right now?"
User: "mujhe interview ke liye english improve karni hai"
You: "Bilkul! Interview ke liye hum common questions aur confident answers pe kaam kar sakte hain. Aapka interview kis field ka hai?"

JASHNA FACTS: State specific facts about Jashna Edu only if they are
given in the conversation. Never invent fees, schedules, teachers,
certificates, dates, locations, policies, guarantees, results or
rankings. If you do not know, say so and guide the learner to the
right Jashna page or a human counsellor.

HELP FIRST: Do not ask for name or phone number. Do not turn normal
English-learning chat into a sales talk.

HUMAN HELP: When the user asks about fees, enrollment, joining,
batches, schedules, choosing a course, a brochure, a callback, a
personal learning plan, or wants to talk to someone, briefly say a
Jashna counsellor can guide them personally.

MARKERS (put on the last line of the reply, never mention them):
- [CTA:WHATSAPP] opens a chat with Dr. Shivam Sir, founder of Jashna
  Edu. Use ONLY for the human-help cases above. Never write a phone
  number or WhatsApp link.
- [LINK:/path] suggests a page. Allowed paths ONLY:
  /programs /ielts /assessment /weekly-challenge /events
  /testimonials /resources /about /careers
- Max 2 LINK markers, [CTA:WHATSAPP] last. Skip markers in normal
  English practice or casual chat. Never write URLs.

PRIVACY: Never ask for passwords, OTPs, bank or card details, or
unnecessary personal information.

You are Jashna Spark, not a generic AI assistant. Help first.
`;

// ------------------------------------------------------------
// INTENT ROUTER (Hinglish aware, runs before the LLM)
// ------------------------------------------------------------

const ROUTES = [
  {
    intent: "fees_enrollment",
    test: /\b(fee|fees|price|pricing|cost|kitni fee|kitne (ka|ki|paise)|enrol+|enroll?ment|admission|join|batch|batches|schedule|timing|brochure|demo class)\b/i,
    link: "/programs",
    cta: true,
  },
  {
    intent: "human_help",
    test: /\b(call ?back|callback|counsel+or|talk to (someone|a person|human)|speak to|whatsapp|contact (you|jashna)|baat karni|baat karna|call karo|number do)\b/i,
    cta: true,
  },
  {
    intent: "course_choice",
    test: /\b(which course|konsa course|kaun ?sa course|course (lena|choose|select)|kya lena chahiye|best course|suggest (a )?course)\b/i,
    link: "/programs",
    cta: true,
  },
  {
    intent: "ielts",
    test: /\b(ielts|band score|bands?)\b/i,
    link: "/ielts",
  },
  {
    intent: "level_check",
    test: /\b(my level|level check|check my level|assessment|mera level|level kya)\b/i,
    link: "/assessment",
  },
  {
    intent: "practice",
    test: /\b(weekly challenge|speaking challenge|challenge|practice (kaise|where)|kahan practice)\b/i,
    link: "/weekly-challenge",
  },
  {
    intent: "events",
    test: /\b(event|events|workshop|webinar)\b/i,
    link: "/events",
  },
  {
    intent: "reviews",
    test: /\b(testimonial|reviews?|success stor(y|ies)|results?|feedback from students)\b/i,
    link: "/testimonials",
  },
  {
    intent: "about",
    test: /\b(about jashna|who (are|is) (you|jashna)|jashna (kya|kaun)|founder|shivam)\b/i,
    link: "/about",
  },
  {
    intent: "careers",
    test: /\b(job|jobs|career|careers|hiring|vacancy|internship)\b.*\b(jashna|here|aapke)\b|\bjashna\b.*\b(job|career|hiring|vacancy|internship)\b/i,
    link: "/careers",
  },
];

function routeIntent(message) {
  return ROUTES.find((route) => route.test.test(message)) || null;
}

// ------------------------------------------------------------
// LANGUAGE HELPERS (English / Hinglish only)
// ------------------------------------------------------------

const DEVANAGARI = /[\u0900-\u097F]/;

const HINGLISH_WORDS =
  /\b(mujhe|mera|meri|mere|aap|aapka|aapki|kya|kaise|kaisa|kyun|kyu|nahi|nhi|hai|hain|hoon|hu|karna|karni|karo|karein|chahiye|chahta|chahti|bolna|bolne|samajh|samjh|bhai|yaar|batao|bataiye|abhi|thoda|bahut|accha|achha|theek|lena|dena|kitna|kitni|konsa|kaunsa)\b/i;

function detectStyle(text) {
  if (DEVANAGARI.test(text) || HINGLISH_WORDS.test(text)) return "hinglish";
  return "english";
}

function getFallbackReply(userMessage) {
  if (detectStyle(userMessage) === "hinglish") {
    return "Main aapki help karna chahta hoon! Ek chhota sa technical break aa gaya hai. Ek minute baad dobara try kijiye, ya seedha hamari team se baat kar lijiye.";
  }
  return "I'd love to help! We hit a tiny technical hiccup. Please try again in a minute, or chat directly with our team.";
}

// ------------------------------------------------------------
// NORMALIZE CHAT HISTORY
// ------------------------------------------------------------

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim(),
    )
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 600) }));
}

// ------------------------------------------------------------
// MARKER HANDLING (validated in code, not trusted from LLM)
// ------------------------------------------------------------

const LINK_MARKER = /\[LINK:([^\]\s]+)\]/gi;
const CTA_MARKER = /\[CTA:WHATSAPP\]/gi;

function finalizeReply(rawReply, route) {
  const llmLinks = [...rawReply.matchAll(LINK_MARKER)].map((m) => m[1]);
  const llmWantsCta = CTA_MARKER.test(rawReply);

  // Clean text: remove every marker and any Devanagari that slipped in
  let text = rawReply
    .replace(LINK_MARKER, "")
    .replace(CTA_MARKER, "")
    .replace(/[\u0900-\u097F]+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Router links first, then valid LLM links, no duplicates, max 2
  const links = [];
  const addLink = (path) => {
    if (path && ALLOWED_PATHS.includes(path) && !links.includes(path)) {
      links.push(path);
    }
  };
  addLink(route?.link);
  llmLinks.forEach(addLink);

  const wantsCta = Boolean(route?.cta) || llmWantsCta;

  const markers = [
    ...links.slice(0, 2).map((p) => `[LINK:${p}]`),
    ...(wantsCta ? ["[CTA:WHATSAPP]"] : []),
  ];

  return markers.length ? `${text}\n${markers.join(" ")}` : text;
}

// ------------------------------------------------------------
// GROQ CALL: fallback chain + retry + cooldown
// ------------------------------------------------------------

async function callGroqWithFallback(messages) {
  let lastError = new Error("No model available.");

  for (const model of MODEL_CHAIN) {
    if (modelCooldown[model] && Date.now() < modelCooldown[model]) {
      continue; // still cooling down after a rate limit
    }

    const isReasoningModel = model.includes("gpt-oss");

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const completion = await groq.chat.completions.create(
          {
            model,
            messages,
            temperature: 0.6,
            // reasoning models need headroom; give more on retry
            max_completion_tokens: isReasoningModel
              ? attempt === 1
                ? 700
                : 1200
              : 400,
            ...(isReasoningModel && { reasoning_effort: "low" }),
          },
          { timeout: REQUEST_TIMEOUT_MS },
        );

        const choice = completion?.choices?.[0];
        const reply =
          typeof choice?.message?.content === "string"
            ? choice.message.content.trim()
            : "";

        if (reply) return reply;

        console.warn("Jashna Spark: empty response", {
          model,
          attempt,
          finishReason: choice?.finish_reason ?? "unknown",
        });
        lastError = new Error("EMPTY_RESPONSE");
        await sleep(300 * attempt);
      } catch (err) {
        lastError = err;
        const status = err?.status;

        console.warn("Jashna Spark: model call failed", {
          model,
          attempt,
          status: status ?? "none",
          message: err?.message,
        });

        // Rate limit or auth/model problem: do not retry this model
        if (status === 429) {
          modelCooldown[model] = Date.now() + COOLDOWN_MS;
          break;
        }
        if (status === 400 || status === 401 || status === 403 || status === 404) {
          break;
        }

        // 5xx / timeout / network: short wait, then retry
        await sleep(400 * attempt);
      }
    }
  }

  throw lastError;
}

// ------------------------------------------------------------
// MAIN FUNCTION (same signature as before, returns a string)
// ------------------------------------------------------------

const PERSONAS = {
  marrisa:
    "PERSONA: You are speaking as Marrisa - warm, gentle, supportive mentor for English and confidence. Keep the same rules.",
  mario:
    "PERSONA: You are speaking as Mario - energetic, practical, motivating mentor for speaking and interviews. Keep the same rules.",
};

export async function askJashnaSpark({
  message,
  history = [],
  page = "/",
  character = "",
}) {
  if (!message || typeof message !== "string") {
    throw new Error("A valid message is required.");
  }

  const cleanMessage = message.trim().slice(0, 600);
  if (!cleanMessage) {
    throw new Error("Message cannot be empty.");
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const route = routeIntent(cleanMessage);
  const style = detectStyle(cleanMessage);
  const normalizedHistory = normalizeHistory(history);

  // Safety: if the client already included the current message in
  // history, drop it so the model does not see it twice.
  const lastItem = normalizedHistory[normalizedHistory.length - 1];
  if (lastItem?.role === "user" && lastItem.content === cleanMessage) {
    normalizedHistory.pop();
  }

  const persona = PERSONAS[String(character).toLowerCase()] || "";

  const contextMessage = `
${persona}
CURRENT JASHNA PAGE: ${page}
REPLY STYLE FOR THIS MESSAGE: ${style === "hinglish" ? "Roman Hinglish (English letters only)" : "Plain English"}
${route ? `DETECTED INTENT: ${route.intent}. Answer briefly and stay relevant to it.` : ""}
Use this only to make the reply more relevant. Do not assume facts that were not provided.
`.trim();

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: contextMessage },
    ...normalizedHistory,
    { role: "user", content: cleanMessage },
  ];

  try {
    const rawReply = await callGroqWithFallback(messages);
    const finalReply = finalizeReply(rawReply, route);

    // If cleaning removed everything (e.g. reply was only Devanagari)
    if (!finalReply.replace(/\[[^\]]+\]/g, "").trim()) {
      return finalizeReply(getFallbackReply(cleanMessage), route);
    }

    return finalReply;
  } catch (err) {
    console.error("Jashna Spark: all models failed.", {
      status: err?.status ?? "none",
      message: err?.message,
      userMessage: cleanMessage.slice(0, 150),
    });

    // Never show an error to the visitor: friendly reply + human help
    return finalizeReply(getFallbackReply(cleanMessage), {
      ...(route || {}),
      cta: true,
    });
  }
}