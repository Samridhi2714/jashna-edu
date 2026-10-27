import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserRoundPlus,
  Users,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Globe,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

import { recentAdmissionsApi } from "../lib/recentAdmissionsApi";

const COLORS = {
  navy: "#10243E",
  navyLight: "#17406E",
  blue: "#338DFD",
  green: "#49C4A5",
  ivory: "#F8F6EF",
  border: "#DCE4EC",
  red: "#DC2626",
};

const FONT = '"Times New Roman", Times, serif';

const DESIGNATION_OPTIONS = [
  "School Student",
  "College Student",
  "University Student",
  "Young Professional",
  "Working Professional",
  "Other",
];

function getStudent(record) {
  return record?.student || {};
}

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

function Notice({ notice, onClose }) {
  if (!notice) return null;

  const success = notice.type === "success";

  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-3 rounded-xl border p-4"
      style={{
        borderColor: success ? "#A7E8D4" : "#FECACA",
        background: success ? "#ECFDF5" : "#FEF2F2",
        color: success ? "#065F46" : "#991B1B",
        fontFamily: FONT,
      }}
    >
      {success ? (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="flex-1 text-base">{notice.message}</p>

      <button
        type="button"
        onClick={onClose}
        className="text-sm font-bold"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="rounded-2xl border bg-white p-5 shadow-sm"
      style={{ borderColor: COLORS.border, fontFamily: FONT }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p
            className="mt-2 text-3xl font-bold"
            style={{ color: COLORS.navy }}
          >
            {value}
          </p>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: `${accent}18`,
            color: accent,
          }}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function StudentAvatar({ student }) {
  if (student?.profileImage) {
    return (
      <img
        src={student.profileImage}
        alt={`${student.name || "Student"} profile`}
        className="h-14 w-14 rounded-xl border object-cover"
        style={{ borderColor: COLORS.border }}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-xl"
      style={{
        background: "#EAF2FF",
        color: COLORS.navyLight,
      }}
    >
      <ImageIcon size={24} />
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="px-5 py-14 text-center">
      <Users
        size={38}
        className="mx-auto mb-3"
        style={{ color: "#94A3B8" }}
      />

      <p className="text-lg font-bold" style={{ color: COLORS.navy }}>
        {children}
      </p>
    </div>
  );
}

export default function AdminRecentAdmissions() {
  const [students, setStudents] = useState([]);
  const [admissions, setAdmissions] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [designation, setDesignation] = useState("");
  const [customDesignation, setCustomDesignation] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const [notice, setNotice] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [studentResult, admissionResult] = await Promise.all([
        recentAdmissionsApi.listEligibleStudents(),
        recentAdmissionsApi.listAdmin(),
      ]);

      setStudents(
        Array.isArray(studentResult)
          ? studentResult
          : studentResult.students || []
      );

      setAdmissions(
        Array.isArray(admissionResult)
          ? admissionResult
          : admissionResult.admissions || []
      );
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assignedStudentIds = new Set(
    admissions
      .map((record) => {
        const student = getStudent(record);

        return (
          student._id ||
          (typeof record.student === "string" ? record.student : null)
        );
      })
      .filter(Boolean)
      .map(String)
  );

  const availableStudents = students.filter(
    (student) => !assignedStudentIds.has(String(student._id))
  );

  const filteredAdmissions = admissions.filter((record) => {
    const student = getStudent(record);

    const text = [
      student.name,
      student.username,
      record.designation,
      record.courseName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase().trim());
  });

  const publishedCount = admissions.filter(
    (record) => record.isPublished
  ).length;

  const unpublishedCount = admissions.length - publishedCount;

  async function handleCreate(event) {
    event.preventDefault();

    if (!selectedStudent) {
      setNotice({
        type: "error",
        message: "Please select a student.",
      });
      return;
    }

    const finalDesignation =
      designation === "Other" ? customDesignation.trim() : designation;

    if (!finalDesignation) {
      setNotice({
        type: "error",
        message: "Please select or enter a designation.",
      });
      return;
    }

    if (finalDesignation.length > 100) {
      setNotice({
        type: "error",
        message: "Designation cannot exceed 100 characters.",
      });
      return;
    }

    setSaving(true);
    setNotice(null);

    try {
      await recentAdmissionsApi.create({
        studentId: selectedStudent,
        designation: finalDesignation,
      });

      setSelectedStudent("");
      setDesignation("");
      setCustomDesignation("");

      setNotice({
        type: "success",
        message:
          "Student added successfully. The record remains unpublished until you publish it.",
      });

      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublication(record) {
    const student = getStudent(record);
    const shouldPublish = !record.isPublished;

    if (
      shouldPublish &&
      (!student.profileImage ||
        student.isActive === false ||
        student.enrollmentStatus !== "ongoing")
    ) {
      setNotice({
        type: "error",
        message:
          "Only eligible ongoing students with a profile photo can be published.",
      });
      return;
    }

    if (
      shouldPublish &&
      !window.confirm(
        `Publish ${student.name || "this student"} on the public Testimonials page?\n\nPlease confirm that permission to display the student's name and photo has been obtained.`
      )
    ) {
      return;
    }

    setBusyId(record._id);
    setNotice(null);

    try {
      await recentAdmissionsApi.setPublication(record._id, shouldPublish);

      setNotice({
        type: "success",
        message: shouldPublish
          ? `${student.name || "Student"} has been published.`
          : `${student.name || "Student"} has been unpublished.`,
      });

      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(record) {
    const student = getStudent(record);

    const confirmed = window.confirm(
      `Remove ${student.name || "this student"} from Recent Admissions?\n\nThis will not delete the student's account or profile photo.`
    );

    if (!confirmed) return;

    setBusyId(record._id);
    setNotice(null);

    try {
      await recentAdmissionsApi.remove(record._id);

      setNotice({
        type: "success",
        message: "Admission record removed successfully.",
      });

      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setBusyId("");
    }
  }

  function getDisplayDesignation(record) {
    return (
      record.designation || record.courseName || "Designation not specified"
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{
        background: COLORS.ivory,
        fontFamily: FONT,
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-7 overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8"
          style={{
            background: `linear-gradient(120deg, ${COLORS.navy}, ${COLORS.navyLight}, #216B91)`,
          }}
        >
          <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full border-[28px] border-white/10" />

          <div className="absolute -bottom-20 right-36 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">
                <Globe size={17} />
                Content Management
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Recent Admissions
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                Choose which eligible students appear in the Our Growing
                Learning Community section on the Testimonials page.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-bold transition hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </motion.div>

        <Notice notice={notice} onClose={() => setNotice(null)} />

        {/* STATS */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Users}
            label="Admission Records"
            value={admissions.length}
            accent={COLORS.blue}
          />

          <StatCard
            icon={Eye}
            label="Published"
            value={publishedCount}
            accent={COLORS.green}
          />

          <StatCard
            icon={EyeOff}
            label="Unpublished"
            value={unpublishedCount}
            accent="#D97706"
          />
        </div>

        {/* ADD STUDENT */}
        <section
          className="mb-8 overflow-hidden rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="border-b px-5 py-5 sm:px-7"
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "#E8F8F3",
                  color: "#16866B",
                }}
              >
                <UserRoundPlus size={23} />
              </div>

              <div>
                <h2
                  className="text-xl font-bold sm:text-2xl"
                  style={{ color: COLORS.navy }}
                >
                  Add a Student
                </h2>

                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Select an existing student and choose their designation.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-5 p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* STUDENT */}
              <div>
                <label
                  htmlFor="admission-student"
                  className="mb-2 block text-base font-bold"
                  style={{ color: COLORS.navy }}
                >
                  Select Student *
                </label>

                <select
                  id="admission-student"
                  value={selectedStudent}
                  onChange={(event) => setSelectedStudent(event.target.value)}
                  disabled={loading || saving}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  style={{ borderColor: COLORS.border }}
                >
                  <option value="">Choose an eligible student</option>

                  {availableStudents.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                      {student.username ? ` (${student.username})` : ""}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-sm text-slate-500">
                  Only active, ongoing students returned by the server are
                  available.
                </p>
              </div>

              {/* DESIGNATION */}
              <div>
                <label
                  htmlFor="admission-designation"
                  className="mb-2 block text-base font-bold"
                  style={{ color: COLORS.navy }}
                >
                  Student Designation *
                </label>

                <select
                  id="admission-designation"
                  value={designation}
                  onChange={(event) => {
                    setDesignation(event.target.value);
                    setCustomDesignation("");
                  }}
                  disabled={saving}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  style={{ borderColor: COLORS.border }}
                >
                  <option value="">Select designation</option>

                  {DESIGNATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {designation === "Other" && (
                  <input
                    type="text"
                    value={customDesignation}
                    onChange={(event) =>
                      setCustomDesignation(event.target.value)
                    }
                    placeholder="Enter student's designation"
                    maxLength={100}
                    disabled={saving}
                    className="mt-3 w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    style={{ borderColor: COLORS.border }}
                    required
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-slate-500">
                New records remain unpublished until you explicitly publish
                them. Only publish a student's name and photo when permission
                has been obtained.
              </p>

              <button
                type="submit"
                disabled={
                  saving ||
                  loading ||
                  !availableStudents.length ||
                  !selectedStudent ||
                  !designation ||
                  (designation === "Other" && !customDesignation.trim())
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: COLORS.navy }}
              >
                <UserRoundPlus size={19} />
                {saving ? "Adding..." : "Add Admission"}
              </button>
            </div>

            {!loading && availableStudents.length === 0 && (
              <p className="text-sm font-semibold text-amber-700">
                No additional eligible students are available. Each student
                can have only one Recent Admissions record.
              </p>
            )}
          </form>
        </section>

        {/* MANAGE ADMISSIONS */}
        <section
          className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
            style={{ borderColor: COLORS.border }}
          >
            <div>
              <h2
                className="text-xl font-bold sm:text-2xl"
                style={{ color: COLORS.navy }}
              >
                Manage Admissions
              </h2>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Search students and control their public visibility.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students or designations..."
                className="w-full rounded-xl border py-3 pl-10 pr-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                style={{ borderColor: COLORS.border }}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
              <RefreshCw size={22} className="animate-spin" />

              <span className="text-lg font-semibold">
                Loading admissions...
              </span>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <EmptyState>
              {admissions.length
                ? "No matching admissions found."
                : "No admission records yet. Add a student above."}
            </EmptyState>
          ) : (
            <div className="divide-y" style={{ borderColor: COLORS.border }}>
              {filteredAdmissions.map((record) => {
                const student = getStudent(record);
                const isPublished = Boolean(record.isPublished);
                const isBusy = busyId === record._id;

                return (
                  <div
                    key={record._id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <StudentAvatar student={student} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className="break-words text-lg font-bold sm:text-xl"
                            style={{ color: COLORS.navy }}
                          >
                            {student.name || "Student record unavailable"}
                          </h3>

                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold"
                            style={{
                              background: isPublished ? "#D1FAE5" : "#FEF3C7",
                              color: isPublished ? "#065F46" : "#92400E",
                            }}
                          >
                            {isPublished ? "Published" : "Unpublished"}
                          </span>
                        </div>

                        <p className="mt-1 break-words text-base font-semibold text-slate-600">
                          {getDisplayDesignation(record)}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                          {student.username && (
                            <span>Username: {student.username}</span>
                          )}

                          {student.batch && (
                            <span>Batch: {student.batch}</span>
                          )}

                          <span className="inline-flex items-center gap-1">
                            <GraduationCap size={15} />
                            {student.enrollmentStatus || "Status unavailable"}
                          </span>
                        </div>

                        {isPublished && (
                          <p className="mt-2 text-sm font-semibold text-emerald-700">
                            Visible in the public Recent Admissions section.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePublication(record)}
                        disabled={isBusy}
                        className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition hover:brightness-95 disabled:opacity-50"
                        style={{
                          background: isPublished ? "#FEF3C7" : "#D1FAE5",
                          color: isPublished ? "#92400E" : "#065F46",
                        }}
                      >
                        {isPublished ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}

                        {isBusy
                          ? "Please wait..."
                          : isPublished
                            ? "Unpublish"
                            : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(record)}
                        disabled={isBusy}
                        aria-label={`Remove ${student.name || "student"} from Recent Admissions`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-5 text-sm leading-6 text-slate-500">
          Privacy reminder: publishing is an explicit admin action. Only
          publish a student's name and photo when appropriate permission has
          been obtained. Removing an admission record does not delete the
          student account or profile image.
        </p>
      </div>
    </div>
  );
}