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
} from "lucide-react";

import eventImages from "../data/eventImages";

const API_URL = "http://localhost:5000/api/events";

const YEARS = ["all", "2026", "2025", "2024", "2023"];

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
        className="absolute left-1/2 top-0 z-10 hidden min-[1182px]:block"
        initial={false}
        animate={
          position === "left"
            ? {
                x: "-50%",
                marginLeft: "-440px",
                scale: 0.86,
                opacity: 0.68,
                rotateY: 3,
                rotateZ: -1.2,
              }
            : {
                x: "-50%",
                marginLeft: "440px",
                scale: 0.86,
                opacity: 0.68,
                rotateY: -3,
                rotateZ: 1.2,
              }
        }
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
            relative h-full w-full overflow-hidden
            rounded-[28px]
            border border-jashna-gold/70
            bg-jashna-navy/90
            shadow-[0_0_22px_rgba(198,161,91,0.55),0_18px_45px_rgba(16,36,62,0.28)]
          "
        >
          <div className="absolute inset-0 z-10 bg-jashna-navy/45" />

          <div className="absolute inset-0 z-20 bg-gradient-to-t from-jashna-navy via-jashna-navy/20 to-transparent" />

          {activeImage ? (
            <img
              src={activeImage}
              alt={event.title}
              className="h-full w-full object-cover blur-[1.5px]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-jashna-navy text-white/70">
              No image
            </div>
          )}

          <div className="absolute inset-x-5 bottom-5 z-30 text-left text-white">
            <div className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
              {event.category || "Event"}
            </div>

            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-jashna-navy/75 px-3 py-1.5 text-[10px] font-medium backdrop-blur-md">
              <CalendarDays size={12} />
              {formatEventDate(event)}
            </div>

            <h3 className="max-w-[270px] font-display text-[23px] leading-[1.08]">
              {event.title}
            </h3>

            {event.location && (
              <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-white/75">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span>{event.location}</span>
              </div>
            )}

            <p className="mt-3 line-clamp-3 text-[11px] leading-4 text-white/65">
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
          border border-amber-400
          bg-white
          shadow-[0_0_28px_rgba(198,161,91,0.65),0_25px_60px_rgba(16,36,62,0.28)]
          md:rounded-[30px]
        "
      >
        {/* GOLDEN OUTER GLOW */}

        <div
          className="
            pointer-events-none
            absolute -inset-[1px]
            rounded-[31px]
            shadow-[inset_0_0_20px_rgba(198,161,91,0.28)]
          "
        />

        {/* ======================================================
            IMAGE
            ====================================================== */}

        <motion.div
          className="
            relative
            h-[390px]
            overflow-hidden
            bg-jashna-stone
            sm:h-[420px]
            md:h-[430px]
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
              <div className="flex h-full items-center justify-center bg-jashna-stone text-jashna-muted">
                No image available
              </div>
            )}
          </AnimatePresence>

          {/* FEATURED BADGE */}

          <div
            className="
              absolute left-4 top-4 z-20
              inline-flex items-center gap-2
              rounded-full
              border border-white/30
              bg-jashna-navy/90
              px-3.5 py-2
              text-[9px] font-bold
              uppercase tracking-[0.14em]
              text-white
              shadow-lg
              backdrop-blur-md
              sm:left-5 sm:top-5
              sm:px-4
            "
          >
            <Sparkles size={12} />
            Featured Moment
          </div>

          {/* ====================================================
              TWO-PHOTO NAVIGATION
              ==================================================== */}

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  setImageIndex((current) => Math.max(current - 1, 0));
                }}
                disabled={imageIndex === 0}
                className="
                  absolute left-3 top-1/2 z-30
                  -translate-y-1/2
                  rounded-full
                  border border-white/30
                  bg-jashna-navy/70
                  p-2
                  text-white
                  shadow-lg
                  backdrop-blur-md
                  transition
                  hover:bg-jashna-navy
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                  sm:left-4 sm:p-2.5
                "
                aria-label="Previous photo"
              >
                <ArrowLeft size={16} />
              </button>

              <button
                type="button"
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
                  border border-white/30
                  bg-jashna-navy/70
                  p-2
                  text-white
                  shadow-lg
                  backdrop-blur-md
                  transition
                  hover:bg-jashna-navy
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                  sm:right-4 sm:p-2.5
                "
                aria-label="Next photo"
              >
                <ArrowRight size={16} />
              </button>

              {/* PHOTO DOTS */}

              <div
                className="
                  absolute bottom-4 left-1/2 z-30
                  flex -translate-x-1/2
                  items-center gap-1.5
                  rounded-full
                  bg-black/45
                  px-3 py-1.5
                  backdrop-blur-md
                "
              >
                {safeImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={`
                      h-1.5 rounded-full
                      transition-all duration-300
                      ${
                        imageIndex === index
                          ? "w-7 bg-white"
                          : "w-1.5 bg-white/45"
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
                  bg-black/45
                  px-3 py-1.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
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

        <div
          className="
            relative
            bg-white
            px-5 pb-6 pt-5
            sm:px-7 sm:pb-7 sm:pt-6
            md:px-8
          "
        >
          {/* CATEGORY */}

          <div
            className="
              mb-3
              flex items-center gap-2
              text-[8px] font-bold
              uppercase tracking-[0.23em]
              text-jashna-maroon
              sm:text-[9px]
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-jashna-gold" />

            {event.category || "Event"}
          </div>

          {/* TITLE */}

          <h2
            className="
              font-display
              text-[27px]
              leading-[1.08]
              text-jashna-navy
              sm:text-[31px]
              md:text-[34px]
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
              gap-x-4 gap-y-2
              text-[10px]
              text-jashna-muted
              sm:gap-x-5 sm:text-[11px]
            "
          >
            <div className="flex items-center gap-2">
              <CalendarDays
                size={13}
                className="text-jashna-maroon sm:h-[14px] sm:w-[14px]"
              />

              <span>{formatEventDate(event)}</span>
            </div>

            {event.location && (
              <div className="flex min-w-0 items-start gap-2">
                <MapPin
                  size={13}
                  className="mt-0.5 shrink-0 text-jashna-maroon sm:h-[14px] sm:w-[14px]"
                />

                <span className="max-w-[280px] sm:max-w-[300px]">
                  {event.location}
                </span>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}

          <p
            className="
              mt-4
              text-[12px]
              leading-5
              text-jashna-muted
              sm:mt-5 sm:text-[13px] sm:leading-6
            "
          >
            {event.description ||
              "A meaningful learning experience where participants came together to learn, interact and grow."}
          </p>

          {/* DIVIDER */}

          <div className="my-4 h-px bg-jashna-stone sm:my-5" />

          {/* THREE ICON DETAILS */}

          <div className="grid grid-cols-3 divide-x divide-jashna-stone">
            <div className="flex items-center gap-1.5 px-1 first:pl-0 sm:gap-2 sm:px-2">
              <div
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-full
                  bg-jashna-maroon/8
                  text-jashna-maroon
                  sm:h-8 sm:w-8
                "
              >
                <IconOne size={14} />
              </div>

              <span
                className="
                  text-[9px]
                  font-medium
                  leading-3.5
                  text-jashna-muted
                  sm:text-[10px] sm:leading-4
                "
              >
                {meta[0]}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2 sm:gap-2 sm:px-3">
              <div
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-full
                  bg-jashna-maroon/8
                  text-jashna-maroon
                  sm:h-8 sm:w-8
                "
              >
                <IconTwo size={14} />
              </div>

              <span
                className="
                  text-[9px]
                  font-medium
                  leading-3.5
                  text-jashna-muted
                  sm:text-[10px] sm:leading-4
                "
              >
                {meta[1]}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-1 pr-0 sm:gap-2 sm:px-2">
              <div
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-full
                  bg-jashna-maroon/8
                  text-jashna-maroon
                  sm:h-8 sm:w-8
                "
              >
                <IconThree size={14} />
              </div>

              <span
                className="
                  text-[9px]
                  font-medium
                  leading-3.5
                  text-jashna-muted
                  sm:text-[10px] sm:leading-4
                "
              >
                {meta[2]}
              </span>
            </div>
          </div>
        </div>
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

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedYear]);

  const total = filteredEvents.length;

  const currentEvent = total > 0 ? filteredEvents[activeIndex] : null;

  const previousEvent =
    total > 0 ? filteredEvents[(activeIndex - 1 + total) % total] : null;

  const nextEvent =
    total > 0 ? filteredEvents[(activeIndex + 1) % total] : null;

  const currentImages = currentEvent
    ? getImagesForEvent(currentEvent)
    : [];

  const previousImages = previousEvent
    ? getImagesForEvent(previousEvent)
    : [];

  const nextImages = nextEvent
    ? getImagesForEvent(nextEvent)
    : [];

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
        relative min-h-screen
        overflow-hidden
        bg-jashna-ivory
        text-jashna-charcoal
      "
    >
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
          backgroundImage: "url('/src/assets/events/events-bg.webp')",
        }}
      />

      <div className="absolute inset-0 bg-jashna-ivory/10" />

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
          pb-10
          pt-12
          sm:px-8 sm:pb-14 sm:pt-14
          md:px-12 md:pt-16
          lg:px-14
        "
      >
        {/* ======================================================
            HEADER
            ====================================================== */}

        <div
          className="
            relative z-20
            max-w-[610px]
            md:max-w-[650px]
          "
        >
          <div
            className="
              mb-3
              flex items-center gap-3
              text-[9px] font-bold
              uppercase
              tracking-[0.30em]
              text-jashna-maroon
              sm:text-[10px]
              md:text-[11px]
              md:tracking-[0.34em]
            "
          >
            <span className="h-px w-8 bg-jashna-maroon/90 sm:w-10" />
            Events & Experiences
          </div>

          <h1
            className="
              font-display
              text-[43px]
              font-semibold
              leading-[0.98]
              tracking-[-0.035em]
              text-jashna-navy
              sm:text-[51px]
              md:text-[58px]
              lg:text-[66px]
            "
          >
            Where{" "}
            <span
              className="
                relative
                italic
                underline
                decoration-[1.5px]
                underline-offset-[7px]
                text-jashna-maroon
              "
              style={{
                fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                fontStyle: "normal",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              the journey
            </span>{" "}
            happened.
          </h1>

          <p
            className="
              mt-4
              max-w-[550px]
              text-[13px]
              leading-6
              text-jashna-muted
              sm:mt-5 sm:text-[14px] sm:leading-7
              md:mt-6 md:text-[15px]
            "
          >
            From engaging competitions to inspiring sessions, our events bring
            learning to life and help you showcase your skills, build confidence
            and grow.
          </p>
        </div>

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
                h-10 w-10
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
                bg-white/80
                px-6 py-3
                text-sm
                text-jashna-muted
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
                bg-white/80
                px-6 py-3
                text-sm
                text-jashna-muted
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
                md:mt-20
                md:h-[610px]
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

                  md:absolute
                  md:left-1/2
                  md:top-[-30px]
                  md:w-auto min-[1182px]:w-auto
                  md:-translate-x-1/2
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
                    <button
                      type="button"
                      onClick={goPrevious}
                      className="
                        absolute
                        left-1
                        top-[195px]
                        z-50
                        flex
                        h-10 w-10
                        -translate-y-1/2
                        items-center justify-center
                        rounded-full
                        border
                        border-white/80
                        bg-jashna-navy/85
                        text-white
                        shadow-[0_8px_24px_rgba(16,36,62,0.30)]
                        backdrop-blur-md
                        transition-all
                        duration-300
                        hover:scale-105
                        hover:bg-jashna-navy
                
                        sm:left-1
                        sm:top-[210px]

                        md:hidden
                      "
                      aria-label="Previous event"
                    >
                      <ArrowLeft size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      className="
                        absolute
                        right-1
                        top-[195px]
                        z-50
                        flex
                        h-10 w-10
                        -translate-y-1/2
                        items-center justify-center
                        rounded-full
                        border
                        border-white/80
                        bg-jashna-navy/85
                        text-white
                        shadow-[0_8px_24px_rgba(16,36,62,0.30)]
                        backdrop-blur-md
                        transition-all
                        duration-300
                        hover:scale-105
                        hover:bg-jashna-navy

                        sm:right-1
                        sm:top-[210px]

                        md:hidden
                      "
                      aria-label="Next event"
                    >
                      <ArrowRight size={17} />
                    </button>
                  </>
                )}
              </div>

              {/* ==================================================
                  DESKTOP EVENT NAVIGATION
                  ================================================== */}

              <button
                type="button"
                onClick={goPrevious}
                className="
                    absolute
                    left-1
                    top-[270px]
                    z-40
                    flex
                    h-10 w-10
                    -translate-y-1/2
                    items-center justify-center
                    rounded-full
                    border border-white/70
                    bg-white/90
                    text-jashna-navy
                    shadow-[0_8px_25px_rgba(16,36,62,0.16)]
                    backdrop-blur-md
                    transition-all duration-300
                    hover:scale-105
                    hover:bg-white

                    min-[1182px]:left-[calc(50%-590px)]
                    min-[1182px]:h-12
                    min-[1182px]:w-12
                "
                aria-label="Previous event"
              >
                <ArrowLeft size={19} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="
                    absolute
                    right-1
                    top-[270px]
                    z-40
                    flex
                    h-10 w-10
                    -translate-y-1/2
                    items-center justify-center
                    rounded-full
                    border border-white/70
                    bg-white/90
                    text-jashna-navy
                    shadow-[0_8px_25px_rgba(16,36,62,0.16)]
                    backdrop-blur-md
                    transition-all duration-300
                    hover:scale-105
                    hover:bg-white

                    min-[1182px]:right-[calc(50%-590px)]
                    min-[1182px]:h-12
                    min-[1182px]:w-12
                "
                aria-label="Next event"
              >
                <ArrowRight size={19} />
              </button>
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
                md:mt-35
              "
            >
              <div
                className="
                  inline-flex
                  max-w-full
                  items-center
                  gap-1
                  overflow-x-auto
                  rounded-full
                  border
                  border-jashna-gold/30
                  bg-white/85
                  p-1.5
                  shadow-[0_10px_30px_rgba(16,36,62,0.12)]
                  backdrop-blur-xl
                  sm:gap-2
                "
              >
                {YEARS.map((year) => {
                  const active = selectedYear === year;

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYear(year)}
                      className={`
                        flex
                        min-w-[70px]
                        shrink-0
                        items-center
                        justify-center
                        gap-1.5
                        rounded-full
                        px-3.5 py-2.5
                        text-[10px]
                        font-semibold
                        transition-all
                        duration-300

                        sm:min-w-[80px]
                        sm:gap-2
                        sm:px-4 sm:py-3
                        sm:text-[11px]

                        md:min-w-[86px]
                        md:px-5

                        ${
                          active
                            ? "bg-jashna-maroon text-white shadow-[0_5px_18px_rgba(100,31,45,0.25)]"
                            : "text-jashna-navy hover:bg-jashna-stone/70"
                        }
                      `}
                    >
                      <CalendarDays size={13} />

                      {year === "all" ? "All Moments" : year}
                    </button>
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
