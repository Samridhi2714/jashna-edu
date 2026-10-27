import mongoose from "mongoose";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* Pick only the fields an admin is allowed to set on a job */
const pickJobFields = (body) => ({
  title: String(body.title || "").trim(),
  type: body.type,
  location: String(body.location || "").trim(),
  description: String(body.description || "").trim(),
  requirements: (Array.isArray(body.requirements) ? body.requirements : [])
    .map((item) => String(item).trim())
    .filter(Boolean),
});

const validateJobFields = (fields) => {
  if (!fields.title || !fields.location || !fields.description) {
    return "Title, location and description are required.";
  }
  if (!JOB_TYPES.includes(fields.type)) {
    return "Please choose a valid job type.";
  }
  return null;
};

/* GET /api/admin/careers/jobs */
export const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    const counts = await Application.aggregate([
      { $group: { _id: "$job", total: { $sum: 1 } } },
    ]);

    const countMap = Object.fromEntries(
      counts.map((item) => [String(item._id), item.total]),
    );

    res.json(
      jobs.map((job) => ({
        ...job,
        applicationsCount: countMap[String(job._id)] || 0,
      })),
    );
  } catch (error) {
    console.error("listJobs error:", error);
    res.status(500).json({ message: "Unable to load job postings." });
  }
};

/* POST /api/admin/careers/jobs */
export const createJob = async (req, res) => {
  try {
    const fields = pickJobFields(req.body);
    const validationError = validateJobFields(fields);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const job = await Job.create(fields);
    res.status(201).json(job);
  } catch (error) {
    console.error("createJob error:", error);
    res.status(500).json({ message: "Unable to create the job posting." });
  }
};

/* PUT /api/admin/careers/jobs/:id */
export const updateJob = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid job ID." });
    }

    const fields = pickJobFields(req.body);
    const validationError = validateJobFields(fields);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const job = await Job.findByIdAndUpdate(req.params.id, fields, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ message: "Job posting not found." });
    }

    res.json(job);
  } catch (error) {
    console.error("updateJob error:", error);
    res.status(500).json({ message: "Unable to update the job posting." });
  }
};

/* PATCH /api/admin/careers/jobs/:id/toggle  (Close / Reopen) */
export const toggleJob = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid job ID." });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job posting not found." });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.json(job);
  } catch (error) {
    console.error("toggleJob error:", error);
    res.status(500).json({ message: "Unable to change the job status." });
  }
};

/* DELETE /api/admin/careers/jobs/:id  (add ?force=true to also remove applications) */
export const deleteJob = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid job ID." });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job posting not found." });
    }

    const applicationsCount = await Application.countDocuments({
      job: job._id,
    });

    if (applicationsCount > 0 && req.query.force !== "true") {
      return res.status(409).json({
        message: `This job has ${applicationsCount} application(s). Deleting it will also permanently remove them.`,
        applicationsCount,
      });
    }

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.json({ message: "Job posting deleted." });
  } catch (error) {
    console.error("deleteJob error:", error);
    res.status(500).json({ message: "Unable to delete the job posting." });
  }
};