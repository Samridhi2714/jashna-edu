import { Router } from "express";
import {
  listJobs,
  createJob,
  updateJob,
  toggleJob,
  deleteJob,
} from "../controllers/adminCareersController.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/jobs", listJobs);
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.patch("/jobs/:id/toggle", toggleJob);
router.delete("/jobs/:id", deleteJob);

export default router;

