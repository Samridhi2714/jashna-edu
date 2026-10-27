import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    timing: {
      type: String,
      required: true,
      trim: true,
    },

    normalizedTiming: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;