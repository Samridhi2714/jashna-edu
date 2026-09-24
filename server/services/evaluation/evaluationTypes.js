/* =========================================================
   JASHNA EVALUATION TYPES

   Common constants used by:
   - Weekly Challenge
   - AI Assessment
   - Voice Assessment

   Keeping these values centralized prevents spelling/
   naming differences across services.
========================================================= */


/* =========================================================
   EVALUATION MODES
========================================================= */

export const EVALUATION_MODES = {
  RULE_BASED: "rule_based",
  AI: "ai",
  HYBRID: "hybrid",
};


/* =========================================================
   CHALLENGE TYPES
========================================================= */

export const CHALLENGE_TYPES = {
  MCQ: "mcq",
  TEXT: "text",
};


/* =========================================================
   EVALUATION CATEGORIES
========================================================= */

export const EVALUATION_CATEGORIES = {
  VOCABULARY: "vocabulary",
  GRAMMAR: "grammar",
  SPEAKING: "speaking",
  INTERVIEW: "interview",
  PROFESSIONAL: "professional",
  PRONUNCIATION: "pronunciation",
  IDIOMS: "idioms",
  WRITING: "writing",
};


/* =========================================================
   EVALUATION STATUS
========================================================= */

export const EVALUATION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  FAILED: "failed",
};