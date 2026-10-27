// ============================================================
// JASHNA SPARK AI CONTROLLER
// ------------------------------------------------------------
// Receives requests from the frontend and sends them to the
// Jashna Spark AI service.
//
// Also handles lead capture from the Jashna Spark CTA.
// ============================================================

import { askJashnaSpark } from "../services/jashnaAI.js";

// ============================================================
// POST /api/ai/chat
// ------------------------------------------------------------
// Handles normal Jashna Spark conversations.
// ============================================================

export const chatWithJashnaSpark = async (req, res) => {
  try {
    const { message, history = [], page = "/" } = req.body;

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    // --------------------------------------------------------
    // ASK JASHNA SPARK
    // --------------------------------------------------------

    const reply = await askJashnaSpark({
      message,
      history,
      page,
    });

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Jashna Spark AI Error:", error);

    // --------------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------------

    return res.status(500).json({
      success: false,
      message: "Spark is having a little trouble right now. Please try again.",
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
    const { name, phone, interest, marketingConsent, source, page } = req.body;

    // --------------------------------------------------------
    // CLEAN INPUTS
    // --------------------------------------------------------

    const cleanName = String(name || "").trim();
    const cleanPhone = String(phone || "").trim();
    const cleanInterest = String(interest || "").trim();

    const cleanSource = String(source || "Jashna Spark").trim();

    const cleanPage = String(page || "/").trim();

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

    // --------------------------------------------------------
    // BASIC PHONE VALIDATION
    // --------------------------------------------------------
    // Allows spaces, +, -, brackets and digits.
    // We mainly make sure there are enough digits.
    // --------------------------------------------------------

    const phoneDigits = cleanPhone.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
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
    // TEMPORARY STORAGE TEST
    // --------------------------------------------------------
    // For now we log the lead.
    //
    // NEXT STEP:
    // This exact object will be sent to Google Sheets.
    // --------------------------------------------------------

    console.log("");
    console.log("========================================");
    console.log("       JASHNA SPARK — NEW LEAD");
    console.log("========================================");
    console.log(lead);
    console.log("========================================");
    console.log("");

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

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
