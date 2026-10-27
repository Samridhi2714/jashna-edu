import mongoose from "mongoose";

import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

/*
=========================================================
CONSTANTS
=========================================================
*/

const INDIA_TIME_ZONE = "Asia/Kolkata";

/*
=========================================================
DATE HELPERS
=========================================================
*/

/*
---------------------------------------------------------
Convert YYYY-MM-DD into UTC midnight.

Attendance is a DATE, not a timestamp.

Example:

2026-09-30

is always stored as:

2026-09-30T00:00:00.000Z

This prevents attendance dates from shifting depending
on the server timezone.
---------------------------------------------------------
*/

const normalizeDate = (dateString) => {
  if (
    !dateString ||
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  /*
  -------------------------------------------------------
  Validate impossible dates.

  Examples:

  2026-02-31
  2026-13-10
  2026-00-20
  -------------------------------------------------------
  */

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

/*
---------------------------------------------------------
Convert a Date into YYYY-MM-DD.

Course date fields are treated as calendar dates.

UTC getters are intentionally used because attendance
dates are stored at UTC midnight.
---------------------------------------------------------
*/

const dateToKey = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getUTCFullYear();

  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
---------------------------------------------------------
Get today's actual calendar date in India.

We do NOT rely on the Node.js server timezone.

This prevents a problem such as:

India:
2026-10-01 00:30

Server:
2026-09-30 19:00 UTC

from incorrectly treating today as September 30.
---------------------------------------------------------
*/

const getTodayKey = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
};

/*
---------------------------------------------------------
Compare YYYY-MM-DD values.

Because YYYY-MM-DD sorts chronologically,
normal string comparison is safe.
---------------------------------------------------------
*/

const compareDateKeys = (first, second) => {
  if (!first || !second) {
    return 0;
  }

  if (first < second) {
    return -1;
  }

  if (first > second) {
    return 1;
  }

  return 0;
};

/*
=========================================================
ALLOWED ATTENDANCE STATUSES
=========================================================
*/

const ALLOWED_STATUSES = [
  "present",
  "absent",
  "public_holiday",
  "jashna_leave",
];

/*
=========================================================
GET ATTENDANCE
=========================================================

GET /api/attendance

Optional:

?date=2026-09-29
?batch=IELTS Evening
?student=STUDENT_ID

=========================================================
*/

export const getAttendance = async (req, res) => {
  try {
    const { date, batch, student } = req.query;

    const filter = {};

    /*
    -----------------------------------------------------
    STUDENT FILTER
    -----------------------------------------------------
    */

    if (student) {
      if (!mongoose.Types.ObjectId.isValid(student)) {
        return res.status(400).json({
          message: "Invalid student ID.",
        });
      }

      filter.student = student;
    }

    /*
    -----------------------------------------------------
    DATE FILTER
    -----------------------------------------------------
    */

    if (date) {
      const normalizedDate = normalizeDate(date);

      if (!normalizedDate) {
        return res.status(400).json({
          message: "Invalid date. Use YYYY-MM-DD format.",
        });
      }

      filter.date = normalizedDate;
    }

    /*
    -----------------------------------------------------
    BATCH FILTER
    -----------------------------------------------------
    */

    if (batch) {
      const trimmedBatch = batch.trim();

      if (trimmedBatch) {
        filter.batch = trimmedBatch;
      }
    }

    /*
    -----------------------------------------------------
    FETCH ATTENDANCE
    -----------------------------------------------------
    */

    const attendance = await Attendance.find(filter)
      .populate(
        "student",
        "name username batch isActive enrollmentStatus joiningDate courseEndDate actualExitDate",
      )
      .populate("markedBy", "name email")
      .sort({
        date: -1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    return res.status(500).json({
      message: "Failed to fetch attendance.",
    });
  }
};

/*
=========================================================
VALIDATE ATTENDANCE AGAINST STUDENT COURSE
=========================================================

Rules:

1. Student must be active.
2. Student cannot be upcoming.
3. Student cannot be paused.
4. Student cannot be completed.
5. Left-early student can only have attendance
   until actualExitDate.
6. Attendance cannot be before joining date.
7. Attendance cannot be after course end date.
8. Attendance cannot be a future date.

=========================================================
*/

const validateAttendanceDateForStudent = (student, attendanceDateKey) => {
  if (!student) {
    return {
      valid: false,
      message: "Student not found.",
    };
  }

  /*
  -------------------------------------------------------
  ACCOUNT STATUS
  -------------------------------------------------------
  */

  if (!student.isActive) {
    return {
      valid: false,
      message: `${student.name} is inactive and cannot receive new attendance.`,
    };
  }

  /*
  -------------------------------------------------------
  COURSE STATUS
  -------------------------------------------------------
  */

  if (student.enrollmentStatus === "upcoming") {
    return {
      valid: false,
      message: `${student.name}'s course has not started yet.`,
    };
  }

  if (student.enrollmentStatus === "paused") {
    return {
      valid: false,
      message: `${student.name}'s course is currently paused.`,
    };
  }

  if (student.enrollmentStatus === "completed") {
    return {
      valid: false,
      message: `${student.name}'s course has already been completed.`,
    };
  }

  /*
  -------------------------------------------------------
  JOINING DATE
  -------------------------------------------------------
  */

  const joiningDateKey = dateToKey(student.joiningDate);

  if (!joiningDateKey) {
    return {
      valid: false,
      message: `${student.name} has an invalid joining date.`,
    };
  }

  if (compareDateKeys(attendanceDateKey, joiningDateKey) < 0) {
    return {
      valid: false,
      message: `Attendance for ${student.name} cannot be marked before the joining date.`,
    };
  }

  /*
  -------------------------------------------------------
  EFFECTIVE COURSE END DATE
  -------------------------------------------------------

  Normal student:
    courseEndDate

  Left early:
    actualExitDate

  IMPORTANT:
  actualExitDate is only used when enrollmentStatus is
  actually "left_early".
  -------------------------------------------------------
  */

  let effectiveEndDate = student.courseEndDate;

  if (student.enrollmentStatus === "left_early" && student.actualExitDate) {
    effectiveEndDate = student.actualExitDate;
  }

  const endDateKey = dateToKey(effectiveEndDate);

  if (!endDateKey) {
    return {
      valid: false,
      message: `${student.name} has an invalid course end date.`,
    };
  }

  if (compareDateKeys(attendanceDateKey, endDateKey) > 0) {
    return {
      valid: false,
      message: `Attendance for ${student.name} cannot be marked after the course end date.`,
    };
  }

  /*
  -------------------------------------------------------
  FUTURE DATE
  -------------------------------------------------------
  */

  const todayKey = getTodayKey();

  if (compareDateKeys(attendanceDateKey, todayKey) > 0) {
    return {
      valid: false,
      message: "Future attendance cannot be marked.",
    };
  }

  return {
    valid: true,
  };
};

/*
=========================================================
SAVE ATTENDANCE
=========================================================

POST /api/attendance

Body:

{
  date: "2026-09-29",
  batch: "IELTS Evening",

  records: [
    {
      studentId: "...",
      status: "present",
      remarks: ""
    },

    {
      studentId: "...",
      status: "absent",
      remarks: "Student informed mentor"
    }
  ]
}

=========================================================
*/

export const saveAttendance = async (req, res) => {
  try {
    const { date, batch, records } = req.body;

    /*
    -----------------------------------------------------
    BASIC VALIDATION
    -----------------------------------------------------
    */

    if (!date || !batch || !Array.isArray(records)) {
      return res.status(400).json({
        message: "Date, batch and attendance records are required.",
      });
    }

    if (records.length === 0) {
      return res.status(400).json({
        message: "At least one attendance record is required.",
      });
    }

    /*
    -----------------------------------------------------
    NORMALIZE DATE
    -----------------------------------------------------
    */

    const normalizedDate = normalizeDate(date);

    if (!normalizedDate) {
      return res.status(400).json({
        message: "Invalid date. Use YYYY-MM-DD format.",
      });
    }

    /*
    Use the normalized value itself to generate the
    canonical attendance key.

    This guarantees the backend works with the exact
    validated date.
    */

    const attendanceDateKey = dateToKey(normalizedDate);

    /*
    -----------------------------------------------------
    PREVENT FUTURE ATTENDANCE
    -----------------------------------------------------
    */

    const todayKey = getTodayKey();

    if (compareDateKeys(attendanceDateKey, todayKey) > 0) {
      return res.status(400).json({
        message: "Future attendance cannot be marked.",
      });
    }

    /*
    -----------------------------------------------------
    BATCH
    -----------------------------------------------------
    */

    const trimmedBatch = typeof batch === "string" ? batch.trim() : "";

    if (!trimmedBatch) {
      return res.status(400).json({
        message: "Batch is required.",
      });
    }

    /*
    -----------------------------------------------------
    VALIDATE RECORDS
    -----------------------------------------------------
    */

    const studentIds = [];

    for (const record of records) {
      if (!record.studentId || !record.status) {
        return res.status(400).json({
          message: "Each attendance record must contain studentId and status.",
        });
      }

      if (!ALLOWED_STATUSES.includes(record.status)) {
        return res.status(400).json({
          message: "Invalid attendance status.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(record.studentId)) {
        return res.status(400).json({
          message: "Invalid student ID.",
        });
      }

      if (record.remarks !== undefined && typeof record.remarks !== "string") {
        return res.status(400).json({
          message: "Attendance remarks must be text.",
        });
      }

      studentIds.push(record.studentId);
    }

    /*
    -----------------------------------------------------
    PREVENT DUPLICATE STUDENTS
    -----------------------------------------------------
    */

    const uniqueStudentIds = [...new Set(studentIds)];

    if (uniqueStudentIds.length !== studentIds.length) {
      return res.status(400).json({
        message:
          "A student cannot appear more than once in the same attendance submission.",
      });
    }

    /*
    -----------------------------------------------------
    FIND STUDENTS
    -----------------------------------------------------
    */

    const students = await Student.find({
      _id: {
        $in: uniqueStudentIds,
      },
    });

    if (students.length !== uniqueStudentIds.length) {
      return res.status(404).json({
        message: "One or more students could not be found.",
      });
    }

    /*
    -----------------------------------------------------
    CREATE QUICK LOOKUP MAP
    -----------------------------------------------------
    */

    const studentMap = new Map(
      students.map((student) => [student._id.toString(), student]),
    );

    /*
    -----------------------------------------------------
    VALIDATE EVERY STUDENT
    -----------------------------------------------------
    */

    for (const record of records) {
      const student = studentMap.get(record.studentId);

      if (!student) {
        return res.status(404).json({
          message: "One or more students could not be found.",
        });
      }

      /*
      ---------------------------------------------------
      BATCH CONSISTENCY
      ---------------------------------------------------
      */

      const studentBatch = student.batch?.trim() || "";

      if (studentBatch !== trimmedBatch) {
        return res.status(400).json({
          message: `${student.name} does not belong to the selected batch.`,
        });
      }

      /*
      ---------------------------------------------------
      COURSE DATE / STATUS VALIDATION
      ---------------------------------------------------
      */

      const validation = validateAttendanceDateForStudent(
        student,
        attendanceDateKey,
      );

      if (!validation.valid) {
        return res.status(400).json({
          message: validation.message,
        });
      }
    }

    /*
    -----------------------------------------------------
    PREPARE BULK OPERATIONS
    -----------------------------------------------------
    */

    const operations = records.map((record) => ({
      updateOne: {
        filter: {
          student: record.studentId,
          date: normalizedDate,
        },

        update: {
          $set: {
            status: record.status,
            batch: trimmedBatch,
            markedBy: req.admin.id,
            remarks: record.remarks?.trim() || "",
          },
        },

        /*
          If attendance already exists for the
          student/date combination, update it.

          Otherwise create it.
          */

        upsert: true,
      },
    }));

    /*
    -----------------------------------------------------
    SAVE / UPDATE
    -----------------------------------------------------
    */

    const result = await Attendance.bulkWrite(operations);

    /*
    -----------------------------------------------------
    RESPONSE
    -----------------------------------------------------

    matchedCount = existing attendance records found.

    modifiedCount = existing records whose values
    actually changed.

    upsertedCount = newly created records.
    -----------------------------------------------------
    */

    return res.status(200).json({
      message: "Attendance saved successfully.",

      inserted: result.upsertedCount || 0,

      updated: result.matchedCount || 0,

      modified: result.modifiedCount || 0,

      processed: records.length,
    });
  } catch (error) {
    console.error("Save attendance error:", error);

    /*
    -----------------------------------------------------
    DUPLICATE SAFETY
    -----------------------------------------------------
    */

    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "Attendance already exists for one of these students on this date. Please refresh and try again.",
      });
    }

    return res.status(500).json({
      message: "Failed to save attendance.",
    });
  }
};

/*
=========================================================
GET STUDENT ATTENDANCE
=========================================================

GET /api/attendance/student

Authenticated student only.

=========================================================
*/

export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.student.id;

    /*
    -----------------------------------------------------
    FIND STUDENT
    -----------------------------------------------------
    */

    const student = await Student.findById(studentId).select(
      "name username batch isActive enrollmentStatus joiningDate courseEndDate actualExitDate durationValue durationUnit durationMonths",
    );

    if (!student) {
      return res.status(404).json({
        message: "Student account not found.",
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        message: "This student account has been deactivated.",
      });
    }

    /*
    -----------------------------------------------------
    FIND ATTENDANCE
    -----------------------------------------------------
    */

    const attendance = await Attendance.find({
      student: studentId,
    })
      .select("date status batch remarks createdAt")
      .sort({
        date: -1,
      })
      .lean();

    /*
    -----------------------------------------------------
    COUNT TYPES
    -----------------------------------------------------
    */

    let present = 0;
    let absent = 0;
    let publicHoliday = 0;
    let jashnaLeave = 0;

    for (const record of attendance) {
      switch (record.status) {
        case "present":
          present += 1;
          break;

        case "absent":
          absent += 1;
          break;

        case "public_holiday":
          publicHoliday += 1;
          break;

        case "jashna_leave":
          jashnaLeave += 1;
          break;

        default:
          break;
      }
    }

    /*
    -----------------------------------------------------
    COUNTED CLASSES

    Only Present + Absent contribute to attendance
    percentage.

    Public holidays and Jashna leave remain visible
    in the student's history but are excluded.
    -----------------------------------------------------
    */

    const countedClasses = present + absent;

    /*
    -----------------------------------------------------
    ATTENDANCE PERCENTAGE
    -----------------------------------------------------
    */

    const percentage =
      countedClasses > 0
        ? Number(((present / countedClasses) * 100).toFixed(1))
        : 0;

    /*
    -----------------------------------------------------
    RESPONSE
    -----------------------------------------------------
    */

    return res.status(200).json({
      student,

      attendance,

      stats: {
        present,
        absent,
        publicHoliday,
        jashnaLeave,
        countedClasses,
        percentage,
      },

      course: {
        joiningDate: student.joiningDate,

        courseEndDate: student.courseEndDate,

        actualExitDate: student.actualExitDate,
        durationValue: student.durationValue ?? student.durationMonths,
        durationUnit: student.durationUnit || "months",

        enrollmentStatus: student.enrollmentStatus,
      },
    });
  } catch (error) {
    console.error("Get student attendance error:", error);

    return res.status(500).json({
      message: "Failed to fetch student attendance.",
    });
  }
};
