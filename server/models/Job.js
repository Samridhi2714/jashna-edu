// models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract"],
      default: "Full-time",
    },
    location: { type: String, required: true, trim: true }, // e.g. "Faridabad", "Remote"
    description: { type: String, required: true, trim: true },
    requirements: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }, // createdAt = posted on, updatedAt = last edited
);

export default mongoose.model("Job", jobSchema);