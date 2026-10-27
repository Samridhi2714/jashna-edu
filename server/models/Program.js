import mongoose from "mongoose";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const programSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },

    // Stable URL-safe id. Generated once from the title, never changes on edit.
    slug: { type: String, unique: true, index: true },

    // Shown in the left list on the public page. Falls back to `title`.
    shortTitle: { type: String, trim: true, maxlength: 60, default: "" },

    // Free text so admin can add Class 10, Class 12, Spoken English, IELTS...
    category: { type: String, required: true, trim: true },

    // Optional: which "What are you working towards?" card this program belongs to.
    goalId: {
      type: String,
      enum: ["", "confidence", "career", "academic", "educator"],
      default: "",
    },

    duration: { type: String, trim: true, default: "" }, // e.g. "8 weeks"
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    highlights: { type: [String], default: [] }, // up to 3 shown on the page
    audience: { type: String, trim: true, default: "" }, // "Students • Professionals"
    fees: { type: Number, min: 0, default: null },

    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      alt: { type: String, default: "" },
    },

    // "draft" = temporarily unpublished (hidden from the public page, not deleted)
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },

    displayOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

programSchema.pre("validate", async function () {
  if (this.slug || !this.title) return;

  const base = slugify(this.title) || "program";
  let candidate = base;
  let n = 2;

  while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${base}-${n++}`;
  }

  this.slug = candidate;
});

export default mongoose.models.Program || mongoose.model("Program", programSchema);