import mongoose from "mongoose";

const goalSnapshotSchema = new mongoose.Schema(
  {
    targetSkills: { type: [String], default: [] },
    currentChallenges: { type: [String], default: [] },
    additionalNotes: { type: String, trim: true, default: "" },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: true },
);

const assessmentSchema = new mongoose.Schema(
  {
    targetSkills: { type: [String], default: [] },
    currentChallenges: { type: [String], default: [] },
    additionalNotes: { type: String, trim: true, default: "" },
    submittedAt: { type: Date, default: null },
  },
  { _id: false },
);

const currentGoalsSchema = new mongoose.Schema(
  {
    targetSkills: { type: [String], default: [] },
    currentChallenges: { type: [String], default: [] },
    additionalNotes: { type: String, trim: true, default: "" },
    updatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const learningGoalsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
      index: true,
    },
    initialAssessment: {
      type: assessmentSchema,
      default: () => ({}),
    },
    currentGoals: {
      type: currentGoalsSchema,
      default: () => ({}),
    },
    // Every successful save appends an immutable snapshot here.
    // Existing documents receive an empty history until the next save.
    history: {
      type: [goalSnapshotSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const StudentLearningGoals = mongoose.model(
  "StudentLearningGoals",
  learningGoalsSchema,
);

export default StudentLearningGoals;
