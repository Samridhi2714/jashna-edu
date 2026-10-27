import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
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
} from "lucide-react";

import treeImage from "../assets/images/tree.webp";
import logoImage from "../assets/images/logo.webp";

import growthAssessment from "../assets/images/growth-assessment.webp";
import growthFoundation from "../assets/images/growth-foundation.webp";
import growthPractice from "../assets/images/growth-practice.webp";
import growthConfidence from "../assets/images/growth-confidence.webp";
import growthImpact from "../assets/images/growth-impact.webp";
import growthTransformation from "../assets/images/growth-transformation.webp";

/* Times New Roman everywhere inside this section (and the lightbox) */
const TIMES = "[&_*]:![font-family:Times_New_Roman,Times,serif]";

/* Shared text colours (kept from the original theme) */
const INK = "#2B2233";
const BODY = "#4A4452";

/* =========================================================
   DATA
   `side` decides which column a card sits in on desktop.
   photoPosition = % position of the small photo inside the
   tree box (box is 600 x 930 ratio).
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
    side: "left",
    photoPosition: { left: "13%", top: "20%" },
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
    side: "right",
    photoPosition: { left: "70%", top: "23%" },
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
    side: "left",
    photoPosition: { left: "11%", top: "47%" },
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
    side: "right",
    photoPosition: { left: "70%", top: "49%" },
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
    side: "left",
    photoPosition: { left: "30%", top: "74%" },
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
    side: "right",
    photoPosition: { left: "66%", top: "76%" },
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

/* Desktop grid placement: left column = 1, right column = 3 */
const desktopPlacement = [
  "col-start-1 row-start-1",
  "col-start-3 row-start-1",
  "col-start-1 row-start-2",
  "col-start-3 row-start-2",
  "col-start-1 row-start-3",
  "col-start-3 row-start-3",
];

export default function JashnaGrowth() {
  const [activeStage, setActiveStage] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const desktopRef = useRef(null);
  const cardRefs = useRef([]);
  const photoRefs = useRef([]);

  const isOpen = openIndex !== null;
  const total = growthStages.length;

  /* lightbox: Esc closes, arrow keys move between stages, page scroll locked */
  useEffect(() => {
    if (!isOpen) return;

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

  const scrollToCard = (i) =>
    document
      .getElementById(`growth-card-${i}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className={TIMES}>
      <section
        id="growth"
        className="relative overflow-hidden bg-[#FCFAF6] pb-10 pt-20 lg:pt-18"
      >
        {/* BACKGROUND GLOWS */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute left-[-180px] top-[180px] h-[420px] w-[420px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(226,150,140,0.14), transparent 68%)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[100px] right-[-150px] h-[430px] w-[430px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(140,160,120,0.14), transparent 68%)",
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
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
              THE JASHNA GROWTH TREE
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

        {/* =====================================================
            DESKTOP (1440px and up) — 3 column grid, tree in centre
            --card = circle size. It follows the screen width AND
            height (whichever is smaller), between 290px and 380px,
            so the layout is compact on 80–90% zoom and still fits
            on shorter laptop screens.
        ====================================================== */}
        <div
          ref={desktopRef}
          className="relative mx-auto mt-4 hidden w-full max-w-[1760px] grid-cols-[var(--card)_minmax(0,1fr)_var(--card)] grid-rows-[repeat(3,var(--card))] gap-x-8 gap-y-8 px-10 py-8 [--card:clamp(290px,min(19vw,34vh),380px)] min-[1440px]:grid"
        >
          <GrowthConnectionLines
            containerRef={desktopRef}
            cardRefs={cardRefs}
            photoRefs={photoRefs}
            activeStage={activeStage}
          />

          {/* TREE (centre column) — height follows the 3 card rows */}
          <div className="relative z-20 col-start-2 row-span-3 row-start-1 flex min-h-0 min-w-0 items-center justify-center">
            <TreeVisual
              activeStage={activeStage}
              setActiveStage={setActiveStage}
              onSelect={setOpenIndex}
              photoRefs={photoRefs}
            />
            <TreeParticles />
          </div>

          {/* CIRCULAR CARDS */}
          {growthStages.map((stage, index) => (
            <GrowthCard
              key={stage.id}
              stage={stage}
              index={index}
              activeStage={activeStage}
              setActiveStage={setActiveStage}
              onSelect={setOpenIndex}
              cardRef={(el) => (cardRefs.current[index] = el)}
              placement={desktopPlacement[index]}
            />
          ))}
        </div>

        {/* =====================================================
            TABLET + MOBILE (below 1440px) — tree hidden, image cards
        ====================================================== */}
        <div className="relative min-[1440px]:hidden">
          {/* quick jump chips */}
          <nav aria-label="Growth stages" className="mx-auto mt-8 max-w-5xl px-5">
            <ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] md:flex-wrap md:justify-center md:overflow-visible [&::-webkit-scrollbar]:hidden">
              {growthStages.map((s, i) => (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollToCard(i)}
                    className="flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm font-bold tracking-[0.1em] shadow-sm transition-transform active:scale-95"
                    style={{ borderColor: s.colors.border, color: s.colors.dark }}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                      style={{ backgroundColor: s.colors.accent }}
                    >
                      {i + 1}
                    </span>
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative mx-auto mt-12 max-w-xl px-5 md:max-w-5xl md:px-8">
            {/* dotted path joining the cards on phones */}
            <span
              aria-hidden
              className="absolute bottom-8 left-1/2 top-8 border-l-2 border-dashed border-[#D9C9AE] md:hidden"
            />
            <div className="relative grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-x-8 md:gap-y-14">
              {growthStages.map((stage, index) => (
                <MobileGrowthCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  onOpenPhoto={() => setOpenIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM STATEMENT */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto mt-14 max-w-3xl px-6 min-[1440px]:mt-4"
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
   TREE + SMALL PHOTOS
   The box keeps the 600:930 ratio. Its HEIGHT now fills the
   centre column (= the height of the 3 card rows) and the
   width follows from the ratio, so photos stay on the same
   branches and line up with the circles at any screen size.
========================================================= */

const TREE_MASK =
  "radial-gradient(ellipse 70% 75% at 50% 50%, #000 62%, transparent 100%)";

function TreeVisual({ activeStage, setActiveStage, onSelect, photoRefs }) {
  return (
    <div
      className="relative mx-auto aspect-[600/930] max-w-full"
      style={{ height: "100%" }}
    >
      {/* tree glow */}
      <motion.div
        className="pointer-events-none absolute inset-x-[6%] inset-y-[16%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(213,173,87,0.20), rgba(252,250,246,0) 68%)",
        }}
        animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.img
        src={treeImage}
        alt="The Jashna Growth Tree"
        className="relative z-10 h-full w-full object-contain"
        style={{ WebkitMaskImage: TREE_MASK, maskImage: TREE_MASK }}
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        animate={{ y: [0, -5, 0] }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 1 },
          y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {growthStages.map((stage, index) => {
        const isActive = activeStage === index;
        const Icon = stage.icon;

        return (
          /* static wrapper = stable anchor for the connection lines */
          <div
            key={stage.id}
            ref={(el) => {
              if (photoRefs) photoRefs.current[index] = el;
            }}
            className="absolute z-30"
            style={{
              left: stage.photoPosition.left,
              top: stage.photoPosition.top,
              width: "17%",
              aspectRatio: "1 / 1",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.button
              type="button"
              aria-label={`Open ${stage.title}`}
              onMouseEnter={() => setActiveStage(index)}
              onMouseLeave={() => setActiveStage(null)}
              onFocus={() => setActiveStage(index)}
              onBlur={() => setActiveStage(null)}
              onClick={() => onSelect(index)}
              className="group relative block h-full w-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 4.5 + index * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.25,
              }}
            >
              <motion.div
                className="absolute inset-[-14px] rounded-full blur-md"
                style={{ background: stage.colors.glow }}
                animate={{
                  opacity: isActive ? 0.95 : 0.45,
                  scale: isActive ? 1.2 : 1,
                }}
                transition={{ duration: 0.35 }}
              />

              <motion.div
                className="relative flex h-full w-full items-center justify-center rounded-full p-[4px]"
                style={{
                  background: `conic-gradient(from 0deg, ${stage.colors.accent}, #ffffff, ${stage.colors.accent}, #ffffff, ${stage.colors.accent})`,
                }}
                animate={{ rotate: 360, scale: isActive ? 1.13 : 1 }}
                transition={{
                  rotate: {
                    duration: isActive ? 4 : 8,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: { duration: 0.35 },
                }}
              >
                <div className="h-full w-full overflow-hidden rounded-full border-[3px] border-[#FCFAF6] bg-white">
                  <img
                    src={stage.photo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>

              <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-full bg-[#2B2233]/70 px-2 text-center opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[12px] font-bold tracking-[0.06em] text-white shadow-lg backdrop-blur-md">
                  View
                  <ArrowUpRight size={12} strokeWidth={2.2} />
                </span>
              </span>

              <motion.span
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#FCFAF6]"
                style={{
                  backgroundColor: stage.colors.background,
                  color: stage.colors.dark,
                }}
                animate={{ scale: isActive ? 1.12 : 1 }}
              >
                <Icon size={14} strokeWidth={1.8} />
              </motion.span>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   DESKTOP CIRCULAR GROWTH CARD
   Size comes from --card (290px → 380px).
   The circle now shows ONLY: icon, stage label, title and the
   3 key points. The full description is in the opened card.
   Text uses container-query units (cqw) of the circle's content
   width, with readable minimums (title 20px, points 14.5px).
========================================================= */

function GrowthCard({
  stage,
  index,
  activeStage,
  setActiveStage,
  onSelect,
  cardRef,
  placement,
}) {
  const Icon = stage.icon;
  const isActive = activeStage === index;
  const isLeft = stage.side === "left";

  return (
    <div
      ref={cardRef}
      className={`relative z-40 h-[var(--card)] w-[var(--card)] ${placement} ${
        isLeft ? "justify-self-start" : "justify-self-end"
      }`}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 0.86 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 0.75,
          delay: 0.15 + index * 0.08,
          type: "spring",
          stiffness: 80,
        }}
        animate={{ y: [0, -5, 0] }}
        whileHover={{ scale: 1.03, y: -6 }}
        onMouseEnter={() => setActiveStage(index)}
        onMouseLeave={() => setActiveStage(null)}
      >
        {/* rotating main ring */}
        <motion.div
          className="absolute inset-[-7px] rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${stage.colors.accent}, transparent 23%, transparent 50%, ${stage.colors.accent}, transparent 76%, ${stage.colors.accent})`,
            opacity: isActive ? 0.95 : 0.65,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: isActive ? 7 : 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* dashed ring */}
        <motion.div
          className="absolute inset-[-13px] rounded-full border border-dashed"
          style={{ borderColor: stage.colors.border }}
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* main circle (clickable) */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Open ${stage.title}`}
          onClick={() => onSelect(index)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(index);
            }
          }}
          onFocus={() => setActiveStage(index)}
          onBlur={() => setActiveStage(null)}
          className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-full border-[1.5px] outline-none focus-visible:ring-4"
          style={{
            containerType: "inline-size",
            padding: "9% 11%",
            background: `radial-gradient(circle at 35% 25%, #ffffff 0%, ${stage.colors.background} 65%, ${stage.colors.background} 100%)`,
            borderColor: stage.colors.border,
            boxShadow: isActive
              ? `0 22px 60px ${stage.colors.glow}`
              : "0 15px 42px rgba(42,35,28,0.08)",
            "--tw-ring-color": stage.colors.border,
          }}
        >
          <div
            className="pointer-events-none absolute right-[12%] top-[9%] h-14 w-14 rounded-full blur-xl"
            style={{ background: stage.colors.accent, opacity: 0.13 }}
          />

          {/* number chip (top) */}
          <div
            className="absolute left-1/2 top-[-15px] -translate-x-1/2 rounded-full border bg-[#FCFAF6] px-4 py-1 text-[13px] font-bold tracking-[0.25em]"
            style={{
              borderColor: stage.colors.border,
              color: stage.colors.dark,
            }}
          >
            {stage.id}
          </div>

          {/* "view story" chip (bottom) */}
          <span
            className="absolute bottom-[-15px] left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1 text-[13px] font-bold tracking-[0.06em] shadow-md transition-colors duration-300"
            style={{
              borderColor: stage.colors.border,
              backgroundColor: isActive ? stage.colors.accent : "#FCFAF6",
              color: isActive ? "#ffffff" : stage.colors.dark,
            }}
          >
            View story
            <ArrowUpRight size={14} strokeWidth={2.4} />
          </span>

          {/* icon */}
          <motion.div
            className="flex shrink-0 items-center justify-center rounded-full border bg-white"
            style={{
              width: "clamp(42px, 15cqw, 54px)",
              height: "clamp(42px, 15cqw, 54px)",
              borderColor: stage.colors.border,
              color: stage.colors.dark,
              boxShadow: `0 8px 20px ${stage.colors.glow}`,
            }}
            animate={{ rotate: isActive ? [0, -5, 5, 0] : 0 }}
            transition={{ duration: 0.55 }}
          >
            <Icon size={22} strokeWidth={1.7} />
          </motion.div>

          {/* label */}
          <span
            className="mt-2.5 font-bold tracking-[0.22em]"
            style={{
              color: stage.colors.accent,
              fontSize: "clamp(12px, 4.2cqw, 15px)",
            }}
          >
            {stage.label}
          </span>

          {/* title — fixed 2-line height so every circle lines up */}
          <h3
            className="mt-1.5 flex max-w-full items-center justify-center text-center font-bold leading-[1.1]"
            style={{
              color: stage.colors.dark,
              fontSize: "clamp(21px, 8.6cqw, 29px)",
              minHeight: "2.2em",
            }}
          >
            {stage.title}
          </h3>

          {/* key points only (description lives in the opened card) */}
          <ul className="mt-3 w-full space-y-2">
            {stage.points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2.5 font-semibold leading-tight"
                style={{
                  color: BODY,
                  fontSize: "clamp(14.5px, 5.7cqw, 18px)",
                }}
              >
                <span
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border bg-white"
                  style={{
                    borderColor: stage.colors.border,
                    color: stage.colors.accent,
                  }}
                >
                  <Check size={12} strokeWidth={2.6} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <QuoteSticker stage={stage} index={index} isLeft={isLeft} />
      </motion.div>
    </div>
  );
}

/* =========================================================
   QUOTE STICKER (sits on the side that faces the tree)
========================================================= */

function QuoteSticker({ stage, index, isLeft }) {
  const rotations = [-8, 6, -5, 7, -7, 5];

  return (
    <motion.div
      className={`pointer-events-none absolute -top-[20px] z-20 w-[132px] ${
        isLeft ? "-right-[30px]" : "-left-[30px]"
      }`}
      initial={{ opacity: 0, scale: 0.7, rotate: rotations[index] - 8 }}
      whileInView={{ opacity: 1, scale: 1, rotate: rotations[index] }}
      viewport={{ once: true }}
      animate={{
        y: [0, -5, 0],
        rotate: [rotations[index], rotations[index] + 2, rotations[index]],
      }}
      transition={{
        opacity: { duration: 0.5, delay: 0.4 + index * 0.1 },
        scale: { duration: 0.5, delay: 0.4 + index * 0.1, type: "spring" },
        y: { duration: 3.8 + index * 0.2, repeat: Infinity, ease: "easeInOut" },
        rotate: {
          duration: 4.5 + index * 0.15,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <div
        className="absolute -top-2 left-1/2 h-3 w-8 -translate-x-1/2 rotate-[-4deg] opacity-70"
        style={{ backgroundColor: "#F6EBD5" }}
      />

      <div
        className="relative rounded-[13px] px-3 py-3 text-center"
        style={{
          backgroundColor: stage.colors.sticker,
          color: stage.colors.dark,
          boxShadow: `4px 7px 18px ${stage.colors.glow}`,
          clipPath: "polygon(4% 10%,94% 4%,100% 88%,87% 97%,12% 92%,0 78%)",
        }}
      >
        <div className="text-[16px] font-bold leading-[1.08]">
          “{stage.quote}”
        </div>
        <div className="mt-1 text-[12.5px] font-semibold leading-[1.2] opacity-90">
          {stage.quoteSmall}
        </div>
        <motion.div
          className="mx-auto mt-2 h-[2px] w-8 rounded-full"
          style={{ backgroundColor: stage.colors.dark }}
          animate={{ width: [25, 38, 25] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

/* =========================================================
   MOBILE / TABLET CARD
   photo on top, then label, title, text, points and quote
========================================================= */

function MobileGrowthCard({ stage, index, onOpenPhoto }) {
  const Icon = stage.icon;
  const tilt = index % 2 === 0 ? -2 : 2;

  return (
    <motion.article
      id={`growth-card-${index}`}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay: (index % 2) * 0.06 }}
      className="relative flex h-full scroll-mt-24 flex-col rounded-[2rem] border"
      style={{
        background: stage.colors.background,
        borderColor: stage.colors.border,
        boxShadow: `0 18px 45px ${stage.colors.glow}`,
      }}
    >
      {/* number chip sits on the top edge */}
      <div
        className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-[#FCFAF6] px-4 py-1 text-sm font-bold tracking-[0.22em]"
        style={{ borderColor: stage.colors.border, color: stage.colors.dark }}
      >
        {stage.id}
      </div>

      {/* PHOTO */}
      <button
        type="button"
        onClick={onOpenPhoto}
        aria-label={`Open ${stage.title}`}
        className="group relative block h-56 w-full overflow-hidden rounded-t-[2rem] sm:h-64"
      >
        <img
          src={stage.photo}
          alt={stage.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#2B2233]/55 via-transparent to-[#2B2233]/10" />

        <span
          className="absolute left-4 top-6 flex h-11 w-11 items-center justify-center rounded-full border bg-white/95 shadow-md"
          style={{ borderColor: stage.colors.border, color: stage.colors.dark }}
        >
          <Icon size={20} strokeWidth={1.7} />
        </span>

        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-bold text-[#2B2233] shadow-md backdrop-blur">
          View story
          <ArrowUpRight size={14} />
        </span>
      </button>

      {/* BODY */}
      <div className="flex flex-1 flex-col p-6">
        <span
          className="text-sm font-bold tracking-[0.24em]"
          style={{ color: stage.colors.accent }}
        >
          {stage.label}
        </span>
        <h3
          className="mt-1 text-[1.75rem] font-bold leading-tight"
          style={{ color: stage.colors.dark }}
        >
          {stage.title}
        </h3>

        <p
          className="mt-3 text-[1.08rem] font-medium leading-7"
          style={{ color: BODY }}
        >
          {stage.description}
        </p>

        <ul className="mt-4 space-y-2.5">
          {stage.points.map((point) => (
            <li
              key={point}
              className="flex items-center gap-3 text-[1.05rem] font-semibold"
              style={{ color: BODY }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-white"
                style={{
                  borderColor: stage.colors.border,
                  color: stage.colors.accent,
                }}
              >
                <Check size={13} strokeWidth={2.6} />
              </span>
              {point}
            </li>
          ))}
        </ul>

        {/* QUOTE */}
        <div className="mt-auto pt-6">
          <div
            className="inline-block rounded-[14px] px-4 py-3 shadow-md"
            style={{
              backgroundColor: stage.colors.sticker,
              color: stage.colors.dark,
              transform: `rotate(${tilt}deg)`,
            }}
          >
            <p className="text-[1.05rem] font-bold leading-tight">
              “{stage.quote}”
            </p>
            <p className="mt-1 text-sm font-medium leading-tight opacity-90">
              {stage.quoteSmall}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
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
   - laptops / desktops (lg+): photo left, story right; the
     story side scrolls inside itself if the screen is short
   - photo follows the mouse (parallax + soft spotlight)
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

  /* mouse parallax + spotlight on the photo side */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spotX = useMotionValue(-300);
  const spotY = useMotionValue(-300);
  const spring = { stiffness: 90, damping: 18 };
  const imgX = useSpring(useTransform(mx, [-0.5, 0.5], [14, -14]), spring);
  const imgY = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), spring);

  const handlePointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    spotX.set(e.clientX - r.left - 144);
    spotY.set(e.clientY - r.top - 144);
  };
  const handlePointerLeave = () => {
    mx.set(0);
    my.set(0);
    spotX.set(-300);
    spotY.set(-300);
  };

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
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
          >
            {/* parallax photo */}
            <motion.div
              className="absolute inset-0"
              style={{ x: imgX, y: imgY, scale: 1.12 }}
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
            </motion.div>

            {/* soft spotlight following the cursor */}
            <motion.div
              className="pointer-events-none absolute left-0 top-0 z-10 h-72 w-72 rounded-full bg-white/25 blur-3xl"
              style={{ x: spotX, y: spotY }}
            />

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

                <p
                  className="mt-3 text-sm font-medium"
                  style={{ color: BODY }}
                >
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

                <motion.button
                  type="button"
                  aria-label="Next stage"
                  onClick={() => go(index + 1)}
                  animate={allTicked ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={
                    allTicked
                      ? { duration: 1.4, repeat: Infinity }
                      : { duration: 0.2 }
                  }
                  className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-white shadow-md transition-transform hover:scale-105 active:scale-95 sm:px-5"
                  style={{ backgroundColor: stage.colors.accent }}
                >
                  <span className="hidden text-sm font-bold tracking-[0.1em] sm:inline">
                    NEXT · {nextStage.label}
                  </span>
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   CONNECTION LINES
   Measured from the real position of each card and each photo,
   so they stay attached at every screen width / zoom level.
========================================================= */

function GrowthConnectionLines({
  containerRef,
  cardRefs,
  photoRefs,
  activeStage,
}) {
  const [paths, setPaths] = useState([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const compute = () => {
      const c = container.getBoundingClientRect();
      if (!c.width) return;

      const next = growthStages.map((stage, i) => {
        const card = cardRefs.current[i];
        const photo = photoRefs.current[i];
        if (!card || !photo) return null;

        const a = card.getBoundingClientRect();
        const p = photo.getBoundingClientRect();
        const isLeft = stage.side === "left";
        const sign = isLeft ? 1 : -1;

        const startX = (isLeft ? a.right + 14 : a.left - 14) - c.left;
        const startY = a.top + a.height / 2 - c.top;

        const px = p.left + p.width / 2 - c.left;
        const py = p.top + p.height / 2 - c.top;
        const reach = p.width / 2 + 8;

        const endX = isLeft ? px - reach : px + reach;
        const endY = py;
        const pull = Math.max(40, Math.abs(endX - startX) * 0.5);

        return {
          d: `M ${startX} ${startY} C ${startX + sign * pull} ${startY}, ${
            endX - sign * pull
          } ${endY}, ${endX} ${endY}`,
          endX,
          endY,
        };
      });

      setPaths(next);
    };

    compute();

    /* the tree box sizes itself after first paint, so measure once more */
    const raf = requestAnimationFrame(compute);

    const observer = new ResizeObserver(compute);
    observer.observe(container);
    window.addEventListener("resize", compute);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [containerRef, cardRefs, photoRefs]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[25] h-full w-full"
      fill="none"
    >
      {paths.map((line, index) => {
        if (!line) return null;

        const color = growthStages[index].colors.accent;
        const isActive = activeStage === index;

        return (
          <g key={index}>
            <path
              d={line.d}
              stroke={color}
              strokeWidth={isActive ? 8 : 4}
              strokeLinecap="round"
              opacity={isActive ? 0.18 : 0.08}
              style={{ filter: "blur(5px)" }}
            />

            <motion.path
              d={line.d}
              stroke={color}
              strokeWidth={isActive ? 2.2 : 1.5}
              strokeLinecap="round"
              strokeDasharray="4 8"
              opacity={isActive ? 0.9 : 0.55}
              animate={{ strokeDashoffset: [0, -24] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />

            <circle
              cx={line.endX}
              cy={line.endY}
              r={isActive ? 6.5 : 5}
              fill={color}
              opacity={isActive ? 1 : 0.8}
            />
            <circle
              cx={line.endX}
              cy={line.endY}
              r={isActive ? 12 : 9}
              stroke={color}
              strokeWidth="1"
              opacity={isActive ? 0.45 : 0.22}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================
   FLOATING TREE PARTICLES (positioned inside the tree column)
========================================================= */

function TreeParticles() {
  const particles = [
    { left: "42%", top: "12%", size: 4, delay: 0 },
    { left: "58%", top: "16%", size: 3, delay: 1.2 },
    { left: "38%", top: "30%", size: 3, delay: 2 },
    { left: "64%", top: "33%", size: 4, delay: 0.8 },
    { left: "44%", top: "50%", size: 3, delay: 1.7 },
    { left: "57%", top: "58%", size: 3, delay: 2.6 },
    { left: "49%", top: "68%", size: 4, delay: 1 },
  ];

  return (
    <>
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute z-30 rounded-full bg-[#C69A3A]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -14, 0],
            x: [0, 4, -3, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + index * 0.3,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}