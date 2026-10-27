import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  AudioLines,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  File,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  List as ListIcon,
  LoaderCircle,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
  X,
  Users,
  UserRound,
  CalendarClock,
  ClipboardCheck,
  Send,
  RefreshCw,
  CircleHelp,
  Trash2,
  ListChecks,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";

const API_URL = "http://localhost:5000";
const FONT_FAMILY = '"Times New Roman", Times, serif';

const SUBMISSION_TYPES = [
  {
    value: "text",
    label: "Text Response",
    description: "Students type their answers directly into the portal.",
    Icon: FileText,
    color: "#2563EB",
    background: "#EAF2FF",
    gradient: "linear-gradient(135deg, #2563EB, #38BDF8)",
  },
  {
    value: "video",
    label: "Video",
    description: "Students upload a video recording.",
    Icon: Video,
    color: "#E11D58",
    background: "#FFE9F0",
    gradient: "linear-gradient(135deg, #E11D58, #FB7185)",
  },
  {
    value: "image",
    label: "Image",
    description: "Students upload an image or photograph.",
    Icon: ImageIcon,
    color: "#7C3AED",
    background: "#F1EAFF",
    gradient: "linear-gradient(135deg, #7C3AED, #C084FC)",
  },
  {
    value: "document",
    label: "Document",
    description: "Students upload a document or PDF.",
    Icon: File,
    color: "#0891B2",
    background: "#E0F8FC",
    gradient: "linear-gradient(135deg, #0891B2, #22D3EE)",
  },
  {
    value: "audio",
    label: "Audio",
    description: "Students upload an audio recording.",
    Icon: AudioLines,
    color: "#D97706",
    background: "#FFF3D6",
    gradient: "linear-gradient(135deg, #D97706, #FBBF24)",
  },
  {
    value: "text_file",
    label: "Text + File",
    description: "Students write an answer and attach a file.",
    Icon: Upload,
    color: "#16A34A",
    background: "#E3F9EA",
    gradient: "linear-gradient(135deg, #16A34A, #4ADE80)",
  },
  {
    value: "multiple_files",
    label: "Multiple Files",
    description: "Students submit one or more supporting files.",
    Icon: BookOpen,
    color: "#C026D3",
    background: "#FCE8FF",
    gradient: "linear-gradient(135deg, #C026D3, #F472B6)",
  },
  {
    value: "mcq",
    label: "MCQ Quiz",
    description:
      "Create a quiz with multiple-choice questions and automatic scoring.",
    Icon: ListChecks,
    color: "#047857",
    background: "#DDF8E8",
    gradient: "linear-gradient(135deg, #047857, #34D399)",
  },
];

const INITIAL_FORM = {
  title: "",
  description: "",
  instructions: "",
  category: "General",
  submissionType: "text",
  allowLateSubmission: false,
  maxFiles: 1,
  maxFileSizeMB: 10,
  questions: [],
};

const INITIAL_ASSIGNMENT_FORM = {
  templateId: "",
  targetType: "all",
  batch: "",
  studentIds: [],
  dueDate: "",
  dueTime: "23:59",
  allowLateSubmission: false,
};

const inputClass =
  "w-full rounded-xl border-2 border-[#D5E0EE] bg-white px-4 py-4 text-[18px] font-bold text-[#0B2447] outline-none transition-all duration-200 placeholder:font-semibold placeholder:text-[#8A9AB0] hover:-translate-y-0.5 hover:border-[#7FB0F5] hover:shadow-md focus:-translate-y-0.5 focus:border-[#2563EB] focus:shadow-lg focus:ring-4 focus:ring-[#2563EB]/20";

const labelClass =
  "mb-2 block text-[15px] font-extrabold uppercase tracking-[0.09em] text-[#1E3A66]";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSubmissionType(value) {
  return (
    SUBMISSION_TYPES.find((type) => type.value === value) || SUBMISSION_TYPES[0]
  );
}

function getFileLimitText(template) {
  if (template.submissionType === "mcq") {
    const count = template.questions?.length || 0;
    return `${count} ${count === 1 ? "question" : "questions"}`;
  }

  if (template.submissionType === "text") return "Text only";

  const count =
    template.submissionType === "multiple_files" ? template.maxFiles || 1 : 1;

  return `${count} ${count === 1 ? "file" : "files"}`;
}

function getTodayLocalDate() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 10);
}

function getAssignmentTargetLabel(assignment) {
  if (assignment.targetType === "all") return "All eligible students";
  if (assignment.targetType === "batch") {
    return assignment.batch ? `Batch: ${assignment.batch}` : "Specific batch";
  }
  if (assignment.targetType === "individual") return "Individual student";
  if (assignment.targetType === "selected_students") return "Selected students";

  return "Assigned students";
}

function createEmptyQuestion() {
  return {
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 1,
  };
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];

  return questions.map((question) => {
    const options = Array.isArray(question.options)
      ? question.options.map((option) => String(option ?? ""))
      : ["", "", "", ""];

    while (options.length < 2) {
      options.push("");
    }

    return {
      questionText: question.questionText || "",
      options,
      correctOptionIndex: Number(question.correctOptionIndex) || 1,
    };
  });
}

/* ----------------------------- SMALL COMPONENTS ----------------------------- */

/** Animated height collapse wrapper. */
function Collapse({ open, children }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="collapse-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The "V" chevron button. Rotates when open. */
function ChevronToggle({
  open,
  onClick,
  label,
  color = "#2563EB",
  size = 24,
  className = "",
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
      title={open ? "Collapse" : "Show full view"}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 bg-white shadow-sm transition-colors hover:shadow-md ${className}`}
      style={{ borderColor: `${color}55`, color }}
    >
      <motion.span
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        <ChevronDown size={size} strokeWidth={3} />
      </motion.span>
    </motion.button>
  );
}

function ExpandCollapseAll({ onExpandAll, onCollapseAll }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExpandAll}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#CFE0F5] bg-white px-4 py-2.5 text-[15px] font-extrabold text-[#2563EB] transition-colors hover:bg-[#EAF2FF]"
      >
        <ChevronsUpDown size={18} />
        Expand all
      </button>
      <button
        type="button"
        onClick={onCollapseAll}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#CFE0F5] bg-white px-4 py-2.5 text-[15px] font-extrabold text-[#7C3AED] transition-colors hover:bg-[#F1EAFF]"
      >
        <ChevronsDownUp size={18} />
        Collapse all
      </button>
    </div>
  );
}

function EmptyState({ archived, onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[28px] border-[3px] border-dashed border-[#B9CCE4] bg-gradient-to-br from-white via-[#F2F7FF] to-[#F4EEFF] px-6 py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-xl"
        style={{
          background: archived
            ? "linear-gradient(135deg, #D97706, #FBBF24)"
            : "linear-gradient(135deg, #2563EB, #7C3AED)",
        }}
      >
        {archived ? <Archive size={44} /> : <BookOpen size={44} />}
      </motion.div>

      <h3 className="mt-7 text-4xl font-extrabold text-[#0B2447]">
        {archived ? "No archived templates" : "Your task library is empty"}
      </h3>

      <p className="mx-auto mt-3 max-w-xl text-xl font-semibold leading-8 text-[#4F6784]">
        {archived
          ? "Archived task templates will appear here. You can restore them whenever needed."
          : "Create your first reusable task template. You can assign it to individual students or entire batches later."}
      </p>

      {!archived && (
        <motion.button
          type="button"
          onClick={onCreate}
          whileHover={{ scale: 1.06, y: -3 }}
          whileTap={{ scale: 0.94 }}
          className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#0B2447] to-[#2563EB] px-8 py-4 text-xl font-extrabold text-white shadow-xl transition-shadow hover:shadow-2xl"
        >
          <Plus size={24} strokeWidth={3} />
          Create First Task
        </motion.button>
      )}
    </motion.div>
  );
}

function TaskTypeCard({ type, selected, onClick }) {
  const Icon = type.Icon;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex min-h-[175px] flex-col overflow-hidden rounded-2xl border-[3px] p-5 text-left transition-all duration-200 hover:shadow-xl"
      style={{
        borderColor: selected ? type.color : "#D5E0EE",
        backgroundColor: selected ? type.background : "#FFFFFF",
        boxShadow: selected
          ? `0 0 0 4px ${type.color}25, 0 14px 28px ${type.color}25`
          : undefined,
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: type.gradient }}
      />

      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md"
            style={{ background: type.gradient }}
          >
            <Check size={18} strokeWidth={4} />
          </motion.span>
        )}
      </AnimatePresence>

      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md"
        style={{ background: type.gradient }}
      >
        <Icon size={28} strokeWidth={2.4} />
      </span>

      <span
        className="mt-4 text-[20px] font-extrabold"
        style={{ color: selected ? type.color : "#0B2447" }}
      >
        {type.label}
      </span>

      <span className="mt-1.5 text-[16px] font-semibold leading-6 text-[#4F6784]">
        {type.description}
      </span>
    </motion.button>
  );
}

function StatCard({ label, value, Icon, gradient, shadow }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="relative cursor-default overflow-hidden rounded-3xl p-6 text-white transition-shadow"
      style={{ background: gradient, boxShadow: `0 16px 36px ${shadow}` }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
      <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-[16px] font-extrabold uppercase tracking-[0.1em] text-white/90">
          {label}
        </p>

        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 backdrop-blur">
          <Icon size={28} />
        </span>
      </div>

      <motion.p
        key={value}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mt-4 text-6xl font-extrabold leading-none"
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

function SectionHeading({ Icon, title, subtitle, gradient }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{ background: gradient }}
      >
        <Icon size={28} />
      </span>

      <div>
        <h3 className="text-[28px] font-extrabold leading-tight text-[#0B2447]">
          {title}
        </h3>
        <p className="text-[17px] font-semibold text-[#4F6784]">{subtitle}</p>
      </div>
    </div>
  );
}

/* ------------------------------ MCQ EDITOR --------------------------------- */

function McqQuestionEditor({
  question,
  questionIndex,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onRemoveQuestion,
}) {
  const [open, setOpen] = useState(true);

  const correctLetter = String.fromCharCode(
    64 + Number(question.correctOptionIndex || 1),
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="overflow-hidden rounded-2xl border-[3px] border-[#B8D9CD] bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#D1FAE5] via-[#ECFDF5] to-[#E0F2FE] px-5 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#047857] to-[#34D399] text-lg font-extrabold text-white shadow-md">
            {questionIndex + 1}
          </span>
          <div className="min-w-0">
            <h4 className="text-[20px] font-extrabold text-[#0B2447]">
              Question {questionIndex + 1}
            </h4>
            <p className="truncate text-[14px] font-bold text-[#4F6784]">
              {open
                ? "Select the correct answer below."
                : `${question.questionText.trim() || "No question text yet"} · ${question.options.length} options · Correct: ${correctLetter}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRemoveQuestion(questionIndex)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#FDA4AF] bg-white px-4 py-2.5 text-[15px] font-extrabold text-[#BE123C] transition-colors hover:bg-[#FFE4E6]"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Remove question</span>
          </button>

          <ChevronToggle
            open={open}
            onClick={() => setOpen((value) => !value)}
            label={`question ${questionIndex + 1}`}
            color="#047857"
          />
        </div>
      </div>

      <Collapse open={open}>
        <div className="space-y-5 p-5">
          <div>
            <label className={labelClass}>
              Question Text <span className="text-red-500">*</span>
            </label>

            <textarea
              value={question.questionText}
              onChange={(event) =>
                onQuestionChange(questionIndex, event.target.value)
              }
              rows={3}
              maxLength={2000}
              required
              placeholder="e.g. Which sentence is grammatically correct?"
              className={`${inputClass} resize-y`}
            />

            <p className="mt-1 text-right text-[14px] font-bold text-[#6B7F99]">
              {question.questionText.length}/2000
            </p>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className={labelClass}>Answer Options</label>
                <p className="text-[15px] font-semibold text-[#4F6784]">
                  Add 2–10 options. Choose the radio button beside the correct
                  answer.
                </p>
              </div>

              <span className="rounded-lg bg-[#EAF2FF] px-3 py-2 text-[14px] font-extrabold text-[#1D4ED8]">
                {question.options.length}/10 options
              </span>
            </div>

            <div className="space-y-3">
              {question.options.map((option, optionIndex) => {
                const isCorrect =
                  Number(question.correctOptionIndex) === optionIndex + 1;

                return (
                  <div
                    key={optionIndex}
                    className={`flex items-start gap-3 rounded-xl border-2 p-3 transition-colors ${
                      isCorrect
                        ? "border-[#34D399] bg-[#ECFDF5]"
                        : "border-[#D5E0EE] bg-white"
                    }`}
                  >
                    <label
                      className="mt-1 flex shrink-0 cursor-pointer items-center justify-center"
                      title="Mark as correct answer"
                    >
                      <input
                        type="radio"
                        name={`correct-option-${questionIndex}`}
                        checked={isCorrect}
                        onChange={() =>
                          onQuestionChange(
                            questionIndex,
                            question.questionText,
                            optionIndex + 1,
                          )
                        }
                        className="h-5 w-5 accent-[#059669]"
                      />
                    </label>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[15px] font-extrabold ${
                        isCorrect
                          ? "bg-[#059669] text-white"
                          : "bg-[#EAF2FF] text-[#1D4ED8]"
                      }`}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </span>

                    <input
                      value={option}
                      onChange={(event) =>
                        onOptionChange(
                          questionIndex,
                          optionIndex,
                          event.target.value,
                        )
                      }
                      maxLength={1000}
                      required
                      placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      className="min-w-0 flex-1 rounded-lg border-2 border-[#D5E0EE] bg-white px-3 py-2.5 text-[17px] font-bold text-[#0B2447] outline-none transition-colors placeholder:font-semibold placeholder:text-[#8A9AB0] focus:border-[#059669] focus:ring-4 focus:ring-[#34D399]/20"
                    />

                    {isCorrect && (
                      <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-[#059669] px-3 py-2 text-[13px] font-extrabold text-white sm:inline-flex">
                        <CheckCircle2 size={16} />
                        Correct
                      </span>
                    )}

                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveOption(questionIndex, optionIndex)
                        }
                        aria-label={`Remove option ${optionIndex + 1}`}
                        title="Remove option"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#BE123C] transition-colors hover:bg-[#FFE4E6]"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {question.options.length < 10 && (
              <button
                type="button"
                onClick={() => onAddOption(questionIndex)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[#86D9BC] bg-[#F0FDF8] px-5 py-3 text-[16px] font-extrabold text-[#047857] transition-colors hover:border-[#059669] hover:bg-[#D1FAE5]"
              >
                <Plus size={20} />
                Add option
              </button>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl border-2 border-[#86D9BC] bg-[#F0FDF8] p-3 text-[#065F46]">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <p className="text-[15px] font-bold leading-6">
                Correct answer: Option {correctLetter}. Students will not see
                the correct answer before submitting.
              </p>
            </div>
          </div>
        </div>
      </Collapse>
    </motion.div>
  );
}

/* ------------------------------ TASK CARD ---------------------------------- */

function TemplateCard({
  template,
  index,
  view,
  isBusy,
  expanded,
  onToggle,
  onEdit,
  onArchive,
  onRestore,
  onAssign,
}) {
  const type = getSubmissionType(template.submissionType);
  const TypeIcon = type.Icon;
  const isList = view === "list";

  const actions = !template.isArchived ? (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => onAssign(template)}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#34D399] px-4 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl"
      >
        <Send size={20} />
        Assign Task
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => onEdit(template)}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-4 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl"
      >
        <Edit3 size={20} />
        Edit
      </motion.button>

      <motion.button
        type="button"
        disabled={isBusy}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => onArchive(template)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#FBBF24] px-4 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl disabled:opacity-50"
      >
        {isBusy ? (
          <LoaderCircle size={20} className="animate-spin" />
        ) : (
          <Archive size={20} />
        )}
        Archive
      </motion.button>
    </>
  ) : (
    <motion.button
      type="button"
      disabled={isBusy}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => onRestore(template)}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#4ADE80] px-5 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl disabled:opacity-50"
    >
      {isBusy ? (
        <LoaderCircle size={20} className="animate-spin" />
      ) : (
        <RotateCcw size={20} />
      )}
      Restore Template
    </motion.button>
  );

  const chips = (
    <div className="flex flex-wrap items-center gap-2.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[15px] font-extrabold"
        style={{ backgroundColor: type.background, color: type.color }}
      >
        <TypeIcon size={16} />
        {getFileLimitText(template)}
      </span>

      {template.submissionType !== "mcq" && (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF2FF] px-3.5 py-2 text-[15px] font-extrabold text-[#1D4ED8]">
          <Upload size={16} />
          {template.submissionType === "text"
            ? "No size limit"
            : `${template.maxFileSizeMB || 10} MB / file`}
        </span>
      )}

      {template.submissionType === "mcq" && (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F1EAFF] px-3.5 py-2 text-[15px] font-extrabold text-[#7C3AED]">
          <CheckCircle2 size={16} />
          Auto-scored
        </span>
      )}

      <span
        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[15px] font-extrabold ${
          template.allowLateSubmission
            ? "bg-[#DDF8E8] text-[#15803D]"
            : "bg-[#FFE4E8] text-[#BE123C]"
        }`}
      >
        <Clock3 size={16} />
        {template.allowLateSubmission
          ? "Late submission allowed"
          : "Late submission disabled"}
      </span>
    </div>
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.35 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-[24px] border-[3px] bg-white transition-shadow duration-300 hover:shadow-[0_24px_50px_rgba(11,36,71,0.18)]"
      style={{ borderColor: `${type.color}40` }}
    >
      <div
        className={isList ? "absolute inset-y-0 left-0 w-2.5" : "h-2.5 w-full"}
        style={{ background: type.gradient }}
      />

      <div
        className={`p-5 sm:p-6 ${
          isList ? "pl-7 lg:flex lg:items-center lg:gap-6" : ""
        }`}
      >
        <div
          className={`flex items-start gap-4 ${
            isList ? "lg:w-[34%] lg:shrink-0" : ""
          }`}
        >
          <span
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            style={{ background: type.gradient }}
          >
            <TypeIcon size={31} strokeWidth={2.3} />
            <span className="absolute -bottom-2 -right-2 flex h-7 min-w-[28px] items-center justify-center rounded-full border-2 border-white bg-[#0B2447] px-1 text-[13px] font-extrabold text-white">
              {index + 1}
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3.5 py-1 text-[13px] font-extrabold uppercase tracking-wide"
                style={{ backgroundColor: type.background, color: type.color }}
              >
                {type.label}
              </span>

              {template.isArchived && (
                <span className="rounded-full bg-[#FFF3D6] px-3.5 py-1 text-[13px] font-extrabold uppercase tracking-wide text-[#B45309]">
                  Archived
                </span>
              )}
            </div>

            <h3 className="mt-3 break-words text-[26px] font-extrabold leading-tight text-[#0B2447] transition-colors group-hover:text-[#2563EB]">
              {template.title}
            </h3>

            <p className="mt-1.5 text-[16px] font-bold text-[#4F6784]">
              <span
                className="rounded-md px-2 py-0.5 font-extrabold"
                style={{ backgroundColor: type.background, color: type.color }}
              >
                {template.category || "General"}
              </span>{" "}
              · Created {formatDate(template.createdAt)}
            </p>
          </div>

          <ChevronToggle
            open={expanded}
            onClick={onToggle}
            label={`details for ${template.title}`}
            color={type.color}
          />
        </div>

        <div className={isList ? "mt-4 min-w-0 flex-1 lg:mt-0" : ""}>
          <p
            className={`whitespace-pre-wrap break-words text-[18px] font-semibold leading-7 text-[#3B5272] ${
              isList ? "" : "mt-5"
            } ${expanded ? "" : "line-clamp-2"}`}
          >
            {template.description}
          </p>

          <Collapse open={expanded}>
            <div>
              {template.instructions?.trim() && (
                <details
                  className="mt-4 rounded-xl border-2 bg-[#F6F9FE] p-4 transition-all open:shadow-md hover:shadow-md"
                  style={{ borderColor: `${type.color}30` }}
                >
                  <summary
                    className="cursor-pointer select-none text-[17px] font-extrabold transition-opacity hover:opacity-80"
                    style={{ color: type.color }}
                  >
                    View detailed instructions
                  </summary>

                  <p className="mt-3 whitespace-pre-wrap break-words text-[17px] font-semibold leading-7 text-[#4F6784]">
                    {template.instructions}
                  </p>
                </details>
              )}

              {template.submissionType === "mcq" &&
                Array.isArray(template.questions) && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-[#B8D9CD] bg-[#F0FDF8] p-3 text-[#047857]">
                    <CircleHelp size={21} />
                    <span className="text-[16px] font-extrabold">
                      {template.questions.length} questions · Automatic scoring
                    </span>
                  </div>
                )}

              <div className="mt-5">{chips}</div>
            </div>
          </Collapse>
        </div>

        <div
          className={`mt-5 flex flex-wrap gap-2.5 border-t-2 border-[#E6EDF6] pt-5 ${
            isList
              ? "lg:mt-0 lg:w-[280px] lg:shrink-0 lg:flex-col lg:border-l-2 lg:border-t-0 lg:pl-6 lg:pt-0"
              : ""
          }`}
        >
          {actions}
        </div>
      </div>
    </motion.article>
  );
}

/* --------------------------------- MAIN PAGE -------------------------------- */

export default function AdminTaskLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState("grid");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const [actionId, setActionId] = useState(null);

  // Assignment feature state
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignmentOptionsLoading, setAssignmentOptionsLoading] =
    useState(false);
  const [assignmentOptions, setAssignmentOptions] = useState({
    batches: [],
    managedBatches: [],
    students: [],
  });
  const [assignmentForm, setAssignmentForm] = useState(INITIAL_ASSIGNMENT_FORM);
  const [assignments, setAssignments] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Collapse / expand state (V toggles)
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [assignedOpen, setAssignedOpen] = useState(true);
  const [expandedTemplateIds, setExpandedTemplateIds] = useState(
    () => new Set(),
  );
  const [expandedAssignmentIds, setExpandedAssignmentIds] = useState(
    () => new Set(),
  );

  const isArchivedTab = activeTab === "archived";
  const isMcqForm = form.submissionType === "mcq";

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/tasks/templates?includeArchived=true`,
        {
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load task templates.");
      }

      const receivedTemplates = data.templates ?? data.tasks ?? [];

      setTemplates(Array.isArray(receivedTemplates) ? receivedTemplates : []);
    } catch (err) {
      console.error("Task template fetch error:", err);
      setError(err.message || "Unable to load task templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignmentOptions = useCallback(async () => {
    try {
      setAssignmentOptionsLoading(true);

      const response = await fetch(`${API_URL}/api/tasks/assignment-options`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load assignment options.");
      }

      setAssignmentOptions({
        batches: Array.isArray(data.batches) ? data.batches : [],
        managedBatches: Array.isArray(data.managedBatches)
          ? data.managedBatches
          : [],
        students: Array.isArray(data.students) ? data.students : [],
      });
    } catch (err) {
      console.error("Assignment options error:", err);
      setError(err.message || "Unable to load students and batches.");
    } finally {
      setAssignmentOptionsLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      setAssignmentLoading(true);

      const response = await fetch(`${API_URL}/api/tasks/assignments`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load assigned tasks.");
      }

      setAssignments(
        Array.isArray(data.assignments)
          ? data.assignments
          : Array.isArray(data.tasks)
            ? data.tasks
            : Array.isArray(data)
              ? data
              : [],
      );
    } catch (err) {
      console.error("Assigned tasks fetch error:", err);
      setError(err.message || "Unable to load assigned tasks.");
    } finally {
      setAssignmentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchAssignments();
  }, [fetchTemplates, fetchAssignments]);

  const categories = useMemo(() => {
    const values = templates
      .map((template) => template.category?.trim())
      .filter(Boolean);

    return ["all", ...new Set(values)];
  }, [templates]);

  const activeTemplates = useMemo(
    () => templates.filter((template) => !template.isArchived),
    [templates],
  );

  const archivedTemplates = useMemo(
    () => templates.filter((template) => template.isArchived),
    [templates],
  );

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates
      .filter((template) =>
        isArchivedTab ? template.isArchived : !template.isArchived,
      )
      .filter((template) => {
        if (selectedCategory === "all") return true;

        return template.category === selectedCategory;
      })
      .filter((template) => {
        if (!query) return true;

        return [
          template.title,
          template.description,
          template.instructions,
          template.category,
        ].some((value) => value?.toLowerCase().includes(query));
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );
  }, [templates, isArchivedTab, selectedCategory, search]);

  /* ----- collapse helpers ----- */

  const getAssignmentKey = (assignment, index) =>
    String(assignment._id || index);

  const toggleTemplateExpanded = (templateId) => {
    setExpandedTemplateIds((previous) => {
      const next = new Set(previous);

      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);

      return next;
    });
  };

  const expandAllTemplates = () =>
    setExpandedTemplateIds(
      new Set(filteredTemplates.map((template) => template._id)),
    );

  const collapseAllTemplates = () => setExpandedTemplateIds(new Set());

  const toggleAssignmentExpanded = (key) => {
    setExpandedAssignmentIds((previous) => {
      const next = new Set(previous);

      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });
  };

  const expandAllAssignments = () =>
    setExpandedAssignmentIds(
      new Set(
        assignments.map((assignment, index) =>
          getAssignmentKey(assignment, index),
        ),
      ),
    );

  const collapseAllAssignments = () => setExpandedAssignmentIds(new Set());

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setError("");
    setMessage("");
    setForm({
      ...INITIAL_FORM,
      questions: [],
    });
    setEditingId(null);
    setShowForm(true);
    setShowAssignForm(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openEditForm = (template) => {
    setError("");
    setMessage("");

    setForm({
      title: template.title || "",
      description: template.description || "",
      instructions: template.instructions || "",
      category: template.category || "General",
      submissionType: template.submissionType || "text",
      allowLateSubmission: Boolean(template.allowLateSubmission),
      maxFiles: template.maxFiles ?? 1,
      maxFileSizeMB: template.maxFileSizeMB ?? 10,
      questions: normalizeQuestions(template.questions),
    });

    setEditingId(template._id);
    setShowForm(true);
    setShowAssignForm(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const addQuestion = () => {
    setForm((previous) => ({
      ...previous,
      questions: [...(previous.questions || []), createEmptyQuestion()],
    }));
  };

  const removeQuestion = (questionIndex) => {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.filter(
        (_, index) => index !== questionIndex,
      ),
    }));
  };

  const updateQuestionText = (questionIndex, questionText) => {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) =>
        index === questionIndex ? { ...question, questionText } : question,
      ),
    }));
  };

  const setCorrectOption = (
    questionIndex,
    _questionText,
    correctOptionIndex,
  ) => {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) =>
        index === questionIndex
          ? { ...question, correctOptionIndex }
          : question,
      ),
    }));
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? value : option,
              ),
            }
          : question,
      ),
    }));
  };

  const addOption = (questionIndex) => {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) =>
        index === questionIndex && question.options.length < 10
          ? { ...question, options: [...question.options, ""] }
          : question,
      ),
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) => {
        if (index !== questionIndex || question.options.length <= 2) {
          return question;
        }

        const updatedOptions = question.options.filter(
          (_, currentOptionIndex) => currentOptionIndex !== optionIndex,
        );

        let correctOptionIndex = Number(question.correctOptionIndex) || 1;

        if (optionIndex + 1 === correctOptionIndex) {
          correctOptionIndex = 1;
        } else if (optionIndex + 1 < correctOptionIndex) {
          correctOptionIndex -= 1;
        }

        correctOptionIndex = Math.min(
          Math.max(correctOptionIndex, 1),
          updatedOptions.length,
        );

        return {
          ...question,
          options: updatedOptions,
          correctOptionIndex,
        };
      }),
    }));
  };

  const updateAssignmentField = (field, value) => {
    setAssignmentForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleStudentSelection = (studentId) => {
    setAssignmentForm((previous) => {
      const alreadySelected = previous.studentIds.includes(studentId);

      return {
        ...previous,
        studentIds: alreadySelected
          ? previous.studentIds.filter((id) => id !== studentId)
          : [...previous.studentIds, studentId],
      };
    });
  };

  const openAssignForm = async (template = null) => {
    setError("");
    setMessage("");
    setShowForm(false);

    const nextForm = {
      ...INITIAL_ASSIGNMENT_FORM,
      templateId: template?._id || "",
      allowLateSubmission: Boolean(template?.allowLateSubmission),
    };

    setAssignmentForm(nextForm);
    setShowAssignForm(true);

    await Promise.all([fetchAssignmentOptions(), fetchAssignments()]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeAssignForm = () => {
    if (assigning) return;

    setShowAssignForm(false);
    setAssignmentForm(INITIAL_ASSIGNMENT_FORM);
  };

  const handleAssignTask = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!assignmentForm.templateId) {
      setError("Please select a task template.");
      return;
    }

    const selectedTemplate = activeTemplates.find(
      (template) => template._id === assignmentForm.templateId,
    );

    if (!selectedTemplate) {
      setError("Please select an active task template.");
      return;
    }

    if (!assignmentForm.dueDate || !assignmentForm.dueTime) {
      setError("Please select the assignment deadline date and time.");
      return;
    }

    const dueDate = new Date(
      `${assignmentForm.dueDate}T${assignmentForm.dueTime}`,
    );

    if (Number.isNaN(dueDate.getTime())) {
      setError("Please enter a valid deadline.");
      return;
    }

    if (dueDate.getTime() <= Date.now()) {
      setError("The deadline must be in the future.");
      return;
    }

    if (assignmentForm.targetType === "batch" && !assignmentForm.batch.trim()) {
      setError("Please select a batch.");
      return;
    }

    if (
      (assignmentForm.targetType === "selected_students" ||
        assignmentForm.targetType === "individual") &&
      assignmentForm.studentIds.length === 0
    ) {
      setError(
        assignmentForm.targetType === "individual"
          ? "Please select one student."
          : "Please select at least one student.",
      );
      return;
    }

    if (
      assignmentForm.targetType === "individual" &&
      assignmentForm.studentIds.length !== 1
    ) {
      setError("Individual assignment requires exactly one student.");
      return;
    }

    const payload = {
      templateId: assignmentForm.templateId,
      targetType: assignmentForm.targetType,
      batch:
        assignmentForm.targetType === "batch"
          ? assignmentForm.batch.trim()
          : "",
      studentIds:
        assignmentForm.targetType === "selected_students" ||
        assignmentForm.targetType === "individual"
          ? assignmentForm.studentIds
          : [],
      dueDate: dueDate.toISOString(),
      allowLateSubmission: Boolean(assignmentForm.allowLateSubmission),
    };

    try {
      setAssigning(true);

      const response = await fetch(`${API_URL}/api/tasks/assignments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to assign this task.");
      }

      setMessage(
        data.message ||
          `"${selectedTemplate.title}" has been assigned successfully.`,
      );

      setShowAssignForm(false);
      setAssignmentForm(INITIAL_ASSIGNMENT_FORM);

      await Promise.all([fetchAssignments(), fetchTemplates()]);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Task assignment error:", err);
      setError(err.message || "Unable to assign this task.");
    } finally {
      setAssigning(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter a task description.");
      return;
    }

    if (!form.submissionType) {
      setError("Please select a submission format.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim(),
      category: form.category.trim() || "General",
      submissionType: form.submissionType,
      allowLateSubmission: Boolean(form.allowLateSubmission),
      maxFiles: Number(form.maxFiles),
      maxFileSizeMB: Number(form.maxFileSizeMB),
    };

    if (isMcqForm) {
      if (!Array.isArray(form.questions) || form.questions.length === 0) {
        setError("Please add at least one MCQ question.");
        return;
      }

      if (form.questions.length > 100) {
        setError("A task can contain a maximum of 100 questions.");
        return;
      }

      for (let index = 0; index < form.questions.length; index += 1) {
        const question = form.questions[index];
        const questionNumber = index + 1;

        if (!question.questionText?.trim()) {
          setError(`Please enter the text for Question ${questionNumber}.`);
          return;
        }

        if (question.questionText.trim().length > 2000) {
          setError(`Question ${questionNumber} cannot exceed 2000 characters.`);
          return;
        }

        if (
          !Array.isArray(question.options) ||
          question.options.length < 2 ||
          question.options.length > 10
        ) {
          setError(
            `Question ${questionNumber} must have between 2 and 10 options.`,
          );
          return;
        }

        const emptyOptionIndex = question.options.findIndex(
          (option) => !String(option).trim(),
        );

        if (emptyOptionIndex !== -1) {
          setError(
            `Please fill Option ${String.fromCharCode(
              65 + emptyOptionIndex,
            )} in Question ${questionNumber}.`,
          );
          return;
        }

        const correctOptionIndex = Number(question.correctOptionIndex);

        if (
          !Number.isInteger(correctOptionIndex) ||
          correctOptionIndex < 1 ||
          correctOptionIndex > question.options.length
        ) {
          setError(
            `Please select the correct answer for Question ${questionNumber}.`,
          );
          return;
        }
      }

      payload.questions = form.questions.map((question) => ({
        questionText: question.questionText.trim(),
        options: question.options.map((option) => String(option).trim()),
        correctOptionIndex: Number(question.correctOptionIndex),
      }));
    } else {
      payload.questions = [];
    }

    if (!isMcqForm && !Number.isInteger(payload.maxFiles)) {
      setError("Maximum files must be a whole number between 1 and 10.");
      return;
    }

    if (!isMcqForm && (payload.maxFiles < 1 || payload.maxFiles > 10)) {
      setError("Maximum files must be a whole number between 1 and 10.");
      return;
    }

    if (
      !isMcqForm &&
      (!Number.isFinite(payload.maxFileSizeMB) ||
        payload.maxFileSizeMB < 1 ||
        payload.maxFileSizeMB > 100)
    ) {
      setError("File size must be between 1 MB and 100 MB.");
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/api/tasks/templates/${editingId}`
        : `${API_URL}/api/tasks/templates`;

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save task template.");
      }

      setMessage(
        editingId
          ? "Task template updated successfully."
          : "Task template created successfully.",
      );

      resetForm();
      await fetchTemplates();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Task template save error:", err);
      setError(err.message || "Unable to save task template.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (template) => {
    const confirmed = window.confirm(
      `Archive "${template.title}"?\n\nYou can restore this template later. Existing assignments and submissions should remain available.`,
    );

    if (!confirmed) return;

    try {
      setActionId(template._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/tasks/templates/${template._id}/archive`,
        {
          method: "PATCH",
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to archive this template.");
      }

      setMessage("Task template archived successfully.");
      await fetchTemplates();
    } catch (err) {
      console.error("Archive task error:", err);
      setError(err.message || "Unable to archive this template.");
    } finally {
      setActionId(null);
    }
  };

  const handleRestore = async (template) => {
    try {
      setActionId(template._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/tasks/templates/${template._id}/restore`,
        {
          method: "PATCH",
          headers: getHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to restore this template.");
      }

      setMessage("Task template restored successfully.");
      setActiveTab("active");
      await fetchTemplates();
    } catch (err) {
      console.error("Restore task error:", err);
      setError(err.message || "Unable to restore this template.");
    } finally {
      setActionId(null);
    }
  };

  const selectedAssignmentTemplate = activeTemplates.find(
    (template) => template._id === assignmentForm.templateId,
  );

  const visibleAssignmentStudents = useMemo(
    () => assignmentOptions.students,
    [assignmentOptions.students],
  );

  return (
    <div
      className="task-library-root min-h-full space-y-8 bg-gradient-to-b from-[#EEF3FB] via-[#F7F4FF] to-[#EFFAF6] pb-14"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <style>{`
        .task-library-root, .task-library-root * { font-family: ${FONT_FAMILY} !important; }
        @keyframes tl-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } }
        @keyframes tl-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .tl-hero { background: linear-gradient(120deg, #0B2447, #19376D, #4C1D95, #0B2447); background-size: 300% 300%; animation: tl-gradient 14s ease infinite; }
        .tl-shimmer::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); transform: translateX(-120%); animation: tl-shimmer 2.8s ease-in-out infinite; }
        .task-library-root .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tl-hero relative isolate overflow-hidden rounded-[32px] border-[3px] border-[#3B5CA8] px-7 py-10 text-white shadow-[0_28px_70px_rgba(11,36,71,0.3)] sm:px-10 sm:py-12"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[46px] border-[#38BDF8]/20"
        />
        <div className="pointer-events-none absolute -bottom-28 left-[35%] h-72 w-72 rounded-full bg-[#34D399]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#F472B6]/25 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[#34D399]/50 bg-[#34D399]/15 px-5 py-2.5 text-[15px] font-extrabold uppercase tracking-[0.14em] text-[#A7F3D0]"
            >
              <Sparkles size={19} />
              Admin Workspace
            </motion.div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              Assessments{" "}
              <span className="bg-gradient-to-r from-[#7DD3FC] via-[#F9A8D4] to-[#FDE68A] bg-clip-text text-transparent">
                & Tasks
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[20px] font-semibold leading-8 text-white/85">
              Create reusable activities, build auto-scored MCQ quizzes, assign
              tasks to students or batches, set deadlines, and track
              submissions.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2.5 rounded-xl border-2 border-white/20 bg-white/10 px-5 py-3.5 text-[16px] font-extrabold backdrop-blur">
                <ShieldCheck size={22} className="text-[#6EE7B7]" />
                Reusable templates
              </span>

              <span className="inline-flex items-center gap-2.5 rounded-xl border-2 border-white/20 bg-white/10 px-5 py-3.5 text-[16px] font-extrabold backdrop-blur">
                <ListChecks size={22} className="text-[#A7F3D0]" />
                MCQ auto-scoring
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={() => openAssignForm()}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.94 }}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/30 bg-white/15 px-7 py-5 text-[19px] font-extrabold text-white shadow-lg backdrop-blur transition-colors hover:bg-white/25"
            >
              <Send size={24} />
              Assign Existing Task
            </motion.button>

            <motion.button
              type="button"
              onClick={openCreateForm}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.94 }}
              className="tl-shimmer relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#34D399] to-[#A3E635] px-7 py-5 text-[19px] font-extrabold text-[#052E26] shadow-[0_14px_34px_rgba(52,211,153,0.5)] transition-shadow hover:shadow-[0_20px_44px_rgba(52,211,153,0.7)]"
            >
              <Plus size={26} strokeWidth={3.2} />
              Create New Task
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* NOTIFICATIONS */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="message"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="flex items-start gap-4 rounded-2xl border-[3px] border-[#86EFAC] bg-gradient-to-r from-[#DCFCE7] to-[#ECFDF5] p-5 text-[#14532D] shadow-lg"
          >
            <CheckCircle2 size={28} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-[19px] font-extrabold">{message}</p>
            <motion.button
              type="button"
              whileHover={{ rotate: 90, scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              <X size={24} />
            </motion.button>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="flex items-start gap-4 rounded-2xl border-[3px] border-[#FDA4AF] bg-gradient-to-r from-[#FFE4E6] to-[#FFF1F2] p-5 text-[#9F1239] shadow-lg"
          >
            <ShieldCheck size={28} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-[19px] font-extrabold">{error}</p>
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

      {/* STATS */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Templates"
          value={templates.length}
          Icon={BookOpen}
          gradient="linear-gradient(135deg, #2563EB, #7C3AED)"
          shadow="rgba(37,99,235,0.35)"
        />

        <StatCard
          label="Available to Assign"
          value={activeTemplates.length}
          Icon={CheckCircle2}
          gradient="linear-gradient(135deg, #059669, #34D399)"
          shadow="rgba(5,150,105,0.35)"
        />

        <StatCard
          label="Archived"
          value={archivedTemplates.length}
          Icon={Archive}
          gradient="linear-gradient(135deg, #EA580C, #FBBF24)"
          shadow="rgba(234,88,12,0.35)"
        />
      </section>

      {/* ASSIGN TASK FORM */}
      <AnimatePresence>
        {showAssignForm && (
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            className="overflow-hidden rounded-[30px] border-[3px] border-[#86D9BC] bg-white shadow-[0_22px_60px_rgba(11,36,71,0.14)]"
          >
            <div className="flex flex-col justify-between gap-4 border-b-[3px] border-[#D9F1E6] bg-gradient-to-r from-[#D1FAE5] via-[#E0F2FE] to-[#EDE9FE] px-7 py-6 sm:flex-row sm:items-center sm:px-9">
              <div>
                <div className="flex items-center gap-2 text-[#047857]">
                  <Send size={24} />
                  <span className="text-[15px] font-extrabold uppercase tracking-[0.13em]">
                    Assignment Setup
                  </span>
                </div>

                <h2 className="mt-2 text-[34px] font-extrabold leading-tight text-[#0B2447]">
                  Assign a Task
                </h2>

                <p className="mt-1 text-[18px] font-semibold text-[#4F6784]">
                  Select a saved template, choose the students, and set a
                  deadline.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAssignForm}
                disabled={assigning}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#D5E0EE] bg-white px-5 py-3.5 text-[17px] font-extrabold text-[#1E3A66] transition-colors hover:border-[#FDA4AF] hover:bg-[#FFE4E6] hover:text-[#BE123C] disabled:opacity-50"
              >
                <X size={22} />
                Close
              </button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-8 p-6 sm:p-9">
              <div>
                <SectionHeading
                  Icon={BookOpen}
                  title="Choose Task Template"
                  subtitle="Only active templates can be assigned."
                  gradient="linear-gradient(135deg, #2563EB, #38BDF8)"
                />

                <label className={labelClass}>
                  Task Template <span className="text-red-500">*</span>
                </label>

                <select
                  value={assignmentForm.templateId}
                  onChange={(event) => {
                    const templateId = event.target.value;
                    const template = activeTemplates.find(
                      (item) => item._id === templateId,
                    );

                    setAssignmentForm((previous) => ({
                      ...previous,
                      templateId,
                      allowLateSubmission: Boolean(
                        template?.allowLateSubmission,
                      ),
                    }));
                  }}
                  required
                  className={inputClass}
                >
                  <option value="">Select a task template</option>
                  {activeTemplates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.title} — {template.category || "General"}
                    </option>
                  ))}
                </select>

                {activeTemplates.length === 0 && (
                  <p className="mt-3 rounded-xl border-2 border-[#FCD34D] bg-[#FFFBEB] p-4 text-[16px] font-bold text-[#92400E]">
                    No active templates are available. Create or restore a
                    template before assigning a task.
                  </p>
                )}

                {selectedAssignmentTemplate && (
                  <div className="mt-4 rounded-2xl border-2 border-[#CFE0F5] bg-[#F4F8FF] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-[#DBEAFE] px-3 py-2 text-[15px] font-extrabold text-[#1D4ED8]">
                        {
                          getSubmissionType(
                            selectedAssignmentTemplate.submissionType,
                          ).label
                        }
                      </span>

                      <span className="rounded-lg bg-white px-3 py-2 text-[15px] font-extrabold text-[#4F6784]">
                        {getFileLimitText(selectedAssignmentTemplate)}
                      </span>

                      {selectedAssignmentTemplate.submissionType === "mcq" && (
                        <span className="rounded-lg bg-[#DDF8E8] px-3 py-2 text-[15px] font-extrabold text-[#047857]">
                          Automatic scoring
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-[24px] font-extrabold text-[#0B2447]">
                      {selectedAssignmentTemplate.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-[17px] font-semibold leading-7 text-[#4F6784]">
                      {selectedAssignmentTemplate.description}
                    </p>

                    {selectedAssignmentTemplate.submissionType === "mcq" && (
                      <p className="mt-3 text-[16px] font-extrabold text-[#047857]">
                        {selectedAssignmentTemplate.questions?.length || 0}{" "}
                        questions will be included in the assignment.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* RECIPIENTS */}
              <div className="border-t-[3px] border-[#E6EDF6] pt-8">
                <SectionHeading
                  Icon={Users}
                  title="Who Should Receive This Task?"
                  subtitle="Choose all eligible students, one batch, or specific students."
                  gradient="linear-gradient(135deg, #059669, #34D399)"
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      value: "all",
                      label: "All Students",
                      description:
                        "Assign to all eligible students across batches.",
                      Icon: Users,
                    },
                    {
                      value: "batch",
                      label: "Specific Batch",
                      description:
                        "Assign to every eligible student in a batch.",
                      Icon: CalendarClock,
                    },
                    {
                      value: "selected_students",
                      label: "Selected Students",
                      description: "Choose several students individually.",
                      Icon: CheckCircle2,
                    },
                    {
                      value: "individual",
                      label: "One Student",
                      description: "Assign this task to one student only.",
                      Icon: UserRound,
                    },
                  ].map((target) => {
                    const Icon = target.Icon;
                    const selected = assignmentForm.targetType === target.value;

                    return (
                      <motion.button
                        key={target.value}
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setAssignmentForm((previous) => ({
                            ...previous,
                            targetType: target.value,
                            batch: "",
                            studentIds: [],
                          }));
                        }}
                        className={`rounded-2xl border-[3px] p-5 text-left transition-all ${
                          selected
                            ? "border-[#059669] bg-[#ECFDF5] shadow-lg"
                            : "border-[#D5E0EE] bg-white hover:border-[#86D9BC] hover:bg-[#F0FDF8]"
                        }`}
                      >
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                            selected ? "bg-[#059669]" : "bg-[#7890AE]"
                          }`}
                        >
                          <Icon size={25} />
                        </span>

                        <span className="mt-3 block text-[20px] font-extrabold text-[#0B2447]">
                          {target.label}
                        </span>

                        <span className="mt-2 block text-[15px] font-semibold leading-6 text-[#4F6784]">
                          {target.description}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {assignmentForm.targetType === "batch" && (
                  <div className="mt-6 rounded-2xl border-[3px] border-[#CFE0F5] bg-[#F4F8FF] p-6">
                    <label className={labelClass}>
                      Select Batch <span className="text-red-500">*</span>
                    </label>

                    {assignmentOptionsLoading ? (
                      <div className="flex items-center gap-3 py-4 text-[17px] font-bold text-[#4F6784]">
                        <LoaderCircle className="animate-spin" size={23} />
                        Loading batches...
                      </div>
                    ) : (
                      <select
                        value={assignmentForm.batch}
                        onChange={(event) =>
                          updateAssignmentField("batch", event.target.value)
                        }
                        required
                        className={inputClass}
                      >
                        <option value="">Choose a batch</option>
                        {assignmentOptions.managedBatches.map((batch) => (
                          <option key={batch._id} value={batch.timing}>
                            {batch.timing}
                          </option>
                        ))}
                      </select>
                    )}

                    <p className="mt-3 text-[15px] font-semibold leading-6 text-[#4F6784]">
                      The task will be assigned to eligible students whose batch
                      matches the selected batch.
                    </p>
                  </div>
                )}

                {(assignmentForm.targetType === "selected_students" ||
                  assignmentForm.targetType === "individual") && (
                  <div className="mt-6 rounded-2xl border-[3px] border-[#CFE0F5] bg-[#F4F8FF] p-6">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="text-[23px] font-extrabold text-[#0B2447]">
                          Select Students
                        </h4>
                        <p className="mt-1 text-[16px] font-semibold text-[#4F6784]">
                          {assignmentForm.targetType === "individual"
                            ? "Select exactly one student."
                            : "Select every student who should receive this task."}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-2 self-start rounded-xl bg-[#D1FAE5] px-4 py-2.5 text-[16px] font-extrabold text-[#047857]">
                        <CheckCircle2 size={20} />
                        {assignmentForm.studentIds.length} selected
                      </span>
                    </div>

                    {assignmentOptionsLoading ? (
                      <div className="flex items-center gap-3 py-8 text-[17px] font-bold text-[#4F6784]">
                        <LoaderCircle className="animate-spin" size={23} />
                        Loading students...
                      </div>
                    ) : visibleAssignmentStudents.length === 0 ? (
                      <div className="mt-5 rounded-xl border-2 border-dashed border-[#B9CCE4] bg-white p-7 text-center text-[17px] font-bold text-[#4F6784]">
                        No eligible students are available.
                      </div>
                    ) : (
                      <div className="mt-5 grid max-h-[420px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                        {visibleAssignmentStudents.map((student) => {
                          const studentId = student._id;
                          const isSelected =
                            assignmentForm.studentIds.includes(studentId);

                          return (
                            <label
                              key={studentId}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                isSelected
                                  ? "border-[#059669] bg-[#ECFDF5]"
                                  : "border-[#D5E0EE] bg-white hover:border-[#86D9BC]"
                              }`}
                            >
                              <input
                                type={
                                  assignmentForm.targetType === "individual"
                                    ? "radio"
                                    : "checkbox"
                                }
                                name="assignmentStudent"
                                checked={isSelected}
                                onChange={() => {
                                  if (
                                    assignmentForm.targetType === "individual"
                                  ) {
                                    updateAssignmentField("studentIds", [
                                      studentId,
                                    ]);
                                  } else {
                                    toggleStudentSelection(studentId);
                                  }
                                }}
                                className="mt-1 h-5 w-5 accent-[#059669]"
                              />

                              <span className="min-w-0 flex-1">
                                <span className="block break-words text-[18px] font-extrabold text-[#0B2447]">
                                  {student.name || "Unnamed student"}
                                </span>

                                <span className="mt-1 block break-words text-[15px] font-semibold text-[#4F6784]">
                                  {student.username || "No username"}
                                </span>

                                <span className="mt-2 inline-flex rounded-lg bg-[#EAF2FF] px-2.5 py-1 text-[14px] font-extrabold text-[#1D4ED8]">
                                  {student.batch || "No batch"}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {assignmentForm.targetType === "all" && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border-2 border-[#86D9BC] bg-[#ECFDF5] p-5 text-[#065F46]">
                    <Users size={25} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[18px] font-extrabold">
                        Assign to all eligible students
                      </p>
                      <p className="mt-1 text-[16px] font-semibold leading-6">
                        The backend determines the eligible student list when
                        you assign the task. Students must meet the eligibility
                        rules configured by your application.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* DEADLINE */}
              <div className="border-t-[3px] border-[#E6EDF6] pt-8">
                <SectionHeading
                  Icon={CalendarClock}
                  title="Deadline & Submission Rules"
                  subtitle="Choose when students must submit their work."
                  gradient="linear-gradient(135deg, #EA580C, #FBBF24)"
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Deadline Date <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      min={getTodayLocalDate()}
                      value={assignmentForm.dueDate}
                      onChange={(event) =>
                        updateAssignmentField("dueDate", event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Deadline Time <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="time"
                      value={assignmentForm.dueTime}
                      onChange={(event) =>
                        updateAssignmentField("dueTime", event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <motion.button
                  type="button"
                  role="switch"
                  aria-checked={assignmentForm.allowLateSubmission}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    updateAssignmentField(
                      "allowLateSubmission",
                      !assignmentForm.allowLateSubmission,
                    )
                  }
                  className={`mt-6 flex w-full items-center gap-5 rounded-2xl border-[3px] p-5 text-left transition-all duration-300 hover:shadow-lg ${
                    assignmentForm.allowLateSubmission
                      ? "border-[#34D399] bg-gradient-to-r from-[#D1FAE5] to-[#ECFDF5]"
                      : "border-[#D5E0EE] bg-[#F6F9FE] hover:border-[#7FB0F5]"
                  }`}
                >
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                      assignmentForm.allowLateSubmission
                        ? "bg-[#059669] text-white"
                        : "bg-white text-[#6B7F99]"
                    }`}
                  >
                    {assignmentForm.allowLateSubmission ? (
                      <CheckCircle2 size={27} />
                    ) : (
                      <Clock3 size={27} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[21px] font-extrabold text-[#0B2447]">
                      Allow late submissions
                    </span>
                    <span className="mt-1 block text-[16px] font-semibold leading-6 text-[#4F6784]">
                      {assignmentForm.allowLateSubmission
                        ? "Students may submit after the deadline."
                        : "Students should submit before the deadline."}
                    </span>
                  </span>

                  <span
                    className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                      assignmentForm.allowLateSubmission
                        ? "bg-[#16A34A]"
                        : "bg-[#B8C6D8]"
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md ${
                        assignmentForm.allowLateSubmission
                          ? "right-1"
                          : "left-1"
                      }`}
                    />
                  </span>
                </motion.button>
              </div>

              <div className="flex flex-col-reverse justify-end gap-4 border-t-[3px] border-[#E6EDF6] pt-7 sm:flex-row">
                <button
                  type="button"
                  onClick={closeAssignForm}
                  disabled={assigning}
                  className="rounded-xl border-[3px] border-[#D5E0EE] bg-white px-8 py-4 text-[18px] font-extrabold text-[#1E3A66] transition-colors hover:bg-[#EEF3FB] disabled:opacity-50"
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={
                    assigning ||
                    activeTemplates.length === 0 ||
                    assignmentOptionsLoading
                  }
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#047857] via-[#059669] to-[#34D399] px-9 py-4 text-[19px] font-extrabold text-white shadow-lg transition-shadow hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assigning ? (
                    <LoaderCircle size={24} className="animate-spin" />
                  ) : (
                    <Send size={23} />
                  )}
                  {assigning ? "Assigning Task..." : "Assign Task"}
                </motion.button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            className="overflow-hidden rounded-[30px] border-[3px] border-[#B6CCEA] bg-white shadow-[0_22px_60px_rgba(11,36,71,0.14)]"
          >
            <div className="flex flex-col justify-between gap-4 border-b-[3px] border-[#E1E9F4] bg-gradient-to-r from-[#DBEAFE] via-[#F3E8FF] to-[#D1FAE5] px-7 py-6 sm:flex-row sm:items-center sm:px-9">
              <div>
                <div className="flex items-center gap-2 text-[#2563EB]">
                  {editingId ? <Edit3 size={24} /> : <Plus size={24} />}
                  <span className="text-[15px] font-extrabold uppercase tracking-[0.13em]">
                    Task Template Editor
                  </span>
                </div>

                <h2 className="mt-2 text-[34px] font-extrabold leading-tight text-[#0B2447]">
                  {editingId ? "Edit Task Template" : "Create a New Task"}
                </h2>

                <p className="mt-1 text-[18px] font-semibold text-[#4F6784]">
                  Define the activity before assigning it to students.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#D5E0EE] bg-white px-5 py-3.5 text-[17px] font-extrabold text-[#1E3A66] shadow-sm transition-colors hover:border-[#FDA4AF] hover:bg-[#FFE4E6] hover:text-[#BE123C]"
              >
                <X size={22} />
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-9 p-6 sm:p-9">
              {/* TASK INFORMATION */}
              <div>
                <SectionHeading
                  Icon={FileText}
                  title="Task Information"
                  subtitle="Add the title, purpose, and student instructions."
                  gradient="linear-gradient(135deg, #2563EB, #38BDF8)"
                />

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      maxLength={150}
                      required
                      placeholder="e.g. English Grammar MCQ Quiz"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-right text-[15px] font-extrabold text-[#6B7F99]">
                      {form.title.length}/150
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Category</label>
                    <input
                      value={form.category}
                      onChange={(event) =>
                        updateField("category", event.target.value)
                      }
                      maxLength={100}
                      placeholder="e.g. Speaking, Grammar, Interview"
                      className={inputClass}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className={labelClass}>
                      Task Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      required
                      rows={3}
                      maxLength={5000}
                      placeholder="Explain what the student is expected to complete."
                      className={`${inputClass} resize-y`}
                    />
                    <p className="mt-1.5 text-right text-[15px] font-extrabold text-[#6B7F99]">
                      {form.description.length}/5000
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <label className={labelClass}>Detailed Instructions</label>
                    <textarea
                      value={form.instructions}
                      onChange={(event) =>
                        updateField("instructions", event.target.value)
                      }
                      rows={5}
                      maxLength={10000}
                      placeholder={
                        "1. Explain the steps students should follow.\n2. Mention any required topics or examples.\n3. Include any special submission instructions."
                      }
                      className={`${inputClass} resize-y`}
                    />
                    <p className="mt-1.5 text-right text-[15px] font-extrabold text-[#6B7F99]">
                      {form.instructions.length}/10000
                    </p>
                  </div>
                </div>
              </div>

              {/* SUBMISSION FORMAT */}
              <div className="border-t-[3px] border-[#E6EDF6] pt-8">
                <SectionHeading
                  Icon={Upload}
                  title="Submission Format"
                  subtitle="Choose how students will respond to this task."
                  gradient="linear-gradient(135deg, #7C3AED, #F472B6)"
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {SUBMISSION_TYPES.map((type) => (
                    <TaskTypeCard
                      key={type.value}
                      type={type}
                      selected={form.submissionType === type.value}
                      onClick={() => {
                        updateField("submissionType", type.value);

                        if (
                          type.value === "mcq" &&
                          form.questions.length === 0
                        ) {
                          setForm((previous) => ({
                            ...previous,
                            submissionType: type.value,
                            questions: [createEmptyQuestion()],
                          }));
                        }
                      }}
                    />
                  ))}
                </div>

                {/* MCQ QUESTION BUILDER */}
                {isMcqForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-7 overflow-hidden rounded-[24px] border-[3px] border-[#86D9BC] bg-gradient-to-br from-[#F0FDF8] via-white to-[#F0F9FF] p-5 sm:p-7"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2 text-[#047857]">
                          <ListChecks size={25} />
                          <span className="text-[14px] font-extrabold uppercase tracking-[0.12em]">
                            MCQ Quiz Builder
                          </span>
                        </div>

                        <h3 className="mt-2 text-[30px] font-extrabold text-[#0B2447]">
                          Questions & Answers
                        </h3>

                        <p className="mt-2 max-w-2xl text-[16px] font-semibold leading-7 text-[#4F6784]">
                          Add questions and answer options. Select one correct
                          answer for each question. The system will calculate
                          each student's score automatically after submission.
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 rounded-2xl border-2 border-[#B8D9CD] bg-white px-5 py-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#047857] to-[#34D399] text-white">
                          <CircleHelp size={27} />
                        </span>
                        <div>
                          <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#4F6784]">
                            Total Questions
                          </p>
                          <p className="text-3xl font-extrabold text-[#047857]">
                            {form.questions.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-xl border-2 border-[#B8D9CD] bg-white p-4 text-[#065F46]">
                      <ShieldCheck size={23} className="mt-0.5 shrink-0" />
                      <p className="text-[16px] font-bold leading-7">
                        The correct answers are stored for automatic marking.
                        Students can see their score after submission, but the
                        correct answers are not sent to the student-facing quiz
                        before they submit.
                      </p>
                    </div>

                    <div className="mt-6 space-y-5">
                      <AnimatePresence mode="popLayout">
                        {form.questions.map((question, questionIndex) => (
                          <McqQuestionEditor
                            key={questionIndex}
                            question={question}
                            questionIndex={questionIndex}
                            onQuestionChange={(
                              index,
                              questionText,
                              correctOptionIndex,
                            ) => {
                              if (typeof correctOptionIndex === "number") {
                                setCorrectOption(
                                  index,
                                  questionText,
                                  correctOptionIndex,
                                );
                              } else {
                                updateQuestionText(index, questionText);
                              }
                            }}
                            onOptionChange={updateQuestionOption}
                            onAddOption={addOption}
                            onRemoveOption={removeOption}
                            onRemoveQuestion={removeQuestion}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      onClick={addQuestion}
                      disabled={form.questions.length >= 100}
                      className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] border-dashed border-[#059669] bg-white px-6 py-5 text-[19px] font-extrabold text-[#047857] transition-all hover:-translate-y-0.5 hover:bg-[#ECFDF5] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={24} strokeWidth={3} />
                      Add Another Question
                    </button>

                    {form.questions.length >= 100 && (
                      <p className="mt-3 text-center text-[15px] font-bold text-[#B45309]">
                        You have reached the maximum of 100 questions.
                      </p>
                    )}
                  </motion.div>
                )}

                {/* FILE SETTINGS FOR NON-MCQ TASKS */}
                {!isMcqForm &&
                  [
                    "video",
                    "image",
                    "document",
                    "audio",
                    "multiple_files",
                    "text_file",
                  ].includes(form.submissionType) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 grid gap-6 rounded-2xl border-[3px] border-[#CFE0F5] bg-gradient-to-br from-[#F4F8FF] to-[#F8F2FF] p-6 sm:grid-cols-2"
                    >
                      <div>
                        <label className={labelClass}>
                          Maximum Number of Files
                        </label>
                        <select
                          value={form.maxFiles}
                          onChange={(event) =>
                            updateField("maxFiles", Number(event.target.value))
                          }
                          disabled={form.submissionType !== "multiple_files"}
                          className={`${inputClass} disabled:cursor-not-allowed disabled:bg-[#EAEFF5] disabled:text-[#8A9AB0]`}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                            <option key={number} value={number}>
                              {number} {number === 1 ? "file" : "files"}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-[15px] font-semibold leading-6 text-[#4F6784]">
                          Multiple Files allows students to attach more than one
                          file. Other formats use a single file.
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Maximum Size Per File
                        </label>
                        <select
                          value={form.maxFileSizeMB}
                          onChange={(event) =>
                            updateField(
                              "maxFileSizeMB",
                              Number(event.target.value),
                            )
                          }
                          className={inputClass}
                        >
                          {[5, 10, 15, 20, 25, 50, 75, 100].map((size) => (
                            <option key={size} value={size}>
                              {size} MB
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-[15px] font-semibold leading-6 text-[#4F6784]">
                          The submission API must enforce this limit when files
                          are uploaded.
                        </p>
                      </div>
                    </motion.div>
                  )}
              </div>

              {/* SUBMISSION RULES */}
              <div className="border-t-[3px] border-[#E6EDF6] pt-8">
                <SectionHeading
                  Icon={Clock3}
                  title="Submission Rules"
                  subtitle="Decide whether late work will be accepted by default."
                  gradient="linear-gradient(135deg, #EA580C, #FBBF24)"
                />

                <motion.button
                  type="button"
                  role="switch"
                  aria-checked={form.allowLateSubmission}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    updateField(
                      "allowLateSubmission",
                      !form.allowLateSubmission,
                    )
                  }
                  className={`flex w-full items-center gap-5 rounded-2xl border-[3px] p-6 text-left transition-all duration-300 hover:shadow-xl ${
                    form.allowLateSubmission
                      ? "border-[#34D399] bg-gradient-to-r from-[#D1FAE5] to-[#ECFDF5]"
                      : "border-[#D5E0EE] bg-[#F6F9FE] hover:border-[#7FB0F5]"
                  }`}
                >
                  <span
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-md transition-colors ${
                      form.allowLateSubmission
                        ? "bg-gradient-to-br from-[#059669] to-[#34D399] text-white"
                        : "bg-white text-[#6B7F99]"
                    }`}
                  >
                    {form.allowLateSubmission ? (
                      <CheckCircle2 size={30} />
                    ) : (
                      <Clock3 size={30} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[22px] font-extrabold text-[#0B2447]">
                      Allow late submissions
                    </span>
                    <span className="mt-1 block text-[17px] font-semibold leading-7 text-[#4F6784]">
                      {form.allowLateSubmission
                        ? "Late submissions are allowed by default for this template."
                        : "Late submissions are disabled by default for this template."}
                    </span>
                  </span>

                  <span
                    className={`relative h-9 w-16 shrink-0 rounded-full transition-colors duration-300 ${
                      form.allowLateSubmission ? "bg-[#16A34A]" : "bg-[#B8C6D8]"
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-md ${
                        form.allowLateSubmission ? "right-1" : "left-1"
                      }`}
                    />
                  </span>
                </motion.button>
              </div>

              {/* FORM ACTIONS */}
              <div className="flex flex-col-reverse justify-end gap-4 border-t-[3px] border-[#E6EDF6] pt-7 sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border-[3px] border-[#D5E0EE] bg-white px-8 py-4 text-[18px] font-extrabold text-[#1E3A66] transition-colors hover:bg-[#EEF3FB] disabled:opacity-50"
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#0B2447] via-[#2563EB] to-[#7C3AED] px-9 py-4 text-[18px] font-extrabold text-white shadow-lg transition-shadow hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={23} className="animate-spin" />
                  ) : (
                    <Save size={23} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Task Template"}
                </motion.button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* TASK LIBRARY */}
      <section className="overflow-hidden rounded-[30px] border-[3px] border-[#CBDAEC] bg-white shadow-[0_16px_46px_rgba(11,36,71,0.08)]">
        <div className="border-b-[3px] border-[#E1E9F4] bg-gradient-to-r from-[#F2F7FF] via-white to-[#FBF3FF] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div className="flex items-center gap-4">
              <ChevronToggle
                open={libraryOpen}
                onClick={() => setLibraryOpen((value) => !value)}
                label="task library"
                color="#2563EB"
                size={28}
                className="!h-14 !w-14"
              />

              <div>
                <h2 className="text-[38px] font-extrabold leading-tight text-[#0B2447]">
                  Task Library
                </h2>
                <p className="mt-1 text-[18px] font-semibold text-[#4F6784]">
                  {libraryOpen
                    ? "Create and manage reusable task templates."
                    : `${activeTemplates.length} active · ${archivedTemplates.length} archived templates (collapsed)`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("active");
                  setSelectedCategory("all");
                  setLibraryOpen(true);
                }}
                className={`inline-flex items-center gap-2.5 rounded-xl border-[3px] px-6 py-3.5 text-[18px] font-extrabold transition-all ${
                  activeTab === "active"
                    ? "border-[#0B2447] bg-gradient-to-r from-[#0B2447] to-[#2563EB] text-white shadow-lg"
                    : "border-[#D5E0EE] bg-white text-[#4F6784] hover:border-[#7FB0F5] hover:bg-[#EAF2FF] hover:text-[#2563EB]"
                }`}
              >
                <BookOpen size={21} />
                Active ({activeTemplates.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("archived");
                  setSelectedCategory("all");
                  setLibraryOpen(true);
                }}
                className={`inline-flex items-center gap-2.5 rounded-xl border-[3px] px-6 py-3.5 text-[18px] font-extrabold transition-all ${
                  activeTab === "archived"
                    ? "border-[#B45309] bg-gradient-to-r from-[#EA580C] to-[#FBBF24] text-white shadow-lg"
                    : "border-[#D5E0EE] bg-white text-[#4F6784] hover:border-[#FBBF24] hover:bg-[#FFF3D6] hover:text-[#B45309]"
                }`}
              >
                <Archive size={21} />
                Archived ({archivedTemplates.length})
              </button>

              <div className="ml-1 inline-flex overflow-hidden rounded-xl border-[3px] border-[#D5E0EE] bg-white">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`flex h-[52px] w-14 items-center justify-center transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#7C3AED] text-white"
                      : "text-[#4F6784] hover:bg-[#F1EAFF] hover:text-[#7C3AED]"
                  }`}
                >
                  <LayoutGrid size={22} />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`flex h-[52px] w-14 items-center justify-center transition-colors ${
                    viewMode === "list"
                      ? "bg-[#7C3AED] text-white"
                      : "text-[#4F6784] hover:bg-[#F1EAFF] hover:text-[#7C3AED]"
                  }`}
                >
                  <ListIcon size={22} />
                </button>
              </div>
            </div>
          </div>

          <Collapse open={libraryOpen}>
            <div>
              <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="relative">
                  <Search
                    size={24}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by task title, description, or category..."
                    className={`${inputClass} pl-14`}
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              {!loading && filteredTemplates.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[17px] font-extrabold text-[#4F6784]">
                    Showing{" "}
                    <span className="rounded-md bg-[#EAF2FF] px-2 py-0.5 text-[#2563EB]">
                      {filteredTemplates.length}
                    </span>{" "}
                    {filteredTemplates.length === 1 ? "template" : "templates"}
                  </p>

                  <ExpandCollapseAll
                    onExpandAll={expandAllTemplates}
                    onCollapseAll={collapseAllTemplates}
                  />
                </div>
              )}
            </div>
          </Collapse>
        </div>

        <Collapse open={libraryOpen}>
          <div className="p-5 sm:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle
                  size={54}
                  className="animate-spin text-[#2563EB]"
                />
                <p className="mt-5 text-[20px] font-extrabold text-[#4F6784]">
                  Loading your task library...
                </p>
              </div>
            ) : error && templates.length === 0 ? (
              <div className="rounded-2xl border-[3px] border-[#FDA4AF] bg-[#FFE4E6] p-8 text-center">
                <p className="text-[20px] font-extrabold text-[#9F1239]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={fetchTemplates}
                  className="mt-5 rounded-xl bg-gradient-to-r from-[#0B2447] to-[#2563EB] px-7 py-3.5 text-[18px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl"
                >
                  Try Again
                </button>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <EmptyState archived={isArchivedTab} onCreate={openCreateForm} />
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid items-start gap-6 xl:grid-cols-2"
                    : "flex flex-col gap-5"
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map((template, index) => (
                    <TemplateCard
                      key={template._id}
                      template={template}
                      index={index}
                      view={viewMode}
                      isBusy={actionId === template._id}
                      expanded={expandedTemplateIds.has(template._id)}
                      onToggle={() => toggleTemplateExpanded(template._id)}
                      onEdit={openEditForm}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onAssign={openAssignForm}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Collapse>
      </section>

      {/* ASSIGNED TASKS */}
      <section className="overflow-hidden rounded-[30px] border-[3px] border-[#CBDAEC] bg-white shadow-[0_16px_46px_rgba(11,36,71,0.08)]">
        <div className="flex flex-col justify-between gap-4 border-b-[3px] border-[#E1E9F4] bg-gradient-to-r from-[#D1FAE5] via-[#E0F2FE] to-[#EDE9FE] p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <ChevronToggle
              open={assignedOpen}
              onClick={() => setAssignedOpen((value) => !value)}
              label="assigned tasks"
              color="#047857"
              size={28}
              className="!h-14 !w-14"
            />

            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#34D399] text-white shadow-md">
                  <ClipboardCheck size={26} />
                </span>
                <h2 className="text-[34px] font-extrabold leading-tight text-[#0B2447]">
                  Assigned Tasks
                </h2>
              </div>
              <p className="mt-2 text-[18px] font-semibold text-[#4F6784]">
                {assignedOpen
                  ? "Track task assignments, deadlines, and student submissions."
                  : `${assignments.length} ${assignments.length === 1 ? "assignment" : "assignments"} (collapsed)`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchAssignments}
              disabled={assignmentLoading}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#B8D9CD] bg-white px-5 py-3.5 text-[17px] font-extrabold text-[#047857] transition-colors hover:bg-[#ECFDF5] disabled:opacity-50"
            >
              {assignmentLoading ? (
                <LoaderCircle size={21} className="animate-spin" />
              ) : (
                <RefreshCw size={21} />
              )}
              Refresh
            </button>

            <button
              type="button"
              onClick={() => openAssignForm()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#047857] to-[#34D399] px-5 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl"
            >
              <Plus size={21} />
              Assign Task
            </button>
          </div>
        </div>

        <Collapse open={assignedOpen}>
          <div className="p-5 sm:p-8">
            {assignmentLoading && assignments.length === 0 ? (
              <div className="flex items-center justify-center gap-3 py-12 text-[18px] font-extrabold text-[#4F6784]">
                <LoaderCircle
                  size={30}
                  className="animate-spin text-[#2563EB]"
                />
                Loading assignments...
              </div>
            ) : assignments.length === 0 ? (
              <div className="rounded-2xl border-[3px] border-dashed border-[#B9CCE4] bg-[#F6F9FE] px-5 py-12 text-center">
                <ClipboardCheck size={48} className="mx-auto text-[#7890AE]" />
                <h3 className="mt-4 text-[26px] font-extrabold text-[#0B2447]">
                  No tasks assigned yet
                </h3>
                <p className="mt-2 text-[17px] font-semibold text-[#4F6784]">
                  Create a template and use Assign Task to send it to students.
                </p>
                <button
                  type="button"
                  onClick={() => openAssignForm()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#047857] to-[#34D399] px-6 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <Send size={21} />
                  Assign Existing Task
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex justify-end">
                  <ExpandCollapseAll
                    onExpandAll={expandAllAssignments}
                    onCollapseAll={collapseAllAssignments}
                  />
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-2">
                  {assignments.map((assignment, index) => {
                    const assignmentKey = getAssignmentKey(assignment, index);
                    const isExpanded = expandedAssignmentIds.has(assignmentKey);

                    const snapshot = assignment.taskSnapshot || {};
                    const title =
                      snapshot.title ||
                      assignment.title ||
                      assignment.template?.title ||
                      "Assigned task";

                    const recipientCount =
                      assignment.recipientCount ??
                      assignment.recipients?.length ??
                      0;

                    const submittedCount =
                      assignment.submittedCount ??
                      assignment.recipients?.filter((recipient) =>
                        ["submitted", "reviewed", "late"].includes(
                          recipient.status,
                        ),
                      ).length ??
                      0;

                    const reviewedCount =
                      assignment.reviewedCount ??
                      assignment.recipients?.filter(
                        (recipient) => recipient.status === "reviewed",
                      ).length ??
                      0;

                    const pendingCount =
                      assignment.pendingCount ??
                      Math.max(recipientCount - submittedCount, 0);

                    return (
                      <motion.article
                        key={assignment._id || index}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.04, 0.25) }}
                        whileHover={{ y: -4 }}
                        className="overflow-hidden rounded-2xl border-[3px] border-[#D5E0EE] bg-white transition-shadow hover:shadow-xl"
                      >
                        <div className="h-2.5 bg-gradient-to-r from-[#059669] via-[#2563EB] to-[#7C3AED]" />

                        <div className="p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <span className="inline-flex items-center gap-2 rounded-lg bg-[#E3F9EA] px-3 py-1.5 text-[14px] font-extrabold text-[#047857]">
                                <CheckCircle2 size={16} />
                                Assigned
                              </span>

                              <h3 className="mt-3 break-words text-[25px] font-extrabold leading-tight text-[#0B2447]">
                                {title}
                              </h3>

                              <p className="mt-2 text-[15px] font-bold text-[#4F6784]">
                                {getAssignmentTargetLabel(assignment)}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2563EB]">
                                {snapshot.submissionType === "mcq" ? (
                                  <ListChecks size={25} />
                                ) : (
                                  <ClipboardCheck size={25} />
                                )}
                              </span>

                              <ChevronToggle
                                open={isExpanded}
                                onClick={() =>
                                  toggleAssignmentExpanded(assignmentKey)
                                }
                                label={`details for ${title}`}
                                color="#047857"
                              />
                            </div>
                          </div>

                          {/* Always-visible summary line */}
                          <div className="mt-4 flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF2FF] px-3 py-1.5 text-[14px] font-extrabold text-[#1D4ED8]">
                              <Users size={15} />
                              {recipientCount} recipients
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDF8E8] px-3 py-1.5 text-[14px] font-extrabold text-[#15803D]">
                              <CheckCircle2 size={15} />
                              {submittedCount} submitted
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFF3D6] px-3 py-1.5 text-[14px] font-extrabold text-[#B45309]">
                              <Clock3 size={15} />
                              Due {formatDateTime(assignment.dueDate)}
                            </span>
                          </div>

                          <Collapse open={isExpanded}>
                            <div>
                              {snapshot.submissionType === "mcq" && (
                                <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-[#B8D9CD] bg-[#F0FDF8] p-3 text-[#047857]">
                                  <CircleHelp size={20} />
                                  <span className="text-[15px] font-extrabold">
                                    {snapshot.questions?.length || 0} MCQ
                                    questions · Automatic scoring
                                  </span>
                                </div>
                              )}

                              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                  {
                                    label: "Recipients",
                                    value: recipientCount,
                                    className: "bg-[#EAF2FF] text-[#1D4ED8]",
                                  },
                                  {
                                    label: "Submitted",
                                    value: submittedCount,
                                    className: "bg-[#DDF8E8] text-[#15803D]",
                                  },
                                  {
                                    label: "Pending",
                                    value: pendingCount,
                                    className: "bg-[#FFF3D6] text-[#B45309]",
                                  },
                                  {
                                    label: "Reviewed",
                                    value: reviewedCount,
                                    className: "bg-[#F1EAFF] text-[#7C3AED]",
                                  },
                                ].map((stat) => (
                                  <div
                                    key={stat.label}
                                    className={`rounded-xl p-3 ${stat.className}`}
                                  >
                                    <p className="text-[13px] font-extrabold uppercase tracking-wide">
                                      {stat.label}
                                    </p>
                                    <p className="mt-1 text-3xl font-extrabold">
                                      {stat.value}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#E6EDF6] bg-[#F8FAFD] p-4">
                                <div className="flex items-center gap-2 text-[#1E3A66]">
                                  <CalendarClock
                                    size={21}
                                    className="text-[#2563EB]"
                                  />
                                  <span className="text-[15px] font-extrabold">
                                    Deadline
                                  </span>
                                </div>
                                <span className="text-[16px] font-extrabold text-[#0B2447]">
                                  {formatDateTime(assignment.dueDate)}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                <span
                                  className={`rounded-lg px-3 py-2 text-[14px] font-extrabold ${
                                    assignment.allowLateSubmission
                                      ? "bg-[#DDF8E8] text-[#15803D]"
                                      : "bg-[#FFE4E8] text-[#BE123C]"
                                  }`}
                                >
                                  {assignment.allowLateSubmission
                                    ? "Late submissions allowed"
                                    : "Late submissions disabled"}
                                </span>

                                <span className="text-[14px] font-bold text-[#6B7F99]">
                                  Assigned {formatDate(assignment.createdAt)}
                                </span>
                              </div>
                            </div>
                          </Collapse>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Collapse>
      </section>

      <motion.div
        whileHover={{ y: -4 }}
        className="flex items-start gap-4 rounded-2xl border-[3px] border-[#BFD6F2] bg-gradient-to-r from-[#E0EEFF] via-[#F1E9FF] to-[#DDF7EC] p-6 shadow-md"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-md">
          <ShieldCheck size={26} />
        </span>

        <div>
          <p className="text-[21px] font-extrabold text-[#0B2447]">
            Templates and assignments are managed separately
          </p>
          <p className="mt-1.5 text-[18px] font-semibold leading-7 text-[#3B5272]">
            Editing a reusable template should not silently change tasks already
            assigned to students. Your assignment backend should retain a
            snapshot of the task instructions and submission rules at the time
            of assignment.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
