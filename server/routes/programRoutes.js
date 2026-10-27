import express from "express";

import {
  getPublicPrograms,
  getAdminPrograms,
  createProgram,
  updateProgram,
  setProgramStatus,
  reorderPrograms,
  deleteProgram,
} from "../controllers/programController.js";
import { programImageUpload } from "../middleware/programImageUpload.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* PUBLIC — website ka Programs page */
router.get("/", getPublicPrograms);

/* ADMIN — fixed paths hamesha "/:id" se upar */
router.get("/admin/all", protect, getAdminPrograms);
router.patch("/reorder", protect, reorderPrograms);

router.post("/", protect, programImageUpload, createProgram);
router.put("/:id", protect, programImageUpload, updateProgram);
router.patch("/:id/status", protect, setProgramStatus);
router.delete("/:id", protect, deleteProgram);

export default router;