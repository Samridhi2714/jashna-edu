import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getBatches,
  createBatch,
  updateBatch,
  toggleBatchStatus,
} from "../controllers/batchController.js";

const router = express.Router();

/*
=========================================================
PROTECT ALL BATCH ROUTES
=========================================================
*/

router.use(protect);

/*
=========================================================
BATCH ROUTES
=========================================================
*/

// Get all batches.
router.get("/", getBatches);

// Create a new batch.
router.post("/", createBatch);

// Update batch details.
router.put("/:id", updateBatch);

// Activate or deactivate a batch.
router.patch("/:id/status", toggleBatchStatus);

export default router;