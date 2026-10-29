import { useEffect, useRef, useState } from "react";
import { API_URL } from "../config";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Mic2,
  Phone,
  Send,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import Marrisa from "../assets/images/Marrisa.webp";
import Mario from "../assets/images/Mario.webp";
import { getWhatsAppLink } from "../data/contact";
/* =========================================================
   JASHNA EDU AI ASSISTANT  (MERGED VERSION, v2)
   ---------------------------------------------------------
   FROM FILE 1 (kept as-is in look + behaviour)
   - Floating launcher (rotating rainbow ring + CoachOrb)
   - Desktop greeting card on the home page
   - "Who do you want to talk to?" chooser with 2 coaches

   FROM FILE 2 (kept as-is in look + behaviour)
   - Chat panel (hero with PNG + floating keywords)
   - Action cards, messages, typing indicator, lead form
   - Chat / lead API functionality

   v2 IMPROVEMENTS (chat reliability + engagement)
   - Request timeout + one automatic retry (bot never "freezes")
   - Friendly rate-limit and offline messages (English / Hinglish)
   - Fixed: current message was sent twice (in history + message)
   - Quick-reply chips under the latest bot message
   - One gentle idle nudge (no API call, saves free quota)
   - Input length limit + persona (character) sent to backend
========================================================= */

/* =========================================================
   BRAND
========================================================= */

const JASHNA_BRAND = {
  blue: "#2778E8",
  green: "#48A947",
};

/* =========================================================
   CHAT SETTINGS
========================================================= */

const CHAT_TIMEOUT_MS = 25000; // wait up to 25s for one AI reply
const IDLE_NUDGE_MS = 60000; // one soft nudge after 60s of silence
const MAX_INPUT_LENGTH = 500;
const MAX_HISTORY_SENT = 8;

/* =========================================================
   BOT CONFIG
   Same backend/context. Different visual personality only.
========================================================= */

const BOT_CONFIG = {
  marrisa: {
    id: "marrisa",
    name: "Marrisa",
    image: Marrisa,
    role: "Warm English & confidence mentor",
    shortRole: "Speaking & Confidence Mentor",
    shortDescription: "Warm, supportive and encouraging.",
    description:
      "A warm and supportive mentor for English, confidence and professional growth.",
    tags: ["Warm", "Supportive", "Professional"],

    primary: "#E84393",
    primaryDark: "#B92D70",
    primarySoft: "#FCE2EF",

    secondary: "#9B6DE3",
    secondarySoft: "#EEE5FB",

    accent: "#FF7565",

    dark: "#35172F",
    text: "#202033",
    muted: "#4A4D63",

    heroStart: "#32182F",
    heroMiddle: "#3E1B3C",
    heroEnd: "#241A38",

    cardBg: "#FFFFFF",
    cardHover: "#FFF6FA",
    border: "#EBD5E2",

    panel: "linear-gradient(145deg, #FFF7FB 0%, #F7F0FF 52%, #FFF7F3 100%)",
    button: "linear-gradient(135deg, #E94F91, #A978F4)",
    speech:
      "linear-gradient(135deg, rgba(255,255,255,.98), rgba(255,240,247,.96))",

    keywords: [
      "SPEAK",
      "CONFIDENCE",
      "ENGLISH",
      "GROW",
      "INTERVIEW",
      "EXPRESS",
    ],
    idleWords: ["Speak", "Confidence", "English", "Grow"],

    welcome:
      "Hi! I'm Marrisa. Let's work on your communication goals together. I'm here to guide you with warmth and support as you build your English, confidence and professional growth.",

    greeting: "Let's practise! 💬",

    /* VOICE — spoken when the coach is chosen */
    voiceGreeting:
      "Hi, I'm Marrisa! I'm your Jashna Edu guide for English and confidence. Let's speak with ease and grow together. How can I help you today?",
    voiceGender: "female",
    voicePitch: 1.15,
    voiceRate: 0.98,

    font: "'Nunito', 'Trebuchet MS', 'Segoe UI', system-ui, sans-serif",
  },

  mario: {
    id: "mario",
    name: "Mario",
    image: Mario,
    role: "Energetic speaking & interview mentor",
    shortRole: "Speaking & Interview Mentor",
    shortDescription: "Energetic, practical and motivating.",
    description:
      "An energetic mentor for speaking, interviews, confidence and professional growth.",
    tags: ["Energetic", "Confident", "Practical"],

    primary: "#2577E8",
    primaryDark: "#1554AE",
    primarySoft: "#E2EEFF",

    secondary: "#22B8CF",
    secondarySoft: "#DDF8FB",

    accent: "#9AD83D",

    dark: "#102A42",
    text: "#152033",
    muted: "#46536B",

    heroStart: "#081F3E",
    heroMiddle: "#0A2B51",
    heroEnd: "#08182F",

    cardBg: "#FFFFFF",
    cardHover: "#F4F9FF",
    border: "#D6E4F5",

    panel: "linear-gradient(145deg, #F1F9FF 0%, #EAFBFC 52%, #F5FFE9 100%)",
    button: "linear-gradient(135deg, #287BE8, #19BFC9)",
    speech:
      "linear-gradient(135deg, rgba(255,255,255,.98), rgba(236,251,255,.96))",

    keywords: [
      "SPEAK",
      "CONFIDENCE",
      "ENGLISH",
      "GROW",
      "INTERVIEW",
      "PRACTISE",
    ],
    idleWords: ["Speak", "Focus", "Confidence", "Level Up"],

    welcome:
      "Hi! I'm Mario. Let's work on your communication goals together. I'm here to help you practise speaking, build confidence and prepare for professional situations.",

    greeting: "Ready to practise! 🎤",

    /* VOICE — spoken when the coach is chosen */
    voiceGreeting:
      "Hey there! I'm Mario, your Jashna Edu guide for speaking and interviews. Ready to level up? Tell me what you want to work on!",
    voiceGender: "male",
    voicePitch: 0.85,
    voiceRate: 1.04,

    font: "'Inter', 'Segoe UI', Arial, system-ui, sans-serif",
  },
};
const PAGE_LINKS = {
  "/programs": "Explore Programs",
  "/ielts": "IELTS Course",
  "/assessment": "Take Assessment",
  "/weekly-challenge": "Weekly Challenge",
  "/events": "See Events",
  "/testimonials": "Student Stories",
  "/resources": "Free Resources",
  "/about": "About Jashna",
  "/careers": "Careers",
};
/* =========================================================
   QUICK ACTIONS
========================================================= */

const CHAT_ACTIONS = [
  {
    id: "speaking",
    title: "Improve my speaking",
    description: "Speak more clearly and confidently.",
    icon: Mic2,
    prompt:
      "I want to improve my speaking. Give me a practical exercise I can start right now.",
  },
  {
    id: "interview",
    title: "Prepare for an interview",
    description: "Practise answers and interview communication.",
    icon: MessageCircle,
    prompt:
      "Help me prepare for an interview. Start by asking me one realistic interview question.",
  },
  {
    id: "confidence",
    title: "Build my confidence",
    description: "Become more comfortable while speaking.",
    icon: Sparkles,
    prompt:
      "I want to become more confident while speaking English. Give me a simple practice routine.",
  },
  {
    id: "english",
    title: "Practise English",
    description: "Improve vocabulary, grammar and fluency.",
    icon: Star,
    prompt:
      "Let's practise English together. Give me a short speaking activity and correct my mistakes.",
  },
  {
    id: "assessment",
    title: "Take an assessment",
    description: "Understand where your communication stands.",
    icon: CheckCircle2,
    prompt:
      "I want to understand my current communication level. What kind of assessment should I take?",
    navigate: "/assessment",
  },
];

/* =========================================================
   LANGUAGE STYLE  (English / Hinglish only)
   Used for fallback messages, nudges and quick-reply chips so
   they match how the learner is writing.
========================================================= */

const HINGLISH_HINT =
  /\b(mujhe|mera|meri|mere|aap|aapka|aapki|kya|kaise|kaisa|kyun|kyu|nahi|nhi|hai|hain|hoon|hu|karna|karni|karo|karein|chahiye|chahta|chahti|bolna|bolne|samajh|samjh|bhai|yaar|batao|bataiye|abhi|thoda|bahut|accha|achha|theek|lena|dena|kitna|kitni|konsa|kaunsa)\b/i;

const detectStyle = (text = "") =>
  /[\u0900-\u097F]/.test(text) || HINGLISH_HINT.test(text)
    ? "hinglish"
    : "english";

const FALLBACK_MESSAGES = {
  english:
    "I'm having a little trouble connecting right now. Please try again in a moment, or chat with Dr. Shivam Sir directly.",
  hinglish:
    "Abhi thoda connection issue aa raha hai. Please thodi der baad try kijiye, ya seedha Dr. Shivam Sir se baat kar lijiye.",
};

const RATE_LIMIT_MESSAGES = {
  english: "You're quick! Give me a few seconds and send that again.",
  hinglish: "Aap bahut fast ho! Kuch seconds ruk kar phir se bhejiye.",
};

const NUDGES = {
  marrisa: {
    english:
      "Take your time! Whenever you're ready, tell me one thing you'd like to practise. 😊",
    hinglish:
      "Aaram se! Jab ready ho, bas ek cheez batao jo aap practise karna chahte ho. 😊",
  },
  mario: {
    english:
      "Still here! Want to try one quick speaking challenge together? 🎤",
    hinglish:
      "Main yahin hoon! Ek quick speaking challenge try karein? 🎤",
  },
};

const QUICK_REPLIES = {
  english: [
    { label: "One more tip", prompt: "Give me one more tip." },
    {
      label: "Practise with me",
      prompt:
        "Let's practise. Ask me one short question that I can answer in English.",
    },
    { label: "Check my level", navigate: "/assessment" },
  ],
  hinglish: [
    { label: "Ek aur tip do", prompt: "Ek aur tip do." },
    {
      label: "Mere saath practice karo",
      prompt: "Mere saath practice karo. Mujhse ek chhota sawaal poochho.",
    },
    { label: "Mera level check karo", navigate: "/assessment" },
  ],
};

/* =========================================================
   HELPERS
========================================================= */

const createMessage = (role, content, extra = {}) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
  ...extra,
});

/*
  Calls the chat API with a timeout and ONE automatic retry.
  - 429 (too many requests) is returned as { rateLimited: true }
  - other 4xx errors are not retried
  - network errors / timeouts / 5xx are retried once
*/
async function requestChatReply(payload) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 429) {
        return { rateLimited: true };
      }

      if (!response.ok) {
        const error = new Error(`Chat request failed (${response.status})`);
        error.noRetry = response.status >= 400 && response.status < 500;
        throw error;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timer);
      lastError = error;

      if (error?.noRetry || attempt === 2) break;

      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  throw lastError;
}

/* =========================================================
   VOICE HELPERS  (browser speechSynthesis — no API needed)
========================================================= */

const speechSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

/*
  Picks the best English voice for the coach.
  Marrisa -> female-sounding voice, Mario -> male-sounding voice.
  If no matching voice exists on the device, we return null and the
  default voice is used (pitch still differs, so they sound different).
*/
function pickVoice(gender) {
  if (!speechSupported) return null;

  const english = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("en"));

  if (!english.length) return null;

  const femaleHint =
    /female|zira|samantha|susan|aria|jenny|heera|veena|neerja|karen|moira|tessa|serena|google us english/i;
  const maleHint =
    /\bmale\b|david|mark|daniel|alex|guy|ravi|prabhat|rishi|george|james|fred/i;

  const matches = english.filter((voice) =>
    gender === "female"
      ? femaleHint.test(voice.name)
      : !/female/i.test(voice.name) && maleHint.test(voice.name),
  );

  /* prefer Indian English if the device has it */
  return (
    matches.find((voice) => voice.lang.toLowerCase() === "en-in") ||
    matches[0] ||
    null
  );
}

/* =========================================================
   SHINE  (white light sweep on hover — put inside any
   `relative overflow-hidden group` button)
========================================================= */

function Shine() {
  return (
    <span className="pointer-events-none absolute inset-y-0 -left-[60%] w-1/2 skew-x-[-20deg] bg-white/30 opacity-0 transition-all duration-700 ease-out group-hover:left-[130%] group-hover:opacity-100" />
  );
}

/* =========================================================
   JASHNA BRAND MARK   (file 1)
   `small` is used inside the launcher orb. 
========================================================= */

function JashnaBrandMark({ small = false, tiny = false }) {
  return (
    <div
      className={`flex items-center justify-center whitespace-nowrap font-black tracking-[-0.07em] ${
        tiny
          ? "text-[9px]"
          : small
            ? "text-[7px] sm:text-[9px]"
            : "text-[18px]"
      }`}
    >
      <span style={{ color: JASHNA_BRAND.blue }}>JASHNA</span>
      <span className="ml-0.5" style={{ color: JASHNA_BRAND.green }}>
        EDU
      </span>
    </div>
  );
}

/* =========================================================
   NEUTRAL COACH ORB   (file 1 — launcher before choosing)
   Green sparkle badge removed (mic is already there).
========================================================= */

function CoachOrb({ active = false, tinyBrand = false }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="absolute inset-[-7px] rounded-full"
        style={{
          background:
            "conic-gradient(from 180deg,#E94F91,#A978F4,#3288F5,#20C9D5,#E94F91)",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute inset-[-4px] rounded-full bg-white" />

      <motion.div
        className="relative z-10 flex h-[60px] w-[60px] flex-col items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow-[0_12px_30px_rgba(20,40,80,.2)] sm:h-[68px] sm:w-[68px]"
        animate={{ scale: active ? [1, 1.04, 1] : [1, 1.02, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-br from-[#FFF0F7] to-[#F2E8FF]" />
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-br from-[#EEF9FF] to-[#E8FFFF]" />
        </div>

        <motion.div
          className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-lg sm:h-8 sm:w-8"
          style={{
            background:
              "linear-gradient(135deg,#E94F91 0%,#A978F4 48%,#3288F5 100%)",
          }}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mic2 size={14} strokeWidth={2.4} />
        </motion.div>

        <div className="relative z-10 mt-0.5 sm:mt-1">
          <JashnaBrandMark small tiny={tinyBrand} />
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   CHARACTER LAUNCHER   (file 1 — launcher after choosing)
========================================================= */

function CharacterLauncher({ bot, active = false }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: `${bot.primary}45` }}
        animate={{
          scale: active ? [0.9, 1.15, 0.9] : [0.96, 1.04, 0.96],
          opacity: active ? [0.4, 0.8, 0.4] : [0.35, 0.5, 0.35],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.img
        src={bot.image}
        alt={bot.name}
        className="relative z-10 h-full w-full object-contain object-bottom"
        animate={{ y: active ? [0, -2, 0] : [0, -1, 0] }}
        transition={{
          duration: bot.id === "marrisa" ? 3.5 : 2.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* =========================================================
   CHOOSER SCENE PIECES   (file 1 — floating words / dots /
   waveform / speech bubble)
========================================================= */

function FloatingWord({
  bot,
  children,
  className = "",
  delay = 0,
  rotate = 0,
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute z-20 ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: [0.7, 1, 0.7],
        y: [0, -9, 0],
        rotate: [rotate, rotate + 3, rotate],
      }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] shadow-lg backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[11px]"
        style={{
          color: bot.primaryDark,
          borderColor: `${bot.primary}30`,
          background: "rgba(255,255,255,.92)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

function FloatingDot({ bot, className = "", delay = 0, size = "small" }) {
  const sizeClass = size === "medium" ? "h-2.5 w-2.5" : "h-2 w-2";

  return (
    <motion.span
      className={`pointer-events-none absolute z-10 rounded-full ${sizeClass} ${className}`}
      style={{
        background: bot.accent,
        boxShadow: `0 0 14px ${bot.accent}90`,
      }}
      animate={{
        y: [0, -10, 0],
        opacity: [0.35, 0.9, 0.35],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 3.5, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function CharacterWaveform({ bot }) {
  const bars = [8, 14, 22, 12, 28, 18, 34, 24, 31, 16, 25, 12, 20, 14, 8];

  return (
    <div className="flex h-6 items-center justify-center gap-[2px]">
      {bars.map((height, index) => (
        <motion.span
          key={index}
          className="w-[3px] rounded-full"
          style={{
            background: index % 3 === 0 ? bot.accent : bot.primary,
          }}
          animate={{
            height: [
              Math.max(3, height * 0.3),
              height * 0.7,
              Math.max(4, height * 0.45),
              height * 0.6,
            ],
            opacity: [0.5, 1, 0.65, 0.95],
          }}
          transition={{
            duration: 0.65 + index * 0.035,
            repeat: Infinity,
            repeatType: "mirror",
            delay: index * 0.02,
          }}
        />
      ))}
    </div>
  );
}

function ChooserScene({ bot }) {
  return (
    <div className="relative mx-auto h-[260px] w-full sm:h-[280px]">
      {/* ambient glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-0 h-[210px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle,${bot.primary}35,transparent 68%)`,
        }}
        animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.55, 0.85, 0.55] }}
        transition={{
          duration: bot.id === "marrisa" ? 4 : 3,
          repeat: Infinity,
        }}
      />

      {/* floating words */}
      <FloatingWord
        bot={bot}
        className="left-[3%] top-[56px]"
        delay={0.3}
        rotate={-5}
      >
        {bot.idleWords[0]}
      </FloatingWord>
      <FloatingWord
        bot={bot}
        className="right-[3%] top-[92px]"
        delay={0.9}
        rotate={4}
      >
        {bot.idleWords[1]}
      </FloatingWord>
      <FloatingWord
        bot={bot}
        className="left-[5%] bottom-[78px]"
        delay={1.4}
        rotate={3}
      >
        {bot.idleWords[2]}
      </FloatingWord>

      {/* dots */}
      <FloatingDot
        bot={bot}
        className="left-[17%] top-[23px]"
        delay={0.4}
        size="medium"
      />
      <FloatingDot bot={bot} className="right-[17%] top-[30px]" delay={1.1} />
      <FloatingDot bot={bot} className="left-[23%] bottom-[35px]" delay={1.6} />
      <FloatingDot
        bot={bot}
        className="right-[22%] bottom-[27px]"
        delay={2}
        size="medium"
      />

      {/* character */}
      <motion.div
        className="absolute bottom-[4px] left-1/2 z-10 h-[235px] w-[220px] -translate-x-1/2 sm:h-[255px] sm:w-[240px]"
        animate={{ y: bot.id === "marrisa" ? [0, -4, 0] : [0, -6, 0] }}
        transition={{
          duration: bot.id === "marrisa" ? 4 : 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.img
          src={bot.image}
          alt={`${bot.name}, Jashna Edu ${bot.shortRole}`}
          className="h-full w-full object-contain object-bottom drop-shadow-[0_18px_25px_rgba(0,0,0,.18)]"
          draggable="false"
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
        />
      </motion.div>

      {/* speech bubble */}
      <motion.div
        className="absolute right-[2%] top-[4px] z-30 max-w-[170px] sm:max-w-[190px]"
        initial={{ opacity: 0, scale: 0.85, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 0.3 },
          scale: { duration: 0.5, delay: 0.3 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
      >
        <div
          className="relative rounded-[16px] border px-3 py-2 shadow-[0_12px_25px_rgba(0,0,0,.12)] backdrop-blur-xl sm:px-3.5 sm:py-2.5"
          style={{
            background: bot.speech,
            borderColor: `${bot.primary}30`,
          }}
        >
          <div
            className="text-[13px] font-black leading-[1.35] sm:text-[14px]"
            style={{ color: bot.dark }}
          >
            {bot.greeting}
          </div>

          <div
            className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 border-b border-r"
            style={{
              borderColor: `${bot.primary}30`,
              background: bot.id === "marrisa" ? "#FFF9FC" : "#F6FDFF",
            }}
          />
        </div>
      </motion.div>

      {/* waveform pill */}
      <motion.div
        className="absolute bottom-[10px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 shadow-[0_10px_25px_rgba(0,0,0,.1)] backdrop-blur-xl sm:px-3.5 sm:py-2"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mic2 size={13} style={{ color: bot.primary }} />
        <CharacterWaveform bot={bot} />
        <span
          className="text-[10px] font-black uppercase tracking-[0.12em] sm:text-[11px]"
          style={{ color: bot.dark }}
        >
          Speak
        </span>
      </motion.div>
    </div>
  );
}

/* =========================================================
   CHARACTER CHOOSER   (file 1 — "Who do you want to talk to?")
========================================================= */

function CharacterChooser({ onSelect, onClose }) {
  const bots = [BOT_CONFIG.marrisa, BOT_CONFIG.mario];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020A1C]/75 px-3 py-4 backdrop-blur-xl sm:px-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-h-[94dvh] w-full max-w-[880px] overflow-y-auto rounded-[30px] border border-white/20 bg-white p-4 shadow-[0_40px_120px_rgba(0,0,0,.4)] sm:rounded-[36px] sm:p-7"
      >
        {/* close */}
        <motion.button
          type="button"
          onClick={onClose}
          aria-label="Close"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
        >
          <X size={20} />
        </motion.button>

        {/* header */}
        <div className="mx-auto max-w-[620px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-3 flex items-center justify-center gap-2"
          >
            <span className="h-px w-8 bg-slate-200" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
              <Mic2 size={15} className="text-[#2778E8]" />
            </span>
            <span className="h-px w-8 bg-slate-200" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <JashnaBrandMark />

            <p className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 sm:text-[12px] sm:tracking-[0.2em]">
              Meet your Jashna English & confidence mentors
            </p>

            <h2 className="mt-2 text-[28px] font-black leading-[1.05] tracking-[-0.05em] text-[#10233E] sm:text-[44px]">
              Who do you want to talk to?
            </h2>

            <p className="mx-auto mt-3 max-w-[520px] text-[14px] font-semibold leading-[1.6] text-slate-600 sm:text-[16px]">
              Two personalities, one Jashna Edu learning experience. Choose the
              coach whose style feels right for you.
            </p>
          </motion.div>
        </div>

        {/* cards */}
        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
          {bots.map((bot, index) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-[27px] border p-3.5 transition-shadow duration-300 hover:shadow-[0_28px_60px_rgba(0,0,0,.14)] sm:rounded-[30px] sm:p-4"
              style={{
                background: bot.panel,
                borderColor: `${bot.primary}35`,
                fontFamily: bot.font,
              }}
            >
              <motion.div
                className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full blur-3xl"
                style={{ background: `${bot.primary}25` }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full blur-3xl"
                style={{ background: `${bot.secondary}22` }}
                animate={{ scale: [1.1, 1, 1.1] }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              <div className="relative">
                <ChooserScene bot={bot} />
              </div>

              <div className="relative mt-1 rounded-[21px] border border-white/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-xl sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="text-[24px] font-black leading-none tracking-[-0.045em] sm:text-[28px]"
                        style={{ color: bot.dark }}
                      >
                        {bot.name}
                      </h3>

                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] sm:text-[11px]"
                        style={{
                          color: bot.primaryDark,
                          background: `${bot.primary}15`,
                        }}
                      >
                        AI Coach
                      </span>
                    </div>

                    <p
                      className="mt-1.5 text-[11px] font-black uppercase tracking-[0.1em] sm:text-[12px] sm:tracking-[0.12em]"
                      style={{ color: bot.primaryDark }}
                    >
                      {bot.role}
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => onSelect(bot.id)}
                    whileHover={{ scale: 1.12, rotate: -4 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg sm:h-12 sm:w-12"
                    style={{ background: bot.button }}
                    aria-label={`Talk to ${bot.name}`}
                  >
                    <ArrowRight size={20} strokeWidth={2.6} />
                  </motion.button>
                </div>

                <p
                  className="mt-3 text-[14px] font-bold leading-[1.5] sm:text-[15px]"
                  style={{ color: bot.muted }}
                >
                  {bot.shortDescription}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {bot.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      whileHover={{ y: -2, scale: 1.05 }}
                      className="rounded-full border bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.06em] sm:px-3 sm:py-1.5 sm:text-[11px]"
                      style={{
                        borderColor: `${bot.primary}30`,
                        color: bot.primaryDark,
                      }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={() => onSelect(bot.id)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="group/btn relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-[15px] px-4 py-3.5 text-[13px] font-black uppercase tracking-[0.06em] text-white shadow-lg sm:py-4 sm:text-[14px]"
                  style={{ background: bot.button }}
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-[60%] w-1/2 skew-x-[-20deg] bg-white/30 opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[130%] group-hover/btn:opacity-100" />
                  Talk to {bot.name}
                  <ArrowUpRight size={17} strokeWidth={2.6} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">
          <span className="h-px w-6 bg-slate-200" />
          Same Jashna Edu intelligence
          <span className="h-px w-6 bg-slate-200" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   FLOATING KEYWORD   (file 2)
   Position is now passed as Tailwind classes so each keyword
   can sit in a different place on mobile vs desktop, or be
   hidden on mobile (`hidden sm:block`).
========================================================= */

function FloatingKeyword({ children, bot, className = "", delay = 0 }) {
  return (
    <motion.div
      className={`absolute z-20 select-none ${className}`}
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
      whileHover={{ scale: 1.15, rotate: -3 }}
      transition={{
        opacity: { duration: 0.45, delay },
        scale: { duration: 0.45, delay, type: "spring" },
        y: {
          duration: 3.2,
          repeat: Infinity,
          delay: delay + 0.5,
          ease: "easeInOut",
        },
      }}
    >
      <div
        className="cursor-default rounded-full border px-2 py-1 text-[9px] font-black tracking-[0.1em] shadow-lg backdrop-blur-md sm:px-3.5 sm:py-2 sm:text-[13px] sm:tracking-[0.12em]"
        style={{
          color: bot.primaryDark,
          background: "rgba(255,255,255,0.95)",
          borderColor: bot.primarySoft,
          boxShadow: `0 8px 22px ${bot.primary}28`,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* =========================================================
   CHARACTER HERO   (file 2 — big PNG + floating keywords)
   Mobile: only 2 small keywords, parked in the top corners
   so they never cover the character. Desktop: unchanged.
========================================================= */

function CharacterHero({ bot, isSpeaking = false }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "clamp(300px, 43vh, 440px)",
        minHeight: 300,
        background: `linear-gradient(145deg, ${bot.heroStart} 0%, ${bot.heroMiddle} 48%, ${bot.heroEnd} 100%)`,
      }}
    >
      {/* ambient circles */}
      <motion.div
        className="absolute -left-20 top-12 h-44 w-44 rounded-full blur-3xl"
        style={{ background: `${bot.primary}25` }}
        animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 bottom-4 h-48 w-48 rounded-full blur-3xl"
        style={{ background: `${bot.secondary}20` }}
        animate={{ x: [0, -15, 0], y: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: `
            linear-gradient(${bot.secondary} 1px, transparent 1px),
            linear-gradient(90deg, ${bot.secondary} 1px, transparent 1px)
          `,
          backgroundSize: "34px 34px",
        }}
      />

      {/* floating keywords
          1st + 2nd stay on mobile (top corners, small).
          3rd, 4th, 5th appear only from `sm` upwards. */}
      <FloatingKeyword
        bot={bot}
        className="left-[4%] top-[7%] sm:left-[6%] sm:top-[29%]"
        delay={0.1}
      >
        {bot.keywords[0]}
      </FloatingKeyword>
      <FloatingKeyword
        bot={bot}
        className="right-[4%] top-[7%] sm:right-[5%] sm:top-[37%]"
        delay={0.25}
      >
        {bot.keywords[1]}
      </FloatingKeyword>
      <FloatingKeyword
        bot={bot}
        className="hidden sm:block sm:left-[5%] sm:bottom-[28%]"
        delay={0.4}
      >
        {bot.keywords[2]}
      </FloatingKeyword>
      <FloatingKeyword
        bot={bot}
        className="hidden sm:block sm:right-[6%] sm:bottom-[27%]"
        delay={0.55}
      >
        {bot.keywords[3]}
      </FloatingKeyword>
      <FloatingKeyword
        bot={bot}
        className="hidden sm:block sm:left-[14%] sm:top-[55%]"
        delay={0.7}
      >
        {bot.keywords[4]}
      </FloatingKeyword>

      {/* speech bubble */}
      <motion.div
        className="absolute right-[8%] top-4 z-30 hidden sm:block"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: [0, -3, 0] }}
        whileHover={{ scale: 1.08 }}
        transition={{
          opacity: { duration: 0.5 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div
          className="relative rounded-full bg-white px-5 py-2.5 text-[14px] font-black shadow-xl"
          style={{ color: bot.text }}
        >
          {bot.greeting}
          <span className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 bg-white" />
        </div>
      </motion.div>

      {/* LARGE CHARACTER IMAGE */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center">
        <motion.div
          className="relative w-[78%] max-w-[450px] sm:w-[88%]"
          initial={{ opacity: 0, y: 25, scale: 0.94 }}
          animate={{ opacity: 1, y: [0, -4, 0], scale: 1 }}
          transition={{
            opacity: { duration: 0.5 },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.6, type: "spring", stiffness: 160 },
          }}
        >
          <div
            className="absolute inset-x-[15%] bottom-3 top-[15%] rounded-[40px] blur-2xl"
            style={{ background: `${bot.primary}25` }}
          />

          <motion.img
            src={bot.image}
            alt={`${bot.name}, Jashna Edu ${bot.shortRole}`}
            className="relative z-10 block h-auto w-full cursor-pointer object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.28)]"
            draggable="false"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97, rotate: [0, -2, 2, 0] }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
          />
        </motion.div>
      </div>

      {/* online status pill */}
      <div className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2">
        <motion.div
          className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-2xl backdrop-blur-xl sm:gap-2.5 sm:px-5 sm:py-2.5"
          style={{
            background: "rgba(24,17,31,0.92)",
            borderColor: `${bot.primary}55`,
          }}
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="flex h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
            style={{ background: bot.accent }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.65, 1] }}
            transition={{ duration: 1.7, repeat: Infinity }}
          />
          <Mic2
            color="#fff"
            strokeWidth={2.5}
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white sm:text-[13px] sm:tracking-[0.14em]">
            {isSpeaking ? `${bot.name} is speaking` : `${bot.name} is online`}
          </span>
          {isSpeaking && <CharacterWaveform bot={bot} />}
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================
   BOT AVATAR   (file 2)
========================================================= */

function BotAvatar({ bot, size = "normal" }) {
  const isSmall = size === "small";

  return (
    <motion.div
      className={`relative shrink-0 overflow-hidden rounded-2xl border ${
        isSmall ? "h-10 w-10 sm:h-11 sm:w-11" : "h-12 w-12 sm:h-14 sm:w-14"
      }`}
      style={{
        background: `linear-gradient(145deg, ${bot.primarySoft}, ${bot.secondarySoft})`,
        borderColor: `${bot.primary}35`,
      }}
      whileHover={{ scale: 1.1, rotate: [-1, 2, -2, 0] }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={bot.image}
        alt={bot.name}
        className="h-full w-full object-cover object-top"
      />
    </motion.div>
  );
}

/* =========================================================
   ACTION CARD   (file 2 — slightly smaller on mobile)
========================================================= */

function ActionCard({ action, bot, onClick }) {
  const Icon = action.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-[18px] border p-3 text-left outline-none focus-visible:ring-4 sm:gap-3.5 sm:rounded-[20px] sm:p-4"
      style={{
        background: bot.cardBg,
        borderColor: bot.border,
        boxShadow: `0 4px 14px ${bot.primary}12`,
      }}
      whileHover={{
        y: -4,
        scale: 1.015,
        backgroundColor: bot.cardHover,
        borderColor: `${bot.primary}80`,
        boxShadow: `0 16px 32px ${bot.primary}28`,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Shine />

      <motion.div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border sm:h-14 sm:w-14 sm:rounded-[16px]"
        style={{
          background: bot.primarySoft,
          borderColor: `${bot.primary}30`,
          color: bot.primaryDark,
        }}
        whileHover={{ scale: 1.1, rotate: -6 }}
      >
        <Icon
          strokeWidth={2.5}
          className="h-[22px] w-[22px] sm:h-[25px] sm:w-[25px]"
        />
      </motion.div>

      <div className="min-w-0 flex-1">
        <h3
          className="text-[15px] font-black leading-[1.2] sm:text-[18px]"
          style={{ color: bot.text }}
        >
          {action.title}
        </h3>

        <p
          className="mt-0.5 text-[12px] font-bold leading-[1.4] sm:mt-1 sm:text-[14px]"
          style={{ color: bot.muted }}
        >
          {action.description}
        </p>
      </div>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110 sm:h-11 sm:w-11"
        style={{ background: bot.primary }}
      >
        <ChevronRight
          strokeWidth={3}
          className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
        />
      </div>
    </motion.button>
  );
}

/* =========================================================
   QUICK REPLY CHIPS   (v2 — shown under the latest bot message)
========================================================= */

function QuickReplies({ bot, chips, onPick }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {chips.map((chip, index) => (
        <motion.button
          key={chip.label}
          type="button"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.07 }}
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPick(chip)}
          className="rounded-full border px-3 py-1.5 text-[12px] font-black sm:px-3.5 sm:py-2 sm:text-[13px]"
          style={{
            borderColor: `${bot.primary}55`,
            background: bot.primarySoft,
            color: bot.primaryDark,
          }}
        >
          {chip.label}
        </motion.button>
      ))}
    </div>
  );
}

/* =========================================================
   MESSAGE CONTENT   (file 2 — markdown-lite, balanced sizes)
========================================================= */

function MessageContent({ content, bot }) {
  const parts = content.split("\n");

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {parts.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-1" />;
        }

        const segments = trimmed.split(/(\*\*.*?\*\*)/g);

        return (
          <p
            key={index}
            className="text-[14px] font-bold leading-[1.6] sm:text-[16px] sm:leading-[1.65]"
            style={{ color: bot.text }}
          >
            {segments.map((segment, segmentIndex) => {
              if (segment.startsWith("**") && segment.endsWith("**")) {
                return (
                  <strong
                    key={segmentIndex}
                    className="font-black"
                    style={{ color: bot.primaryDark }}
                  >
                    {segment.slice(2, -2)}
                  </strong>
                );
              }

              return segment;
            })}
          </p>
        );
      })}
    </div>
  );
}

/* =========================================================
   TYPING INDICATOR   (file 2)
========================================================= */

function TypingIndicator({ bot }) {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar bot={bot} size="small" />

      <div
        className="rounded-[18px] rounded-bl-md border px-3.5 py-3 sm:px-4 sm:py-3.5"
        style={{ background: bot.cardBg, borderColor: bot.border }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((item) => (
            <motion.span
              key={item}
              className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
              style={{ background: bot.primary }}
              animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: item * 0.12,
              }}
            />
          ))}

          <span
            className="ml-1.5 text-[12px] font-black sm:text-[13px]"
            style={{ color: bot.muted }}
          >
            {bot.name} is thinking
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LEAD FORM   (file 2 — balanced sizes)
========================================================= */

function LeadForm({
  bot,
  leadForm,
  setLeadForm,
  onSubmit,
  onClose,
  leadStatus,
}) {
  const inputClass =
    "w-full rounded-[14px] border bg-white px-4 py-3 text-[14px] font-bold outline-none transition placeholder:text-slate-400 focus:ring-4 sm:py-3.5 sm:text-[15px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="mt-5 rounded-[22px] border p-4 sm:p-5"
      style={{
        background: bot.primarySoft,
        borderColor: `${bot.primary}35`,
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3
            className="text-[18px] font-black leading-tight sm:text-[20px]"
            style={{ color: bot.text }}
          >
            Connect with Jashna Edu
          </h3>

          <p
            className="mt-1.5 text-[13px] font-bold leading-[1.5] sm:text-[14px]"
            style={{ color: bot.muted }}
          >
            Leave your details and the Jashna Edu team can help you with the
            next step.
          </p>
        </div>

        <motion.button
          type="button"
          onClick={onClose}
          aria-label="Close form"
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="rounded-full p-2 transition hover:bg-white/80"
          style={{ color: bot.text }}
        >
          <X size={20} />
        </motion.button>
      </div>

      <div className="space-y-3">
        <input
          value={leadForm.name}
          onChange={(e) =>
            setLeadForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Your name"
          autoComplete="name"
          maxLength={80}
          className={inputClass}
          style={{ borderColor: bot.border, color: bot.text }}
        />

        <input
          value={leadForm.phone}
          onChange={(e) =>
            setLeadForm((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="Phone number"
          type="tel"
          autoComplete="tel"
          maxLength={25}
          className={inputClass}
          style={{ borderColor: bot.border, color: bot.text }}
        />

        <select
          value={leadForm.interest}
          onChange={(e) =>
            setLeadForm((prev) => ({ ...prev, interest: e.target.value }))
          }
          className="w-full rounded-[14px] border bg-white px-4 py-3 text-[14px] font-bold outline-none transition focus:ring-4 sm:py-3.5 sm:text-[15px]"
          style={{ borderColor: bot.border, color: bot.text }}
        >
          <option value="">What are you interested in?</option>
          <option value="Spoken English">Spoken English</option>
          <option value="IELTS">IELTS</option>
          <option value="Public Speaking">Public Speaking</option>
          <option value="Interview Skills">Interview Skills</option>
          <option value="Business English">Business English</option>
        </select>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={leadForm.marketingConsent}
            onChange={(e) =>
              setLeadForm((prev) => ({
                ...prev,
                marketingConsent: e.target.checked,
              }))
            }
            className="mt-1 h-4 w-4"
            style={{ accentColor: bot.primary }}
          />

          <span
            className="text-[12px] font-bold leading-[1.45] sm:text-[13px]"
            style={{ color: bot.muted }}
          >
            I agree to be contacted by Jashna Edu regarding my enquiry.
          </span>
        </label>

        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={leadStatus === "submitting"}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] px-4 py-3.5 text-[15px] font-black text-white shadow-lg transition disabled:opacity-60 sm:py-4 sm:text-[16px]"
          style={{
            background: `linear-gradient(90deg, ${bot.primaryDark}, ${bot.primary})`,
          }}
        >
          <Shine />
          {leadStatus === "submitting" ? (
            "Sending..."
          ) : (
            <>
              <Phone size={18} />
              Connect with Jashna Edu
            </>
          )}
        </motion.button>

        {leadStatus === "success" && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 text-center text-[13px] font-black text-green-700 sm:text-[14px]"
          >
            <Check size={18} strokeWidth={3} />
            Your details were sent successfully.
          </motion.p>
        )}

        {leadStatus === "error" && (
          <motion.p
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [0, -5, 5, -3, 3, 0] }}
            className="text-center text-[13px] font-black text-red-600 sm:text-[14px]"
          >
            Please add your name and phone number, then try again.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN WIDGET
========================================================= */

export default function JashnaAiWidget() {
  const location = useLocation();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const leadEndRef = useRef(null);
  const inputRef = useRef(null);

  const [selectedBot, setSelectedBot] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [showChooser, setShowChooser] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const [isTyping, setIsTyping] = useState(false);
  const [characterActive, setCharacterActive] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadStatus, setLeadStatus] = useState("idle");

  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    interest: "",
    marketingConsent: false,
  });

  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingSeen, setGreetingSeen] = useState(false);

  const [voiceOn, setVoiceOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const bot = selectedBot ? BOT_CONFIG[selectedBot] : null;

  /* has the learner written at least one message? (chips + nudge) */
  const hasUserChatted = messages.some((item) => item.role === "user");

  /* style (English / Hinglish) of the learner's latest message */
  const learnerStyle = detectStyle(
    [...messages].reverse().find((item) => item.role === "user")?.content ||
      "",
  );

  /* -------------------------------------------------------
     VOICE  (greeting spoken when a coach is chosen)
  ------------------------------------------------------- */

  const stopSpeaking = () => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakGreeting = (botId, force = false) => {
    if (!speechSupported || (!voiceOn && !force)) return;

    const coach = BOT_CONFIG[botId];

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(coach.voiceGreeting);
    const voice = pickVoice(coach.voiceGender);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.pitch = coach.voicePitch;
    utterance.rate = coach.voiceRate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    if (voiceOn) {
      stopSpeaking();
      setVoiceOn(false);
      return;
    }

    setVoiceOn(true);

    if (selectedBot) speakGreeting(selectedBot, true);
  };

  /* browsers load voices late — warm the list up, and stop on unmount */
  useEffect(() => {
    if (!speechSupported) return;

    const warmUp = () => window.speechSynthesis.getVoices();

    warmUp();
    window.speechSynthesis.addEventListener("voiceschanged", warmUp);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", warmUp);
      window.speechSynthesis.cancel();
    };
  }, []);

  /* -------------------------------------------------------
     DESKTOP GREETING  (file 1 — home page only)
     Appears after the visitor scrolls a little, or after
     10 seconds on the page — whichever happens first.
     Never shows instantly.
  ------------------------------------------------------- */

  useEffect(() => {
    if (location.pathname !== "/" || isOpen || showChooser || greetingSeen) {
      setShowGreeting(false);
      return undefined;
    }

    const GREETING_DELAY_MS = 10000; // minimum wait if the user doesn't scroll
    const GREETING_SCROLL_PX = 250; // how far to scroll before it shows

    let shown = false;

    const reveal = () => {
      if (shown) return;
      shown = true;
      setShowGreeting(true);
      window.removeEventListener("scroll", onScroll);
    };

    const onScroll = () => {
      if (window.scrollY > GREETING_SCROLL_PX) reveal();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(reveal, GREETING_DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.pathname, isOpen, showChooser, greetingSeen]);
  /* -------------------------------------------------------
     BODY LOCK
  ------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen && !showChooser) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, showChooser]);

  /* -------------------------------------------------------
     AUTO SCROLL
  ------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!showLeadForm) return;

    const timer = setTimeout(() => {
      leadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 150);

    return () => clearTimeout(timer);
  }, [showLeadForm]);

  /* -------------------------------------------------------
     IDLE NUDGE  (v2)
     If the learner goes quiet for 60s after a bot reply, the
     coach adds ONE soft message. It is local text, so it does
     not use any AI quota. It resets after the next real reply.
  ------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen || !bot || isTyping || showLeadForm) return undefined;

    const last = messages[messages.length - 1];

    if (!last || last.role !== "assistant" || last.isNudge) return undefined;
    if (!messages.some((item) => item.role === "user")) return undefined;

    const timer = setTimeout(() => {
      setMessages((previous) => {
        const latest = previous[previous.length - 1];

        if (!latest || latest.role !== "assistant" || latest.isNudge) {
          return previous;
        }

        return [
          ...previous,
          createMessage("assistant", NUDGES[bot.id][learnerStyle], {
            isNudge: true,
          }),
        ];
      });
    }, IDLE_NUDGE_MS);

    return () => clearTimeout(timer);
  }, [messages, isOpen, isTyping, showLeadForm, bot, learnerStyle]);

  /* -------------------------------------------------------
     ESCAPE
  ------------------------------------------------------- */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (showChooser) {
        setShowChooser(false);
        return;
      }

      if (isOpen) {
        stopSpeaking();
        setIsOpen(false);
        setCharacterActive(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, showChooser]);

  /* -------------------------------------------------------
     OPEN / CLOSE
  ------------------------------------------------------- */

  const closeChat = () => {
    stopSpeaking();
    setIsOpen(false);
    setCharacterActive(false);
  };

  const handleLauncherClick = () => {
    setShowGreeting(false);
    setGreetingSeen(true);

    if (!selectedBot) {
      setShowChooser(true);
      return;
    }

    setIsOpen(true);
    setCharacterActive(true);

    setTimeout(() => inputRef.current?.focus(), 250);
  };

  /* -------------------------------------------------------
     SELECT / SWITCH BOT
  ------------------------------------------------------- */

  const handleSelectBot = (botId) => {
    const nextBot = BOT_CONFIG[botId];

    setSelectedBot(botId);
    setShowChooser(false);
    setShowGreeting(false);
    setGreetingSeen(true);
    setIsOpen(true);
    setCharacterActive(true);
    setShowLeadForm(false);

    /* coach says hello out loud (click = user gesture, so browsers allow it) */
    speakGreeting(botId);

    /*
      Welcome message always comes from the selected bot.
      If the user only has the welcome message so far (no real
      conversation yet), it is replaced by the new coach's welcome.
      If a real conversation exists, it is kept.
    */

    setMessages((previousMessages) => {
      if (previousMessages.length <= 1) {
        return [createMessage("assistant", nextBot.welcome)];
      }

      return previousMessages;
    });

    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSwitchBot = () => {
    stopSpeaking();
    setShowChooser(true);
    setIsOpen(false);
    setCharacterActive(false);
  };

  /* -------------------------------------------------------
     SEND CHAT
  ------------------------------------------------------- */

  const sendMessage = async (messageOverride = null) => {
    if (!selectedBot) {
      setShowChooser(true);
      return;
    }

    const messageText = (messageOverride !== null ? messageOverride : input)
      .trim()
      .slice(0, MAX_INPUT_LENGTH);

    if (!messageText || isTyping) return;

    const userMessage = createMessage("user", messageText);

    /*
      History = the conversation BEFORE this message.
      (The backend adds the current message itself, so we must not
      include it here or the AI would see it twice.)
      Nudges are local-only and are never sent to the AI.
    */
    const history = messages
      .filter((item) => !item.isNudge)
      .slice(-MAX_HISTORY_SENT)
      .map((item) => ({ role: item.role, content: item.content }));

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsTyping(true);
    setCharacterActive(true);

    const style = detectStyle(messageText);

    try {
      const data = await requestChatReply({
        message: messageText,
        history,
        page: location.pathname,
        character: selectedBot,
      });

      /* too many requests -> friendly message, no scary error */
      if (data?.rateLimited) {
        setMessages((previous) => [
          ...previous,
          createMessage("assistant", RATE_LIMIT_MESSAGES[style]),
        ]);
        return;
      }

      const rawReply =
        data?.reply ||
        (style === "hinglish"
          ? "Main yahin hoon. Aap kya practise karna chahte ho, thoda aur batao."
          : "I'm here to help. Tell me a little more about what you want to practise.");

      const hasCTA = /\[CTA:WHATSAPP\]/i.test(rawReply);

      const links = [
        ...new Set(
          [...rawReply.matchAll(/\[LINK:(\/[a-z-]*)\]/gi)].map((m) =>
            m[1].toLowerCase(),
          ),
        ),
      ]
        .filter((path) => PAGE_LINKS[path])
        .slice(0, 2);

      const reply = rawReply
        .replace(/\[CTA:WHATSAPP\]/gi, "")
        .replace(/\[LINK:[^\]]*\]/gi, "")
        .trim();

      setMessages((previous) => [
        ...previous,
        createMessage("assistant", reply, { showCTA: hasCTA, links }),
      ]);
    } catch (error) {
      console.error("Jashna AI error:", error);

      /* connection problem: warm message + a way to reach a human */
      setMessages((previous) => [
        ...previous,
        createMessage("assistant", FALLBACK_MESSAGES[style], {
          showCTA: true,
        }),
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  /* -------------------------------------------------------
     QUICK ACTION
  ------------------------------------------------------- */

  const handleAction = (action) => {
    if (action.navigate) {
      closeChat();
      navigate(action.navigate);
      return;
    }

    sendMessage(action.prompt);
  };

  /* -------------------------------------------------------
     QUICK REPLY CHIP
  ------------------------------------------------------- */

  const handleChip = (chip) => {
    if (chip.navigate) {
      closeChat();
      navigate(chip.navigate);
      return;
    }

    sendMessage(chip.prompt);
  };

  /* -------------------------------------------------------
     LEAD FORM
  ------------------------------------------------------- */

  const handleLeadSubmit = async () => {
    if (!selectedBot) return;

    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      setLeadStatus("error");
      return;
    }

    setLeadStatus("submitting");

    try {
      const response = await fetch(`${API_URL}/api/ai/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          source: `Jashna Edu - ${bot.name}`,
          page: location.pathname,
        }),
      });

      if (!response.ok) {
        throw new Error("Lead submission failed");
      }

      setLeadStatus("success");

      setLeadForm({
        name: "",
        phone: "",
        interest: "",
        marketingConsent: false,
      });
    } catch (error) {
      console.error("Lead submission error:", error);
      setLeadStatus("error");
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* =====================================================
          CHARACTER CHOOSER   (file 1)
      ===================================================== */}

      <AnimatePresence>
        {showChooser && (
          <CharacterChooser
            onSelect={handleSelectBot}
            onClose={() => setShowChooser(false)}
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          DESKTOP GREETING CARD   (file 1)
      ===================================================== */}

      <AnimatePresence>
        {!isOpen && !showChooser && showGreeting && (
          <motion.button
            type="button"
            onClick={handleLauncherClick}
            initial={{ opacity: 0, y: 20, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, x: 10, scale: 0.95 }}
            whileTap={{ scale: 0.97 }}
            className="fixed bottom-[118px] right-5 z-[95] hidden md:block"
          >
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative w-[345px] overflow-hidden rounded-[25px] border border-white/80 bg-white p-4 text-left shadow-[0_25px_70px_rgba(4,20,50,.22)]"
            >
              <Shine />

              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#E94F91]/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-[#3288F5]/10 blur-3xl" />

              <div className="relative flex items-center gap-3.5">
                <div className="relative h-[62px] w-[62px] shrink-0">
                  <CoachOrb tinyBrand/>
                </div>

                <div>
                  <JashnaBrandMark small />

                  <p className="mt-1 text-[18px] font-black leading-tight text-[#10233E]">
                    Meet your Jashna coaches
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-black text-[#2778E8] transition-transform duration-300 group-hover:translate-x-1">
                    Choose who to talk to
                    <ArrowUpRight size={15} strokeWidth={2.8} />
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* =====================================================
          FLOATING LAUNCHER   (file 1 — smaller on mobile)
      ===================================================== */}

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-4 right-4 z-[100] sm:bottom-5 sm:right-5"
            initial={{ opacity: 0, scale: 0.75, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 20 }}
          >
            <div
              className="relative"
              onMouseEnter={() => setCharacterActive(true)}
              onMouseLeave={() => setCharacterActive(false)}
            >
              <motion.div
                className="pointer-events-none absolute -inset-3 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 180deg,#E94F91,#A978F4,#3288F5,#20C9D5,#E94F91)",
                }}
                animate={{ rotate: [0, 360], opacity: [0.45, 0.8, 0.45] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />

              <motion.button
                type="button"
                onClick={handleLauncherClick}
                aria-label="Open Jashna Edu AI"
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[24px] border border-white/60 bg-white p-1 shadow-[0_20px_60px_rgba(24,100,220,.25)] sm:h-[82px] sm:w-[82px] sm:rounded-[27px]"
              >
                <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-slate-50 sm:rounded-[23px]">
                  {bot ? (
                    <CharacterLauncher bot={bot} active={characterActive} />
                  ) : (
                    <CoachOrb active={characterActive} />
                  )}
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MAIN CHAT PANEL   (file 2)
      ===================================================== */}

      <AnimatePresence>
        {isOpen && bot && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/30 backdrop-blur-[2px] sm:items-center sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:h-[min(900px,94vh)] sm:max-w-[580px] sm:rounded-[32px]"
              style={{ fontFamily: bot.font }}
              role="dialog"
              aria-modal="true"
              aria-label={`Jashna Edu ${bot.name} AI assistant`}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 230, damping: 24 }}
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <header
                className="relative z-50 flex shrink-0 items-center justify-between px-3.5 py-3 sm:px-5 sm:py-3.5"
                style={{
                  background: `linear-gradient(135deg, ${bot.heroStart}, ${bot.heroEnd})`,
                }}
              >
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <BotAvatar bot={bot} />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[18px] font-black uppercase tracking-tight text-white sm:text-[22px]">
                        {bot.name}
                      </h2>

                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider sm:px-2.5 sm:py-1 sm:text-[11px]"
                        style={{
                          background: `${bot.primary}66`,
                          color: "#fff",
                        }}
                      >
                        AI
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-[12px] font-bold text-white/75 sm:text-[14px]">
                      Jashna Edu · {bot.shortRole}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {speechSupported && (
                    <motion.button
                      type="button"
                      onClick={toggleVoice}
                      className="flex h-10 w-10 items-center justify-center rounded-full border text-white sm:h-11 sm:w-11"
                      style={{
                        borderColor: voiceOn
                          ? `${bot.accent}99`
                          : "rgba(255,255,255,0.18)",
                        background: voiceOn
                          ? `${bot.accent}30`
                          : "rgba(255,255,255,0.08)",
                      }}
                      animate={
                        isSpeaking ? { scale: [1, 1.12, 1] } : { scale: 1 }
                      }
                      transition={{
                        duration: 0.8,
                        repeat: isSpeaking ? Infinity : 0,
                      }}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.88 }}
                      aria-label={voiceOn ? "Mute voice" : "Turn voice on"}
                      title={voiceOn ? "Mute voice" : "Turn voice on"}
                    >
                      {voiceOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </motion.button>
                  )}

                  <motion.button
                    type="button"
                    onClick={handleSwitchBot}
                    className="hidden rounded-full border px-5 py-2.5 text-[12px] font-black uppercase tracking-wider text-white sm:block"
                    style={{
                      borderColor: "rgba(255,255,255,0.22)",
                      background: "rgba(255,255,255,0.08)",
                    }}
                    whileHover={{
                      scale: 1.07,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    whileTap={{ scale: 0.94 }}
                  >
                    Switch
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={closeChat}
                    className="flex h-10 w-10 items-center justify-center rounded-full border text-white sm:h-11 sm:w-11"
                    style={{
                      borderColor: "rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.08)",
                    }}
                    whileHover={{
                      scale: 1.12,
                      rotate: 90,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close chat"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </header>

              {/* mobile switch */}
              <div
                className="flex shrink-0 items-center justify-center border-b px-4 py-2 sm:hidden"
                style={{ background: bot.primarySoft, borderColor: bot.border }}
              >
                <motion.button
                  type="button"
                  onClick={handleSwitchBot}
                  whileTap={{ scale: 0.94 }}
                  className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-sm"
                  style={{ color: bot.primaryDark }}
                >
                  <Sparkles size={13} />
                  Switch coach
                </motion.button>
              </div>

              {/* =================================================
                  SCROLLABLE BODY
              ================================================= */}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white">
                <CharacterHero bot={bot} isSpeaking={isSpeaking} />

                <main className="relative px-3.5 pb-5 pt-5 sm:px-5 sm:pt-6">
                  {/* eyebrow */}
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: bot.primary }}
                    />

                    <span
                      className="text-[12px] font-black uppercase tracking-[0.18em] sm:text-[13px] sm:tracking-[0.2em]"
                      style={{ color: bot.primaryDark }}
                    >
                      {bot.name}'s corner
                    </span>

                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: bot.secondary }}
                    />
                  </div>

                  <h1
                    className="text-center text-[26px] font-black leading-[1.08] tracking-[-0.04em] sm:text-[40px] sm:leading-[1.05] sm:tracking-[-0.045em]"
                    style={{ color: bot.text }}
                  >
                    What are you working on today?
                  </h1>

                  <p
                    className="mx-auto mt-2.5 max-w-[460px] text-center text-[14px] font-bold leading-[1.55] sm:mt-3 sm:text-[16px] sm:leading-[1.6]"
                    style={{ color: bot.muted }}
                  >
                    {bot.description}
                  </p>

                  {/* QUICK ACTIONS */}
                  <div className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                    {CHAT_ACTIONS.map((action) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        bot={bot}
                        onClick={() => handleAction(action)}
                      />
                    ))}
                  </div>

                  {/* MESSAGES */}
                  {messages.length > 0 && (
                    <section className="mt-7 sm:mt-8">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />

                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 sm:text-[12px]">
                          Conversation
                        </span>

                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <div className="space-y-3.5 sm:space-y-4">
                        {messages.map((message, messageIndex) => {
                          const isUser = message.role === "user";
                          const isLastMessage =
                            messageIndex === messages.length - 1;

                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex ${
                                isUser ? "justify-end" : "items-end gap-2"
                              }`}
                            >
                              {!isUser && <BotAvatar bot={bot} size="small" />}

                              <div className="flex max-w-[86%] flex-col">
                                <motion.div
                                  whileHover={{ y: -2 }}
                                  className={`rounded-[18px] border px-3.5 py-2.5 shadow-sm transition-shadow hover:shadow-md sm:rounded-[19px] sm:px-4 sm:py-3 ${
                                    isUser ? "rounded-br-md" : "rounded-bl-md"
                                  }`}
                                  style={{
                                    background: isUser
                                      ? bot.primarySoft
                                      : "#fff",
                                    borderColor: isUser
                                      ? `${bot.primary}30`
                                      : bot.border,
                                  }}
                                >
                                  <MessageContent
                                    content={message.content}
                                    bot={bot}
                                  />
                                </motion.div>
                                {(message.links?.length > 0 ||
                                  message.showCTA) && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {message.links?.map((path) => (
                                      <motion.button
                                        key={path}
                                        type="button"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -3, scale: 1.03 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => {
                                          closeChat();
                                          navigate(path);
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-full border-2 bg-white px-3.5 py-2 text-[13px] font-black shadow-sm sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[14px]"
                                        style={{
                                          borderColor: bot.primary,
                                          color: bot.primaryDark,
                                        }}
                                      >
                                        {PAGE_LINKS[path]}
                                        <ArrowUpRight
                                          size={15}
                                          strokeWidth={2.8}
                                        />
                                      </motion.button>
                                    ))}

                                    {message.showCTA && (
                                      <motion.a
                                        href={getWhatsAppLink(
                                          `Hello Dr.Shivam Sir, I was chatting with ${bot.name} on the Jashna Edu website and would like personalised guidance.`,
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -3, scale: 1.03 }}
                                        whileTap={{ scale: 0.96 }}
                                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#25D366] px-4 py-2 text-[13px] font-black text-white shadow-lg sm:px-5 sm:py-2.5 sm:text-[14px]"
                                      >
                                        <Shine />
                                        <MessageCircle
                                          size={17}
                                          strokeWidth={2.6}
                                        />
                                        Chat with Dr. Shivam Sir
                                      </motion.a>
                                    )}
                                  </div>
                                )}

                                {/* quick-reply chips: latest bot message only */}
                                {!isUser &&
                                  isLastMessage &&
                                  !isTyping &&
                                  hasUserChatted && (
                                    <QuickReplies
                                      bot={bot}
                                      chips={QUICK_REPLIES[learnerStyle]}
                                      onPick={handleChip}
                                    />
                                  )}
                              </div>
                            </motion.div>
                          );
                        })}

                        {isTyping && <TypingIndicator bot={bot} />}

                        <div ref={messagesEndRef} />
                      </div>
                    </section>
                  )}

                  {/* LEAD FORM */}
                  <AnimatePresence>
                    {showLeadForm && (
                      <LeadForm
                        bot={bot}
                        leadForm={leadForm}
                        setLeadForm={setLeadForm}
                        onSubmit={handleLeadSubmit}
                        onClose={() => {
                          setShowLeadForm(false);
                          setLeadStatus("idle");
                        }}
                        leadStatus={leadStatus}
                      />
                    )}
                  </AnimatePresence>

                  <div ref={leadEndRef} />
                </main>
              </div>

              {/* =================================================
                  INPUT FOOTER
              ================================================= */}

              <footer
                className="relative z-50 shrink-0 border-t bg-white px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-5"
                style={{ borderColor: bot.border }}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="h-2 w-2 rounded-full"
                      style={{ background: bot.accent }}
                      animate={{ scale: [1, 1.35, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />

                    <span
                      className="text-[11px] font-black uppercase tracking-[0.14em] sm:text-[12px]"
                      style={{ color: bot.primaryDark }}
                    >
                      {bot.name} is ready
                    </span>
                  </div>

                  <span className="hidden text-[12px] font-bold text-slate-500 sm:block">
                    Enter ↵ to send
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 rounded-[18px] border p-1.5 shadow-[0_7px_25px_rgba(0,0,0,0.08)] transition-shadow focus-within:shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
                  style={{ borderColor: bot.border, background: "#fff" }}
                >
                  <motion.div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] sm:h-12 sm:w-12"
                    style={{
                      background: `linear-gradient(145deg, ${bot.primary}, ${bot.secondary})`,
                      color: "#fff",
                    }}
                    animate={characterActive ? { scale: [1, 1.05, 1] } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: characterActive ? Infinity : 0,
                    }}
                  >
                    <Mic2 size={20} strokeWidth={2.5} />
                  </motion.div>

                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask ${bot.name} anything...`}
                    aria-label={`Ask ${bot.name} anything`}
                    maxLength={MAX_INPUT_LENGTH}
                    /* 16px on mobile keeps iOS from zooming into the input */
                    className="min-w-0 flex-1 bg-transparent px-1 text-[16px] font-bold text-slate-900 outline-none placeholder:text-slate-400 sm:text-[17px]"
                  />

                  <motion.button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
                    style={{
                      background: `linear-gradient(145deg, ${bot.primary}, ${bot.secondary})`,
                    }}
                    whileHover={
                      input.trim() && !isTyping
                        ? { scale: 1.1, rotate: -5 }
                        : {}
                    }
                    whileTap={input.trim() && !isTyping ? { scale: 0.88 } : {}}
                    aria-label="Send message"
                  >
                    <Shine />
                    <Send size={19} strokeWidth={2.6} />
                  </motion.button>
                </div>

                {/* lead CTA */}
                {!showLeadForm && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      setLeadStatus("idle");
                      setShowLeadForm(true);
                    }}
                    className="mx-auto mt-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] sm:mt-2.5 sm:gap-2 sm:px-4 sm:text-[12px] sm:tracking-[0.12em]"
                    style={{ color: bot.muted }}
                    whileHover={{
                      color: bot.primaryDark,
                      scale: 1.05,
                      backgroundColor: bot.primarySoft,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Better English
                    <span style={{ color: bot.primary }}>✦</span>
                    Bigger opportunities
                    <ArrowUpRight size={14} strokeWidth={2.8} />
                  </motion.button>
                )}
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}