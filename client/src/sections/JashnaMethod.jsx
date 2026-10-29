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
  const [isDesktop, setIsDesktop] = useState(false);
  const reduceMotion = useReducedMotion();

  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3, 6);

  /* Track desktop (xl = 1280px). Auto preview runs ONLY on desktop;
     on tablets / phones the user explores by tapping. */
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  /* AUTO PREVIEW (desktop only) */
  useEffect(() => {
    if (reduceMotion || !isAutoPlaying || !isDesktop) return;

    const timer = setInterval(() => {
      setActiveFeature((current) => {
        const currentIndex = features.findIndex((f) => f.id === current.id);
        return features[(currentIndex + 1) % features.length];
      });
    }, 5200);

    return () => clearInterval(timer);
  }, [isAutoPlaying, reduceMotion, isDesktop]);

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
        px-4 py-14
        text-white
        sm:px-8 sm:py-20
        xl:px-12 xl:py-18
        2xl:px-15
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
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 backdrop-blur sm:mb-6 sm:gap-3 sm:px-5">
            <span className="h-2 w-2 rounded-full bg-[#BDF2FF]" />
            <span className="text-xs font-extrabold uppercase tracking-[0.24em] text-white sm:text-sm sm:tracking-[0.28em]">
              Why Jashna Edu
            </span>
            <span className="h-2 w-2 rounded-full bg-white" />
          </div>

          <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl sm:leading-[1.02] lg:text-7xl 2xl:text-8xl">
            A method built{" "}
            <span className="relative inline-block text-[#b4f1ff]">
              around you.
              <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-white/50" />
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-4xl text-base font-medium leading-7 text-white/90 sm:mt-8 sm:text-xl sm:leading-9 2xl:text-2xl 2xl:leading-10">
            From understanding where you stand to applying what you learn in
            real situations, every part of the Jashna experience is designed to
            move communication from knowledge to confidence.
          </p>

          {/* status + autoplay */}
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:mt-9 sm:flex-row">
            <div className="flex items-center gap-3 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 backdrop-blur-xl sm:py-3">
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

        <div className="mt-10 sm:mt-20">
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
            {/* phones: compact app-screen preview with tab strip */}
            <div className="md:hidden">
              <MobilePreview
                feature={activeFeature}
                onSelect={selectFeature}
                reduceMotion={reduceMotion}
              />
            </div>

            {/* tablets: the full phone mockup */}
            <div className="mb-16 hidden justify-center md:flex">
              <PhoneMockup feature={activeFeature} reduceMotion={reduceMotion} />
            </div>

            <div className="mb-4 mt-9 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between md:mt-0 md:mb-6">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#CFF6FF]">
                  The six principles
                </p>
                <h3 className="mt-1 font-display text-2xl font-extrabold sm:text-4xl">
                  Explore the method
                </h3>
              </div>
              <span className="text-sm font-medium text-white/80 sm:text-base">
                Tap a principle to preview it
              </span>
            </div>

            <div className="grid items-start gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
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

        {/* ================= STEP INDICATOR (tablet + desktop) ================= */}

        <div className="mx-auto mt-14 hidden max-w-5xl md:block sm:mt-16">
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
          className="mx-auto mt-10 max-w-5xl rounded-[1.75rem] bg-white px-5 py-6 text-center shadow-[0_24px_60px_rgba(10,60,100,0.28)] sm:mt-12 sm:rounded-[2rem] sm:px-10 sm:py-8"
        >
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
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
   Desktop: unchanged.
   Mobile: compact accordion — every card shows icon + number
   + title; only the ACTIVE card opens its description.
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
        aria-expanded={isMobile ? isActive : undefined}
        className={`
          group relative min-w-0 flex-1
          overflow-hidden rounded-[1.5rem] border-2 sm:rounded-[1.75rem]
          p-4 text-left sm:p-5
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
        <div className="relative flex items-center gap-3 sm:gap-4">
          <div
            className={`
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-xl transition-all duration-300 sm:h-14 sm:w-14 sm:rounded-2xl xl:h-16 xl:w-16
              ${
                isActive
                  ? "bg-gradient-to-br from-[#1E73B0] to-[#2E8FCF] text-white shadow-lg shadow-[#1E73B0]/30"
                  : "bg-white/20 text-white"
              }
            `}
          >
            <Icon size={24} strokeWidth={1.8} />
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
              className={`mt-0.5 text-sm font-bold uppercase tracking-[0.08em] sm:text-[15px] sm:tracking-[0.1em] ${
                isActive ? "text-[#1E73B0]" : "text-[#CFF6FF]"
              }`}
            >
              {feature.shortTitle}
            </p>
          </div>

          <ArrowUpRight
            size={22}
            className={`shrink-0 transition-all duration-300 ${
              isMobile && isActive ? "rotate-90" : ""
            } ${
              isActive
                ? "text-[#1E73B0]"
                : "text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
            }`}
          />
        </div>

        {/* title */}
        <h3
          className={`mt-3 font-display text-xl font-extrabold leading-tight sm:mt-5 sm:text-2xl xl:text-[1.6rem] 2xl:text-[1.9rem] ${
            isActive ? "text-[#0F4C7A]" : "text-white"
          }`}
        >
          {feature.title}
        </h3>

        {/* description
            desktop: always visible (cards never jump in height)
            mobile : only the active card expands */}
        {isMobile ? (
          <AnimatePresence initial={false}>
            {isActive && (
              <motion.div
                key="desc"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="mt-2.5 text-base font-medium leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#1E73B0]">
                  <span className="h-2 w-2 rounded-full bg-[#1E73B0]" />
                  Currently exploring
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <p
            className={`mt-3 text-base font-medium leading-7 2xl:text-lg 2xl:leading-8 ${
              isActive ? "text-slate-600" : "text-white/90"
            }`}
          >
            {feature.description}
          </p>
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
   MOBILE PREVIEW  (phones only)
   A compact "app screen" in place of the tall phone mockup.
   It keeps the app-UI idea from desktop, but the 6 icon tabs
   on top make the six methods instantly clear and tappable.
======================================================== */

function MobilePreview({ feature, onSelect, reduceMotion }) {
  const Icon = feature.icon;

  return (
    <div className="relative mx-auto w-full max-w-[26rem]">
      {/* soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 blur-[70px]" />

      {/* device frame */}
      <div className="relative rounded-[2rem] border-2 border-white/70 bg-gradient-to-b from-[#14527F] to-[#0F4670] p-2 shadow-[0_28px_70px_rgba(10,50,90,0.45)]">
        <div className="relative overflow-hidden rounded-[1.6rem] bg-jashna-ivory text-jashna-charcoal">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#62C9DF]/25 blur-3xl" />

          <div className="relative px-4 pb-5 pt-4">
            {/* app header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1E73B0]">
                  Jashna Edu
                </p>
                <p className="mt-0.5 text-sm font-medium text-jashna-muted">
                  The Jashna Experience
                </p>
              </div>
            </div>

            {/* 6 tabs */}
            <div className="mt-4 grid grid-cols-6 gap-1.5">
              {features.map((item) => {
                const TabIcon = item.icon;
                const isActive = item.id === feature.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item)}
                    aria-label={`View ${item.title}`}
                    aria-pressed={isActive}
                    className={`flex h-11 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-[#1E73B0] to-[#2E8FCF] text-white shadow-md shadow-[#1E73B0]/30"
                        : "bg-[#1E73B0]/10 text-[#1E73B0] active:scale-95"
                    }`}
                  >
                    <TabIcon size={19} strokeWidth={1.9} />
                  </button>
                );
              })}
            </div>

            {/* dynamic content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={feature.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E73B0]/10 text-[#1E73B0]">
                    <Icon size={18} strokeWidth={1.9} />
                  </div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-jashna-muted">
                    {feature.number} / 06
                    <span className="ml-2 text-sm normal-case tracking-normal text-[#1E73B0]">
                      {feature.screenLabel}
                    </span>
                  </p>
                </div>

                {/* main card */}
                <div className="mt-3 overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-[#1B6AA5] to-[#2E8FCF] p-4 text-white shadow-xl shadow-[#1E73B0]/25">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#CFF6FF]">
                    {feature.screenAccent}
                  </p>

                  <h3 className="mt-2 font-display text-2xl font-extrabold leading-[1.1]">
                    {feature.screenTitle}
                  </h3>

                  <p className="mt-2.5 text-sm font-medium leading-5 text-white/90">
                    {feature.screenDescription}
                  </p>

                  <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-white/25">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${65 + Number(feature.number) * 5}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>
                </div>

                {/* points as chips (saves height) */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {feature.points.map((point, index) => (
                    <motion.span
                      key={point}
                      initial={
                        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.07 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#1E73B0]/15 bg-white px-3 py-1.5 text-[13px] font-bold text-jashna-charcoal shadow-sm"
                    >
                      <Check size={13} className="text-[#1E73B0]" />
                      {point}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm font-medium text-white/85">
        Tap an icon to explore each principle
      </p>
    </div>
  );
}

/* ========================================================
   PHONE MOCKUP  (tablet + desktop)
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
                  Jashna Edu
                </p>
                <p className="mt-1 text-sm font-medium text-jashna-muted">
                  The Jashna Experience
                </p>
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
                    Jashna Edu
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