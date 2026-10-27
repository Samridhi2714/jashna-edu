import mongoose from "mongoose";
/*

# MCQ QUESTION SCHEMA

Option numbering:
Option 1 -> correctOptionIndex: 1
Option 2 -> correctOptionIndex: 2
Option 3 -> correctOptionIndex: 3
Option 4 -> correctOptionIndex: 4

The same numbering must be used in the admin form,
student submission, and backend scoring.
========================================

*/

const mcqQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    options: {
      type: [
        {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
      ],
      required: true,
      validate: [
        {
          validator(options) {
            return Array.isArray(options) && options.length >= 2;
          },
          message: "Each MCQ must have at least two options.",
        },
        {
          validator(options) {
            return Array.isArray(options) && options.length <= 10;
          },
          message: "Each MCQ can have at most ten options.",
        },
        {
          validator(options) {
            return (
              Array.isArray(options) &&
              options.every(
                (option) =>
                  typeof option === "string" && option.trim().length > 0,
              )
            );
          },
          message: "MCQ options cannot be empty.",
        },
      ],
    },

    // One-based option number: 1, 2, 3, 4...
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator(value) {
          return Number.isInteger(value) && value <= this.options.length;
        },
        message: "The correct answer must match an existing option number.",
      },
    },
  },
  {
    _id: false,
  },
);

const taskTemplateSchema = new mongoose.Schema(
  {
    /*
-----------------------------------------------------
BASIC TASK INFORMATION
-----------------------------------------------------
*/

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10000,
    },

    // Optional category for organizing the task library.
    category: {
      type: String,
      trim: true,
      default: "General",
      maxlength: 100,
    },

    /*
-----------------------------------------------------
SUBMISSION TYPE
-----------------------------------------------------
*/

    submissionType: {
      type: String,
      required: true,
      enum: [
        "text",
        "video",
        "image",
        "document",
        "audio",
        "text_file",
        "multiple_files",
        "mcq",
      ],
    },

    /*
-----------------------------------------------------
MCQ QUESTIONS
-----------------------------------------------------
*/

    questions: {
      type: [mcqQuestionSchema],
      default: [],
      validate: {
        validator(questions) {
          return (
            !Array.isArray(questions) ||
            questions.every(
              (question) =>
                Number.isInteger(question.correctOptionIndex) &&
                question.correctOptionIndex >= 1 &&
                question.correctOptionIndex <= question.options.length,
            )
          );
        },
        message: "Each MCQ must have a valid correct option number.",
      },
    },

    /*
-----------------------------------------------------
SUBMISSION RULES
-----------------------------------------------------
*/

    // Controls whether students can submit after the deadline.
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },

    // Maximum number of files for file-based submissions.
    maxFiles: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },

    // Maximum file size per file, in MB.
    maxFileSizeMB: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },

    /*
-----------------------------------------------------
TEMPLATE MANAGEMENT
-----------------------------------------------------
*/

    isArchived: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: String,
      default: "admin",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Common query: show available templates, newest first.
taskTemplateSchema.index({
  isArchived: 1,
  updatedAt: -1,
});

const TaskTemplate = mongoose.model("TaskTemplate", taskTemplateSchema);

export default TaskTemplate;
