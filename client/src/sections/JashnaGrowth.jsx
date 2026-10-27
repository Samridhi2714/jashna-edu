import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Sprout,
  Brain,
  Target,
  MessageCircle,
  BriefcaseBusiness,
  Sparkles,
  X,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Check,
  Quote,
} from "lucide-react";

import logoImage from "../assets/images/logo.webp";

import growthAssessment from "../assets/images/growth-assessment.webp";
import growthFoundation from "../assets/images/growth-foundation.webp";
import growthPractice from "../assets/images/growth-practice.webp";
import growthConfidence from "../assets/images/growth-confidence.webp";
import growthImpact from "../assets/images/growth-impact.webp";
import growthTransformation from "../assets/images/growth-transformation.webp";

/* Times New Roman everywhere inside this section (and the lightbox) */
const TIMES = "[&_*]:![font-family:Times_New_Roman,Times,serif]";

/* Shared text colours */
const INK = "#2B2233";
const BODY = "#4A4452";

/* =========================================================
   DATA
========================================================= */

const growthStages = [
  {
    id: "01",
    label: "ASSESSMENT",
    title: "Understand Where You Are",
    description:
      "We begin by understanding your current communication strengths, gaps and goals before building your learning journey.",
    points: [
      "Identify communication gaps",
      "Understand your current level",
      "Set meaningful goals",
    ],
    icon: Brain,
    photo: growthAssessment,
    caption: "Every transformation begins with understanding where you stand.",
    quote: "Start where you are.",
    quoteSmall: "Awareness creates direction.",
    colors: {
      background: "#FFF1EC",
      border: "#E9B8A7",
      accent: "#D77B61",
      dark: "#783F32",
      sticker: "#E8A38E",
      glow: "rgba(215,123,97,0.32)",
    },
  },
  {
    id: "02",
    label: "FOUNDATION",
    title: "Build Your Foundation",
    description:
      "Strong communication starts with the right foundations — language, structure, vocabulary, clarity and confidence.",
    points: [
      "Strengthen language basics",
      "Build useful vocabulary",
      "Develop clear expression",
    ],
    icon: Sprout,
    photo: growthFoundation,
    caption: "A stronger foundation makes every next step easier.",
    quote: "Grow from within.",
    quoteSmall: "Strong roots. Clear voice.",
    colors: {
      background: "#EEF6E9",
      border: "#B7CDAA",
      accent: "#7B9C6B",
      dark: "#425A37",
      sticker: "#A9C69A",
      glow: "rgba(123,156,107,0.30)",
    },
  },
  {
    id: "03",
    label: "PRACTICE",
    title: "Practice & Apply",
    description:
      "Learning becomes meaningful when you use it. Practice real conversations, presentations and situations that mirror everyday life.",
    points: [
      "Practise real conversations",
      "Apply communication skills",
      "Learn through feedback",
    ],
    icon: Target,
    photo: growthPractice,
    caption: "Practice turns knowledge into something you can actually use.",
    quote: "Practice makes it yours.",
    quoteSmall: "Learn. Try. Improve.",
    colors: {
      background: "#F1EEFA",
      border: "#C9BCE4",
      accent: "#8C7AB5",
      dark: "#554778",
      sticker: "#BBAAE0",
      glow: "rgba(140,122,181,0.30)",
    },
  },
  {
    id: "04",
    label: "CONFIDENCE",
    title: "Speak With Confidence",
    description:
      "With consistent practice, your communication becomes more natural and powerful — helping you express yourself with clarity and confidence.",
    points: [
      "Speak more naturally",
      "Express ideas clearly",
      "Build presentation confidence",
    ],
    icon: MessageCircle,
    photo: growthConfidence,
    caption: "Confidence grows when your skills become natural through practice.",
    quote: "Own your voice.",
    quoteSmall: "Clarity creates confidence.",
    colors: {
      background: "#F5EDF8",
      border: "#D2B9D9",
      accent: "#A16AA8",
      dark: "#65456D",
      sticker: "#C7A5CE",
      glow: "rgba(161,106,168,0.30)",
    },
  },
  {
    id: "05",
    label: "IMPACT",
    title: "Create Real-World Impact",
    description:
      "The ultimate goal is to carry your communication skills into academics, careers and everyday life.",
    points: ["Academic confidence", "Career readiness", "Better connections"],
    icon: BriefcaseBusiness,
    photo: growthImpact,
    caption:
      "Your skills matter most when they create impact beyond the classroom.",
    quote: "Make your skills matter.",
    quoteSmall: "Real conversations. Real growth.",
    colors: {
      background: "#EEF4F8",
      border: "#B7C9D7",
      accent: "#668FAE",
      dark: "#405D72",
      sticker: "#9EB8C9",
      glow: "rgba(102,143,174,0.30)",
    },
  },
  {
    id: "06",
    label: "TRANSFORMATION",
    title: "Grow Into Your Next Chapter",
    description:
      "The journey comes full circle when communication becomes a part of who you are — opening the way to new opportunities and continued growth.",
    points: [
      "Step into new opportunities",
      "Achieve your goals",
      "Keep growing beyond Jashna",
    ],
    icon: Sparkles,
    photo: growthTransformation,
    caption:
      "Growth is not the end of the journey — it is the beginning of what comes next.",
    quote: "Become who you can be.",
    quoteSmall: "Your next chapter starts here.",
    colors: {
      background: "#FFF7E5",
      border: "#E5C98C",
      accent: "#C69A3A",
      dark: "#765A25",
      sticker: "#D9B969",
      glow: "rgba(198,154,58,0.32)",
    },
  },
];

const DEFAULT_WASH = "rgba(213,173,87,0.10)";

/* =========================================================
   MAIN
========================================================= */

export default function JashnaGrowth() {
  const [activeStage, setActiveStage] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const isOpen = openIndex !== null;
  const total = growthStages.length;

  /* lightbox: Esc closes, arrow keys move between stages, page scroll locked */
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") setOpenIndex((i) => (i + 1) % total);
      if (event.key === "ArrowLeft") setOpenIndex((i) => (i - 1 + total) % total);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, total]);

  const scrollToCard = (i) => {
    setActiveStage(i);
    document
      .getElementById(`growth-card-${i}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const wash =
    activeStage !== null ? growthStages[activeStage].colors.glow : DEFAULT_WASH;

  return (
    <div className={TIMES}>
      <section
        id="growth"
        className="relative overflow-hidden bg-[#FCFAF6] pb-16 pt-20 lg:pb-24 lg:pt-24"
      >
        {/* BACKGROUND: soft glow that takes the colour of the hovered stage */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 transition-[background] duration-700"
            style={{
              background: `radial-gradient(60% 45% at 50% 58%, ${wash}, transparent 70%)`,
            }}
          />
          <div className="absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-[#E2968C]/15 blur-3xl" />
          <div className="absolute -right-40 bottom-24 h-[430px] w-[430px] rounded-full bg-[#8CA078]/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#9A6AA8]/10 blur-3xl" />
        </div>

        {/* HEADING */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <span className="h-px w-8 bg-[#C0675B]/60 sm:w-12" />
            <span className="text-xs font-bold tracking-[0.28em] text-[#A85A50] sm:text-sm">
              THE JASHNA GROWTH JOURNEY
            </span>
            <span className="h-px w-8 bg-[#6E9A62]/60 sm:w-12" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.75, delay: 0.08 }}
            className="text-[2.6rem] font-bold leading-[1.06] tracking-[-0.02em] text-[#2B2233] sm:text-6xl lg:text-7xl"
          >
            Every strand of growth
            <span className="block bg-gradient-to-r from-[#C0675B] via-[#9A6AA8] to-[#6E9A62] bg-clip-text pb-2 text-transparent">
              has a purpose.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-8 text-[#453440] sm:text-xl sm:leading-9"
          >
            From understanding where you are to confidently applying what you
            learn — your communication journey with Jashna grows, step by step.
          </motion.p>
        </div>

        {/* JOURNEY RAIL */}
        <JourneyRail
          activeStage={activeStage}
          setActiveStage={setActiveStage}
          onSelect={scrollToCard}
        />

        {/* CARDS */}
        <div className="relative z-10 mx-auto mt-14 max-w-[1500px] px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3 xl:gap-y-14">
            {growthStages.map((stage, index) => (
              <div
                key={stage.id}
                /* staggered look on large screens: middle column sits lower */
                className={index % 3 === 1 ? "xl:translate-y-12" : ""}
              >
                <GrowthCard
                  stage={stage}
                  index={index}
                  active={activeStage === index}
                  dimmed={activeStage !== null && activeStage !== index}
                  setActiveStage={setActiveStage}
                  onOpen={() => setOpenIndex(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM STATEMENT */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto mt-16 max-w-3xl px-6 xl:mt-28"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-[#E8DFD0] bg-white/70 px-7 py-8 text-center shadow-[0_18px_55px_rgba(49,43,34,0.06)] backdrop-blur-sm sm:px-12">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#C0675B] via-[#9A6AA8] to-[#6E9A62]" />
            <p className="text-2xl leading-relaxed text-[#2B2233] sm:text-[1.7rem]">
              Your growth is not a straight line.
              <span className="text-[#9A5E8A]">
                {" "}
                It is a journey of roots, practice, confidence and impact.
              </span>
            </p>
          </div>
        </motion.div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {isOpen && (
          <PhotoLightbox
            index={openIndex}
            onClose={() => setOpenIndex(null)}
            onNavigate={setOpenIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   JOURNEY RAIL
   A coloured path joining the 6 stages. Hover = highlights the
   matching card, click = scrolls to it.
========================================================= */

function JourneyRail({ activeStage, setActiveStage, onSelect }) {
  return (
    <nav
      aria-label="Growth stages"
      className="relative z-10 mx-auto mt-10 max-w-5xl px-5 sm:px-8"
    >
      <div className="relative flex items-start justify-between">
        {/* the path */}
        <span
          aria-hidden
          className="absolute left-6 right-6 top-6 h-[3px] rounded-full bg-gradient-to-r from-[#D77B61] via-[#8C7AB5] via-60% to-[#C69A3A] opacity-40"
        />

        {growthStages.map((stage, i) => {
          const Icon = stage.icon;
          const active = activeStage === i;

          return (
            <motion.button
              key={stage.id}
              type="button"
              onClick={() => onSelect(i)}
              onMouseEnter={() => setActiveStage(i)}
              onMouseLeave={() => setActiveStage(null)}
              onFocus={() => setActiveStage(i)}
              onBlur={() => setActiveStage(null)}
              aria-label={`Go to ${stage.title}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              whileTap={{ scale: 0.92 }}
              className="group relative z-10 flex w-12 flex-col items-center gap-2 sm:w-24"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-md transition-all duration-300"
                style={{
                  borderColor: stage.colors.accent,
                  backgroundColor: active ? stage.colors.accent : "#ffffff",
                  color: active ? "#ffffff" : stage.colors.accent,
                  transform: active ? "scale(1.18)" : "scale(1)",
                  boxShadow: active
                    ? `0 12px 28px ${stage.colors.glow}`
                    : "0 6px 14px rgba(42,35,28,0.08)",
                }}
              >
                <Icon size={20} strokeWidth={1.9} />
              </span>

              <span
                className="hidden text-center text-[11px] font-bold tracking-[0.14em] transition-colors duration-300 sm:block"
                style={{ color: active ? stage.colors.dark : "#8A8190" }}
              >
                {stage.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

/* =========================================================
   GROWTH CARD
   - 3D tilt that follows the mouse
   - soft coloured spotlight that follows the cursor
   - photo zooms and a light sweep passes over it on hover
   - click anywhere on the card (or "View story") to open it
   Only hover effects animate, so nothing runs while idle.
========================================================= */

function GrowthCard({ stage, index, active, dimmed, setActiveStage, onOpen }) {
  const Icon = stage.icon;
  const cardRef = useRef(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 140, damping: 16 });
  const rotateY = useSpring(ry, { stiffness: 140, damping: 16 });

  const gx = useMotionValue(50);
  const gy = useMotionValue(30);
  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${gx}% ${gy}%, ${stage.colors.glow}, transparent 62%)`;

  const handleMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;

    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    ry.set((px - 0.5) * 8);
    rx.set(-(py - 0.5) * 8);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(30);
    setActiveStage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: (index % 3) * 0.1, ease: "easeOut" }}
    >
      <motion.article
        id={`growth-card-${index}`}
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`Open ${stage.title}`}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        onMouseMove={handleMove}
        onMouseEnter={() => setActiveStage(index)}
        onMouseLeave={handleLeave}
        onFocus={() => setActiveStage(index)}
        onBlur={() => setActiveStage(null)}
        whileTap={{ scale: 0.985 }}
        animate={{ opacity: dimmed ? 0.82 : 1 }}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1100,
          background: stage.colors.background,
          borderColor: active ? stage.colors.accent : stage.colors.border,
          boxShadow: active
            ? `0 30px 70px ${stage.colors.glow}`
            : `0 16px 40px ${stage.colors.glow}`,
          "--tw-ring-color": stage.colors.accent,
        }}
        className="group relative flex h-full scroll-mt-28 cursor-pointer flex-col overflow-hidden rounded-[2rem] border-2 outline-none transition-[border-color,box-shadow] duration-300 focus-visible:ring-4"
      >
        {/* cursor spotlight */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />

        {/* accent bar */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-30 h-1.5"
          style={{
            background: `linear-gradient(90deg, ${stage.colors.accent}, ${stage.colors.sticker}, ${stage.colors.accent})`,
          }}
        />

        {/* PHOTO */}
        <div className="relative h-60 shrink-0 overflow-hidden sm:h-64">
          <img
            src={stage.photo}
            alt={stage.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* colour wash from the bottom */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${stage.colors.dark}D9 0%, ${stage.colors.dark}33 45%, transparent 75%)`,
            }}
          />

          {/* light sweep */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[120%] group-hover:opacity-100"
          />

          {/* big faded number */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1 select-none text-[5.5rem] font-bold leading-none text-white/25"
          >
            {stage.id}
          </span>

          {/* icon badge */}
          <span
            className="absolute left-4 top-5 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-lg transition-transform duration-500 group-hover:rotate-[360deg]"
            style={{ borderColor: stage.colors.accent, color: stage.colors.dark }}
          >
            <Icon size={21} strokeWidth={1.8} />
          </span>

          {/* label chip */}
          <span
            className="absolute bottom-4 left-4 rounded-full border border-white/50 bg-white/90 px-3.5 py-1.5 text-xs font-bold tracking-[0.2em] shadow-md backdrop-blur"
            style={{ color: stage.colors.dark }}
          >
            {stage.id} · {stage.label}
          </span>
        </div>

        {/* BODY */}
        <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-7">
          <h3
            className="text-[1.7rem] font-bold leading-[1.12] sm:text-[1.85rem]"
            style={{ color: stage.colors.dark }}
          >
            {stage.title}
          </h3>

          <p
            className="mt-3 text-[1.05rem] font-medium leading-7"
            style={{ color: BODY }}
          >
            {stage.description}
          </p>

          <ul className="mt-5 space-y-2.5">
            {stage.points.map((point, i) => (
              <li
                key={point}
                className="flex items-center gap-3 text-[1.05rem] font-semibold transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: BODY, transitionDelay: `${i * 60}ms` }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-white transition-colors duration-300 group-hover:text-white"
                  style={{
                    borderColor: stage.colors.border,
                    color: stage.colors.accent,
                    backgroundColor: active ? stage.colors.accent : "#ffffff",
                  }}
                >
                  <Check
                    size={13}
                    strokeWidth={2.8}
                    color={active ? "#ffffff" : stage.colors.accent}
                  />
                </span>
                {point}
              </li>
            ))}
          </ul>

          {/* quote + action */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
            <div
              className="max-w-[15rem] -rotate-2 rounded-2xl px-4 py-3 shadow-md transition-transform duration-300 group-hover:rotate-0"
              style={{
                backgroundColor: stage.colors.sticker,
                color: stage.colors.dark,
                boxShadow: `4px 8px 20px ${stage.colors.glow}`,
              }}
            >
              <p className="flex items-start gap-1.5 text-[1.05rem] font-bold leading-tight">
                <Quote size={14} className="mt-1 shrink-0 opacity-70" />
                {stage.quote}
              </p>
              <p className="mt-1 text-sm font-medium leading-tight opacity-90">
                {stage.quoteSmall}
              </p>
            </div>

            <span
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold tracking-[0.06em] text-white shadow-md transition-all duration-300 group-hover:gap-2.5 group-hover:shadow-lg"
              style={{ backgroundColor: stage.colors.accent }}
            >
              View story
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

/* =========================================================
   JASHNA EDU LOGO (small badge for the lightbox)
========================================================= */

function JashnaEduLogo() {
  return (
    <div className="rounded-xl border border-white/70 bg-white/90 p-1.5 shadow-lg backdrop-blur-md">
      <img
        src={logoImage}
        alt="Jashna Edu"
        className="h-auto w-[52px] object-contain sm:w-[68px]"
      />
    </div>
  );
}

/* =========================================================
   LIGHTBOX  (interactive + fully responsive)
   - never taller than the screen (100dvh minus margin)
   - phones / tablets: photo on top, story below, the whole
     card scrolls inside itself
   - laptops / desktops (lg+): photo left, story right
   - drag / swipe the photo to change stage
   - arrow keys and Esc work
========================================================= */

const slideVariants = {
  enter: (d) => ({ opacity: 0, x: d * 38 }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: d * -38 }),
};

function PhotoLightbox({ index, onClose, onNavigate }) {
  const stage = growthStages[index];
  const Icon = stage.icon;
  const total = growthStages.length;
  const nextStage = growthStages[(index + 1) % total];

  /* direction of travel (1 = forward, -1 = back), also for key presses */
  const prevIndexRef = useRef(index);
  const dirRef = useRef(1);
  if (prevIndexRef.current !== index) {
    const diff = index - prevIndexRef.current;
    dirRef.current =
      diff === total - 1 ? -1 : diff === -(total - 1) ? 1 : diff > 0 ? 1 : -1;
    prevIndexRef.current = index;
  }
  const dir = dirRef.current;

  /* tick-off checklist (kept while the lightbox stays open) */
  const [ticked, setTicked] = useState({});
  const toggleTick = (key) => setTicked((t) => ({ ...t, [key]: !t[key] }));
  const tickedCount = stage.points.filter(
    (_, i) => ticked[`${stage.id}-${i}`]
  ).length;
  const allTicked = tickedCount === stage.points.length;

  const go = (i) => onNavigate((i + total) % total);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={stage.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E1626]/75 p-3 backdrop-blur-md sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* colour wash that follows the current stage */}
      <div
        className="pointer-events-none fixed inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${stage.colors.glow}, transparent 62%)`,
        }}
      />

      <motion.div
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border shadow-[0_40px_110px_rgba(30,22,38,0.45)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem] lg:h-[min(720px,calc(100dvh-3rem))]"
        style={{
          background: stage.colors.background,
          borderColor: stage.colors.border,
        }}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 110, damping: 18 }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* close */}
        <button
          type="button"
          aria-label="Close"
          autoFocus
          onClick={onClose}
          className="absolute right-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#2B2233] shadow-lg backdrop-blur-md transition-transform hover:rotate-90 hover:scale-105 active:scale-95 sm:right-4 sm:top-4"
        >
          <X size={19} />
        </button>

        {/* scrolls on phones/tablets, fixed two-column on lg+ */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
          {/* ---------- PHOTO SIDE (drag / swipe to change stage) ---------- */}
          <motion.div
            className="relative h-56 shrink-0 cursor-grab overflow-hidden bg-[#EDE8DE] active:cursor-grabbing sm:h-72 lg:h-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.22}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(index + 1);
              else if (info.offset.x > 70) go(index - 1);
            }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <motion.img
                key={stage.id}
                src={stage.photo}
                alt={stage.title}
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover"
                custom={dir}
                variants={{
                  enter: (d) => ({ opacity: 0, x: d * 50, scale: 1.08 }),
                  center: { opacity: 1, x: 0, scale: 1 },
                  exit: (d) => ({ opacity: 0, x: d * -50 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45 }}
              />
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E1626]/85 via-[#1E1626]/10 to-[#1E1626]/20" />

            {/* huge faded number */}
            <AnimatePresence mode="wait">
              <motion.span
                key={stage.id}
                aria-hidden
                className="pointer-events-none absolute right-5 top-14 z-10 select-none text-[5rem] font-bold leading-none text-white/20 sm:text-[7rem] lg:text-[9rem]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {stage.id}
              </motion.span>
            </AnimatePresence>

            <div className="absolute left-3 top-3 z-20 sm:left-6 sm:top-6">
              <JashnaEduLogo />
            </div>

            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 sm:inset-x-7 sm:bottom-7">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/90 px-3 py-1 text-xs font-bold tracking-[0.14em] backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-sm"
                style={{ color: stage.colors.dark }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: stage.colors.sticker }}
                >
                  <Icon size={13} />
                </span>
                {stage.id} · {stage.label}
              </span>

              <AnimatePresence mode="wait">
                <motion.p
                  key={stage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 max-w-md text-base font-medium italic leading-snug text-white sm:mt-3 sm:text-xl lg:text-2xl"
                >
                  “{stage.caption}”
                </motion.p>
              </AnimatePresence>

              <p className="mt-2 hidden text-sm font-semibold tracking-[0.08em] text-white/75 sm:mt-3 sm:block">
                Drag the photo or use ← → to explore
              </p>
            </div>
          </motion.div>

          {/* ---------- STORY SIDE ---------- */}
          <div
            className="relative flex min-h-0 flex-col p-5 sm:p-8 lg:overflow-y-auto lg:p-9"
            style={{
              background: `linear-gradient(160deg, #ffffff 0%, ${stage.colors.background} 100%)`,
            }}
          >
            <div
              className="absolute left-8 right-8 top-0 h-[3px] rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${stage.colors.accent}, transparent)`,
              }}
            />

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={stage.id}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <div className="flex items-center gap-3 sm:pr-12">
                  <span
                    className="text-4xl font-bold leading-none sm:text-5xl"
                    style={{ color: stage.colors.accent }}
                  >
                    {stage.id}
                  </span>
                  <span
                    className="h-px w-8 sm:w-10"
                    style={{ backgroundColor: stage.colors.border }}
                  />
                  <span
                    className="text-xs font-bold tracking-[0.24em] sm:text-sm"
                    style={{ color: stage.colors.dark }}
                  >
                    {stage.label}
                  </span>
                </div>

                <h3
                  className="mt-3 text-2xl font-bold leading-[1.1] sm:text-3xl xl:text-4xl"
                  style={{ color: INK }}
                >
                  {stage.title}
                </h3>

                <p
                  className="mt-3 text-base font-medium leading-7 sm:text-lg sm:leading-8"
                  style={{ color: BODY }}
                >
                  {stage.description}
                </p>

                <div className="mb-3 mt-5 flex items-center justify-between gap-3 sm:mt-6">
                  <p
                    className="text-xs font-bold tracking-[0.22em] sm:text-sm"
                    style={{ color: stage.colors.accent }}
                  >
                    WHAT THIS STAGE BUILDS
                  </p>
                  <span
                    className="rounded-full border bg-white px-2.5 py-0.5 text-sm font-bold"
                    style={{
                      borderColor: stage.colors.border,
                      color: stage.colors.dark,
                    }}
                  >
                    {tickedCount}/{stage.points.length}
                  </span>
                </div>

                <ul className="space-y-2">
                  {stage.points.map((point, i) => {
                    const key = `${stage.id}-${i}`;
                    const done = !!ticked[key];

                    return (
                      <motion.li
                        key={point}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + i * 0.07 }}
                      >
                        <motion.button
                          type="button"
                          role="checkbox"
                          aria-checked={done}
                          onClick={() => toggleTick(key)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors duration-300 sm:px-4 sm:py-3"
                          style={{
                            borderColor: done
                              ? stage.colors.accent
                              : stage.colors.border,
                            backgroundColor: done
                              ? stage.colors.background
                              : "rgba(255,255,255,0.85)",
                          }}
                        >
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                            style={{
                              backgroundColor: done
                                ? stage.colors.accent
                                : stage.colors.background,
                              color: done ? "#ffffff" : stage.colors.accent,
                              border: `1px solid ${
                                done ? stage.colors.accent : stage.colors.border
                              }`,
                            }}
                          >
                            <motion.span
                              animate={{ scale: done ? [0.4, 1.25, 1] : 1 }}
                              transition={{ duration: 0.35 }}
                              className="flex"
                            >
                              <Check size={15} strokeWidth={2.8} />
                            </motion.span>
                          </span>
                          <span
                            className="text-base font-semibold sm:text-lg"
                            style={{ color: done ? stage.colors.dark : BODY }}
                          >
                            {point}
                          </span>
                        </motion.button>
                      </motion.li>
                    );
                  })}
                </ul>

                <p className="mt-3 text-sm font-medium" style={{ color: BODY }}>
                  {allTicked
                    ? `All set — ready for ${nextStage.title.toLowerCase()}?`
                    : "Tap each point to tick off the skills you want to build."}
                </p>

                {/* quote sticker */}
                <div
                  className="mt-5 inline-block max-w-full rotate-[-2deg] rounded-2xl px-5 py-3.5 shadow-lg"
                  style={{
                    backgroundColor: stage.colors.sticker,
                    color: stage.colors.dark,
                    boxShadow: `6px 10px 24px ${stage.colors.glow}`,
                  }}
                >
                  <p className="text-lg font-bold leading-tight sm:text-xl">
                    “{stage.quote}”
                  </p>
                  <p className="mt-1 text-base font-medium opacity-90">
                    {stage.quoteSmall}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* footer: stepper + previous / next */}
            <div
              className="mt-6 border-t pt-4"
              style={{ borderColor: stage.colors.border }}
            >
              {/* stage stepper with progress line */}
              <div className="relative mx-auto flex w-full max-w-[26rem] items-center justify-between">
                <span
                  aria-hidden
                  className="absolute left-4 right-4 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: stage.colors.border }}
                />
                <motion.span
                  aria-hidden
                  className="absolute left-4 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: stage.colors.accent }}
                  animate={{
                    width: `calc((100% - 2rem) * ${index / (total - 1)})`,
                  }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                />
                {growthStages.map((item, i) => {
                  const ItemIcon = item.icon;
                  const active = i === index;
                  const passed = i < index;

                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      title={item.title}
                      aria-label={`Go to ${item.title}`}
                      aria-current={active ? "step" : undefined}
                      onClick={() => go(i)}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.92 }}
                      animate={{ scale: active ? 1.18 : 1 }}
                      className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10"
                      style={{
                        borderColor:
                          active || passed
                            ? stage.colors.accent
                            : stage.colors.border,
                        backgroundColor: active
                          ? stage.colors.accent
                          : passed
                          ? stage.colors.background
                          : "#ffffff",
                        color: active ? "#ffffff" : stage.colors.dark,
                      }}
                    >
                      <ItemIcon size={16} strokeWidth={1.9} />
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  aria-label="Previous stage"
                  onClick={() => go(index - 1)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white transition-transform hover:scale-105 active:scale-95"
                  style={{
                    borderColor: stage.colors.border,
                    color: stage.colors.dark,
                  }}
                >
                  <ArrowLeft size={18} />
                </button>

                <span
                  className="text-sm font-bold tracking-[0.18em]"
                  style={{ color: stage.colors.dark }}
                >
                  {index + 1} OF {total}
                </span>

                <button
                  type="button"
                  aria-label="Next stage"
                  onClick={() => go(index + 1)}
                  className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-white shadow-md transition-transform hover:scale-105 active:scale-95 sm:px-5"
                  style={{ backgroundColor: stage.colors.accent }}
                >
                  <span className="hidden text-sm font-bold tracking-[0.1em] sm:inline">
                    NEXT · {nextStage.label}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}