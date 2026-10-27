import mongoose from "mongoose";
/*
# MCQ QUESTION SCHEMA
Option numbering starts at 1, not 0.
Example:
Option 1 -> correctOptionIndex: 1
Option 2 -> correctOptionIndex: 2
Option 3 -> correctOptionIndex: 3
Option 4 -> correctOptionIndex: 4
=================================

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

/*

# RECIPIENT STATUS

*/

const recipientSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    status: {
      type: String,
      enum: ["assigned", "submitted", "late_submitted", "reviewed", "overdue"],
      default: "assigned",
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    /*
-----------------------------------------------------
STUDENT SUBMISSION
-----------------------------------------------------
*/

    submissionText: {
      type: String,
      default: "",
      maxlength: 50000,
    },

    submissionFiles: [
      {
        originalName: {
          type: String,
          required: true,
        },

        // Existing Cloudinary fields — retained for old submissions.
        url: {
          type: String,
          default: "",
        },

        publicId: {
          type: String,
          default: "",
        },

        resourceType: {
          type: String,
          enum: ["image", "video", "raw", "auto"],
          default: "auto",
        },

        format: {
          type: String,
          default: "",
        },

        // Common metadata.
        size: {
          type: Number,
          default: 0,
        },

        // Google Drive metadata.
        storageProvider: {
          type: String,
          enum: ["cloudinary", "google_drive"],
          default: "cloudinary",
        },

        driveFileId: {
          type: String,
          default: "",
        },

        mimeType: {
          type: String,
          default: "",
        },
      },
    ],

    /*
-----------------------------------------------------
MCQ SUBMISSION AND RESULTS
-----------------------------------------------------
*/

    mcqAnswers: {
      type: [
        {
          questionIndex: {
            type: Number,
            required: true,
            min: 0,
          },

          // One-based option number: 1, 2, 3, 4...
          selectedOptionIndex: {
            type: Number,
            required: true,
            min: 1,
            validate: {
              validator(value) {
                return Number.isInteger(value);
              },
              message: "Selected option number must be an integer.",
            },
          },

          isCorrect: {
            type: Boolean,
            required: true,
          },
        },
      ],
      default: [],
    },

    mcqScore: {
      type: Number,
      min: 0,
      default: null,
    },

    mcqTotalQuestions: {
      type: Number,
      min: 0,
      default: null,
    },

    /*
-----------------------------------------------------
FEEDBACK AND MANUAL MARKS
-----------------------------------------------------
*/

    feedback: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    marks: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*

# TASK ASSIGNMENT SCHEMA

*/

const taskAssignmentSchema = new mongoose.Schema(
  {
    /*
-----------------------------------------------------
ORIGINAL TEMPLATE REFERENCE
-----------------------------------------------------
*/

    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskTemplate",
      required: true,
    },

    /*
-----------------------------------------------------
SNAPSHOT OF TASK AT ASSIGNMENT TIME
-----------------------------------------------------
Editing the template later must not change an
assignment that students have already received.
-----------------------------------------------------
*/

    taskSnapshot: {
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
        default: "",
        maxlength: 10000,
      },

      category: {
        type: String,
        default: "General",
        maxlength: 100,
      },

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

      allowLateSubmission: {
        type: Boolean,
        default: false,
      },

      maxFiles: {
        type: Number,
        default: 1,
        min: 1,
        max: 10,
      },

      maxFileSizeMB: {
        type: Number,
        default: 10,
        min: 1,
        max: 100,
      },
    },

    /*
-----------------------------------------------------
TARGETING INFORMATION
-----------------------------------------------------
*/

    targetType: {
      type: String,
      required: true,
      enum: ["all", "batch", "selected_students", "individual"],
    },

    batch: {
      type: String,
      default: null,
      trim: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    /*
-----------------------------------------------------
ASSIGNED STUDENTS
-----------------------------------------------------
*/

    recipients: {
      type: [recipientSchema],
      required: true,
      validate: {
        validator(recipients) {
          return Array.isArray(recipients) && recipients.length > 0;
        },
        message: "An assignment must have at least one recipient.",
      },
    },

    /*
-----------------------------------------------------
DEADLINE AND SUBMISSION RULES
-----------------------------------------------------
*/

    dueDate: {
      type: Date,
      required: true,
    },

    allowLateSubmission: {
      type: Boolean,
      default: false,
    },

    /*
-----------------------------------------------------
ASSIGNMENT STATUS
-----------------------------------------------------
*/

    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*

# INDEXES

*/

// Helps retrieve assignments by template.
taskAssignmentSchema.index({
  template: 1,
  createdAt: -1,
});

// Helps retrieve active assignments by deadline.
taskAssignmentSchema.index({
  status: 1,
  dueDate: 1,
});

// Helps query a particular student's assignments.
taskAssignmentSchema.index({
  "recipients.student": 1,
  status: 1,
});

/*
# MODEL
*/

const TaskAssignment = mongoose.model("TaskAssignment", taskAssignmentSchema);

export default TaskAssignment;
