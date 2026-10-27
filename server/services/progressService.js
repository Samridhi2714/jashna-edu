import mongoose from "mongoose";

import Attendance from "../models/Attendance.js";
import Activity from "../models/Activity.js";
import Student from "../models/Student.js";

import {
  toUTCDate,
  todayUTC,
  getDuration,
  getCourseProgress,
} from "../utils/courseDuration.js";

/*
=========================================================
HELPERS
=========================================================
*/

function roundPercentage(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(value.toFixed(1));
}

/*
=========================================================
COURSE JOURNEY

How much of the student's course TIMELINE has elapsed.

This is NOT academic performance.

It now uses utils/courseDuration.js, so it works the same
for a 30-day workshop, a 45-day course and a 12-month
course. The course end date is INCLUSIVE: on the last day
the course is still running, and it becomes "completed"
the day after.

Response shape is unchanged:
  percentage, started, completed, daysElapsed, totalDays

New fields:
  label          "Day 12/45" or "Month 2/6"
  durationValue  45
  durationUnit   "days" | "months"
=========================================================
*/

function calculateCourseJourney(student) {
  const { value, unit } = getDuration(student);

  const start = toUTCDate(student.joiningDate);
  const end = toUTCDate(student.courseEndDate);

  if (!start || !end) {
    return {
      percentage: 0,
      started: false,
      completed: false,
      daysElapsed: 0,
      totalDays: 0,
      label: "—",
      durationValue: value,
      durationUnit: unit,
    };
  }

  const today = todayUTC();

  const progress = getCourseProgress(student, today);

  return {
    percentage: roundPercentage(progress.percentage),

    started: today >= start,

    // End date is inclusive.
    completed: today > end,

    daysElapsed: progress.daysElapsed,
    totalDays: progress.totalDays,

    label: progress.label,

    durationValue: value,
    durationUnit: unit,
  };
}

/*
=========================================================
ATTENDANCE PERFORMANCE

Attendance percentage is calculated only from:

    Present
    Absent

Public holidays and Jashna leave are preserved in the
history but are NOT counted as attended/missed classes.
=========================================================
*/

async function getAttendancePerformance(studentId) {
  const records = await Attendance.find({
    student: studentId,
  })
    .select("date status")
    .sort({ date: 1 })
    .lean();

  let present = 0;
  let absent = 0;
  let publicHoliday = 0;
  let jashnaLeave = 0;

  records.forEach((record) => {
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
  });

  const countedClasses = present + absent;

  const percentage = countedClasses > 0 ? (present / countedClasses) * 100 : 0;

  return {
    percentage: roundPercentage(percentage),

    present,
    absent,

    publicHoliday,
    jashnaLeave,

    countedClasses,

    totalRecords: records.length,

    records: records.map((record) => ({
      date: record.date,
      status: record.status,
    })),
  };
}

/*
=========================================================
WEEKLY ACTIVITY PERFORMANCE

Every weekly Activity record remains permanently stored.
We aggregate ALL recorded weeks for this student.

Example:

Week 1  → 8/10
Week 2  → 7/10
Week 3  → 9/10
Week 4  → 10/10

Performance: 34 / 40 = 85%

Nothing is deleted when a new week starts.
=========================================================
*/

async function getActivityPerformance(studentId) {
  const activities = await Activity.find({
    student: studentId,
  })
    .select(
      "weekKey weekStart marksObtained maxMarks remarks createdAt updatedAt",
    )
    .sort({
      weekStart: 1,
    })
    .lean();

  let totalMarksObtained = 0;
  let totalMaxMarks = 0;

  activities.forEach((activity) => {
    const marksObtained = Number(activity.marksObtained);
    const maxMarks = Number(activity.maxMarks);

    if (
      Number.isFinite(marksObtained) &&
      Number.isFinite(maxMarks) &&
      maxMarks > 0
    ) {
      totalMarksObtained += marksObtained;
      totalMaxMarks += maxMarks;
    }
  });

  const percentage =
    totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;

  return {
    percentage: roundPercentage(percentage),

    totalMarksObtained,
    totalMaxMarks,

    weeksRecorded: activities.length,

    /*
    COMPLETE WEEKLY HISTORY

    The Student Portal can show Week 1, Week 2 ... Week N
    for the whole course (a 6-week workshop simply has
    fewer weeks than a 24-week course).
    */

    weeklyRecords: activities.map((activity) => ({
      weekKey: activity.weekKey,
      weekStart: activity.weekStart,

      marksObtained: activity.marksObtained,
      maxMarks: activity.maxMarks,

      remarks: activity.remarks,

      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    })),
  };
}

/*
=========================================================
MAIN STUDENT PROGRESS ENGINE
=========================================================
*/

export async function getStudentProgress(studentId) {
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student ID.");
  }

  /*
  GET STUDENT

  durationValue / durationUnit are new.
  durationMonths is selected only so OLD records still work
  (getDuration() falls back to it).
  */

  const student = await Student.findById(studentId)
    .select(
      "name username batch isActive joiningDate courseEndDate actualExitDate enrollmentStatus durationValue durationUnit durationMonths",
    )
    .lean();

  if (!student) {
    throw new Error("Student not found.");
  }

  const duration = getDuration(student);

  /* ATTENDANCE */

  const attendance = await getAttendancePerformance(studentId);

  /* WEEKLY ACTIVITIES */

  const activities = await getActivityPerformance(studentId);

  /* COURSE JOURNEY */

  const courseJourney = calculateCourseJourney(student);

  /*
  CURRENT PERFORMANCE

  Based on the complete weekly activity history.
  Future assessment/test modules can be added later
  without changing existing Activity records.
  */

  const performancePercentage = activities.percentage;

  /*
  OVERALL LEARNING PROGRESS

  Internal calculation: Attendance + Performance.
  The frontend should NOT expose the internal weighting.
  */

  const overallProgress =
    attendance.percentage * 0.5 + performancePercentage * 0.5;

  /* FINAL RESPONSE */

  return {
    student: {
      ...student,

      // Always available to the frontend, even for old records.
      durationValue: duration.value,
      durationUnit: duration.unit,
    },

    courseJourney,

    attendance,

    performance: {
      percentage: roundPercentage(performancePercentage),

      activities,

      // Reserved for future modules.
      assessments: null,
      tests: null,
    },

    overallProgress: roundPercentage(overallProgress),
  };
}

export default {
  getStudentProgress,
};