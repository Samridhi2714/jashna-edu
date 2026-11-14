import mongoose from "mongoose";
import TaskTemplate from "../models/TaskTemplate.js";
import { pipeline } from "node:stream/promises";
import TaskAssignment from "../models/TaskAssignment.js";
import { getFileStream } from "../services/driveService.js";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
/*
=========================================================
ALLOWED SUBMISSION TYPES
=========================================================
*/

const SUBMISSION_TYPES = [
  "text",
  "video",
  "image",
  "document",
  "audio",
  "text_file",
  "multiple_files",
  "mcq",
];

/*
=========================================================
HELPER: VALIDATE MONGODB ID
=========================================================
*/

const isValidId = (id) => {
  return mongoose.isValidObjectId(id);
};
/*
=========================================================
HELPER: VALIDATE MCQ QUESTIONS

correctOptionIndex uses one-based indexing:
1 = first option, 2 = second option, etc.
=========================================================
*/

const validateMcqQuestions = (questions) => {
  const errors = [];

  if (!Array.isArray(questions) || questions.length === 0) {
    return ["An MCQ task must contain at least one question."];
  }

  if (questions.length > 100) {
    return ["An MCQ task cannot contain more than 100 questions."];
  }

  questions.forEach((question, questionIndex) => {
    const label = `Question ${questionIndex + 1}`;

    if (
      typeof question?.questionText !== "string" ||
      !question.questionText.trim()
    ) {
      errors.push(`${label}: question text is required.`);
    } else if (question.questionText.trim().length > 2000) {
      errors.push(`${label}: question text cannot exceed 2000 characters.`);
    }

    if (
      !Array.isArray(question?.options) ||
      question.options.length < 2 ||
      question.options.length > 10
    ) {
      errors.push(`${label}: provide between 2 and 10 options.`);
    } else {
      question.options.forEach((option, optionIndex) => {
        if (
          typeof option !== "string" ||
          !option.trim() ||
          option.trim().length > 1000
        ) {
          errors.push(
            `${label}: option ${optionIndex + 1} must contain valid text.`,
          );
        }
      });
    }

    const correctOptionIndex = Number(question?.correctOptionIndex);

    if (
      !Number.isInteger(correctOptionIndex) ||
      !Array.isArray(question?.options) ||
      correctOptionIndex < 1 ||
      correctOptionIndex > question.options.length
    ) {
      errors.push(
        `${label}: select a valid correct option number.`,
      );
    }
  });

  return errors;
};
/*
=========================================================
HELPER: VALIDATE TASK DATA
=========================================================
*/

const validateTaskData = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.title !== undefined) {
    if (typeof data.title !== "string" || !data.title.trim()) {
      errors.push("Task title is required.");
    } else if (data.title.trim().length > 150) {
      errors.push("Task title cannot exceed 150 characters.");
    }
  }

  if (!isUpdate || data.description !== undefined) {
    if (typeof data.description !== "string" || !data.description.trim()) {
      errors.push("Task description is required.");
    } else if (data.description.trim().length > 5000) {
      errors.push("Task description cannot exceed 5000 characters.");
    }
  }

  if (
    data.instructions !== undefined &&
    (typeof data.instructions !== "string" || data.instructions.length > 10000)
  ) {
    errors.push(
      "Instructions must be text and cannot exceed 10000 characters.",
    );
  }

  if (
    data.category !== undefined &&
    (typeof data.category !== "string" || data.category.trim().length > 100)
  ) {
    errors.push("Category must be text and cannot exceed 100 characters.");
  }

  if (
    (!isUpdate || data.submissionType !== undefined) &&
    !SUBMISSION_TYPES.includes(data.submissionType)
  ) {
    errors.push("Please select a valid submission type.");
  }

  if (
    data.allowLateSubmission !== undefined &&
    typeof data.allowLateSubmission !== "boolean"
  ) {
    errors.push("allowLateSubmission must be true or false.");
  }

  if (data.maxFiles !== undefined) {
    if (
      !Number.isInteger(data.maxFiles) ||
      data.maxFiles < 1 ||
      data.maxFiles > 10
    ) {
      errors.push("Maximum files must be between 1 and 10.");
    }
  }

  if (data.maxFileSizeMB !== undefined) {
    if (
      typeof data.maxFileSizeMB !== "number" ||
      !Number.isFinite(data.maxFileSizeMB) ||
      data.maxFileSizeMB < 1 ||
      data.maxFileSizeMB > 100
    ) {
      errors.push("Maximum file size must be between 1 and 100 MB.");
    }
  }
  if (
    data.submissionType === "mcq" &&
    (!isUpdate || data.questions !== undefined)
  ) {
    errors.push(...validateMcqQuestions(data.questions));
  }

  if (
    data.submissionType !== undefined &&
    data.submissionType !== "mcq" &&
    data.questions !== undefined &&
    data.questions.length > 0
  ) {
    errors.push("Questions can only be provided for MCQ tasks.");
  }
  return errors;
};

/*
=========================================================
HELPER: SYNC SUBMISSION FORMAT TO ASSIGNMENTS

When an admin edits a template's submission format
(type, MCQ questions, file limits), assignments that
were already created from that template keep an old
copy (taskSnapshot), so students would still see the
old format.

Rule:
- The snapshot of EVERY active assignment of this
  template is updated to the new format.
- If the submission type or the MCQ questions actually
  changed, students who already submitted are reset to
  "assigned" (old submission data, feedback and marks
  are cleared) so they see the new format and can
  submit again.
- If only file limits changed (maxFiles / maxFileSizeMB),
  snapshots are updated but nobody is reset.

Only the format-related snapshot fields are synced.
Title, description, instructions, deadline and
recipients list are not changed.
=========================================================
*/

const SUBMITTED_STATUSES = ["submitted", "late_submitted", "reviewed"];

const serializeQuestions = (questions) =>
  JSON.stringify(
    (questions || []).map((question) => ({
      text: question.questionText,
      options: Array.from(question.options || []),
      correct: Number(question.correctOptionIndex),
    })),
  );

const syncTemplateFormatToAssignments = async (task) => {
  const assignments = await TaskAssignment.find({
    template: task._id,
    status: "active",
  });

  const newType = task.submissionType;

  const newQuestions =
    newType === "mcq"
      ? (task.questions || []).map((question) => ({
          questionText: question.questionText,
          options: Array.from(question.options),
          correctOptionIndex: question.correctOptionIndex,
        }))
      : [];

  let syncedCount = 0;
  let resetCount = 0;

  for (const assignment of assignments) {
    const oldType = assignment.taskSnapshot.submissionType;

    const formatChanged =
      oldType !== newType ||
      serializeQuestions(assignment.taskSnapshot.questions) !==
        serializeQuestions(newQuestions);

    assignment.taskSnapshot.submissionType = newType;
    assignment.taskSnapshot.questions = newQuestions;
    assignment.taskSnapshot.maxFiles = task.maxFiles ?? 1;
    assignment.taskSnapshot.maxFileSizeMB = task.maxFileSizeMB ?? 10;

    if (formatChanged) {
      for (const recipient of assignment.recipients || []) {
        if (!SUBMITTED_STATUSES.includes(recipient.status)) continue;

        recipient.status = "assigned";
        recipient.submittedAt = null;
        recipient.reviewedAt = null;
        recipient.submissionText = "";
        recipient.submissionFiles = [];
        recipient.mcqAnswers = [];
        recipient.mcqScore = null;
        recipient.mcqTotalQuestions = null;
        recipient.feedback = "";
        recipient.marks = null;

        resetCount += 1;
      }
    }

    await assignment.save();

    syncedCount += 1;
  }

  return { syncedCount, resetCount };
};

/*
=========================================================
CREATE TASK TEMPLATE

POST /api/tasks/templates
=========================================================
*/

export const createTaskTemplate = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions = "",
      category = "General",
      submissionType,
      allowLateSubmission = false,
      maxFiles = 1,
      maxFileSizeMB = 10,
      questions = [],
    } = req.body;

    const errors = validateTaskData(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Please correct the task details.",
        errors,
      });
    }

    const task = await TaskTemplate.create({
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      category: category.trim() || "General",
      submissionType,
      allowLateSubmission,
      maxFiles,
      maxFileSizeMB,
      questions:
  submissionType === "mcq"
    ? questions.map((question) => ({
        questionText: question.questionText.trim(),
        options: question.options.map((option) => option.trim()),
        correctOptionIndex: Number(question.correctOptionIndex),
      }))
    : [],
      createdBy: req.admin?.username || req.admin?.email || "admin",
    });

    return res.status(201).json({
      message: "Task template created successfully.",
      task,
    });
  } catch (error) {
    console.error("Create task template error:", error);

    return res.status(500).json({
      message: "Unable to create task template.",
    });
  }
};

/*
=========================================================
GET TASK TEMPLATES

GET /api/tasks/templates
GET /api/tasks/templates?includeArchived=true
=========================================================
*/

export const getTaskTemplates = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "true";

    const filter = includeArchived ? {} : { isArchived: false };

    const tasks = await TaskTemplate.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get task templates error:", error);

    return res.status(500).json({
      message: "Unable to fetch task templates.",
    });
  }
};

/*
=========================================================
UPDATE TASK TEMPLATE

PATCH /api/tasks/templates/:id

If the submission format changes, assignments that
nobody has submitted yet are synced to the new format.
=========================================================
*/

export const updateTaskTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid task template ID.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "instructions",
      "category",
      "submissionType",
      "allowLateSubmission",
      "maxFiles",
      "maxFileSizeMB",
      "questions",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid task fields were provided.",
      });
    }

    const errors = validateTaskData(updates, true);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Please correct the task details.",
        errors,
      });
    }

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      updates.description = updates.description.trim();
    }

    if (updates.instructions !== undefined) {
      updates.instructions = updates.instructions.trim();
    }

    if (updates.category !== undefined) {
      updates.category = updates.category.trim() || "General";
    }

    const task = await TaskTemplate.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task template not found.",
      });
    }

    if (task.isArchived) {
      return res.status(400).json({
        message: "This task template is archived. Restore it before editing.",
      });
    }
        if (updates.questions !== undefined) {
      if (updates.submissionType === "mcq" || task.submissionType === "mcq") {
        updates.questions = updates.questions.map((question) => ({
          questionText: question.questionText.trim(),
          options: question.options.map((option) => option.trim()),
          correctOptionIndex: Number(question.correctOptionIndex),
        }));
      }
    }

    if (
      updates.submissionType &&
      updates.submissionType !== "mcq"
    ) {
      updates.questions = [];
    }
    Object.assign(task, updates);

    await task.save();

    /*
    -----------------------------------------------------
    SYNC NEW FORMAT TO ALREADY-ASSIGNED TASKS
    -----------------------------------------------------
    A sync failure must never fail the template update,
    so it is wrapped in its own try/catch.
    -----------------------------------------------------
    */

    let syncResult = { syncedCount: 0, resetCount: 0 };

    const formatFields = [
      "submissionType",
      "questions",
      "maxFiles",
      "maxFileSizeMB",
    ];

    const formatChanged = formatFields.some(
      (field) => updates[field] !== undefined,
    );

    if (formatChanged) {
      try {
        syncResult = await syncTemplateFormatToAssignments(task);
      } catch (syncError) {
        console.error("Sync template format error:", syncError);
      }
    }

    return res.status(200).json({
      message: "Task template updated successfully.",
      task,
      syncedAssignments: syncResult.syncedCount,
      resetSubmissions: syncResult.resetCount,
    });
  } catch (error) {
    console.error("Update task template error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid task details.",
      });
    }

    return res.status(500).json({
      message: "Unable to update task template.",
    });
  }
};

/*
=========================================================
ARCHIVE OR RESTORE TASK TEMPLATE

PATCH /api/tasks/templates/:id/archive
PATCH /api/tasks/templates/:id/restore
=========================================================
*/

const setTaskArchiveStatus = async (req, res, isArchived) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid task template ID.",
      });
    }

    const task = await TaskTemplate.findByIdAndUpdate(
      id,
      { $set: { isArchived } },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task template not found.",
      });
    }

    return res.status(200).json({
      message: isArchived
        ? "Task template archived successfully."
        : "Task template restored successfully.",
      task,
    });
  } catch (error) {
    console.error("Change task archive status error:", error);

    return res.status(500).json({
      message: "Unable to update task archive status.",
    });
  }
};

export const archiveTaskTemplate = async (req, res) => {
  return setTaskArchiveStatus(req, res, true);
};

export const restoreTaskTemplate = async (req, res) => {
  return setTaskArchiveStatus(req, res, false);
};
/*
=========================================================
GET ASSIGNMENT OPTIONS

GET /api/tasks/assignment-options

Returns:
1. Available batches
2. Eligible students
3. Student information needed by the assignment form

Only active, ongoing students are eligible for new tasks.
=========================================================
*/

export const getAssignmentOptions = async (req, res) => {
  try {
    // 1. Fetch active, ongoing students eligible for new assignments
    const students = await Student.find({
      isActive: true,
      enrollmentStatus: "ongoing",
    })
      .select(
        "_id name username batch batchId joiningDate courseEndDate enrollmentStatus isActive",
      )
      .sort({ batch: 1, name: 1 })
      .lean();

    // 2. Keep the existing batch-name list for backward compatibility
    const batches = [
      ...new Set(
        students.map((student) => student.batch?.trim()).filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));

    // 3. Fetch active batches configured in Batch Management
    const managedBatches = await Batch.find({
      isActive: true,
    })
      .select("_id timing normalizedTiming description isActive")
      .sort({ timing: 1 })
      .lean();

    // 4. Return both the existing batch names and managed batch records
    return res.status(200).json({
      message: "Assignment options fetched successfully.",
      batches,
      managedBatches,
      students,
      count: students.length,
    });
  } catch (error) {
    console.error("Get assignment options error:", error);

    return res.status(500).json({
      message: "Unable to fetch assignment options.",
    });
  }
};

/*
    =========================================================
    CREATE TASK ASSIGNMENT

    POST /api/tasks/assignments

    Supported targets:
    1. all
    2. batch
    3. selected_students
    4. individual
    =========================================================
    */

export const createTaskAssignment = async (req, res) => {
  try {
    const {
      templateId,
      targetType,
      batch,
      studentIds,
      dueDate,
      allowLateSubmission,
    } = req.body;

    /*
    -----------------------------------------------------
    1. VALIDATE TASK TEMPLATE ID
    -----------------------------------------------------
    */

    if (!templateId || !mongoose.isValidObjectId(templateId)) {
      return res.status(400).json({
        message: "Please select a valid task template.",
      });
    }

    /*
    -----------------------------------------------------
    2. VALIDATE TARGET TYPE
    -----------------------------------------------------
    */

    const allowedTargetTypes = [
      "all",
      "batch",
      "selected_students",
      "individual",
    ];

    if (!allowedTargetTypes.includes(targetType)) {
      return res.status(400).json({
        message: "Please select a valid assignment target.",
      });
    }

    /*
    -----------------------------------------------------
    3. VALIDATE DEADLINE
    -----------------------------------------------------
    */

    if (!dueDate) {
      return res.status(400).json({
        message: "Submission deadline is required.",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid submission deadline.",
      });
    }

    if (parsedDueDate <= new Date()) {
      return res.status(400).json({
        message: "Submission deadline must be in the future.",
      });
    }

    /*
    -----------------------------------------------------
    4. VALIDATE LATE SUBMISSION SETTING
    -----------------------------------------------------
    */

    if (
      allowLateSubmission !== undefined &&
      typeof allowLateSubmission !== "boolean"
    ) {
      return res.status(400).json({
        message: "allowLateSubmission must be true or false.",
      });
    }

    /*
    -----------------------------------------------------
    5. FETCH TASK TEMPLATE
    -----------------------------------------------------
    */

    const template = await TaskTemplate.findById(templateId).lean();

    if (!template) {
      return res.status(404).json({
        message: "Task template not found.",
      });
    }

    if (template.isArchived) {
      return res.status(400).json({
        message: "Archived task templates cannot be assigned.",
      });
    }

    /*
    -----------------------------------------------------
    6. DETERMINE ELIGIBLE STUDENTS
    -----------------------------------------------------

    Only active, ongoing students can receive new
    assignments.

    Existing assignments will remain untouched.
    -----------------------------------------------------
    */

    const eligibleFilter = {
      isActive: true,
      enrollmentStatus: "ongoing",
    };

    let selectedStudents = [];
    let assignmentBatch = null;

    /*
    -----------------------------------------------------
    7. SELECT STUDENTS ACCORDING TO TARGET TYPE
    -----------------------------------------------------
    */

    if (targetType === "all") {
      selectedStudents = await Student.find(eligibleFilter)
        .select("_id name username batch")
        .lean();
    } else if (targetType === "batch") {
      if (typeof batch !== "string" || !batch.trim()) {
        return res.status(400).json({
          message: "Please select a batch.",
        });
      }

      assignmentBatch = batch.trim();

      selectedStudents = await Student.find({
        ...eligibleFilter,
        batch: assignmentBatch,
      })
        .select("_id name username batch")
        .lean();
    } else if (
      targetType === "selected_students" ||
      targetType === "individual"
    ) {
      /*
      ---------------------------------------------------
      VALIDATE STUDENT IDS
      ---------------------------------------------------
      */

      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          message: "Please select at least one student.",
        });
      }

      if (targetType === "individual" && studentIds.length !== 1) {
        return res.status(400).json({
          message: "Please select exactly one student.",
        });
      }

      const hasInvalidId = studentIds.some(
        (id) => typeof id !== "string" || !mongoose.isValidObjectId(id),
      );

      if (hasInvalidId) {
        return res.status(400).json({
          message: "One or more student IDs are invalid.",
        });
      }

      /*
      ---------------------------------------------------
      REMOVE DUPLICATE IDS
      ---------------------------------------------------
      */

      const uniqueStudentIds = [
        ...new Set(studentIds.map((id) => id.toString())),
      ];

      if (uniqueStudentIds.length !== studentIds.length) {
        return res.status(400).json({
          message: "Duplicate student IDs are not allowed.",
        });
      }

      /*
      ---------------------------------------------------
      FETCH ONLY ELIGIBLE SELECTED STUDENTS
      ---------------------------------------------------
      */

      selectedStudents = await Student.find({
        ...eligibleFilter,
        _id: {
          $in: uniqueStudentIds,
        },
      })
        .select("_id name username batch")
        .lean();

      /*
      ---------------------------------------------------
      ENSURE EVERY SELECTED STUDENT IS ELIGIBLE
      ---------------------------------------------------
      */

      if (selectedStudents.length !== uniqueStudentIds.length) {
        return res.status(400).json({
          message:
            "One or more selected students are inactive or not eligible for new assignments.",
        });
      }
    }

    /*
    -----------------------------------------------------
    8. ENSURE RECIPIENTS EXIST
    -----------------------------------------------------
    */

    if (selectedStudents.length === 0) {
      return res.status(400).json({
        message: "No eligible students were found for this assignment.",
      });
    }

    /*
    -----------------------------------------------------
    9. PREPARE TASK SNAPSHOT
    -----------------------------------------------------

    The snapshot preserves the task details at the time
    of assignment, even if the original template changes.
    (Format changes are synced separately by
    updateTaskTemplate while nobody has submitted.)
    -----------------------------------------------------
    */

    const effectiveLateSubmission =
      allowLateSubmission === undefined
        ? Boolean(template.allowLateSubmission)
        : allowLateSubmission;

    const taskSnapshot = {
  title: template.title,
  description: template.description,
  instructions: template.instructions || "",
  category: template.category || "General",
  submissionType: template.submissionType,

  // Snapshot questions so later template edits do not alter
  // an assignment that students have already received.
  questions:
    template.submissionType === "mcq"
      ? (template.questions || []).map((question) => ({
          questionText: question.questionText,
          options: question.options,
          correctOptionIndex: question.correctOptionIndex,
        }))
      : [],

  allowLateSubmission: effectiveLateSubmission,

  maxFiles: template.maxFiles ?? 1,
  maxFileSizeMB: template.maxFileSizeMB ?? 10,
};

    /*
    -----------------------------------------------------
    10. PREPARE RECIPIENT RECORDS
    -----------------------------------------------------
    */

    const recipients = selectedStudents.map((student) => ({
      student: student._id,
      status: "assigned",
      assignedAt: new Date(),
    }));

    /*
    -----------------------------------------------------
    11. GET ADMIN ID
    -----------------------------------------------------

    Your existing task routes use the protect middleware.
    We use the authenticated admin ID when available.
    -----------------------------------------------------
    */

    const adminId = req.admin?._id || req.admin?.id;

    const assignedBy =
      adminId && mongoose.isValidObjectId(adminId) ? adminId : null;

    /*
    -----------------------------------------------------
    12. CREATE ASSIGNMENT
    -----------------------------------------------------
    */

    const assignment = await TaskAssignment.create({
      template: template._id,

      taskSnapshot,

      targetType,

      batch: assignmentBatch,

      recipients,

      dueDate: parsedDueDate,

      allowLateSubmission: effectiveLateSubmission,

      status: "active",

      assignedBy,
    });

    /*
    -----------------------------------------------------
    13. SEND RESPONSE
    -----------------------------------------------------
    */

    return res.status(201).json({
      message: "Task assigned successfully.",

      assignment: {
        _id: assignment._id,

        template: assignment.template,

        taskSnapshot: assignment.taskSnapshot,

        targetType: assignment.targetType,

        batch: assignment.batch,

        dueDate: assignment.dueDate,

        allowLateSubmission: assignment.allowLateSubmission,

        status: assignment.status,

        assignedBy: assignment.assignedBy,

        recipients: assignment.recipients,

        recipientCount: assignment.recipients.length,

        createdAt: assignment.createdAt,
      },
    });
  } catch (error) {
    console.error("Create task assignment error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid assignment details.",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    return res.status(500).json({
      message: "Unable to create task assignment.",
    });
  }
};
/*
=========================================================
GET TASK ASSIGNMENTS

GET /api/tasks/assignments

Returns assignments created by the admin,
including recipient details and submission statuses.
=========================================================
*/

export const getTaskAssignments = async (req, res) => {
  try {
    const assignments = await TaskAssignment.find()
      .populate("recipients.student", "name username batch")
      .sort({ createdAt: -1 })
      .lean();

    const formattedAssignments = assignments.map((assignment) => {
      const recipients = assignment.recipients || [];

      const submittedCount = recipients.filter(
        (recipient) =>
          recipient.status === "submitted" ||
          recipient.status === "late_submitted" ||
          recipient.status === "reviewed",
      ).length;

      const reviewedCount = recipients.filter(
        (recipient) => recipient.status === "reviewed",
      ).length;

      const overdueCount = recipients.filter(
        (recipient) => recipient.status === "overdue",
      ).length;

      return {
        ...assignment,

        recipientCount: recipients.length,

        submittedCount,

        pendingCount: recipients.filter(
          (recipient) => recipient.status === "assigned",
        ).length,

        reviewedCount,

        overdueCount,
      };
    });

    return res.status(200).json({
      message: "Task assignments fetched successfully.",
      count: formattedAssignments.length,
      assignments: formattedAssignments,
    });
  } catch (error) {
    console.error("Get task assignments error:", error);

    return res.status(500).json({
      message: "Unable to fetch task assignments.",
    });
  }
};
/*=======
GET ALL SUBMISSIONS FOR ADMIN

GET /api/tasks/submissions

Admins can see MCQ answers and correct answers.
This endpoint must remain protected by admin auth.
=========================================================
*/

export const getTaskSubmissions = async (req, res) => {
  try {
    const assignments = await TaskAssignment.find({
      status: "active",
    })
      .populate("recipients.student", "name username batch")
      .sort({ createdAt: -1 })
      .lean();

    const submissions = assignments.map((assignment) => {
      const questions = assignment.taskSnapshot?.questions || [];

      return {
        assignmentId: assignment._id,
        title: assignment.taskSnapshot?.title || "Untitled task",
        submissionType:
          assignment.taskSnapshot?.submissionType || "text",
        dueDate: assignment.dueDate,
        allowLateSubmission: assignment.allowLateSubmission,

        // Correct answers are included only in the admin response.
        questions:
          assignment.taskSnapshot?.submissionType === "mcq"
            ? questions.map((question, questionIndex) => ({
                questionIndex,
                questionText: question.questionText,
                options: question.options,
                correctOptionIndex: question.correctOptionIndex,
                correctAnswer:
                  question.options[
                    Number(question.correctOptionIndex) - 1
                  ] || "",
              }))
            : [],

        recipients: (assignment.recipients || []).map((recipient) => {
          const answers = recipient.mcqAnswers || [];

          const mcqAnswers =
            assignment.taskSnapshot?.submissionType === "mcq"
              ? questions.map((question, questionIndex) => {
                  const savedAnswer = answers.find(
                    (answer) =>
                      Number(answer.questionIndex) === questionIndex,
                  );

                  const selectedOptionIndex =
                    savedAnswer?.selectedOptionIndex ?? null;

                  const correctOptionIndex =
                    Number(question.correctOptionIndex);

                  return {
                    questionIndex,
                    questionText: question.questionText,
                    options: question.options,

                    selectedOptionIndex,

                    selectedAnswer:
                      selectedOptionIndex !== null
                        ? question.options[
                            Number(selectedOptionIndex) - 1
                          ] || ""
                        : "",

                    correctOptionIndex,

                    correctAnswer:
                      question.options[correctOptionIndex - 1] || "",

                    isCorrect:
                      savedAnswer?.isCorrect ?? false,
                  };
                })
              : [];

          return {
            student: recipient.student,
            status: recipient.status,
            assignedAt: recipient.assignedAt,
            submittedAt: recipient.submittedAt,
            submissionText: recipient.submissionText || "",
            submissionFiles: recipient.submissionFiles || [],
            feedback: recipient.feedback || "",
            marks: recipient.marks ?? null,
            reviewedAt: recipient.reviewedAt,

            mcqScore: recipient.mcqScore ?? null,
            mcqTotalQuestions:
              recipient.mcqTotalQuestions ?? null,

            mcqAnswers,
          };
        }),
      };
    });

    return res.status(200).json({
      count: submissions.length,
      assignments: submissions,
    });
  } catch (error) {
    console.error("Get task submissions error:", error);

    return res.status(500).json({
      message: "Unable to fetch task submissions.",
    });
  }
};
/*
=========================================================
REVIEW A STUDENT SUBMISSION

PATCH /api/tasks/assignments/:assignmentId/recipients/:studentId/review
=========================================================
*/

export const reviewTaskSubmission =
  async (req, res) => {
    try {
      const { assignmentId, studentId } = req.params;
      const { feedback = "", marks = null } = req.body;
      if (
        !mongoose.isValidObjectId(assignmentId) ||
        !mongoose.isValidObjectId(studentId)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid assignment or student ID." });
      }
      if (typeof feedback !== "string" || feedback.length > 5000) {
        return res.status(400).json({
          message: "Feedback must be text and cannot exceed 5000 characters.",
        });
      }
      let parsedMarks = null;
      if (marks !== null && marks !== "") {
        parsedMarks = Number(marks);
        if (!Number.isFinite(parsedMarks) || parsedMarks < 0) {
          return res
            .status(400)
            .json({ message: "Marks must be a valid non-negative number." });
        }
      }
      const assignment = await TaskAssignment.findOne({
        _id: assignmentId,
        status: "active",
        "recipients.student": studentId,
      });
      if (!assignment) {
        return res
          .status(404)
          .json({ message: "Assignment or student recipient not found." });
      }
      const recipient = assignment.recipients.find(
        (item) => item.student.toString() === studentId,
      );
      if (
        !recipient ||
        !["submitted", "late_submitted", "reviewed"].includes(recipient.status)
      ) {
        return res
          .status(400)
          .json({ message: "This student has not submitted the task yet." });
      }
      recipient.feedback = feedback.trim();
      recipient.marks = parsedMarks;
      recipient.reviewedAt = new Date();
      recipient.status = "reviewed";
      await assignment.save();
      return res.status(200).json({
        message: "Submission reviewed successfully.",
        submission: {
          assignmentId: assignment._id,
          studentId,
          status: recipient.status,
          feedback: recipient.feedback,
          marks: recipient.marks,
          reviewedAt: recipient.reviewedAt,
        },
      });
    } catch (error) {
      console.error("Review task submission error:", error);
      return res
        .status(500)
        .json({ message: "Unable to review this submission." });
    }
  };
/*
=========================================================
VIEW / DOWNLOAD TASK SUBMISSION FILE

GET /api/tasks/assignments/:assignmentId/recipients/:studentId/files/:fileIndex/download

Supports:
- Default: Download the file
- ?view=true: Display supported files inline

Google Drive files remain private.
Only authenticated admins can access this endpoint.
=========================================================
*/

export const downloadTaskSubmissionFile = async (req, res) => {
  try {
    const { assignmentId, studentId, fileIndex } = req.params;

    // 1. Validate MongoDB IDs.
    if (
      !mongoose.isValidObjectId(assignmentId) ||
      !mongoose.isValidObjectId(studentId)
    ) {
      return res.status(400).json({
        message: "Invalid assignment or student ID.",
      });
    }

    // 2. Validate the file index.
    if (!/^\d+$/.test(fileIndex)) {
      return res.status(400).json({
        message: "Invalid submission file index.",
      });
    }

    const index = Number(fileIndex);

    if (!Number.isSafeInteger(index)) {
      return res.status(400).json({
        message: "Invalid submission file index.",
      });
    }

    // 3. Find the assignment containing this student.
    const assignment = await TaskAssignment.findOne({
      _id: assignmentId,
      "recipients.student": studentId,
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment or student submission not found.",
      });
    }

    // 4. Find the student's recipient record.
    const recipient = assignment.recipients.find(
      (item) => item.student.toString() === studentId,
    );

    if (!recipient) {
      return res.status(404).json({
        message: "Student submission not found.",
      });
    }

    // 5. Only retrieve a file recorded in this submission.
    const file = recipient.submissionFiles[index];

    if (!file) {
      return res.status(404).json({
        message: "Submission file not found.",
      });
    }

    // 6. Cloudinary files continue using their existing URLs.
    if (file.storageProvider !== "google_drive") {
      return res.status(400).json({
        message:
          "This file is not stored in Google Drive. Use its existing file link.",
      });
    }

    if (!file.driveFileId) {
      return res.status(404).json({
        message: "Google Drive file ID is missing.",
      });
    }

    // 7. Retrieve the private file from Google Drive.
    const driveResponse = await getFileStream(file.driveFileId);

    // 8. Sanitize the filename for the response headers.
    const safeFileName = (file.originalName || "submission-file")
    .replace(/[\u0000-\u001F\u007F]/g, "_")
    .replace(/[\\/"]/g, "_")
    .trim() || "submission-file";

    // 9. Decide whether the browser should preview or download.
    const shouldPreview = req.query.view === "true";

    const disposition = shouldPreview ? "inline" : "attachment";

    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");

    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${safeFileName}"`,
    );

    res.setHeader("Cache-Control", "private, no-store");

    // 10. Stream the file to the authenticated admin.
    await pipeline(driveResponse.data, res);
  } catch (error) {
    console.error("Download task submission file error:", error);

    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    const status = error?.response?.status;

    if (status === 404) {
      return res.status(404).json({
        message: "The file could not be found in Google Drive.",
      });
    }

    return res.status(500).json({
      message: "Unable to access the submission file.",
    });
  }
};