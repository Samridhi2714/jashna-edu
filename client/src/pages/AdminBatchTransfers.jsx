import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { API_URL as BASE_URL } from "../config";

import {
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpDown,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  History,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

const API_BASE_URL = BASE_URL.replace(/\/+$/, "");

const getHeaders = () => {
  const token = localStorage.getItem("adminToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
};

const getStudentName = (student) =>
  student.name ||
  student.fullName ||
  student.studentName ||
  student.username ||
  "Unnamed Student";

const getInitials = (student) => {
  const name = getStudentName(student);

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getStatusStyle = (status) => {
  switch (status) {
    case "ongoing":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "upcoming":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "completed":
      return "bg-slate-100 text-slate-600 border-slate-200";

    case "paused":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "left_early":
      return "bg-rose-50 text-rose-700 border-rose-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const Modal = ({ children, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const AdminBatchTransfers = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [transferring, setTransferring] = useState(false);

  const [historyStudent, setHistoryStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  =========================================================
  FETCH STUDENTS AND ACTIVE BATCHES
  =========================================================
  */

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/student-batch-transfers`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load batch transfer data.",
        );
      }

      setStudents(data.students || []);
      setBatches(data.batches || []);
    } catch (err) {
      console.error("Batch transfer fetch error:", err);

      setError(
        err.message || "Something went wrong while loading students.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /*
  =========================================================
  FILTER STUDENTS
  =========================================================
  */

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const name = getStudentName(student).toLowerCase();

      const username = (student.username || "").toLowerCase();

      const currentBatch = (student.batch || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        username.includes(query) ||
        currentBatch.includes(query);

      const matchesBatch =
        batchFilter === "all" ||
        (student.batchId
          ? student.batchId.toString() === batchFilter
          : student.batch ===
            batches.find((batch) => batch._id === batchFilter)?.timing);

      return matchesSearch && matchesBatch;
    });
  }, [students, search, batchFilter, batches]);

  /*
  =========================================================
  OPEN TRANSFER MODAL
  =========================================================
  */

  const openTransferModal = (student) => {
    setSelectedStudent(student);
    setSelectedBatchId("");
    setError("");
    setSuccess("");
  };

  /*
  =========================================================
  CLOSE TRANSFER MODAL
  =========================================================
  */

  const closeTransferModal = () => {
    if (transferring) return;

    setSelectedStudent(null);
    setSelectedBatchId("");
  };

  /*
  =========================================================
  TRANSFER STUDENT
  =========================================================
  */

  const handleTransfer = async () => {
    if (!selectedStudent || !selectedBatchId) return;

    setTransferring(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/student-batch-transfers/${selectedStudent._id}`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            batchId: selectedBatchId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Student transfer failed.",
        );
      }

      setSuccess(
        `${getStudentName(selectedStudent)} has been transferred successfully.`,
      );

      setSelectedStudent(null);
      setSelectedBatchId("");

      await fetchData(true);
    } catch (err) {
      console.error("Batch transfer error:", err);

      setError(
        err.message || "Unable to transfer student.",
      );
    } finally {
      setTransferring(false);
    }
  };

  /*
  =========================================================
  FETCH STUDENT TRANSFER HISTORY
  =========================================================
  */

  const openHistory = async (student) => {
    setHistoryStudent(student);
    setHistory([]);
    setHistoryLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/student-batch-transfers/${student._id}/history`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load transfer history.",
        );
      }

      setHistory(data.history || []);
    } catch (err) {
      console.error("Batch history error:", err);

      setError(
        err.message || "Unable to load transfer history.",
      );

      setHistoryStudent(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    if (historyLoading) return;

    setHistoryStudent(null);
    setHistory([]);
  };

  /*
  =========================================================
  COUNTS
  =========================================================
  */

  const totalStudents = students.length;

  const studentsWithBatch = students.filter(
    (student) => student.batch,
  ).length;

  const studentsWithoutBatch = totalStudents - studentsWithBatch;

  const destinationBatch = batches.find(
    (batch) => batch._id === selectedBatchId,
  );

  /*
  =========================================================
  UI
  =========================================================
  */

  return (
    <div className="min-h-screen bg-[#F8F6EF] px-4 py-6 sm:px-6 lg:px-8">

      {/* HEADER */}

      <div className="mx-auto max-w-7xl">

        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#338DFD]">
              <ArrowLeftRight size={17} />
              STUDENT MANAGEMENT
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#102B4E] sm:text-4xl">
              Batch Transfers
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage student batch changes while keeping their
              existing attendance and academic records intact.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#102B4E] shadow-sm transition hover:border-[#338DFD] hover:text-[#338DFD] disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

        </div>

        {/* SUCCESS MESSAGE */}

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
            >
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <span className="flex-1">{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss success message"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR MESSAGE */}

        <AnimatePresence>
          {error && !selectedStudent && !historyStudent && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <span className="flex-1">{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error message"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUMMARY CARDS */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Total Students
              </span>

              <div className="rounded-xl bg-blue-50 p-2.5 text-[#338DFD]">
                <Users size={20} />
              </div>
            </div>

            <p className="text-3xl font-black text-[#102B4E]">
              {loading ? "—" : totalStudents}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Registered students
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Assigned to Batches
              </span>

              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <p className="text-3xl font-black text-[#102B4E]">
              {loading ? "—" : studentsWithBatch}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Students with a batch timing
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Without Batch
              </span>

              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <AlertCircle size={20} />
              </div>
            </div>

            <p className="text-3xl font-black text-[#102B4E]">
              {loading ? "—" : studentsWithoutBatch}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Students without assigned timing
            </p>
          </div>

        </div>

        {/* STUDENT LIST */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-[#102B4E]">
                  Student Directory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search students and manage their batch assignments.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#338DFD]">
                {filteredStudents.length} Students
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_260px]">

              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by student name, username or batch..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-[#102B4E] outline-none transition placeholder:text-slate-400 focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* BATCH FILTER */}

              <div className="relative">
                <ArrowUpDown
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={batchFilter}
                  onChange={(event) => setBatchFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-[#102B4E] outline-none transition focus:border-[#338DFD] focus:bg-white"
                >
                  <option value="all">All Current Batches</option>

                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.timing}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* TABLE */}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <LoaderCircle
                size={32}
                className="animate-spin text-[#338DFD]"
              />

              <p className="text-sm font-medium text-slate-500">
                Loading students...
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Users size={28} />
              </div>

              <h3 className="font-bold text-[#102B4E]">
                No students found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Try changing your search or batch filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Current Batch</th>
                    <th className="px-6 py-4">Admission Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.2) }}
                      className="transition hover:bg-slate-50/70"
                    >

                      {/* STUDENT */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102B4E] text-sm font-black text-white">
                            {getInitials(student)}
                          </div>

                          <div>
                            <p className="font-bold text-[#102B4E]">
                              {getStudentName(student)}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {student.username || "No username"}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* CURRENT BATCH */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#102B4E]">
                          <Clock size={15} className="text-[#338DFD]" />

                          {student.batch || "Not assigned"}
                        </div>
                      </td>

                      {/* JOINING DATE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays size={15} className="text-slate-400" />

                          {formatDate(student.joiningDate)}
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(student.enrollmentStatus)}`}
                        >
                          {(student.enrollmentStatus || "unknown").replace(
                            "_",
                            " ",
                          )}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">

                          <button
                            type="button"
                            onClick={() => openHistory(student)}
                            title="View transfer history"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#338DFD]"
                          >
                            <History size={15} />
                            History
                          </button>

                          <button
                            type="button"
                            onClick={() => openTransferModal(student)}
                            disabled={batches.length === 0}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#102B4E] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#338DFD] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ArrowLeftRight size={15} />
                            Change Batch
                          </button>

                        </div>
                      </td>

                    </motion.tr>
                  ))}

                </tbody>
              </table>

            </div>
          )}

          {/* FOOTER */}

          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-xs text-slate-500 sm:px-6">
            Showing {filteredStudents.length} of {totalStudents} students.
            Students are arranged by latest admission first.
          </div>

        </div>

        {/* INFORMATION NOTE */}

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#338DFD]"
          />

          <div>
            <p className="text-sm font-bold text-[#102B4E]">
              Student Record Protection
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
              Batch transfers update only the student's assigned batch.
              Existing attendance, submissions, assignments, learning goals,
              joining date and course duration remain unchanged.
            </p>
          </div>
        </div>

      </div>

      {/* =====================================================
          CHANGE BATCH CONFIRMATION MODAL
      ===================================================== */}

      {selectedStudent && (
        <Modal onClose={closeTransferModal}>

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>
              <h2 className="text-xl font-black text-[#102B4E]">
                Change Student Batch
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Review the transfer before confirming.
              </p>
            </div>

            <button
              type="button"
              onClick={closeTransferModal}
              disabled={transferring}
              className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
            >
              <X size={19} />
            </button>

          </div>

          <div className="space-y-5 p-6">

            {/* STUDENT DETAILS */}

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#102B4E] font-black text-white">
                {getInitials(selectedStudent)}
              </div>

              <div>
                <p className="font-bold text-[#102B4E]">
                  {getStudentName(selectedStudent)}
                </p>

                <p className="text-xs text-slate-500">
                  {selectedStudent.username || "No username"}
                </p>
              </div>

            </div>

            {/* CURRENT BATCH */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Batch
              </label>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-bold text-[#102B4E]">
                  {selectedStudent.batch || "Not assigned"}
                </span>

                <span className="rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
                  Current
                </span>
              </div>
            </div>

            {/* DESTINATION BATCH */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select New Batch
              </label>

              <select
                value={selectedBatchId}
                onChange={(event) => setSelectedBatchId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#102B4E] outline-none transition focus:border-[#338DFD] focus:ring-4 focus:ring-blue-50"
              >
                <option value="">Choose an active batch</option>

                {batches
                  .filter(
                    (batch) =>
                      batch._id !== selectedStudent.batchId &&
                      batch.timing?.trim().toLowerCase() !==
                        selectedStudent.batch?.trim().toLowerCase(),
                  )
                  .map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.timing}
                    </option>
                  ))}
              </select>

              {batches.length <= 1 && (
                <p className="mt-2 text-xs text-amber-600">
                  No alternative active batch is available.
                </p>
              )}
            </div>

            {/* TRANSFER PREVIEW */}

            {destinationBatch && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#338DFD]">
                  Transfer Preview
                </p>

                <div className="flex items-center gap-3">

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      From
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-[#102B4E]">
                      {selectedStudent.batch || "Not assigned"}
                    </p>
                  </div>

                  <ArrowRight
                    size={20}
                    className="shrink-0 text-[#338DFD]"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      To
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-emerald-700">
                      {destinationBatch.timing}
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* WARNING */}

            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />

              This action changes only the student's batch assignment.
              Existing academic and attendance records will not be modified.
            </div>

            {/* MODAL ERROR */}

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* BUTTONS */}

            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">

              <button
                type="button"
                onClick={closeTransferModal}
                disabled={transferring}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleTransfer}
                disabled={!selectedBatchId || transferring}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#338DFD] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transferring ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    Confirm Transfer
                  </>
                )}
              </button>

            </div>

          </div>

        </Modal>
      )}

      {/* =====================================================
          TRANSFER HISTORY MODAL
      ===================================================== */}

      {historyStudent && (
        <Modal onClose={closeHistory}>

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#338DFD]">
                <History size={15} />
                Student Records
              </div>

              <h2 className="text-xl font-black text-[#102B4E]">
                Transfer History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {getStudentName(historyStudent)}
              </p>
            </div>

            <button
              type="button"
              onClick={closeHistory}
              disabled={historyLoading}
              className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
            >
              <X size={19} />
            </button>

          </div>

          <div className="p-6">

            {historyLoading ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3">
                <LoaderCircle
                  size={30}
                  className="animate-spin text-[#338DFD]"
                />

                <p className="text-sm text-slate-500">
                  Loading transfer history...
                </p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">

                <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                  <History size={28} />
                </div>

                <h3 className="font-bold text-[#102B4E]">
                  No Transfer History
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  This student has not been transferred to another batch yet.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                <div className="mb-5 rounded-xl bg-blue-50 px-4 py-3 text-xs font-semibold text-[#338DFD]">
                  {history.length} Previous{" "}
                  {history.length === 1 ? "Transfer" : "Transfers"} Recorded
                </div>

                {history.map((item, index) => (
                  <div
                    key={item._id}
                    className="relative rounded-2xl border border-slate-200 p-4"
                  >

                    <div className="mb-4 flex items-center justify-between gap-2">

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Transfer #{history.length - index}
                      </span>

                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <CalendarDays size={13} />
                        {formatDateTime(item.transferredAt)}
                      </span>

                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">

                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Previous Batch
                        </p>

                        <p className="break-words text-sm font-bold text-[#102B4E]">
                          {item.fromBatchTiming || "Not recorded"}
                        </p>
                      </div>

                      <ArrowRight
                        size={18}
                        className="text-[#338DFD]"
                      />

                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          New Batch
                        </p>

                        <p className="break-words text-sm font-bold text-emerald-700">
                          {item.toBatchTiming}
                        </p>
                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}

            <button
              type="button"
              onClick={closeHistory}
              disabled={historyLoading}
              className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>

          </div>

        </Modal>
      )}

    </div>
  );
};

export default AdminBatchTransfers;