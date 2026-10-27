import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
  RotateCw,
  Share2,
  Target,
  TrendingUp,
  Trophy,
  Sparkles,
  Star,
  Award,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import jashnaLogo from "../assets/images/logo.webp";

import { getWhatsAppLink } from "../data/contact";

const STORAGE_KEY = "jashnaWeeklyAnalysis";

/* Opens WhatsApp's contact picker so a learner can share their result with friends. */
const getShareLink = (message) =>
  `https://wa.me/?text=${encodeURIComponent(message)}`;

const CONTAINER = "relative z-10 mx-auto w-[92%] max-w-[1500px] sm:w-[90%]";

/* =========================================================
   SCORE TIERS
   ---------------------------------------------------------
   Praise ("You did it!", "hard work has paid off",
   confetti, "Achievement Unlocked") only appears when the
   score actually earns it.
========================================================= */

const HIGH_BENEFITS = [
  { Icon: CheckCircle2, title: "Clearer Communication", subtitle: "Express ideas with confidence" },
  { Icon: Star, title: "Stronger Confidence", subtitle: "Build skill through practice" },
  { Icon: TrendingUp, title: "Better Opportunities", subtitle: "Keep moving towards your goals" },
  { Icon: Award, title: "A Brighter Future", subtitle: "Small wins become big progress" },
];

const SUPPORT_BENEFITS = [
  { Icon: ClipboardList, title: "Read the Feedback", subtitle: "See exactly what to fix" },
  { Icon: RotateCw, title: "Try Again", subtitle: "A new spin brings a new question" },
  { Icon: TrendingUp, title: "Practise Often", subtitle: "Short, regular sessions work best" },
  { Icon: MessageCircle, title: "Ask Your Mentor", subtitle: "Get guidance on WhatsApp" },
];

const BLUE_RING = ["#39bfff", "#72f4df", "#b86cff"];
const WARM_RING = ["#f2c866", "#f59e6c", "#ef8fc5"];

const getTier = (score) => {
  if (score >= 90)
    return {
      key: "outstanding",
      celebrate: true,
      shareable: true,
      badge: "Challenge Completed",
      heroLead: "Look how far",
      heroAccent: "you've come.",
      heroSub: "One challenge completed. One more step towards stronger, more confident communication.",
      trophy: "Achievement Unlocked",
      cardEyebrow: "Your Achievement",
      label: "Outstanding Progress",
      message: "Your effort is showing. Keep building on this momentum.",
      sideTitle: "You did it!",
      sideText: "Your hard work, practice and dedication have paid off.",
      benefits: HIGH_BENEFITS,
      ring: BLUE_RING,
      cta: "Try Another Challenge",
      waTitle: "Ready for the next level?",
      waText: "Chat with Dr. Shivam Sir about advanced practice and the right programme for your goals.",
    };

  if (score >= 70)
    return {
      key: "strong",
      celebrate: true,
      shareable: true,
      badge: "Challenge Completed",
      heroLead: "Strong work,",
      heroAccent: "keep it going.",
      heroSub: "You're moving in the right direction. A little more practice will take this even higher.",
      trophy: "Achievement Unlocked",
      cardEyebrow: "Your Achievement",
      label: score >= 80 ? "Excellent Progress" : "Great Progress",
      message:
        score >= 80
          ? "You are developing strong communication skills."
          : "You are moving in the right direction. Keep practising.",
      sideTitle: "Well done!",
      sideText: "Your practice is paying off. Keep the habit going.",
      benefits: HIGH_BENEFITS,
      ring: BLUE_RING,
      cta: "Try Another Challenge",
      waTitle: "Want to go even further?",
      waText: "Talk to Dr. Shivam Sir about how to turn this into confident everyday English.",
    };

  if (score >= 50)
    return {
      key: "good",
      celebrate: false,
      shareable: true,
      badge: "Challenge Completed",
      heroLead: "A solid",
      heroAccent: "start.",
      heroSub: "You have a base to build on. The feedback below shows what will move your score up.",
      trophy: "Challenge Result",
      cardEyebrow: "Your Result",
      label: "Good Start",
      message: "Every practice session brings you one step closer.",
      sideTitle: "Good start.",
      sideText: "You're on the right track. A bit more practice will lift this score.",
      benefits: HIGH_BENEFITS,
      ring: BLUE_RING,
      cta: "Try Another Challenge",
      waTitle: "Want help improving?",
      waText: "Dr. Shivam Sir can point you to the right practice for the areas below.",
    };

  if (score > 0)
    return {
      key: "growth",
      celebrate: false,
      shareable: false,
      badge: "Attempt Recorded",
      heroLead: "Every expert",
      heroAccent: "starts here.",
      heroSub: "This score shows where to focus next. Read the feedback below, then try again.",
      trophy: "Practice Report",
      cardEyebrow: "Your Result",
      label: "Room to Grow",
      message: "Use the feedback below to improve on your next attempt.",
      sideTitle: "Keep going.",
      sideText: "Review the feedback and try again. Improvement comes quickly with focus.",
      benefits: SUPPORT_BENEFITS,
      ring: WARM_RING,
      cta: "Try Again",
      waTitle: "Let's work on this together",
      waText: "Message Dr. Shivam Sir for personal guidance and a simple plan to improve.",
    };

  return {
    key: "restart",
    celebrate: false,
    shareable: false,
    badge: "Attempt Recorded",
    heroLead: "Let's try",
    heroAccent: "that again.",
    heroSub: "This attempt didn't score, which is useful information. Check the feedback, then give it another go.",
    trophy: "Practice Report",
    cardEyebrow: "Your Result",
    label: "Not Scored Yet",
    message: "Start with the tips below, or ask your mentor for help.",
    sideTitle: "Fresh start.",
    sideText: "Begin with the tips below. A new spin gives you a new question.",
    benefits: SUPPORT_BENEFITS,
    ring: WARM_RING,
    cta: "Try Again",
    waTitle: "Stuck? Ask for help",
    waText: "Message Dr. Shivam Sir and get clear next steps for this topic.",
  };
};

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
  size: 5 + (index % 4) * 2,
}));

const BENEFIT_GLOWS = ["blue", "green", "purple", "pink"];
const BENEFIT_COLORS = ["#6ec9ff", "#6de0d5", "#bd78ff", "#ef8fc5"];

/* =========================================================
   HELPERS
========================================================= */

/* Counts up from 0 to target — used for the on-screen score. */
const useCountUp = (target, delay = 700, duration = 1500) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    let start;

    const timer = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min(1, (ts - start) / duration);
        setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, delay, duration]);

  return value;
};

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
    if (location.state && location.state.challenge && location.state.completion) {
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

  /* Hooks must run before any early return. */
  const targetScore = analysisData
    ? Math.min(100, Math.max(0, Number(analysisData.completion?.score ?? 0)))
    : 0;
  const displayScore = useCountUp(targetScore);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-[#F2F9FC] text-[#10205f]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-[34px] border border-white bg-white p-8 text-center shadow-[0_30px_100px_rgba(16,32,95,0.14)] sm:p-10"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-[#338DFD] to-[#2A9D8F] shadow-[0_15px_40px_rgba(51,141,253,0.28)]">
              <Target size={28} className="text-white" />
            </div>

            <h1 className="mt-7 text-2xl font-bold">No challenge result found</h1>

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

  const score = targetScore;
  const tier = getTier(score);

  const metrics = completion.evaluation?.metrics || {};
  const strengths = completion.evaluation?.strengths || [];
  const areasToImprove = completion.evaluation?.areasToImprove || [];
  const suggestions = completion.evaluation?.suggestions || [];

  const isAI = completion.evaluationMode === "ai" || completion.evaluator === "ai";
  const isMCQ = challenge.type === "mcq";

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

  const categoryLabel =
    challenge.label || completion.evaluationCategory || "Learning";

  const fileName = `jashna-edu-weekly-${tier.shareable ? "achievement" : "report"}-${score}.png`;

  /* WhatsApp — chat with Dr. Shivam Sir */
  const waMessage = `Hello Dr. Shivam Sir, I just did the Jashna Edu Weekly Challenge${
    challenge.title ? ` "${challenge.title}"` : ""
  } (${categoryLabel}) and scored ${score}/100. ${
    score < 70
      ? "I'd like some help improving."
      : "I'd like to know how to improve further."
  }`;

  const waLink = getWhatsAppLink(waMessage);

  /* WhatsApp — share the result with friends */
  const waShareLink = getShareLink(
    `I scored ${score}/100 in the Jashna Edu Weekly Challenge (${categoryLabel}). Try it yourself!`,
  );

  /* =======================================================
     DOWNLOAD / SHARE
  ======================================================== */

  const renderCardPng = () =>
    toPng(achievementRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#061a50",
      width: 1200,
      height: 900,
    });

  const handleDownload = async () => {
    if (!achievementRef.current || downloading) return;

    try {
      setDownloading(true);
      const dataUrl = await renderCardPng();

      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Unable to download right now.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!achievementRef.current || sharing) return;

    try {
      setSharing(true);
      const dataUrl = await renderCardPng();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });

      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: "My Jashna Edu Weekly Challenge Result",
          text: `I scored ${score}/100 in a Jashna Edu Weekly Challenge.`,
          files: [file],
        });
      } else {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(
            `I scored ${score}/100 in a Jashna Edu Weekly Challenge.`,
          );
        }
        alert(
          "This browser does not support image sharing, so the result text has been copied.",
        );
      }
    } catch (error) {
      if (error?.name !== "AbortError") console.error("Share failed:", error);
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
        @keyframes resultPulse { 0%,100% { opacity:.25; transform:scale(.96);} 50% { opacity:.72; transform:scale(1.08);} }
        @keyframes resultShimmer { 0% { transform:translateX(-140%) skewX(-18deg);} 100% { transform:translateX(260%) skewX(-18deg);} }
        @keyframes resultOrbit { from { transform:rotate(0deg);} to { transform:rotate(360deg);} }
        @keyframes resultSpinReverse { from { transform:rotate(360deg);} to { transform:rotate(0deg);} }
        @keyframes resultTwinkle { 0%,100% { opacity:.25; transform:scale(.65);} 50% { opacity:1; transform:scale(1.35);} }
        @keyframes resultConfetti {
          0% { opacity:0; transform:translate3d(0,-40px,0) rotate(0deg);}
          12% { opacity:1; }
          100% { opacity:0; transform:translate3d(25px,500px,0) rotate(540deg);}
        }

        .result-pulse { animation: resultPulse 4s ease-in-out infinite; }
        .result-shimmer { animation: resultShimmer 5.5s ease-in-out infinite; }
        .result-orbit { animation: resultOrbit 18s linear infinite; }
        .result-orbit-reverse { animation: resultSpinReverse 24s linear infinite; }
        .result-twinkle { animation: resultTwinkle 2.6s ease-in-out infinite; }
        .result-confetti { animation: resultConfetti 5s ease-in infinite; }

        .result-card-hover { transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s ease, border-color .45s ease; }
        .result-card-hover:hover { transform: translateY(-6px); box-shadow: 0 28px 80px rgba(16,32,95,.13); border-color: rgba(114,201,194,.55); }
        .result-button { transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease, background .3s ease; }
        .result-button:hover { transform: translateY(-3px); }

        @media (prefers-reduced-motion: reduce) {
          .result-pulse, .result-shimmer, .result-orbit, .result-orbit-reverse,
          .result-twinkle, .result-confetti { animation: none !important; }
        }
      `}</style>

      <main className="relative min-h-screen overflow-hidden bg-[#F2F9FC] text-[#10205f]">
        {/* BACKGROUND — alternating blue / teal washes */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-48 h-[600px] w-[600px] rounded-full bg-[#cfe6ff]/70 blur-3xl" />
          <div className="absolute -right-44 top-[16%] h-[560px] w-[560px] rounded-full bg-[#c9efe9]/70 blur-3xl" />
          <div className="absolute bottom-[-260px] left-[28%] h-[650px] w-[650px] rounded-full bg-[#d4e8fb]/60 blur-3xl" />
          <div className="absolute -left-52 bottom-[10%] h-[460px] w-[460px] rounded-full bg-[#cdeee8]/55 blur-3xl" />

          {particles.map((p) => (
            <span
              key={p.id}
              className="result-twinkle absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background:
                  p.id % 3 === 0 ? "#338DFD" : p.id % 3 === 1 ? "#2A9D8F" : "#7cc8ee",
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        {/* HERO */}
        <section className="relative z-10 mx-auto w-[92%] max-w-5xl pb-10 pt-12 text-center sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#bfe4e2] bg-white/80 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#347681] shadow-[0_10px_30px_rgba(50,118,129,.08)] backdrop-blur sm:text-xs"
          >
            <CheckCircle2 size={14} />
            {tier.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="mt-7 text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-[#10205f] sm:text-6xl lg:text-[76px]"
          >
            {tier.heroLead}{" "}
            <span
              className={`relative inline-block bg-clip-text text-transparent ${
                tier.celebrate || tier.key === "good"
                  ? "bg-gradient-to-r from-[#338DFD] via-[#2f9fc4] to-[#2A9D8F]"
                  : "bg-gradient-to-r from-[#d7861f] via-[#d9645f] to-[#a04b86]"
              }`}
            >
              {tier.heroAccent}
              <span className="absolute -bottom-3 left-[5%] h-[4px] w-[90%] rounded-full bg-gradient-to-r from-[#338DFD] via-[#72c9c2] to-[#2A9D8F]" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base"
          >
            {tier.heroSub}
          </motion.p>
        </section>

        {/* ACHIEVEMENT SHOWCASE */}
        <section className={CONTAINER}>
          <div className="relative">
            <div className="result-pulse absolute -inset-10 rounded-[70px] bg-gradient-to-r from-[#338DFD]/15 via-[#72c9c2]/20 to-[#2A9D8F]/12 blur-3xl" />

            {tier.celebrate && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[500px] overflow-hidden">
                {confettiPieces.map((piece) => (
                  <span
                    key={piece.id}
                    className="result-confetti absolute top-0 block rounded-sm"
                    style={{
                      left: piece.left,
                      width: piece.size,
                      height: piece.size + 5,
                      background:
                        piece.id % 4 === 0
                          ? "#338DFD"
                          : piece.id % 4 === 1
                            ? "#2A9D8F"
                            : piece.id % 4 === 2
                              ? "#9fd3f5"
                              : "#72c9c2",
                      animationDelay: piece.delay,
                      animationDuration: piece.duration,
                    }}
                  />
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 45, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/80 p-2.5 shadow-[0_35px_110px_rgba(16,32,95,.14)] backdrop-blur-2xl sm:rounded-[42px] sm:p-5">
                <div className="relative overflow-hidden rounded-[24px] bg-[#061a50] shadow-[inset_0_0_80px_rgba(0,0,0,.15)] sm:rounded-[34px]">
                  <div className="absolute -left-28 top-[-160px] h-[430px] w-[430px] rounded-full bg-[#1769d3]/30 blur-3xl" />
                  <div className="absolute right-[-130px] top-[-90px] h-[430px] w-[430px] rounded-full bg-[#5ee7d3]/20 blur-3xl" />
                  <div className="absolute bottom-[-210px] left-[28%] h-[450px] w-[450px] rounded-full bg-[#9c4dca]/20 blur-3xl" />

                  <div className="result-shimmer absolute inset-y-0 left-[-20%] w-[22%] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-70 sm:h-[650px] sm:w-[650px]">
                    <div className="result-orbit absolute inset-0 rounded-full border border-[#4bcde3]/20" />
                    <div className="result-orbit-reverse absolute inset-[48px] rounded-full border border-[#a56de4]/15" />
                    <div className="absolute inset-[105px] rounded-full border border-white/[.07]" />
                  </div>

                  <div className="relative z-10 px-4 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
                    {/* top row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#6de0d5]/25 bg-[#6de0d5]/[.07] px-3 py-2 text-[8px] font-extrabold uppercase tracking-[.22em] text-[#8ee8df] sm:px-4 sm:text-[9px] sm:tracking-[.28em]">
                          <Trophy size={12} />
                          {tier.trophy}
                        </div>

                        <p className="mt-3 text-[8px] font-bold uppercase tracking-[.26em] text-white/45 sm:mt-4 sm:text-[9px]">
                          Jashna Edu · Weekly Learning Challenge
                        </p>
                      </div>

                      <div className="hidden h-14 w-14 items-center justify-center rounded-[20px] border border-white/15 bg-white/[.07] sm:flex">
                        <Sparkles size={22} className="text-[#f2c866]" />
                      </div>
                    </div>

                    {/* main */}
                    <div className="mt-8 grid items-center gap-8 sm:mt-12 lg:grid-cols-[.8fr_1.3fr_.8fr] lg:gap-8">
                      {/* left message */}
                      <div className="hidden text-left lg:block">
                        <p className="font-[cursive] text-5xl italic leading-[.95] text-white/95">
                          {tier.sideTitle}
                        </p>
                        <div className="mt-3 h-1 w-32 rotate-[-5deg] rounded-full bg-gradient-to-r from-[#72e5d8] to-[#a8f2e9]" />
                        <p className="mt-6 max-w-[240px] text-sm leading-6 text-white/60">
                          {tier.sideText}
                        </p>
                      </div>

                      {/* score */}
                      <div className="text-center">
                        <p className="text-[9px] font-extrabold uppercase tracking-[.38em] text-[#82e5db]">
                          {tier.cardEyebrow}
                        </p>

                        <div className="relative mx-auto mt-6 flex aspect-square w-[min(68vw,320px)] items-center justify-center xl:w-[340px]">
                          <div className="result-pulse absolute inset-8 rounded-full bg-[#36c7e7]/20 blur-2xl" />
                          <div className="result-orbit absolute inset-1 rounded-full border border-[#53d6ea]/25" />
                          <div className="result-orbit-reverse absolute inset-5 rounded-full border border-[#a86ee9]/20" />

                          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                            <defs>
                              <linearGradient id="liveScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={tier.ring[0]} />
                                <stop offset="48%" stopColor={tier.ring[1]} />
                                <stop offset="100%" stopColor={tier.ring[2]} />
                              </linearGradient>
                              <filter id="liveScoreGlow">
                                <feGaussianBlur stdDeviation="1.7" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>

                            <circle cx="50" cy="50" r="40" fill="rgba(4,18,59,.38)" stroke="rgba(255,255,255,.07)" strokeWidth="4" />

                            {score > 0 && (
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
                                animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                                transition={{ duration: 1.8, delay: 0.55, ease: "easeOut" }}
                                filter="url(#liveScoreGlow)"
                              />
                            )}
                          </svg>

                          <div className="relative z-10">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.45 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.9, delay: 0.75, type: "spring", stiffness: 110 }}
                              className="text-7xl font-black leading-none tracking-[-.08em] text-white sm:text-8xl"
                            >
                              {displayScore}
                            </motion.div>
                            <p className="mt-3 text-sm font-semibold text-[#7fe5dd]">out of 100</p>
                          </div>
                        </div>

                        <motion.h2
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, delay: 1 }}
                          className="mt-2 text-2xl font-bold text-white sm:text-3xl"
                        >
                          {tier.label}
                        </motion.h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
                          {challenge.title || "Weekly Challenge"}
                        </p>
                      </div>

                      {/* right stack */}
                      <div className="hidden space-y-3 lg:block">
                        {tier.benefits.map((b, i) => (
                          <DownloadBenefit
                            key={b.title}
                            icon={<b.Icon size={19} />}
                            title={b.title}
                            subtitle={b.subtitle}
                            glow={BENEFIT_GLOWS[i]}
                          />
                        ))}
                      </div>
                    </div>

                    {/* mobile / tablet message */}
                    <div className="mt-8 text-center lg:hidden">
                      <p className="font-[cursive] text-3xl italic text-white/90">{tier.sideTitle}</p>
                      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/60">{tier.sideText}</p>
                    </div>

                    {/* info bar */}
                    <div className="mt-8 rounded-[24px] border border-white/15 bg-white/[.075] p-2 shadow-[0_18px_55px_rgba(0,0,0,.18)] backdrop-blur-xl sm:mt-12">
                      <div className="grid gap-1 sm:grid-cols-3">
                        <DownloadShowcaseDetail icon={<Target size={19} />} label="Category" value={categoryLabel} />
                        <DownloadShowcaseDetail icon={<CalendarDays size={19} />} label="Completed On" value={formattedDate} />
                        <DownloadShowcaseDetail icon={<Award size={19} />} label="Difficulty Level" value={challenge.difficulty || "Intermediate"} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ACTIONS */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="relative z-30 mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap"
            >
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="result-button group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#10205f] px-8 py-4 text-sm font-bold text-white shadow-[0_16px_40px_rgba(16,32,95,.22)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {downloading ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />}
                {downloading
                  ? "Preparing…"
                  : tier.shareable
                    ? "Download Achievement"
                    : "Download Report"}
              </button>

              {tier.shareable && (
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="result-button inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#bcdcf0] bg-[#EAF4FF]/90 px-8 py-4 text-sm font-bold text-[#10205f] shadow-[0_10px_30px_rgba(16,32,95,.06)] backdrop-blur hover:bg-[#dcecfd] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {sharing ? <LoaderCircle size={17} className="animate-spin" /> : <Share2 size={17} />}
                  {sharing ? "Preparing…" : "Share Achievement"}
                </button>
              )}

              {tier.shareable && (
                <a
                  href={waShareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="result-button inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#b9e3dc] bg-[#E6F7F3]/90 px-8 py-4 text-sm font-bold text-[#1d6f64] shadow-[0_10px_30px_rgba(16,32,95,.06)] hover:bg-[#d6f1ea] sm:w-auto"
                >
                  <Share2 size={17} />
                  Share on WhatsApp
                </a>
              )}

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="result-button inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1FA855] px-8 py-4 text-sm font-bold text-white shadow-[0_14px_34px_rgba(31,168,85,.28)] sm:w-auto"
              >
                <MessageCircle size={17} />
                Chat with Dr. Shivam Sir
              </a>
            </motion.div>
          </div>
        </section>

        {/* RESPONSE + INSIGHT */}
        <section className={`${CONTAINER} mt-20`}>
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.24em] text-[#23867A]">
                Your learning snapshot
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.035em] text-[#10205f] sm:text-4xl">
                More than a score.
              </h2>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.65 }}
            className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"
          >
            {/* response — blue tint */}
            <div className="result-card-hover relative overflow-hidden rounded-[28px] border border-white bg-gradient-to-br from-white to-[#EAF3FF] p-6 shadow-[0_20px_70px_rgba(16,32,95,.07)] backdrop-blur-xl sm:rounded-[32px] sm:p-9">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#cfe4ff] blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBFD] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#2A78D6]">
                  <Target size={12} />
                  The Challenge
                </div>

                <h2 className="mt-4 text-xl font-bold text-[#10205f] sm:text-2xl">
                  {challenge.title || "Weekly Challenge"}
                </h2>

                {challenge.description && (
                  <p className="mt-4 text-sm leading-7 text-slate-500">{challenge.description}</p>
                )}

                <div className="relative mt-6 overflow-hidden rounded-[23px] border border-[#d5e4f5] bg-white/80 p-5">
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#338DFD] via-[#72c9c2] to-[#2A9D8F]" />
                  <p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-slate-400">
                    Your response
                  </p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#39445f]">
                    {completion.answer || "No response recorded."}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#D5F0EB] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#23867A]">
                    {categoryLabel}
                  </span>
                  {challenge.difficulty && (
                    <span className="rounded-full bg-[#DCEBFD] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#2A78D6]">
                      {challenge.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* insight — teal tint */}
            <div className="result-card-hover relative overflow-hidden rounded-[28px] border border-white bg-gradient-to-br from-white to-[#E6F7F3] p-6 shadow-[0_20px_70px_rgba(16,32,95,.07)] backdrop-blur-xl sm:rounded-[32px] sm:p-9">
              <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[#bfeae2]/70 blur-3xl" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#D5F0EB] text-[#23867A]">
                    <Lightbulb size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#23867A]">
                      Learning Insight
                    </p>
                    <h2 className="mt-1.5 text-xl font-bold text-[#10205f] sm:text-2xl">
                      {score < 50 ? "Where to focus" : "Keep this in mind"}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 rounded-[23px] border border-[#cfe9e4] bg-white/75 p-5 shadow-sm">
                  <p className="text-sm leading-7 text-slate-600">
                    {completion.feedback ||
                      (completion.isCorrect
                        ? "You completed the challenge successfully."
                        : tier.message)}
                  </p>
                </div>

                {isMCQ && (
                  <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#b9e3dc] bg-white px-4 py-2.5 text-xs font-bold text-[#23867A]">
                    <Check size={14} />
                    {completion.isCorrect ? "Answer correct" : "Attempt recorded"}
                  </div>
                )}

                {/* WhatsApp link inside the answer feedback */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-[#1a8f49] underline-offset-4 hover:underline"
                >
                  <MessageCircle size={16} />
                  Discuss this answer with Dr. Shivam Sir on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* AI METRICS */}
        {isAI && metricItems.length > 0 && (
          <section className={`${CONTAINER} mt-7`}>
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.65 }}
              className="relative overflow-hidden rounded-[28px] border border-white bg-[#10205f] p-6 shadow-[0_25px_80px_rgba(16,32,95,.14)] sm:rounded-[34px] sm:p-9"
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#338DFD]/40 blur-3xl" />
              <div className="absolute -bottom-28 left-[35%] h-72 w-72 rounded-full bg-[#2A9D8F]/25 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/[.08] text-[#82e5db]">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#82e5db]">
                        AI Language Analysis
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                        A closer look at your response
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {metricItems.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      whileHover={{ y: -4 }}
                      className={`rounded-[22px] border p-5 ${
                        index % 2 === 0
                          ? "border-[#338DFD]/25 bg-[#338DFD]/[.10]"
                          : "border-[#2A9D8F]/30 bg-[#2A9D8F]/[.12]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-white/60">{metric.label}</span>
                        <span className="text-lg font-black text-white">{metric.value}</span>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, delay: 0.25 + index * 0.1 }}
                          className={`h-full rounded-full ${
                            index % 2 === 0
                              ? "bg-gradient-to-r from-[#39bfff] to-[#8fd2ff]"
                              : "bg-gradient-to-r from-[#2fd0bb] to-[#8ff0e0]"
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* FEEDBACK COLUMNS — alternating blue / teal */}
        {(strengths.length > 0 || areasToImprove.length > 0 || suggestions.length > 0) && (
          <section className={`${CONTAINER} mt-7 grid gap-5 lg:grid-cols-3`}>
            {strengths.length > 0 && (
              <FeedbackColumn
                tone="teal"
                icon={<Star size={18} />}
                eyebrow="Strengths"
                title="What went well"
                items={strengths}
              />
            )}
            {areasToImprove.length > 0 && (
              <FeedbackColumn
                tone="blue"
                icon={<TrendingUp size={18} />}
                eyebrow="Growth Area"
                title="What to improve"
                items={areasToImprove}
              />
            )}
            {suggestions.length > 0 && (
              <FeedbackColumn
                tone="teal"
                icon={<Lightbulb size={18} />}
                eyebrow="Next Steps"
                title="How to practise"
                items={suggestions}
                checkable
              />
            )}
          </section>
        )}

        {/* WHATSAPP CARD */}
        <section className={`${CONTAINER} mt-7`}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65 }}
            className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0f5f3a] via-[#14803f] to-[#1FA855] p-6 text-white shadow-[0_25px_70px_rgba(20,128,63,.25)] sm:rounded-[34px] sm:p-9"
          >
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/15">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">{tier.waTitle}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">{tier.waText}</p>
                </div>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="result-button inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-[#0f5f3a] shadow-lg md:w-auto"
              >
                <MessageCircle size={17} />
                Message on WhatsApp
              </a>
            </div>
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section className={`${CONTAINER} pb-20 pt-14`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[30px] border border-white bg-white/80 px-6 py-12 text-center shadow-[0_25px_85px_rgba(16,32,95,.08)] backdrop-blur-xl sm:rounded-[38px] sm:px-10 sm:py-14"
          >
            <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[#cfe4ff] blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-[#c4ece5] blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-[-.04em] text-[#10205f] sm:text-4xl">
                {score < 50 ? "Ready for another go?" : "Your next challenge is waiting."}
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
                Each spin gives you a new topic and a new question. Keep
                practising and your score will follow.
              </p>

              <button
                onClick={handleNewChallenge}
                className="result-button mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#338DFD] to-[#2A9D8F] px-8 py-4 text-sm font-bold text-white shadow-[0_14px_35px_rgba(51,141,253,.25)]"
              >
                {tier.cta}
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </section>

        {/* HIDDEN DOWNLOAD CARD (1200 x 900) */}
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
            <div style={{ position: "absolute", width: 650, height: 650, left: 270, top: 90, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,185,255,.22) 0%, rgba(47,185,255,.07) 40%, transparent 70%)", filter: "blur(8px)" }} />
            <div style={{ position: "absolute", width: 520, height: 520, right: -150, top: -170, borderRadius: "50%", background: "rgba(86,236,215,.20)", filter: "blur(25px)" }} />
            <div style={{ position: "absolute", width: 520, height: 520, left: -190, bottom: -240, borderRadius: "50%", background: "rgba(164,92,230,.18)", filter: "blur(28px)" }} />

            <div style={{ position: "absolute", left: 410, top: 125, width: 380, height: 380, borderRadius: "50%", border: "2px solid rgba(57,191,255,.22)", boxShadow: "0 0 35px rgba(57,191,255,.10), inset 0 0 35px rgba(57,191,255,.06)" }} />
            <div style={{ position: "absolute", left: 432, top: 147, width: 336, height: 336, borderRadius: "50%", border: "1px solid rgba(114,229,216,.18)" }} />

            {/* badge */}
            <div
              style={{
                position: "absolute",
                left: 420,
                top: 34,
                width: 360,
                height: 50,
                borderRadius: 999,
                border: "1px solid rgba(75,205,255,.65)",
                background: "linear-gradient(90deg, rgba(35,133,255,.15), rgba(88,240,220,.10), rgba(178,106,246,.15))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 13,
              }}
            >
              <Trophy size={22} color="#73dff4" />
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 4, color: "#8ce7ff", textTransform: "uppercase" }}>
                {tier.trophy}
              </span>
            </div>

            {/* logo */}
            <img
              src={jashnaLogo}
              alt="Jashna Edu"
              style={{ position: "absolute", left: 58, top: 42, height: 62, width: "auto", objectFit: "contain" }}
            />
            <div style={{ position: "absolute", left: 60, top: 112, fontSize: 9, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.40)" }}>
              Weekly Learning Challenge
            </div>

            {/* left message */}
            <div style={{ position: "absolute", left: 62, top: 270, width: 250 }}>
              <div style={{ fontFamily: "cursive", fontStyle: "italic", fontSize: 48, lineHeight: ".95", color: "#ffffff" }}>
                {tier.sideTitle}
              </div>
              <div style={{ width: 142, height: 5, marginTop: 10, marginLeft: 8, borderRadius: 999, transform: "rotate(-5deg)", background: "linear-gradient(90deg, #6ce8d9, #57d8ff, #c681ee)" }} />
              <div style={{ marginTop: 28, fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,.62)" }}>
                {tier.sideText}
              </div>
            </div>

            {/* score title */}
            <div style={{ position: "absolute", left: 465, top: 126, width: 270, textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: 4, color: "#7fe4dc", textTransform: "uppercase" }}>
              {tier.cardEyebrow}
            </div>

            {/* ring */}
            <svg
              width="380"
              height="380"
              viewBox="0 0 100 100"
              style={{ position: "absolute", left: 400, top: 130, transform: "rotate(-90deg)", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="downloadScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={tier.ring[0]} />
                  <stop offset="48%" stopColor={tier.ring[1]} />
                  <stop offset="100%" stopColor={tier.ring[2]} />
                </linearGradient>
                <filter id="downloadGlow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle cx="50" cy="50" r="40" fill="rgba(2,15,50,.48)" stroke="rgba(255,255,255,.08)" strokeWidth="3" />

              {score > 0 && (
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
              )}
            </svg>

            {/* score number */}
            <div style={{ position: "absolute", left: 455, top: 255, width: 270, textAlign: "center" }}>
              <div style={{ fontSize: 108, lineHeight: ".85", fontWeight: 900, letterSpacing: -7 }}>{score}</div>
              <div style={{ marginTop: 18, fontSize: 16, fontWeight: 700, color: "#7fe5dd" }}>out of 100</div>
            </div>

            {/* label */}
            <div style={{ position: "absolute", left: 400, top: 505, width: 380, textAlign: "center" }}>
              <div style={{ fontSize: 29, fontWeight: 800, color: "#ffffff" }}>{tier.label}</div>
              <div style={{ marginTop: 9, fontSize: 13, color: "rgba(255,255,255,.56)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {challenge.title || "Weekly Learning Challenge"}
              </div>
            </div>

            {/* right stack */}
            <div style={{ position: "absolute", right: 48, top: 180, width: 270, display: "flex", flexDirection: "column", gap: 12 }}>
              {tier.benefits.map((b, i) => (
                <DownloadBenefitStatic
                  key={b.title}
                  icon={<b.Icon size={21} color={BENEFIT_COLORS[i]} />}
                  title={b.title}
                  subtitle={b.subtitle}
                />
              ))}
            </div>

            {/* bottom strip */}
            <div
              style={{
                position: "absolute",
                left: 52,
                right: 52,
                bottom: 38,
                height: 105,
                borderRadius: 25,
                border: "1px solid rgba(117,215,255,.22)",
                background: "linear-gradient(90deg, rgba(33,95,188,.70), rgba(29,83,170,.78), rgba(55,83,191,.62))",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                alignItems: "center",
              }}
            >
              <DownloadShowcaseDetailStatic icon={<Target size={22} color="#73e4dd" />} label="CATEGORY" value={categoryLabel} />
              <DownloadShowcaseDetailStatic icon={<CalendarDays size={22} color="#73cfff" />} label="COMPLETED ON" value={formattedDate} bordered />
              <DownloadShowcaseDetailStatic icon={<Award size={22} color="#c993ff" />} label="DIFFICULTY LEVEL" value={challenge.difficulty || "Intermediate"} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

/* =========================================================
   SUB-COMPONENTS
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
      className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[.065] p-3.5 backdrop-blur-xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-r opacity-60 ${glowMap[glow]}`} />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-white/[.09]">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-white">{title}</p>
          <p className="mt-1 text-[10px] leading-4 text-white/50">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};

const DownloadBenefitStatic = ({ icon, title, subtitle }) => (
  <div
    style={{
      height: 64,
      borderRadius: 20,
      border: "1px solid rgba(120,196,255,.18)",
      background: "linear-gradient(90deg, rgba(48,113,219,.26), rgba(255,255,255,.035))",
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "10px 15px",
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 15,
        background: "rgba(255,255,255,.08)",
        border: "1px solid rgba(255,255,255,.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{title}</div>
      <div style={{ marginTop: 4, fontSize: 9, color: "rgba(255,255,255,.55)" }}>{subtitle}</div>
    </div>
  </div>
);

const DownloadShowcaseDetail = ({ icon, label, value }) => (
  <div className="flex min-h-[76px] items-center gap-3 rounded-[18px] px-4 py-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[.06] text-[#8ee8df]">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-white/45">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-white/85 sm:text-sm">{value}</p>
    </div>
  </div>
);

const DownloadShowcaseDetailStatic = ({ icon, label, value, bordered = false }) => (
  <div
    style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      gap: 13,
      padding: "0 28px",
      borderRight: bordered ? "1px solid rgba(255,255,255,.16)" : "none",
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        flexShrink: 0,
        borderRadius: 14,
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
      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,.45)" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.88)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </div>
    </div>
  </div>
);

/*
  FeedbackColumn — tinted light blue or light teal.
  With `checkable`, each item can be ticked off as the learner
  practises it, and a small progress bar tracks completion.
*/
const FEEDBACK_TONES = {
  blue: {
    card: "border-[#d3e5f7] bg-gradient-to-b from-[#EEF6FF] to-white",
    bar: "from-[#338DFD] to-[#72b9ff]",
    icon: "bg-[#DCEBFD] text-[#2A78D6]",
    eyebrow: "text-[#2A78D6]",
    dot: "from-[#338DFD] to-[#72b9ff]",
    hover: "hover:border-[#c6dcf4] hover:bg-white",
    checked: "border-[#338DFD] bg-[#338DFD]",
    unchecked: "border-[#b9d3ee] bg-white",
    track: "bg-[#d5e6f8]",
  },
  teal: {
    card: "border-[#cfe9e4] bg-gradient-to-b from-[#E8F8F4] to-white",
    bar: "from-[#2A9D8F] to-[#72d3c5]",
    icon: "bg-[#D5F0EB] text-[#23867A]",
    eyebrow: "text-[#23867A]",
    dot: "from-[#2A9D8F] to-[#72d3c5]",
    hover: "hover:border-[#bfe3dc] hover:bg-white",
    checked: "border-[#2A9D8F] bg-[#2A9D8F]",
    unchecked: "border-[#b4dcd5] bg-white",
    track: "bg-[#cdebe5]",
  },
};

const FeedbackColumn = ({ icon, eyebrow, title, items, tone = "blue", checkable = false }) => {
  const t = FEEDBACK_TONES[tone];
  const [done, setDone] = useState([]);

  const toggle = (index) =>
    setDone((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );

  const progress = items.length ? Math.round((done.length / items.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55 }}
      className={`result-card-hover relative overflow-hidden rounded-[26px] border p-6 shadow-[0_18px_65px_rgba(16,32,95,.06)] backdrop-blur-xl sm:rounded-[30px] sm:p-7 ${t.card}`}
    >
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${t.bar}`} />

      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[17px] ${t.icon}`}>
          {icon}
        </div>
        <div>
          <p className={`text-[10px] font-extrabold uppercase tracking-[.18em] ${t.eyebrow}`}>{eyebrow}</p>
          <h3 className="mt-1 text-lg font-bold text-[#10205f]">{title}</h3>
        </div>
      </div>

      {checkable && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Tick off as you practise</span>
            <span>
              {done.length}/{items.length}
            </span>
          </div>
          <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${t.track}`}>
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${t.bar}`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {items.map((item, index) => {
          const isDone = done.includes(index);

          if (checkable) {
            return (
              <button
                key={`${item}-${index}`}
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={isDone}
                className={`flex w-full gap-3 rounded-[17px] border border-transparent p-2 text-left text-sm leading-6 transition ${t.hover} ${
                  isDone ? "text-slate-400 line-through" : "text-slate-500"
                }`}
              >
                <span
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                    isDone ? t.checked : t.unchecked
                  }`}
                >
                  {isDone && <Check size={12} className="text-white" />}
                </span>
                <span>{item}</span>
              </button>
            );
          }

          return (
            <div
              key={`${item}-${index}`}
              className={`flex gap-3 rounded-[17px] border border-transparent p-2 text-sm leading-6 text-slate-500 transition ${t.hover}`}
            >
              <span className={`mt-2 flex h-2 w-2 shrink-0 rounded-full bg-gradient-to-br ${t.dot}`} />
              <span>{item}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WeeklyResult;