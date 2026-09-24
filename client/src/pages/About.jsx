import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  X,
  Check,
  GraduationCap,
  Target,
  Sparkles,
  MessageCircle,
  Users,
  Award,
  BookOpen,
  Compass,
  Lightbulb,
  Building2,
} from "lucide-react";

import drShivam from "../assets/about/dr-shivam.webp";

/* =========================================================
   DISCOVER JASHNA CARDS
========================================================= */

const informationCards = [
  {
    id: "story",
    number: "01",
    label: "OUR STORY",
    title: "Why Jashna exists",
    short:
      "A communication education brand built around clarity, confidence and real-world expression.",
    accent: "maroon",
    icon: BookOpen,
    content: (
      <div>
        <p className="max-w-2xl text-base leading-7 text-jashna-muted">
          Jashna Edu was built on a simple belief: communication is not merely
          about knowing a language. It is about being able to express ideas,
          thoughts and expertise with clarity and confidence.
        </p>

        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          {[
            {
              number: "01",
              title: "Language",
              text: "Build a strong foundation for effective communication.",
            },
            {
              number: "02",
              title: "Expression",
              text: "Turn knowledge and ideas into clear, meaningful words.",
            },
            {
              number: "03",
              title: "Confidence",
              text: "Develop the assurance to communicate in different settings.",
            },
            {
              number: "04",
              title: "Real-world use",
              text: "Take communication skills beyond the classroom.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="group rounded-2xl border border-jashna-stone bg-[#efebe3] p-5 transition duration-300 hover:border-jashna-maroon/30 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.15em] text-jashna-gold">
                  {item.number}
                </span>

                <ArrowUpRight
                  size={15}
                  className="text-jashna-muted transition group-hover:text-jashna-maroon"
                />
              </div>

              <h4 className="mt-7 font-serif text-xl text-jashna-navy">
                {item.title}
              </h4>

              <p className="mt-2 text-sm leading-6 text-jashna-muted">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  {
    id: "approach",
    number: "02",
    label: "OUR APPROACH",
    title: "Learn it. Practise it. Use it.",
    short: "Communication becomes powerful when learning moves beyond theory.",
    accent: "gold",
    icon: Compass,
    content: (
      <div>
        <p className="max-w-2xl text-base leading-7 text-jashna-muted">
          Jashna's approach combines structured learning with practical
          application. The focus is on understanding where a learner is,
          building the right skills and then applying them in situations that
          mirror the real world.
        </p>

        <div className="relative mt-10">
          <div className="absolute bottom-5 left-[18px] top-5 w-px bg-jashna-gold/30" />

          <div className="space-y-6">
            {[
              {
                number: "01",
                title: "Diagnose",
                text: "Understand the learner's communication needs and starting point.",
              },
              {
                number: "02",
                title: "Build",
                text: "Develop the language and communication foundation required.",
              },
              {
                number: "03",
                title: "Practise",
                text: "Work through structured activities and personalised coaching.",
              },
              {
                number: "04",
                title: "Apply",
                text: "Use communication skills confidently in real-world situations.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="relative flex gap-5 rounded-2xl border border-transparent p-2 transition hover:border-jashna-stone hover:bg-[#efebe3]"
              >
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-jashna-gold bg-jashna-ivory text-xs font-semibold text-jashna-navy">
                  {item.number}
                </div>

                <div>
                  <h4 className="font-serif text-xl text-jashna-navy">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-jashna-muted">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  {
    id: "difference",
    number: "03",
    label: "THE JASHNA DIFFERENCE",
    title: "From knowing to expressing",
    short:
      "The real transformation happens when knowledge becomes confident expression.",
    accent: "navy",
    icon: Sparkles,
    content: (
      <div>
        <div className="rounded-[24px] bg-jashna-navy p-6 text-jashna-ivory sm:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-jashna-gold">
            THE JASHNA PATH
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-4">
            {[
              ["01", "Language", "Build"],
              ["02", "Expression", "Shape"],
              ["03", "Confidence", "Own"],
              ["04", "Influence", "Connect"],
            ].map(([number, title, action], index) => (
              <div key={number} className="relative">
                {index < 3 && (
                  <ArrowRight
                    size={16}
                    className="absolute -right-3 top-5 hidden text-jashna-gold sm:block"
                  />
                )}

                <span className="text-xs text-jashna-gold">{number}</span>

                <p className="mt-4 font-serif text-xl">{title}</p>

                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/45">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-7 max-w-2xl text-base leading-7 text-jashna-muted">
          Jashna looks at communication as a progression. The goal is not only
          to know what to say, but to develop the confidence and awareness to
          express it effectively.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {["Language", "Expression", "Confidence", "Influence"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-jashna-stone bg-[#efebe3] px-4 py-2 text-xs font-medium text-jashna-navy"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    ),
  },

  {
    id: "impact",
    number: "04",
    label: "OUR IMPACT",
    title: "Communication for the real world",
    short:
      "Learning is designed to travel with you — into classrooms, workplaces and leadership spaces.",
    accent: "maroon",
    icon: Building2,
    content: (
      <div>
        <p className="max-w-2xl text-base leading-7 text-jashna-muted">
          Jashna works across language learning, academic communication,
          professional communication and leadership-oriented communication.
        </p>

        <div className="mt-9 grid gap-3">
          {[
            {
              icon: GraduationCap,
              label: "ACADEMIC",
              title: "Students & learners",
              text: "Communication skills that support learning, interviews, presentations and academic confidence.",
            },
            {
              icon: Users,
              label: "PROFESSIONAL",
              title: "Working professionals",
              text: "Clearer communication for meetings, presentations, workplace interaction and leadership.",
            },
            {
              icon: Building2,
              label: "ORGANISATIONAL",
              title: "Institutions & organisations",
              text: "Communication training designed around practical professional requirements.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="group flex gap-5 rounded-2xl border border-jashna-stone bg-[#efebe3] p-5 transition duration-300 hover:border-jashna-gold/50 hover:bg-white"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-jashna-navy text-jashna-gold transition group-hover:bg-jashna-maroon">
                  <Icon size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-jashna-gold">
                    {item.label}
                  </p>

                  <h4 className="mt-1 font-serif text-xl text-jashna-navy">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-jashna-muted">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
  },
];

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
   PHILOSOPHY
========================================================= */

const philosophyCards = [
  {
    number: "01",
    title: "Clarity",
    text: "Know what you want to say — and make it easy for others to understand.",
    icon: Target,
  },
  {
    number: "02",
    title: "Confidence",
    text: "Build the ability to communicate without constantly second-guessing yourself.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Connection",
    text: "Communication becomes meaningful when it creates understanding between people.",
    icon: MessageCircle,
  },
];

/* =========================================================
   TRANSFORMATION
========================================================= */

const transformation = [
  ["Hesitation", "Clarity"],
  ["Self-doubt", "Confidence"],
  ["Knowing", "Expressing"],
  ["Speaking", "Connecting"],
];

/* =========================================================
   INFORMATION MODAL
========================================================= */

function InfoModal({ card, onClose }) {
  if (!card) return null;

  const CardIcon = card.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-jashna-navy/70 px-4 py-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] bg-jashna-ivory shadow-2xl"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Modal top accent */}
          <div
            className={`h-1.5 ${
              card.accent === "gold"
                ? "bg-jashna-gold"
                : card.accent === "navy"
                  ? "bg-jashna-navy"
                  : "bg-jashna-maroon"
            }`}
          />

          <div className="relative p-7 sm:p-10">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-jashna-stone text-jashna-charcoal transition hover:border-jashna-navy hover:bg-jashna-navy hover:text-jashna-ivory"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-5 pr-12">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  card.accent === "gold"
                    ? "bg-jashna-gold/15 text-jashna-gold"
                    : card.accent === "navy"
                      ? "bg-jashna-navy text-jashna-ivory"
                      : "bg-jashna-maroon text-jashna-ivory"
                }`}
              >
                <CardIcon size={23} />
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-jashna-gold">
                  {card.number} — {card.label}
                </p>

                <h2 className="mt-2 max-w-xl font-serif text-3xl leading-tight text-jashna-navy sm:text-4xl">
                  {card.title}
                </h2>
              </div>
            </div>

            <div className="mt-9">{card.content}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   TRANSFORMATION ROW
========================================================= */

function TransformationRow({ before, after, index }) {
  return (
    <div className="group relative overflow-hidden border-b border-jashna-navy/10 last:border-b-0">
      {/* Large background number */}
      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 select-none text-[90px] font-bold leading-none text-jashna-navy/[0.035] sm:right-10 sm:text-[120px]">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="relative flex min-h-[150px] items-center gap-5 px-5 py-7 sm:min-h-[170px] sm:px-8 lg:px-12">
        {/* Number */}
        <div className="hidden shrink-0 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-jashna-gold/40 text-[10px] font-bold tracking-wider text-jashna-gold">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* BEFORE */}
        <div className="flex w-[110px] shrink-0 justify-center sm:w-[150px] lg:w-[180px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.8,
              delay: index * 0.15,
            }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-jashna-gold/10 blur-xl" />

            {/* Bubble */}
            <div className="relative flex h-[82px] w-[82px] items-center justify-center rounded-full border border-jashna-navy/15 bg-[#ebe7df] px-2 text-center shadow-sm transition-all duration-500 group-hover:border-jashna-gold/50 group-hover:bg-jashna-gold/10 sm:h-[96px] sm:w-[96px]">
              <span className="text-sm font-semibold text-jashna-navy sm:text-base">
                {before}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ARROW / JOURNEY */}
        <div className="relative flex flex-1 items-center">
          {/* Line */}
          <div className="relative h-px w-full bg-jashna-navy/15">
            {/* Gold progress line */}
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: 3.2,
                delay: index * 0.45 + 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute left-0 top-0 h-px bg-jashna-gold"
            />

            {/* Moving dot */}
            <motion.div
              initial={{ left: "0%", opacity: 0 }}
              whileInView={{
                left: "100%",
                opacity: [0, 1, 1, 0],
              }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: 3.2,
                delay: index * 0.45 + 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jashna-gold shadow-[0_0_0_5px_rgba(198,161,91,0.12)]"
            />

            {/* Arrow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
              <ArrowRight
                size={18}
                strokeWidth={1.5}
                className="text-jashna-gold"
              />
            </div>
          </div>
        </div>

        {/* AFTER */}
        <div className="flex w-[125px] shrink-0 items-center justify-center sm:w-[180px] lg:w-[220px]">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.7,
              delay: index * 0.45 + 3.1,
              ease: "easeOut",
            }}
            className="relative"
          >
            {/* Outer ring */}
            <div className="absolute -inset-2 rounded-full border border-jashna-gold/20" />

            {/* Result bubble */}
            <div className="relative flex min-h-[68px] min-w-[110px] items-center justify-center rounded-full bg-jashna-navy px-5 py-3 shadow-lg transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl sm:min-h-[76px] sm:min-w-[145px]">
              <span className="text-center text-sm font-bold text-white sm:text-base">
                {after}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ABOUT PAGE
========================================================= */

function About() {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <div className="min-h-screen overflow-hidden bg-jashna-ivory text-jashna-charcoal">
      <div className="min-h-screen overflow-hidden bg-jashna-ivory text-jashna-charcoal">
        {/* ==================================================
    INTRO
================================================== */}

        <section className="relative overflow-hidden bg-jashna-ivory px-6 pb-28 pt-28 sm:px-10 lg:px-16">
          {/* ---------- Background atmosphere ---------- */}
          <div className="pointer-events-none absolute inset-0">
            {/* soft gold glow */}
            <motion.div
              className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-jashna-gold/50 blur-[110px]"
              animate={{
                x: [0, 30, 0],
                y: [0, 25, 0],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* soft navy glow */}
            <motion.div
              className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-jashna-navy/[0.07] blur-[110px]"
              animate={{
                x: [0, -25, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* subtle editorial grid */}
            <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,currentColor_10px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_10px)] [background-size:70px_70px] text-jashna-navy" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
              {/* ==================================================
          LEFT — EDITORIAL COPY
          
      ================================================== */}

              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                {/* Section label */}
                <div className="mb-8 flex items-center gap-3">
                  <span className="h-px w-10 bg-jashna-gold" />

                  <p className="text-[11px] font-bold tracking-[0.28em] text-jashna-gold">
                    ABOUT JASHNA EDU
                  </p>
                </div>

                {/* Main statement */}
                <h1 className="max-w-3xl font-serif text-[3.2rem] leading-[1.02] tracking-[-0.03em] text-jashna-navy sm:text-6xl lg:text-[5.2rem]">
                  Communication is
                  <span className="relative mt-2 block w-fit">
                    <span className="relative z-10">more than language.</span>

                    {/* animated highlight */}
                    <motion.span
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: 1.1,
                        delay: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute bottom-1 left-0 -z-0 h-3 bg-jashna-gold/30 sm:h-4 lg:h-5"
                    />
                  </span>
                </h1>

                {/* Supporting copy */}
                <p className="mt-8 max-w-xl text-base font-medium leading-8 text-jashna-charcoal/75 sm:text-lg">
                  It is how ideas become understandable, confidence becomes
                  visible and knowledge becomes influence.
                </p>

                {/* ==================================================
            MINI PHILOSOPHY
        ================================================== */}

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4"
                >
                  {/* IDEAS */}
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-jashna-gold/40 text-[10px] font-bold text-jashna-gold">
                      01
                    </span>

                    <span className="text-xs font-bold tracking-[0.15em] text-jashna-navy">
                      IDEAS
                    </span>
                  </div>

                  <span className="text-jashna-gold">→</span>

                  {/* CONFIDENCE */}
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-jashna-gold/40 text-[10px] font-bold text-jashna-gold">
                      02
                    </span>

                    <span className="text-xs font-bold tracking-[0.15em] text-jashna-navy">
                      CONFIDENCE
                    </span>
                  </div>

                  <span className="text-jashna-gold">→</span>

                  {/* INFLUENCE */}
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-jashna-gold/40 text-[10px] font-bold text-jashna-gold">
                      03
                    </span>

                    <span className="text-xs font-bold tracking-[0.15em] text-jashna-navy">
                      INFLUENCE
                    </span>
                  </div>
                </motion.div>

                {/* Bottom editorial line */}
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="mt-12 max-w-md border-t border-jashna-navy/10 pt-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-jashna-muted">
                      THE JASHNA PHILOSOPHY
                    </p>

                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.5}
                      className="text-jashna-gold"
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* ==================================================
          RIGHT — FOUNDER IMAGE
      ================================================== */}

              <motion.div
                initial={{ opacity: 0, x: 35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative mx-auto w-full max-w-lg"
              >
                {/* Large editorial number */}
                <div className="pointer-events-none absolute -right-2 -top-16 select-none font-serif text-[130px] leading-none text-jashna-navy/[0.045] sm:-right-8 sm:text-[170px]">
                  01
                </div>

                {/* Gold offset frame */}
                <motion.div
                  className="absolute -left-5 top-7 h-full w-full rounded-[34px] border border-jashna-gold/35"
                  animate={{
                    y: [0, 6, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Main image */}
                <div className="group relative overflow-hidden rounded-[34px] bg-jashna-stone shadow-[0_35px_70px_-20px_rgba(15,42,68,0.35)]">
                  <img
                    src={drShivam}
                    alt="Dr. Shivam"
                    className="h-[560px] w-full object-cover object-top grayscale-[12%] transition duration-1000 ease-out group-hover:scale-[1.035] group-hover:grayscale-0"
                  />

                  {/* Image gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-jashna-navy/90 via-transparent to-transparent" />

                  {/* Founder information */}
                  <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="h-px w-8 bg-jashna-gold" />

                      <p className="text-[10px] font-bold tracking-[0.22em] text-jashna-gold">
                        FOUNDER
                      </p>
                    </div>

                    <p className="font-serif text-3xl text-white">Dr. Shivam</p>

                    <p className="mt-1 text-sm text-white/70">
                      Communication Educator & Trainer
                    </p>
                  </div>

                  {/* Hover shine */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                </div>

                {/* ==================================================
            FLOATING CREDIBILITY CARD
        ================================================== */}

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 1,
                  }}
                  whileHover={{ y: -5 }}
                  className="absolute -bottom-7 -left-5 flex items-center gap-4 rounded-2xl border border-jashna-navy/10 bg-[#fbfaf6]/95 px-5 py-4 shadow-[0_18px_40px_-12px_rgba(15,42,68,0.3)] backdrop-blur-md sm:-left-8"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-jashna-gold/15">
                    <span className="font-serif text-lg text-jashna-gold">
                      14+
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-jashna-navy">
                      Years of experience
                    </p>

                    <p className="mt-0.5 text-xs text-jashna-muted">
                      Shaping confident communicators
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* ==================================================
          DISCOVER JASHNA
      ================================================== */}

      <section className="border-y border-jashna-stone bg-[#f1eee7] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-jashna-gold">
              DISCOVER JASHNA
            </p>

            <p className="mt-4 text-lg leading-7 text-jashna-muted">
              There is more to Jashna than a course or a classroom. Open a
              chapter to understand the thinking behind the brand.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {informationCards.map((card, index) => {
              const CardIcon = card.icon;

              return (
                <motion.button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveCard(card)}
                  className="group relative min-h-[285px] overflow-hidden rounded-[28px] border border-jashna-stone bg-jashna-ivory p-7 text-left transition-all duration-500 hover:-translate-y-1 hover:border-jashna-gold/50 hover:shadow-[0_18px_45px_rgba(16,36,62,0.10)] sm:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.07,
                  }}
                >
                  {/* Decorative background element */}
                  <div
                    className={`absolute -right-12 -top-12 h-32 w-32 rounded-full transition-all duration-700 group-hover:scale-150 ${
                      card.accent === "navy"
                        ? "bg-jashna-navy/[0.06]"
                        : card.accent === "gold"
                          ? "bg-jashna-gold/[0.10]"
                          : "bg-jashna-maroon/[0.06]"
                    }`}
                  />

                  {/* Small corner line */}
                  <div
                    className={`absolute right-0 top-0 h-24 w-px origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100 ${
                      card.accent === "navy"
                        ? "bg-jashna-navy"
                        : card.accent === "gold"
                          ? "bg-jashna-gold"
                          : "bg-jashna-maroon"
                    }`}
                  />

                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold tracking-[0.18em] text-jashna-gold">
                        {card.number}
                      </span>

                      <span className="h-px w-7 bg-jashna-stone transition-all duration-500 group-hover:w-12 group-hover:bg-jashna-gold" />
                    </div>

                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-jashna-stone bg-jashna-ivory transition-all duration-300 group-hover:border-jashna-navy group-hover:bg-jashna-navy group-hover:text-white">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>

                  <div className="relative z-10 mt-12 flex items-end justify-between gap-5">
                    <div className="max-w-md">
                      <p className="text-xs font-semibold tracking-[0.18em] text-jashna-muted">
                        {card.label}
                      </p>

                      <h3 className="mt-3 font-serif text-2xl text-jashna-navy transition-colors duration-300 group-hover:text-jashna-maroon">
                        {card.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-jashna-muted">
                        {card.short}
                      </p>
                    </div>

                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-jashna-stone text-jashna-gold transition-all duration-500 group-hover:-translate-y-1 group-hover:border-jashna-gold sm:flex">
                      <CardIcon size={19} />
                    </div>
                  </div>

                  {/* Bottom hover line */}
                  <span className="absolute bottom-0 left-0 h-1 w-0 bg-jashna-gold transition-all duration-700 group-hover:w-full" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          FOUNDER
      ================================================== */}

      <section className="bg-jashna-navy px-6 py-24 text-jashna-ivory sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-jashna-gold">
                THE FOUNDER
              </p>

              <div className="relative mt-7">
                <div className="absolute -bottom-4 -left-4 h-full w-full rounded-[26px] border border-jashna-gold/25" />

                <div className="relative overflow-hidden rounded-[26px] border border-white/10">
                  <img
                    src={drShivam}
                    alt="Dr. Shivam"
                    className="h-[470px] w-full object-cover object-top grayscale transition duration-700 hover:grayscale-0 hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm leading-7 text-white/65">
                Jashna's educational philosophy is shaped by the experience of
                its founder and communication educator.
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
                Dr. Shivam
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
                A Cambridge CELTA-certified trainer and PhD holder in English
                Language, Dr. Shivam brings more than a decade of experience to
                language and communication education.
              </p>

              {/* Improved credentials */}
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {founderCredentials.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.number}
                      className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.035] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-jashna-gold/40 hover:bg-white/[0.07]"
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.45,
                        delay: index * 0.08,
                      }}
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

                      <div className="relative z-10 mt-8">
                        <p className="font-serif text-2xl text-white">
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

              <div className="mt-10 border-l border-jashna-gold pl-6">
                <p className="text-lg leading-8 text-white/85">
                  “Communication is the currency of leadership.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          TRANSFORMATION
      ================================================== */}
      <section className="relative overflow-hidden bg-[#e8e4dc] px-6 py-24 sm:px-10 lg:px-16">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-jashna-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-jashna-maroon/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          {/* Section introduction */}
          <div className="mb-14 max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-jashna-gold" />

              <p className="text-xs font-bold tracking-[0.24em] text-jashna-gold">
                THE TRANSFORMATION
              </p>
            </div>

            <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-jashna-navy sm:text-4xl">
              From knowing the language
              <span className="text-jashna-maroon"> to making it matter.</span>
            </h2>

            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-jashna-charcoal/70 sm:text-lg">
              The objective is not simply to speak more. It is to communicate
              with greater purpose, confidence and impact.
            </p>
          </div>

          {/* Transformation card */}
          <div className="relative overflow-hidden rounded-[32px] border border-jashna-navy/10 bg-[#f5f1e9] shadow-[0_20px_60px_rgba(16,36,62,0.07)]">
            {/* Top label */}
            <div className="flex items-center justify-between border-b border-jashna-navy/10 px-6 py-5 sm:px-8">
              <p className="text-xs font-semibold tracking-[0.18em] text-jashna-muted">
                THE JASHNA SHIFT
              </p>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-jashna-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-jashna-muted">
                  Before → Beyond
                </span>
              </div>
            </div>

            {/* Rows */}
            <div>
              {transformation.map(([before, after], index) => (
                <TransformationRow
                  key={before}
                  before={before}
                  after={after}
                  index={index}
                />
              ))}
            </div>

            {/* Bottom statement */}
            <div className="border-t border-jashna-navy/10 bg-jashna-navy px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium leading-6 text-white/75">
                  Language becomes powerful when it becomes purposeful.
                </p>

                <span className="text-xs font-bold tracking-[0.18em] text-jashna-gold">
                  JASHNA EDU
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          CLOSING
      ================================================== */}

      <section className="bg-jashna-maroon px-6 py-28 text-center text-jashna-ivory sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.24em] text-jashna-gold">
            THE JASHNA JOURNEY
          </p>

          <p className="mt-7 font-serif text-3xl leading-tight sm:text-4xl">
            Better communication starts with understanding how you want to be
            heard.
          </p>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            Explore Jashna's programs, events and approach to communication
            education.
          </p>

          <a
            href="/events"
            className="mt-9 inline-flex items-center gap-2 rounded-full border border-jashna-gold px-6 py-3 text-sm font-medium text-white transition hover:bg-jashna-gold hover:text-jashna-navy"
          >
            Explore Jashna
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>

      {/* ==================================================
          MODAL
      ================================================== */}

      <AnimatePresence>
        {activeCard && (
          <InfoModal card={activeCard} onClose={() => setActiveCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default About;
