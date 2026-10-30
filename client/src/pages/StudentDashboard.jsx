import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Target,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CEFR_LEVELS, DESCRIPTORS } from "../data/Descriptors";

import { API_URL } from "../config";

const FONT_FAMILY = '"Times New Roman", Times, serif';

/*
=========================================================
ACTIVITY DATE HELPER

Evaluations are MONTHLY now.

Prefer monthStart. Fall back to weekStart (old records)
and createdAt so nothing breaks while the backend Activity
model is being moved from weekly to monthly.
=========================================================
*/

const getActivityDate = (activity) =>
  activity?.monthStart || activity?.weekStart || activity?.createdAt;

function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [activities, setActivities] = useState([]);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showAllActivities, setShowAllActivities] = useState(false);

  /*
  =========================================================
  LOGOUT
  =========================================================
  */

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");

    navigate("/student/login", {
      replace: true,
    });
  };

  /*
  =========================================================
  LOAD DASHBOARD
  =========================================================
  */

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("studentToken");

      if (!token) {
        navigate("/student/login", {
          replace: true,
        });

        return;
      }

      const storedStudent = localStorage.getItem("studentData");

      if (storedStudent) {
        try {
          setStudent(JSON.parse(storedStudent));
        } catch {
          localStorage.removeItem("studentData");
        }
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      /* ATTENDANCE + COURSE */

      const attendanceResponse = await fetch(
        `${API_URL}/api/attendance/student`,
        {
          headers,
        },
      );

      if (attendanceResponse.status === 401) {
        handleLogout();
        return;
      }

      if (!attendanceResponse.ok) {
        throw new Error("Failed to load attendance.");
      }

      const attendanceData = await attendanceResponse.json();

      setAttendance(attendanceData.attendance || []);

      if (attendanceData.course) {
        setCourse(attendanceData.course);
      }

      if (attendanceData.student) {
        setStudent(attendanceData.student);

        localStorage.setItem(
          "studentData",
          JSON.stringify(attendanceData.student),
        );
      }

      /*
      MONTHLY ACTIVITIES

      This endpoint returns the student's complete activity
      history. The chart later uses only the latest 8 records
      for visual clarity, but everything stays available.
      */

      let activityRequestSucceeded = false;

      try {
        const activityResponse = await fetch(
          `${API_URL}/api/activities/student`,
          {
            headers,
          },
        );

        if (activityResponse.status === 401) {
          handleLogout();
          return;
        }

        if (activityResponse.ok) {
          const activityData = await activityResponse.json();

          setActivities(activityData.activities || []);

          activityRequestSucceeded = true;
        } else {
          setActivities([]);
        }
      } catch (activityError) {
        console.error("Activity loading error:", activityError);

        setActivities([]);
      }

      /*
      OVERALL PROGRESS

      Calculated by the backend Progress Engine.
      The internal calculation is intentionally not exposed.
      */

      const progressResponse = await fetch(`${API_URL}/api/progress/student`, {
        headers,
      });

      if (progressResponse.status === 401) {
        handleLogout();
        return;
      }

      if (!progressResponse.ok) {
        throw new Error("Failed to load learning progress.");
      }

      const progressData = await progressResponse.json();

      setProgress(progressData);

      /*
      ACTIVITY HISTORY FALLBACK

      If the dedicated activity request failed, use the
      Progress Engine's weeklyRecords so history is still
      visible.
      */

      if (
        !activityRequestSucceeded &&
        Array.isArray(progressData?.performance?.activities?.weeklyRecords)
      ) {
        setActivities(progressData.performance.activities.weeklyRecords || []);
      }
    } catch (error) {
      console.error("Student dashboard error:", error);

      setError(error.message || "Unable to load your learning progress.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [navigate]);

  /*
  =========================================================
  ATTENDANCE STATS
  =========================================================
  */

  const attendanceStats = useMemo(() => {
    const present = attendance.filter(
      (record) => record.status === "present",
    ).length;

    const absent = attendance.filter(
      (record) => record.status === "absent",
    ).length;

    const publicHoliday = attendance.filter(
      (record) => record.status === "public_holiday",
    ).length;

    const jashnaLeave = attendance.filter(
      (record) => record.status === "jashna_leave",
    ).length;

    const countedDays = present + absent;

    const percentage =
      countedDays > 0 ? Math.round((present / countedDays) * 100) : 0;

    return {
      present,
      absent,
      publicHoliday,
      jashnaLeave,
      countedDays,
      percentage,
    };
  }, [attendance]);

  /*
  =========================================================
  COURSE DURATION (value + unit)

  Works for "45 days" and "6 months".
  Old records only had durationMonths, so we fall back to it.
  =========================================================
  */

  const courseDuration = useMemo(() => {
    const journey = progress?.courseJourney;

    const value =
      journey?.durationValue ??
      progress?.student?.durationValue ??
      student?.durationValue ??
      course?.durationValue ??
      student?.durationMonths ??
      course?.durationMonths ??
      null;

    const unit =
      journey?.durationUnit ||
      progress?.student?.durationUnit ||
      student?.durationUnit ||
      course?.durationUnit ||
      "months";

    return { value: value ? Number(value) : null, unit };
  }, [progress, student, course]);

  const courseDurationText = useMemo(() => {
    if (!courseDuration.value) {
      return "—";
    }

    const label = courseDuration.unit === "days" ? "day" : "month";

    return `${courseDuration.value} ${label}${
      courseDuration.value === 1 ? "" : "s"
    }`;
  }, [courseDuration]);

  /*
  =========================================================
  COURSE PROGRESS

  1st choice: backend Progress Engine (courseJourney).
  It is date based and the end date is inclusive.

  Fallback: calculate from course dates here.
  =========================================================
  */

  const courseProgress = useMemo(() => {
    const journey = progress?.courseJourney;

    if (journey && Number(journey.totalDays) > 0) {
      const totalDays = Number(journey.totalDays);
      const elapsedDays = Number(journey.daysElapsed || 0);

      return {
        percentage: Math.min(
          Math.max(Math.round(Number(journey.percentage) || 0), 0),
          100,
        ),
        elapsedDays,
        totalDays,
        remainingDays: Math.max(totalDays - elapsedDays, 0),
        label: journey.label || "",
      };
    }

    if (!course && !student) {
      return {
        percentage: 0,
        elapsedDays: 0,
        totalDays: 0,
        remainingDays: 0,
        label: "",
      };
    }

    const startDateValue = course?.joiningDate || student?.joiningDate;

    const endDateValue =
      course?.actualEndDate ||
      course?.plannedEndDate ||
      course?.courseEndDate ||
      student?.courseEndDate;

    const startDate = startDateValue ? new Date(startDateValue) : null;

    const endDate = endDateValue ? new Date(endDateValue) : null;

    if (
      !startDate ||
      !endDate ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate < startDate
    ) {
      const backendPercentage = Number.isFinite(
        Number(course?.progressPercentage),
      )
        ? Number(course.progressPercentage)
        : Number.isFinite(Number(course?.percentage))
          ? Number(course.percentage)
          : 0;

      return {
        percentage: Math.min(Math.max(Math.round(backendPercentage), 0), 100),
        elapsedDays: Number(course?.elapsedDays || 0),
        totalDays: Number(course?.totalDays || 0),
        remainingDays: Number(course?.remainingDays || 0),
        label: "",
      };
    }

    const start = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
      ),
    );

    const end = new Date(
      Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate(),
      ),
    );

    const today = new Date();

    const current = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    // End date is inclusive, so +1.
    const totalDays = Math.max(
      Math.round((end - start) / millisecondsPerDay) + 1,
      1,
    );

    if (current < start) {
      return {
        percentage: 0,
        elapsedDays: 0,
        totalDays,
        remainingDays: totalDays,
        label: "",
      };
    }

    if (current > end) {
      return {
        percentage: 100,
        elapsedDays: totalDays,
        totalDays,
        remainingDays: 0,
        label: "",
      };
    }

    const elapsedDays = Math.min(
      Math.max(Math.round((current - start) / millisecondsPerDay) + 1, 0),
      totalDays,
    );

    const remainingDays = Math.max(totalDays - elapsedDays, 0);

    const percentage = Math.min(
      Math.max(Math.round((elapsedDays / totalDays) * 100), 0),
      100,
    );

    return {
      percentage,
      elapsedDays,
      totalDays,
      remainingDays,
      label: "",
    };
  }, [progress, course, student]);

  /*
  =========================================================
  CURRENT LEARNING SNAPSHOT
  =========================================================
  */

  const learningSnapshot = Number(progress?.overallProgress || 0);

  /*
  =========================================================
  ATTENDANCE STREAK
  =========================================================
  */

  const attendanceStreak = useMemo(() => {
    const presentKeys = new Set(
      attendance
        .filter((record) => record.status === "present")
        .map((record) => toDateKey(record.date)),
    );

    if (presentKeys.size === 0) {
      return 0;
    }

    const sorted = [...presentKeys].sort((a, b) => b.localeCompare(a));

    let streak = 1;

    for (let index = 0; index < sorted.length - 1; index++) {
      const current = parseDateKey(sorted[index]);
      const previous = parseDateKey(sorted[index + 1]);

      const difference =
        (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

      if (difference === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [attendance]);

  /*
  =========================================================
  RECENT ATTENDANCE
  =========================================================
  */

  const recentAttendance = useMemo(() => {
    return [...attendance]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [attendance]);

  /*
  =========================================================
  ALL ACTIVITY HISTORY (monthly evaluations)

  We intentionally do NOT slice this list. Every monthly
  evaluation from the beginning of the course stays
  available.
  =========================================================
  */

  const activityHistory = useMemo(() => {
    return [...activities].sort(
      (a, b) => new Date(getActivityDate(b)) - new Date(getActivityDate(a)),
    );
  }, [activities]);

  /*
  =========================================================
  ATTENDANCE TREND
  =========================================================
  */

  const attendanceTrend = useMemo(() => {
    return [...attendance]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-8)
      .map((record) => ({
        date: formatShortDate(record.date),
        value:
          record.status === "present"
            ? 100
            : record.status === "absent"
              ? 0
              : null,
      }));
  }, [attendance]);

  /*
  =========================================================
  LATEST EVALUATION / CEFR SNAPSHOT
  =========================================================
  */

  const latestEvaluation = useMemo(() => {
    const activity = activityHistory[0];
    return activity?.evaluation || null;
  }, [activityHistory]);

  const cefrSnapshot = useMemo(() => {
    if (!latestEvaluation) {
      return null;
    }

    const levels = CEFR_LEVELS;
    const values = Object.values(latestEvaluation).filter((level) =>
      levels.includes(level),
    );

    if (values.length === 0) {
      return null;
    }

    const average =
      values.reduce((sum, level) => sum + levels.indexOf(level) + 1, 0) /
      values.length;

    const overallLevel =
      levels[Math.min(Math.max(Math.round(average) - 1, 0), 5)];

    const skillEntries = Object.entries(latestEvaluation).map(
      ([skill, level]) => ({
        skill,
        level,
        score: levels.indexOf(level) + 1,
        descriptor: DESCRIPTORS?.[skill]?.[level]?.[0] || "",
      }),
    );

    const strongest = [...skillEntries]
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    const improvement = [...skillEntries]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    const latestActivity = activityHistory[0];

    return {
      overallLevel,
      skillEntries,
      strongest,
      improvement,
      evaluationDate: getActivityDate(latestActivity),
      teacherRemarks: latestActivity?.teacherRemarks || "",
    };
  }, [latestEvaluation, activityHistory]);

  const cefrTrend = useMemo(() => {
    return [...activityHistory]
      .slice(0, 8)
      .reverse()
      .map((activity) => {
        const values = Object.values(activity.evaluation || {}).filter(
          (level) => CEFR_LEVELS.includes(level),
        );
        const average = values.length
          ? values.reduce(
              (sum, level) => sum + CEFR_LEVELS.indexOf(level) + 1,
              0,
            ) / values.length
          : 0;
        return {
          date: formatMonthShort(getActivityDate(activity)),
          level: values.length
            ? CEFR_LEVELS[Math.min(Math.max(Math.round(average) - 1, 0), 5)]
            : "—",
          value: average,
        };
      });
  }, [activityHistory]);

  /*
  =========================================================
  EVALUATION PROGRESS

  How many monthly evaluations are done compared with how
  many are expected in this course.
    6-month course  -> 6 expected
    45-day course   -> 2 expected
    30-day course   -> 1 expected
  =========================================================
  */

  const evaluationProgress = useMemo(() => {
    if (!courseDuration.value) {
      return Math.min(activityHistory.length * 10, 100);
    }

    const expectedMonths =
      courseDuration.unit === "months"
        ? courseDuration.value
        : Math.max(1, Math.ceil(courseDuration.value / 30));

    return Math.min((activityHistory.length / expectedMonths) * 100, 100);
  }, [activityHistory.length, courseDuration]);

  /*
  =========================================================
  COURSE STATUS
  =========================================================
  */

  const courseStatus = useMemo(() => {
    const status =
      course?.enrollmentStatus || student?.enrollmentStatus || "ongoing";

    const config = {
      upcoming: {
        label: "Starting soon",
        className: "bg-[#338DFD]/12 text-[#1F5CA3] border-[#338DFD]/25",
      },
      ongoing: {
        label: "Course in progress",
        className: "bg-[#49C4A5]/12 text-[#136553] border-[#49C4A5]/30",
      },
      completed: {
        label: "Course completed",
        className: "bg-[#8B5CF6]/10 text-[#6D2FD6] border-[#8B5CF6]/25",
      },
      left_early: {
        label: "Course ended early",
        className: "bg-[#FF9A3D]/12 text-[#C2620F] border-[#FF9A3D]/30",
      },
      paused: {
        label: "Course paused",
        className: "bg-yellow-50 text-yellow-800 border-yellow-200",
      },
    };

    return (
      config[status] || {
        label: "Student",
        className: "bg-[#102B4E]/5 text-[#102B4E]/70 border-[#102B4E]/10",
      }
    );
  }, [course, student]);

  /*
  =========================================================
  DATE FORMATTERS
  =========================================================
  */

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatShortDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  /* "October 2026" */
  function formatMonthYear(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }

  /* "Oct 26" */
  function formatMonthShort(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
  }

  /*
  =========================================================
  STATUS HELPERS
  =========================================================
  */

  function getStatusLabel(status) {
    const labels = {
      present: "Present",
      absent: "Absent",
      public_holiday: "Public Holiday",
      jashna_leave: "Jashna Leave",
    };

    return labels[status] || status;
  }

  function getStatusIcon(status) {
    if (status === "present") {
      return <CheckCircle2 size={19} />;
    }

    if (status === "absent") {
      return <XCircle size={19} />;
    }

    return <CalendarCheck2 size={19} />;
  }

  function getStatusStyle(status) {
    if (status === "present") {
      return "bg-[#49C4A5]/12 text-[#136553] border-[#49C4A5]/35";
    }

    if (status === "absent") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (status === "public_holiday") {
      return "bg-yellow-50 text-yellow-800 border-yellow-200";
    }

    if (status === "jashna_leave") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }

    return "bg-[#102B4E]/5 text-[#102B4E]/70 border-[#102B4E]/10";
  }

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div
        className="student-dashboard-root min-h-screen bg-[#F5F7FC] px-5 py-16"
        style={{ fontFamily: FONT_FAMILY }}
      >
        <style>{`.student-dashboard-root, .student-dashboard-root * { font-family: ${FONT_FAMILY} !important; }`}</style>

        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-[5px] border-[#102B4E]/10 border-t-[#338DFD]" />

          <p className="mt-6 text-[24px] font-extrabold text-[#102B4E]/70">
            Preparing your learning dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (
    <div
      className="student-dashboard-root min-h-screen overflow-x-hidden bg-gradient-to-b from-[#F5F7FC] via-[#F6F8FC] to-[#F2F7F6] text-[#102B4E]"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <style>{`
        .student-dashboard-root, .student-dashboard-root * { font-family: ${FONT_FAMILY} !important; }
        @keyframes sd-wave { 0%, 60%, 100% { transform: rotate(0deg); } 10%, 30% { transform: rotate(16deg); } 20%, 40% { transform: rotate(-10deg); } 50% { transform: rotate(8deg); } }
        @keyframes sd-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes sd-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(73,196,165,0.55); } 50% { box-shadow: 0 0 0 7px rgba(73,196,165,0); } }
        .sd-wave { display: inline-block; transform-origin: 70% 70%; animation: sd-wave 2.6s ease-in-out infinite; }
        .sd-hero { background: linear-gradient(120deg, #EAF2FF, #FFFFFF, #EEF8F4, #EAF2FF); background-size: 300% 300%; animation: sd-gradient 16s ease infinite; }
        .sd-live-dot { animation: sd-pulse 1.8s ease-in-out infinite; }
      `}</style>

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        {/* TOP BAR */}

        <div className="mb-6 hidden items-center justify-between gap-6 lg:flex">
          <div className="flex h-14 max-w-[540px] flex-1 items-center gap-3 rounded-2xl border-2 border-[#102B4E]/10 bg-white px-5 shadow-sm">
            <span className="sd-live-dot h-2.5 w-2.5 rounded-full bg-[#49C4A5]" />

            <Activity size={22} className="text-[#338DFD]" />

            <span className="text-[19px] font-extrabold text-[#102B4E]/80">
              Your learning dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              type="button"
              onClick={() => loadDashboard(true)}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.93 }}
              className="inline-flex items-center gap-2.5 rounded-xl border-2 border-[#102B4E]/15 bg-white px-5 py-3 text-[17px] font-extrabold text-[#102B4E]/80 shadow-sm transition-colors hover:border-[#102B4E] hover:bg-[#102B4E] hover:text-white"
            >
              <RefreshCw
                size={19}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </motion.button>

            <div className="flex items-center gap-3.5 border-l-2 border-[#102B4E]/10 pl-5">
              <Avatar name={student?.name} />

              <div>
                <p className="text-[19px] font-extrabold text-[#102B4E]">
                  {student?.name || "Student"}
                </p>

                <p className="text-[16px] font-bold text-[#102B4E]/65">
                  Student
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-5 text-[19px] font-extrabold text-red-700 shadow-md"
          >
            {error}
          </motion.div>
        )}

        {/* HERO */}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="sd-hero relative mb-6 overflow-hidden rounded-[30px] border-2 border-[#D9E6F7] px-6 py-8 shadow-[0_18px_50px_rgba(16,43,78,0.09)] sm:px-8 sm:py-10 lg:px-10"
        >
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#338DFD]/20 bg-white/85 px-4 py-2 text-[15px] font-extrabold uppercase tracking-[0.16em] text-[#338DFD] shadow-sm">
                <TrendingUp size={17} />
                Your learning journey
              </div>

              <span
                className={`rounded-full border-2 px-4 py-2 text-[15px] font-extrabold ${courseStatus.className}`}
              >
                {courseStatus.label}
              </span>
            </div>

            <h1 className="mt-5 font-display text-5xl font-extrabold tracking-tight text-[#102B4E] sm:text-6xl lg:text-[4rem]">
              Hi {student?.name?.split(" ")[0] || "Student"}!{" "}
              <span className="sd-wave">👋</span>
            </h1>

            <p className="mt-4 max-w-2xl text-[22px] font-semibold leading-9 text-[#102B4E]/75">
              Your learning journey is built one class, one activity and one
              improvement at a time.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <HeroInfo
                label="Batch"
                value={
                  student?.batch || student?.courseName || "Jashna Edu Program"
                }
              />

              <HeroInfo
                label="Joined"
                value={formatDate(course?.joiningDate || student?.joiningDate)}
              />

              <HeroInfo label="Course duration" value={courseDurationText} />
            </div>
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[38px] border-[#338DFD]/10"
          />

          <div className="absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-[#49C4A5]/15 blur-2xl" />

          <div className="absolute right-12 top-12 hidden text-right lg:block">
            <p className="font-display text-[26px] font-bold italic text-[#102B4E]/70">
              Small progress
            </p>

            <p className="font-display text-[26px] font-bold italic text-[#102B4E]/70">
              adds up.
            </p>
          </div>
        </motion.section>

        {/* KEY METRICS */}

        <section className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Current CEFR Level"
            value={cefrSnapshot?.overallLevel || "—"}
            subtitle={
              cefrSnapshot
                ? "Latest teacher evaluation"
                : "Your first evaluation will appear here"
            }
            icon={<TrendingUp size={24} />}
            tone="blue"
            progress={
              cefrSnapshot
                ? (CEFR_LEVELS.indexOf(cefrSnapshot.overallLevel) + 1) * 16.67
                : 0
            }
          />

          <MetricCard
            title="Attendance"
            value={`${attendanceStats.percentage}%`}
            subtitle={`${attendanceStats.present} present / ${attendanceStats.countedDays} counted`}
            icon={<CalendarCheck2 size={24} />}
            tone="green"
            progress={attendanceStats.percentage}
          />

          <MetricCard
            title="Course Journey"
            value={`${courseProgress.percentage}%`}
            subtitle={
              courseProgress.totalDays > 0
                ? `${courseProgress.label ? `${courseProgress.label} · ` : ""}${courseProgress.elapsedDays} of ${courseProgress.totalDays} days`
                : "Course timeline"
            }
            icon={<Clock3 size={24} />}
            tone="purple"
            progress={courseProgress.percentage}
          />

          <MetricCard
            title="Evaluated Months"
            value={`${activityHistory.length}`}
            subtitle={
              activityHistory.length === 1
                ? "1 monthly evaluation"
                : "Monthly evaluations recorded"
            }
            icon={<Target size={24} />}
            tone="orange"
            progress={evaluationProgress}
          />
        </section>

        {/* MAIN ANALYTICS */}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
          <DashboardCard
            title="CEFR Skill Snapshot"
            subtitle={
              cefrSnapshot
                ? `Latest evaluation · ${formatMonthYear(cefrSnapshot.evaluationDate)}`
                : "Your seven-skill evaluation will appear here."
            }
          >
            {cefrSnapshot ? (
              <CEFRSkillSnapshot skills={cefrSnapshot.skillEntries} />
            ) : (
              <EmptyChartState
                icon={<TrendingUp size={28} />}
                title="No CEFR evaluation yet"
                description="Once your teacher records a monthly evaluation, your skill levels will appear here."
              />
            )}
          </DashboardCard>

          <DashboardCard
            title="Attendance Overview"
            subtitle="Your current recorded attendance."
          >
            <div className="flex flex-col items-center">
              <DonutChart
                percentage={attendanceStats.percentage}
                present={attendanceStats.present}
                absent={attendanceStats.absent}
              />

              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <MiniStat
                  label="Present"
                  value={attendanceStats.present}
                  dot="bg-[#49C4A5]"
                />

                <MiniStat
                  label="Absent"
                  value={attendanceStats.absent}
                  dot="bg-red-400"
                />
              </div>

              <motion.button
                type="button"
                onClick={() => navigate("/student/attendance")}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 inline-flex items-center gap-2 text-[17px] font-extrabold text-[#338DFD] transition-colors hover:text-[#102B4E]"
              >
                Open attendance calendar
                <ArrowRight size={19} />
              </motion.button>
            </div>
          </DashboardCard>
        </section>

        {/* SECONDARY CONTENT */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <DashboardCard
            title="CEFR Progress Over Time"
            subtitle={
              cefrTrend.length > 0
                ? `Latest ${cefrTrend.length} monthly evaluation${cefrTrend.length === 1 ? "" : "s"}`
                : "Your CEFR evaluation history will appear here."
            }
          >
            {cefrTrend.length === 0 ? (
              <EmptyChartState
                icon={<Activity size={28} />}
                title="Evaluation data will appear here"
                description="Your monthly CEFR evaluations will build a clear picture of how your skills are developing."
              />
            ) : (
              <CEFRTrendChart data={cefrTrend} />
            )}
          </DashboardCard>

          <DashboardCard
            title="Recent Attendance"
            subtitle="Your latest recorded class days."
            action={attendance.length > 0 ? "View calendar" : null}
            onAction={
              attendance.length > 0
                ? () => navigate("/student/attendance")
                : null
            }
          >
            {recentAttendance.length === 0 ? (
              <EmptyChartState
                icon={<CalendarCheck2 size={28} />}
                title="No attendance yet"
                description="Attendance records added by the Jashna Edu team will appear here."
              />
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((record, index) => (
                  <AttendanceRow
                    key={record._id}
                    record={record}
                    index={index}
                    formatDate={formatDate}
                    getStatusIcon={getStatusIcon}
                    getStatusLabel={getStatusLabel}
                    getStatusStyle={getStatusStyle}
                  />
                ))}
              </div>
            )}
          </DashboardCard>
        </section>

        {/* ATTENDANCE HEATMAP */}

        <section className="mt-6">
          <DashboardCard
            title="Attendance Activity"
            subtitle="Your recent attendance pattern at a glance."
            action="Open full calendar"
            onAction={() => navigate("/student/attendance")}
          >
            <AttendanceHeatmap attendance={attendance} />
          </DashboardCard>
        </section>

        {/* COMPLETE MONTHLY ACTIVITY HISTORY */}

        <section className="mt-6">
          <DashboardCard
            title="Monthly Activity History"
            subtitle={
              activityHistory.length > 0
                ? `All ${activityHistory.length} recorded monthly ${
                    activityHistory.length === 1 ? "evaluation" : "evaluations"
                  } from your course`
                : "Your complete monthly activity history will appear here."
            }
          >
            {activityHistory.length === 0 ? (
              <EmptyChartState
                icon={<Activity size={28} />}
                title="No monthly activities yet"
                description="Monthly activity evaluations and teacher remarks will appear here once they are recorded."
              />
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#102B4E]/8 bg-[#F7F9FD] px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#49C4A5]/15 text-[#16966f]">
                      <Activity size={25} />
                    </div>

                    <div>
                      <p className="text-[19px] font-extrabold text-[#102B4E]">
                        Course activity record
                      </p>

                      <p className="mt-0.5 text-[16px] font-semibold text-[#102B4E]/70">
                        Your monthly CEFR evaluations remain available
                        throughout your course.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full border-2 border-[#338DFD]/20 bg-white px-4 py-2 text-[16px] font-extrabold text-[#338DFD] shadow-sm">
                    {activityHistory.length}{" "}
                    {activityHistory.length === 1 ? "month" : "months"} recorded
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(showAllActivities
                    ? activityHistory
                    : activityHistory.slice(0, 6)
                  ).map((activity, index) => (
                    <ActivityCard
                      key={
                        activity._id ||
                        activity.monthKey ||
                        activity.weekKey ||
                        `activity-${index}`
                      }
                      activity={activity}
                      index={index}
                      formatMonthYear={formatMonthYear}
                    />
                  ))}
                </div>

                {activityHistory.length > 6 && (
                  <motion.button
                    type="button"
                    onClick={() => setShowAllActivities((value) => !value)}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#338DFD]/20 bg-[#F3F7FD] py-4 text-[18px] font-extrabold text-[#338DFD] transition-colors hover:bg-[#338DFD] hover:text-white"
                  >
                    {showAllActivities
                      ? "Show fewer records"
                      : `View all ${activityHistory.length} records`}
                    <ChevronRight
                      size={21}
                      className={`transition-transform ${
                        showAllActivities ? "rotate-90" : ""
                      }`}
                    />
                  </motion.button>
                )}
              </div>
            )}
          </DashboardCard>
        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-[15px] font-extrabold uppercase tracking-[0.2em] text-[#338DFD]">
              KEEP GOING
            </p>
            <h2 className="mt-1 text-[34px] font-extrabold text-[#102B4E]">
              Keep your learning moving
            </h2>
            <p className="mt-1 text-[19px] font-semibold leading-8 text-[#102B4E]/70">
              Jump straight to the information you want to explore.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              icon={<CalendarCheck2 size={25} />}
              title="View Attendance"
              description="Explore your complete attendance calendar."
              onClick={() => navigate("/student/attendance")}
              tone="blue"
            />

            <QuickAction
              icon={<Activity size={25} />}
              title="Monthly Activities"
              description="See your complete monthly performance history."
              onClick={() => navigate("/student/activities")}
              tone="green"
            />

            <QuickAction
              icon={<RefreshCw size={25} />}
              title="Refresh Portal"
              description="Load the latest records from your student portal."
              onClick={() => loadDashboard(true)}
              tone="purple"
            />
          </div>
        </section>

        {/* FOOTER */}

        <div className="py-10 text-center">
          <p className="font-display text-[22px] font-bold italic text-[#338DFD] sm:text-[26px]">
            Your journey. Our support. A brighter you. ♡
          </p>
        </div>
      </main>
    </div>
  );
}

/*
=========================================================
DATE HELPERS
=========================================================
*/

function toDateKey(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function parseDateKey(key) {
  return new Date(`${key}T00:00:00Z`);
}

/*
=========================================================
MOBILE NAV ITEM
=========================================================
*/

function MobileNavItem({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        items-center
        gap-2
        rounded-xl
        px-4
        py-3
        text-[16px]
        font-extrabold
        transition-colors

        ${
          active
            ? "bg-[#102B4E] text-white"
            : disabled
              ? "bg-[#F5F7FC] text-[#102B4E]/70"
              : "bg-[#F5F7FC] text-[#102B4E]/70 hover:bg-[#E8EEF8]"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

/*
=========================================================
AVATAR
=========================================================
*/

function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <motion.div
      whileHover={{ rotate: 8, scale: 1.1 }}
      className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#338DFD] to-[#6C5CE7] text-[19px] font-extrabold text-white shadow-md"
    >
      {initials}
    </motion.div>
  );
}

/*
=========================================================
HERO INFO
=========================================================
*/

function HeroInfo({ label, value }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      className="rounded-2xl border-2 border-[#102B4E]/8 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg"
    >
      <p className="text-[14px] font-extrabold uppercase tracking-[0.15em] text-[#102B4E]/65">
        {label}
      </p>

      <p className="mt-1 truncate text-[20px] font-extrabold text-[#102B4E]">
        {value}
      </p>
    </motion.div>
  );
}

/*
=========================================================
METRIC CARD
=========================================================
*/

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone,
  progress = 0,
  suffix = "",
}) {
  const toneConfig = {
    blue: {
      icon: "bg-[#338DFD]/12 text-[#338DFD]",
      ring: "#338DFD",
    },
    green: {
      icon: "bg-[#49C4A5]/15 text-[#16966f]",
      ring: "#49C4A5",
    },
    purple: {
      icon: "bg-[#8B5CF6]/12 text-[#7C3AED]",
      ring: "#8B5CF6",
    },
    orange: {
      icon: "bg-[#FF9A3D]/15 text-[#E77716]",
      ring: "#FF9A3D",
    },
  };

  const config = toneConfig[tone] || toneConfig.blue;

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-default overflow-hidden rounded-3xl border-2 border-[#102B4E]/8 bg-white p-6 shadow-[0_10px_32px_rgba(16,43,78,0.06)] transition-shadow hover:shadow-[0_20px_44px_rgba(16,43,78,0.15)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: config.ring }}
      />

      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.icon}`}
        >
          {icon}
        </div>

        <MiniRing percentage={progress} color={config.ring} />
      </div>

      <p className="mt-5 text-[15px] font-extrabold uppercase tracking-[0.14em] text-[#102B4E]/70">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-1">
        <motion.p
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-[48px] font-extrabold leading-tight text-[#102B4E]"
        >
          {value}
        </motion.p>

        {suffix && (
          <span className="text-[16px] font-bold text-[#102B4E]/65">
            {suffix}
          </span>
        )}
      </div>

      <p className="mt-1 text-[17px] font-semibold text-[#102B4E]/70">
        {subtitle}
      </p>
    </motion.div>
  );
}

/*
=========================================================
MINI RING
=========================================================
*/

function MiniRing({ percentage, color }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;

  const safePercentage = Math.min(Math.max(percentage || 0, 0), 100);

  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <svg width="54" height="54" viewBox="0 0 42 42" aria-hidden="true">
      <circle
        cx="21"
        cy="21"
        r={radius}
        fill="none"
        stroke="#102B4E"
        strokeOpacity="0.07"
        strokeWidth="4"
      />

      <motion.circle
        cx="21"
        cy="21"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform="rotate(-90 21 21)"
      />
    </svg>
  );
}

/*
=========================================================
DASHBOARD CARD
=========================================================
*/

function DashboardCard({ title, subtitle, children, action, onAction }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-[26px] border-2 border-[#102B4E]/8 bg-white shadow-[0_12px_38px_rgba(16,43,78,0.06)] transition-shadow hover:shadow-[0_22px_50px_rgba(16,43,78,0.12)]"
    >
      <div className="flex flex-col gap-3 border-b-2 border-[#102B4E]/7 bg-gradient-to-r from-[#F5F9FF] via-white to-[#F6FBF9] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2 className="border-l-[5px] border-[#102B4E] pl-3 text-[28px] font-extrabold leading-tight text-[#102B4E]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1.5 pl-[17px] text-[17px] font-semibold text-[#102B4E]/70">
              {subtitle}
            </p>
          )}
        </div>

        {action && onAction && (
          <motion.button
            type="button"
            onClick={onAction}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-1.5 text-[17px] font-extrabold text-[#338DFD] transition-colors hover:text-[#102B4E]"
          >
            {action}
            <ChevronRight size={19} />
          </motion.button>
        )}
      </div>

      <div className="p-6 sm:p-7">{children}</div>
    </motion.section>
  );
}

/*
=========================================================
JOURNEY STAT
=========================================================
*/

function JourneyStat({ label, value, icon, tone }) {
  const styles = {
    green: "bg-[#49C4A5]/10 text-[#136553]",
    blue: "bg-[#338DFD]/10 text-[#1F5CA3]",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-5 py-4 ${
        styles[tone] || styles.blue
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}

        <span className="text-[15px] font-extrabold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <span className="text-[24px] font-extrabold">{value}</span>
    </div>
  );
}

/*
=========================================================
LEGEND
=========================================================
*/

function Legend({ label, dot }) {
  return (
    <div className="flex items-center gap-2 text-[16px] font-bold text-[#102B4E]/70">
      <span className={`h-3 w-3 rounded-full ${dot}`} />

      {label}
    </div>
  );
}

/*
=========================================================
PROGRESS TREND CHART
=========================================================
*/

function ProgressTrendChart({ attendance, activities, attendancePercentage }) {
  const width = 760;
  const height = 270;

  const paddingLeft = 42;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxLength = Math.max(attendance.length, activities.length, 2);

  const getX = (index) => paddingLeft + (index / (maxLength - 1)) * chartWidth;

  const getY = (value) =>
    paddingTop + chartHeight - (value / 100) * chartHeight;

  const createPoints = (data) =>
    data
      .map((item, index) => {
        if (item.value === null) {
          return null;
        }

        return `${getX(index)},${getY(item.value)}`;
      })
      .filter(Boolean)
      .join(" ");

  const attendancePoints = createPoints(attendance);
  const activityPoints = createPoints(activities);

  return (
    <div className="w-full overflow-hidden">
      {attendance.length === 0 && activities.length === 0 ? (
        <EmptyChartState
          icon={<TrendingUp size={28} />}
          title="Your progress chart is waiting for data"
          description="As attendance and monthly activity records are added, this chart will show your learning trend."
        />
      ) : (
        <>
          <div className="h-[270px] w-full">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              {[0, 25, 50, 75, 100].map((value) => {
                const y = getY(value);

                return (
                  <g key={value}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#102B4E"
                      strokeOpacity="0.07"
                    />

                    <text
                      x="4"
                      y={y + 4}
                      fontSize="10"
                      fill="#102B4E"
                      fillOpacity="0.35"
                    >
                      {value}%
                    </text>
                  </g>
                );
              })}

              {attendancePoints && (
                <>
                  <polyline
                    points={attendancePoints}
                    fill="none"
                    stroke="#338DFD"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {attendance.map(
                    (item, index) =>
                      item.value !== null && (
                        <circle
                          key={`attendance-${index}`}
                          cx={getX(index)}
                          cy={getY(item.value)}
                          r="5"
                          fill="white"
                          stroke="#338DFD"
                          strokeWidth="3"
                        />
                      ),
                  )}
                </>
              )}

              {activityPoints && (
                <>
                  <polyline
                    points={activityPoints}
                    fill="none"
                    stroke="#49C4A5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {activities.map((item, index) => (
                    <circle
                      key={`activity-${index}`}
                      cx={getX(index)}
                      cy={getY(item.value)}
                      r="5"
                      fill="white"
                      stroke="#49C4A5"
                      strokeWidth="3"
                    />
                  ))}
                </>
              )}

              {Array.from({
                length: maxLength,
              }).map((_, index) => {
                const item = attendance[index] || activities[index];

                if (!item) {
                  return null;
                }

                return (
                  <text
                    key={`label-${index}`}
                    x={getX(index)}
                    y={height - 12}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#102B4E"
                    fillOpacity="0.4"
                  >
                    {item.date}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 grid gap-3 rounded-xl bg-[#F7F9FD] px-4 py-3 sm:grid-cols-3">
            <SnapshotValue
              label="Attendance"
              value={`${attendancePercentage}%`}
            />

            <SnapshotValue label="Activity months" value={activities.length} />

            <SnapshotValue label="Recorded days" value={attendance.length} />
          </div>
        </>
      )}
    </div>
  );
}

function SnapshotValue({ label, value }) {
  return (
    <div>
      <p className="text-[14px] font-extrabold uppercase tracking-wider text-[#102B4E]/70">
        {label}
      </p>

      <p className="mt-1 text-[19px] font-extrabold text-[#102B4E]">{value}</p>
    </div>
  );
}

/*
=========================================================
DONUT CHART
=========================================================
*/

function DonutChart({ percentage, present, absent }) {
  const radius = 66;
  const circumference = 2 * Math.PI * radius;

  const safePercentage = Math.min(Math.max(percentage || 0, 0), 100);

  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative flex h-[220px] w-[220px] items-center justify-center">
      <svg viewBox="0 0 180 180" className="h-full w-full">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#102B4E"
          strokeOpacity="0.07"
          strokeWidth="16"
        />

        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#338DFD"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          transform="rotate(-90 90 90)"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-[52px] font-extrabold leading-none text-[#102B4E]">
          {percentage}%
        </p>

        <p className="mt-1.5 text-[18px] font-extrabold text-[#102B4E]/70">
          Attendance
        </p>

        <p className="mt-2 text-[16px] font-semibold text-[#102B4E]/70">
          {present} present · {absent} absent
        </p>
      </div>
    </div>
  );
}

/*
=========================================================
MINI STAT
=========================================================
*/

function MiniStat({ label, value, dot }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.04 }}
      className="rounded-2xl border-2 border-[#102B4E]/7 bg-[#F7F9FD] px-4 py-4"
    >
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${dot}`} />

        <span className="text-[15px] font-extrabold uppercase tracking-wider text-[#102B4E]/70">
          {label}
        </span>
      </div>

      <p className="mt-1 text-[30px] font-extrabold leading-tight text-[#102B4E]">
        {value}
      </p>
    </motion.div>
  );
}

/*
=========================================================
ACTIVITY BAR CHART
=========================================================

Displays only the records passed to it. Older records are
NOT deleted; they remain in Monthly Activity History.
=========================================================
*/

function ActivityBarChart({ data }) {
  return (
    <div className="space-y-5">
      <div className="flex h-[230px] items-end gap-2 overflow-x-auto pb-2 sm:gap-4">
        {data.map((item, index) => (
          <div
            key={`${item.date}-${index}`}
            className="flex h-full min-w-[48px] flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-[16px] font-extrabold text-[#102B4E]/70">
              {item.value}%
            </span>

            <div className="relative flex h-[150px] w-full max-w-[50px] items-end overflow-hidden rounded-t-xl bg-[#102B4E]/5">
              <motion.div
                initial={{
                  height: 0,
                }}
                animate={{
                  height: `${item.value}%`,
                }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.05,
                }}
                className="w-full rounded-t-xl bg-gradient-to-t from-[#49C4A5] to-[#338DFD]"
              />
            </div>

            <span className="whitespace-nowrap text-[15px] font-bold text-[#102B4E]/70">
              {item.date}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-[#49C4A5]/10 px-5 py-4">
        <p className="text-[14px] font-extrabold uppercase tracking-wider text-[#136553]">
          Activity insight
        </p>

        <p className="mt-1 text-[17px] font-semibold leading-relaxed text-[#102B4E]/75">
          This chart shows your latest monthly scores. Your complete activity
          history remains available below.
        </p>
      </div>
    </div>
  );
}

/*
=========================================================
ATTENDANCE ROW
=========================================================
*/

function AttendanceRow({
  record,
  index = 0,
  formatDate,
  getStatusIcon,
  getStatusLabel,
  getStatusStyle,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ x: 6, scale: 1.01 }}
      className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#102B4E]/6 bg-[#F8F9FC] px-5 py-4 transition-colors hover:border-[#338DFD]/30 hover:bg-[#EEF5FF]"
    >
      <div className="min-w-0">
        <p className="text-[19px] font-extrabold text-[#102B4E]">
          {formatDate(record.date)}
        </p>

        <p className="mt-0.5 truncate text-[16px] font-semibold text-[#102B4E]/65">
          {record.batch || "Jashna Edu"}
        </p>
      </div>

      <div
        className={`inline-flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2 text-[15px] font-extrabold ${getStatusStyle(
          record.status,
        )}`}
      >
        {getStatusIcon(record.status)}
        {getStatusLabel(record.status)}
      </div>
    </motion.div>
  );
}

/*
=========================================================
ATTENDANCE HEATMAP

Compact dashboard preview (8 complete Sunday -> Saturday
weeks). The full calendar lives on /student/attendance.
=========================================================
*/

function AttendanceHeatmap({ attendance }) {
  const attendanceMap = useMemo(() => {
    const map = new Map();

    attendance.forEach((record) => {
      map.set(toDateKey(record.date), record.status);
    });

    return map;
  }, [attendance]);

  const days = useMemo(() => {
    const result = [];

    const today = new Date();

    const todayUtc = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );

    const currentWeekDay = todayUtc.getUTCDay();

    const currentWeekSunday = new Date(todayUtc);

    currentWeekSunday.setUTCDate(
      currentWeekSunday.getUTCDate() - currentWeekDay,
    );

    const firstWeekSunday = new Date(currentWeekSunday);

    firstWeekSunday.setUTCDate(firstWeekSunday.getUTCDate() - 49);

    for (let index = 0; index < 56; index++) {
      const cursor = new Date(firstWeekSunday);

      cursor.setUTCDate(cursor.getUTCDate() + index);

      result.push(toDateKey(cursor));
    }

    return result;
  }, []);

  if (attendance.length === 0) {
    return (
      <EmptyChartState
        icon={<CalendarCheck2 size={28} />}
        title="Your attendance calendar is waiting"
        description="Your attendance pattern will appear here once classes are marked."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[20px] font-extrabold text-[#102B4E]">
            Recent 8 weeks
          </p>

          <p className="mt-1 text-[16px] font-semibold text-[#102B4E]/70">
            Each square represents one calendar day.
          </p>
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          <HeatmapLegend label="Present" className="bg-[#49C4A5]" />
          <HeatmapLegend label="Absent" className="bg-red-400" />
          <HeatmapLegend label="Public Holiday" className="bg-yellow-400" />
          <HeatmapLegend label="Jashna Leave" className="bg-indigo-400" />
          <HeatmapLegend label="Not marked" className="bg-[#E5E9F0]" />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="grid min-w-[650px] grid-cols-[36px_repeat(8,minmax(0,1fr))] gap-2">
          <div />

          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={`week-${index}`}
              className="text-center text-[15px] font-extrabold text-[#102B4E]/70"
            >
              {index + 1}
            </span>
          ))}

          {["S", "M", "T", "W", "T", "F", "S"].map((day, dayIndex) => (
            <div key={`${day}-${dayIndex}`} className="contents">
              <span className="flex h-7 items-center text-[16px] font-extrabold text-[#102B4E]/70">
                {day}
              </span>

              {Array.from({ length: 8 }).map((_, weekIndex) => {
                const targetIndex = weekIndex * 7 + dayIndex;

                const key = days[targetIndex];

                const status = key ? attendanceMap.get(key) : null;

                return (
                  <HeatmapSquare
                    key={`${dayIndex}-${weekIndex}`}
                    dateKey={key}
                    status={status}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 sm:hidden">
        <HeatmapLegend label="Present" className="bg-[#49C4A5]" />
        <HeatmapLegend label="Absent" className="bg-red-400" />
        <HeatmapLegend label="Public Holiday" className="bg-yellow-400" />
        <HeatmapLegend label="Jashna Leave" className="bg-indigo-400" />
        <HeatmapLegend label="Not marked" className="bg-[#E5E9F0]" />
      </div>

      <motion.button
        type="button"
        onClick={() => window.location.assign("/student/attendance")}
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 inline-flex items-center gap-2 text-[17px] font-extrabold text-[#338DFD] transition-colors hover:text-[#102B4E]"
      >
        Explore complete attendance calendar
        <ArrowRight size={19} />
      </motion.button>
    </div>
  );
}

/*
=========================================================
HEATMAP SQUARE
=========================================================
*/

function HeatmapSquare({ dateKey, status }) {
  const styles = {
    present: "bg-[#49C4A5]",
    absent: "bg-red-400",
    public_holiday: "bg-yellow-400",
    jashna_leave: "bg-indigo-400",
  };

  const title = {
    present: "Present",
    absent: "Absent",
    public_holiday: "Public Holiday",
    jashna_leave: "Jashna Leave",
  };

  const formattedDate = dateKey
    ? new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const tooltip = dateKey
    ? `${formattedDate} · ${title[status] || "Not marked"}`
    : "Not marked";

  return (
    <div
      title={tooltip}
      className={`h-7 w-full min-w-0 cursor-pointer rounded-[6px] shadow-sm transition-all duration-200 hover:z-10 hover:scale-[1.25] hover:shadow-lg ${
        styles[status] || "bg-[#E7EAF0]"
      }`}
    />
  );
}

function HeatmapLegend({ label, className }) {
  return (
    <div className="flex items-center gap-2 text-[15px] font-bold text-[#102B4E]/70">
      <span className={`h-3.5 w-3.5 rounded-[4px] ${className}`} />
      {label}
    </div>
  );
}

/*
=========================================================
ACTIVITY CARD (monthly evaluation)
=========================================================
*/

function ActivityCard({ activity, index = 0, formatMonthYear }) {
  const skills = Object.entries(activity.evaluation || {});

  const values = skills
    .map(([, level]) => CEFR_LEVELS.indexOf(level) + 1)
    .filter((value) => value > 0);

  const average = values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

  const overallLevel = values.length
    ? CEFR_LEVELS[Math.min(Math.max(Math.round(average) - 1, 0), 5)]
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay: Math.min((index % 6) * 0.05, 0.25) }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl border-2 border-[#102B4E]/8 bg-[#F8F9FC] p-5 transition-shadow hover:border-[#338DFD]/30 hover:shadow-[0_18px_40px_rgba(16,43,78,0.13)]"
    >
      <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#338DFD] to-[#49C4A5]" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#49C4A5]/15 text-[#16966f] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
          <Activity size={24} />
        </div>

        <span className="rounded-full border-2 border-[#338DFD]/20 bg-white px-4 py-1.5 text-[18px] font-extrabold text-[#338DFD] shadow-sm">
          {overallLevel}
        </span>
      </div>

      <p className="mt-4 text-[22px] font-extrabold text-[#102B4E]">
        Monthly Evaluation
      </p>

      <p className="mt-1 text-[16px] font-bold text-[#102B4E]/65">
        {formatMonthYear(getActivityDate(activity))}
      </p>

      {skills.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {skills.map(([skill, level]) => (
            <div
              key={skill}
              className="flex items-center justify-between rounded-xl border border-[#102B4E]/6 bg-white px-3 py-2.5"
            >
              <span className="truncate text-[15px] font-bold capitalize text-[#102B4E]/75">
                {skill}
              </span>
              <span className="ml-2 rounded-md bg-[#EAF2FF] px-2 py-0.5 text-[15px] font-extrabold text-[#1F5CA3]">
                {level}
              </span>
            </div>
          ))}
        </div>
      )}

      {activity.teacherRemarks && (
        <div className="mt-4 border-t-2 border-[#102B4E]/7 pt-4">
          <p className="text-[14px] font-extrabold uppercase tracking-wider text-[#338DFD]">
            Teacher feedback
          </p>
          <p className="mt-1 text-[17px] font-semibold leading-relaxed text-[#102B4E]/75">
            {activity.teacherRemarks}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/*
=========================================================
CEFR SKILL SNAPSHOT
=========================================================
*/

function CEFRSkillSnapshot({ skills }) {
  return (
    <div className="space-y-4">
      {skills.map(({ skill, level, score }, index) => (
        <motion.div
          key={skill}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.35) }}
          whileHover={{ x: 5 }}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[19px] font-extrabold capitalize text-[#102B4E]">
              {skill}
            </span>
            <span className="rounded-full border-2 border-[#338DFD]/20 bg-[#EAF2FF] px-3.5 py-1 text-[16px] font-extrabold text-[#1F5CA3]">
              {level}
            </span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-[#102B4E]/8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score / 6) * 100}%` }}
              transition={{ duration: 0.75, delay: index * 0.05 }}
              className="h-full rounded-full bg-gradient-to-r from-[#338DFD] to-[#49C4A5]"
            />
          </div>
        </motion.div>
      ))}

      <p className="pt-2 text-[16px] font-semibold leading-relaxed text-[#102B4E]/65">
        Levels shown here are the latest teacher-selected CEFR levels for each
        skill.
      </p>
    </div>
  );
}

/*
=========================================================
CEFR TREND CHART
=========================================================
*/

function CEFRTrendChart({ data }) {
  return (
    <div className="space-y-5">
      <div className="flex h-[220px] items-end gap-3 overflow-x-auto pb-2 sm:gap-5">
        {data.map((item, index) => (
          <div
            key={`${item.date}-${index}`}
            className="group flex h-full min-w-[52px] flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-[17px] font-extrabold text-[#102B4E]/80">
              {item.level}
            </span>
            <div className="relative flex h-[135px] w-full max-w-[54px] items-end overflow-hidden rounded-t-xl bg-[#102B4E]/6 transition-transform duration-200 group-hover:scale-105">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / 6) * 100}%` }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="w-full rounded-t-xl bg-gradient-to-t from-[#49C4A5] to-[#338DFD]"
              />
            </div>
            <span className="whitespace-nowrap text-[15px] font-bold text-[#102B4E]/70">
              {item.date}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-[#338DFD]/15 bg-[#EAF2FF] px-5 py-4">
        <p className="text-[14px] font-extrabold uppercase tracking-wider text-[#1F5CA3]">
          Evaluation trend
        </p>
        <p className="mt-1 text-[17px] font-semibold leading-relaxed text-[#102B4E]/75">
          This view summarizes the seven skill levels recorded in each monthly
          evaluation.
        </p>
      </div>
    </div>
  );
}

/*
=========================================================
QUICK ACTION
=========================================================
*/

function QuickAction({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  tone = "blue",
}) {
  const tones = {
    blue: {
      icon: "bg-[#338DFD] text-white",
      border: "hover:border-[#338DFD]/50",
    },
    green: {
      icon: "bg-[#49C4A5] text-white",
      border: "hover:border-[#49C4A5]/60",
    },
    purple: {
      icon: "bg-[#8B5CF6] text-white",
      border: "hover:border-[#8B5CF6]/50",
    },
    orange: {
      icon: "bg-[#FF9A3D] text-white",
      border: "hover:border-[#FF9A3D]/50",
    },
  };

  const config = tones[tone] || tones.blue;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -8, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={`
        group
        rounded-3xl
        border-2
        border-[#102B4E]/8
        bg-white
        p-6
        text-left
        shadow-[0_8px_26px_rgba(16,43,78,0.05)]
        transition-shadow

        ${
          disabled
            ? "cursor-default opacity-60"
            : `${config.border} hover:shadow-[0_20px_44px_rgba(16,43,78,0.14)]`
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${config.icon}`}
        >
          {icon}
        </div>

        {!disabled && (
          <ArrowRight
            size={24}
            className="text-[#102B4E]/50 transition-all duration-200 group-hover:translate-x-1.5 group-hover:text-[#338DFD]"
          />
        )}
      </div>

      <h3 className="mt-5 text-[24px] font-extrabold text-[#102B4E]">
        {title}
      </h3>

      <p className="mt-1.5 text-[18px] font-semibold leading-relaxed text-[#102B4E]/70">
        {description}
      </p>
    </motion.button>
  );
}

/*
=========================================================
EMPTY CHART STATE
=========================================================
*/

function EmptyChartState({ icon, title, description }) {
  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center px-5 py-10 text-center">
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102B4E] text-white shadow-lg"
      >
        {icon}
      </motion.div>

      <h3 className="mt-5 text-[24px] font-extrabold text-[#102B4E]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-[18px] font-semibold leading-relaxed text-[#102B4E]/70">
        {description}
      </p>
    </div>
  );
}

export default StudentDashboard;