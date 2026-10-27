import mongoose from "mongoose";
import Student from "../models/Student.js";
import StudentLearningGoals from "../models/StudentLearningGoals.js";

const ALLOWED_SKILLS = [
  "Spoken English",
  "Fluency",
  "Grammar",
  "Vocabulary",
  "Pronunciation",
  "Communication Confidence",
  "Public Speaking",
  "Presentation Skills",
  "Interview Skills",
  "Business English",
  "Listening Skills",
  "Reading Skills",
  "Writing Skills",
  "IELTS Preparation",
  "Other",
];

const ALLOWED_CHALLENGES = [
  "Hesitation while speaking",
  "Fear of making grammatical mistakes",
  "Limited vocabulary",
  "Difficulty forming sentences",
  "Incorrect pronunciation",
  "Difficulty understanding spoken English",
  "Lack of confidence in group discussions",
  "Difficulty speaking spontaneously",
  "Public speaking anxiety",
  "Interview communication",
  "Other",
];

const CUSTOM_PREFIX = "Custom: ";
const MAX_SELECTIONS = 20;
const MAX_NOTES_LENGTH = 1000;

const isValidItem = (item, allowedList, maxLength) =>
  item.length <= maxLength &&
  (allowedList.includes(item) ||
    (item.startsWith(CUSTOM_PREFIX) &&
      item.slice(CUSTOM_PREFIX.length).trim().length > 0));

const validateGoals = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid request body." };
  }

  const { targetSkills, currentChallenges } = body;
  const additionalNotes = body.additionalNotes ?? "";

  if (!Array.isArray(targetSkills) || !Array.isArray(currentChallenges)) {
    return {
      error: "Target skills and current challenges must be arrays.",
    };
  }

  if (
    targetSkills.length > MAX_SELECTIONS ||
    currentChallenges.length > MAX_SELECTIONS
  ) {
    return {
      error: `You can select up to ${MAX_SELECTIONS} skills and challenges.`,
    };
  }

  if (
    !targetSkills.every(
      (item) => typeof item === "string" && item.trim().length > 0,
    ) ||
    !currentChallenges.every(
      (item) => typeof item === "string" && item.trim().length > 0,
    )
  ) {
    return {
      error: "Skills and challenges must contain valid text values.",
    };
  }

  const cleanSkills = [...new Set(targetSkills.map((item) => item.trim()))];
  const cleanChallenges = [
    ...new Set(currentChallenges.map((item) => item.trim())),
  ];

  if (!cleanSkills.every((item) => isValidItem(item, ALLOWED_SKILLS, 100))) {
    return { error: "One or more target skills are invalid." };
  }

  if (
    !cleanChallenges.every((item) =>
      isValidItem(item, ALLOWED_CHALLENGES, 150),
    )
  ) {
    return { error: "One or more challenges are invalid." };
  }

  if (
    typeof additionalNotes !== "string" ||
    additionalNotes.trim().length > MAX_NOTES_LENGTH
  ) {
    return {
      error: `Additional notes must be text up to ${MAX_NOTES_LENGTH} characters.`,
    };
  }

  return {
    data: {
      targetSkills: cleanSkills,
      currentChallenges: cleanChallenges,
      additionalNotes: additionalNotes.trim(),
    },
  };
};

const getActiveStudent = async (req) => {
  const studentId = req.student?.id;

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return { status: 401, message: "Unauthorized." };
  }

  const student = await Student.findById(studentId)
    .select("_id isActive")
    .lean();

  if (!student) {
    return { status: 404, message: "Student account not found." };
  }

  if (!student.isActive) {
    return {
      status: 403,
      message: "This student account has been deactivated.",
    };
  }

  return { student };
};

/* GET /api/student-learning-goals/me */
export const getMyLearningGoals = async (req, res) => {
  try {
    const result = await getActiveStudent(req);

    if (!result.student) {
      return res.status(result.status).json({ message: result.message });
    }

    const goals = await StudentLearningGoals.findOne({
      studentId: result.student._id,
    }).lean();

    return res.status(200).json({ goals });
  } catch (error) {
    console.error("Get learning goals error:", error);
    return res.status(500).json({
      message: "Failed to load learning goals.",
    });
  }
};

/* PUT /api/student-learning-goals/me
   Every successful save appends a timestamped snapshot to history.
   initialAssessment is set only when the document is first created. */
export const saveMyLearningGoals = async (req, res) => {
  try {
    const result = await getActiveStudent(req);

    if (!result.student) {
      return res.status(result.status).json({ message: result.message });
    }

    const validation = validateGoals(req.body);

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const { targetSkills, currentChallenges, additionalNotes } =
      validation.data;
    const now = new Date();

    const snapshot = {
      targetSkills,
      currentChallenges,
      additionalNotes,
      updatedAt: now,
    };

    const goals = await StudentLearningGoals.findOneAndUpdate(
      { studentId: result.student._id },
      {
        $set: {
          currentGoals: snapshot,
        },
        $push: {
          history: snapshot,
        },
        $setOnInsert: {
          initialAssessment: {
            targetSkills,
            currentChallenges,
            additionalNotes,
            submittedAt: now,
          },
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return res.status(200).json({
      message: "Learning goals saved successfully.",
      goals,
    });
  } catch (error) {
    console.error("Save learning goals error:", error);
    return res.status(500).json({
      message: "Failed to save learning goals.",
    });
  }
};

/* GET /api/student-learning-goals/admin */
export const getAllStudentLearningGoals = async (req, res) => {
  try {
    const goals = await StudentLearningGoals.find()
      .populate({
        path: "studentId",
        select: "name username profileImage batch isActive joiningDate createdAt",
      })
      .sort({ updatedAt: -1 })
      .lean();

    const results = goals
      .filter((item) => item.studentId)
      .map((item) => ({
        student: item.studentId,
        initialAssessment: item.initialAssessment,
        currentGoals: item.currentGoals,
        history: Array.isArray(item.history) ? item.history : [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

    return res.status(200).json({ goals: results });
  } catch (error) {
    console.error("Admin learning goals error:", error);
    return res.status(500).json({
      message: "Failed to load student learning goals.",
    });
  }
};
