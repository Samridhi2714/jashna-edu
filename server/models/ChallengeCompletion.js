import mongoose from "mongoose";

const challengeCompletionSchema = new mongoose.Schema(
  {
    /* =====================================================
       LEARNER
    ===================================================== */

    playerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    /* =====================================================
       CHALLENGE REFERENCE
    ===================================================== */

    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },

    /*
     * Stable challenge key.
     *
     * Example:
     * vocabulary
     * grammar
     * speaking
     * interview
     */

    challengeKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
    },

    /* =====================================================
       LEARNER RESPONSE
    ===================================================== */

    /*
     * Stores the learner's submitted answer.
     *
     * Current Weekly Challenge:
     *
     * MCQ:
     * "1"
     *
     * Text:
     * "I would like to improve my communication skills."
     *
     * IMPORTANT:
     * Voice/audio data should NOT be stored here.
     * Voice Assessment can later use a separate media reference.
     */

    answer: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    /* =====================================================
       EVALUATION RESULT
    ===================================================== */

    score: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },

    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },

    /*
     * How the answer was evaluated.
     *
     * rule_based
     * ai
     * hybrid
     */

    evaluationMode: {
      type: String,
      enum: ["rule_based", "ai", "hybrid"],
      default: "rule_based",
    },

    /*
     * Category used by the reusable evaluation layer.
     *
     * Examples:
     * vocabulary
     * grammar
     * speaking
     * interview
     * professional
     * pronunciation
     * idioms
     * writing
     */

    evaluationCategory: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 50,
      default: "",
    },

    /* =====================================================
       EVALUATION STATUS
    ===================================================== */

    /*
     * Allows us to distinguish between:
     *
     * completed
     * pending
     * failed
     *
     * This becomes useful later when AI evaluation
     * is asynchronous.
     */

    evaluationStatus: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },

    /* =====================================================
       FEEDBACK
    ===================================================== */

    /*
     * Short learner-facing feedback.
     */

    feedback: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    /* =====================================================
       STRUCTURED EVALUATION
    ===================================================== */

    /*
     * Common evaluation output.
     *
     * These fields are intentionally generic so the
     * same structure can later be used by:
     *
     * Weekly Challenge
     * AI Assessment
     * Voice Assessment
     *
     * without changing the frontend contract.
     */

    evaluation: {
      strengths: {
        type: [String],
        default: [],
      },

      areasToImprove: {
        type: [String],
        default: [],
      },

      suggestions: {
        type: [String],
        default: [],
      },

      /*
       * Optional numeric metrics.
       *
       * Examples later:
       *
       * fluency: 78
       * pronunciation: 84
       * grammar: 72
       * vocabulary: 81
       * confidence: 76
       *
       * We keep this flexible because different
       * assessment types may use different metrics.
       */

      metrics: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      /*
       * Optional evaluator/provider information.
       *
       * Example:
       * "rule-based"
       * "groq"
       * "openai"
       *
       * This is useful for debugging and analytics later.
       */

      evaluator: {
        type: String,
        default: "",
        trim: true,
        maxlength: 100,
      },
    },

    /* =====================================================
       WEEK
    ===================================================== */

    /*
     * Example:
     * 2026-09-14
     *
     * Used for weekly analytics/history.
     */

    weekKey: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   INDEXES
========================================================= */

/*
 * Learner history.
 */

challengeCompletionSchema.index({
  playerName: 1,
  createdAt: -1,
});

/*
 * Weekly challenge analytics.
 */

challengeCompletionSchema.index({
  weekKey: 1,
  challengeKey: 1,
});

/*
 * Learner + week + challenge analytics.
 *
 * IMPORTANT:
 * This is intentionally NOT unique.
 *
 * That means a learner can retry a challenge and
 * we can preserve the history of those attempts.
 */

challengeCompletionSchema.index({
  playerName: 1,
  weekKey: 1,
  challengeKey: 1,
});

/*
 * Useful later for evaluation analytics.
 */

challengeCompletionSchema.index({
  evaluationMode: 1,
  evaluationCategory: 1,
  createdAt: -1,
});

export default mongoose.model("ChallengeCompletion", challengeCompletionSchema);
