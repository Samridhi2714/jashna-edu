import express from "express";

import {
  getActivities,
  saveActivities,
  getStudentActivities,
} from "../controllers/activityController.js";

import protect from "../middleware/authMiddleware.js";
import protectStudent from "../middleware/studentAuthMiddleware.js";

const router = express.Router();

/*
=========================================================
STUDENT ROUTE

Keep this before any future /:id route.
=========================================================
*/

router.get("/student", protectStudent, getStudentActivities);

/*
=========================================================
ADMIN ROUTES
=========================================================
*/

router.get("/", protect, getActivities);

router.post("/", protect, saveActivities);

export default router;