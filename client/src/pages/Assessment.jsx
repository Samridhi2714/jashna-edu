import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Headphones,
  Mic2,
  PenLine,
  Sparkles,
  Target,
  Volume2,
} from "lucide-react";

/* =========================================================
   ASSESSMENT DATA
   ---------------------------------------------------------
   UI DATA ONLY.
   Questions, answers, scoring and final timings will
   be added later after discussion with the founder.
========================================================= */

const assessments = [
  {
    id: "general",
    number: "01",
    title: "General English",
    shortTitle: "English Proficiency",
    description:
      "Discover your current level across grammar, vocabulary, reading and everyday language use.",
    duration: "25 min",
    format: "15 questions",
    skills: ["Grammar", "Vocabulary", "Reading", "Language Usage"],
    icon: BookOpen,
    visual: "proficiency",
    result: "English proficiency snapshot",
  },
  {
    id: "business",
    number: "02",
    title: "Business English",
    shortTitle: "Workplace Communication",
    description:
      "Explore how effectively you communicate in professional situations, from emails and meetings to workplace conversations.",
    duration: "20–25 min",
    format: "20+ questions",
    skills: ["Emails", "Meetings", "Vocabulary", "Professional English"],
    icon: BriefcaseBusiness,
    visual: "business",
    result: "Workplace communication profile",
  },
  {
    id: "ielts",
    number: "03",
    title: "IELTS Mock Band Test",
    shortTitle: "IELTS Readiness",
    description:
      "Get a realistic picture of your IELTS readiness across listening, reading, writing and speaking.",
    duration: "Full assessment",
    format: "Full suite",
    skills: ["Listening", "Reading", "Writing", "Speaking"],
    icon: Target,
    visual: "ielts",
    result: "Mock band snapshot",
  },
  {
    id: "listening-writing",
    number: "04",
    title: "Listening & Writing Skills",
    shortTitle: "Comprehension & Expression",
    description:
      "Understand how well you process spoken English and express your ideas clearly through writing.",
    duration: "35 min",
    format: "45 questions",
    skills: ["Listening", "Writing", "Grammar", "Vocabulary"],
    icon: Headphones,
    visual: "listening",
    result: "Listening & writing profile",
  },
  {
    id: "public-speaking",
    number: "05",
    title: "Public Speaking Audit",
    shortTitle: "Communication Impact",
    description:
      "Explore your speaking habits, fluency, delivery, structure and communication presence.",
    duration: "15 min",
    format: "30 questions",
    skills: ["Fluency", "Delivery", "Structure", "Presence"],
    icon: Mic2,
    visual: "speaking",
    result: "Speaking style snapshot",
  },
];

function SectionLabel({ children, dark = false }) {
  return (
    <div
      className={`flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] ${
        dark ? "text-blue-300" : "text-blue-700"
      }`}
    >
      <span
        className={`h-px w-8 ${dark ? "bg-emerald-300" : "bg-blue-600"}`}
      />
      <span>{children}</span>
    </div>
  );
}

/* =========================================================
   HERO — PATHWAY BOARD
   ---------------------------------------------------------
   Replaces the old circular Skill Map with a meaningful
   assessment journey: Choose → Explore → Understand.
========================================================= */

function AssessmentPathway({ selectedId, onSelect }) {
  const pathway = [
    {
      step: "01",
      title: "Choose a focus",
      text: "English, workplace communication, IELTS or speaking.",
      icon: Target,
    },
    {
      step: "02",
      title: "Explore your skills",
      text: "See what each assessment is designed to understand.",
      icon: BarChart3,
    },
    {
      step: "03",
      title: "Find your direction",
      text: "Use the result to identify what to work on next.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="absolute -right-8 top-8 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-10 left-8 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-900/10 bg-white/85 p-5 shadow-[0_30px_90px_rgba(15,40,70,0.10)] backdrop-blur-xl sm:p-7">
        <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[5rem] bg-blue-50" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-blue-700">
              Assessment navigator
            </p>
            <h3 className="mt-2 font-serif text-2xl tracking-[-0.03em] text-slate-900 sm:text-3xl">
              Start with what matters to you.
            </h3>
          </div>

          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300 sm:flex">
            <Target size={18} />
          </div>
        </div>

        <div className="relative mt-7 space-y-3">
          {pathway.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12, duration: 0.45 }}
                className="group relative flex gap-4"
              >
                {index < pathway.length - 1 && (
                  <span className="absolute left-[19px] top-11 h-8 w-px bg-slate-900/10" />
                )}

                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-600/15 bg-blue-50 text-blue-700 transition-all duration-300 group-hover:border-blue-600/30 group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={16} />
                </div>

                <div className="min-w-0 flex-1 rounded-2xl border border-slate-900/8 bg-slate-50/70 px-4 py-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-blue-600/20 group-hover:bg-white group-hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-700">
                      {item.step}
                    </p>
                    <ArrowRight
                      size={13}
                      className="text-slate-900/20 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </div>
                  <p className="mt-1 font-serif text-lg text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-900/45">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="relative mt-6 rounded-2xl bg-slate-950 p-4 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Quick view
              </p>
              <p className="mt-1 text-sm text-white/70">
                {assessments.length} assessment paths are currently mapped.
              </p>
            </div>
            <div className="flex -space-x-2">
              {assessments.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Preview ${item.title}`}
                  onClick={() => onSelect(item.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 text-[8px] font-bold transition-all duration-300 hover:z-10 hover:-translate-y-1 ${
                    selectedId === item.id
                      ? "bg-emerald-300 text-slate-950"
                      : "bg-white/10 text-white/60 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI VISUALS
========================================================= */

function AssessmentVisual({ type }) {
  if (type === "proficiency") {
    return (
      <div className="relative h-64 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white sm:h-72">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-blue-400/15" />
        <div className="absolute -right-5 top-8 h-28 w-28 rounded-full border border-emerald-300/15" />

        <div className="relative flex h-full items-end justify-between gap-8">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-300">
              proficiency snapshot
            </p>
            <p className="mt-4 font-serif text-6xl tracking-[-0.05em]">78</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">
              sample score
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Grammar", "Vocabulary", "Reading"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[8px] uppercase tracking-[0.12em] text-white/55"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[8px] border-white/10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-8px] rounded-full border-[8px] border-transparent border-t-blue-400 border-r-emerald-300"
            />
            <div className="text-center">
              <p className="font-serif text-2xl">B2</p>
              <p className="mt-1 text-[7px] uppercase tracking-wider text-white/35">
                sample
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "business") {
    return (
      <div className="relative h-64 overflow-hidden rounded-[2rem] bg-blue-50 p-5 sm:h-72">
        <div className="absolute right-[-30px] top-[-30px] h-40 w-40 rounded-full border border-blue-600/10" />

        <div className="relative flex h-full items-center">
          <div className="w-full rounded-[1.5rem] border border-slate-900/8 bg-white p-6 shadow-[0_20px_50px_rgba(15,40,70,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-blue-700">
                workplace communication
              </span>
              <BriefcaseBusiness size={16} className="text-blue-600" />
            </div>

            <div className="mt-7 space-y-3">
              {[
                ["Email clarity", "85%"],
                ["Meeting language", "72%"],
                ["Professional tone", "78%"],
              ].map(([label, width]) => (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-[8px] uppercase tracking-[0.12em] text-slate-900/40">
                    <span>{label}</span>
                    <span>{width}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-900/7">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9 }}
                      className="h-full rounded-full bg-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex gap-2">
              {["Email", "Meeting", "Tone"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-wider text-blue-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "ielts") {
    return (
      <div className="relative h-64 overflow-hidden rounded-[2rem] bg-blue-600 p-6 text-white sm:h-72">
        <div className="absolute -bottom-24 -right-12 h-56 w-56 rounded-full border border-white/10" />

        <p className="relative text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-200">
          mock band scale
        </p>

        <div className="relative mt-9">
          <div className="flex items-end justify-between gap-3">
            {[3, 4, 5, 6, 7, 8, 9].map((band, index) => (
              <div key={band} className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{
                    height: `${[26, 34, 44, 52, 72, 62, 48][index]}px`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.07 }}
                  className={`w-6 rounded-t-md ${
                    index === 4 ? "bg-emerald-300" : "bg-white/20"
                  }`}
                />
                <span className="text-[8px] text-white/45">{band}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Sample readiness snapshot
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "listening") {
    return (
      <div className="relative h-64 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white sm:h-72">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
            <Volume2 size={18} />
          </div>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/35">
            listening → writing
          </span>
        </div>

        <div className="mt-9 flex h-14 items-center gap-1">
          {[12, 25, 18, 35, 20, 42, 25, 32, 16, 29, 40, 22, 34, 18].map(
            (height, index) => (
              <motion.span
                key={index}
                animate={{
                  height: [
                    `${height}%`,
                    `${Math.min(height + 25, 90)}%`,
                    `${height}%`,
                  ],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: index * 0.08,
                }}
                className="w-1 rounded-full bg-blue-400/80"
              />
            )
          )}
        </div>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <PenLine size={13} className="text-emerald-300" />
            <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/45">
              written response
            </span>
          </div>
          <div className="mt-4 h-1.5 w-[80%] rounded-full bg-white/10" />
          <div className="mt-2 h-1.5 w-[60%] rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64 overflow-hidden rounded-[2rem] bg-blue-50 p-6 sm:h-72">
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-blue-700">
              speaking audit
            </p>
            <p className="mt-3 font-serif text-3xl tracking-[-0.03em] text-slate-900">
              Your voice.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Mic2 size={17} />
          </div>
        </div>

        <div>
          <div className="flex h-12 items-center gap-1">
            {[20, 45, 30, 65, 40, 75, 35, 60, 28, 50, 70, 42, 25].map(
              (height, index) => (
                <motion.span
                  key={index}
                  animate={{
                    height: [
                      `${height}%`,
                      `${Math.min(height + 20, 90)}%`,
                      `${height}%`,
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.07,
                  }}
                  className="w-1 rounded-full bg-blue-600/55"
                />
              )
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Fluency", "Delivery", "Presence"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-blue-600/10 bg-white/60 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-wider text-blue-700/65"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ASSESSMENT SELECTOR CARD
========================================================= */

function AssessmentSelectorCard({
  item,
  index,
  selected,
  onSelect,
}) {
  const Icon = item.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(item.id)}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.985 }}
      className={`group relative w-full overflow-hidden rounded-[1.75rem] border p-6 text-left transition-all duration-500 ${
        selected
          ? "border-blue-600/30 bg-slate-950 text-white shadow-[0_25px_70px_rgba(15,40,70,0.14)]"
          : "border-slate-900/8 bg-white hover:border-blue-600/20 hover:shadow-[0_20px_50px_rgba(15,40,70,0.07)]"
      }`}
    >
      <div
        className={`absolute right-0 top-0 h-28 w-28 rounded-bl-[4rem] transition-all duration-500 ${
          selected ? "bg-blue-500/10" : "bg-blue-50 group-hover:bg-blue-100/70"
        }`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
            selected
              ? "bg-blue-500 text-white"
              : "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white"
          }`}
        >
          <Icon size={18} />
        </div>

        <span
          className={`text-[9px] font-bold tracking-[0.2em] ${
            selected ? "text-emerald-300" : "text-slate-900/25"
          }`}
        >
          {item.number}
        </span>
      </div>

      <div className="relative mt-9">
        <p
          className={`text-[8px] font-bold uppercase tracking-[0.22em] ${
            selected ? "text-blue-300" : "text-blue-700"
          }`}
        >
          {item.shortTitle}
        </p>

        <h3
          className={`mt-2 font-serif text-2xl leading-tight tracking-[-0.025em] ${
            selected ? "text-white" : "text-slate-900"
          }`}
        >
          {item.title}
        </h3>

        <p
          className={`mt-3 text-xs leading-6 ${
            selected ? "text-white/50" : "text-slate-900/45"
          }`}
        >
          {item.description}
        </p>
      </div>

      <div className="relative mt-6 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {item.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className={`rounded-full px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] ${
                selected
                  ? "border border-white/10 bg-white/5 text-white/45"
                  : "border border-slate-900/8 bg-slate-50 text-slate-900/40"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            selected
              ? "bg-white/10 text-emerald-300 group-hover:bg-blue-500 group-hover:text-white"
              : "bg-slate-900/5 text-slate-900/30 group-hover:bg-blue-600 group-hover:text-white"
          }`}
        >
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </motion.button>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

function Assessment() {
  const [selectedId, setSelectedId] = useState("general");

  const selectedAssessment =
    assessments.find((item) => item.id === selectedId) || assessments[0];

  const SelectedIcon = selectedAssessment.icon;

  const scrollToAssessments = () => {
    document
      .getElementById("assessment-options")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectAssessment = (id) => {
    setSelectedId(id);

    window.setTimeout(() => {
      document
        .getElementById("assessment-preview")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-slate-900">
      {/* ==================================================
          01 — HERO
      ================================================== */}

      <section className="relative overflow-hidden px-6 pb-20 pt-32 sm:pb-24 lg:px-10 lg:pb-28 lg:pt-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-12%] top-[2%] h-[430px] w-[430px] rounded-full bg-blue-500/8 blur-3xl" />
          <div className="absolute right-[-8%] top-[12%] h-[520px] w-[520px] rounded-full bg-emerald-400/8 blur-3xl" />

          <div className="absolute left-0 top-0 h-px w-full bg-slate-900/5" />

          <svg
            className="absolute bottom-0 left-0 h-[38%] w-full opacity-40"
            viewBox="0 0 1440 380"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M-80 330C150 245 260 390 480 300C690 214 850 330 1030 250C1200 175 1320 220 1510 80"
              stroke="currentColor"
              strokeWidth="1"
              className="text-blue-600/15"
            />
            <path
              d="M-80 360C140 280 300 410 510 330C720 245 890 360 1080 285C1250 215 1370 250 1510 145"
              stroke="currentColor"
              strokeWidth="1"
              className="text-emerald-500/15"
            />
          </svg>
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <SectionLabel>Jashna / Assessment Center</SectionLabel>

            <h1 className="mt-7 max-w-3xl font-serif text-[3.4rem] leading-[0.94] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[5.35rem]">
              Know where you are.
              <span className="block text-blue-700">Choose where to grow.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-900/55 sm:text-lg">
              Explore focused assessments built around the way you use English —
              from everyday communication and workplace situations to IELTS
              readiness and public speaking.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <motion.button
                type="button"
                onClick={scrollToAssessments}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-fit items-center gap-3 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(15,40,70,0.13)] transition-all duration-300 hover:bg-blue-700"
              >
                Explore assessments
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  <ArrowDown
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-y-0.5"
                  />
                </span>
              </motion.button>

              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-900/35">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {assessments.length} focused assessment paths
              </div>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["01", "Understand", "your current skills"],
                ["02", "Identify", "what needs work"],
                ["03", "Plan", "your next direction"],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-slate-900/8 bg-white/65 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-600/20 hover:bg-white"
                >
                  <span className="text-[8px] font-bold tracking-[0.18em] text-blue-700">
                    {number}
                  </span>
                  <p className="mt-3 text-xs font-semibold text-slate-900">
                    {title}
                  </p>
                  <p className="mt-1 text-[9px] leading-4 text-slate-900/35">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.12 }}
          >
            <AssessmentPathway
              selectedId={selectedId}
              onSelect={selectAssessment}
            />
          </motion.div>
        </div>
      </section>

      {/* ==================================================
          02 — ASSESSMENT OPTIONS
      ================================================== */}

      <section
        id="assessment-options"
        className="border-t border-slate-900/8 bg-white px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <SectionLabel>Choose your starting point</SectionLabel>

              <h2 className="mt-6 font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                Different goals.
                <span className="block text-blue-700">
                  Different ways to measure progress.
                </span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-slate-900/45">
              Select a path to preview what it explores, how it is structured
              and what kind of insight it can eventually provide.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            {assessments.map((item, index) => (
              <div
                key={item.id}
                className={`${
                  index === 0
                    ? "lg:col-span-5"
                    : index === 1
                      ? "lg:col-span-7"
                      : "lg:col-span-4"
                }`}
              >
                <AssessmentSelectorCard
                  item={item}
                  index={index}
                  selected={selectedId === item.id}
                  onSelect={selectAssessment}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-blue-600/10 bg-blue-50/60 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <Sparkles size={13} />
              </span>
              <p className="text-xs text-slate-900/55">
                Not every assessment answers the same question — choose the one
                closest to what you want to understand.
              </p>
            </div>

            <button
              type="button"
              onClick={() => selectAssessment("general")}
              className="group flex shrink-0 items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-blue-700"
            >
              Start with General English
              <ArrowRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          03 — SELECTED EXPERIENCE
      ================================================== */}

      <section
        id="assessment-preview"
        className="px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel>Explore the experience</SectionLabel>

              <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight tracking-[-0.035em] text-slate-950 sm:text-5xl">
                Before you begin,
                <span className="text-blue-700"> know what you’re measuring.</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-900/30">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {selectedAssessment.number} / 05 selected
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedAssessment.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4 }}
              className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr]"
            >
              <div>
                <AssessmentVisual type={selectedAssessment.visual} />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-900/30">
                    {selectedAssessment.result}
                  </span>

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-700/55">
                    Interactive preview
                  </span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-900/8 bg-white p-7 shadow-[0_20px_60px_rgba(15,40,70,0.06)] sm:p-9">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[6rem] bg-blue-50" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
                    <SelectedIcon size={19} />
                  </div>

                  <span className="rounded-full border border-blue-600/10 bg-blue-50 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-blue-700">
                    {selectedAssessment.shortTitle}
                  </span>
                </div>

                <h3 className="relative mt-9 font-serif text-3xl leading-tight tracking-[-0.03em] text-slate-950 sm:text-4xl">
                  {selectedAssessment.title}
                </h3>

                <p className="relative mt-5 max-w-xl text-sm leading-7 text-slate-900/50">
                  {selectedAssessment.description}
                </p>

                <div className="my-8 h-px bg-slate-900/8" />

                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-900/30">
                  Skills explored
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {selectedAssessment.skills.map((skill) => (
                    <motion.div
                      key={skill}
                      whileHover={{ x: 3 }}
                      className="flex items-center gap-2 rounded-xl border border-slate-900/7 bg-slate-50 px-3 py-3 text-xs text-slate-900/65"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Check size={12} />
                      </span>
                      {skill}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-blue-50/70 p-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-900/30">
                      Duration
                    </p>
                    <p className="mt-2 font-serif text-lg text-slate-950">
                      {selectedAssessment.duration}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50/70 p-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-900/30">
                      Format
                    </p>
                    <p className="mt-2 font-serif text-lg text-slate-950">
                      {selectedAssessment.format}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="group mt-8 flex w-full items-center justify-between rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Begin {selectedAssessment.title}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight size={15} />
                  </span>
                </button>

                <p className="mt-3 text-center text-[9px] text-slate-900/25">
                  Assessment experience will be activated after the question
                  bank is finalized.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ==================================================
          04 — SAMPLE REPORT
      ================================================== */}

      <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white lg:px-10 lg:py-32">
        <div className="pointer-events-none absolute right-[-12%] top-[-20%] h-[600px] w-[600px] rounded-full border border-blue-400/10" />
        <div className="pointer-events-none absolute right-[-5%] top-[-10%] h-[430px] w-[430px] rounded-full border border-emerald-300/10" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <SectionLabel dark>What your result could reveal</SectionLabel>

            <h2 className="mt-6 font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">
              Your result is
              <span className="block text-blue-300">more than a number.</span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-8 text-white/50 sm:text-base">
              A useful assessment should help you understand the skills behind
              your score — and give you a clearer idea of what to work on next.
            </p>

            <div className="mt-9 space-y-5">
              {[
                "Current skill level",
                "Strengths worth building on",
                "Areas that need attention",
                "A clearer learning direction",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4"
                >
                  <span className="font-serif text-sm text-emerald-300/80">
                    0{index + 1}
                  </span>
                  <span className="h-px w-8 bg-white/10" />
                  <span className="text-sm text-white/60">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-[2rem] bg-[#f5f7fa] p-6 text-slate-950 shadow-[0_35px_100px_rgba(0,0,0,0.28)] sm:p-9">
              <div className="absolute right-7 top-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <BarChart3 size={18} />
              </div>

              <div className="relative">
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-blue-700">
                  Jashna Edu
                </p>

                <h3 className="mt-2 max-w-md font-serif text-2xl sm:text-3xl">
                  Skill Assessment Report
                </h3>

                <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-slate-900/30">
                  Sample visual
                </p>

                <div className="my-8 h-px bg-slate-900/8" />

                <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6">
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-slate-900/7">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-t-blue-600 border-r-emerald-400"
                      />

                      <div className="text-center">
                        <p className="font-serif text-4xl">78</p>
                        <p className="mt-1 text-[8px] uppercase tracking-[0.18em] text-slate-900/30">
                          Overall
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-full bg-blue-50 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-blue-700">
                      Sample result
                    </div>
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-900/30">
                      Skill breakdown
                    </p>

                    <div className="mt-5 space-y-5">
                      {[
                        ["Grammar", 82],
                        ["Vocabulary", 76],
                        ["Reading", 81],
                        ["Language Usage", 71],
                      ].map(([skill, score]) => (
                        <div key={skill}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-slate-900/55">
                              {skill}
                            </span>
                            <span className="text-xs font-semibold text-slate-950">
                              {score}
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/7">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${score}%` }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 1,
                                delay: 0.2,
                              }}
                              className="h-full rounded-full bg-blue-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-50 p-5">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                    Your next direction
                  </p>

                  <div className="mt-3 flex items-start justify-between gap-5">
                    <p className="max-w-md font-serif text-xl leading-snug text-slate-950">
                      Build stronger professional communication and fluency.
                    </p>
                    <ArrowRight
                      size={18}
                      className="mt-1 shrink-0 text-blue-700"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["Strengths", "Improvement Areas", "Learning Direction"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-900/8 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-900/40"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================================================
          05 — NOT AN EXAM
      ================================================== */}

      <section className="relative px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <SectionLabel>The Jashna approach</SectionLabel>

            <h2 className="mt-7 font-serif text-5xl leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-8xl">
              This isn’t about
              <span className="block text-blue-700">getting everything right.</span>
            </h2>
          </div>

          <div className="mt-14 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <p className="max-w-xl text-base leading-8 text-slate-900/50 sm:text-lg">
              It’s about understanding where you are today — so you can make a
              more informed decision about where to go next.
            </p>

            <div className="flex items-center gap-4 text-blue-700">
              <span className="h-px w-16 bg-blue-600" />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em]">
                Right → Direction
              </span>
            </div>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Understand",
                text: "See the skills behind the surface-level result.",
              },
              {
                number: "02",
                title: "Reflect",
                text: "Recognise where your strengths and gaps sit.",
              },
              {
                number: "03",
                title: "Move forward",
                text: "Use the insight to shape your next learning step.",
              },
            ].map((item) => (
              <motion.div
                key={item.number}
                whileHover={{ y: -7 }}
                className="group rounded-[1.75rem] border border-slate-900/8 bg-white p-7 transition-all duration-300 hover:border-blue-600/20 hover:shadow-[0_20px_55px_rgba(15,40,70,0.07)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl text-blue-700/60">
                    {item.number}
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-slate-900/20 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
                  />
                </div>

                <h3 className="mt-12 font-serif text-2xl text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-900/45">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          06 — ASSESSMENT → LEARNING
      ================================================== */}

      <section className="border-t border-slate-900/8 bg-blue-50/55 px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <SectionLabel>Assessment → Learning</SectionLabel>

              <h2 className="mt-6 font-serif text-4xl leading-tight tracking-[-0.035em] text-slate-950 sm:text-5xl">
                Your result can point
                <span className="text-blue-700"> somewhere.</span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-slate-900/45">
              Eventually, assessment insights can connect naturally with the
              learning paths available at Jashna.
            </p>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_25px_70px_rgba(15,40,70,0.12)]"
            >
              <div className="absolute bottom-[-70px] right-[-50px] h-52 w-52 rounded-full border border-blue-400/10" />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white">
                  <Sparkles size={18} />
                </div>

                <p className="mt-10 text-[8px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                  Assessment
                </p>

                <h3 className="mt-3 font-serif text-3xl leading-tight">
                  Your starting
                  <br />
                  point.
                </h3>

                <p className="mt-5 max-w-xs text-sm leading-7 text-white/45">
                  A clearer understanding of your current communication skills.
                </p>
              </div>
            </motion.div>

            <div className="space-y-3">
              {[
                {
                  label: "Improve communication",
                  destination: "Spoken English & Fluency",
                },
                {
                  label: "Advance your career",
                  destination: "Business English",
                },
                {
                  label: "Speak with greater impact",
                  destination: "Public Speaking",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.12,
                  }}
                  whileHover={{ x: 5 }}
                  className="group flex items-center gap-5 rounded-2xl border border-slate-900/8 bg-white p-5 transition-all duration-300 hover:border-blue-600/20 hover:shadow-md"
                >
                  <span className="font-serif text-lg text-blue-700">
                    0{index + 1}
                  </span>

                  <span className="h-px w-8 bg-slate-900/10" />

                  <div className="flex-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-900/30">
                      {item.label}
                    </p>
                    <p className="mt-1 font-serif text-xl text-slate-950">
                      {item.destination}
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="text-blue-700 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          07 — FINAL CTA
      ================================================== */}

      <section className="relative overflow-hidden px-6 py-28 lg:px-10 lg:py-36">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-600/8" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/10" />

        <div className="relative mx-auto max-w-4xl text-center">
          <SectionLabel>Start somewhere</SectionLabel>

          <h2 className="mt-7 font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
            Start with a question.
            <span className="block text-blue-700">Find your direction.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-slate-900/50">
            Choose the skill you want to understand and take the first step
            towards a clearer learning journey.
          </p>

          <motion.button
            type="button"
            onClick={scrollToAssessments}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="group mx-auto mt-9 flex items-center gap-3 rounded-full bg-slate-950 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700"
          >
            Choose an assessment
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </motion.button>

          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-900/25">
            Not sure where to begin? Book a consultation with Jashna.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Assessment;
