import express from "express";

import {
getPublishedFAQs,
getAllFAQs,
createFAQ,
updateFAQ,
deleteFAQ,
} from "../controllers/faqController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC: Get published FAQs
router.get("/", getPublishedFAQs);

// ADMIN: Get all FAQs
router.get("/admin/all", protect, getAllFAQs);

// ADMIN: Create FAQ
router.post("/", protect, createFAQ);

// ADMIN: Update FAQ by ID
router.put("/:id", protect, updateFAQ);

// ADMIN: Delete FAQ by ID
router.delete("/:id", protect, deleteFAQ);

export default router;