// ============================================================
// JASHNA SPARK AI CONTROLLER (v2)
// ------------------------------------------------------------
// Receives requests from the frontend and sends them to the
// Jashna Spark AI service.
//
// - Validates and sanitizes input (length caps, history clean-up)
// - Visitor never sees a raw server error in chat
// - Also handles lead capture from the Jashna Spark CTA
// ============================================================

import { askJashnaSpark } from "../services/jashnaAI.js";

const MAX_MESSAGE_LENGTH = 600;
const MAX_HISTORY_ITEMS = 12;
const ALLOWED_CHARACTERS = ["marrisa", "mario"];

// Friendly reply used if something unexpected breaks in the controller.
// Same text style (English) the widget already uses.
const SAFE_FALLBACK_REPLY =
  "I'm here with you! We hit a tiny technical hiccup. Please try once more in a moment, or chat directly with our team.\n[CTA:WHATSAPP]";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const cleanText = (value, maxLength) =>
  String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const sanitizeHistory = (history) => {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim(),
    )
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));
};

// Only allow a simple path like "/ielts" or "/weekly-challenge"
const sanitizePage = (page) => {
  const value = String(page ?? "/").trim();
  return /^\/[a-zA-Z0-9\-_/]{0,80}$/.test(value) ? value : "/";
};

// ============================================================
// POST /api/ai/chat
// ============================================================

export const chatWithJashnaSpark = async (req, res) => {
  try {
    const { message, history = [], page = "/", character = "" } = req.body || {};

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    const cleanMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);

    const safeCharacter = ALLOWED_CHARACTERS.includes(
      String(character).toLowerCase(),
    )
      ? String(character).toLowerCase()
      : "";

    // --------------------------------------------------------
    // ASK JASHNA SPARK
    // (the service already handles retries and model fallback)
    // --------------------------------------------------------

    const reply = await askJashnaSpark({
      message: cleanMessage,
      history: sanitizeHistory(history),
      page: sanitizePage(page),
      character: safeCharacter,
    });

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Jashna Spark AI Error:", error);

    // Visitor still gets a warm reply instead of an error bubble
    return res.status(200).json({
      success: true,
      reply: SAFE_FALLBACK_REPLY,
      degraded: true,
    });
  }
};

// ============================================================
// POST /api/ai/lead
// ------------------------------------------------------------
// Captures a lead when the user explicitly requests
// personalized guidance from Jashna.
// ============================================================

export const captureJashnaLead = async (req, res) => {
  try {
    const { name, phone, interest, marketingConsent, source, page, website } =
      req.body || {};

    // --------------------------------------------------------
    // HONEYPOT (bots fill hidden fields, humans do not)
    // Pretend success so bots do not retry.
    // --------------------------------------------------------

    if (website) {
      return res.status(201).json({
        success: true,
        message: "Your details have been submitted successfully.",
      });
    }

    // --------------------------------------------------------
    // CLEAN INPUTS
    // --------------------------------------------------------

    const cleanName = cleanText(name, 80);
    const cleanPhone = cleanText(phone, 25);
    const cleanInterest = cleanText(interest, 80);
    const cleanSource = cleanText(source || "Jashna Spark", 80);
    const cleanPage = sanitizePage(page);

    // --------------------------------------------------------
    // REQUIRED FIELD VALIDATION
    // --------------------------------------------------------

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name.",
      });
    }

    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Please enter your WhatsApp number.",
      });
    }

    // Allows digits, spaces, +, -, brackets. Needs 10 to 15 digits.
    if (!/^[0-9+\-()\s]+$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid WhatsApp number.",
      });
    }

    const phoneDigits = cleanPhone.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid WhatsApp number.",
      });
    }

    // --------------------------------------------------------
    // PREPARE LEAD
    // --------------------------------------------------------

    const lead = {
      name: cleanName,
      phone: cleanPhone,
      interest: cleanInterest,
      marketingConsent: Boolean(marketingConsent),
      source: cleanSource,
      page: cleanPage,
      createdAt: new Date().toISOString(),
    };

    // --------------------------------------------------------
    // TEMPORARY STORAGE
    // For now we log the lead.
    // NEXT STEP: send this exact object to Google Sheets.
    // --------------------------------------------------------

    console.log("");
    console.log("========================================");
    console.log("       JASHNA SPARK - NEW LEAD");
    console.log("========================================");
    console.log(lead);
    console.log("========================================");
    console.log("");

    return res.status(201).json({
      success: true,
      message: "Your details have been submitted successfully.",
    });
  } catch (error) {
    console.error("Jashna Spark lead error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save your details right now. Please try again.",
    });
  }
};