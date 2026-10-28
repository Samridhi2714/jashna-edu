import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  Users,
  Mic2,
  BriefcaseBusiness,
  GraduationCap,
  Presentation,
  MessageCircle,
  Award,
  Trophy,
  Layers,
} from "lucide-react";

import eventImages from "../data/eventImages";
import { API_BASE } from "../config";
import eventsBg from "../assets/events/events-bg.webp";

const API_URL = `${API_BASE}/events`;

const YEARS = ["all", "2026", "2025", "2024", "2023"];

const FONT_FAMILY = "'Times New Roman', Times, serif";

/* Scoped font override so every element (including font-display) uses Times New Roman */
const FONT_CSS = `
  .events-root,
  .events-root * {
    font-family: ${FONT_FAMILY} !important;
  }
  .events-root .events-scroll::-webkit-scrollbar { display: none; }
  .events-root .events-scroll { scrollbar-width: none; }
`;

function formatEventDate(event) {
  if (!event?.date) return "";

  const date = new Date(event.date);

  if (event.datePrecision === "year") {
    return date.getUTCFullYear().toString();
  }

  if (event.datePrecision === "month") {
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getEventYear(event) {
  if (!event?.date) return "";

  return new Date(event.date).getUTCFullYear().toString();
}

function getImagesForEvent(event) {
  // 1. Future Cloudinary images — highest priority
  if (event?.images?.length) {
    return event.images;
  }

  // 2. Existing single image URL support
  if (event?.image) {
    return [event.image];
  }

  // 3. Existing historical local images
  if (event?.eventNumber && eventImages[event.eventNumber]) {
    return eventImages[event.eventNumber];
  }

  // 4. No image
  return [];
}

function getEventIcons(event) {
  const category = (event?.category || "").toLowerCase();
  const title = (event?.title || "").toLowerCase();

  if (category.includes("story") || title.includes("story")) {
    return [Mic2, Users, Award];
  }

  if (category.includes("career") || title.includes("career")) {
    return [BriefcaseBusiness, Target, GraduationCap];
  }

  if (category.includes("webinar")) {
    return [Presentation, Target, BookOpen];
  }

  if (category.includes("mock interview") || title.includes("interview")) {
    return [MessageCircle, BriefcaseBusiness, Users];
  }

  if (category.includes("training")) {
    return [BookOpen, GraduationCap, Users];
  }

  if (category.includes("session")) {
    return [BookOpen, Users, Target];
  }

  if (category.includes("workshop")) {
    return [BookOpen, MessageCircle, Users];
  }

  return [Sparkles, Users, Target];
}

function getEventMeta(event) {
  const category = event?.category || "Event";

  const lower = category.toLowerCase();

  let first = "Learning";
  let second = "Growth";
  let third = "Learners";

  if (lower.includes("mock interview") || lower.includes("interview")) {
    first = "Communication";
    second = "Career Readiness";
    third = "Students";
  } else if (lower.includes("career") || lower.includes("counselling")) {
    first = "Career Focus";
    second = "Guidance";
    third = "Students";
  } else if (lower.includes("story")) {
    first = "Public Speaking";
    second = "Storytelling";
    third = "Students";
  } else if (lower.includes("webinar")) {
    first = "Practical Skills";
    second = "Career Focus";
    third = "Learners";
  } else if (lower.includes("workshop")) {
    first = "Skill Building";
    second = "Confidence";
    third = "Learners";
  } else if (lower.includes("training")) {
    first = "Professional Skills";
    second = "Learning";
    third = "Participants";
  } else if (lower.includes("session")) {
    first = "Learning";
    second = "Personal Growth";
    third = "Students";
  }

  return [first, second, third];
}

/* ============================================================
   COUNT-UP NUMBER (used in the header stat chips)
   ============================================================ */

function CountUp({ to, duration = 1.3 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(to * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [to, duration]);

  return <>{value}</>;
}

/* ============================================================
   PAGE HEADER — Events & Experiences
   No maroon / navy / black on the heading.
   Colours used: teal → blue (matches Student Portal button)
   and gold → orange → coral for the highlighted words.
   ============================================================ */

function EventsHeader({ stats }) {
  return (
    <div className="relative z-20 max-w-[700px] md:max-w-[760px]">
      {/* SOFT DECORATIVE GLOWS BEHIND THE TEXT */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -left-16 -top-10 -z-10
          h-64 w-64 rounded-full
          bg-[#F6C768]/40 blur-3xl
        "
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-52 top-24 -z-10
          h-56 w-56 rounded-full
          bg-[#7DD3C8]/30 blur-3xl
        "
      />

      {/* EYEBROW PILL */}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="
          inline-flex items-center gap-2.5
          rounded-full
          border border-jashna-gold/60
          bg-white/70
          py-2 pl-3 pr-5
          shadow-[0_6px_20px_rgba(198,161,91,0.25)]
          backdrop-blur-md
        "
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#F6C768] to-[#E8742C] text-white shadow-md">
          <Sparkles size={14} strokeWidth={2.4} />
          <span className="absolute inset-0 animate-ping rounded-full bg-[#F6C768]/50" />
        </span>

        <span
          className="
            bg-gradient-to-r from-[#B7791F] to-[#E8742C]
            bg-clip-text
            text-[12px] font-bold uppercase
            tracking-[0.24em]
            text-transparent
            sm:text-[13px]
          "
        >
          Events &amp; Experiences
        </span>
      </motion.div>

      {/* HEADING */}

      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="
          mt-5
          text-[46px]
          font-bold
          leading-[1.05]
          tracking-[-0.02em]
          sm:text-[56px]
          md:text-[64px]
          lg:text-[76px]
        "
      >
        <span
          className="
            inline-block
            bg-gradient-to-r from-[#0F766E] via-[#0E8F8A] to-[#1D6FB8]
            bg-clip-text
            pb-1
            text-transparent
            drop-shadow-[0_2px_10px_rgba(255,255,255,0.6)]
          "
        >
          Where
        </span>{" "}
        <span className="relative inline-block px-1 pb-3">
          <span
            className="
              inline-block italic
              bg-gradient-to-r from-[#D99A1E] via-[#E8742C] to-[#E8505B]
              bg-clip-text
              pr-2
              text-transparent
              transition-transform duration-500
              hover:scale-[1.03]
            "
          >
            the journey
          </span>

          {/* HAND-DRAWN ANIMATED UNDERLINE */}

          <svg
            aria-hidden="true"
            viewBox="0 0 300 18"
            preserveAspectRatio="none"
            className="absolute -bottom-0 left-0 h-[14px] w-full sm:h-[18px]"
          >
            <defs>
              <linearGradient id="journey-underline" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#F6C768" />
                <stop offset="55%" stopColor="#E8742C" />
                <stop offset="100%" stopColor="#E8505B" />
              </linearGradient>
            </defs>

            <motion.path
              d="M4 11 C 60 2, 120 16, 180 7 S 270 4, 296 10"
              fill="none"
              stroke="url(#journey-underline)"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.7, ease: "easeInOut" }}
            />
          </svg>
        </span>
        <br />
        <span
          className="
            inline-block
            bg-gradient-to-r from-[#1D6FB8] via-[#0E8F8A] to-[#0F766E]
            bg-clip-text
            pb-1
            text-transparent
            drop-shadow-[0_2px_10px_rgba(255,255,255,0.6)]
          "
        >
          happened.
        </span>
      </motion.h1>

      {/* DESCRIPTION */}

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="
          mt-5
          max-w-[600px]
          border-l-[3px] border-jashna-gold
          pl-4
          text-[16px]
          font-bold
          leading-[1.7]
          text-jashna-charcoal/85
          sm:mt-6 sm:text-[17px]
          md:text-[19px]
        "
      >
        From engaging{" "}
        <span className="rounded-md bg-[#F6C768]/45 px-1.5 font-bold text-jashna-charcoal">
          competitions
        </span>{" "}
        to inspiring{" "}
        <span className="rounded-md bg-[#7DD3C8]/45 px-1.5 font-bold text-jashna-charcoal">
          sessions
        </span>
        , our events bring learning to life and help you showcase your skills,
        build confidence and grow.
      </motion.p>

      {/* STAT CHIPS */}

      {stats.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7"
        >
          {stats.map(({ Icon, value, suffix, label }, index) => (
            <motion.li
              key={label}
              whileHover={{ y: -4, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="
                group flex items-center gap-3
                rounded-2xl
                border border-white/70
                bg-white/75
                py-2.5 pl-2.5 pr-5
                shadow-[0_8px_24px_rgba(16,36,62,0.1)]
                backdrop-blur-md
                transition-shadow duration-300
                hover:shadow-[0_14px_30px_rgba(232,116,44,0.25)]
              "
            >
              <span
                className={`
                  flex h-10 w-10 items-center justify-center
                  rounded-xl text-white shadow-md
                  transition-transform duration-300
                  group-hover:rotate-[8deg]
                  ${
                    index === 0
                      ? "bg-gradient-to-br from-[#F6C768] to-[#E8742C]"
                      : index === 1
                        ? "bg-gradient-to-br from-[#0E8F8A] to-[#1D6FB8]"
                        : "bg-gradient-to-br from-[#E8742C] to-[#E8505B]"
                  }
                `}
              >
                <Icon size={19} strokeWidth={2.2} />
              </span>

              <span className="flex flex-col leading-none">
                <span className="text-[22px] font-bold text-jashna-charcoal sm:text-[24px]">
                  <CountUp to={value} />
                  {suffix}
                </span>
                <span className="mt-1 text-[11.5px] font-bold uppercase tracking-[0.1em] text-jashna-charcoal/60">
                  {label}
                </span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

/* ============================================================
   REUSABLE: DETAIL TILE (improved three-item list)
   ============================================================ */

function DetailTile({ Icon, label }) {
  return (
    <motion.li
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="
        group flex cursor-pointer flex-col items-center gap-2
        rounded-2xl
        border border-jashna-gold/25
        bg-gradient-to-b from-white to-jashna-stone/50
        px-2 py-2.5
        text-center
        shadow-[0_2px_8px_rgba(16,36,62,0.06)]
        transition-colors duration-300
        hover:border-jashna-maroon/50
        hover:from-white hover:to-jashna-maroon/[0.07]
        hover:shadow-[0_10px_22px_rgba(16,36,62,0.14)]
        sm:px-3 sm:py-2.5
      "
    >
      <span
        className="
          flex h-8 w-8 items-center justify-center
          rounded-full
          bg-jashna-navy
          text-white
          shadow-[0_4px_10px_rgba(16,36,62,0.25)]
          transition-all duration-300
          group-hover:bg-jashna-maroon
          group-hover:rotate-[8deg]
        "
      >
        <Icon size={16} strokeWidth={2.2} />
      </span>

      <span
        className="
          text-[11.5px] font-bold leading-4
          text-jashna-navy
          transition-colors duration-300
          group-hover:text-jashna-maroon
          sm:text-[12.5px]
        "
      >
        {label}
      </span>
    </motion.li>
  );
}

function EventCard({
  event,
  images,
  isCenter = false,
  position,
  imageIndex,
  setImageIndex,
}) {
  const [dragStartX, setDragStartX] = useState(null);

  const safeImages = images?.length ? images : [];

  const activeImage = safeImages[imageIndex] || safeImages[0] || "";

  const icons = getEventIcons(event);
  const meta = getEventMeta(event);

  const IconOne = icons[0];
  const IconTwo = icons[1];
  const IconThree = icons[2];

  const handleImageDragEnd = (_, info) => {
    if (!isCenter || safeImages.length < 2) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -50 || velocity < -500) {
      setImageIndex((current) => Math.min(current + 1, safeImages.length - 1));
    }

    if (offset > 50 || velocity > 500) {
      setImageIndex((current) => Math.max(current - 1, 0));
    }
  };

  const handleTouchStart = (event) => {
    if (!isCenter || safeImages.length < 2) return;

    setDragStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    if (!isCenter || safeImages.length < 2 || dragStartX === null) {
      return;
    }

    const endX = event.changedTouches[0].clientX;
    const difference = dragStartX - endX;

    if (difference > 45) {
      setImageIndex((current) => Math.min(current + 1, safeImages.length - 1));
    }

    if (difference < -45) {
      setImageIndex((current) => Math.max(current - 1, 0));
    }

    setDragStartX(null);
  };

  /* ============================================================
     SIDE CARDS — DESKTOP ONLY
     ============================================================ */

  if (!isCenter) {
    return (
      <motion.div
        className="absolute left-1/2 top-1/2 z-10 hidden min-[1182px]:block"
        initial={false}
        animate={
          position === "left"
            ? {
                x: "-50%",
                y: "-50%",
                marginLeft: "-440px",
                scale: 0.86,
                opacity: 0.72,
                rotateY: 3,
                rotateZ: -1.2,
              }
            : {
                x: "-50%",
                y: "-50%",
                marginLeft: "440px",
                scale: 0.86,
                opacity: 0.72,
                rotateY: -3,
                rotateZ: 1.2,
              }
        }
        whileHover={{
          scale: 0.89,
          opacity: 0.95,
          transition: { duration: 0.35, ease: "easeOut" },
        }}
        transition={{
          duration: 1.05,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          width: "330px",
          height: "390px",
          perspective: "1200px",
        }}
      >
        <div
          className="
            group relative h-full w-full overflow-hidden
            rounded-[28px]
            border border-jashna-gold/70
            bg-jashna-navy/90
            shadow-[0_0_22px_rgba(198,161,91,0.55),0_18px_45px_rgba(16,36,62,0.28)]
            transition-shadow duration-500
            hover:shadow-[0_0_34px_rgba(198,161,91,0.85),0_24px_55px_rgba(16,36,62,0.38)]
          "
        >
          <div className="absolute inset-0 z-10 bg-jashna-navy/45 transition-colors duration-500 group-hover:bg-jashna-navy/30" />

          <div className="absolute inset-0 z-20 bg-gradient-to-t from-jashna-navy via-jashna-navy/30 to-transparent" />

          {activeImage ? (
            <img
              src={activeImage}
              alt={event.title}
              className="h-full w-full object-cover blur-[1.5px] transition-all duration-700 group-hover:scale-105 group-hover:blur-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-jashna-navy text-lg font-semibold text-white/70">
              No image
            </div>
          )}

          <div className="absolute inset-x-5 bottom-5 z-30 text-left text-white">
            <div className="mb-3 inline-flex items-center rounded-full border border-jashna-gold/60 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur-md">
              {event.category || "Event"}
            </div>

            <div className="mb-2 flex w-fit items-center gap-1.5 rounded-full bg-jashna-navy/80 px-3 py-1.5 text-[12px] font-bold backdrop-blur-md">
              <CalendarDays size={13} />
              {formatEventDate(event)}
            </div>

            <h3 className="max-w-[285px] text-[26px] font-bold leading-[1.1]">
              {event.title}
            </h3>

            {event.location && (
              <div className="mt-2 flex items-start gap-1.5 text-[12.5px] font-semibold leading-4 text-white/85">
                <MapPin size={13} className="mt-0.5 shrink-0" />
                <span>{event.location}</span>
              </div>
            )}

            <p className="mt-3 line-clamp-3 text-[12.5px] leading-[18px] text-white/75">
              {event.description}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ============================================================
     MAIN / CENTRE CARD
     ============================================================ */

  return (
    <motion.div
      className="
        relative z-30
        w-full
      "
      initial={false}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.35, ease: "easeOut" },
      }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        maxWidth: "480px",
      }}
    >
      <div
        className="
          relative overflow-hidden
          rounded-[30px]
          border-2 border-jashna-gold
          bg-white
          shadow-[0_0_28px_rgba(198,161,91,0.55),0_25px_60px_rgba(16,36,62,0.28)]
          transition-shadow duration-500
          hover:shadow-[0_0_40px_rgba(198,161,91,0.8),0_32px_70px_rgba(16,36,62,0.36)]
          md:rounded-[30px]
        "
      >
        {/* GOLDEN INNER GLOW */}

        <div
          className="
            pointer-events-none
            absolute -inset-[1px] z-40
            rounded-[31px]
            shadow-[inset_0_0_20px_rgba(198,161,91,0.28)]
          "
        />

        {/* ======================================================
            IMAGE
            ====================================================== */}

        <motion.div
          className="
            group/image
            relative
            h-[390px]
            overflow-hidden
            bg-jashna-stone
            sm:h-[400px]
            md:h-[320px]
          "
          drag={safeImages.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleImageDragEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: safeImages.length > 1 ? "pan-y" : "auto",
            cursor: safeImages.length > 1 ? "grab" : "default",
          }}
          whileTap={safeImages.length > 1 ? { cursor: "grabbing" } : undefined}
        >
          <AnimatePresence mode="wait">
            {activeImage ? (
              <motion.img
                key={`${event._id}-${imageIndex}`}
                src={activeImage}
                alt={event.title}
                className="
                  absolute inset-0
                  h-full w-full
                  object-cover
                  transition-transform duration-[900ms] ease-out
                  group-hover/image:scale-[1.04]
                "
                initial={{
                  opacity: 0,
                  x: imageIndex > 0 ? 35 : -35,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: imageIndex > 0 ? -35 : 35,
                }}
                transition={{
                  duration: 0.42,
                  ease: "easeOut",
                }}
                draggable={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-jashna-stone text-lg font-semibold text-jashna-muted">
                No image available
              </div>
            )}
          </AnimatePresence>

          {/* SOFT BOTTOM SHADE FOR CONTROL VISIBILITY */}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-jashna-navy/55 to-transparent" />

          {/* FEATURED BADGE */}

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="
              absolute left-4 top-4 z-20
              inline-flex items-center gap-2
              rounded-full
              border border-jashna-gold/70
              bg-jashna-navy/90
              px-3.5 py-2
              text-[11px] font-bold
              uppercase tracking-[0.12em]
              text-white
              shadow-lg
              backdrop-blur-md
              sm:left-5 sm:top-5
              sm:px-4
            "
          >
            <Sparkles size={13} className="text-jashna-gold" />
            Featured Moment
          </motion.div>

          {/* ====================================================
              PHOTO NAVIGATION
              ==================================================== */}

          {safeImages.length > 1 && (
            <>
              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();

                  setImageIndex((current) => Math.max(current - 1, 0));
                }}
                disabled={imageIndex === 0}
                className="
                  absolute left-3 top-1/2 z-30
                  -translate-y-1/2
                  rounded-full
                  border border-white/40
                  bg-jashna-navy/75
                  p-2
                  text-white
                  shadow-lg
                  backdrop-blur-md
                  transition-colors duration-300
                  hover:border-jashna-gold
                  hover:bg-jashna-maroon
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jashna-gold
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                  sm:left-4 sm:p-2.5
                "
                aria-label="Previous photo"
              >
                <ArrowLeft size={17} strokeWidth={2.6} />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();

                  setImageIndex((current) =>
                    Math.min(current + 1, safeImages.length - 1),
                  );
                }}
                disabled={imageIndex === safeImages.length - 1}
                className="
                  absolute right-3 top-1/2 z-30
                  -translate-y-1/2
                  rounded-full
                  border border-white/40
                  bg-jashna-navy/75
                  p-2
                  text-white
                  shadow-lg
                  backdrop-blur-md
                  transition-colors duration-300
                  hover:border-jashna-gold
                  hover:bg-jashna-maroon
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jashna-gold
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                  sm:right-4 sm:p-2.5
                "
                aria-label="Next photo"
              >
                <ArrowRight size={17} strokeWidth={2.6} />
              </motion.button>

              {/* PHOTO DOTS */}

              <div
                className="
                  absolute bottom-4 left-1/2 z-30
                  flex -translate-x-1/2
                  items-center gap-2
                  rounded-full
                  bg-black/50
                  px-3.5 py-2
                  backdrop-blur-md
                "
              >
                {safeImages.map((_, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    whileHover={{ scale: 1.35 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setImageIndex(index)}
                    className={`
                      h-2 rounded-full
                      transition-all duration-300
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jashna-gold
                      ${
                        imageIndex === index
                          ? "w-8 bg-jashna-gold"
                          : "w-2 bg-white/60 hover:bg-white"
                      }
                    `}
                    aria-label={`View photo ${index + 1}`}
                  />
                ))}
              </div>

              {/* SWIPE LABEL */}

              <div
                className="
                  absolute bottom-4 right-3 z-30
                  hidden
                  rounded-full
                  bg-black/50
                  px-3 py-1.5
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-white
                  backdrop-blur-md
                  sm:block sm:right-4
                "
              >
                Swipe photos
              </div>
            </>
          )}
        </motion.div>

        {/* ======================================================
            INFORMATION PANEL
            ====================================================== */}

        <motion.div
          key={event._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="
            relative
            border-t-4 border-jashna-gold
            bg-gradient-to-b from-white to-jashna-ivory/60
            px-5 pb-6 pt-5
            sm:px-7 sm:pb-6 sm:pt-5
            md:px-7 md:pb-5 md:pt-4
          "
        >
          {/* CATEGORY */}

          <div
            className="
              mb-3 inline-flex items-center gap-2
              rounded-full
              border border-jashna-maroon/25
              bg-jashna-maroon/[0.07]
              px-3 py-1
              text-[11px] font-bold
              uppercase tracking-[0.16em]
              text-jashna-maroon
              sm:text-[12px]
            "
          >
            <span className="h-2 w-2 rounded-full bg-jashna-gold" />

            {event.category || "Event"}
          </div>

          {/* TITLE */}

          <h2
            className="
              text-[30px]
              font-bold
              leading-[1.1]
              tracking-[-0.01em]
              text-jashna-navy
              sm:text-[32px]
              md:text-[30px]
            "
          >
            {event.title}
          </h2>

          {/* DATE + LOCATION */}

          <div
            className="
              mt-4
              flex flex-wrap
              items-center
              gap-2.5
            "
          >
            <motion.div
              whileHover={{ y: -2 }}
              className="
                flex items-center gap-2
                rounded-full
                border border-jashna-navy/10
                bg-jashna-stone/60
                px-3.5 py-1.5
                text-[13px] font-bold
                text-jashna-navy
                transition-colors duration-300
                hover:border-jashna-maroon/40 hover:bg-jashna-maroon/[0.08]
                sm:text-[14px]
              "
            >
              <CalendarDays size={15} className="text-jashna-maroon" />

              <span>{formatEventDate(event)}</span>
            </motion.div>

            {event.location && (
              <motion.div
                whileHover={{ y: -2 }}
                className="
                  flex min-w-0 items-start gap-2
                  rounded-2xl
                  border border-jashna-navy/10
                  bg-jashna-stone/60
                  px-3.5 py-1.5
                  text-[13px] font-bold
                  leading-5
                  text-jashna-navy
                  transition-colors duration-300
                  hover:border-jashna-maroon/40 hover:bg-jashna-maroon/[0.08]
                  sm:text-[14px]
                "
              >
                <MapPin
                  size={15}
                  className="mt-0.5 shrink-0 text-jashna-maroon"
                />

                <span className="max-w-[280px] sm:max-w-[300px]">
                  {event.location}
                </span>
              </motion.div>
            )}
          </div>

          {/* DESCRIPTION */}

          <p
            className="
              mt-3
              text-[15px]
              leading-[1.6]
              text-jashna-charcoal/85
              sm:text-[15.5px]
            "
          >
            {event.description ||
              "A meaningful learning experience where participants came together to learn, interact and grow."}
          </p>

          {/* DIVIDER */}

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-jashna-gold to-jashna-gold/40" />
            <span className="h-2 w-2 rotate-45 bg-jashna-gold" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-jashna-gold to-jashna-gold/40" />
          </div>

          {/* THREE DETAIL TILES */}

          <ul className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <DetailTile Icon={IconOne} label={meta[0]} />
            <DetailTile Icon={IconTwo} label={meta[1]} />
            <DetailTile Icon={IconThree} label={meta[2]} />
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageIndexes, setImageIndexes] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();

        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load events right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedYear === "all") {
      return events;
    }

    return events.filter((event) => getEventYear(event) === selectedYear);
  }, [events, selectedYear]);

  /* Stats for the header chips — calculated from real API data */
  const headerStats = useMemo(() => {
    if (!events.length) return [];

    const years = new Set(events.map(getEventYear).filter(Boolean));
    const categories = new Set(
      events.map((event) => event.category).filter(Boolean),
    );

    return [
      { Icon: Trophy, value: events.length, suffix: "+", label: "Events Hosted" },
      { Icon: CalendarDays, value: years.size, label: "Years of Moments" },
      { Icon: Layers, value: categories.size, label: "Event Types" },
    ];
  }, [events]);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedYear]);

  const total = filteredEvents.length;

  const currentEvent = total > 0 ? filteredEvents[activeIndex] : null;

  const previousEvent =
    total > 0 ? filteredEvents[(activeIndex - 1 + total) % total] : null;

  const nextEvent =
    total > 0 ? filteredEvents[(activeIndex + 1) % total] : null;

  const currentImages = currentEvent ? getImagesForEvent(currentEvent) : [];

  const previousImages = previousEvent ? getImagesForEvent(previousEvent) : [];

  const nextImages = nextEvent ? getImagesForEvent(nextEvent) : [];

  const currentImageIndex = imageIndexes[currentEvent?._id] || 0;

  const setCurrentImageIndex = (value) => {
    if (!currentEvent?._id) return;

    setImageIndexes((previous) => ({
      ...previous,
      [currentEvent._id]:
        typeof value === "function"
          ? value(previous[currentEvent._id] || 0)
          : value,
    }));
  };

  const goNext = () => {
    if (!total) return;

    setActiveIndex((current) => (current === total - 1 ? 0 : current + 1));
  };

  const goPrevious = () => {
    if (!total) return;

    setActiveIndex((current) => (current === 0 ? total - 1 : current - 1));
  };

  return (
    <div
      className="
        events-root
        relative min-h-screen
        overflow-hidden
        bg-jashna-ivory
        text-jashna-charcoal
      "
      style={{ fontFamily: FONT_FAMILY }}
    >
      <style>{FONT_CSS}</style>

      {/* ========================================================
          BACKGROUND STAGE
          ======================================================== */}

      <div
        className="
          absolute inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: `url("${eventsBg}")`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-jashna-ivory/30 via-jashna-ivory/10 to-jashna-ivory/40" />

      {/* ========================================================
          CONTENT
          ======================================================== */}

      <section
        className="
          relative z-10
          mx-auto
          min-h-screen
          max-w-[1500px]
          px-5
          pb-12
          pt-24
          sm:px-8 sm:pb-16 sm:pt-28
          md:px-12 md:pt-32
          lg:px-14
        "
      >
        {/* ======================================================
            HEADER
            ====================================================== */}

        <EventsHeader stats={headerStats} />

        {/* ======================================================
            LOADING / ERROR / EMPTY
            ====================================================== */}

        {loading ? (
          <div
            className="
              relative
              mt-12
              flex
              h-[600px]
              items-center
              justify-center
              sm:mt-16 sm:h-[650px]
            "
          >
            <div
              className="
                h-12 w-12
                animate-spin
                rounded-full
                border-4
                border-jashna-maroon/20
                border-t-jashna-maroon
              "
            />
          </div>
        ) : error ? (
          <div
            className="
              relative
              mt-12
              flex
              h-[500px]
              items-center
              justify-center
              sm:mt-16
            "
          >
            <p
              className="
                rounded-full
                border border-jashna-maroon/30
                bg-white/90
                px-8 py-4
                text-base font-bold
                text-jashna-maroon
                shadow-lg
                backdrop-blur-md
              "
            >
              {error}
            </p>
          </div>
        ) : total === 0 ? (
          <div
            className="
              relative
              mt-12
              flex
              h-[500px]
              items-center
              justify-center
              sm:mt-16
            "
          >
            <p
              className="
                rounded-full
                border border-jashna-gold/40
                bg-white/90
                px-8 py-4
                text-base font-bold
                text-jashna-navy
                shadow-lg
                backdrop-blur-md
              "
            >
              No published events available yet.
            </p>
          </div>
        ) : (
          <>
            {/* ==================================================
                CAROUSEL AREA
                ================================================== */}

            <div
              className="
                relative mx-auto
                mt-14
                w-full
                max-w-[1120px]

                /* MOBILE:
                   Let the centre card determine the height.
                   This prevents the timeline from overlapping it. */
                h-auto
                pb-0

                sm:mt-16
                md:mt-14
              "
            >
              {/* ==================================================
                  LEFT CARD — DESKTOP
                  ================================================== */}

              {previousEvent && (
                <EventCard
                  event={previousEvent}
                  images={previousImages}
                  isCenter={false}
                  position="left"
                  imageIndex={imageIndexes[previousEvent._id] || 0}
                  setImageIndex={() => {}}
                />
              )}

              {/* ==================================================
                  RIGHT CARD — DESKTOP
                  ================================================== */}

              {nextEvent && (
                <EventCard
                  event={nextEvent}
                  images={nextImages}
                  isCenter={false}
                  position="right"
                  imageIndex={imageIndexes[nextEvent._id] || 0}
                  setImageIndex={() => {}}
                />
              )}

              {/* ==================================================
                  CENTRE CARD

                  MOBILE:
                  normal document flow

                  DESKTOP:
                  raised and centred on stage
                  ================================================== */}

              <div
                className="
                  relative
                  z-30
                  mx-auto
                  w-full

                  sm:w-[min(480px,calc(100%-40px))]

                  md:w-[480px] md:max-w-full
                "
              >
                <EventCard
                  event={currentEvent}
                  images={currentImages}
                  isCenter
                  position="center"
                  imageIndex={currentImageIndex}
                  setImageIndex={setCurrentImageIndex}
                />

                {/* ==================================================
                    MOBILE EVENT NAVIGATION

                    These are for changing EVENTS.
                    They are different from the photo arrows.
                    ================================================== */}

                {total > 1 && (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.88 }}
                      onClick={goPrevious}
                      className="
                        absolute
                        left-1
                        top-[195px]
                        z-50
                        flex
                        h-11 w-11
                        -translate-y-1/2
                        items-center justify-center
                        rounded-full
                        border-2
                        border-jashna-gold
                        bg-jashna-navy/90
                        text-white
                        shadow-[0_8px_24px_rgba(16,36,62,0.35)]
                        backdrop-blur-md
                        transition-colors
                        duration-300
                        hover:bg-jashna-maroon
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jashna-gold focus-visible:ring-offset-2

                        sm:left-1
                        sm:top-[210px]

                        md:hidden
                      "
                      aria-label="Previous event"
                    >
                      <ArrowLeft size={19} strokeWidth={2.6} />
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.88 }}
                      onClick={goNext}
                      className="
                        absolute
                        right-1
                        top-[195px]
                        z-50
                        flex
                        h-11 w-11
                        -translate-y-1/2
                        items-center justify-center
                        rounded-full
                        border-2
                        border-jashna-gold
                        bg-jashna-navy/90
                        text-white
                        shadow-[0_8px_24px_rgba(16,36,62,0.35)]
                        backdrop-blur-md
                        transition-colors
                        duration-300
                        hover:bg-jashna-maroon
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jashna-gold focus-visible:ring-offset-2

                        sm:right-1
                        sm:top-[210px]

                        md:hidden
                      "
                      aria-label="Next event"
                    >
                      <ArrowRight size={19} strokeWidth={2.6} />
                    </motion.button>
                  </>
                )}
              </div>

              {/* ==================================================
                  DESKTOP EVENT NAVIGATION
                  ================================================== */}

              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={goPrevious}
                className="
                    absolute
                    left-1
                    top-1/2
                    z-40
                    hidden md:flex
                    h-11 w-11
                    -translate-y-1/2
                    items-center justify-center
                    rounded-full
                    border-2 border-jashna-gold/70
                    bg-white/95
                    text-jashna-navy
                    shadow-[0_8px_25px_rgba(16,36,62,0.2)]
                    backdrop-blur-md
                    transition-colors duration-300
                    hover:border-jashna-maroon
                    hover:bg-jashna-maroon
                    hover:text-white
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jashna-gold focus-visible:ring-offset-2

                    min-[1182px]:left-[calc(50%-590px)]
                    min-[1182px]:h-14
                    min-[1182px]:w-14
                "
                aria-label="Previous event"
              >
                <ArrowLeft size={21} strokeWidth={2.6} />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={goNext}
                className="
                    absolute
                    right-1
                    top-1/2
                    z-40
                    hidden md:flex
                    h-11 w-11
                    -translate-y-1/2
                    items-center justify-center
                    rounded-full
                    border-2 border-jashna-gold/70
                    bg-white/95
                    text-jashna-navy
                    shadow-[0_8px_25px_rgba(16,36,62,0.2)]
                    backdrop-blur-md
                    transition-colors duration-300
                    hover:border-jashna-maroon
                    hover:bg-jashna-maroon
                    hover:text-white
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jashna-gold focus-visible:ring-offset-2

                    min-[1182px]:right-[calc(50%-590px)]
                    min-[1182px]:h-14
                    min-[1182px]:w-14
                "
                aria-label="Next event"
              >
                <ArrowRight size={21} strokeWidth={2.6} />
              </motion.button>
            </div>

            {/* ==================================================
                TIMELINE

                IMPORTANT:
                On mobile this now comes AFTER the full centre
                card because the carousel is no longer fixed-height.
                ================================================== */}

            <div
              className="
                relative z-40
                mt-8
                flex
                justify-center

                sm:mt-10
                md:mt-14
              "
            >
              <div
                className="
                  events-scroll
                  inline-flex
                  max-w-full
                  items-center
                  gap-1
                  overflow-x-auto
                  rounded-full
                  border
                  border-jashna-gold/50
                  bg-white/90
                  p-2
                  shadow-[0_12px_34px_rgba(16,36,62,0.16)]
                  backdrop-blur-xl
                  sm:gap-2
                "
              >
                {YEARS.map((year) => {
                  const active = selectedYear === year;

                  return (
                    <motion.button
                      key={year}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setSelectedYear(year)}
                      aria-pressed={active}
                      className={`
                        relative
                        flex
                        min-w-[78px]
                        shrink-0
                        items-center
                        justify-center
                        gap-1.5
                        rounded-full
                        px-4 py-2.5
                        text-[13px]
                        font-bold
                        transition-colors
                        duration-300
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jashna-gold

                        sm:min-w-[92px]
                        sm:gap-2
                        sm:px-5 sm:py-3
                        sm:text-[14px]

                        md:min-w-[100px]
                        md:px-6

                        ${
                          active
                            ? "text-white"
                            : "text-jashna-navy hover:bg-jashna-stone/80 hover:text-jashna-maroon"
                        }
                      `}
                    >
                      {active && (
                        <motion.span
                          layoutId="year-active-pill"
                          className="absolute inset-0 rounded-full bg-gradient-to-b from-jashna-maroon to-jashna-navy shadow-[0_6px_18px_rgba(100,31,45,0.35)]"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                        <CalendarDays size={15} />

                        {year === "all" ? "All Moments" : year}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Events;