import mongoose from "mongoose";

const studentBatchHistorySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    // Null is allowed for legacy students without a batchId.
    fromBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    toBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // Snapshot values: these must not change if a batch is
    // renamed or its timing is edited later.
    fromBatchTiming: {
      type: String,
      trim: true,
      default: "",
    },

    toBatchTiming: {
      type: String,
      trim: true,
      required: true,
    },

    transferredAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

studentBatchHistorySchema.index({
  student: 1,
  transferredAt: -1,
});

const StudentBatchHistory = mongoose.model(
  "StudentBatchHistory",
  studentBatchHistorySchema,
);

export default StudentBatchHistory;