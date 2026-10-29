import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  Check,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Headphones,
  Laptop,
  Mic2,
  Minus,
  Monitor,
  PenLine,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  X,
} from "lucide-react";

import { getWhatsAppLink } from "../data/contact";

import ieltsLogo from "../assets/images/IELTS.webp";
import jashnaLogo from "../assets/images/logo.webp";

/* =========================================================
   DESIGN TOKENS
   ink    #0E1A2B  dark text
   paper  #F4F8FB  soft cool light background
   blue   #215e93  brand blue
   teal   #2a9d8f  brand teal
   green  #84e245  brand green
========================================================= */

const TIMES = "[&_*]:![font-family:Times_New_Roman,Times,serif]";
const WRAP = "mx-auto w-[92%] max-w-[1760px] sm:w-[90%]";
const LABEL = "text-sm font-bold tracking-[0.14em] uppercase";

/* Primary button: a lighter, balanced blue to teal (was a flat dark blue) */
const BTN_PRIMARY =
  "bg-gradient-to-r from-[#2f87c9] to-[#2a9d8f] text-white shadow-[0_14px_34px_rgba(47,135,201,0.28)] transition-all duration-300 hover:from-[#2a9d8f] hover:to-[#4fbf7a]";

/* =========================================================
   SEO
========================================================= */

const SEO = {
  title: "IELTS Preparation & Registration | Authorized IDP IELTS Partner | Jashna Edu",
  description:
    "Jashna Edu is an authorized IELTS Test Registration Partner with IDP IELTS. Understand IELTS Academic vs General Training, prepare with a personalised program and register for your IELTS test.",
};

/* Short answers: shown above each visual and used for the FAQ schema */
const faqs = [
  {
    id: "version",
    tab: "Academic or General?",
    q: "Should I take IELTS Academic or General Training?",
    a: "Academic is for university study. General Training is for work, training or migration. Always confirm with your institution before booking.",
  },
  {
    id: "score",
    tab: "How scoring works",
    q: "How is my IELTS score calculated?",
    a: "Each skill is scored from 0 to 9. Your overall band is the average of the four, rounded to the nearest half band. Try it below.",
  },
  {
    id: "day",
    tab: "Test day",
    q: "How long is the test, and how is the day organised?",
    a: "Listening, Reading and Writing run back to back in about 2 hours 40 minutes. Speaking is a separate 11 to 14 minute interview.",
  },
  {
    id: "format",
    tab: "Computer or paper?",
    q: "Is IELTS on computer different from the paper test?",
    a: "No. Content, timing and scoring are the same, and both scores carry equal weight. Computer results usually arrive sooner.",
  },
  {
    id: "marking",
    tab: "Negative marking",
    q: "Is there negative marking? Should I guess?",
    a: "No. Wrong answers do not lose marks, so never leave a question blank. Check spelling and word limits.",
  },
  {
    id: "criteria",
    tab: "Writing & Speaking",
    q: "How are Writing and Speaking assessed?",
    a: "Trained examiners mark both against four public criteria. In Writing, Task 2 carries twice the weight of Task 1.",
  },
  {
    id: "need",
    tab: "Score & validity",
    q: "What score do I need, and how long is it valid?",
    a: "It depends on where you apply. Check your institution first, then plan backwards. Results are generally accepted for two years.",
  },
  {
    id: "retake",
    tab: "Retaking IELTS",
    q: "Can I retake IELTS if I am not happy with my score?",
    a: "Yes, whenever test dates are available. Every attempt is a fresh test, so use the gap to improve your weakest skill.",
  },
];

/* =========================================================
   FLOWCHART DATA
========================================================= */

const paths = {
  academic: {
    id: "academic",
    title: "IELTS Academic",
    icon: GraduationCap,
    goal: "I want to study at a university or college abroad",
    forWho: "Undergraduate or postgraduate study, and many professional registrations",
  },
  general: {
    id: "general",
    title: "IELTS General Training",
    icon: BriefcaseBusiness,
    goal: "I want to work, train or migrate abroad",
    forWho: "Work experience, vocational training below degree level, and migration",
  },
};

const testModules = [
  {
    name: "Listening",
    icon: Headphones,
    same: true,
    facts: "About 30 minutes · 4 sections · 40 questions",
    both: "Conversations and monologues, from everyday talks to an academic lecture.",
  },
  {
    name: "Reading",
    icon: BookOpen,
    same: false,
    facts: "60 minutes · 3 sections · 40 questions",
    academic: "Three long texts taken from books, journals and magazines.",
    general: "Everyday texts: notices, adverts, workplace documents and a longer general text.",
  },
  {
    name: "Writing",
    icon: PenLine,
    same: false,
    facts: "60 minutes · 2 tasks · Task 2 carries double marks",
    academic: "Task 1: describe a graph, chart, table or diagram. Task 2: an essay.",
    general: "Task 1: write a letter for a given situation. Task 2: an essay.",
  },
  {
    name: "Speaking",
    icon: Mic2,
    same: true,
    facts: "11 to 14 minutes · 3 parts · face to face with an examiner",
    both: "A real conversation with a certified examiner, the same for both versions.",
  },
];

const journey = [
  { icon: ClipboardCheck, title: "Diagnose", text: "A short assessment shows where you stand today and what band you are aiming for." },
  { icon: SlidersHorizontal, title: "Plan", text: "Your learning path is built around your gaps and your timeline, not a fixed syllabus." },
  { icon: Target, title: "Practise", text: "Focused training with exam-style questions, strategies and detailed feedback." },
  { icon: Clock, title: "Mock test", text: "Timed full-length practice to build stamina, pacing and calm under pressure." },
  { icon: Rocket, title: "Test ready", text: "Final review, then register through us and sit the official test with confidence." },
];

/* =========================================================
   PAGE
========================================================= */

function IELTS() {
  const [activePath, setActivePath] = useState("academic");

  /* SEO */
  useEffect(() => {
    document.title = SEO.title;

    const setMeta = (attr, key, content) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", SEO.description);
    setMeta("property", "og:title", SEO.title);
    setMeta("property", "og:description", SEO.description);
    setMeta("property", "og:type", "website");

    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    document.head.appendChild(faqScript);
    return () => faqScript.remove();
  }, []);

  const registerLink = getWhatsAppLink(
    "Hello Dr.Shivam Sir, I would like to register for the IELTS test through Jashna Edu."
  );
  const prepLink = getWhatsAppLink(
    "Hello Dr.Shivam Sir, I would like to know more about the IELTS preparation program at Jashna Edu."
  );

  return (
    <main className={`relative min-h-screen overflow-x-clip bg-[#F4F8FB] text-[#0E1A2B] ${TIMES}`}>
      <style>{`
        @keyframes ie-shine { to { background-position: 200% center; } }
        @keyframes ie-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes ie-pulse-dot { 0% { left: 0; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
        .ie-shine { background-image: linear-gradient(90deg, #215e93, #2a9d8f, #84e245, #215e93); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: ie-shine 6s linear infinite; }
        .ie-float { animation: ie-float 5s ease-in-out infinite; }
        .ie-dot { animation: ie-pulse-dot 2.4s ease-in-out infinite; }
        .ie-grid { background-image: linear-gradient(#0E1A2B 1px, transparent 1px), linear-gradient(90deg, #0E1A2B 1px, transparent 1px); background-size: 56px 56px; }
        @media (prefers-reduced-motion: reduce) { .ie-shine, .ie-float, .ie-dot { animation: none; } }
      `}</style>

      {/* =====================================================
          01 — HERO
      ===================================================== */}

      <header className="relative isolate overflow-hidden bg-gradient-to-br from-[#E8F1F9] via-[#F4F8FB] to-[#EAF7E2] pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-35">
        <motion.div
          aria-hidden
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-[#215e93]/15 blur-[120px]"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#84e245]/25 blur-[120px]"
        />
        <div aria-hidden className="ie-grid pointer-events-none absolute inset-0 opacity-[0.04]" />

        <div className={`${WRAP} relative z-10`}>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="min-w-0"
            >
              <p className="inline-flex items-center gap-2.5 rounded-full border border-[#2a9d8f]/30 bg-white/80 px-4 py-2 text-base font-bold text-[#215e93] shadow-sm backdrop-blur">
                <ShieldCheck size={18} className="shrink-0 text-[#2a9d8f]" />
                Authorized IELTS Test Registration Partner
              </p>

              <h1 className="mt-6 text-[2.4rem] font-bold leading-[1.06] tracking-tight min-[400px]:text-[2.6rem] sm:text-6xl xl:text-[4.4rem] 2xl:text-[5.2rem]">
                Prepare for IELTS,
                <span className="ie-shine block pb-2">Register with confidence.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-xl font-medium leading-8 text-[#0E1A2B]/90 sm:text-2xl sm:leading-9">
                Jashna Edu partners with <strong className="text-[#0E1A2B]">IDP IELTS</strong>, a Co -
                owner of the IELTS test, so you can learn, plan and register in one place, from your
                first practice class to your official test day.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <motion.a
                  href={registerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-lg font-bold ${BTN_PRIMARY}`}
                >
                  Register for IELTS
                  <ArrowUpRight size={19} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </motion.a>

                <motion.a
                  href="#ielts-program"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("ielts-program")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0E1A2B]/20 bg-white/70 px-7 py-[14px] text-lg font-bold backdrop-blur transition-colors hover:border-[#2a9d8f] hover:text-[#215e93]"
                >
                  See our IELTS program
                  <ArrowRight size={18} />
                </motion.a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-lg font-bold text-[#0E1A2B]/90">
                {["Academic & General Training", "Personalised Preparation", "Registration Guidance"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={16} className="shrink-0 text-[#2a9d8f]" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* RIGHT — collaboration card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="min-w-0"
            >
              <CollabCard />
            </motion.div>
          </div>
        </div>
      </header>

      {/* =====================================================
          02 — IELTS AT A GLANCE
      ===================================================== */}

      <section className="relative border-y border-[#0E1A2B]/10 bg-white/60 py-8 backdrop-blur">
        <div className={`${WRAP} grid grid-cols-2 gap-y-6 md:grid-cols-4`}>
          {[
            { value: "2", label: "Test versions" },
            { value: "4", label: "Skills tested" },
            { value: "0–9", label: "Band scale" },
            { value: "2 yrs", label: "Typical score validity" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div
                className={`px-3 sm:px-4 md:px-8 ${i % 2 === 1 ? "border-l border-[#0E1A2B]/12 md:border-l-0" : ""} ${
                  i > 0 ? "md:border-l md:border-[#0E1A2B]/12" : ""
                }`}
              >
                <p className="text-4xl font-bold text-[#215e93] sm:text-5xl">{s.value}</p>
                <p className="mt-1 text-lg font-medium text-[#0E1A2B]/90 sm:text-xl">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =====================================================
          03 — PREPARE · REGISTER · TEST
      ===================================================== */}

      <section className="relative py-16 lg:py-15">
        <div className={WRAP}>
          <Reveal>
            <div className="max-w-5xl">
              <p className={`${LABEL} text-[#2a9d8f]`}>How it works</p>
              <h2 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight min-[400px]:text-4xl sm:text-5xl">
                Your road to the <span className="text-[#2a9d8f]">official test</span>
              </h2>
              <p className="mt-5 text-xl font-medium leading-8 text-[#0E1A2B]/90 sm:text-2xl">
                As an authorized IELTS Test Registration Partner with IDP IELTS, Jashna Edu brings your
                preparation and your registration together, so you can focus on your score while we
                guide you through every step to the official test.
              </p>
            </div>
          </Reveal>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <span
              aria-hidden
              className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-[3px] rounded-full bg-gradient-to-r from-[#215e93]/40 via-[#2a9d8f]/50 to-[#84e245]/70 md:block"
            />
            {[
              { n: "01", icon: Target, title: "Prepare with Jashna", text: "Personalised IELTS training that begins with a diagnostic and a target band." },
              { n: "02", icon: BadgeCheck, title: "Register through us", text: "We guide you on the right test version and help you register as an authorized IDP IELTS partner." },
              { n: "03", icon: Laptop, title: "Sit the official test", text: "Take the official IELTS test, ready, rehearsed and clear on what to expect." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="group relative h-full">
                  <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#215e93]/20 bg-white text-[#215e93] shadow-md transition-all duration-300 group-hover:scale-110 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-[#215e93] group-hover:to-[#2a9d8f] group-hover:text-white">
                    <s.icon size={26} />
                  </span>
                  <div className="relative -mt-8 overflow-hidden rounded-3xl border border-[#0E1A2B]/10 bg-white p-6 pt-12 shadow-[0_14px_40px_rgba(14,26,43,0.06)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(33,94,147,0.14)]">
                    <span aria-hidden className="pointer-events-none absolute right-4 top-2 text-6xl font-bold text-[#215e93]/10">
                      {s.n}
                    </span>
                    <h3 className="relative text-2xl font-bold">{s.title}</h3>
                    <p className="relative mt-2 text-xl font-medium leading-7 text-[#0E1A2B]/90">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          04 — ACADEMIC vs GENERAL FLOWCHART
      ===================================================== */}

      <section
        id="which-ielts"
        className="relative scroll-mt-20 overflow-hidden border-y border-[#0E1A2B]/10 bg-gradient-to-b from-[#EAF2F8] to-[#F4F8FB] py-16 sm:py-20 lg:py-15"
      >
        <div className={WRAP}>
          <Reveal>
            <div className="mx-auto max-w-5xl text-center">
              <p className={`${LABEL} text-[#215e93]`}>Which IELTS is right for you?</p>
              <h2 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight min-[400px]:text-4xl sm:text-5xl">
                Academic or General Training: <span className="text-[#2a9d8f]">follow the flow.</span>
              </h2>
              <p className="mt-5 text-xl font-medium leading-8 text-[#0E1A2B]/90">
                Start with your goal. Tap a path to see how the test changes for you.
              </p>
            </div>
          </Reveal>

          <Flowchart activePath={activePath} setActivePath={setActivePath} />
        </div>
      </section>

      {/* =====================================================
          06 — JASHNA IELTS PROGRAM
      ===================================================== */}

      <section id="ielts-program" className="relative scroll-mt-20 pb-16 sm:pb-20 lg:pb-15">
        <div className={WRAP}>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2f7fc0] via-[#2268a3] to-[#1b4f80] p-5 text-white shadow-[0_30px_80px_rgba(33,94,147,0.3)] sm:rounded-[36px] sm:p-10 lg:rounded-[48px] lg:p-14">
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
            <span aria-hidden className="pointer-events-none absolute -bottom-10 -right-4 select-none text-[8rem] font-bold leading-none text-white/[0.05] sm:text-[16rem]">
              IELTS
            </span>

            <div className="relative">
              <Reveal>
                <div className="max-w-5xl">
                  <p className={`${LABEL} text-[#d6ffb0]`}>Jashna IELTS program</p>
                  <h2 className="mt-3 text-[1.9rem] font-bold leading-[1.1] tracking-tight min-[400px]:text-4xl sm:text-5xl lg:text-6xl lg:leading-[1.06]">
                    Don't just practise IELTS.
                    <span className="block text-[#9bf05e]">Train for your band.</span>
                  </h2>
                  <p className="mt-4 text-lg font-medium leading-7 text-white/95 sm:mt-5 sm:text-2xl sm:leading-8">
                    Every learner starts at a different point, so our program starts with an
                    assessment, not a syllabus. Then we train all four skills and rehearse the real
                    exam until it feels familiar.
                  </p>
                </div>
              </Reveal>

              {/* journey: compact stepper on phones and tablets */}
              <div className="mt-8 lg:hidden">
                <JourneyStepper />
              </div>

              {/* journey: full row on large screens */}
              <ol className="relative mt-12 hidden gap-4 lg:grid lg:grid-cols-5">
                {journey.map((j, i) => (
                  <motion.li
                    key={j.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="rounded-2xl border border-white/20 bg-white/10 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2a9d8f] to-[#84e245] text-[#0E1A2B]">
                        <j.icon size={18} />
                      </span>
                      <span className="text-lg font-bold text-[#9bf05e]">0{i + 1}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold">{j.title}</h3>
                    <p className="mt-1 text-lg font-medium leading-6 text-white/95">{j.text}</p>
                  </motion.li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
                <motion.a
                  href={prepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#84e245] px-7 py-3.5 text-base font-bold text-[#0E1A2B] shadow-[0_16px_40px_rgba(132,226,69,0.35)] transition-colors hover:bg-white sm:px-8 sm:py-4 sm:text-lg"
                >
                  Talk to us about IELTS prep
                  <ArrowUpRight size={19} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </motion.a>
                <Link
                  to="/assessment"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-6 py-[12px] text-base font-bold text-white transition-colors hover:border-[#84e245] hover:text-[#84e245] sm:px-7 sm:py-[14px] sm:text-lg"
                >
                  Start with an assessment
                  <ArrowRight size={18} className="shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          07 — FAQ (visual, interactive)
      ===================================================== */}

      <section className="relative pb-16 sm:pb-20 lg:pb-20">
        <div className={WRAP}>
          <Reveal>
            <div className="text-center">
              <h2 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight min-[400px]:text-4xl sm:text-5xl">
                To Know <span className="text-[#215e93]">More</span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-xl font-medium leading-8 text-[#0E1A2B]/90">
                Pick a question. Tap, compare and try it yourself.
              </p>
            </div>
          </Reveal>

          <FaqExplorer />
        </div>
      </section>

      {/* =====================================================
          08 — FINAL CTA
      ===================================================== */}

      <section className="relative pb-16 sm:pb-20 lg:pb-28">
        <Reveal>
          <div className={WRAP}>
            <div className="relative overflow-hidden rounded-[28px] border border-[#0E1A2B]/10 bg-white px-5 py-12 text-center shadow-[0_30px_80px_rgba(14,26,43,0.08)] sm:rounded-[36px] sm:px-12 sm:py-14 lg:rounded-[48px] lg:py-20">
              <motion.div
                aria-hidden
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#84e245]/25 blur-3xl"
              />
              <motion.div
                aria-hidden
                animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
                transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[#215e93]/15 blur-3xl"
              />

              <div className="relative mx-auto max-w-5xl">
                <p className="inline-flex items-center gap-2 rounded-full bg-[#2a9d8f]/10 px-4 py-2 text-sm font-bold text-[#215e93] sm:text-base">
                  <BadgeCheck size={18} className="shrink-0 text-[#2a9d8f]" />
                  <span className="text-left">Authorized IELTS Test Registration Partner · IDP IELTS</span>
                </p>
                <h2 className="mt-5 text-[2rem] font-bold leading-[1.08] tracking-tight min-[400px]:text-4xl sm:text-6xl sm:leading-[1.05]">
                  Ready for your IELTS journey?
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-xl font-medium leading-8 text-[#0E1A2B]/90 sm:text-2xl">
                  Tell us your goal and your target band. We'll help you choose the right test,
                  prepare well and register.
                </p>

                <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <motion.a
                    href={registerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold ${BTN_PRIMARY}`}
                  >
                    <CalendarCheck2 size={19} />
                    Register for IELTS
                    <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </motion.a>
                  <Link
                    to="/programs"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#0E1A2B]/20 px-7 py-[14px] text-lg font-bold transition-colors hover:border-[#2a9d8f] hover:text-[#215e93]"
                  >
                    All English programs
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
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
   JOURNEY STEPPER — compact version of the 5 program steps
   for phones and tablets: a step rail + one card at a time
========================================================= */

function JourneyStepper() {
  const [active, setActive] = useState(0);
  const step = journey[active];
  const StepIcon = step.icon;
  const isLast = active === journey.length - 1;

  return (
    <div>
      {/* step rail */}
      <div className="flex items-center" role="tablist" aria-label="Program steps">
        {journey.map((j, i) => {
          const done = i < active;
          const on = i === active;
          const RailIcon = j.icon;
          return (
            <div key={j.title} className={`flex items-center ${i < journey.length - 1 ? "flex-1" : ""}`}>
              <button
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={`Step ${i + 1}: ${j.title}`}
                onClick={() => setActive(i)}
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-12 sm:w-12 ${
                  on
                    ? "scale-110 border-white bg-white text-[#215e93] shadow-[0_0_0_4px_rgba(132,226,69,0.45)]"
                    : done
                      ? "border-transparent bg-[#84e245] text-[#0E1A2B]"
                      : "border-white/40 bg-white/10 text-white"
                }`}
              >
                {done ? <Check size={17} strokeWidth={3} /> : <RailIcon size={17} />}
              </button>

              {i < journey.length - 1 && (
                <span aria-hidden className="mx-1 h-[3px] flex-1 overflow-hidden rounded-full bg-white/20 sm:mx-2">
                  <span
                    className="block h-full rounded-full bg-[#84e245] transition-all duration-500"
                    style={{ width: i < active ? "100%" : "0%" }}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* active step card */}
      <div className="mt-5 rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-sm sm:p-6" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2a9d8f] to-[#84e245] text-[#0E1A2B] sm:h-12 sm:w-12">
                <StepIcon size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#d6ffb0]">
                  Step {active + 1} of {journey.length}
                </p>
                <h3 className="text-2xl font-bold leading-tight sm:text-3xl">{step.title}</h3>
              </div>
            </div>

            <p className="mt-3 text-lg font-medium leading-7 text-white/95 sm:text-xl sm:leading-8">{step.text}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-base font-bold text-white transition-colors hover:border-[#84e245] hover:text-[#84e245] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/30 disabled:hover:text-white"
          >
            <ArrowRight size={16} className="rotate-180" />
            Back
          </button>

          <button
            type="button"
            onClick={() => setActive((a) => (isLast ? 0 : a + 1))}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-base font-bold text-[#215e93] transition-colors hover:bg-[#84e245] hover:text-[#0E1A2B]"
          >
            {isLast ? "Start over" : "Next step"}
            {isLast ? <RefreshCw size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOGO TILE — falls back to a text wordmark if the image fails to load
========================================================= */

function LogoTile({ src, name, imgClass = "max-h-14 sm:max-h-16" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-28 min-w-0 flex-1 items-center justify-center rounded-2xl border border-[#0E1A2B]/10 bg-white p-3 shadow-[0_10px_30px_rgba(14,26,43,0.08)] sm:h-32 sm:p-4">
      {!failed ? (
        <img
          src={src}
          alt={`${name} logo`}
          onError={() => setFailed(true)}
          className={`w-auto max-w-full object-contain ${imgClass}`}
        />
      ) : (
        <span className="text-2xl font-bold tracking-tight text-[#0E1A2B] sm:text-4xl">{name}</span>
      )}
    </div>
  );
}

/* =========================================================
   COLLAB CARD (hero)
========================================================= */

function CollabCard() {
  return (
    <div className="relative rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_30px_80px_rgba(33,94,147,0.15)] backdrop-blur-xl sm:rounded-[32px] sm:p-8">

      <div className="mt-2 flex items-center gap-2 sm:mt-6 sm:gap-4">
        <LogoTile src={ieltsLogo} name="IELTS" />

        <div className="relative flex w-10 shrink-0 flex-col items-center sm:w-20">
          <span className="relative block h-[3px] w-full rounded-full bg-gradient-to-r from-[#215e93] via-[#2a9d8f] to-[#84e245]">
            <span className="ie-dot absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#84e245] shadow-[0_0_12px_#84e245]" />
          </span>
          <span className="ie-float mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#215e93] to-[#2a9d8f] text-xl font-bold text-white shadow-md">
            ×
          </span>
        </div>

        <LogoTile src={jashnaLogo} name="Jashna Edu" imgClass="max-h-[4.5rem] sm:max-h-30" />
      </div>

      <div className="mt-6 rounded-2xl border border-[#2a9d8f]/25 bg-gradient-to-br from-[#2a9d8f]/10 to-[#84e245]/15 p-4 text-center sm:mt-7 sm:p-5">
        <p className="inline-flex items-center justify-center gap-2 text-lg font-bold text-[#215e93] sm:text-xl">
          <ShieldCheck size={20} className="shrink-0 text-[#2a9d8f]" />
          <span>Authorized IELTS Test Registration Partner</span>
        </p>
        <p className="mt-1.5 text-lg font-medium text-[#0E1A2B]/90 sm:text-xl">
          Prepare and register through Jashna Edu.
        </p>
      </div>

      <ul className="mt-5 grid grid-cols-3 gap-2 text-center">
        {["Prepare", "Register", "Test day"].map((t, i) => (
          <li key={t} className="rounded-xl bg-[#215e93]/5 px-2 py-3">
            <p className="text-base font-bold text-[#2a9d8f]">0{i + 1}</p>
            <p className="text-base font-bold sm:text-lg">{t}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =========================================================
   FLOWCHART — Academic vs General Training
========================================================= */

function Flowchart({ activePath, setActivePath }) {
  return (
    <>
      {/* small screens: simple choose-then-read layout */}
      <div className="md:hidden">
        <MobileChooser activePath={activePath} setActivePath={setActivePath} />
      </div>
      {/* tablets and desktops: full flowchart */}
      <div className="hidden md:block">
        <DesktopFlowchart activePath={activePath} setActivePath={setActivePath} />
      </div>
    </>
  );
}

/* =========================================================
   MOBILE VERSION — pick a goal, then read a simple list
========================================================= */

const shortGoals = {
  academic: "Study at a university or college",
  general: "Work, train or migrate",
};

function MobileChooser({ activePath, setActivePath }) {
  const current = paths[activePath];

  return (
    <div className="mt-8">
      <p className="text-center text-2xl font-bold">Why are you taking IELTS?</p>

      {/* step 1 — choose */}
      <div role="radiogroup" aria-label="Why are you taking IELTS?" className="mt-4 grid gap-3">
        {Object.values(paths).map((p) => {
          const active = activePath === p.id;
          const PathIcon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setActivePath(p.id)}
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors duration-300 ${
                active
                  ? "border-[#2a9d8f] bg-white shadow-[0_14px_36px_rgba(33,94,147,0.18)]"
                  : "border-[#0E1A2B]/10 bg-white/70"
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  active ? "bg-[#215e93] text-white" : "bg-[#215e93]/10 text-[#215e93]"
                }`}
              >
                <PathIcon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-bold leading-6">{shortGoals[p.id]}</span>
                <span className="mt-0.5 block text-lg font-medium text-[#215e93]">{p.title}</span>
              </span>
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  active ? "border-[#2a9d8f] bg-[#2a9d8f] text-white" : "border-[#0E1A2B]/25 bg-white"
                }`}
              >
                {active && <Check size={15} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* step 2 — result */}
      <div className="mt-6 rounded-3xl border border-[#0E1A2B]/10 bg-white p-5 shadow-[0_18px_50px_rgba(14,26,43,0.1)]">
        <p className={`${LABEL} text-[#2a9d8f]`}>You need</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePath}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="mt-1 text-3xl font-bold leading-tight">{current.title}</h3>
            <p className="mt-1 text-lg font-medium leading-6 text-[#0E1A2B]/90">{current.forWho}</p>
          </motion.div>
        </AnimatePresence>

        <ul className="mt-4 divide-y divide-[#0E1A2B]/10">
          {testModules.map((m) => {
            const ModIcon = m.icon;
            const detail = m.same ? m.both : m[activePath];
            return (
              <li key={m.name} className="py-3.5 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#215e93] text-white">
                      <ModIcon size={17} />
                    </span>
                    <h4 className="text-xl font-bold">{m.name}</h4>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-bold ${
                      m.same ? "bg-[#215e93]/10 text-[#215e93]" : "bg-[#84e245] text-[#0E1A2B]"
                    }`}
                  >
                    {m.same ? "Same" : "Differs"}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${m.name}-${activePath}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 text-lg font-medium leading-6 text-[#0E1A2B]/90"
                  >
                    {detail}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-1 text-base font-bold text-[#2a9d8f]">{m.facts}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-2 flex items-center gap-2 rounded-xl bg-[#F4F8FB] px-3 py-2.5 text-lg font-bold">
          <Clock size={18} className="shrink-0 text-[#2a9d8f]" />
          About 2 hours 45 minutes in total
        </p>
        <p className="mt-3 text-base font-medium leading-6 text-[#0E1A2B]/90">
          Not sure which one you need? Ask the university, employer or immigration authority you are
          applying to, or message us and we will help you check.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DESKTOP VERSION — full flowchart
========================================================= */

function DesktopFlowchart({ activePath, setActivePath }) {
  const current = paths[activePath];

  return (
    <div className="mx-auto mt-14 w-full">
      {/* STEP 1 — the question */}
      <Reveal>
        <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl border border-[#215e93]/20 bg-white px-6 py-4 text-center shadow-[0_12px_30px_rgba(14,26,43,0.08)]">
          <Target size={22} className="shrink-0 text-[#2a9d8f]" />
          <p className="text-xl font-bold sm:text-2xl">Why are you taking IELTS?</p>
        </div>
      </Reveal>

      {/* fork connector */}
      <svg
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        aria-hidden
        className="mx-auto hidden h-14 w-full md:block"
      >
        {[
          { id: "academic", d: "M50 0 V6 Q50 10 46 10 H29 Q25 10 25 14 V20" },
          { id: "general", d: "M50 0 V6 Q50 10 54 10 H71 Q75 10 75 14 V20" },
        ].map((p) => (
          <motion.path
            key={p.id}
            d={p.d}
            fill="none"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ strokeWidth: 3 }}
            stroke={activePath === p.id ? "#2a9d8f" : "#215e93"}
            strokeOpacity={activePath === p.id ? 1 : 0.25}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* STEP 2 — two paths */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        {Object.values(paths).map((p) => {
          const active = activePath === p.id;
          const PathIcon = p.icon;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setActivePath(p.id)}
              aria-pressed={active}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-3xl border p-6 text-left transition-colors duration-300 sm:p-7 ${
                active
                  ? "border-transparent bg-gradient-to-br from-[#215e93] to-[#2a9d8f] text-white shadow-[0_22px_55px_rgba(33,94,147,0.35)]"
                  : "border-[#0E1A2B]/10 bg-white text-[#0E1A2B] shadow-[0_12px_30px_rgba(14,26,43,0.06)] hover:border-[#2a9d8f]/50"
              }`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  active ? "bg-white/20 text-white" : "bg-[#215e93]/10 text-[#215e93]"
                }`}
              >
                <PathIcon size={24} />
              </span>
              <p className={`mt-4 text-base font-bold ${active ? "text-[#d6ffb0]" : "text-[#2a9d8f]"}`}>
                {p.goal}
              </p>
              <h3 className="mt-1 text-3xl font-bold">{p.title}</h3>
              <p className={`mt-2 text-xl font-medium leading-7 ${active ? "text-white/95" : "text-[#0E1A2B]/90"}`}>
                {p.forWho}
              </p>
              {active && (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#84e245] px-3 py-1 text-base font-bold text-[#0E1A2B]">
                  <Check size={15} strokeWidth={3} /> Selected path
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* connector down */}
      <div aria-hidden className="mx-auto flex h-12 w-[3px] items-end justify-center">
        <motion.span
          key={activePath}
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.5 }}
          className="block w-[3px] rounded-full bg-[#2a9d8f]"
        />
      </div>

      {/* STEP 3 — your test */}
      <div className="rounded-[32px] border border-[#0E1A2B]/10 bg-white p-5 shadow-[0_24px_70px_rgba(14,26,43,0.1)] sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={`${LABEL} text-[#2a9d8f]`}>Your test</p>
            <AnimatePresence mode="wait">
              <motion.h3
                key={activePath}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-1 text-3xl font-bold sm:text-4xl"
              >
                {current.title}
              </motion.h3>
            </AnimatePresence>
          </div>
          <p className="inline-flex items-center gap-2 text-xl font-bold text-[#0E1A2B]/90">
            <Clock size={18} className="text-[#2a9d8f]" />
            About 2 hours 45 minutes in total
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {testModules.map((m) => {
            const ModIcon = m.icon;
            const detail = m.same ? m.both : m[activePath];
            return (
              <div
                key={m.name}
                className={`rounded-2xl border p-5 transition-colors ${
                  m.same
                    ? "border-[#0E1A2B]/10 bg-[#F4F8FB]"
                    : "border-[#2a9d8f]/40 bg-gradient-to-br from-[#2a9d8f]/8 to-[#84e245]/12"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#215e93] text-white">
                      <ModIcon size={20} />
                    </span>
                    <h4 className="text-2xl font-bold">{m.name}</h4>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                      m.same ? "bg-[#215e93]/10 text-[#215e93]" : "bg-[#84e245] text-[#0E1A2B]"
                    }`}
                  >
                    {m.same ? "Same for both" : "Differs"}
                  </span>
                </div>
                <p className="mt-3 text-lg font-bold text-[#0E1A2B]/90">{m.facts}</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${m.name}-${activePath}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1.5 text-xl font-medium leading-7 text-[#0E1A2B]/90"
                  >
                    {detail}
                  </motion.p>
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-lg font-medium text-[#0E1A2B]/90">
          Not sure which one you need? Ask the university, employer or immigration authority you are
          applying to, or message us and we will help you check.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FAQ EXPLORER — tabs + a short answer + a visual per question
========================================================= */

function FaqExplorer() {
  const [activeId, setActiveId] = useState(faqs[0].id);
  const active = faqs.find((f) => f.id === activeId);

  return (
    <div className="mt-10">
      {/* question tabs */}
      <div role="tablist" aria-label="IELTS questions" className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
        {faqs.map((f) => {
          const on = f.id === activeId;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActiveId(f.id)}
              className={`rounded-full border-2 px-4 py-2 text-base font-bold transition-colors duration-300 sm:px-5 sm:py-2.5 sm:text-lg ${
                on
                  ? "border-transparent bg-gradient-to-br from-[#2f87c9] to-[#2a9d8f] text-white shadow-[0_12px_30px_rgba(33,94,147,0.3)]"
                  : "border-[#0E1A2B]/10 bg-white text-[#0E1A2B] hover:border-[#2a9d8f]/60 hover:text-[#215e93]"
              }`}
            >
              {f.tab}
            </button>
          );
        })}
      </div>

      {/* panel */}
      <div className="mt-6 rounded-[28px] border border-[#0E1A2B]/10 bg-white p-4 shadow-[0_24px_70px_rgba(14,26,43,0.1)] sm:rounded-[32px] sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-2xl font-bold leading-tight sm:text-3xl">{active.q}</h3>
            <p className="mt-2 max-w-4xl text-lg font-medium leading-7 text-[#0E1A2B]/90 sm:text-xl sm:leading-8">{active.a}</p>

            <div className="mt-6">
              <FaqVisual id={active.id} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FaqVisual({ id }) {
  switch (id) {
    case "version":
      return <VersionVisual />;
    case "score":
      return <ScoreCalculator />;
    case "day":
      return <DayTimeline />;
    case "format":
      return <FormatTable />;
    case "marking":
      return <MarkingVisual />;
    case "criteria":
      return <CriteriaVisual />;
    case "need":
      return <NeedVisual />;
    case "retake":
      return <RetakeVisual />;
    default:
      return null;
  }
}

/* ---------- shared bits ---------- */

function StepFlow({ steps }) {
  return (
    <ol className="flex flex-col items-stretch gap-3 md:flex-row md:items-stretch">
      {steps.map((s, i) => {
        const StepIcon = s.icon;
        return (
          <li key={s.title} className="flex flex-1 flex-col items-stretch gap-3 md:flex-row md:items-center">
            <div className="flex-1 rounded-2xl border border-[#0E1A2B]/10 bg-[#F4F8FB] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#215e93] text-white">
                  <StepIcon size={19} />
                </span>
                <h4 className="text-xl font-bold">{s.title}</h4>
              </div>
              <p className="mt-2 text-lg font-medium leading-6 text-[#0E1A2B]/90">{s.text}</p>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight aria-hidden size={22} className="mx-auto shrink-0 rotate-90 text-[#2a9d8f] md:rotate-0" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Pill({ children, tone = "blue" }) {
  const tones = {
    blue: "bg-[#215e93]/10 text-[#215e93]",
    green: "bg-[#84e245] text-[#0E1A2B]",
    teal: "bg-[#2a9d8f]/15 text-[#1f7a6f]",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-base font-bold ${tones[tone]}`}>{children}</span>;
}

/* ---------- 1. Academic or General ---------- */

function VersionVisual() {
  const cards = [
    {
      title: "Academic",
      icon: GraduationCap,
      items: ["University or college abroad", "Postgraduate study", "Some professional registrations"],
    },
    {
      title: "General Training",
      icon: BriefcaseBusiness,
      items: ["Work abroad", "Training below degree level", "Migration"],
    },
  ];
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => {
          const CardIcon = c.icon;
          return (
            <div key={c.title} className="rounded-2xl border border-[#0E1A2B]/10 bg-[#F4F8FB] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#215e93] text-white">
                  <CardIcon size={21} />
                </span>
                <h4 className="text-2xl font-bold">{c.title}</h4>
              </div>
              <ul className="mt-4 space-y-2">
                {c.items.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-xl font-medium">
                    <Check size={18} className="mt-1.5 shrink-0 text-[#2a9d8f]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Pill tone="teal">Listening & Speaking: same</Pill>
        <Pill tone="green">Reading & Writing: differ</Pill>
        <Pill>Confirm with your institution first</Pill>
      </div>
    </div>
  );
}

/* ---------- 2. Score calculator ---------- */

const skillList = [
  { key: "L", name: "Listening", icon: Headphones },
  { key: "R", name: "Reading", icon: BookOpen },
  { key: "W", name: "Writing", icon: PenLine },
  { key: "S", name: "Speaking", icon: Mic2 },
];

function roundBand(avg) {
  return Math.floor(avg * 2 + 0.5) / 2;
}

function ScoreCalculator() {
  const [bands, setBands] = useState({ L: 6.5, R: 6.5, W: 6, S: 6.5 });

  const change = (key, delta) =>
    setBands((b) => ({ ...b, [key]: Math.min(9, Math.max(0, b[key] + delta)) }));

  const avg = (bands.L + bands.R + bands.W + bands.S) / 4;
  const overall = roundBand(avg);

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        {skillList.map((s) => {
          const SkillIcon = s.icon;
          return (
            <div key={s.key} className="rounded-2xl border border-[#0E1A2B]/10 bg-[#F4F8FB] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#215e93] text-white">
                  <SkillIcon size={18} />
                </span>
                <h4 className="text-xl font-bold">{s.name}</h4>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  aria-label={`Decrease ${s.name} band`}
                  onClick={() => change(s.key, -0.5)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0E1A2B]/15 bg-white text-[#215e93] transition-colors hover:border-[#2a9d8f] active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <span className="text-4xl font-bold text-[#215e93]">{bands[s.key].toFixed(1)}</span>
                <button
                  type="button"
                  aria-label={`Increase ${s.name} band`}
                  onClick={() => change(s.key, 0.5)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0E1A2B]/15 bg-white text-[#215e93] transition-colors hover:border-[#2a9d8f] active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#215e93]/10">
                <motion.span
                  animate={{ width: `${(bands[s.key] / 9) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="block h-full rounded-full bg-gradient-to-r from-[#215e93] to-[#2a9d8f]"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f7fc0] to-[#2a9d8f] p-6 text-center text-white">
        <p className="text-lg font-bold text-[#d6ffb0]">Overall band</p>
        <motion.p
          key={overall}
          initial={{ scale: 0.85, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-1 text-7xl font-bold leading-none"
        >
          {overall.toFixed(1)}
        </motion.p>
        <p className="mt-3 text-lg font-medium text-white/95">Average {avg.toFixed(2)}</p>
        <p className="mt-3 rounded-full bg-white/15 px-4 py-1.5 text-base font-bold">
          6.25 → 6.5 · 6.75 → 7.0
        </p>
      </div>
    </div>
  );
}

/* ---------- 3. Test day timeline ---------- */

function DayTimeline() {
  const parts = [
    { name: "Listening", min: 30, icon: Headphones, color: "from-[#215e93] to-[#2a6fa8]" },
    { name: "Reading", min: 60, icon: BookOpen, color: "from-[#2a6fa8] to-[#2a9d8f]" },
    { name: "Writing", min: 60, icon: PenLine, color: "from-[#2a9d8f] to-[#5fc46a]" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xl font-bold">Main test: no breaks</p>
        <Pill tone="green">≈ 2 h 40 min</Pill>
      </div>

      <div className="mt-3 flex gap-1.5">
        {parts.map((p, i) => {
          const PartIcon = p.icon;
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{ flexGrow: p.min, flexBasis: 0, transformOrigin: "left" }}
              className={`min-w-0 rounded-xl bg-gradient-to-br ${p.color} p-2.5 text-white sm:p-4`}
            >
              <PartIcon size={20} />
              <p className="mt-1 truncate text-base font-bold sm:text-xl">{p.name}</p>
              <p className="text-sm font-medium text-white/95 sm:text-base">{p.min} min</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-[#2a9d8f]/60 bg-[#2a9d8f]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#215e93] text-white">
            <Mic2 size={20} />
          </span>
          <div>
            <h4 className="text-xl font-bold">Speaking</h4>
            <p className="text-lg font-medium text-[#0E1A2B]/90">11 to 14 min · face to face</p>
          </div>
        </div>
        <Pill tone="teal">Same day or within a few days</Pill>
      </div>
    </div>
  );
}

/* ---------- 4. Computer vs paper ---------- */

function FormatTable() {
  const rows = [
    { label: "Content & questions", computer: "Same", paper: "Same", same: true },
    { label: "Timing", computer: "Same", paper: "Same", same: true },
    { label: "Scoring & weight", computer: "Same", paper: "Same", same: true },
    { label: "You answer", computer: "On screen", paper: "On paper", same: false },
    { label: "Results", computer: "Usually faster", paper: "Standard", same: false },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-y-2 text-left">
        <thead>
          <tr className="text-lg">
            <th className="px-4 py-2 font-bold text-[#0E1A2B]/70"> </th>
            <th className="px-4 py-2">
              <span className="inline-flex items-center gap-2 font-bold text-[#215e93]">
                <Monitor size={18} /> Computer
              </span>
            </th>
            <th className="px-4 py-2">
              <span className="inline-flex items-center gap-2 font-bold text-[#215e93]">
                <FileText size={18} /> Paper
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="text-xl">
              <td className="rounded-l-xl bg-[#F4F8FB] px-4 py-3 font-bold">{r.label}</td>
              <td className={`bg-[#F4F8FB] px-4 py-3 font-medium ${r.same ? "" : "font-bold text-[#1f7a6f]"}`}>
                <span className="inline-flex items-center gap-2">
                  {r.same && <Check size={17} className="text-[#2a9d8f]" />}
                  {r.computer}
                </span>
              </td>
              <td className="rounded-r-xl bg-[#F4F8FB] px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-2">
                  {r.same && <Check size={17} className="text-[#2a9d8f]" />}
                  {r.paper}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-lg font-medium text-[#0E1A2B]/90">Which format you get depends on your test location.</p>
    </div>
  );
}

/* ---------- 5. Negative marking ---------- */

function MarkingVisual() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f7fc0] to-[#2a9d8f] p-6 text-center text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
          <Check size={30} strokeWidth={3} />
        </span>
        <p className="mt-3 text-3xl font-bold">No negative marking</p>
        <p className="mt-1 text-xl font-medium text-white/95">A wrong answer costs nothing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#2a9d8f]/40 bg-[#2a9d8f]/5 p-5">
          <p className="text-xl font-bold text-[#1f7a6f]">Do</p>
          <ul className="mt-3 space-y-2.5">
            {["Answer every question", "Make an informed guess", "Check spelling", "Follow word limits"].map((t) => (
              <li key={t} className="flex items-start gap-2 text-xl font-medium">
                <Check size={18} className="mt-1.5 shrink-0 text-[#2a9d8f]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[#0E1A2B]/10 bg-[#F4F8FB] p-5">
          <p className="text-xl font-bold text-[#B3372F]">Avoid</p>
          <ul className="mt-3 space-y-2.5">
            {["Leaving blanks", "Wrong spelling", "Going over word limits"].map((t) => (
              <li key={t} className="flex items-start gap-2 text-xl font-medium">
                <X size={18} className="mt-1.5 shrink-0 text-[#B3372F]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- 6. Writing & Speaking criteria ---------- */

const criteriaData = {
  Writing: {
    icon: PenLine,
    items: ["Task achievement / response", "Coherence & cohesion", "Vocabulary range", "Grammar range & accuracy"],
    tip: "Task 2 carries 2× the weight of Task 1",
  },
  Speaking: {
    icon: Mic2,
    items: ["Fluency & coherence", "Vocabulary", "Grammar", "Pronunciation"],
    tip: "Each criterion counts equally",
  },
};

function CriteriaVisual() {
  const [mode, setMode] = useState("Writing");
  const data = criteriaData[mode];

  return (
    <div>
      <div className="inline-flex rounded-full border-2 border-[#0E1A2B]/10 bg-[#F4F8FB] p-1">
        {Object.keys(criteriaData).map((k) => {
          const KIcon = criteriaData[k].icon;
          const on = mode === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => setMode(k)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-lg font-bold transition-colors ${
                on ? "bg-[#2f87c9] text-white" : "text-[#0E1A2B] hover:text-[#215e93]"
              }`}
            >
              <KIcon size={17} />
              {k}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.items.map((t, i) => (
              <li key={t} className="rounded-2xl border border-[#0E1A2B]/10 bg-[#F4F8FB] p-4">
                <p className="text-base font-bold text-[#2a9d8f]">Criterion {i + 1}</p>
                <p className="mt-1 text-xl font-bold leading-7">{t}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <Pill tone="green">{data.tip}</Pill>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- 7. Score needed & validity ---------- */

function NeedVisual() {
  return (
    <div>
      <StepFlow
        steps={[
          { icon: Search, title: "Check the requirement", text: "Open your university, employer or authority's page." },
          { icon: Target, title: "Note the numbers", text: "Overall band, plus any minimum per skill." },
          { icon: SlidersHorizontal, title: "Plan backwards", text: "Set your target band and your test date." },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Pill tone="green">Valid for about 2 years</Pill>
        <Pill>Some organisations set their own rules</Pill>
      </div>
    </div>
  );
}

/* ---------- 8. Retake ---------- */

function RetakeVisual() {
  return (
    <div>
      <StepFlow
        steps={[
          { icon: ClipboardCheck, title: "Review", text: "Find your weakest skill." },
          { icon: Target, title: "Practise", text: "Train it under timed conditions." },
          { icon: Clock, title: "Mock test", text: "Check your progress." },
          { icon: RefreshCw, title: "Rebook", text: "A fresh test on any open date." },
        ]}
      />
      <p className="mt-4">
        <Pill tone="teal">No limit on attempts</Pill>
      </p>
    </div>
  );
}

export default IELTS;
