import express from "express";

import {
  getStudentProgressController,
  getAdminStudentProgress,
} from "../controllers/progressController.js";

import protect from "../middleware/authMiddleware.js";
import protectStudent from "../middleware/studentAuthMiddleware.js";

const router = express.Router();

/*
=========================================================
STUDENT

GET /api/progress/student

Student can only receive their own progress because
studentId comes from the authenticated token.
=========================================================
*/

router.get("/student", protectStudent, getStudentProgressController);

/*
=========================================================
ADMIN

GET /api/progress/student/:studentId

Admin can request progress for a specific student.
=========================================================
*/

router.get("/student/:studentId", protect, getAdminStudentProgress);

export default router;
