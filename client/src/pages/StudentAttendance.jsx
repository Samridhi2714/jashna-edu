import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  History,
  LogOut,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

/*
=========================================================
STATUS CONFIGURATION
=========================================================
*/

const STATUS_CONFIG = {
  present: {
    label: "Present",
    shortLabel: "Present",
    dot: "bg-emerald-500",
    square: "bg-emerald-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    glow: "rgba(16,185,129,0.35)",
  },

  absent: {
    label: "Absent",
    shortLabel: "Absent",
    dot: "bg-red-500",
    square: "bg-red-500",
    soft: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    glow: "rgba(239,68,68,0.35)",
  },

  /*
  PUBLIC HOLIDAY
  Yellow / amber.
  */

  public_holiday: {
    label: "Public Holiday",
    shortLabel: "Holiday",
    dot: "bg-yellow-400",
    square: "bg-yellow-400",
    soft: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    glow: "rgba(245,158,11,0.35)",
  },

  /*
  JASHNA LEAVE
  Deep navy / indigo.
  */

  jashna_leave: {
    label: "Jashna Leave",
    shortLabel: "Jashna Leave",
    dot: "bg-indigo-700",
    square: "bg-indigo-700",
    soft: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    glow: "rgba(67,56,202,0.35)",
  },
};

/*
=========================================================
DATE HELPERS
=========================================================
*/

function dateKeyFromDate(date) {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(dateKey) {
  if (!dateKey) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

/*
IMPORTANT DATE FIX

There are two different cases:

1. YYYY-MM-DD strings
   -> Treat them as calendar dates in local time.

2. Existing Date objects
   -> They are already being used as local calendar dates
      throughout this component, so DO NOT convert them
      through UTC.

3. ISO strings coming from backend
   -> Extract the UTC calendar date first, because the
      backend stores attendance dates at UTC midnight.
*/

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  /*
  Existing Date object:
  preserve its local calendar date.
  */
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  /*
  YYYY-MM-DD:
  treat it directly as a calendar date.
  */
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseDateKey(value);
  }

  /*
  Backend ISO timestamp:
  attendance dates are stored at UTC midnight,
  so extract the UTC calendar date.
  */
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function addDays(date, amount) {
  const result = new Date(date);

  result.setDate(result.getDate() + amount);

  return result;
}

function getMonday(date) {
  const result = new Date(date);

  const day = result.getDay();

  const offset = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - offset);

  return result;
}

function getSunday(date) {
  const monday = getMonday(date);

  return addDays(monday, 6);
}

function formatDate(dateValue) {
  const date = normalizeDate(dateValue);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDate(dateValue) {
  const date = normalizeDate(dateValue);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMonthLong(date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/*
=========================================================
COURSE DATE HELPERS
=========================================================
*/

function getStudentStartDate(student) {
  if (!student?.joiningDate) {
    return null;
  }

  return normalizeDate(student.joiningDate);
}

function getStudentEndDate(student) {
  if (!student) {
    return null;
  }

  if (student.enrollmentStatus === "left_early" && student.actualExitDate) {
    return normalizeDate(student.actualExitDate);
  }

  if (student.courseEndDate) {
    return normalizeDate(student.courseEndDate);
  }

  return null;
}

/*
=========================================================
MAIN COMPONENT
=========================================================
*/

function StudentAttendance() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);

  const [attendance, setAttendance] = useState([]);

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
  =======================================================
  FETCH ATTENDANCE
  =======================================================
  */

  useEffect(() => {
    const fetchAttendance = async () => {
      const token = localStorage.getItem("studentToken");

      if (!token) {
        navigate("/student/login", {
          replace: true,
        });

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/attendance/student`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch attendance.");
        }

        setStudent(data.student || null);

        setAttendance(data.attendance || []);

        setStats(data.stats || null);
      } catch (err) {
        console.error(err);

        setError(err.message || "Unable to load attendance.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [navigate]);

  /*
  =======================================================
  LOGOUT
  =======================================================
  */

  const handleLogout = () => {
    localStorage.removeItem("studentToken");

    localStorage.removeItem("studentData");

    navigate("/student/login", {
      replace: true,
    });
  };

  /*
  =======================================================
  TODAY
  =======================================================
  */

  const today = useMemo(() => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const todayKey = useMemo(() => dateKeyFromDate(today), [today]);

  /*
  =======================================================
  SAFE STATS
  =======================================================
  */

  const safeStats = useMemo(() => {
    const present = Number(stats?.present || 0);

    const absent = Number(stats?.absent || 0);

    const publicHoliday = Number(stats?.publicHoliday || 0);

    const jashnaLeave = Number(stats?.jashnaLeave || 0);

    const countedClasses = Number(stats?.countedClasses ?? present + absent);

    const percentage = Number(
      stats?.percentage ??
        (countedClasses > 0
          ? ((present / countedClasses) * 100).toFixed(1)
          : 0),
    );

    return {
      present,
      absent,
      publicHoliday,
      jashnaLeave,
      countedClasses,
      percentage,
    };
  }, [stats]);

  /*
  =======================================================
  ATTENDANCE MAP
  =======================================================
  */

  const attendanceMap = useMemo(() => {
    const map = {};

    attendance.forEach((record) => {
      if (!record?.date) {
        return;
      }

      const date = normalizeDate(record.date);

      if (!date) {
        return;
      }

      const key = dateKeyFromDate(date);

      map[key] = record;
    });

    return map;
  }, [attendance]);

  /*
  =======================================================
  COURSE RANGE
  =======================================================
  */

  const courseStartDate = useMemo(
    () => getStudentStartDate(student),
    [student],
  );

  const courseEndDate = useMemo(() => getStudentEndDate(student), [student]);

  /*
  =======================================================
  COURSE TIMELINE
  =======================================================
  */

  const courseTimeline = useMemo(() => {
    if (!courseStartDate) {
      return {
        totalDays: 0,
        elapsedDays: 0,
        percentage: 0,
      };
    }

    const endDate = courseEndDate || today;

    const start = new Date(courseStartDate);

    const end = new Date(endDate);

    const totalDays =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const effectiveToday = today < start ? start : today > end ? end : today;

    const elapsedDays =
      Math.floor(
        (effectiveToday.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    const percentage =
      totalDays <= 0
        ? 0
        : Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    return {
      totalDays,
      elapsedDays,
      percentage,
    };
  }, [courseStartDate, courseEndDate, today]);

  /*
  =======================================================
  MONTHLY ATTENDANCE TIMELINE
  =======================================================
  */

  const courseMonths = useMemo(() => {
    if (!courseStartDate) {
      return [];
    }

    const endDate = courseEndDate || today;

    const months = [];

    let cursor = new Date(
      courseStartDate.getFullYear(),
      courseStartDate.getMonth(),
      1,
    );

    const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (cursor <= lastMonth) {
      const year = cursor.getFullYear();

      const month = cursor.getMonth();

      const firstDay = new Date(year, month, 1);

      const lastDay = new Date(year, month + 1, 0);

      const monthDays = [];

      for (let day = 1; day <= lastDay.getDate(); day += 1) {
        const date = new Date(year, month, day);

        const inCourse = date >= courseStartDate && date <= endDate;

        monthDays.push({
          date,
          dayNumber: day,
          key: dateKeyFromDate(date),
          inCourse,
        });
      }

      months.push({
        key: `${year}-${month}`,
        date: firstDay,
        label: formatMonthLong(firstDay),
        shortLabel: formatMonth(firstDay),
        days: monthDays,
      });

      cursor = new Date(year, month + 1, 1);
    }

    return months;
  }, [courseStartDate, courseEndDate, today]);

  /*
  =======================================================
  PRESENT STREAK
  =======================================================
  */

  const presentStreak = useMemo(() => {
    const sorted = [...attendance]
      .filter((record) => record?.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;

    for (const record of sorted) {
      if (record.status === "present") {
        streak += 1;
        continue;
      }

      if (
        record.status === "public_holiday" ||
        record.status === "jashna_leave"
      ) {
        continue;
      }

      if (record.status === "absent") {
        break;
      }
    }

    return streak;
  }, [attendance]);

  /*
  =======================================================
  MOTIVATIONAL MESSAGE
  =======================================================
  */

  const motivation = useMemo(() => {
    const percentage = safeStats.percentage;

    if (presentStreak >= 5) {
      return {
        eyebrow: "Consistency is showing",
        title: "You're building a real learning rhythm.",
        description:
          "You've recorded five or more present classes in a row. Keep showing up and let consistency compound.",
      };
    }

    if (percentage >= 90) {
      return {
        eyebrow: "Strong consistency",
        title: "Your attendance rhythm is excellent.",
        description:
          "You're maintaining a strong learning routine. Keep protecting that momentum.",
      };
    }

    if (percentage >= 75) {
      return {
        eyebrow: "Good momentum",
        title: "You're building a healthy attendance habit.",
        description:
          "Your regular participation is creating a solid foundation for your learning journey.",
      };
    }

    if (percentage >= 50) {
      return {
        eyebrow: "Keep moving",
        title: "Every class adds another step.",
        description:
          "Showing up consistently gives your learning journey more momentum over time.",
      };
    }

    return {
      eyebrow: "Your journey is underway",
      title: "Every class is a step forward.",
      description:
        "Attendance is one part of your learning journey. Keep building the habit one class at a time.",
    };
  }, [safeStats.percentage, presentStreak]);

  /*
  =======================================================
  RECENT HISTORY
  =======================================================
  */

  const recentAttendance = useMemo(() => {
    return [...attendance]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [attendance]);

  /*
  =======================================================
  COURSE STATUS
  =======================================================
  */

  const courseStatusLabel = useMemo(() => {
    const status = student?.enrollmentStatus;

    const labels = {
      active: "Active course",
      upcoming: "Course upcoming",
      paused: "Course paused",
      completed: "Course completed",
      left_early: "Course ended early",
    };

    return labels[status] || "Learning journey";
  }, [student?.enrollmentStatus]);

  /*
  =======================================================
  LOADING
  =======================================================
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f3] px-5">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#102b4e] shadow-[0_20px_45px_rgba(16,43,78,0.2)]">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/20 border-t-[#61d6bd]" />
          </div>

          <p className="mt-5 text-base font-extrabold text-[#102b4e]">
            Loading your learning journey...
          </p>

          <p className="mt-1 text-sm font-medium text-[#718196]">
            Preparing your attendance history
          </p>
        </div>
      </div>
    );
  }

  /*
  =======================================================
  MAIN UI
  =======================================================
  */

  return (
    <div className="min-h-screen bg-[#f4f6f3] px-4 py-5 text-[#102b4e] sm:px-6 sm:py-7 lg:px-10">
      <div className="mx-auto max-w-[1580px]">
        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-6 flex items-center justify-between gap-4">
          <motion.button
            type="button"
            whileHover={{
              y: -2,
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() => navigate("/student/dashboard")}
            className="group inline-flex items-center gap-2.5 rounded-2xl border border-[#102b4e]/10 bg-white px-5 py-3 text-sm font-extrabold text-[#315779] shadow-[0_8px_25px_rgba(25,45,70,0.05)] transition hover:shadow-lg"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />

            <span>Dashboard</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={handleLogout}
            className="inline-flex items-center gap-2.5 rounded-2xl border border-red-100 bg-white px-5 py-3 text-sm font-extrabold text-red-600 shadow-[0_8px_25px_rgba(25,45,70,0.04)] transition hover:bg-red-50"
          >
            <LogOut size={17} />

            <span>Logout</span>
          </motion.button>
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative mb-6 overflow-hidden rounded-[2.2rem] bg-[#102b4e] px-6 py-7 text-white shadow-[0_28px_80px_rgba(16,43,78,0.18)] sm:px-9 sm:py-9 lg:px-11 lg:py-10"
        >
          <div className="pointer-events-none absolute -right-28 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#338dfd]/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 left-[38%] h-[25rem] w-[25rem] rounded-full bg-[#49c4a5]/14 blur-3xl" />

          <div className="pointer-events-none absolute right-[38%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 grid gap-9 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2">
                <Sparkles size={15} className="text-[#61d6bd]" />

                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/70">
                  Your learning rhythm
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.7rem]">
                {student?.name
                  ? `${student.name}'s attendance journey`
                  : "Your attendance journey"}
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/65 sm:text-lg sm:leading-8">
                A complete visual history of your course attendance — from your
                first class to today. Every recorded day becomes part of your
                learning story.
              </p>

              <div className="mt-7 max-w-2xl rounded-[1.4rem] border border-white/10 bg-white/[0.065] p-5 backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#61d6bd]/15 text-[#61d6bd]">
                    <Sparkles size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#61d6bd]">
                      {motivation.eyebrow}
                    </p>

                    <p className="mt-1.5 text-base font-black text-white sm:text-lg">
                      {motivation.title}
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-white/55">
                      {motivation.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SCORE */}

            <motion.div
              whileHover={{
                y: -4,
              }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.065] p-6 shadow-[0_20px_55px_rgba(0,0,0,0.12)] backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#61d6bd]">
                    Overall attendance
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-white/45">
                    Present classes vs counted classes
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80">
                  <TrendingUp size={18} />
                </div>
              </div>

              <div className="mt-7 flex items-center gap-6">
                <div
                  className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#61d6bd ${
                      safeStats.percentage * 3.6
                    }deg, rgba(255,255,255,0.08) 0deg)`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#102b4e]">
                    <span className="text-3xl font-black tracking-tight text-white">
                      {safeStats.percentage}%
                    </span>

                    <span className="mt-0.5 text-[11px] font-bold text-white/40">
                      attendance
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={17} className="text-[#61d6bd]" />

                    <span className="text-3xl font-black text-white">
                      {safeStats.present}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-bold text-white/50">
                    classes present
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-extrabold text-white/75">
                    <Flame size={16} className="text-yellow-400" />
                    {presentStreak} class streak
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* =================================================
            QUICK STATS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <QuickStat
            label="Present"
            value={safeStats.present}
            icon={<CheckCircle2 size={19} />}
            tone="green"
            description="Classes attended"
          />

          <QuickStat
            label="Absent"
            value={safeStats.absent}
            icon={<XCircle size={19} />}
            tone="red"
            description="Classes missed"
          />

          <QuickStat
            label="Holidays"
            value={safeStats.publicHoliday}
            icon={<CalendarDays size={19} />}
            tone="yellow"
            description="Public holidays"
          />

          <QuickStat
            label="Jashna Leave"
            value={safeStats.jashnaLeave}
            icon={<Sparkles size={19} />}
            tone="navy"
            description="Institute leave"
          />

          <QuickStat
            label="Present Streak"
            value={presentStreak}
            icon={<Flame size={19} />}
            tone="orange"
            description="Consecutive classes"
          />
        </section>

        {/* =================================================
            COURSE JOURNEY
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
          }}
          className="mt-5 overflow-hidden rounded-[1.8rem] border border-[#102b4e]/8 bg-white shadow-[0_18px_55px_rgba(25,45,70,0.06)]"
        >
          <div className="p-6 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2f9] text-[#315779]">
                  <Target size={21} />
                </div>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8290a0]">
                    Course journey
                  </p>

                  <p className="mt-1.5 text-xl font-black tracking-tight text-[#102b4e]">
                    {formatDate(courseStartDate) || "Not available"}

                    <span className="mx-2 text-[#aab5bf]">→</span>

                    {formatDate(courseEndDate) || "Ongoing"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#102b4e] px-3 py-1 text-xs font-extrabold text-white">
                      {courseStatusLabel}
                    </span>

                    {student?.batch && (
                      <span className="rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-bold text-[#52677d]">
                        {student.batch}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full lg:max-w-[680px]">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-[#315779]">
                      Course progress
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-[#91a0ae]">
                      Day {courseTimeline.elapsedDays} of{" "}
                      {courseTimeline.totalDays}
                    </p>
                  </div>

                  <span className="text-2xl font-black text-[#102b4e]">
                    {courseTimeline.percentage}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[#e9eef1]">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${courseTimeline.percentage}%`,
                    }}
                    transition={{
                      duration: 0.9,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-[#338dfd] via-[#4da9e9] to-[#61d6bd]"
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs font-bold text-[#9aa7b3]">
                  <span>{formatShortDate(courseStartDate)}</span>

                  <span>{formatShortDate(courseEndDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            ATTENDANCE MAP
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.14,
          }}
          className="mt-5 overflow-hidden rounded-[1.9rem] border border-[#102b4e]/8 bg-white shadow-[0_20px_60px_rgba(25,45,70,0.07)]"
        >
          {/* HEADER */}

          <div className="border-b border-[#e9edef] px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#102b4e] text-white shadow-[0_10px_25px_rgba(16,43,78,0.16)]">
                  <CalendarDays size={21} />
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight text-[#102b4e]">
                    Attendance map
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-[#8290a0]">
                    Every month has its own visual timeline
                  </p>
                </div>
              </div>

              {/* LEGEND */}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl bg-[#f7f9fa] px-4 py-3">
                <LegendItem color="bg-emerald-500" label="Present" />

                <LegendItem color="bg-red-500" label="Absent" />

                <LegendItem color="bg-yellow-400" label="Holiday" />

                <LegendItem color="bg-indigo-700" label="Jashna leave" />

                <LegendItem color="bg-[#dce3e7]" label="Not recorded" />
              </div>
            </div>
          </div>

          {/* MAP */}

          <div className="px-5 py-7 sm:px-8 sm:py-9">
            {courseMonths.length === 0 ? (
              <div className="rounded-[1.5rem] bg-[#f7f9fa] px-5 py-16 text-center">
                <CalendarDays size={36} className="mx-auto text-[#a0acb6]" />

                <p className="mt-4 text-base font-extrabold text-[#53677c]">
                  Your attendance map will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="min-w-max space-y-5">
                  {courseMonths.map((month, monthIndex) => (
                    <motion.div
                      key={month.key}
                      initial={{
                        opacity: 0,
                        x: -12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: 0.08 + monthIndex * 0.05,
                      }}
                      className="group/month"
                    >
                      {/* MONTH HEADER */}

                      <div className="mb-2.5 flex items-center gap-4">
                        <div className="w-[108px] shrink-0 sm:w-[125px]">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#338dfd] to-[#61d6bd] shadow-[0_0_12px_rgba(51,141,253,0.3)]" />

                            <span className="text-sm font-black tracking-tight text-[#315779]">
                              {month.label}
                            </span>
                          </div>
                        </div>

                        <div className="h-px flex-1 bg-[#edf0f2]" />
                      </div>

                      {/* DAY NUMBERS + BOXES */}

                      <div className="flex items-start gap-2">
                        <div className="w-[108px] shrink-0 sm:w-[125px]">
                          <div className="rounded-xl bg-[#f7f9fa] px-3 py-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9aa7b3]">
                              {month.days.length} days
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-[5px]">
                          {month.days.map((day) => {
                            const record = attendanceMap[day.key];

                            const status = record?.status || null;

                            const config = status
                              ? STATUS_CONFIG[status]
                              : null;

                            const future = day.date > today;

                            const isToday = day.key === todayKey;

                            return (
                              <MonthAttendanceSquare
                                key={day.key}
                                date={day.date}
                                dayNumber={day.dayNumber}
                                record={record}
                                config={config}
                                inCourse={day.inCourse}
                                future={future}
                                isToday={isToday}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* MAP INSIGHT */}

            <div className="mt-8 flex flex-col gap-5 rounded-[1.5rem] border border-[#e8edef] bg-[#f9fbfb] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#102b4e] text-[#61d6bd]">
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="text-base font-black text-[#315779]">
                    {presentStreak > 0
                      ? `You're on a ${presentStreak}-class present streak.`
                      : "Your next class can start the streak."}
                  </p>

                  <p className="mt-1.5 text-sm font-medium leading-6 text-[#81909f]">
                    Small consistent steps create the biggest learning journeys.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#96a2ad]">
                  Counted attendance
                </p>

                <p className="mt-1 text-lg font-black text-[#102b4e]">
                  {safeStats.present} / {safeStats.countedClasses}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            RECENT HISTORY
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="mt-5 overflow-hidden rounded-[1.9rem] border border-[#102b4e]/8 bg-white shadow-[0_20px_60px_rgba(25,45,70,0.06)]"
        >
          <div className="border-b border-[#e9edef] px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2f9] text-[#315779]">
                  <History size={21} />
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight text-[#102b4e]">
                    Recent attendance
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-[#8290a0]">
                    Your latest recorded classes
                  </p>
                </div>
              </div>

              <div className="hidden rounded-xl bg-[#f4f7f8] px-4 py-2 sm:block">
                <span className="text-xs font-extrabold text-[#718196]">
                  Latest 8 records
                </span>
              </div>
            </div>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Clock3 size={36} className="mx-auto text-[#a0acb6]" />

              <h3 className="mt-5 text-lg font-black text-[#315779]">
                No attendance recorded yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#8290a0]">
                Your attendance history will appear here after your classes are
                recorded.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#edf0f2]">
              {recentAttendance.map((record, index) => {
                const config = STATUS_CONFIG[record.status];

                return (
                  <motion.div
                    key={record._id || `${record.date}-${index}`}
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: Math.min(index * 0.035, 0.2),
                    }}
                    whileHover={{
                      backgroundColor: "rgba(247,249,250,0.75)",
                    }}
                    className="flex items-center justify-between gap-5 px-6 py-5 transition sm:px-8"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`h-3.5 w-3.5 shrink-0 rounded-full ${
                          config?.dot || "bg-slate-300"
                        }`}
                      />

                      <div className="min-w-0">
                        <p className="text-base font-black text-[#315779]">
                          {formatDate(record.date)}
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-[#91a0ae]">
                          {record.batch || student?.batch || "Course class"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold ${
                          config?.soft || "bg-gray-50"
                        } ${config?.text || "text-gray-600"} ${
                          config?.border || "border-gray-100"
                        }`}
                      >
                        {config?.label || record.status}
                      </span>

                      <ChevronRight
                        size={17}
                        className="hidden text-[#b0bbc4] sm:block"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="flex items-start gap-3 px-1 pb-8 pt-6">
          <Sparkles size={15} className="mt-0.5 shrink-0 text-[#338dfd]" />

          <p className="max-w-4xl text-sm font-medium leading-6 text-[#7d8c9b]">
            Public holidays and Jashna Edu leave remain part of your course
            history, but they are not counted as absences when calculating your
            attendance percentage.
          </p>
        </div>
      </div>
    </div>
  );
}

/*
=========================================================
MONTH ATTENDANCE SQUARE
=========================================================
*/

function MonthAttendanceSquare({
  date,
  dayNumber,
  record,
  config,
  inCourse,
  future,
  isToday,
}) {
  const statusLabel = config?.label || "Not recorded";

  const tooltipText = !inCourse
    ? "Outside course period"
    : future
      ? "Upcoming"
      : statusLabel;

  /*
  IMPORTANT:
  `date` here is already a local calendar Date created
  from year/month/day.

  formatDate() now preserves those local components,
  so 30 September will correctly show 30 September.
  */

  const formattedDate = formatDate(date);

  return (
    <div className="group relative flex w-[19px] flex-col items-center">
      {/* DAY NUMBER */}

      <span
        className={`mb-1 text-[9px] font-black leading-none ${
          isToday ? "text-[#338dfd]" : "text-[#a1adb7]"
        }`}
      >
        {dayNumber}
      </span>

      {/* BOX */}

      <motion.button
        type="button"
        aria-label={`${formattedDate}: ${tooltipText}`}
        title={`${formattedDate} — ${tooltipText}`}
        whileHover={{
          scale: 1.45,
          y: -2,
        }}
        whileTap={{
          scale: 1.15,
        }}
        className={`relative h-[17px] w-[17px] rounded-[4px] transition-all duration-150 ${
          !inCourse
            ? "bg-[#f0f3f4]"
            : future
              ? "bg-[#e9eef0]"
              : config
                ? config.square
                : "bg-[#dce3e7]"
        } ${
          config && !future ? "shadow-[0_3px_9px_rgba(20,40,60,0.14)]" : ""
        } ${isToday ? "ring-2 ring-[#338dfd]/60 ring-offset-2" : ""}`}
        style={{
          ...(config && !future
            ? {
                "--attendance-glow": config.glow,
              }
            : {}),
        }}
      >
        <span className="sr-only">
          {formattedDate} — {tooltipText}
        </span>
      </motion.button>

      {/* TOOLTIP */}

      <div className="pointer-events-none absolute bottom-[calc(100%+13px)] left-1/2 z-50 hidden w-max max-w-[210px] -translate-x-1/2 rounded-xl bg-[#102b4e] px-3.5 py-2.5 text-center text-xs font-bold text-white shadow-[0_15px_35px_rgba(16,43,78,0.25)] group-hover:block">
        <p>{formattedDate}</p>

        <div className="mt-1 flex items-center justify-center gap-1.5">
          {config && <span className={`h-2 w-2 rounded-full ${config.dot}`} />}

          <span className="text-white/60">{tooltipText}</span>
        </div>
      </div>
    </div>
  );
}

/*
=========================================================
LEGEND
=========================================================
*/

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-[3px] ${color}`} />

      <span className="text-xs font-extrabold text-[#66798b]">{label}</span>
    </div>
  );
}

/*
=========================================================
QUICK STAT
=========================================================
*/

function QuickStat({ label, value, icon, tone, description }) {
  const tones = {
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      number: "text-emerald-700",
      hover: "hover:border-emerald-200",
    },

    red: {
      icon: "bg-red-50 text-red-600",
      number: "text-red-700",
      hover: "hover:border-red-200",
    },

    /*
    PUBLIC HOLIDAY
    Yellow / amber.
    */

    yellow: {
      icon: "bg-amber-50 text-amber-600",
      number: "text-amber-700",
      hover: "hover:border-amber-200",
    },

    navy: {
      icon: "bg-indigo-50 text-indigo-700",
      number: "text-indigo-800",
      hover: "hover:border-indigo-200",
    },

    orange: {
      icon: "bg-orange-50 text-orange-600",
      number: "text-orange-700",
      hover: "hover:border-orange-200",
    },
  };

  const currentTone = tones[tone] || tones.yellow;

  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      whileTap={{
        scale: 0.985,
      }}
      className={`group rounded-[1.4rem] border border-[#102b4e]/8 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(25,45,70,0.045)] transition-all duration-200 hover:shadow-[0_18px_40px_rgba(25,45,70,0.09)] ${currentTone.hover}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8795a3]">
            {label}
          </p>

          <p
            className={`mt-3 text-3xl font-black tracking-tight ${currentTone.number}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentTone.icon}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-2 text-xs font-semibold text-[#9aa7b3]">{description}</p>
    </motion.div>
  );
}

export default StudentAttendance;
