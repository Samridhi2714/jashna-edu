import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  History,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  MoreHorizontal,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";

/*
=========================================================
API
=========================================================
*/

const API_URL = "http://localhost:5000";

const FONT_FAMILY = '"Times New Roman", Times, serif';

const fieldClass =
  "w-full rounded-xl border-2 border-[#D5DFEA] bg-white py-4 text-[18px] font-bold text-[#102B4E] outline-none transition-all duration-200 placeholder:font-semibold placeholder:text-[#8795A8] hover:-translate-y-0.5 hover:border-[#8DB8F7] hover:shadow-md focus:-translate-y-0.5 focus:border-[#338DFD] focus:shadow-lg focus:ring-4 focus:ring-[#338DFD]/15";

/*
=========================================================
DATE HELPERS
=========================================================
*/

function normalizeDateOnly(value) {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toDateKey = (value) => {
  if (!value) return "";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return getLocalDateString(date);
};

const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatHistoryDate = (dateValue) => {
  const key = toDateKey(dateValue);

  if (!key) return "";

  const date = new Date(`${key}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/*
=========================================================
ATTENDANCE ELIGIBILITY
=========================================================

IMPORTANT:

A student is eligible only when:

joiningDate <= selectedDate <= courseEndDate

For a student who left early:

joiningDate <= selectedDate <= actualExitDate

This function is intentionally kept separate so that:

1. UI filtering
2. Mark All
3. Save payload

all use the SAME rule.
=========================================================
*/

function getStudentAttendanceEligibility(student, selectedDate) {
  if (!student) {
    return {
      eligible: false,
      reason: "Invalid student",
    };
  }

  const attendanceDate = toDateKey(selectedDate);
  const joiningDate = toDateKey(student.joiningDate);
  const courseEndDate = toDateKey(student.courseEndDate);
  const actualExitDate = toDateKey(student.actualExitDate);

  if (!attendanceDate) {
    return {
      eligible: false,
      reason: "Invalid attendance date",
    };
  }

  if (!joiningDate) {
    return {
      eligible: false,
      reason: "Joining date not available",
    };
  }

  /*
  -------------------------------------------------------
  BEFORE JOINING
  -------------------------------------------------------
  */

  if (attendanceDate < joiningDate) {
    return {
      eligible: false,
      reason: "not_enrolled_yet",
    };
  }

  /*
  -------------------------------------------------------
  AFTER PLANNED COURSE END
  -------------------------------------------------------
  */

  if (courseEndDate && attendanceDate > courseEndDate) {
    return {
      eligible: false,
      reason: "course_ended",
    };
  }

  /*
  -------------------------------------------------------
  LEFT EARLY
  -------------------------------------------------------
  */

  if (actualExitDate && attendanceDate > actualExitDate) {
    return {
      eligible: false,
      reason: "left_early",
    };
  }

  /*
  -------------------------------------------------------
  ACCOUNT STATE
  -------------------------------------------------------
  */

  if (student.isActive === false) {
    return {
      eligible: false,
      reason: "inactive",
    };
  }

  /*
  -------------------------------------------------------
  COURSE STATE
  -------------------------------------------------------
  */

  if (student.enrollmentStatus === "paused") {
    return {
      eligible: false,
      reason: "paused",
    };
  }

  if (student.enrollmentStatus === "upcoming") {
    return {
      eligible: false,
      reason: "upcoming",
    };
  }

  if (student.enrollmentStatus === "completed") {
    return {
      eligible: false,
      reason: "completed",
    };
  }

  if (student.enrollmentStatus === "left_early") {
    /*
    A left-early student can have historical attendance
    before their exit date, but not new attendance after it.
    */
    if (actualExitDate && attendanceDate <= actualExitDate) {
      return {
        eligible: true,
        reason: "",
      };
    }

    return {
      eligible: false,
      reason: "left_early",
    };
  }

  return {
    eligible: true,
    reason: "",
  };
}

/*
=========================================================
STATUS CONFIG
=========================================================
*/

const STATUS_CONFIG = {
  present: {
    label: "Present",
    shortLabel: "Present",
    icon: CheckCircle2,

    button:
      "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100",

    active:
      "border-emerald-600 bg-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,0.32)]",

    iconBg: "bg-emerald-100 text-emerald-700",

    dot: "bg-emerald-600",

    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",

    soft: "bg-emerald-50",
  },

  absent: {
    label: "Absent",
    shortLabel: "Absent",
    icon: XCircle,

    button:
      "border-red-200 bg-red-50 text-red-800 hover:border-red-400 hover:bg-red-100",

    active:
      "border-red-600 bg-red-600 text-white shadow-[0_10px_24px_rgba(220,38,38,0.32)]",

    iconBg: "bg-red-100 text-red-700",

    dot: "bg-red-600",

    badge: "border-red-200 bg-red-50 text-red-800",

    soft: "bg-red-50",
  },

  public_holiday: {
    label: "Public Holiday",
    shortLabel: "Holiday",
    icon: CalendarDays,

    /*
    WARM YELLOW / AMBER
    Matches the student attendance map.
    */

    button:
      "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-amber-100",

    active:
      "border-amber-500 bg-amber-500 text-white shadow-[0_10px_24px_rgba(245,158,11,0.36)]",

    iconBg: "bg-amber-100 text-amber-800",

    dot: "bg-amber-500",

    badge: "border-amber-300 bg-amber-100 text-amber-900",

    soft: "bg-amber-50",
  },

  jashna_leave: {
    label: "Jashna Edu Leave",
    shortLabel: "Jashna Leave",
    icon: Sparkles,

    button:
      "border-indigo-200 bg-indigo-50 text-indigo-900 hover:border-indigo-400 hover:bg-indigo-100",

    active:
      "border-indigo-700 bg-indigo-700 text-white shadow-[0_10px_24px_rgba(67,56,202,0.36)]",

    iconBg: "bg-indigo-100 text-indigo-800",

    dot: "bg-indigo-700",

    badge: "border-indigo-200 bg-indigo-50 text-indigo-900",

    soft: "bg-indigo-50",
  },
};

/*
=========================================================
MAIN COMPONENT
=========================================================
*/

function AdminAttendance() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [attendance, setAttendance] = useState([]);

  const [history, setHistory] = useState([]);

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const [selectedBatch, setSelectedBatch] = useState("all");

  const [dayMode, setDayMode] = useState("regular");

  const [loadingStudents, setLoadingStudents] = useState(true);

  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [loadingHistory, setLoadingHistory] = useState(false);

  const [saving, setSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [historySearch, setHistorySearch] = useState("");

  const [showMenu, setShowMenu] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [temporaryPassword, setTemporaryPassword] = useState("");

  const today = getLocalDateString();

  /*
  =======================================================
  AUTH
  =======================================================
  */

  const getHeaders = () => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  /*
  =======================================================
  FETCH STUDENTS
  =======================================================
  */

  const fetchStudents = async () => {
    setLoadingStudents(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/students`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch students.");
      }

      setStudents(data.students || []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to fetch students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  /*
  =======================================================
  FETCH SELECTED-DAY ATTENDANCE
  =======================================================
  */

  const fetchAttendance = async () => {
    setLoadingAttendance(true);

    try {
      const params = new URLSearchParams();

      params.set("date", selectedDate);

      if (selectedBatch !== "all") {
        params.set("batch", selectedBatch);
      }

      const response = await fetch(
        `${API_URL}/api/attendance?${params.toString()}`,
        {
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch attendance.");
      }

      setAttendance(data.attendance || []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to fetch attendance.");
    } finally {
      setLoadingAttendance(false);
    }
  };

  /*
  =======================================================
  FETCH HISTORY
  =======================================================
  */

  const fetchHistory = async () => {
    setLoadingHistory(true);

    try {
      const params = new URLSearchParams();

      if (selectedBatch !== "all") {
        params.set("batch", selectedBatch);
      }

      const response = await fetch(
        `${API_URL}/api/attendance?${params.toString()}`,
        {
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch attendance history.");
      }

      setHistory(data.attendance || []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to fetch attendance history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  /*
  =======================================================
  INITIAL LOAD
  =======================================================
  */

  useEffect(() => {
    fetchStudents();
  }, []);

  /*
  =======================================================
  LOAD ATTENDANCE
  =======================================================
  */

  useEffect(() => {
    if (!loadingStudents) {
      fetchAttendance();
      fetchHistory();
    }
  }, [selectedDate, selectedBatch, loadingStudents]);

  /*
  =======================================================
  CLOSE MENU
  =======================================================
  */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowMenu(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /*
  =======================================================
  BATCHES
  =======================================================
  */

  const batches = useMemo(() => {
    const uniqueBatches = [
      ...new Set(
        students.map((student) => student.batch?.trim()).filter(Boolean),
      ),
    ];

    return uniqueBatches.sort();
  }, [students]);

  /*
  =======================================================
  STUDENT DATE STATES
  =======================================================

  We keep ALL students here.

  This is important because we don't want Anshika to
  simply disappear from the UI.

  Instead:

  Eligible students
      -> appear in attendance table

  Not eligible students
      -> appear in a separate "Not enrolled" section
  =======================================================
  */

  const batchStudents = useMemo(() => {
    return students
      .filter((student) => {
        if (selectedBatch === "all") {
          return false;
        }

        return student.batch?.trim() === selectedBatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedBatch]);

  const activeStudents = useMemo(() => {
    return batchStudents.filter((student) => {
      return getStudentAttendanceEligibility(student, selectedDate).eligible;
    });
  }, [batchStudents, selectedDate]);

  /*
  =======================================================
  EXCLUDED STUDENTS

  This is the important UX improvement.

  Anshika will now appear here as:

  "Not enrolled yet"
  Joining date: 15 Sep 2026

  instead of simply disappearing.
  =======================================================
  */

  const excludedStudents = useMemo(() => {
    return batchStudents.filter((student) => {
      return !getStudentAttendanceEligibility(student, selectedDate).eligible;
    });
  }, [batchStudents, selectedDate]);

  const excludedForDateCount = excludedStudents.length;

  /*
  =======================================================
  ATTENDANCE MAP
  =======================================================
  */

  const attendanceMap = useMemo(() => {
    const map = {};

    attendance.forEach((record) => {
      const studentId = record.student?._id || record.student;

      if (studentId) {
        map[studentId] = record;
      }
    });

    return map;
  }, [attendance]);

  /*
  =======================================================
  STUDENT RECORDS
  =======================================================
  */

  const studentRecords = useMemo(() => {
    return activeStudents.map((student) => {
      const existing = attendanceMap[student._id];

      return {
        ...student,

        status: existing?.status || "",

        remarks: existing?.remarks || "",
      };
    });
  }, [activeStudents, attendanceMap]);

  /*
  =======================================================
  SUMMARY
  =======================================================
  */

  const summary = useMemo(() => {
    const counts = {
      present: 0,
      absent: 0,
      public_holiday: 0,
      jashna_leave: 0,
      unmarked: 0,
    };

    studentRecords.forEach((student) => {
      if (student.status) {
        counts[student.status]++;
      } else {
        counts.unmarked++;
      }
    });

    return counts;
  }, [studentRecords]);

  /*
  =======================================================
  COMPLETION
  =======================================================
  */

  const completionPercentage = useMemo(() => {
    if (!studentRecords.length) {
      return 0;
    }

    const marked = studentRecords.filter((student) => student.status).length;

    return Math.round((marked / studentRecords.length) * 100);
  }, [studentRecords]);

  /*
  =======================================================
  UPDATE STATUS
  =======================================================
  */

  const updateStudentStatus = (studentId, status) => {
    /*
    Safety check:

    Even if a UI event somehow fires for an
    ineligible student, we don't allow it.
    */

    const student = students.find((item) => item._id === studentId);

    if (!student) return;

    const eligibility = getStudentAttendanceEligibility(student, selectedDate);

    if (!eligibility.eligible) {
      return;
    }

    setAttendance((previous) => {
      const existing = previous.find(
        (record) => (record.student?._id || record.student) === studentId,
      );

      if (existing) {
        return previous.map((record) => {
          const currentId = record.student?._id || record.student;

          if (currentId !== studentId) {
            return record;
          }

          return {
            ...record,
            status,
          };
        });
      }

      return [
        ...previous,
        {
          student,
          status,
          remarks: "",
          date: selectedDate,
          batch: selectedBatch,
        },
      ];
    });

    setMessage("");
    setError("");
  };

  /*
  =======================================================
  UPDATE REMARKS
  =======================================================
  */

  const updateStudentRemarks = (studentId, remarks) => {
    const student = students.find((item) => item._id === studentId);

    if (!student) return;

    const eligibility = getStudentAttendanceEligibility(student, selectedDate);

    if (!eligibility.eligible) {
      return;
    }

    setAttendance((previous) => {
      const existing = previous.find(
        (record) => (record.student?._id || record.student) === studentId,
      );

      if (existing) {
        return previous.map((record) => {
          const currentId = record.student?._id || record.student;

          if (currentId !== studentId) {
            return record;
          }

          return {
            ...record,
            remarks,
          };
        });
      }

      return [
        ...previous,
        {
          student,
          status: "",
          remarks,
          date: selectedDate,
          batch: selectedBatch,
        },
      ];
    });

    setMessage("");
    setError("");
  };

  /*
  =======================================================
  MARK ALL
  =======================================================
  */

  const markAll = (status) => {
    if (!activeStudents.length) {
      return;
    }

    /*
    ONLY active/eligible students are included.

    Anshika will never be added here if she has not
    joined yet.
    */

    setAttendance(
      activeStudents.map((student) => {
        const existing = attendanceMap[student._id];

        return {
          student,
          status,
          remarks: existing?.remarks || "",
          date: selectedDate,
          batch: selectedBatch,
        };
      }),
    );

    setMessage("");
    setError("");
  };

  /*
  =======================================================
  APPLY SPECIAL DAY
  =======================================================
  */

  const applyDayStatus = (status) => {
    if (!activeStudents.length) {
      return;
    }

    setAttendance(
      activeStudents.map((student) => {
        const existing = attendanceMap[student._id];

        return {
          student,
          status,
          remarks: existing?.remarks || "",
          date: selectedDate,
          batch: selectedBatch,
        };
      }),
    );

    setDayMode(status);

    setMessage("");
    setError("");
  };

  /*
  =======================================================
  SAVE ATTENDANCE
  =======================================================

  CRITICAL FIX:

  We do NOT simply submit studentRecords blindly.

  We create a fresh eligibility Set.

  Only students whose joining/course dates allow
  attendance are sent to:

  POST /api/attendance

  Therefore, if:

  Anshika joined = 15 Sep
  Selected date  = 10 Sep

  Anshika is NOT included in records.

  Other students are still submitted normally.
  =======================================================
  */

  const handleSave = async () => {
    setMessage("");
    setError("");

    if (selectedDate > today) {
      setError("Attendance cannot be marked for a future date.");

      return;
    }

    if (selectedBatch === "all") {
      setError("Please select a specific batch before saving attendance.");

      return;
    }

    if (!activeStudents.length) {
      setError(
        "There are no eligible students in this batch on the selected date.",
      );

      return;
    }

    /*
    -------------------------------------------------------
    CREATE ELIGIBLE STUDENT ID SET
    -------------------------------------------------------
    */

    const eligibleStudentIds = new Set(
      activeStudents.map((student) => String(student._id)),
    );

    /*
    -------------------------------------------------------
    BUILD SAVE PAYLOAD

    IMPORTANT:

    We intentionally filter the records here.

    Even if attendance state somehow contains an old
    record for Anshika, she cannot enter this payload.
    -------------------------------------------------------
    */

    const records = studentRecords
      .filter((student) => eligibleStudentIds.has(String(student._id)))
      .map((student) => ({
        studentId: student._id,
        status: student.status,
        remarks: student.remarks || "",
      }));

    /*
    -------------------------------------------------------
    VALIDATE ONLY ELIGIBLE STUDENTS
    -------------------------------------------------------
    */

    const hasUnmarked = records.some((record) => !record.status);

    if (hasUnmarked) {
      setError(
        "Please mark attendance for every eligible student before saving.",
      );

      return;
    }

    if (!records.length) {
      setError("There are no eligible attendance records to save.");

      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: getHeaders(),

        body: JSON.stringify({
          date: selectedDate,
          batch: selectedBatch,

          /*
            ONLY ELIGIBLE STUDENTS ARE SENT.
            */

          records,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save attendance.");
      }

      setMessage(
        `Attendance saved for ${records.length} eligible ${
          records.length === 1 ? "student" : "students"
        } on ${formatDate(selectedDate)}.`,
      );

      await fetchAttendance();
      await fetchHistory();
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  /*
  =======================================================
  TOGGLE STUDENT ACCOUNT
  =======================================================
  */

  const handleToggleStatus = async (student) => {
    const action = student.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${student.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/students/${student._id}/status`,
        {
          method: "PATCH",
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update student status.");
      }

      setStudents((previous) =>
        previous.map((item) =>
          item._id === student._id
            ? {
                ...item,
                isActive: data.student.isActive,
              }
            : item,
        ),
      );

      setShowMenu(null);

      setMessage(data.message || "Student status updated.");
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to update student status.");
    } finally {
      setActionLoading(false);
    }
  };

  /*
  =======================================================
  RESET PASSWORD
  =======================================================
  */

  const handleResetPassword = async (student) => {
    const confirmed = window.confirm(`Reset the password for ${student.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/students/${student._id}/reset-password`,
        {
          method: "POST",
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setSelectedStudent(student);

      setTemporaryPassword(data.temporaryPassword || data.tempPassword || "");

      setShowMenu(null);

      if (!data.temporaryPassword) {
        setMessage(data.message || "Password reset successfully.");
      }
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to reset password.");
    } finally {
      setActionLoading(false);
    }
  };

  /*
  =======================================================
  HISTORY SEARCH
  =======================================================
  */

  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLowerCase();

    const filtered = history.filter((record) => {
      if (!query) {
        return true;
      }

      const name = record.student?.name?.toLowerCase() || "";

      const username = record.student?.username?.toLowerCase() || "";

      const batch =
        record.batch?.toLowerCase() ||
        record.student?.batch?.toLowerCase() ||
        "";

      return (
        name.includes(query) ||
        username.includes(query) ||
        batch.includes(query)
      );
    });

    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [history, historySearch]);

  /*
  =======================================================
  RENDER
  =======================================================
  */

  return (
    <div
      className="admin-attendance-root min-h-screen bg-gradient-to-b from-[#F1F5F2] via-[#F3F6FA] to-[#F4F2F8] text-[#102B4E]"
      style={{ fontFamily: FONT_FAMILY }}
    >
      {/* Force Times New Roman everywhere + subtle animations */}
      <style>{`
        .admin-attendance-root, .admin-attendance-root * { font-family: ${FONT_FAMILY} !important; }
        .admin-attendance-root code, .admin-attendance-root .aa-mono { font-family: "Courier New", Courier, monospace !important; }
        @keyframes aa-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes aa-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(51,141,253,0.55); } 50% { box-shadow: 0 0 0 7px rgba(51,141,253,0); } }
        .aa-shimmer::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); transform: translateX(-120%); animation: aa-shimmer 3s ease-in-out infinite; }
        .aa-live-dot { animation: aa-pulse 1.8s ease-in-out infinite; }
      `}</style>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.header
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative isolate mb-8 overflow-hidden rounded-[30px] border-2 border-[#27456D] bg-gradient-to-br from-[#102B4E] via-[#15375F] to-[#1D4A7A] px-7 py-9 text-white shadow-[0_22px_56px_rgba(16,43,78,0.28)] sm:px-10 sm:py-11"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
            className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[44px] border-[#338DFD]/15"
          />
          <div className="pointer-events-none absolute -bottom-24 left-[35%] h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-3 rounded-full border-2 border-white/20 bg-white/10 px-5 py-2">
                <span className="aa-live-dot h-2.5 w-2.5 rounded-full bg-[#5AA9FF]" />

                <p className="text-[15px] font-extrabold uppercase tracking-[0.18em] text-[#BBD9FF]">
                  Student Operations
                </p>
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-[4.2rem]">
                Attendance
              </h1>

              <p className="mt-4 max-w-2xl text-[20px] font-semibold leading-8 text-white/80">
                Record daily attendance and special days while keeping every
                student's course timeline accurate.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TopMetric
                icon={<Users size={22} />}
                label="Eligible"
                value={activeStudents.length}
              />

              <TopMetric
                icon={<ShieldCheck size={22} />}
                label="Marked"
                value={`${completionPercentage}%`}
              />
            </div>
          </div>
        </motion.header>

        {/* =================================================
            CONTROL PANEL
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
          }}
          className="mb-7 overflow-hidden rounded-[26px] border-2 border-[#DCE4EE] bg-white shadow-[0_14px_44px_rgba(16,36,62,0.07)]"
        >
          {/* FILTERS */}

          <div className="grid gap-5 p-6 lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:p-7">
            <Field label="Attendance date">
              <div className="relative">
                <CalendarDays
                  size={22}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
                />

                <input
                  type="date"
                  value={selectedDate}
                  max={today}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);

                    setDayMode("regular");
                    setMessage("");
                    setError("");
                    setShowMenu(null);
                  }}
                  className={`${fieldClass} pl-13 pr-4`}
                  style={{ paddingLeft: "3.25rem" }}
                />
              </div>
            </Field>

            <Field label="Batch / timing">
              <div className="relative">
                <Clock3
                  size={22}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
                />

                <select
                  value={selectedBatch}
                  onChange={(event) => {
                    setSelectedBatch(event.target.value);

                    setDayMode("regular");
                    setMessage("");
                    setError("");
                    setShowMenu(null);
                  }}
                  className={`${fieldClass} appearance-none pr-11`}
                  style={{ paddingLeft: "3.25rem" }}
                >
                  <option value="all">Select batch</option>

                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[18px] text-[#102B4E]/55">
                  ▾
                </span>
              </div>
            </Field>

            <div className="flex gap-3">
              <QuickDateButton
                label="Today"
                active={selectedDate === today}
                onClick={() => {
                  setSelectedDate(today);
                  setMessage("");
                  setError("");
                }}
              />

              <QuickDateButton
                label="Yesterday"
                onClick={() => {
                  const date = new Date();

                  date.setDate(date.getDate() - 1);

                  setSelectedDate(getLocalDateString(date));

                  setMessage("");
                  setError("");
                }}
              />
            </div>
          </div>

          {/* DATE CONTEXT */}

          {selectedBatch !== "all" && (
            <div className="border-t-2 border-[#E8EEF5] bg-[#F5F9FF] px-6 py-5 lg:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <CalendarCheck2
                    size={22}
                    className="mt-0.5 shrink-0 text-[#338DFD]"
                  />

                  <div>
                    <p className="text-[15px] font-extrabold uppercase tracking-wide text-[#102B4E]/55">
                      Attendance date
                    </p>

                    <p className="mt-0.5 text-[21px] font-extrabold text-[#102B4E]">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                </div>

                {excludedForDateCount > 0 && (
                  <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-3">
                    <p className="text-[17px] font-extrabold text-amber-900">
                      {excludedForDateCount} student
                      {excludedForDateCount === 1 ? "" : "s"} cannot be marked
                    </p>

                    <p className="mt-0.5 text-[14px] font-bold text-amber-900/70">
                      Outside their eligible course period
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DAY TYPE */}

          <div className="border-t-2 border-[#E8EEF5] p-6 lg:p-7">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[26px] font-extrabold text-[#102B4E]">
                  Day type
                </h2>

                <p className="mt-1 text-[17px] font-semibold text-[#102B4E]/60">
                  Choose how this batch day should be recorded.
                </p>
              </div>

              {selectedBatch === "all" && (
                <span className="rounded-lg bg-amber-100 px-4 py-2 text-[14px] font-extrabold uppercase tracking-wide text-amber-900">
                  Select a batch first
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <DayModeButton
                active={dayMode === "regular"}
                icon={<Users size={24} />}
                title="Regular class"
                description="Mark students individually"
                onClick={() => setDayMode("regular")}
              />

              <DayModeButton
                active={dayMode === "public_holiday"}
                icon={<CalendarDays size={24} />}
                title="Public Holiday"
                description="Excluded from attendance %"
                onClick={() => applyDayStatus("public_holiday")}
                disabled={selectedBatch === "all" || !activeStudents.length}
                tone="holiday"
              />

              <DayModeButton
                active={dayMode === "jashna_leave"}
                icon={<Sparkles size={24} />}
                title="Jashna Edu Leave"
                description="Excluded from attendance %"
                onClick={() => applyDayStatus("jashna_leave")}
                disabled={selectedBatch === "all" || !activeStudents.length}
                tone="leave"
              />
            </div>
          </div>
        </motion.section>

        {/* =================================================
            FEEDBACK
        ================================================= */}

        <AnimatePresence>
          {message && (
            <motion.div
              key="message"
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-[19px] font-extrabold text-emerald-800 shadow-md"
            >
              <CheckCircle2 size={26} />

              {message}
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 text-[19px] font-extrabold text-red-800 shadow-md"
            >
              <CircleAlert size={26} className="mt-0.5 shrink-0" />

              <span>{error}</span>

              <motion.button
                type="button"
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setError("")}
                className="ml-auto rounded-lg p-1 hover:bg-red-100"
                aria-label="Dismiss error"
              >
                <X size={22} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            label="Present"
            value={summary.present}
            icon={<CheckCircle2 size={26} />}
            tone="green"
          />

          <SummaryCard
            label="Absent"
            value={summary.absent}
            icon={<XCircle size={26} />}
            tone="red"
          />

          <SummaryCard
            label="Public Holiday"
            value={summary.public_holiday}
            icon={<CalendarDays size={26} />}
            tone="holiday"
          />

          <SummaryCard
            label="Jashna Leave"
            value={summary.jashna_leave}
            icon={<Sparkles size={26} />}
            tone="leave"
          />
        </div>

        {/* =================================================
            ATTENDANCE PANEL
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="overflow-visible rounded-[26px] border-2 border-[#DCE4EE] bg-white shadow-[0_14px_44px_rgba(16,36,62,0.07)]"
        >
          {/* PANEL HEADER */}

          <div className="rounded-t-[24px] border-b-2 border-[#E8EEF5] bg-gradient-to-r from-[#F3F8FF] via-white to-[#F6F3FC] px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-[32px] font-extrabold tracking-tight text-[#102B4E]">
                    {selectedBatch === "all"
                      ? "Student attendance"
                      : selectedBatch}
                  </h2>

                  {selectedBatch !== "all" && activeStudents.length > 0 && (
                    <span className="rounded-lg bg-[#102B4E] px-3.5 py-1.5 text-[15px] font-extrabold text-white">
                      {activeStudents.length}{" "}
                      {activeStudents.length === 1
                        ? "eligible student"
                        : "eligible students"}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-[18px] font-bold text-[#102B4E]/60">
                  {formatDate(selectedDate)}
                </p>
              </div>

              {selectedBatch !== "all" &&
                activeStudents.length > 0 &&
                dayMode === "regular" && (
                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      onClick={() => markAll("present")}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.93 }}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-xl"
                    >
                      <Check size={20} />
                      All present
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => markAll("absent")}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.93 }}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-xl"
                    >
                      <X size={20} />
                      All absent
                    </motion.button>
                  </div>
                )}
            </div>
          </div>

          {/* LEGEND */}

          {selectedBatch !== "all" && (
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b-2 border-[#E8EEF5] bg-[#F7F9FB] px-6 py-4 sm:px-8">
              <span className="text-[14px] font-extrabold uppercase tracking-[0.14em] text-[#102B4E]/50">
                Status
              </span>

              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <StatusLegend key={key} config={config} />
              ))}

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-[5px] border-2 border-[#102B4E]/15 bg-[#E9EDF0]" />

                <span className="text-[15px] font-extrabold text-[#102B4E]/70">
                  Not enrolled / unavailable
                </span>
              </div>
            </div>
          )}

          {/* LOADING */}

          {loadingAttendance || loadingStudents ? (
            <LoadingState />
          ) : selectedBatch === "all" ? (
            <EmptyState
              icon={<Clock3 size={32} />}
              title="Choose a batch"
              description="Select a batch above to view and manage attendance."
            />
          ) : activeStudents.length === 0 ? (
            <NoStudentsForDate date={selectedDate} batch={selectedBatch} />
          ) : (
            <>
              {/* TABLE HEADER */}

              <div className="hidden border-b-2 border-[#E8EEF5] bg-[#102B4E] px-8 py-4 lg:grid lg:grid-cols-[280px_minmax(440px,1fr)_280px_52px] lg:gap-5">
                <HeaderLabel>Student</HeaderLabel>

                <HeaderLabel>Attendance status</HeaderLabel>

                <HeaderLabel>Remarks</HeaderLabel>

                <span />
              </div>

              {/* STUDENTS */}

              <div className="divide-y-2 divide-[#EDF1F6]">
                {studentRecords.map((student, index) => (
                  <StudentAttendanceRow
                    key={student._id}
                    student={student}
                    index={index}
                    onChange={updateStudentStatus}
                    onRemarksChange={updateStudentRemarks}
                    showMenu={showMenu === student._id}
                    setShowMenu={setShowMenu}
                    onToggleStatus={handleToggleStatus}
                    onResetPassword={handleResetPassword}
                    onManage={() => navigate("/admin/students")}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>

              {/* EXCLUDED STUDENTS */}

              {excludedStudents.length > 0 && (
                <ExcludedStudentsSection
                  students={excludedStudents}
                  selectedDate={selectedDate}
                />
              )}

              {/* SAVE */}

              <div className="rounded-b-[24px] border-t-2 border-[#E8EEF5] bg-gradient-to-r from-[#102B4E] to-[#1D4A7A] px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4 text-white">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/12">
                      <LockKeyhole size={22} />
                    </div>

                    <div>
                      <p className="text-[19px] font-extrabold">
                        {activeStudents.length} eligible{" "}
                        {activeStudents.length === 1 ? "student" : "students"}{" "}
                        will be saved
                      </p>

                      <p className="mt-1 max-w-xl text-[16px] font-semibold leading-6 text-white/70">
                        Students who have not joined yet are automatically
                        excluded from the save request.
                      </p>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={saving ? undefined : { scale: 1.06, y: -3 }}
                    whileTap={saving ? undefined : { scale: 0.94 }}
                    className="aa-shimmer relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-9 py-4 text-[20px] font-extrabold text-[#102B4E] shadow-lg transition-shadow hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={22} />
                        Save attendance
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.section>

        {/* =================================================
            HISTORY
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="mt-8 overflow-hidden rounded-[26px] border-2 border-[#DCE4EE] bg-white shadow-[0_14px_44px_rgba(16,36,62,0.06)]"
        >
          <div className="flex flex-col gap-5 border-b-2 border-[#E8EEF5] bg-gradient-to-r from-[#F3F8FF] via-white to-[#F6F3FC] px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102B4E] text-white shadow-md">
                <History size={26} />
              </div>

              <div>
                <h2 className="text-[30px] font-extrabold leading-tight text-[#102B4E]">
                  Attendance history
                </h2>

                <p className="mt-0.5 text-[17px] font-semibold text-[#102B4E]/60">
                  Previously recorded attendance
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-[360px]">
              <Search
                size={22}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
              />

              <input
                type="text"
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Search student or batch..."
                className={`${fieldClass} pr-4`}
                style={{ paddingLeft: "3.25rem" }}
              />
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 size={40} className="animate-spin text-[#338DFD]" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <EmptyState
              icon={<History size={30} />}
              title="No attendance history"
              description={
                selectedBatch === "all"
                  ? "Select a batch above to browse its attendance history."
                  : "Attendance records for this batch will appear here."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b-2 border-[#E8EEF5] bg-[#102B4E] text-left">
                    <HeaderCell>Date</HeaderCell>

                    <HeaderCell>Student</HeaderCell>

                    <HeaderCell>Batch</HeaderCell>

                    <HeaderCell>Status</HeaderCell>

                    <HeaderCell>Remarks</HeaderCell>

                    <HeaderCell>Student state</HeaderCell>
                  </tr>
                </thead>

                <tbody className="divide-y-2 divide-[#EDF1F6]">
                  {filteredHistory.slice(0, 100).map((record, index) => (
                    <HistoryRow
                      key={
                        record._id ||
                        `${record.student?._id}-${record.date}-${index}`
                      }
                      record={record}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>

              {filteredHistory.length > 100 && (
                <div className="border-t-2 border-[#E8EEF5] px-7 py-5 text-center text-[16px] font-bold text-[#102B4E]/55">
                  Showing the latest 100 matching records.
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* =================================================
            FOOT NOTE
        ================================================= */}

        <div className="mt-6 flex items-start gap-3 px-1 text-[16px] font-semibold leading-6 text-[#102B4E]/55">
          <CalendarCheck2
            size={20}
            className="mt-0.5 shrink-0 text-[#338DFD]"
          />

          <p>
            Public holidays and Jashna Edu leave remain in history but are
            excluded from attendance percentage calculations.
          </p>
        </div>
      </div>

      {/* =================================================
          PASSWORD RESET MODAL
      ================================================= */}

      <AnimatePresence>
        {temporaryPassword && (
          <motion.div
            key="password-modal"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B4E]/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="admin-attendance-root w-full max-w-lg rounded-[28px] border-2 border-[#DCE4EE] bg-white p-8 shadow-[0_30px_80px_rgba(16,36,62,0.3)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 16,
                    }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
                  >
                    <RotateCcw size={29} />
                  </motion.div>

                  <h3 className="text-[32px] font-extrabold text-[#102B4E]">
                    Password reset
                  </h3>

                  <p className="mt-1 text-[18px] font-semibold text-[#102B4E]/60">
                    Temporary password for {selectedStudent?.name || "student"}.
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setTemporaryPassword("")}
                  whileHover={{ rotate: 90, scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  className="rounded-xl p-2.5 text-[#102B4E]/45 transition-colors hover:bg-red-100 hover:text-red-600"
                  aria-label="Close"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div className="mt-7 rounded-2xl border-2 border-[#DCE4EE] bg-[#F5F9FF] p-5">
                <p className="mb-3 text-[14px] font-extrabold uppercase tracking-[0.14em] text-[#102B4E]/55">
                  Temporary password
                </p>

                <div className="flex items-center gap-3">
                  <code className="flex-1 break-all rounded-xl bg-white px-4 py-3.5 text-[22px] font-bold tracking-wider text-[#102B4E] shadow-sm">
                    {temporaryPassword}
                  </code>

                  <motion.button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(temporaryPassword);
                      } catch {
                        // Clipboard may be unavailable
                      }
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.88 }}
                    className="rounded-xl bg-[#338DFD] px-5 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl"
                  >
                    Copy
                  </motion.button>
                </div>
              </div>

              <p className="mt-5 text-[17px] font-semibold leading-7 text-[#102B4E]/65">
                This is a temporary password. The student should use it to sign
                in and change it from the Student Portal.
              </p>

              <motion.button
                type="button"
                onClick={() => setTemporaryPassword("")}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="mt-7 w-full rounded-xl bg-gradient-to-r from-[#102B4E] to-[#1D4A7A] py-4 text-[20px] font-extrabold text-white shadow-lg transition-shadow hover:shadow-2xl"
              >
                Done
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
=========================================================
FIELD
=========================================================
*/

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-[15px] font-extrabold uppercase tracking-[0.12em] text-[#102B4E]/60">
        {label}
      </label>

      {children}
    </div>
  );
}

/*
=========================================================
TOP METRIC
=========================================================
*/

function TopMetric({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.04 }}
      className="flex min-w-[170px] items-center gap-4 rounded-2xl border-2 border-white/20 bg-white/10 px-5 py-4 backdrop-blur"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#102B4E]">
        {icon}
      </div>

      <div>
        <p className="text-[14px] font-extrabold uppercase tracking-[0.13em] text-white/70">
          {label}
        </p>

        <motion.p
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[32px] font-extrabold leading-tight text-white"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}

/*
=========================================================
HEADER LABEL
=========================================================
*/

function HeaderLabel({ children }) {
  return (
    <p className="text-[15px] font-extrabold uppercase tracking-[0.14em] text-white/90">
      {children}
    </p>
  );
}

/*
=========================================================
HEADER CELL
=========================================================
*/

function HeaderCell({ children }) {
  return (
    <th className="px-5 py-4 text-[15px] font-extrabold uppercase tracking-[0.13em] text-white/90 first:px-8">
      {children}
    </th>
  );
}

/*
=========================================================
STUDENT ROW
=========================================================
*/

function StudentAttendanceRow({
  student,
  index,
  onChange,
  onRemarksChange,
  showMenu,
  setShowMenu,
  onToggleStatus,
  onResetPassword,
  onManage,
  actionLoading,
}) {
  const currentStatus = student.status;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.03, 0.3),
      }}
      className={`group relative px-6 py-6 transition-colors duration-200 hover:bg-[#EEF5FF] sm:px-8 ${
        index % 2 === 1 ? "bg-[#FAFCFE]" : "bg-white"
      }`}
    >
      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(440px,1fr)_280px_52px] lg:items-center lg:gap-5">
        {/* STUDENT */}

        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#102B4E] to-[#2B5C8F] text-[24px] font-extrabold text-white shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
            {student.name?.charAt(0)?.toUpperCase() || "S"}

            <span className="absolute -bottom-1.5 -right-1.5 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-[#338DFD] px-1 text-[12px] font-extrabold text-white">
              {index + 1}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[21px] font-extrabold text-[#102B4E] transition-colors group-hover:text-[#1D6FD8]">
                {student.name}
              </p>

              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[12px] font-extrabold uppercase tracking-wide text-emerald-800">
                Active
              </span>
            </div>

            <p className="mt-0.5 truncate text-[16px] font-bold text-[#102B4E]/55">
              @{student.username}
            </p>

            <p className="mt-1 text-[14px] font-bold text-[#102B4E]/45">
              Joined {formatHistoryDate(student.joiningDate)}
            </p>
          </div>
        </div>

        {/* STATUS */}

        <StatusSelector
          value={currentStatus}
          onChange={(status) => onChange(student._id, status)}
        />

        {/* REMARK */}

        <div className="relative">
          <MessageSquareText
            size={20}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#338DFD]"
          />

          <input
            type="text"
            value={student.remarks || ""}
            onChange={(event) =>
              onRemarksChange(student._id, event.target.value)
            }
            placeholder="Optional remark..."
            maxLength={250}
            className={`${fieldClass} !py-3.5 pr-3 !text-[17px]`}
            style={{ paddingLeft: "2.9rem" }}
          />
        </div>

        {/* THREE DOT MENU */}

        <div className="relative flex justify-end">
          <motion.button
            type="button"
            onClick={() => setShowMenu(showMenu ? null : student._id)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
              showMenu
                ? "bg-[#102B4E] text-white"
                : "bg-[#102B4E]/6 text-[#102B4E]/60 hover:bg-[#338DFD] hover:text-white"
            }`}
            aria-label={`Actions for ${student.name}`}
          >
            <MoreHorizontal size={24} />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: -8,
                }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border-2 border-[#D5DFEA] bg-white p-2 shadow-[0_22px_55px_rgba(16,36,62,0.22)]"
              >
                <MenuButton
                  icon={<UserCog size={21} />}
                  label="Manage student"
                  onClick={() => {
                    setShowMenu(null);
                    onManage();
                  }}
                />

                <MenuButton
                  icon={<ShieldCheck size={21} />}
                  label={
                    student.isActive ? "Deactivate student" : "Activate student"
                  }
                  onClick={() => onToggleStatus(student)}
                  disabled={actionLoading}
                  danger={student.isActive}
                />

                <MenuButton
                  icon={<RotateCcw size={21} />}
                  label="Reset password"
                  onClick={() => onResetPassword(student)}
                  disabled={actionLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/*
=========================================================
STATUS SELECTOR
=========================================================
*/

function StatusSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {Object.entries(STATUS_CONFIG).map(([status, item]) => {
        const Icon = item.icon;

        const selected = value === status;

        return (
          <motion.button
            key={status}
            type="button"
            whileHover={{
              y: -3,
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.93,
            }}
            onClick={() => onChange(status)}
            className={`relative flex min-h-[64px] items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-left transition-colors ${
              selected ? item.active : item.button
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                selected ? "bg-white/20 text-white" : item.iconBg
              }`}
            >
              <Icon size={21} />
            </span>

            <span className="min-w-0">
              <span
                className={`block truncate text-[16px] font-extrabold ${
                  selected ? "text-white" : ""
                }`}
              >
                {item.shortLabel}
              </span>

              <span
                className={`mt-0.5 block text-[12px] font-bold ${
                  selected ? "text-white/75" : "opacity-60"
                }`}
              >
                {selected ? "Selected" : "Choose"}
              </span>
            </span>

            <AnimatePresence>
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-2 top-2"
                >
                  <Check size={16} strokeWidth={3.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

/*
=========================================================
STATUS LEGEND
=========================================================
*/

function StatusLegend({ config }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded-[5px] ${config.dot}`} />

      <span className="text-[15px] font-extrabold text-[#102B4E]/70">
        {config.label}
      </span>
    </div>
  );
}

/*
=========================================================
EXCLUDED STUDENTS SECTION
=========================================================
*/

function ExcludedStudentsSection({ students, selectedDate }) {
  return (
    <div className="border-t-2 border-amber-200 bg-[#FFFBF2]">
      <div className="px-6 py-6 sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <CircleAlert size={24} />
          </div>

          <div>
            <h3 className="text-[22px] font-extrabold text-amber-950">
              {students.length} {students.length === 1 ? "student" : "students"}{" "}
              not available for this date
            </h3>

            <p className="mt-1 text-[16px] font-semibold leading-6 text-amber-900/70">
              These students are visible for clarity, but they are NOT included
              in the attendance save request.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student, index) => {
            const eligibility = getStudentAttendanceEligibility(
              student,
              selectedDate,
            );

            let title = "Not available";

            let description = "Attendance cannot be marked.";

            if (eligibility.reason === "not_enrolled_yet") {
              title = "Not enrolled yet";

              description = `Joining date: ${formatHistoryDate(
                student.joiningDate,
              )}`;
            } else if (eligibility.reason === "course_ended") {
              title = "Course period ended";

              description = `Course ended: ${formatHistoryDate(
                student.courseEndDate,
              )}`;
            } else if (eligibility.reason === "left_early") {
              title = "Course ended early";

              description = `Exit date: ${formatHistoryDate(
                student.actualExitDate,
              )}`;
            } else if (eligibility.reason === "inactive") {
              title = "Account inactive";

              description = "Student account is inactive.";
            } else if (eligibility.reason === "paused") {
              title = "Course paused";

              description = "Attendance is currently unavailable.";
            } else if (eligibility.reason === "completed") {
              title = "Course completed";

              description = "Attendance is currently unavailable.";
            } else if (eligibility.reason === "upcoming") {
              title = "Course upcoming";

              description = "Student has not started the course.";
            }

            return (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex items-center gap-4 rounded-xl border-2 border-amber-200 bg-white px-4 py-4 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E9EDF0] text-[20px] font-extrabold text-[#102B4E]">
                  {student.name?.charAt(0)?.toUpperCase() || "S"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[19px] font-extrabold text-[#102B4E]">
                    {student.name}
                  </p>

                  <p className="mt-0.5 text-[16px] font-extrabold text-amber-800">
                    {title}
                  </p>

                  <p className="mt-0.5 truncate text-[14px] font-semibold text-[#102B4E]/55">
                    {description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/*
=========================================================
SUMMARY CARD
=========================================================
*/

function SummaryCard({ label, value, icon, tone }) {
  const styles = {
    green: {
      icon: "bg-emerald-100 text-emerald-700",
      number: "text-emerald-700",
      border: "border-emerald-200 hover:border-emerald-400",
      bar: "#059669",
    },

    red: {
      icon: "bg-red-100 text-red-700",
      number: "text-red-700",
      border: "border-red-200 hover:border-red-400",
      bar: "#DC2626",
    },

    holiday: {
      icon: "bg-amber-100 text-amber-800",
      number: "text-amber-800",
      border: "border-amber-300 hover:border-amber-500",
      bar: "#F59E0B",
    },

    leave: {
      icon: "bg-indigo-100 text-indigo-800",
      number: "text-indigo-800",
      border: "border-indigo-200 hover:border-indigo-400",
      bar: "#4338CA",
    },
  };

  const current = styles[tone];

  return (
    <motion.div
      whileHover={{
        y: -7,
        scale: 1.03,
      }}
      whileTap={{ scale: 0.97 }}
      className={`relative cursor-default overflow-hidden rounded-[22px] border-2 ${current.border} bg-white p-5 shadow-[0_8px_26px_rgba(16,36,62,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(16,36,62,0.14)] sm:p-6`}
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: current.bar }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-extrabold uppercase tracking-[0.12em] text-[#102B4E]/55">
            {label}
          </p>

          <motion.p
            key={value}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`mt-2 text-[44px] font-extrabold leading-none tracking-tight ${current.number}`}
          >
            {value}
          </motion.p>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${current.icon}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/*
=========================================================
DAY MODE BUTTON
=========================================================
*/

function DayModeButton({
  active,
  icon,
  title,
  description,
  onClick,
  disabled = false,
  tone = "default",
}) {
  const activeStyles = {
    default:
      "border-[#102B4E] bg-[#102B4E] text-white shadow-[0_12px_28px_rgba(16,43,78,0.3)]",

    holiday:
      "border-amber-500 bg-amber-500 text-white shadow-[0_12px_28px_rgba(245,158,11,0.36)]",

    leave:
      "border-indigo-700 bg-indigo-700 text-white shadow-[0_12px_28px_rgba(67,56,202,0.36)]",
  };

  return (
    <motion.button
      type="button"
      whileHover={
        !disabled
          ? {
              y: -5,
              scale: 1.02,
            }
          : undefined
      }
      whileTap={
        !disabled
          ? {
              scale: 0.95,
            }
          : undefined
      }
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-colors ${
        disabled
          ? "cursor-not-allowed border-[#102B4E]/8 bg-[#F7F9FA] opacity-40"
          : active
            ? activeStyles[tone]
            : "border-[#D5DFEA] bg-white hover:border-[#338DFD] hover:shadow-lg"
      }`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-white/20 text-white"
            : tone === "holiday"
              ? "bg-amber-100 text-amber-800"
              : tone === "leave"
                ? "bg-indigo-100 text-indigo-800"
                : "bg-[#102B4E]/[0.07] text-[#102B4E]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className={`text-[21px] font-extrabold ${
            active ? "text-white" : "text-[#102B4E]"
          }`}
        >
          {title}
        </p>

        <p
          className={`mt-0.5 text-[16px] font-semibold ${
            active ? "text-white/75" : "text-[#102B4E]/55"
          }`}
        >
          {description}
        </p>
      </div>

      {active && (
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          className="ml-auto shrink-0"
        >
          <Check size={24} strokeWidth={3.5} />
        </motion.span>
      )}
    </motion.button>
  );
}

/*
=========================================================
QUICK DATE BUTTON
=========================================================
*/

function QuickDateButton({ label, onClick, active = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.07, y: -2 }}
      whileTap={{ scale: 0.92 }}
      className={`rounded-xl border-2 px-6 py-4 text-[18px] font-extrabold transition-colors ${
        active
          ? "border-[#102B4E] bg-[#102B4E] text-white shadow-md"
          : "border-[#D5DFEA] bg-white text-[#102B4E]/75 hover:border-[#338DFD] hover:bg-[#EAF3FF] hover:text-[#1D6FD8]"
      }`}
    >
      {label}
    </motion.button>
  );
}

/*
=========================================================
MENU BUTTON
=========================================================
*/

function MenuButton({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { x: 5 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-[18px] font-extrabold transition-colors ${
        danger
          ? "text-red-700 hover:bg-red-100"
          : "text-[#102B4E] hover:bg-[#E3EFFF] hover:text-[#1D6FD8]"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {icon}

      {label}
    </motion.button>
  );
}

/*
=========================================================
HISTORY ROW
=========================================================
*/

function HistoryRow({ record, index }) {
  const config = STATUS_CONFIG[record.status];

  const Icon = config?.icon || CircleAlert;

  return (
    <motion.tr
      initial={{
        opacity: 0,
        y: 6,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: Math.min(index * 0.015, 0.25),
      }}
      className={`group transition-colors duration-200 hover:bg-[#EEF5FF] ${
        index % 2 === 1 ? "bg-[#FAFCFE]" : "bg-white"
      }`}
    >
      <td className="px-8 py-5">
        <p className="text-[18px] font-extrabold text-[#102B4E]">
          {formatHistoryDate(record.date)}
        </p>
      </td>

      <td className="px-5 py-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#102B4E] to-[#2B5C8F] text-[18px] font-extrabold text-white shadow-sm transition-transform group-hover:rotate-6 group-hover:scale-110">
            {record.student?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>

          <div>
            <p className="text-[18px] font-extrabold text-[#102B4E]">
              {record.student?.name || "Unknown student"}
            </p>

            <p className="mt-0.5 text-[15px] font-bold text-[#102B4E]/50">
              @{record.student?.username || "unknown"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-5">
        <span className="inline-flex rounded-lg bg-[#102B4E]/[0.07] px-3.5 py-1.5 text-[16px] font-extrabold text-[#102B4E]/75">
          {record.batch || record.student?.batch || "—"}
        </span>
      </td>

      <td className="px-5 py-5">
        <span
          className={`inline-flex items-center gap-2 rounded-lg border-2 px-3.5 py-2 text-[16px] font-extrabold ${
            config?.badge || "border-gray-200 bg-gray-50 text-gray-700"
          }`}
        >
          <Icon size={19} />

          {config?.label || record.status}
        </span>
      </td>

      <td className="max-w-[260px] px-5 py-5">
        {record.remarks ? (
          <div className="flex items-start gap-2 text-[16px] font-semibold leading-6 text-[#102B4E]/70">
            <MessageSquareText
              size={19}
              className="mt-0.5 shrink-0 text-[#338DFD]"
            />

            <span className="line-clamp-2">{record.remarks}</span>
          </div>
        ) : (
          <span className="text-[18px] text-[#102B4E]/30">—</span>
        )}
      </td>

      <td className="px-8 py-5">
        {record.student?.isActive ? (
          <span className="inline-flex items-center gap-2 text-[16px] font-extrabold text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-[16px] font-extrabold text-[#102B4E]/55">
            <span className="h-2.5 w-2.5 rounded-full bg-[#102B4E]/30" />
            Inactive
          </span>
        )}
      </td>
    </motion.tr>
  );
}

/*
=========================================================
NO STUDENTS FOR DATE
=========================================================
*/

function NoStudentsForDate({ date, batch }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[380px] items-center justify-center px-6 py-14"
    >
      <div className="max-w-xl text-center">
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#102B4E] text-white shadow-lg"
        >
          <CalendarDays size={34} />
        </motion.div>

        <h3 className="mt-6 text-[30px] font-extrabold text-[#102B4E]">
          No eligible students on this date
        </h3>

        <p className="mt-3 text-[19px] font-semibold leading-8 text-[#102B4E]/65">
          There were no students from{" "}
          <span className="font-extrabold text-[#102B4E]">{batch}</span>{" "}
          eligible for attendance on{" "}
          <span className="font-extrabold text-[#102B4E]">
            {formatDate(date)}
          </span>
          .
        </p>

        <div className="mx-auto mt-6 max-w-lg rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4 text-left">
          <p className="text-[18px] font-extrabold text-amber-900">
            Course-period protection
          </p>

          <p className="mt-1 text-[16px] font-semibold leading-6 text-amber-900/80">
            Students appear in attendance only during their eligible course
            period. Students who joined later are not marked and are not sent to
            the save request.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/*
=========================================================
LOADING
=========================================================
*/

function LoadingState() {
  return (
    <div className="flex min-h-[340px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#102B4E] text-white shadow-lg">
          <Loader2 size={36} className="animate-spin" />
        </div>

        <p className="mt-5 text-[22px] font-extrabold text-[#102B4E]">
          Loading attendance...
        </p>
      </div>
    </div>
  );
}

/*
=========================================================
EMPTY STATE
=========================================================
*/

function EmptyState({ icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[320px] items-center justify-center px-6 py-12"
    >
      <div className="max-w-md text-center">
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#102B4E] text-white shadow-lg"
        >
          {icon}
        </motion.div>

        <h3 className="mt-6 text-[30px] font-extrabold text-[#102B4E]">
          {title}
        </h3>

        <p className="mt-3 text-[19px] font-semibold leading-8 text-[#102B4E]/65">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default AdminAttendance;
