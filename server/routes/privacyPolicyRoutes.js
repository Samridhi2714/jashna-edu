import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getPrivacyPolicy,
  updatePrivacyPolicy,
  resetPrivacyPolicy,
} from "../controllers/privacyPolicyController.js";

const router = express.Router();

// Public: the privacy policy page and the admin editor both read from here.
router.get("/", getPrivacyPolicy);

// Only authenticated administrators can change or reset the policy.
router.put("/", protect, updatePrivacyPolicy);
router.delete("/", protect, resetPrivacyPolicy);

export default router;