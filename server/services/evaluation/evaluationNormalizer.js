/* =========================================================
   JASHNA EVALUATION NORMALIZER

   Every evaluator must eventually return the same shape.

   This allows the frontend to consume one consistent
   result structure regardless of whether the evaluation
   came from:
   - rule-based logic
   - AI
   - hybrid evaluation
   - future voice evaluation
========================================================= */


/* =========================================================
   SAFE STRING
========================================================= */

const normalizeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};


/* =========================================================
   STRING ARRAY
========================================================= */

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);
};


/* =========================================================
   SCORE
========================================================= */

const normalizeScore = (score) => {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, numericScore),
  );
};


/* =========================================================
   METRICS
========================================================= */

const normalizeMetrics = (metrics) => {
  if (!metrics || typeof metrics !== "object") {
    return {};
  }

  const normalized = {};

  Object.entries(metrics).forEach(
    ([key, value]) => {
      const numericValue = Number(value);

      if (
        Number.isFinite(numericValue) &&
        numericValue >= 0 &&
        numericValue <= 100
      ) {
        normalized[key] = numericValue;
      }
    },
  );

  return normalized;
};


/* =========================================================
   MAIN NORMALIZER
========================================================= */

export const normalizeEvaluationResult = ({
  score = 0,
  isCorrect = false,
  feedback = "",
  strengths = [],
  areasToImprove = [],
  suggestions = [],
  metrics = {},
} = {}) => {
  return {
    score: normalizeScore(score),

    isCorrect: Boolean(isCorrect),

    feedback: normalizeString(feedback),

    strengths:
      normalizeStringArray(strengths),

    areasToImprove:
      normalizeStringArray(areasToImprove),

    suggestions:
      normalizeStringArray(suggestions),

    metrics:
      normalizeMetrics(metrics),
  };
};


export default {
  normalizeEvaluationResult,
};