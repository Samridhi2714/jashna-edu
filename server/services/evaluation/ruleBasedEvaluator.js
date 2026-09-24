/* =========================================================
   JASHNA RULE-BASED EVALUATOR

   Handles deterministic evaluation.

   Current support:
   - MCQ
   - basic text submission validation

   Important:
   This file should NOT call any AI provider.
========================================================= */

import {
  normalizeEvaluationResult,
} from "./evaluationNormalizer.js";


/* =========================================================
   HELPERS
========================================================= */

const getCategoryName = (challenge) => {
  return (
    challenge?.evaluationCategory ||
    challenge?.label?.toLowerCase() ||
    "this topic"
  );
};


/* =========================================================
   MCQ EVALUATION
========================================================= */

export const evaluateMcq = (
  challenge,
  answer,
) => {
  const submittedAnswer = Number(answer);

  const isCorrect =
    Number.isInteger(submittedAnswer) &&
    submittedAnswer === challenge.correct;


  /* -------------------------------------------------------
     CORRECT
  ------------------------------------------------------- */

  if (isCorrect) {
    const feedback =
      challenge?.feedback?.correct ||
      "Correct answer. Well done!";

    return normalizeEvaluationResult({
      score: 100,

      isCorrect: true,

      feedback,

      strengths: [
        "You selected the correct answer.",
      ],

      areasToImprove: [],

      suggestions: [
        "Keep practising to strengthen your understanding.",
      ],
    });
  }


  /* -------------------------------------------------------
     INCORRECT
  ------------------------------------------------------- */

  const feedback =
    challenge?.feedback?.incorrect ||
    "Not quite. Review the concept and try again.";

  return normalizeEvaluationResult({
    score: 0,

    isCorrect: false,

    feedback,

    strengths: [],

    areasToImprove: [
      getCategoryName(challenge),
    ],

    suggestions: [
      "Review the concept behind this question.",
      "Try a similar question again to reinforce your learning.",
    ],
  });
};


/* =========================================================
   BASIC TEXT VALIDATION
========================================================= */

/*
 * IMPORTANT:
 *
 * This is NOT a language-quality evaluator.
 *
 * We deliberately do not pretend that word count alone
 * can determine grammar, vocabulary, clarity, fluency,
 * etc.
 *
 * Actual language evaluation will be handled by the AI
 * evaluator later.
 */

export const evaluateTextBaseline = (
  challenge,
  answer,
) => {
  const normalizedAnswer =
    answer === null ||
    answer === undefined
      ? ""
      : String(answer).trim();


  /* -------------------------------------------------------
     EMPTY RESPONSE
  ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     RESPONSE EXISTS
  ------------------------------------------------------- */

  return normalizeEvaluationResult({
    /*
     * Temporary score.
     *
     * This is only a submission acknowledgement.
     * AI evaluation will replace this later.
     */

    score: 50,

    isCorrect: true,

    feedback:
      challenge?.feedback?.correct ||
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
   RULE-BASED MAIN EVALUATOR
========================================================= */

export const evaluateRuleBased = ({
  challenge,
  answer,
}) => {
  if (!challenge) {
    throw new Error(
      "Challenge is required for rule-based evaluation.",
    );
  }


  /* -------------------------------------------------------
     MCQ
  ------------------------------------------------------- */

  if (challenge.type === "mcq") {
    return evaluateMcq(
      challenge,
      answer,
    );
  }


  /* -------------------------------------------------------
     TEXT
  ------------------------------------------------------- */

  if (challenge.type === "text") {
    return evaluateTextBaseline(
      challenge,
      answer,
    );
  }


  /* -------------------------------------------------------
     UNKNOWN TYPE
  ------------------------------------------------------- */

  throw new Error(
    `Unsupported challenge type: ${challenge.type}`,
  );
};


export default {
  evaluateRuleBased,
  evaluateMcq,
  evaluateTextBaseline,
};