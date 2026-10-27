import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

/*
=========================================================
CONFIG
=========================================================
*/

import { API_URL } from "../config";

const FONT_FAMILY = '"Times New Roman", Times, serif';

/*
=========================================================
DATE HELPERS
=========================================================
*/

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (value, precision = "exact") => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  if (precision === "year") return String(date.getFullYear());

  if (precision === "month") {
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatLongToday = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

const getAdminName = () => {
  try {
    const raw = localStorage.getItem("adminData");

    if (!raw) return "";

    const data = JSON.parse(raw);

    return data?.name || data?.username || "";
  } catch {
    return "";
  }
};

/*
=========================================================
COURSE STATUS CONFIG
(matches AdminStudents)
=========================================================
*/

const COURSE_STATUS = [
  { key: "ongoing", label: "Ongoing", bar: "#49C4A5" },
  { key: "upcoming", label: "Upcoming", bar: "#338DFD" },
  { key: "paused", label: "Paused", bar: "#8B5CF6" },
  { key: "completed", label: "Completed", bar: "#10243E" },
  { key: "left_early", label: "Left early", bar: "#F59E0B" },
];

const ATTENDANCE_TILES = [
  {
    key: "present",
    label: "Present",
    icon: CheckCircle2,
    box: "border-emerald-200 bg-emerald-50",
    icon_: "bg-emerald-100 text-emerald-700",
    num: "text-emerald-700",
  },
  {
    key: "absent",
    label: "Absent",
    icon: XCircle,
    box: "border-red-200 bg-red-50",
    icon_: "bg-red-100 text-red-700",
    num: "text-red-700",
  },
  {
    key: "public_holiday",
    label: "Holiday",
    icon: CalendarDays,
    box: "border-amber-300 bg-amber-50",
    icon_: "bg-amber-100 text-amber-800",
    num: "text-amber-800",
  },
  {
    key: "jashna_leave",
    label: "Jashna Leave",
    icon: Sparkles,
    box: "border-indigo-200 bg-indigo-50",
    icon_: "bg-indigo-100 text-indigo-800",
    num: "text-indigo-800",
  },
];

/*
=========================================================
QUICK ACTIONS
=========================================================
*/

const QUICK_ACTIONS = [
  {
    to: "/admin/students",
    label: "Students",
    hint: "Create accounts, manage courses",
    icon: Users,
    gradient: "linear-gradient(135deg, #338DFD, #38BDF8)",
  },
  {
    to: "/admin/attendance",
    label: "Attendance",
    hint: "Mark today's batch attendance",
    icon: ClipboardCheck,
    gradient: "linear-gradient(135deg, #1FA886, #49C4A5)",
  },
  {
    to: "/admin/activities",
    label: "Activities",
    hint: "Manage learning activities",
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #8B5CF6, #C084FC)",
  },
  {
    to: "/admin/assessments-tasks",
    label: "Assessments & Tasks",
    hint: "Assign and review tasks",
    icon: ClipboardList,
    gradient: "linear-gradient(135deg, #0891B2, #22D3EE)",
  },
  {
    to: "/admin/events",
    label: "Events",
    hint: "Publish workshops and sessions",
    icon: CalendarDays,
    gradient: "linear-gradient(135deg, #9F1239, #E11D48)",
  },
  {
    to: "/admin/challenges",
    label: "Challenges",
    hint: "Create learner challenges",
    icon: Trophy,
    gradient: "linear-gradient(135deg, #EA580C, #FBBF24)",
  },
];

/*
=========================================================
API HELPER

Throws an error with `unauthorized = true` on 401 so the
page can redirect to the login screen.
=========================================================
*/

async function apiGet(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    const authError = new Error("Session expired.");

    authError.unauthorized = true;

    throw authError;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

/*
=========================================================
MAIN PAGE
=========================================================
*/

function AdminDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [failedSections, setFailedSections] = useState([]);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  const today = getLocalDateString();
  const adminName = useMemo(() => getAdminName(), []);

  /*
  =======================================================
  AUTH FAILURE
  =======================================================
  */

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    navigate("/admin/login", { replace: true });
  };

  /*
  =======================================================
  FETCH EVERYTHING
  One failing endpoint should NOT blank the whole page,
  so we use allSettled.
  =======================================================
  */

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setDismissedWarning(false);

    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    const results = await Promise.allSettled([
      apiGet("/api/students", token),
      apiGet("/api/events/admin/all", token),
      apiGet(`/api/attendance?date=${today}`, token),
    ]);

    const unauthorized = results.some(
      (result) => result.status === "rejected" && result.reason?.unauthorized,
    );

    if (unauthorized) {
      handleUnauthorized();
      return;
    }

    const failed = [];

    const [studentsResult, eventsResult, attendanceResult] = results;

    if (studentsResult.status === "fulfilled") {
      setStudents(studentsResult.value?.students || []);
    } else {
      failed.push("students");
    }

    if (eventsResult.status === "fulfilled") {
      setEvents(Array.isArray(eventsResult.value) ? eventsResult.value : []);
    } else {
      failed.push("events");
    }

    if (attendanceResult.status === "fulfilled") {
      setTodayAttendance(attendanceResult.value?.attendance || []);
    } else {
      failed.push("today's attendance");
    }

    setFailedSections(failed);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  =======================================================
  STUDENT STATS
  =======================================================
  */

  const studentStats = useMemo(() => {
    const active = students.filter((student) => student.isActive).length;

    const statusCounts = {
      ongoing: 0,
      upcoming: 0,
      paused: 0,
      completed: 0,
      left_early: 0,
    };

    students.forEach((student) => {
      const status = student.courseProgress?.status;

      if (status && statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }
    });

    return {
      total: students.length,
      active,
      inactive: students.length - active,
      statusCounts,
    };
  }, [students]);

  /*
  =======================================================
  BATCH OVERVIEW
  =======================================================
  */

  const batchOverview = useMemo(() => {
    const map = {};

    students.forEach((student) => {
      const batch = student.batch?.trim() || "Not assigned";

      if (!map[batch]) {
        map[batch] = { batch, total: 0, ongoing: 0 };
      }

      map[batch].total += 1;

      if (student.courseProgress?.status === "ongoing" && student.isActive) {
        map[batch].ongoing += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [students]);

  /*
  =======================================================
  TODAY'S ATTENDANCE
  =======================================================
  */

  const attendanceSummary = useMemo(() => {
    const counts = {
      present: 0,
      absent: 0,
      public_holiday: 0,
      jashna_leave: 0,
    };

    const batchesMarked = new Set();

    todayAttendance.forEach((record) => {
      if (counts[record.status] !== undefined) {
        counts[record.status] += 1;
      }

      const batch = record.batch || record.student?.batch;

      if (batch && batch !== "all") {
        batchesMarked.add(batch.trim());
      }
    });

    const attendedBase = counts.present + counts.absent;

    const presentRate = attendedBase
      ? Math.round((counts.present / attendedBase) * 100)
      : 0;

    return {
      counts,
      batchesMarked,
      presentRate,
      attendedBase,
      total: todayAttendance.length,
    };
  }, [todayAttendance]);

  /*
  Batches that have at least one active, ongoing student
  but no attendance record for today yet.
  */
  const pendingBatches = useMemo(() => {
    const batchesWithOngoing = new Set();

    students.forEach((student) => {
      if (student.isActive && student.courseProgress?.status === "ongoing") {
        const batch = student.batch?.trim();

        if (batch) batchesWithOngoing.add(batch);
      }
    });

    return [...batchesWithOngoing]
      .filter((batch) => !attendanceSummary.batchesMarked.has(batch))
      .sort();
  }, [students, attendanceSummary.batchesMarked]);

  /*
  =======================================================
  EVENT STATS
  =======================================================
  */

  const eventStats = useMemo(() => {
    const published = events.filter((event) => event.status === "published");
    const drafts = events.filter((event) => event.status === "draft");

    const recent = [...events]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);

    return {
      total: events.length,
      published: published.length,
      drafts: drafts.length,
      recent,
    };
  }, [events]);

  const maxBatchTotal = Math.max(1, ...batchOverview.map((item) => item.total));

  /*
  =======================================================
  RENDER
  =======================================================
  */

  return (
    <div
      className="admin-dashboard-root mx-auto max-w-[1500px] pb-14"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <style>{`
        .admin-dashboard-root, .admin-dashboard-root * { font-family: ${FONT_FAMILY} !important; }
        @keyframes ad-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes ad-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(73,196,165,0.6); } 50% { box-shadow: 0 0 0 8px rgba(73,196,165,0); } }
        .ad-hero { background: linear-gradient(120deg, #10243E, #17406E, #1D5C8F, #10243E); background-size: 300% 300%; animation: ad-gradient 14s ease infinite; }
        .ad-live-dot { animation: ad-pulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ad-hero relative isolate mb-8 overflow-hidden rounded-[32px] border-[3px] border-[#2B5C8F] px-7 py-10 text-white shadow-[0_28px_70px_rgba(16,36,62,0.3)] sm:px-10 sm:py-12"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[46px] border-[#338DFD]/20"
        />
        <div className="pointer-events-none absolute -bottom-28 left-[35%] h-72 w-72 rounded-full bg-[#49C4A5]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#8B5CF6]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border-2 border-[#49C4A5]/50 bg-[#49C4A5]/15 px-5 py-2.5 text-[15px] font-extrabold uppercase tracking-[0.14em] text-[#A7F3D0]">
              <span className="ad-live-dot h-2.5 w-2.5 rounded-full bg-[#49C4A5]" />
              {formatLongToday()}
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              {getGreeting()}
              {adminName ? "," : ""}{" "}
              <span className="bg-gradient-to-r from-[#7DD3FC] via-[#A7F3D0] to-[#FDE68A] bg-clip-text text-transparent">
                {adminName || "Admin"}
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[20px] font-semibold leading-8 text-white/85">
              Here is what is happening across Jashna Edu today: learners,
              attendance and events at a glance.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing || loading}
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-[19px] font-extrabold text-[#10243E] shadow-lg transition-shadow hover:shadow-2xl disabled:opacity-60"
          >
            <RefreshCw size={22} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </motion.section>

      {/* =====================================================
          PARTIAL FAILURE WARNING
      ===================================================== */}

      <AnimatePresence>
        {failedSections.length > 0 && !dismissedWarning && (
          <motion.div
            key="warning"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="mb-7 flex items-start gap-4 rounded-2xl border-[3px] border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-lg"
          >
            <AlertTriangle size={26} className="mt-0.5 shrink-0" />

            <p className="flex-1 text-[18px] font-extrabold">
              Could not load: {failedSections.join(", ")}. The rest of the
              dashboard is still up to date. Check that the backend is running
              and try Refresh.
            </p>

            <motion.button
              type="button"
              whileHover={{ rotate: 90, scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setDismissedWarning(true)}
              aria-label="Dismiss warning"
            >
              <X size={22} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-3xl border-[3px] border-[#D5E0EE] bg-white shadow-lg">
          <div className="text-center">
            <Loader2
              size={48}
              className="mx-auto animate-spin text-[#338DFD]"
            />

            <p className="mt-5 text-[22px] font-extrabold text-[#10243E]/60">
              Loading dashboard...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total Students"
              value={studentStats.total}
              hint={`${studentStats.active} active accounts`}
              gradient="linear-gradient(135deg, #338DFD, #38BDF8)"
              shadow="rgba(51,141,253,0.32)"
              to="/admin/students"
            />

            <StatCard
              icon={Clock3}
              label="Ongoing Courses"
              value={studentStats.statusCounts.ongoing}
              hint={`${studentStats.statusCounts.upcoming} upcoming`}
              gradient="linear-gradient(135deg, #1FA886, #49C4A5)"
              shadow="rgba(31,168,134,0.32)"
              to="/admin/students"
            />

            <StatCard
              icon={ClipboardCheck}
              label="Marked Today"
              value={attendanceSummary.total}
              hint={
                pendingBatches.length
                  ? `${pendingBatches.length} batch${pendingBatches.length === 1 ? "" : "es"} pending`
                  : "All batches marked"
              }
              gradient="linear-gradient(135deg, #10243E, #2B5C8F)"
              shadow="rgba(16,36,62,0.32)"
              to="/admin/attendance"
            />

            <StatCard
              icon={CalendarDays}
              label="Published Events"
              value={eventStats.published}
              hint={`${eventStats.drafts} draft${eventStats.drafts === 1 ? "" : "s"}`}
              gradient="linear-gradient(135deg, #9F1239, #E11D48)"
              shadow="rgba(159,18,57,0.32)"
              to="/admin/events"
            />
          </div>

          {/* =================================================
              ATTENDANCE + COURSE STATUS
          ================================================= */}

          <div className="mb-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            {/* TODAY'S ATTENDANCE */}

            <Panel
              icon={<CalendarCheck2 size={24} />}
              title="Today's attendance"
              subtitle={formatLongToday()}
              action={{ label: "Open attendance", to: "/admin/attendance" }}
            >
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {ATTENDANCE_TILES.map((tile) => {
                  const Icon = tile.icon;

                  return (
                    <motion.div
                      key={tile.key}
                      whileHover={{ y: -5, scale: 1.03 }}
                      className={`rounded-2xl border-2 p-4 ${tile.box}`}
                    >
                      <div
                        className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${tile.icon_}`}
                      >
                        <Icon size={22} />
                      </div>

                      <p
                        className={`text-[40px] font-extrabold leading-none ${tile.num}`}
                      >
                        {attendanceSummary.counts[tile.key]}
                      </p>

                      <p className="mt-2 text-[14px] font-extrabold uppercase tracking-[0.1em] text-[#10243E]/60">
                        {tile.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Present rate */}

              <div className="mt-6 rounded-2xl border-2 border-[#E3EAF3] bg-[#F5F9FF] p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[16px] font-extrabold uppercase tracking-[0.1em] text-[#10243E]/60">
                    Present rate today
                  </p>

                  <p className="text-[24px] font-extrabold text-[#10243E]">
                    {attendanceSummary.attendedBase
                      ? `${attendanceSummary.presentRate}%`
                      : "—"}
                  </p>
                </div>

                <div className="h-3.5 overflow-hidden rounded-full bg-[#10243E]/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${attendanceSummary.presentRate}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#338DFD] to-[#49C4A5]"
                  />
                </div>

                <p className="mt-2 text-[15px] font-semibold text-[#10243E]/55">
                  Holidays and Jashna leave are excluded from this rate.
                </p>
              </div>

              {/* Pending batches */}

              <div className="mt-6">
                <p className="mb-3 text-[16px] font-extrabold uppercase tracking-[0.1em] text-[#10243E]/60">
                  Batches still to mark
                </p>

                {pendingBatches.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-[17px] font-extrabold text-emerald-800">
                    <CheckCircle2 size={22} />
                    Nothing pending. Every active batch has attendance for
                    today.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {pendingBatches.map((batch) => (
                      <Link
                        key={batch}
                        to="/admin/attendance"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-[17px] font-extrabold text-amber-900 transition-all hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-md"
                      >
                        <Clock3 size={18} />
                        {batch}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            {/* COURSE STATUS */}

            <Panel
              icon={<ShieldCheck size={24} />}
              title="Course status"
              subtitle="How learners are progressing"
              action={{ label: "Manage students", to: "/admin/students" }}
            >
              {studentStats.total === 0 ? (
                <EmptyNote text="No students yet. Create your first student account." />
              ) : (
                <div className="space-y-5">
                  {COURSE_STATUS.map((item) => {
                    const count = studentStats.statusCounts[item.key];

                    const percent = Math.round(
                      (count / studentStats.total) * 100,
                    );

                    return (
                      <div key={item.key}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-2.5 text-[18px] font-extrabold text-[#10243E]">
                            <span
                              className="h-3.5 w-3.5 rounded-[5px]"
                              style={{ backgroundColor: item.bar }}
                            />
                            {item.label}
                          </span>

                          <span className="text-[18px] font-extrabold text-[#10243E]">
                            {count}
                            <span className="ml-1.5 text-[15px] font-bold text-[#10243E]/45">
                              ({percent}%)
                            </span>
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-[#10243E]/8">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.bar }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between rounded-xl bg-[#10243E]/[0.05] px-4 py-3 text-[16px] font-extrabold text-[#10243E]/70">
                    <span className="flex items-center gap-2">
                      <UserRound size={18} />
                      Inactive accounts
                    </span>

                    <span>{studentStats.inactive}</span>
                  </div>
                </div>
              )}
            </Panel>
          </div>

          {/* =================================================
              BATCH OVERVIEW
          ================================================= */}

          <div className="mb-8">
            <Panel
              icon={<GraduationCap size={24} />}
              title="Batch overview"
              subtitle="Learners per batch"
              action={{ label: "Take attendance", to: "/admin/attendance" }}
            >
              {batchOverview.length === 0 ? (
                <EmptyNote text="Batches will appear once students are assigned to them." />
              ) : (
                <div className="space-y-5">
                  {batchOverview.slice(0, 7).map((item) => (
                    <div key={item.batch}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="truncate text-[18px] font-extrabold text-[#10243E]">
                          {item.batch}
                        </span>

                        <span className="shrink-0 text-[16px] font-extrabold text-[#10243E]/70">
                          {item.total} student{item.total === 1 ? "" : "s"}
                          <span className="ml-2 rounded-md bg-[#49C4A5]/15 px-2 py-0.5 text-[13px] text-[#177A62]">
                            {item.ongoing} ongoing
                          </span>
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-[#10243E]/8">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(item.total / maxBatchTotal) * 100}%`,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#338DFD]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* =================================================
              RECENT EVENTS
          ================================================= */}

          <div className="mb-8">
            <Panel
              icon={<CalendarDays size={24} />}
              title="Recent events"
              subtitle={`${eventStats.total} total, ${eventStats.published} published, ${eventStats.drafts} drafts`}
              action={{ label: "Manage events", to: "/admin/events" }}
              extra={
                <Link
                  to="/admin/events/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#FB923C] px-5 py-2.5 text-[16px] font-extrabold text-[#4A0D24] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Plus size={18} strokeWidth={3} />
                  New event
                </Link>
              }
            >
              {eventStats.recent.length === 0 ? (
                <EmptyNote text="No events yet. Add your first event." />
              ) : (
                <div className="divide-y-2 divide-[#EDF1F7]">
                  {eventStats.recent.map((event) => {
                    const isPublished = event.status === "published";

                    return (
                      <motion.div
                        key={event._id}
                        whileHover={{ x: 4 }}
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] px-3 py-1 text-[12px] font-extrabold uppercase tracking-wider text-[#92400E]">
                              {event.category || "Event"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-[12px] font-extrabold uppercase tracking-wider ${
                                isPublished
                                  ? "bg-[#DDF8E8] text-[#15803D]"
                                  : "bg-[#FFEDD5] text-[#C2410C]"
                              }`}
                            >
                              {event.status}
                            </span>
                          </div>

                          <p className="truncate text-[22px] font-extrabold text-[#10243E]">
                            {event.title}
                          </p>

                          {event.location && (
                            <p className="mt-0.5 flex items-center gap-1.5 text-[16px] font-bold text-[#0E7490]">
                              <MapPin size={16} />
                              <span className="truncate">{event.location}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#FFE4EC] px-4 py-2 text-[16px] font-extrabold text-[#9F1239]">
                          <CalendarDays size={18} />
                          {formatDate(event.date, event.datePrecision)}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div>
            <h2 className="mb-5 text-[30px] font-extrabold text-[#10243E]">
              Quick access
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {QUICK_ACTIONS.map((action, index) => {
                const Icon = action.icon;

                return (
                  <motion.div
                    key={action.to}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to={action.to}
                      className="group flex items-center gap-5 rounded-3xl border-[3px] border-[#D5E0EE] bg-white p-5 shadow-[0_10px_30px_rgba(16,36,62,0.06)] transition-shadow hover:shadow-[0_20px_44px_rgba(16,36,62,0.14)]"
                    >
                      <div
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                        style={{ background: action.gradient }}
                      >
                        <Icon size={28} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[22px] font-extrabold text-[#10243E]">
                          {action.label}
                        </p>

                        <p className="mt-0.5 text-[16px] font-semibold text-[#10243E]/55">
                          {action.hint}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={22}
                        className="shrink-0 text-[#10243E]/35 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#338DFD]"
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/*
=========================================================
STAT CARD (clickable)
=========================================================
*/

function StatCard({ icon: Icon, label, value, hint, gradient, shadow, to }) {
  return (
    <motion.div whileHover={{ y: -8, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Link
        to={to}
        className="relative block overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: gradient, boxShadow: `0 16px 36px ${shadow}` }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
        <div className="pointer-events-none absolute -bottom-10 right-12 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[16px] font-extrabold uppercase tracking-[0.1em] text-white/90">
              {label}
            </p>

            <motion.p
              key={value}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-3 text-6xl font-extrabold leading-none"
            >
              {value}
            </motion.p>

            <p className="mt-3 text-[16px] font-bold text-white/80">{hint}</p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 backdrop-blur">
            <Icon size={27} strokeWidth={2.5} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/*
=========================================================
PANEL
=========================================================
*/

function Panel({ icon, title, subtitle, action, extra, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[28px] border-[3px] border-[#D5E0EE] bg-white shadow-[0_14px_44px_rgba(16,36,62,0.07)]"
    >
      <div className="flex flex-col gap-4 border-b-[3px] border-[#E3EAF3] bg-gradient-to-r from-[#F3F8FF] via-white to-[#F1FBF7] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10243E] text-white shadow-md">
            {icon}
          </div>

          <div>
            <h2 className="text-[26px] font-extrabold leading-tight text-[#10243E]">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-0.5 text-[16px] font-semibold text-[#10243E]/55">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {extra}

          {action && (
            <Link
              to={action.to}
              className="group inline-flex items-center gap-1.5 rounded-xl border-2 border-[#D5E0EE] bg-white px-4 py-2.5 text-[16px] font-extrabold text-[#10243E]/75 transition-all hover:-translate-y-0.5 hover:border-[#338DFD] hover:bg-[#EAF3FF] hover:text-[#1D6FD8]"
            >
              {action.label}
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-7">{children}</div>
    </motion.section>
  );
}

/*
=========================================================
EMPTY NOTE
=========================================================
*/

function EmptyNote({ text }) {
  return (
    <div className="flex min-h-[140px] items-center justify-center rounded-2xl border-2 border-dashed border-[#D5E0EE] bg-[#F8FAFD] px-6 text-center text-[18px] font-bold text-[#10243E]/55">
      {text}
    </div>
  );
}

export default AdminDashboard;
