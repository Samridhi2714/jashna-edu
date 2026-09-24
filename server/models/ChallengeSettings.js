import mongoose from "mongoose";

const challengeSettingsSchema = new mongoose.Schema(
  {
    /* =====================================================
       CHALLENGE SELECTION
    ===================================================== */

    /*
     * random
     *   Every visitor can receive their own random challenge.
     *
     * weekly
     *   Reserved for future weekly assignment logic.
     *
     * fixed
     *   Reserved for admin-controlled fixed challenge mode.
     */

    selectionMode: {
      type: String,
      enum: ["random", "weekly", "fixed"],
      default: "random",
    },

    /* =====================================================
       LEGACY / ADMIN CONTROLLED CHALLENGE
    ===================================================== */

    /*
     * This field is intentionally kept.
     *
     * It may still be useful for:
     *
     * - admin dashboard
     * - future fixed mode
     * - historical configuration
     *
     * IMPORTANT:
     *
     * Public GET /api/challenges/random should NOT use
     * this field to decide which challenge a visitor gets.
     */

    activeChallengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      default: null,
    },

    /* =====================================================
       WEEK IDENTIFIER
    ===================================================== */

    /*
     * Example:
     *
     * 2026-W38
     *
     * Useful later for:
     *
     * - weekly analytics
     * - automatic resets
     * - challenge history
     */

    weekKey: {
      type: String,
      trim: true,
      match: /^$|^\d{4}-W\d{2}$/,
      default: "",
    },

    /* =====================================================
       RANDOM TOPIC CONFIGURATION
    ===================================================== */

    /*
     * Topics available to the random challenge selector.
     *
     * Keeping this in settings means the admin system can
     * eventually enable/disable categories without changing
     * the route code.
     */

    randomTopics: {
      type: [String],
      default: [
        "vocabulary",
        "grammar",
        "speaking",
        "interview",
        "professional",
        "pronunciation",
        "idioms",
        "writing",
      ],
      validate: {
        validator: function (topics) {
          return (
            Array.isArray(topics) &&
            topics.length > 0 &&
            topics.every(
              (topic) =>
                typeof topic === "string" &&
                /^[a-z0-9-]+$/.test(topic.trim().toLowerCase()),
            )
          );
        },
        message: "randomTopics must contain valid topic keys.",
      },
    },

    /* =====================================================
       LAST UPDATED BY ADMIN
    ===================================================== */

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ChallengeSettings", challengeSettingsSchema);
