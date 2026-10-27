import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Target,
  Search,
  Users,
  CheckCircle2,
  Clock3,
  Sparkles,
  X,
  UserRound,
  BookOpen,
  MessageCircle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  TrendingUp,
  ClipboardList,
  CircleDashed,
  ListChecks,
  Filter,
  UserCheck,
} from "lucide-react";
import {
  getLastSeenAt,
  getRecordTime,
  markLearningGoalsSeen,
  sortByLatest,
} from "../hooks/useLearningGoalsNotifications";

const API_URL = "http://localhost:5000";
const FONT_FAMILY = '"Times New Roman", Times, serif';
const FIELD_CLASS =
  "w-full rounded-xl border-2 border-[#D9E1EC] bg-white px-4 py-3.5 text-[17px] font-bold text-[#10243E] outline-none transition-all duration-200 placeholder:font-semibold placeholder:text-[#8A97A8] hover:border-[#8DB8F7] hover:shadow-md focus:border-[#338DFD] focus:shadow-lg focus:ring-4 focus:ring-[#338DFD]/15";
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #338DFD, #38BDF8)",
  "linear-gradient(135deg, #49C4A5, #34D399)",
  "linear-gradient(135deg, #8B5CF6, #C084FC)",
  "linear-gradient(135deg, #F59E0B, #FBBF24)",
  "linear-gradient(135deg, #0891B2, #22D3EE)",
  "linear-gradient(135deg, #1D4ED8, #818CF8)",
];
const getAvatarGradient = (name = "?") => {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
};

/* ========================= DATE HELPERS ========================= */
const formatDate = (date) => {
  if (!date) return "Not submitted";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "Date unavailable";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";
  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ========================= NORMALIZE API DATA ========================= */
const normalizeRecords = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.goals)) return data.goals;
  if (Array.isArray(data?.learningGoals)) return data.learningGoals;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeStudents = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/* ========================= STUDENT DETAILS ========================= */
const getStudent = (record) => {
  if (record?.__student) return record.__student;
  return record?.studentId && typeof record.studentId === "object"
    ? record.studentId
    : record?.student && typeof record.student === "object"
      ? record.student
      : {};
};

const getStudentId = (record) => {
  const student = getStudent(record);
  const id =
    student?._id ||
    record?.studentId?._id ||
    record?.studentId ||
    record?.student?._id ||
    record?._id;
  return id ? String(id) : "";
};

const getStudentName = (record) => {
  const student = getStudent(record);
  return student?.name || record?.studentName || "Unknown student";
};

const getStudentUsername = (record) => {
  const student = getStudent(record);
  return student?.username || record?.username || "No username";
};

const getStudentBatch = (record) => {
  const student = getStudent(record);
  const value = student?.batch || record?.batch;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object") {
    return (
      value.name ||
      value.batchName ||
      value.timing ||
      value.label ||
      "Batch not assigned"
    );
  }
  return "Batch not assigned";
};

const getAssessment = (record) => record?.initialAssessment || {};
const getCurrentGoals = (record) => record?.currentGoals || {};

/* ========================= SKILL / CHALLENGE HELPERS ========================= */
const getArray = (value) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim())
    : [];

const getNotes = (value) => (typeof value === "string" ? value.trim() : "");

/* An initial assessment counts as recorded only when it has a submission date,
   at least one target skill and at least one current challenge. */
const hasCompleteInitialAssessment = (record) => {
  const initial = getAssessment(record);
  return (
    Boolean(initial.submittedAt) &&
    getArray(initial.targetSkills).length > 0 &&
    getArray(initial.currentChallenges).length > 0
  );
};

const hasCurrentGoals = (record) => {
  const current = getCurrentGoals(record);
  return (
    getArray(current.targetSkills).length > 0 ||
    getArray(current.currentChallenges).length > 0 ||
    Boolean(getNotes(current.additionalNotes))
  );
};

const getInitialStatus = (record) => {
  const initial = getAssessment(record);
  const hasSkills = getArray(initial.targetSkills).length > 0;
  const hasChallenges = getArray(initial.currentChallenges).length > 0;

  if (hasCompleteInitialAssessment(record)) {
    return { label: "Initial goals recorded", tone: "green" };
  }
  if (!initial.submittedAt && !hasSkills && !hasChallenges) {
    return { label: "Not submitted", tone: "amber" };
  }
  if (!hasSkills && !hasChallenges) {
    return { label: "Initial data missing", tone: "amber" };
  }
  return { label: "Initial assessment incomplete", tone: "amber" };
};

/* ========================= GOAL UPDATES (NEWEST -> OLDEST) =========================
   Numbering is chronological (oldest = 1), but the list is returned newest first.
   If a student has current goals but no history snapshots (data saved before
   history tracking existed), the current goals are shown as "Goal update 1". */
const getUpdateSnapshots = (record) => {
  const history = Array.isArray(record?.__goalRecord?.history)
    ? record.__goalRecord.history
    : [];

  let snapshots = history;

  if (snapshots.length === 0 && hasCurrentGoals(record)) {
    const current = getCurrentGoals(record);
    snapshots = [
      {
        _id: "current-fallback",
        targetSkills: current.targetSkills,
        currentChallenges: current.currentChallenges,
        additionalNotes: current.additionalNotes,
        updatedAt: current.updatedAt || record?.updatedAt || null,
      },
    ];
  }

  const time = (item) => new Date(item?.updatedAt || 0).getTime() || 0;

  return [...snapshots]
    .sort((a, b) => time(a) - time(b)) // oldest -> newest to assign numbers
    .map((snapshot, index) => ({ ...snapshot, number: index + 1 }))
    .reverse(); // newest -> oldest for display
};

/* ========================= MAIN COMPONENT ========================= */
function AdminLearningGoals() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all-active");
  const [batchFilter, setBatchFilter] = useState("all-batches");
  const [expandedRecords, setExpandedRecords] = useState({});
  const [previousSeenAt, setPreviousSeenAt] = useState(0);

  // Unique batch names from the active students.
  const batchOptions = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => getStudentBatch(student))
          .filter((batch) => batch && batch !== "Batch not assigned"),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [students]);

  /* ========== FETCH ACTIVE STUDENTS + LEARNING GOALS ========== */
  const fetchLearningGoals = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error(
          "Your admin session was not found. Please log in again.",
        );
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [studentsResponse, goalsResponse] = await Promise.all([
        fetch(`${API_URL}/api/students`, { method: "GET", headers }),
        fetch(`${API_URL}/api/student-learning-goals/admin`, {
          method: "GET",
          headers,
        }),
      ]);

      const [studentsData, goalsData] = await Promise.all([
        studentsResponse.json().catch(() => ({})),
        goalsResponse.json().catch(() => ({})),
      ]);

      if (!studentsResponse.ok) {
        throw new Error(studentsData.message || "Unable to load students.");
      }
      if (!goalsResponse.ok) {
        throw new Error(
          goalsData.message || "Unable to load student learning goals.",
        );
      }

      const loadedStudents = normalizeStudents(studentsData);
      const loadedRecords = sortByLatest(normalizeRecords(goalsData));

      const activeStudents = loadedStudents.filter(
        (student) => student?.isActive === true,
      );

      if (!silent) {
        setPreviousSeenAt(getLastSeenAt());
      }

      setStudents(activeStudents);
      setRecords(loadedRecords);
      markLearningGoalsSeen(loadedRecords);
    } catch (err) {
      console.error("Fetch learning goals error:", err);
      setError(err.message || "Something went wrong while loading the data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLearningGoals();
  }, [fetchLearningGoals]);

  /* ========== JOIN STUDENTS WITH THEIR GOALS RECORDS ========== */
  const studentRows = useMemo(() => {
    const recordsByStudentId = new Map();
    records.forEach((record) => {
      const studentId = getStudentId(record);
      if (studentId) recordsByStudentId.set(studentId, record);
    });

    return students.map((student) => {
      const studentId = String(student._id);
      const goalRecord = recordsByStudentId.get(studentId) || null;

      return {
        _id: studentId,
        __student: student,
        __goalRecord: goalRecord,
        student,
        initialAssessment: goalRecord?.initialAssessment || {},
        currentGoals: goalRecord?.currentGoals || {},
        createdAt: goalRecord?.createdAt || null,
        updatedAt: goalRecord?.updatedAt || null,
        hasGoalRecord: Boolean(goalRecord),
      };
    });
  }, [students, records]);

  /* ========== DASHBOARD STATISTICS ========== */
  const totalStudents = studentRows.length;
  const submittedCount = studentRows.filter(hasCompleteInitialAssessment).length;
  const pendingCount = totalStudents - submittedCount;
  const updatedCount = studentRows.filter(
    (record) => getUpdateSnapshots(record).length > 0,
  ).length;

  /* ========== SEARCH + FILTERS ========== */
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return studentRows
      .filter((record) => {
        const name = getStudentName(record).toLowerCase();
        const username = getStudentUsername(record).toLowerCase();
        // Keep the ORIGINAL batch text for exact comparison with the dropdown,
        // and a lowercase copy only for searching.
        const rawBatch = getStudentBatch(record);
        const batchLower = rawBatch.toLowerCase();
        const initial = getAssessment(record);
        const current = getCurrentGoals(record);

        const updateContent = getUpdateSnapshots(record).flatMap((snapshot) => [
          ...getArray(snapshot.targetSkills),
          ...getArray(snapshot.currentChallenges),
          getNotes(snapshot.additionalNotes),
        ]);

        const searchableContent = [
          ...getArray(initial.targetSkills),
          ...getArray(initial.currentChallenges),
          getNotes(initial.additionalNotes),
          ...getArray(current.targetSkills),
          ...getArray(current.currentChallenges),
          getNotes(current.additionalNotes),
          ...updateContent,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          name.includes(query) ||
          username.includes(query) ||
          batchLower.includes(query) ||
          searchableContent.includes(query);

        const matchesBatch =
          batchFilter === "all-batches" || rawBatch === batchFilter;

        const recorded = hasCompleteInitialAssessment(record);
        const hasUpdates = getUpdateSnapshots(record).length > 0;

        let matchesFilter = true;
        switch (filter) {
          case "initial-recorded":
            matchesFilter = recorded;
            break;
          case "initial-pending":
            matchesFilter = !recorded;
            break;
          case "current-updated":
            matchesFilter = hasUpdates;
            break;
          case "all-active":
          default:
            matchesFilter = true;
            break;
        }

        return matchesSearch && matchesFilter && matchesBatch;
      })
      .sort((a, b) => {
        const timeA =
          getRecordTime(a.__goalRecord || {}) ||
          new Date(
            a.student?.joiningDate || a.student?.createdAt || 0,
          ).getTime() ||
          0;
        const timeB =
          getRecordTime(b.__goalRecord || {}) ||
          new Date(
            b.student?.joiningDate || b.student?.createdAt || 0,
          ).getTime() ||
          0;
        return timeB - timeA;
      });
  }, [studentRows, search, filter, batchFilter]);

  /* ========== EXPAND / COLLAPSE ========== */
  const toggleExpanded = (id) => {
    setExpandedRecords((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const expandAll = () => {
    const next = {};
    filteredRecords.forEach((record) => {
      next[getStudentId(record)] = true;
    });
    setExpandedRecords(next);
  };

  const collapseAll = () => setExpandedRecords({});

  const allExpanded =
    filteredRecords.length > 0 &&
    filteredRecords.every((record) => expandedRecords[getStudentId(record)]);

  const filterLabels = {
    "all-active": "All active students",
    "initial-recorded": "Initial goals recorded",
    "initial-pending": "Initial goals pending",
    "current-updated": "Goal updates available",
  };

  /* ========== RENDER ========== */
  return (
    <div
      className="admin-learning-goals-root min-h-screen bg-gradient-to-b from-[#F8F6EF] via-[#F3F7FC] to-[#EEF8F4]"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <style>{`
        .admin-learning-goals-root, .admin-learning-goals-root * { font-family: ${FONT_FAMILY} !important; }
        .alg-hero { background: linear-gradient(120deg, #10243E, #17406E, #1D5C8F, #10243E); background-size: 300% 300%; animation: alg-gradient 14s ease infinite; }
        @keyframes alg-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes alg-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .alg-float { animation: alg-float 3s ease-in-out infinite; }
        .alg-skill { overflow-wrap: anywhere; }
      `}</style>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alg-hero relative isolate overflow-hidden rounded-[28px] border-[3px] border-[#2B5C8F] px-6 py-9 text-white shadow-[0_28px_70px_rgba(16,36,62,0.25)] sm:rounded-[32px] sm:px-10 sm:py-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
            className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[42px] border-[#338DFD]/20 sm:h-80 sm:w-80"
          />
          <div className="pointer-events-none absolute -bottom-24 left-[32%] h-64 w-64 rounded-full bg-[#49C4A5]/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 top-12 h-48 w-48 rounded-full bg-[#8B5CF6]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="mb-5 inline-flex items-center gap-3 rounded-full border-2 border-[#49C4A5]/50 bg-[#49C4A5]/15 px-4 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#A7F3D0] sm:px-5 sm:text-[15px]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#49C4A5]" />
                <Sparkles size={18} /> Student Development
              </motion.div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Learning{" "}
                <span className="bg-gradient-to-r from-[#7DD3FC] via-[#A7F3D0] to-[#FDE68A] bg-clip-text text-transparent">
                  Goals
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-[18px] font-semibold leading-8 text-white/85 sm:text-[20px]">
                Understand every learner&apos;s starting point, identify missing
                assessments, and follow how each active student&apos;s goals
                change over time.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-[15px] font-bold text-white/90">
                  <BookOpen size={18} className="text-[#7DD3FC]" /> Initial
                  assessment
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-[15px] font-bold text-white/90">
                  <TrendingUp size={18} className="text-[#A7F3D0]" /> Goal
                  updates
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-[15px] font-bold text-white/90">
                  <UserCheck size={18} className="text-[#FDE68A]" /> Active
                  student tracking
                </span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => fetchLearningGoals({ silent: true })}
              disabled={loading || refreshing}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl border-2 border-white/25 bg-white/10 px-6 py-4 text-[18px] font-extrabold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={21}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh data"}
            </motion.button>
          </div>
        </motion.section>

        {/* CLICKABLE DASHBOARD CARDS */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Active Students"
            value={totalStudents}
            accent="blue"
            selected={filter === "all-active"}
            description="View every active student"
            onClick={() => setFilter("all-active")}
          />
          <StatCard
            icon={CheckCircle2}
            label="Initial Goals Recorded"
            value={submittedCount}
            accent="green"
            selected={filter === "initial-recorded"}
            description="Skills and challenges recorded"
            onClick={() => setFilter("initial-recorded")}
          />
          <StatCard
            icon={Clock3}
            label="Initial Goals Pending"
            value={pendingCount}
            accent="purple"
            selected={filter === "initial-pending"}
            description="Missing or incomplete initial data"
            onClick={() => setFilter("initial-pending")}
          />
          <StatCard
            icon={TrendingUp}
            label="Goals Updated"
            value={updatedCount}
            accent="navy"
            selected={filter === "current-updated"}
            description="Students with at least one goal update"
            onClick={() => setFilter("current-updated")}
          />
        </div>

        {/* ERROR */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-start justify-between gap-4 rounded-2xl border-[3px] border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4 text-[17px] font-bold text-red-700 shadow-md sm:text-[19px]"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={23} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="shrink-0 rounded-lg p-1 transition-colors hover:bg-red-100"
              >
                <X size={22} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STUDENT RECORDS */}
        <section className="mt-7 overflow-hidden rounded-[26px] border-[3px] border-[#D5E0EE] bg-white shadow-[0_18px_60px_rgba(16,36,62,0.09)] sm:rounded-[30px]">
          {/* TOOLBAR */}
          <div className="border-b-[3px] border-[#E3EAF3] bg-gradient-to-r from-[#F3F8FF] via-white to-[#F1FBF7] p-4 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Filter size={22} className="text-[#338DFD]" />
                  <h2 className="text-2xl font-extrabold text-[#10243E] sm:text-3xl">
                    {filterLabels[filter] || "Active students"}
                  </h2>
                  <span className="rounded-full border border-[#338DFD]/20 bg-[#EAF3FF] px-3 py-1 text-sm font-extrabold text-[#1D6FD8]">
                    {filteredRecords.length}
                  </span>
                </div>
                <p className="mt-2 text-[15px] font-semibold leading-6 text-[#10243E]/60 sm:text-[16px]">
                  Select a dashboard card to change the list. Students without a
                  learning-goals record are included in the pending list.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all-active");
                    setBatchFilter("all-batches");
                  }}
                  className={`rounded-xl border-2 px-4 py-3 text-[15px] font-extrabold transition ${filter === "all-active" ? "border-[#338DFD] bg-[#EAF3FF] text-[#1D6FD8]" : "border-[#D5E0EE] bg-white text-[#10243E] hover:border-[#338DFD]"}`}
                >
                  Show all active students
                </button>

                <label className="flex min-w-[220px] flex-col gap-1.5 text-left">
                  <span className="text-[12px] font-extrabold uppercase tracking-wide text-[#10243E]/55">
                    Filter by batch
                  </span>
                  <select
                    value={batchFilter}
                    onChange={(event) => setBatchFilter(event.target.value)}
                    className="rounded-xl border-2 border-[#D5E0EE] bg-white px-4 py-3 text-[15px] font-extrabold text-[#10243E] outline-none transition hover:border-[#338DFD] focus:border-[#338DFD] focus:ring-4 focus:ring-[#338DFD]/15"
                  >
                    <option value="all-batches">All batches</option>
                    {batchOptions.map((batchName) => (
                      <option key={batchName} value={batchName}>
                        {batchName}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={allExpanded ? collapseAll : expandAll}
                  disabled={filteredRecords.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#D5E0EE] bg-white px-4 py-3 text-[16px] font-extrabold text-[#10243E] transition-all hover:border-[#338DFD] hover:bg-[#EAF3FF] hover:text-[#1D6FD8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ClipboardList size={19} />
                  {allExpanded ? "Collapse all" : "Expand all"}
                </button>
              </div>
            </div>

            <div className="relative mt-5">
              <Search
                size={23}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, username, batch, skill or challenge..."
                className={`${FIELD_CLASS} pl-12`}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 text-[15px] font-bold text-[#10243E]/65 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing{" "}
                <span className="rounded-md bg-[#E3EFFF] px-2 py-1 font-extrabold text-[#1D6FD8]">
                  {filteredRecords.length}
                </span>{" "}
                of{" "}
                <span className="rounded-md bg-[#E2F7F0] px-2 py-1 font-extrabold text-[#177A62]">
                  {totalStudents}
                </span>{" "}
                active students
              </p>
              <p className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#49C4A5]" />
                Read-only student learning information
              </p>
            </div>
          </div>

          {/* LOADING / ERROR / EMPTY / LIST */}
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center px-5 py-12">
              <div className="text-center">
                <div className="mx-auto h-14 w-14 animate-spin rounded-full border-[5px] border-[#338DFD]/15 border-t-[#338DFD]" />
                <p className="mt-5 text-[21px] font-extrabold text-[#10243E]/70">
                  Loading active students...
                </p>
                <p className="mt-2 text-[16px] font-semibold text-[#10243E]/50">
                  Fetching student and learning-goals records from Jashna Edu.
                </p>
              </div>
            </div>
          ) : error && students.length === 0 && records.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
                <AlertCircle size={36} />
              </div>
              <h2 className="mt-5 text-3xl font-extrabold text-[#10243E]">
                Unable to load student records
              </h2>
              <p className="mt-3 max-w-lg text-[17px] font-semibold leading-7 text-[#10243E]/60">
                Check that your backend is running, your admin session is valid,
                and both student and learning-goals endpoints are available.
              </p>
              <button
                type="button"
                onClick={() => fetchLearningGoals()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#338DFD] to-[#49C4A5] px-6 py-3.5 text-[17px] font-extrabold text-white shadow-lg transition hover:shadow-xl"
              >
                <RefreshCw size={19} /> Try again
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center"
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                className="alg-float flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#338DFD] to-[#49C4A5] text-white shadow-xl"
              >
                {students.length === 0 ? (
                  <Users size={43} />
                ) : (
                  <Search size={43} />
                )}
              </motion.div>
              <h2 className="mt-6 text-3xl font-extrabold text-[#10243E] sm:text-4xl">
                {students.length === 0
                  ? "No active students found"
                  : "No matching students"}
              </h2>
              <p className="mt-3 max-w-xl text-[17px] font-semibold leading-8 text-[#10243E]/60 sm:text-[19px]">
                {students.length === 0
                  ? "No students with an active account were returned by the students endpoint."
                  : "Try another search term or select a different dashboard card."}
              </p>
              {(search ||
                filter !== "all-active" ||
                batchFilter !== "all-batches") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all-active");
                    setBatchFilter("all-batches");
                  }}
                  className="mt-5 rounded-xl border-2 border-[#D5E0EE] bg-white px-5 py-3 text-[16px] font-extrabold text-[#1D6FD8] transition hover:bg-[#EAF3FF]"
                >
                  Show all active students
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-5 bg-[#F7FAFD] p-4 sm:p-6">
              {filteredRecords.map((record, index) => {
                const studentId = getStudentId(record) || `student-${index}`;
                const studentName = getStudentName(record);
                const username = getStudentUsername(record);
                const batch = getStudentBatch(record);
                const initial = getAssessment(record);
                const initialSkills = getArray(initial.targetSkills);
                const initialChallenges = getArray(initial.currentChallenges);
                const initialNotes = getNotes(initial.additionalNotes);
                const initialStatus = getInitialStatus(record);
                const updates = getUpdateSnapshots(record);
                const isNewUpdate =
                  Boolean(record.__goalRecord) &&
                  getRecordTime(record.__goalRecord) > previousSeenAt;
                const isExpanded = Boolean(expandedRecords[studentId]);
                const profileImage = getStudent(record)?.profileImage;

                return (
                  <motion.article
                    key={studentId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.035, 0.3),
                      duration: 0.3,
                    }}
                    className="overflow-hidden rounded-[24px] border-2 border-[#D5E0EE] bg-white shadow-[0_8px_28px_rgba(16,36,62,0.06)] transition-all duration-300 hover:border-[#AFCBF0] hover:shadow-[0_15px_40px_rgba(16,36,62,0.11)] sm:rounded-[28px]"
                  >
                    {/* STUDENT HEADER */}
                    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={studentName}
                            className="h-16 w-16 shrink-0 rounded-2xl border-2 border-[#D5E0EE] object-cover shadow-md sm:h-[72px] sm:w-[72px]"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-md sm:h-[72px] sm:w-[72px]"
                            style={{ background: getAvatarGradient(studentName) }}
                          >
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h2 className="break-words text-[24px] font-extrabold leading-tight text-[#10243E] sm:text-[28px]">
                            {studentName}
                          </h2>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#10243E]/5 px-2.5 py-1.5 text-[14px] font-bold text-[#10243E]/70">
                              <UserRound size={15} /> {username}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F1ECFE] px-2.5 py-1.5 text-[14px] font-extrabold text-[#6D3FD0]">
                              <GraduationCap size={16} /> {batch}
                            </span>
                          </div>
                          {!record.hasGoalRecord && (
                            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[13px] font-extrabold text-amber-800">
                              <CircleDashed size={15} /> No learning-goals record
                              yet
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {isNewUpdate && (
                          <StatusBadge label="New update" tone="blue" />
                        )}
                        <StatusBadge
                          label={initialStatus.label}
                          tone={initialStatus.tone}
                        />
                        {updates.length > 0 && (
                          <StatusBadge
                            label={`${updates.length} goal ${updates.length === 1 ? "update" : "updates"}`}
                            tone="green"
                          />
                        )}
                        <motion.button
                          type="button"
                          onClick={() => toggleExpanded(studentId)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#338DFD] to-[#49C4A5] px-4 py-3 text-[16px] font-extrabold text-white shadow-md transition hover:shadow-lg"
                        >
                          {isExpanded ? "Hide details" : "View details"}
                          {isExpanded ? (
                            <ChevronUp size={19} />
                          ) : (
                            <ChevronDown size={19} />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* SUMMARY STRIP */}
                    <div className="grid gap-3 border-t-2 border-[#EDF1F7] bg-gradient-to-r from-[#F3F8FF] to-[#F1FBF7] p-4 sm:grid-cols-3 sm:p-5">
                      <SummaryItem
                        icon={Target}
                        label="Initial skills"
                        value={initialSkills.length}
                        accent="blue"
                      />
                      <SummaryItem
                        icon={MessageCircle}
                        label="Initial challenges"
                        value={initialChallenges.length}
                        accent="purple"
                      />
                      <SummaryItem
                        icon={TrendingUp}
                        label="Goal updates"
                        value={updates.length}
                        accent="green"
                      />
                    </div>

                    {/* EXPANDED DETAILS: Initial column + Goal updates (newest -> oldest) */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                          className="overflow-hidden"
                        >
                          <div className="grid items-start gap-5 border-t-2 border-[#E3EAF3] p-4 sm:p-6 xl:grid-cols-2">
                            <GoalSection
                              title="Initial Learning Assessment"
                              subtitle="What the student originally shared"
                              icon={BookOpen}
                              tone="blue"
                              dateLabel="Initial submission"
                              date={initial.submittedAt}
                              skills={initialSkills}
                              challenges={initialChallenges}
                              notes={initialNotes}
                              emptyMessage={
                                !record.hasGoalRecord
                                  ? "This student has not created a learning-goals record yet. Their initial skills and challenges have not been recorded."
                                  : "No initial assessment details have been saved for this record."
                              }
                            />
                            <GoalUpdates updates={updates} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTNOTE */}
        {!loading && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-[#D5E0EE] bg-white/80 p-4 text-[15px] font-semibold leading-6 text-[#10243E]/65 sm:p-5 sm:text-[16px]">
            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0 text-[#338DFD]"
            />
            <p>
              <strong className="text-[#10243E]">Important:</strong> The
              dashboard includes all active students, even if they have never
              saved learning goals. Initial goals are counted as recorded only
              when both target skills and current challenges are present. Goal
              updates are listed from newest to oldest and never replace the
              original assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================= CLICKABLE STAT CARD ========================= */
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  description,
  selected,
  onClick,
}) {
  const styles = {
    blue: {
      gradient: "linear-gradient(135deg, #338DFD, #38BDF8)",
      shadow: "rgba(51,141,253,0.28)",
      selectedRing: "rgba(51,141,253,0.55)",
    },
    green: {
      gradient: "linear-gradient(135deg, #1FA886, #49C4A5)",
      shadow: "rgba(31,168,134,0.28)",
      selectedRing: "rgba(31,168,134,0.55)",
    },
    navy: {
      gradient: "linear-gradient(135deg, #10243E, #2B5C8F)",
      shadow: "rgba(16,36,62,0.28)",
      selectedRing: "rgba(16,36,62,0.55)",
    },
    purple: {
      gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
      shadow: "rgba(124,58,237,0.25)",
      selectedRing: "rgba(124,58,237,0.55)",
    },
  };
  const style = styles[accent] || styles.blue;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={Boolean(selected)}
      className="relative w-full cursor-pointer overflow-hidden rounded-3xl p-5 text-left text-white transition-all sm:p-6"
      style={{
        background: style.gradient,
        boxShadow: selected
          ? `0 0 0 4px ${style.selectedRing}, 0 18px 40px ${style.shadow}`
          : `0 16px 36px ${style.shadow}`,
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15" />
      <div className="pointer-events-none absolute -bottom-10 right-12 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-white/90 sm:text-[15px]">
            {label}
          </p>
          <motion.p
            key={value}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-3 text-5xl font-extrabold leading-none sm:text-6xl"
          >
            {value}
          </motion.p>
          <p className="mt-3 text-[14px] font-bold leading-5 text-white/85 sm:text-[15px]">
            {description}
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur sm:h-14 sm:w-14">
          <Icon size={25} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-2 text-[13px] font-extrabold text-white/90">
        {selected ? (
          <>
            <CheckCircle2 size={17} /> Currently viewing
          </>
        ) : (
          <>
            <ListChecks size={17} /> Click to view list
          </>
        )}
      </div>
    </motion.button>
  );
}

/* ========================= SUMMARY ITEM ========================= */
function SummaryItem({ icon: Icon, label, value, accent }) {
  const styles = {
    blue: { icon: "bg-[#338DFD]/12 text-[#1D6FD8]", number: "text-[#1D6FD8]" },
    purple: {
      icon: "bg-[#8B5CF6]/12 text-[#7C3AED]",
      number: "text-[#7C3AED]",
    },
    green: { icon: "bg-[#49C4A5]/15 text-[#177A62]", number: "text-[#177A62]" },
  };
  const style = styles[accent] || styles.blue;

  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E3EAF3] bg-white p-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#10243E]/55">
          {label}
        </p>
        <p className={`mt-1 text-2xl font-extrabold ${style.number}`}>{value}</p>
      </div>
    </div>
  );
}

/* ========================= STATUS BADGE ========================= */
function StatusBadge({ label, tone }) {
  const styles = {
    green: "border-[#49C4A5]/30 bg-[#49C4A5]/12 text-[#177A62]",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-[#338DFD]/30 bg-[#338DFD]/12 text-[#1D6FD8]",
  };
  const dots = {
    green: "bg-[#49C4A5]",
    amber: "bg-amber-500",
    blue: "bg-[#338DFD]",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 text-[13px] font-extrabold sm:text-[14px] ${styles[tone] || styles.green}`}
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${dots[tone] || dots.green}`}
      />
      {label}
    </span>
  );
}

/* ========================= INITIAL GOAL SECTION ========================= */
function GoalSection({
  title,
  subtitle,
  icon: Icon,
  tone,
  dateLabel,
  date,
  skills,
  challenges,
  notes,
  emptyMessage,
}) {
  const isBlue = tone === "blue";
  const theme = isBlue
    ? {
        border: "border-[#338DFD]/25",
        headingBackground: "linear-gradient(135deg, #10243E, #1D5C8F)",
        accent: "text-[#1D6FD8]",
        skill: "border-[#338DFD]/20 bg-[#EAF3FF] text-[#174C96]",
        challenge: "border-[#8B5CF6]/20 bg-[#F3EDFF] text-[#6D3FD0]",
        note: "border-[#338DFD]/20 bg-[#F3F8FF]",
      }
    : {
        border: "border-[#49C4A5]/35",
        headingBackground: "linear-gradient(135deg, #126B59, #1FA886)",
        accent: "text-[#177A62]",
        skill: "border-[#49C4A5]/25 bg-[#E2F7F0] text-[#176D58]",
        challenge: "border-[#F59E0B]/25 bg-amber-50 text-amber-800",
        note: "border-[#49C4A5]/25 bg-[#F0FBF6]",
      };

  const hasData = skills.length > 0 || challenges.length > 0 || Boolean(notes);

  return (
    <section className={`overflow-hidden rounded-2xl border-2 ${theme.border}`}>
      <div
        className="p-5"
        style={{ background: theme.headingBackground, color: "#FFFFFF" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
          >
            <Icon size={25} />
          </div>
          <div className="min-w-0">
            <h3
              className="break-words text-[22px] font-extrabold leading-tight sm:text-[25px]"
              style={{ color: "#FFFFFF" }}
            >
              {title}
            </h3>
            <p
              className="mt-1 text-[15px] font-semibold leading-6"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[14px] font-bold">
          <span
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}
          >
            <CalendarDays size={16} /> {dateLabel}: {formatDate(date)}
          </span>
        </div>
      </div>

      <div className="space-y-5 bg-white p-4 sm:p-5">
        {!hasData ? (
          <div className="rounded-xl border-2 border-dashed border-[#D5E0EE] bg-[#F8FAFD] px-4 py-7 text-center">
            <Target size={30} className="mx-auto text-[#10243E]/30" />
            <p className="mt-3 text-[16px] font-bold leading-7 text-[#10243E]/60">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <>
            <TagGroup
              title="Target skills"
              items={skills}
              emptyLabel="No target skills selected"
              badgeClass={theme.skill}
            />
            <TagGroup
              title="Learning challenges"
              items={challenges}
              emptyLabel="No challenges recorded"
              badgeClass={theme.challenge}
            />
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-[0.1em] text-[#10243E]/60">
                <MessageCircle size={17} className={theme.accent} /> Additional
                notes
              </h4>
              {notes ? (
                <div
                  className={`whitespace-pre-wrap break-words rounded-xl border-2 p-4 text-[16px] font-semibold leading-7 text-[#10243E]/80 ${theme.note}`}
                >
                  {notes}
                </div>
              ) : (
                <p className="rounded-xl bg-[#F7F9FC] px-4 py-3 text-[15px] font-semibold text-[#10243E]/45">
                  No additional notes
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ========================= GOAL UPDATES (NEWEST -> OLDEST) ========================= */
function GoalUpdates({ updates = [] }) {
  // Only the latest update is open by default; the rest start collapsed.
  const [openUpdates, setOpenUpdates] = useState({});
  const toggleUpdate = (key, currentlyOpen) =>
    setOpenUpdates((previous) => ({ ...previous, [key]: !currentlyOpen }));

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#49C4A5]/35">
      <div
        className="p-5"
        style={{
          background: "linear-gradient(135deg, #126B59, #1FA886)",
          color: "#FFFFFF",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
            >
              <TrendingUp size={25} />
            </div>
            <div className="min-w-0">
              <h3
                className="break-words text-[22px] font-extrabold leading-tight sm:text-[25px]"
                style={{ color: "#FFFFFF" }}
              >
                Goal Updates
              </h3>
              <p
                className="mt-1 text-[15px] font-semibold leading-6"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Every saved update, newest first
              </p>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full px-3 py-1.5 text-[14px] font-extrabold"
            style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
          >
            {updates.length} {updates.length === 1 ? "update" : "updates"}
          </span>
        </div>
      </div>

      <div className="space-y-4 bg-white p-4 sm:p-5">
        {updates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#D5E0EE] bg-[#F8FAFD] px-4 py-7 text-center">
            <Target size={30} className="mx-auto text-[#10243E]/30" />
            <p className="mt-3 text-[16px] font-bold leading-7 text-[#10243E]/60">
              This student has not saved any goal updates yet. Every successful
              save from now on will appear here as a separate update.
            </p>
          </div>
        ) : (
          updates.map((snapshot, index) => {
            const skills = getArray(snapshot.targetSkills);
            const challenges = getArray(snapshot.currentChallenges);
            const notes = getNotes(snapshot.additionalNotes);
            const updateKey = snapshot._id || `${snapshot.updatedAt}-${index}`;
            const isOpen = openUpdates[updateKey] ?? index === 0;

            return (
              <article
                key={updateKey}
                className="overflow-hidden rounded-2xl border-2 border-[#D5E0EE] bg-[#FBFDFF]"
              >
                <button
                  type="button"
                  onClick={() => toggleUpdate(updateKey, isOpen)}
                  aria-expanded={isOpen}
                  className={`flex w-full flex-col gap-2 bg-[#EEF9F5] p-4 text-left transition-colors hover:bg-[#E2F5EE] sm:flex-row sm:items-center sm:justify-between ${isOpen ? "border-b-2 border-[#E3EAF3]" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1FA886] text-[13px] font-extrabold text-white">
                      {snapshot.number}
                    </span>
                    <h4 className="text-[17px] font-extrabold text-[#10243E]">
                      Goal update {snapshot.number}
                    </h4>
                    {index === 0 && (
                      <span className="rounded-full bg-[#338DFD]/12 px-2.5 py-1 text-[12px] font-extrabold text-[#1D6FD8]">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-3 text-[14px] font-extrabold text-[#177A62]">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={17} />
                      {formatDateTime(snapshot.updatedAt)}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1FA886] shadow-sm">
                      {isOpen ? (
                        <ChevronUp size={20} strokeWidth={3} />
                      ) : (
                        <ChevronDown size={20} strokeWidth={3} />
                      )}
                    </span>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                <div className="space-y-5 p-4">
                  <TagGroup
                    title={`Target skills (${skills.length})`}
                    items={skills}
                    emptyLabel="No target skills selected"
                    badgeClass="border-[#49C4A5]/25 bg-[#E2F7F0] text-[#176D58]"
                  />
                  <TagGroup
                    title={`Challenges (${challenges.length})`}
                    items={challenges}
                    emptyLabel="No challenges selected"
                    badgeClass="border-[#F59E0B]/25 bg-amber-50 text-amber-800"
                  />
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-[0.1em] text-[#10243E]/60">
                      <MessageCircle size={17} className="text-[#177A62]" />{" "}
                      Additional notes
                    </h4>
                    {notes ? (
                      <div className="whitespace-pre-wrap break-words rounded-xl border-2 border-[#49C4A5]/25 bg-[#F0FBF6] p-4 text-[16px] font-semibold leading-7 text-[#10243E]/80">
                        {notes}
                      </div>
                    ) : (
                      <p className="rounded-xl bg-[#F7F9FC] px-4 py-3 text-[15px] font-semibold text-[#10243E]/45">
                        No additional notes for this update.
                      </p>
                    )}
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

/* ========================= TAG GROUP ========================= */
function TagGroup({ title, items, emptyLabel, badgeClass }) {
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-[0.1em] text-[#10243E]/60">
        <Target size={17} className="text-[#338DFD]" /> {title}
      </h4>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <motion.span
              key={`${item}-${index}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.025, 0.2) }}
              className={`alg-skill inline-flex max-w-full items-center gap-2 rounded-xl border-2 px-3 py-2 text-[15px] font-extrabold leading-6 ${badgeClass}`}
            >
              <CheckCircle2 size={16} className="shrink-0" /> {item}
            </motion.span>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#D5E0EE] bg-[#F8FAFD] px-4 py-3 text-[15px] font-semibold text-[#10243E]/45">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

export default AdminLearningGoals;