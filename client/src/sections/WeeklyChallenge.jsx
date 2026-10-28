import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  RotateCw,
  Trophy,
  Zap,
  CheckCircle2,
  RefreshCw,
  LoaderCircle,
  Target,
  MessageCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getWhatsAppLink } from "../data/contact";
import { API_BASE } from "../config";

/* =========================================================
   CONFIG
========================================================= */

// API_BASE imported from config

/* TEMPORARY until real accounts exist. */
const PLAYER_NAME = "Test User";

const SPIN_DURATION = 4.2; // seconds

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

/*
  PALETTE — light blue and light teal, alternating around the wheel.
  "soft" is the resting colour of a segment, "deep" is what the
  winning segment turns into after the spin.
*/
const SHADES = [
  { name: "blue", soft: "#D9EAFD", deep: "#338DFD", grad: "segBlue" },
  { name: "teal", soft: "#D3F0EB", deep: "#2A9D8F", grad: "segTeal" },
];

/* Matching tints for cards, chips and buttons (alternated by index). */
const TONES = {
  blue: {
    chip: "border-[#CFE3F8] bg-[#EEF6FF] text-[#2A78D6] hover:bg-[#E2EFFE]",
    panel: "border-[#D3E4F6] bg-[#F1F7FF]",
    label: "text-[#338DFD]",
    icon: "border-[#CFE3F8] bg-[#EAF3FF] text-[#338DFD]",
    option:
      "border-[#DCE8F5] bg-white text-[#536174] hover:border-[#338DFD]/40 hover:bg-[#F1F7FF]",
  },
  teal: {
    chip: "border-[#C7E8E2] bg-[#EAF8F5] text-[#23867A] hover:bg-[#DDF3EE]",
    panel: "border-[#D0EAE5] bg-[#EFFAF7]",
    label: "text-[#2A9D8F]",
    icon: "border-[#C7E8E2] bg-[#E6F7F3] text-[#2A9D8F]",
    option:
      "border-[#D9ECE8] bg-white text-[#536174] hover:border-[#2A9D8F]/40 hover:bg-[#EFFAF7]",
  },
};

const toneOf = (index) => (index % 2 === 0 ? TONES.blue : TONES.teal);

const SEGMENT_ANGLE = 360 / WHEEL_LABELS.length;
const BULB_COUNT = 24;

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WeeklyChallenge() {
  const navigate = useNavigate();

  /* API state */
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [challengeError, setChallengeError] = useState("");

  /* UI state */
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [taskInput, setTaskInput] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [taskChecked, setTaskChecked] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null); // null | correct | wrong | submitted
  const [completed, setCompleted] = useState(false);

  /* Wheel interactivity */
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [burstKey, setBurstKey] = useState(0);
  const [spinCount, setSpinCount] = useState(0);

  /* Backend evaluation state */
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* =======================================================
     FETCH RANDOM CHALLENGE
  ======================================================= */

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

      setCurrentChallenge(challenge);

      return { challenge, topic, topicLabel };
    } catch (error) {
      console.error("Random challenge fetch error:", error);
      setChallengeError(error.message || "Unable to load a new challenge.");
      return null;
    } finally {
      setLoadingChallenge(false);
    }
  };

  /* Prefetch one challenge so the first spin feels instant. */
  useEffect(() => {
    fetchRandomChallenge();
  }, []);

  /* =======================================================
     WHEEL SEGMENTS
  ======================================================= */

  const wheelSegments = useMemo(
    () =>
      WHEEL_LABELS.map((label, index) => {
        const startAngle = index * SEGMENT_ANGLE;
        const endAngle = startAngle + SEGMENT_ANGLE;

        return {
          id: label.toLowerCase(),
          label,
          index,
          startAngle,
          endAngle,
          midAngle: startAngle + SEGMENT_ANGLE / 2,
          shade: SHADES[index % SHADES.length],
        };
      }),
    [],
  );

  const bulbs = useMemo(
    () =>
      Array.from({ length: BULB_COUNT }, (_, i) => {
        const angle = ((i * 360) / BULB_COUNT - 90) * (Math.PI / 180);
        return {
          i,
          x: 200 + 207 * Math.cos(angle),
          y: 200 + 207 * Math.sin(angle),
        };
      }),
    [],
  );

  const burstDots = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i * 360) / 14 * (Math.PI / 180);
        const dist = 120 + (i % 3) * 28;
        return {
          i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 6 + (i % 3) * 3,
        };
      }),
    [],
  );

  const getChallengeWheelIndex = (challenge, topic) => {
    const topicValue = String(
      topic || challenge?.evaluationCategory || challenge?.label || "",
    )
      .trim()
      .toUpperCase();

    const normalized =
      topicValue === "IDIOM"
        ? "IDIOMS"
        : topicValue === "VOCAB"
          ? "VOCABULARY"
          : topicValue;

    const match = WHEEL_LABELS.indexOf(normalized);
    return match !== -1 ? match : 0;
  };

  const activeIndex =
    selectedChallenge && !isSpinning
      ? getChallengeWheelIndex(selectedChallenge, selectedTopic)
      : -1;

  /* Colour tone of the active challenge follows its wheel segment. */
  const activeTone = toneOf(activeIndex >= 0 ? activeIndex : 0);

  /* =======================================================
     WHATSAPP
  ======================================================= */

  const consultLink = getWhatsAppLink();

  const challengeHelpLink = getWhatsAppLink(
    selectedChallenge
      ? `Hello Dr. Shivam Sir, I'm trying the Jashna Edu Weekly Challenge "${selectedChallenge.title}"${
          selectedTopic ? ` (${selectedTopic})` : ""
        } and would like some guidance.`
      : "Hello Dr. Shivam Sir, I'm trying the Jashna Edu Weekly Challenge and would like some guidance.",
  );

  /* =======================================================
     HELPERS
  ======================================================= */

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

  const navigateToAnalysis = (challenge, completion) => {
    const payload = {
      challenge,
      completion,
      completedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("jashnaWeeklyAnalysis", JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to save weekly analysis:", error);
    }

    navigate("/weekly-analysis", { state: payload });
  };

  /* =======================================================
     SPIN
  ======================================================= */

  const spinWheel = async () => {
    if (isSpinning || loadingChallenge || isSubmitting) return;

    playSound("spin");
    setIsSpinning(true);
    setHoverIndex(-1);
    resetChallengeState();
    setSelectedChallenge(null);
    setSelectedTopic("");

    const result = await fetchRandomChallenge();

    if (!result) {
      setIsSpinning(false);
      playSound("error");
      return;
    }

    const { challenge, topic, topicLabel } = result;

    const selectedIndex = getChallengeWheelIndex(challenge, topic || topicLabel);
    const midAngle = wheelSegments[selectedIndex].midAngle;

    const currentNormalized = ((rotation % 360) + 360) % 360;
    const requiredRotation = (360 - midAngle - currentNormalized + 360) % 360;

    setRotation(rotation + 360 * 5 + requiredRotation);

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
      setSpinCount((n) => n + 1);
      setBurstKey((k) => k + 1);
      playSound("select");
    }, SPIN_DURATION * 1000);
  };

  /* =======================================================
     MCQ OPTION
  ======================================================= */

  const handleOptionSelect = (index) => {
    if (taskChecked || isSubmitting || completed) return;

    setSelectedOption(index);
    setAnswerStatus(null);
    setSubmitError("");
    setEvaluationResult(null);
  };

  /* =======================================================
     SUBMIT — backend evaluates everything
  ======================================================= */

  const submitChallenge = async () => {
    if (!selectedChallenge?._id) {
      setSubmitError("Challenge information is missing.");
      return;
    }

    if (isSubmitting || taskChecked || completed) return;

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
        headers: { "Content-Type": "application/json" },
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

      if (selectedChallenge.type === "text") {
        setAnswerStatus("submitted");
        setTaskChecked(true);
        setCompleted(true);
        playSound("success");
        navigateToAnalysis(selectedChallenge, completion);
        return;
      }

      if (completion.isCorrect) {
        setAnswerStatus("correct");
        setTaskChecked(true);
        setCompleted(true);
        playSound("success");
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

  const spinDisabled = isSpinning || loadingChallenge;
  const hoveredLabel =
    hoverIndex >= 0 && !isSpinning ? WHEEL_LABELS[hoverIndex] : "";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      id="weekly-challenge"
      className="relative overflow-hidden bg-[#F4FAFC] py-14 sm:py-15 lg:py-10"
    >
      {/* BACKGROUND — alternating blue / teal washes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-16 h-[420px] w-[420px] rounded-full bg-[#338DFD]/[0.09] blur-[120px]" />
        <div className="absolute -right-40 top-[30%] h-[420px] w-[420px] rounded-full bg-[#2A9D8F]/[0.10] blur-[120px]" />
        <div className="absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#2A9D8F]/[0.07] blur-[120px]" />
        <div className="absolute -right-32 bottom-[-60px] h-[420px] w-[420px] rounded-full bg-[#338DFD]/[0.08] blur-[120px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle_at_1px_1px,rgba(16,36,62,0.10)_1px,transparent_0)] [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto w-[92%] max-w-[1600px] sm:w-[90%]">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-[#338DFD] to-[#2A9D8F] sm:w-10" />
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#31516C] sm:text-xs sm:tracking-[0.28em]">
              <Sparkles size={13} className="text-[#2A9D8F]" />
              The Jashna Weekly Challenge
            </span>
            <span className="h-px w-8 bg-gradient-to-r from-[#2A9D8F] to-[#338DFD] sm:w-10" />
          </div>

          <h2 className="font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-[#17213A] sm:text-5xl xl:text-6xl">
            Ready for your
            <span className="block bg-gradient-to-r from-[#338DFD] to-[#2A9D8F] bg-clip-text text-transparent">
              next challenge?
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#536174] sm:text-base sm:leading-8">
            Spin the wheel, get a fresh English activity, and put your skills
            into practice.
          </p>
        </motion.div>

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative mx-auto mt-10 sm:mt-14"
        >
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D3E6EE] bg-white shadow-[0_24px_70px_rgba(16,36,62,0.09)] sm:rounded-[2rem]">
            <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              {/* ===============================================
                  LEFT — WHEEL
              ================================================ */}
              <div className="relative flex flex-col items-center justify-center gap-7 overflow-hidden border-b border-[#DCEBEF] bg-gradient-to-br from-[#EAF4FF] via-white to-[#E6F7F3] px-6 py-12 sm:px-10 sm:py-14 lg:border-b-0 lg:border-r">
                {/* soft alternating glow behind wheel */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                  animate={{
                    backgroundColor: isSpinning
                      ? ["rgba(51,141,253,0.18)", "rgba(42,157,143,0.18)", "rgba(51,141,253,0.18)"]
                      : activeIndex >= 0 && activeIndex % 2 === 1
                        ? "rgba(42,157,143,0.14)"
                        : "rgba(51,141,253,0.12)",
                  }}
                  transition={{
                    duration: isSpinning ? 1.4 : 0.8,
                    repeat: isSpinning ? Infinity : 0,
                  }}
                />

                {/* Wheel stage */}
                <div className="relative aspect-square w-full max-w-[300px] sm:max-w-[360px] xl:max-w-[400px]">
                  {/* orbit ring */}
                  <motion.div
                    className="pointer-events-none absolute -inset-[9%] rounded-full border border-dashed border-[#338DFD]/25"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: isSpinning ? 8 : 40,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="pointer-events-none absolute -inset-[15%] rounded-full border border-dashed border-[#2A9D8F]/20"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: isSpinning ? 12 : 60,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* POINTER */}
                  <motion.div
                    className="absolute left-1/2 top-0 z-40 -translate-x-1/2 -translate-y-[45%]"
                    animate={isSpinning ? { y: [0, 3, 0] } : { y: 0 }}
                    transition={{
                      duration: 0.25,
                      repeat: isSpinning ? Infinity : 0,
                    }}
                  >
                    <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[22px] border-l-transparent border-r-transparent border-t-[#17213A] drop-shadow-[0_3px_6px_rgba(16,36,62,0.25)] sm:border-l-[12px] sm:border-r-[12px] sm:border-t-[26px]" />
                  </motion.div>

                  {/* LANDING BURST */}
                  {burstKey > 0 && (
                    <div
                      key={burstKey}
                      className="pointer-events-none absolute left-1/2 top-1/2 z-30"
                    >
                      {burstDots.map((d) => (
                        <motion.span
                          key={d.i}
                          className="absolute rounded-full"
                          style={{
                            width: d.size,
                            height: d.size,
                            marginLeft: -d.size / 2,
                            marginTop: -d.size / 2,
                            background: d.i % 2 === 0 ? "#338DFD" : "#2A9D8F",
                          }}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{ x: d.x, y: d.y, opacity: 0, scale: 0.4 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                  )}

                  {/* WHEEL */}
                  <motion.button
                    type="button"
                    onClick={spinWheel}
                    disabled={spinDisabled}
                    aria-label={
                      isSpinning ? "Wheel is spinning" : "Spin the challenge wheel"
                    }
                    whileHover={!spinDisabled ? { scale: 1.02 } : {}}
                    whileTap={!spinDisabled ? { scale: 0.975 } : {}}
                    onMouseLeave={() => setHoverIndex(-1)}
                    className={`absolute inset-0 z-20 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#338DFD]/30 ${
                      spinDisabled ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <svg
                      viewBox="0 0 400 400"
                      className="h-full w-full overflow-visible drop-shadow-[0_14px_28px_rgba(16,36,62,0.16)]"
                    >
                      <defs>
                        <radialGradient id="segBlue" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#EEF6FF" />
                          <stop offset="100%" stopColor="#CBE2FB" />
                        </radialGradient>
                        <radialGradient id="segTeal" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#EAF9F6" />
                          <stop offset="100%" stopColor="#C2EAE3" />
                        </radialGradient>
                        <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#338DFD" />
                          <stop offset="100%" stopColor="#2A9D8F" />
                        </linearGradient>
                      </defs>

                      {/* Static rim with chasing bulbs */}
                      <circle
                        cx="200"
                        cy="200"
                        r="207"
                        fill="none"
                        stroke="url(#rimGrad)"
                        strokeWidth="14"
                        opacity="0.9"
                      />
                      {bulbs.map((b) => (
                        <motion.circle
                          key={b.i}
                          cx={b.x}
                          cy={b.y}
                          r="3.2"
                          fill={b.i % 2 === 0 ? "#FFFFFF" : "#DDF6F1"}
                          animate={
                            isSpinning
                              ? { opacity: [0.3, 1, 0.3] }
                              : activeIndex >= 0
                                ? { opacity: [0.55, 1, 0.55] }
                                : { opacity: 0.85 }
                          }
                          transition={{
                            duration: isSpinning ? 0.5 : 1.6,
                            repeat: isSpinning || activeIndex >= 0 ? Infinity : 0,
                            delay: b.i * (isSpinning ? 0.02 : 0.06),
                          }}
                        />
                      ))}

                      {/* Rotating part */}
                      <motion.g
                        animate={{ rotate: rotation }}
                        transition={{
                          duration: SPIN_DURATION,
                          ease: [0.12, 0.8, 0.2, 1],
                        }}
                        style={{ transformOrigin: "200px 200px" }}
                      >
                        <circle cx="200" cy="200" r="198" fill="#FFFFFF" />
                        <circle
                          cx="200"
                          cy="200"
                          r="198"
                          fill="none"
                          stroke="#CFE0EC"
                          strokeWidth="2"
                        />

                        {wheelSegments.map((segment) => {
                          const radius = 188;
                          const start = ((segment.startAngle - 90) * Math.PI) / 180;
                          const end = ((segment.endAngle - 90) * Math.PI) / 180;

                          const x1 = 200 + radius * Math.cos(start);
                          const y1 = 200 + radius * Math.sin(start);
                          const x2 = 200 + radius * Math.cos(end);
                          const y2 = 200 + radius * Math.sin(end);

                          const path = `M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                          const labelRadius = 128;
                          const mid = ((segment.midAngle - 90) * Math.PI) / 180;
                          const lx = 200 + labelRadius * Math.cos(mid);
                          const ly = 200 + labelRadius * Math.sin(mid);

                          const isActive = segment.index === activeIndex;
                          const isHover =
                            segment.index === hoverIndex && !isSpinning && !isActive;

                          return (
                            <g
                              key={segment.id}
                              onMouseEnter={() => setHoverIndex(segment.index)}
                            >
                              <path
                                d={path}
                                fill={
                                  isActive
                                    ? segment.shade.deep
                                    : `url(#${segment.shade.grad})`
                                }
                                stroke="white"
                                strokeWidth="3"
                                style={{ transition: "fill 0.4s ease" }}
                              />

                              {/* hover tint */}
                              <path
                                d={path}
                                fill={segment.shade.deep}
                                opacity={isHover ? 0.22 : 0}
                                style={{
                                  transition: "opacity 0.25s ease",
                                  pointerEvents: "none",
                                }}
                              />

                              {/* radial label */}
                              <text
                                x={lx}
                                y={ly}
                                fill={isActive ? "#FFFFFF" : "#27435E"}
                                fontSize="11.5"
                                fontWeight="700"
                                letterSpacing="0.8"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${segment.midAngle - 90} ${lx} ${ly})`}
                                style={{
                                  transition: "fill 0.4s ease",
                                  pointerEvents: "none",
                                }}
                              >
                                {segment.label}
                              </text>
                            </g>
                          );
                        })}
                      </motion.g>

                      {/* Static hub */}
                      <circle cx="200" cy="200" r="58" fill="white" />
                      <circle
                        cx="200"
                        cy="200"
                        r="58"
                        fill="none"
                        stroke="url(#rimGrad)"
                        strokeWidth="3"
                      />
                      <circle cx="200" cy="200" r="48" fill="#F1F9F8" />

                      <motion.g
                        animate={{
                          scale: isSpinning ? [1, 1.08, 1] : [1, 1.04, 1],
                        }}
                        transition={{
                          duration: isSpinning ? 0.7 : 2.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{ transformOrigin: "200px 200px" }}
                      >
                        <text
                          x="200"
                          y="196"
                          textAnchor="middle"
                          fontSize="26"
                          fill="#338DFD"
                        >
                          ↻
                        </text>
                      </motion.g>

                      <text
                        x="200"
                        y="222"
                        textAnchor="middle"
                        fontSize="10.5"
                        fontWeight="800"
                        letterSpacing="1.8"
                        fill="#17213A"
                      >
                        {isSpinning
                          ? "SPINNING"
                          : loadingChallenge
                            ? "LOADING"
                            : "SPIN"}
                      </text>
                    </svg>
                  </motion.button>
                </div>

                {/* Status chip + spin counter */}
                <div className="flex min-h-[36px] flex-col items-center gap-3">
                  <AnimatePresence mode="wait">
                    {selectedChallenge && !isSpinning ? (
                      <motion.div
                        key="selected"
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-[#2A9D8F]/25 bg-white px-4 py-2 shadow-sm"
                      >
                        <CheckCircle2 size={14} className="text-[#2A9D8F]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#31516C] sm:text-xs">
                          {selectedTopic || "Challenge selected"}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={hoveredLabel || (isSpinning ? "spinning" : "hint")}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap rounded-full border border-[#D5E6E9] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#718092] sm:text-xs"
                      >
                        {isSpinning
                          ? "Choosing your topic…"
                          : hoveredLabel
                            ? `Could land on ${hoveredLabel}`
                            : "Tap the wheel to spin"}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {spinCount > 0 && (
                    <motion.span
                      key={spinCount}
                      initial={{ scale: 1.25, opacity: 0.4 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-full bg-[#E3F1FD] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2A78D6]"
                    >
                      {spinCount} {spinCount === 1 ? "spin" : "spins"} this session
                    </motion.span>
                  )}
                </div>
              </div>

              {/* ===============================================
                  RIGHT — CHALLENGE AREA
              ================================================ */}
              <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 xl:px-14">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F]">
                    <Zap size={16} />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#527086] sm:text-xs">
                    A fresh challenge, every spin
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {loadingChallenge && !selectedChallenge ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DDEAE7] border-t-[#338DFD]" />
                        <div>
                          <p className="text-sm font-semibold text-[#26384D]">
                            {isSpinning
                              ? "Choosing your topic…"
                              : "Preparing your challenge…"}
                          </p>
                          <p className="mt-1 text-xs text-[#7A8795]">
                            Finding a fresh activity for you.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : challengeError && !currentChallenge ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      <div className="rounded-2xl border border-[#E8BABA] bg-[#FFF6F6] p-5">
                        <p className="text-sm font-bold text-[#B44E4E]">
                          Challenge unavailable
                        </p>
                        <p className="mt-2 text-xs leading-6 text-[#8D6464]">
                          {challengeError}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => fetchRandomChallenge()}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#338DFD] to-[#2A9D8F] px-4 py-2.5 text-xs font-semibold text-white"
                          >
                            <RefreshCw size={14} />
                            Try again
                          </button>
                          <a
                            href={getWhatsAppLink(
                              "Hello Dr. Shivam Sir, the Weekly Challenge isn't loading for me. Could you help?",
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a8f49] underline-offset-4 hover:underline"
                          >
                            <MessageCircle size={14} />
                            Message Dr. Shivam Sir
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ) : !selectedChallenge ? (
                    /* ---------- BEFORE SPIN ---------- */
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="mt-8"
                    >
                      <h3 className="font-serif text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-[#17213A] sm:text-4xl xl:text-5xl">
                        Learn something.
                        <span className="block text-[#338DFD]">Test yourself.</span>
                        <span className="block text-[#2A9D8F]">Earn your win.</span>
                      </h3>

                      <p className="mt-5 max-w-xl text-sm leading-7 text-[#566174] sm:text-base sm:leading-8">
                        Every spin picks a skill and a question just for you,
                        then gives you feedback on your answer.
                      </p>

                      {/* topic chips — alternating blue / teal, hover to preview on the wheel */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {wheelSegments.map((segment) => (
                          <motion.span
                            key={segment.id}
                            whileHover={{ y: -2, scale: 1.04 }}
                            onMouseEnter={() => setHoverIndex(segment.index)}
                            onMouseLeave={() => setHoverIndex(-1)}
                            className={`cursor-default rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                              toneOf(segment.index).chip
                            }`}
                          >
                            {segment.label}
                          </motion.span>
                        ))}
                      </div>

                      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        <ChallengeFeature
                          tone={0}
                          icon={<RotateCw size={16} />}
                          title="Spin"
                          description="Let the wheel pick your skill area."
                        />
                        <ChallengeFeature
                          tone={1}
                          icon={<Target size={16} />}
                          title="Attempt"
                          description="Answer the activity on screen."
                        />
                        <ChallengeFeature
                          tone={0}
                          icon={<Trophy size={16} />}
                          title="Grow"
                          description="Get feedback and improve."
                        />
                      </div>

                      <motion.button
                        type="button"
                        onClick={spinWheel}
                        disabled={spinDisabled}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group mt-9 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#338DFD] to-[#2A9D8F] px-7 py-4 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(51,141,253,0.2)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(51,141,253,0.28)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {loadingChallenge ? (
                          <>
                            <LoaderCircle size={17} className="animate-spin" />
                            Preparing…
                          </>
                        ) : (
                          <>
                            Spin the wheel
                            <ArrowRight
                              size={17}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  ) : (
                    /* ---------- ACTIVE CHALLENGE ---------- */
                    <motion.div
                      key={selectedChallenge._id || selectedChallenge.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-7"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#2A9D8F]/20 bg-[#EAF8F5] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#23867A]">
                          <CheckCircle2 size={13} className="text-[#2A9D8F]" />
                          Your challenge
                        </span>

                        {selectedTopic && (
                          <span className="rounded-full border border-[#CFE3F8] bg-[#EEF6FF] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#338DFD]">
                            {selectedTopic}
                          </span>
                        )}

                        {selectedChallenge.difficulty && (
                          <span className="rounded-full border border-[#D5E6E9] bg-[#F4FAFC] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#527086]">
                            {selectedChallenge.difficulty}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-5 font-serif text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-[#17213A] sm:text-4xl">
                        {selectedChallenge.title}
                      </h3>

                      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#566174] sm:text-base sm:leading-8">
                        {selectedChallenge.description}
                      </p>

                      {/* TASK CARD — tint follows the wheel segment */}
                      <div
                        className={`mt-6 rounded-2xl border p-4 sm:p-6 ${activeTone.panel}`}
                      >
                        <p
                          className={`text-[10px] font-bold uppercase tracking-[0.18em] ${activeTone.label}`}
                        >
                          Your task
                        </p>

                        <p className="mt-2 text-sm font-semibold leading-6 text-[#26384D] sm:text-base sm:leading-7">
                          {selectedChallenge.task}
                        </p>

                        {/* MCQ */}
                        {selectedChallenge.type === "mcq" &&
                          Array.isArray(selectedChallenge.options) && (
                            <div className="mt-5 space-y-2.5">
                              {selectedChallenge.options.map((option, index) => {
                                const isSelected = selectedOption === index;
                                const showCorrect =
                                  taskChecked &&
                                  answerStatus === "correct" &&
                                  isSelected;
                                const showWrong =
                                  answerStatus === "wrong" && isSelected;

                                return (
                                  <motion.button
                                    key={`${option}-${index}`}
                                    type="button"
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={taskChecked || isSubmitting || completed}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.08 * index }}
                                    whileHover={
                                      !taskChecked && !isSubmitting && !completed
                                        ? { x: 4 }
                                        : {}
                                    }
                                    whileTap={{ scale: 0.99 }}
                                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                                      showCorrect
                                        ? "border-[#2A9D8F]/60 bg-[#E8F7F4] text-[#1F7F73]"
                                        : showWrong
                                          ? "border-[#E58B8B]/60 bg-[#FFF1F1] text-[#B44E4E]"
                                          : isSelected
                                            ? index % 2 === 0
                                              ? "border-[#338DFD]/50 bg-[#E6F1FF] text-[#236CC0]"
                                              : "border-[#2A9D8F]/50 bg-[#E3F6F2] text-[#1F7F73]"
                                            : toneOf(index).option
                                    }`}
                                  >
                                    <span
                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        index % 2 === 0
                                          ? "bg-[#DCEBFD] text-[#2A78D6]"
                                          : "bg-[#D5F0EB] text-[#23867A]"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="flex-1 pt-0.5">{option}</span>
                                    {showCorrect && (
                                      <CheckCircle2 size={16} className="shrink-0 text-[#2A9D8F]" />
                                    )}
                                    {showWrong && (
                                      <span className="shrink-0 text-base font-bold text-[#C35C5C]">
                                        ×
                                      </span>
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          )}

                        {/* TEXT */}
                        {selectedChallenge.type === "text" && (
                          <div className="relative">
                            <textarea
                              value={taskInput}
                              onChange={(e) => {
                                if (taskChecked || isSubmitting || completed) return;
                                setTaskInput(e.target.value);
                                if (answerStatus) setAnswerStatus(null);
                                setEvaluationResult(null);
                                setSubmitError("");
                              }}
                              disabled={taskChecked || isSubmitting || completed}
                              rows={5}
                              placeholder={
                                selectedChallenge.placeholder ||
                                "Type your answer here…"
                              }
                              className="mt-5 w-full resize-none rounded-xl border border-[#D3E4F0] bg-white px-4 py-3 text-sm leading-6 text-[#26384D] outline-none transition-all placeholder:text-[#9AA5B0] focus:border-[#338DFD]/50 focus:ring-4 focus:ring-[#338DFD]/[0.08] disabled:bg-[#F3F8F6] sm:text-base sm:leading-7"
                            />
                            <p className="mt-2 text-right text-[11px] font-medium text-[#7A8795]">
                              {taskInput.trim()
                                ? `${taskInput.trim().split(/\s+/).length} words`
                                : "Write in your own words"}
                            </p>
                          </div>
                        )}

                        {/* ERRORS */}
                        <AnimatePresence>
                          {submitError && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="mt-4 rounded-xl border border-[#E8BABA] bg-[#FFF4F4] px-4 py-3"
                            >
                              <p className="text-xs font-semibold leading-5 text-[#B44E4E]">
                                ✕ {submitError}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* MCQ WRONG */}
                        <AnimatePresence mode="wait">
                          {answerStatus === "wrong" &&
                            selectedChallenge.type === "mcq" &&
                            evaluationResult && (
                              <motion.div
                                key="wrong"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 rounded-xl border border-[#E8BABA] bg-[#FFF4F4] px-4 py-3"
                              >
                                <p className="text-xs font-bold text-[#B44E4E]">
                                  Not quite. Try another answer.
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#8D6464]">
                                  {evaluationResult.feedback ||
                                    "Review the concept and pick again."}
                                </p>
                                <a
                                  href={challengeHelpLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#1a8f49] underline-offset-4 hover:underline"
                                >
                                  <MessageCircle size={13} />
                                  Ask Dr. Shivam Sir to explain this
                                </a>
                              </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ACTIONS */}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
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
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#338DFD] to-[#2A9D8F] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(51,141,253,0.18)] transition-shadow hover:shadow-[0_12px_28px_rgba(51,141,253,0.26)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                          >
                            {isSubmitting ? (
                              <>
                                <LoaderCircle size={16} className="animate-spin" />
                                Evaluating…
                              </>
                            ) : (
                              <>
                                <Zap size={16} />
                                Check answer
                              </>
                            )}
                          </motion.button>

                          <button
                            type="button"
                            onClick={spinWheel}
                            disabled={spinDisabled || isSubmitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#CFE3EC] bg-white px-5 py-3 text-sm font-semibold text-[#4B6076] transition-colors hover:bg-[#EEF6FF] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          >
                            <RotateCw size={15} />
                            Spin again
                          </button>
                        </div>

                        {/* WhatsApp help for this challenge */}
                        <a
                          href={challengeHelpLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#1a8f49] underline-offset-4 hover:underline sm:text-sm"
                        >
                          <MessageCircle size={15} />
                          Stuck? Ask Dr. Shivam Sir on WhatsApp
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A8795]">
                  <span>Weekly</span>
                  <span className="h-1 w-1 rounded-full bg-[#2A9D8F]" />
                  <span>Interactive</span>
                  <span className="h-1 w-1 rounded-full bg-[#338DFD]" />
                  <span>Skill-based</span>
                  <span className="h-1 w-1 rounded-full bg-[#2A9D8F]" />
                  <span>Free to try</span>
                </div>
              </div>
            </div>

            {/* ===============================================
                CONSULTATION STRIP — WhatsApp
            ================================================ */}
            <div className="flex flex-col items-start gap-4 border-t border-[#DCEBEF] bg-gradient-to-r from-[#EAF4FF] via-[#EEF9F7] to-[#E3F6F2] px-6 py-6 sm:px-10 md:flex-row md:items-center md:justify-between xl:px-14">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1FA855] shadow-sm">
                  <MessageCircle size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#17213A] sm:text-base">
                    Want guided practice beyond the wheel?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#566174] sm:text-sm">
                    Book a free consultation with Dr. Shivam Sir for the
                    English communication programme.
                  </p>
                </div>
              </div>

              <motion.a
                href={consultLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#1FA855] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(31,168,85,0.25)] md:w-auto"
              >
                <MessageCircle size={16} />
                Book free consultation
              </motion.a>
            </div>
          </div>
        </motion.div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs font-medium leading-5 text-[#687586]">
          A small challenge today can build a stronger skill tomorrow.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ChallengeFeature({ icon, title, description, tone = 0 }) {
  const t = toneOf(tone);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`flex items-start gap-3 rounded-2xl border p-3 transition-colors ${t.panel}`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${t.icon}`}
      >
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
   SOUND EFFECTS
========================================================= */

function playSound(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";

    const envelope = (peak, attack, end) => {
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + end);
    };

    let stopAt = 0.2;

    if (type === "spin") {
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(720, t + 0.18);
      envelope(0.08, 0.02, 0.22);
      stopAt = 0.24;
    } else if (type === "select") {
      osc.frequency.setValueAtTime(520, t);
      envelope(0.08, 0.02, 0.18);
    } else if (type === "success") {
      osc.frequency.setValueAtTime(523, t);
      osc.frequency.setValueAtTime(659, t + 0.1);
      osc.frequency.setValueAtTime(784, t + 0.2);
      envelope(0.08, 0.03, 0.4);
      stopAt = 0.42;
    } else if (type === "error") {
      osc.frequency.setValueAtTime(220, t);
      envelope(0.05, 0.02, 0.18);
    }

    osc.start();
    osc.stop(t + stopAt);
    osc.onended = () => ctx.close();
  } catch {
    // Audio is optional.
  }
}