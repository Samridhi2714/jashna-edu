import express from "express";
import mongoose from "mongoose";

import Challenge from "../models/Challenge.js";
import ChallengeSettings from "../models/ChallengeSettings.js";
import ChallengeCompletion from "../models/ChallengeCompletion.js";

import protect from "../middleware/authMiddleware.js";

import { evaluate } from "../services/evaluation/index.js";

const router = express.Router();

/* =========================================================
   WEEKLY CHALLENGE CONSTANTS
========================================================= */

/*
 * These are the only topics currently used by the
 * Weekly Challenge wheel.
 *
 * IMPORTANT:
 *
 * The backend chooses:
 *
 *       1 topic
 *          ↓
 *       1 question from that topic
 *
 * This keeps the random behaviour aligned with the
 * frontend wheel.
 */

const RANDOM_TOPIC_KEYS = [
  "vocabulary",
  "grammar",
  "speaking",
  "interview",
  "professional",
  "pronunciation",
  "idioms",
  "writing",
];

/* =========================================================
   WEEK KEY
========================================================= */

/*
 * Returns the Monday of the current week.
 *
 * Example:
 *
 * 2026-09-14
 *
 * This is used for leaderboard/history purposes.
 */

const getWeekKey = (date = new Date()) => {
  const current = new Date(date);

  const day = current.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  current.setDate(current.getDate() + diff);

  const year = current.getFullYear();

  const month = String(current.getMonth() + 1).padStart(2, "0");

  const dateNumber = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${dateNumber}`;
};

/* =========================================================
   RANDOM CHALLENGE SELECTION
========================================================= */

/*
 * IMPORTANT:
 *
 * The Weekly Challenge does NOT use:
 *
 * ChallengeSettings.activeChallengeId
 *
 * Every request gets an independent random challenge.
 *
 * Step 1:
 *   Randomly select one of the 8 supported topics.
 *
 * Step 2:
 *   Randomly select one active challenge from that topic.
 *
 * Example:
 *
 * Visitor A
 *   → vocabulary
 *   → Beginner question
 *
 * Visitor B
 *   → speaking
 *   → Advanced question
 *
 * Visitor C
 *   → grammar
 *   → Intermediate question
 *
 * All can happen simultaneously.
 */

const getRandomChallenge = async () => {
  /* -------------------------------------------------------
     STEP 1 — RANDOM TOPIC
  ------------------------------------------------------- */

  /*
   * We first determine which of the eight configured
   * topics actually has active challenges.
   *
   * This prevents an empty topic from being selected.
   */

  const availableTopics = await Challenge.distinct("evaluationCategory", {
    active: true,

    evaluationCategory: {
      $in: RANDOM_TOPIC_KEYS,
    },
  });

  if (!availableTopics.length) {
    return null;
  }

  const randomTopic =
    availableTopics[Math.floor(Math.random() * availableTopics.length)];

  /* -------------------------------------------------------
     STEP 2 — RANDOM QUESTION
  ------------------------------------------------------- */

  /*
   * MongoDB $sample gives us a random document directly.
   *
   * The correct answer is excluded from the response.
   */

  const [randomChallenge] = await Challenge.aggregate([
    {
      $match: {
        active: true,

        evaluationCategory: randomTopic,
      },
    },

    {
      $sample: {
        size: 1,
      },
    },

    {
      $project: {
        correct: 0,
      },
    },
  ]);

  return randomChallenge || null;
};

/* =========================================================
   VALIDATION
========================================================= */

/*
 * Used by admin create/update endpoints.
 */

const validateChallengeData = (data) => {
  const {
    id,
    title,
    label,
    description,
    type,
    task,
    options,
    correct,
    evaluationMode,
    evaluationCategory,
    difficulty,

    /*
     * New Phase 2 fields.
     */
    expectedResponse,
    evaluationCriteria,
    feedback,
  } = data;

  /* -------------------------------------------------------
     REQUIRED FIELDS
  ------------------------------------------------------- */

  if (!id || !title || !label || !description || !type || !task) {
    return "ID, title, label, description, type and task are required.";
  }

  /* -------------------------------------------------------
     ID
  ------------------------------------------------------- */

  if (!/^[a-z0-9-]+$/i.test(String(id).trim())) {
    return "ID can contain only letters, numbers and hyphens.";
  }

  /* -------------------------------------------------------
     TYPE
  ------------------------------------------------------- */

  if (!["text", "mcq"].includes(type)) {
    return "Challenge type must be either 'text' or 'mcq'.";
  }

  /* -------------------------------------------------------
     EVALUATION MODE
  ------------------------------------------------------- */

  if (
    evaluationMode &&
    !["rule_based", "ai", "hybrid"].includes(evaluationMode)
  ) {
    return "Evaluation mode must be 'rule_based', 'ai' or 'hybrid'.";
  }

  /* -------------------------------------------------------
     DIFFICULTY
  ------------------------------------------------------- */

  if (
    difficulty &&
    !["Beginner", "Intermediate", "Intermediate+", "Advanced"].includes(
      difficulty,
    )
  ) {
    return "Invalid challenge difficulty.";
  }

  /* -------------------------------------------------------
     EVALUATION CATEGORY
  ------------------------------------------------------- */

  if (
    evaluationCategory !== undefined &&
    typeof evaluationCategory !== "string"
  ) {
    return "Evaluation category must be a string.";
  }

  /* -------------------------------------------------------
     EXPECTED RESPONSE
  ------------------------------------------------------- */

  if (expectedResponse !== undefined && typeof expectedResponse !== "string") {
    return "Expected response must be a string.";
  }

  /* -------------------------------------------------------
     EVALUATION CRITERIA
  ------------------------------------------------------- */

  if (
    evaluationCriteria !== undefined &&
    (typeof evaluationCriteria !== "object" ||
      Array.isArray(evaluationCriteria) ||
      evaluationCriteria === null)
  ) {
    return "Evaluation criteria must be an object.";
  }

  /* -------------------------------------------------------
     FEEDBACK
  ------------------------------------------------------- */

  if (feedback !== undefined) {
    if (typeof feedback !== "object") {
      return "Feedback must be an object.";
    }

    if (
      feedback.correct !== undefined &&
      typeof feedback.correct !== "string"
    ) {
      return "Correct feedback must be a string.";
    }

    if (
      feedback.incorrect !== undefined &&
      typeof feedback.incorrect !== "string"
    ) {
      return "Incorrect feedback must be a string.";
    }
  }

  /* -------------------------------------------------------
     TEXT CHALLENGE
  ------------------------------------------------------- */

  if (type === "text") {
    return null;
  }

  /* -------------------------------------------------------
     MCQ CHALLENGE
  ------------------------------------------------------- */

  if (!Array.isArray(options) || options.length < 2) {
    return "MCQ challenges must contain at least two options.";
  }

  /* -------------------------------------------------------
     EMPTY OPTIONS
  ------------------------------------------------------- */

  const cleanedOptions = options.map((option) => String(option).trim());

  if (cleanedOptions.some((option) => !option)) {
    return "MCQ options cannot be empty.";
  }

  /* -------------------------------------------------------
     DUPLICATE OPTIONS
  ------------------------------------------------------- */

  const normalizedOptions = cleanedOptions.map((option) =>
    option.toLowerCase(),
  );

  if (new Set(normalizedOptions).size !== normalizedOptions.length) {
    return "MCQ options must be different from each other.";
  }

  /* -------------------------------------------------------
     CORRECT ANSWER
  ------------------------------------------------------- */

  if (
    correct === null ||
    correct === undefined ||
    Number.isNaN(Number(correct))
  ) {
    return "MCQ challenges must have a correct answer.";
  }

  const correctIndex = Number(correct);

  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= options.length
  ) {
    return "Correct answer index is invalid.";
  }

  return null;
};

/* =========================================================
   PUBLIC
   GET RANDOM CHALLENGE
========================================================= */

/*
 * GET /api/challenges/random
 *
 * This is the main public Weekly Challenge endpoint.
 */

router.get("/random", async (req, res) => {
  try {
    const challenge = await getRandomChallenge();

    if (!challenge) {
      return res.status(404).json({
        success: false,

        message: "No active challenges are available.",
      });
    }

    return res.status(200).json({
      success: true,

      topic: challenge.evaluationCategory,

      challenge,
    });
  } catch (error) {
    console.error("GET RANDOM CHALLENGE ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to generate a random challenge.",
    });
  }
});

/* =========================================================
   PUBLIC
   GET CURRENT CHALLENGE
========================================================= */

/*
 * Kept for compatibility.
 *
 * It now behaves exactly like the random endpoint.
 *
 * The frontend should use /random.
 */

router.get("/current", async (req, res) => {
  try {
    const challenge = await getRandomChallenge();

    if (!challenge) {
      return res.status(404).json({
        success: false,

        message: "No active challenges are available.",
      });
    }

    return res.status(200).json({
      success: true,

      mode: "random",

      weekKey: getWeekKey(),

      topic: challenge.evaluationCategory,

      challenge,
    });
  } catch (error) {
    console.error("GET CURRENT CHALLENGE ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to load challenge.",
    });
  }
});

/* =========================================================
   ADMIN
   GET CHALLENGE SETTINGS
========================================================= */

router.get("/settings/current", protect, async (req, res) => {
  try {
    let settings = await ChallengeSettings.findOne()
      .populate("activeChallengeId")
      .lean();

    /* ---------------------------------------------------
         CREATE DEFAULT SETTINGS
      --------------------------------------------------- */

    if (!settings) {
      settings = await ChallengeSettings.create({
        /*
         * New default mode.
         */
        selectionMode: "random",

        activeChallengeId: null,

        weekKey: "",

        randomTopics: RANDOM_TOPIC_KEYS,
      });

      settings = await ChallengeSettings.findById(settings._id)
        .populate("activeChallengeId")
        .lean();
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET CHALLENGE SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch challenge settings.",
    });
  }
});

/* =========================================================
   ADMIN
   UPDATE CHALLENGE SETTINGS
========================================================= */

/*
 * IMPORTANT:
 *
 * The settings system still supports:
 *
 * random
 * weekly
 * fixed
 *
 * However, public random selection does not depend on
 * activeChallengeId.
 */

router.put("/settings/current", protect, async (req, res) => {
  try {
    const { selectionMode, activeChallengeId, weekKey, randomTopics } =
      req.body;

    /* ---------------------------------------------------
         VALIDATE MODE
      --------------------------------------------------- */

    if (!["random", "weekly", "fixed"].includes(selectionMode)) {
      return res.status(400).json({
        success: false,

        message: "Selection mode must be 'random', 'weekly' or 'fixed'.",
      });
    }

    /* ---------------------------------------------------
         VALIDATE RANDOM TOPICS
      --------------------------------------------------- */

    let normalizedTopics = RANDOM_TOPIC_KEYS;

    if (Array.isArray(randomTopics)) {
      normalizedTopics = randomTopics
        .map((topic) => String(topic).trim().toLowerCase())
        .filter((topic) => RANDOM_TOPIC_KEYS.includes(topic));

      /*
       * Prevent accidentally saving an empty
       * topic configuration.
       */

      if (!normalizedTopics.length) {
        return res.status(400).json({
          success: false,

          message: "At least one valid random topic is required.",
        });
      }
    }

    /* ---------------------------------------------------
         VALIDATE ACTIVE CHALLENGE
      --------------------------------------------------- */

    let challenge = null;

    /*
     * activeChallengeId is only required when
     * using fixed/weekly admin-controlled mode.
     *
     * Random mode does not require it.
     */

    if (selectionMode !== "random") {
      if (!activeChallengeId) {
        return res.status(400).json({
          success: false,

          message: "Please select an active challenge.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(activeChallengeId)) {
        return res.status(400).json({
          success: false,

          message: "Invalid active challenge ID.",
        });
      }

      challenge = await Challenge.findOne({
        _id: activeChallengeId,

        active: true,
      });

      if (!challenge) {
        return res.status(404).json({
          success: false,

          message: "The selected challenge does not exist or is inactive.",
        });
      }
    }

    /* ---------------------------------------------------
         FIND OR CREATE SETTINGS
      --------------------------------------------------- */

    let settings = await ChallengeSettings.findOne();

    if (!settings) {
      settings = new ChallengeSettings();
    }

    settings.selectionMode = selectionMode;

    /*
     * In random mode, there is no globally active
     * visitor challenge.
     */

    settings.activeChallengeId = challenge ? challenge._id : null;

    settings.weekKey =
      typeof weekKey === "string" && weekKey.trim()
        ? weekKey.trim()
        : getWeekKey();

    settings.randomTopics = normalizedTopics;

    /* ---------------------------------------------------
         SAVE ADMIN
      --------------------------------------------------- */

    if (req.admin?._id) {
      settings.updatedBy = req.admin._id;
    }

    await settings.save();

    /* ---------------------------------------------------
         RETURN UPDATED SETTINGS
      --------------------------------------------------- */

    settings = await ChallengeSettings.findById(settings._id)
      .populate("activeChallengeId")
      .lean();

    return res.status(200).json({
      success: true,

      message: "Challenge settings updated successfully.",

      settings,
    });
  } catch (error) {
    console.error("UPDATE CHALLENGE SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update challenge settings.",
    });
  }
});

/* =========================================================
   ADMIN
   GET ALL CHALLENGES
========================================================= */

router.get("/", protect, async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .sort({
        label: 1,
        difficulty: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,

      count: challenges.length,

      challenges,
    });
  } catch (error) {
    console.error("GET CHALLENGES ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch challenges.",
    });
  }
});

/* =========================================================
   PUBLIC
   LEADERBOARD
========================================================= */

router.get("/leaderboard", async (req, res) => {
  try {
    /*
     * Leaderboard is based on the actual current
     * calendar week.
     *
     * It does NOT depend on activeChallengeId.
     */

    const weekKey = getWeekKey();

    const leaderboard = await ChallengeCompletion.aggregate([
      {
        $match: {
          weekKey,
        },
      },

      {
        $group: {
          _id: "$playerName",

          totalScore: {
            $sum: "$score",
          },

          challengesCompleted: {
            $sum: {
              $cond: ["$isCorrect", 1, 0],
            },
          },
        },
      },

      {
        $sort: {
          totalScore: -1,

          challengesCompleted: -1,
        },
      },

      {
        $limit: 50,
      },

      {
        $project: {
          _id: 0,

          playerName: "$_id",

          totalScore: 1,

          challengesCompleted: 1,
        },
      },
    ]);

    const rankedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,

      ...player,
    }));

    return res.json({
      success: true,

      weekKey,

      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to load leaderboard.",
    });
  }
});

/* =========================================================
   ADMIN
   GET SINGLE CHALLENGE
========================================================= */

router.get("/:id", protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).lean();

    if (!challenge) {
      return res.status(404).json({
        success: false,

        message: "Challenge not found.",
      });
    }

    return res.status(200).json({
      success: true,

      challenge,
    });
  } catch (error) {
    console.error("GET SINGLE CHALLENGE ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch challenge.",
    });
  }
});

/* =========================================================
   ADMIN
   CREATE CHALLENGE
========================================================= */

router.post("/", protect, async (req, res) => {
  try {
    const validationError = validateChallengeData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,

        message: validationError,
      });
    }

    const {
      id,
      title,
      label,
      description,
      type,
      task,
      placeholder,
      options,
      correct,
      evaluationMode,
      evaluationCategory,
      difficulty,
      active,

      /*
       * Phase 2 metadata.
       */
      expectedResponse,
      evaluationCriteria,
      feedback,
    } = req.body;

    const normalizedId = id.trim().toLowerCase();

    /* ---------------------------------------------------
         CHECK DUPLICATE ID
      --------------------------------------------------- */

    const existingChallenge = await Challenge.findOne({
      id: normalizedId,
    });

    if (existingChallenge) {
      return res.status(409).json({
        success: false,

        message: "A challenge with this ID already exists.",
      });
    }

    /* ---------------------------------------------------
         NORMALIZE CATEGORY
      --------------------------------------------------- */

    const normalizedCategory =
      typeof evaluationCategory === "string" && evaluationCategory.trim()
        ? evaluationCategory.trim().toLowerCase()
        : label.trim().toLowerCase();

    /* ---------------------------------------------------
         CREATE
      --------------------------------------------------- */

    const challenge = await Challenge.create({
      id: normalizedId,

      title: title.trim(),

      label: label.trim().toUpperCase(),

      description: description.trim(),

      type,

      task: task.trim(),

      placeholder: typeof placeholder === "string" ? placeholder.trim() : "",

      options:
        type === "mcq" ? options.map((option) => String(option).trim()) : [],

      correct: type === "mcq" ? Number(correct) : null,

      evaluationMode: type === "text" ? evaluationMode || "ai" : "rule_based",

      evaluationCategory: normalizedCategory,

      difficulty: difficulty || "Intermediate",

      expectedResponse:
        typeof expectedResponse === "string" ? expectedResponse.trim() : "",

      evaluationCriteria: evaluationCriteria || {},

      feedback: {
        correct:
          typeof feedback?.correct === "string" ? feedback.correct.trim() : "",

        incorrect:
          typeof feedback?.incorrect === "string"
            ? feedback.incorrect.trim()
            : "",
      },

      active: active !== undefined ? Boolean(active) : true,
    });

    return res.status(201).json({
      success: true,

      message: "Challenge created successfully.",

      challenge,
    });
  } catch (error) {
    console.error("CREATE CHALLENGE ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message: "A challenge with this ID already exists.",
      });
    }

    return res.status(500).json({
      success: false,

      message: "Failed to create challenge.",
    });
  }
});

/* =========================================================
   ADMIN
   UPDATE CHALLENGE
========================================================= */

router.put("/:id", protect, async (req, res) => {
  try {
    const validationError = validateChallengeData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,

        message: validationError,
      });
    }

    const {
      id,
      title,
      label,
      description,
      type,
      task,
      placeholder,
      options,
      correct,
      evaluationMode,
      evaluationCategory,
      difficulty,
      active,

      /*
       * Phase 2 metadata.
       */
      expectedResponse,
      evaluationCriteria,
      feedback,
    } = req.body;

    /* ---------------------------------------------------
         FIND CHALLENGE
      --------------------------------------------------- */

    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,

        message: "Challenge not found.",
      });
    }

    /* ---------------------------------------------------
         ID IS IMMUTABLE
      --------------------------------------------------- */

    const submittedId = id.trim().toLowerCase();

    if (submittedId !== challenge.id) {
      return res.status(400).json({
        success: false,

        message: "Challenge ID cannot be changed after creation.",
      });
    }

    /* ---------------------------------------------------
         CHECK ADMIN PUBLISHED STATE
      --------------------------------------------------- */

    const settings = await ChallengeSettings.findOne();

    const isPublished =
      settings &&
      settings.activeChallengeId &&
      settings.activeChallengeId.toString() === challenge._id.toString();

    /* ---------------------------------------------------
         DON'T DEACTIVATE PUBLISHED CHALLENGE
      --------------------------------------------------- */

    if (isPublished && active === false) {
      return res.status(400).json({
        success: false,

        message:
          "The currently published challenge cannot be deactivated. Publish another challenge first.",
      });
    }

    /* ---------------------------------------------------
         UPDATE BASIC DATA
      --------------------------------------------------- */

    challenge.title = title.trim();

    challenge.label = label.trim().toUpperCase();

    challenge.description = description.trim();

    challenge.type = type;

    challenge.task = task.trim();

    challenge.placeholder =
      typeof placeholder === "string" ? placeholder.trim() : "";

    challenge.options =
      type === "mcq" ? options.map((option) => String(option).trim()) : [];

    challenge.correct = type === "mcq" ? Number(correct) : null;

    /* ---------------------------------------------------
         EVALUATION MODE
      --------------------------------------------------- */

    challenge.evaluationMode =
      type === "text" ? evaluationMode || "ai" : "rule_based";

    /* ---------------------------------------------------
         CATEGORY
      --------------------------------------------------- */

    if (typeof evaluationCategory === "string") {
      challenge.evaluationCategory = evaluationCategory.trim().toLowerCase();
    }

    /* ---------------------------------------------------
         DIFFICULTY
      --------------------------------------------------- */

    challenge.difficulty = difficulty || "Intermediate";

    /* ---------------------------------------------------
         PHASE 2 METADATA
      --------------------------------------------------- */

    challenge.expectedResponse =
      typeof expectedResponse === "string" ? expectedResponse.trim() : "";

    challenge.evaluationCriteria = evaluationCriteria || {};

    challenge.feedback = {
      correct:
        typeof feedback?.correct === "string" ? feedback.correct.trim() : "",

      incorrect:
        typeof feedback?.incorrect === "string"
          ? feedback.incorrect.trim()
          : "",
    };

    /* ---------------------------------------------------
         ACTIVE STATE
      --------------------------------------------------- */

    if (active !== undefined) {
      challenge.active = Boolean(active);
    }

    /* ---------------------------------------------------
         SAVE
      --------------------------------------------------- */

    await challenge.save();

    return res.status(200).json({
      success: true,

      message: "Challenge updated successfully.",

      challenge,
    });
  } catch (error) {
    console.error("UPDATE CHALLENGE ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update challenge.",
    });
  }
});

/* =========================================================
   ADMIN
   DELETE CHALLENGE
========================================================= */

router.delete("/:id", protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,

        message: "Challenge not found.",
      });
    }

    /* ---------------------------------------------------
         CHECK ADMIN PUBLISHED STATE
      --------------------------------------------------- */

    const settings = await ChallengeSettings.findOne();

    if (
      settings &&
      settings.activeChallengeId &&
      settings.activeChallengeId.toString() === challenge._id.toString()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This challenge is currently published. Change the active challenge before deleting it.",
      });
    }

    await Challenge.findByIdAndDelete(challenge._id);

    return res.status(200).json({
      success: true,

      message: "Challenge deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CHALLENGE ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to delete challenge.",
    });
  }
});

/* =========================================================
   PUBLIC
   COMPLETE / EVALUATE CHALLENGE
========================================================= */

/*
 * Flow:
 *
 * visitor
 *    ↓
 * random challenge
 *    ↓
 * answer
 *    ↓
 * POST /complete
 *    ↓
 * find exact challenge
 *    ↓
 * Evaluation Engine
 *    ↓
 * save result
 *    ↓
 * return result
 *
 *
 * The route does NOT know how evaluation works.
 *
 * It only calls:
 *
 * evaluate({
 *   challenge,
 *   answer
 * })
 *
 * This is the main Phase 3 architectural change.
 */

router.post("/complete", async (req, res) => {
  try {
    const { playerName, challengeId, answer } = req.body;

    /* ===================================================
         VALIDATE PLAYER NAME
      =================================================== */

    if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
      return res.status(400).json({
        success: false,

        message: "Player name is required.",
      });
    }

    const normalizedPlayerName = playerName.trim();

    if (normalizedPlayerName.length > 40) {
      return res.status(400).json({
        success: false,

        message: "Player name cannot exceed 40 characters.",
      });
    }

    /* ===================================================
         VALIDATE CHALLENGE ID
      =================================================== */

    if (!challengeId) {
      return res.status(400).json({
        success: false,

        message: "Challenge ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid challenge ID.",
      });
    }

    /* ===================================================
         FIND EXACT CHALLENGE
      =================================================== */

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,

        message: "Challenge not found.",
      });
    }

    /* ===================================================
         CHALLENGE MUST BE ACTIVE
      =================================================== */

    if (!challenge.active) {
      return res.status(400).json({
        success: false,

        message: "This challenge is no longer active.",
      });
    }

    /*
     * IMPORTANT:
     *
     * We intentionally DO NOT check:
     *
     * ChallengeSettings.activeChallengeId
     *
     * because every visitor can receive a different
     * random challenge.
     */

    /* ===================================================
         NORMALIZE ANSWER
      =================================================== */

    const normalizedAnswer =
      answer === null || answer === undefined ? "" : String(answer).trim();

    /* ===================================================
         EVALUATION ENGINE
      =================================================== */

    const { evaluationMode, evaluationStatus, result } = await evaluate({
      challenge,
      answer: normalizedAnswer,
    });

    /* ===================================================
         CURRENT WEEK
      =================================================== */

    const completionWeekKey = getWeekKey();

    /* ===================================================
         SAVE COMPLETION
      =================================================== */

    const completion = await ChallengeCompletion.create({
      playerName: normalizedPlayerName,

      challengeId: challenge._id,

      challengeKey: challenge.id,

      answer: normalizedAnswer,

      score: result.score,

      isCorrect: result.isCorrect,

      evaluationMode,

      evaluationCategory:
        challenge.evaluationCategory || challenge.label.toLowerCase(),

      evaluationStatus,

      feedback: result.feedback,

      evaluation: {
        strengths: result.strengths,

        areasToImprove: result.areasToImprove,

        suggestions: result.suggestions,

        metrics: result.metrics || {},

        evaluator: evaluationMode,
      },

      weekKey: completionWeekKey,
    });

    /* ===================================================
         RESPONSE
      =================================================== */

    /*
     * Never expose:
     *
     * - correct
     * - internal challenge answer
     * - unnecessary database information
     */

    return res.status(201).json({
      success: true,

      message: result.isCorrect
        ? "Challenge completed successfully!"
        : "Answer evaluated.",

      completion: {
        id: completion._id,

        playerName: completion.playerName,

        challengeId: completion.challengeId,

        challengeKey: completion.challengeKey,

        score: completion.score,

        isCorrect: completion.isCorrect,

        evaluationMode: completion.evaluationMode,

        evaluationStatus: completion.evaluationStatus,

        evaluationCategory: completion.evaluationCategory,

        feedback: completion.feedback,

        evaluation: completion.evaluation,

        weekKey: completion.weekKey,

        completedAt: completion.createdAt,
      },
    });
  } catch (error) {
    console.error("Complete challenge error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to submit challenge.",
    });
  }
});

/* =========================================================
   EXPORT
========================================================= */

export default router;
