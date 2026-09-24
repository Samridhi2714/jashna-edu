import { useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  GraduationCap,
  Presentation,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
    screenTitle: "Cambridge-certified",
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
    screenTitle: "Know where you stand",
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
    screenTitle: "Built around you",
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
    screenTitle: "Practice what matters",
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
    screenTitle: "Learn from an expert",
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
    screenTitle: "Beyond the classroom",
    screenAccent: "Institutions & organizations",
    screenDescription:
      "Communication development extends into universities, institutions, organizations, and professional environments.",
    points: ["Corporate workshops", "Mock interviews", "Guest lectures"],
  },
];

function JashnaMethod() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3, 6);

  return (
    <section
      id="method"
      className="
        relative overflow-hidden
        bg-jashna-navy
        px-6 py-24
        text-white
        lg:px-10
      "
    >
      {/* Background glow */}
      <div
        className="
          pointer-events-none absolute
          -left-48 top-1/4
          h-[28rem] w-[28rem]
          rounded-full
          bg-jashna-maroon/20
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none absolute
          -right-48 bottom-10
          h-[28rem] w-[28rem]
          rounded-full
          bg-jashna-gold/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          h-[32rem] w-[32rem]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-jashna-maroon/10
          blur-[100px]
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ------------------------------------------------
            SECTION HEADER
        ------------------------------------------------ */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-jashna-gold" />

            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-jashna-gold">
              Why Jashna Edu
            </span>

            <span className="h-px w-8 bg-jashna-gold" />
          </div>

          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            The Jashna
            <span className="text-jashna-gold"> advantage.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            A complete communication transformation designed around personalized
            learning, practical application, and real-world impact.
          </p>
        </div>

        {/* ------------------------------------------------
            INTERACTIVE EXPERIENCE
        ------------------------------------------------ */}
        <div className="mt-16">
          {/* DESKTOP */}
          <div
            className="
              hidden
              items-center
              lg:grid
              lg:grid-cols-[minmax(0,1fr)_18rem_minmax(0,1fr)]
              lg:grid-rows-3
              lg:gap-x-8
              lg:gap-y-7
            "
          >
            {/* LEFT 01 */}
            <FeatureCallout
              feature={leftFeatures[0]}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
              side="left"
            />

            {/* PHONE */}
            <div className="row-span-3 flex justify-center">
              <PhoneMockup feature={activeFeature} />
            </div>

            {/* RIGHT 04 */}
            <FeatureCallout
              feature={rightFeatures[0]}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
              side="right"
            />

            {/* LEFT 02 */}
            <FeatureCallout
              feature={leftFeatures[1]}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
              side="left"
            />

            {/* RIGHT 05 */}
            <FeatureCallout
              feature={rightFeatures[1]}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
              side="right"
            />

            {/* LEFT 03 */}
            <FeatureCallout
              feature={leftFeatures[2]}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
              side="left"
            />

            {/* RIGHT 06 */}
            <FeatureCallout
              feature={rightFeatures[2]}
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
              side="right"
            />
          </div>

          {/* MOBILE / TABLET */}
          <div className="lg:hidden">
            <div className="mb-14 flex justify-center">
              <PhoneMockup feature={activeFeature} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <FeatureCallout
                  key={feature.id}
                  feature={feature}
                  activeFeature={activeFeature}
                  setActiveFeature={setActiveFeature}
                  side="mobile"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------
            BOTTOM STATEMENT
        ------------------------------------------------ */}
        <div
          className="
            mx-auto mt-16
            max-w-4xl
            rounded-3xl
            border border-white/10
            bg-white/[0.04]
            px-6 py-5
            text-center
            backdrop-blur-xl
            sm:px-8
          "
        >
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Sparkles size={18} className="text-jashna-gold" />

            <p className="text-sm text-white/60">
              Not just learning English.
              <span className="ml-1 font-medium text-white">
                Building the confidence to use it.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================
   FEATURE CALLOUT
======================================================== */

function FeatureCallout({ feature, activeFeature, setActiveFeature, side }) {
  const Icon = feature.icon;
  const isActive = activeFeature.id === feature.id;

  return (
    <div
      className={`
        flex items-center
        ${side === "right" ? "flex-row-reverse" : ""}
        ${side === "mobile" ? "block" : ""}
      `}
    >
      <motion.button
        type="button"
        onMouseEnter={() => setActiveFeature(feature)}
        onFocus={() => setActiveFeature(feature)}
        onClick={() => setActiveFeature(feature)}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className={`
          group relative w-full
          rounded-3xl
          border
          p-5
          text-left
          transition-all duration-300
          ${
            isActive
              ? "border-jashna-gold/50 bg-white/[0.09] shadow-xl shadow-jashna-gold/5"
              : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
          }
        `}
      >
        {/* Active glow */}
        {isActive && (
          <motion.div
            layoutId="active-feature-glow"
            className="
              pointer-events-none absolute inset-0
              rounded-3xl
              bg-jashna-gold/[0.025]
            "
          />
        )}

        <div className="relative flex gap-4">
          {/* Icon */}
          <div
            className={`
              flex h-12 w-12 shrink-0 items-center justify-center
              rounded-2xl
              border
              transition-all duration-300
              ${
                isActive
                  ? "border-jashna-gold/40 bg-jashna-gold/10 text-jashna-gold"
                  : "border-white/10 bg-white/[0.04] text-white/50"
              }
            `}
          >
            <Icon size={21} strokeWidth={1.7} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <span
                className={`
                  text-[10px] font-semibold tracking-[0.2em]
                  ${isActive ? "text-jashna-gold" : "text-white/25"}
                `}
              >
                {feature.number}
              </span>

              <ArrowUpRight
                size={16}
                className={`
                  shrink-0
                  transition-all duration-300
                  ${
                    isActive
                      ? "text-jashna-gold opacity-100"
                      : "translate-x-1 translate-y-1 text-white/20 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                  }
                `}
              />
            </div>

            <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-white">
              {feature.title}
            </h3>

            <p
              className={`
                mt-2 text-xs leading-5
                ${isActive ? "text-white/55" : "text-white/35"}
              `}
            >
              {feature.shortTitle}
            </p>

            {isActive && side !== "mobile" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 text-xs leading-5 text-white/45"
              >
                {feature.description}
              </motion.p>
            )}
          </div>
        </div>
      </motion.button>

      {/* CONNECTING LINE */}
      {side !== "mobile" && (
        <div
          className={`
            relative h-px
            w-12 shrink-0
            transition-all duration-500
            ${side === "left" ? "ml-3" : "mr-3"}
            ${
              isActive
                ? "bg-jashna-gold shadow-[0_0_14px_rgba(218,174,88,0.9)]"
                : "bg-white/15"
            }
          `}
        >
          {/* Glowing node */}
          <motion.span
            animate={{
              scale: isActive ? [1, 1.35, 1] : 1,
              opacity: isActive ? 1 : 0.4,
            }}
            transition={{
              duration: 1.8,
              repeat: isActive ? Infinity : 0,
            }}
            className={`
              absolute top-1/2
              h-2.5 w-2.5
              -translate-y-1/2
              rounded-full
              ${side === "left" ? "right-0" : "left-0"}
              ${
                isActive
                  ? "bg-jashna-gold shadow-[0_0_12px_rgba(218,174,88,1)]"
                  : "bg-white/30"
              }
            `}
          />
        </div>
      )}
    </div>
  );
}

/* ========================================================
   PHONE
======================================================== */

function PhoneMockup({ feature }) {
  const Icon = feature.icon;

  return (
    <div className="relative">
      {/* Ambient glow */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.75, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          h-80 w-80
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-jashna-gold/10
          blur-3xl
        "
      />

      {/* Phone shadow */}
      <div
        className="
          pointer-events-none absolute
          left-1/2 bottom-[-18px]
          h-8 w-52
          -translate-x-1/2
          rounded-full
          bg-black/50
          blur-xl
        "
      />

      {/* PHONE BODY */}
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4 }}
        className="
          relative z-10
          h-140 w-70
          rounded-[2.5rem]
          border
          border-jashna-gold/40
          bg-[#111827]
          p-2.5
          shadow-2xl
          shadow-black/50
        "
      >
        {/* Outer highlight */}
        <div
          className="
            pointer-events-none absolute inset-0
            rounded-[2.5rem]
            border border-white/10
          "
        />

        {/* Side button */}
        <div
          className="
            absolute -right-1 top-28
            h-14 w-1
            rounded-r-full
            bg-white/20
          "
        />

        {/* Dynamic island */}
        <div
          className="
            absolute left-1/2 top-4 z-30
            h-6 w-24
            -translate-x-1/2
            rounded-full
            bg-black
          "
        />

        {/* SCREEN */}
        <div
          className="
            relative h-full
            overflow-hidden
            rounded-[2rem]
            bg-jashna-ivory
            text-jashna-charcoal
          "
        >
          {/* Screen decorative gradient */}
          <div
            className="
              pointer-events-none absolute
              -right-20 -top-20
              h-48 w-48
              rounded-full
              bg-jashna-maroon/10
              blur-3xl
            "
          />

          <div className="relative px-5 pb-6 pt-14">
            {/* Phone header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-jashna-maroon">
                  Jashna Education
                </p>

                <p className="mt-1 text-[10px] text-jashna-muted">
                  The Jashna Experience
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-jashna-maroon text-white">
                <Sparkles size={14} />
              </div>
            </div>

            {/* Dynamic content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={feature.id}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -18,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="mt-7"
              >
                {/* Feature number */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-jashna-maroon/10 text-jashna-maroon">
                    <Icon size={16} strokeWidth={1.8} />
                  </div>

                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-jashna-muted">
                      {feature.number} / 06
                    </p>

                    <p className="text-[10px] font-medium text-jashna-maroon">
                      {feature.screenLabel}
                    </p>
                  </div>
                </div>

                {/* Main screen card */}
                <div className="mt-5 overflow-hidden rounded-3xl bg-jashna-navy p-5 text-white">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.17em] text-jashna-gold">
                    {feature.screenAccent}
                  </p>

                  <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">
                    {feature.screenTitle}
                  </h3>

                  <p className="mt-3 text-[10px] leading-5 text-white/55">
                    {feature.screenDescription}
                  </p>

                  {/* Progress line */}
                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{
                        duration: 0.8,
                        delay: 0.15,
                      }}
                      className="h-full rounded-full bg-jashna-gold"
                    />
                  </div>
                </div>

                {/* Feature points */}
                <div className="mt-5 space-y-2.5">
                  {feature.points.map((point, index) => (
                    <motion.div
                      key={point}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.08,
                      }}
                      className="
                        flex items-center gap-3
                        rounded-2xl
                        border border-jashna-charcoal/10
                        bg-white
                        px-3 py-3
                      "
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-jashna-gold">
                        <Check size={11} className="text-jashna-navy" />
                      </div>

                      <span className="text-[9px] font-medium text-jashna-charcoal">
                        {point}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[9px] text-jashna-muted">
                    Jashna Education
                  </span>

                  <span className="flex items-center gap-1 text-[9px] font-semibold text-jashna-maroon">
                    Explore
                    <ArrowUpRight size={11} />
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
