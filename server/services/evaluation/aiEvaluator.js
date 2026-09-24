/* =========================================================
   JASHNA AI EVALUATOR

   Provider:
   - Groq

   Responsibility:
   - AI evaluation of text challenges
   - vocabulary analysis
   - grammar analysis
   - writing analysis
   - interview response analysis

   Future:
   - speaking analysis
   - voice assessment integration

   IMPORTANT:
   This file is the AI-provider boundary.
   Challenge routes should NOT know which AI provider
   is being used.
========================================================= */

import Groq from "groq-sdk";

import {
  normalizeEvaluationResult,
} from "./evaluationNormalizer.js";


/* =========================================================
   GROQ CLIENT
========================================================= */
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not configured.",
    );
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

const MODEL =
  process.env.GROQ_MODEL || "openai/gpt-oss-20b";


/* =========================================================
   AI EVALUATION
========================================================= */

export const evaluateWithAI = async ({
  challenge,
  answer,
}) => {

  if (!challenge) {
    throw new Error(
      "Challenge is required for AI evaluation.",
    );
  }


  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not configured.",
    );
  }
  const groq = getGroqClient();

  if (
    typeof answer !== "string" ||
    !answer.trim()
  ) {
    return normalizeEvaluationResult({
      score: 0,

      isCorrect: false,

      feedback:
        "Please enter a response before submitting.",

      strengths: [],

      areasToImprove: [
        "A response is required.",
      ],

      suggestions: [
        "Read the challenge carefully and try again.",
      ],

      metrics: {
        grammar: 0,
        vocabulary: 0,
        relevance: 0,
        clarity: 0,
      },

      status: "completed",

      evaluator: "ai",
    });
  }


  /* =======================================================
     BUILD EVALUATION PROMPT
  ======================================================= */

  const prompt = `
You are an English-learning evaluator for Jashna Edu.

Your job is to evaluate a learner's answer fairly,
constructively, and according to the challenge.

Do NOT evaluate the learner's intelligence or personality.

Evaluate only the quality of the submitted answer.

------------------------------------------------------------
CHALLENGE
------------------------------------------------------------

Title:
${challenge.title || "Untitled"}

Category:
${challenge.evaluationCategory || "general"}

Difficulty:
${challenge.difficulty || "Intermediate+"}

Task:
${challenge.task || ""}

Expected Response:
${challenge.expectedResponse || "No exact expected response was provided."}

Evaluation Criteria:
${JSON.stringify(
  challenge.evaluationCriteria || {},
  null,
  2
)}

------------------------------------------------------------
LEARNER RESPONSE
------------------------------------------------------------

${answer}

------------------------------------------------------------
EVALUATION RULES
------------------------------------------------------------

1. Evaluate the answer according to the task and difficulty.

2. Do NOT require the learner to reproduce the expected response
   word-for-word unless the task explicitly requires it.

3. Minor wording differences should NOT be penalized when the
   learner's meaning is correct.

4. Give a lower score when the response is:
   - irrelevant
   - incomplete
   - grammatically unclear
   - too vague
   - substantially incorrect

5. Give a higher score when the response:
   - answers the task directly
   - is grammatically clear
   - uses appropriate vocabulary
   - communicates the intended meaning effectively

6. Feedback must be encouraging and learner-friendly.

7. Strengths, areasToImprove, and suggestions should contain
   concrete observations rather than generic statements.

8. Scores must be integers from 0 to 100.

9. The metrics must also be integers from 0 to 100.

10. "isCorrect" should be true when the learner reasonably
    fulfills the task, even if the answer is not perfect.

------------------------------------------------------------
RETURN ONLY THE STRUCTURED RESULT
------------------------------------------------------------
`;


  /* =======================================================
     GROQ REQUEST
  ======================================================= */

  const response =
    await groq.chat.completions.create({

      model: MODEL,

      messages: [
        {
          role: "system",

          content:
            "You are a careful English-learning evaluator. Evaluate fairly and return only the requested structured JSON.",
        },

        {
          role: "user",

          content: prompt,
        },
      ],

      temperature: 0.2,

      response_format: {
        type: "json_schema",

        json_schema: {

          name: "jashna_evaluation",

          strict: true,

          schema: {

            type: "object",

            properties: {

              score: {
                type: "integer",
              },

              isCorrect: {
                type: "boolean",
              },

              feedback: {
                type: "string",
              },

              strengths: {
                type: "array",

                items: {
                  type: "string",
                },
              },

              areasToImprove: {
                type: "array",

                items: {
                  type: "string",
                },
              },

              suggestions: {
                type: "array",

                items: {
                  type: "string",
                },
              },

              metrics: {

                type: "object",

                properties: {

                  grammar: {
                    type: "integer",
                  },

                  vocabulary: {
                    type: "integer",
                  },

                  relevance: {
                    type: "integer",
                  },

                  clarity: {
                    type: "integer",
                  },

                },

                required: [
                  "grammar",
                  "vocabulary",
                  "relevance",
                  "clarity",
                ],

                additionalProperties: false,
              },

            },

            required: [
              "score",
              "isCorrect",
              "feedback",
              "strengths",
              "areasToImprove",
              "suggestions",
              "metrics",
            ],

            additionalProperties: false,
          },
        },
      },
    });


  /* =======================================================
     EXTRACT AI RESULT
  ======================================================= */

  const rawContent =
    response.choices?.[0]?.message?.content;


  if (!rawContent) {
    throw new Error(
      "Groq returned an empty evaluation response.",
    );
  }


  let parsedResult;


  try {

    parsedResult =
      JSON.parse(rawContent);

  } catch (error) {

    console.error(
      "Invalid Groq evaluation JSON:",
      rawContent,
    );

    throw new Error(
      "Groq returned an invalid evaluation format.",
    );
  }


  /* =======================================================
     NORMALIZE RESULT
  ======================================================= */

  return normalizeEvaluationResult({

    score: parsedResult.score,

    isCorrect:
      parsedResult.isCorrect,

    feedback:
      parsedResult.feedback,

    strengths:
      parsedResult.strengths,

    areasToImprove:
      parsedResult.areasToImprove,

    suggestions:
      parsedResult.suggestions,

    metrics:
      parsedResult.metrics,

    status: "completed",

    evaluator: "ai",

  });
};


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  evaluateWithAI,
};