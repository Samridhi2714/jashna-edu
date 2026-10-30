import mongoose from "mongoose";

/*
=========================================================
PRIVACY POLICY MODEL

The policy is stored as an ordered list of sections.
Each section has a title and an ordered list of blocks:

  kind: "paragraph"  -> uses `text`
  kind: "subheading" -> uses `text`
  kind: "bullets"    -> uses `items`

Section numbers (1., 2., 3. ...) are added by the website
when it renders, so admins can reorder sections freely.
=========================================================
*/

const blockSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["paragraph", "subheading", "bullets"],
      required: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    items: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    blocks: {
      type: [blockSchema],
      default: [],
    },
  },
  { _id: false }
);

const privacyPolicySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "main",
      immutable: true,
    },

    sections: {
      type: [sectionSchema],
      default: [],
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacyPolicySchema);

export default PrivacyPolicy;