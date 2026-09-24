import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  Lightbulb,
  LoaderCircle,
  Share2,
  Target,
  TrendingUp,
  Trophy,
  Sparkles,
  Star,
  Award,
  CalendarDays,
} from "lucide-react";

import jashnaLogo from "../assets/images/logo.webp";

const STORAGE_KEY = "jashnaWeeklyAnalysis";

/* =========================================================
   DECORATIVE PARTICLES
========================================================= */

const particles = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${2 + ((index * 19) % 96)}%`,
  top: `${5 + ((index * 31) % 88)}%`,
  size: `${2 + (index % 4)}px`,
  delay: `${(index % 10) * 0.22}s`,
  duration: `${4.5 + (index % 5) * 0.7}s`,
}));

const confettiPieces = Array.from({ length: 38 }, (_, index) => ({
  id: index,
  left: `${3 + ((index * 17) % 94)}%`,
  delay: `${(index % 9) * 0.18}s`,
  duration: `${4 + (index % 5) * 0.5}s`,
  rotation: `${(index * 47) % 360}deg`,
  size: `${5 + (index % 4) * 2}px`,
}));

/* =========================================================
   MAIN COMPONENT
========================================================= */

const WeeklyResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const achievementRef = useRef(null);

  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const analysisData = useMemo(() => {
    if (
      location.state &&
      location.state.challenge &&
      location.state.completion
    ) {
      return location.state;
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Unable to read weekly analysis:", error);
      return null;
    }
  }, [location.state]);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] text-[#10205f]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-[34px] border border-white bg-white p-10 text-center shadow-[0_30px_100px_rgba(16,32,95,0.14)]"
          >
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#10205f] shadow-[0_15px_40px_rgba(16,32,95,0.22)]">
              <Target size={28} className="text-white" />
            </div>

            <h1 className="mt-7 text-2xl font-bold">
              No challenge result found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Complete a Weekly Challenge first and your personalised learning
              report will appear here.
            </p>

            <button
              onClick={() => navigate("/weekly-challenge")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#10205f] px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Back to Weekly Challenge
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const { challenge = {}, completion = {} } = analysisData;

  const score = Math.min(100, Math.max(0, Number(completion.score ?? 0)));
  const metrics = completion.evaluation?.metrics || {};
  const strengths = completion.evaluation?.strengths || [];
  const areasToImprove = completion.evaluation?.areasToImprove || [];
  const suggestions = completion.evaluation?.suggestions || [];

  const isAI =
    completion.evaluationMode === "ai" || completion.evaluator === "ai";

  const isMCQ = challenge.type === "mcq";

  const getScoreLabel = () => {
    if (score >= 90) return "Outstanding Progress";
    if (score >= 80) return "Excellent Progress";
    if (score >= 70) return "Great Progress";
    if (score >= 50) return "Good Start";
    return "Every Attempt Counts";
  };

  const scoreLabel = getScoreLabel();

  const getScoreMessage = () => {
    if (score >= 90)
      return "Your effort is showing. Keep building on this momentum.";
    if (score >= 80) return "You are developing strong communication skills.";
    if (score >= 70)
      return "You are moving in the right direction. Keep practising.";
    if (score >= 50)
      return "Every practice session brings you one step closer.";
    return "Keep practising — progress begins with every attempt.";
  };

  const scoreMessage = getScoreMessage();

  const metricItems = [
    { label: "Grammar", value: metrics.grammar },
    { label: "Vocabulary", value: metrics.vocabulary },
    { label: "Relevance", value: metrics.relevance },
    { label: "Clarity", value: metrics.clarity },
  ].filter((item) => typeof item.value === "number");

  const completedDate = analysisData.completedAt
    ? new Date(analysisData.completedAt)
    : new Date();

  const formattedDate = completedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const shortDate = completedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  /* =======================================================
     DOWNLOAD
  ======================================================== */

  const handleDownload = async () => {
    if (!achievementRef.current || downloading) return;

    try {
      setDownloading(true);

      const dataUrl = await toPng(achievementRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#061a50",
        width: 1200,
        height: 900,
      });

      const link = document.createElement("a");
      link.download = `jashna-edu-weekly-achievement-${score}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Achievement download failed:", error);
      alert("Unable to download the achievement right now.");
    } finally {
      setDownloading(false);
    }
  };

  /* =======================================================
     SHARE
  ======================================================== */

  const handleShare = async () => {
    if (!achievementRef.current || sharing) return;

    try {
      setSharing(true);

      const dataUrl = await toPng(achievementRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#061a50",
        width: 1200,
        height: 900,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const file = new File(
        [blob],
        `jashna-edu-weekly-achievement-${score}.png`,
        { type: "image/png" },
      );

      if (
        navigator.share &&
        (!navigator.canShare ||
          navigator.canShare({
            files: [file],
          }))
      ) {
        await navigator.share({
          title: "My Jashna Edu Weekly Challenge Result",
          text: `I scored ${score}/100 in a Jashna Edu Weekly Challenge.`,
          files: [file],
        });
      } else {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(
            `I scored ${score}/100 in a Jashna Edu Weekly Challenge with Jashna Edu.`,
          );
        }

        alert(
          "Your result is ready. This browser does not support image sharing, so the result text has been copied.",
        );
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleNewChallenge = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    navigate("/weekly-challenge");
  };

  return (
    <>
      <style>{`
        @keyframes resultFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -16px, 0); }
        }

        @keyframes resultFloatSide {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(10px, -10px, 0) rotate(5deg); }
        }

        @keyframes resultPulse {
          0%, 100% { opacity: .25; transform: scale(.96); }
          50% { opacity: .72; transform: scale(1.08); }
        }

        @keyframes resultShimmer {
          0% { transform: translateX(-140%) skewX(-18deg); }
          100% { transform: translateX(260%) skewX(-18deg); }
        }

        @keyframes resultOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes resultSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes resultTwinkle {
          0%, 100% { opacity: .25; transform: scale(.65); }
          50% { opacity: 1; transform: scale(1.35); }
        }

        @keyframes resultConfetti {
          0% {
            opacity: 0;
            transform: translate3d(0, -40px, 0) rotate(0deg);
          }
          12% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate3d(25px, 500px, 0) rotate(540deg);
          }
        }

        @keyframes resultBorderGlow {
          0%, 100% { opacity: .45; }
          50% { opacity: 1; }
        }

        .result-float { animation: resultFloat 6s ease-in-out infinite; }
        .result-float-side { animation: resultFloatSide 7s ease-in-out infinite; }
        .result-pulse { animation: resultPulse 4s ease-in-out infinite; }
        .result-shimmer { animation: resultShimmer 5.5s ease-in-out infinite; }
        .result-orbit { animation: resultOrbit 18s linear infinite; }
        .result-orbit-reverse { animation: resultSpinReverse 24s linear infinite; }
        .result-twinkle { animation: resultTwinkle 2.6s ease-in-out infinite; }
        .result-confetti { animation: resultConfetti 5s ease-in infinite; }
        .result-border-glow { animation: resultBorderGlow 3s ease-in-out infinite; }

        .result-card-hover {
          transition:
            transform .45s cubic-bezier(.22,1,.36,1),
            box-shadow .45s ease,
            border-color .45s ease;
        }

        .result-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 80px rgba(16,32,95,.13);
          border-color: rgba(114,201,194,.5);
        }

        .result-button {
          transition:
            transform .3s cubic-bezier(.22,1,.36,1),
            box-shadow .3s ease,
            background .3s ease;
        }

        .result-button:hover {
          transform: translateY(-3px);
        }

        @media (prefers-reduced-motion: reduce) {
          .result-float,
          .result-float-side,
          .result-pulse,
          .result-shimmer,
          .result-orbit,
          .result-orbit-reverse,
          .result-twinkle,
          .result-confetti,
          .result-border-glow {
            animation: none !important;
          }
        }
      `}</style>

      <main className="relative min-h-screen overflow-hidden bg-[#f6f9ff] text-[#10205f]">
        {/* ===================================================
            BACKGROUND
        ==================================================== */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-48 h-[600px] w-[600px] rounded-full bg-[#cfe6ff]/65 blur-3xl" />
          <div className="absolute -right-44 top-[16%] h-[560px] w-[560px] rounded-full bg-[#efd9ee]/60 blur-3xl" />
          <div className="absolute bottom-[-260px] left-[28%] h-[650px] w-[650px] rounded-full bg-[#d6f3ef]/55 blur-3xl" />

          {particles.map((particle) => (
            <span
              key={particle.id}
              className="result-twinkle absolute rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                background:
                  particle.id % 3 === 0
                    ? "#1769d3"
                    : particle.id % 3 === 1
                      ? "#d98bb4"
                      : "#d7a64e",
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>

        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:px-14">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#bfe4e2] bg-white/80 px-5 py-7.5 text-[9px] font-extrabold uppercase tracking-[0.27em] text-[#347681] shadow-[0_10px_30px_rgba(50,118,129,.08)] backdrop-blur"
            >
              <CheckCircle2 size={14} />
              Challenge Completed
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="mt-7 text-4xl font-bold leading-[.98] tracking-[-0.055em] text-[#10205f] sm:text-6xl lg:text-[76px]"
            >
              Look how far{" "}
              <span className="relative inline-block bg-gradient-to-r from-[#1769d3] via-[#287bd8] to-[#a04b86] bg-clip-text text-transparent">
                you've come.
                <span className="absolute -bottom-3 left-[5%] h-[4px] w-[90%] rounded-full bg-gradient-to-r from-[#1769d3] via-[#72c9c2] to-[#d98bb4]" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base"
            >
              One challenge completed. One more step towards stronger, more
              confident communication.
            </motion.p>
          </div>
        </section>

        {/* ===================================================
            ACHIEVEMENT SHOWCASE
        ==================================================== */}

        <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="relative mx-auto max-w-6xl">
            {/* Ambient glow */}

            <div className="result-pulse absolute -inset-10 rounded-[70px] bg-gradient-to-r from-[#1769d3]/10 via-[#72c9c2]/15 to-[#d98bb4]/10 blur-3xl" />

            {/* Celebration confetti */}

            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[500px] overflow-hidden">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="result-confetti absolute top-0 block rounded-sm"
                  style={{
                    left: piece.left,
                    width: piece.size,
                    height: `${Number(piece.size) + 5}px`,
                    background:
                      piece.id % 4 === 0
                        ? "#1769d3"
                        : piece.id % 4 === 1
                          ? "#d98bb4"
                          : piece.id % 4 === 2
                            ? "#d7a64e"
                            : "#72c9c2",
                    animationDelay: piece.delay,
                    animationDuration: piece.duration,
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 45, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.9,
                delay: 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[42px] border border-white/90 bg-white/80 p-3 shadow-[0_35px_110px_rgba(16,32,95,.14)] backdrop-blur-2xl sm:p-5 lg:p-6">
                <div className="relative overflow-hidden rounded-[34px] bg-[#061a50] shadow-[inset_0_0_80px_rgba(0,0,0,.15)]">
                  {/* Bright background fields */}

                  <div className="absolute -left-28 top-[-160px] h-[430px] w-[430px] rounded-full bg-[#1769d3]/30 blur-3xl" />
                  <div className="absolute right-[-130px] top-[-90px] h-[430px] w-[430px] rounded-full bg-[#5ee7d3]/20 blur-3xl" />
                  <div className="absolute bottom-[-210px] left-[28%] h-[450px] w-[450px] rounded-full bg-[#9c4dca]/20 blur-3xl" />

                  {/* diagonal light sweep */}

                  <div className="absolute inset-y-0 left-[-20%] w-[22%] result-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* luminous horizon */}

                  <div className="absolute bottom-[18%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#72c9c2]/60 to-transparent" />

                  {/* decorative orbit system */}

                  <div className="pointer-events-none absolute left-[50%] top-[50%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-70 sm:h-[650px] sm:w-[650px]">
                    <div className="result-orbit absolute inset-0 rounded-full border border-[#4bcde3]/20" />
                    <div className="result-orbit-reverse absolute inset-[48px] rounded-full border border-[#a56de4]/15" />
                    <div className="absolute inset-[105px] rounded-full border border-white/[.07]" />

                    <span className="absolute left-[7%] top-[15%] h-2.5 w-2.5 rounded-full bg-[#72c9c2] shadow-[0_0_18px_#72c9c2]" />
                    <span className="absolute right-[13%] top-[25%] h-2 w-2 rounded-full bg-[#d98bb4] shadow-[0_0_18px_#d98bb4]" />
                    <span className="absolute bottom-[17%] right-[18%] h-2.5 w-2.5 rounded-full bg-[#f2c866] shadow-[0_0_18px_#f2c866]" />
                  </div>

                  {/* small stars */}

                  <span className="absolute left-[10%] top-[20%] text-[#72c9c2]">
                    ✦
                  </span>
                  <span className="absolute right-[8%] top-[32%] text-[#f2c866]">
                    ✦
                  </span>
                  <span className="absolute left-[19%] bottom-[27%] text-[#d98bb4]">
                    ✦
                  </span>

                  <div className="relative z-10 min-h-[620px] px-5 py-10 sm:min-h-[680px] sm:px-10 sm:py-12 lg:min-h-[710px] lg:px-14 lg:py-14">
                    {/* top row — NO LOGO HERE */}

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#6de0d5]/25 bg-[#6de0d5]/[.07] px-4 py-2 text-[8px] font-extrabold uppercase tracking-[.28em] text-[#8ee8df]">
                          <Trophy size={12} />
                          Achievement Unlocked
                        </div>

                        <p className="mt-4 text-[8px] font-bold uppercase tracking-[.30em] text-white/35">
                          Jashna Edu · Weekly Learning Challenge
                        </p>
                      </div>

                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                          rotate: [0, -5, 5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="hidden h-14 w-14 items-center justify-center rounded-[20px] border border-white/15 bg-white/[.07] shadow-[0_0_35px_rgba(114,201,194,.12)] backdrop-blur sm:flex"
                      >
                        <Sparkles size={22} className="text-[#f2c866]" />
                      </motion.div>
                    </div>

                    {/* main showcase */}

                    <div className="mt-12 grid items-center gap-10 lg:grid-cols-[.75fr_1.4fr_.75fr] lg:gap-6">
                      {/* left motivational message */}

                      <motion.div
                        initial={{ opacity: 0, x: -25 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="hidden text-left lg:block"
                      >
                        <p className="font-[cursive] text-5xl italic leading-[.95] text-white/95">
                          You did it!
                        </p>

                        <div className="mt-3 h-1 w-32 rotate-[-5deg] rounded-full bg-gradient-to-r from-[#72e5d8] to-[#a8f2e9]" />

                        <p className="mt-6 max-w-[220px] text-sm leading-6 text-white/55">
                          Your hard work, practice and dedication have paid off.
                        </p>

                        <div className="mt-8 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#72c9c2] shadow-[0_0_12px_#72c9c2]" />
                          <span className="h-2 w-2 rounded-full bg-[#d98bb4] shadow-[0_0_12px_#d98bb4]" />
                          <span className="h-2 w-2 rounded-full bg-[#f2c866] shadow-[0_0_12px_#f2c866]" />
                        </div>
                      </motion.div>

                      {/* score */}

                      <div className="text-center">
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.45 }}
                          className="text-[9px] font-extrabold uppercase tracking-[.38em] text-[#82e5db]"
                        >
                          Your Achievement
                        </motion.p>

                        <div className="relative mx-auto mt-6 flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
                          {/* glow */}

                          <div className="result-pulse absolute inset-8 rounded-full bg-[#36c7e7]/20 blur-2xl" />

                          <div className="result-orbit absolute inset-1 rounded-full border border-[#53d6ea]/25" />
                          <div className="result-orbit-reverse absolute inset-5 rounded-full border border-[#a86ee9]/20" />

                          <svg
                            className="absolute inset-0 h-full w-full -rotate-90"
                            viewBox="0 0 100 100"
                          >
                            <defs>
                              <linearGradient
                                id="liveScoreGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#39bfff" />
                                <stop offset="48%" stopColor="#72f4df" />
                                <stop offset="100%" stopColor="#b86cff" />
                              </linearGradient>

                              <filter id="liveScoreGlow">
                                <feGaussianBlur
                                  stdDeviation="1.7"
                                  result="blur"
                                />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>

                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="rgba(4,18,59,.38)"
                              stroke="rgba(255,255,255,.07)"
                              strokeWidth="4"
                            />

                            <motion.circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="url(#liveScoreGradient)"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                              strokeDasharray="251.2"
                              initial={{ strokeDashoffset: 251.2 }}
                              animate={{
                                strokeDashoffset: 251.2 - (251.2 * score) / 100,
                              }}
                              transition={{
                                duration: 1.8,
                                delay: 0.55,
                                ease: "easeOut",
                              }}
                              filter="url(#liveScoreGlow)"
                            />
                          </svg>

                          <div className="relative z-10">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.45 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                duration: 0.9,
                                delay: 0.75,
                                type: "spring",
                                stiffness: 110,
                              }}
                              className="text-7xl font-black leading-none tracking-[-.08em] text-white drop-shadow-[0_5px_25px_rgba(255,255,255,.18)] sm:text-8xl"
                            >
                              {score}
                            </motion.div>

                            <p className="mt-3 text-sm font-semibold text-[#7fe5dd]">
                              out of 100
                            </p>
                          </div>
                        </div>

                        <motion.h2
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, delay: 1 }}
                          className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                        >
                          {scoreLabel}
                        </motion.h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/48">
                          {challenge.title || "Weekly Challenge"}
                        </p>
                      </div>

                      {/* right benefit stack */}

                      <motion.div
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.55 }}
                        className="hidden space-y-3 lg:block"
                      >
                        <DownloadBenefit
                          icon={<CheckCircle2 size={19} />}
                          title="Clearer Communication"
                          subtitle="Express ideas with confidence"
                          glow="blue"
                        />

                        <DownloadBenefit
                          icon={<Star size={19} />}
                          title="Stronger Confidence"
                          subtitle="Build skill through practice"
                          glow="green"
                        />

                        <DownloadBenefit
                          icon={<TrendingUp size={19} />}
                          title="Better Opportunities"
                          subtitle="Keep moving towards your goals"
                          glow="purple"
                        />

                        <DownloadBenefit
                          icon={<Award size={19} />}
                          title="A Brighter Future"
                          subtitle="Small wins become big progress"
                          glow="pink"
                        />
                      </motion.div>
                    </div>

                    {/* mobile motivation */}

                    <div className="mt-8 text-center lg:hidden">
                      <p className="font-[cursive] text-3xl italic text-white/90">
                        You did it!
                      </p>
                      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/50">
                        Your hard work, practice and dedication are building
                        something bigger.
                      </p>
                    </div>

                    {/* bottom information glass bar */}

                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 1.05 }}
                      className="mt-10 rounded-[24px] border border-white/15 bg-white/[.075] p-2 shadow-[0_18px_55px_rgba(0,0,0,.18)] backdrop-blur-xl sm:mt-12"
                    >
                      <div className="grid gap-1 sm:grid-cols-3">
                        <DownloadShowcaseDetail
                          icon={<Target size={19} />}
                          label="Category"
                          value={
                            challenge.label ||
                            completion.evaluationCategory ||
                            "LEARNING"
                          }
                        />

                        <DownloadShowcaseDetail
                          icon={<CalendarDays size={19} />}
                          label="Completed On"
                          value={formattedDate}
                        />

                        <DownloadShowcaseDetail
                          icon={<Award size={19} />}
                          label="Difficulty Level"
                          value={challenge.difficulty || "Intermediate"}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ACTION BUTTONS */}

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="relative z-30 mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="result-button group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#10205f] px-8 py-4 text-sm font-bold text-white shadow-[0_16px_40px_rgba(16,32,95,.22)] hover:shadow-[0_22px_50px_rgba(16,32,95,.27)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {downloading ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Download
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-y-0.5"
                  />
                )}
                {downloading ? "Preparing..." : "Download Achievement"}
              </button>

              <button
                onClick={handleShare}
                disabled={sharing}
                className="result-button group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#cedbee] bg-white/90 px-8 py-4 text-sm font-bold text-[#10205f] shadow-[0_10px_30px_rgba(16,32,95,.06)] backdrop-blur hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {sharing ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Share2
                    size={17}
                    className="transition-transform duration-300 group-hover:rotate-6"
                  />
                )}
                {sharing ? "Preparing..." : "Share Achievement"}
              </button>
            </motion.div>
          </div>
        </section>

        {/* ===================================================
            RESPONSE + INSIGHT
        ==================================================== */}

        <section className="relative z-10 mx-auto mt-24 max-w-6xl px-5 sm:px-8 lg:px-0">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[.28em] text-[#9b4778]">
                Your learning snapshot
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.035em] text-[#10205f] sm:text-4xl">
                More than a score.
              </h2>
            </div>

            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_12px_35px_rgba(16,32,95,.08)] sm:flex">
              <Sparkles size={19} className="text-[#d7a64e]" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.65 }}
            className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"
          >
            {/* Challenge response card */}

            <div className="result-card-hover relative overflow-hidden rounded-[32px] border border-white bg-white/80 p-7 shadow-[0_20px_70px_rgba(16,32,95,.07)] backdrop-blur-xl sm:p-9">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#dcecff] blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[.18em] text-[#1769d3]">
                      <Target size={12} />
                      The Challenge
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-[#10205f] sm:text-2xl">
                      {challenge.title || "Weekly Challenge"}
                    </h2>
                  </div>

                  <div className="hidden h-12 w-12 items-center justify-center rounded-[18px] bg-[#10205f] text-white shadow-[0_10px_25px_rgba(16,32,95,.18)] sm:flex">
                    <Target size={19} />
                  </div>
                </div>

                {challenge.description && (
                  <p className="mt-5 text-sm leading-7 text-slate-500">
                    {challenge.description}
                  </p>
                )}

                <div className="relative mt-7 overflow-hidden rounded-[23px] border border-[#e5eaf3] bg-[#f7f9fd] p-5">
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#1769d3] via-[#72c9c2] to-[#d98bb4]" />

                  <p className="text-[8px] font-extrabold uppercase tracking-[.22em] text-slate-400">
                    Your response
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#39445f]">
                    {completion.answer || "No response recorded."}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f5e7ef] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.15em] text-[#9b4778]">
                    {challenge.label ||
                      completion.evaluationCategory ||
                      "Learning"}
                  </span>

                  {challenge.difficulty && (
                    <span className="rounded-full bg-[#eef2f7] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">
                      {challenge.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Insight card */}

            <div className="result-card-hover relative overflow-hidden rounded-[32px] border border-white bg-gradient-to-br from-white to-[#fffaf2] p-7 shadow-[0_20px_70px_rgba(16,32,95,.07)] backdrop-blur-xl sm:p-9">
              <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[#f4d5e5]/60 blur-3xl" />

              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#fff0d2] text-[#b47b28] shadow-sm">
                    <Lightbulb size={20} />
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#d98bb4]" />
                  </div>

                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[.22em] text-[#b47b28]">
                      Learning Insight
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[#10205f] sm:text-2xl">
                      Keep this in mind
                    </h2>
                  </div>
                </div>

                <div className="mt-7 rounded-[23px] border border-[#efe5d5] bg-white/70 p-5 shadow-sm">
                  <p className="text-sm leading-7 text-slate-600">
                    {completion.feedback ||
                      (completion.isCorrect
                        ? "You completed the challenge successfully."
                        : "Keep practising and use the learning points below to improve.")}
                  </p>
                </div>

                {isMCQ && (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#cde9df] bg-[#effaf6] px-4 py-2.5 text-xs font-bold text-[#326d78]">
                    <Check size={14} />
                    {completion.isCorrect
                      ? "Answer correct"
                      : "Challenge completed"}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ===================================================
            AI METRICS
        ==================================================== */}

        {isAI && metricItems.length > 0 && (
          <section className="relative z-10 mx-auto mt-7 max-w-6xl px-5 sm:px-8 lg:px-0">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.65 }}
              className="relative overflow-hidden rounded-[34px] border border-white bg-[#10205f] p-7 shadow-[0_25px_80px_rgba(16,32,95,.14)] sm:p-9"
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1769d3]/40 blur-3xl" />
              <div className="absolute -bottom-28 left-[35%] h-72 w-72 rounded-full bg-[#72c9c2]/20 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/[.08] text-[#82e5db]">
                      <TrendingUp size={20} />
                    </div>

                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[.22em] text-[#d98bb4]">
                        AI Language Analysis
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                        A closer look at your response
                      </h2>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#72c9c2]/20 bg-[#72c9c2]/10 px-4 py-2 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#8ee8df]">
                    Personalised feedback
                  </span>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {metricItems.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.45,
                        delay: index * 0.08,
                      }}
                      className="rounded-[22px] border border-white/10 bg-white/[.07] p-5 backdrop-blur"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-white/60">
                          {metric.label}
                        </span>

                        <span className="text-lg font-black text-white">
                          {metric.value}
                        </span>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${Math.min(
                              100,
                              Math.max(0, metric.value),
                            )}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.1,
                            delay: 0.25 + index * 0.1,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-[#39bfff] via-[#72e5d8] to-[#c47bf2]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* ===================================================
            FEEDBACK CARDS
        ==================================================== */}

        {(strengths.length > 0 ||
          areasToImprove.length > 0 ||
          suggestions.length > 0) && (
          <section className="relative z-10 mx-auto mt-7 grid max-w-6xl gap-5 px-5 sm:px-8 lg:grid-cols-3 lg:px-0">
            {strengths.length > 0 && (
              <FeedbackColumn
                icon={<Star size={18} />}
                eyebrow="Strengths"
                title="What went well"
                items={strengths}
                iconClass="bg-[#e8faf7] text-[#267b74]"
                accent="from-[#72c9c2] to-[#39bfff]"
              />
            )}

            {areasToImprove.length > 0 && (
              <FeedbackColumn
                icon={<TrendingUp size={18} />}
                eyebrow="Growth Area"
                title="What to improve"
                items={areasToImprove}
                iconClass="bg-[#f7e8f0] text-[#9b4778]"
                accent="from-[#d98bb4] to-[#a86de2]"
              />
            )}

            {suggestions.length > 0 && (
              <FeedbackColumn
                icon={<Lightbulb size={18} />}
                eyebrow="Next Steps"
                title="How to practise"
                items={suggestions}
                iconClass="bg-[#fff1d5] text-[#a7762d]"
                accent="from-[#f2c866] to-[#d98bb4]"
              />
            )}
          </section>
        )}

        {/* ===================================================
            FINAL CTA
        ==================================================== */}

        <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-8 lg:px-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[38px] border border-white bg-white/80 px-6 py-12 text-center shadow-[0_25px_85px_rgba(16,32,95,.08)] backdrop-blur-xl sm:px-10 sm:py-14"
          >
            <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[#d9eaff] blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-[#f3d9e7] blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#fff1d4] to-[#f6dfe9] text-[#a7762d] shadow-sm">
                <Sparkles size={22} />
              </div>

              <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[.28em] text-[#9b4778]">
                Keep the momentum going
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-.04em] text-[#10205f] sm:text-4xl">
                Your next challenge is waiting.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
                Keep practising, keep reflecting, and keep building stronger
                communication skills one challenge at a time.
              </p>

              <button
                onClick={handleNewChallenge}
                className="result-button mt-8 inline-flex items-center gap-2 rounded-full bg-[#10205f] px-8 py-4 text-sm font-bold text-white shadow-[0_14px_35px_rgba(16,32,95,.18)] hover:shadow-[0_20px_45px_rgba(16,32,95,.23)]"
              >
                Try Another Challenge
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </section>

        {/* ===================================================
            HIDDEN DOWNLOAD CARD
            LOGO #2 — ONLY HERE
        ==================================================== */}

        <div
          style={{
            position: "fixed",
            left: "-300vw",
            top: 0,
            width: "1200px",
            height: "900px",
            pointerEvents: "none",
            zIndex: -10,
          }}
        >
          <div
            ref={achievementRef}
            style={{
              width: "1200px",
              height: "900px",
              position: "relative",
              overflow: "hidden",
              background:
                "radial-gradient(circle at 50% 48%, #123f9d 0%, #09245f 34%, #061a50 72%, #041338 100%)",
              color: "#ffffff",
              fontFamily:
                "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {/* luminous fields */}

            <div
              style={{
                position: "absolute",
                width: "650px",
                height: "650px",
                left: "270px",
                top: "90px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(47,185,255,.22) 0%, rgba(47,185,255,.07) 40%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: "520px",
                height: "520px",
                right: "-150px",
                top: "-170px",
                borderRadius: "50%",
                background: "rgba(86,236,215,.20)",
                filter: "blur(25px)",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: "520px",
                height: "520px",
                left: "-190px",
                bottom: "-240px",
                borderRadius: "50%",
                background: "rgba(164,92,230,.18)",
                filter: "blur(28px)",
              }}
            />

            {/* soft light beams */}

            <div
              style={{
                position: "absolute",
                right: "-50px",
                top: "-100px",
                width: "420px",
                height: "850px",
                transform: "rotate(28deg)",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)",
                filter: "blur(25px)",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "-70px",
                bottom: "-120px",
                width: "300px",
                height: "520px",
                transform: "rotate(-25deg)",
                background:
                  "linear-gradient(90deg, transparent, rgba(114,201,194,.11), transparent)",
                filter: "blur(22px)",
              }}
            />

            {/* orbit rings */}

            <div
              style={{
                position: "absolute",
                left: "410px",
                top: "125px",
                width: "380px",
                height: "380px",
                borderRadius: "50%",
                border: "2px solid rgba(57,191,255,.22)",
                boxShadow:
                  "0 0 35px rgba(57,191,255,.10), inset 0 0 35px rgba(57,191,255,.06)",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "432px",
                top: "147px",
                width: "336px",
                height: "336px",
                borderRadius: "50%",
                border: "1px solid rgba(114,229,216,.18)",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "458px",
                top: "173px",
                width: "284px",
                height: "284px",
                borderRadius: "50%",
                border: "1px solid rgba(168,109,226,.15)",
              }}
            />

            {/* top badge */}

            <div
              style={{
                position: "absolute",
                left: "420px",
                top: "34px",
                width: "360px",
                height: "50px",
                borderRadius: "999px",
                border: "1px solid rgba(75,205,255,.65)",
                background:
                  "linear-gradient(90deg, rgba(35,133,255,.15), rgba(88,240,220,.10), rgba(178,106,246,.15))",
                boxShadow:
                  "0 0 30px rgba(50,183,255,.18), inset 0 0 25px rgba(255,255,255,.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "13px",
              }}
            >
              <Trophy size={22} color="#73dff4" />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "4px",
                  color: "#8ce7ff",
                }}
              >
                ACHIEVEMENT UNLOCKED
              </span>
            </div>

            {/* LOGO — SECOND AND FINAL LOGO INSTANCE */}

            <img
              src={jashnaLogo}
              alt="Jashna Edu"
              style={{
                position: "absolute",
                left: "58px",
                top: "42px",
                height: "62px",
                width: "auto",
                objectFit: "contain",
              }}
            />

            {/* logo caption */}

            <div
              style={{
                position: "absolute",
                left: "60px",
                top: "112px",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.40)",
              }}
            >
              Weekly Learning Challenge
            </div>

            {/* left message */}

            <div
              style={{
                position: "absolute",
                left: "62px",
                top: "270px",
                width: "250px",
              }}
            >
              <div
                style={{
                  fontFamily: "cursive",
                  fontStyle: "italic",
                  fontSize: "48px",
                  lineHeight: ".95",
                  color: "#ffffff",
                  textShadow: "0 5px 25px rgba(88,225,255,.12)",
                }}
              >
                You did it!
              </div>

              <div
                style={{
                  width: "142px",
                  height: "5px",
                  marginTop: "10px",
                  marginLeft: "8px",
                  borderRadius: "999px",
                  transform: "rotate(-5deg)",
                  background:
                    "linear-gradient(90deg, #6ce8d9, #57d8ff, #c681ee)",
                  boxShadow: "0 0 18px rgba(91,225,220,.35)",
                }}
              />

              <div
                style={{
                  marginTop: "28px",
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,.62)",
                }}
              >
                Your hard work,
                <br />
                practice and dedication
                <br />
                have paid off.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "9px",
                  marginTop: "28px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#73e6d9",
                    boxShadow: "0 0 14px #73e6d9",
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#f2c866",
                    boxShadow: "0 0 14px #f2c866",
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#d98bb4",
                    boxShadow: "0 0 14px #d98bb4",
                  }}
                />
              </div>
            </div>

            {/* score title */}

            <div
              style={{
                position: "absolute",
                left: "465px",
                top: "126px",
                width: "270px",
                textAlign: "center",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "4px",
                color: "#7fe4dc",
              }}
            >
              YOUR ACHIEVEMENT
            </div>

            {/* score glow */}

            <div
              style={{
                position: "absolute",
                left: "420px",
                top: "135px",
                width: "360px",
                height: "360px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(63,199,255,.13), transparent 68%)",
                filter: "blur(12px)",
              }}
            />

            {/* score ring */}

            <svg
              width="380"
              height="380"
              viewBox="0 0 100 100"
              style={{
                position: "absolute",
                left: "400px",
                top: "130px",
                transform: "rotate(-90deg)",
                overflow: "visible",
              }}
            >
              <defs>
                <linearGradient
                  id="downloadScoreGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#39bfff" />
                  <stop offset="48%" stopColor="#72f4df" />
                  <stop offset="100%" stopColor="#c477f2" />
                </linearGradient>

                <filter id="downloadGlow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle
                cx="50"
                cy="50"
                r="40"
                fill="rgba(2,15,50,.48)"
                stroke="rgba(255,255,255,.08)"
                strokeWidth="3"
              />

              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#downloadScoreGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                filter="url(#downloadGlow)"
              />
            </svg>

            {/* score number */}

            <div
              style={{
                position: "absolute",
                left: "455px",
                top: "255px",
                width: "270px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "108px",
                  lineHeight: ".85",
                  fontWeight: 900,
                  letterSpacing: "-7px",
                  textShadow: "0 8px 35px rgba(0,0,0,.18)",
                }}
              >
                {score}
              </div>

              <div
                style={{
                  marginTop: "18px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#7fe5dd",
                }}
              >
                out of 100
              </div>
            </div>

            {/* score result */}

            <div
              style={{
                position: "absolute",
                left: "400px",
                top: "505px",
                width: "380px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "29px",
                  fontWeight: 800,
                  color: "#ffffff",
                }}
              >
                {scoreLabel}
              </div>

              <div
                style={{
                  marginTop: "9px",
                  fontSize: "13px",
                  color: "rgba(255,255,255,.56)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {challenge.title || "Weekly Learning Challenge"}
              </div>
            </div>

            {/* right benefits */}

            <div
              style={{
                position: "absolute",
                right: "48px",
                top: "180px",
                width: "270px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <DownloadBenefitStatic
                icon={<CheckCircle2 size={21} color="#6ec9ff" />}
                title="Clearer Communication"
                subtitle="Express ideas with confidence"
              />

              <DownloadBenefitStatic
                icon={<Star size={21} color="#6de0d5" />}
                title="Stronger Confidence"
                subtitle="Build skill through practice"
              />

              <DownloadBenefitStatic
                icon={<TrendingUp size={21} color="#bd78ff" />}
                title="Better Opportunities"
                subtitle="Keep moving towards your goals"
              />

              <DownloadBenefitStatic
                icon={<Award size={21} color="#ef8fc5" />}
                title="A Brighter Future"
                subtitle="Small wins become big progress"
              />
            </div>

            {/* bottom glass strip */}

            <div
              style={{
                position: "absolute",
                left: "52px",
                right: "52px",
                bottom: "38px",
                height: "105px",
                borderRadius: "25px",
                border: "1px solid rgba(117,215,255,.22)",
                background:
                  "linear-gradient(90deg, rgba(33,95,188,.70), rgba(29,83,170,.78), rgba(55,83,191,.62))",
                boxShadow:
                  "0 20px 45px rgba(0,0,0,.20), inset 0 0 30px rgba(255,255,255,.035)",
                backdropFilter: "blur(15px)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                alignItems: "center",
              }}
            >
              <DownloadShowcaseDetailStatic
                icon={<Target size={22} color="#73e4dd" />}
                label="CATEGORY"
                value={
                  challenge.label || completion.evaluationCategory || "LEARNING"
                }
              />

              <DownloadShowcaseDetailStatic
                icon={<CalendarDays size={22} color="#73cfff" />}
                label="COMPLETED ON"
                value={formattedDate}
                bordered
              />

              <DownloadShowcaseDetailStatic
                icon={<Award size={22} color="#c993ff" />}
                label="DIFFICULTY LEVEL"
                value={challenge.difficulty || "Intermediate"}
                bordered={false}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

/* =========================================================
   DOWNLOAD BENEFIT
========================================================= */

const DownloadBenefit = ({ icon, title, subtitle, glow }) => {
  const glowMap = {
    blue: "from-[#1769d3]/30 to-[#39bfff]/10 text-[#74d8ff]",
    green: "from-[#37bcae]/30 to-[#72e5d8]/10 text-[#72e5d8]",
    purple: "from-[#8d50d8]/30 to-[#bd78ff]/10 text-[#c38cff]",
    pink: "from-[#b14f91]/30 to-[#ef8fc5]/10 text-[#f19dcc]",
  };

  return (
    <motion.div
      whileHover={{ x: -5, scale: 1.02 }}
      className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[.065] p-3.5 backdrop-blur-xl"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r opacity-60 ${glowMap[glow]}`}
      />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-white/[.09]">
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold text-white">{title}</p>
          <p className="mt-1 text-[10px] leading-4 text-white/42">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   DOWNLOAD BENEFIT STATIC
========================================================= */

const DownloadBenefitStatic = ({ icon, title, subtitle }) => {
  return (
    <div
      style={{
        height: "64px",
        borderRadius: "20px",
        border: "1px solid rgba(120,196,255,.18)",
        background:
          "linear-gradient(90deg, rgba(48,113,219,.26), rgba(255,255,255,.035))",
        boxShadow: "0 8px 25px rgba(0,0,0,.10)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "10px 15px",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "15px",
          background: "rgba(255,255,255,.08)",
          border: "1px solid rgba(255,255,255,.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 25px rgba(62,190,255,.08)",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 750,
            color: "#ffffff",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "4px",
            fontSize: "9px",
            color: "rgba(255,255,255,.45)",
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DOWNLOAD SHOWCASE DETAIL
========================================================= */

const DownloadShowcaseDetail = ({ icon, label, value }) => {
  return (
    <div className="flex min-h-[76px] items-center gap-3 rounded-[18px] px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[.06]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-extrabold uppercase tracking-[.20em] text-white/35">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-bold text-white/80">{value}</p>
      </div>
    </div>
  );
};

/* =========================================================
   DOWNLOAD SHOWCASE DETAIL STATIC
========================================================= */

const DownloadShowcaseDetailStatic = ({
  icon,
  label,
  value,
  bordered = false,
}) => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        padding: "0 28px",
        borderRight: bordered ? "1px solid rgba(255,255,255,.16)" : "none",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          flexShrink: 0,
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,.10)",
          background: "rgba(255,255,255,.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "8px",
            fontWeight: 800,
            letterSpacing: "2px",
            color: "rgba(255,255,255,.38)",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "13px",
            fontWeight: 700,
            color: "rgba(255,255,255,.86)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   FEEDBACK COLUMN
========================================================= */

const FeedbackColumn = ({ icon, eyebrow, title, items, iconClass, accent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55 }}
      className="result-card-hover relative overflow-hidden rounded-[30px] border border-white bg-white/82 p-6 shadow-[0_18px_65px_rgba(16,32,95,.06)] backdrop-blur-xl sm:p-7"
    >
      <div
        className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accent}`}
      />

      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[17px] ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-[#9b4778]">
            {eyebrow}
          </p>

          <h3 className="mt-1 text-lg font-bold text-[#10205f]">{title}</h3>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={`${item}-${index}`}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.4,
              delay: index * 0.07,
            }}
            className="group flex gap-3 rounded-[17px] border border-transparent p-2 text-sm leading-6 text-slate-500 transition hover:border-[#e7edf5] hover:bg-[#f8faff]"
          >
            <span className="mt-2 flex h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-[#1769d3] to-[#d98bb4] shadow-[0_0_10px_rgba(23,105,211,.18)]" />

            <span>{item}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeeklyResult;
