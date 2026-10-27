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
  Mic,
  Play,
  Shuffle,
  X,
} from "lucide-react";

import activityVideos from "../../data/activityVideos";

/* ============================================================
   DESIGN TOKENS
   Deep navy stage. Two videos, two accents. The section's ambient
   glow follows whichever video the learner is pointing at.
   Fraunces for voice, Plus Jakarta Sans for clarity.
============================================================ */

const INK = "#12304F";
const MID = "#1A4570";
const PANEL = "#1D4166";
const EASE = [0.22, 1, 0.36, 1];

const accents = [
  { color: "#5AA2FF", name: "blue" },
  { color: "#3CC6A3", name: "teal" },
];

const TOTAL_SECONDS = 30;

const speakingPrompts = [
  "Pitch an app idea you would actually use every day.",
  "Describe a place you would recommend to a first-time visitor.",
  "Talk about a mistake that taught you something valuable.",
  "Explain your job, or your studies, to someone who has never heard of them.",
  "Argue for or against working from home.",
  "Describe the last thing that made you genuinely laugh.",
  "Give directions from your home to the nearest market.",
  "Introduce yourself as if you were in a job interview.",
  "Explain how to cook your favourite dish, step by step.",
  "Talk about a skill you would love to learn, and why.",
  "Describe your perfect weekend from morning to night.",
  "Convince a friend to read a book you love.",
];

/* ============================================================
   DEVICE HELPER
   True only for a large screen with a real mouse. On phones and
   tablets there is no hover, so every card is shown at full
   brightness and a tap opens the player.
============================================================ */

const HOVER_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

function useCanHover() {
  const [canHover, setCanHover] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(HOVER_QUERY).matches
      : false,
  );

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(HOVER_QUERY);
    const onChange = (e) => setCanHover(e.matches);
    setCanHover(mq.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  return canHover;
}

/* ============================================================
   ACTIVITY CONTENT
   Keyed by video id. Anything without an entry falls back to the
   fields on the video itself (see getContent).
============================================================ */

const titleOf = (a) => String(a?.title || "").toLowerCase();
const isIce = (a) => /\bice\b|melt/.test(titleOf(a));
const isSpin = (a) => /spin|wheel/.test(titleOf(a));

const activityContent = {
  ice: {
    skill: "Speaking in Action",
    tagline: "Think fast. Speak clearly. Keep the words moving.",
    description:
      "A playful speaking challenge that pushes learners to think quickly, stay focused and keep expressing their ideas under pressure.",
  },
  spin: {
    skill: "Spontaneity in Action",
    tagline: "Spin the prompt. Own the conversation.",
    description:
      "An unexpected prompt becomes a reason to speak. Learners react, organise their thoughts and express themselves without rehearsed answers.",
  },
};

const getContent = (activity) => {
  if (isIce(activity)) return activityContent.ice;
  if (isSpin(activity)) return activityContent.spin;
  return {
    skill: activity?.tag || "Learning in Action",
    tagline: activity?.description || "A real learning moment in action.",
    description:
      activity?.description ||
      "A practical activity designed to make English active and engaging.",
  };
};

/* ============================================================
   EMBED HELPERS
   Paste normal share links in data/activityVideos.js (`video`).
   Supported: YouTube (incl. Shorts), Vimeo, Google Drive,
   and direct .mp4/.webm files.
   Optional per-video field: orientation: "portrait" | "landscape"
============================================================ */

const parseVideo = (url = "") => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    const parts = u.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") return { provider: "youtube", id: parts[0] };

    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") || parts[parts.length - 1];
      return { provider: "youtube", id };
    }

    if (host.endsWith("vimeo.com")) {
      const id = parts.find((p) => /^\d+$/.test(p));
      return id ? { provider: "vimeo", id } : null;
    }

    if (host === "drive.google.com") {
      const dIndex = parts.indexOf("d");
      const id = dIndex !== -1 ? parts[dIndex + 1] : u.searchParams.get("id");
      return id ? { provider: "drive", id } : null;
    }

    if (/\.(mp4|webm|ogg)$/i.test(u.pathname)) {
      return { provider: "file", url };
    }
  } catch {
    // not a valid URL
  }
  return null;
};

const buildEmbedUrl = (
  parsed,
  { autoplay = false, muted = false, controls = true, loop = false } = {},
) => {
  if (!parsed) return null;
  const flag = (v) => (v ? "1" : "0");

  if (parsed.provider === "youtube") {
    const params = new URLSearchParams({
      autoplay: flag(autoplay),
      mute: flag(muted),
      controls: flag(controls),
      rel: "0",
      playsinline: "1",
      modestbranding: "1",
    });
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", parsed.id);
    }
    return `https://www.youtube.com/embed/${parsed.id}?${params}`;
  }

  if (parsed.provider === "vimeo") {
    const params = new URLSearchParams({
      autoplay: flag(autoplay),
      muted: flag(muted),
      loop: flag(loop),
      title: "0",
      byline: "0",
      portrait: "0",
    });
    return `https://player.vimeo.com/video/${parsed.id}?${params}`;
  }

  if (parsed.provider === "drive") {
    return `https://drive.google.com/file/d/${parsed.id}/preview`;
  }

  return null;
};

const getThumbnail = (activity) => {
  if (activity?.thumbnail) return activity.thumbnail;
  const parsed = parseVideo(activity?.video);
  if (parsed?.provider === "youtube") {
    return `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`;
  }
  if (parsed?.provider === "drive") {
    return `https://drive.google.com/thumbnail?id=${parsed.id}&sz=w1000`;
  }
  return null;
};

const isPortrait = (activity) => {
  if (activity?.orientation) return activity.orientation === "portrait";
  return /youtube\.com\/shorts\//i.test(activity?.video || "");
};

/* ============================================================
   VIDEO PLAYER (iframe or <video>)
============================================================ */

function VideoPlayer({ url, autoplay, muted, controls, loop, title }) {
  const parsed = parseVideo(url);

  if (parsed?.provider === "file") {
    return (
      <video
        src={parsed.url}
        autoPlay={autoplay}
        muted={muted}
        controls={controls}
        loop={loop}
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  const src = buildEmbedUrl(parsed, { autoplay, muted, controls, loop });

  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#1D4166] p-6 text-center text-sm text-white/70">
        This video link isn&apos;t supported. Use a YouTube or Google
        Drive link.
      </div>
    );
  }

  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 h-full w-full border-0"
    />
  );
}

/* ============================================================
   VIDEO CARD
   Desktop: two cards share the stage. The one under the pointer
   grows and starts a muted live preview after a short pause.
   Mobile / tablet: cards stack at full brightness; a tap opens
   the full player.
============================================================ */

function VideoCard({
  activity,
  accent,
  active,
  canHover,
  onActivate,
  onOpen,
  index,
  reduceMotion,
}) {
  const [hovered, setHovered] = useState(false);
  const [live, setLive] = useState(false);

  const portrait = isPortrait(activity);
  const thumb = getThumbnail(activity);

  /* start the muted preview only after the pointer settles */
  useEffect(() => {
    if (!hovered || reduceMotion || !canHover) {
      setLive(false);
      return undefined;
    }
    const t = setTimeout(() => setLive(true), 700);
    return () => clearTimeout(t);
  }, [hovered, reduceMotion, canHover]);

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: EASE }}
      className="relative h-[420px] min-w-0 transition-[flex-grow] duration-700 ease-[cubic-bezier(.22,1,.36,1)] sm:h-[520px] lg:h-full lg:basis-0"
      style={{ flexGrow: canHover && active ? 1.45 : 1 }}
    >
      <div
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") {
            setHovered(true);
            onActivate();
          }
        }}
        onPointerLeave={() => setHovered(false)}
        onMouseMove={handleMove}
        className="group relative h-full w-full overflow-hidden rounded-[24px] border bg-[#1D4166] transition-[box-shadow,border-color] duration-700 sm:rounded-[28px]"
        style={{
          borderColor: active ? `${accent.color}88` : "rgba(255,255,255,.1)",
          boxShadow: active
            ? `0 40px 90px -35px ${accent.color}aa, 0 0 0 1px ${accent.color}22`
            : "0 20px 50px -30px rgba(0,0,0,.7)",
        }}
      >
        {/* thumbnail */}
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] ${
              active
                ? "scale-100 brightness-100 saturate-100"
                : "scale-105 brightness-[.6] saturate-75"
            }`}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 25%, ${accent.color}66, transparent 60%), ${PANEL}`,
            }}
          />
        )}

        {/* muted live preview, cropped to cover the card */}
        {live && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
            <div
              className="absolute"
              style={
                portrait
                  ? {
                      left: 0,
                      width: "100%",
                      aspectRatio: "9 / 16",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }
                  : {
                      top: 0,
                      height: "100%",
                      aspectRatio: "16 / 9",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }
              }
            >
              <VideoPlayer
                url={activity.video}
                autoplay
                muted
                loop
                controls={false}
                title={`${activity.title} preview`}
              />
            </div>
          </div>
        )}

        {/* depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(14,38,66,.95) 0%, rgba(14,38,66,.45) 45%, rgba(14,38,66,.25) 100%)",
          }}
        />

        {/* cursor spotlight (desktop only) */}
        <div
          className={`pointer-events-none absolute inset-0 hidden transition-opacity duration-500 lg:block ${
            active ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.12), transparent 60%)",
          }}
        />

        {/* content */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex max-w-[75%] items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-xl sm:max-w-[70%] sm:px-3.5 sm:text-xs">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: accent.color }}
              />
              <span className="truncate">{activity.skill}</span>
            </span>

            {live && (
              <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-xl">
                <span className="eq-bar h-3 w-[3px] rounded-full bg-white" />
                Muted preview
              </span>
            )}
          </div>

          {/* centre play */}
          <div className="flex items-center justify-center">
            <span
              className="relative flex h-[64px] w-[64px] items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-xl transition duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-[#08182B] group-active:scale-95 sm:h-[76px] sm:w-[76px]"
              style={{ boxShadow: `0 0 60px -6px ${accent.color}` }}
            >
              {!reduceMotion && active && (
                <span
                  className="pulse-ring absolute inset-0 rounded-full border-2"
                  style={{ borderColor: accent.color }}
                />
              )}
              <Play
                size={24}
                fill="currentColor"
                className="relative ml-1 sm:h-[26px] sm:w-[26px]"
              />
            </span>
          </div>

          <div>
            <h3 className="ra-heading max-w-xl text-[1.7rem] font-bold leading-[1.1] tracking-tight text-white sm:text-4xl sm:leading-[1.08]">
              {activity.title}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/80 sm:mt-3 sm:text-base sm:text-white/75">
              {activity.tagline}
            </p>
            <span
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#08182B] transition-all duration-300 group-hover:gap-3 sm:mt-5"
              style={{ background: accent.color }}
            >
              Watch with sound
              <ArrowRight size={16} />
            </span>
          </div>
        </div>

        {/* one button covers the card */}
        <button
          type="button"
          onClick={() => onOpen(activity)}
          onFocus={onActivate}
          aria-label={`Watch ${activity.title}`}
          className="absolute inset-0 z-30 rounded-[24px] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 sm:rounded-[28px]"
        />
      </div>
    </motion.div>
  );
}

/* ============================================================
   30-SECOND SPEAKING CHALLENGE
   Draw a prompt, start the clock, keep talking.
============================================================ */

function PromptChallenge({ accent, reduceMotion }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | running | done
  const [left, setLeft] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (status !== "running") return undefined;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "running" && left === 0) setStatus("done");
  }, [left, status]);

  const newPrompt = () => {
    setPromptIndex((current) => {
      let next = current;
      while (next === current && speakingPrompts.length > 1) {
        next = Math.floor(Math.random() * speakingPrompts.length);
      }
      return next;
    });
    setStatus("idle");
    setLeft(TOTAL_SECONDS);
  };

  const start = () => {
    setLeft(TOTAL_SECONDS);
    setStatus("running");
  };

  const stop = () => {
    setStatus("idle");
    setLeft(TOTAL_SECONDS);
  };

  const R = 54;
  const C = 2 * Math.PI * R;
  const progress = 1 - left / TOTAL_SECONDS;

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="relative mt-14 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:mt-20 sm:rounded-[36px] sm:p-10 lg:mt-28 lg:p-14"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-[100px] transition-colors duration-1000"
        style={{ background: accent.color }}
      />

      <div className="relative grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* left: invitation */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/70">
            <Mic size={16} style={{ color: accent.color }} />
            Try it yourself
          </span>
          <h3 className="ra-heading mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:mt-4 sm:text-5xl sm:leading-[1.08]">
            Your turn to speak.
          </h3>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-white/70 sm:mt-5 sm:text-lg sm:leading-8 lg:mx-0">
            Draw a prompt, start the clock and keep talking until it runs out.
            No notes, no restarts. The first sentence is the hardest.
          </p>
        </div>

        {/* right: prompt + timer */}
        <div className="rounded-[24px] border border-white/10 bg-[#12304F]/70 p-5 sm:rounded-[28px] sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
            {/* ring */}
            <div className="relative h-[116px] w-[116px] shrink-0 sm:h-[132px] sm:w-[132px]">
              <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
                <circle
                  cx="66"
                  cy="66"
                  r={R}
                  fill="none"
                  stroke="rgba(255,255,255,.1)"
                  strokeWidth="6"
                />
                <circle
                  cx="66"
                  cy="66"
                  r={R}
                  fill="none"
                  stroke={accent.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * progress}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                  style={{ filter: `drop-shadow(0 0 8px ${accent.color}88)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="ra-heading text-4xl font-bold leading-none text-white">
                  {left}
                </span>
                <span className="mt-1 text-xs font-semibold text-white/55">
                  {status === "running" ? "speaking" : "seconds"}
                </span>
              </div>
            </div>

            {/* prompt */}
            <div className="flex min-h-[96px] flex-1 items-center justify-center text-center sm:min-h-[112px] sm:justify-start sm:text-left">
              <AnimatePresence mode="wait">
                <motion.p
                  key={status === "done" ? "done" : promptIndex}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                  transition={{ duration: 0.35 }}
                  className="ra-heading text-lg font-semibold leading-snug text-white sm:text-2xl"
                >
                  {status === "done"
                    ? "Time. That is 30 seconds of real English."
                    : speakingPrompts[promptIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* controls */}
          <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center">
            {status === "running" ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto sm:py-3"
              >
                <X size={16} />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={status === "done" ? newPrompt : start}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-[#08182B] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto sm:py-3"
                style={{ background: accent.color }}
              >
                {status === "done" ? (
                  <>
                    <Shuffle size={16} />
                    Try another prompt
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    Start 30 seconds
                  </>
                )}
              </button>
            )}

            {status !== "done" && (
              <button
                type="button"
                onClick={newPrompt}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3.5 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto sm:py-3"
              >
                <Shuffle size={15} />
                Click Me For a New Prompt
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   THE TWO VIDEOS
   Ice challenge + Spin wheel challenge, in that order. The fire
   challenge is excluded here as a safety net; delete its entry
   from data/activityVideos.js too.
============================================================ */

const pool = activityVideos.filter(Boolean).filter((a) => !/\bfire\b/.test(titleOf(a)));
const picked = [pool.find(isIce), pool.find(isSpin)].filter(Boolean);

const activities = [...picked, ...pool.filter((a) => !picked.includes(a))]
  .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)
  .slice(0, 2)
  .map((a) => ({ ...a, ...getContent(a) }));

/* ============================================================
   MAIN COMPONENT
============================================================ */

function Activity() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const canHover = useCanHover();
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeId, setActiveId] = useState(activities[0]?.id);

  const accentFor = (activity) => {
    const i = activities.findIndex((a) => a.id === activity?.id);
    return accents[i === -1 ? 0 : i % accents.length];
  };

  const activeActivity =
    activities.find((a) => a.id === activeId) || activities[0];
  const activeAccent = accentFor(activeActivity);

  /* ---------- modal navigation ---------- */

  const currentIndex = selectedActivity
    ? activities.findIndex((a) => a.id === selectedActivity.id)
    : -1;

  const goToActivity = (direction) => {
    if (!selectedActivity || activities.length < 2 || currentIndex === -1) {
      return;
    }
    const next =
      direction === "next"
        ? (currentIndex + 1) % activities.length
        : (currentIndex - 1 + activities.length) % activities.length;
    setSelectedActivity(activities[next]);
    setActiveId(activities[next].id);
  };

  useEffect(() => {
    if (!selectedActivity) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") setSelectedActivity(null);
      if (e.key === "ArrowRight") goToActivity("next");
      if (e.key === "ArrowLeft") goToActivity("previous");
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedActivity]);

  if (!activities.length) return null;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 28 },
    animate: sectionInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, delay, ease: EASE },
  });

  const modalPortrait = selectedActivity ? isPortrait(selectedActivity) : false;
  const modalAccent = selectedActivity
    ? accentFor(selectedActivity)
    : accents[0];
  const modalThumb = selectedActivity ? getThumbnail(selectedActivity) : null;
  const otherActivity =
    currentIndex !== -1 && activities.length > 1
      ? activities[(currentIndex + 1) % activities.length]
      : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .ra-section { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .ra-heading { font-family: 'Fraunces', Georgia, serif; }

        @keyframes pulseRing {
          0%   { transform: scale(1);    opacity: .8; }
          100% { transform: scale(1.7);  opacity: 0; }
        }
        @keyframes eq {
          0%, 100% { transform: scaleY(.3); }
          50%      { transform: scaleY(1); }
        }
        .pulse-ring { animation: pulseRing 2.6s ease-out infinite; }
        .eq-bar { transform-origin: bottom; animation: eq 1.1s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .pulse-ring, .eq-bar { animation: none !important; }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="learning-in-action"
        className="ra-section relative isolate overflow-hidden py-16 text-white sm:py-24 lg:py-32"
        style={{
          background: `linear-gradient(180deg, ${INK} 0%, ${MID} 55%, ${INK} 100%)`,
        }}
      >
        {/* ================= BACKGROUND ================= */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* fine dot grid, fading toward the edges */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)",
              maskImage:
                "radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)",
            }}
          />

          {/* ambient glow that takes on the active video's colour */}
          <motion.div
            className="absolute left-1/2 top-[48%] h-[420px] w-[min(1100px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] sm:h-[620px] sm:blur-[150px]"
            animate={{ backgroundColor: activeAccent.color }}
            initial={false}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ opacity: 0.3 }}
          />
          <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#2F7FE8]/15 blur-[120px]" />
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#2FA98A]/15 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
          {/* ================= INTRO ================= */}
          <div className="grid items-end gap-5 sm:gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <motion.h2
              {...fadeUp(0)}
              className="ra-heading text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl sm:leading-[1.02] lg:text-[5rem]"
            >
              Proof, not promise.
            </motion.h2>

            <motion.div {...fadeUp(0.15)} className="max-w-md lg:pb-2">
              <p className="text-base font-medium leading-7 text-white/90 sm:text-xl sm:leading-9">
                Real learners. Real challenges. Zero rehearsals.
              </p>
              <p
                className="ra-heading mt-2 text-lg font-semibold leading-7 transition-colors duration-1000 sm:mt-3 sm:text-xl"
                style={{ color: activeAccent.color }}
              >
                We don&apos;t teach confidence — we provoke it.
              </p>
            </motion.div>
          </div>

          {/* ================= STAGE HEADER ================= */}
          <motion.div
            {...fadeUp(0.3)}
            className="mb-6 mt-10 flex items-center gap-3 sm:mb-8 sm:mt-16 sm:gap-4 lg:mb-10"
          >
            <span className="flex items-end gap-1" aria-hidden="true">
              {[0, 0.2, 0.4, 0.1, 0.3].map((d, i) => (
                <span
                  key={i}
                  className="eq-bar h-4 w-[3px] rounded-full transition-colors duration-1000"
                  style={{
                    background: activeAccent.color,
                    animationDelay: `${d}s`,
                  }}
                />
              ))}
            </span>
            <span className="text-sm font-medium text-white/65 sm:text-[15px]">
              <span className="hidden lg:inline">
                Hover a video to preview it. Click to watch with sound.
              </span>
              <span className="lg:hidden">Tap a video to watch it.</span>
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </motion.div>

          {/* ================= TWO-VIDEO STAGE ================= */}
          <div className="flex flex-col gap-4 lg:h-[600px] lg:flex-row lg:gap-5">
            {activities.map((activity, i) => (
              <VideoCard
                key={activity.id}
                activity={activity}
                accent={accentFor(activity)}
                active={!canHover || activity.id === activeId}
                canHover={canHover}
                onActivate={() => setActiveId(activity.id)}
                onOpen={(a) => {
                  setActiveId(a.id);
                  setSelectedActivity(a);
                }}
                index={i}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>

          {/* ================= YOUR TURN ================= */}
          <PromptChallenge accent={activeAccent} reduceMotion={reduceMotion} />

          {/* ================= CLOSING ================= */}
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mx-auto mt-16 max-w-3xl px-2 text-center sm:mt-24 lg:mt-32"
          >
            <p className="ra-heading text-[1.75rem] font-bold leading-[1.18] tracking-tight sm:text-4xl sm:leading-[1.15] lg:text-5xl">
              Confidence doesn&apos;t arrive before you speak.
            </p>
            <p className="mt-3 text-base font-medium text-white/60 sm:mt-4 sm:text-lg">
              It arrives because you did.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= VIDEO MODAL ================= */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="ra-section fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#0B2036]/80 px-3 pb-6 pt-16 backdrop-blur-xl sm:items-center sm:p-6 lg:p-10"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelectedActivity(null);
            }}
            role="dialog"
            aria-modal="true"
            aria-label={selectedActivity.title}
          >
            {/* ambient glow from the video's own thumbnail */}
            <AnimatePresence>
              <motion.div
                key={selectedActivity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="pointer-events-none fixed inset-0 overflow-hidden"
              >
                {modalThumb && (
                  <img
                    src={modalThumb}
                    alt=""
                    className="h-full w-full scale-125 object-cover opacity-30 blur-3xl saturate-150"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 50% 40%, ${modalAccent.color}30, transparent 60%)`,
                  }}
                />
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{
                opacity: 0,
                scale: reduceMotion ? 1 : 0.94,
                y: reduceMotion ? 0 : 30,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={`relative my-auto w-full ${
                modalPortrait ? "max-w-4xl" : "max-w-5xl"
              }`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* close: sits in the top gap above the card on every screen */}
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                aria-label="Close video"
                className="absolute right-0 top-[-52px] z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-xl transition duration-300 hover:bg-white hover:text-[#08182B] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X size={18} />
              </button>

              {/* frame */}
              <div
                className="rounded-[26px] p-[1.5px] sm:rounded-[32px]"
                style={{
                  background: `linear-gradient(145deg, ${modalAccent.color}, rgba(255,255,255,.16) 40%, rgba(255,255,255,.05) 65%, ${modalAccent.color}99)`,
                  boxShadow: `0 60px 140px -30px rgba(0,0,0,.75), 0 0 120px -30px ${modalAccent.color}66`,
                }}
              >
                <div
                  className={`overflow-hidden rounded-[24.5px] bg-[#1D4166] sm:rounded-[30.5px] ${
                    modalPortrait ? "md:flex" : ""
                  }`}
                >
                  {/* video — key gives a fresh iframe on switch */}
                  <div
                    className={`relative bg-black ${
                      modalPortrait
                        ? "mx-auto aspect-[9/16] max-h-[68dvh] w-full max-w-[300px] shrink-0 sm:max-h-[76vh] sm:max-w-[340px] md:mx-0"
                        : "aspect-video w-full"
                    }`}
                  >
                    <VideoPlayer
                      key={selectedActivity.id}
                      url={selectedActivity.video}
                      autoplay
                      muted={false}
                      controls
                      title={selectedActivity.title}
                    />
                  </div>

                  {/* info panel */}
                  <div className="flex flex-1 flex-col justify-between gap-6 p-5 sm:gap-8 sm:p-8">
                    <motion.div
                      key={selectedActivity.id}
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.08 }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white">
                          <span
                            className="flex items-end gap-[2px]"
                            aria-hidden="true"
                          >
                            {[0, 0.25, 0.1].map((d, i) => (
                              <span
                                key={i}
                                className="eq-bar h-3 w-[3px] rounded-full"
                                style={{
                                  background: modalAccent.color,
                                  animationDelay: `${d}s`,
                                }}
                              />
                            ))}
                          </span>
                          Now playing
                        </span>

                        <span className="text-sm font-semibold text-white/50">
                          {currentIndex + 1} of {activities.length}
                        </span>
                      </div>

                      <h3 className="ra-heading mt-4 text-2xl font-bold leading-[1.12] tracking-tight text-white sm:mt-5 sm:text-4xl sm:leading-[1.1]">
                        {selectedActivity.title}
                      </h3>

                      <p
                        className="ra-heading mt-2 text-base font-semibold leading-7 sm:mt-3 sm:text-xl"
                        style={{ color: modalAccent.color }}
                      >
                        {selectedActivity.tagline}
                      </p>

                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:mt-4 sm:text-[15px] sm:leading-7">
                        {selectedActivity.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                        {[selectedActivity.skill, "Real learner", "No rehearsals"].map(
                          (label) => (
                            <span
                              key={label}
                              className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/75"
                            >
                              {label}
                            </span>
                          ),
                        )}
                      </div>
                    </motion.div>

                    {/* bottom controls */}
                    <div className="space-y-4 sm:space-y-5">
                      {/* the other video */}
                      {otherActivity && (
                        <button
                          type="button"
                          onClick={() => goToActivity("next")}
                          className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 text-left transition hover:border-white/25 hover:bg-white/[0.09] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:gap-4 sm:p-3"
                        >
                          <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[#1B3C43] sm:w-24">
                            {getThumbnail(otherActivity) && (
                              <img
                                src={getThumbnail(otherActivity)}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                              />
                            )}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                              <Play size={14} fill="white" className="text-white" />
                            </span>
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-white/50">
                              Watch next
                            </span>
                            <span className="mt-0.5 block truncate text-sm font-bold text-white">
                              {otherActivity.title}
                            </span>
                          </span>

                          <ArrowRight
                            size={16}
                            className="shrink-0 text-white/50 transition group-hover:translate-x-1 group-hover:text-white"
                          />
                        </button>
                      )}

                      {/* progress + arrows */}
                      <div className="flex items-center gap-4">
                        <div className="flex flex-1 items-center gap-2">
                          {activities.map((activity, i) => (
                            <button
                              key={activity.id}
                              type="button"
                              aria-label={`Play ${activity.title}`}
                              onClick={() => {
                                setSelectedActivity(activity);
                                setActiveId(activity.id);
                              }}
                              className="group/seg flex h-5 flex-1 items-center"
                            >
                              <span
                                className="h-[3px] w-full rounded-full transition-all duration-500 group-hover/seg:h-[5px]"
                                style={{
                                  background:
                                    i === currentIndex
                                      ? modalAccent.color
                                      : "rgba(255,255,255,.2)",
                                  boxShadow:
                                    i === currentIndex
                                      ? `0 0 14px ${modalAccent.color}`
                                      : "none",
                                }}
                              />
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          {[
                            { dir: "previous", Icon: ArrowLeft, label: "Previous video" },
                            { dir: "next", Icon: ArrowRight, label: "Next video" },
                          ].map(({ dir, Icon, label }) => (
                            <button
                              key={dir}
                              type="button"
                              aria-label={label}
                              onClick={() => goToActivity(dir)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white hover:text-[#08182B] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                              <Icon size={16} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="hidden text-xs font-medium text-white/35 lg:block">
                        Use the arrow keys to switch videos, Esc to close.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Activity;