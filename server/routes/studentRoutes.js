import express from "express";

import {
  getStudents,
  getStudentById,
  createStudent,
  toggleStudentStatus,
  resetStudentPassword,
  markStudentLeftEarly,
  pauseStudentCourse,
  resumeStudentCourse,
  updateCourseDuration,
  deleteStudent,
} from "../controllers/studentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
ALL STUDENT ROUTES ARE ADMIN ONLY
=========================================================
*/

router.use(protect);

/*
=========================================================
GET ALL STUDENTS
=========================================================

GET /api/students
*/

router.get("/", getStudents);

/*
=========================================================
CREATE STUDENT
=========================================================

POST /api/students
*/

router.post("/", createStudent);

/*
=========================================================
COURSE LIFECYCLE
=========================================================
*/

/*
---------------------------------------------------------
MARK STUDENT LEFT EARLY
---------------------------------------------------------

PATCH /api/students/:id/left-early

Body:
{
  actualExitDate: "2026-12-15",
  exitReason: "Student relocated"
}
*/

router.patch("/:id/left-early", markStudentLeftEarly);

/*
---------------------------------------------------------
PAUSE STUDENT COURSE
---------------------------------------------------------

PATCH /api/students/:id/pause
*/

router.patch("/:id/pause", pauseStudentCourse);

/*
---------------------------------------------------------
RESUME STUDENT COURSE
---------------------------------------------------------

PATCH /api/students/:id/resume
*/

router.patch("/:id/resume", resumeStudentCourse);

/*
---------------------------------------------------------
EXTEND / UPDATE COURSE DURATION
---------------------------------------------------------

PATCH /api/students/:id/course-duration

Body:
{
  durationMonths: 9
}

Example:

6 months
01 Aug 2026 → 31 Jan 2027

becomes

9 months
01 Aug 2026 → 30 Apr 2027
*/

router.patch("/:id/course-duration", updateCourseDuration);

/*
=========================================================
ACCOUNT STATUS
=========================================================
*/

/*
PATCH /api/students/:id/status

Activate / deactivate student login access.
*/

router.patch("/:id/status", toggleStudentStatus);

/*
=========================================================
PASSWORD
=========================================================
*/

/*
POST /api/students/:id/reset-password
*/

router.post("/:id/reset-password", resetStudentPassword);

/*
=========================================================
GET SINGLE STUDENT
=========================================================

GET /api/students/:id

IMPORTANT:
This comes after the specific PATCH/POST routes above.
*/

router.get("/:id", getStudentById);

/*
=========================================================
DELETE STUDENT
=========================================================

IMPORTANT:
Use this only for test/demo students.

For real students, use:
PATCH /:id/left-early

so historical records remain preserved.
*/

router.delete("/:id", deleteStudent);

export default router;
