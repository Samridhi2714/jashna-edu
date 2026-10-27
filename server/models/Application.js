// models/Application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    linkedinUrl: { type: String, required: true, trim: true },
    resumeLink: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    experienceYears: { type: Number, required: true, min: 0, default: 0 },
    driveSyncStatus: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
    },
    driveFileId: String,
    resumeFileName: {
      type: String,
      default: "",
    },

    resumeMimeType: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// ek email se ek job pe ek hi application
applicationSchema.index({ job: 1, email: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
