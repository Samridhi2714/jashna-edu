import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  Users,
  X,
  ClipboardList,
  CircleCheck,
  CircleX,
  Trophy,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/tasks";

const FONT_FAMILY = '"Times New Roman", Times, serif';

const COLORS = {
  navy: "#102B4E",
  blue: "#338DFD",
  green: "#49C4A5",
  ivory: "#F8F6EF",
};

const fieldClass =
  "w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3.5 text-[18px] font-semibold text-[#102B4E] outline-none transition-all duration-200 placeholder:font-medium placeholder:text-slate-400 hover:-translate-y-0.5 hover:border-[#8DB8F7] hover:shadow-md focus:-translate-y-0.5 focus:border-[#338DFD] focus:shadow-lg focus:ring-4 focus:ring-[#338DFD]/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:hover:translate-y-0 disabled:hover:shadow-none";

const getAdminToken = () => localStorage.getItem("adminToken");

const getSubmissionFileEndpoint = (submission, index) => {
  const assignmentId = submission?.assignmentId;
  const studentId =
    typeof submission?.student === "object" ? submission.student?._id : null;

  if (!assignmentId || !studentId) {
    throw new Error("Assignment or student information is missing.");
  }

  return `${API_BASE}/assignments/${assignmentId}/recipients/${studentId}/files/${index}/download`;
};

const fetchSubmissionFile = async (
  submission,
  file,
  index,
  mode = "view",
  previewWindow = null,
) => {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin session expired. Please log in again.");
  }

  // Cloudinary files continue using their existing URLs.
  if (file?.storageProvider !== "google_drive") {
    if (!file?.url) {
      throw new Error("This file does not have a valid file URL.");
    }

    if (mode === "view") {
      window.open(file.url, "_blank", "noopener,noreferrer");
      return;
    }

    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.originalName || "submission-file";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    link.remove();

    return;
  }

  const endpoint = getSubmissionFileEndpoint(submission, index);

  const response = await fetch(
    mode === "view" ? `${endpoint}?view=true` : endpoint,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.message ||
        (mode === "view"
          ? "Unable to preview this submission file."
          : "Unable to download this submission file."),
    );
  }

  const blob = await response.blob();

  if (!blob.size) {
    throw new Error("The submitted file is empty.");
  }

  const objectUrl = URL.createObjectURL(blob);

  if (mode === "view") {
    if (!previewWindow || previewWindow.closed) {
      URL.revokeObjectURL(objectUrl);

      throw new Error(
        "The preview window could not be opened. Please allow pop-ups and try again.",
      );
    }

    previewWindow.opener = null;
    previewWindow.location.href = objectUrl;
    return;
  }

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.originalName || "submission-file";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 60 * 1000);
};

const getStudentName = (student) => {
  if (!student || typeof student !== "object") {
    return "Unknown student";
  }

  return student.name || student.username || "Unknown student";
};

const getBatchName = (student) => {
  if (!student || typeof student !== "object") return "";

  const value = student.batch;

  if (typeof value === "string") return value.trim();

  if (value && typeof value === "object") {
    return String(
      value.name || value.batchName || value.timing || value.label || "",
    ).trim();
  }

  return "";
};

const getStatusLabel = (status) => {
  const labels = {
    assigned: "Pending",
    submitted: "Submitted",
    late_submitted: "Late submission",
    reviewed: "Reviewed",
    overdue: "Overdue",
  };

  return labels[status] || status || "Unknown";
};

const getStatusStyles = (status) => {
  const styles = {
    assigned: "bg-slate-100 text-slate-700 border-slate-200",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    late_submitted: "bg-orange-50 text-orange-700 border-orange-200",
    reviewed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
  };

  return styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isSubmitted = (status) =>
  ["submitted", "late_submitted", "reviewed"].includes(status);

const isLateSubmission = (row) => {
  if (!row.submittedAt || !row.dueDate) return false;

  return new Date(row.submittedAt).getTime() > new Date(row.dueDate).getTime();
};

const getErrorMessage = (error, fallback) => {
  return error?.message || fallback;
};

/*
=========================================================
MCQ HELPERS
=========================================================
*/

/*
Supports these backend response shapes:
1. questionText / options / correctOptionIndex
2. question / options / correctOptionIndex
3. taskSnapshot.questions
4. questions directly on the submission

Option indexes are one-based, matching the backend.
*/

const getMcqQuestions = (submission) => {
  const candidates = [
    submission?.questions,
    submission?.taskSnapshot?.questions,
    submission?.task?.questions,
    submission?.assignment?.taskSnapshot?.questions,
  ];

  const questions = candidates.find(
    (candidate) => Array.isArray(candidate) && candidate.length > 0,
  );

  return Array.isArray(questions) ? questions : [];
};

const getMcqAnswers = (submission) => {
  const candidates = [
    submission?.mcqAnswers,
    submission?.answers,
    submission?.taskSnapshot?.mcqAnswers,
  ];

  const answers = candidates.find(
    (candidate) => Array.isArray(candidate) && candidate.length > 0,
  );

  return Array.isArray(answers) ? answers : [];
};

const getQuestionText = (question) => {
  return question?.questionText || question?.question || question?.text || "";
};

const getOptionText = (question, oneBasedIndex) => {
  if (!Array.isArray(question?.options)) return "Option unavailable";

  return (
    question.options[oneBasedIndex - 1] ??
    question.options[oneBasedIndex] ??
    "Option unavailable"
  );
};

const getSelectedOptionIndex = (answer) => {
  if (Number.isInteger(answer?.selectedOptionIndex)) {
    return answer.selectedOptionIndex;
  }

  if (Number.isInteger(answer?.selectedAnswerIndex)) {
    return answer.selectedAnswerIndex;
  }

  if (Number.isInteger(answer?.optionIndex)) {
    return answer.optionIndex;
  }

  return null;
};

const getCorrectOptionIndex = (question, answer) => {
  if (Number.isInteger(question?.correctOptionIndex)) {
    return question.correctOptionIndex;
  }

  if (Number.isInteger(answer?.correctOptionIndex)) {
    return answer.correctOptionIndex;
  }

  return null;
};

const getAnswerForQuestion = (answers, questionIndex) => {
  return (
    answers.find(
      (answer) =>
        Number(answer?.questionIndex) === questionIndex ||
        Number(answer?.questionIndex) === questionIndex + 1,
    ) || null
  );
};

const getMcqScore = (submission, questions, answers) => {
  const score = submission?.mcqScore;

  if (score !== null && score !== undefined && Number.isFinite(Number(score))) {
    return Number(score);
  }

  // Fallback for responses that include isCorrect on every saved answer.
  if (answers.length > 0 && answers.every((answer) => typeof answer.isCorrect === "boolean")) {
    return answers.filter((answer) => answer.isCorrect).length;
  }

  // Last fallback: calculate the score from selected and correct option indexes.
  if (
    questions.length > 0 &&
    questions.every((question, index) => {
      const answer = getAnswerForQuestion(answers, index);

      return (
        getCorrectOptionIndex(question, answer) !== null &&
        getSelectedOptionIndex(answer) !== null
      );
    })
  ) {
    return questions.reduce((total, question, index) => {
      const answer = getAnswerForQuestion(answers, index);

      return (
        total +
        (getSelectedOptionIndex(answer) ===
        getCorrectOptionIndex(question, answer)
          ? 1
          : 0)
      );
    }, 0);
  }

  return null;
};

/*
=========================================================
STAT CARD
=========================================================
*/

function StatCard({ title, value, description, icon, accent }) {
  return (
    <motion.div
      whileHover={{ y: -7, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="relative cursor-default overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(16,43,78,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(16,43,78,0.14)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: accent }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[17px] font-bold text-slate-600">{title}</p>

          <motion.h3
            key={value}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-3 text-[46px] font-extrabold leading-none tracking-tight text-[#102B4E]"
          >
            {value}
          </motion.h3>

          <p className="mt-3 text-[15px] font-semibold text-slate-500">
            {description}
          </p>
        </div>

        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${accent}18`,
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/*
=========================================================
MCQ RESULTS
=========================================================
*/

function McqResults({ submission }) {
  const questions = getMcqQuestions(submission);
  const answers = getMcqAnswers(submission);

  const score = getMcqScore(submission, questions, answers);

  const total =
    submission?.mcqTotalQuestions !== null &&
    submission?.mcqTotalQuestions !== undefined
      ? Number(submission.mcqTotalQuestions)
      : questions.length;

  const percentage =
    score !== null && total > 0 ? Math.round((score / total) * 100) : null;

  if (questions.length === 0 && answers.length === 0 && score === null) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-amber-700" size={24} />

          <div>
            <h4 className="text-[20px] font-extrabold text-amber-900">
              MCQ details are unavailable
            </h4>

            <p className="mt-1 text-[17px] font-semibold leading-7 text-amber-800">
              The submission endpoint did not return the MCQ questions and
              answers. Check the backend response to ensure it includes the
              question details, selected answers and correct answers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3 border-l-[5px] border-[#338DFD] pl-3">
        <ClipboardList size={26} className="text-[#338DFD]" />

        <div>
          <h3 className="text-[25px] font-extrabold text-[#102B4E]">
            MCQ assessment results
          </h3>

          <p className="text-[16px] font-semibold text-slate-500">
            Question-by-question answer review
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border-2 border-[#D8E6F8] bg-gradient-to-br from-[#F0F6FF] via-white to-[#F0FBF7] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#102B4E] text-white shadow-lg">
              <Trophy size={32} />
            </div>

            <div>
              <p className="text-[15px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                Student&apos;s score
              </p>

              {score !== null ? (
                <p className="mt-1 text-[42px] font-extrabold leading-none text-[#102B4E]">
                  {score}
                  <span className="text-[25px] text-slate-500">
                    {" "}
                    / {total}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-[20px] font-extrabold text-slate-500">
                  Score unavailable
                </p>
              )}
            </div>
          </div>

          {percentage !== null && (
            <div className="self-start rounded-2xl border-2 border-emerald-200 bg-white px-6 py-4 text-center shadow-sm sm:self-auto">
              <p className="text-[14px] font-extrabold uppercase tracking-wider text-slate-500">
                Percentage
              </p>

              <p className="mt-1 text-[34px] font-extrabold text-emerald-700">
                {percentage}%
              </p>
            </div>
          )}
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-5">
          {questions.map((question, index) => {
            const answer = getAnswerForQuestion(answers, index);

            const selectedOptionIndex = getSelectedOptionIndex(answer);
            const correctOptionIndex = getCorrectOptionIndex(question, answer);

            const isCorrect =
              typeof answer?.isCorrect === "boolean"
                ? answer.isCorrect
                : selectedOptionIndex !== null &&
                  correctOptionIndex !== null &&
                  selectedOptionIndex === correctOptionIndex;

            const selectedText =
              answer?.selectedAnswerText ||
              answer?.selectedOptionText ||
              (selectedOptionIndex !== null
                ? getOptionText(question, selectedOptionIndex)
                : "");

            const correctText =
              answer?.correctAnswerText ||
              answer?.correctOptionText ||
              (correctOptionIndex !== null
                ? getOptionText(question, correctOptionIndex)
                : "");

            return (
              <motion.article
                key={`${index}-${getQuestionText(question)}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.25) }}
                className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b-2 border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#102B4E] text-[17px] font-extrabold text-white">
                      {index + 1}
                    </span>

                    <h4 className="pt-1 text-[20px] font-extrabold leading-7 text-[#102B4E]">
                      {getQuestionText(question) ||
                        `Question ${index + 1}`}
                    </h4>
                  </div>

                  {selectedOptionIndex !== null && correctOptionIndex !== null ? (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border-2 px-3 py-1.5 text-[14px] font-extrabold ${
                        isCorrect
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {isCorrect ? (
                        <CircleCheck size={18} />
                      ) : (
                        <CircleX size={18} />
                      )}

                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-[14px] font-extrabold text-amber-700">
                      <AlertCircle size={17} />
                      Answer details unavailable
                    </span>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  {Array.isArray(question.options) &&
                    question.options.map((option, optionIndex) => {
                      const oneBasedOptionIndex = optionIndex + 1;

                      const isSelected =
                        selectedOptionIndex === oneBasedOptionIndex;

                      const isCorrectOption =
                        correctOptionIndex === oneBasedOptionIndex;

                      let optionStyle =
                        "border-slate-200 bg-white text-slate-700";

                      if (isCorrectOption) {
                        optionStyle =
                          "border-emerald-300 bg-emerald-50 text-emerald-900";
                      } else if (isSelected && !isCorrect) {
                        optionStyle =
                          "border-red-300 bg-red-50 text-red-900";
                      }

                      return (
                        <div
                          key={`${index}-${optionIndex}`}
                          className={`flex items-start gap-3 rounded-xl border-2 p-4 transition-colors ${optionStyle}`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-current text-[15px] font-extrabold">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="break-words text-[17px] font-bold leading-6">
                              {option}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#102B4E] px-2.5 py-1 text-[12px] font-extrabold text-white">
                                  Student&apos;s answer
                                </span>
                              )}

                              {isCorrectOption && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-1 text-[12px] font-extrabold text-white">
                                  <CheckCircle2 size={14} />
                                  Correct answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  <div className="grid gap-3 pt-1 sm:grid-cols-2">
                    <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                      <p className="text-[13px] font-extrabold uppercase tracking-wider text-slate-500">
                        Student selected
                      </p>

                      <p className="mt-1 break-words text-[16px] font-bold text-[#102B4E]">
                        {selectedText || "No answer details returned"}
                      </p>
                    </div>

                    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-[13px] font-extrabold uppercase tracking-wider text-emerald-700">
                        Correct answer
                      </p>

                      <p className="mt-1 break-words text-[16px] font-bold text-emerald-900">
                        {correctText || "Correct answer details unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/*
=========================================================
SUBMISSION MODAL
=========================================================
*/

function SubmissionModal({ submission, onClose, onSave, saving }) {
  const [feedback, setFeedback] = useState(submission?.feedback || "");
  const [marks, setMarks] = useState(submission?.marks ?? "");
  const [saveError, setSaveError] = useState("");
  const [fileAction, setFileAction] = useState(null);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    setFeedback(submission?.feedback || "");
    setMarks(submission?.marks ?? "");
    setSaveError("");
    setFileError("");
  }, [submission]);

  if (!submission) return null;

  const canReview = isSubmitted(submission.status);

  const isMcq = submission.submissionType === "mcq";

  const handleFileAction = async (file, index, mode) => {
    const actionKey = `${index}-${mode}`;

    setFileAction(actionKey);
    setFileError("");

    let previewWindow = null;

    try {
      if (mode === "view" && file?.storageProvider === "google_drive") {
        previewWindow = window.open("about:blank", "_blank");

        if (!previewWindow) {
          throw new Error(
            "The preview was blocked by your browser. Allow pop-ups and try again.",
          );
        }
      }

      await fetchSubmissionFile(submission, file, index, mode, previewWindow);
    } catch (error) {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }

      setFileError(
        error?.message ||
          (mode === "view"
            ? "Unable to preview the file."
            : "Unable to download the file."),
      );
    } finally {
      setFileAction(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveError("");

    if (!canReview) {
      setSaveError("This student has not submitted the task yet.");
      return;
    }

    if (feedback.length > 5000) {
      setSaveError("Feedback cannot exceed 5000 characters.");
      return;
    }

    if (
      marks !== "" &&
      (!Number.isFinite(Number(marks)) || Number(marks) < 0)
    ) {
      setSaveError("Marks must be a valid non-negative number.");
      return;
    }

    try {
      await onSave({
        feedback: feedback.trim(),
        marks: marks === "" ? null : Number(marks),
      });
    } catch (error) {
      setSaveError(getErrorMessage(error, "Could not save the review."));
    }
  };

  const files = Array.isArray(submission.submissionFiles)
    ? submission.submissionFiles
    : [];

  const modalBatch = getBatchName(submission.student);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="admin-submissions-root fixed inset-0 z-[100] flex items-center justify-center bg-[#102B4E]/60 p-3 backdrop-blur-sm sm:p-6"
      style={{ fontFamily: FONT_FAMILY }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border-2 border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-slate-200 bg-gradient-to-r from-[#F8F6EF] to-[#F1F6FD] p-6 sm:p-7">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileCheck2 size={24} color={COLORS.blue} />

              <span className="text-[15px] font-extrabold uppercase tracking-[0.16em] text-[#338DFD]">
                Submission Review
              </span>
            </div>

            <h2 className="text-[32px] font-extrabold leading-tight text-[#102B4E]">
              {submission.title}
            </h2>

            <p className="mt-1 text-[18px] font-semibold text-slate-600">
              {getStudentName(submission.student)}
              {modalBatch ? ` · ${modalBatch}` : ""}
            </p>

            {isMcq && (
              <span className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-blue-200 bg-blue-50 px-3 py-1.5 text-[14px] font-extrabold text-blue-800">
                <ClipboardList size={17} />
                MCQ assessment
              </span>
            )}
          </div>

          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ rotate: 90, scale: 1.12 }}
            whileTap={{ scale: 0.85 }}
            aria-label="Close review"
            className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-600"
          >
            <X size={26} />
          </motion.button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto p-6 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border-2 border-slate-200 p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <p className="text-[14px] font-extrabold uppercase tracking-wider text-slate-500">
                Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full border-2 px-4 py-1.5 text-[15px] font-extrabold ${getStatusStyles(submission.status)}`}
              >
                {getStatusLabel(submission.status)}
              </span>
            </div>

            <div className="rounded-2xl border-2 border-slate-200 p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <p className="text-[14px] font-extrabold uppercase tracking-wider text-slate-500">
                Submitted at
              </p>

              <p className="mt-2 text-[18px] font-extrabold text-[#102B4E]">
                {formatDateTime(submission.submittedAt)}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-slate-200 p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <p className="text-[14px] font-extrabold uppercase tracking-wider text-slate-500">
                Deadline
              </p>

              <p className="mt-2 text-[18px] font-extrabold text-[#102B4E]">
                {formatDateTime(submission.dueDate)}
              </p>
            </div>
          </div>

          {isLateSubmission(submission) && (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 text-orange-800">
              <Clock3 size={26} className="mt-0.5 shrink-0" />

              <div>
                <p className="text-[19px] font-extrabold">
                  Submitted after the deadline
                </p>

                <p className="mt-1 text-[17px] font-semibold">
                  The submission timestamp is later than the task deadline.
                </p>
              </div>
            </div>
          )}

          {/* MCQ RESULTS */}
          {isMcq && <McqResults submission={submission} />}

          {/* STUDENT TEXT RESPONSE */}
          {!isMcq && (
            <section>
              <h3 className="mb-3 flex items-center gap-2.5 border-l-[5px] border-[#102B4E] pl-3 text-[24px] font-extrabold text-[#102B4E]">
                <MessageSquareText size={24} />
                Student&apos;s response
              </h3>

              {submission.submissionText ? (
                <div className="whitespace-pre-wrap break-words rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 text-[18px] font-medium leading-8 text-slate-700">
                  {submission.submissionText}
                </div>
              ) : (
                <p className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-[18px] font-semibold text-slate-500">
                  No text response was submitted.
                </p>
              )}
            </section>
          )}

          {/* UPLOADED FILES */}
          {!isMcq && (
            <section>
              <h3 className="mb-3 flex items-center gap-2.5 border-l-[5px] border-[#102B4E] pl-3 text-[24px] font-extrabold text-[#102B4E]">
                <FileText size={24} />
                Uploaded files ({files.length})
              </h3>

              {files.length > 0 ? (
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <motion.div
                      key={`${file.publicId || file.url}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.25) }}
                      whileHover={{ y: -3 }}
                      className="flex flex-col gap-4 rounded-2xl border-2 border-slate-200 p-5 transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#102B4E] text-white">
                          <FileText size={24} />
                        </div>

                        <div className="min-w-0">
                          <p className="break-all text-[18px] font-extrabold text-[#102B4E]">
                            {file.originalName || `File ${index + 1}`}
                          </p>

                          <p className="mt-1 text-[15px] font-bold text-slate-500">
                            {file.format?.toUpperCase() || "File"}

                            {file.size
                              ? ` · ${(file.size / (1024 * 1024)).toFixed(2)} MB`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2.5">
                        <motion.button
                          type="button"
                          onClick={() => handleFileAction(file, index, "view")}
                          disabled={fileAction !== null}
                          whileHover={
                            fileAction !== null
                              ? undefined
                              : { scale: 1.05, y: -2 }
                          }
                          whileTap={
                            fileAction !== null ? undefined : { scale: 0.95 }
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-4 py-2.5 text-[16px] font-extrabold text-[#102B4E] transition-colors hover:border-[#102B4E] hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                        >
                          {fileAction === `${index}-view` ? (
                            <LoaderCircle size={20} className="animate-spin" />
                          ) : (
                            <Eye size={20} />
                          )}
                          {fileAction === `${index}-view`
                            ? "Opening..."
                            : "View"}
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() =>
                            handleFileAction(file, index, "download")
                          }
                          disabled={fileAction !== null}
                          whileHover={
                            fileAction !== null
                              ? undefined
                              : { scale: 1.05, y: -2 }
                          }
                          whileTap={
                            fileAction !== null ? undefined : { scale: 0.95 }
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-4 py-2.5 text-[16px] font-extrabold text-white shadow-md transition-all hover:bg-[#1A416F] hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
                        >
                          {fileAction === `${index}-download` ? (
                            <LoaderCircle size={20} className="animate-spin" />
                          ) : (
                            <ArrowDownToLine size={20} />
                          )}
                          {fileAction === `${index}-download`
                            ? "Downloading..."
                            : "Download"}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-[18px] font-semibold text-slate-500">
                  No files attached to this submission.
                </p>
              )}

              {fileError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-[17px] font-bold text-red-700"
                >
                  <AlertCircle size={22} className="mt-0.5 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </section>
          )}

          {/* TEACHER REVIEW */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border-t-2 border-slate-200 pt-6">
              <h3 className="text-[28px] font-extrabold text-[#102B4E]">
                Teacher&apos;s review
              </h3>

              <p className="mt-1 text-[18px] font-semibold text-slate-600">
                Add feedback and marks for this student.
              </p>
            </div>

            <div>
              <label
                htmlFor="submission-feedback"
                className="mb-2 block text-[15px] font-extrabold uppercase tracking-[0.1em] text-[#102B4E]/70"
              >
                Feedback
              </label>

              <textarea
                id="submission-feedback"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="Write feedback for the student..."
                disabled={!canReview || saving}
                className={`${fieldClass} resize-y`}
              />

              <p className="mt-1.5 text-right text-[15px] font-bold text-slate-500">
                {feedback.length}/5000 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="submission-marks"
                className="mb-2 block text-[15px] font-extrabold uppercase tracking-[0.1em] text-[#102B4E]/70"
              >
                Marks{" "}
                <span className="font-semibold normal-case tracking-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <input
                id="submission-marks"
                type="number"
                min="0"
                step="any"
                value={marks}
                onChange={(event) => setMarks(event.target.value)}
                placeholder="Enter marks"
                disabled={!canReview || saving}
                className={`${fieldClass} sm:max-w-xs`}
              />

              <p className="mt-2 text-[16px] font-semibold text-slate-500">
                Enter a non-negative number. Leave empty if marks are not
                applicable.
              </p>
            </div>

            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-[18px] font-bold text-red-700"
                >
                  <AlertCircle size={24} className="mt-0.5 shrink-0" />
                  <span>{saveError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!canReview && (
              <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-[18px] font-bold text-amber-800">
                Review can be saved after the student submits the task.
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t-2 border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <motion.button
                type="button"
                onClick={onClose}
                disabled={saving}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.94 }}
                className="rounded-xl border-2 border-slate-300 px-6 py-3.5 text-[18px] font-extrabold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Close
              </motion.button>

              <motion.button
                type="submit"
                disabled={!canReview || saving}
                whileHover={
                  !canReview || saving ? undefined : { scale: 1.05, y: -3 }
                }
                whileTap={!canReview || saving ? undefined : { scale: 0.94 }}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#102B4E] px-7 py-3.5 text-[18px] font-extrabold text-white shadow-lg transition-all hover:bg-[#1A416F] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <LoaderCircle size={22} className="animate-spin" />
                ) : (
                  <Send size={22} />
                )}

                {saving ? "Saving review..." : "Save review"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

/*
=========================================================
MAIN PAGE
=========================================================
*/

export default function AdminSubmissions() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [savingReview, setSavingReview] = useState(false);
  const [notice, setNotice] = useState("");

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const token = getAdminToken();

      if (!token) {
        throw new Error(
          "Admin token not found. Please log in to the admin portal again.",
        );
      }

      const response = await fetch(`${API_BASE}/submissions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch task submissions.");
      }

      setAssignments(Array.isArray(data.assignments) ? data.assignments : []);

      // Keep an open modal synchronized with refreshed backend data.
      setSelectedSubmission((current) => {
        if (!current) return current;

        const refreshedAssignment = (data.assignments || []).find(
          (assignment) =>
            String(assignment.assignmentId) ===
            String(current.assignmentId),
        );

        const refreshedRecipient = refreshedAssignment?.recipients?.find(
          (recipient) =>
            String(recipient.student?._id) ===
            String(current.student?._id),
        );

        if (!refreshedRecipient) return current;

        return {
          ...refreshedRecipient,
          assignmentId: refreshedAssignment.assignmentId,
          title: refreshedAssignment.title || "Untitled task",
          submissionType: refreshedAssignment.submissionType || "text",
          dueDate: refreshedAssignment.dueDate,
          allowLateSubmission: refreshedAssignment.allowLateSubmission,
        };
      });
    } catch (error) {
      setPageError(getErrorMessage(error, "Unable to load submissions."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const rows = useMemo(() => {
    return assignments.flatMap((assignment) =>
      (assignment.recipients || []).map((recipient) => ({
        ...recipient,
        assignmentId: assignment.assignmentId,
        title: assignment.title || "Untitled task",
        submissionType: assignment.submissionType || "text",
        dueDate: assignment.dueDate,
        allowLateSubmission: assignment.allowLateSubmission,
        questions:
          recipient.questions ||
          recipient.taskSnapshot?.questions ||
          assignment.questions ||
          assignment.taskSnapshot?.questions ||
          [],
      })),
    );
  }, [assignments]);

  const batchOptions = useMemo(() => {
    return [
      ...new Set(rows.map((row) => getBatchName(row.student)).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const stats = useMemo(() => {
    const received = rows.filter((row) => isSubmitted(row.status));
    const reviewed = rows.filter((row) => row.status === "reviewed");
    const pendingReview = received.filter((row) => row.status !== "reviewed");

    return {
      assignments: assignments.length,
      received: received.length,
      pendingReview: pendingReview.length,
      reviewed: reviewed.length,
    };
  }, [assignments, rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const studentName = getStudentName(row.student).toLowerCase();

      const username =
        typeof row.student === "object"
          ? (row.student?.username || "").toLowerCase()
          : "";

      const rawBatch = getBatchName(row.student);
      const batchLower = rawBatch.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        studentName.includes(normalizedSearch) ||
        username.includes(normalizedSearch) ||
        batchLower.includes(normalizedSearch) ||
        row.title.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending_review" &&
          isSubmitted(row.status) &&
          row.status !== "reviewed") ||
        (statusFilter === "received" && isSubmitted(row.status)) ||
        (statusFilter === "reviewed" && row.status === "reviewed") ||
        (statusFilter === "assigned" && row.status === "assigned") ||
        (statusFilter === "overdue" && row.status === "overdue");

      const matchesBatch = batchFilter === "all" || rawBatch === batchFilter;

      return matchesSearch && matchesStatus && matchesBatch;
    });
  }, [rows, search, statusFilter, batchFilter]);

  const handleSaveReview = async ({ feedback, marks }) => {
    if (!selectedSubmission) return;

    const token = getAdminToken();

    if (!token) {
      throw new Error("Admin session expired. Please log in again.");
    }

    setSavingReview(true);
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/assignments/${selectedSubmission.assignmentId}/recipients/${selectedSubmission.student?._id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feedback, marks }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save the review.");
      }

      const reviewedAt =
        data.submission?.reviewedAt || new Date().toISOString();

      setAssignments((currentAssignments) =>
        currentAssignments.map((assignment) => {
          if (
            String(assignment.assignmentId) !==
            String(selectedSubmission.assignmentId)
          ) {
            return assignment;
          }

          return {
            ...assignment,
            recipients: (assignment.recipients || []).map((recipient) => {
              if (
                String(recipient.student?._id) !==
                String(selectedSubmission.student?._id)
              ) {
                return recipient;
              }

              return {
                ...recipient,
                status: "reviewed",
                feedback,
                marks,
                reviewedAt,
              };
            }),
          };
        }),
      );

      setSelectedSubmission((current) =>
        current
          ? {
              ...current,
              status: "reviewed",
              feedback,
              marks,
              reviewedAt,
            }
          : current,
      );

      setNotice("Review saved successfully.");
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div
      className="admin-submissions-root min-h-screen bg-gradient-to-b from-[#F8F6EF] via-[#F5F7FA] to-[#F3F6FB] px-4 py-6 sm:px-6 lg:px-8"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <style>{`
        .admin-submissions-root, .admin-submissions-root * {
          font-family: ${FONT_FAMILY} !important;
        }

        @keyframes as-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(260%); }
        }

        .as-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-120%);
        }

        .as-shimmer:hover::after {
          animation: as-shimmer 0.9s ease;
        }
      `}</style>

      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative isolate mb-8 overflow-hidden rounded-[28px] border-2 border-[#27456D] bg-gradient-to-br from-[#102B4E] via-[#15375F] to-[#1D4A7A] px-7 py-9 text-white shadow-[0_22px_56px_rgba(16,43,78,0.26)] sm:px-10 sm:py-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
            className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[44px] border-white/[0.06]"
          />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border-2 border-white/20 bg-white/10 px-5 py-2 text-[15px] font-extrabold uppercase tracking-[0.16em] text-[#BBD9FF]">
                <FileCheck2 size={20} />
                Assessment Centre
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                Submissions &amp; Review
              </h1>

              <p className="mt-4 max-w-2xl text-[20px] font-semibold leading-8 text-white/80">
                Review student work, check MCQ answers, provide feedback and
                record marks from one place.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={fetchSubmissions}
              disabled={loading}
              whileHover={loading ? undefined : { scale: 1.06, y: -3 }}
              whileTap={loading ? undefined : { scale: 0.94 }}
              className="inline-flex items-center justify-center gap-2.5 self-start rounded-xl border-2 border-white/35 bg-white/10 px-6 py-4 text-[18px] font-extrabold text-white transition-colors hover:bg-white hover:text-[#102B4E] disabled:opacity-60 lg:self-center"
            >
              <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
              Refresh submissions
            </motion.button>
          </div>
        </motion.div>

        {/* NOTICES */}
        <AnimatePresence>
          {notice && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="mb-6 flex items-center justify-between gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-[19px] font-extrabold text-emerald-800 shadow-md"
            >
              <span className="flex items-center gap-3">
                <CheckCircle2 size={26} />
                {notice}
              </span>

              <motion.button
                type="button"
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                <X size={22} />
              </motion.button>
            </motion.div>
          )}

          {pageError && (
            <motion.div
              key="page-error"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="mb-6 flex flex-col gap-4 rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-[19px] font-bold text-red-800 shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-start gap-3">
                <AlertCircle size={26} className="mt-0.5 shrink-0" />
                {pageError}
              </span>

              <motion.button
                type="button"
                onClick={fetchSubmissions}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.93 }}
                className="self-start rounded-xl border-2 border-red-300 px-5 py-2.5 text-[17px] font-extrabold transition-colors hover:bg-red-100"
              >
                Try again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Assignments"
            value={stats.assignments}
            description="Assignments containing recipients"
            icon={<FileText size={28} />}
            accent={COLORS.navy}
          />

          <StatCard
            title="Submissions Received"
            value={stats.received}
            description="Submitted or reviewed work"
            icon={<Users size={28} />}
            accent={COLORS.blue}
          />

          <StatCard
            title="Pending Review"
            value={stats.pendingReview}
            description="Submitted work awaiting review"
            icon={<Clock3 size={28} />}
            accent="#E99B36"
          />

          <StatCard
            title="Reviewed"
            value={stats.reviewed}
            description="Reviews saved successfully"
            icon={<CheckCircle2 size={28} />}
            accent={COLORS.green}
          />
        </div>

        {/* SUBMISSIONS TABLE */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-[26px] border-2 border-slate-200 bg-white shadow-[0_14px_44px_rgba(16,43,78,0.07)]"
        >
          <div className="border-b-2 border-slate-200 bg-gradient-to-r from-[#F3F8FF] via-white to-[#F8F6EF] p-6 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-[32px] font-extrabold text-[#102B4E]">
                  Student submissions
                </h2>

                <p className="mt-1 text-[18px] font-bold text-slate-600">
                  <span className="rounded-md bg-[#E3EFFF] px-2.5 py-0.5 font-extrabold text-[#1D6FD8]">
                    {filteredRows.length}
                  </span>{" "}
                  of{" "}
                  <span className="rounded-md bg-slate-100 px-2.5 py-0.5 font-extrabold text-[#102B4E]">
                    {rows.length}
                  </span>{" "}
                  student records
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <div className="relative min-w-0 sm:min-w-[330px]">
                  <Search
                    size={22}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search student or task..."
                    className={fieldClass}
                    style={{ paddingLeft: "3.25rem" }}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by submission status"
                  className={`${fieldClass} sm:w-[230px]`}
                >
                  <option value="all">All statuses</option>
                  <option value="pending_review">Pending review</option>
                  <option value="received">All submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="assigned">Not submitted</option>
                  <option value="overdue">Overdue</option>
                </select>

                <select
                  value={batchFilter}
                  onChange={(event) => setBatchFilter(event.target.value)}
                  aria-label="Filter by batch"
                  className={`${fieldClass} sm:w-[230px]`}
                >
                  <option value="all">All batches</option>
                  {batchOptions.map((batchName) => (
                    <option key={batchName} value={batchName}>
                      {batchName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center gap-4 p-8">
              <LoaderCircle size={52} className="animate-spin text-[#102B4E]" />

              <p className="text-[22px] font-extrabold text-slate-600">
                Loading student submissions...
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex min-h-[340px] flex-col items-center justify-center px-6 py-14 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  ease: "easeInOut",
                }}
                className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#102B4E] text-white shadow-xl"
              >
                <FileCheck2 size={42} />
              </motion.div>

              <h3 className="text-[32px] font-extrabold text-[#102B4E]">
                {rows.length === 0
                  ? "No task assignments found"
                  : "No matching submissions"}
              </h3>

              <p className="mt-3 max-w-lg text-[20px] font-semibold leading-8 text-slate-600">
                {rows.length === 0
                  ? "Once tasks have been assigned to students, their submission statuses will appear here."
                  : "Try changing your search, status or batch filter."}
              </p>

              {rows.length === 0 && (
                <motion.button
                  type="button"
                  onClick={fetchSubmissions}
                  whileHover={{ scale: 1.06, y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-[#102B4E] px-7 py-3.5 text-[18px] font-extrabold text-white shadow-lg transition-all hover:bg-[#1A416F] hover:shadow-2xl"
                >
                  <RefreshCw size={22} />
                  Refresh
                </motion.button>
              )}

              {rows.length > 0 &&
                (search || statusFilter !== "all" || batchFilter !== "all") && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setBatchFilter("all");
                    }}
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.94 }}
                    className="mt-6 inline-flex items-center gap-2.5 rounded-xl border-2 border-slate-300 bg-white px-7 py-3.5 text-[18px] font-extrabold text-[#1D6FD8] transition-colors hover:bg-[#EEF5FF]"
                  >
                    Clear all filters
                  </motion.button>
                )}
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] border-collapse text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-[#102B4E] to-[#17406E] text-[15px] uppercase tracking-[0.14em] text-white/90">
                    <th className="px-5 py-5 font-extrabold">#</th>
                    <th className="px-5 py-5 font-extrabold">Student</th>
                    <th className="px-5 py-5 font-extrabold">Task</th>
                    <th className="px-5 py-5 font-extrabold">Submitted</th>
                    <th className="px-5 py-5 font-extrabold">Deadline</th>
                    <th className="px-5 py-5 font-extrabold">Status</th>
                    <th className="px-5 py-5 font-extrabold">Review / Score</th>
                    <th className="px-5 py-5 text-right font-extrabold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row, index) => {
                    const studentId =
                      typeof row.student === "object" ? row.student?._id : null;

                    const late = isLateSubmission(row);
                    const rowBatch = getBatchName(row.student);

                    const rowQuestions = getMcqQuestions(row);
                    const rowAnswers = getMcqAnswers(row);
                    const rowScore = getMcqScore(
                      row,
                      rowQuestions,
                      rowAnswers,
                    );

                    const rowTotal =
                      row.mcqTotalQuestions !== null &&
                      row.mcqTotalQuestions !== undefined
                        ? Number(row.mcqTotalQuestions)
                        : rowQuestions.length;

                    const isMcq = row.submissionType === "mcq";

                    return (
                      <motion.tr
                        key={`${row.assignmentId}-${studentId || index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(index * 0.03, 0.3),
                          duration: 0.3,
                        }}
                        className={`group border-b-2 border-slate-100 transition-colors duration-200 hover:bg-[#EEF5FF] ${
                          index % 2 === 1 ? "bg-[#FAFBFD]" : "bg-white"
                        }`}
                      >
                        <td className="px-5 py-6">
                          <span className="flex h-9 min-w-[36px] items-center justify-center rounded-full bg-[#102B4E]/8 px-2 text-[16px] font-extrabold text-[#102B4E]/70 transition-colors group-hover:bg-[#102B4E] group-hover:text-white">
                            {index + 1}
                          </span>
                        </td>

                        <td className="px-5 py-6">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#102B4E] to-[#2B5C8F] text-[21px] font-extrabold text-white shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                              {getStudentName(row.student)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="text-[20px] font-extrabold text-[#102B4E] transition-colors group-hover:text-[#1D6FD8]">
                                {getStudentName(row.student)}
                              </div>

                              <div className="mt-0.5 text-[15px] font-bold text-slate-500">
                                {row.student?.username || "Student"}
                              </div>

                              {rowBatch && (
                                <div className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[14px] font-extrabold text-slate-600">
                                  {rowBatch}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[280px] px-5 py-6">
                          <p className="text-[19px] font-extrabold text-[#102B4E]">
                            {row.title}
                          </p>

                          <p className="mt-1 text-[15px] font-bold capitalize text-slate-500">
                            {(row.submissionType || "text").replace(/_/g, " ")}
                          </p>

                          {isMcq && (
                            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[13px] font-extrabold text-blue-700">
                              <ClipboardList size={15} />
                              MCQ assessment
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-6 text-[17px] font-bold text-slate-700">
                          {formatDate(row.submittedAt)}
                        </td>

                        <td className="px-5 py-6 text-[17px] font-bold text-slate-700">
                          {formatDate(row.dueDate)}
                        </td>

                        <td className="px-5 py-6">
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`inline-flex rounded-full border-2 px-4 py-1.5 text-[15px] font-extrabold ${getStatusStyles(row.status)}`}
                            >
                              {getStatusLabel(row.status)}
                            </span>

                            {late && (
                              <span className="text-[14px] font-extrabold text-orange-600">
                                Submitted late
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-6">
                          {isMcq && isSubmitted(row.status) ? (
                            rowScore !== null ? (
                              <div>
                                <p className="flex items-center gap-1.5 text-[20px] font-extrabold text-[#102B4E]">
                                  <Trophy size={19} className="text-emerald-600" />
                                  {rowScore}
                                  {rowTotal > 0 ? ` / ${rowTotal}` : ""}
                                </p>

                                <p className="mt-1 text-[14px] font-bold text-slate-500">
                                  MCQ score
                                </p>

                                {row.status === "reviewed" && (
                                  <p className="mt-1 text-[14px] font-extrabold text-emerald-700">
                                    Teacher reviewed
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[16px] font-bold text-slate-500">
                                View MCQ results
                              </span>
                            )
                          ) : row.status === "reviewed" ? (
                            <div>
                              <p className="text-[18px] font-extrabold text-emerald-700">
                                {row.marks !== null && row.marks !== undefined
                                  ? `Marks: ${row.marks}`
                                  : "Reviewed"}
                              </p>

                              <p className="mt-1 text-[15px] font-bold text-slate-500">
                                {formatDate(row.reviewedAt)}
                              </p>
                            </div>
                          ) : isSubmitted(row.status) ? (
                            <span className="text-[18px] font-extrabold text-orange-600">
                              Awaiting review
                            </span>
                          ) : (
                            <span className="text-[18px] font-semibold text-slate-400">
                              Not available
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-6 text-right">
                          <motion.button
                            type="button"
                            onClick={() => setSelectedSubmission(row)}
                            whileHover={{ scale: 1.08, y: -3 }}
                            whileTap={{ scale: 0.92 }}
                            className="as-shimmer relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-[#102B4E] bg-[#102B4E] px-5 py-3 text-[17px] font-extrabold text-white shadow-md transition-all hover:bg-[#1A416F] hover:shadow-xl"
                          >
                            <Eye size={20} />
                            {isSubmitted(row.status)
                              ? isMcq
                                ? "View results"
                                : "Review"
                              : "View"}
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="flex flex-col gap-2 border-t-2 border-slate-200 bg-slate-50 px-6 py-5 text-[16px] font-bold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>Showing {filteredRows.length} student record(s)</span>

              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#49C4A5]" />
                Changes save to the database
              </span>
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {selectedSubmission && (
          <SubmissionModal
            key={`${selectedSubmission.assignmentId}-${selectedSubmission.student?._id}`}
            submission={selectedSubmission}
            saving={savingReview}
            onClose={() => {
              if (!savingReview) setSelectedSubmission(null);
            }}
            onSave={handleSaveReview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}