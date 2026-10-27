import mongoose from "mongoose";

import Student from "../models/Student.js";
import TaskAssignment from "../models/TaskAssignment.js";

import {
  getOrCreateFolder,
  uploadBuffer,
  deleteFile,
} from "../services/driveService.js";

/*
=========================================================
HELPERS
=========================================================
*/

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getRecipient = (assignment, studentId) => {
  return assignment.recipients.find(
    (recipient) => recipient.student.toString() === studentId.toString(),
  );
};

/*
=========================================================
HELPER: CHECK STUDENT ELIGIBILITY
=========================================================
*/

const getEligibleStudent = async (studentId) => {
  if (!isValidId(studentId)) {
    return null;
  }

  return Student.findOne({
    _id: studentId,
    isActive: true,
    enrollmentStatus: "ongoing",
  });
};

/*
=========================================================
HELPER: SANITIZE FILE NAME
=========================================================
*/

const sanitizeFileName = (fileName) => {
  const sanitized = String(fileName || "submission-file")
    .replace(/[\\/]/g, "_")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>:"|?*]/g, "_")
    .trim()
    .slice(0, 180);

  return sanitized || "submission-file";
};

/*
=========================================================
HELPER: SANITIZE GOOGLE DRIVE FOLDER NAME
=========================================================
*/

const sanitizeFolderName = (folderName) => {
  const sanitized = String(folderName || "Untitled")
    .replace(/[\\/]/g, "_")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>:"|?*]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .trim()
    .slice(0, 100);

  return sanitized || "Untitled";
};

/*
=========================================================
HELPER: GET MONTH FOLDER NAME
=========================================================
*/

const getSubmissionMonthFolderName = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

/*
=========================================================
HELPER: PREPARE GOOGLE DRIVE FOLDER
=========================================================
*/

const getStudentAssignmentFolder = async ({
  student,
  assignment,
  submittedAt,
}) => {
  const taskSubmissionsFolderId =
    await getOrCreateFolder("Task-Submissions");

  const monthFolderName =
    getSubmissionMonthFolderName(submittedAt);

  const monthFolderId = await getOrCreateFolder(
    monthFolderName,
    taskSubmissionsFolderId,
  );

  const studentName = sanitizeFolderName(student.name);

  const studentFolderName =
    `${studentName}_${student._id.toString()}`;

  const studentFolderId = await getOrCreateFolder(
    studentFolderName,
    monthFolderId,
  );

  const taskTitle = sanitizeFolderName(
    assignment.taskSnapshot?.title,
  );

  const assignmentFolderName =
    `${taskTitle}_${assignment._id.toString()}`;

  const assignmentFolderId = await getOrCreateFolder(
    assignmentFolderName,
    studentFolderId,
  );

  return assignmentFolderId;
};

/*
=========================================================
HELPER: CLEAN UP UPLOADED DRIVE FILES
=========================================================
*/

const cleanupDriveFiles = async (fileIds) => {
  const results = await Promise.allSettled(
    fileIds.map((fileId) => deleteFile(fileId)),
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        "Google Drive cleanup failed:",
        result.reason?.message || result.reason,
      );
    }
  });
};

/*
=========================================================
HELPER: PARSE MCQ ANSWERS
=========================================================
Supports either a JSON array or a JSON-stringified array.
=========================================================
*/

const parseMcqAnswers = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
};

/*
=========================================================
1. GET TASKS ASSIGNED TO LOGGED-IN STUDENT
=========================================================
*/

export const getStudentTasks = async (req, res) => {
  try {
    const student = await getEligibleStudent(req.student.id);

    if (!student) {
      return res.status(403).json({
        message: "Your student account is not currently eligible.",
      });
    }

    const now = new Date();

    const assignments = await TaskAssignment.find({
      "recipients.student": student._id,
      status: "active",
    }).sort({ dueDate: 1 });

    /*
    -----------------------------------------------------
    MARK PENDING TASKS OVERDUE
    -----------------------------------------------------
    */

    for (const assignment of assignments) {
      if (
        new Date(assignment.dueDate) < now &&
        !assignment.allowLateSubmission
      ) {
        const recipient = getRecipient(assignment, student._id);

        if (recipient && recipient.status === "assigned") {
          recipient.status = "overdue";
          await assignment.save();
        }
      }
    }

    /*
    -----------------------------------------------------
    FORMAT STUDENT TASKS

    IMPORTANT:
    Do not send correctOptionIndex to students.
    -----------------------------------------------------
    */

    const tasks = assignments.map((assignment) => {
      const recipient = getRecipient(assignment, student._id);

      if (!recipient) {
        return null;
      }

      const currentTime = new Date();

      const isPastDeadline =
        currentTime > new Date(assignment.dueDate);

      const submissionType =
        assignment.taskSnapshot.submissionType;

      const questions =
        submissionType === "mcq"
          ? (assignment.taskSnapshot.questions || []).map(
              (question) => ({
                questionText: question.questionText,
                options: question.options,
              }),
            )
          : [];

      return {
        assignmentId: assignment._id,

        title: assignment.taskSnapshot.title,
        description: assignment.taskSnapshot.description,
        instructions: assignment.taskSnapshot.instructions,
        category: assignment.taskSnapshot.category,

        submissionType,

        // MCQ questions are sent without their correct answers.
        questions,

        maxFiles: assignment.taskSnapshot.maxFiles,
        maxFileSizeMB: assignment.taskSnapshot.maxFileSizeMB,

        dueDate: assignment.dueDate,

        allowLateSubmission: assignment.allowLateSubmission,

        status: recipient.status,

        isPastDeadline,

        canSubmit:
          !["submitted", "late_submitted", "reviewed"].includes(
            recipient.status,
          ) &&
          (!isPastDeadline || assignment.allowLateSubmission),

        submissionText: recipient.submissionText || "",

        submissionFiles: recipient.submissionFiles || [],

        submittedAt: recipient.submittedAt,

        feedback: recipient.feedback || "",

        marks: recipient.marks,

        reviewedAt: recipient.reviewedAt,

        assignedAt: recipient.assignedAt,

        // The student can see their score after submitting.
        mcqScore: recipient.mcqScore ?? null,

        mcqTotalQuestions: recipient.mcqTotalQuestions ?? null,
      };
    });

    const validTasks = tasks.filter(Boolean);

    return res.status(200).json({
      count: validTasks.length,
      tasks: validTasks,
    });
  } catch (error) {
    console.error("Get student tasks error:", error);

    return res.status(500).json({
      message: "Failed to fetch your tasks.",
    });
  }
};

/*
=========================================================
2. SUBMIT A TASK

MCQ:
- Requires an answer to every question.
- Uses one-based option numbers.
- Calculates the score on the server.
- Does not upload anything to Google Drive.

Other submission types:
- Keep the existing Google Drive upload behaviour.
- Older Cloudinary submissions remain compatible.
=========================================================
*/

export const submitStudentTask = async (req, res) => {
  const uploadedDriveFileIds = [];

  let submissionSaved = false;

  try {
    /*
    -----------------------------------------------------
    VALIDATE STUDENT
    -----------------------------------------------------
    */

    const student = await getEligibleStudent(req.student.id);

    if (!student) {
      return res.status(403).json({
        message: "Your student account is not currently eligible.",
      });
    }

    const { assignmentId } = req.params;

    const { submissionText = "" } = req.body;

    if (!isValidId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid task assignment ID.",
      });
    }

    /*
    -----------------------------------------------------
    FIND ASSIGNMENT
    -----------------------------------------------------
    */

    const assignment = await TaskAssignment.findOne({
      _id: assignmentId,
      status: "active",
      "recipients.student": student._id,
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Task not found or not assigned to you.",
      });
    }

    const recipient = getRecipient(assignment, student._id);

    if (!recipient) {
      return res.status(404).json({
        message: "Your task assignment was not found.",
      });
    }

    /*
    -----------------------------------------------------
    PREVENT DUPLICATE SUBMISSIONS
    -----------------------------------------------------
    */

    if (
      ["submitted", "late_submitted", "reviewed"].includes(
        recipient.status,
      )
    ) {
      return res.status(400).json({
        message: "You have already submitted this task.",
      });
    }

    /*
    -----------------------------------------------------
    DEADLINE VALIDATION
    -----------------------------------------------------
    */

    const isLate = new Date() > new Date(assignment.dueDate);

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        message: "The submission deadline has passed.",
      });
    }

    /*
    -----------------------------------------------------
    VALIDATE SUBMISSION TYPE
    -----------------------------------------------------
    */

    const submissionType =
      assignment.taskSnapshot.submissionType;

    const files = req.files || [];

    const text = String(submissionText).trim();

    if (text.length > 50000) {
      return res.status(400).json({
        message: "Text submission cannot exceed 50,000 characters.",
      });
    }

    /*
    -----------------------------------------------------
    MCQ SUBMISSION
    -----------------------------------------------------
    */

    if (submissionType === "mcq") {
      const questions =
        assignment.taskSnapshot.questions || [];

      if (questions.length === 0) {
        return res.status(400).json({
          message: "This MCQ task has no questions configured.",
        });
      }

      if (files.length > 0 || text) {
        return res.status(400).json({
          message: "This task accepts MCQ answers only.",
        });
      }

      const parsedAnswers = parseMcqAnswers(
        req.body.mcqAnswers,
      );

      if (!parsedAnswers) {
        return res.status(400).json({
          message: "Please provide valid answers for all questions.",
        });
      }

      if (parsedAnswers.length !== questions.length) {
        return res.status(400).json({
          message: "Please answer all questions.",
        });
      }

      const answerByQuestion = new Map();

      for (const answer of parsedAnswers) {
        const questionIndex = Number(answer?.questionIndex);
        const selectedOptionIndex = Number(
          answer?.selectedOptionIndex,
        );

        if (
          !Number.isInteger(questionIndex) ||
          questionIndex < 0 ||
          questionIndex >= questions.length
        ) {
          return res.status(400).json({
            message: "One or more question answers are invalid.",
          });
        }

        if (answerByQuestion.has(questionIndex)) {
          return res.status(400).json({
            message: "Duplicate answers are not allowed.",
          });
        }

        const question = questions[questionIndex];

        if (
          !Number.isInteger(selectedOptionIndex) ||
          selectedOptionIndex < 1 ||
          selectedOptionIndex > question.options.length
        ) {
          return res.status(400).json({
            message: "Please select a valid option for every question.",
          });
        }

        answerByQuestion.set(questionIndex, selectedOptionIndex);
      }

      // Check every question individually, regardless of array order.
      for (
        let questionIndex = 0;
        questionIndex < questions.length;
        questionIndex += 1
      ) {
        if (!answerByQuestion.has(questionIndex)) {
          return res.status(400).json({
            message: "Please answer all questions.",
          });
        }
      }

      /*
      ---------------------------------------------------
      CALCULATE SCORE ON THE SERVER
      ---------------------------------------------------
      Option numbers are one-based: 1, 2, 3, 4.
      ---------------------------------------------------
      */

      let score = 0;

      const savedAnswers = questions.map(
        (question, questionIndex) => {
          const selectedOptionIndex =
            answerByQuestion.get(questionIndex);

          const isCorrect =
            selectedOptionIndex ===
            Number(question.correctOptionIndex);

          if (isCorrect) {
            score += 1;
          }

          return {
            questionIndex,
            selectedOptionIndex,
            isCorrect,
          };
        },
      );

      /*
      ---------------------------------------------------
      SAVE MCQ SUBMISSION
      ---------------------------------------------------
      */

      const submittedAt = new Date();

      recipient.mcqAnswers = savedAnswers;
      recipient.mcqScore = score;
      recipient.mcqTotalQuestions = questions.length;

      recipient.submissionText = "";
      recipient.submissionFiles = [];

      recipient.submittedAt = submittedAt;
      recipient.status = isLate ? "late_submitted" : "submitted";

      await assignment.save();

      submissionSaved = true;

      /*
      ---------------------------------------------------
      MCQ SUCCESS RESPONSE

      Do not include correct answers here.
      ---------------------------------------------------
      */

      return res.status(200).json({
        message: isLate
          ? "MCQ task submitted successfully after the deadline."
          : "MCQ task submitted successfully.",

        task: {
          assignmentId: assignment._id,
          title: assignment.taskSnapshot.title,
          submissionType: "mcq",
          status: recipient.status,
          submittedAt: recipient.submittedAt,
          mcqScore: score,
          mcqTotalQuestions: questions.length,
        },
      });
    }

    /*
    -----------------------------------------------------
    NON-MCQ SUBMISSION VALIDATION
    -----------------------------------------------------
    */

    const textOnly = submissionType === "text";

    if (textOnly && !text) {
      return res.status(400).json({
        message: "Please enter your answer before submitting.",
      });
    }

    if (textOnly && files.length > 0) {
      return res.status(400).json({
        message: "This task accepts text submissions only.",
      });
    }

    if (!textOnly && files.length === 0) {
      return res.status(400).json({
        message: "Please upload your file before submitting.",
      });
    }

    if (files.length > assignment.taskSnapshot.maxFiles) {
      return res.status(400).json({
        message: `You can upload a maximum of ${assignment.taskSnapshot.maxFiles} file(s).`,
      });
    }

    /*
    -----------------------------------------------------
    VALIDATE FILE SIZE
    -----------------------------------------------------
    */

    const maxBytes =
      assignment.taskSnapshot.maxFileSizeMB * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxBytes) {
        return res.status(400).json({
          message: `Each file must be ${assignment.taskSnapshot.maxFileSizeMB} MB or smaller.`,
        });
      }
    }

    /*
    -----------------------------------------------------
    VALIDATE FILE CATEGORY
    -----------------------------------------------------
    */

    const mimeGroups = {
      image: ["image/"],
      video: ["video/"],
      audio: ["audio/"],

      document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ],

      text_file: ["text/plain", "text/csv"],
    };

    if (mimeGroups[submissionType]) {
      const allowedTypes = mimeGroups[submissionType];

      const invalidFile = files.find((file) => {
        return !allowedTypes.some((type) =>
          type.endsWith("/")
            ? file.mimetype.startsWith(type)
            : file.mimetype === type,
        );
      });

      if (invalidFile) {
        return res.status(400).json({
          message: `This task only accepts ${submissionType} files.`,
        });
      }
    }

    /*
    -----------------------------------------------------
    PREPARE DRIVE FOLDER
    -----------------------------------------------------
    */

    const submittedAt = new Date();

    let assignmentFolderId = null;

    if (files.length > 0) {
      assignmentFolderId = await getStudentAssignmentFolder({
        student,
        assignment,
        submittedAt,
      });
    }

    /*
    -----------------------------------------------------
    UPLOAD FILES TO GOOGLE DRIVE
    -----------------------------------------------------
    */

    const uploadedFiles = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];

      const originalName = sanitizeFileName(file.originalname);

      const driveFileName = originalName;

      console.log("\n--- Google Drive Upload Diagnostic ---");
      console.log("Multer original filename:", file.originalname);
      console.log("Sanitized filename:", originalName);
      console.log("Filename passed to Drive:", driveFileName);
      console.log("Destination folder ID:", assignmentFolderId);

      const result = await uploadBuffer({
        buffer: file.buffer,
        fileName: driveFileName,
        mimeType: file.mimetype || "application/octet-stream",
        folderId: assignmentFolderId,
      });

      if (!result?.id) {
        throw new Error("Google Drive did not return a file ID.");
      }

      uploadedDriveFileIds.push(result.id);

      console.log("Filename returned by Google Drive:", result?.name);
      console.log("Google Drive file ID:", result?.id);
      console.log("--------------------------------------\n");

      uploadedFiles.push({
        originalName: file.originalname,
        url: "",
        publicId: "",
        resourceType: "auto",
        format: "",
        size: file.size,
        storageProvider: "google_drive",
        driveFileId: result.id,
        mimeType:
          result.mimeType ||
          file.mimetype ||
          "application/octet-stream",
      });
    }

    /*
    -----------------------------------------------------
    SAVE NON-MCQ SUBMISSION
    -----------------------------------------------------
    */

    recipient.submissionText = text;
    recipient.submissionFiles = uploadedFiles;

    recipient.submittedAt = submittedAt;

    recipient.status = isLate ? "late_submitted" : "submitted";

    await assignment.save();

    submissionSaved = true;

    /*
    -----------------------------------------------------
    SUCCESS RESPONSE
    -----------------------------------------------------
    */

    return res.status(200).json({
      message: isLate
        ? "Task submitted successfully after the deadline."
        : "Task submitted successfully.",

      task: {
        assignmentId: assignment._id,
        title: assignment.taskSnapshot.title,
        status: recipient.status,
        submittedAt: recipient.submittedAt,
        submissionText: recipient.submissionText,
        submissionFiles: recipient.submissionFiles,
      },
    });
  } catch (error) {
    console.error("Submit student task error:", error);

    /*
    -----------------------------------------------------
    CLEAN UP ORPHANED DRIVE FILES
    -----------------------------------------------------
    */

    if (!submissionSaved && uploadedDriveFileIds.length > 0) {
      await cleanupDriveFiles(uploadedDriveFileIds);
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message:
          "The submission could not be saved because its data is invalid.",
      });
    }

    return res.status(500).json({
      message: "Failed to submit task. Please try again.",
    });
  }
};