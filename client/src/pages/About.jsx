import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Check,
  GraduationCap,
  Target,
  Sparkles,
  MessageCircle,
  Users,
  Award,
  BookOpen,
  Lightbulb,
  Plus,
} from "lucide-react";

import drShivam from "../assets/about/dr-shivam.webp";
const quoteCards = [
  {
    id: "learning",
    topic: "Learning",
    icon: BookOpen,
    quote:
      "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    role: "Blues musician",
    takeaway:
      "Every sentence you practise becomes a skill that stays with you for good.",
    accent: {
      bar: "bg-jashna-maroon",
      chip: "bg-jashna-maroon/10 text-jashna-maroon",
      mark: "text-jashna-maroon/[0.09]",
      border: "hover:border-jashna-maroon/50",
      open: "border-jashna-maroon/60",
      button: "group-hover:bg-jashna-maroon group-hover:text-white",
      buttonOpen: "bg-jashna-maroon text-white",
    },
  },
  {
    id: "education",
    topic: "Education",
    icon: GraduationCap,
    quote:
      "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    role: "Anti-apartheid leader and former President of South Africa",
    takeaway:
      "Clear communication turns what you know into real opportunity.",
    accent: {
      bar: "bg-jashna-gold",
      chip: "bg-jashna-gold/20 text-jashna-navy",
      mark: "text-jashna-gold/[0.18]",
      border: "hover:border-jashna-gold/70",
      open: "border-jashna-gold/80",
      button: "group-hover:bg-jashna-gold group-hover:text-jashna-navy",
      buttonOpen: "bg-jashna-gold text-jashna-navy",
    },
  },
  {
    id: "change",
    topic: "Growth",
    icon: Sparkles,
    quote:
      "The only person who is educated is the one who has learned how to learn and change.",
    author: "Carl Rogers",
    role: "Psychologist",
    takeaway:
      "Be willing to unlearn old habits, like the fear of speaking up.",
    accent: {
      bar: "bg-jashna-navy",
      chip: "bg-jashna-navy/10 text-jashna-navy",
      mark: "text-jashna-navy/[0.07]",
      border: "hover:border-jashna-navy/50",
      open: "border-jashna-navy/60",
      button: "group-hover:bg-jashna-navy group-hover:text-white",
      buttonOpen: "bg-jashna-navy text-white",
    },
  },
  {
    id: "consistency",
    topic: "Consistency",
    icon: Target,
    quote:
      "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    role: "Chinese philosopher",
    takeaway:
      "A few minutes of speaking practice every day beats one big effort a month.",
    accent: {
      bar: "bg-jashna-maroon",
      chip: "bg-jashna-maroon/10 text-jashna-maroon",
      mark: "text-jashna-maroon/[0.09]",
      border: "hover:border-jashna-maroon/50",
      open: "border-jashna-maroon/60",
      button: "group-hover:bg-jashna-maroon group-hover:text-white",
      buttonOpen: "bg-jashna-maroon text-white",
    },
  },
];

function QuoteCard({ card, index, isOpen, onToggle }) {
  const Icon = card.icon;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[20px] border bg-white p-5 text-left shadow-[0_10px_30px_-18px_rgba(16,36,62,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(16,36,62,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-jashna-navy focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3efe6] sm:rounded-[24px] sm:p-7 lg:p-8 ${
        isOpen ? card.accent.open : `border-jashna-navy/15 ${card.accent.border}`
      }`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
    >
      {/* oversized quote mark */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-1 -top-4 select-none font-serif text-[6.5rem] leading-none transition-transform duration-700 group-hover:scale-110 sm:-top-6 sm:text-[9rem] lg:text-[11rem] ${card.accent.mark}`}
      >
        ”
      </span>

      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold sm:px-3.5 ${card.accent.chip}`}
        >
          <Icon size={14} />
          {card.topic}
        </span>

        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-jashna-navy/20 text-jashna-navy transition-all duration-300 sm:h-9 sm:w-9 ${
            isOpen
              ? `rotate-45 ${card.accent.buttonOpen}`
              : card.accent.button
          }`}
        >
          <Plus size={16} />
        </span>
      </div>

      <blockquote className="relative z-10 mt-6 flex-1 font-serif text-[1.25rem] font-bold leading-[1.3] text-jashna-navy sm:mt-8 sm:text-[1.5rem] lg:text-[1.75rem] xl:text-[1.9rem]">
        “{card.quote}”
      </blockquote>

      {/* writer name below the quote */}
      <div className="relative z-10 mt-6 flex items-center gap-3 sm:mt-8 sm:gap-4">
        <span
          className={`h-[3px] w-8 shrink-0 rounded-full transition-all duration-500 group-hover:w-14 sm:w-10 sm:group-hover:w-16 ${card.accent.bar}`}
        />
        <div className="min-w-0">
          <p className="text-base font-bold text-jashna-navy sm:text-lg">
            {card.author}
          </p>
          <p className="text-[13px] font-medium leading-5 text-jashna-charcoal/80 sm:text-sm">
            {card.role}
          </p>
        </div>
      </div>

      {/* reveal: what it means for learning to speak */}
      <div
        className={`relative z-10 grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="mt-5 border-t border-jashna-navy/15 pt-4 text-[15px] font-semibold leading-7 text-jashna-navy sm:mt-6 sm:pt-5 sm:text-base">
            <span className="text-jashna-maroon">In practice: </span>
            {card.takeaway}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

/* =========================================================
   FOUNDER CREDENTIALS
========================================================= */

const founderCredentials = [
  {
    icon: GraduationCap,
    number: "01",
    title: "PhD",
    text: "English Language / Linguistics",
  },
  {
    icon: Award,
    number: "02",
    title: "CELTA",
    text: "Cambridge-certified trainer",
  },
  {
    icon: Users,
    number: "03",
    title: "20,000+",
    text: "Students mentored",
  },
  {
    icon: MessageCircle,
    number: "04",
    title: "14+ years",
    text: "Experience in communication education",
  },
];

/* =========================================================
   TRANSFORMATION — "THE JASHNA SHIFT" DATA
========================================================= */

const shifts = [
  {
    id: "clarity",
    before: "Hesitation",
    after: "Clarity",
    icon: Lightbulb,
    line: "From stopping mid-sentence to speaking in clear steps.",
    beforeQuote: "Umm… what I wanted to say is… actually, never mind.",
    afterQuote:
      "My point is simple: here are the three steps, and here is the outcome.",
    help: "Structured speaking frameworks, vocabulary building and guided practice.",
    skills: ["Structure", "Vocabulary", "Pace"],
  },
  {
    id: "confidence",
    before: "Self-doubt",
    after: "Confidence",
    icon: Sparkles,
    line: "From staying silent to being the one who speaks up.",
    beforeQuote:
      "I don't think my English is good enough to speak in front of everyone.",
    afterQuote: "I'll take this one. I'm ready to present.",
    help: "Personalised coaching, mock sessions and encouraging feedback.",
    skills: ["Coaching", "Mock Sessions", "Feedback"],
  },
  {
    id: "expressing",
    before: "Knowing",
    after: "Expressing",
    icon: MessageCircle,
    line: "From having the answer to being able to explain it.",
    beforeQuote: "I know the answer… but the right words just don't come.",
    afterQuote: "Let me explain it in a way that everyone can follow.",
    help: "Real-life speaking activities and expression practice.",
    skills: ["Speaking Drills", "Fluency", "Expression"],
  },
  {
    id: "connecting",
    before: "Speaking",
    after: "Connecting",
    icon: Users,
    line: "From delivering lines to creating understanding.",
    beforeQuote: "I just recited what I had prepared and sat down.",
    afterQuote:
      "I listened, responded and brought the whole room along with me.",
    help: "Interactive discussions, storytelling and public speaking practice.",
    skills: ["Storytelling", "Discussion", "Public Speaking"],
  },
];

const SHIFT_AUTO_MS = 8000;
const WAVE_BARS = 32;

/* Irregular, jittery heights = unsteady voice */
const BEFORE_HEIGHTS = Array.from(
  { length: WAVE_BARS },
  (_, i) => 16 + ((i * 37) % 29) * 2.2,
);

/* Smooth, rhythmic heights = clear, confident voice */
const AFTER_HEIGHTS = Array.from(
  { length: WAVE_BARS },
  (_, i) => 22 + Math.abs(Math.sin((i / (WAVE_BARS - 1)) * Math.PI * 2)) * 58,
);

/* =========================================================
   VOICE WAVE (visual: messy voice -> smooth voice)
   Bars flex to fill the available width, so it never
   overflows on narrow phones and stays full on wide cards.
========================================================= */

function VoiceWave({ mode }) {
  const isBefore = mode === "before";

  return (
    <div
      className="flex h-[90px] w-full items-center justify-center gap-[2px] sm:h-[110px] sm:gap-1"
      aria-hidden="true"
    >
      {Array.from({ length: WAVE_BARS }).map((_, i) => {
        const base = isBefore ? BEFORE_HEIGHTS[i] : AFTER_HEIGHTS[i];

        return (
          <motion.span
            key={`${mode}-${i}`}
            className={`w-full max-w-[5px] flex-1 rounded-full ${
              isBefore
                ? "bg-white/35"
                : "bg-gradient-to-t from-jashna-gold to-[#f3dca4]"
            }`}
            initial={{
              height: isBefore ? AFTER_HEIGHTS[i] * 0.4 : BEFORE_HEIGHTS[i],
            }}
            animate={{
              height: isBefore
                ? [base, base * 0.55, base * 1.1, base]
                : [base, base * 0.82, base],
            }}
            transition={{
              duration: isBefore ? 0.7 + (i % 5) * 0.18 : 2.4,
              delay: isBefore ? 0 : i * 0.04,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

/* =========================================================
   TRANSFORMATION SHOWCASE (interactive)
========================================================= */

function TransformationShowcase() {
  const [active, setActive] = useState(0);
  const [view, setView] = useState("before");
  const [paused, setPaused] = useState(false);

  const current = shifts[active];
  const CurrentIcon = current.icon;

  /* Every shift first shows BEFORE, then flips to AFTER */
  useEffect(() => {
    setView("before");

    const timer = setTimeout(() => setView("after"), 2400);

    return () => clearTimeout(timer);
  }, [active]);

  /* Auto-advance (pauses while the user hovers) */
  useEffect(() => {
    if (paused) return;

    const timer = setTimeout(
      () => setActive((index) => (index + 1) % shifts.length),
      SHIFT_AUTO_MS,
    );

    return () => clearTimeout(timer);
  }, [active, paused]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="mb-4 flex items-start gap-2 text-[10px] font-bold uppercase leading-4 tracking-[0.16em] text-jashna-muted sm:mb-5 sm:items-center sm:text-[11px] sm:tracking-[0.2em]">
        <span className="mt-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-jashna-gold sm:mt-0" />
        Select a shift — and listen to how the voice changes
      </p>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        {/* ==============================================
            LEFT — SHIFT LIST
        ============================================== */}

        <div className="space-y-3">
          {shifts.map((item, index) => {
            const isActive = index === active;
            const ItemIcon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={isActive}
                className={`group relative w-full overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-500 sm:p-5 ${
                  isActive
                    ? "border-jashna-gold/60 bg-white shadow-[0_16px_40px_rgba(16,36,62,0.12)]"
                    : "border-jashna-navy/10 bg-white/55 hover:-translate-y-0.5 hover:border-jashna-gold/40 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500 sm:h-11 sm:w-11 ${
                      isActive
                        ? "bg-jashna-navy text-jashna-gold"
                        : "bg-jashna-navy/[0.06] text-jashna-muted group-hover:text-jashna-gold"
                    }`}
                  >
                    <ItemIcon size={19} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-lg leading-tight sm:text-xl lg:text-[22px]">
                      <span
                        className={`transition-colors duration-500 ${
                          isActive
                            ? "text-jashna-muted line-through decoration-jashna-gold/60"
                            : "text-jashna-muted"
                        }`}
                      >
                        {item.before}
                      </span>

                      <ArrowRight
                        size={16}
                        className="mx-1.5 inline-block text-jashna-gold sm:mx-2"
                      />

                      <span className="font-bold text-jashna-navy">
                        {item.after}
                      </span>
                    </p>

                    <p className="mt-1 text-[12.5px] leading-5 text-jashna-charcoal/60 sm:text-[13px]">
                      {item.line}
                    </p>
                  </div>

                  <span
                    className={`hidden text-[11px] font-bold tracking-[0.18em] sm:block ${
                      isActive ? "text-jashna-gold" : "text-jashna-navy/25"
                    }`}
                  >
                    0{index + 1}
                  </span>
                </div>

                {/* Auto-play progress line */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full bg-jashna-gold/15">
                    {!paused && (
                      <motion.span
                        key={`progress-${active}`}
                        className="block h-full bg-jashna-gold"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: SHIFT_AUTO_MS / 1000,
                          ease: "linear",
                        }}
                      />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==============================================
            RIGHT — SHOWCASE CARD
        ============================================== */}

        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-jashna-navy p-5 text-white shadow-[0_30px_70px_-20px_rgba(16,36,62,0.55)] sm:rounded-[32px] sm:p-8 lg:min-h-[540px]">
          {/* Decorative glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-jashna-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/[0.06] blur-3xl" />

          <div className="relative z-10">
            {/* Top row */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-jashna-gold/40 text-jashna-gold">
                  <CurrentIcon size={18} />
                </span>

                <p className="text-[10px] font-bold tracking-[0.18em] text-jashna-gold sm:text-[11px] sm:tracking-[0.2em]">
                  SHIFT 0{active + 1} / 0{shifts.length}
                </p>
              </div>

              {/* Before / After toggle */}
              <div className="inline-flex rounded-full border border-white/15 bg-white/[0.06] p-1">
                {["before", "after"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setView(mode)}
                    aria-pressed={view === mode}
                    className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-300 sm:px-4 sm:text-[11px] sm:tracking-[0.16em] ${
                      view === mode
                        ? "bg-jashna-gold text-jashna-navy"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <h3 className="mt-6 font-serif text-2xl leading-tight sm:mt-8 sm:text-3xl lg:text-4xl">
              {view === "before" ? (
                <span className="text-white/55">{current.before}</span>
              ) : (
                <span>
                  {current.after}
                  <span className="text-jashna-gold">.</span>
                </span>
              )}
            </h3>

            {/* Voice wave */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 sm:mt-7 sm:px-4 sm:py-5">
              <VoiceWave mode={view} />

              <div className="mt-3 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40 sm:text-[10px] sm:tracking-[0.18em]">
                <span>{view === "before" ? "Unsteady voice" : "Clear voice"}</span>
                <span className={view === "after" ? "text-jashna-gold" : ""}>
                  {view === "before" ? "Before Jashna" : "With Jashna"}
                </span>
              </div>
            </div>

            {/* Quote bubble */}
            <div className="mt-5 min-h-[120px] sm:mt-6 sm:min-h-[104px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active}-${view}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    view === "before"
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-jashna-gold/50 bg-jashna-gold/[0.12]"
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] ${
                      view === "before" ? "text-white/40" : "text-jashna-gold"
                    }`}
                  >
                    {view === "before"
                      ? "What it sounds like"
                      : "What it sounds like now"}
                  </p>

                  <p
                    className={`mt-2 font-serif text-base leading-7 sm:text-lg lg:text-xl ${
                      view === "before"
                        ? "italic text-white/60"
                        : "text-white"
                    }`}
                  >
                    “{view === "before" ? current.beforeQuote : current.afterQuote}”
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* How Jashna helps */}
            <div className="mt-5 border-t border-white/10 pt-4 sm:mt-6 sm:pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-jashna-gold sm:tracking-[0.2em]">
                How Jashna helps
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                {current.help}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {current.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/80"
                  >
                    <Check size={12} className="text-jashna-gold" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INLINE HIGHLIGHT HELPERS (Founder paragraph)
========================================================= */

/* Bold white — key credentials / roles */
function Strong({ children }) {
  return <strong className="font-bold text-white">{children}</strong>;
}

/* Gold highlighter — key outcomes */
function Mark({ children }) {
  return (
    <span className="rounded-[4px] bg-jashna-gold/25 px-1.5 py-0.5 font-semibold text-white [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
      {children}
    </span>
  );
}

/* =========================================================
   FOUNDER'S QUOTE
   Sits right under the intro and overlaps its bottom edge, so
   it fills the gap and ties the hero to the quotes below.
   Everything scales with clamp-style breakpoints from 320px up.
========================================================= */

function FounderQuote() {
  return (
    <section
      aria-label="A quote from the founder"
      className="relative z-20 -mt-10 px-4 pb-10 sm:-mt-12 sm:px-8 sm:pb-12 lg:-mt-16 lg:px-12 xl:px-16"
    >
      <motion.figure
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto max-w-5xl"
      >
        {/* offset gold frame */}
        <div
          aria-hidden="true"
          className="absolute -bottom-2 -right-2 h-full w-full rounded-[24px] border border-jashna-gold/60 sm:-bottom-3 sm:-right-3 sm:rounded-[32px]"
        />

        <div className="relative overflow-hidden rounded-[24px] bg-jashna-navy text-white shadow-[0_30px_60px_-25px_rgba(16,36,62,0.55)] sm:rounded-[32px]">
          {/* decorative glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-jashna-gold/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-white/[0.07] blur-3xl" />

          {/* oversized closing mark */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 right-3 select-none font-serif text-[9rem] leading-none text-white/[0.06] sm:-bottom-16 sm:right-8 sm:text-[14rem]"
          >
            ”
          </span>

          <div className="relative z-10 grid gap-5 px-5 py-7 sm:gap-7 sm:px-8 sm:py-9 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-9 lg:px-10 lg:py-10">
            {/* opening mark + label */}
            <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
              <span
                aria-hidden="true"
                className="font-serif text-[4.5rem] leading-[0.6] text-jashna-gold sm:text-[6rem] lg:text-[8rem]"
              >
                “
              </span>

              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-jashna-gold sm:w-10" />
                <p className="text-[10px] font-bold tracking-[0.22em] text-jashna-gold sm:text-[11px] sm:tracking-[0.26em]">
                  FOUNDER'S WORDS
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <blockquote className="font-serif text-[1.2rem] leading-[1.4] text-white min-[400px]:text-[1.35rem] sm:text-[1.65rem] sm:leading-[1.35] lg:text-[1.9rem] xl:text-[2.15rem]">
                If I don’t find a{" "}
                <span className="rounded-[4px] bg-jashna-gold/30 px-1 font-semibold [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                  reason to improve
                </span>{" "}
                myself, society might find{" "}
                <span className="text-jashna-gold">countless reasons</span> to
                control me.
              </blockquote>

              {/* signature */}
              <figcaption className="mt-5 flex items-center gap-4 border-t border-white/15 pt-4 sm:mt-6 sm:gap-5">
                <img
                  src={drShivam}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-11 w-11 shrink-0 rounded-full object-cover object-top ring-2 ring-jashna-gold sm:h-14 sm:w-14"
                />

                <div className="min-w-0">
                  <p className="font-serif text-lg text-white sm:text-2xl">
                    — Dr. Shivam
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium tracking-wide text-white/65 sm:text-sm">
                    Founder, Jashna Edu
                  </p>
                </div>
              </figcaption>
            </div>
          </div>
        </div>
      </motion.figure>
    </section>
  );
}

/* =========================================================
   ABOUT PAGE
========================================================= */

function About() {
  const [openQuote, setOpenQuote] = useState(null);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full overflow-x-hidden bg-[#f3efe6] text-jashna-charcoal">
        {/* ==================================================
            INTRO
            Warm ivory -> soft sand gradient. Gentle on the eyes,
            never too dark, and lets the navy text and gold
            accents stand out cleanly on every screen.
        ================================================== */}

        <section className="relative overflow-hidden bg-gradient-to-b from-[#fcfaf5] via-[#f7f3ea] to-[#f3efe6] px-4 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:px-12 lg:pb-24 lg:pt-32 xl:px-16">
          {/* ---------- Background atmosphere ---------- */}
          <div className="pointer-events-none absolute inset-0">
            {/* soft gold glow */}
            <motion.div
              className="absolute -left-32 top-0 h-[320px] w-[320px] rounded-full bg-jashna-gold/20 blur-[100px] sm:-left-40 sm:h-[460px] sm:w-[460px] lg:h-[520px] lg:w-[520px]"
              animate={{ x: [0, 30, 0], y: [0, 25, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* soft navy glow */}
            <motion.div
              className="absolute -right-32 bottom-0 h-[320px] w-[320px] rounded-full bg-jashna-navy/[0.07] blur-[100px] sm:-right-40 sm:h-[460px] sm:w-[460px] lg:h-[520px] lg:w-[520px]"
              animate={{ x: [0, -25, 0], y: [0, -20, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* subtle editorial grid */}
            <div className="absolute inset-0 text-jashna-navy opacity-[0.035] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] sm:[background-size:70px_70px]" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-20">
              {/* ----- LEFT — EDITORIAL COPY ----- */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative min-w-0"
              >
                {/* Section label */}
                <div className="mb-5 flex items-center gap-3 sm:mb-7">
                  <span className="h-px w-8 bg-jashna-gold sm:w-10" />

                  <p className="text-[10px] font-bold tracking-[0.24em] text-jashna-maroon sm:text-[11px] sm:tracking-[0.28em]">
                    ABOUT JASHNA EDU
                  </p>
                </div>

                {/* Main statement
                    - font size uses clamp() so the longest line always fits
                      the viewport (no more "communication" getting cut)
                    - the highlight is a background-gradient on an INLINE span,
                      so it wraps cleanly with the text on narrow screens */}
                <h1 className="max-w-3xl text-balance font-serif text-[clamp(2rem,9vw,2.75rem)] leading-[1.1] tracking-[-0.025em] text-jashna-navy sm:text-6xl sm:leading-[1.05] lg:text-[3.6rem] xl:text-[4.3rem] 2xl:text-[5rem]">
                  Communication is
                  <span className="mt-1 block sm:mt-2">
                    <motion.span
                      className="[box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(201,162,75,0.38), rgba(201,162,75,0.38))",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "0 92%",
                      }}
                      initial={{ backgroundSize: "0% 30%" }}
                      animate={{ backgroundSize: "100% 30%" }}
                      transition={{
                        duration: 1.1,
                        delay: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      more than language.
                    </motion.span>
                  </span>
                </h1>

                {/* Supporting copy */}
                <p className="mt-6 max-w-xl text-[15px] font-medium leading-7 text-jashna-charcoal/75 sm:mt-8 sm:text-lg sm:leading-8">
                  It is how ideas become understandable, confidence becomes
                  visible and knowledge becomes influence.
                </p>

                {/* MINI PHILOSOPHY */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 sm:mt-10 sm:gap-x-6 sm:gap-y-4"
                >
                  {[
                    { n: "01", label: "IDEAS" },
                    { n: "02", label: "CONFIDENCE" },
                    { n: "03", label: "INFLUENCE" },
                  ].map((step, i) => (
                    <div key={step.n} className="flex items-center gap-x-4 sm:gap-x-6">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-jashna-navy/30 text-[10px] font-bold text-jashna-navy">
                          {step.n}
                        </span>

                        <span className="text-[11px] font-bold tracking-[0.14em] text-jashna-navy sm:text-xs sm:tracking-[0.15em]">
                          {step.label}
                        </span>
                      </div>

                      {i < 2 && <span className="text-jashna-gold">→</span>}
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* ----- RIGHT — FOUNDER IMAGE ----- */}
              <motion.div
                initial={{ opacity: 0, x: 35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative mx-auto w-full max-w-sm min-w-0 pb-6 sm:max-w-md sm:pb-8 lg:max-w-lg"
              >
                {/* Large editorial number */}
                <div className="pointer-events-none absolute -top-10 right-0 select-none font-serif text-[96px] leading-none text-jashna-navy/[0.06] sm:-top-14 sm:text-[140px] lg:-right-4 lg:-top-16 lg:text-[170px]">
                  01
                </div>

                {/* Offset frame */}
                <motion.div
                  className="absolute -left-2.5 top-5 h-[calc(100%-2rem)] w-full rounded-[26px] border border-jashna-navy/20 sm:-left-4 sm:top-7 sm:rounded-[34px] lg:-left-5"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Main image */}
                <div className="group relative overflow-hidden rounded-[26px] bg-jashna-stone shadow-[0_35px_70px_-20px_rgba(15,42,68,0.35)] sm:rounded-[34px]">
                  <img
                    src={drShivam}
                    alt="Dr. Shivam"
                    loading="eager"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover object-top grayscale-[12%] transition duration-1000 ease-out group-hover:scale-[1.035] group-hover:grayscale-0 lg:aspect-auto lg:h-[500px] xl:h-[520px]"
                  />

                  {/* Image gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-jashna-navy/90 via-transparent to-transparent" />

                  {/* Founder information */}
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-14 pt-5 sm:px-8 sm:pb-16 sm:pt-8">
                    <div className="mb-3 flex items-center gap-3 sm:mb-4">
                      <span className="h-px w-8 bg-jashna-gold" />

                      <p className="text-[10px] font-bold tracking-[0.22em] text-jashna-gold">
                        FOUNDER
                      </p>
                    </div>

                    <p className="font-serif text-2xl text-white sm:text-3xl">
                      Dr. Shivam
                    </p>

                    <p className="mt-1 text-[13px] text-white/70 sm:text-sm">
                      Communication Educator & Trainer
                    </p>
                  </div>

                  {/* Hover shine */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                </div>

                {/* FLOATING CREDIBILITY CARD */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 1 }}
                  whileHover={{ y: -5 }}
                  className="absolute bottom-0 right-3 flex max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-2xl border border-jashna-navy/10 bg-white/95 px-4 py-3 shadow-[0_18px_40px_-12px_rgba(15,42,68,0.3)] backdrop-blur-md sm:-right-4 sm:gap-4 sm:px-5 sm:py-3.5 lg:-right-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jashna-gold/15 sm:h-11 sm:w-11">
                    <span className="font-serif text-base text-jashna-gold sm:text-lg">
                      14+
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-jashna-navy sm:text-sm">
                      Years of experience
                    </p>

                    <p className="mt-0.5 text-[11px] text-jashna-muted sm:text-xs">
                      Shaping confident communicators
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================================================
            FOUNDER'S QUOTE (overlaps the intro's bottom edge)
        ================================================== */}

        <FounderQuote />

        {/* ==================================================
            LEARNING & GROWTH QUOTES
        ================================================== */}

        <section
          aria-label="Quotes on learning and growth"
          className="px-4 pb-14 pt-2 sm:px-6 sm:pb-16 lg:px-8"
        >
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              {quoteCards.map((card, index) => (
                <QuoteCard
                  key={card.id}
                  card={card}
                  index={index}
                  isOpen={openQuote === card.id}
                  onToggle={() =>
                    setOpenQuote((current) =>
                      current === card.id ? null : card.id,
                    )
                  }
                />
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            FOUNDER
        ================================================== */}

        <section className="bg-jashna-navy px-4 py-16 text-jashna-ivory sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-14">
              <div className="mx-auto w-full max-w-sm min-w-0 sm:max-w-md lg:mx-0 lg:max-w-none">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-jashna-gold sm:text-xs sm:tracking-[0.22em]">
                  THE FOUNDER & PRINCIPAL
                </p>

                <div className="relative mt-6 sm:mt-7">
                  <div className="absolute -bottom-3 -left-3 h-full w-full rounded-[22px] border border-jashna-gold/25 sm:-bottom-4 sm:-left-4 sm:rounded-[26px]" />

                  <div className="relative overflow-hidden rounded-[22px] border border-white/10 sm:rounded-[26px]">
                    <img
                      src={drShivam}
                      alt="Dr. Shivam"
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] w-full object-cover object-top grayscale transition duration-700 hover:scale-[1.02] hover:grayscale-0 lg:aspect-auto lg:h-[470px]"
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm leading-7 text-white/65">
                  Jashna's educational philosophy is shaped by the experience of
                  its founder and communication educator.
                </p>

                <h2 className="mt-4 font-serif text-3xl leading-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                  Meet Dr. Shivam
                </h2>

                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/70 sm:mt-5 sm:text-base sm:leading-8">
                  He is a globally recognized <Strong>linguist</Strong> and{" "}
                  <Strong>communication strategist</Strong>. Holding a{" "}
                  <Mark>PhD in Linguistics</Mark> and the prestigious{" "}
                  <Mark>Cambridge CELTA</Mark> certification, he bridges the gap
                  between <Strong>academic rigor</Strong> and{" "}
                  <Strong>corporate reality</Strong>. Specializing in{" "}
                  <Strong>Public Speaking</Strong> and{" "}
                  <Strong>Presentation Skills</Strong>, he has coached over{" "}
                  <Mark>20,000 professionals</Mark>, from startup founders to
                  diplomats, helping them <Strong>find their voice</Strong> and{" "}
                  <Strong>command the stage</Strong>.
                </p>

                {/* Credentials */}
                <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2">
                  {founderCredentials.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.number}
                        className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.035] p-4 transition-all duration-500 hover:-translate-y-1 hover:border-jashna-gold/40 hover:bg-white/[0.07] sm:rounded-[22px] sm:p-5"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: index * 0.08 }}
                      >
                        <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-jashna-gold/[0.04] transition duration-500 group-hover:scale-150" />

                        <div className="relative z-10 flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-jashna-gold transition group-hover:border-jashna-gold/40">
                            <Icon size={17} />
                          </div>

                          <span className="text-[10px] tracking-[0.18em] text-white/30">
                            {item.number}
                          </span>
                        </div>

                        <div className="relative z-10 mt-6 sm:mt-8">
                          <p className="font-serif text-xl text-white sm:text-2xl">
                            {item.title}
                          </p>

                          <div className="mt-2 h-px w-8 bg-jashna-gold/60 transition-all duration-500 group-hover:w-14" />

                          <p className="mt-3 text-sm leading-6 text-white/55">
                            {item.text}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-8 border-l border-jashna-gold pl-4 sm:mt-10 sm:pl-6">
                  <p className="text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
                    “Communication is the currency of leadership.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            TRANSFORMATION — THE JASHNA SHIFT
        ================================================== */}
        <section className="relative overflow-hidden bg-[#ece6d9] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-jashna-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-jashna-maroon/5 blur-3xl" />

          <div className="relative mx-auto max-w-6xl">
            {/* Section introduction */}
            <div className="mb-10 max-w-2xl sm:mb-12">
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <span className="h-px w-8 bg-jashna-gold sm:w-10" />

                <p className="text-[11px] font-bold tracking-[0.2em] text-jashna-gold sm:text-xs sm:tracking-[0.24em]">
                  THE TRANSFORMATION
                </p>
              </div>

              <h2 className="max-w-xl text-2xl font-semibold leading-tight tracking-tight text-jashna-navy sm:text-4xl">
                From knowing the language
                <span className="text-jashna-maroon"> to making it matter.</span>
              </h2>

              <p className="mt-4 max-w-xl text-[15px] font-medium leading-7 text-jashna-charcoal/70 sm:mt-5 sm:text-lg">
                The objective is not simply to speak more. It is to communicate
                with greater purpose, confidence and impact.
              </p>
            </div>

            {/* Interactive showcase */}
            <TransformationShowcase />

            {/* Bottom statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="mt-8 flex flex-col gap-3 rounded-2xl border border-jashna-navy/10 bg-[#f8f4ec] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5"
            >
              <p className="text-sm font-medium leading-6 text-jashna-charcoal/75 sm:text-base">
                Language becomes powerful when it becomes{" "}
                <span className="rounded-[4px] bg-jashna-gold/30 px-1.5 font-bold text-jashna-navy">
                  purposeful
                </span>
                .
              </p>

              <span className="text-xs font-bold tracking-[0.18em] text-jashna-gold">
                JASHNA EDU
              </span>
            </motion.div>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}

export default About;