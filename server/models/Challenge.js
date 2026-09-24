import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    /* =====================================================
       STABLE CHALLENGE ID

       Permanent system identity.

       Examples:
       vocabulary-easy
       grammar-medium
       speaking-hard

       IMPORTANT:
       Do not change an existing ID after creation.
    ===================================================== */

    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },

    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    label: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 40,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    /* =====================================================
       CHALLENGE TYPE

       text = learner writes an answer
       mcq  = learner selects an option
    ===================================================== */

    type: {
      type: String,
      enum: ["text", "mcq"],
      required: true,
    },

    /* =====================================================
       TASK
    ===================================================== */

    task: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    /* =====================================================
       TEXT RESPONSE
    ===================================================== */

    placeholder: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    /* =====================================================
       MCQ RESPONSE
    ===================================================== */

    options: {
      type: [String],
      default: [],
    },

    /*
     * Index of the correct option.
     *
     * Example:
     *
     * options = ["Went", "Gone", "Go", "Going"]
     * correct = 1
     *
     * Therefore "Gone" is the correct option.
     */

    correct: {
      type: Number,
      default: null,
      min: 0,
    },

    /* =====================================================
       EVALUATION CONFIGURATION

       These fields describe how the shared evaluation
       engine should handle the challenge.

       IMPORTANT:
       The Challenge model does NOT perform evaluation.

       It only stores evaluation configuration.

       rule_based
       = deterministic evaluation

       ai
       = AI-based evaluation

       hybrid
       = combination of deterministic rules + AI
    ===================================================== */

    evaluationMode: {
      type: String,
      enum: ["rule_based", "ai", "hybrid"],
      default: "rule_based",
    },

    /* =====================================================
       EVALUATION CATEGORY

       Used by the shared evaluation engine.

       Examples:
       vocabulary
       grammar
       speaking
       interview
       professional
       pronunciation
       idioms
       writing
    ===================================================== */

    evaluationCategory: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 50,
    },

    /* =====================================================
       DIFFICULTY

       Beginner
       Intermediate
       Intermediate+
       Advanced
    ===================================================== */

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Intermediate+", "Advanced"],
      default: "Intermediate+",
    },

    /* =====================================================
       EXPECTED RESPONSE

       Human-readable description of what a good response
       should contain.

       This is especially useful for:
       - AI evaluation
       - admin CMS
       - future assessment system
       - debugging evaluation results
    ===================================================== */

    expectedResponse: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    /* =====================================================
       EVALUATION CRITERIA

       Structured instructions for the evaluation engine.

       Different challenge types can have different
       criteria.

       Example:

       {
         type: "text_quality",
         minWords: 10,
         requiredElements: [
           "clear argument",
           "example"
         ],
         checks: [
           "grammar",
           "clarity",
           "vocabulary"
         ]
       }

       Mixed is intentional because the criteria will vary
       between vocabulary, writing, interview, speaking,
       pronunciation, etc.
    ===================================================== */

    evaluationCriteria: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* =====================================================
       FEEDBACK

       Feedback templates associated with the challenge.

       The evaluation engine can later select or generate
       the appropriate feedback.

       Example:

       {
         correct: "...",
         incorrect: "..."
       }
    ===================================================== */

    feedback: {
      correct: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      incorrect: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },
    },

    /* =====================================================
       ACTIVE / INACTIVE

       Inactive challenges are excluded from the public
       random challenge selection.
    ===================================================== */

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   MODEL VALIDATION
   =========================================================

   The frontend validates challenge data for a better UX.

   This model validation is the backend safety layer.

   It ensures:
   - MCQs always have valid options
   - MCQ correct index is valid
   - MCQ options are unique
   - text challenges never retain MCQ data
   - evaluation mode matches the challenge type
========================================================= */

challengeSchema.pre("validate", function (next) {
  /* =======================================================
     MCQ VALIDATION
  ======================================================= */

  if (this.type === "mcq") {
    if (!Array.isArray(this.options) || this.options.length < 2) {
      return next(
        new Error("MCQ challenges must contain at least two options."),
      );
    }

    /* -----------------------------------------------------
       Remove accidental whitespace only for validation.
       The stored options themselves remain untouched.
    ----------------------------------------------------- */

    const normalizedOptions = this.options.map((option) =>
      String(option).trim().toLowerCase(),
    );

    /* -----------------------------------------------------
       Prevent duplicate options.
    ----------------------------------------------------- */

    const uniqueOptions = new Set(normalizedOptions);

    if (uniqueOptions.size !== normalizedOptions.length) {
      return next(new Error("MCQ options must be different from each other."));
    }

    /* -----------------------------------------------------
       Correct answer must point to a real option.
    ----------------------------------------------------- */

    if (
      !Number.isInteger(this.correct) ||
      this.correct < 0 ||
      this.correct >= this.options.length
    ) {
      return next(
        new Error("MCQ challenges must contain a valid correct answer."),
      );
    }

    /* -----------------------------------------------------
       MCQs are deterministic.
    ----------------------------------------------------- */

    this.evaluationMode = "rule_based";
  }

  /* =======================================================
     TEXT VALIDATION
  ======================================================= */

  if (this.type === "text") {
    /* -----------------------------------------------------
       Text responses do not use MCQ data.
    ----------------------------------------------------- */

    this.options = [];
    this.correct = null;

    /* -----------------------------------------------------
       Open-ended challenges are designed for AI/hybrid
       evaluation.

       If someone explicitly sets hybrid, preserve it.
       Otherwise text challenges use AI.
    ----------------------------------------------------- */

    if (!this.evaluationMode || this.evaluationMode === "rule_based") {
      this.evaluationMode = "ai";
    }
  }

  next();
});

/* =========================================================
   EXPORT MODEL
========================================================= */

export default mongoose.model("Challenge", challengeSchema);
