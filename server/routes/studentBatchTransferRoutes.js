import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getBatchTransferData,
  transferStudentBatch,
  getStudentBatchHistory,
} from "../controllers/studentBatchTransferController.js";

const router = express.Router();

// All transfer routes require admin authentication.
router.use(protect);

// Get students and active destination batches.
router.get("/", getBatchTransferData);

// Transfer an individual student.
router.patch("/:id", transferStudentBatch);

// View the transfer history of an individual student.
router.get("/:id/history", getStudentBatchHistory);

export default router;