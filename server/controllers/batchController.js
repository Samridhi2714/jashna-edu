import mongoose from "mongoose";
import Batch from "../models/Batch.js";

/*

# HELPER: VALIDATE MONGODB ID

*/

const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/*

# HELPER: NORMALIZE BATCH TIMING

Removes extra spaces and ignores letter case when checking
whether a batch timing already exists.
======================================

*/

const normalizeTiming = (timing) => {
  return timing.trim().replace(/\s+/g, " ").toLowerCase();
};

/*

GET ALL BATCHES
GET /api/batches
================

*/

export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    console.error("Get batches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch batches.",
    });
  }
};

/*

CREATE BATCH
POST /api/batches
=================

*/

export const createBatch = async (req, res) => {
  try {
    const { timing, description = "" } = req.body;

    // Timing is required.
    if (typeof timing !== "string" || !timing.trim()) {
      return res.status(400).json({
        success: false,
        message: "Batch timing is required.",
      });
    }

    // Description is optional but must be text.
    if (typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be text.",
      });
    }

    const trimmedTiming = timing.trim();
    const normalizedTiming = normalizeTiming(trimmedTiming);

    const duplicateBatch = await Batch.findOne({
      normalizedTiming,
    });

    if (duplicateBatch) {
      return res.status(409).json({
        success: false,
        message: "A batch with this timing already exists.",
      });
    }

    // Create the batch without a batch name.
    const batch = await Batch.create({
      timing: trimmedTiming,
      normalizedTiming,
      description: description.trim(),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Batch created successfully.",
      batch,
    });
  } catch (error) {
    console.error("Create batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create batch.",
    });
  }
};

/*

UPDATE BATCH
PUT /api/batches/:id
====================

# Allows timing and description to be edited.

*/

export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { timing, description } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // Update timing only if it was provided.
    if (timing !== undefined) {
      if (typeof timing !== "string" || !timing.trim()) {
        return res.status(400).json({
          success: false,
          message: "Batch timing cannot be empty.",
        });
      }

      const trimmedTiming = timing.trim();
      const normalizedTiming = normalizeTiming(trimmedTiming);

      // Exclude the current batch from duplicate checking.
      const existingBatches = await Batch.find(
        { _id: { $ne: batch._id } },
        { timing: 1 },
      );
      
      const duplicateBatch = await Batch.findOne({
      normalizedTiming,
      _id: { $ne: batch._id },
      });

      if (duplicateBatch) {
        return res.status(409).json({
          success: false,
          message: "Another batch already uses this timing.",
        });
      }

      batch.timing = trimmedTiming;
      batch.normalizedTiming = normalizedTiming;
    }

    // Update description only if it was provided.
    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Description must be text.",
        });
      }

      batch.description = description.trim();
    }

    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully.",
      batch,
    });
  } catch (error) {
    console.error("Update batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update batch.",
    });
  }
};

/*

ACTIVATE / DEACTIVATE BATCH
PATCH /api/batches/:id/status
=============================

*/

export const toggleBatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    batch.isActive = isActive;

    await batch.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Batch activated successfully."
        : "Batch deactivated successfully.",
      batch,
    });
  } catch (error) {
    console.error("Toggle batch status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update batch status.",
    });
  }
};
