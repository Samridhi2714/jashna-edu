import mongoose from "mongoose";

import { getStudentProgress } from "../services/progressService.js";

/*
=========================================================
GET STUDENT PROGRESS

GET /api/progress/student

Student authentication middleware provides:
    req.student.id

The actual calculation is handled by:
    progressService.js
=========================================================
*/

export async function getStudentProgressController(req, res) {
  try {
    const studentId = req.student?.id;

    if (!studentId) {
      return res.status(401).json({
        message: "Student authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID.",
      });
    }

    const progress = await getStudentProgress(studentId);

    return res.status(200).json(progress);
  } catch (error) {
    console.error("Get student progress error:", error);

    if (error.message === "Student not found.") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Invalid student ID.") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to calculate student progress.",
    });
  }
}

/*
=========================================================
GET PROGRESS FOR ADMIN

This endpoint allows an authenticated admin to request
progress for a specific student.

GET /api/progress/student/:studentId
=========================================================
*/

export async function getAdminStudentProgress(req, res) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID.",
      });
    }

    const progress = await getStudentProgress(studentId);

    return res.status(200).json(progress);
  } catch (error) {
    console.error("Get admin student progress error:", error);

    if (error.message === "Student not found.") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Invalid student ID.") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to calculate student progress.",
    });
  }
}
