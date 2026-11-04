import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  CalendarDays,
  Clock3,
  KeyRound,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  X,
  LogOut,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Pencil,
} from "lucide-react";

import { API_URL } from "../config";

const FONT_FAMILY = '"Times New Roman", Times, serif';

const fieldClass =
  "w-full rounded-xl border-2 border-[#D9E1EC] bg-white px-4 py-4 text-[18px] font-bold text-[#10243E] outline-none transition-all duration-200 placeholder:font-semibold placeholder:text-[#8A97A8] hover:-translate-y-0.5 hover:border-[#8DB8F7] hover:shadow-md focus:-translate-y-0.5 focus:border-[#338DFD] focus:shadow-lg focus:ring-4 focus:ring-[#338DFD]/15";

const labelClass =
  "mb-2 block text-[15px] font-extrabold uppercase tracking-[0.1em] text-[#10243E]/70";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #338DFD, #38BDF8)",
  "linear-gradient(135deg, #49C4A5, #34D399)",
  "linear-gradient(135deg, #8B5CF6, #C084FC)",
  "linear-gradient(135deg, #F59E0B, #FBBF24)",
  "linear-gradient(135deg, #E11D58, #FB7185)",
  "linear-gradient(135deg, #0891B2, #22D3EE)",
];

const getAvatarGradient = (name) => {
  const code = (name || "?").charCodeAt(0) || 0;

  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
};

/*
=========================================================
DURATION PRESETS
=========================================================
Quick buttons in the Create modal. Admin can still type
ANY number + choose days / months.
*/

const DURATION_PRESETS = [
  { value: 30, unit: "days", label: "30 days" },
  { value: 45, unit: "days", label: "45 days" },
  { value: 1, unit: "months", label: "1 month" },
  { value: 3, unit: "months", label: "3 months" },
  { value: 6, unit: "months", label: "6 months" },
  { value: 12, unit: "months", label: "12 months" },
];

/*
=========================================================
DATE HELPERS
=========================================================
*/

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/*
  Course end date (joining day included).
  Same logic as backend utils/courseDuration.js

    1 Nov + 30 days   -> 30 Nov
    1 Nov + 45 days   -> 15 Dec
    1 Nov + 2 months  -> 31 Dec
    31 Jan + 1 month  -> 27/28 Feb
*/
const calculateCourseEndDate = (
  joiningDate,
  durationValue,
  durationUnit = "months",
) => {
  if (!joiningDate || !durationValue) return null;

  const startDate = new Date(`${joiningDate}T00:00:00`);
  const value = Number(durationValue);

  if (
    Number.isNaN(startDate.getTime()) ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    return null;
  }

  const endDate = new Date(startDate);

  if (durationUnit === "days") {
    endDate.setDate(endDate.getDate() + value - 1);
    return endDate;
  }

  const originalDay = startDate.getDate();

  endDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + value);

  const lastDayOfTargetMonth = new Date(
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    0,
  ).getDate();

  endDate.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  endDate.setDate(endDate.getDate() - 1);

  return endDate;
};

/* "1 month", "45 days", "6 months" */
const formatDuration = (value, unit = "months") => {
  if (!value) return "Not configured";

  const label = unit === "days" ? "day" : "month";

  return `${value} ${label}${Number(value) === 1 ? "" : "s"}`;
};

/* Safe read for OLD students that only have durationMonths */
const getDuration = (student) => ({
  value: student.durationValue ?? student.durationMonths,
  unit: student.durationUnit || "months",
});

/* Calendar-day key (YYYY-MM-DD) for comparing dates safely */
const localDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

/* Backend dates are stored at UTC midnight */
const backendDateKey = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

/*
=========================================================
COURSE STATUS
=========================================================
*/

const getStatusStyles = (status) => {
  const styles = {
    upcoming: {
      label: "Upcoming",
      className: "bg-[#338DFD]/12 text-[#1D6FD8]",
      dot: "bg-[#338DFD]",
    },

    ongoing: {
      label: "Ongoing",
      className: "bg-[#49C4A5]/15 text-[#177A62]",
      dot: "bg-[#49C4A5]",
    },

    completed: {
      label: "Completed",
      className: "bg-[#10243E]/8 text-[#10243E]/65",
      dot: "bg-[#10243E]/40",
    },

    left_early: {
      label: "Left early",
      className: "bg-amber-100 text-amber-800",
      dot: "bg-amber-500",
    },

    paused: {
      label: "Paused",
      className: "bg-purple-100 text-purple-700",
      dot: "bg-purple-500",
    },
  };

  return styles[status] || styles.ongoing;
};

/*
=========================================================
ATTENDANCE HELPERS
=========================================================
Attendance % = present / (present + absent) * 100
(public holidays and Jashna leave are not counted).
The backend sends `attendanceStats` with every student.
*/

const getAttendanceTone = (percentage, countedClasses) => {
  if (!countedClasses) {
    return {
      text: "text-[#10243E]/45",
      bar: "bg-[#10243E]/20",
    };
  }

  if (percentage >= 75) {
    return {
      text: "text-[#177A62]",
      bar: "bg-gradient-to-r from-[#1FA886] to-[#49C4A5]",
    };
  }

  if (percentage >= 50) {
    return {
      text: "text-amber-600",
      bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
    };
  }

  return {
    text: "text-red-600",
    bar: "bg-gradient-to-r from-red-500 to-rose-400",
  };
};

/* "Day 12 / 180" using the same numbers as the student's own profile */
const getJourneyDayLabel = (progress) => {
  const totalDays = Number(progress?.totalDays || 0);
  const elapsedDays = Number(progress?.daysElapsed || 0);

  if (!totalDays) return null;

  if (elapsedDays <= 0) return "Not started";

  return `Day ${Math.min(elapsedDays, totalDays)} / ${totalDays}`;
};

/*
=========================================================
MAIN COMPONENT
=========================================================
*/

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  /* BATCH FILTER ("all" or the exact batch timing text) */

  const [batchFilter, setBatchFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showMenu, setShowMenu] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [temporaryPassword, setTemporaryPassword] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  /* DELETE CONFIRMATION STATE */

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [studentToDelete, setStudentToDelete] = useState(null);

  /* MODAL STATE */

  const [showExtendModal, setShowExtendModal] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  /* EDIT NAME MODAL STATE */

  const [showEditNameModal, setShowEditNameModal] = useState(false);

  const [editName, setEditName] = useState("");

  /* CREATE FORM */

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    batchId: "",
    joiningDate: "",
    durationValue: "6",
    durationUnit: "months",
  });

  /* EXTENSION FORM (value + unit, so a 30-day course can become 2 months) */

  const [extensionValue, setExtensionValue] = useState("");
  const [extensionUnit, setExtensionUnit] = useState("months");

  /* LEAVE FORM */

  const [leaveData, setLeaveData] = useState({
    actualExitDate: "",
    exitReason: "",
  });

  /* CALCULATED END DATE (create form) */

  const calculatedEndDate = useMemo(
    () =>
      calculateCourseEndDate(
        formData.joiningDate,
        formData.durationValue,
        formData.durationUnit,
      ),
    [formData.joiningDate, formData.durationValue, formData.durationUnit],
  );

  /* NEW END DATE PREVIEW (extend form) */

  const extensionEndDate = useMemo(() => {
    if (!selectedStudent || !extensionValue) return null;

    return calculateCourseEndDate(
      backendDateKey(selectedStudent.joiningDate),
      extensionValue,
      extensionUnit,
    );
  }, [selectedStudent, extensionValue, extensionUnit]);

  /*
  ========================================================
  FETCH STUDENTS
  ========================================================
  */

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch students");
      }

      setStudents(data.students || []);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /*
  ========================================================
  FETCH ACTIVE BATCHES
  ========================================================
  */

  const fetchBatches = async () => {
    try {
      setBatchesLoading(true);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/batches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch batches");
      }

      const allBatches = Array.isArray(data.batches)
        ? data.batches
        : Array.isArray(data)
          ? data
          : [];

      setBatches(allBatches.filter((batch) => batch.isActive));
    } catch (error) {
      console.error("Fetch batches error:", error);
      setError(error.message || "Failed to load batches.");
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  /*
  ========================================================
  BATCH FILTER OPTIONS
  ========================================================
  Every batch that students currently belong to (with a
  student count), plus active batches that are still empty.
  */

  const batchOptions = useMemo(() => {
    const counts = new Map();

    students.forEach((student) => {
      const timing = student.batch?.trim();

      if (timing) {
        counts.set(timing, (counts.get(timing) || 0) + 1);
      }
    });

    batches.forEach((batch) => {
      const timing = batch.timing?.trim();

      if (timing && !counts.has(timing)) {
        counts.set(timing, 0);
      }
    });

    return [...counts.entries()]
      .map(([timing, count]) => ({ timing, count }))
      .sort((first, second) =>
        first.timing.localeCompare(second.timing, undefined, {
          numeric: true,
        }),
      );
  }, [students, batches]);

  /*
  ========================================================
  FILTER STUDENTS
  ========================================================
  */

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        student.name?.toLowerCase().includes(searchValue) ||
        student.username?.toLowerCase().includes(searchValue) ||
        student.batch?.toLowerCase().includes(searchValue);

      let matchesStatus = true;

      if (statusFilter === "active") {
        matchesStatus = student.isActive;
      }

      if (statusFilter === "inactive") {
        matchesStatus = !student.isActive;
      }

      if (statusFilter === "upcoming") {
        matchesStatus = student.courseProgress?.status === "upcoming";
      }

      if (statusFilter === "ongoing") {
        matchesStatus = student.courseProgress?.status === "ongoing";
      }

      if (statusFilter === "paused") {
        matchesStatus = student.courseProgress?.status === "paused";
      }

      if (statusFilter === "completed") {
        matchesStatus = student.courseProgress?.status === "completed";
      }

      if (statusFilter === "left_early") {
        matchesStatus = student.courseProgress?.status === "left_early";
      }

      const matchesBatch =
        batchFilter === "all" || student.batch?.trim() === batchFilter;

      return matchesSearch && matchesStatus && matchesBatch;
    });
  }, [students, search, statusFilter, batchFilter]);

  /* STATS */

  const activeCount = students.filter((student) => student.isActive).length;

  const inactiveCount = students.filter((student) => !student.isActive).length;

  const ongoingCount = students.filter(
    (student) => student.courseProgress?.status === "ongoing",
  ).length;

  /* FORM CHANGE */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  ========================================================
  CREATE STUDENT
  ========================================================
  */

  const handleCreateStudent = async (event) => {
    event.preventDefault();

    setActionLoading(true);
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter the student's name.");
      setActionLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError("Please enter a username.");
      setActionLoading(false);
      return;
    }

    if (!formData.batchId) {
      setError("Please select a batch.");
      setActionLoading(false);
      return;
    }

    if (!formData.joiningDate) {
      setError("Please select a joining date.");
      setActionLoading(false);
      return;
    }

    if (
      !Number.isInteger(Number(formData.durationValue)) ||
      Number(formData.durationValue) < 1
    ) {
      setError("Course duration must be a whole number of at least 1.");
      setActionLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      const selectedBatch = batches.find(
        (batch) => batch._id === formData.batchId,
      );

      if (!selectedBatch) {
        throw new Error(
          "The selected batch is unavailable. Please refresh the batch list.",
        );
      }

      const response = await fetch(`${API_URL}/api/students`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: formData.name.trim(),
          username: formData.username.trim().toLowerCase(),

          batchId: formData.batchId,
          batch: selectedBatch.timing,

          joiningDate: formData.joiningDate,

          // NEW: value + unit instead of durationMonths
          durationValue: Number(formData.durationValue),
          durationUnit: formData.durationUnit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create student");
      }

      await fetchStudents();

      setTemporaryPassword(data.temporaryPassword);
      setSelectedStudent(data.student);

      setFormData({
        name: "",
        username: "",
        batchId: "",
        joiningDate: "",
        durationValue: "6",
        durationUnit: "months",
      });

      setShowCreateModal(false);
    } catch (error) {
      console.error("Create student error:", error);
      setError(error.message || "Failed to create student.");
    } finally {
      setActionLoading(false);
    }
  };

  /*
  ========================================================
  TOGGLE ACCOUNT STATUS
  ========================================================
  */

  const handleToggleStatus = async (student) => {
    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/students/${student._id}/status`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      await fetchStudents();

      setShowMenu(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /*
  ========================================================
  RESET PASSWORD
  ========================================================
  */

  const handleResetPassword = async (student) => {
    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/students/${student._id}/reset-password`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSelectedStudent(student);

      setTemporaryPassword(data.temporaryPassword);

      setShowMenu(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /*
  ========================================================
  EDIT STUDENT NAME
  ========================================================
  Only the display name changes. Username, batch, dates,
  attendance and every other saved record stay untouched.
  */

  const openEditNameModal = (student) => {
    setSelectedStudent(student);

    setEditName(student.name || "");

    setError("");

    setShowEditNameModal(true);

    setShowMenu(null);
  };

  const handleEditName = async (event) => {
    event.preventDefault();

    if (!selectedStudent) return;

    const trimmedName = editName.trim().replace(/\s+/g, " ");

    if (!trimmedName) {
      setError("Please enter the student's name.");
      return;
    }

    if (trimmedName === selectedStudent.name) {
      setError("The new name is the same as the current name.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/students/${selectedStudent._id}/name`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ name: trimmedName }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update name");
      }

      await fetchStudents();

      setShowEditNameModal(false);
      setSelectedStudent(null);
      setEditName("");
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /*
  ========================================================
  OPEN EXTENSION MODAL
  ========================================================
  Pre-fills "current duration + a sensible step"
  (+15 days for day-courses, +3 months for month-courses).
  */

  const openExtendModal = (student) => {
    const { value, unit } = getDuration(student);

    setSelectedStudent(student);

    setExtensionUnit(unit);
    setExtensionValue(String(Number(value) + (unit === "days" ? 15 : 3)));

    setShowExtendModal(true);

    setShowMenu(null);
  };

  /*
  ========================================================
  EXTEND COURSE
  ========================================================
  Rule: the NEW end date must be later than the CURRENT end
  date. This works even if admin switches the unit
  (e.g. 30 days -> 2 months).
  */

  const handleExtendCourse = async (event) => {
    event.preventDefault();

    if (!selectedStudent) return;

    const newValue = Number(extensionValue);

    if (!Number.isInteger(newValue) || newValue < 1) {
      setError("Duration must be a whole number of at least 1.");
      return;
    }

    if (!extensionEndDate) {
      setError("Please enter a valid duration.");
      return;
    }

    const currentEndKey = backendDateKey(selectedStudent.courseEndDate);
    const newEndKey = localDateKey(extensionEndDate);

    if (newEndKey <= currentEndKey) {
      const { value, unit } = getDuration(selectedStudent);

      setError(
        `New duration must end after the current end date. Current: ${formatDuration(
          value,
          unit,
        )} (ends ${formatDate(selectedStudent.courseEndDate)}).`,
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/students/${selectedStudent._id}/course-duration`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            durationValue: newValue,
            durationUnit: extensionUnit,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to extend course");
      }

      await fetchStudents();

      setShowExtendModal(false);
      setSelectedStudent(null);
      setExtensionValue("");
      setExtensionUnit("months");
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /*
  ========================================================
  OPEN LEAVE MODAL
  ========================================================
  */

  const openLeaveModal = (student) => {
    setSelectedStudent(student);

    setLeaveData({
      actualExitDate: "",
      exitReason: "",
    });

    setShowLeaveModal(true);

    setShowMenu(null);
  };

  /*
  ========================================================
  MARK LEFT EARLY
  ========================================================
  */

  const handleMarkLeftEarly = async (event) => {
    event.preventDefault();

    if (!selectedStudent) return;

    if (!leaveData.actualExitDate) {
      setError("Please select the actual exit date.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/students/${selectedStudent._id}/left-early`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            actualExitDate: leaveData.actualExitDate,

            exitReason: leaveData.exitReason.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update student");
      }

      await fetchStudents();

      setShowLeaveModal(false);
      setSelectedStudent(null);

      setLeaveData({
        actualExitDate: "",
        exitReason: "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /*
  ========================================================
  PAUSE / RESUME
  ========================================================
  */

  const handlePauseResume = async (student) => {
    const status = student.courseProgress?.status;

    const isPaused = status === "paused";

    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const endpoint = isPaused ? "resume" : "pause";

      const response = await fetch(
        `${API_URL}/api/students/${student._id}/${endpoint}`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isPaused ? "resume" : "pause"} course`,
        );
      }

      await fetchStudents();

      setShowMenu(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /*
  ========================================================
  DELETE TEST ACCOUNT
  ========================================================
  Only students WITHOUT a joining date can be deleted
  from this UI.
  */

  const openDeleteConfirmation = (student) => {
    if (student.joiningDate) {
      setError(
        "Properly configured student accounts cannot be deleted from this screen.",
      );
      setShowMenu(null);
      return;
    }

    setStudentToDelete(student);
    setShowMenu(null);
    setShowConfirmModal(true);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setActionLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/students/${studentToDelete._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete student");
      }

      await fetchStudents();

      setShowConfirmModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* COPY PASSWORD */

  const copyPassword = async () => {
    if (!temporaryPassword) return;

    try {
      await navigator.clipboard.writeText(temporaryPassword);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  /* CLOSE CREDENTIAL MODAL */

  const closeCredentialModal = () => {
    setTemporaryPassword("");
    setSelectedStudent(null);
  };

  /* CLOSE DELETE MODAL */

  const closeDeleteModal = () => {
    if (actionLoading) return;

    setShowConfirmModal(false);
    setStudentToDelete(null);
  };

  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (
    <div
      className="admin-students-root min-h-screen bg-gradient-to-b from-[#F8F6EF] via-[#F3F7FC] to-[#EEF8F4]"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <style>{`
        .admin-students-root, .admin-students-root * { font-family: ${FONT_FAMILY} !important; }
        .admin-students-root code, .admin-students-root .as-mono { font-family: "Courier New", Courier, monospace !important; }
        @keyframes as-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes as-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes as-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(73,196,165,0.6); } 50% { box-shadow: 0 0 0 8px rgba(73,196,165,0); } }
        .as-hero { background: linear-gradient(120deg, #10243E, #17406E, #1D5C8F, #10243E); background-size: 300% 300%; animation: as-gradient 14s ease infinite; }
        .as-shimmer::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); transform: translateX(-120%); animation: as-shimmer 2.8s ease-in-out infinite; }
        .as-live-dot { animation: as-pulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* ===================== HEADER ===================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="as-hero relative isolate overflow-hidden rounded-[32px] border-[3px] border-[#2B5C8F] px-7 py-10 text-white shadow-[0_28px_70px_rgba(16,36,62,0.3)] sm:px-10 sm:py-12"
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mb-5 inline-flex items-center gap-3 rounded-full border-2 border-[#49C4A5]/50 bg-[#49C4A5]/15 px-5 py-2.5 text-[15px] font-extrabold uppercase tracking-[0.14em] text-[#A7F3D0]"
              >
                <span className="as-live-dot h-2.5 w-2.5 rounded-full bg-[#49C4A5]" />
                <Sparkles size={18} />
                Student Management
              </motion.div>

              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                Your{" "}
                <span className="bg-gradient-to-r from-[#7DD3FC] via-[#A7F3D0] to-[#FDE68A] bg-clip-text text-transparent">
                  Learners
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-[20px] font-semibold leading-8 text-white/85">
                Create student accounts, manage course journeys and keep every
                learner connected to their Jashna progress.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={() => {
                setError("");
                setShowCreateModal(true);
              }}
              whileHover={{ scale: 1.08, y: -5 }}
              whileTap={{ scale: 0.92 }}
              className="as-shimmer relative inline-flex shrink-0 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#49C4A5] to-[#A3E635] px-9 py-5 text-[20px] font-extrabold text-[#052E26] shadow-[0_14px_34px_rgba(73,196,165,0.5)] transition-shadow hover:shadow-[0_20px_44px_rgba(73,196,165,0.7)]"
            >
              <Plus size={26} strokeWidth={3.2} />
              Add Student
            </motion.button>
          </div>
        </motion.section>

        {/* ===================== STATS ===================== */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Students"
            value={students.length}
            accent="blue"
          />

          <StatCard
            icon={ShieldCheck}
            label="Active Accounts"
            value={activeCount}
            accent="green"
          />

          <StatCard
            icon={Clock3}
            label="Ongoing Courses"
            value={ongoingCount}
            accent="navy"
          />

          <StatCard
            icon={UserRound}
            label="Inactive"
            value={inactiveCount}
            accent="amber"
          />
        </div>

        {/* ===================== ERROR ===================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              className="mt-7 flex items-center justify-between gap-4 rounded-2xl border-[3px] border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-6 py-5 text-[19px] font-extrabold text-red-700 shadow-lg"
            >
              <span>{error}</span>

              <motion.button
                type="button"
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={24} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== TABLE CARD ===================== */}

        <div className="mt-8 overflow-hidden rounded-[30px] border-[3px] border-[#D5E0EE] bg-white shadow-[0_18px_60px_rgba(16,36,62,0.09)]">
          {/* Toolbar */}

          <div className="flex flex-col gap-4 border-b-[3px] border-[#E3EAF3] bg-gradient-to-r from-[#F3F8FF] via-white to-[#F1FBF7] p-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="relative w-full 2xl:max-w-md">
              <Search
                size={24}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students..."
                className={`${fieldClass} pl-14`}
              />
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row lg:items-center">
              {!loading && (
                <p className="whitespace-nowrap text-[18px] font-bold text-[#10243E]/70">
                  Showing{" "}
                  <span className="rounded-md bg-[#E3EFFF] px-2.5 py-0.5 font-extrabold text-[#1D6FD8]">
                    {filteredStudents.length}
                  </span>{" "}
                  of{" "}
                  <span className="rounded-md bg-[#E2F7F0] px-2.5 py-0.5 font-extrabold text-[#177A62]">
                    {students.length}
                  </span>
                </p>
              )}

              {/* Batch + status filters, always side by side */}

              <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
                <select
                  value={batchFilter}
                  onChange={(event) => setBatchFilter(event.target.value)}
                  aria-label="Filter by batch"
                  className={`${fieldClass} sm:w-[240px]`}
                >
                  <option value="all">All batches</option>

                  {batchOptions.map((batch) => (
                    <option key={batch.timing} value={batch.timing}>
                      {batch.timing} ({batch.count})
                    </option>
                  ))}
                </select>

                {/* Status filter */}

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                  className={`${fieldClass} sm:w-[240px]`}
                >
                  <option value="all">All students</option>
                  <option value="active">Active accounts</option>
                  <option value="inactive">Inactive accounts</option>
                  <option value="upcoming">Upcoming courses</option>
                  <option value="ongoing">Ongoing courses</option>
                  <option value="paused">Paused courses</option>
                  <option value="completed">Completed courses</option>
                  <option value="left_early">Left early</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}

          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-14 w-14 animate-spin rounded-full border-[5px] border-[#338DFD]/15 border-t-[#338DFD]" />

                <p className="mt-5 text-[22px] font-extrabold text-[#10243E]/60">
                  Loading students...
                </p>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  ease: "easeInOut",
                }}
                className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#338DFD] to-[#49C4A5] text-white shadow-xl"
              >
                <Users size={42} />
              </motion.div>

              <h3 className="mt-6 text-4xl font-extrabold text-[#10243E]">
                No students found
              </h3>

              <p className="mt-3 max-w-md text-[20px] font-semibold leading-8 text-[#10243E]/60">
                Try another search or create your first student account.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1720px]">
                <thead>
                  <tr className="border-b-[3px] border-[#E3EAF3] bg-gradient-to-r from-[#10243E] to-[#17406E]">
                    <TableHeading>#</TableHeading>
                    <TableHeading>Student</TableHeading>
                    <TableHeading>Username</TableHeading>
                    <TableHeading>Batch</TableHeading>
                    <TableHeading>Course</TableHeading>
                    <TableHeading>Attendance</TableHeading>
                    <TableHeading>Progress</TableHeading>
                    <TableHeading>Status</TableHeading>

                    <th className="px-6 py-5 text-right text-[15px] font-extrabold uppercase tracking-[0.16em] text-white/90">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student, index) => {
                    const progress = student.courseProgress;

                    const statusStyles = getStatusStyles(progress?.status);

                    const duration = getDuration(student);

                    const percentage = Math.min(
                      100,
                      Math.max(0, progress?.percentage || 0),
                    );

                    /*
                      Prefer the label sent by the backend ("Day 12/45",
                      "Month 2/6"). Fallback keeps old API responses working.
                    */
                    const progressLabel =
                      progress?.label ??
                      (duration.unit === "days"
                        ? formatDuration(duration.value, "days")
                        : `M ${progress?.currentMonth ?? 0}/${
                            progress?.totalMonths ?? duration.value ?? 0
                          }`);

                    /* Attendance (sent by backend as attendanceStats) */
                    const attendance = student.attendanceStats;

                    const hasAttendanceData = Boolean(attendance);

                    const countedClasses = attendance?.countedClasses ?? 0;

                    const attendancePercentage = Math.min(
                      100,
                      Math.max(0, attendance?.percentage ?? 0),
                    );

                    const attendanceTone = getAttendanceTone(
                      attendancePercentage,
                      countedClasses,
                    );

                    const journeyDayLabel = getJourneyDayLabel(progress);

                    return (
                      <motion.tr
                        key={student._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(index * 0.03, 0.3),
                          duration: 0.3,
                        }}
                        className={`group border-b-2 border-[#EDF1F7] transition-colors duration-200 hover:bg-[#EAF3FF] ${
                          index % 2 === 1 ? "bg-[#FAFCFF]" : "bg-white"
                        }`}
                      >
                        {/* Number */}

                        <td className="px-6 py-6">
                          <span className="flex h-9 min-w-[36px] items-center justify-center rounded-full bg-[#10243E]/8 px-2 text-[16px] font-extrabold text-[#10243E]/70 transition-colors group-hover:bg-[#10243E] group-hover:text-white">
                            {index + 1}
                          </span>
                        </td>

                        {/* Student */}

                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div
                              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[24px] font-extrabold text-white shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                              style={{
                                background: getAvatarGradient(student.name),
                              }}
                            >
                              {student.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <div>
                              <p className="text-[21px] font-extrabold text-[#10243E] transition-colors group-hover:text-[#1D6FD8]">
                                {student.name}
                              </p>

                              <p className="mt-0.5 text-[15px] font-bold text-[#10243E]/50">
                                Student
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Username */}

                        <td className="px-6 py-6">
                          <span className="as-mono rounded-lg bg-[#10243E]/7 px-3.5 py-2 text-[16px] font-bold text-[#10243E]/80">
                            {student.username}
                          </span>
                        </td>

                        {/* Batch */}

                        <td className="px-6 py-6">
                          <span className="rounded-lg bg-[#F1ECFE] px-3.5 py-2 text-[17px] font-extrabold text-[#6D3FD0]">
                            {student.batch || "Not assigned"}
                          </span>
                        </td>

                        {/* Course */}

                        <td className="px-6 py-6">
                          <div className="min-w-[220px]">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={19}
                                className="text-[#338DFD]"
                              />

                              <span className="text-[19px] font-extrabold text-[#10243E]">
                                {formatDuration(duration.value, duration.unit)}
                              </span>
                            </div>

                            <p className="mt-1.5 text-[16px] font-bold text-[#10243E]/60">
                              {formatDate(student.joiningDate)} →{" "}
                              {formatDate(student.courseEndDate)}
                            </p>

                            {!student.joiningDate && (
                              <p className="mt-1.5 text-[15px] font-extrabold text-red-500">
                                Missing joining date
                              </p>
                            )}

                            {student.actualExitDate && (
                              <p className="mt-1.5 text-[15px] font-extrabold text-amber-600">
                                Exit: {formatDate(student.actualExitDate)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Attendance + journey day */}

                        <td className="px-6 py-6">
                          <div className="w-[210px]">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span
                                className={`inline-flex items-center gap-1.5 text-[18px] font-extrabold ${attendanceTone.text}`}
                              >
                                <TrendingUp size={17} strokeWidth={2.8} />

                                {hasAttendanceData && countedClasses > 0
                                  ? `${attendance.percentage}%`
                                  : "—"}
                              </span>

                              <span className="text-[15px] font-bold text-[#10243E]/55">
                                {hasAttendanceData
                                  ? countedClasses > 0
                                    ? `${attendance.present}/${countedClasses} classes`
                                    : "No classes yet"
                                  : "No data"}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-[#10243E]/8">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${
                                    countedClasses > 0
                                      ? attendancePercentage
                                      : 0
                                  }%`,
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${attendanceTone.bar}`}
                              />
                            </div>

                            <p className="mt-2 flex items-center gap-1.5 text-[15px] font-extrabold text-[#10243E]/70">
                              <CalendarDays
                                size={15}
                                className="text-[#338DFD]"
                              />

                              {journeyDayLabel || "—"}
                            </p>
                          </div>
                        </td>

                        {/* Progress */}

                        <td className="px-6 py-6">
                          <div className="w-[190px]">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[18px] font-extrabold text-[#10243E]">
                                {progress?.percentage ?? 0}%
                              </span>

                              <span className="text-[15px] font-bold text-[#10243E]/55">
                                {progressLabel}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-[#10243E]/8">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-[#338DFD] to-[#49C4A5]"
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}

                        <td className="px-6 py-6">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[16px] font-extrabold ${statusStyles.className}`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${statusStyles.dot}`}
                              />

                              {statusStyles.label}
                            </span>

                            {!student.isActive && (
                              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-[13px] font-extrabold uppercase tracking-wide text-gray-500">
                                Account inactive
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action */}

                        <td className="relative px-6 py-6 text-right">
                          <motion.button
                            type="button"
                            onClick={() =>
                              setShowMenu(
                                showMenu === student._id ? null : student._id,
                              )
                            }
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                              showMenu === student._id
                                ? "bg-[#10243E] text-white"
                                : "bg-[#10243E]/6 text-[#10243E]/65 hover:bg-[#338DFD] hover:text-white"
                            }`}
                          >
                            <MoreHorizontal size={24} />
                          </motion.button>

                          <AnimatePresence>
                            {showMenu === student._id && (
                              <StudentActionMenu
                                student={student}
                                actionLoading={actionLoading}
                                onEditName={() => openEditNameModal(student)}
                                onToggleStatus={() =>
                                  handleToggleStatus(student)
                                }
                                onResetPassword={() =>
                                  handleResetPassword(student)
                                }
                                onExtend={() => openExtendModal(student)}
                                onLeaveEarly={() => openLeaveModal(student)}
                                onPauseResume={() => handlePauseResume(student)}
                                onDelete={() => openDeleteConfirmation(student)}
                              />
                            )}
                          </AnimatePresence>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===================== CREATE MODAL ===================== */}

      <AnimatePresence>
        {showCreateModal && (
          <Modal
            key="create-modal"
            title="Create student"
            onClose={() => {
              if (!actionLoading) {
                setShowCreateModal(false);
              }
            }}
          >
            <form onSubmit={handleCreateStudent} className="space-y-6">
              <Input
                label="Student name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Ananya Sharma"
                required
              />

              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                placeholder="e.g. ananya01"
                required
              />

              {/* Batch Selection */}

              <div>
                <label className={labelClass}>Batch timing</label>

                <select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleFormChange}
                  required
                  disabled={batchesLoading || batches.length === 0}
                  className={fieldClass}
                >
                  <option value="">
                    {batchesLoading
                      ? "Loading batches..."
                      : batches.length === 0
                        ? "No active batches available"
                        : "Select a batch"}
                  </option>

                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.timing}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-[15px] font-semibold text-[#10243E]/55">
                  Only active batches from Admin Settings are available.
                </p>

                {!batchesLoading && batches.length === 0 && (
                  <button
                    type="button"
                    onClick={fetchBatches}
                    className="mt-2 font-extrabold text-[#1D6FD8] hover:underline"
                  >
                    Refresh batches
                  </button>
                )}
              </div>

              {/* Joining Date */}

              <div>
                <label className={labelClass}>Joining date</label>

                <div className="relative">
                  <CalendarDays
                    size={22}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
                  />

                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleFormChange}
                    required
                    className={`${fieldClass} pl-13`}
                    style={{ paddingLeft: "3.25rem" }}
                  />
                </div>
              </div>

              {/* Duration: value + unit + presets */}

              <div>
                <label className={labelClass}>Course duration</label>

                <div className="grid grid-cols-[1fr_170px] gap-3">
                  <div className="relative">
                    <Clock3
                      size={22}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
                    />

                    <input
                      type="number"
                      name="durationValue"
                      value={formData.durationValue}
                      onChange={handleFormChange}
                      min="1"
                      step="1"
                      required
                      className={fieldClass}
                      style={{ paddingLeft: "3.25rem" }}
                    />
                  </div>

                  <select
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleFormChange}
                    className={fieldClass}
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((preset) => {
                    const active =
                      Number(formData.durationValue) === preset.value &&
                      formData.durationUnit === preset.unit;

                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setFormData((previous) => ({
                            ...previous,
                            durationValue: String(preset.value),
                            durationUnit: preset.unit,
                          }))
                        }
                        className={`rounded-full border-2 px-4 py-1.5 text-[15px] font-extrabold transition-colors ${
                          active
                            ? "border-[#338DFD] bg-[#338DFD] text-white"
                            : "border-[#D5E0EE] bg-white text-[#10243E] hover:border-[#8DB8F7]"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-[16px] font-semibold text-[#10243E]/55">
                  Choose any duration, from a short workshop to a long course.
                </p>
              </div>

              {/* Calculated Course End */}

              <div className="rounded-2xl border-[3px] border-[#338DFD]/20 bg-gradient-to-br from-[#338DFD]/10 to-[#49C4A5]/12 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#338DFD] shadow-sm">
                    <CalendarDays size={23} />
                  </div>

                  <div>
                    <p className="text-[14px] font-extrabold uppercase tracking-[0.15em] text-[#10243E]/55">
                      Planned course end
                    </p>

                    <p className="mt-1 text-[24px] font-extrabold text-[#10243E]">
                      {calculatedEndDate
                        ? formatDate(calculatedEndDate)
                        : "Select a joining date and valid duration"}
                    </p>

                    {calculatedEndDate && (
                      <p className="mt-1 text-[16px] font-semibold text-[#10243E]/60">
                        Automatically calculated from joining date and course
                        duration.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password info */}

              <div className="rounded-2xl border-2 border-[#338DFD]/15 bg-[#338DFD]/8 p-5">
                <div className="flex gap-3">
                  <KeyRound
                    size={22}
                    className="mt-0.5 shrink-0 text-[#338DFD]"
                  />

                  <p className="text-[17px] font-semibold leading-7 text-[#10243E]/75">
                    Jashna will automatically generate a temporary password. The
                    student will be asked to create their personal password
                    during first login.
                  </p>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={actionLoading}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#338DFD] to-[#49C4A5] px-5 py-4 text-[20px] font-extrabold text-white shadow-lg transition-shadow hover:shadow-2xl disabled:opacity-60"
              >
                {actionLoading ? "Creating..." : "Create student"}
              </motion.button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===================== CREDENTIAL MODAL ===================== */}

      <AnimatePresence>
        {temporaryPassword && selectedStudent && (
          <Modal
            key="credential-modal"
            title="Student account ready"
            onClose={closeCredentialModal}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#49C4A5] to-[#34D399] text-white shadow-lg"
              >
                <Check size={38} strokeWidth={3.5} />
              </motion.div>

              <h3 className="mt-5 text-[32px] font-extrabold text-[#10243E]">
                {selectedStudent.name}
              </h3>

              <p className="mt-2 text-[19px] font-semibold text-[#10243E]/65">
                Give these credentials to the student securely.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <CredentialRow
                label="Username"
                value={selectedStudent.username}
              />

              <CredentialRow
                label="Temporary password"
                value={temporaryPassword}
                copy
                onCopy={copyPassword}
              />
            </div>

            <div className="mt-5 rounded-2xl border-2 border-[#49C4A5]/30 bg-[#49C4A5]/10 p-5">
              <p className="text-[17px] font-bold leading-7 text-[#177A62]">
                This temporary password is shown only now. The student must
                change it during their first login.
              </p>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===================== EDIT NAME MODAL ===================== */}

      <AnimatePresence>
        {showEditNameModal && selectedStudent && (
          <Modal
            key="edit-name-modal"
            title="Edit student name"
            onClose={() => {
              if (!actionLoading) {
                setShowEditNameModal(false);
              }
            }}
          >
            <form onSubmit={handleEditName} className="space-y-6">
              <div className="rounded-2xl border-2 border-[#E3EAF3] bg-gradient-to-br from-[#F8F6EF] to-[#F3F8FF] p-6">
                <p className="text-[14px] font-extrabold uppercase tracking-[0.15em] text-[#10243E]/55">
                  Current name
                </p>

                <p className="mt-2 text-[28px] font-extrabold text-[#10243E]">
                  {selectedStudent.name}
                </p>

                <p className="mt-1 text-[18px] font-bold text-[#10243E]/65">
                  Username: {selectedStudent.username}
                </p>
              </div>

              <Input
                label="New name"
                name="editName"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="e.g. Ananya Sharma"
                maxLength={80}
                autoFocus
                required
              />

              <div className="rounded-2xl border-2 border-[#49C4A5]/30 bg-[#49C4A5]/10 p-5">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={22}
                    className="mt-0.5 shrink-0 text-[#177A62]"
                  />

                  <p className="text-[17px] font-bold leading-7 text-[#177A62]">
                    Only the name changes. Username, batch, attendance, tasks
                    and all saved history stay exactly as they are. The student
                    will see the new name everywhere.
                  </p>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={actionLoading}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#338DFD] to-[#49C4A5] px-5 py-4 text-[20px] font-extrabold text-white shadow-lg transition-shadow hover:shadow-2xl disabled:opacity-60"
              >
                {actionLoading ? "Saving..." : "Save name"}
              </motion.button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===================== EXTEND COURSE MODAL ===================== */}

      <AnimatePresence>
        {showExtendModal && selectedStudent && (
          <Modal
            key="extend-modal"
            title="Extend course"
            onClose={() => {
              if (!actionLoading) {
                setShowExtendModal(false);
              }
            }}
          >
            <form onSubmit={handleExtendCourse} className="space-y-6">
              <div className="rounded-2xl border-2 border-[#E3EAF3] bg-gradient-to-br from-[#F8F6EF] to-[#F3F8FF] p-6">
                <p className="text-[14px] font-extrabold uppercase tracking-[0.15em] text-[#10243E]/55">
                  Student
                </p>

                <p className="mt-2 text-[28px] font-extrabold text-[#10243E]">
                  {selectedStudent.name}
                </p>

                <p className="mt-1 text-[18px] font-bold text-[#10243E]/65">
                  Current duration:{" "}
                  {formatDuration(
                    getDuration(selectedStudent).value,
                    getDuration(selectedStudent).unit,
                  )}{" "}
                  (ends {formatDate(selectedStudent.courseEndDate)})
                </p>
              </div>

              <div>
                <label className={labelClass}>New total duration</label>

                <div className="grid grid-cols-[1fr_170px] gap-3">
                  <div className="relative">
                    <Clock3
                      size={22}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
                    />

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={extensionValue}
                      onChange={(event) =>
                        setExtensionValue(event.target.value)
                      }
                      className={fieldClass}
                      style={{ paddingLeft: "3.25rem" }}
                    />
                  </div>

                  <select
                    value={extensionUnit}
                    onChange={(event) => setExtensionUnit(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                  </select>
                </div>

                <p className="mt-2 text-[16px] font-semibold leading-6 text-[#10243E]/55">
                  Enter the new total duration from the joining date, not the
                  extra time. The new end date must be later than the current
                  one.
                </p>
              </div>

              {extensionEndDate && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-[3px] border-[#49C4A5]/30 bg-[#49C4A5]/10 p-5"
                >
                  <p className="text-[14px] font-extrabold uppercase tracking-[0.15em] text-[#177A62]">
                    New planned course end
                  </p>

                  <p className="mt-1 text-[26px] font-extrabold text-[#10243E]">
                    {formatDate(extensionEndDate)}
                  </p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={actionLoading}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#338DFD] to-[#49C4A5] px-5 py-4 text-[20px] font-extrabold text-white shadow-lg transition-shadow hover:shadow-2xl disabled:opacity-60"
              >
                {actionLoading ? "Updating..." : "Extend course"}
              </motion.button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===================== LEFT EARLY MODAL ===================== */}

      <AnimatePresence>
        {showLeaveModal && selectedStudent && (
          <Modal
            key="leave-modal"
            title="Mark left early"
            onClose={() => {
              if (!actionLoading) {
                setShowLeaveModal(false);
              }
            }}
          >
            <form onSubmit={handleMarkLeftEarly} className="space-y-6">
              <div className="rounded-2xl border-[3px] border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <LogOut
                    size={24}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-[17px] font-bold leading-7 text-amber-800">
                    This records the student's actual exit while preserving
                    their historical course data.
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Actual exit date</label>

                <input
                  type="date"
                  value={leaveData.actualExitDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(event) =>
                    setLeaveData((previous) => ({
                      ...previous,
                      actualExitDate: event.target.value,
                    }))
                  }
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Reason
                  <span className="ml-1 normal-case font-semibold text-[#10243E]/45">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={leaveData.exitReason}
                  onChange={(event) =>
                    setLeaveData((previous) => ({
                      ...previous,
                      exitReason: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="e.g. Relocated to another city"
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <motion.button
                type="submit"
                disabled={actionLoading}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-4 text-[20px] font-extrabold text-white shadow-lg transition-shadow hover:shadow-2xl disabled:opacity-60"
              >
                {actionLoading ? "Updating..." : "Mark left early"}
              </motion.button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}

      <AnimatePresence>
        {showConfirmModal && studentToDelete && (
          <Modal
            key="delete-modal"
            title="Delete test account?"
            onClose={closeDeleteModal}
          >
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 ring-4 ring-red-100">
                <Trash2 size={36} strokeWidth={2.5} />
              </div>

              <h3 className="mt-5 text-[32px] font-extrabold text-[#10243E]">
                {studentToDelete.name}
              </h3>

              <p className="mt-2 text-[19px] font-semibold leading-8 text-[#10243E]/65">
                This account does not have a joining date and appears to be an
                old or test student record.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border-[3px] border-red-200 bg-red-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle
                  size={24}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <p className="text-[17px] font-bold leading-7 text-red-700">
                  Deleting the account is permanent. The student account and its
                  stored records associated with this delete operation will be
                  removed by the backend.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row-reverse">
              <motion.button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteStudent}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-5 py-4 text-[19px] font-extrabold text-white shadow-lg transition-shadow hover:shadow-2xl disabled:opacity-60"
              >
                <Trash2 size={22} />
                {actionLoading ? "Deleting..." : "Delete account"}
              </motion.button>

              <motion.button
                type="button"
                disabled={actionLoading}
                onClick={closeDeleteModal}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-1 items-center justify-center rounded-xl border-[3px] border-[#D5E0EE] bg-white px-5 py-4 text-[19px] font-extrabold text-[#10243E] transition-colors hover:bg-[#F3F7FC] disabled:opacity-60"
              >
                Cancel
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
=========================================================
TABLE HEADING
=========================================================
*/

function TableHeading({ children }) {
  return (
    <th className="px-6 py-5 text-left text-[15px] font-extrabold uppercase tracking-[0.16em] text-white/90">
      {children}
    </th>
  );
}

/*
=========================================================
STUDENT ACTION MENU
=========================================================
*/

function StudentActionMenu({
  student,
  actionLoading,
  onEditName,
  onToggleStatus,
  onResetPassword,
  onExtend,
  onLeaveEarly,
  onPauseResume,
  onDelete,
}) {
  const status = student.courseProgress?.status;

  const isPaused = status === "paused";

  const canPause = status === "ongoing" || status === "upcoming";

  const canLeaveEarly = status === "ongoing";

  /* Delete is restricted to incomplete/test records with no joining date. */
  const canDelete = !student.joiningDate;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="absolute right-5 top-[4.5rem] z-20 w-80 overflow-hidden rounded-2xl border-[3px] border-[#D5E0EE] bg-white p-2 text-left shadow-[0_22px_55px_rgba(16,36,62,0.22)]"
    >
      <ActionButton disabled={actionLoading} onClick={onEditName} tone="blue">
        <Pencil size={21} />
        Edit name
      </ActionButton>

      <ActionButton
        disabled={actionLoading}
        onClick={onToggleStatus}
        tone="blue"
      >
        <ShieldCheck size={21} />

        {student.isActive ? "Deactivate account" : "Activate account"}
      </ActionButton>

      <ActionButton
        disabled={actionLoading}
        onClick={onResetPassword}
        tone="purple"
      >
        <KeyRound size={21} />
        Reset password
      </ActionButton>

      <ActionButton disabled={actionLoading} onClick={onExtend} tone="green">
        <RotateCcw size={21} />
        Extend course
      </ActionButton>

      {canPause || isPaused ? (
        <ActionButton
          disabled={actionLoading}
          onClick={onPauseResume}
          tone="blue"
        >
          {isPaused ? <Play size={21} /> : <Pause size={21} />}

          {isPaused ? "Resume course" : "Pause course"}
        </ActionButton>
      ) : null}

      {canLeaveEarly && (
        <>
          <div className="my-2 border-t-2 border-[#10243E]/8" />

          <ActionButton
            disabled={actionLoading}
            onClick={onLeaveEarly}
            tone="amber"
          >
            <LogOut size={21} />
            Mark left early
          </ActionButton>
        </>
      )}

      {canDelete && (
        <>
          <div className="my-2 border-t-2 border-[#10243E]/8" />

          <ActionButton disabled={actionLoading} onClick={onDelete} tone="red">
            <Trash2 size={21} />
            Delete test account
          </ActionButton>
        </>
      )}
    </motion.div>
  );
}

/*
=========================================================
ACTION BUTTON
=========================================================
*/

const ACTION_TONES = {
  blue: "text-[#10243E] hover:bg-[#E3EFFF] hover:text-[#1D6FD8]",
  purple: "text-[#10243E] hover:bg-[#F1ECFE] hover:text-[#6D3FD0]",
  green: "text-[#10243E] hover:bg-[#E2F7F0] hover:text-[#177A62]",
  amber: "text-amber-700 hover:bg-amber-100 hover:text-amber-800",
  red: "text-red-600 hover:bg-red-100 hover:text-red-700",
};

function ActionButton({ children, onClick, disabled, tone = "blue" }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.96 }}
      className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-[18px] font-extrabold transition-colors disabled:opacity-50 ${
        ACTION_TONES[tone] || ACTION_TONES.blue
      }`}
    >
      {children}
    </motion.button>
  );
}

/*
=========================================================
STAT CARD
=========================================================
*/

function StatCard({ icon: Icon, label, value, accent }) {
  const styles = {
    blue: {
      gradient: "linear-gradient(135deg, #338DFD, #38BDF8)",
      shadow: "rgba(51,141,253,0.32)",
    },

    green: {
      gradient: "linear-gradient(135deg, #1FA886, #49C4A5)",
      shadow: "rgba(31,168,134,0.32)",
    },

    navy: {
      gradient: "linear-gradient(135deg, #10243E, #2B5C8F)",
      shadow: "rgba(16,36,62,0.32)",
    },

    amber: {
      gradient: "linear-gradient(135deg, #EA580C, #FBBF24)",
      shadow: "rgba(234,88,12,0.3)",
    },
  };

  const style = styles[accent] || styles.blue;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="relative cursor-default overflow-hidden rounded-3xl p-6 text-white"
      style={{
        background: style.gradient,
        boxShadow: `0 16px 36px ${style.shadow}`,
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
      <div className="pointer-events-none absolute -bottom-10 right-12 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between">
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
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 backdrop-blur">
          <Icon size={27} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
}

/*
=========================================================
INPUT
=========================================================
*/

function Input({ label, ...props }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>

      <input {...props} className={fieldClass} />
    </div>
  );
}

/*
=========================================================
MODAL
=========================================================
*/

function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#10243E]/55 px-5 py-8 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[32px] border-[3px] border-[#D5E0EE] bg-white p-7 shadow-[0_30px_90px_rgba(16,36,62,0.3)] sm:p-9"
      >
        <div className="mb-7 flex items-center justify-between gap-4 border-b-[3px] border-[#EDF1F7] pb-5">
          <h2 className="text-[34px] font-extrabold leading-tight tracking-tight text-[#10243E]">
            {title}
          </h2>

          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ rotate: 90, scale: 1.12 }}
            whileTap={{ scale: 0.85 }}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10243E]/6 text-[#10243E]/60 transition-colors hover:bg-red-100 hover:text-red-600"
          >
            <X size={24} />
          </motion.button>
        </div>

        {children}
      </motion.div>
    </motion.div>
  );
}

/*
=========================================================
CREDENTIAL ROW
=========================================================
*/

function CredentialRow({ label, value, copy, onCopy }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border-[3px] border-[#D5E0EE] bg-gradient-to-br from-[#F8F6EF] to-[#F3F8FF] p-5 transition-shadow hover:shadow-lg"
    >
      <p className="text-[14px] font-extrabold uppercase tracking-[0.15em] text-[#10243E]/55">
        {label}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="as-mono break-all text-[21px] font-bold text-[#10243E]">
          {value}
        </p>

        {copy && (
          <motion.button
            type="button"
            onClick={onCopy}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.8 }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#338DFD] text-white shadow-md transition-shadow hover:shadow-xl"
            title="Copy"
          >
            <Copy size={21} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default AdminStudents;
