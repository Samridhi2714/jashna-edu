import mongoose from "mongoose";

import Activity from "../models/Activity.js";
import Student from "../models/Student.js";

/*
=========================================================
CEFR CONFIGURATION
=========================================================
*/

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const CEFR_SKILLS = [
  "communication",
  "vocabulary",
  "grammar",
  "fluency",
  "pronunciation",
  "confidence",
  "interaction",
];

/*
=========================================================
HELPERS
=========================================================
*/

/*
Validate and convert a month into the first day
of that month.

Expected format:

YYYY-MM

Example:

2026-10
    ↓
October 1, 2026
*/

const getMonthStart = (monthString) => {
  if (!monthString || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthString)) {
    return null;
  }

  const [year, month] = monthString.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, 1));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/*
=========================================================
CREATE MONTH KEY
=========================================================

Example:

October 1, 2026
      ↓
2026-10
*/

const getMonthKey = (monthStart) => {
  const year = monthStart.getUTCFullYear();

  const month = String(monthStart.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

/*
=========================================================
VALIDATE CEFR EVALUATION
=========================================================

Expected:

{
  communication: "B1",
  vocabulary: "B1",
  grammar: "A2",
  fluency: "B1",
  pronunciation: "B1",
  confidence: "B1",
  interaction: "B1"
}
*/

const validateEvaluation = (evaluation) => {
  if (!evaluation || typeof evaluation !== "object") {
    return "CEFR evaluation is required.";
  }

  for (const skill of CEFR_SKILLS) {
    if (!evaluation[skill]) {
      return `CEFR level for ${skill} is required.`;
    }

    if (!CEFR_LEVELS.includes(evaluation[skill])) {
      return `Invalid CEFR level for ${skill}.`;
    }
  }

  return null;
};

/*
=========================================================
GET ADMIN MONTHLY ACTIVITY RECORDS

GET /api/activities?month=YYYY-MM
=========================================================
*/

export const getActivities = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        message: "Month is required.",
      });
    }

    const monthStart = getMonthStart(month);

    if (!monthStart) {
      return res.status(400).json({
        message: "Invalid month. Use YYYY-MM format.",
      });
    }

    const monthKey = getMonthKey(monthStart);

    const activities = await Activity.find({
      monthKey,
    })
      .populate("student", "name username batch isActive")
      .populate("markedBy", "name email")
      .sort({
        "student.name": 1,
      });

    return res.status(200).json({
      monthKey,
      monthStart,
      activities,
    });
  } catch (error) {
    console.error("Get monthly activities error:", error);

    return res.status(500).json({
      message: "Failed to fetch monthly evaluations.",
    });
  }
};

/*
=========================================================
SAVE MONTHLY CEFR EVALUATIONS

POST /api/activities

Expected body:

{
  month: "2026-10",

  records: [
    {
      studentId: "...",

      evaluation: {
        communication: "B1",
        vocabulary: "B1",
        grammar: "A2",
        fluency: "B1",
        pronunciation: "B1",
        confidence: "B1",
        interaction: "B1"
      },

      teacherRemarks: "..."
    }
  ]
}
=========================================================
*/

export const saveActivities = async (req, res) => {
  try {
    const { month, records } = req.body;

    /*
    -----------------------------------------------------
    BASIC REQUEST VALIDATION
    -----------------------------------------------------
    */

    if (!month || !Array.isArray(records)) {
      return res.status(400).json({
        message: "Month and evaluation records are required.",
      });
    }

    if (records.length === 0) {
      return res.status(400).json({
        message: "At least one monthly evaluation record is required.",
      });
    }

    /*
    -----------------------------------------------------
    CALCULATE MONTH
    -----------------------------------------------------
    */

    const monthStart = getMonthStart(month);

    if (!monthStart) {
      return res.status(400).json({
        message: "Invalid month. Use YYYY-MM format.",
      });
    }

    const monthKey = getMonthKey(monthStart);

    /*
    -----------------------------------------------------
    VALIDATE EVERY RECORD
    -----------------------------------------------------
    */

    const studentIds = [];

    for (const record of records) {
      /*
      Student ID
      */

      if (!record.studentId) {
        return res.status(400).json({
          message: "Each evaluation record must contain studentId.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(record.studentId)) {
        return res.status(400).json({
          message: "Invalid student ID.",
        });
      }

      /*
      CEFR evaluation
      */

      const evaluationError = validateEvaluation(record.evaluation);

      if (evaluationError) {
        return res.status(400).json({
          message: evaluationError,
        });
      }

      /*
      Teacher remarks are optional.

      If supplied, they must be a string.
      */

      if (
        record.teacherRemarks !== undefined &&
        typeof record.teacherRemarks !== "string"
      ) {
        return res.status(400).json({
          message: "Teacher remarks must be text.",
        });
      }

      studentIds.push(record.studentId);
    }

    /*
    -----------------------------------------------------
    PREVENT DUPLICATE STUDENT IN SAME SUBMISSION
    -----------------------------------------------------
    */

    const uniqueStudentIds = [...new Set(studentIds)];

    if (uniqueStudentIds.length !== studentIds.length) {
      return res.status(400).json({
        message:
          "A student cannot appear more than once in the same monthly submission.",
      });
    }

    /*
    -----------------------------------------------------
    VERIFY STUDENTS
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
    INACTIVE STUDENTS CANNOT RECEIVE NEW EVALUATIONS
    -----------------------------------------------------
    */

    const inactiveStudent = students.find((student) => !student.isActive);

    if (inactiveStudent) {
      return res.status(400).json({
        message: `${inactiveStudent.name} is inactive and cannot receive a new monthly evaluation.`,
      });
    }

    /*
    -----------------------------------------------------
    PREPARE DATABASE OPERATIONS
    -----------------------------------------------------

    One student + one month = one evaluation record.

    Existing record:
        UPDATE

    New record:
        CREATE
    */

    const operations = records.map((record) => ({
      updateOne: {
        filter: {
          student: record.studentId,
          monthKey,
        },

        update: {
          $set: {
            student: record.studentId,

            monthKey,

            monthStart,

            evaluation: {
              communication: record.evaluation.communication,
              vocabulary: record.evaluation.vocabulary,
              grammar: record.evaluation.grammar,
              fluency: record.evaluation.fluency,
              pronunciation: record.evaluation.pronunciation,
              confidence: record.evaluation.confidence,
              interaction: record.evaluation.interaction,
            },

            teacherRemarks: record.teacherRemarks?.trim() || "",

            markedBy: req.admin.id,
          },
        },

        upsert: true,
      },
    }));

    /*
    -----------------------------------------------------
    SAVE ALL RECORDS
    -----------------------------------------------------
    */

    const result = await Activity.bulkWrite(operations);

    return res.status(200).json({
      message: "Monthly CEFR evaluations saved successfully.",

      inserted: result.upsertedCount || 0,

      updated: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error("Save monthly activities error:", {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      index: error.index,
      writeErrors: error.writeErrors,
    });

    /*
    Duplicate key protection
    */

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A monthly evaluation already exists for one of these students.",
      });
    }

    return res.status(500).json({
      message: "Failed to save monthly evaluations.",
    });
  }
};

/*
=========================================================
GET STUDENT MONTHLY ACTIVITIES

GET /api/activities/student
=========================================================
*/

export const getStudentActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      student: req.student.id,
    })
      .select(
        "monthKey monthStart evaluation teacherRemarks createdAt updatedAt",
      )
      .sort({
        monthStart: -1,
      });

    return res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error("Get student monthly activities error:", error);

    return res.status(500).json({
      message: "Failed to fetch monthly evaluations.",
    });
  }
};
