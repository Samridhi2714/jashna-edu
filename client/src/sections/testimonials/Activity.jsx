import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import activityVideos from "../../data/activityVideos";

/* ============================================================
   ACTIVITY CONTENT
============================================================ */

const activityContent = {
  1: {
    skill: "Speaking in Action",
    tagline: "Think fast. Speak clearly. Keep the words moving.",
    description:
      "A playful speaking challenge that pushes learners to think quickly, stay focused and keep expressing their ideas under pressure.",
  },

  2: {
    skill: "Confidence in Action",
    tagline: "Turn hesitation into participation.",
    description:
      "Learners step into an unexpected challenge and keep speaking without waiting for the perfect sentence.",
  },

  3: {
    skill: "Spontaneity in Action",
    tagline: "Spin the prompt. Own the conversation.",
    description:
      "An unexpected prompt becomes a reason to speak. Learners react, organise their thoughts and express themselves without rehearsed answers.",
  },
};

/* ============================================================
   ACTIVITY HELPERS
============================================================ */

const titleOf = (activity) =>
  String(activity?.title || "").toLowerCase();

const getContent = (activity) => {
  return (
    activityContent[activity?.id] || {
      skill: activity?.tag || "Learning in Action",
      tagline:
        activity?.description ||
        "A real learning moment in action.",
      description:
        activity?.description ||
        "A practical activity designed to make English active and engaging.",
    }
  );
};

/* ============================================================
   FIND ICE ACTIVITY
============================================================ */

const iceActivity =
  activityVideos.find((activity) => {
    const title = titleOf(activity);

    return title.includes("ice") || title.includes("melt");
  }) || activityVideos[0];

/*
  ICE IS ALWAYS THE CENTRE.

  Everything else becomes a supporting activity.

  When you have 5 videos:

        LEFT          CENTRE          RIGHT
      ┌───────┐      ┌────────┐      ┌───────┐
      │   1   │      │        │      │   4   │
      ├───────┤      │  ICE   │      ├───────┤
      │   2   │      │        │      │   5   │
      └───────┘      └────────┘      └───────┘
*/

const activities = [
  iceActivity,
  ...activityVideos.filter(
    (activity) => activity.id !== iceActivity?.id,
  ),
]
  .filter(Boolean)
  .filter(
    (activity, index, array) =>
      array.findIndex(
        (item) => item.id === activity.id,
      ) === index,
  )
  .slice(0, 5)
  .map((activity) => ({
    ...activity,
    ...getContent(activity),
  }));

/* ============================================================
   ACTIVITY NAME SLIDE
============================================================ */
function ActivityNameSlide({
  activity,
  index,
  reduceMotion,
}) {
  const fromLeft = index % 2 === 0;

  // Give each challenge name its own vertical position
  const verticalOffset =
    index === 0
      ? -55
      : index === 1
      ? 0
      : 55;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: reduceMotion
          ? 0
          : fromLeft
          ? -100
          : 100,
        y: reduceMotion ? verticalOffset : verticalOffset + 20,
        rotate: reduceMotion
          ? 0
          : fromLeft
          ? -2
          : 2,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: verticalOffset,
        rotate: 0,
        filter: "blur(0px)",
      }}
      exit={{
        opacity: 0,
        x: reduceMotion
          ? 0
          : fromLeft
          ? 80
          : -80,
        y: verticalOffset - 20,
        filter: "blur(8px)",
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative">
        {/* trailing line */}

        <motion.div
          initial={{
            scaleX: 0,
          }}
          animate={{
            scaleX: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`absolute top-1/2 hidden h-px w-28 origin-left bg-gradient-to-r from-transparent via-[#E2B85C] to-transparent md:block ${
            fromLeft
              ? "-left-32"
              : "-right-32 rotate-180"
          }`}
        />

        {/* name capsule */}

        <div className="relative overflow-hidden rounded-full border border-white/[0.16] bg-white/[0.055] px-7 py-4 shadow-[0_15px_60px_rgba(0,0,0,.18)] backdrop-blur-xl sm:px-10 sm:py-5">
          <motion.div
            initial={{
              x: "-130%",
            }}
            animate={{
              x: "130%",
            }}
            transition={{
              duration: 1.1,
              delay: 0.15,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-y-0 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm"
          />

          <div className="relative flex items-center gap-4">
            <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-[#E2B85C]">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="text-lg font-black tracking-[-0.04em] text-white sm:text-2xl">
              {activity.title}
            </span>

            <ArrowUpRight
              size={16}
              className="text-white/35"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}


/* ============================================================
   VIDEO CARD
============================================================ */

function VideoCard({
  activity,
  index,
  featured = false,
  muted,
  onMute,
  onOpen,
  reduceMotion,
  theme = "blue",
}) {
  const videoRef = useRef(null);

  const previewStart = async () => {
    if (!videoRef.current || reduceMotion) return;

    try {
      videoRef.current.currentTime = 0;
      await videoRef.current.play();
    } catch {
      // Browser autoplay restrictions.
    }
  };

  const previewStop = () => {
    if (!videoRef.current) return;

    videoRef.current.pause();

    try {
      videoRef.current.currentTime = 0;
    } catch {
      // Ignore seek errors.
    }
  };

  const themeClasses = {
    blue: {
      glow:
        "bg-[radial-gradient(circle,rgba(54,194,255,.42),rgba(83,107,255,.16),transparent_72%)]",
      border:
        "from-[#48D7FF] via-[#658BFF] to-[#8A62FF]",
    },

    purple: {
      glow:
        "bg-[radial-gradient(circle,rgba(145,91,255,.42),rgba(66,173,255,.12),transparent_72%)]",
      border:
        "from-[#8B6BFF] via-[#B15EFF] to-[#4DBFFF]",
    },

    pink: {
      glow:
        "bg-[radial-gradient(circle,rgba(255,103,174,.38),rgba(135,77,255,.14),transparent_72%)]",
      border:
        "from-[#FF7ABF] via-[#B36BFF] to-[#5FCFFF]",
    },

    gold: {
      glow:
        "bg-[radial-gradient(circle,rgba(255,194,76,.40),rgba(255,113,104,.12),transparent_72%)]",
      border:
        "from-[#FFD76A] via-[#FF9E67] to-[#FF72B8]",
    },
  };

  const currentTheme =
    themeClasses[theme] || themeClasses.blue;

  return (
    <motion.div
      layout
      transition={{
        layout: {
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className="group relative h-full w-full"
      onMouseEnter={previewStart}
      onMouseLeave={previewStop}
      onFocus={previewStart}
      onBlur={previewStop}
    >
      {/* ======================================================
          COLOURFUL CLOUD GLOW
      ====================================================== */}

      <div
        className={`pointer-events-none absolute -inset-7 rounded-[42px] ${currentTheme.glow} blur-3xl opacity-70 transition duration-700 group-hover:opacity-100`}
      />

      {/* ======================================================
          GRADIENT CARD EDGE
      ====================================================== */}

      <div
        className={`relative h-full rounded-[32px] bg-gradient-to-br ${currentTheme.border} p-[1.5px] shadow-[0_35px_100px_rgba(0,0,0,.35)]`}
      >
        <div className="relative h-full overflow-hidden rounded-[30px] bg-[#081827]">
          {/* ==================================================
              VIDEO
          ================================================== */}

          <video
            ref={videoRef}
            src={activity.video}
            muted={muted}
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ${
              featured
                ? "group-hover:scale-[1.025]"
                : "group-hover:scale-[1.055]"
            }`}
          />

          {/* cinematic overlay */}

          <div className="absolute inset-0 bg-gradient-to-b from-[#020A12]/20 via-transparent to-[#020A12]/95" />

          {/* colourful atmosphere */}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(79,204,255,.20),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(148,81,255,.20),transparent_35%)]" />

          {/* moving shine */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={
                reduceMotion
                  ? {}
                  : {
                      x: ["-130%", "160%"],
                    }
              }
              transition={{
                duration: 5.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
              className="absolute top-[-20%] h-[140%] w-[18%] -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent blur-md"
            />
          </div>

          {/* ==================================================
              TOP BAR
          ================================================== */}

          <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between sm:left-5 sm:right-5 sm:top-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30 font-mono text-[9px] font-bold text-white backdrop-blur-xl">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="max-w-[150px] truncate rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-white/75 backdrop-blur-xl sm:max-w-[220px]">
                {activity.skill}
              </span>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onMute();
              }}
              aria-label={
                muted
                  ? "Turn sound on"
                  : "Turn sound off"
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl transition hover:scale-105 hover:border-[#E2B85C]/60"
            >
              {muted ? (
                <VolumeX size={14} />
              ) : (
                <Volume2 size={14} />
              )}
            </button>
          </div>

          {/* ==================================================
              CENTRE FEATURE BADGE
          ================================================== */}

          {featured && (
            <div className="absolute left-5 top-[72px] z-20 flex items-center gap-2 rounded-full border border-[#E2B85C]/30 bg-[#071827]/65 px-3 py-2 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E2B85C] shadow-[0_0_12px_rgba(226,184,92,.9)]" />

              <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#E7C873]">
                Centre stage
              </span>
            </div>
          )}

          {/* ==================================================
              PLAY BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={() => onOpen(activity)}
            aria-label={`Watch ${activity.title}`}
            className={`absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/[0.12] text-white shadow-[0_20px_70px_rgba(0,0,0,.45)] backdrop-blur-xl transition duration-500 hover:scale-110 hover:border-[#E2B85C] hover:bg-[#E2B85C]/10 ${
              featured
                ? "h-[82px] w-[82px] sm:h-[96px] sm:w-[96px]"
                : "h-[58px] w-[58px] sm:h-[64px] sm:w-[64px]"
            }`}
          >
            <span className="absolute inset-[-9px] rounded-full border border-white/15 transition-all duration-500 group-hover:inset-[-14px] group-hover:border-[#E2B85C]/30" />

            <Play
              size={featured ? 27 : 19}
              fill="currentColor"
              className="relative ml-1"
            />
          </button>

          {/* ==================================================
              BOTTOM CONTENT
          ================================================== */}

          <div
            className={`absolute bottom-0 left-0 right-0 z-20 ${
              featured
                ? "p-6 sm:p-8"
                : "p-4 sm:p-5"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-7 bg-[#E2B85C]" />

              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#E2B85C]">
                {featured
                  ? "Learning in action"
                  : "Real challenge"}
              </span>
            </div>

            <h3
              className={`font-black tracking-[-0.045em] text-white ${
                featured
                  ? "text-3xl sm:text-4xl lg:text-5xl"
                  : "text-xl sm:text-2xl"
              }`}
            >
              {activity.title}
            </h3>

            <p
              className={`mt-2 leading-5 text-white/60 ${
                featured
                  ? "max-w-xl text-sm sm:text-base"
                  : "text-[10px] sm:text-[11px]"
              }`}
            >
              {activity.tagline}
            </p>

            {featured && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] text-white/55 backdrop-blur-xl">
                Hover to preview
                <span className="text-[#E2B85C]">
                  ·
                </span>
                Click to watch
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   SIDE ACTIVITY CARD
============================================================ */

function SideActivityCard({
  activity,
  index,
  theme,
  muted,
  onMute,
  onOpen,
  reduceMotion,
}) {
  if (!activity) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : 35,
        scale: reduceMotion ? 1 : 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.75,
        delay: 0.15 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative h-[280px] sm:h-[320px] lg:h-[275px] xl:h-[300px]"
    >
      <VideoCard
        activity={activity}
        index={index + 1}
        featured={false}
        muted={muted}
        onMute={onMute}
        onOpen={onOpen}
        reduceMotion={reduceMotion}
        theme={theme}
      />
    </motion.div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function Activity() {
  const sectionRef = useRef(null);
  const modalVideoRef = useRef(null);

  const reduceMotion = useReducedMotion();

  const sectionInView = useInView(sectionRef, {
    once: true,
    amount: 0.18,
  });

  const [presentationPhase, setPresentationPhase] =
    useState("intro");

  const [activeNameIndex, setActiveNameIndex] =
    useState(0);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const [isMuted, setIsMuted] = useState(true);

  /* ==========================================================
     NAME PRESENTATION
  ========================================================== */

  useEffect(() => {
    if (!sectionInView) return;

    let nameTimer;
    let galleryTimer;

    const introTimer = setTimeout(() => {
      setPresentationPhase("names");
      setActiveNameIndex(0);

      let currentIndex = 0;

      nameTimer = setInterval(() => {
        currentIndex += 1;

        if (currentIndex < activities.length) {
          setActiveNameIndex(currentIndex);
        } else {
          clearInterval(nameTimer);

          galleryTimer = setTimeout(() => {
            setPresentationPhase("gallery");
          }, 1400);
        }
      }, 1700);
    }, 1800);

    return () => {
      clearTimeout(introTimer);
      clearInterval(nameTimer);
      clearTimeout(galleryTimer);
    };
  }, [sectionInView]);

  /* ==========================================================
     NAME PRESENTATION HELPERS
  ========================================================== */

  const visibleNameCount =
    presentationPhase === "intro"
      ? 0
      : Math.min(
          activeNameIndex + 1,
          activities.length,
        );

  const showGallery =
    presentationPhase === "gallery";

  /* ==========================================================
     FIXED CENTRE ACTIVITY
  ========================================================== */

  const featuredActivity =
    activities.find(
      (activity) =>
        activity.id === iceActivity?.id,
    ) || activities[0];

  /*
    Everything except ICE becomes a side activity.

    With 5:

      leftActivities  = [video 2, video 3]
      rightActivities = [video 4, video 5]
  */

  const supportingActivities =
    activities.filter(
      (activity) =>
        activity.id !== featuredActivity?.id,
    );

  const leftActivities =
    supportingActivities.slice(0, 2);

  const rightActivities =
    supportingActivities.slice(2, 4);

  /* ==========================================================
     MODAL NAVIGATION
  ========================================================== */

  const goToActivity = (direction) => {
    if (!selectedActivity || activities.length < 2) {
      return;
    }

    const currentIndex = activities.findIndex(
      (activity) =>
        activity.id === selectedActivity.id,
    );

    if (currentIndex === -1) return;

    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % activities.length
        : (currentIndex - 1 + activities.length) %
          activities.length;

    setSelectedActivity(activities[nextIndex]);
  };

  /* ==========================================================
     MODAL KEYBOARD
  ========================================================== */

  useEffect(() => {
    if (!selectedActivity) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedActivity(null);
      }

      if (event.key === "ArrowRight") {
        goToActivity("next");
      }

      if (event.key === "ArrowLeft") {
        goToActivity("previous");
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [selectedActivity]);

  /* ==========================================================
     MODAL AUTOPLAY
  ========================================================== */

  useEffect(() => {
    if (
      !selectedActivity ||
      !modalVideoRef.current
    ) {
      return;
    }

    const video = modalVideoRef.current;

    video.currentTime = 0;

    video.play().catch(() => {});
  }, [selectedActivity]);

  /* ==========================================================
     IF NO VIDEOS
  ========================================================== */

  if (!activities.length) {
    return null;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          LOCAL ANIMATIONS
      ====================================================== */}

      <style>{`
        @keyframes proofWave {
          0% {
            transform: translateX(-120%) skewX(-18deg);
          }

          100% {
            transform: translateX(320%) skewX(-18deg);
          }
        }

        @keyframes softPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: .45;
          }

          50% {
            transform: scale(1.08);
            opacity: .75;
          }
        }

        @keyframes cloudDrift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(18px, -14px, 0) scale(1.06);
          }
        }

        .proof-wave {
          animation: proofWave 3.8s ease-in-out infinite;
        }

        .soft-pulse {
          animation: softPulse 5s ease-in-out infinite;
        }

        .cloud-drift {
          animation: cloudDrift 9s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .proof-wave,
          .soft-pulse,
          .cloud-drift {
            animation: none !important;
          }
        }

        @media (max-width: 767px) {
          .proof-wave {
            animation: none;
          }
        }
      `}</style>

      {/* ======================================================
          SECTION
      ====================================================== */}

      <section
        ref={sectionRef}
        id="learning-in-action"
        className="relative isolate overflow-hidden bg-[#061522] py-24 sm:py-28 lg:py-22"
      >
        {/* ====================================================
            BACKGROUND CLOUD ATMOSPHERE
        ==================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* cyan cloud */}

          <div className="cloud-drift absolute -left-40 top-[24%] h-[420px] w-[420px] rounded-full bg-[#20BFFF]/20 blur-[120px]" />

          {/* violet cloud */}

          <div
            className="cloud-drift absolute right-[-170px] top-[34%] h-[500px] w-[500px] rounded-full bg-[#8A5CFF]/20 blur-[140px]"
            style={{
              animationDelay: "-3s",
            }}
          />

          {/* pink cloud */}

          <div
            className="cloud-drift absolute bottom-[8%] left-[10%] h-[320px] w-[320px] rounded-full bg-[#FF5DA8]/10 blur-[120px]"
            style={{
              animationDelay: "-5s",
            }}
          />

          {/* gold cloud */}

          <div
            className="cloud-drift absolute bottom-[-180px] left-[42%] h-[430px] w-[430px] rounded-full bg-[#E2B85C]/10 blur-[130px]"
            style={{
              animationDelay: "-2s",
            }}
          />

          {/* central colourful cloud */}

          <div className="soft-pulse absolute left-1/2 top-[57%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(55,191,255,.13),rgba(139,82,255,.10),transparent_68%)] blur-[80px]" />

          {/* subtle grid */}

          <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:72px_72px]" />

          {/* giant orbital rings */}

          <div className="absolute left-1/2 top-[57%] hidden h-[880px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035] lg:block" />

          <div className="absolute left-1/2 top-[57%] hidden h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#E2B85C]/[0.07] lg:block" />

          <div className="absolute left-1/2 top-[57%] hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5BB8EC]/[0.06] lg:block" />

          {/* decorative marks */}

          <div className="absolute left-[7%] top-[25%] hidden lg:block">
            <div className="h-2 w-2 rotate-45 bg-[#E2B85C]" />

            <div className="mt-4 h-px w-16 bg-[#E2B85C]/25" />
          </div>

          <div className="absolute right-[8%] top-[18%] hidden lg:block">
            <div className="h-3 w-3 rounded-full border border-[#70B4E3]/40" />

            <div className="ml-6 mt-4 h-1.5 w-1.5 rounded-full bg-[#E2B85C]/70" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10 xl:px-12">
          {/* ==================================================
              INTRODUCTION
          ================================================== */}

          <div className="mx-auto max-w-5xl text-center">
            {/* eyebrow */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={
                sectionInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {}
              }
              transition={{
                duration: 0.7,
              }}
              className="mb-8 flex items-center justify-center gap-3"
            >
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#E2B85C]" />

              <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] text-[#E7C873] backdrop-blur-xl sm:text-[9px]">
                No filters, no retakes
              </span>

              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#E2B85C]" />
            </motion.div>

            {/* =================================================
                MAIN TITLE
            ================================================= */}

            <div className="relative">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={
                  sectionInView
                    ? {
                        opacity: 1,
                        scale: 1,
                      }
                    : {}
                }
                transition={{
                  duration: 1.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden -translate-x-1/2 -translate-y-1/2 select-none text-[10rem] font-black tracking-[-0.1em] text-white/[0.018] lg:block"
              >
                PROOF
              </motion.div>

              <motion.h2
                initial={{
                  opacity: 0,
                  x: -80,
                  clipPath:
                    "inset(0 100% 0 0)",
                }}
                animate={
                  sectionInView
                    ? {
                        opacity: 1,
                        x: 0,
                        clipPath:
                          "inset(0 0% 0 0)",
                      }
                    : {}
                }
                transition={{
                  duration: 1.1,
                  delay: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-[clamp(4rem,10vw,9rem)] font-black leading-[0.78] tracking-[-0.09em] text-white"
              >
                Proof,
                <span className="relative ml-2 inline-block text-[#71B6E7] sm:ml-4">
                  not

                  <span className="absolute -bottom-2 left-0 h-[4px] w-full rounded-full bg-gradient-to-r from-[#E2B85C] via-[#72C8F5] to-transparent" />
                </span>

                <br />

                <span className="relative inline-block font-serif font-normal italic tracking-[-0.065em] text-[#E2B85C]">
                  promise
                </span>
              </motion.h2>

              {/* shiny sweep */}

              <motion.div
                initial={{
                  x: "-130%",
                }}
                animate={
                  sectionInView
                    ? {
                        x: "140%",
                      }
                    : {}
                }
                transition={{
                  duration: 1.7,
                  delay: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pointer-events-none absolute left-[-20%] top-[46%] z-20 h-[70%] w-[32%] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-[5px]"
              />

              {/* wave */}

              <svg
                viewBox="0 0 1000 120"
                className="pointer-events-none absolute left-1/2 top-[42%] hidden w-[85%] -translate-x-1/2 md:block"
                fill="none"
              >
                <motion.path
                  d="M0 65 C120 15, 180 110, 300 60 S480 15, 600 62 S790 105, 1000 35"
                  stroke="url(#proofGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{
                    pathLength: 0,
                    opacity: 0,
                  }}
                  animate={
                    sectionInView
                      ? {
                          pathLength: 1,
                          opacity: 0.8,
                        }
                      : {}
                  }
                  transition={{
                    pathLength: {
                      duration: 1.8,
                      delay: 0.6,
                    },
                    opacity: {
                      duration: 0.5,
                      delay: 0.6,
                    },
                  }}
                />

                <defs>
                  <linearGradient
                    id="proofGradient"
                    x1="0%"
                    x2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="transparent"
                    />

                    <stop
                      offset="40%"
                      stopColor="#70B4E3"
                    />

                    <stop
                      offset="65%"
                      stopColor="#E2B85C"
                    />

                    <stop
                      offset="100%"
                      stopColor="transparent"
                    />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* secondary heading */}

            <motion.div
              initial={{
                opacity: 0,
                y: 35,
              }}
              animate={
                sectionInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {}
              }
              transition={{
                duration: 0.8,
                delay: 0.85,
              }}
              className="mt-9"
            >
              <p className="text-xl font-bold tracking-[-0.03em] text-white sm:text-2xl md:text-3xl">
                We don&apos;t teach confidence.
              </p>

              <p className="mt-1 font-serif text-xl italic text-[#70B4E3] sm:text-2xl md:text-3xl">
                We provoke it.
              </p>
            </motion.div>

            {/* accent */}

            <motion.p
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={
                sectionInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {}
              }
              transition={{
                duration: 0.8,
                delay: 1.05,
              }}
              className="mt-7 font-serif text-lg italic text-[#E2B85C] sm:text-xl"
            >
              Watch it happen live.
            </motion.p>

            {/* paragraph */}

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={
                sectionInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {}
              }
              transition={{
                duration: 0.9,
                delay: 1.2,
              }}
              className="mx-auto mt-6 max-w-2xl"
            >
              <p className="text-sm leading-7 text-white/85 sm:text-base sm:leading-10">
                Real challenges, real learners, zero
                rehearsals. This is what fluency looks
                like when it&apos;s forced out of you —
                not memorized, not performed.
              </p>

              <p className="mt-6 text-[10px] font-black tracking-[0.3em] text-white sm:text-xs">
                STOP REHEARSING
                <span className="mx-3 text-[#E2B85C]">
                  /
                </span>
                START TALKING.
              </p>
            </motion.div>
          </div>

          {/* ==================================================
              ACTIVITY NAME PRESENTATION
          ================================================== */}
<div className="relative mx-auto mt-20 h-[190px] max-w-4xl sm:mt-10 sm:h-[220px]">
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => {
                if (index >= visibleNameCount) {
                  return null;
                }

                return (
                  <ActivityNameSlide
                    key={activity.id}
                    activity={activity}
                    index={index}
                    reduceMotion={reduceMotion}
                  />
                );
              })}
            </AnimatePresence>

            {!showGallery && (
              <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2">
                {activities.map(
                  (activity, index) => (
                    <motion.span
                      key={activity.id}
                      animate={{
                        width:
                          index <
                          visibleNameCount
                            ? 22
                            : 5,
                        opacity:
                          index <
                          visibleNameCount
                            ? 1
                            : 0.25,
                      }}
                      className="h-1 rounded-full bg-[#E2B85C]"
                    />
                  ),
                )}
              </div>
            )}
          </div>

          {/* ==================================================
              VIDEO STAGE
          ================================================== */}

          <AnimatePresence>
            {showGallery && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: reduceMotion ? 0 : 70,
                  scale: reduceMotion
                    ? 1
                    : 0.94,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative mx-auto mt-10 max-w-[1340px] sm:mt-14"
              >
                {/* =================================================
                    STAGE HEADER
                ================================================= */}

                <div className="mb-10 flex flex-col gap-4 text-center sm:mb-12">
                  <div className="flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-[#E2B85C]" />

                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#E2B85C]">
                      Learning in action
                    </span>

                    <span className="h-px w-8 bg-[#E2B85C]" />
                  </div>

                  <h3 className="text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl lg:text-5xl">
                    This is where the talking starts.
                  </h3>

                  <p className="mx-auto max-w-xl text-sm leading-6 text-white/35">
                    Different challenges. Different reactions.
                    One thing stays the same — learners are
                    actually speaking.
                  </p>
                </div>

                {/* =================================================
                    CREATIVE 2 | 1 | 2 VIDEO GALLERY
                ================================================= */}

                <div className="relative">
                  {/* =================================================
                      EXTRA CENTRAL CLOUD
                  ================================================= */}

                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(74,200,255,.18),rgba(151,80,255,.10),transparent_68%)] blur-[80px]" />

                  {/* =================================================
                      DESKTOP LAYOUT
                  ================================================= */}

                  <div className="relative grid items-center gap-8 lg:grid-cols-[0.86fr_1.32fr_0.86fr] xl:gap-10">
                    {/* =================================================
                        LEFT — TWO VIDEOS
                    ================================================= */}

                    <div className="order-2 flex flex-col gap-8 lg:order-1">
                      {leftActivities.map(
                        (activity, index) => (
                          <motion.div
                            key={activity.id}
                            animate={
                              reduceMotion
                                ? {}
                                : {
                                    y:
                                      index === 0
                                        ? [0, -7, 0]
                                        : [0, 7, 0],
                                    rotate:
                                      index === 0
                                        ? [-1.5, -0.5, -1.5]
                                        : [1, 0, 1],
                                  }
                            }
                            transition={{
                              duration:
                                5 +
                                index,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay:
                                index * 0.6,
                            }}
                            className={
                              index === 0
                                ? "lg:-translate-x-3"
                                : "lg:translate-x-3"
                            }
                          >
                            <SideActivityCard
                              activity={
                                activity
                              }
                              index={index}
                              theme={
                                index === 0
                                  ? "blue"
                                  : "purple"
                              }
                              muted={isMuted}
                              onMute={() =>
                                setIsMuted(
                                  (value) =>
                                    !value,
                                )
                              }
                              onOpen={
                                setSelectedActivity
                              }
                              reduceMotion={
                                reduceMotion
                              }
                            />
                          </motion.div>
                        ),
                      )}
                    </div>

                    {/* =================================================
                        CENTRE — ICE MELT
                    ================================================= */}

                    <motion.div
                      layout
                      initial={{
                        opacity: 0,
                        scale: reduceMotion
                          ? 1
                          : 0.9,
                        y: reduceMotion
                          ? 0
                          : 30,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.9,
                        delay: 0.1,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                      className="order-1 relative lg:order-2"
                    >
                      {/* huge glow */}

                      <div className="pointer-events-none absolute -inset-12 rounded-[60px] bg-[radial-gradient(circle_at_50%_40%,rgba(54,210,255,.35),rgba(112,87,255,.22),rgba(255,190,83,.10),transparent_70%)] blur-3xl" />

                      {/* floating orbit ring */}

                      <div className="pointer-events-none absolute -inset-5 rounded-[46px] border border-white/[0.07]" />

                      <div className="pointer-events-none absolute -inset-9 rounded-[55px] border border-[#63D4FF]/[0.08]" />

                      {/* top floating badge */}

                      <div className="absolute left-1/2 top-[-17px] z-40 -translate-x-1/2">
                        <div className="flex items-center gap-2 rounded-full border border-[#E2B85C]/30 bg-[#061522]/90 px-4 py-2.5 shadow-[0_15px_50px_rgba(0,0,0,.4)] backdrop-blur-xl">
                          <Sparkles
                            size={12}
                            className="text-[#E2B85C]"
                          />

                          <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.25em] text-[#F0D27C]">
                            Centre Stage · Ice
                          </span>
                        </div>
                      </div>

                      {/* centre card */}

                      <div className="relative rounded-[40px] bg-gradient-to-br from-[#4DD9FF] via-[#7D72FF] to-[#FFD36A] p-[2px] shadow-[0_45px_130px_rgba(20,130,210,.25)]">
                        <div className="rounded-[38px] bg-[#071522] p-2 sm:p-2.5">
                          <div className="relative h-[540px] overflow-hidden rounded-[34px] sm:h-[620px] lg:h-[680px]">
                            <VideoCard
                              activity={
                                featuredActivity
                              }
                              index={0}
                              featured
                              muted={isMuted}
                              onMute={() =>
                                setIsMuted(
                                  (value) =>
                                    !value,
                                )
                              }
                              onOpen={
                                setSelectedActivity
                              }
                              reduceMotion={
                                reduceMotion
                              }
                              theme="blue"
                            />
                          </div>

                          {/* =================================================
                              CENTRE TITLE PANEL
                          ================================================= */}

                          <div className="px-5 pb-5 pt-5 text-center sm:px-7 sm:pb-7">
                            <div className="mb-3 flex items-center justify-center gap-2">
                              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#E2B85C]" />

                              <span className="text-[8px] font-black uppercase tracking-[0.28em] text-[#E2B85C]">
                                Featured activity
                              </span>

                              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#E2B85C]" />
                            </div>

                            <h3 className="text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl">
                              {featuredActivity.title}
                            </h3>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                              {
                                featuredActivity.tagline
                              }
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedActivity(
                                  featuredActivity,
                                )
                              }
                              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2.5 text-[8px] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-[#E2B85C]/40 hover:bg-[#E2B85C]/10 hover:text-[#E2B85C]"
                            >
                              Explore the challenge

                              <ChevronRight
                                size={13}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* =================================================
                        RIGHT — TWO VIDEOS
                    ================================================= */}

                    <div className="order-3 flex flex-col gap-8 lg:order-3">
                      {rightActivities.map(
                        (activity, index) => (
                          <motion.div
                            key={activity.id}
                            animate={
                              reduceMotion
                                ? {}
                                : {
                                    y:
                                      index === 0
                                        ? [0, 7, 0]
                                        : [0, -7, 0],
                                    rotate:
                                      index === 0
                                        ? [1.5, 0.5, 1.5]
                                        : [-1, 0, -1],
                                  }
                            }
                            transition={{
                              duration:
                                5 +
                                index,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay:
                                index * 0.7,
                            }}
                            className={
                              index === 0
                                ? "lg:translate-x-3"
                                : "lg:-translate-x-3"
                            }
                          >
                            <SideActivityCard
                              activity={
                                activity
                              }
                              index={
                                index + 2
                              }
                              theme={
                                index === 0
                                  ? "pink"
                                  : "gold"
                              }
                              muted={isMuted}
                              onMute={() =>
                                setIsMuted(
                                  (value) =>
                                    !value,
                                )
                              }
                              onOpen={
                                setSelectedActivity
                              }
                              reduceMotion={
                                reduceMotion
                              }
                            />
                          </motion.div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    LAYOUT NOTE
                ================================================= */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 1,
                  }}
                  className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row"
                >
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5DC6F5]" />

                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Live learning moment
                    </span>
                  </div>

                  <span className="hidden text-white/15 sm:block">
                    /
                  </span>

                  <span className="text-[9px] font-medium text-white/25">
                    Hover to preview · Click to watch
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ==================================================
              CLOSING STATEMENT
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 0.8,
            }}
            className="mx-auto mt-24 max-w-3xl text-center sm:mt-10"
          >
            <div className="mx-auto mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#E2B85C]/40" />

              <Sparkles
                size={14}
                className="text-[#E2B85C]"
              />

              <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#E2B85C]/40" />
            </div>

            <p className="text-2xl font-black leading-tight tracking-[-0.045em] text-white sm:text-3xl lg:text-4xl">
              Confidence doesn&apos;t arrive
              <br />

              <span className="font-serif font-normal italic text-[#E2B85C]">
                before you speak.
              </span>
            </p>

            <p className="mt-4 text-sm text-white/40">
              It arrives because you did.
            </p>
          </motion.div>
        </div>

        {/* bottom line */}

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E2B85C]/30 to-transparent" />
      </section>

      {/* ========================================================
          CINEMATIC VIDEO MODAL
      ======================================================== */}

      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#01080F]/95 p-3 backdrop-blur-2xl sm:p-6 lg:p-10"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedActivity(null);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: reduceMotion
                  ? 1
                  : 0.94,
                y: reduceMotion ? 0 : 25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: reduceMotion
                  ? 1
                  : 0.96,
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative w-full max-w-6xl"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              {/* ambient modal glow */}

              <div className="pointer-events-none absolute -inset-10 rounded-[50px] bg-[radial-gradient(circle_at_50%_30%,rgba(55,169,232,.15),rgba(132,77,255,.08),transparent_55%)] blur-3xl" />

              {/* close */}

              <button
                type="button"
                onClick={() =>
                  setSelectedActivity(null)
                }
                aria-label="Close video"
                className="absolute right-0 top-[-52px] z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white backdrop-blur-xl transition hover:rotate-90 hover:border-[#E2B85C] hover:text-[#E2B85C]"
              >
                <X size={18} />
              </button>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#091A2B] shadow-[0_45px_140px_rgba(0,0,0,.65)]">
                {/* =================================================
                    VIDEO
                ================================================= */}

                <div className="relative aspect-video w-full bg-black">
                  <video
                    ref={modalVideoRef}
                    src={selectedActivity.video}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-contain"
                  />

                  <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-5 sm:p-7">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#E2B85C]">
                        Jashna · Learning in Action
                      </span>

                      <span className="h-1 w-1 rounded-full bg-white/30" />

                      <span className="text-[8px] uppercase tracking-[0.18em] text-white/40">
                        {selectedActivity.skill}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    MODAL INFORMATION
                ================================================= */}

                <div className="grid border-t border-white/10 lg:grid-cols-[1fr_auto]">
                  <div className="p-5 sm:p-7 lg:p-8">
                    <h3 className="text-2xl font-black tracking-[-0.045em] text-white sm:text-3xl">
                      {selectedActivity.title}
                    </h3>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                      {
                        selectedActivity.description
                      }
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#E2B85C]/20 bg-[#E2B85C]/[0.06] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[#E2B85C]">
                        {selectedActivity.skill}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] text-white/35">
                        Real learner
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] text-white/35">
                        No rehearsals
                      </span>
                    </div>
                  </div>

                  {/* navigation */}

                  <div className="flex items-center gap-2 border-t border-white/10 p-5 sm:p-7 lg:border-l lg:border-t-0">
                    <button
                      type="button"
                      onClick={() =>
                        goToActivity(
                          "previous",
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#E2B85C]/50 hover:text-[#E2B85C]"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        goToActivity("next")
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#E2B85C]/50 hover:text-[#E2B85C]"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* =================================================
                  THUMBNAILS
              ================================================= */}

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {activities.map(
                  (activity, index) => {
                    const active =
                      activity.id ===
                      selectedActivity.id;

                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() =>
                          setSelectedActivity(
                            activity,
                          )
                        }
                        className={`group relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border transition ${
                          active
                            ? "border-[#E2B85C]/70"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        <video
                          src={activity.video}
                          muted
                          playsInline
                          preload="metadata"
                          className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-500 group-hover:scale-105 group-hover:opacity-70"
                        />

                        <div className="absolute inset-0 bg-[#061522]/60" />

                        <div className="relative flex h-full flex-col justify-between p-2">
                          <span className="text-left font-mono text-[8px] text-[#E2B85C]">
                            {String(
                              index + 1,
                            ).padStart(2, "0")}
                          </span>

                          <span className="truncate text-left text-[7px] font-bold uppercase tracking-[0.08em] text-white/80">
                            {activity.title}
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Activity;