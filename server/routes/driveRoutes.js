import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getDriveStatus } from "../controllers/driveController.js";

const router = express.Router();

// Only authenticated administrators can check Google Drive status.
router.get("/status", protect, getDriveStatus);

export default router;