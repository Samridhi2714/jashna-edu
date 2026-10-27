/*
=========================================================
COURSE DURATION HELPERS  (single source of truth)
=========================================================

Use these in EVERY backend place that deals with course
length: create student, extend course, course progress,
attendance stats, reports.

All maths is done in UTC, because dates are stored at
UTC midnight in MongoDB. This avoids off-by-one-day bugs.
*/

const DAY_MS = 24 * 60 * 60 * 1000;

export const DURATION_UNITS = ["days", "months"];

/* "2026-11-01" | Date | ISO string  ->  Date at UTC midnight */
export const toUTCDate = (value) => {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

/*
Today's calendar date in India, as UTC midnight.
Does NOT depend on the server timezone (same approach as
attendanceController's getTodayKey).
*/
export const todayUTC = () => {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return toUTCDate(key);
};

/*
Read duration from a student, with fallback for OLD records
that only have durationMonths.
*/
export const getDuration = (student) => ({
  value: Number(student.durationValue ?? student.durationMonths ?? 0),
  unit: student.durationUnit || "months",
});

/* Validate value + unit coming from req.body. Returns error string or null */
export const validateDuration = (value, unit) => {
  if (!DURATION_UNITS.includes(unit)) {
    return "Duration unit must be either days or months.";
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    return "Course duration must be a whole number of at least 1.";
  }

  return null;
};

/*
Course end date (inclusive of the joining day).

  1 Nov + 30 days   -> 30 Nov
  1 Nov + 45 days   -> 15 Dec
  1 Nov + 2 months  -> 31 Dec
  31 Jan + 1 month  -> 27/28 Feb   (safe month-end handling)
*/
export const calculateCourseEndDate = (joiningDate, value, unit = "months") => {
  const start = toUTCDate(joiningDate);
  const amount = Number(value);

  if (!start || !Number.isInteger(amount) || amount < 1) return null;

  if (unit === "days") {
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + amount - 1);
    return end;
  }

  const year = start.getUTCFullYear();
  const month = start.getUTCMonth();
  const day = start.getUTCDate();

  const lastDayOfTargetMonth = new Date(
    Date.UTC(year, month + amount + 1, 0),
  ).getUTCDate();

  const end = new Date(
    Date.UTC(year, month + amount, Math.min(day, lastDayOfTargetMonth)),
  );

  end.setUTCDate(end.getUTCDate() - 1);

  return end;
};

const diffDays = (from, to) => Math.round((to.getTime() - from.getTime()) / DAY_MS);

/*
Progress is calculated from DATES, not from "months".
That is why it works for a 30-day workshop and a 12-month
course in exactly the same way.

Returns:
{
  percentage,      // 0-100
  unit,            // "days" | "months"
  current,         // day number or month number
  total,           // total days or total months
  label            // "Day 12/45"  or  "Month 2/6"
}

NOTE: lifecycle status (upcoming / ongoing / paused / completed /
left_early) should stay in your existing progress controller.
Just call this for percentage + label.
*/
export const getCourseProgress = (student, today = todayUTC()) => {
  const start = toUTCDate(student.joiningDate);
  const plannedEnd = toUTCDate(student.courseEndDate);
  const { value, unit } = getDuration(student);

  if (!start || !plannedEnd) {
    return {
      percentage: 0,
      unit,
      current: 0,
      total: value,
      label: "—",
      daysElapsed: 0,
      totalDays: 0,
    };
  }

  /* If student left early, progress is measured up to the exit date */
  const exit = student.actualExitDate ? toUTCDate(student.actualExitDate) : null;
  const end = exit && exit < plannedEnd ? exit : plannedEnd;

  /* Same behaviour as before: a student who left early shows 100% of THEIR journey */
  const totalDays = Math.max(1, diffDays(start, end) + 1);
  const clampedToday = today < start ? start : today > end ? end : today;
  const elapsedDays = today < start ? 0 : diffDays(start, clampedToday) + 1;

  const percentage =
    totalDays <= 0
      ? 0
      : Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  if (unit === "days") {
    const current = Math.min(elapsedDays, value);

    return {
      percentage,
      unit,
      current,
      total: value,
      label: `Day ${current}/${value}`,
      daysElapsed: elapsedDays,
      totalDays,
    };
  }

  const monthsPassed =
    (clampedToday.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (clampedToday.getUTCMonth() - start.getUTCMonth()) -
    (clampedToday.getUTCDate() < start.getUTCDate() ? 1 : 0);

  const current =
    today < start ? 0 : Math.min(Math.max(monthsPassed + 1, 1), value);

  return {
    percentage,
    unit,
    current,
    total: value,
    label: `Month ${current}/${value}`,
    daysElapsed: elapsedDays,
    totalDays,
  };
};