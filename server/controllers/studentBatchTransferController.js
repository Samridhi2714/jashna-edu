import mongoose from "mongoose";

import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import StudentBatchHistory from "../models/StudentBatchHistory.js";

/*
=========================================================
GET STUDENTS AND ACTIVE BATCHES

Students are sorted latest admissions first.
=========================================================
*/

export const getBatchTransferData = async (req, res) => {
  try {
    const [students, batches] = await Promise.all([
      Student.find()
        .select(
          "_id name username batch batchId joiningDate courseEndDate enrollmentStatus isActive createdAt",
        )
        .sort({ createdAt: -1 })
        .lean(),

      Batch.find({ isActive: true })
        .select("_id timing description isActive")
        .sort({ timing: 1 })
        .lean(),
    ]);

    return res.status(200).json({
      students,
      batches,
    });
  } catch (error) {
    console.error("Get batch transfer data error:", error);

    return res.status(500).json({
      message: "Failed to load student batch transfer data.",
    });
  }
};

/*
=========================================================
TRANSFER STUDENT TO ANOTHER BATCH

Body:
{
  "batchId": "destinationBatchObjectId"
}

Only the student's batch and batchId are updated.
All other student records remain untouched.
=========================================================
*/

export const transferStudentBatch = async (req, res) => {
  const { id } = req.params;
  const { batchId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid student ID.",
    });
  }

  if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
    return res.status(400).json({
      message: "Please select a valid destination batch.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let transferResult = null;

    await session.withTransaction(async () => {
      const student = await Student.findById(id).session(session);

      if (!student) {
        const error = new Error("Student not found.");
        error.statusCode = 404;
        throw error;
      }

      const destinationBatch = await Batch.findOne({
        _id: batchId,
        isActive: true,
      }).session(session);

      if (!destinationBatch) {
        const error = new Error(
          "The selected batch does not exist or is inactive.",
        );
        error.statusCode = 400;
        throw error;
      }

      const destinationTiming = destinationBatch.timing?.trim();

      if (!destinationTiming) {
        const error = new Error(
          "The selected batch does not have a valid timing.",
        );
        error.statusCode = 400;
        throw error;
      }

      const currentBatchId = student.batchId
        ? student.batchId.toString()
        : null;

      const destinationBatchId = destinationBatch._id.toString();

      const currentTiming = student.batch?.trim() || "";

      // Prevent transferring to the same batch.
      // Timing comparison also protects legacy students
      // whose batchId is missing.
      if (
        currentBatchId === destinationBatchId ||
        currentTiming.toLowerCase() === destinationTiming.toLowerCase()
      ) {
        const error = new Error(
          "The student is already assigned to this batch.",
        );
        error.statusCode = 400;
        throw error;
      }

      const history = new StudentBatchHistory({
        student: student._id,

        fromBatchId: student.batchId || null,

        toBatchId: destinationBatch._id,

        fromBatchTiming: currentTiming,

        toBatchTiming: destinationTiming,

        transferredAt: new Date(),
      });

      // Update only these two fields.
      student.batch = destinationTiming;
      student.batchId = destinationBatch._id;

      await student.save({ session });

      await history.save({ session });

      transferResult = {
        student: {
          _id: student._id,
          name: student.name,
          username: student.username,
          batch: student.batch,
          batchId: student.batchId,
        },

        history,
      };
    });

    return res.status(200).json({
      message: "Student transferred to the new batch successfully.",
      ...transferResult,
    });
  } catch (error) {
    console.error("Student batch transfer error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to transfer student. Please try again.",
    });
  } finally {
    await session.endSession();
  }
};

/*
=========================================================
GET TRANSFER HISTORY FOR ONE STUDENT
=========================================================
*/

export const getStudentBatchHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid student ID.",
      });
    }

    const student = await Student.findById(id)
      .select("_id name username batch")
      .lean();

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    const history = await StudentBatchHistory.find({
      student: id,
    })
      .sort({ transferredAt: -1 })
      .lean();

    return res.status(200).json({
      student,
      history,
    });
  } catch (error) {
    console.error("Get student batch history error:", error);

    return res.status(500).json({
      message: "Failed to load student transfer history.",
    });
  }
};