import express from "express";

import {
  getEvents,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getEvents);

// Protected admin
router.get("/admin/all", protect, getAllEvents);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

// Public single event
router.get("/:id", getEventById);

export default router;