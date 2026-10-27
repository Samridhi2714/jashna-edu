import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  createTaskTemplate,
  getTaskTemplates,
  updateTaskTemplate,
  archiveTaskTemplate,
  restoreTaskTemplate,
  getAssignmentOptions,
  createTaskAssignment,
  getTaskAssignments,
  getTaskSubmissions,
  reviewTaskSubmission,
  downloadTaskSubmissionFile,
} from "../controllers/taskController.js";

const router = express.Router();

/*
=========================================================
ADMIN AUTHENTICATION
=========================================================

All task-template routes require admin authentication.
*/

router.use(protect);

/*
=========================================================
TASK LIBRARY
=========================================================
*/

// Get active templates or include archived templates.
router.get("/templates", getTaskTemplates);

// Create a reusable task template.
router.post("/templates", createTaskTemplate);

// Edit a reusable task template.
router.patch("/templates/:id", updateTaskTemplate);

// Archive a task template.
router.patch("/templates/:id/archive", archiveTaskTemplate);

// Restore an archived task template.
router.patch("/templates/:id/restore", restoreTaskTemplate);

// Get assignment options.
router.get("/assignment-options", getAssignmentOptions);

// Create a task assignment.
router.post("/assignments", createTaskAssignment);

// Get task assignments.
router.get("/assignments", getTaskAssignments);

// Get submissions and submission statuses for all assignments. 
 router.get("/submissions", getTaskSubmissions); 
 // Securely download a Google Drive submission.
router.get(
  "/assignments/:assignmentId/recipients/:studentId/files/:fileIndex/download",
  downloadTaskSubmissionFile,
);
// Review a student's submission with marks and feedback.
 router.patch( "/assignments/:assignmentId/recipients/:studentId/review", reviewTaskSubmission, );
export default router;
