import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getEligibleStudents,
  getRecentAdmissions,
  createRecentAdmission,
  updateRecentAdmission,
  toggleRecentAdmissionPublication,
  deleteRecentAdmission,
  getPublicRecentAdmissions,
} from "../controllers/recentAdmissionController.js";

const router = express.Router();

/*
PUBLIC WEBSITE
*/

// Publicly accessible. Returns published admissions only.
router.get("/public", getPublicRecentAdmissions);

/*
ADMIN ONLY
*/

router.use(protect);

router.get("/students", getEligibleStudents);

router.get("/", getRecentAdmissions);

router.post("/", createRecentAdmission);

// Publish or unpublish a specific admission.
router.patch("/:id/publish", toggleRecentAdmissionPublication);

// Update a specific admission.
router.patch("/:id", updateRecentAdmission);

// Remove a specific admission record.
router.delete("/:id", deleteRecentAdmission);

export default router;