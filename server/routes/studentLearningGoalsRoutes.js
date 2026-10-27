import express from "express";
import protectStudent from "../middleware/studentAuthMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import {
  getMyLearningGoals,
  saveMyLearningGoals,
  getAllStudentLearningGoals,
} from "../controllers/studentLearningGoalsController.js";
const router = express.Router();
/* STUDENT ROUTES */ router.get("/me", protectStudent, getMyLearningGoals);
router.put("/me", protectStudent, saveMyLearningGoals);
/* ADMIN ROUTE The existing protect middleware is used here. */ router.get(
  "/admin",
  protect,
  getAllStudentLearningGoals,
);
export default router;
