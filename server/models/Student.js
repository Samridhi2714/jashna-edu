import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    /*
    =========================================================
    BASIC STUDENT INFORMATION
    =========================================================
    */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    batch: {
      type: String,
      trim: true,
      default: "",
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    /*
    =========================================================
    COURSE INFORMATION
    =========================================================

    NEW ARCHITECTURE:
    Duration is now stored as a VALUE + UNIT pair.

      { durationValue: 45, durationUnit: "days"   }  -> 45-day workshop
      { durationValue: 3,  durationUnit: "months" }  -> 3-month course
      { durationValue: 6,  durationUnit: "months" }  -> old 6-month course

    There is NO minimum of 6 months any more. Minimum is 1.
    */

    joiningDate: {
      type: Date,
      required: true,
    },

    durationValue: {
      type: Number,
      min: [1, "Course duration must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Course duration must be a whole number",
      },
    },

    durationUnit: {
      type: String,
      enum: ["days", "months"],
      default: "months",
    },

    /*
    DEPRECATED: kept only so OLD student documents still load.
    No more `required` and no more `min: 6`.
    New code must NOT write to this field.
    */
    durationMonths: {
      type: Number,
    },

    courseEndDate: {
      type: Date,
      required: true,
    },

    /*
    =========================================================
    COURSE LIFECYCLE
    =========================================================
    */

    enrollmentStatus: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "left_early", "paused"],
      default: "ongoing",
    },

    actualExitDate: {
      type: Date,
      default: null,
    },

    exitReason: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    =========================================================
    STUDENT PROFILE
    =========================================================
    */

    profileImage: {
      type: String,
      default: "",
    },

    /*
    =========================================================
    STARTING POINT VIDEO
    =========================================================
    */

    startingPointVideo: {
      type: String,
      default: "",
    },

    startingPointVideoType: {
      type: String,
      enum: ["upload", "embed", null],
      default: null,
    },

    /*
    =========================================================
    ACCOUNT STATUS
    =========================================================
    */

    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
=========================================================
BACKWARD COMPATIBILITY (no migration script needed)
=========================================================

Old students only have `durationMonths`.
Before any validation / save, copy it into the new fields.
So even a simple "change password" save() on an old student
will not fail.
*/

studentSchema.pre("validate", function (next) {
  if (!this.durationValue && this.durationMonths) {
    this.durationValue = this.durationMonths;
    this.durationUnit = "months";
  }

  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;