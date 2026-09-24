/* =========================================================
   JASHNA CHALLENGE EVALUATION SERVICE

   This service keeps evaluation logic separate from routes.

   Current support:
   - MCQ → rule-based
   - Text → safe baseline evaluation

   Future support:
   - AI evaluation
   - Hybrid evaluation
   - Voice evaluation

   The route should NOT need to know how evaluation works.
========================================================= */


/* =========================================================
   NORMALIZE RESULT

   Every evaluator returns the same structure.

   This is important because the frontend can later consume
   the same result format for:
   - Weekly Challenge
   - AI Assessment
   - Voice Assessment
========================================================= */

const normalizeEvaluationResult = ({
  score = 0,
  isCorrect = false,
  feedback = "",
  strengths = [],
  areasToImprove = [],
  suggestions = [],
}) => {
  return {
    score: Math.max(0, Math.min(100, Number(score) || 0)),

    isCorrect: Boolean(isCorrect),

    feedback:
      typeof feedback === "string"
        ? feedback.trim()
        : "",

    strengths: Array.isArray(strengths)
      ? strengths
          .filter(Boolean)
          .map((item) => String(item).trim())
      : [],

    areasToImprove: Array.isArray(areasToImprove)
      ? areasToImprove
          .filter(Boolean)
          .map((item) => String(item).trim())
      : [],

    suggestions: Array.isArray(suggestions)
      ? suggestions
          .filter(Boolean)
          .map((item) => String(item).trim())
      : [],
  };
};


/* =========================================================
   RULE-BASED MCQ EVALUATOR
========================================================= */

const evaluateMcq = (challenge, answer) => {
  const submittedAnswer = Number(answer);

  const isCorrect =
    Number.isInteger(submittedAnswer) &&
    submittedAnswer === challenge.correct;

  if (isCorrect) {
    return normalizeEvaluationResult({
      score: 100,

      isCorrect: true,

      feedback:
        "Correct answer. Well done!",

      strengths: [
        "You selected the correct answer.",
      ],

      areasToImprove: [],

      suggestions: [
        "Keep practising to strengthen your understanding.",
      ],
    });
  }

  return normalizeEvaluationResult({
    score: 0,

    isCorrect: false,

    feedback:
      "Not quite. Review the concept and try again.",

    strengths: [],

    areasToImprove: [
      challenge.evaluationCategory ||
        challenge.label?.toLowerCase() ||
        "this topic",
    ],

    suggestions: [
      "Review the concept behind this question.",
      "Try a similar question again to reinforce your learning.",
    ],
  });
};


/* =========================================================
   TEXT BASELINE EVALUATOR

   IMPORTANT:

   This is intentionally NOT pretending that text length
   equals language quality.

   Until an AI provider is connected, we only determine
   whether the learner actually submitted a response.

   This evaluator can later be replaced by AI without
   changing the route or frontend contract.
========================================================= */

const evaluateTextBaseline = (challenge, answer) => {
  const normalizedAnswer =
    answer === null || answer === undefined
      ? ""
      : String(answer).trim();

  if (!normalizedAnswer) {
    return normalizeEvaluationResult({
      score: 0,

      isCorrect: false,

      feedback:
        "Please provide a response so it can be evaluated.",

      strengths: [],

      areasToImprove: [
        "Response completion",
      ],

      suggestions: [
        "Write a complete response related to the task.",
      ],
    });
  }

  return normalizeEvaluationResult({
    score: 50,

    isCorrect: true,

    feedback:
      "Your response has been submitted successfully. Detailed language evaluation will be available when AI evaluation is enabled.",

    strengths: [
      "You completed the challenge.",
    ],

    areasToImprove: [],

    suggestions: [
      "Continue practising clear and natural English.",
      "Focus on grammar, vocabulary and sentence clarity.",
    ],
  });
};


/* =========================================================
   MAIN EVALUATOR
========================================================= */

export const evaluateChallenge = ({
  challenge,
  answer,
}) => {
  if (!challenge) {
    throw new Error(
      "Challenge is required for evaluation.",
    );
  }

  const evaluationMode =
    challenge.evaluationMode ||
    (challenge.type === "text"
      ? "ai"
      : "rule_based");


  /* -------------------------------------------------------
     MCQ
  ------------------------------------------------------- */

  if (challenge.type === "mcq") {
    return {
      evaluationMode: "rule_based",

      result: evaluateMcq(
        challenge,
        answer,
      ),
    };
  }


  /* -------------------------------------------------------
     TEXT
  ------------------------------------------------------- */

  if (challenge.type === "text") {

    /*
      AI / hybrid support will be connected here later.

      For now, use the safe baseline evaluator.

      We still return the requested evaluation mode so the
      database knows how this challenge is configured.
    */

    return {
      evaluationMode,

      result: evaluateTextBaseline(
        challenge,
        answer,
      ),
    };
  }


  /* -------------------------------------------------------
     UNKNOWN TYPE
  ------------------------------------------------------- */

  throw new Error(
    `Unsupported challenge type: ${challenge.type}`,
  );
};


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  evaluateChallenge,
};