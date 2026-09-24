import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Pause,
  VolumeX,
  Sparkles,
  Mic,
  MessageCircle,
  Globe2,
} from "lucide-react";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

import heroVideo from "../assets/videos/jashna-hero.mp4";

function Hero() {
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);

  /* =========================================================
     VIDEO CONTROL
  ========================================================= */

  const toggleVideo = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      id="top"
      className="
        relative
        min-h-[calc(100vh-20px)]
        overflow-hidden

        bg-jashna-ivory

        px-5
        pb-16
        pt-28

        sm:px-6
        sm:pb-20

        lg:px-10
        lg:pb-24
        lg:pt-32

        xl:pt-36
      "
    >
      {/* =====================================================
          ATMOSPHERIC BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        {/* =================================================
            JASHNA BLUE
        ================================================= */}

        <div
          className="
            absolute
            -left-56
            top-[12%]

            h-[520px]
            w-[520px]

            rounded-full

            bg-[#338DFD]/[0.065]

            blur-[130px]
          "
        />

        {/* =================================================
            JASHNA GREEN
        ================================================= */}

        <div
          className="
            absolute
            right-[18%]
            top-[30%]

            h-[380px]
            w-[380px]

            rounded-full

            bg-[#49C4A5]/[0.06]

            blur-[120px]
          "
        />

        {/* =================================================
            SOFT GOLD
        ================================================= */}

        <div
          className="
            absolute
            left-[28%]
            bottom-[-120px]

            h-[420px]
            w-[420px]

            rounded-full

            bg-jashna-gold/[0.055]

            blur-[130px]
          "
        />

        {/* =================================================
            CENTER LIGHT
        ================================================= */}

        <div
          className="
            absolute
            left-1/2
            top-[42%]

            h-[500px]
            w-[700px]

            -translate-x-1/2
            -translate-y-1/2

            rounded-full

            bg-white/45

            blur-[130px]
          "
        />
      </div>

      {/* =====================================================
          SUBTLE DOT TEXTURE
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0

          opacity-[0.16]

          [background-image:radial-gradient(circle_at_1px_1px,rgba(16,36,62,0.12)_1px,transparent_0)]
          [background-size:32px_32px]

          [mask-image:linear-gradient(to_bottom,black,transparent_78%)]
        "
      />

      {/* =====================================================
          FLOATING BACKGROUND PARTICLES
      ====================================================== */}

      <motion.span
        className="
          pointer-events-none
          absolute

          right-[12%]
          top-[20%]

          h-2
          w-2

          rounded-full

          bg-[#49C4A5]/80

          shadow-[0_0_16px_rgba(73,196,165,0.45)]
        "
        animate={{
          y: [0, -14, 0],
          opacity: [0.35, 0.9, 0.35],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.span
        className="
          pointer-events-none
          absolute

          left-[7%]
          top-[39%]

          h-1.5
          w-1.5

          rounded-full

          bg-[#338DFD]/70

          shadow-[0_0_14px_rgba(51,141,253,0.35)]
        "
        animate={{
          y: [0, 12, 0],
          opacity: [0.25, 0.8, 0.25],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* =====================================================
          MAIN HERO
      ====================================================== */}

      <div
        className="
          relative
          z-10

          mx-auto

          flex
          min-h-[78vh]

          max-w-[1380px]

          items-center
        "
      >
        <div
          className="
            grid
            w-full

            items-center

            gap-12

            lg:grid-cols-[0.92fr_1.08fr]

            lg:gap-12

            xl:grid-cols-[0.9fr_1.1fr]
            xl:gap-16
          "
        >
          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="
              relative
              z-20

              max-w-2xl

              pt-4

              lg:pt-0
            "
          >
            {/* =================================================
                SEO EYEBROW
            ================================================= */}

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
                delay: 0.15,
                duration: 0.6,
              }}
              className="
                mb-6

                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  h-px
                  w-9

                  bg-gradient-to-r
                  from-[#338DFD]
                  to-[#49C4A5]

                  sm:w-12
                "
              />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]

                  text-jashna-navy

                  sm:text-xs
                "
              >
                Top Spoken English & Professional Skills Institute
              </span>
            </motion.div>

            {/* =================================================
                MAIN H1
            ================================================= */}

            <h1
              className="
                font-display

                text-[3.35rem]
                font-semibold

                leading-[0.98]

                tracking-[-0.045em]

                text-jashna-charcoal

                sm:text-6xl

                md:text-7xl

                lg:text-[4.65rem]

                xl:text-[5.35rem]

                2xl:text-[5.7rem]
              "
            >
              Speak with
              <br />
              {/* =================================================
                  GRADIENT EMPHASIS
              ================================================= */}
              <span
                className="
                  relative
                  inline-block

                  bg-gradient-to-r
                  from-[#338DFD]
                  via-[#49C4A5]
                  to-[#338DFD]

                  bg-clip-text
                  text-transparent
                "
              >
                confidence.
                {/* Animated brand underline */}
                <motion.span
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: "72%",
                  }}
                  transition={{
                    delay: 0.9,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="
                    absolute

                    -bottom-2
                    left-0

                    h-[3px]

                    rounded-full

                    bg-gradient-to-r
                    from-[#338DFD]
                    via-[#49C4A5]
                    to-jashna-gold
                  "
                />
              </span>
              <br />
              Grow with
              <span
                className="
                  ml-2

                  text-[#338DFD]
                "
              >
                purpose.
              </span>
            </h1>

            {/* =================================================
                SUPPORTING PARAGRAPH
            ================================================= */}

            <motion.p
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.45,
                duration: 0.7,
              }}
              className="
                mt-8

                max-w-xl

                text-[17px]
                font-medium

                leading-[1.85]

                text-[#354255]

                sm:text-[18px]

                lg:text-[19px]
                lg:leading-[1.8]
              "
            >
             Develop stronger English language skills for academic, professional, and
            everyday success through expert-led training in spoken English, IELTS,
            public speaking, interview preparation, and workplace communication.
            </motion.p>

            {/* =================================================
                CTA BUTTONS
            ================================================= */}

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
                delay: 0.65,
                duration: 0.7,
              }}
              className="
                mt-9

                flex
                flex-col
                gap-3

                sm:flex-row
              "
            >
              {/* =================================================
                  PRIMARY CTA
              ================================================= */}

              <motion.a
                href="#consultation"
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="
                  group

                  relative

                  inline-flex
                  items-center
                  justify-center
                  gap-2

                  overflow-hidden

                  rounded-full

                  bg-gradient-to-r
                  from-[#338DFD]
                  to-[#49C4A5]

                  px-6
                  py-3.5

                  text-sm
                  font-semibold
                  text-white

                  shadow-[0_10px_30px_rgba(51,141,253,0.20)]

                  transition-all
                  duration-300

                  hover:shadow-[0_15px_38px_rgba(51,141,253,0.28)]
                  hover:brightness-[1.06]
                "
              >
                {/* =================================================
                    GLOSSY SHINE SWEEP
                ================================================= */}

                <span
                  className="
                    pointer-events-none

                    absolute
                    inset-y-0
                    -left-14

                    w-10

                    rotate-12

                    bg-white/35

                    blur-sm

                    transition-all
                    duration-700

                    group-hover:left-[115%]
                  "
                />

                {/* Subtle inner glow */}

                <span
                  className="
                    pointer-events-none

                    absolute
                    inset-0

                    rounded-full

                    bg-gradient-to-r
                    from-white/0
                    via-white/10
                    to-white/0

                    opacity-0

                    transition-opacity
                    duration-300

                    group-hover:opacity-100
                  "
                />

                <span className="relative z-10">Book a Consultation</span>

                <ArrowUpRight
                  size={17}
                  className="
                    relative
                    z-10

                    transition-transform
                    duration-300

                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </motion.a>

              {/* =================================================
                  SECONDARY CTA
              ================================================= */}

              <motion.a
                href="/programs"
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="
                  group

                  inline-flex
                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  border
                  border-jashna-charcoal/15

                  bg-white/45

                  px-6
                  py-3.5

                  text-sm
                  font-semibold

                  text-jashna-charcoal

                  backdrop-blur-sm

                  transition-all
                  duration-300

                  hover:border-[#338DFD]/30
                  hover:bg-white/75
                  hover:text-[#338DFD]

                  hover:shadow-[0_8px_24px_rgba(51,141,253,0.08)]
                "
              >
                Explore Programs
                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    duration-300

                    group-hover:translate-x-1
                  "
                />
              </motion.a>
            </motion.div>

            {/* =================================================
                TRUST / POSITIONING STRIP
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 1,
                duration: 0.7,
              }}
              className="
                mt-9

                flex
                flex-wrap
                items-center

                gap-x-5
                gap-y-3

                text-[15px]
                font-semibold

                text-[#26384d]

                sm:text-[16px]
              "
            >
              <TrustItem text="Practical learning" />

              <span
                className="
                  hidden
                  h-1
                  w-1
                  rounded-full

                  bg-jashna-gold

                  sm:block
                "
              />

              <TrustItem text="Personalized guidance" />

              <span
                className="
                  hidden
                  h-1
                  w-1
                  rounded-full

                  bg-jashna-gold

                  sm:block
                "
              />

              <TrustItem text="Career-focused training" />
            </motion.div>

            {/* =================================================
                SEO KEYWORD LINE
            ================================================= */}

            <motion.p
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 1.15,
                duration: 0.6,
              }}
              className="
                mt-5

                max-w-xl

                text-[14px]
                font-semibold

                leading-7

                tracking-[0.01em]

                text-[#4a586b]

                sm:text-[15px]
                sm:leading-7
              "
            >
              Spoken English
              <span className="mx-2 text-[#49C4A5]">•</span>
              IELTS
              <span className="mx-2 text-[#49C4A5]">•</span>
              Public Speaking
              <span className="mx-2 text-[#49C4A5]">•</span>
              Interview Skills
              <span className="mx-2 text-[#49C4A5]">•</span>
              Business English
            </motion.p>
          </motion.div>

          {/* =================================================
              RIGHT VIDEO

              MOVED UPWARD
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.9,
              ease: "easeOut",
            }}
            className="
              relative

              mx-auto

              w-full

              max-w-[720px]

              -translate-y-5

              sm:-translate-y-6

              lg:-translate-y-10

              xl:-translate-y-12
            "
          >
            <HeroVideo
              videoRef={videoRef}
              isPlaying={isPlaying}
              toggleVideo={toggleVideo}
            />
          </motion.div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM FADE
      ====================================================== */}

      <div
        className="
          pointer-events-none

          absolute
          inset-x-0
          bottom-0

          h-28

          bg-gradient-to-t
          from-jashna-ivory
          to-transparent
        "
      />
    </section>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({ text }) {
  return (
    <span
      className="
        flex
        items-center
        gap-2
      "
    >
      <span
        className="
          h-1.5
          w-1.5

          shrink-0

          rounded-full

          bg-[#49C4A5]

          shadow-[0_0_9px_rgba(73,196,165,0.35)]
        "
      />

      {text}
    </span>
  );
}

/* =========================================================
   HERO VIDEO
========================================================= */

function HeroVideo({ videoRef, isPlaying, toggleVideo }) {
  return (
    <div
      className="
        relative

        mx-auto

        w-full

        px-1

        py-7

        sm:px-3
        sm:py-8

        lg:py-10
      "
    >
      {/* =====================================================
          LARGE SOFT BRAND GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -inset-8

          rounded-[50px]

          bg-gradient-to-br
          from-[#338DFD]/14
          via-transparent
          to-[#49C4A5]/14

          blur-3xl
        "
      />

      {/* =====================================================
          ROTATING OUTER LIGHT RING
      ====================================================== */}

      <motion.div
        className="
          pointer-events-none

          absolute
          -inset-[5px]

          rounded-[36px]

          opacity-80

          bg-[conic-gradient(from_0deg,transparent_0deg,#338DFD_70deg,transparent_130deg,transparent_180deg,#49C4A5_250deg,transparent_310deg,transparent_360deg)]

          blur-[1px]
        "
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* =====================================================
          MAIN VIDEO FRAME
      ====================================================== */}

      <div
        className="
          relative

          rounded-[34px]

          bg-gradient-to-br
          from-[#338DFD]/80
          via-jashna-navy
          to-[#49C4A5]/80

          p-[2px]

          shadow-[0_30px_80px_rgba(16,36,62,0.20)]
        "
      >
        <div
          className="
            relative

            overflow-hidden

            rounded-[32px]

            bg-jashna-navy
          "
        >
          {/* =================================================
              VIDEO
          ================================================= */}

          <video
            ref={videoRef}
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="
              block

              aspect-[16/10]

              h-full
              w-full

              object-cover

              scale-[1.015]

              transition-transform
              duration-700

              hover:scale-[1.025]

              sm:aspect-[16/10]

              lg:aspect-[16/10]
            "
            aria-label="Jashna Edu learning and communication experience"
          />

          {/* =================================================
              GENERAL CINEMATIC OVERLAY
          ================================================= */}

          <div
            className="
              pointer-events-none

              absolute
              inset-0

              bg-gradient-to-t
              from-jashna-navy/65
              via-transparent
              to-jashna-navy/10
            "
          />

          {/* =================================================
              MOBILE CLEAN-UP MASK

              Stronger at the bottom so the temporary MP4's
              embedded text is less visually distracting.
          ================================================= */}

          <div
            className="
              pointer-events-none

              absolute
              inset-x-0
              bottom-0

              h-[34%]

              bg-gradient-to-t
              from-jashna-navy/95
              via-jashna-navy/45
              to-transparent

              sm:h-[22%]
              sm:from-jashna-navy/85
              sm:via-jashna-navy/30
            "
          />

          {/* =================================================
              TOP LEFT LIVE LABEL
          ================================================= */}

          <div
            className="
              absolute
              left-4
              top-4

              flex
              items-center
              gap-2

              rounded-full

              border
              border-white/20

              bg-jashna-navy/55

              px-3
              py-1.5

              shadow-lg

              backdrop-blur-md

              sm:left-5
              sm:top-5
            "
          >
            <motion.span
              animate={{
                opacity: [0.35, 1, 0.35],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="
                h-1.5
                w-1.5

                rounded-full

                bg-[#49C4A5]

                shadow-[0_0_9px_rgba(73,196,165,0.9)]
              "
            />

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.2em]

                text-white/90

                sm:text-[9px]
              "
            >
              JASHNA EDU IN ACTION
            </span>
          </div>

          {/* =================================================
              DESKTOP VIDEO MESSAGE

              Kept off mobile because the current temporary
              MP4 already contains text.
          ================================================= */}

          <div
            className="
              absolute

              bottom-5
              left-5

              hidden

              max-w-[310px]

              sm:block
            "
          >
            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.22em]

                text-[#49C4A5]
              "
            >
              Learn • Practice • Master
            </p>

            <p
              className="
                mt-1.5

                font-display

                text-xl
                leading-tight

                text-white

                drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]

                lg:text-2xl
              "
            >
              The Art of 
              <br />
              vocal assurance.
            </p>
          </div>

          {/* =================================================
              PLAY / PAUSE
          ================================================= */}

          <button
            type="button"
            onClick={toggleVideo}
            aria-label={isPlaying ? "Pause hero video" : "Play hero video"}
            className="
              absolute

              bottom-4
              right-4

              flex
              h-10
              w-10

              items-center
              justify-center

              rounded-full

              border
              border-white/25

              bg-white/10

              text-white

              shadow-lg

              backdrop-blur-md

              transition-all
              duration-300

              hover:scale-110

              hover:border-[#49C4A5]/70

              hover:bg-[#49C4A5]/20

              sm:bottom-5
              sm:right-5
            "
          >
            {isPlaying ? (
              <Pause size={15} />
            ) : (
              <Play size={15} fill="currentColor" />
            )}
          </button>

          {/* =================================================
              SMALL SHIMMER LINE
          ================================================= */}

          <motion.div
            className="
              pointer-events-none

              absolute
              left-0
              right-0
              top-0

              h-px

              bg-gradient-to-r
              from-transparent
              via-white/60
              to-transparent
            "
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2,
            }}
          />
        </div>
      </div>

      {/* =====================================================
          FLOATING COMMUNICATION BUBBLES
      ====================================================== */}

      {/* MIC */}

      <FloatingBubble
        icon={<Mic size={16} />}
        label="Speak"
        className="
          -left-3
          top-[16%]

          sm:-left-7
          sm:top-[18%]
        "
        color="blue"
        delay={0}
      />

      {/* MESSAGE */}

      <FloatingBubble
        icon={<MessageCircle size={16} />}
        label="Connect"
        className="
          -right-3
          top-[30%]

          sm:-right-7
          sm:top-[29%]
        "
        color="green"
        delay={0.8}
      />

      {/* GLOBE */}

      <FloatingBubble
        icon={<Globe2 size={15} />}
        label="Global"
        className="
          right-[3%]
          -bottom-2

          sm:right-[4%]
          -bottom-4
        "
        color="gold"
        delay={1.5}
      />

      {/* SPARKLE */}

      <FloatingBubble
        icon={<Sparkles size={15} />}
        label="Grow"
        className="
          left-[5%]
          -bottom-2

          sm:left-[7%]
          -bottom-4
        "
        color="blue"
        delay={2.2}
      />

      {/* =====================================================
          ORBITING DOTS
      ====================================================== */}

      <motion.span
        className="
          pointer-events-none

          absolute

          left-[15%]
          top-[7%]

          h-2.5
          w-2.5

          rounded-full

          bg-[#338DFD]

          shadow-[0_0_18px_rgba(51,141,253,0.7)]
        "
        animate={{
          y: [0, -9, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.span
        className="
          pointer-events-none

          absolute

          right-[16%]
          top-[8%]

          h-2
          w-2

          rounded-full

          bg-[#49C4A5]

          shadow-[0_0_18px_rgba(73,196,165,0.75)]
        "
        animate={{
          y: [0, 10, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* =========================================================
   FLOATING BUBBLE
========================================================= */

function FloatingBubble({ icon, label, className, color, delay }) {
  const colorStyles = {
    blue: {
      border: "border-[#338DFD]/30",
      icon: "bg-[#338DFD]/10 text-[#338DFD]",
      dot: "bg-[#338DFD]",
    },

    green: {
      border: "border-[#49C4A5]/35",
      icon: "bg-[#49C4A5]/10 text-[#2caa8c]",
      dot: "bg-[#49C4A5]",
    },

    gold: {
      border: "border-jashna-gold/35",
      icon: "bg-jashna-gold/10 text-jashna-gold",
      dot: "bg-jashna-gold",
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        delay,
        duration: 0.6,
      }}
      className={`
        pointer-events-none

        absolute
        z-30

        ${className}

        hidden

        sm:block
      `}
    >
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        className={`
          flex
          items-center
          gap-2

          rounded-full

          border

          ${styles.border}

          bg-white/75

          px-2
          py-2

          shadow-[0_10px_30px_rgba(16,36,62,0.10)]

          backdrop-blur-md
        `}
      >
        <span
          className={`
            flex
            h-8
            w-8

            items-center
            justify-center

            rounded-full

            ${styles.icon}
          `}
        >
          {icon}
        </span>

        <span
          className="
            pr-1

            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]

            text-[#536174]
          "
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default Hero;
