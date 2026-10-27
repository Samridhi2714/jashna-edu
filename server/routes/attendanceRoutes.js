import express from "express";

import {
  getAttendance,
  saveAttendance,
  getStudentAttendance,
} from "../controllers/attendanceController.js";

import protect from "../middleware/authMiddleware.js";
import protectStudent from "../middleware/studentAuthMiddleware.js";

const router = express.Router();

/*
=========================================================
ADMIN ATTENDANCE ROUTES
=========================================================
*/

/*
---------------------------------------------------------
GET ATTENDANCE

GET /api/attendance

Optional:

?date=2026-09-30
?batch=IELTS Evening
?student=STUDENT_ID
---------------------------------------------------------
*/

router.get("/", protect, getAttendance);

/*
---------------------------------------------------------
SAVE / UPDATE ATTENDANCE

POST /api/attendance

Admin only.
---------------------------------------------------------
*/

router.post("/", protect, saveAttendance);

/*
=========================================================
STUDENT ATTENDANCE ROUTE
=========================================================

GET /api/attendance/student

Student authentication only.

Keep this before any future /:id route.
=========================================================
*/

router.get("/student", protectStudent, getStudentAttendance);

export default router;
