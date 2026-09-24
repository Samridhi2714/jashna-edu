/* =========================================================
   JASHNA EVALUATION ENGINE

   Single entry point for all evaluation.

   Used by:
   - Weekly Challenge
   - AI Assessment
   - Voice Assessment

   The route does NOT need to know whether evaluation
   is rule-based, AI, or hybrid.
========================================================= */

import {
  EVALUATION_MODES,
} from "./evaluationTypes.js";

import {
  evaluateRuleBased,
} from "./ruleBasedEvaluator.js";

import {
  evaluateWithAI,
} from "./aiEvaluator.js";


/* =========================================================
   GET EVALUATION MODE
========================================================= */

const getEvaluationMode = (challenge) => {
  if (!challenge) {
    throw new Error(
      "Challenge is required for evaluation.",
    );
  }

  /*
   * MCQs are always deterministic.
   */

  if (challenge.type === "mcq") {
    return EVALUATION_MODES.RULE_BASED;
  }


  /*
   * Text challenges use the configured mode.
   */

  return (
    challenge.evaluationMode ||
    EVALUATION_MODES.AI
  );
};


/* =========================================================
   MAIN EVALUATE FUNCTION
========================================================= */

export const evaluate = async ({
  challenge,
  answer,
}) => {
  if (!challenge) {
    throw new Error(
      "Challenge is required for evaluation.",
    );
  }


  const evaluationMode =
    getEvaluationMode(challenge);


  /* =======================================================
     RULE-BASED
  ======================================================= */

  if (
    evaluationMode ===
    EVALUATION_MODES.RULE_BASED
  ) {
    const result =
      evaluateRuleBased({
        challenge,
        answer,
      });

    return {
      evaluationMode,
      evaluationStatus: "completed",
      result,
    };
  }


  /* =======================================================
     AI
  ======================================================= */

  if (
    evaluationMode ===
    EVALUATION_MODES.AI
  ) {
    const result =
      await evaluateWithAI({
        challenge,
        answer,
      });

    return {
      evaluationMode,
      evaluationStatus: "completed",
      result,
    };
  }


  /* =======================================================
     HYBRID
  ======================================================= */

  if (
    evaluationMode ===
    EVALUATION_MODES.HYBRID
  ) {
    /*
     * Hybrid evaluation will eventually combine:
     *
     * Rule-based checks
     * +
     * AI analysis
     *
     * Example:
     *
     * MCQ correctness → rule-based
     * language quality → AI
     *
     * For now we use the rule-based evaluator as the
     * safe fallback.
     */

    const result =
      evaluateRuleBased({
        challenge,
        answer,
      });

    return {
      evaluationMode,
      evaluationStatus: "completed",
      result,
    };
  }


  /* =======================================================
     UNKNOWN MODE
  ======================================================= */

  throw new Error(
    `Unsupported evaluation mode: ${evaluationMode}`,
  );
};


export default {
  evaluate,
};