import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  RotateCw,
  Trophy,
  Zap,
  CheckCircle2,
  RefreshCw,
  Star,
  LoaderCircle,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   API
========================================================= */

const API_BASE = "http://localhost:5000/api";

/*
  TEMPORARY:

  We are currently testing the completion system without
  a real user/account system.

  Later this can come from authentication / user profile.
*/
const PLAYER_NAME = "Test User";

/* =========================================================
   WHEEL VISUAL SEGMENTS
========================================================= */

const WHEEL_LABELS = [
  "VOCABULARY",
  "GRAMMAR",
  "SPEAKING",
  "INTERVIEW",
  "PROFESSIONAL",
  "PRONUNCIATION",
  "IDIOMS",
  "WRITING",
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WeeklyChallenge() {
  const navigate = useNavigate();

  /* =======================================================
     API STATE
  ======================================================= */

  /*
    Backend-selected challenge.

    IMPORTANT:
    This is NOT an admin-published challenge.
  */
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const [loadingChallenge, setLoadingChallenge] = useState(false);

  const [challengeError, setChallengeError] = useState("");

  /* =======================================================
     UI STATE
  ======================================================= */

  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const [selectedTopic, setSelectedTopic] = useState("");

  const [isSpinning, setIsSpinning] = useState(false);

  const [rotation, setRotation] = useState(0);

  const [taskInput, setTaskInput] = useState("");

  const [selectedOption, setSelectedOption] = useState(null);

  const [taskChecked, setTaskChecked] = useState(false);

  /*
    null
    "correct"
    "wrong"
    "submitted"
  */
  const [answerStatus, setAnswerStatus] = useState(null);

  const [completed, setCompleted] = useState(false);

  /* =======================================================
     BACKEND EVALUATION STATE
  ======================================================= */

  const [evaluationResult, setEvaluationResult] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  /* =========================================================
     FETCH RANDOM CHALLENGE
  ========================================================= */

  const fetchRandomChallenge = async () => {
    try {
      setLoadingChallenge(true);
      setChallengeError("");

      const response = await fetch(`${API_BASE}/challenges/random`);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load a new challenge.");
      }

      const challenge = data.challenge;

      if (!challenge || !challenge._id) {
        throw new Error("The server did not return a valid challenge.");
      }

      const topic =
        data.topic || challenge.evaluationCategory || challenge.label || "";

      const topicLabel = data.topicLabel || String(topic).toUpperCase();

      /*
        Backend remains the source of truth.
      */

      setCurrentChallenge(challenge);

      setSelectedTopic(topicLabel);

      return {
        challenge,
        topic,
        topicLabel,
      };
    } catch (error) {
      console.error("Random challenge fetch error:", error);

      setChallengeError(error.message || "Unable to load a new challenge.");

      return null;
    } finally {
      setLoadingChallenge(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
     ---------------------------------------------------------
     We prefetch one challenge so the first interaction
     doesn't have to wait for the API.

     It is NOT displayed until the wheel is spun.
  ========================================================= */

  useEffect(() => {
    fetchRandomChallenge();
  }, []);

  /* =========================================================
     WHEEL SEGMENTS
  ========================================================= */

  const wheelSegments = useMemo(() => {
    const segmentAngle = 360 / WHEEL_LABELS.length;

    return WHEEL_LABELS.map((label, index) => {
      const startAngle = index * segmentAngle;

      const endAngle = startAngle + segmentAngle;

      return {
        id: label.toLowerCase(),
        label,
        index,
        startAngle,
        endAngle,
        midAngle: startAngle + segmentAngle / 2,
      };
    });
  }, []);

  /* =========================================================
     FIND VISUAL WHEEL POSITION
  ========================================================= */

  const getChallengeWheelIndex = (challenge, topic) => {
    if (!challenge && !topic) {
      return 0;
    }

    const topicValue = String(
      topic || challenge?.evaluationCategory || challenge?.label || "",
    )
      .trim()
      .toUpperCase();

    /*
      Known normalization.
    */

    const normalizedTopic =
      topicValue === "IDIOM"
        ? "IDIOMS"
        : topicValue === "VOCAB"
          ? "VOCABULARY"
          : topicValue;

    const exactMatch = WHEEL_LABELS.findIndex(
      (label) => label === normalizedTopic,
    );

    /*
      Because the backend now uses the fixed
      eight-topic system, an exact match should
      normally always exist.

      Returning 0 is safer than inventing a
      different visual topic.
    */

    return exactMatch !== -1 ? exactMatch : 0;
  };

  /* =========================================================
     RESET CHALLENGE STATE
  ========================================================= */

  const resetChallengeState = () => {
    setCompleted(false);

    setTaskChecked(false);

    setAnswerStatus(null);

    setTaskInput("");

    setSelectedOption(null);

    setEvaluationResult(null);

    setSubmitError("");

    setIsSubmitting(false);
  };

  /* =========================================================
     OPEN ANALYSIS PAGE
     ---------------------------------------------------------
     This is now the ONLY destination after a successful
     challenge completion.

     We also store the result in sessionStorage so that
     refreshing /weekly-analysis does not immediately
     lose the evaluation data.
  ========================================================= */


  /* =========================================================
     SPIN WHEEL
     ---------------------------------------------------------
     FLOW:

       User clicks:
         centre OR CTA

              ↓

       Fetch fresh challenge

              ↓

       Backend chooses:
         topic
         +
         question

              ↓

       Frontend finds topic segment

              ↓

       Wheel spins

              ↓

       Challenge appears
  ========================================================= */
  const navigateToAnalysis = (challenge, completion) => {
  const payload = {
    challenge,
    completion,
    completedAt: new Date().toISOString(),
  };

  console.log(
    "Preparing weekly analysis payload:",
    payload
  );

  try {
    sessionStorage.setItem(
      "jashnaWeeklyAnalysis",
      JSON.stringify(payload)
    );

    console.log(
      "Weekly analysis saved to sessionStorage."
    );
  } catch (error) {
    console.error(
      "Failed to save weekly analysis:",
      error
    );
  }

  navigate("/weekly-analysis", {
    state: payload,
  });
};
  const spinWheel = async () => {
    if (isSpinning || loadingChallenge) {
      return;
    }

    playSound("spin");

    setIsSpinning(true);

    resetChallengeState();

    setSelectedChallenge(null);

    setSelectedTopic("");

    /*
      IMPORTANT:

      Always request a NEW challenge when
      the user deliberately spins again.
    */

    const result = await fetchRandomChallenge();

    if (!result) {
      setIsSpinning(false);

      playSound("error");

      return;
    }

    const { challenge, topic, topicLabel } = result;

    /* =====================================================
       DETERMINE VISUAL SEGMENT
    ====================================================== */

    const selectedIndex = getChallengeWheelIndex(
      challenge,
      topic || topicLabel,
    );

    const selectedSegment = wheelSegments[selectedIndex];

    const selectedMidAngle = selectedSegment.midAngle;

    /* =====================================================
       CURRENT WHEEL ORIENTATION
    ====================================================== */

    const currentNormalizedRotation = ((rotation % 360) + 360) % 360;

    /* =====================================================
       CALCULATE ROTATION
    ====================================================== */

    const requiredRotation =
      (360 - selectedMidAngle - currentNormalizedRotation + 360) % 360;

    /*
      Five complete rotations + target.
    */

    const targetAngle = 360 * 5 + requiredRotation;

    const newRotation = rotation + targetAngle;

    setRotation(newRotation);

    /* =====================================================
       AFTER WHEEL FINISHES
    ====================================================== */

    setTimeout(() => {
      setSelectedChallenge(challenge);

      setSelectedTopic(
        String(
          topicLabel ||
            topic ||
            challenge.evaluationCategory ||
            challenge.label ||
            "",
        ).toUpperCase(),
      );

      setIsSpinning(false);

      playSound("select");
    }, 4200);
  };

  /* =========================================================
     NEW CHALLENGE
     ---------------------------------------------------------
     This is now a REAL new challenge.

     It does NOT merely clear the screen.
  ========================================================= */

  const handleNewChallenge = () => {
    if (isSubmitting || isSpinning) {
      return;
    }

    spinWheel();
  };

  /* =========================================================
     SELECT MCQ OPTION
  ========================================================= */

  const handleOptionSelect = (index) => {
    /*
      If the challenge has already been correctly
      completed, don't allow another answer.
    */

    if (taskChecked || isSubmitting || completed) {
      return;
    }

    setSelectedOption(index);

    /*
      A new selection starts a fresh attempt visually.
    */

    setAnswerStatus(null);

    setSubmitError("");

    /*
      Remove the previous evaluation from view
      while the learner is trying another answer.
    */

    setEvaluationResult(null);
  };

  /* =========================================================
     SUBMIT CHALLENGE
     ---------------------------------------------------------
     FRONTEND NEVER EVALUATES CORRECTNESS.

     Backend receives:

       playerName
       challengeId
       answer

     Backend:

       → evaluates
       → scores
       → generates feedback
       → stores completion
       → returns result

     SUCCESSFUL COMPLETION:
       → redirect to /weekly-analysis

     MCQ WRONG:
       → remain on this page
  ========================================================= */

  const submitChallenge = async () => {
    if (!selectedChallenge?._id) {
      setSubmitError("Challenge information is missing.");

      return;
    }

    if (isSubmitting || taskChecked || completed) {
      return;
    }

    /* =====================================================
       PREPARE ANSWER
    ====================================================== */

    let answer;

    if (selectedChallenge.type === "mcq") {
      if (selectedOption === null) {
        setSubmitError("Please select an answer.");

        return;
      }

      answer = selectedOption;
    } else if (selectedChallenge.type === "text") {
      if (!taskInput.trim()) {
        setSubmitError("Please enter your response.");

        return;
      }

      answer = taskInput.trim();
    } else {
      setSubmitError("This challenge type is not supported yet.");

      return;
    }

    try {
      setIsSubmitting(true);

      setSubmitError("");

      setEvaluationResult(null);

      const response = await fetch(`${API_BASE}/challenges/complete`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          playerName: PLAYER_NAME,

          challengeId: selectedChallenge._id,

          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit challenge.");
      }

      const completion = data.completion;

      if (!completion) {
        throw new Error("The server did not return an evaluation result.");
      }

      setEvaluationResult(completion);

      /* ===================================================
         TEXT CHALLENGE
         ---------------------------------------------------
         Any successful AI evaluation counts as a completed
         challenge.

         We immediately move to the dedicated analysis page.
      ================================================== */

      if (selectedChallenge.type === "text") {
        setAnswerStatus("submitted");

        setTaskChecked(true);

        setCompleted(true);

        playSound("success");

        /*
          IMPORTANT:
          Analysis/download/share now happens on the
          dedicated /weekly-analysis page.
        */

        navigateToAnalysis(selectedChallenge, completion);

        return;
      }

      /* ===================================================
         MCQ
         ---------------------------------------------------
         Correct → redirect to analysis.

         Wrong → stay on wheel page so learner can retry.
      ================================================== */

      if (completion.isCorrect) {
        setAnswerStatus("correct");

        setTaskChecked(true);

        setCompleted(true);

        playSound("success");

        /*
          Redirect only after the backend confirms
          the MCQ answer is correct.
        */

        navigateToAnalysis(selectedChallenge, completion);
      } else {
        setAnswerStatus("wrong");

        setTaskChecked(false);

        setCompleted(false);

        playSound("error");
      }
    } catch (error) {
      console.error("Challenge submission error:", error);

      setSubmitError(
        error.message ||
          "Something went wrong while submitting your challenge.",
      );

      playSound("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      id="weekly-challenge"
      className="relative overflow-hidden bg-[#F7FBFA] py-24 sm:py-28 lg:py-22"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[#338DFD]/[0.07] blur-[120px]"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full bg-[#49C4A5]/[0.09] blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.45, 0.75, 0.45],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-[110px]"
          animate={{
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* =====================================================
          DOT PATTERN
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:radial-gradient(circle_at_1px_1px,rgba(16,36,62,0.10)_1px,transparent_0)] [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-[#338DFD] to-[#49C4A5]" />

            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#31516C] sm:text-xs">
              <Sparkles size={13} className="text-[#49C4A5]" />
              THE JASHNA WEEKLY CHALLENGE
            </span>

            <span className="h-px w-10 bg-gradient-to-r from-[#49C4A5] to-[#338DFD]" />
          </div>

          <h2 className="font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-[#17213A] sm:text-5xl lg:text-6xl">
            Ready for your
            <span className="block bg-gradient-to-r from-[#338DFD] to-[#49C4A5] bg-clip-text text-transparent">
              next challenge?
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#536174] sm:text-base sm:leading-8">
            Spin the wheel, discover a fresh English-language activity and put
            your skills into practice.
          </p>
        </motion.div>

        {/* ===================================================
            MAIN EXPERIENCE CARD
        ==================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.8,
            delay: 0.15,
          }}
          className="relative mx-auto mt-14 max-w-6xl"
        >
          <div className="pointer-events-none absolute -inset-3 rounded-[2.5rem] border border-[#49C4A5]/10" />

          <div className="relative overflow-hidden rounded-[2.2rem] border border-[#D9E7E4] bg-white/80 shadow-[0_30px_90px_rgba(16,36,62,0.10)] backdrop-blur-xl">
            <div className="grid lg:grid-cols-[0.98fr_1.02fr]">
              {/* =================================================
                  LEFT — WHEEL
              ================================================== */}

              <div className="relative flex min-h-[540px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#F4FAFF] via-white to-[#F0FBF7] p-8 sm:min-h-[620px] sm:p-10 lg:min-h-[680px]">
                {/* ORBITS */}

                <motion.div
                  className="absolute h-[390px] w-[390px] rounded-full border border-[#338DFD]/10 sm:h-[470px] sm:w-[470px] lg:h-[510px] lg:w-[510px]"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <motion.div
                  className="absolute h-[450px] w-[450px] rounded-full border border-dashed border-[#49C4A5]/10 sm:h-[530px] sm:w-[530px] lg:h-[570px] lg:w-[570px]"
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* SPARKLES */}

                <FloatingSparkle
                  className="left-[13%] top-[19%]"
                  delay={0}
                  size={19}
                />

                <FloatingSparkle
                  className="right-[14%] top-[24%]"
                  delay={0.8}
                  size={16}
                />

                <FloatingSparkle
                  className="left-[18%] bottom-[21%]"
                  delay={1.4}
                  size={14}
                />

                <FloatingSparkle
                  className="right-[17%] bottom-[18%]"
                  delay={2}
                  size={18}
                />

                <FloatingSparkle
                  className="left-[7%] top-[42%]"
                  delay={2.7}
                  size={11}
                />

                <FloatingSparkle
                  className="right-[8%] top-[47%]"
                  delay={1.9}
                  size={12}
                />

                <FloatingSparkle
                  className="left-[29%] top-[13%]"
                  delay={3.1}
                  size={9}
                />

                <FloatingSparkle
                  className="right-[28%] bottom-[13%]"
                  delay={2.4}
                  size={10}
                />

                {/* DOTS */}

                <motion.span
                  className="absolute left-[24%] top-[15%] h-1.5 w-1.5 rounded-full bg-[#338DFD]"
                  animate={{
                    y: [0, -7, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />

                <motion.span
                  className="absolute right-[24%] top-[31%] h-1 w-1 rounded-full bg-[#49C4A5]"
                  animate={{
                    y: [0, 7, 0],
                    opacity: [0.25, 1, 0.25],
                  }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                  }}
                />

                <motion.span
                  className="absolute right-[25%] bottom-[15%] h-1.5 w-1.5 rounded-full bg-[#49C4A5]"
                  animate={{
                    y: [0, 7, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                  }}
                />

                <motion.span
                  className="absolute left-[24%] bottom-[16%] h-1 w-1 rounded-full bg-[#338DFD]"
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.25, 1, 0.25],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                />

                {/* CENTRAL GLOW */}

                <motion.div
                  className="absolute h-[340px] w-[340px] rounded-full bg-gradient-to-br from-[#338DFD]/10 to-[#49C4A5]/10 blur-3xl sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.6, 0.9, 0.6],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* POINTER */}

                <div className="absolute left-1/2 top-[calc(50%-181px)] z-40 -translate-x-1/2 sm:top-[calc(50%-211px)] lg:top-[calc(50%-231px)]">
                  <motion.div
                    animate={
                      isSpinning
                        ? {
                            scale: [1, 1.15, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.3,
                      repeat: isSpinning ? Infinity : 0,
                    }}
                    className="relative"
                  >
                    <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[23px] border-l-transparent border-r-transparent border-t-[#17213A] drop-shadow-[0_4px_8px_rgba(16,36,62,0.25)]" />
                  </motion.div>
                </div>

                {/* =================================================
                    WHEEL
                ================================================== */}

                <motion.button
                  type="button"
                  onClick={spinWheel}
                  disabled={isSpinning || loadingChallenge}
                  aria-label={
                    isSpinning
                      ? "Wheel is spinning"
                      : "Spin the challenge wheel"
                  }
                  whileHover={
                    !isSpinning && !loadingChallenge
                      ? {
                          scale: 1.015,
                        }
                      : {}
                  }
                  whileTap={
                    !isSpinning && !loadingChallenge
                      ? {
                          scale: 0.985,
                        }
                      : {}
                  }
                  className={`relative z-20 h-[320px] w-[320px] rounded-full outline-none sm:h-[380px] sm:w-[380px] lg:h-[420px] lg:w-[420px] ${
                    isSpinning || loadingChallenge
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <motion.div
                    className="h-full w-full"
                    animate={{
                      rotate: rotation,
                    }}
                    transition={{
                      duration: 4.2,
                      ease: [0.12, 0.8, 0.2, 1],
                    }}
                    style={{
                      transformOrigin: "center center",
                    }}
                  >
                    <svg
                      viewBox="0 0 400 400"
                      className="h-full w-full overflow-visible drop-shadow-[0_25px_45px_rgba(51,141,253,0.20)]"
                    >
                      {/* OUTER RINGS */}

                      <circle
                        cx="200"
                        cy="200"
                        r="194"
                        fill="white"
                        stroke="rgba(51,141,253,0.10)"
                        strokeWidth="2"
                      />

                      <circle
                        cx="200"
                        cy="200"
                        r="187"
                        fill="none"
                        stroke="rgba(73,196,165,0.10)"
                        strokeWidth="2"
                      />

                      {/* SEGMENTS */}

                      {wheelSegments.map((segment, index) => {
                        const radius = 175;

                        const startRadians =
                          ((segment.startAngle - 90) * Math.PI) / 180;

                        const endRadians =
                          ((segment.endAngle - 90) * Math.PI) / 180;

                        const x1 = 200 + radius * Math.cos(startRadians);

                        const y1 = 200 + radius * Math.sin(startRadians);

                        const x2 = 200 + radius * Math.cos(endRadians);

                        const y2 = 200 + radius * Math.sin(endRadians);

                        const largeArcFlag =
                          segment.endAngle - segment.startAngle > 180 ? 1 : 0;

                        const path = `
                            M 200 200
                            L ${x1} ${y1}
                            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                            Z
                          `;

                        const labelRadius = 130;

                        const labelRadians =
                          ((segment.midAngle - 90) * Math.PI) / 180;

                        const labelX =
                          200 + labelRadius * Math.cos(labelRadians);

                        const labelY =
                          200 + labelRadius * Math.sin(labelRadians);

                        let textRotation = segment.midAngle;

                        if (textRotation > 90 && textRotation < 270) {
                          textRotation += 180;
                        }

                        return (
                          <g key={segment.id}>
                            {/* SEGMENT */}

                            <path
                              d={path}
                              fill={index % 2 === 0 ? "#338DFD" : "#49C4A5"}
                              stroke="white"
                              strokeWidth="2.5"
                            />

                            {/* INNER HIGHLIGHT */}

                            <path
                              d={path}
                              fill="none"
                              stroke="rgba(255,255,255,0.16)"
                              strokeWidth="7"
                            />

                            {/* LABEL */}

                            <motion.g
                              animate={{
                                rotate: -rotation,
                              }}
                              transition={{
                                duration: 4.2,
                                ease: [0.12, 0.8, 0.2, 1],
                              }}
                              style={{
                                transformOrigin: `${labelX}px ${labelY}px`,
                              }}
                            >
                              <text
                                x={labelX}
                                y={labelY}
                                fill="white"
                                fontSize="10.5"
                                fontWeight="800"
                                letterSpacing="0.7"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${textRotation} ${labelX} ${labelY})`}
                                style={{
                                  textShadow: "0 1px 3px rgba(16,36,62,0.28)",
                                }}
                              >
                                {segment.label}
                              </text>
                            </motion.g>
                          </g>
                        );
                      })}

                      {/* INNER CIRCLE */}

                      <circle
                        cx="200"
                        cy="200"
                        r="64"
                        fill="white"
                        stroke="rgba(51,141,253,0.15)"
                        strokeWidth="2"
                      />

                      <circle cx="200" cy="200" r="53" fill="#F9FCFB" />

                      {/* CENTER INTERACTION */}

                      <motion.g
                        animate={{
                          scale: isSpinning ? [1, 1.05, 1] : [1, 1.025, 1],
                        }}
                        transition={{
                          duration: isSpinning ? 0.7 : 2.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          transformOrigin: "200px 200px",
                        }}
                      >
                        <circle
                          cx="200"
                          cy="190"
                          r="18"
                          fill="#338DFD"
                          opacity="0.08"
                        />

                        <text
                          x="200"
                          y="197"
                          textAnchor="middle"
                          fontSize="23"
                          fill="#338DFD"
                        >
                          ↻
                        </text>
                      </motion.g>

                      <text
                        x="200"
                        y="224"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="800"
                        letterSpacing="1.5"
                        fill="#17213A"
                      >
                        {loadingChallenge && !isSpinning
                          ? "READY"
                          : isSpinning
                            ? "SPINNING"
                            : "SPIN"}
                      </text>
                    </svg>
                  </motion.div>
                </motion.button>

                {/* =================================================
                    SELECTED BADGE
                ================================================== */}

                <AnimatePresence>
                  {selectedChallenge && !isSpinning && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                      }}
                      className="absolute bottom-8 left-1/2 z-30 hidden -translate-x-1/2 translate-y-[10px] items-center gap-2 rounded-full border border-[#49C4A5]/25 bg-white/90 px-4 py-2 shadow-[0_10px_25px_rgba(16,36,62,0.10)] backdrop-blur-md sm:flex"
                    >
                      <Star
                        size={12}
                        className="fill-[#49C4A5] text-[#49C4A5]"
                      />

                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#527086]">
                        {selectedTopic || "Challenge selected"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* =================================================
                    SMALL HINT
                ================================================== */}

                <AnimatePresence>
                  {!selectedChallenge && !isSpinning && !loadingChallenge && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#DDE9E6] bg-white/80 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#718092] shadow-[0_8px_20px_rgba(16,36,62,0.06)] backdrop-blur-md"
                    >
                      Click the wheel to spin
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* =================================================
                  RIGHT — CHALLENGE AREA
              ================================================== */}

              <div className="relative flex flex-col justify-center px-7 py-10 sm:px-10 sm:py-14 lg:px-14">
                {/* TOP LABEL */}

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#49C4A5]/10 text-[#2CA98A]">
                    <Zap size={16} />
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#527086]">
                    A fresh challenge, every spin.
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {/* =================================================
                      LOADING
                  ================================================== */}

                  {loadingChallenge && !selectedChallenge ? (
                    <motion.div
                      key="loading"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="mt-10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DDEAE7] border-t-[#338DFD]" />

                        <div>
                          <p className="text-sm font-semibold text-[#26384D]">
                            Preparing your challenge...
                          </p>

                          <p className="mt-1 text-xs text-[#7A8795]">
                            Finding a fresh activity for you.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : challengeError && !currentChallenge ? (
                    /* ERROR */

                    <motion.div
                      key="error"
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-8"
                    >
                      <div className="rounded-2xl border border-[#E8BABA] bg-[#FFF6F6] p-5">
                        <p className="text-sm font-bold text-[#B44E4E]">
                          Challenge unavailable
                        </p>

                        <p className="mt-2 text-xs leading-6 text-[#8D6464]">
                          {challengeError}
                        </p>

                        <button
                          type="button"
                          onClick={() => fetchRandomChallenge()}
                          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#338DFD] to-[#49C4A5] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(51,141,253,0.15)]"
                        >
                          <RefreshCw size={14} />
                          Try Again
                        </button>
                      </div>
                    </motion.div>
                  ) : !selectedChallenge ? (
                    /* =================================================
                       BEFORE SPIN
                    ================================================== */

                    <motion.div
                      key="empty"
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -15,
                      }}
                      className="mt-8"
                    >
                      <h3 className="max-w-xl font-serif text-3xl font-semibold leading-[1.08] tracking-[-0.025em] text-[#17213A] sm:text-4xl">
                        Learn something.
                        <span className="block text-[#338DFD]">
                          Test yourself.
                        </span>
                        <span className="block text-[#49A98F]">
                          Earn your win.
                        </span>
                      </h3>

                      <p className="mt-6 max-w-lg text-sm leading-7 text-[#566174] sm:text-base sm:leading-8">
                        Every spin reveals a fresh English-language activity,
                        with the topic and question selected specifically for
                        your attempt.
                      </p>

                      <div className="mt-8 space-y-4">
                        <ChallengeFeature
                          icon={<RotateCw size={16} />}
                          title="Spin"
                          description="Let the wheel reveal your skill area."
                        />

                        <ChallengeFeature
                          icon={<Target size={16} />}
                          title="Attempt"
                          description="Complete the activity shown on screen."
                        />

                        <ChallengeFeature
                          icon={<Trophy size={16} />}
                          title="Grow"
                          description="Receive feedback and keep building your English."
                        />
                      </div>

                      {/* =================================================
                          SINGLE RIGHT-SIDE SPIN CTA
                      ================================================== */}

                      <div className="mt-9">
                        <motion.button
                          type="button"
                          onClick={spinWheel}
                          disabled={isSpinning || loadingChallenge}
                          whileHover={{
                            y: -3,
                            scale: 1.01,
                          }}
                          whileTap={{
                            scale: 0.98,
                          }}
                          className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#338DFD] to-[#49C4A5] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(51,141,253,0.20)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(51,141,253,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loadingChallenge ? (
                            <>
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                              Preparing...
                            </>
                          ) : (
                            <>
                              Spin the Wheel
                              <ArrowRight
                                size={17}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    /* =================================================
                       ACTIVE CHALLENGE
                    ================================================== */

                    <motion.div
                      key={selectedChallenge._id || selectedChallenge.id}
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="mt-7"
                    >
                      {/* =================================================
                          TOP META
                      ================================================== */}

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#49C4A5]/20 bg-[#F1FBF8] px-3.5 py-2">
                          <CheckCircle2 size={13} className="text-[#49A98F]" />

                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#338B78]">
                            Your challenge
                          </span>
                        </div>

                        {selectedTopic && (
                          <span className="rounded-full border border-[#DCE7F2] bg-[#F7FAFE] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#338DFD]">
                            {selectedTopic}
                          </span>
                        )}

                        {selectedChallenge.difficulty && (
                          <span className="rounded-full border border-[#E6E2D8] bg-[#FFFCF5] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#9A7A3D]">
                            {selectedChallenge.difficulty}
                          </span>
                        )}
                      </div>

                      {/* TITLE */}

                      <h3 className="mt-5 font-serif text-3xl font-semibold leading-[1.08] tracking-[-0.025em] text-[#17213A] sm:text-4xl">
                        {selectedChallenge.title}
                      </h3>

                      <p className="mt-4 max-w-lg text-sm leading-7 text-[#566174] sm:text-base sm:leading-8">
                        {selectedChallenge.description}
                      </p>

                      {/* =================================================
                          TASK CARD
                      ================================================== */}

                      <div className="mt-6 rounded-2xl border border-[#E1ECE9] bg-[#F8FCFB] p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#338DFD]">
                          Your task
                        </p>

                        <p className="mt-2 text-sm font-semibold leading-6 text-[#26384D]">
                          {selectedChallenge.task}
                        </p>

                        {/* =================================================
                            MCQ
                        ================================================== */}

                        {selectedChallenge.type === "mcq" &&
                          Array.isArray(selectedChallenge.options) && (
                            <div className="mt-5 space-y-2.5">
                              {selectedChallenge.options.map(
                                (option, index) => {
                                  const isSelected = selectedOption === index;

                                  /*
                                    IMPORTANT:

                                    We NEVER inspect
                                    selectedChallenge.correct.
                                  */

                                  const showCorrect =
                                    taskChecked &&
                                    answerStatus === "correct" &&
                                    isSelected;

                                  const showWrong =
                                    answerStatus === "wrong" && isSelected;

                                  return (
                                    <button
                                      key={`${option}-${index}`}
                                      type="button"
                                      onClick={() => handleOptionSelect(index)}
                                      disabled={
                                        taskChecked || isSubmitting || completed
                                      }
                                      className={`w-full rounded-xl border px-4 py-3 text-left text-xs font-medium transition-all ${
                                        showCorrect
                                          ? "border-[#49C4A5]/60 bg-[#E8F9F4] text-[#20866F] shadow-[0_5px_18px_rgba(73,196,165,0.10)]"
                                          : showWrong
                                            ? "border-[#E58B8B]/60 bg-[#FFF1F1] text-[#B44E4E]"
                                            : isSelected
                                              ? "border-[#338DFD]/40 bg-[#EEF6FF] text-[#236CC0]"
                                              : "border-[#E0E9E7] bg-white text-[#536174] hover:border-[#338DFD]/25 hover:bg-[#F8FBFF]"
                                      }`}
                                    >
                                      <span className="mr-2 font-bold">
                                        {String.fromCharCode(65 + index)}.
                                      </span>

                                      {option}

                                      {showCorrect && (
                                        <CheckCircle2
                                          size={15}
                                          className="float-right mt-[-1px] text-[#49A98F]"
                                        />
                                      )}

                                      {showWrong && (
                                        <span className="float-right text-sm font-bold text-[#C35C5C]">
                                          ×
                                        </span>
                                      )}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          )}

                        {/* =================================================
                            TEXT INPUT
                        ================================================== */}

                        {selectedChallenge.type === "text" && (
                          <textarea
                            value={taskInput}
                            onChange={(e) => {
                              if (taskChecked || isSubmitting || completed) {
                                return;
                              }

                              setTaskInput(e.target.value);

                              if (answerStatus) {
                                setAnswerStatus(null);
                              }

                              setEvaluationResult(null);

                              setSubmitError("");
                            }}
                            disabled={taskChecked || isSubmitting || completed}
                            rows={4}
                            placeholder={
                              selectedChallenge.placeholder ||
                              "Type your answer here..."
                            }
                            className="mt-5 w-full resize-none rounded-xl border border-[#DCE8E5] bg-white px-4 py-3 text-sm leading-6 text-[#26384D] outline-none transition-all placeholder:text-[#9AA5B0] focus:border-[#338DFD]/40 focus:ring-4 focus:ring-[#338DFD]/[0.06] disabled:bg-[#F3F8F6]"
                          />
                        )}

                        {/* SUBMISSION ERROR */}

                        <AnimatePresence>
                          {submitError && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 5,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              exit={{
                                opacity: 0,
                                y: -5,
                              }}
                              className="mt-4 rounded-xl border border-[#E8BABA] bg-[#FFF4F4] px-4 py-3"
                            >
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5 text-sm text-[#B44E4E]">
                                  ✕
                                </span>

                                <p className="text-xs font-semibold leading-5 text-[#B44E4E]">
                                  {submitError}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* =================================================
                            MCQ WRONG ATTEMPT FEEDBACK
                            -------------------------------------------------
                            We keep this because a wrong MCQ answer
                            does NOT complete the challenge.
                        ================================================== */}

                        <AnimatePresence mode="wait">
                          {answerStatus === "wrong" &&
                            selectedChallenge.type === "mcq" &&
                            evaluationResult && (
                              <motion.div
                                key="wrong"
                                initial={{
                                  opacity: 0,
                                  y: 5,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                className="mt-4 rounded-xl border border-[#E8BABA] bg-[#FFF4F4] px-4 py-3"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="mt-0.5 text-sm text-[#B44E4E]">
                                    ✕
                                  </span>

                                  <div>
                                    <p className="text-xs font-bold text-[#B44E4E]">
                                      Not quite.
                                    </p>

                                    <p className="mt-0.5 text-[11px] leading-5 text-[#8D6464]">
                                      {evaluationResult.feedback ||
                                        "Review the concept and try another answer."}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                        </AnimatePresence>

                        {/* =================================================
                            CHECK / SUBMIT BUTTON
                        ================================================== */}

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <motion.button
                            type="button"
                            onClick={submitChallenge}
                            disabled={
                              isSubmitting ||
                              taskChecked ||
                              completed ||
                              (selectedChallenge.type === "mcq"
                                ? selectedOption === null
                                : !taskInput.trim())
                            }
                            whileHover={{
                              y: -2,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#338DFD] to-[#49C4A5] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(51,141,253,0.16)] transition-all hover:shadow-[0_14px_30px_rgba(51,141,253,0.24)] disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {isSubmitting ? (
                              <>
                                <LoaderCircle
                                  size={15}
                                  className="animate-spin"
                                />
                                Evaluating...
                              </>
                            ) : (
                              <>
                                <Zap size={15} />
                                Check Answer
                              </>
                            )}
                          </motion.button>

                          {!isSubmitting &&
                            selectedChallenge.type === "mcq" &&
                            selectedOption !== null && (
                              <span className="text-[10px] font-medium text-[#87929E]">
                                Submit your best answer.
                              </span>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* MINI LABEL */}

                <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A8795]">
                  <span>Weekly</span>

                  <span className="h-1 w-1 rounded-full bg-[#49C4A5]" />

                  <span>Interactive</span>

                  <span className="h-1 w-1 rounded-full bg-[#338DFD]" />

                  <span>Skill-based</span>

                  <span className="h-1 w-1 rounded-full bg-[#49C4A5]" />

                  <span>Free to try</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            BOTTOM TEASER
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
            delay: 0.25,
          }}
          className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 text-center"
        >
          <span className="h-px w-8 bg-[#D6E3E0]" />

          <p className="text-[11px] font-medium leading-5 text-[#687586] sm:text-xs">
            A small challenge today can build a stronger skill tomorrow.
          </p>

          <span className="h-px w-8 bg-[#D6E3E0]" />
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================
   CHALLENGE FEATURE
========================================================= */

function ChallengeFeature({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{
        x: 4,
      }}
      className="flex items-start gap-3"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D8E8E4] bg-[#F6FBF9] text-[#338DFD]">
        {icon}
      </span>

      <div>
        <h4 className="text-sm font-semibold text-[#26384D]">{title}</h4>

        <p className="mt-0.5 text-xs leading-5 text-[#687586]">{description}</p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   FLOATING SPARKLE
========================================================= */

function FloatingSparkle({ className, delay, size }) {
  return (
    <motion.div
      className={`pointer-events-none absolute z-10 ${className}`}
      initial={{
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: [0.25, 1, 0.35, 0.8, 0.25],
        scale: [0.7, 1, 0.85, 1.05, 0.7],
        y: [0, -7, 2, -5, 0],
        rotate: [0, 15, -10, 10, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Sparkles
        size={size}
        strokeWidth={1.5}
        className="text-[#338DFD] drop-shadow-[0_0_8px_rgba(51,141,253,0.25)]"
      />
    </motion.div>
  );
}

/* =========================================================
   SOUND EFFECTS
========================================================= */

function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const ctx = new AudioContext();

    const oscillator = ctx.createOscillator();

    const gain = ctx.createGain();

    oscillator.connect(gain);

    gain.connect(ctx.destination);

    /* SPIN */

    if (type === "spin") {
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(280, ctx.currentTime);

      oscillator.frequency.exponentialRampToValueAtTime(
        720,
        ctx.currentTime + 0.18,
      );

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);

      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);

      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

      oscillator.start();

      oscillator.stop(ctx.currentTime + 0.24);
    }

    /* SELECT */

    if (type === "select") {
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(520, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);

      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);

      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

      oscillator.start();

      oscillator.stop(ctx.currentTime + 0.2);
    }

    /* SUCCESS */

    if (type === "success") {
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(523, ctx.currentTime);

      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);

      oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);

      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03);

      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

      oscillator.start();

      oscillator.stop(ctx.currentTime + 0.42);
    }

    /* ERROR */

    if (type === "error") {
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(220, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);

      gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.02);

      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

      oscillator.start();

      oscillator.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio is optional.
  }
}
