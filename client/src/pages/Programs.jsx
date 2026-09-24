import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  Mic2,
  PenLine,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

import programs from "../data/programs";

/* =========================================================
   ICONS
========================================================= */

const iconMap = {
  Communication: Mic2,
  Career: Target,
  Academic: GraduationCap,
  Professional: BriefcaseBusiness,
  "English Development": UsersRound,
  Teaching: PenLine,
};

/* =========================================================
   GOALS
========================================================= */

const goals = [
  {
    id: "confidence",
    number: "01",
    title: "Speak with confidence",
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
    number: "02",
    title: "Grow my career",
    description:
      "Develop the communication skills that help you perform better in interviews and professional environments.",
    programs: [
      "Interview & Career Skills",
      "Business English & Workplace Communication",
      "Professional Writing Skills",
    ],
  },
  {
    id: "academic",
    number: "03",
    title: "Achieve an academic goal",
    description:
      "Strengthen your English for examinations, higher education and international opportunities.",
    programs: [
      "IELTS Preparation & Success",
      "English for Competitive Exams",
      "English as a Foreign Language (EFL)",
    ],
  },
  {
    id: "educator",
    number: "04",
    title: "Become a better educator",
    description:
      "Upgrade your teaching practice, classroom communication and professional capabilities.",
    programs: ["Teacher Training & Development"],
  },
];

/* =========================================================
   MAIN
========================================================= */

function Programs() {
  const [activeGoal, setActiveGoal] = useState("confidence");
  const [activeProgram, setActiveProgram] = useState(programs[0]?.id ?? 1);

  const selectedGoal = goals.find((goal) => goal.id === activeGoal);

  const selectedProgram = useMemo(() => {
    return (
      programs.find((program) => program.id === activeProgram) || programs[0]
    );
  }, [activeProgram]);

  /* =========================================================
     GOAL SELECTION
  ========================================================= */

  const selectGoal = (goal) => {
    setActiveGoal(goal.id);

    const firstMatchingProgram = programs.find((program) =>
      goal.programs.includes(program.title),
    );

    if (firstMatchingProgram) {
      setActiveProgram(firstMatchingProgram.id);
    }
  };

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-jashna-ivory
        text-jashna-charcoal
      "
    >
      {/* =====================================================
          GLOBAL AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Blue glow */}

        <motion.div
          animate={{
            x: [0, 35, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -right-40
            top-20
            h-[520px]
            w-[520px]
            rounded-full
            bg-[#338DFD]/[0.055]
            blur-[130px]
          "
        />

        {/* Green glow */}

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -left-48
            top-[38%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#49C4A5]/[0.055]
            blur-[130px]
          "
        />

        {/* Fine grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(#10243E_1px,transparent_1px),linear-gradient(90deg,#10243E_1px,transparent_1px)]
            [background-size:60px_60px]
          "
        />
      </div>

      {/* =====================================================
          01 — NEW OPENING / HERO
      ===================================================== */}

      <section
        className="
          relative
          px-5
          pb-20
          pt-32
          sm:px-8
          lg:px-10
          lg:pb-28
          lg:pt-40
        "
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="
              grid
              items-center
              gap-14
              lg:grid-cols-[0.9fr_1.1fr]
              lg:gap-20
            "
          >
            {/* =================================================
                LEFT — HERO COPY
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                x: -25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.75,
                ease: "easeOut",
              }}
              className="relative z-10"
            >
              {/* EYEBROW */}

              <div className="flex items-center gap-3">
                <span
                  className="
                    h-[2px]
                    w-10
                    rounded-full
                    bg-gradient-to-r
                    from-[#338DFD]
                    to-[#49C4A5]
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.3em]
                    text-[#338DFD]
                  "
                >
                  Learn with purpose
                </span>
              </div>

              {/* HEADING */}

              <h1
                className="
                  mt-7
                  max-w-2xl
                  font-display
                  text-5xl
                  font-bold
                  leading-[0.96]
                  tracking-[-0.045em]
                  text-[#10243E]
                  sm:text-6xl
                  lg:text-[5.1rem]
                "
              >
                Find the skills
                <span
                  className="
                    block
                    bg-gradient-to-r
                    from-[#338DFD]
                    via-[#338DFD]
                    to-[#49C4A5]
                    bg-clip-text
                    text-transparent
                  "
                >
                  that move you forward.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-7
                  max-w-xl
                  text-base
                  font-medium
                  leading-8
                  text-jashna-muted
                  sm:text-lg
                "
              >
                From everyday English to interviews, IELTS, public speaking and
                professional communication, choose a learning path built around
                what you want to achieve.
              </p>

              {/* ACTIONS */}

              <div
                className="
                  mt-9
                  flex
                  flex-wrap
                  items-center
                  gap-4
                "
              >
                <motion.a
                  href="#explore"
                  whileHover={{
                    y: -3,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2.5
                    rounded-full
                    bg-gradient-to-r
                    from-[#338DFD]
                    to-[#49C4A5]
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_10px_30px_rgba(51,141,253,0.20)]
                    transition-all
                    duration-300
                    hover:shadow-[0_14px_38px_rgba(51,141,253,0.28)]
                  "
                >
                  Explore learning paths
                  <ArrowRight
                    size={16}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </motion.a>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#10243E]/10
                    bg-white/55
                    px-4
                    py-2.5
                    backdrop-blur-sm
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-[#49C4A5]
                      shadow-[0_0_9px_rgba(73,196,165,0.55)]
                    "
                  />

                  <span
                    className="
                      text-[11px]
                      font-bold
                      text-[#10243E]/65
                    "
                  >
                    11 focused learning paths
                  </span>
                </div>
              </div>

              {/* MINI TRUST POINTS */}

              <div
                className="
                  mt-10
                  flex
                  flex-wrap
                  gap-x-6
                  gap-y-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#10243E]/40
                "
              >
                <span className="flex items-center gap-2">
                  <Check size={13} className="text-[#49C4A5]" />
                  Practical learning
                </span>

                <span className="flex items-center gap-2">
                  <Check size={13} className="text-[#49C4A5]" />
                  Real-world skills
                </span>

                <span className="flex items-center gap-2">
                  <Check size={13} className="text-[#49C4A5]" />
                  Personalised direction
                </span>
              </div>
            </motion.div>

            {/* =================================================
                RIGHT — PROGRAM NAVIGATOR

                Replaces the old decorative circle.
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                x: 30,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.85,
                delay: 0.12,
                ease: "easeOut",
              }}
              className="relative mx-auto w-full max-w-[620px]"
            >
              {/* Background decorative glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-40
                  w-40
                  rounded-full
                  bg-[#338DFD]/10
                  blur-[70px]
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-10
                  -left-10
                  h-40
                  w-40
                  rounded-full
                  bg-[#49C4A5]/10
                  blur-[70px]
                "
              />

              {/* Main dashboard */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[34px]
                  border
                  border-[#10243E]/10
                  bg-white/70
                  p-5
                  shadow-[0_25px_70px_rgba(16,36,62,0.10)]
                  backdrop-blur-xl
                  sm:p-7
                "
              >
                {/* top gradient line */}

                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-0
                    h-[3px]
                    bg-gradient-to-r
                    from-[#338DFD]
                    via-[#49C4A5]
                    to-[#338DFD]
                  "
                />

                {/* Dashboard header */}

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-5
                  "
                >
                  <div>
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.24em]
                        text-[#338DFD]
                      "
                    >
                      <Sparkles size={12} />
                      Program Navigator
                    </div>

                    <h2
                      className="
                        mt-2
                        font-display
                        text-2xl
                        font-bold
                        tracking-[-0.02em]
                        text-[#10243E]
                        sm:text-3xl
                      "
                    >
                      Where do you want to grow?
                    </h2>
                  </div>

                  <div
                    className="
                      hidden
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gradient-to-br
                      from-[#338DFD]
                      to-[#49C4A5]
                      text-white
                      shadow-[0_8px_20px_rgba(51,141,253,0.20)]
                      sm:flex
                    "
                  >
                    <Target size={19} />
                  </div>
                </div>

                {/* Goal pills */}

                <div
                  className="
                    mt-7
                    grid
                    grid-cols-2
                    gap-2.5
                    sm:grid-cols-4
                  "
                >
                  {goals.map((goal) => {
                    const active = activeGoal === goal.id;

                    return (
                      <motion.button
                        key={goal.id}
                        type="button"
                        onClick={() => selectGoal(goal)}
                        whileHover={{
                          y: -2,
                        }}
                        whileTap={{
                          scale: 0.96,
                        }}
                        className={`
                          relative
                          overflow-hidden
                          rounded-2xl
                          border
                          px-3
                          py-3.5
                          text-left
                          transition-all
                          duration-300

                          ${
                            active
                              ? `
                                border-[#338DFD]/20
                                bg-gradient-to-br
                                from-[#338DFD]
                                to-[#49C4A5]
                                text-white
                                shadow-[0_8px_22px_rgba(51,141,253,0.20)]
                              `
                              : `
                                border-[#10243E]/8
                                bg-[#F8F9FA]
                                text-[#10243E]
                                hover:border-[#338DFD]/20
                                hover:bg-white
                              `
                          }
                        `}
                      >
                        <span
                          className={`
                            text-[8px]
                            font-bold
                            tracking-[0.15em]

                            ${active ? "text-white/65" : "text-[#338DFD]/60"}
                          `}
                        >
                          {goal.number}
                        </span>

                        <span
                          className="
                            mt-1
                            block
                            text-[11px]
                            font-bold
                            leading-4
                          "
                        >
                          {goal.title
                            .replace(
                              "Become a better educator",
                              "Better educator",
                            )
                            .replace(
                              "Achieve an academic goal",
                              "Academic goals",
                            )
                            .replace("Grow my career", "Career growth")
                            .replace(
                              "Speak with confidence",
                              "Speak confidently",
                            )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Selected goal panel */}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedGoal?.id}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="
                      mt-5
                      rounded-[24px]
                      bg-[#10243E]
                      p-5
                      text-white
                      sm:p-6
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-5
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.2em]
                            text-[#49C4A5]
                          "
                        >
                          Your selected direction
                        </p>

                        <h3
                          className="
                            mt-2
                            font-display
                            text-xl
                            font-bold
                            sm:text-2xl
                          "
                        >
                          {selectedGoal?.title}
                        </h3>
                      </div>

                      <span
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-white/10
                          text-[#49C4A5]
                        "
                      >
                        <ArrowUpRight size={16} />
                      </span>
                    </div>

                    <p
                      className="
                        mt-3
                        max-w-lg
                        text-xs
                        leading-6
                        text-white/55
                      "
                    >
                      {selectedGoal?.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Bottom statistics */}

                <div
                  className="
                    mt-5
                    grid
                    grid-cols-3
                    divide-x
                    divide-[#10243E]/8
                    rounded-2xl
                    border
                    border-[#10243E]/8
                    bg-white/50
                    py-4
                  "
                >
                  <NavigatorStat number="11" label="Programs" />

                  <NavigatorStat number="04" label="Goal areas" />

                  <NavigatorStat number="01" label="You" />
                </div>
              </div>

              {/* Floating micro-card */}

              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  absolute
                  -bottom-5
                  -left-3
                  hidden
                  rounded-2xl
                  border
                  border-[#10243E]/8
                  bg-white
                  px-4
                  py-3
                  shadow-[0_12px_30px_rgba(16,36,62,0.10)]
                  sm:block
                  lg:-left-7
                "
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-[#49C4A5]/10
                      text-[#49C4A5]
                    "
                  >
                    <Check size={13} />
                  </span>

                  <div>
                    <p className="text-[9px] font-bold text-[#10243E]">
                      Built around real goals
                    </p>

                    <p className="mt-0.5 text-[8px] text-[#10243E]/40">
                      Learn • Practise • Apply
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating program count */}

              <motion.div
                animate={{
                  y: [0, 5, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.7,
                }}
                className="
                  absolute
                  -right-2
                  -top-4
                  hidden
                  rounded-2xl
                  border
                  border-[#338DFD]/10
                  bg-white
                  px-4
                  py-3
                  shadow-[0_12px_30px_rgba(16,36,62,0.10)]
                  sm:block
                  lg:-right-6
                "
              >
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#338DFD]">
                  Jashna
                </p>

                <p className="mt-1 text-xs font-bold text-[#10243E]">
                  11 learning paths
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          02 — GOAL SELECTOR
      ===================================================== */}

      <section
        id="explore"
        className="
          relative
          border-y
          border-[#10243E]/8
          bg-white/40
          px-5
          py-20
          sm:px-8
          lg:px-10
          lg:py-28
        "
      >
        <div className="mx-auto max-w-7xl">
          {/* Section heading */}

          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                className="
                  h-[2px]
                  w-9
                  rounded-full
                  bg-[#49C4A5]
                "
              />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.28em]
                  text-[#338DFD]
                "
              >
                Start with your goal
              </p>
            </div>

            <h2
              className="
                mt-5
                font-display
                text-4xl
                font-bold
                leading-[1.05]
                tracking-[-0.035em]
                text-[#10243E]
                sm:text-5xl
              "
            >
              Choose where you want
              <span
                className="
                  block
                  bg-gradient-to-r
                  from-[#338DFD]
                  to-[#49C4A5]
                  bg-clip-text
                  text-transparent
                "
              >
                your learning to take you.
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-sm
                font-medium
                leading-7
                text-jashna-muted
              "
            >
              You don't need to know which course you need. Start with the
              outcome you want, and explore the programs connected to it.
            </p>
          </div>

          {/* Goal cards */}

          <div
            className="
              mt-12
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {goals.map((goal) => {
              const isActive = activeGoal === goal.id;

              return (
                <motion.button
                  key={goal.id}
                  type="button"
                  onClick={() => selectGoal(goal)}
                  whileHover={{
                    y: -6,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-[28px]
                    border
                    p-7
                    text-left
                    transition-all
                    duration-500

                    ${
                      isActive
                        ? `
                          border-[#338DFD]/10
                          bg-[#10243E]
                          text-white
                          shadow-[0_20px_45px_rgba(16,36,62,0.18)]
                        `
                        : `
                          border-[#10243E]/8
                          bg-white/65
                          hover:border-[#338DFD]/20
                          hover:bg-white
                          hover:shadow-[0_18px_40px_rgba(16,36,62,0.08)]
                        `
                    }
                  `}
                >
                  {/* Card glow */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      -right-10
                      -top-10
                      h-28
                      w-28
                      rounded-full
                      bg-[#338DFD]/10
                      blur-2xl
                      transition-transform
                      duration-500
                      group-hover:scale-150
                    "
                  />

                  {/* Number */}

                  <span
                    className={`
                      relative
                      z-10
                      font-display
                      text-5xl
                      font-bold

                      ${isActive ? "text-white/10" : "text-[#338DFD]/10"}
                    `}
                  >
                    {goal.number}
                  </span>

                  <h3
                    className={`
                      relative
                      z-10
                      mt-7
                      font-display
                      text-xl
                      font-bold

                      ${isActive ? "text-white" : "text-[#10243E]"}
                    `}
                  >
                    {goal.title}
                  </h3>

                  <p
                    className={`
                      relative
                      z-10
                      mt-3
                      text-xs
                      leading-6

                      ${isActive ? "text-white/55" : "text-jashna-muted"}
                    `}
                  >
                    {goal.description}
                  </p>

                  <span
                    className={`
                      relative
                      z-10
                      mt-6
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-bold

                      ${isActive ? "text-[#49C4A5]" : "text-[#338DFD]"}
                    `}
                  >
                    Explore this path
                    <ArrowUpRight
                      size={14}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          03 — PROGRAM SHOWCASE
      ===================================================== */}

      <section
        className="
          relative
          px-5
          py-24
          sm:px-8
          lg:px-10
          lg:py-32
        "
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="
              grid
              gap-12
              lg:grid-cols-[0.3fr_0.7fr]
              lg:gap-14
            "
          >
            {/* =================================================
                LEFT — PROGRAM NAVIGATION
            ================================================= */}

            <div className="relative">
              <div
                className="
                  mb-7
                  flex
                  items-end
                  justify-between
                  gap-4
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-[#49C4A5]
                        shadow-[0_0_8px_rgba(73,196,165,0.5)]
                      "
                    />

                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.28em]
                        text-[#338DFD]
                      "
                    >
                      Our programs
                    </p>
                  </div>

                  <h3
                    className="
                      mt-2
                      font-display
                      text-2xl
                      font-bold
                      text-[#10243E]
                    "
                  >
                    Find your learning path
                  </h3>
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-[#10243E]/8
                    bg-white/65
                    px-3
                    py-1.5
                    text-[9px]
                    font-bold
                    tracking-[0.12em]
                    text-jashna-muted
                  "
                >
                  11 PROGRAMS
                </span>
              </div>

              {/* Program list */}

              <div
                className="
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-[#10243E]/8
                  bg-white/60
                  p-2
                  shadow-sm
                  backdrop-blur-sm
                "
              >
                {programs.map((program, index) => {
                  const Icon = iconMap[program.category] || Sparkles;

                  const isActive = selectedProgram?.id === program.id;

                  return (
                    <motion.button
                      key={program.id}
                      type="button"
                      onClick={() => setActiveProgram(program.id)}
                      whileHover={{
                        x: isActive ? 0 : 4,
                      }}
                      whileTap={{
                        scale: 0.985,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className={`
                        group
                        relative
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-[20px]
                        px-3
                        py-3
                        text-left
                        transition-all
                        duration-300

                        ${
                          isActive
                            ? `
                              bg-[#10243E]
                              text-white
                              shadow-lg
                            `
                            : `
                              text-[#10243E]
                              hover:bg-white
                            `
                        }
                      `}
                    >
                      {/* Active indicator */}

                      {isActive && (
                        <motion.span
                          layoutId="activeProgramIndicator"
                          className="
                            absolute
                            left-0
                            top-1/2
                            h-7
                            w-1
                            -translate-y-1/2
                            rounded-r-full
                            bg-gradient-to-b
                            from-[#338DFD]
                            to-[#49C4A5]
                          "
                        />
                      )}

                      {/* Number */}

                      <span
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-[9px]
                          font-bold
                          transition-all
                          duration-300

                          ${
                            isActive
                              ? "bg-white/10 text-[#49C4A5]"
                              : "bg-[#10243E]/[0.04] text-jashna-muted group-hover:bg-[#338DFD]/10 group-hover:text-[#338DFD]"
                          }
                        `}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Icon */}

                      <span
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          transition-all
                          duration-300

                          ${
                            isActive
                              ? "bg-gradient-to-br from-[#338DFD] to-[#49C4A5] text-white"
                              : "bg-[#338DFD]/[0.06] text-[#338DFD] group-hover:bg-[#338DFD] group-hover:text-white"
                          }
                        `}
                      >
                        <Icon size={14} />
                      </span>

                      {/* Course info */}

                      <span className="min-w-0 flex-1">
                        <span
                          className={`
                            block
                            truncate
                            text-xs
                            font-bold
                            leading-5

                            ${isActive ? "text-white" : "text-[#10243E]"}
                          `}
                        >
                          {program.shortTitle || program.title}
                        </span>

                        <span
                          className={`
                            mt-0.5
                            block
                            truncate
                            text-[9px]
                            font-medium

                            ${isActive ? "text-white/40" : "text-jashna-muted"}
                          `}
                        >
                          {program.category}
                        </span>
                      </span>

                      {/* Arrow */}

                      <span
                        className={`
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          transition-all
                          duration-300

                          ${
                            isActive
                              ? "bg-white/10 text-[#49C4A5]"
                              : "text-jashna-muted/40 group-hover:bg-[#338DFD] group-hover:text-white"
                          }
                        `}
                      >
                        <ArrowUpRight size={13} />
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Supporting line */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-3
                  px-2
                "
              >
                <span className="h-px flex-1 bg-[#10243E]/8" />

                <span
                  className="
                    text-[9px]
                    font-bold
                    text-jashna-muted
                  "
                >
                  Select a program to explore
                </span>

                <span className="h-px flex-1 bg-[#10243E]/8" />
              </div>
            </div>

            {/* =================================================
                RIGHT — LARGE PROGRAM PANEL
            ================================================= */}

            <div className="relative min-h-[560px]">
              <AnimatePresence mode="wait">
                {selectedProgram && (
                  <motion.div
                    key={selectedProgram.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                    }}
                    transition={{
                      duration: 0.45,
                    }}
                    className="
                      relative
                      h-full
                      min-h-[560px]
                      overflow-hidden
                      rounded-[36px]
                      bg-[#10243E]
                      p-7
                      text-white
                      shadow-[0_25px_70px_rgba(16,36,62,0.20)]
                      sm:p-12
                    "
                  >
                    {/* Blue glow */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-24
                        -top-24
                        h-80
                        w-80
                        rounded-full
                        bg-[#338DFD]/20
                        blur-[100px]
                      "
                    />

                    {/* Green glow */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        bottom-[-100px]
                        left-[-80px]
                        h-72
                        w-72
                        rounded-full
                        bg-[#49C4A5]/15
                        blur-[100px]
                      "
                    />

                    {/* Decorative number */}

                    <span
                      className="
                        pointer-events-none
                        absolute
                        -right-5
                        -top-16
                        font-display
                        text-[18rem]
                        font-bold
                        leading-none
                        text-white/[0.035]
                      "
                    >
                      {String(selectedProgram.id).padStart(2, "0")}
                    </span>

                    <div className="relative z-10 flex h-full flex-col">
                      {/* Top */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-5
                        "
                      >
                        <div>
                          <span
                            className="
                              inline-flex
                              rounded-full
                              border
                              border-white/10
                              bg-white/5
                              px-3
                              py-1.5
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-[0.18em]
                              text-[#49C4A5]
                            "
                          >
                            {selectedProgram.category}
                          </span>

                          <p
                            className="
                              mt-8
                              text-xs
                              font-bold
                              uppercase
                              tracking-[0.22em]
                              text-white/30
                            "
                          >
                            Program{" "}
                            {String(selectedProgram.id).padStart(2, "0")}
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            text-[#49C4A5]
                          "
                        >
                          {(() => {
                            const Icon =
                              iconMap[selectedProgram.category] || Sparkles;

                            return <Icon size={22} />;
                          })()}
                        </div>
                      </div>

                      {/* Bottom content */}

                      <div className="mt-auto pt-20">
                        <h3
                          className="
                            max-w-3xl
                            font-display
                            text-4xl
                            font-bold
                            leading-[1.04]
                            sm:text-5xl
                            lg:text-6xl
                          "
                        >
                          {selectedProgram.title}
                        </h3>

                        <p
                          className="
                            mt-6
                            max-w-2xl
                            text-sm
                            font-medium
                            leading-7
                            text-white/60
                            sm:text-base
                          "
                        >
                          {selectedProgram.description}
                        </p>

                        {/* Program details */}

                        <div
                          className="
                            mt-9
                            grid
                            gap-4
                            sm:grid-cols-2
                          "
                        >
                          <div
                            className="
                              rounded-2xl
                              border
                              border-white/10
                              bg-white/5
                              p-5
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-white/30
                              "
                            >
                              Designed for
                            </p>

                            <p
                              className="
                                mt-2
                                text-xs
                                font-medium
                                leading-5
                                text-white/80
                              "
                            >
                              {selectedProgram.audience}
                            </p>
                          </div>

                          <div
                            className="
                              rounded-2xl
                              border
                              border-white/10
                              bg-white/5
                              p-5
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-white/30
                              "
                            >
                              Focus
                            </p>

                            <p
                              className="
                                mt-2
                                text-xs
                                font-medium
                                leading-5
                                text-white/80
                              "
                            >
                              Practical skills for real-world communication
                            </p>
                          </div>
                        </div>

                        {/* CTA */}

                        <div
                          className="
                            mt-8
                            flex
                            flex-wrap
                            items-center
                            gap-5
                          "
                        >
                          <motion.a
                            href="#consultation"
                            whileHover={{
                              y: -2,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            className="
                              group
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              bg-gradient-to-r
                              from-[#338DFD]
                              to-[#49C4A5]
                              px-6
                              py-3.5
                              text-xs
                              font-bold
                              text-white
                              shadow-[0_10px_28px_rgba(51,141,253,0.22)]
                              transition-all
                              duration-300
                            "
                          >
                            Talk to us about this program
                            <ArrowUpRight
                              size={15}
                              className="
                                transition-transform
                                duration-300
                                group-hover:translate-x-1
                                group-hover:-translate-y-1
                              "
                            />
                          </motion.a>

                          <span
                            className="
                              flex
                              items-center
                              gap-2
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.14em]
                              text-white/30
                            "
                          >
                            <span
                              className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-[#49C4A5]
                              "
                            />
                            Practical learning
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          04 — JASHNA METHOD
      ===================================================== */}

      <section
        className="
          relative
          border-y
          border-[#10243E]/8
          bg-white/45
          px-5
          py-24
          sm:px-8
          lg:px-10
          lg:py-32
        "
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="
              grid
              gap-16
              lg:grid-cols-[0.8fr_1.2fr]
            "
          >
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="
                    h-[2px]
                    w-9
                    rounded-full
                    bg-[#338DFD]
                  "
                />

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.28em]
                    text-[#338DFD]
                  "
                >
                  More than a course
                </p>
              </div>

              <h2
                className="
                  mt-5
                  max-w-lg
                  font-display
                  text-4xl
                  font-bold
                  leading-tight
                  text-[#10243E]
                  sm:text-5xl
                "
              >
                Learning designed
                <span
                  className="
                    block
                    bg-gradient-to-r
                    from-[#338DFD]
                    to-[#49C4A5]
                    bg-clip-text
                    text-transparent
                  "
                >
                  around you.
                </span>
              </h2>

              <p
                className="
                  mt-6
                  max-w-md
                  text-sm
                  font-medium
                  leading-7
                  text-jashna-muted
                "
              >
                Every learner starts from a different place. That's why our
                approach focuses on understanding your needs first, then turning
                learning into practical action.
              </p>
            </div>

            <div className="relative">
              <MethodStep
                number="01"
                title="Assess"
                description="Understand your current ability, challenges and goals."
              />

              <MethodStep
                number="02"
                title="Personalise"
                description="Build a learning path around what you actually need."
              />

              <MethodStep
                number="03"
                title="Practise"
                description="Work with realistic situations instead of learning English in isolation."
              />

              <MethodStep
                number="04"
                title="Refine"
                description="Receive feedback, correction and guidance to improve."
              />

              <MethodStep
                number="05"
                title="Apply"
                description="Take your new skills into conversations, classrooms, interviews and workplaces."
                last
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          05 — TRANSFORMATION
      ===================================================== */}

      <section
        className="
          relative
          px-5
          py-24
          sm:px-8
          lg:px-10
          lg:py-32
        "
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <span
                className="
                  h-[2px]
                  w-8
                  rounded-full
                  bg-[#49C4A5]
                "
              />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.28em]
                  text-[#338DFD]
                "
              >
                The real outcome
              </p>

              <span
                className="
                  h-[2px]
                  w-8
                  rounded-full
                  bg-[#338DFD]
                "
              />
            </div>

            <h2
              className="
                mx-auto
                mt-5
                max-w-3xl
                font-display
                text-4xl
                font-bold
                leading-tight
                tracking-[-0.035em]
                text-[#10243E]
                sm:text-5xl
              "
            >
              From knowing English
              <span
                className="
                  block
                  bg-gradient-to-r
                  from-[#338DFD]
                  to-[#49C4A5]
                  bg-clip-text
                  text-transparent
                "
              >
                to using it.
              </span>
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                text-sm
                font-medium
                leading-7
                text-jashna-muted
              "
            >
              Because confidence isn't built by collecting certificates. It's
              built by being able to use what you've learned.
            </p>
          </div>

          <div
            className="
              mt-16
              overflow-hidden
              rounded-[36px]
              border
              border-[#10243E]/8
              bg-white/65
              shadow-[0_18px_50px_rgba(16,36,62,0.06)]
            "
          >
            <TransformationRow
              before="I know what I want to say."
              after="I can say it clearly."
            />

            <TransformationRow
              before="I understand English."
              after="I can communicate confidently."
            />

            <TransformationRow
              before="I get nervous presenting."
              after="I can own the room."
            />

            <TransformationRow
              before="I know my subject."
              after="I can explain it professionally."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          06 — FINAL CTA
      ===================================================== */}

      <section
        id="consultation"
        className="
          relative
          overflow-hidden
          bg-[#10243E]
          px-5
          py-28
          text-white
          sm:px-8
          lg:px-10
          lg:py-36
        "
      >
        {/* Blue glow */}

        <div
          className="
            pointer-events-none
            absolute
            right-[-150px]
            top-[-150px]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#338DFD]/20
            blur-[120px]
          "
        />

        {/* Green glow */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-[-180px]
            left-[-100px]
            h-[450px]
            w-[450px]
            rounded-full
            bg-[#49C4A5]/15
            blur-[120px]
          "
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <div
            className="
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <span
              className="
                h-[2px]
                w-8
                rounded-full
                bg-[#338DFD]
              "
            />

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-[#49C4A5]
              "
            >
              Your next step
            </p>

            <span
              className="
                h-[2px]
                w-8
                rounded-full
                bg-[#49C4A5]
              "
            />
          </div>

          <h2
            className="
              mt-6
              font-display
              text-4xl
              font-bold
              leading-tight
              tracking-[-0.035em]
              sm:text-6xl
            "
          >
            Not sure where
            <span
              className="
                block
                bg-gradient-to-r
                from-[#338DFD]
                to-[#49C4A5]
                bg-clip-text
                text-transparent
              "
            >
              to begin?
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-xl
              text-sm
              leading-7
              text-white/55
              sm:text-base
            "
          >
            Tell us what you want to improve, where you're starting from and
            where you want to go. We'll help you find the right program.
          </p>

          <motion.a
            href="/consultation"
            whileHover={{
              y: -4,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="
              group
              mt-9
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-gradient-to-r
              from-[#338DFD]
              to-[#49C4A5]
              px-7
              py-4
              text-sm
              font-bold
              text-white
              shadow-[0_12px_35px_rgba(51,141,253,0.25)]
              transition-all
              duration-300
              hover:shadow-[0_16px_42px_rgba(51,141,253,0.35)]
            "
          >
            Book a Consultation
            <ArrowUpRight
              size={17}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
                group-hover:-translate-y-1
              "
            />
          </motion.a>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   NAVIGATOR STAT
========================================================= */

function NavigatorStat({ number, label }) {
  return (
    <div className="text-center">
      <p
        className="
          font-display
          text-xl
          font-bold
          text-[#10243E]
        "
      >
        {number}
      </p>

      <p
        className="
          mt-1
          text-[8px]
          font-bold
          uppercase
          tracking-[0.15em]
          text-jashna-muted
        "
      >
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   METHOD STEP
========================================================= */

function MethodStep({ number, title, description, last = false }) {
  return (
    <motion.div
      whileHover={{
        x: 4,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative flex gap-6"
    >
      {!last && (
        <div
          className="
            absolute
            left-[19px]
            top-11
            h-[calc(100%-4px)]
            w-px
            bg-gradient-to-b
            from-[#338DFD]/30
            to-[#49C4A5]/10
          "
        />
      )}

      <div
        className="
          relative
          z-10
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-[#338DFD]/15
          bg-jashna-ivory
          text-[10px]
          font-bold
          text-[#338DFD]
          transition-all
          duration-300
          group-hover:border-[#338DFD]/30
          group-hover:bg-[#338DFD]
          group-hover:text-white
          group-hover:shadow-[0_0_18px_rgba(51,141,253,0.18)]
        "
      >
        {number}
      </div>

      <div className="pb-10">
        <h3
          className="
            font-display
            text-xl
            font-bold
            text-[#10243E]
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-2
            max-w-lg
            text-sm
            font-medium
            leading-6
            text-jashna-muted
          "
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   TRANSFORMATION ROW
========================================================= */

function TransformationRow({ before, after }) {
  return (
    <motion.div
      whileHover={{
        backgroundColor: "rgba(255,255,255,0.85)",
      }}
      className="
        grid
        gap-5
        border-b
        border-[#10243E]/8
        p-7
        transition-colors
        duration-300
        last:border-b-0
        sm:grid-cols-[1fr_auto_1fr]
        sm:items-center
        sm:p-9
      "
    >
      <div>
        <span
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-jashna-muted
          "
        >
          Before
        </span>

        <p
          className="
            mt-2
            font-display
            text-lg
            font-medium
            text-[#10243E]/45
          "
        >
          {before}
        </p>
      </div>

      <ArrowRight
        size={20}
        className="
          hidden
          text-[#49C4A5]
          sm:block
        "
      />

      <div>
        <span
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-[#338DFD]
          "
        >
          After
        </span>

        <p
          className="
            mt-2
            font-display
            text-lg
            font-bold
            text-[#10243E]
          "
        >
          {after}
        </p>
      </div>
    </motion.div>
  );
}

export default Programs;
