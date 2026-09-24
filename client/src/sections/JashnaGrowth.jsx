import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sprout,
  Brain,
  Target,
  MessageCircle,
  BriefcaseBusiness,
  Sparkles,
  X,
  ArrowUpRight,
  Check,
} from "lucide-react";

import treeImage from "../assets/images/tree.webp";
import logoImage from "../assets/images/logo.webp";

import growthAssessment from "../assets/images/growth-assessment.webp";
import growthFoundation from "../assets/images/growth-foundation.webp";
import growthPractice from "../assets/images/growth-practice.webp";
import growthConfidence from "../assets/images/growth-confidence.webp";
import growthImpact from "../assets/images/growth-impact.webp";
import growthTransformation from "../assets/images/growth-transformation.webp";

const growthStages = [
  {
    id: "01",
    label: "ASSESSMENT",
    title: "Understand Where You Are",

    description:
      "We begin by understanding your current communication strengths, gaps and goals before building your learning journey.",

    points: [
      "Identify communication gaps",
      "Understand your current level",
      "Set meaningful goals",
    ],

    icon: Brain,
    photo: growthAssessment,

    caption:
      "Every transformation begins with understanding where you stand.",

    quote: "Start where you are.",
    quoteSmall: "Awareness creates direction.",

    position: "top-left",

    photoPosition: {
      left: "13%",
      top: "20%",
    },

    colors: {
      background: "#FFF1EC",
      border: "#E9B8A7",
      accent: "#D77B61",
      dark: "#783F32",
      sticker: "#E8A38E",
      glow: "rgba(215,123,97,0.32)",
    },
  },

  {
    id: "02",
    label: "FOUNDATION",
    title: "Build Your Foundation",

    description:
      "Strong communication starts with the right foundations — language, structure, vocabulary, clarity and confidence.",

    points: [
      "Strengthen language basics",
      "Build useful vocabulary",
      "Develop clear expression",
    ],

    icon: Sprout,
    photo: growthFoundation,

    caption: "A stronger foundation makes every next step easier.",

    quote: "Grow from within.",
    quoteSmall: "Strong roots. Clear voice.",

    position: "top-right",

    photoPosition: {
      left: "70%",
      top: "23%",
    },

    colors: {
      background: "#EEF6E9",
      border: "#B7CDAA",
      accent: "#7B9C6B",
      dark: "#425A37",
      sticker: "#A9C69A",
      glow: "rgba(123,156,107,0.30)",
    },
  },

  {
    id: "03",
    label: "PRACTICE",
    title: "Practice & Apply",

    description:
      "Learning becomes meaningful when you use it. Practice real conversations, presentations and situations that mirror everyday life.",

    points: [
      "Practise real conversations",
      "Apply communication skills",
      "Learn through feedback",
    ],

    icon: Target,
    photo: growthPractice,

    caption:
      "Practice turns knowledge into something you can actually use.",

    quote: "Practice makes it yours.",
    quoteSmall: "Learn. Try. Improve.",

    position: "middle-left",

    photoPosition: {
      left: "11%",
      top: "47%",
    },

    colors: {
      background: "#F1EEFA",
      border: "#C9BCE4",
      accent: "#8C7AB5",
      dark: "#554778",
      sticker: "#BBAAE0",
      glow: "rgba(140,122,181,0.30)",
    },
  },

  {
    id: "04",
    label: "CONFIDENCE",
    title: "Speak With Confidence",

    description:
      "With consistent practice, your communication becomes more natural and powerful — helping you express yourself with clarity and confidence.",

    points: [
      "Speak more naturally",
      "Express ideas clearly",
      "Build presentation confidence",
    ],

    icon: MessageCircle,
    photo: growthConfidence,

    caption:
      "Confidence grows when your skills become natural through practice.",

    quote: "Own your voice.",
    quoteSmall: "Clarity creates confidence.",

    position: "middle-right",

    photoPosition: {
      left: "70%",
      top: "49%",
    },

    colors: {
      background: "#F5EDF8",
      border: "#D2B9D9",
      accent: "#A16AA8",
      dark: "#65456D",
      sticker: "#C7A5CE",
      glow: "rgba(161,106,168,0.30)",
    },
  },

  {
    id: "05",
    label: "IMPACT",
    title: "Create Real-World Impact",

    description:
      "The ultimate goal is to carry your communication skills into academics, careers and everyday life.",

    points: ["Academic confidence", "Career readiness", "Better connections"],

    icon: BriefcaseBusiness,
    photo: growthImpact,

    caption:
      "Your skills matter most when they create impact beyond the classroom.",

    quote: "Make your skills matter.",
    quoteSmall: "Real conversations. Real growth.",

    position: "bottom-left",

    photoPosition: {
      left: "30%",
      top: "74%",
    },

    colors: {
      background: "#EEF4F8",
      border: "#B7C9D7",
      accent: "#668FAE",
      dark: "#405D72",
      sticker: "#9EB8C9",
      glow: "rgba(102,143,174,0.30)",
    },
  },

  {
    id: "06",
    label: "TRANSFORMATION",
    title: "Grow Into Your Next Chapter",

    description:
      "The journey comes full circle when communication becomes a part of who you are — opening the way to new opportunities and continued growth.",

    points: [
      "Step into new opportunities",
      "Achieve your goals",
      "Keep growing beyond Jashna",
    ],

    icon: Sparkles,
    photo: growthTransformation,

    caption:
      "Growth is not the end of the journey — it is the beginning of what comes next.",

    quote: "Become who you can be.",
    quoteSmall: "Your next chapter starts here.",

    position: "bottom-right",

    photoPosition: {
      left: "66%",
      top: "76%",
    },

    colors: {
      background: "#FFF7E5",
      border: "#E5C98C",
      accent: "#C69A3A",
      dark: "#765A25",
      sticker: "#D9B969",
      glow: "rgba(198,154,58,0.32)",
    },
  },
];

/* =========================================================
   UPDATED DESKTOP CARD POSITIONS

   Circle size = 350px

   01 / 02  → 60px
   03 / 04  → 450px
   05 / 06  → 840px

   Approx. 40px vertical breathing space
   between each 350px circle.
========================================================= */

const cardPositions = {
  "top-left": {
    left: "0%",
    top: "60px",
  },

  "top-right": {
    right: "0%",
    top: "60px",
  },

  "middle-left": {
    left: "0%",
    top: "450px",
  },

  "middle-right": {
    right: "0%",
    top: "450px",
  },

  "bottom-left": {
    left: "2%",
    top: "840px",
  },

  "bottom-right": {
    right: "2%",
    top: "840px",
  },
};

export default function JashnaGrowth() {
  const [activeStage, setActiveStage] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedPhoto]);

  return (
    <>
      <section
        id="growth"
        className="relative overflow-hidden bg-[#FCFAF6] py-24 lg:py-24"
      >
        {/* BACKGROUND GLOWS */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute left-[-180px] top-[180px] h-[420px] w-[420px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(214,176,98,0.11), transparent 68%)",
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.45, 0.7, 0.45],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute right-[-150px] bottom-[100px] h-[430px] w-[430px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(121,91,135,0.08), transparent 68%)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.65, 0.4],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* HEADING */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.7,
            }}
            className="mb-5 flex items-center justify-center gap-3"
          >
            <span className="h-px w-10 bg-[#C69A3A]" />

            <span className="text-[10px] font-semibold tracking-[0.32em] text-[#9A7630] sm:text-xs">
              THE JASHNA GROWTH TREE
            </span>

            <span className="h-px w-10 bg-[#C69A3A]" />
          </motion.div>

          <motion.h2
            initial={{
              opacity: 0,
              y: 22,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.75,
              delay: 0.08,
            }}
            className="font-serif text-4xl leading-[1.05] tracking-[-0.03em] text-[#17213A] sm:text-5xl lg:text-6xl"
          >
            Every strand of growth
            <span className="block text-[#A47A2C]">has a purpose.</span>
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.7,
              delay: 0.16,
            }}
            className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#566174] sm:text-base"
          >
            From understanding where you are to confidently applying what you
            learn — your communication journey with Jashna grows, step by step.
          </motion.p>
        </div>

        {/* =====================================================
            DESKTOP TREE
        ====================================================== */}

        <div className="relative mx-auto mt-16 hidden h-[1230px] max-w-[1500px] lg:block">
          <GrowthConnectionLines activeStage={activeStage} />

          {/* TREE */}
          <div className="absolute left-1/2 top-[25px] z-20 h-[930px] w-[600px] -translate-x-1/2">
            <motion.div
              className="absolute left-1/2 top-1/2 h-[600px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(213,173,87,0.20), rgba(252,250,246,0) 68%)",
              }}
              animate={{
                scale: [0.96, 1.04, 0.96],
                opacity: [0.5, 0.75, 0.5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.img
              src={treeImage}
              alt="The Jashna Growth Tree"
              className="relative z-10 h-full w-full object-contain"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                opacity: {
                  duration: 1,
                },
                scale: {
                  duration: 1,
                },
                y: {
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />

            {/* SMALL TREE PHOTOS */}
            {growthStages.map((stage, index) => {
              const isActive = activeStage === index;
              const Icon = stage.icon;

              return (
                <motion.button
                  key={stage.id}
                  type="button"
                  aria-label={`Open ${stage.title} image`}
                  onMouseEnter={() => setActiveStage(index)}
                  onMouseLeave={() => setActiveStage(null)}
                  onFocus={() => setActiveStage(index)}
                  onBlur={() => setActiveStage(null)}
                  onClick={() => setSelectedPhoto(stage)}
                  className="group absolute z-30"
                  style={{
                    left: stage.photoPosition.left,
                    top: stage.photoPosition.top,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 4.5 + index * 0.25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.25,
                  }}
                >
                  {/* PHOTO GLOW */}
                  <motion.div
                    className="absolute inset-[-14px] rounded-full blur-md"
                    style={{
                      background: stage.colors.glow,
                    }}
                    animate={{
                      opacity: isActive ? 0.95 : 0.45,
                      scale: isActive ? 1.2 : 1,
                    }}
                    transition={{
                      duration: 0.35,
                    }}
                  />

                  {/* ROTATING PHOTO RING */}
                  <motion.div
                    className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full p-[4px]"
                    style={{
                      background: `conic-gradient(
                        from 0deg,
                        ${stage.colors.accent},
                        #ffffff,
                        ${stage.colors.accent},
                        #ffffff,
                        ${stage.colors.accent}
                      )`,
                    }}
                    animate={{
                      rotate: 360,
                      scale: isActive ? 1.13 : 1,
                    }}
                    transition={{
                      rotate: {
                        duration: isActive ? 4 : 8,
                        repeat: Infinity,
                        ease: "linear",
                      },

                      scale: {
                        duration: 0.35,
                      },
                    }}
                  >
                    <div className="h-full w-full overflow-hidden rounded-full border-[3px] border-[#FCFAF6] bg-white">
                      <img
                        src={stage.photo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </motion.div>

                  {/* TAP TO EXPLORE */}
                  <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-full bg-[#17213A]/70 px-2 text-center opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-2.5 py-1.5 text-[8px] font-semibold tracking-[0.08em] text-white shadow-lg backdrop-blur-md">
                      Tap to explore
                      <ArrowUpRight size={9} strokeWidth={2} />
                    </span>
                  </span>

                  {/* ICON BADGE */}
                  <motion.span
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#FCFAF6]"
                    style={{
                      backgroundColor: stage.colors.background,
                      color: stage.colors.dark,
                    }}
                    animate={{
                      scale: isActive ? 1.12 : 1,
                    }}
                  >
                    <Icon size={13} strokeWidth={1.8} />
                  </motion.span>
                </motion.button>
              );
            })}
          </div>

          {/* LARGE CIRCULAR CARDS */}
          {growthStages.map((stage, index) => (
            <GrowthCard
              key={stage.id}
              stage={stage}
              index={index}
              activeStage={activeStage}
              setActiveStage={setActiveStage}
            />
          ))}

          <TreeParticles />
        </div>

        {/* =====================================================
            MOBILE
            TREE REMAINS HIDDEN
        ====================================================== */}

        <div className="relative mt-14 lg:hidden">
          <div className="mx-auto flex max-w-md flex-col gap-10 px-5">
            {growthStages.map((stage, index) => (
              <MobileGrowthCard
                key={stage.id}
                stage={stage}
                index={index}
                onOpenPhoto={() => setSelectedPhoto(stage)}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM STATEMENT */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative z-10 mx-auto mt-16 max-w-3xl px-6 lg:mt-2"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-[#E8DFD0] bg-white/70 px-7 py-8 text-center shadow-[0_18px_55px_rgba(49,43,34,0.06)] backdrop-blur-sm sm:px-12">
            <div className="absolute left-0 top-0 h-full w-1 bg-[#C69A3A]" />

            <p className="font-serif text-xl leading-relaxed text-[#17213A]">
              Your growth is not a straight line.
              <span className="text-[#A47A2C]">
                {" "}
                It is a journey of roots, practice, confidence and impact.
              </span>
            </p>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          LIGHTBOX
      ====================================================== */}

      <AnimatePresence>
        {selectedPhoto && (
          <PhotoLightbox
            stage={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* =========================================================
   DESKTOP CIRCULAR GROWTH CARD
========================================================= */

function GrowthCard({ stage, index, activeStage, setActiveStage }) {
  const Icon = stage.icon;

  const isActive = activeStage === index;

  return (
    <motion.div
      className="absolute z-40 h-[350px] w-[350px]"
      style={cardPositions[stage.position]}
      initial={{
        opacity: 0,
        scale: 0.86,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.75,
        delay: 0.15 + index * 0.08,
        type: "spring",
        stiffness: 80,
      }}
      animate={{
        y: [0, -5, 0],
      }}
      whileHover={{
        scale: 1.055,
        y: -9,
      }}
      onMouseEnter={() => setActiveStage(index)}
      onMouseLeave={() => setActiveStage(null)}
      onFocus={() => setActiveStage(index)}
      onBlur={() => setActiveStage(null)}
    >
      {/* ROTATING MAIN RING */}
      <motion.div
        className="absolute inset-[-7px] rounded-full"
        style={{
          background: `conic-gradient(
            from 0deg,
            ${stage.colors.accent},
            transparent 23%,
            transparent 50%,
            ${stage.colors.accent},
            transparent 76%,
            ${stage.colors.accent}
          )`,
          opacity: isActive ? 0.95 : 0.65,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: isActive ? 7 : 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* DASHED ROTATING RING */}
      <motion.div
        className="absolute inset-[-13px] rounded-full border border-dashed"
        style={{
          borderColor: stage.colors.border,
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* MAIN CIRCLE */}
      <div
        className="relative h-full w-full overflow-visible rounded-full border-[1.5px] p-7"
        style={{
          background: `radial-gradient(
            circle at 35% 25%,
            #ffffff 0%,
            ${stage.colors.background} 65%,
            ${stage.colors.background} 100%
          )`,

          borderColor: stage.colors.border,

          boxShadow: isActive
            ? `0 22px 60px ${stage.colors.glow}`
            : "0 15px 42px rgba(42,35,28,0.08)",
        }}
      >
        <div
          className="pointer-events-none absolute right-10 top-7 h-14 w-14 rounded-full blur-xl"
          style={{
            background: stage.colors.accent,
            opacity: 0.13,
          }}
        />

        {/* NUMBER */}
        <div
          className="absolute left-1/2 top-[-12px] -translate-x-1/2 rounded-full border bg-[#FCFAF6] px-4 py-1.5 text-[9px] font-semibold tracking-[0.25em]"
          style={{
            borderColor: stage.colors.border,
            color: stage.colors.dark,
          }}
        >
          {stage.id}
        </div>

        {/* ICON */}
        <motion.div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border bg-white"
          style={{
            borderColor: stage.colors.border,
            color: stage.colors.dark,
            boxShadow: `0 8px 20px ${stage.colors.glow}`,
          }}
          animate={{
            rotate: isActive ? [0, -5, 5, 0] : 0,
          }}
          transition={{
            duration: 0.55,
          }}
        >
          <Icon size={24} strokeWidth={1.65} />
        </motion.div>

        {/* TITLE */}
        <div className="mt-3 text-center">
          <span
            className="text-[9px] font-bold tracking-[0.25em]"
            style={{
              color: stage.colors.accent,
            }}
          >
            {stage.label}
          </span>

          <h3
            className="mx-auto mt-1 max-w-[275px] font-serif text-2xl font-semibold leading-tight"
            style={{
              color: stage.colors.dark,
            }}
          >
            {stage.title}
          </h3>
        </div>

        {/* DESCRIPTION */}
        <p className="mx-auto mt-4 max-w-[270px] text-center text-[12px] leading-[1.55] text-[#4F5968]">
          {stage.description}
        </p>

        {/* POINTS */}
        <div className="mx-auto mt-4 max-w-[245px] space-y-2">
          {stage.points.map((point) => (
            <div
              key={point}
              className="flex items-center gap-2 text-[12px] leading-tight text-[#4B5563]"
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white"
                style={{
                  borderColor: stage.colors.border,
                  color: stage.colors.accent,
                }}
              >
                <Check size={10} strokeWidth={2.5} />
              </span>

              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* EXPLORE */}
        <motion.div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 text-[8px] font-semibold tracking-[0.16em]"
          style={{
            color: stage.colors.accent,
          }}
          animate={{
            opacity: [0.45, 1, 0.45],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          EXPLORE
          <ArrowUpRight size={10} />
        </motion.div>
      </div>

      {/* FLOATING QUOTE */}
      <QuoteSticker stage={stage} index={index} />
    </motion.div>
  );
}

/* =========================================================
   QUOTE STICKER
========================================================= */

function QuoteSticker({ stage, index }) {
  const rotations = [-8, 6, -5, 7, -7, 5];

  return (
    <motion.div
      className="absolute -right-[35px] -top-[18px] z-20 w-[105px]"
      initial={{
        opacity: 0,
        scale: 0.7,
        rotate: rotations[index] - 8,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
        rotate: rotations[index],
      }}
      viewport={{
        once: true,
      }}
      animate={{
        y: [0, -5, 0],
        rotate: [rotations[index], rotations[index] + 2, rotations[index]],
      }}
      transition={{
        opacity: {
          duration: 0.5,
          delay: 0.4 + index * 0.1,
        },

        scale: {
          duration: 0.5,
          delay: 0.4 + index * 0.1,
          type: "spring",
        },

        y: {
          duration: 3.8 + index * 0.2,
          repeat: Infinity,
          ease: "easeInOut",
        },

        rotate: {
          duration: 4.5 + index * 0.15,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {/* TAPE */}
      <div
        className="absolute -top-2 left-1/2 h-3 w-8 -translate-x-1/2 rotate-[-4deg] opacity-70"
        style={{
          backgroundColor: "#F6EBD5",
        }}
      />

      {/* STICKER */}
      <div
        className="relative rounded-[13px] px-3 py-3 text-center"
        style={{
          backgroundColor: stage.colors.sticker,
          color: stage.colors.dark,
          boxShadow: `4px 7px 18px ${stage.colors.glow}`,

          clipPath:
            "polygon(4% 10%,94% 4%,100% 88%,87% 97%,12% 92%,0 78%)",
        }}
      >
        <div className="font-serif text-[12px] font-semibold leading-[1.05]">
          “{stage.quote}”
        </div>

        <div className="mt-1 text-[7px] font-medium leading-[1.2] opacity-75">
          {stage.quoteSmall}
        </div>

        <motion.div
          className="mx-auto mt-1 h-[2px] w-8 rounded-full"
          style={{
            backgroundColor: stage.colors.dark,
          }}
          animate={{
            width: [25, 38, 25],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}

/* =========================================================
   MOBILE CARD
   TREE IS HIDDEN ON MOBILE
========================================================= */

function MobileGrowthCard({ stage, index, onOpenPhoto }) {
  const Icon = stage.icon;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 35,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.65,
        delay: index * 0.05,
      }}
      className="relative overflow-visible rounded-[2rem] border p-6"
      style={{
        background: stage.colors.background,
        borderColor: stage.colors.border,
        boxShadow: `0 18px 45px ${stage.colors.glow}`,
      }}
    >
      {/* MOBILE QUOTE */}
      <div className="absolute -right-3 -top-5 z-20 w-[115px] rotate-[4deg]">
        <div
          className="rounded-[14px] px-3 py-3 text-center shadow-lg"
          style={{
            backgroundColor: stage.colors.sticker,
            color: stage.colors.dark,
          }}
        >
          <p className="font-serif text-[12px] font-semibold leading-tight">
            “{stage.quote}”
          </p>

          <p className="mt-1 text-[8px] leading-tight opacity-75">
            {stage.quoteSmall}
          </p>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white"
          style={{
            borderColor: stage.colors.border,
            color: stage.colors.dark,
          }}
        >
          <Icon size={21} strokeWidth={1.6} />
        </div>

        <div className="pt-1">
          <span
            className="text-[9px] font-bold tracking-[0.25em]"
            style={{
              color: stage.colors.accent,
            }}
          >
            {stage.id} · {stage.label}
          </span>

          <h3
            className="mt-1 max-w-[210px] font-serif text-xl font-semibold leading-tight"
            style={{
              color: stage.colors.dark,
            }}
          >
            {stage.title}
          </h3>
        </div>
      </div>

      {/* IMAGE */}
      <button
        type="button"
        onClick={onOpenPhoto}
        className="group relative mt-5 block h-48 w-full overflow-hidden rounded-[1.4rem] border-2 bg-white"
        style={{
          borderColor: stage.colors.border,
        }}
      >
        <img
          src={stage.photo}
          alt={stage.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        {/* MOBILE VIEW STORY */}
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-semibold text-[#17213A] backdrop-blur">
          View story
          <ArrowUpRight size={11} />
        </span>
      </button>

      {/* DESCRIPTION */}
      <p className="mt-5 text-[11px] leading-[1.6] text-[#5D6673]">
        {stage.description}
      </p>

      {/* POINTS */}
      <div className="mt-4 space-y-2">
        {stage.points.map((point) => (
          <div
            key={point}
            className="flex items-center gap-2 text-[10px] text-[#566174]"
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white"
              style={{
                color: stage.colors.accent,
              }}
            >
              <Check size={10} />
            </span>

            {point}
          </div>
        ))}
      </div>
    </motion.article>
  );
}

/* =========================================================
   JASHNA EDU LOGO
   Uses your real logo.webp
========================================================= */

function JashnaEduLogo({ light = false }) {
  return (
    <motion.div
      className="flex items-center"
      animate={{
        y: [0, -2, 0],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="rounded-xl border p-1.5 shadow-lg backdrop-blur-md"
        style={{
          backgroundColor: light
            ? "rgba(255,255,255,0.90)"
            : "rgba(252,250,246,0.96)",

          borderColor: light ? "rgba(255,255,255,0.75)" : "#D9C9AE",

          boxShadow: light
            ? "0 10px 28px rgba(0,0,0,0.18)"
            : "0 8px 22px rgba(42,35,28,0.08)",
        }}
      >
        <img
          src={logoImage}
          alt="Jashna Edu"
          className="h-auto w-[118px] object-contain sm:w-[138px]"
        />
      </div>
    </motion.div>
  );
}

/* =========================================================
   ENLARGED IMAGE CARD / LIGHTBOX
========================================================= */

function PhotoLightbox({ stage, onClose }) {
  const Icon = stage.icon;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17213A]/80 px-4 py-8 backdrop-blur-xl sm:px-8"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      onClick={onClose}
    >
      {/* LARGE COLOR GLOW */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background: stage.colors.glow,
        }}
        initial={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: 0.8,
          scale: 1,
        }}
        transition={{
          duration: 1,
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-[1120px]"
        initial={{
          opacity: 0,
          y: 45,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 25,
          scale: 0.96,
        }}
        transition={{
          type: "spring",
          stiffness: 85,
          damping: 17,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* ROTATING OUTER FRAME */}
        <motion.div
          className="pointer-events-none absolute -inset-4 rounded-[3rem] border border-dashed"
          style={{
            borderColor: stage.colors.accent,
            opacity: 0.3,
          }}
          animate={{
            rotate: [0, 1, 0, -1, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* MAIN CARD */}
        <div
          className="relative overflow-visible rounded-[2.5rem] border p-3 shadow-[0_35px_100px_rgba(0,0,0,0.28)] sm:p-5"
          style={{
            background: `linear-gradient(
              135deg,
              #ffffff 0%,
              ${stage.colors.background} 100%
            )`,

            borderColor: stage.colors.border,
          }}
        >
          {/* DECORATIVE TAPE LEFT */}
          <motion.div
            className="pointer-events-none absolute -left-2 top-10 hidden h-12 w-28 rotate-[-7deg] opacity-60 sm:block"
            style={{
              backgroundColor: "#F4E8D0",
            }}
            animate={{
              y: [0, -3, 0],
              rotate: [-7, -5, -7],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* DECORATIVE TAPE RIGHT */}
          <motion.div
            className="pointer-events-none absolute -right-2 bottom-14 hidden h-14 w-32 rotate-[6deg] opacity-50 sm:block"
            style={{
              backgroundColor: stage.colors.sticker,
            }}
            animate={{
              y: [0, 4, 0],
              rotate: [6, 8, 6],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* CLOSE BUTTON */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#17213A] shadow-lg backdrop-blur-md sm:right-5 sm:top-5"
            whileHover={{
              scale: 1.08,
              rotate: 5,
            }}
            whileTap={{
              scale: 0.94,
            }}
          >
            <X size={18} />
          </motion.button>

          {/* CONTENT GRID */}
          <div className="grid overflow-hidden rounded-[2rem] border border-[#E8DFD0]/70 bg-[#FCFAF6] lg:grid-cols-[1.12fr_0.88fr]">
            {/* IMAGE SIDE */}
            <div
              className="relative min-h-[390px] overflow-hidden sm:min-h-[500px] lg:min-h-[650px]"
              style={{
                backgroundColor: "#EDE8DE",
              }}
            >
              {/* MAIN PHOTO */}
              <motion.img
                src={stage.photo}
                alt={stage.title}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{
                  scale: 1.08,
                }}
                animate={{
                  scale: [1.08, 1.03, 1.08],
                  x: [0, -4, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* DARK PHOTO GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#17213A]/80 via-[#17213A]/5 to-[#17213A]/10" />

              {/* COLOR WASH */}
              <div
                className="absolute inset-0 mix-blend-soft-light"
                style={{
                  background: `linear-gradient(
                    135deg,
                    ${stage.colors.accent}55,
                    transparent 45%,
                    ${stage.colors.sticker}35
                  )`,
                }}
              />

              {/* REAL JASHNA EDU LOGO */}
              <motion.div
                className="absolute left-5 top-5 z-20 sm:left-7 sm:top-7"
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.18,
                  duration: 0.6,
                }}
              >
                <JashnaEduLogo light />
              </motion.div>

              {/* STAGE BADGE */}
              <motion.div
                className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/50 bg-[#FCFAF6]/90 px-3 py-2 shadow-lg backdrop-blur-md sm:right-7 sm:top-7"
                initial={{
                  opacity: 0,
                  y: -12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.28,
                }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: stage.colors.sticker,
                    color: stage.colors.dark,
                  }}
                >
                  <Icon size={13} />
                </span>

                <span
                  className="text-[8px] font-bold tracking-[0.22em]"
                  style={{
                    color: stage.colors.dark,
                  }}
                >
                  {stage.id} · {stage.label}
                </span>
              </motion.div>

              {/* FLOATING SPARKLE */}
              <motion.div
                className="absolute right-10 top-28 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md"
                animate={{
                  y: [0, -7, 0],
                  rotate: [0, 8, 0],
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles size={16} />
              </motion.div>

              {/* BOTTOM IMAGE TITLE */}
              <motion.div
                className="absolute bottom-6 left-5 right-5 z-20 sm:bottom-8 sm:left-7 sm:right-7"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.48,
                  duration: 0.7,
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="h-[2px] w-10"
                    style={{
                      backgroundColor: stage.colors.sticker,
                    }}
                  />

                  <span className="text-[8px] font-semibold tracking-[0.3em] text-white/80">
                    THE JOURNEY
                  </span>
                </div>

                <h3 className="max-w-xl font-serif text-3xl leading-[1.03] text-white sm:text-4xl lg:text-5xl">
                  {stage.title}
                </h3>

                <p className="mt-3 max-w-lg text-[11px] leading-5 text-white/75 sm:text-xs">
                  {stage.caption}
                </p>
              </motion.div>

              {/* FLOATING QUOTE STICKER */}
              <motion.div
                className="absolute bottom-6 right-5 z-30 hidden w-[135px] sm:block"
                initial={{
                  opacity: 0,
                  scale: 0.7,
                  rotate: 7,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: [5, 7, 5],
                  y: [0, -5, 0],
                }}
                transition={{
                  opacity: {
                    duration: 0.55,
                    delay: 0.62,
                  },

                  scale: {
                    duration: 0.55,
                    delay: 0.62,
                    type: "spring",
                  },

                  rotate: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },

                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <div
                  className="relative px-4 py-4 text-center"
                  style={{
                    backgroundColor: stage.colors.sticker,
                    color: stage.colors.dark,

                    clipPath:
                      "polygon(4% 5%,95% 9%,100% 87%,88% 98%,8% 93%,0 17%)",

                    boxShadow: `8px 12px 25px ${stage.colors.glow}`,
                  }}
                >
                  <p className="font-serif text-sm font-semibold leading-tight">
                    {stage.quote}
                  </p>

                  <div
                    className="mx-auto mt-2 h-[2px] w-9"
                    style={{
                      backgroundColor: stage.colors.dark,
                    }}
                  />

                  <p className="mt-2 text-[8px] leading-4 opacity-75">
                    {stage.quoteSmall}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* INFORMATION SIDE */}
            <div
              className="relative flex flex-col justify-between px-6 py-9 sm:px-9 sm:py-11 lg:px-10 lg:py-12"
              style={{
                background: `linear-gradient(
                  155deg,
                  #ffffff 0%,
                  ${stage.colors.background} 100%
                )`,
              }}
            >
              {/* TOP LINE */}
              <div
                className="absolute left-10 right-10 top-0 h-[3px] rounded-full"
                style={{
                  background: `linear-gradient(
                    90deg,
                    transparent,
                    ${stage.colors.accent},
                    transparent
                  )`,
                }}
              />

              {/* ROTATING DECORATION */}
              <motion.div
                className="pointer-events-none absolute right-8 top-8 h-16 w-16 rounded-full border border-dashed"
                style={{
                  borderColor: stage.colors.border,
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 16,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              <div className="relative z-10">
                {/* STAGE HEADER */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: -15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.2,
                  }}
                  className="flex items-center gap-3"
                >
                  <span
                    className="font-serif text-4xl"
                    style={{
                      color: stage.colors.accent,
                    }}
                  >
                    {stage.id}
                  </span>

                  <span
                    className="h-px w-12"
                    style={{
                      backgroundColor: stage.colors.border,
                    }}
                  />

                  <span
                    className="text-[9px] font-bold tracking-[0.3em]"
                    style={{
                      color: stage.colors.dark,
                    }}
                  >
                    {stage.label}
                  </span>
                </motion.div>

                {/* BIG TITLE */}
                <motion.h4
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.28,
                  }}
                  className="mt-5 max-w-[480px] font-serif text-3xl leading-[1.05] tracking-[-0.02em] text-[#17213A] sm:text-4xl"
                >
                  {stage.title}
                </motion.h4>

                {/* CAPTION */}
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.36,
                  }}
                  className="mt-5 max-w-[500px] text-sm leading-7 text-[#596475]"
                >
                  {stage.caption}
                </motion.p>

                {/* BIG EDITORIAL QUOTE */}
                <motion.div
                  className="relative mt-7 w-fit max-w-[300px]"
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    rotate: -8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: [-4, -2, -4],
                    y: [0, -4, 0],
                  }}
                  transition={{
                    opacity: {
                      duration: 0.5,
                      delay: 0.48,
                    },

                    scale: {
                      duration: 0.5,
                      delay: 0.48,
                      type: "spring",
                    },

                    rotate: {
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },

                    y: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  {/* TAPE */}
                  <div
                    className="absolute -top-3 left-8 h-5 w-12 rotate-[-8deg] opacity-70"
                    style={{
                      backgroundColor: "#F4E8D0",
                    }}
                  />

                  {/* QUOTE */}
                  <div
                    className="relative px-6 py-5"
                    style={{
                      backgroundColor: stage.colors.sticker,
                      color: stage.colors.dark,

                      clipPath:
                        "polygon(3% 8%,96% 2%,100% 90%,88% 98%,8% 93%,0 18%)",

                      boxShadow: `8px 12px 28px ${stage.colors.glow}`,
                    }}
                  >
                    <p className="font-serif text-lg font-semibold leading-tight sm:text-xl">
                      “{stage.quote}”
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="h-[2px] w-8"
                        style={{
                          backgroundColor: stage.colors.dark,
                        }}
                      />

                      <span className="text-[8px] font-medium tracking-wide opacity-70">
                        {stage.quoteSmall}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* WHAT THIS STAGE BUILDS */}
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    delay: 0.62,
                  }}
                  className="mt-8"
                >
                  <div className="mb-3 text-[8px] font-bold tracking-[0.28em] text-[#8A8F98]">
                    WHAT THIS STAGE BUILDS
                  </div>

                  <div className="space-y-2.5">
                    {stage.points.map((point, pointIndex) => (
                      <motion.div
                        key={point}
                        initial={{
                          opacity: 0,
                          x: -12,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: 0.68 + pointIndex * 0.08,
                        }}
                        className="flex items-center gap-3"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: stage.colors.background,

                            color: stage.colors.accent,

                            border: `1px solid ${stage.colors.border}`,
                          }}
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </span>

                        <span className="text-xs font-medium text-[#4F5A68]">
                          {point}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* FOOTER */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.8,
                }}
                className="relative z-10 mt-9 border-t pt-5"
                style={{
                  borderColor: stage.colors.border,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* PROGRESS */}
                  <div className="flex items-center gap-1.5">
                    {growthStages.map((item) => (
                      <span
                        key={item.id}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: item.id === stage.id ? "24px" : "6px",

                          backgroundColor:
                            item.id === stage.id
                              ? stage.colors.accent
                              : stage.colors.border,
                        }}
                      />
                    ))}
                  </div>

                  {/* BRAND FOOTER */}
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-semibold tracking-[0.2em] text-[#89919C]">
                      JASHNA GROWTH
                    </span>

                    <motion.span
                      animate={{
                        rotate: [0, 10, -10, 0],
                        y: [0, -2, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles
                        size={14}
                        style={{
                          color: stage.colors.accent,
                        }}
                      />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* OUTSIDE FLOATING STICKER */}
          <motion.div
            className="absolute -right-5 bottom-12 hidden w-[145px] lg:block"
            initial={{
              opacity: 0,
              x: 20,
              rotate: 7,
            }}
            animate={{
              opacity: 1,
              x: 0,
              rotate: [5, 7, 5],
              y: [0, -5, 0],
            }}
            transition={{
              opacity: {
                duration: 0.6,
                delay: 0.65,
              },

              x: {
                duration: 0.6,
                delay: 0.65,
              },

              rotate: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              },

              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <div
              className="relative px-4 py-4 text-center"
              style={{
                backgroundColor: "#D9B969",
                color: "#765A25",

                clipPath:
                  "polygon(4% 5%,95% 9%,100% 87%,88% 98%,8% 93%,0 17%)",

                boxShadow: "8px 12px 25px rgba(198,154,58,0.32)",
              }}
            >
              <p className="font-serif text-sm font-semibold leading-tight">
                Keep growing.
              </p>

              <div
                className="mx-auto mt-2 h-[2px] w-10"
                style={{
                  backgroundColor: "#765A25",
                }}
              />

              <p className="mt-2 text-[8px] leading-4 opacity-75">
                Your next chapter is waiting.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   CONNECTION LINES

   Updated to match:
   - 1500px desktop canvas
   - 350px circles
   - taller 930px tree
========================================================= */

function GrowthConnectionLines({ activeStage }) {
  const lines = [
    {
      index: 0,
      color: "#D77B61",
      path: "M 350 235 C 455 235, 505 255, 590 300",
      node: [590, 300],
    },

    {
      index: 1,
      color: "#7B9C6B",
      path: "M 1150 235 C 1045 235, 995 260, 910 305",
      node: [910, 305],
    },

    {
      index: 2,
      color: "#8C7AB5",
      path: "M 350 625 C 460 625, 520 600, 590 535",
      node: [590, 535],
    },

    {
      index: 3,
      color: "#A16AA8",
      path: "M 1150 625 C 1040 625, 990 605, 910 555",
      node: [910, 555],
    },

    {
      index: 4,
      color: "#668FAE",
      path: "M 380 1015 C 500 1015, 555 895, 650 765",
      node: [650, 765],
    },

    {
      index: 5,
      color: "#C69A3A",
      path: "M 1120 1015 C 1000 1015, 945 900, 850 770",
      node: [850, 770],
    },
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 1500 1230"
      fill="none"
      preserveAspectRatio="none"
    >
      {lines.map((line) => {
        const isActive = activeStage === line.index;

        return (
          <g key={line.index}>
            {/* SOFT GLOW */}
            <motion.path
              d={line.path}
              stroke={line.color}
              strokeWidth={isActive ? 7 : 4}
              strokeLinecap="round"
              opacity={isActive ? 0.13 : 0.05}
              filter="blur(5px)"
              animate={{
                pathLength: [0.94, 1, 0.94],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* DASHED LINE */}
            <motion.path
              d={line.path}
              stroke={line.color}
              strokeWidth={isActive ? 1.8 : 1.1}
              strokeLinecap="round"
              strokeDasharray="4 8"
              opacity={isActive ? 0.75 : 0.38}
              animate={{
                strokeDashoffset: [0, -24],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* NODE */}
            <motion.circle
              cx={line.node[0]}
              cy={line.node[1]}
              r={isActive ? 7 : 5}
              fill={line.color}
              opacity={isActive ? 1 : 0.7}
              animate={{
                scale: isActive ? [1, 1.3, 1] : [1, 1.08, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <circle
              cx={line.node[0]}
              cy={line.node[1]}
              r={isActive ? 12 : 7}
              stroke={line.color}
              strokeWidth="1"
              opacity={isActive ? 0.4 : 0.15}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================
   FLOATING TREE PARTICLES
========================================================= */

function TreeParticles() {
  const particles = [
    {
      left: "42%",
      top: "145px",
      size: 4,
      delay: 0,
    },

    {
      left: "58%",
      top: "185px",
      size: 3,
      delay: 1.2,
    },

    {
      left: "38%",
      top: "330px",
      size: 3,
      delay: 2,
    },

    {
      left: "64%",
      top: "355px",
      size: 4,
      delay: 0.8,
    },

    {
      left: "44%",
      top: "520px",
      size: 3,
      delay: 1.7,
    },

    {
      left: "57%",
      top: "590px",
      size: 3,
      delay: 2.6,
    },

    {
      left: "49%",
      top: "680px",
      size: 4,
      delay: 1,
    },
  ];

  return (
    <>
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute z-30 rounded-full bg-[#C69A3A]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -14, 0],
            x: [0, 4, -3, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + index * 0.3,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}