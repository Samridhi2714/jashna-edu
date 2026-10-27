import express from "express";

import {
  chatWithJashnaSpark,
  captureJashnaLead,
} from "../controllers/aiController.js";

const router = express.Router();

/* =========================================================
   JASHNA SPARK CHAT
========================================================= */

router.post("/chat", chatWithJashnaSpark);

/* =========================================================
   JASHNA SPARK LEAD
========================================================= */

router.post("/lead", captureJashnaLead);

export default router;