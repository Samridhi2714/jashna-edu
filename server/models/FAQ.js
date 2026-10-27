import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "FAQ question is required."],
      trim: true,
      maxlength: [300, "Question cannot exceed 300 characters."],
    },

    answer: {
      type: String,
      required: [true, "FAQ answer is required."],
      trim: true,
      maxlength: [5000, "Answer cannot exceed 5000 characters."],
    },

    // Optional clickable link displayed below the answer.
    linkText: {
      type: String,
      trim: true,
      maxlength: [100, "Link text cannot exceed 100 characters."],
      default: "",
    },

    // Can point to a public page, such as /programs or /ielts.
    linkUrl: {
      type: String,
      trim: true,
      maxlength: [500, "Link URL cannot exceed 500 characters."],
      default: "",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative."],
    },
  },
  {
    timestamps: true,
  },
);

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;