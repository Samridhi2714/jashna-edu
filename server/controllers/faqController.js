import mongoose from "mongoose";
import FAQ from "../models/FAQ.js";

/* =========================================================
   VALIDATE FAQ DATA
========================================================= */

const validateFAQData = (data) => {
  const { question, answer, isPublished, order, linkText, linkUrl } = data;

  if (typeof question !== "string" || !question.trim()) {
    return "Please enter a question.";
  }

  if (question.trim().length > 300) {
    return "Question cannot exceed 300 characters.";
  }

  if (typeof answer !== "string" || !answer.trim()) {
    return "Please enter an answer.";
  }

  if (answer.trim().length > 5000) {
    return "Answer cannot exceed 5000 characters.";
  }

  if (
    isPublished !== undefined &&
    typeof isPublished !== "boolean"
  ) {
    return "Published status must be true or false.";
  }

  if (
    order !== undefined &&
    (!Number.isInteger(order) || order < 0)
  ) {
    return "Display order must be a non-negative integer.";
  }

  if (linkText !== undefined) {
    if (typeof linkText !== "string") {
      return "Link text must be a string.";
    }

    if (linkText.trim().length > 100) {
      return "Link text cannot exceed 100 characters.";
    }
  }

  if (linkUrl !== undefined) {
    if (typeof linkUrl !== "string") {
      return "Link URL must be a string.";
    }

    if (linkUrl.trim().length > 500) {
      return "Link URL cannot exceed 500 characters.";
    }

    const url = linkUrl.trim();

    if (
      url &&
      !url.startsWith("/") &&
      !/^https:\/\/[^\s]+$/i.test(url)
    ) {
      return "Link URL must be a website path or a valid HTTPS URL.";
    }

    // Allow only same-site paths, not protocol-relative URLs.
    if (url.startsWith("//")) {
      return "Protocol-relative URLs are not allowed.";
    }
  }

  return null;
};

/* =========================================================
   PUBLIC — GET PUBLISHED FAQs
   GET /api/faqs
========================================================= */

export const getPublishedFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({
      isPublished: true,
    })
      .sort({
        order: 1,
        createdAt: 1,
      })
      .select("question answer linkText linkUrl order")
      .lean();

    return res.status(200).json({
      success: true,
      count: faqs.length,
      faqs,
    });
  } catch (error) {
    console.error("GET PUBLISHED FAQs ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs.",
    });
  }
};

/* =========================================================
   ADMIN — GET ALL FAQs
   GET /api/faqs/admin/all
========================================================= */

export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find()
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: faqs.length,
      faqs,
    });
  } catch (error) {
    console.error("GET ALL FAQs ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs for administration.",
    });
  }
};

/* =========================================================
   ADMIN — CREATE FAQ
   POST /api/faqs
========================================================= */

export const createFAQ = async (req, res) => {
  try {
    const validationError = validateFAQData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const {
      question,
      answer,
      linkText,
      linkUrl,
      isPublished,
      order,
    } = req.body;

    // A link must have both a label and a destination.
    if (
      Boolean(linkText?.trim()) !== Boolean(linkUrl?.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide both link text and link URL, or leave both empty.",
      });
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      linkText: linkText?.trim() || "",
      linkUrl: linkUrl?.trim() || "",
      isPublished:
        isPublished !== undefined ? isPublished : true,
      order: order !== undefined ? order : 0,
    });

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully.",
      faq,
    });
  } catch (error) {
    console.error("CREATE FAQ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create FAQ.",
    });
  }
};

/* =========================================================
   ADMIN — UPDATE FAQ
   PUT /api/faqs/:id
========================================================= */

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID.",
      });
    }

    const validationError = validateFAQData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const {
      question,
      answer,
      linkText,
      linkUrl,
      isPublished,
      order,
    } = req.body;

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    // Preserve existing fields when omitted from a partial update.
    const nextLinkText =
      linkText !== undefined ? linkText.trim() : faq.linkText;

    const nextLinkUrl =
      linkUrl !== undefined ? linkUrl.trim() : faq.linkUrl;

    if (
      Boolean(nextLinkText) !== Boolean(nextLinkUrl)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide both link text and link URL, or leave both empty.",
      });
    }

    faq.question = question.trim();
    faq.answer = answer.trim();
    faq.linkText = nextLinkText;
    faq.linkUrl = nextLinkUrl;

    if (isPublished !== undefined) {
      faq.isPublished = isPublished;
    }

    if (order !== undefined) {
      faq.order = order;
    }

    await faq.save();

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully.",
      faq,
    });
  } catch (error) {
    console.error("UPDATE FAQ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ.",
    });
  }
};

/* =========================================================
   ADMIN — DELETE FAQ
   DELETE /api/faqs/:id
========================================================= */

export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID.",
      });
    }

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    await FAQ.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE FAQ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ.",
    });
  }
};