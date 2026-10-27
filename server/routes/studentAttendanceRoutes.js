import express from "express";

import { getMyAttendance } from "../controllers/studentAttendanceController.js";

import protectStudent from "../middleware/studentAuthMiddleware.js";

const router = express.Router();

router.use(protectStudent);

router.get("/me", getMyAttendance);

export default router;
