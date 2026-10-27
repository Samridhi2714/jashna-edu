import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getPublicInstituteSettings,
  getAdminInstituteSettings,
  updateInstituteSettings,
} from "../controllers/instituteInfocontroller.js";

const router = express.Router();

// Public website footer.
router.get("/public", getPublicInstituteSettings);

// Protected admin settings.
router.get("/", protect, getAdminInstituteSettings);

router.put("/", protect, updateInstituteSettings);

export default router;