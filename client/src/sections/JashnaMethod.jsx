import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Presentation,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ========================================================
   FEATURE DATA
======================================================== */

const features = [
  {
    id: "curriculum",
    number: "01",
    title: "Cambridge-certified curriculum",
    shortTitle: "CELTA-based methodology",
    description:
      "A structured curriculum built on the CELTA framework, designed to develop practical and confident communication.",
    icon: BadgeCheck,
    screenLabel: "Curriculum",
    screenTitle: "Built on a stronger foundation.",
    screenAccent: "CELTA framework",
    screenDescription:
      "A structured learning experience grounded in internationally recognized teaching methodology.",
    points: [
      "Cambridge-aligned methodology",
      "Structured learning pathway",
      "Practical communication focus",
    ],
  },
  {
    id: "assessment",
    number: "02",
    title: "Personalized diagnostic assessment",
    shortTitle: "Know where you stand",
    description:
      "Every learner begins with a diagnostic assessment to understand strengths, gaps, communication needs, and goals.",
    icon: ClipboardCheck,
    screenLabel: "Assessment",
    screenTitle: "Know where you stand.",
    screenAccent: "Before you begin",
    screenDescription:
      "Your learning journey starts with a clearer picture of your communication strengths and areas for growth.",
    points: [
      "Communication profile",
      "Strength & gap analysis",
      "Goal identification",
    ],
  },
  {
    id: "coaching",
    number: "03",
    title: "1:1 bespoke coaching",
    shortTitle: "Built around your goals",
    description:
      "Personalized coaching tailored to your individual pace, professional context, communication level, and goals.",
    icon: UserRoundCheck,
    screenLabel: "Coaching",
    screenTitle: "Built around you.",
    screenAccent: "1:1 bespoke coaching",
    screenDescription:
      "Focused guidance that adapts to your pace, priorities, professional context, and goals.",
    points: [
      "Individual learning path",
      "Goal-based sessions",
      "Personalized feedback",
    ],
  },
  {
    id: "realworld",
    number: "04",
    title: "Real-world application modules",
    shortTitle: "Practice what matters",
    description:
      "Simulated presentations, negotiations, interviews, and practical communication scenarios that mirror real situations.",
    icon: Presentation,
    screenLabel: "Application",
    screenTitle: "Practice what matters.",
    screenAccent: "Real-world modules",
    screenDescription:
      "Turn communication concepts into practical skills through realistic professional situations.",
    points: ["Presentations", "Negotiations", "Interview simulations"],
  },
  {
    id: "expert",
    number: "05",
    title: "Expert-led instruction",
    shortTitle: "Learn from an expert",
    description:
      "Expert-led instruction by a PhD-qualified, CELTA-certified trainer with a focus on purposeful communication.",
    icon: GraduationCap,
    screenLabel: "Expert Instruction",
    screenTitle: "Learn from an expert.",
    screenAccent: "PhD + CELTA",
    screenDescription:
      "Expert guidance combines academic depth with practical communication training.",
    points: [
      "PhD-qualified trainer",
      "CELTA-certified instruction",
      "Expert-led learning",
    ],
  },
  {
    id: "engagement",
    number: "06",
    title: "Corporate & academic engagement",
    shortTitle: "Beyond individual coaching",
    description:
      "Workshops, mock interviews, guest lectures, and institutional engagement designed for academic and professional environments.",
    icon: Building2,
    screenLabel: "Engagement",
    screenTitle: "Beyond the classroom.",
    screenAccent: "Institutions & organizations",
    screenDescription:
      "Communication development extends into universities, institutions, organizations, and professional environments.",
    points: ["Corporate workshops", "Mock interviews", "Guest lectures"],
  },
];

/* Explicit grid placement for the desktop layout */
const leftPlacement = [
  "col-start-1 row-start-1",
  "col-start-1 row-start-2",
  "col-start-1 row-start-3",
];
const rightPlacement = [
  "col-start-3 row-start-1",
  "col-start-3 row-start-2",
  "col-start-3 row-start-3",
];

/* ========================================================
   MAIN SECTION
======================================================== */

function JashnaMethod() {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const reduceMotion = useReducedMotion();

  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3, 6);

  /* AUTO PREVIEW */
  useEffect(() => {
    if (reduceMotion || !isAutoPlaying) return;

    const timer = setInterval(() => {
      setActiveFeature((current) => {
        const currentIndex = features.findIndex((f) => f.id === current.id);
        return features[(currentIndex + 1) % features.length];
      });
    }, 5200);

    return () => clearInterval(timer);
  }, [isAutoPlaying, reduceMotion]);

  const selectFeature = (feature) => {
    setActiveFeature(feature);
    setIsAutoPlaying(false);
  };

  return (
    <section
      id="method"
      className="
        relative overflow-hidden
        bg-gradient-to-br from-[#1B6AA5] via-[#2380C0] to-[#3A98D6]
        px-4 py-18
        text-white
        sm:px-8 sm:py-22
        xl:px-12 xl:py-20
        2xl:px-16
      "
    >
      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute -left-52 top-[10%] h-[34rem] w-[34rem] rounded-full bg-white/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-52 bottom-[5%] h-[38rem] w-[38rem] rounded-full bg-[#9BE8F7]/25 blur-[120px]" />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.06, 1], opacity: [0.25, 0.45, 0.25] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-[52%] h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[110px]"
      />

      {/* subtle grid */}
      <div
        className="
          pointer-events-none absolute inset-0
          opacity-[0.07]
          [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
          [background-size:72px_72px]
        "
      />

      {/* wide container: uses most of the screen width */}
      <div className="relative mx-auto w-full max-w-[1800px]">
        {/* ================= HEADER ================= */}

        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/15 px-5 py-2 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#BDF2FF]" />
            <span className="text-xs font-extrabold uppercase tracking-[0.28em] text-white sm:text-sm">
              Why Jashna Edu
            </span>
            <span className="h-2 w-2 rounded-full bg-white" />
          </div>

          <h2 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl 2xl:text-8xl">
            A method built{" "}
            <span className="relative inline-block text-[#b4f1ff]">
              around you.
              <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-white/50" />
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-4xl text-lg font-medium leading-8 text-white/90 sm:text-xl sm:leading-9 2xl:text-2xl 2xl:leading-10">
            From understanding where you stand to applying what you learn in
            real situations, every part of the Jashna experience is designed to
            move communication from knowledge to confidence.
          </p>

          {/* status + autoplay */}
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex items-center gap-3 rounded-full border border-white/30 bg-white/15 px-5 py-3 backdrop-blur-xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                Exploring
              </span>
              <span className="font-display text-lg font-extrabold text-white">
                {activeFeature.number}
              </span>
              <span className="text-white/50">/</span>
              <span className="text-base font-medium text-white/85">
                06 principles
              </span>
            </div>
            {/** Auto Preview Button
            <button
              type="button"
              onClick={() => setIsAutoPlaying((value) => !value)}
              className="flex items-center gap-2.5 rounded-full border border-white/40 bg-white px-5 py-3 text-sm font-bold text-[#14527F] shadow-lg shadow-[#0F3F66]/20 transition-all hover:-translate-y-0.5"
              aria-label={
                isAutoPlaying
                  ? "Pause automatic feature preview"
                  : "Start automatic feature preview"
              }
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isAutoPlaying ? "animate-pulse bg-[#1E73B0]" : "bg-slate-400"
                }`}
              />
              {isAutoPlaying ? "Auto preview on" : "Auto preview paused"}
            </button>
            */}
          </div>
        </div>

        {/* ================= INTERACTIVE EXPERIENCE ================= */}

        <div className="mt-16 sm:mt-20">
          {/* ---------- DESKTOP (xl and up) ---------- */}
          <div
            className="
              hidden items-stretch
              xl:grid
              xl:grid-cols-[minmax(0,1fr)_24rem_minmax(0,1fr)]
              xl:grid-rows-3
              xl:gap-x-8 xl:gap-y-6
              2xl:grid-cols-[minmax(0,1fr)_27rem_minmax(0,1fr)]
              2xl:gap-x-14 2xl:gap-y-8
            "
          >
            {leftFeatures.map((feature, i) => (
              <FeatureCallout
                key={feature.id}
                feature={feature}
                activeFeature={activeFeature}
                onSelect={selectFeature}
                side="left"
                placement={leftPlacement[i]}
              />
            ))}

            <div className="col-start-2 row-span-3 row-start-1 flex items-center justify-center">
              <PhoneMockup feature={activeFeature} reduceMotion={reduceMotion} />
            </div>

            {rightFeatures.map((feature, i) => (
              <FeatureCallout
                key={feature.id}
                feature={feature}
                activeFeature={activeFeature}
                onSelect={selectFeature}
                side="right"
                placement={rightPlacement[i]}
              />
            ))}
          </div>

          {/* ---------- TABLET / MOBILE ---------- */}
          <div className="xl:hidden">
            <div className="mb-14 flex justify-center sm:mb-16">
              <PhoneMockup feature={activeFeature} reduceMotion={reduceMotion} />
            </div>

            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#CFF6FF]">
                  The six principles
                </p>
                <h3 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
                  Explore the method
                </h3>
              </div>
              <span className="text-base font-medium text-white/80">
                Tap a principle to preview it
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {features.map((feature) => (
                <FeatureCallout
                  key={feature.id}
                  feature={feature}
                  activeFeature={activeFeature}
                  onSelect={selectFeature}
                  side="mobile"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ================= STEP INDICATOR ================= */}

        <div className="mx-auto mt-14 max-w-5xl sm:mt-16">
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {features.map((feature) => {
              const isActive = activeFeature.id === feature.id;

              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => selectFeature(feature)}
                  aria-label={`View ${feature.title}`}
                  className="group text-left"
                >
                  <span className="relative block h-2 overflow-hidden rounded-full bg-white/25">
                    <motion.span
                      animate={{ width: isActive ? "100%" : "0%" }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                    />
                  </span>

                  <span
                    className={`mt-2 hidden text-sm font-bold transition-colors md:block ${
                      isActive
                        ? "text-white"
                        : "text-white/60 group-hover:text-white/90"
                    }`}
                  >
                    {feature.number} · {feature.screenLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM STATEMENT ================= */}

        <motion.div
          whileHover={reduceMotion ? undefined : { y: -3 }}
          className="mx-auto mt-12 max-w-5xl rounded-[2rem] bg-white px-6 py-7 text-center shadow-[0_24px_60px_rgba(10,60,100,0.28)] sm:px-10 sm:py-8"
        >
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1E73B0]/10">
              <Sparkles size={22} className="text-[#1E73B0]" />
            </div>

            <p className="text-lg leading-7 text-slate-600 sm:text-xl 2xl:text-2xl">
              Not just learning English.
              <span className="ml-1.5 font-extrabold text-[#14527F]">
                Building the confidence to use it.
              </span>
            </p>

            <ChevronRight size={24} className="hidden text-[#1E73B0] sm:block" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ========================================================
   FEATURE CALLOUT
======================================================== */

function FeatureCallout({
  feature,
  activeFeature,
  onSelect,
  side,
  placement = "",
}) {
  const Icon = feature.icon;
  const isActive = activeFeature.id === feature.id;
  const isMobile = side === "mobile";
  const layoutKey = isMobile ? "m" : "d";

  return (
    <div
      className={`flex items-stretch ${
        side === "right" ? "flex-row-reverse" : ""
      } ${placement}`}
    >
      {/* ---------- CARD ---------- */}
      <motion.button
        type="button"
        onMouseEnter={() => {
          if (!isMobile) onSelect(feature);
        }}
        onFocus={() => onSelect(feature)}
        onClick={() => onSelect(feature)}
        whileHover={{ y: isMobile ? -2 : -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`
          group relative min-w-0 flex-1
          overflow-hidden rounded-[1.75rem] border-2
          p-6 text-left
          transition-all duration-300
          xl:p-7
          ${
            isActive
              ? "border-white bg-white shadow-[0_24px_60px_rgba(10,60,100,0.35)]"
              : "border-white/30 bg-white/15 backdrop-blur-md hover:border-white/60 hover:bg-white/25"
          }
        `}
      >
        {/* active accent bar */}
        {isActive && (
          <motion.span
            layoutId={`active-feature-bar-${layoutKey}`}
            className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#1E73B0] to-[#62C9DF]"
          />
        )}

        {/* top row: icon + number/short title + arrow */}
        <div className="relative flex items-center gap-4">
          <div
            className={`
              flex h-14 w-14 shrink-0 items-center justify-center
              rounded-2xl transition-all duration-300 xl:h-16 xl:w-16
              ${
                isActive
                  ? "bg-gradient-to-br from-[#1E73B0] to-[#2E8FCF] text-white shadow-lg shadow-[#1E73B0]/30"
                  : "bg-white/20 text-white"
              }
            `}
          >
            <Icon size={26} strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <span
              className={`block text-sm font-extrabold tracking-[0.2em] ${
                isActive ? "text-[#1E73B0]" : "text-white/75"
              }`}
            >
              {feature.number}
            </span>
            <p
              className={`mt-0.5 text-sm font-bold uppercase tracking-[0.1em] sm:text-[15px] ${
                isActive ? "text-[#1E73B0]" : "text-[#CFF6FF]"
              }`}
            >
              {feature.shortTitle}
            </p>
          </div>

          <ArrowUpRight
            size={22}
            className={`shrink-0 transition-all duration-300 ${
              isActive
                ? "text-[#1E73B0]"
                : "text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
            }`}
          />
        </div>

        {/* title */}
        <h3
          className={`mt-5 font-display text-2xl font-extrabold leading-tight xl:text-[1.6rem] 2xl:text-[1.9rem] ${
            isActive ? "text-[#0F4C7A]" : "text-white"
          }`}
        >
          {feature.title}
        </h3>

        {/* description (always visible, so cards never jump in height) */}
        <p
          className={`mt-3 text-base font-medium leading-7 2xl:text-lg 2xl:leading-8 ${
            isActive ? "text-slate-600" : "text-white/90"
          }`}
        >
          {feature.description}
        </p>

        {isMobile && isActive && (
          <div className="mt-5 flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em] text-[#1E73B0]">
            <span className="h-2 w-2 rounded-full bg-[#1E73B0]" />
            Currently exploring
          </div>
        )}
      </motion.button>

      {/* ---------- CONNECTING LINE ---------- */}
      {!isMobile && (
        <div
          className={`
            relative my-auto h-0.5 w-8 shrink-0
            transition-all duration-500
            2xl:w-16
            ${side === "left" ? "ml-2" : "mr-2"}
            ${
              isActive
                ? "bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)]"
                : "bg-white/35"
            }
          `}
        >
          <motion.span
            animate={{
              scale: isActive ? [1, 1.4, 1] : 1,
              opacity: isActive ? 1 : 0.6,
            }}
            transition={{ duration: 1.8, repeat: isActive ? Infinity : 0 }}
            className={`
              absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full
              ${side === "left" ? "right-0" : "left-0"}
              ${
                isActive
                  ? "bg-white shadow-[0_0_14px_rgba(255,255,255,1)]"
                  : "bg-white/60"
              }
            `}
          />
        </div>
      )}
    </div>
  );
}

/* ========================================================
   PHONE MOCKUP
======================================================== */

function PhoneMockup({ feature, reduceMotion }) {
  const Icon = feature.icon;

  return (
    <div className="relative">
      {/* ambient glow */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.07, 1], opacity: [0.35, 0.6, 0.35] }
        }
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-[80px] sm:h-[32rem] sm:w-[32rem]"
      />

      {/* decorative rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 sm:h-[36rem] sm:w-[36rem]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[23rem] w-[23rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 sm:h-[30rem] sm:w-[30rem]" />

      {/* shadow */}
      <div className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-56 -translate-x-1/2 rounded-full bg-[#0F3F66]/40 blur-2xl" />

      {/* phone body */}
      <motion.div
        whileHover={reduceMotion ? undefined : { y: -7, rotate: -0.4 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="
          relative z-10
          h-[41rem] w-[20rem]
          rounded-[2.8rem]
          border-2 border-white/70
          bg-gradient-to-b from-[#14527F] to-[#0F4670]
          p-2.5
          shadow-[0_35px_90px_rgba(10,50,90,0.45)]
          sm:h-[44rem] sm:w-[22rem]
          sm:rounded-[3rem]
          xl:h-[46rem]
        "
      >
        {/* side button */}
        <div className="absolute -right-1.5 top-28 h-16 w-1.5 rounded-r-full bg-white/60" />

        {/* dynamic island */}
        <div className="absolute left-1/2 top-4 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-[#0B3557]" />

        {/* screen */}
        <div className="relative h-full overflow-hidden rounded-[2.35rem] bg-jashna-ivory text-jashna-charcoal sm:rounded-[2.5rem]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#62C9DF]/25 blur-3xl" />

          <div className="relative px-5 pb-6 pt-14 sm:px-6">
            {/* header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1E73B0]">
                  Jashna Education
                </p>
                <p className="mt-1 text-sm font-medium text-jashna-muted">
                  The Jashna Experience
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E73B0]/10 text-[#1E73B0]">
                <Sparkles size={17} />
              </div>
            </div>

            {/* dynamic screen */}
            <AnimatePresence mode="wait">
              <motion.div
                key={feature.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E73B0]/10 text-[#1E73B0]">
                    <Icon size={19} strokeWidth={1.9} />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-jashna-muted">
                      {feature.number} / 06
                    </p>
                    <p className="text-sm font-bold text-[#1E73B0]">
                      {feature.screenLabel}
                    </p>
                  </div>
                </div>

                {/* main card */}
                <div className="mt-4 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#1B6AA5] to-[#2E8FCF] p-5 text-white shadow-xl shadow-[#1E73B0]/25">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#CFF6FF]">
                    {feature.screenAccent}
                  </p>

                  <h3 className="mt-2.5 font-display text-[1.75rem] font-extrabold leading-[1.08]">
                    {feature.screenTitle}
                  </h3>

                  <p className="mt-3 text-sm font-medium leading-5 text-white/90">
                    {feature.screenDescription}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${65 + Number(feature.number) * 5}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs font-semibold text-white/90">
                    <span>Jashna pathway</span>
                    <span>{feature.number}/06</span>
                  </div>
                </div>

                {/* points */}
                <div className="mt-4 space-y-2">
                  {feature.points.map((point, index) => (
                    <motion.div
                      key={point}
                      initial={
                        reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className="flex items-center gap-3 rounded-2xl border border-[#1E73B0]/15 bg-white px-3.5 py-2.5 shadow-sm"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E73B0]/15">
                        <Check size={13} className="text-[#1E73B0]" />
                      </div>

                      <span className="text-[13px] font-bold text-jashna-charcoal">
                        {point}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* bottom */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-jashna-muted">
                    Jashna Education
                  </span>

                  <span className="flex items-center gap-1 text-xs font-extrabold text-[#1E73B0]">
                    Explore
                    <ArrowUpRight size={13} />
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default JashnaMethod;