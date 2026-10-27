import { API_BASE } from "../config";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Info,
  LoaderCircle,
  Save,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const API_URL = `${API_BASE}/challenges`;

const EMPTY_FORM = {
  id: "",
  title: "",
  label: "",
  description: "",
  type: "text",
  task: "",
  placeholder: "",
  options: ["", "", "", ""],
  correct: 0,

  difficulty: "Intermediate+",

  evaluationCategory: "",
  evaluationMode: "ai",
  expectedResponse: "",
  evaluationCriteria: "",

  feedbackCorrect: "",
  feedbackIncorrect: "",

  active: true,
};

const CATEGORY_OPTIONS = [
  "vocabulary",
  "grammar",
  "speaking",
  "interview",
  "professional",
  "pronunciation",
  "idioms",
  "writing",
];

function ChallengeForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    options: [...EMPTY_FORM.options],
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");

  /* =========================================================
     AUTH
  ========================================================= */

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    navigate("/admin/login");
  };

  /* =========================================================
     LOAD EXISTING CHALLENGE
  ========================================================= */

  useEffect(() => {
    if (!isEditMode) return;

    const fetchChallenge = async () => {
      try {
        setFetching(true);
        setError("");

        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load challenge.");
        }

        const challenge = data.challenge;

        const existingOptions =
          Array.isArray(challenge.options) && challenge.options.length >= 2
            ? challenge.options
            : ["", "", "", ""];

        const safeCorrect =
          challenge.type === "mcq" &&
          Number.isInteger(Number(challenge.correct)) &&
          Number(challenge.correct) >= 0 &&
          Number(challenge.correct) < existingOptions.length
            ? Number(challenge.correct)
            : 0;

        let criteriaText = "";

        if (
          challenge.evaluationCriteria &&
          typeof challenge.evaluationCriteria === "object"
        ) {
          criteriaText = JSON.stringify(challenge.evaluationCriteria, null, 2);
        }

        setFormData({
          id: challenge.id || "",
          title: challenge.title || "",
          label: challenge.label || "",
          description: challenge.description || "",
          type: challenge.type || "text",
          task: challenge.task || "",
          placeholder: challenge.placeholder || "",
          options: existingOptions,
          correct: safeCorrect,
          difficulty: challenge.difficulty || "Intermediate+",

          evaluationCategory: challenge.evaluationCategory || "",

          evaluationMode:
            challenge.type === "mcq"
              ? "rule_based"
              : challenge.evaluationMode || "ai",

          expectedResponse: challenge.expectedResponse || "",

          evaluationCriteria: criteriaText,

          feedbackCorrect: challenge.feedback?.correct || "",

          feedbackIncorrect: challenge.feedback?.incorrect || "",

          active: challenge.active !== false,
        });
      } catch (error) {
        setError(error.message || "Failed to load challenge.");
      } finally {
        setFetching(false);
      }
    };

    fetchChallenge();
  }, [id, isEditMode, navigate]);

  /* =========================================================
     INPUT HANDLING
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     OPTION HANDLING
  ========================================================= */

  const handleOptionChange = (index, value) => {
    setFormData((previous) => {
      const updatedOptions = [...previous.options];

      updatedOptions[index] = value;

      return {
        ...previous,
        options: updatedOptions,
      };
    });
  };

  const addOption = () => {
    setFormData((previous) => ({
      ...previous,
      options: [...previous.options, ""],
    }));
  };

  const removeOption = (index) => {
    setFormData((previous) => {
      if (previous.options.length <= 2) {
        return previous;
      }

      const updatedOptions = previous.options.filter(
        (_, optionIndex) => optionIndex !== index,
      );

      let updatedCorrect = Number(previous.correct);

      if (index < updatedCorrect) {
        updatedCorrect -= 1;
      }

      if (index === Number(previous.correct)) {
        updatedCorrect = 0;
      }

      if (updatedCorrect >= updatedOptions.length) {
        updatedCorrect = updatedOptions.length - 1;
      }

      return {
        ...previous,
        options: updatedOptions,
        correct: updatedCorrect,
      };
    });
  };

  /* =========================================================
     TYPE CHANGE
  ========================================================= */

  const handleTypeChange = (event) => {
    const newType = event.target.value;

    setFormData((previous) => ({
      ...previous,
      type: newType,

      options:
        newType === "mcq"
          ? previous.options.length >= 2
            ? previous.options
            : ["", "", "", ""]
          : previous.options,

      correct: newType === "mcq" ? Number(previous.correct) || 0 : null,

      evaluationMode: newType === "mcq" ? "rule_based" : "ai",
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const normalizedId = formData.id.trim().toLowerCase();

    const normalizedTitle = formData.title.trim();
    const normalizedLabel = formData.label.trim();
    const normalizedDescription = formData.description.trim();
    const normalizedTask = formData.task.trim();

    /* -------------------------------------------------------
       ID
    ------------------------------------------------------- */

    if (!normalizedId) {
      return "Challenge ID is required.";
    }

    if (!/^[a-z0-9-]+$/.test(normalizedId)) {
      return (
        "Challenge ID can only contain lowercase letters, " +
        "numbers and hyphens."
      );
    }

    /* -------------------------------------------------------
       BASIC INFORMATION
    ------------------------------------------------------- */

    if (!normalizedTitle) {
      return "Challenge title is required.";
    }

    if (!normalizedLabel) {
      return "Challenge label is required.";
    }

    if (!normalizedDescription) {
      return "Challenge description is required.";
    }

    if (!normalizedTask) {
      return "Challenge task is required.";
    }

    /* -------------------------------------------------------
       EVALUATION CATEGORY
    ------------------------------------------------------- */

    if (!formData.evaluationCategory.trim()) {
      return "Evaluation category is required.";
    }

    if (
      !CATEGORY_OPTIONS.includes(
        formData.evaluationCategory.trim().toLowerCase(),
      )
    ) {
      return "Please select a valid evaluation category.";
    }

    /* -------------------------------------------------------
       TEXT EVALUATION
    ------------------------------------------------------- */

    if (formData.type === "text") {
      if (!formData.expectedResponse.trim()) {
        return "Expected response guidance is required for text challenges.";
      }

      if (formData.evaluationCriteria.trim()) {
        try {
          const parsedCriteria = JSON.parse(formData.evaluationCriteria);

          if (
            !parsedCriteria ||
            typeof parsedCriteria !== "object" ||
            Array.isArray(parsedCriteria)
          ) {
            return "Evaluation criteria must be a valid JSON object.";
          }
        } catch {
          return "Evaluation criteria contains invalid JSON.";
        }
      }
    }

    /* -------------------------------------------------------
       MCQ
    ------------------------------------------------------- */

    if (formData.type === "mcq") {
      const hasBlankOption = formData.options.some((option) => !option.trim());

      if (hasBlankOption) {
        return "Please fill in every MCQ option.";
      }

      if (formData.options.length < 2) {
        return "An MCQ challenge must contain at least two options.";
      }

      const normalizedOptions = formData.options.map((option) => option.trim());

      const uniqueOptions = new Set(
        normalizedOptions.map((option) => option.toLowerCase()),
      );

      if (uniqueOptions.size !== normalizedOptions.length) {
        return "MCQ options must be different from each other.";
      }

      const correctIndex = Number(formData.correct);

      if (
        !Number.isInteger(correctIndex) ||
        correctIndex < 0 ||
        correctIndex >= normalizedOptions.length
      ) {
        return "Please select a valid correct answer.";
      }
    }

    return "";
  };

  /* =========================================================
     BUILD PAYLOAD
  ========================================================= */

  const buildPayload = () => {
    let evaluationCriteria = {};

    if (formData.evaluationCriteria.trim()) {
      evaluationCriteria = JSON.parse(formData.evaluationCriteria);
    }

    const payload = {
      id: formData.id.trim().toLowerCase(),

      title: formData.title.trim(),

      label: formData.label.trim().toUpperCase(),

      description: formData.description.trim(),

      type: formData.type,

      task: formData.task.trim(),

      placeholder: formData.placeholder.trim(),

      options:
        formData.type === "mcq"
          ? formData.options.map((option) => option.trim())
          : [],

      correct: formData.type === "mcq" ? Number(formData.correct) : null,

      difficulty: formData.difficulty,

      evaluationCategory: formData.evaluationCategory.trim().toLowerCase(),

      evaluationMode: formData.type === "mcq" ? "rule_based" : "ai",

      expectedResponse:
        formData.type === "text" ? formData.expectedResponse.trim() : "",

      evaluationCriteria: formData.type === "text" ? evaluationCriteria : {},

      feedback: {
        correct: formData.feedbackCorrect.trim(),
        incorrect: formData.feedbackIncorrect.trim(),
      },

      active: Boolean(formData.active),
    };

    return payload;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      const response = await fetch(isEditMode ? `${API_URL}/${id}` : API_URL, {
        method: isEditMode ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditMode
              ? "Failed to update challenge."
              : "Failed to create challenge."),
        );
      }

      navigate("/admin/challenges");
    } catch (error) {
      setError(
        error.message ||
          (isEditMode
            ? "Failed to update challenge."
            : "Failed to create challenge."),
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea]">
        <div className="text-center">
          <LoaderCircle
            size={32}
            className="mx-auto animate-spin text-jashna-maroon"
          />

          <p className="mt-4 text-sm text-jashna-muted">Loading challenge...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-jashna-charcoal">
      {/* HEADER */}

      <header className="border-b border-jashna-stone bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/admin/challenges")}
            className="flex items-center gap-2 text-sm font-semibold text-jashna-muted transition hover:text-jashna-maroon"
          >
            <ArrowLeft size={18} />
            Back to Challenges
          </button>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-jashna-gold">
              Jashna Edu
            </p>

            <p className="mt-1 text-sm font-semibold">Admin Portal</p>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-jashna-gold">
            Engagement Management
          </p>

          <h1 className="mt-2 font-display text-4xl text-jashna-maroon-dark sm:text-5xl">
            {isEditMode ? "Edit Challenge" : "Create Challenge"}
          </h1>

          <p className="mt-3 max-w-2xl text-jashna-muted">
            {isEditMode
              ? "Update the content and evaluation guidance of this challenge without changing its system identity."
              : "Create an interactive challenge that can be evaluated through the shared Jashna evaluation system."}
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <Info size={18} className="mt-0.5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section className="rounded-2xl border border-jashna-stone bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jashna-maroon/10 text-jashna-maroon">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-jashna-maroon-dark">
                    Challenge Information
                  </h2>

                  <p className="mt-1 text-sm text-jashna-muted">
                    Define the identity and purpose of the challenge.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* ID */}

                <div>
                  <label
                    htmlFor="id"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Challenge ID <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="id"
                    name="id"
                    type="text"
                    value={formData.id}
                    onChange={handleChange}
                    disabled={isEditMode}
                    placeholder="e.g. vocabulary"
                    className={`w-full rounded-xl border border-jashna-stone px-4 py-3.5 text-sm outline-none transition ${
                      isEditMode
                        ? "cursor-not-allowed bg-jashna-stone/30 text-jashna-muted"
                        : "bg-jashna-ivory/40 focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                    }`}
                  />

                  <p className="mt-2 text-xs text-jashna-muted">
                    {isEditMode
                      ? "This ID is locked because it is the challenge's permanent system identity."
                      : "Use a stable lowercase ID such as vocabulary or sentence-upgrade."}
                  </p>
                </div>

                {/* TITLE */}

                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Challenge Title <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Word Builder"
                    className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                  />
                </div>

                {/* LABEL */}

                <div>
                  <label
                    htmlFor="label"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Label <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="label"
                    name="label"
                    type="text"
                    value={formData.label}
                    onChange={handleChange}
                    placeholder="e.g. Vocabulary"
                    className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm uppercase outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Explain what learners will practice through this challenge..."
                    className="w-full resize-y rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                  />
                </div>

                {/* DIFFICULTY */}

                <div>
                  <label
                    htmlFor="difficulty"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Difficulty
                  </label>

                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                  >
                    <option value="Beginner">Beginner</option>

                    <option value="Intermediate">Intermediate</option>

                    <option value="Intermediate+">Intermediate+</option>

                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* CATEGORY */}

                <div>
                  <label
                    htmlFor="evaluationCategory"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Evaluation Category <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="evaluationCategory"
                    name="evaluationCategory"
                    value={formData.evaluationCategory}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                  >
                    <option value="">Select category</option>

                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-jashna-muted">
                    This category tells the shared evaluation system what
                    learning area the challenge belongs to.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                CHALLENGE TYPE
            ================================================= */}

            <section className="rounded-2xl border border-jashna-stone bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jashna-gold/10 text-jashna-gold">
                  <Zap size={19} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-jashna-maroon-dark">
                    Challenge Format
                  </h2>

                  <p className="mt-1 text-sm text-jashna-muted">
                    Choose how the visitor will interact with this challenge.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    formData.type === "text"
                      ? "border-jashna-maroon bg-jashna-maroon/5"
                      : "border-jashna-stone hover:border-jashna-maroon/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="type"
                      value="text"
                      checked={formData.type === "text"}
                      onChange={handleTypeChange}
                      className="mt-1"
                    />

                    <div>
                      <p className="font-semibold">Text Response</p>

                      <p className="mt-1 text-xs leading-5 text-jashna-muted">
                        Visitors type their own response. These responses are
                        designed for the shared AI evaluation layer.
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    formData.type === "mcq"
                      ? "border-jashna-maroon bg-jashna-maroon/5"
                      : "border-jashna-stone hover:border-jashna-maroon/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="type"
                      value="mcq"
                      checked={formData.type === "mcq"}
                      onChange={handleTypeChange}
                      className="mt-1"
                    />

                    <div>
                      <p className="font-semibold">Multiple Choice</p>

                      <p className="mt-1 text-xs leading-5 text-jashna-muted">
                        Visitors choose one predefined correct answer and the
                        rule-based evaluator checks it.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* =================================================
                TASK
            ================================================= */}

            <section className="rounded-2xl border border-jashna-stone bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <FileText size={19} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-jashna-maroon-dark">
                    Challenge Task
                  </h2>

                  <p className="mt-1 text-sm text-jashna-muted">
                    Write the instruction visitors will see.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="task"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Task <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="task"
                    name="task"
                    rows="4"
                    value={formData.task}
                    onChange={handleChange}
                    placeholder="e.g. Choose one advanced English word you recently learned and use it in a sentence..."
                    className="w-full resize-y rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                  />
                </div>

                {formData.type === "text" && (
                  <div>
                    <label
                      htmlFor="placeholder"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Response Placeholder
                    </label>

                    <input
                      id="placeholder"
                      name="placeholder"
                      type="text"
                      value={formData.placeholder}
                      onChange={handleChange}
                      placeholder="e.g. Write your sentence here..."
                      className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                MCQ OPTIONS
            ================================================= */}

            {formData.type === "mcq" && (
              <section className="rounded-2xl border border-jashna-stone bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7">
                  <h2 className="font-display text-2xl text-jashna-maroon-dark">
                    Answer Options
                  </h2>

                  <p className="mt-1 text-sm text-jashna-muted">
                    Add the choices and mark exactly one correct answer.
                  </p>
                </div>

                <div className="mb-6 flex items-start gap-3 rounded-xl border border-jashna-gold/30 bg-jashna-gold/5 p-4">
                  <Info
                    size={17}
                    className="mt-0.5 shrink-0 text-jashna-gold"
                  />

                  <p className="text-xs leading-5 text-jashna-muted">
                    Every option must contain text and all options must be
                    different. This keeps answer indexes stable for evaluation.
                  </p>
                </div>

                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jashna-ivory font-semibold text-jashna-muted">
                        {String.fromCharCode(65 + index)}
                      </div>

                      <input
                        type="text"
                        value={option}
                        onChange={(event) =>
                          handleOptionChange(index, event.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                      />

                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                          aria-label={`Remove option ${index + 1}`}
                        >
                          <X size={17} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addOption}
                  className="mt-5 rounded-xl border border-jashna-stone px-4 py-2.5 text-sm font-semibold transition hover:border-jashna-maroon hover:text-jashna-maroon"
                >
                  + Add Option
                </button>

                <div className="mt-7 rounded-2xl bg-green-50 p-5">
                  <label
                    htmlFor="correct"
                    className="mb-2 block text-sm font-semibold text-green-900"
                  >
                    Correct Answer
                  </label>

                  <select
                    id="correct"
                    name="correct"
                    value={formData.correct}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                  >
                    {formData.options.map((option, index) => (
                      <option key={index} value={index}>
                        {String.fromCharCode(65 + index)} —{" "}
                        {option.trim() || `Option ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </section>
            )}

            {/* =================================================
                EVALUATION CONFIGURATION
            ================================================= */}

            <section className="rounded-2xl border border-jashna-maroon/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jashna-maroon/10 text-jashna-maroon">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-jashna-maroon-dark">
                    Evaluation Configuration
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-jashna-muted">
                    These fields guide the shared evaluation engine. They are
                    configuration data for the evaluator, not content shown
                    directly to learners.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* EVALUATION MODE */}

                <div>
                  <label
                    htmlFor="evaluationMode"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Evaluation Mode
                  </label>

                  <select
                    id="evaluationMode"
                    name="evaluationMode"
                    value={formData.type === "mcq" ? "rule_based" : "ai"}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-jashna-stone bg-jashna-stone/20 px-4 py-3.5 text-sm text-jashna-muted outline-none"
                  >
                    <option value="rule_based">Rule Based</option>

                    <option value="ai">AI Evaluation</option>
                  </select>

                  <p className="mt-2 text-xs text-jashna-muted">
                    MCQs use deterministic rule-based evaluation. Text responses
                    are prepared for AI evaluation.
                  </p>
                </div>

                {/* EXPECTED RESPONSE */}

                {formData.type === "text" && (
                  <div>
                    <label
                      htmlFor="expectedResponse"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Expected Response / Evaluation Guidance{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      id="expectedResponse"
                      name="expectedResponse"
                      rows="4"
                      value={formData.expectedResponse}
                      onChange={handleChange}
                      placeholder="Describe what a strong learner response should demonstrate..."
                      className="w-full resize-y rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                    />

                    <p className="mt-2 text-xs leading-5 text-jashna-muted">
                      Example: A strong answer should use the target vocabulary
                      naturally and demonstrate correct sentence structure.
                    </p>
                  </div>
                )}

                {/* CRITERIA */}

                {formData.type === "text" && (
                  <div>
                    <label
                      htmlFor="evaluationCriteria"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Evaluation Criteria
                    </label>

                    <textarea
                      id="evaluationCriteria"
                      name="evaluationCriteria"
                      rows="7"
                      value={formData.evaluationCriteria}
                      onChange={handleChange}
                      placeholder={`{
  "grammar": true,
  "vocabulary": true,
  "relevance": true,
  "naturalUsage": true
}`}
                      className="w-full resize-y rounded-xl border border-jashna-stone bg-[#faf9f6] px-4 py-3.5 font-mono text-xs leading-6 outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                    />

                    <p className="mt-2 text-xs leading-5 text-jashna-muted">
                      Optional JSON configuration for the future AI evaluator.
                      Keep it as a valid JSON object.
                    </p>
                  </div>
                )}

                {/* FEEDBACK */}

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="feedbackCorrect"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Correct Feedback
                    </label>

                    <textarea
                      id="feedbackCorrect"
                      name="feedbackCorrect"
                      rows="4"
                      value={formData.feedbackCorrect}
                      onChange={handleChange}
                      placeholder="e.g. Excellent work! Your answer demonstrates..."
                      className="w-full resize-y rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feedbackIncorrect"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Incorrect / Improvement Feedback
                    </label>

                    <textarea
                      id="feedbackIncorrect"
                      name="feedbackIncorrect"
                      rows="4"
                      value={formData.feedbackIncorrect}
                      onChange={handleChange}
                      placeholder="e.g. Review the target concept and try again..."
                      className="w-full resize-y rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-jashna-gold/30 bg-jashna-gold/5 p-4">
                  <Info
                    size={17}
                    className="mt-0.5 shrink-0 text-jashna-gold"
                  />

                  <p className="text-xs leading-5 text-jashna-muted">
                    The AI API is not connected yet. These fields are being
                    stored now so the evaluation engine can use the same
                    challenge configuration when AI evaluation is connected.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                STATUS
            ================================================= */}

            <section className="rounded-2xl border border-jashna-stone bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl text-jashna-maroon-dark">
                Availability
              </h2>

              <p className="mb-6 mt-1 text-sm text-jashna-muted">
                Inactive challenges remain saved but cannot be selected by the
                public challenge system.
              </p>

              <label
                className={`block cursor-pointer rounded-2xl border p-5 transition ${
                  formData.active
                    ? "border-green-300 bg-green-50"
                    : "border-jashna-stone"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        active: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4"
                  />

                  <div>
                    <p className="font-semibold">Challenge is active</p>

                    <p className="mt-1 text-xs leading-5 text-jashna-muted">
                      Active challenges are available to the Weekly Challenge
                      selection system.
                    </p>
                  </div>

                  {formData.active && (
                    <CheckCircle2
                      size={20}
                      className="ml-auto shrink-0 text-green-600"
                    />
                  )}
                </div>
              </label>
            </section>

            {/* =================================================
                ARCHITECTURE NOTE
            ================================================= */}

            <section className="rounded-2xl border border-jashna-maroon/10 bg-jashna-maroon/[0.03] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jashna-maroon/10 text-jashna-maroon">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2 className="font-display text-xl text-jashna-maroon-dark">
                    Evaluation Architecture
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-jashna-muted">
                    Challenge content and evaluation configuration are stored
                    together, while the actual scoring engine remains separate.
                    This allows Weekly Challenge, AI Assessment and Voice
                    Assessment to share the same evaluation architecture later.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
                    <span className="rounded-full bg-white px-3 py-1.5 text-jashna-maroon">
                      Challenge Content
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-jashna-maroon">
                      Evaluation Engine
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-jashna-maroon">
                      Results
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-jashna-maroon">
                      Personalised Feedback
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ACTIONS */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/challenges")}
              className="flex items-center justify-center gap-2 rounded-xl border border-jashna-stone bg-white px-6 py-3.5 text-sm font-semibold transition hover:border-jashna-maroon"
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-jashna-maroon px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-jashna-maroon-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />

                  {isEditMode ? "Saving Changes..." : "Creating Challenge..."}
                </>
              ) : (
                <>
                  <Save size={17} />

                  {isEditMode ? "Save Changes" : "Create Challenge"}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ChallengeForm;
