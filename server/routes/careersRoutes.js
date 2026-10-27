import { Router } from "express";
import rateLimit from "express-rate-limit";
import { listOpenJobs, applyToJob } from "../controllers/careersController.js";

const router = Router();

const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 applications per IP per hour
  message: { message: "Too many applications from this device. Please try again later." },
});

router.get("/jobs", listOpenJobs);
router.post("/apply", applyLimiter, applyToJob);

export default router;