import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Batch from "../models/Batch.js";

import {
  toUTCDate,
  todayUTC,
  getDuration,
  validateDuration,
  calculateCourseEndDate,
  getCourseProgress as getBaseProgress,
} from "../utils/courseDuration.js";

/*
=========================================================
DATE HELPERS

All dates are calendar dates stored at UTC midnight
(same convention as attendanceController).
=========================================================
*/

/* Strict YYYY-MM-DD -> UTC midnight Date (null if invalid, e.g. 2026-02-31) */
const parseDateInput = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const startOfDay = (value) => toUTCDate(value);

const todayStart = () => todayUTC();

/*
=========================================================
GET AUTOMATIC COURSE STATUS
=========================================================
*/

const getAutomaticCourseStatus = (student) => {
  if (student.enrollmentStatus === "left_early") {
    return "left_early";
  }

  if (student.enrollmentStatus === "paused") {
    return "paused";
  }

  const start = startOfDay(student.joiningDate);
  const end = startOfDay(student.courseEndDate);

  if (!start || !end) {
    return "ongoing";
  }

  const today = todayStart();

  if (today < start) {
    return "upcoming";
  }

  // End date is inclusive: the course is still ongoing ON the end date.
  if (today > end) {
    return "completed";
  }

  return "ongoing";
};

/*
=========================================================
GET COURSE PROGRESS

percentage + label come from utils/courseDuration.js
(date based, works for days AND months).

currentMonth / totalMonths are kept ONLY for months-based
courses so any old UI that still reads them keeps working.

daysElapsed / totalDays are the same numbers the student
sees on their own attendance page ("Day X of Y").
=========================================================
*/

const getCourseProgress = (student) => {
  const base = getBaseProgress(student);

  const { value, unit } = getDuration(student);

  return {
    percentage: base.percentage,
    label: base.label,

    durationValue: value,
    durationUnit: unit,

    // Generic position inside the course: Day 12 of 45 / Month 2 of 6
    current: base.current,
    total: base.total,

    // Journey days (joining day -> course end / exit day, inclusive)
    daysElapsed: base.daysElapsed ?? 0,
    totalDays: base.totalDays ?? 0,

    // Legacy fields (months courses only)
    currentMonth: unit === "months" ? base.current : null,
    totalMonths: unit === "months" ? value : null,

    status: getAutomaticCourseStatus(student),

    joiningDate: student.joiningDate,
    courseEndDate: student.courseEndDate,
    actualExitDate: student.actualExitDate || null,
  };
};

/*
=========================================================
SMALL SERIALIZER FOR RESPONSES
=========================================================
*/

const durationFields = (student) => {
  const { value, unit } = getDuration(student);

  return {
    durationValue: value,
    durationUnit: unit,
  };
};

/*
=========================================================
ATTENDANCE STATS (for the admin students table)
=========================================================

Same rule as the student's own attendance page:

  percentage = present / (present + absent) * 100

Public holidays and Jashna leave are NOT counted.
One aggregation for ALL students, so the table does not
need one request per student.
=========================================================
*/

const buildAttendanceCountsMap = async () => {
  const rows = await Attendance.aggregate([
    {
      $group: {
        _id: {
          student: "$student",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map();

  for (const row of rows) {
    const studentKey = String(row._id.student);

    if (!map.has(studentKey)) {
      map.set(studentKey, {
        present: 0,
        absent: 0,
        publicHoliday: 0,
        jashnaLeave: 0,
      });
    }

    const entry = map.get(studentKey);

    switch (row._id.status) {
      case "present":
        entry.present += row.count;
        break;

      case "absent":
        entry.absent += row.count;
        break;

      case "public_holiday":
        entry.publicHoliday += row.count;
        break;

      case "jashna_leave":
        entry.jashnaLeave += row.count;
        break;

      default:
        break;
    }
  }

  return map;
};

const buildAttendanceStats = (counts) => {
  const present = counts?.present || 0;
  const absent = counts?.absent || 0;
  const publicHoliday = counts?.publicHoliday || 0;
  const jashnaLeave = counts?.jashnaLeave || 0;

  const countedClasses = present + absent;

  const percentage =
    countedClasses > 0
      ? Number(((present / countedClasses) * 100).toFixed(1))
      : 0;

  return {
    present,
    absent,
    publicHoliday,
    jashnaLeave,
    countedClasses,
    percentage,
  };
};

/*
=========================================================
GENERATE TEMPORARY PASSWORD
=========================================================
*/

const generateTemporaryPassword = () => {
  return `Jashna@${crypto.randomBytes(3).toString("hex")}`;
};

/*
=========================================================
GET ALL STUDENTS
=========================================================
*/

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .sort({ createdAt: -1 });

    const attendanceCounts = await buildAttendanceCountsMap();

    const studentsWithProgress = students.map((student) => {
      const studentObject = student.toObject();

      const courseProgress = getCourseProgress(student);

      const attendanceStats = buildAttendanceStats(
        attendanceCounts.get(String(student._id)),
      );

      return {
        ...studentObject,

        // Always present for the frontend, even for old records.
        ...durationFields(student),

        courseProgress,

        attendanceStats,
      };
    });

    res.status(200).json({
      students: studentsWithProgress,
    });
  } catch (error) {
    console.error("Get students error:", error);

    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
};

/*
=========================================================
GET SINGLE STUDENT
=========================================================
*/

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const courseProgress = getCourseProgress(student);

    res.status(200).json({
      student: {
        ...student.toObject(),
        ...durationFields(student),
      },
      courseProgress,
    });
  } catch (error) {
    console.error("Get student error:", error);

    res.status(500).json({
      message: "Failed to fetch student",
    });
  }
};

/*
=========================================================
CREATE STUDENT
=========================================================
*/

export const createStudent = async (req, res) => {
  try {
    const { name, username, batchId, joiningDate } = req.body;

    /*
    Duration: NEW format is durationValue + durationUnit.
    If an old client still sends durationMonths, treat it as months.
    */

    let { durationValue, durationUnit } = req.body;

    if (
      (durationValue === undefined ||
        durationValue === null ||
        durationValue === "") &&
      req.body.durationMonths !== undefined
    ) {
      durationValue = req.body.durationMonths;
      durationUnit = "months";
    }

    durationUnit = durationUnit || "months";

    /*
    ========================================================
    1. VALIDATION
    ========================================================
    */

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof username !== "string" ||
      !username.trim()
    ) {
      return res.status(400).json({
        message: "Student name and username are required",
      });
    }

    if (!joiningDate) {
      return res.status(400).json({
        message: "Joining date is required",
      });
    }

    if (
      durationValue === undefined ||
      durationValue === null ||
      durationValue === ""
    ) {
      return res.status(400).json({
        message: "Course duration is required",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const parsedJoiningDate = parseDateInput(joiningDate);

    if (!parsedJoiningDate) {
      return res.status(400).json({
        message: "Invalid joining date",
      });
    }

    const durationError = validateDuration(durationValue, durationUnit);

    if (durationError) {
      return res.status(400).json({
        message: durationError,
      });
    }

    const normalizedDuration = Number(durationValue);

    /*
    ========================================================
    2. CHECK USERNAME
    ========================================================
    */

    const existingStudent = await Student.findOne({
      username: normalizedUsername,
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "This username is already in use",
      });
    }

    /*
    ========================================================
    3. RESOLVE SELECTED BATCH
    ========================================================
    */

    if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        message: "Please select a valid batch",
      });
    }

    const selectedBatch = await Batch.findById(batchId);

    if (!selectedBatch) {
      return res.status(404).json({
        message: "Selected batch was not found",
      });
    }

    if (!selectedBatch.isActive) {
      return res.status(400).json({
        message: "This batch is inactive. Please select an active batch.",
      });
    }

    if (
      typeof selectedBatch.timing !== "string" ||
      !selectedBatch.timing.trim()
    ) {
      return res.status(400).json({
        message: "The selected batch does not have a valid timing.",
      });
    }

    const selectedBatchId = selectedBatch._id;
    const selectedBatchName = selectedBatch.timing.trim();

    /*
    ========================================================
    4. CALCULATE COURSE END DATE
    ========================================================
    */

    const courseEndDate = calculateCourseEndDate(
      parsedJoiningDate,
      normalizedDuration,
      durationUnit,
    );

    if (!courseEndDate) {
      return res.status(400).json({
        message: "Unable to calculate course end date",
      });
    }

    /*
    ========================================================
    5. DETERMINE INITIAL ENROLLMENT STATUS
    ========================================================
    */

    const now = todayStart();

    let enrollmentStatus = "ongoing";

    if (now < parsedJoiningDate) {
      enrollmentStatus = "upcoming";
    } else if (now > courseEndDate) {
      enrollmentStatus = "completed";
    }

    /*
    ========================================================
    6. GENERATE TEMPORARY PASSWORD
    ========================================================
    */

    const temporaryPassword = generateTemporaryPassword();

    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    /*
    ========================================================
    7. CREATE STUDENT
    ========================================================
    */

    const student = await Student.create({
      name: name.trim(),

      username: normalizedUsername,

      password: hashedPassword,

      batch: selectedBatchName,

      batchId: selectedBatchId,

      joiningDate: parsedJoiningDate,

      // NEW: value + unit. (durationMonths is deprecated, not written.)
      durationValue: normalizedDuration,
      durationUnit,

      courseEndDate,

      enrollmentStatus,

      actualExitDate: null,

      exitReason: "",

      mustChangePassword: true,

      isActive: true,
    });

    /*
    ========================================================
    8. COURSE PROGRESS
    ========================================================
    */

    const courseProgress = getCourseProgress(student);

    /*
    ========================================================
    9. RESPONSE
    ========================================================
    */

    return res.status(201).json({
      message: "Student created successfully",

      student: {
        id: student._id,
        _id: student._id,

        name: student.name,

        username: student.username,

        batch: student.batch,

        batchId: student.batchId,

        joiningDate: student.joiningDate,

        ...durationFields(student),

        courseEndDate: student.courseEndDate,

        enrollmentStatus: student.enrollmentStatus,

        actualExitDate: student.actualExitDate,

        exitReason: student.exitReason,

        isActive: student.isActive,

        courseProgress,
      },

      temporaryPassword,
    });
  } catch (error) {
    console.error("Create student error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "This username is already in use",
      });
    }

    return res.status(500).json({
      message: "Failed to create student",
    });
  }
};

/*
=========================================================
ACTIVATE / DEACTIVATE STUDENT ACCOUNT
=========================================================
*/

export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    student.isActive = !student.isActive;

    await student.save();

    res.status(200).json({
      message: student.isActive ? "Student activated" : "Student deactivated",

      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        batch: student.batch,
        isActive: student.isActive,
        enrollmentStatus: student.enrollmentStatus,
      },
    });
  } catch (error) {
    console.error("Toggle student status error:", error);

    res.status(500).json({
      message: "Failed to update student status",
    });
  }
};

/*
=========================================================
RESET STUDENT PASSWORD
=========================================================
*/

export const resetStudentPassword = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const temporaryPassword = generateTemporaryPassword();

    student.password = await bcrypt.hash(temporaryPassword, 12);

    student.mustChangePassword = true;

    await student.save();

    res.status(200).json({
      message: "Student password reset successfully",

      temporaryPassword,
    });
  } catch (error) {
    console.error("Reset student password error:", error);

    res.status(500).json({
      message: "Failed to reset student password",
    });
  }
};

/*
=========================================================
MARK STUDENT AS LEFT EARLY
=========================================================
*/

export const markStudentLeftEarly = async (req, res) => {
  try {
    const { actualExitDate, exitReason } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (!actualExitDate) {
      return res.status(400).json({
        message: "Actual exit date is required",
      });
    }

    const parsedExitDate = parseDateInput(actualExitDate);

    if (!parsedExitDate) {
      return res.status(400).json({
        message: "Invalid exit date",
      });
    }

    const joiningDate = startOfDay(student.joiningDate);

    const today = todayStart();

    if (!joiningDate) {
      return res.status(400).json({
        message: "Student joining date is invalid",
      });
    }

    if (parsedExitDate < joiningDate) {
      return res.status(400).json({
        message: "Exit date cannot be before joining date",
      });
    }

    if (parsedExitDate > today) {
      return res.status(400).json({
        message: "Exit date cannot be in the future",
      });
    }

    const plannedEnd = startOfDay(student.courseEndDate);

    if (plannedEnd && parsedExitDate >= plannedEnd) {
      return res.status(400).json({
        message:
          "Use completed status for an exit on or after the planned course end date.",
      });
    }

    student.enrollmentStatus = "left_early";

    student.actualExitDate = parsedExitDate;

    student.exitReason = exitReason?.trim() || "";

    await student.save();

    const courseProgress = getCourseProgress(student);

    res.status(200).json({
      message: "Student marked as left early",

      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        batch: student.batch,
        joiningDate: student.joiningDate,
        ...durationFields(student),
        courseEndDate: student.courseEndDate,
        enrollmentStatus: student.enrollmentStatus,
        actualExitDate: student.actualExitDate,
        exitReason: student.exitReason,
        isActive: student.isActive,
      },

      courseProgress,
    });
  } catch (error) {
    console.error("Mark student left early error:", error);

    res.status(500).json({
      message: "Failed to mark student as left early",
    });
  }
};

/*
=========================================================
PAUSE STUDENT COURSE
=========================================================
*/

export const pauseStudentCourse = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (student.enrollmentStatus === "left_early") {
      return res.status(400).json({
        message: "A student who left early cannot be paused.",
      });
    }

    if (student.enrollmentStatus === "completed") {
      return res.status(400).json({
        message: "A completed course cannot be paused.",
      });
    }

    if (student.enrollmentStatus === "paused") {
      return res.status(400).json({
        message: "Student course is already paused.",
      });
    }

    student.enrollmentStatus = "paused";

    await student.save();

    res.status(200).json({
      message: "Student course paused",

      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        enrollmentStatus: student.enrollmentStatus,
      },
    });
  } catch (error) {
    console.error("Pause student course error:", error);

    res.status(500).json({
      message: "Failed to pause student course",
    });
  }
};

/*
=========================================================
RESUME STUDENT COURSE
=========================================================
*/

export const resumeStudentCourse = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (student.enrollmentStatus !== "paused") {
      return res.status(400).json({
        message: "Only paused students can be resumed.",
      });
    }

    const now = todayStart();

    const start = startOfDay(student.joiningDate);

    const end = startOfDay(student.courseEndDate);

    if (!start || !end) {
      return res.status(400).json({
        message: "Student course dates are invalid.",
      });
    }

    if (now < start) {
      student.enrollmentStatus = "upcoming";
    } else if (now > end) {
      student.enrollmentStatus = "completed";
    } else {
      student.enrollmentStatus = "ongoing";
    }

    await student.save();

    res.status(200).json({
      message: "Student course resumed",

      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        enrollmentStatus: student.enrollmentStatus,
      },
    });
  } catch (error) {
    console.error("Resume student course error:", error);

    res.status(500).json({
      message: "Failed to resume student course",
    });
  }
};

/*
=========================================================
EXTEND COURSE
=========================================================

Body: { durationValue, durationUnit }

Rule: the NEW course end date must be later than the
CURRENT one. This works even if the unit changes
(for example 30 days -> 2 months).

Existing attendance and assessment history is untouched.
=========================================================
*/

export const updateCourseDuration = async (req, res) => {
  try {
    let { durationValue, durationUnit } = req.body;

    // Old clients may still send durationMonths.
    if (
      (durationValue === undefined ||
        durationValue === null ||
        durationValue === "") &&
      req.body.durationMonths !== undefined
    ) {
      durationValue = req.body.durationMonths;
      durationUnit = "months";
    }

    durationUnit = durationUnit || "months";

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const durationError = validateDuration(durationValue, durationUnit);

    if (durationError) {
      return res.status(400).json({
        message: durationError,
      });
    }

    const normalizedDuration = Number(durationValue);

    const courseEndDate = calculateCourseEndDate(
      student.joiningDate,
      normalizedDuration,
      durationUnit,
    );

    if (!courseEndDate) {
      return res.status(400).json({
        message: "Unable to calculate course end date",
      });
    }

    const currentEnd = startOfDay(student.courseEndDate);

    // Courses can only be extended, never shortened.
    if (currentEnd && courseEndDate <= currentEnd) {
      const current = getDuration(student);

      return res.status(400).json({
        message: `Course can only be extended. Current duration is ${current.value} ${current.unit}.`,
      });
    }

    student.durationValue = normalizedDuration;

    student.durationUnit = durationUnit;

    // Remove the deprecated field so it can never disagree with the new ones.
    student.durationMonths = undefined;

    student.courseEndDate = courseEndDate;

    if (
      student.enrollmentStatus !== "left_early" &&
      student.enrollmentStatus !== "paused"
    ) {
      const now = todayStart();

      const start = startOfDay(student.joiningDate);

      if (now < start) {
        student.enrollmentStatus = "upcoming";
      } else if (now > courseEndDate) {
        student.enrollmentStatus = "completed";
      } else {
        student.enrollmentStatus = "ongoing";
      }
    }

    await student.save();

    const courseProgress = getCourseProgress(student);

    res.status(200).json({
      message: "Course duration updated successfully",

      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        batch: student.batch,
        joiningDate: student.joiningDate,
        ...durationFields(student),
        courseEndDate: student.courseEndDate,
        enrollmentStatus: student.enrollmentStatus,
        actualExitDate: student.actualExitDate,
        exitReason: student.exitReason,
      },

      courseProgress,
    });
  } catch (error) {
    console.error("Update course duration error:", error);

    res.status(500).json({
      message: "Failed to update course duration",
    });
  }
};

/*
=========================================================
DELETE STUDENT
=========================================================

Primarily intended for test/demo students.

For a real student who leaves Jashna, use
markStudentLeftEarly() to preserve historical records.
=========================================================
*/

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    await Attendance.deleteMany({
      student: student._id,
    });

    await Student.findByIdAndDelete(student._id);

    res.status(200).json({
      message: "Student and related attendance records deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);

    res.status(500).json({
      message: "Failed to delete student",
    });
  }
};