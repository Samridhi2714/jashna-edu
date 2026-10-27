import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    /*
    =========================================================
    STUDENT
    =========================================================
    */

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    /*
    =========================================================
    DATE

    Attendance dates are stored at UTC midnight.

    Example:
    "2026-09-30"
    =========================================================
    */

    date: {
      type: Date,
      required: true,
      index: true,
    },

    /*
    =========================================================
    STATUS
    =========================================================
    */

    status: {
      type: String,
      enum: [
        "present",
        "absent",
        "public_holiday",
        "jashna_leave",
      ],
      required: true,
    },

    /*
    =========================================================
    BATCH
    =========================================================
    */

    batch: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    =========================================================
    ADMIN WHO MARKED ATTENDANCE
    =========================================================
    */

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    /*
    =========================================================
    REMARKS
    =========================================================
    */

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

/*
=========================================================
ONE ATTENDANCE RECORD PER STUDENT PER DATE

This allows the admin to UPDATE an existing attendance
record instead of creating duplicates.
=========================================================
*/

attendanceSchema.index(
  { student: 1, date: 1 },
  { unique: true },
);

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema,
);

export default Attendance;