import Program from "../models/Program.js";
import cloudinary from "../config/cloudinary.js";

/* =========================================================
   HELPERS
========================================================= */

// Uploads a buffer to Cloudinary and stores it as WEBP (resized, max 1600px wide).
const uploadProgramImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "jashna-edu/programs",
        resource_type: "image",
        format: "webp",
        transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );

    stream.end(buffer);
  });

const destroyImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn("Could not delete old Cloudinary image:", error.message);
  }
};

// multipart/form-data sends everything as strings, so parse carefully.
const parseHighlights = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).slice(0, 3);
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parseHighlights(parsed);
  } catch {
    /* not JSON — treat as one highlight per line */
  }

  return value.split("\n").map((v) => v.trim()).filter(Boolean).slice(0, 3);
};

const pickFields = (body) => {
  const data = {};

  const strings = ["title", "shortTitle", "category", "goalId", "duration", "description", "audience", "status"];
  strings.forEach((key) => {
    if (body[key] !== undefined) data[key] = String(body[key]).trim();
  });

  if (body.highlights !== undefined) data.highlights = parseHighlights(body.highlights);

  if (body.fees !== undefined) {
    data.fees = body.fees === "" || body.fees === "null" ? null : Number(body.fees);
  }

  if (body.displayOrder !== undefined && body.displayOrder !== "") {
    data.displayOrder = Number(body.displayOrder);
  }

  if (body.imageAlt !== undefined) data["image.alt"] = String(body.imageAlt).trim();

  return data;
};

/*
  ENROLLMENT SAFEGUARD
  --------------------
  TODO: adjust the query below to match how your Student model stores enrollment.
  It currently checks a `program` / `programs` field on ../models/Student.js
  for either this program's _id or its title. If that model does not exist,
  it logs a warning and returns 0 (so deletes are NOT blocked) — fix this
  before relying on the safeguard.
*/
const countEnrollments = async (program) => {
  try {
    const { default: Student } = await import("../models/Student.js");

    return await Student.countDocuments({
      $or: [
        { program: program._id },
        { programs: program._id },
        { program: program.title },
        { programs: program.title },
      ],
    });
  } catch (error) {
    console.warn(
      "[programs] Enrollment check skipped — update countEnrollments():",
      error.message,
    );
    return 0;
  }
};

/* =========================================================
   PUBLIC
========================================================= */

// GET /api/programs  → only published, in display order
export const getPublicPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ status: "published" })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    res.json({ programs });
  } catch (error) {
    res.status(500).json({ message: "Could not load programs", error: error.message });
  }
};

/* =========================================================
   ADMIN
========================================================= */

// GET /api/programs/admin/all  → everything, including drafts
export const getAdminPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ displayOrder: 1, createdAt: 1 }).lean();

    const withCounts = await Promise.all(
      programs.map(async (p) => ({ ...p, enrolledCount: await countEnrollments(p) })),
    );

    res.json({ programs: withCounts });
  } catch (error) {
    res.status(500).json({ message: "Could not load programs", error: error.message });
  }
};

// POST /api/programs   (multipart: fields + optional `image`)
export const createProgram = async (req, res) => {
  try {
    const data = pickFields(req.body);

    if (data.displayOrder === undefined) {
      const last = await Program.findOne().sort({ displayOrder: -1 }).select("displayOrder").lean();
      data.displayOrder = last ? last.displayOrder + 1 : 0;
    }

    const alt = data["image.alt"];
    delete data["image.alt"];

    const program = new Program(data);

    if (req.file) {
      const result = await uploadProgramImage(req.file.buffer);
      program.image = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: alt || program.title,
      };
    }

    await program.save();

    res.status(201).json({ message: "Program created", program });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Create program error:", error);
    res.status(500).json({ message: "Could not create program", error: error.message });
  }
};

// PUT /api/programs/:id   (multipart: any fields + optional `image`, `removeImage=true`)
export const updateProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });

    const data = pickFields(req.body);
    const alt = data["image.alt"];
    delete data["image.alt"];

    program.set(data);

    let oldPublicId = "";

    if (req.file) {
      oldPublicId = program.image?.publicId;
      const result = await uploadProgramImage(req.file.buffer);
      program.image = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: alt || program.title,
      };
    } else if (req.body.removeImage === "true") {
      oldPublicId = program.image?.publicId;
      program.image = { url: "", publicId: "", alt: "" };
    } else if (alt !== undefined) {
      program.image.alt = alt;
    }

    await program.save();
    await destroyImage(oldPublicId); // only after the new data is safely saved

    res.json({ message: "Program updated", program });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Update program error:", error);
    res.status(500).json({ message: "Could not update program", error: error.message });
  }
};

// PATCH /api/programs/:id/status   body: { status: "published" | "draft" }
export const setProgramStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["published", "draft"].includes(status)) {
      return res.status(400).json({ message: 'status must be "published" or "draft"' });
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!program) return res.status(404).json({ message: "Program not found" });

    res.json({
      message: status === "published" ? "Program published" : "Program unpublished",
      program,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not change status", error: error.message });
  }
};

// PATCH /api/programs/reorder   body: { order: [id, id, id...] }  (full list, in new order)
export const reorderPrograms = async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: "order must be a non-empty array of ids" });
    }

    await Program.bulkWrite(
      order.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { displayOrder: index } },
      })),
    );

    res.json({ message: "Order saved" });
  } catch (error) {
    res.status(500).json({ message: "Could not save order", error: error.message });
  }
};

// DELETE /api/programs/:id  → blocked (409) if students are enrolled
export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });

    const enrolledCount = await countEnrollments(program);

    if (enrolledCount > 0) {
      return res.status(409).json({
        message: `${enrolledCount} student${enrolledCount === 1 ? " is" : "s are"} enrolled in this program. Unpublish it instead of deleting.`,
        enrolledCount,
      });
    }

    await program.deleteOne();
    await destroyImage(program.image?.publicId);

    res.json({ message: "Program deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete program", error: error.message });
  }
};