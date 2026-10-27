import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Pause,
  Sparkles,
  Mic,
  MessageCircle,
  Globe2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
} from "framer-motion";
import { useState } from "react";

import { getWhatsAppLink } from "../data/contact";

/* =========================================================
   DESIGN TOKENS
========================================================= */

const TIMES_FONT = '"Times New Roman", Times, serif';

const INK = "#0F1E3A";
const BODY = "#2B3A55";

const HEADING_GRADIENT =
  "linear-gradient(100deg, #1E3FD8 0%, #0E8FB5 38%, #0FA37F 68%, #1E3FD8 100%)";

/* =========================================================
   YOUTUBE CONFIGURATION
   Replace this ID with the founder's video ID later.
========================================================= */

const HERO_VIDEO_ID = "sKwIdAG7Zi4";

const HERO_VIDEO_URL = `https://www.youtube.com/embed/${HERO_VIDEO_ID}`;

const HERO_EMBED_URL = `${HERO_VIDEO_URL}?autoplay=1&mute=1&loop=1&playlist=${HERO_VIDEO_ID}&controls=1&playsinline=1&rel=0`;

const HERO_WATCH_URL = `https://www.youtube.com/watch?v=${HERO_VIDEO_ID}`;

/* =========================================================
   SEO STRUCTURED DATA
========================================================= */

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Jashna Edu",
  url: "https://jashnaedu.com",
  description:
    "Spoken English, IELTS, public speaking, interview preparation and business English coaching with expert-led, personalized training.",
  knowsAbout: [
    "Spoken English",
    "IELTS",
    "Public Speaking",
    "Interview Skills",
    "Business English",
  ],
};

/* =========================================================
   GRADIENT TEXT
========================================================= */

function GradientText({ children }) {
  return (
    <motion.span
      className="inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage: HEADING_GRADIENT,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero() {
  const [isPlaying, setIsPlaying] = useState(true);

  const mouseX = useMotionValue(700);
  const mouseY = useMotionValue(350);

  const spotlight = useMotionTemplate`
    radial-gradient(
      480px circle at ${mouseX}px ${mouseY}px,
      rgba(30,63,216,0.09),
      rgba(15,163,127,0.06) 45%,
      transparent 75%
    )
  `;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  /*
   * YouTube controls its own playback.
   * The custom button opens the video directly on YouTube,
   * rather than pretending to control an iframe as an HTML video.
   */
  const handleVideoAction = () => {
    window.open(HERO_WATCH_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      onMouseMove={handleMouseMove}
      style={{ fontFamily: TIMES_FONT, fontWeight: 700 }}
      className="relative flex min-h-screen flex-col overflow-hidden bg-jashna-ivory px-4 pb-6 pt-28 sm:px-6 lg:px-8"
    >
      {/* SEO structured data */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: spotlight }}
        />

        <div className="absolute -left-56 top-[12%] h-[520px] w-[520px] rounded-full bg-[#338DFD]/[0.07] blur-[130px]" />

        <div className="absolute -right-40 top-[30%] h-[460px] w-[460px] rounded-full bg-[#49C4A5]/[0.08] blur-[120px]" />

        <div className="absolute bottom-[-140px] left-[30%] h-[400px] w-[400px] rounded-full bg-jashna-gold/[0.06] blur-[130px]" />

        <div className="absolute left-1/2 top-[42%] h-[460px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45 blur-[130px]" />
      </div>

      {/* DOT TEXTURE */}

      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle_at_1px_1px,rgba(16,36,62,0.12)_1px,transparent_0)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

      {/* ROTATING RINGS */}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-72 top-[18%] hidden h-[440px] w-[440px] rounded-full border border-dashed border-[#1E3FD8]/20 xl:block"
        animate={{ rotate: 360 }}
        transition={{
          duration: 70,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-72 top-[34%] hidden h-[480px] w-[480px] rounded-full border border-dashed border-[#0FA37F]/25 xl:block"
        animate={{ rotate: -360 }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* MAIN HERO */}

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 items-center">
        <div className="grid w-full items-center gap-10 py-2 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 xl:gap-16">
          {/* LEFT CONTENT */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-20 w-full"
          >
            {/* EYEBROW */}

            <motion.p
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#1E3FD8]/20 bg-white/75 px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] shadow-[0_6px_20px_rgba(30,63,216,0.08)] backdrop-blur-sm sm:text-[12px]"
              style={{ color: "#1B3A8F" }}
            >
              <Sparkles size={14} className="shrink-0 text-[#0FA37F]" />
              Top Spoken English &amp; Professional Skills Organization
            </motion.p>

            {/* MAIN HEADING */}

            <h1
              id="hero-heading"
              className="mt-5 text-[clamp(2.4rem,4.5vw,4.6rem)] leading-[1.1] tracking-[-0.01em]"
              style={{ fontWeight: 700 }}
            >
              <span className="block">
                <GradientText>Speak with</GradientText>
              </span>

              <span className="relative block w-fit">
                <GradientText>confidence.</GradientText>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute -bottom-0.5 left-0 h-3 w-full"
                >
                  <motion.path
                    d="M2 7 Q 27 1 52 7 T 102 7 T 152 7 T 198 7"
                    fill="none"
                    stroke="#E0A82E"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      delay: 0.8,
                      duration: 1,
                      ease: "easeOut",
                    }}
                  />
                </svg>
              </span>

              <span className="block">
                <GradientText>Grow with purpose.</GradientText>
              </span>
            </h1>

            {/* SUPPORTING TEXT */}

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="mt-6 max-w-[36rem] text-[16px] leading-[1.75] sm:text-[17px] lg:text-[18px]"
              style={{ color: BODY }}
            >
              Develop stronger English language skills for academic,
              professional, and everyday success through expert-led training in{" "}
              <strong style={{ color: INK }}>spoken English</strong>,{" "}
              <strong style={{ color: INK }}>IELTS</strong>,{" "}
              <strong style={{ color: INK }}>public speaking</strong>,{" "}
              <strong style={{ color: INK }}>interview preparation</strong>, and{" "}
              <strong style={{ color: INK }}>workplace communication</strong>.
            </motion.p>

            {/* CTA BUTTONS */}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <motion.a
                href={getWhatsAppLink(
                  "Hello Dr.Shivam Sir, I would like to book a free consultation for the English communication program at Jashna Edu.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                title="Book a free consultation on WhatsApp"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#1E3FD8] to-[#0FA37F] px-7 py-3 text-[15px] text-white shadow-[0_10px_26px_rgba(30,63,216,0.28)] transition-shadow duration-300 hover:shadow-[0_14px_34px_rgba(15,163,127,0.38)]"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-14 w-10 rotate-12 bg-white/35 blur-sm transition-all duration-700 group-hover:left-[115%]" />

                <span className="relative z-10">Book a Consultation</span>

                <ArrowUpRight
                  size={17}
                  className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </motion.a>

              <motion.a
                href="/programs"
                title="Explore English communication programs"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1E3FD8]/70 bg-white/70 px-7 py-3 text-[15px] font-semibold text-[#1E3FD8] backdrop-blur-sm transition-all duration-300 hover:border-[#1E3FD8] hover:bg-[#1E3FD8] hover:text-white hover:shadow-[0_10px_26px_rgba(30,63,216,0.25)]"
              >
                Explore Programs
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </motion.a>
            </motion.div>

            {/* TRUST STRIP */}

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] sm:text-[15px]"
              style={{ color: INK }}
            >
              <TrustItem text="Practical learning" />
              <TrustItem text="Personalized guidance" />
              <TrustItem text="Career-focused training" />
            </motion.ul>
          </motion.div>

          {/* RIGHT VIDEO */}

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.9,
              ease: "easeOut",
            }}
            className="relative mx-auto w-full max-w-[640px] lg:ml-auto lg:mr-0 xl:max-w-[680px]"
          >
            <TiltCard>
              <HeroVideo
                isPlaying={isPlaying}
                onVideoAction={handleVideoAction}
              />
            </TiltCard>
          </motion.div>
        </div>
      </div>

      {/* SEO KEYWORD CLOUDS */}

      <div className="relative z-10 mx-auto mt-1 w-full max-w-[1500px]">
        <h2 className="sr-only">
          Our English communication programs: Spoken English, IELTS, Public
          Speaking, Interview Skills and Business English
        </h2>

        <SeoKeywordTrail />
      </div>

      {/* BOTTOM FADE */}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-jashna-ivory to-transparent" />
    </section>
  );
}

/* =========================================================
   TILT CARD
========================================================= */

function TiltCard({ children }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  const rotateX = useSpring(rx, {
    stiffness: 110,
    damping: 14,
  });

  const rotateY = useSpring(ry, {
    stiffness: 110,
    damping: 14,
  });

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();

    ry.set(((e.clientX - r.left) / r.width - 0.5) * 7);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 7);
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
      }}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   SEO KEYWORD CLOUDS
========================================================= */

const CLOUD_PALETTE = ["#1F6FEB", "#0F9D82", "#B8861B", "#6D5BE8"];

const CLOUD_HOLD_SECONDS = 2.5;
const CLOUD_FADE = 0.05;

function buildCloudColorCycle(offset) {
  const count = CLOUD_PALETTE.length;
  const colors = [];
  const times = [];

  for (let i = 0; i < count; i++) {
    const color = CLOUD_PALETTE[(offset + i) % count];

    colors.push(color, color);
    times.push(i / count, (i + 1) / count - CLOUD_FADE);
  }

  colors.push(CLOUD_PALETTE[offset % count]);
  times.push(1);

  return {
    colors,
    times,
    duration: count * CLOUD_HOLD_SECONDS,
  };
}

function SeoKeywordTrail() {
  const keywords = [
    { label: "Spoken English", offset: 0, stagger: "lg:mt-0" },
    { label: "IELTS", offset: 1, stagger: "lg:mt-5" },
    { label: "Public Speaking", offset: 2, stagger: "lg:mt-0" },
    { label: "Interview Skills", offset: 3, stagger: "lg:mt-5" },
    { label: "Business English", offset: 0, stagger: "lg:mt-0" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 1.1,
        duration: 0.7,
        ease: "easeOut",
      }}
      className="relative w-full pb-1 pt-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[4%] right-[4%] top-[45%] hidden h-12 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#338DFD]/[0.06] via-[#49C4A5]/[0.08] to-[#338DFD]/[0.06] blur-2xl xl:block"
      />
      {/* MOBILE: simple pills */}
    <ul className="relative z-10 flex flex-wrap justify-center gap-2 sm:hidden">
      {keywords.map((keyword, i) => (
        <li
          key={keyword.label}
          className="rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-white shadow-md"
          style={{ backgroundColor: CLOUD_PALETTE[i % CLOUD_PALETTE.length] }}
        >
          {keyword.label}
        </li>
      ))}
    </ul>
      <ul className="relative z-10 hidden sm:flex flex-wrap items-center justify-center gap-x-5 gap-y-8 xl:flex-nowrap xl:items-start xl:justify-between xl:gap-x-4">
        {keywords.map((keyword, index) => (
          <li key={keyword.label} className={keyword.stagger}>
            <CloudBubble
              label={keyword.label}
              offset={keyword.offset}
              index={index}
            />
          </li>
        ))}
      </ul>

      <p
        className="mt-6 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] sm:text-[12px]"
        style={{ color: BODY }}
      >
        <span className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#338DFD]/50" />

        <span>Communication · Confidence · Growth</span>

        <span className="h-[2px] w-10 bg-gradient-to-r from-[#49C4A5]/50 to-transparent" />
      </p>
    </motion.div>
  );
}

/* =========================================================
   CLOUD BUBBLE
========================================================= */

function CloudBubble({ label, offset, index }) {
  const { colors, times, duration } = buildCloudColorCycle(offset);

  const syncedColor = {
    style: {
      backgroundColor: colors[0],
    },
    animate: {
      backgroundColor: colors,
    },
    transition: {
      duration,
      times,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.07 }}
      transition={{
        delay: 1.3 + index * 0.1,
        duration: 0.6,
        ease: "easeOut",
      }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4 + index * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.5,
        }}
        className="relative drop-shadow-[0_10px_18px_rgba(16,36,62,0.14)]"
      >
        {/* TOP PUFFS */}

        <motion.span
          aria-hidden="true"
          {...syncedColor}
          className="pointer-events-none absolute -top-2.5 left-[14%] h-7 w-7 rounded-full"
        />

        <motion.span
          aria-hidden="true"
          {...syncedColor}
          className="pointer-events-none absolute -top-4 left-[38%] h-10 w-10 rounded-full"
        />

        <motion.span
          aria-hidden="true"
          {...syncedColor}
          className="pointer-events-none absolute -top-2 right-[14%] h-6 w-6 rounded-full"
        />

        {/* BOTTOM PUFFS */}

        <motion.span
          aria-hidden="true"
          {...syncedColor}
          className="pointer-events-none absolute -bottom-1.5 left-[22%] h-5 w-5 rounded-full"
        />

        <motion.span
          aria-hidden="true"
          {...syncedColor}
          className="pointer-events-none absolute -bottom-2 right-[26%] h-6 w-6 rounded-full"
        />

        {/* KEYWORD */}

        <motion.div
          {...syncedColor}
          className="relative flex items-center justify-center rounded-full px-6 py-3 sm:px-7 sm:py-3.5 lg:px-8"
        >
          <span className="relative z-10 whitespace-nowrap text-center text-[12px] uppercase tracking-[0.1em] text-white drop-shadow-[0_1px_2px_rgba(11,27,51,0.5)] sm:text-[13px] lg:text-[14px]">
            {label}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({ text }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 size={18} className="shrink-0 text-[#0FA37F]" />

      {text}
    </li>
  );
}

/* =========================================================
   HERO VIDEO
   YouTube embed with a premium branded frame.
========================================================= */

function HeroVideo({ isPlaying, onVideoAction }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative mx-auto w-full px-1 py-7 sm:px-3 sm:py-8 lg:py-9">
      {/* BRAND GLOW */}

      <div className="pointer-events-none absolute -inset-8 rounded-[50px] bg-gradient-to-br from-[#338DFD]/20 via-transparent to-[#49C4A5]/20 blur-3xl" />

      {/* ROTATING OUTER RING */}

      <motion.div
        className="pointer-events-none absolute -inset-[5px] rounded-[36px] bg-[conic-gradient(from_0deg,transparent_0deg,#338DFD_70deg,transparent_130deg,transparent_180deg,#49C4A5_250deg,transparent_310deg,transparent_360deg)] opacity-80 blur-[1px]"
        animate={{ rotate: 360 }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* MAIN FRAME */}

      <div className="relative rounded-[34px] bg-gradient-to-br from-[#338DFD]/80 via-jashna-navy to-[#49C4A5]/80 p-[2px] shadow-[0_30px_80px_rgba(16,36,62,0.24)]">
        <div className="relative overflow-hidden rounded-[32px] bg-jashna-navy">
          {/* VIDEO */}

          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#07152B]">
            {play ? (
              <iframe
                src={HERO_EMBED_URL}
                title="Jashna Edu — English Communication and Learning"
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlay(true)}
                aria-label="Play Jashna Edu video"
                className="group absolute inset-0 h-full w-full"
              >
                <img
                  src={`https://img.youtube.com/vi/${HERO_VIDEO_ID}/hqdefault.jpg`}
                  alt="Jashna Edu video thumbnail"
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
                <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1E3FD8] shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Play size={26} className="ml-1" fill="currentColor" />
                </span>
              </button>
            )}
          </div>

          {/* CINEMATIC OVERLAY */}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-jashna-navy/50 via-transparent to-jashna-navy/10" />

          {/* TOP LABEL */}

          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/20 bg-[#102B4E]/80 px-3 py-1.5 shadow-lg backdrop-blur-md sm:left-5 sm:top-5 sm:px-3.5">
            <motion.span
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="h-2 w-2 rounded-full bg-[#49C4A5] shadow-[0_0_9px_rgba(73,196,165,0.9)]"
            />

            <span className="text-[9px] uppercase tracking-[0.15em] text-white sm:text-[11px] sm:tracking-[0.18em]">
              Jashna Edu in action
            </span>
          </div>

          {/* VIDEO CAPTION */}

          <div className="pointer-events-none absolute bottom-4 left-4 max-w-[65%] sm:bottom-5 sm:left-5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#7FE6C8] sm:text-[10px] sm:tracking-[0.2em]">
              Learn • Practice • Master
            </p>

            <p className="mt-1 text-lg leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-xl lg:text-2xl">
              The Art of
              <br />
              vocal assurance.
            </p>
          </div>

          {/* OPEN ON YOUTUBE */}

          <a
            href={HERO_WATCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch the Jashna Edu video on YouTube"
            title="Watch on YouTube"
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#49C4A5] hover:bg-[#49C4A5]/30 sm:bottom-5 sm:right-5"
          >
            <ExternalLink size={16} />
          </a>

          {/* SUBTLE SHIMMER */}

          <motion.div
            className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2,
            }}
          />
        </div>
      </div>

      {/* FLOATING COMMUNICATION BUBBLES */}

      <FloatingBubble
        icon={<Mic size={16} />}
        label="Speak"
        className="-left-3 top-[16%] sm:-left-8 sm:top-[18%]"
        color="blue"
        delay={0}
      />

      <FloatingBubble
        icon={<MessageCircle size={16} />}
        label="Connect"
        className="-right-3 top-[34%] sm:-right-8 sm:top-[36%]"
        color="green"
        delay={0.8}
      />

      <FloatingBubble
        icon={<Globe2 size={15} />}
        label="Global"
        className="right-[8%] -top-3 sm:right-[10%] sm:-top-2"
        color="gold"
        delay={1.5}
      />

      {/* ORBITING DOTS */}

      <motion.span
        className="pointer-events-none absolute left-[15%] top-[7%] h-2.5 w-2.5 rounded-full bg-[#338DFD] shadow-[0_0_18px_rgba(51,141,253,0.7)]"
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
        className="pointer-events-none absolute bottom-[10%] right-[16%] h-2 w-2 rounded-full bg-[#49C4A5] shadow-[0_0_18px_rgba(73,196,165,0.75)]"
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
      border: "border-[#338DFD]/40",
      icon: "bg-[#338DFD]/15 text-[#0D4FB3]",
    },
    green: {
      border: "border-[#49C4A5]/45",
      icon: "bg-[#49C4A5]/15 text-[#0B7F69]",
    },
    gold: {
      border: "border-jashna-gold/45",
      icon: "bg-jashna-gold/15 text-[#8A6410]",
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.6,
      }}
      className={`pointer-events-none absolute z-30 hidden sm:block ${className}`}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        className={`flex items-center gap-2 rounded-full border-2 bg-white/85 px-2 py-2 shadow-[0_10px_30px_rgba(16,36,62,0.12)] backdrop-blur-md ${styles.border}`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${styles.icon}`}
        >
          {icon}
        </span>

        <span
          className="pr-2 text-[10px] uppercase tracking-[0.12em]"
          style={{ color: INK }}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default Hero;
