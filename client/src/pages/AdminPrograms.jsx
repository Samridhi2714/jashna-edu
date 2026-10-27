import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { programsApi } from "../lib/programsApi";

/* =========================================================
   CONSTANTS
========================================================= */

const FONT_FAMILY = '"Times New Roman", Times, serif';

// Suggestions only — admin can type any category.
// The public page has special icons for the first six; others get a generic icon.
const CATEGORY_SUGGESTIONS = [
  "Communication",
  "Career",
  "Academic",
  "Professional",
  "English Development",
  "Teaching",
  "Class 10",
  "Class 12",
  "Spoken English",
  "IELTS",
];

const GOAL_OPTIONS = [
  { value: "", label: "None (not shown under a direction)" },
  { value: "confidence", label: "Speak with confidence" },
  { value: "career", label: "Grow my career" },
  { value: "academic", label: "Achieve an academic goal" },
  { value: "educator", label: "Become a better educator" },
];

const emptyForm = {
  title: "",
  shortTitle: "",
  category: "",
  goalId: "",
  duration: "",
  fees: "",
  description: "",
  highlights: ["", "", ""],
  audience: "",
  status: "published",
  imageAlt: "",
};

const inputClass =
  "w-full rounded-xl border-2 border-[#D5E0EE] bg-white px-4 py-3 text-[18px] font-bold text-[#10243E] outline-none transition placeholder:font-semibold placeholder:text-[#10243E]/30 focus:border-[#338DFD] focus:ring-4 focus:ring-[#338DFD]/15";

/* =========================================================
   MAIN
========================================================= */

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { type: "ok" | "error", text }
  const [editing, setEditing] = useState(null); // null | "new" | program
  const [deleting, setDeleting] = useState(null); // program awaiting confirmation
  const [busyId, setBusyId] = useState(null);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { programs: list } = await programsApi.listAdmin();
      setPrograms(list);
    } catch (error) {
      flash("error", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- publish / unpublish ---------- */

  const toggleStatus = async (program) => {
    const next = program.status === "published" ? "draft" : "published";
    setBusyId(program._id);

    try {
      await programsApi.setStatus(program._id, next);
      setPrograms((list) =>
        list.map((p) => (p._id === program._id ? { ...p, status: next } : p)),
      );
      flash(
        "ok",
        next === "published"
          ? "Published on the website"
          : "Hidden from the website",
      );
    } catch (error) {
      flash("error", error.message);
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- reorder ---------- */

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= programs.length) return;

    const previous = programs;
    const next = [...programs];
    [next[index], next[target]] = [next[target], next[index]];

    setPrograms(next); // optimistic

    try {
      await programsApi.reorder(next.map((p) => p._id));
    } catch (error) {
      setPrograms(previous);
      flash("error", error.message);
    }
  };

  /* ---------- delete ---------- */

  const confirmDelete = async () => {
    const program = deleting;
    setBusyId(program._id);

    try {
      await programsApi.remove(program._id);
      setPrograms((list) => list.filter((p) => p._id !== program._id));
      setDeleting(null);
      flash("ok", "Program deleted");
    } catch (error) {
      if (error.status === 409) {
        // enrolled students — keep the dialog open and offer unpublish instead
        setDeleting({ ...program, blockedMessage: error.message });
      } else {
        flash("error", error.message);
        setDeleting(null);
      }
    } finally {
      setBusyId(null);
    }
  };

  const unpublishInstead = async () => {
    const program = deleting;
    setDeleting(null);
    if (program.status === "published") await toggleStatus(program);
  };

  /* ---------- after save ---------- */

  const handleSaved = (saved, isNew) => {
    setPrograms((list) =>
      isNew
        ? [...list, saved]
        : list.map((p) => (p._id === saved._id ? { ...p, ...saved } : p)),
    );
    setEditing(null);
    flash("ok", isNew ? "Program created" : "Program updated");
  };

  const publishedCount = programs.filter(
    (p) => p.status === "published",
  ).length;
  const hiddenCount = programs.length - publishedCount;
  const withImageCount = programs.filter((p) => p.image?.url).length;

  return (
    <div
      className="admin-programs-root mx-auto max-w-[1500px] pb-14"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <style>{`
        .admin-programs-root, .admin-programs-root * { font-family: ${FONT_FAMILY} !important; }
        @keyframes ap-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .ap-hero { background: linear-gradient(120deg, #10243E, #17406E, #1D5C8F, #10243E); background-size: 300% 300%; animation: ap-gradient 14s ease infinite; }
      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ap-hero relative isolate mb-8 overflow-hidden rounded-[32px] border-[3px] border-[#2B5C8F] px-7 py-9 text-white shadow-[0_28px_70px_rgba(16,36,62,0.3)] sm:px-10 sm:py-11"
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
              <Layers size={18} />
              Content Management
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-[#7DD3FC] via-[#A7F3D0] to-[#FDE68A] bg-clip-text text-transparent">
                Programs
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[20px] font-semibold leading-8 text-white/85">
              Create, edit and publish the programs shown on the public website.
              Hidden programs stay saved but are not visible to visitors.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => setEditing("new")}
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-[19px] font-extrabold text-[#10243E] shadow-lg transition-shadow hover:shadow-2xl"
          >
            <Plus size={22} strokeWidth={3} />
            Add program
          </motion.button>
        </div>
      </motion.section>

      {/* =====================================================
          NOTICE
      ===================================================== */}

      <AnimatePresence>
        {notice && (
          <motion.div
            key="notice"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className={`mb-7 flex items-center gap-4 rounded-2xl border-[3px] p-5 shadow-lg ${
              notice.type === "ok"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-red-300 bg-red-50 text-red-800"
            }`}
          >
            {notice.type === "ok" ? (
              <CheckCircle2 size={26} className="shrink-0" />
            ) : (
              <AlertTriangle size={26} className="shrink-0" />
            )}

            <p className="flex-1 text-[18px] font-extrabold">{notice.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Layers}
          label="Total Programs"
          value={programs.length}
          hint="All saved programs"
          gradient="linear-gradient(135deg, #338DFD, #38BDF8)"
          shadow="rgba(51,141,253,0.32)"
        />

        <StatCard
          icon={Eye}
          label="Published"
          value={publishedCount}
          hint="Live on the website"
          gradient="linear-gradient(135deg, #1FA886, #49C4A5)"
          shadow="rgba(31,168,134,0.32)"
        />

        <StatCard
          icon={EyeOff}
          label="Hidden"
          value={hiddenCount}
          hint="Saved, not public"
          gradient="linear-gradient(135deg, #EA580C, #FBBF24)"
          shadow="rgba(234,88,12,0.32)"
        />

        <StatCard
          icon={ImageIcon}
          label="With Image"
          value={withImageCount}
          hint={`${programs.length - withImageCount} still need an image`}
          gradient="linear-gradient(135deg, #9F1239, #E11D48)"
          shadow="rgba(159,18,57,0.32)"
        />
      </div>

      {/* =====================================================
          PROGRAM LIST
      ===================================================== */}

      <Panel
        icon={<Layers size={24} />}
        title="All programs"
        subtitle="Use the arrows to change the order shown on the website"
      >
        {loading && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={44}
                className="mx-auto animate-spin text-[#338DFD]"
              />
              <p className="mt-4 text-[22px] font-extrabold text-[#10243E]/60">
                Loading programs...
              </p>
            </div>
          </div>
        )}

        {!loading && programs.length === 0 && (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D5E0EE] bg-[#F8FAFD] px-6 py-8 text-center">
            <p className="text-[24px] font-extrabold text-[#10243E]">
              No programs yet
            </p>
            <p className="mt-1 text-[18px] font-bold text-[#10243E]/55">
              Click "Add program" or run the seed script to import your existing
              ones.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {programs.map((program, index) => {
            const live = program.status === "published";

            return (
              <motion.div
                layout
                key={program._id}
                whileHover={{ y: -3 }}
                className={`flex flex-col gap-5 rounded-2xl border-2 p-4 transition-shadow hover:shadow-[0_14px_34px_rgba(16,36,62,0.1)] sm:flex-row sm:items-center ${
                  live
                    ? "border-[#D5E0EE] bg-white"
                    : "border-dashed border-amber-300 bg-amber-50/50"
                }`}
              >
                {/* order controls */}

                <div className="flex items-center gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="rounded-xl border-2 border-[#D5E0EE] p-1.5 text-[#10243E]/60 transition hover:border-[#338DFD] hover:bg-[#EAF3FF] hover:text-[#1D6FD8] disabled:opacity-25 disabled:hover:border-[#D5E0EE] disabled:hover:bg-transparent"
                  >
                    <ArrowUp size={18} strokeWidth={3} />
                  </button>

                  <span className="w-8 text-center text-[20px] font-extrabold text-[#10243E]/45">
                    {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === programs.length - 1}
                    aria-label="Move down"
                    className="rounded-xl border-2 border-[#D5E0EE] p-1.5 text-[#10243E]/60 transition hover:border-[#338DFD] hover:bg-[#EAF3FF] hover:text-[#1D6FD8] disabled:opacity-25 disabled:hover:border-[#D5E0EE] disabled:hover:bg-transparent"
                  >
                    <ArrowDown size={18} strokeWidth={3} />
                  </button>
                </div>

                {/* thumbnail */}

                {program.image?.url ? (
                  <img
                    src={program.image.url}
                    alt=""
                    className="h-24 w-full rounded-2xl border-2 border-[#D5E0EE] object-cover sm:w-40"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-2xl border-2 border-dashed border-[#D5E0EE] bg-[#F5F9FF] text-[16px] font-extrabold text-[#10243E]/35 sm:w-40">
                    No image
                  </div>
                )}

                {/* info */}

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] px-3 py-1 text-[12px] font-extrabold uppercase tracking-wider text-[#92400E]">
                      {program.category}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-[12px] font-extrabold uppercase tracking-wider ${
                        live
                          ? "bg-[#DDF8E8] text-[#15803D]"
                          : "bg-[#FFEDD5] text-[#C2410C]"
                      }`}
                    >
                      {live ? "Published" : "Hidden"}
                    </span>
                  </div>

                  <p className="truncate text-[24px] font-extrabold text-[#10243E]">
                    {program.title}
                  </p>

                  <p className="mt-0.5 text-[16px] font-bold text-[#10243E]/55">
                    {[
                      program.duration,
                      program.fees != null &&
                        `₹${Number(program.fees).toLocaleString("en-IN")}`,
                      program.enrolledCount > 0 &&
                        `${program.enrolledCount} enrolled`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No duration or fees set"}
                  </p>
                </div>

                {/* actions */}

                <div className="flex flex-wrap items-center gap-2.5">
                  <motion.button
                    type="button"
                    onClick={() => toggleStatus(program)}
                    disabled={busyId === program._id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-[16px] font-extrabold transition-colors disabled:opacity-50 ${
                      live
                        ? "border-[#D5E0EE] bg-white text-[#10243E]/75 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800"
                        : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    {live ? <EyeOff size={17} /> : <Eye size={17} />}
                    {live ? "Unpublish" : "Publish"}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setEditing(program)}
                    aria-label="Edit"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#D5E0EE] bg-white px-4 py-2.5 text-[16px] font-extrabold text-[#10243E]/75 transition-colors hover:border-[#338DFD] hover:bg-[#EAF3FF] hover:text-[#1D6FD8]"
                  >
                    <Pencil size={17} />
                    Edit
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setDeleting(program)}
                    aria-label="Delete"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-white px-4 py-2.5 text-[16px] font-extrabold text-red-600 transition-colors hover:border-red-500 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 size={17} />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Panel>

      {/* FORM MODAL */}

      <AnimatePresence>
        {editing && (
          <ProgramForm
            key={editing === "new" ? "new" : editing._id}
            program={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* DELETE DIALOG */}

      <AnimatePresence>
        {deleting && (
          <Modal
            onClose={() => setDeleting(null)}
            narrow
            icon={<Trash2 size={24} />}
            title={
              deleting.blockedMessage
                ? "Can't delete this program"
                : "Delete this program?"
            }
            subtitle={deleting.title}
          >
            <p className="text-[19px] font-bold leading-8 text-[#10243E]/75">
              {deleting.blockedMessage ||
                `"${deleting.title}" will be permanently removed, along with its image. If you only want to hide it for now, unpublish it instead.`}
            </p>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="rounded-xl border-2 border-[#D5E0EE] bg-white px-6 py-3 text-[18px] font-extrabold text-[#10243E]/75 transition hover:-translate-y-0.5 hover:bg-[#F5F9FF]"
              >
                Cancel
              </button>

              {deleting.status === "published" && (
                <button
                  type="button"
                  onClick={unpublishInstead}
                  className="rounded-xl bg-gradient-to-r from-[#10243E] to-[#2B5C8F] px-6 py-3 text-[18px] font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Unpublish instead
                </button>
              )}

              {!deleting.blockedMessage && (
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={busyId === deleting._id}
                  className="rounded-xl bg-red-600 px-6 py-3 text-[18px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg disabled:opacity-50"
                >
                  {busyId === deleting._id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   STAT CARD (same look as dashboard, not clickable)
========================================================= */

function StatCard({ icon: Icon, label, value, hint, gradient, shadow }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      className="relative overflow-hidden rounded-3xl p-6 text-white"
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
    </motion.div>
  );
}

/* =========================================================
   PANEL (same look as dashboard)
========================================================= */

function Panel({ icon, title, subtitle, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[28px] border-[3px] border-[#D5E0EE] bg-white shadow-[0_14px_44px_rgba(16,36,62,0.07)]"
    >
      <div className="flex items-center gap-4 border-b-[3px] border-[#E3EAF3] bg-gradient-to-r from-[#F3F8FF] via-white to-[#F1FBF7] px-6 py-6 sm:px-7">
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

      <div className="p-6 sm:p-7">{children}</div>
    </motion.section>
  );
}

/* =========================================================
   MODAL SHELL
========================================================= */

function Modal({ children, onClose, icon, title, subtitle, narrow = false }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto overscroll-contain bg-[#07121F]/70 p-3 sm:p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10 }}
        className={`relative my-3 w-full shrink-0 rounded-[24px] border-[3px] border-[#D5E0EE] bg-white shadow-2xl sm:my-5 ${
          narrow ? "max-w-lg" : "max-w-3xl"
        }`}
      >
        <div className="flex items-center gap-4 border-b-[3px] border-[#E3EAF3] bg-gradient-to-r from-[#F3F8FF] via-white to-[#F1FBF7] px-6 py-5 sm:px-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10243E] text-white shadow-md">
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[26px] font-extrabold leading-tight text-[#10243E]">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-0.5 truncate text-[16px] font-semibold text-[#10243E]/55">
                {subtitle}
              </p>
            )}
          </div>

          <motion.button
            type="button"
            whileHover={{ rotate: 90, scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border-2 border-[#D5E0EE] bg-white p-2 text-[#10243E]/60 hover:border-[#338DFD] hover:text-[#1D6FD8]"
          >
            <X size={20} strokeWidth={3} />
          </motion.button>
        </div>
        <div className="max-h-[calc(100dvh-170px)] overflow-y-auto overscroll-contain p-4 sm:p-7">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   CREATE / EDIT FORM
========================================================= */

function ProgramForm({ program, onClose, onSaved }) {
  const isNew = !program;
  const fileInput = useRef(null);

  const [form, setForm] = useState(() =>
    program
      ? {
          title: program.title || "",
          shortTitle: program.shortTitle || "",
          category: program.category || "",
          goalId: program.goalId || "",
          duration: program.duration || "",
          fees: program.fees ?? "",
          description: program.description || "",
          highlights: [0, 1, 2].map((i) => program.highlights?.[i] || ""),
          audience: program.audience || "",
          status: program.status || "published",
          imageAlt: program.image?.alt || "",
        }
      : emptyForm,
  );

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(program?.image?.url || "");
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setHighlight = (index) => (e) =>
    setForm((f) => {
      const highlights = [...f.highlights];
      highlights[index] = e.target.value;
      return { ...f, highlights };
    });

  const pickFile = (e) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;

    if (chosen.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller");
      return;
    }

    setError("");
    setFile(chosen);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(chosen));
  };

  const clearImage = () => {
    setFile(null);
    setPreview("");
    setRemoveImage(true);
    if (fileInput.current) fileInput.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.description.trim()
    ) {
      setError("Title, category and description are required");
      return;
    }

    const data = new FormData();

    data.append("title", form.title);
    data.append("shortTitle", form.shortTitle);
    data.append("category", form.category);
    data.append("goalId", form.goalId);
    data.append("duration", form.duration);
    data.append("fees", form.fees === "" ? "" : String(form.fees));
    data.append("description", form.description);
    data.append(
      "highlights",
      JSON.stringify(form.highlights.filter((h) => h.trim())),
    );
    data.append("audience", form.audience);
    data.append("status", form.status);
    data.append("imageAlt", form.imageAlt);

    if (file) data.append("image", file);
    if (removeImage && !file) data.append("removeImage", "true");

    setSaving(true);

    try {
      const res = isNew
        ? await programsApi.create(data)
        : await programsApi.update(program._id, data);

      onSaved({ ...program, ...res.program }, isNew);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      icon={isNew ? <Plus size={24} strokeWidth={3} /> : <Pencil size={22} />}
      title={isNew ? "Add a program" : "Edit program"}
      subtitle={
        isNew ? "It will appear on the website once published" : program.title
      }
    >
      <form onSubmit={submit} className="space-y-6">
        {/* IMAGE */}

        <Field
          label="Program image"
          hint="WEBP, PNG or JPG, max 5 MB. Shown when the program is opened on the website."
        >
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#D5E0EE] bg-[#F5F9FF]">
              {preview ? (
                <img
                  src={preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus size={32} className="shrink-0 text-[#10243E]/25" />
              )}
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="rounded-xl bg-gradient-to-r from-[#10243E] to-[#2B5C8F] px-5 py-2.5 text-[17px] font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {preview ? "Replace image" : "Choose image"}
              </button>

              {preview && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="rounded-xl border-2 border-[#D5E0EE] bg-white px-5 py-2.5 text-[17px] font-extrabold text-[#10243E]/75 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  Remove
                </button>
              )}

              <input
                ref={fileInput}
                type="file"
                accept="image/webp,image/png,image/jpeg,image/avif"
                onChange={pickFile}
                className="hidden"
              />
            </div>
          </div>

          {preview && (
            <input
              className={`${inputClass} mt-3`}
              placeholder="Image description, e.g. Student speaking on stage"
              value={form.imageAlt}
              onChange={set("imageAlt")}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title *">
            <input
              className={inputClass}
              value={form.title}
              onChange={set("title")}
              placeholder="Public Speaking Mastery"
            />
          </Field>

          <Field label="Short title" hint="Used in the list on the website">
            <input
              className={inputClass}
              value={form.shortTitle}
              onChange={set("shortTitle")}
              placeholder="Public Speaking"
            />
          </Field>

          <Field label="Category *">
            <input
              className={inputClass}
              list="program-categories"
              value={form.category}
              onChange={set("category")}
              placeholder="Class 10, IELTS, Communication..."
            />

            <datalist id="program-categories">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field
            label="Direction"
            hint="Which 'What are you working towards?' card it belongs to"
          >
            <select
              className={inputClass}
              value={form.goalId}
              onChange={set("goalId")}
            >
              {GOAL_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Duration" hint="Optional">
            <input
              className={inputClass}
              value={form.duration}
              onChange={set("duration")}
              placeholder="8 weeks"
            />
          </Field>

          <Field
            label="Fees (₹)"
            hint="Optional. Leave empty to hide on the website."
          >
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.fees}
              onChange={set("fees")}
              placeholder="4999"
            />
          </Field>
        </div>

        <Field label="Description *" hint="What will students learn?">
          <textarea
            className={`${inputClass} min-h-[120px] resize-y`}
            value={form.description}
            onChange={set("description")}
            maxLength={1200}
            placeholder="Develop the confidence, structure, delivery and storytelling skills needed to speak effectively before an audience."
          />
        </Field>

        <Field
          label="Key highlights"
          hint="Up to 3 short points. Leave empty to use the category defaults."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {form.highlights.map((value, i) => (
              <input
                key={i}
                className={inputClass}
                value={value}
                onChange={setHighlight(i)}
                placeholder={
                  [
                    "Fluency & clarity",
                    "Confident expression",
                    "Real conversations",
                  ][i]
                }
              />
            ))}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Designed for">
            <input
              className={inputClass}
              value={form.audience}
              onChange={set("audience")}
              placeholder="Students • Professionals • Leaders"
            />
          </Field>

          <Field label="Visibility">
            <select
              className={inputClass}
              value={form.status}
              onChange={set("status")}
            >
              <option value="published">
                Published: visible on the website
              </option>
              <option value="draft">
                Hidden: saved but not shown publicly
              </option>
            </select>
          </Field>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border-[3px] border-red-300 bg-red-50 px-5 py-3.5 text-[18px] font-extrabold text-red-700">
            <AlertTriangle size={22} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t-[3px] border-[#E3EAF3] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full justify-center sm:w-auto rounded-xl border-2 border-[#D5E0EE] bg-white px-6 py-3 text-[18px] font-extrabold text-[#10243E]/75 transition hover:-translate-y-0.5 hover:bg-[#F5F9FF]"
          >
            Cancel
          </button>

          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10243E] to-[#2B5C8F] px-8 py-3 text-[18px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl disabled:opacity-60 sm:w-auto"
          >
            {saving && <Loader2 size={20} className="animate-spin" />}
            {saving ? "Saving..." : isNew ? "Create program" : "Save changes"}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[15px] font-extrabold uppercase tracking-[0.08em] text-[#10243E]/70">
        {label}
      </label>

      {children}

      {hint && (
        <p className="mt-1.5 text-[14px] font-bold text-[#10243E]/50">{hint}</p>
      )}
    </div>
  );
}
