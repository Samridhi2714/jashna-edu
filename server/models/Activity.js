import mongoose from "mongoose";

/*
=========================================================
CEFR CONFIGURATION
=========================================================
*/

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/*
=========================================================
CEFR EVALUATION SCHEMA
=========================================================

Each monthly evaluation stores the student's CEFR level
for every evaluated skill.

Descriptors are NOT stored here.

Descriptors are derived from the selected CEFR level
using the central descriptor data.
=========================================================
*/

const evaluationSchema = new mongoose.Schema(
  {
    communication: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },

    vocabulary: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },

    grammar: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },

    fluency: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },

    pronunciation: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },

    confidence: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },

    interaction: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },
  },
  {
    _id: false,
  },
);

/*
=========================================================
MONTHLY ACTIVITY / EVALUATION SCHEMA
=========================================================
*/

const activitySchema = new mongoose.Schema(
  {
    /*
    -----------------------------------------------------
    STUDENT
    -----------------------------------------------------
    */

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    /*
    -----------------------------------------------------
    MONTH IDENTIFICATION
    -----------------------------------------------------

    Format:

    YYYY-MM

    Examples:

    2026-08
    2026-09
    2026-10

    One student can have only ONE monthly evaluation
    for a particular month.
    */

    monthKey: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },

    /*
    -----------------------------------------------------
    MONTH START
    -----------------------------------------------------

    First day of the corresponding month.

    Example:

    2026-10-01
    */

    monthStart: {
      type: Date,
      required: true,
    },

    /*
    -----------------------------------------------------
    CEFR EVALUATION
    -----------------------------------------------------

    Seven skills are evaluated every month.
    */

    evaluation: {
      type: evaluationSchema,
      required: true,
    },

    /*
    -----------------------------------------------------
    TEACHER REMARKS
    -----------------------------------------------------

    Optional manually written observation from teacher.
    */

    teacherRemarks: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    -----------------------------------------------------
    MARKED BY
    -----------------------------------------------------

    Admin/teacher who submitted the evaluation.
    */

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
=========================================================
UNIQUE MONTHLY RECORD
=========================================================

One student + one month = one evaluation.

Examples:

Student A + 2026-08 → one document
Student A + 2026-09 → another document
Student A + 2026-10 → another document

Student B + 2026-08 → another document

This preserves complete monthly history.
=========================================================
*/

activitySchema.index(
  {
    student: 1,
    monthKey: 1,
  },
  {
    unique: true,
  },
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
