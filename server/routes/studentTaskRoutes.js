import express from "express";

import protectStudent from "../middleware/studentAuthMiddleware.js";
import taskUpload from "../middleware/taskUploadMiddleware.js";

import {
  getStudentTasks,
  submitStudentTask,
} from "../controllers/studentTaskController.js";

const router = express.Router();

router.use(protectStudent);

// Get tasks assigned to the logged-in student
router.get("/", getStudentTasks);

// Submit text or upload files
router.post(
  "/:assignmentId/submit",
  taskUpload.array("files", 5),
  submitStudentTask
);

export default router;