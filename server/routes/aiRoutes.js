import express from "express";
import rateLimit from "express-rate-limit";

import {
  chatWithJashnaSpark,
  captureJashnaLead,
} from "../controllers/aiController.js";

const router = express.Router();

/* =========================================================
   RATE LIMITERS (per visitor IP)
   server.js already applies a general 20 requests/min limit
   to /api/ai. These two are extra, route-specific guards.
========================================================= */

// Stops rapid-fire spamming of the chat (protects the free AI quota).
const chatBurstLimiter = rateLimit({
  windowMs: 10 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You're typing fast! Give Spark a few seconds and try again.",
  },
});

// Leads are rare for real users, so keep this strict.
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again after some time.",
  },
});

/* =========================================================
   JASHNA SPARK CHAT
========================================================= */

router.post("/chat", chatBurstLimiter, chatWithJashnaSpark);

/* =========================================================
   JASHNA SPARK LEAD
========================================================= */

router.post("/lead", leadLimiter, captureJashnaLead);

export default router;