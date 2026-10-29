import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  Check,
  ClipboardCheck,
  ChevronRight,
  Clock,
  GraduationCap,
  Headphones,
  Maximize2,
  MessageSquareText,
  Mic2,
  PenLine,
  Rocket,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  UsersRound,
  X,
} from "lucide-react";

import usePrograms from "../hooks/usePrograms";
import { getWhatsAppLink } from "../data/contact";
/* =========================================================
   DESIGN TOKENS
   ink   #0E1A2B  deep navy (hero, method)
   paper #F3F6FB  cool off-white (page)
   blue  #2F6BFF  primary accent
   teal  #12B5A0  secondary accent
   sun   #FFB020  warm highlight

   BRAND THEME (used in explorer + IELTS spotlight)
   brand blue   #215e93
   brand teal   #2a9d8f
   brand green  #84e245
========================================================= */

const TIMES = "[&_*]:![font-family:Times_New_Roman,Times,serif]";

/* =========================================================
   SEO
========================================================= */

const SEO = {
  title:
    "English Programs: Spoken English, IELTS, Interview & Business English | Jashna",
  description:
    "Explore Jashna's English programs for spoken English and fluency, public speaking, IELTS preparation, interview skills, business English and teacher training. Personalised, practical, real-world learning.",
};

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

/* =========================================================
   ICONS + GOALS
========================================================= */

const iconMap = {
  Communication: Mic2,
  Career: Target,
  Academic: GraduationCap,
  Professional: BriefcaseBusiness,
  "English Development": UsersRound,
  Teaching: PenLine,
};

const goals = [
  {
    id: "confidence",
    title: "Speak with confidence",
    short: "Speak confidently",
    icon: Mic2,
    description:
      "Build fluency, clarity and confidence for everyday conversations and public communication.",
    programs: [
      "Spoken English & Fluency",
      "Public Speaking Mastery",
      "Presentation & Storytelling Skills",
    ],
  },
  {
    id: "career",
    title: "Grow my career",
    short: "Career growth",
    icon: BriefcaseBusiness,
    description:
      "Develop communication skills that help you perform better in interviews and professional environments.",
    programs: [
      "Interview & Career Skills",
      "Business English & Workplace Communication",
      "Professional Writing Skills",
    ],
  },
  {
    id: "academic",
    title: "Achieve an academic goal",
    short: "Academic goals",
    icon: GraduationCap,
    description:
      "Strengthen your English for examinations, higher education and international opportunities.",
    programs: [
      "IELTS Preparation & Success",
      "English for Competitive Exams",
      "English as a Foreign Language",
    ],
  },
  {
    id: "educator",
    title: "Become a better educator",
    short: "Better educator",
    icon: PenLine,
    description:
      "Upgrade your teaching practice, classroom communication and professional capabilities.",
    programs: ["Teacher Training & Development"],
  },
];

const goalOf = (program) =>
  goals.find((g) => g.id === program?.goalId) ||
  goals.find((g) => g.programs.includes(program?.title));

const categoryHighlights = {
  Communication: [
    "Fluency & clarity",
    "Confident expression",
    "Real conversations",
  ],
  Career: [
    "Interview communication",
    "Professional presence",
    "Workplace confidence",
  ],
  Academic: [
    "Language accuracy",
    "Exam-focused practice",
    "Academic communication",
  ],
  Professional: [
    "Clear communication",
    "Professional vocabulary",
    "Practical workplace use",
  ],
  "English Development": [
    "Everyday communication",
    "Vocabulary development",
    "Language confidence",
  ],
  Teaching: [
    "Classroom communication",
    "Teaching methodology",
    "Professional growth",
  ],
};

const heroPhrases = [
  "speak with confidence.",
  "ace my next interview.",
  "reach my IELTS band.",
  "grow in my career.",
  "teach with more impact.",
];

/* IELTS spotlight content */

const ieltsModules = [
  {
    id: "listening",
    label: "Listening",
    icon: Headphones,
    tagline: "Train your ear for accents, speed and distractors.",
    points: [
      "Strategies for all four sections",
      "Note-completion and map-labelling practice",
      "Spotting paraphrased answers and traps",
    ],
  },
  {
    id: "reading",
    label: "Reading",
    icon: BookOpen,
    tagline: "Read faster, find answers sooner, avoid common traps.",
    points: [
      "Skimming and scanning techniques",
      "True / False / Not Given logic",
      "Time management across three passages",
    ],
  },
  {
    id: "writing",
    label: "Writing",
    icon: PenLine,
    tagline: "Structure, clarity and a strong task response.",
    points: [
      "Task 1 reports and letters, Task 2 essays",
      "Detailed correction on practice drafts",
      "Vocabulary and grammar range for higher bands",
    ],
  },
  {
    id: "speaking",
    label: "Speaking",
    icon: Mic2,
    tagline: "Fluency, ideas and confidence in front of the examiner.",
    points: [
      "Mock interviews across all three parts",
      "Pronunciation and fluency coaching",
      "Idea-building for cue-card topics",
    ],
  },
];

const ieltsBands = [
  {
    value: "6.0",
    focus: "Build a solid base and remove the errors that keep repeating.",
  },
  {
    value: "6.5",
    focus: "Sharpen accuracy and widen your range across all four skills.",
  },
  {
    value: "7.0",
    focus: "Add precision, complexity and consistent timing under pressure.",
  },
  {
    value: "7.5",
    focus: "Polish coherence, vocabulary and examiner-ready delivery.",
  },
  {
    value: "8.0+",
    focus: "Refine nuance, speed and a flawless exam-day strategy.",
  },
];

/* Jashna method steps (shared by the desktop row and the mobile stepper) */

const methodSteps = [
  {
    Icon: ClipboardCheck,
    number: "01",
    title: "Assess",
    description: "Understand your current ability, challenges and goals.",
  },
  {
    Icon: SlidersHorizontal,
    number: "02",
    title: "Personalise",
    description: "Build a learning path around what you actually need.",
  },
  {
    Icon: Mic2,
    number: "03",
    title: "Practise",
    description:
      "Work with realistic situations instead of learning English in isolation.",
  },
  {
    Icon: MessageSquareText,
    number: "04",
    title: "Refine",
    description: "Receive feedback, correction and guidance to improve.",
  },
  {
    Icon: Rocket,
    number: "05",
    title: "Apply",
    description:
      "Take your new skills into conversations, classrooms, interviews and workplaces.",
  },
];

const goTo = (id) =>
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

/* shared class strings */
const WRAP = "mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12";
const LABEL = "text-sm font-bold tracking-[0.14em] uppercase";

/* Primary button: lighter, balanced blue to teal (was a flat dark navy / dark blue) */
const BTN_PRIMARY =
  "bg-gradient-to-r from-[#2f87c9] to-[#2a9d8f] text-white shadow-[0_14px_34px_rgba(47,135,201,0.28)] transition-all duration-300 hover:from-[#2a9d8f] hover:to-[#4fbf7a]";

/* =========================================================
   MAIN
========================================================= */

function Programs() {
  const { programs, loading } = usePrograms();

  const [activeGoal, setActiveGoal] = useState("confidence");
  const [activeProgramId, setActiveProgramId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const detailRef = useRef(null);

  /* ---------- derived ---------- */

  const selectedGoal = goals.find((g) => g.id === activeGoal);

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === activeProgramId) || programs[0],
    [programs, activeProgramId],
  );

  const selectedIndex = Math.max(
    programs.findIndex((p) => p.id === selectedProgram?.id),
    0,
  );

  const categories = useMemo(
    () => ["All", ...new Set(programs.map((p) => p.category).filter(Boolean))],
    [programs],
  );

  const visiblePrograms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((p) => {
      const okCat = categoryFilter === "All" || p.category === categoryFilter;
      const okQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.shortTitle || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [programs, categoryFilter, query]);

  const goalPrograms = (goal) =>
    programs.filter((p) => goalOf(p)?.id === goal.id);

  const highlights =
    selectedProgram?.highlights?.length > 0
      ? selectedProgram.highlights
      : categoryHighlights[selectedProgram?.category] ||
        categoryHighlights.Communication;

  const SelectedIcon = iconMap[selectedProgram?.category] || Sparkles;

  /* ---------- actions ---------- */

  const scrollToDetail = () => {
    if (window.innerWidth < 1024) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const selectProgram = (program, { scroll = true } = {}) => {
    setActiveProgramId(program.id);
    const goal = goalOf(program);
    if (goal) setActiveGoal(goal.id);
    if (scroll) scrollToDetail();
  };

  const selectGoal = (goal) => {
    setActiveGoal(goal.id);
    setCategoryFilter("All");
    setQuery("");
    const first = programs.find((p) => goalOf(p)?.id === goal.id);
    if (first) setActiveProgramId(first.id);
  };

  // used by hero chips AND the marquee: select a program and bring its poster into view
  const jumpToProgram = (program) => {
    setCategoryFilter("All");
    setQuery("");
    selectProgram(program, { scroll: false });

    if (window.innerWidth < 1024) {
      // small screens: land straight on the poster/stage
      setTimeout(() => {
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    } else {
      goTo("explore-programs");
    }
  };

  const step = (direction) => {
    const list = visiblePrograms.length ? visiblePrograms : programs;
    if (!list.length) return;
    const current = list.findIndex((p) => p.id === selectedProgram?.id);
    selectProgram(list[(current + direction + list.length) % list.length], {
      scroll: false,
    });
  };

  const stepRef = useRef(step);
  stepRef.current = step;

  const handleKeyDown = (event) => {
    if (lightbox || event.target.tagName === "INPUT") return;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  /* ---------- effects ---------- */

  // SEO: title, description, canonical, social tags
  useEffect(() => {
    document.title = SEO.title;
    setMeta("name", "description", SEO.description);
    setMeta("property", "og:title", SEO.title);
    setMeta("property", "og:description", SEO.description);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary_large_image");

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute(
      "href",
      window.location.origin + window.location.pathname,
    );
  }, []);

  // SEO: structured data listing every live program
  useEffect(() => {
    if (!programs.length) return undefined;

    const data = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Jashna English Programs",
      itemListElement: programs.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Course",
          name: p.title,
          description: p.description || SEO.description,
          provider: { "@type": "Organization", name: "Jashna" },
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "programs-jsonld";
    script.text = JSON.stringify(data);
    document.getElementById("programs-jsonld")?.remove();
    document.head.appendChild(script);

    return () => script.remove();
  }, [programs]);

  // rotating hero phrase
  useEffect(() => {
    const id = setInterval(
      () => setPhraseIndex((i) => (i + 1) % heroPhrases.length),
      2800,
    );
    return () => clearInterval(id);
  }, []);

  // lightbox keys + scroll lock
  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") stepRef.current(1);
      if (e.key === "ArrowLeft") stepRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [lightbox]);

  useEffect(() => {
    if (lightbox && !selectedProgram?.image?.url) setLightbox(false);
  }, [lightbox, selectedProgram]);

  // preload neighbouring images
  useEffect(() => {
    if (!programs.length) return;
    [1, -1].forEach((d) => {
      const p =
        programs[(selectedIndex + d + programs.length) % programs.length];
      if (p?.image?.url) new Image().src = p.image.url;
    });
  }, [programs, selectedIndex]);

  /* ---------- render ---------- */

  return (
    <main
      className={`relative min-h-screen overflow-x-clip bg-[#F3F6FB] text-[#0E1A2B] ${TIMES}`}
    >
      <style>{`
        @keyframes pg-shine { to { background-position: 200% center; } }
        @keyframes pg-marquee { to { transform: translateX(-50%); } }
        .pg-shine { background-image: linear-gradient(90deg, #2F6BFF, #0E9F8C, #D97706, #2F6BFF); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: pg-shine 6s linear infinite; }
        .pg-shine-brand { background-image: linear-gradient(90deg, #84e245, #2a9d8f, #84e245); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: pg-shine 5s linear infinite; }
        @keyframes pg-spin { to { transform: rotate(360deg); } }
        .pg-border-spin { position: absolute; left: 50%; top: 50%; width: 200vmax; height: 200vmax; margin: -100vmax 0 0 -100vmax; background: conic-gradient(from 0deg, rgba(47,107,255,0.25) 0%, #2F6BFF 10%, #12B5A0 22%, #84e245 34%, rgba(18,181,160,0.25) 50%, rgba(255,176,32,0.25) 64%, #FFB020 78%, #2F6BFF 90%, rgba(47,107,255,0.25) 100%); animation: pg-spin 8s linear infinite; }
        .pg-marquee { animation: pg-marquee 50s linear infinite; }
        .pg-marquee-wrap:hover .pg-marquee { animation-play-state: paused; }
        .pg-sweep { background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%); transform: translateX(-120%); }
        .group:hover .pg-sweep { transform: translateX(120%); transition: transform 1s ease; }
        @media (prefers-reduced-motion: reduce) { .pg-shine, .pg-shine-brand, .pg-marquee, .pg-border-spin { animation: none; } }
      `}</style>

      {/* =====================================================
          01 — HERO (SEO: header, h1, intro copy, nav, keywords)
      ===================================================== */}

      <header className="relative isolate overflow-hidden bg-gradient-to-br from-[#DCE9FF] via-[#E4F6F1] to-[#FFF0D2] pb-16 pt-28 text-[#0E1A2B] sm:pt-32 lg:pb-24 lg:pt-40">
        <motion.div
          aria-hidden
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-[#2F6BFF]/20 blur-[120px]"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#FFB020]/25 blur-[120px]"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[38%] top-[30%] h-[22rem] w-[22rem] rounded-full bg-[#12B5A0]/20 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(#0E1A2B_1px,transparent_1px),linear-gradient(90deg,#0E1A2B_1px,transparent_1px)] [background-size:56px_56px]"
        />

        <div className={`${WRAP} relative z-10`}>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            {/* LEFT — message */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="min-w-0"
            >
              <p className="inline-flex items-center gap-2.5 rounded-full border border-[#0E1A2B]/10 bg-white/75 px-4 py-2 text-base font-bold text-[#0B7F70] shadow-sm backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#12B5A0]" />
                Jashna English Programs
              </p>

              <h1 className="mt-6 text-[2.4rem] font-bold leading-[1.04] tracking-tight text-[#0E1A2B] min-[400px]:text-[2.6rem] sm:text-6xl xl:text-[4.6rem]">
                English programs for
                <span className="pg-shine block pb-2">the life you want.</span>
              </h1>

              <div className="mt-3 text-xl font-medium text-[#0E1A2B]/65 sm:text-2xl">
                <span aria-hidden>I want to</span>
                <div
                  aria-hidden
                  className="relative mt-1 h-10 w-full max-w-md overflow-hidden sm:h-12"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phraseIndex}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center whitespace-nowrap font-bold text-[#2F6BFF]"
                    >
                      {heroPhrases[phraseIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="sr-only">
                  Programs to help you {heroPhrases.join(", ")}
                </span>
              </div>

              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                className="mt-4 block h-[5px] w-40 origin-left rounded-full bg-gradient-to-r from-[#2F6BFF] via-[#12B5A0] to-[#FFB020]"
              />

              <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-[#0E1A2B]/75 sm:text-xl sm:leading-9">
                Practical courses in{" "}
                <strong className="text-[#0E1A2B]">spoken English</strong>,{" "}
                <strong className="text-[#0E1A2B]">IELTS preparation</strong>,{" "}
                <strong className="text-[#0E1A2B]">interview skills</strong>,{" "}
                <strong className="text-[#0E1A2B]">business English</strong> and{" "}
                <strong className="text-[#0E1A2B]">teacher training</strong>.
                Pick the direction you want to grow in and we'll match you with
                the right learning path.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <motion.a
                  href="#explore-programs"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo("explore-programs");
                  }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group inline-flex items-center justify-center gap-2.5 rounded-full ${BTN_PRIMARY} px-8 py-4 text-lg font-bold`}
                >
                  Explore programs
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </motion.a>

                <motion.a
                  href={getWhatsAppLink(
                    "Hello Dr.Shivam Sir, I would like to book a free consultation for the English programs at Jashna Edu.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0E1A2B]/20 bg-white/70 px-7 py-[14px] text-lg font-bold text-[#0E1A2B] backdrop-blur transition-colors hover:border-[#2F6BFF] hover:bg-white hover:text-[#2F6BFF]"
                >
                  <CalendarCheck2 size={19} />
                  Book a consultation
                </motion.a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base font-bold text-[#0E1A2B]/70">
                {["Practical", "Personalised", "Real-world"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={16} className="text-[#0E9F8C]" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-10 grid max-w-md grid-cols-3 border-t border-[#0E1A2B]/15 pt-7">
                <HeroStat value={programs.length} label="Programs" />
                <HeroStat value={goals.length} label="Directions" bordered />
                <HeroStat
                  value={Math.max(categories.length - 1, 0)}
                  label="Categories"
                  bordered
                />
              </div>
            </motion.div>

            {/* RIGHT — direction picker (hidden on phones, shown from tablet up) */}
            <motion.nav
              aria-label="Choose your learning direction"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
              className="hidden min-w-0 rounded-[32px] border border-white/80 bg-white/60 p-5 shadow-[0_30px_80px_rgba(47,107,255,0.15)] backdrop-blur-xl sm:p-7 md:block"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#12B5A0] text-white shadow-md">
                  <Target size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#0B7F70]">
                    Find your direction
                  </p>
                  <h2 className="text-2xl font-bold leading-tight text-[#0E1A2B] sm:text-3xl">
                    What are you working towards?
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                {goals.map((goal) => {
                  const active = activeGoal === goal.id;
                  const GoalIcon = goal.icon;
                  const count = goalPrograms(goal).length;

                  return (
                    <motion.button
                      key={goal.id}
                      type="button"
                      onClick={() => selectGoal(goal)}
                      aria-pressed={active}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      className={`group relative flex min-w-0 flex-col items-start overflow-hidden rounded-2xl border p-4 text-left transition-colors duration-300 sm:p-5 ${
                        active
                          ? "border-transparent bg-gradient-to-br from-[#2F6BFF] to-[#12B5A0] text-white shadow-[0_16px_40px_rgba(47,107,255,0.35)]"
                          : "border-[#0E1A2B]/10 bg-white text-[#0E1A2B] hover:border-[#2F6BFF]/40 hover:shadow-[0_12px_30px_rgba(14,26,43,0.08)]"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#2F6BFF]/10 text-[#2F6BFF]"
                        }`}
                      >
                        <GoalIcon size={19} />
                      </span>
                      <span className="mt-3 text-xl font-bold leading-6">
                        {goal.short}
                      </span>
                      <span
                        className={`mt-1.5 flex items-center gap-1 text-base font-medium ${active ? "text-white/90" : "text-[#0E1A2B]/55"}`}
                      >
                        {count} {count === 1 ? "program" : "programs"}
                        <ChevronRight
                          size={15}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedGoal?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="mt-5 rounded-2xl border border-[#0E1A2B]/10 bg-gradient-to-br from-white to-[#F1F7FF] p-5"
                >
                  <p className="text-lg font-medium leading-7 text-[#0E1A2B]/75">
                    {selectedGoal?.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {goalPrograms(selectedGoal).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => jumpToProgram(p)}
                        className="max-w-full rounded-full border border-[#0E1A2B]/12 bg-white px-4 py-2 text-left text-base font-bold text-[#0E1A2B] transition-all hover:-translate-y-0.5 hover:border-[#2F6BFF] hover:bg-[#E6EEFF] hover:text-[#2F6BFF]"
                      >
                        {p.shortTitle || p.title}
                      </button>
                    ))}
                    {programs.length > 0 &&
                      goalPrograms(selectedGoal).length === 0 && (
                        <span className="text-base text-[#0E1A2B]/55">
                          Programs coming soon.
                        </span>
                      )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.nav>
          </div>
        </div>
      </header>

      {/* =====================================================
          MARQUEE — every live program (each name is clickable
          and jumps to that program's poster below)
      ===================================================== */}

      {programs.length > 0 && (
        <div className="pg-marquee-wrap relative overflow-hidden bg-gradient-to-r from-[#2F6BFF] via-[#1F8FD6] to-[#12B5A0] py-5">
          <div className="pg-marquee flex w-max items-center gap-10 whitespace-nowrap">
            {[...programs, ...programs].map((program, i) => {
              const isCopy = i >= programs.length;
              const name = program.shortTitle || program.title;

              return (
                <span
                  key={`${program.id}-${i}`}
                  aria-hidden={isCopy || undefined}
                  className="flex items-center gap-10"
                >
                  <button
                    type="button"
                    onClick={() => jumpToProgram(program)}
                    tabIndex={isCopy ? -1 : 0}
                    aria-label={`View ${name} program`}
                    className="cursor-pointer text-2xl font-bold text-white underline-offset-8 transition-colors duration-300 hover:text-[#FFE08A] hover:underline focus-visible:text-[#FFE08A] focus-visible:underline focus-visible:outline-none sm:text-3xl"
                  >
                    {name}
                  </button>
                  <Sparkles size={20} aria-hidden className="text-[#FFC043]" />
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          02 — PROGRAM EXPLORER (redesigned)
      ===================================================== */}

      <section
        id="explore-programs"
        className="relative scroll-mt-20 overflow-hidden py-14 sm:py-20 lg:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-24 h-[28rem] w-[28rem] rounded-full bg-[#215e93]/10 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-10 h-[28rem] w-[28rem] rounded-full bg-[#84e245]/15 blur-[120px]"
        />

        <div className={`${WRAP} relative`}>
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className={`${LABEL} text-[#2a9d8f]`}>
                  You don't need to know which course
                </p>
                <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                  Find the program{" "}
                  <span className="bg-gradient-to-r from-[#215e93] via-[#2a9d8f] to-[#84e245] bg-clip-text text-transparent">
                    that fits.
                  </span>
                </h2>
              </div>
              <p className="max-w-md text-lg font-medium leading-7 text-[#0E1A2B]/65 md:text-right">
                Select a program to see it. Use the arrow keys or the arrows on
                the picture to browse.
              </p>
            </div>
          </Reveal>

          {/* filters + search */}
          <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => {
                const active = categoryFilter === category;
                return (
                  <motion.button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full border px-4 py-2 text-base font-bold transition-colors duration-200 ${
                      active
                        ? "border-[#215e93] bg-[#215e93] text-white"
                        : "border-[#0E1A2B]/12 bg-white text-[#0E1A2B]/70 hover:border-[#2a9d8f] hover:text-[#215e93]"
                    }`}
                  >
                    {category}
                  </motion.button>
                );
              })}
            </div>

            <label className="relative block w-full lg:w-72">
              <span className="sr-only">Search programs</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0E1A2B]/40"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search programs…"
                className="w-full rounded-full border border-[#0E1A2B]/12 bg-white py-2.5 pl-10 pr-4 text-base outline-none transition-all placeholder:text-[#0E1A2B]/40 focus:border-[#2a9d8f] focus:ring-4 focus:ring-[#2a9d8f]/15"
              />
            </label>
          </div>

          <div
            className="mt-8 grid gap-6 lg:grid-cols-[0.3fr_0.7fr] lg:items-start xl:gap-8"
            onKeyDown={handleKeyDown}
          >
            {/* list */}
            <div className="min-w-0 rounded-[28px] border border-[#0E1A2B]/10 bg-white/70 p-4 shadow-[0_14px_40px_rgba(14,26,43,0.06)] backdrop-blur sm:p-5">
              <div className="mb-4 flex items-center justify-between px-1">
                <span className={`${LABEL} text-[#0E1A2B]/55`}>
                  All programs
                </span>
                <span className="rounded-full bg-[#215e93]/10 px-2.5 py-0.5 text-base font-bold text-[#215e93]">
                  {String(visiblePrograms.length).padStart(2, "0")}
                </span>
              </div>

              <div className="relative max-h-[70vh] overflow-y-auto pr-1 lg:max-h-[calc(100vh-16rem)]">
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="mb-2 h-[60px] animate-pulse rounded-2xl bg-[#0E1A2B]/[0.06]"
                    />
                  ))}

                {!loading && visiblePrograms.length === 0 && (
                  <p className="px-2 py-6 text-base text-[#0E1A2B]/60">
                    No programs match your search. Try another word or category.
                  </p>
                )}

                {visiblePrograms.map((program) => {
                  const Icon = iconMap[program.category] || Sparkles;
                  const isActive = selectedProgram?.id === program.id;
                  const number =
                    programs.findIndex((p) => p.id === program.id) + 1;

                  return (
                    <motion.button
                      key={program.id}
                      type="button"
                      onClick={() => selectProgram(program)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative mb-1.5 flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 text-left transition-colors duration-300 sm:gap-4 sm:px-4 ${
                        isActive
                          ? "border-[#2a9d8f]/50 bg-gradient-to-r from-[#215e93]/10 via-[#2a9d8f]/10 to-[#84e245]/15 shadow-[0_10px_25px_rgba(33,94,147,0.14)]"
                          : "border-transparent hover:border-[#0E1A2B]/10 hover:bg-white"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="programRail"
                          className="absolute left-0 top-1/2 h-9 w-[4px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#215e93] via-[#2a9d8f] to-[#84e245]"
                        />
                      )}

                      {program.image?.url ? (
                        <img
                          src={program.image.url}
                          alt=""
                          loading="lazy"
                          className={`h-11 w-11 shrink-0 rounded-xl object-cover ring-2 transition-all duration-300 group-hover:scale-105 ${
                            isActive ? "ring-[#2a9d8f]" : "ring-transparent"
                          }`}
                        />
                      ) : (
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold ${
                            isActive
                              ? "bg-[#215e93] text-white"
                              : "bg-[#0E1A2B]/[0.06] text-[#0E1A2B]/45"
                          }`}
                        >
                          {String(number).padStart(2, "0")}
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-bold">
                          {program.shortTitle || program.title}
                        </span>
                        <span className="mt-0.5 block truncate text-base text-[#0E1A2B]/55">
                          {program.category}
                        </span>
                      </span>

                      <Icon
                        size={17}
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-[#2a9d8f]"
                            : "text-[#0E1A2B]/25 group-hover:text-[#2a9d8f]"
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* stage */}
            <div
              ref={detailRef}
              className="min-w-0 scroll-mt-24 lg:sticky lg:top-24"
            >
              <AnimatePresence mode="wait">
                {!selectedProgram ? (
                  <motion.div
                    key="stage-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[320px] animate-pulse rounded-[28px] bg-gradient-to-r from-[#E6EEFF] via-white to-[#DDF6F1] sm:h-[480px]"
                  />
                ) : (
                  <motion.div
                    key={selectedProgram.id}
                    initial={{ opacity: 0, y: 18, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -14, scale: 0.99 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <ProgramStage
                      program={selectedProgram}
                      index={selectedIndex}
                      total={programs.length}
                      Icon={SelectedIcon}
                      highlights={highlights}
                      onPrev={() => step(-1)}
                      onNext={() => step(1)}
                      onEnlarge={() => setLightbox(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          03 — JASHNA METHOD (full-width, light)
      ===================================================== */}

      <section
        id="method"
        className="relative overflow-hidden border-y border-[#0E1A2B]/10 bg-gradient-to-br from-[#FFF1D6] via-[#F3F6FB] to-[#DCE9FF] py-10 sm:py-16 lg:py-24"
      >
        <motion.div
          aria-hidden
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#FFB020]/20 blur-[110px]"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#2F6BFF]/20 blur-[110px]"
        />

        <div className={`${WRAP} relative`}>
          <Reveal>
            {/* animated gradient border */}
            <div className="relative overflow-hidden rounded-[26px] p-[2.5px] shadow-[0_30px_80px_rgba(47,107,255,0.18)] sm:rounded-[34px] lg:rounded-[44px] lg:p-[3px]">
              <span aria-hidden className="pg-border-spin pointer-events-none" />

              <div className="relative rounded-[24px] bg-gradient-to-br from-[#FFFBF2] via-white to-[#F1F7FF] p-4 min-[400px]:p-5 sm:rounded-[31.5px] sm:p-8 lg:rounded-[41px] lg:p-12">
                {/* header */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-10">
                  <div className="min-w-0">
                    <p className={`${LABEL} text-[#0B7F70]`}>The Jashna method</p>
                    <h2 className="mt-2 max-w-2xl text-[1.9rem] font-bold leading-[1.08] tracking-tight text-[#0E1A2B] min-[400px]:text-4xl sm:mt-4 sm:text-5xl lg:text-6xl">
                      Learning should move{" "}
                      <span className="text-[#2F6BFF]">with you.</span>
                    </h2>
                    <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[#0E1A2B]/70 sm:mt-5 sm:text-xl sm:leading-8">
                      We don't begin with a fixed formula. We begin with the
                      learner, understand the gap, and turn learning into
                      something you can actually use.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-[#0E1A2B]/10 bg-white/80 p-4 shadow-[0_14px_36px_rgba(14,26,43,0.07)] sm:gap-5 sm:rounded-[28px] sm:p-6">
                    <span className="pg-shine text-5xl font-bold leading-none sm:text-7xl lg:text-8xl">
                      05
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-6 text-[#0E1A2B] sm:text-xl sm:leading-7 lg:text-2xl">
                        steps from where you are to where you want to be
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#0B7F70] sm:mt-2 sm:text-base">
                        Assess · Practise · Apply
                      </p>
                    </div>
                  </div>
                </div>

                {/* phones + tablets: one step at a time */}
                <MethodStepper />

                {/* laptops and up: all five steps in a row */}
                <ol className="relative mt-12 hidden gap-x-5 lg:grid lg:grid-cols-5">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-[10%] right-[10%] top-7 h-[3px] rounded-full bg-gradient-to-r from-[#2F6BFF]/40 via-[#12B5A0]/40 to-[#FFB020]/60"
                  />
                  {methodSteps.map((step, i) => (
                    <MethodStep
                      key={step.number}
                      index={i}
                      Icon={step.Icon}
                      number={step.number}
                      title={step.title}
                      description={step.description}
                      last={i === methodSteps.length - 1}
                    />
                  ))}
                </ol>

                {/* closing strip */}
                <div className="mt-5 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-[#0E1A2B]/10 bg-white/80 p-4 sm:mt-8 sm:flex-row sm:items-center sm:gap-5 sm:rounded-[28px] sm:p-6 lg:mt-10">
                  <p className="max-w-2xl text-base font-bold leading-6 text-[#0E1A2B] sm:text-xl sm:leading-8">
                    Every learner starts at a different point. That's why step
                    one is always an assessment, not a syllabus.
                  </p>
                  <motion.a
                    href="/assessment"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group inline-flex shrink-0 items-center justify-center gap-2 rounded-full ${BTN_PRIMARY} px-6 py-3 text-base font-bold sm:py-3.5`}
                  >
                    Start with an assessment
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </motion.a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          04 — IELTS SPOTLIGHT (replaces "The real outcome")
      ===================================================== */}

      <IeltsSpotlight />

      {/* =====================================================
          05 — FINAL CTA
      ===================================================== */}

      <section
        id="consultation"
        className="relative scroll-mt-20 pb-20 lg:pb-28"
      >
        <Reveal>
          <div className={WRAP}>
            <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#2F6BFF] via-[#1F8FD6] to-[#12B5A0] px-5 py-12 text-center text-white shadow-[0_30px_80px_rgba(47,107,255,0.3)] sm:px-12 sm:py-16 lg:rounded-[48px] lg:py-24">
              <motion.div
                aria-hidden
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{
                  duration: 14,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/20 blur-3xl"
              />
              <motion.div
                aria-hidden
                animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
                transition={{
                  duration: 17,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[#FFC043]/35 blur-3xl"
              />

              <div className="relative mx-auto max-w-3xl">
                <p className={`${LABEL} text-white/90`}>Your next step</p>
                <h2 className="mt-5 text-[2rem] font-bold leading-[1.08] tracking-tight min-[400px]:text-4xl sm:text-6xl sm:leading-[1.05]">
                  Start with where you are.
                  <span className="block pb-2 text-[#FFE9A8]">
                    Grow from there.
                  </span>
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90 sm:text-xl">
                  Tell us what you want to improve, where you're starting from
                  and where you want to go. We'll help you find the right
                  program.
                </p>

                <motion.a
                  href={getWhatsAppLink(
                    "Hello Dr.Shivam Sir, I would like to book a free consultation and find the right program at Jashna Edu.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#2F6BFF] shadow-[0_12px_35px_rgba(0,0,0,0.15)] transition-colors duration-300 hover:bg-[#FFE9A8]"
                >
                  Book a consultation
                  <ArrowUpRight
                    size={18}
                    className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </motion.a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      <AnimatePresence>
        {lightbox && selectedProgram?.image?.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-[#08121F]/80 p-4 backdrop-blur-md sm:p-10"
          >
            <motion.img
              key={selectedProgram.id}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={selectedProgram.image.url}
              alt={selectedProgram.image.alt || selectedProgram.title}
              className="max-h-full max-w-full rounded-3xl object-contain shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
            />

            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close image"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#0E1A2B] shadow-lg transition hover:scale-110 hover:bg-white sm:right-5 sm:top-5"
            >
              <X size={20} />
            </button>

            {[
              {
                label: "Previous program",
                dir: -1,
                Icon: ArrowLeft,
                pos: "left-3 sm:left-8",
              },
              {
                label: "Next program",
                dir: 1,
                Icon: ArrowRight,
                pos: "right-3 sm:right-8",
              },
            ].map(({ label, dir, Icon, pos }) => (
              <button
                key={label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(dir);
                }}
                aria-label={label}
                className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0E1A2B] shadow-lg transition hover:scale-110 hover:bg-white ${pos}`}
              >
                <Icon size={20} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* =========================================================
   REVEAL
========================================================= */

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   HERO STAT — counts up
========================================================= */

function HeroStat({ value, label, bordered = false }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    let start;
    const duration = 1400;

    const tick = (time) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div
      className={`px-3 text-left first:pl-0 sm:px-5 ${bordered ? "border-l border-[#0E1A2B]/15" : ""}`}
    >
      <p className="text-4xl font-bold leading-none text-[#0E1A2B] sm:text-5xl">
        {String(display).padStart(2, "0")}
      </p>
      <p className="mt-2 text-base font-medium text-[#0E1A2B]/60">{label}</p>
    </div>
  );
}

/* =========================================================
   PROGRAM STAGE (redesigned)
   Split card: poster pane (blurred poster fills the sides,
   poster itself is never cropped) + information pane.
   No image: a branded art pane replaces the poster.
========================================================= */

function ProgramStage({
  program,
  index,
  total,
  Icon,
  highlights,
  onPrev,
  onNext,
  onEnlarge,
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const hasImage = Boolean(program.image?.url) && !failed;
  const isIelts = /ielts/i.test(`${program.title} ${program.shortTitle || ""}`);
  const progress = ((index + 1) / Math.max(total, 1)) * 100;

  const whatsappLink = getWhatsAppLink(
    `Hello Dr.Shivam Sir, I would like to discuss the "${program.title}" program at Jashna Edu.`,
  );

  const circleBtn =
    "absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0E1A2B] opacity-100 shadow-lg backdrop-blur transition-opacity duration-300 hover:bg-white focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100";

  const navBtn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[#0E1A2B]/12 bg-white text-[#0E1A2B]/70 shadow-sm transition-colors hover:border-[#215e93] hover:bg-[#215e93] hover:text-white";

  return (
    <div className="grid overflow-hidden rounded-[28px] border border-[#0E1A2B]/10 bg-white shadow-[0_25px_70px_rgba(14,26,43,0.14)] xl:grid-cols-[1.05fr_0.95fr]">
      {/* ---------- POSTER PANE ---------- */}
      <div className="group relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[#12324f] p-4 sm:min-h-[420px] sm:p-8">
        {hasImage ? (
          <>
            {/* blurred copy of the poster fills every empty side */}
            <img
              src={program.image.url}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-80 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#215e93]/60 via-[#0E1A2B]/25 to-[#2a9d8f]/50"
            />

            {!loaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#215e93]/40 via-white/20 to-[#2a9d8f]/40" />
            )}

            <motion.button
              type="button"
              onClick={onEnlarge}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.995 }}
              aria-label="Enlarge program image"
              className="relative z-10 block w-full cursor-zoom-in"
            >
              <img
                src={program.image.url}
                alt={program.image.alt || program.title}
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                className={`mx-auto block h-auto max-h-[calc(100vh-11rem)] w-full object-contain drop-shadow-[0_22px_40px_rgba(0,0,0,0.45)] transition-opacity duration-500 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </motion.button>

            <span className="pg-sweep pointer-events-none absolute inset-0 z-10" />

            <motion.button
              type="button"
              onClick={onEnlarge}
              aria-label="Enlarge program image"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#0E1A2B] shadow-lg backdrop-blur transition-colors hover:bg-[#84e245] sm:bottom-4 sm:right-4"
            >
              <Maximize2 size={16} />
            </motion.button>
          </>
        ) : (
          /* art pane — shown when a program has no poster */
          <div className="relative flex h-full min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#215e93] via-[#1f7f9a] to-[#2a9d8f] p-8 text-center text-white sm:min-h-[340px]">
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-72 w-72 rounded-full border border-white/40"
            />
            <motion.span
              aria-hidden
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-96 w-96 rounded-full border border-white/30"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-6 -right-2 text-[9rem] font-bold leading-none text-white/10"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur">
              <Icon size={42} />
            </span>
            <p className="relative mt-6 text-base font-bold uppercase tracking-[0.14em] text-[#d6ffb0]">
              {program.category}
            </p>
            <p className="relative mt-2 max-w-xs text-2xl font-bold leading-8">
              {program.shortTitle || program.title}
            </p>
          </div>
        )}

        {/* browse arrows */}
        <motion.button
          type="button"
          onClick={onPrev}
          aria-label="Previous program"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`${circleBtn} left-3 sm:left-4`}
        >
          <ArrowLeft size={19} />
        </motion.button>
        <motion.button
          type="button"
          onClick={onNext}
          aria-label="Next program"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`${circleBtn} right-3 sm:right-4`}
        >
          <ArrowRight size={19} />
        </motion.button>

        {/* counter */}
        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-white/90 px-3.5 py-1 text-sm font-bold text-[#0E1A2B] shadow backdrop-blur sm:left-4 sm:top-4">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* ---------- INFORMATION PANE ---------- */}
      <div className="relative flex min-w-0 flex-col overflow-hidden p-6 sm:p-8 lg:p-9">
        <motion.div
          aria-hidden
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#84e245]/15 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[#215e93]/10 blur-3xl"
        />

        <div className="relative flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#215e93] to-[#2a9d8f] text-white shadow-[0_12px_30px_rgba(33,94,147,0.35)]">
                <Icon size={22} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-[#215e93]">
                  {program.category}
                </p>
                <p className="text-base font-medium text-[#0E1A2B]/50">
                  Program {index + 1} of {total}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 xl:hidden">
              <motion.button
                type="button"
                onClick={onPrev}
                aria-label="Previous program"
                whileTap={{ scale: 0.9 }}
                className={navBtn}
              >
                <ArrowLeft size={17} />
              </motion.button>
              <motion.button
                type="button"
                onClick={onNext}
                aria-label="Next program"
                whileTap={{ scale: 0.9 }}
                className={navBtn}
              >
                <ArrowRight size={17} />
              </motion.button>
            </div>
          </div>

          <h3 className="mt-6 break-words text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">
            {program.title}
          </h3>

          {(program.duration || program.fees != null) && (
            <div className="mt-5 flex flex-wrap gap-3">
              {program.duration && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#215e93]/15 bg-[#215e93]/5 px-4 py-1.5 text-base font-bold text-[#215e93]">
                  <Clock size={15} className="text-[#2a9d8f]" />
                  {program.duration}
                </span>
              )}
              {program.fees != null && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#215e93]/15 bg-[#215e93]/5 px-4 py-1.5 text-base font-bold text-[#215e93]">
                  ₹{Number(program.fees).toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}

          <p className="mt-5 text-lg font-medium leading-8 text-[#0E1A2B]/70">
            {program.description}
          </p>

          <ul className="mt-6 grid gap-2.5">
            {highlights.slice(0, 4).map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-3 rounded-2xl border border-[#0E1A2B]/8 bg-[#F3F6FB] px-4 py-3 transition-colors hover:border-[#2a9d8f]/60 hover:bg-white"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2a9d8f] to-[#84e245] text-white">
                  <Check size={15} strokeWidth={3} />
                </span>
                <span className="text-lg font-bold leading-6">{highlight}</span>
              </li>
            ))}
          </ul>

          {program.audience && (
            <div className="mt-6">
              <p className="text-base font-bold text-[#0E1A2B]/45">
                Designed for
              </p>
              <p className="mt-1 text-lg font-medium text-[#0E1A2B]/75">
                {program.audience}
              </p>
            </div>
          )}

          <div className="mt-auto pt-7">
            <div className="flex flex-wrap items-center gap-3">
              <motion.a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                className={`group/cta inline-flex shrink-0 items-center gap-2 rounded-full ${BTN_PRIMARY} px-6 py-3.5 text-base font-bold`}
              >
                Discuss this program
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover/cta:-translate-y-1 group-hover/cta:translate-x-1"
                />
              </motion.a>

              {isIelts && (
                <motion.a
                  href="/ielts"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-[#2a9d8f] bg-white px-5 py-3 text-base font-bold text-[#215e93] transition-colors hover:bg-[#84e245] hover:text-[#0E1A2B]"
                >
                  IELTS course page
                  <ArrowRight size={16} />
                </motion.a>
              )}

              <div className="ml-auto hidden items-center gap-2 xl:flex">
                <motion.button
                  type="button"
                  onClick={onPrev}
                  aria-label="Previous program"
                  whileTap={{ scale: 0.9 }}
                  className={navBtn}
                >
                  <ArrowLeft size={17} />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onNext}
                  aria-label="Next program"
                  whileTap={{ scale: 0.9 }}
                  className={navBtn}
                >
                  <ArrowRight size={17} />
                </motion.button>
              </div>
            </div>

            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#0E1A2B]/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#215e93] via-[#2a9d8f] to-[#84e245]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   METHOD STEPPER (phones + tablets)
   Five tappable dots with a progress line, and ONE step card
   at a time (swipe, tap a dot, or use the arrows). Replaces a
   five-card stack so people don't scroll through everything.
========================================================= */

function MethodStepper() {
  const [i, setI] = useState(0);
  const n = methodSteps.length;
  const step = methodSteps[i];
  const StepIcon = step.Icon;
  const isLast = i === n - 1;

  const go = (next) => setI(Math.min(Math.max(next, 0), n - 1));

  return (
    <div className="mt-6 sm:mt-8 lg:hidden">
      {/* dots + progress line */}
      <div className="relative flex items-center justify-between">
        <span
          aria-hidden
          className="absolute left-5 right-5 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#0E1A2B]/10 sm:left-6 sm:right-6"
        />
        <span
          aria-hidden
          className="absolute left-5 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#2F6BFF] to-[#12B5A0] transition-[width] duration-500 ease-out sm:left-6"
          style={{
            width: `calc((100% - 2.5rem) * ${i / (n - 1)})`,
          }}
        />
        {methodSteps.map((s, idx) => {
          const DotIcon = s.Icon;
          const active = idx === i;
          const done = idx < i;
          return (
            <button
              key={s.number}
              type="button"
              onClick={() => go(idx)}
              aria-label={`Step ${s.number}: ${s.title}`}
              aria-current={active ? "step" : undefined}
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-12 sm:w-12 ${
                active
                  ? "scale-110 border-transparent bg-gradient-to-br from-[#2F6BFF] to-[#12B5A0] text-white shadow-[0_8px_20px_rgba(47,107,255,0.4)] ring-4 ring-[#2F6BFF]/15"
                  : done
                    ? "border-transparent bg-[#2F6BFF] text-white"
                    : "border-[#2F6BFF]/25 bg-white text-[#2F6BFF]"
              }`}
            >
              {done ? <Check size={17} strokeWidth={3} /> : <DotIcon size={17} />}
            </button>
          );
        })}
      </div>

      {/* active step card */}
      <div className="mt-4 sm:mt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.number}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) go(i + 1);
              if (info.offset.x > 50) go(i - 1);
            }}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative min-h-[148px] overflow-hidden rounded-2xl border p-4 sm:min-h-[132px] sm:rounded-3xl sm:p-6 ${
              isLast
                ? "border-transparent bg-gradient-to-br from-[#2F6BFF] to-[#12B5A0] text-white shadow-[0_18px_44px_rgba(47,107,255,0.3)]"
                : "border-[#0E1A2B]/10 bg-white text-[#0E1A2B] shadow-[0_10px_30px_rgba(14,26,43,0.06)]"
            }`}
          >
            <span
              aria-hidden
              className={`pointer-events-none absolute -right-1 -top-3 select-none text-[5.5rem] font-bold leading-none sm:text-[7rem] ${
                isLast ? "text-white/15" : "text-[#2F6BFF]/10"
              }`}
            >
              {step.number}
            </span>

            <div className="relative flex items-start gap-3.5 sm:gap-5">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl ${
                  isLast
                    ? "bg-white/20 text-white"
                    : "bg-[#2F6BFF]/10 text-[#2F6BFF]"
                }`}
              >
                <StepIcon size={22} />
              </span>

              <div className="min-w-0">
                <p
                  className={`text-xs font-bold tracking-[0.16em] ${
                    isLast ? "text-white/80" : "text-[#0B7F70]"
                  }`}
                >
                  STEP {step.number} / 0{n}
                </p>
                <h3 className="mt-0.5 text-2xl font-bold sm:text-3xl">
                  {step.title}
                </h3>
                <p
                  className={`mt-1.5 text-base font-medium leading-6 sm:text-lg sm:leading-7 ${
                    isLast ? "text-white/90" : "text-[#0E1A2B]/70"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* prev / next */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          aria-label="Previous step"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0E1A2B]/12 bg-white text-[#0E1A2B]/70 shadow-sm transition-colors hover:border-[#2F6BFF] hover:text-[#2F6BFF] disabled:opacity-35 disabled:hover:border-[#0E1A2B]/12 disabled:hover:text-[#0E1A2B]/70"
        >
          <ArrowLeft size={18} />
        </button>

        <p className="text-sm font-bold text-[#0E1A2B]/55">
          Swipe or tap to explore
        </p>

        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={isLast}
          aria-label="Next step"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#12B5A0] text-white shadow-md transition-opacity disabled:opacity-35"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   METHOD STEP (light)
========================================================= */

function MethodStep({
  index = 0,
  Icon,
  number,
  title,
  description,
  last = false,
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="group relative flex min-w-0 flex-col"
    >
      <span
        className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md transition-all duration-300 group-hover:scale-110 ${
          last
            ? "border-transparent bg-gradient-to-br from-[#2F6BFF] to-[#12B5A0] text-white"
            : "border-[#2F6BFF]/25 bg-white text-[#2F6BFF] group-hover:border-transparent group-hover:bg-[#2F6BFF] group-hover:text-white"
        }`}
      >
        <Icon size={22} />
      </span>

      <div
        className={`relative mt-4 flex-1 overflow-hidden rounded-3xl border p-5 transition-all duration-300 group-hover:-translate-y-1.5 ${
          last
            ? "border-transparent bg-gradient-to-br from-[#2F6BFF] to-[#12B5A0] text-white shadow-[0_20px_50px_rgba(47,107,255,0.3)]"
            : "border-[#0E1A2B]/10 bg-white/85 text-[#0E1A2B] shadow-[0_10px_30px_rgba(14,26,43,0.05)] group-hover:shadow-[0_18px_40px_rgba(47,107,255,0.15)]"
        }`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute right-4 top-2 text-6xl font-bold leading-none ${
            last ? "text-white/20" : "text-[#2F6BFF]/10"
          }`}
        >
          {number}
        </span>

        <h3 className="relative pr-12 text-2xl font-bold">{title}</h3>
        <p
          className={`relative mt-2 text-base font-medium leading-7 ${last ? "text-white/90" : "text-[#0E1A2B]/70"}`}
        >
          {description}
        </p>
      </div>
    </motion.li>
  );
}

/* =========================================================
   IELTS SPOTLIGHT
   Interactive: pick a target band (animated ring) and explore
   the four IELTS modules. CTA links to the /ielts page.
========================================================= */

function IeltsSpotlight() {
  const [moduleId, setModuleId] = useState("listening");
  const [bandIndex, setBandIndex] = useState(2);
  const [panel, setPanel] = useState("band"); /* phones: show one panel at a time */

  const activeModule =
    ieltsModules.find((m) => m.id === moduleId) || ieltsModules[0];
  const band = ieltsBands[bandIndex];

  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const ringProgress = (bandIndex + 1) / ieltsBands.length;

  return (
    <section
      id="ielts-spotlight"
      className="relative scroll-mt-20 py-12 sm:py-20 lg:py-28"
    >
      <div className={WRAP}>
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2f7fc0] via-[#2268a3] to-[#1b4f80] p-5 text-white shadow-[0_30px_80px_rgba(33,94,147,0.3)] sm:rounded-[36px] sm:p-10 lg:rounded-[48px] lg:p-14">
            {/* ambient glows + watermark */}
            <motion.div
              aria-hidden
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#2a9d8f]/40 blur-[110px]"
            />
            <motion.div
              aria-hidden
              animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
              transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[#84e245]/25 blur-[110px]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-4 select-none text-[7rem] font-bold leading-none tracking-tight text-white/[0.05] sm:text-[16rem]"
            >
              IELTS
            </span>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]"
            />

            <div className="relative grid items-center gap-7 sm:gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
              {/* LEFT — message */}
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-base font-bold text-[#d6ffb0] backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#84e245]" />
                  IELTS spotlight
                </p>

                <h2 className="mt-4 text-[1.9rem] font-bold leading-[1.1] tracking-tight min-[400px]:text-4xl sm:mt-6 sm:text-5xl lg:text-6xl lg:leading-[1.06]">
                  Don't just practise IELTS.
                  <span className="pg-shine-brand block pb-2">
                    Train for your band.
                  </span>
                </h2>

                <p className="mt-3 max-w-xl text-base font-medium leading-7 text-white/90 sm:mt-5 sm:text-xl sm:leading-8">
                  Our IELTS preparation begins with a diagnostic of where you
                  stand, then builds a plan around the band you need across
                  Listening, Reading, Writing and Speaking.
                </p>

                <ul className="mt-5 grid max-w-xl grid-cols-2 gap-x-3 gap-y-2.5 sm:mt-7 sm:gap-3">
                  {[
                    "Diagnostic test first",
                    "Band-wise feedback",
                    "Timed mock tests",
                    "Examiner-style speaking practice",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[15px] font-bold leading-5 sm:gap-3 sm:text-lg sm:leading-normal"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#84e245] text-[#0E1A2B] sm:h-7 sm:w-7">
                        <Check size={15} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
                  <motion.a
                    href="/ielts"
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#84e245] px-7 py-3.5 text-base font-bold text-[#0E1A2B] sm:px-8 sm:py-4 sm:text-lg shadow-[0_16px_40px_rgba(132,226,69,0.35)] transition-colors duration-300 hover:bg-white"
                  >
                    Explore the IELTS course
                    <ArrowUpRight
                      size={19}
                      className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </motion.a>
                  <span className="hidden text-base font-bold text-white/70 sm:inline">
                    Listening · Reading · Writing · Speaking
                  </span>
                </div>
              </div>

              {/* RIGHT — interactive band planner */}
              <div className="min-w-0 rounded-[24px] border border-white/20 bg-white/10 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:rounded-[30px] sm:p-7">
                {/* phones and tablets: switch between the two panels */}
                <div
                  role="tablist"
                  aria-label="IELTS planner"
                  className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-white/20 bg-white/10 p-1 lg:hidden"
                >
                  {[
                    { id: "band", label: "Target band" },
                    { id: "modules", label: "Four modules" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={panel === t.id}
                      onClick={() => setPanel(t.id)}
                      className={`rounded-full px-3 py-2 text-base font-bold transition-colors duration-300 ${
                        panel === t.id
                          ? "bg-white text-[#215e93]"
                          : "text-white hover:text-[#84e245]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className={panel === "band" ? "block" : "hidden lg:block"}>
                <p className={`${LABEL} hidden text-[#d6ffb0] lg:block`}>
                  Pick your target band
                </p>

                <div className="mt-0 flex flex-wrap gap-2 lg:mt-4">
                  {ieltsBands.map((b, i) => {
                    const active = i === bandIndex;
                    return (
                      <motion.button
                        key={b.value}
                        type="button"
                        onClick={() => setBandIndex(i)}
                        aria-pressed={active}
                        whileTap={{ scale: 0.93 }}
                        className={`rounded-full border px-3.5 py-1.5 text-base font-bold transition-colors duration-200 sm:px-4 sm:py-2 sm:text-lg ${
                          active
                            ? "border-[#84e245] bg-[#84e245] text-[#0E1A2B]"
                            : "border-white/25 bg-white/5 text-white hover:border-[#84e245] hover:text-[#84e245]"
                        }`}
                      >
                        {b.value}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-4 sm:mt-6 sm:gap-7">
                  <div className="relative h-[108px] w-[108px] shrink-0 sm:h-[132px] sm:w-[132px]">
                    <svg
                      viewBox="0 0 132 132"
                      className="h-full w-full"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient
                          id="ielts-ring"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#84e245" />
                          <stop offset="100%" stopColor="#2a9d8f" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="66"
                        cy="66"
                        r={RADIUS}
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="10"
                      />
                      <motion.circle
                        cx="66"
                        cy="66"
                        r={RADIUS}
                        fill="none"
                        stroke="url(#ielts-ring)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        initial={{ strokeDashoffset: CIRCUMFERENCE }}
                        animate={{
                          strokeDashoffset: CIRCUMFERENCE * (1 - ringProgress),
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        transform="rotate(-90 66 66)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={band.value}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="text-3xl font-bold leading-none sm:text-4xl"
                        >
                          {band.value}
                        </motion.span>
                      </AnimatePresence>
                      <span className="mt-1 text-sm font-bold uppercase tracking-wider text-white/70">
                        Band
                      </span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={band.value}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.25 }}
                      className="min-w-0 text-base font-medium leading-6 text-white/90 sm:text-xl sm:leading-8"
                    >
                      {band.focus}
                    </motion.p>
                  </AnimatePresence>
                </div>

                </div>

                <div className="my-6 hidden h-px bg-white/15 lg:block" />

                <div className={panel === "modules" ? "block" : "hidden lg:block"}>
                <p className={`${LABEL} hidden text-[#d6ffb0] lg:block`}>
                  Four modules, one plan
                </p>

                <div className="mt-0 grid grid-cols-4 gap-1.5 sm:gap-2 lg:mt-4">
                  {ieltsModules.map((m) => {
                    const active = m.id === moduleId;
                    const ModIcon = m.icon;
                    return (
                      <motion.button
                        key={m.id}
                        type="button"
                        onClick={() => setModuleId(m.id)}
                        aria-pressed={active}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 text-[13px] font-bold sm:px-2 sm:py-3 sm:text-base transition-colors duration-200 ${
                          active
                            ? "border-transparent bg-gradient-to-br from-[#2a9d8f] to-[#84e245] text-[#0E1A2B]"
                            : "border-white/20 bg-white/5 text-white hover:border-[#84e245]"
                        }`}
                      >
                        <ModIcon size={20} />
                        {m.label}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 rounded-2xl bg-white/10 p-4 sm:mt-4 sm:p-5"
                  >
                    <p className="text-lg font-bold leading-6 sm:text-xl sm:leading-7">
                      {activeModule.tagline}
                    </p>
                    <ul className="mt-3 grid gap-2">
                      {activeModule.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-base font-medium leading-6 text-white/85"
                        >
                          <ChevronRight
                            size={17}
                            className="mt-1 shrink-0 text-[#84e245]"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Programs;