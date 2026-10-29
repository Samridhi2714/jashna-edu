import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Sparkles,
  X,
} from "lucide-react";

import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { resourcesData } from "../data/resourcesData";

// ============================================================
// SAFE IMAGE
// ============================================================

function SafeImage({ src, alt, className = "" }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-[#dbe9ef] ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(41,159,209,.30),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(20,48,79,.22),transparent_40%)]" />

        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,48,79,.35) 1px, transparent 1px),linear-gradient(90deg,rgba(20,48,79,.35) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex h-full items-center justify-center">
          <BookOpen size={44} strokeWidth={1} className="text-[#14304f]/45" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

// ============================================================
// FEATURED ARTICLE
// ============================================================

function FeaturedArticle({ resource, onOpen }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(resource)}
      className="group relative cursor-pointer"
    >
      {/* OUTER HOVER GLOW */}
      <motion.div
        className="absolute -inset-[2px] bg-gradient-to-r from-[#299fd1]/40 via-[#62c9df]/20 to-[#14304f]/30 opacity-0 blur-md"
        initial={false}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      />

      {/* CARD */}
      <div className="relative grid overflow-hidden border border-[#14304f]/15 bg-white transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[#299fd1]/45 group-hover:shadow-[0_28px_80px_rgba(16,45,74,.16)] lg:grid-cols-[1.08fr_0.92fr]">
        {/* IMAGE */}
        <div className="relative h-[280px] overflow-hidden min-[480px]:h-[340px] sm:h-[440px] lg:h-auto lg:min-h-[560px]">
          <motion.div
            whileHover={{ scale: 1.055 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            <SafeImage src={resource.image} alt={resource.title} />
          </motion.div>

          {/* IMAGE OVERLAY */}
          <motion.div
            initial={false}
            whileHover={{ opacity: 0.9 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-t from-[#071b2d]/90 via-[#071b2d]/10 to-[#299fd1]/10 opacity-70"
          />

          {/* HOVER LIGHT */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <div className="absolute left-[-15%] top-[20%] h-[250px] w-[250px] rounded-full bg-[#62c9df]/15 blur-[90px]" />
            <div className="absolute bottom-[-15%] right-[-10%] h-[300px] w-[300px] rounded-full bg-[#299fd1]/20 blur-[100px]" />
          </div>

          {/* IMAGE GRID DETAIL */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
              backgroundSize: "55px 55px",
            }}
          />

          {/* FEATURED LABEL */}
          <div className="absolute left-4 top-4 sm:left-7 sm:top-7">
            <div className="flex items-center gap-2 bg-white px-3 py-2 shadow-xl transition-transform duration-500 group-hover:-translate-y-1 sm:px-4 sm:py-2.5">
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-2 w-2 rounded-full bg-[#299fd1]"
              />

              <span className="text-[10px] font-black uppercase tracking-[0.17em] text-[#102d4a] sm:text-[11px] sm:tracking-[0.19em]">
                Featured Research
              </span>
            </div>
          </div>

          {/* NUMBER */}
          <motion.div
            initial={false}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-[-14px] left-4 sm:bottom-[-20px] sm:left-7"
          >
            <span className="font-display text-[96px] leading-none tracking-[-0.08em] text-white/20 transition-colors duration-500 group-hover:text-white/25 sm:text-[160px] lg:text-[180px]">
              01
            </span>
          </motion.div>

          {/* OPEN RESEARCH MICRO LABEL */}
          <div className="absolute right-5 top-5 hidden sm:block">
            <div className="flex translate-y-2 items-center gap-2 border border-white/25 bg-[#071b2d]/25 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              Open research
              <ArrowUpRight size={12} />
            </div>
          </div>

          {/* META */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white sm:bottom-7 sm:left-7 sm:right-7">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-white/80 sm:text-[11px] sm:tracking-[0.2em]">
                {resource.type}
              </p>

              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold sm:mt-2 sm:text-[13px]">
                <Clock3 size={13} />
                {resource.readTime}
              </p>
            </div>

            {/* CIRCULAR ARROW */}
            <motion.div
              initial={false}
              whileHover={{ rotate: 45, scale: 1.08 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-[#14304f] sm:h-12 sm:w-12"
            >
              <ArrowUpRight size={19} />
            </motion.div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative flex min-w-0 flex-col justify-between overflow-hidden p-5 min-[480px]:p-7 sm:p-10 lg:p-10 xl:p-12">
          <div className="absolute right-7 top-0 hidden h-full w-px bg-[#14304f]/[0.08] lg:block" />

          <motion.div
            initial={false}
            whileHover={{ scale: 1.2, opacity: 0.8 }}
            transition={{ duration: 0.7 }}
            className="absolute right-[-60px] top-[-60px] h-48 w-48 rounded-full bg-[#299fd1]/10 blur-3xl"
          />

          <div className="pointer-events-none absolute right-10 top-10 hidden h-20 w-20 rounded-full border border-[#299fd1]/10 transition-all duration-700 group-hover:scale-125 group-hover:border-[#299fd1]/25 lg:block" />

          <div className="relative">
            {/* CATEGORY */}
            <div className="mb-5 flex items-center gap-3 sm:mb-8">
              <motion.span
                initial={false}
                whileHover={{ width: 70 }}
                className="h-[3px] w-12 shrink-0 bg-[#299fd1] transition-all duration-500"
              />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#14304f] sm:text-[12px] sm:tracking-[0.2em]">
                {resource.category}
              </span>
            </div>

            {/* MOBILE GLOW */}
              <div className="pointer-events-none absolute -left-8 -top-4 h-36 w-36 rounded-full bg-[#62c9df]/30 blur-3xl sm:hidden" />

              {/* EYEBROW */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative mb-5 flex items-center gap-3 sm:mb-6"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#299fd1]/60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#299fd1]" />
                </span>

                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#299fd1] sm:text-[11px]">
                  Research Library
                </span>

                <span className="h-px w-10 bg-[#14304f]/25 sm:w-20" />
              </motion.div>

              {/* TITLE */}
            <motion.h2
              initial={false}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl break-words font-display text-[28px] font-semibold leading-[1.02] tracking-[-0.04em] text-[#0b2238] transition-colors duration-500 group-hover:text-[#102d4a] min-[480px]:text-[34px] sm:text-[44px] lg:text-[44px] xl:text-[55px] xl:leading-[0.96]"
            >
              {resource.title}
            </motion.h2>

            {/* DESCRIPTION */}
            <p className="mt-5 max-w-xl text-[15px] font-medium leading-[1.8] text-[#435b6f] sm:mt-7 sm:text-[17px] lg:text-[17px] xl:text-[19px]">
              {resource.shortDescription}
            </p>

            {/* HOVER DETAIL */}
            <div className="mt-8 hidden translate-y-2 items-center gap-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
              <span className="h-px w-8 bg-[#299fd1]" />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#299fd1]">
                Research insight
              </span>
            </div>
          </div>

          {/* READ ARTICLE */}
          <div className="relative mt-8 flex items-center justify-between gap-4 border-t border-[#14304f]/10 pt-5 sm:mt-12 sm:pt-6">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#14304f] sm:text-[11px] sm:tracking-[0.2em]">
                Read the research
              </p>

              <p className="mt-1 text-[12px] font-medium text-[#71818d] sm:text-[13px]">
                Explore the full article
              </p>
            </div>

            <motion.div
              initial={false}
              whileHover={{ scale: 1.08 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#102d4a] text-white transition-all duration-500 group-hover:bg-[#299fd1] sm:h-12 sm:w-12"
            >
              <ArrowRight
                size={18}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ============================================================
// ARTICLE ROW
// ============================================================

function ArticleRow({ resource, index, onOpen }) {
  const number = String(index + 2).padStart(2, "0");

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(resource)}
      className="group cursor-pointer border-b border-[#14304f]/15 py-7 transition-colors duration-300 hover:border-[#299fd1]/40 sm:py-10 lg:py-12"
    >
      <div className="grid gap-5 sm:gap-7 lg:grid-cols-[70px_280px_minmax(0,1fr)_auto] lg:items-center xl:grid-cols-[100px_360px_minmax(0,1fr)_auto]">
        {/* NUMBER */}
        <div className="hidden lg:block">
          <span className="font-display text-[40px] font-medium tracking-[-0.05em] text-[#8a9aa6] transition-colors duration-300 group-hover:text-[#14304f] xl:text-[48px]">
            {number}
          </span>
        </div>

        {/* IMAGE */}
        <div className="relative h-[200px] overflow-hidden min-[480px]:h-[240px] sm:h-[300px] lg:h-[200px] xl:h-[215px]">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.65 }}
            className="h-full w-full"
          >
            <SafeImage src={resource.image} alt={resource.title} />
          </motion.div>

          <div className="absolute left-3 top-3 max-w-[75%] truncate bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#102d4a] shadow-sm sm:left-4 sm:top-4 sm:tracking-[0.17em]">
            {resource.category}
          </div>

          <div className="absolute bottom-1 right-3 lg:hidden">
            <span className="font-display text-[56px] leading-none text-white/45 sm:text-[65px]">
              {number}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#14304f] sm:text-[11px] sm:tracking-[0.18em]">
              {resource.type}
            </span>

            <span className="h-1 w-1 rounded-full bg-[#14304f]" />

            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#52677c] sm:text-[11px] sm:tracking-[0.15em]">
              <Clock3 size={11} />
              {resource.readTime}
            </span>
          </div>

          <h2 className="max-w-3xl break-words font-display text-[23px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#0b2238] transition-colors duration-300 group-hover:text-[#299fd1] min-[480px]:text-[27px] sm:text-[32px] xl:text-[34px]">
            {resource.title}
          </h2>

          <p className="mt-3 max-w-2xl text-[15px] font-medium leading-[1.8] text-[#52677c] sm:mt-4 sm:text-[16px] xl:text-[17px]">
            {resource.shortDescription}
          </p>
        </div>

        {/* READ */}
        <div className="hidden lg:flex lg:items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#14304f]/15 text-[#14304f] transition-all duration-300 group-hover:border-[#299fd1] group-hover:bg-[#299fd1] group-hover:text-white">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ============================================================
// SLIDING ARTICLE CTA
// Compact on phones, dismissible with the X button, and the
// article reserves space for it so it never covers the text.
// ============================================================

function ArticleLearningCTA({ resource, onDismiss }) {
  const cta = resource.cardCta;

  if (!cta) return null;

  const ctaEyebrow = cta.eyebrow || cta.label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto absolute inset-x-3 bottom-3 z-30 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px] lg:bottom-7 lg:right-7 lg:w-[410px]"
    >
      <div className="relative overflow-hidden border border-[#62c9df]/40 bg-[#102d4a] shadow-[0_20px_60px_rgba(7,27,45,.3)]">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#299fd1] via-[#62c9df] to-transparent" />

        {/* CLOSE */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close this card"
          className="absolute right-2 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors duration-300 hover:bg-white hover:text-[#102d4a] sm:right-3 sm:top-4"
        >
          <X size={15} />
        </button>

        <div className="relative p-4 sm:p-6">
          <div className="pointer-events-none absolute right-[-50px] top-[-60px] h-40 w-40 rounded-full bg-[#299fd1]/20 blur-3xl" />

          <div className="relative">
            <div className="mb-2 flex items-center gap-2 pr-9 sm:mb-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#62c9df]" />

              <span className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-[#62c9df] sm:text-[10px] sm:tracking-[0.22em]">
                {ctaEyebrow}
              </span>
            </div>

            <h3 className="font-display text-[20px] font-semibold leading-[1.08] tracking-[-0.03em] text-white min-[400px]:text-[22px] sm:text-[28px] lg:text-[31px] lg:leading-[1.02]">
              {cta.title}
            </h3>

            <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[1.6] text-white/70 sm:mt-3 sm:line-clamp-none sm:text-[15px] sm:leading-[1.7]">
              {cta.description}
            </p>

            <Link
              to={cta.buttonLink}
              className="group mt-4 inline-flex items-center gap-2 bg-[#62c9df] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#102d4a] transition-all duration-300 hover:bg-white sm:mt-5 sm:py-3 sm:tracking-[0.17em]"
            >
              {cta.buttonText}

              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// ARTICLE MODAL
// ============================================================

function ArticleModal({ resource, onClose }) {
  const [ctaOpen, setCtaOpen] = useState(true);

  const resourceId = resource?.id;

  // show the card again whenever a different article opens
  useEffect(() => {
    setCtaOpen(true);
  }, [resourceId]);

  useEffect(() => {
    if (!resource) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [resource]);

  useEffect(() => {
    if (!resource) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [resource, onClose]);

  if (!resource) return null;

  const hasContent =
    Array.isArray(resource.content) && resource.content.length > 0;

  const articleIndex =
    resourcesData.findIndex((item) => item.id === resource.id) + 1;

  const number = String(articleIndex).padStart(2, "0");

  const showCta = Boolean(resource.cardCta) && ctaOpen;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#061a2b]/80 p-0 backdrop-blur-lg sm:p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 70, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
          className="relative h-[100dvh] w-full max-w-[1180px] overflow-hidden bg-gradient-to-br from-[#299fd1] via-[#8bd7e5] to-[#14304f] p-[1px] shadow-[0_35px_120px_rgba(0,0,0,.4)] sm:h-[92vh]"
        >
          <div className="relative flex h-full flex-col overflow-hidden bg-[#f7f5ef]">
            <div className="absolute left-0 right-0 top-0 z-40 h-[3px] bg-gradient-to-r from-[#299fd1] via-[#62c9df] to-[#14304f]" />

            <div className="pointer-events-none absolute bottom-[-25px] right-[-10px] z-0 select-none font-display text-[130px] font-semibold leading-none tracking-[-0.08em] text-[#14304f]/[0.035] sm:bottom-[-35px] sm:text-[250px]">
              {number}
            </div>

            {/* HEADER */}
            <div className="relative z-20 shrink-0 border-b border-[#14304f]/[0.12] bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-9 sm:py-8">
              <div className="flex items-start justify-between gap-3 sm:gap-5">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mb-5">
                    <span className="bg-[#102d4a] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                      {resource.category}
                    </span>

                    <span className="text-[10px] font-black tracking-[0.16em] text-[#299fd1] sm:text-[11px] sm:tracking-[0.2em]">
                      RESEARCH / {number}
                    </span>

                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#52677c] sm:text-[11px] sm:tracking-[0.15em]">
                      <Clock3 size={12} />
                      {resource.readTime}
                    </span>
                  </div>

                  <h2 className="max-w-4xl break-words font-display text-[22px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0b2238] min-[400px]:text-[25px] sm:text-[38px] sm:leading-[1.04] lg:text-[50px] xl:text-[56px]">
                    {resource.title}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close article"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center border border-[#14304f]/20 bg-white text-[#14304f] transition-all duration-300 hover:border-[#14304f] hover:bg-[#14304f] hover:text-white sm:h-11 sm:w-11"
                >
                  <X
                    size={19}
                    className="transition-transform duration-300 group-hover:rotate-90"
                  />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div
                className={`mx-auto max-w-[900px] px-4 py-8 min-[480px]:px-6 sm:px-10 sm:py-14 ${
                  showCta ? "pb-64 sm:pb-72" : "pb-12 sm:pb-16"
                }`}
              >
                <div className="mb-10 border-l-[4px] border-[#299fd1] pl-4 sm:mb-14 sm:pl-7">
                  <p className="text-[16px] font-medium leading-[1.8] text-[#435b6f] sm:text-[19px] sm:leading-[1.9] lg:text-[20px]">
                    {resource.shortDescription}
                  </p>
                </div>

                {!hasContent ? (
                  <div className="border border-dashed border-[#14304f]/20 bg-white p-5 sm:p-10">
                    <div className="mb-4 flex items-center gap-2">
                      <BookOpen size={17} className="text-[#299fd1]" />

                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#14304f]">
                        Research article
                      </span>
                    </div>

                    <p className="text-[16px] font-medium leading-[1.85] text-[#52677c] sm:text-[17px]">
                      Full article content will appear here once it has been
                      added to the research library.
                    </p>

                    <p className="mt-4 text-[13px] font-medium leading-[1.8] text-[#8a98a3] sm:text-[14px]">
                      Add the article sections inside this resource&apos;s{" "}
                      <strong>content</strong> array in resourcesData.js.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-10 sm:space-y-14">
                    {resource.content.map((section, index) => (
                      <section key={index}>
                        {section.heading && (
                          <div className="mb-5 flex gap-3 sm:mb-6 sm:gap-4">
                            <span className="mt-3 h-[4px] w-7 shrink-0 bg-[#299fd1] sm:mt-4 sm:w-9" />

                            <h3 className="break-words font-display text-[24px] font-semibold leading-[1.1] tracking-[-0.025em] text-[#0b2238] sm:text-[34px] lg:text-[38px]">
                              {section.heading}
                            </h3>
                          </div>
                        )}

                        <div className="space-y-5 sm:space-y-6">
                          {section.paragraphs?.map(
                            (paragraph, paragraphIndex) => (
                              <p
                                key={paragraphIndex}
                                className="text-[16px] font-medium leading-[1.85] text-[#354f64] sm:text-[18px] sm:leading-[1.95] lg:text-[19px]"
                              >
                                {paragraph}
                              </p>
                            ),
                          )}
                        </div>
                      </section>
                    ))}

                    {resource.citation && (
                      <div className="border-t border-[#14304f]/15 pt-6 sm:pt-8">
                        <p className="break-words text-[13px] font-medium leading-[1.9] text-[#687b89] sm:text-[14px]">
                          <span className="font-black text-[#14304f]">
                            Citation:
                          </span>{" "}
                          {resource.citation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {resource.sourceUrl && (
                  <div className="mt-8 border border-[#299fd1]/25 bg-white p-5 sm:mt-10 sm:p-8">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#299fd1]">
                      Original source
                    </p>
                    <p className="mt-3 text-[14px] font-medium leading-7 text-[#52677c] sm:text-[15px]">
                      This page presents a summary for learning purposes. Open the original paper to read the authors’ full research and context.
                    </p>
                    <a
                      href={resource.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-5 inline-flex max-w-full items-center gap-3 bg-[#102d4a] px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#299fd1] sm:px-5 sm:py-4 sm:text-[11px] sm:tracking-[0.15em]"
                    >
                      <span className="min-w-0">
                        {resource.sourceLabel || "Read Original Research Paper"}
                      </span>
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* FLOATING CTA (dismissible) */}
            <AnimatePresence>
              {showCta && (
                <ArticleLearningCTA
                  key="article-cta"
                  resource={resource}
                  onDismiss={() => setCtaOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// MAIN RESOURCES PAGE
// ============================================================

const TOPIC_STRIP = [
  "LANGUAGE",
  "PSYCHOLOGY",
  "LEADERSHIP",
  "PRONUNCIATION",
  "FLUENCY",
  "CAREER",
  "COMMUNICATION",
];

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("All");

  const [selectedResource, setSelectedResource] = useState(null);

  // CATEGORIES
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(resourcesData.map((resource) => resource.category)),
    ];

    return ["All", ...uniqueCategories];
  }, []);

  // FILTERED ARTICLES
  const filteredResources = useMemo(() => {
    if (activeCategory === "All") {
      return resourcesData;
    }

    return resourcesData.filter(
      (resource) => resource.category === activeCategory,
    );
  }, [activeCategory]);

  // FEATURED
  const featured = activeCategory === "All" ? filteredResources[0] : null;

  const remaining =
    activeCategory === "All" ? filteredResources.slice(1) : filteredResources;

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen w-full overflow-x-hidden bg-[#f6f3ec] text-[#102d4a]">
        {/* BACKGROUND */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-180px] top-[100px] h-[650px] w-[650px] rounded-full bg-[#46b8dc]/10 blur-[130px]" />

          <div className="absolute right-[-180px] top-[350px] h-[550px] w-[550px] rounded-full bg-[#6bcdd0]/10 blur-[130px]" />

          <div className="absolute right-[8%] top-[80px] hidden h-[300px] w-[300px] rounded-full border border-[#299fd1]/10 sm:block" />

          <div className="absolute right-[11%] top-[110px] hidden h-[240px] w-[240px] rounded-full border border-[#299fd1]/10 sm:block" />

          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(16,45,74,.25) 1px, transparent 1px),linear-gradient(90deg,rgba(16,45,74,.25) 1px,transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* HERO */}
        <section className="relative px-4 pb-12 pt-24 min-[480px]:px-5 sm:px-8 sm:pb-14 sm:pt-32 lg:px-[4.5vw] lg:pb-20">
          <div className="mx-auto max-w-[1600px]">
            <div className="relative">
              {/* BACKGROUND WORD */}
              <div className="pointer-events-none absolute right-[-3%] top-[-35px] hidden select-none font-display text-[180px] font-semibold leading-none tracking-[-0.08em] text-[#14304f]/[0.035] xl:block">
                THINK
              </div>

              {/* TITLE */}
              <motion.h1
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="font-display text-[52px] font-semibold leading-[0.92] tracking-[-0.06em] text-[#081f35] min-[400px]:text-[60px] min-[480px]:text-[68px] sm:text-[88px] sm:leading-[0.85] lg:text-[108px] xl:text-[128px] 2xl:text-[140px]"
              >
                Research
                <span className="relative ml-[4vw] inline-block bg-gradient-to-r from-[#14304f] via-[#299fd1] to-[#3fb6d8] bg-clip-text pb-1 text-transparent sm:ml-[5vw]">
                  & Insights
                  {/* MAIN UNDERLINE */}
                  <span className="absolute bottom-[-10px] left-[5%] right-[-5%] h-[4px] overflow-hidden bg-[#299fd1]/15 sm:bottom-[-18px] sm:h-[5px]">
                    <motion.span
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{
                        duration: 1,
                        delay: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#14304f] via-[#299fd1] to-[#62c9df]"
                    />
                  </span>
                  {/* SMALL UNDERLINE DOT */}
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1.15 }}
                    className="absolute bottom-[-15px] right-[-8px] h-2.5 w-2.5 rounded-full border-2 border-[#299fd1] bg-[#f6f3ec] sm:bottom-[-25px] sm:right-[-12px] sm:h-3 sm:w-3"
                  />
                </span>
              </motion.h1>

              {/* HERO LOWER */}
              <div className="mt-12 grid gap-8 border-t border-[#14304f]/15 pt-7 sm:mt-14 sm:gap-10 sm:pt-8 lg:grid-cols-[1fr_400px] lg:items-end xl:grid-cols-[1fr_500px]">
                {/* DESCRIPTION */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                >
                  <p className="max-w-[820px] text-[17px] font-medium leading-[1.6] text-[#304960] min-[480px]:text-[19px] sm:text-[22px] lg:text-[22px] xl:text-[24px]">
                    Ideas about{" "}
                    <span className="font-black text-[#081f35]">
                      language, psychology, confidence
                    </span>{" "}
                    and communication — explored through research and
                    translated into practical learning.
                  </p>
                </motion.div>

                {/* STATS */}
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="relative grid grid-cols-2 gap-2.5 sm:gap-3"
                >
                  {/* CARD 01 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="group/stat relative overflow-hidden border border-[#14304f]/15 bg-white p-4 shadow-[0_10px_35px_rgba(16,45,74,.06)] transition-all duration-500 hover:border-[#299fd1]/45 hover:shadow-[0_18px_45px_rgba(16,45,74,.12)] sm:p-6"
                  >
                    <div className="absolute left-0 top-0 h-full w-[3px] bg-[#299fd1]" />

                    <div className="absolute right-[-25px] top-[-25px] h-24 w-24 rounded-full border border-[#299fd1]/10 transition-transform duration-700 group-hover/stat:scale-125" />

                    <div className="relative">
                      <div className="mb-5 flex items-center justify-between sm:mb-7">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#71818d]">
                          Library
                        </span>

                        <span className="h-2 w-2 rounded-full bg-[#299fd1] transition-transform duration-300 group-hover/stat:scale-150" />
                      </div>

                      <p className="font-display text-[48px] font-semibold leading-none tracking-[-0.07em] text-[#081f35] min-[480px]:text-[58px] sm:text-[72px]">
                        {resourcesData.length}
                        <span className="ml-1 text-[20px] text-[#299fd1] sm:text-[25px]">
                          +
                        </span>
                      </p>

                      <div className="mt-3 h-px w-full bg-[#14304f]/10 sm:mt-4" />

                      <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#102d4a] sm:text-[10px] sm:tracking-[0.18em]">
                        Research pieces
                      </p>
                    </div>
                  </motion.div>

                  {/* CARD 02 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="group/stat relative overflow-hidden border border-[#14304f]/15 bg-[#102d4a] p-4 shadow-[0_10px_35px_rgba(16,45,74,.10)] transition-all duration-500 hover:border-[#62c9df]/50 hover:shadow-[0_18px_45px_rgba(16,45,74,.18)] sm:p-6"
                  >
                    <div className="absolute right-0 top-0 h-full w-[3px] bg-[#62c9df]" />

                    <div className="absolute bottom-[-35px] right-[-35px] h-32 w-32 rounded-full border border-[#62c9df]/15 transition-transform duration-700 group-hover/stat:scale-125" />

                    <div className="relative">
                      <div className="mb-5 flex items-center justify-between sm:mb-7">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
                          Scope
                        </span>

                        <span className="h-2 w-2 rounded-full bg-[#62c9df] transition-transform duration-300 group-hover/stat:scale-150" />
                      </div>

                      <p className="font-display text-[48px] font-semibold leading-none tracking-[-0.07em] text-white min-[480px]:text-[58px] sm:text-[72px]">
                        07
                      </p>

                      <div className="mt-3 h-px w-full bg-white/15 sm:mt-4" />

                      <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/80 sm:text-[10px] sm:tracking-[0.18em]">
                        Fields explored
                      </p>
                    </div>
                  </motion.div>

                  {/* MICRO FOOTNOTE */}
                  <div className="col-span-2 flex items-center justify-end gap-2 pr-1">
                    <span className="h-px w-8 bg-[#14304f]/20" />

                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#71818d] sm:tracking-[0.18em]">
                      Updated research library · 2026
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* MOVING TOPIC STRIP */}
              <div className="mt-8 overflow-hidden bg-[#102d4a] py-3 shadow-[0_12px_30px_-12px_rgba(16,45,74,.45)] sm:mt-10 sm:py-4">
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                  className="flex w-max items-center gap-6 whitespace-nowrap sm:gap-8"
                >
                  {[...TOPIC_STRIP, ...TOPIC_STRIP].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-6 sm:gap-8"
                    >
                      <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white sm:text-[13px] sm:tracking-[0.22em]">
                        {item}
                      </span>

                      <span className="h-1.5 w-1.5 rotate-45 bg-[#62c9df]" />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY FILTER */}
        <section className="relative px-4 min-[480px]:px-5 sm:px-8 lg:px-[4.5vw]">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide sm:gap-3 sm:py-6">
              {categories.map((category) => {
                const active = category === activeCategory;

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`relative shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-bold tracking-wide transition-colors sm:px-5 sm:py-2.5 sm:text-[14px] ${
                      active
                        ? "border-transparent text-white"
                        : "border-[#14304f]/20 bg-white text-[#435b6f] hover:border-[#299fd1] hover:text-[#14304f]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeCategory"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-[#102d4a]"
                      />
                    )}

                    <span className="relative z-10">{category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ARTICLES */}
        <section className="relative px-4 pb-20 pt-10 min-[480px]:px-5 sm:px-8 sm:pb-28 sm:pt-16 lg:px-[4.5vw] lg:pb-36">
          <div className="mx-auto max-w-[1600px]">
            {featured && (
              <FeaturedArticle
                resource={featured}
                onOpen={setSelectedResource}
              />
            )}

            <div className={featured ? "mt-10 sm:mt-16" : ""}>
              {remaining.map((resource, index) => (
                <ArticleRow
                  key={resource.id}
                  resource={resource}
                  index={index}
                  onOpen={setSelectedResource}
                />
              ))}
            </div>

            {!featured && remaining.length === 0 && (
              <div className="flex min-h-[240px] items-center justify-center border-y border-[#14304f]/10 px-4 text-center sm:min-h-[300px]">
                <p className="text-[15px] font-medium text-[#52677c] sm:text-[16px]">
                  No research pieces found in this category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative px-4 pb-16 min-[480px]:px-5 sm:px-8 sm:pb-20 lg:px-[4.5vw]">
          <div className="mx-auto max-w-[1600px]">
            <div className="relative overflow-hidden bg-[#102d4a] px-5 py-10 min-[480px]:px-7 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              <div className="absolute right-[-100px] top-[-130px] h-[400px] w-[400px] rounded-full bg-[#299fd1]/20 blur-[100px]" />

              <div className="absolute bottom-[-180px] left-[30%] h-[350px] w-[350px] rounded-full bg-[#62c9df]/10 blur-[100px]" />

              <div className="relative flex flex-col justify-between gap-8 sm:gap-10 lg:flex-row lg:items-end">
                <div className="min-w-0">
                  <div className="mb-5 flex items-center gap-2 sm:mb-6">
                    <Sparkles size={15} className="text-[#62c9df]" />

                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#62c9df]">
                      Beyond the research
                    </span>
                  </div>

                  <h2 className="max-w-[850px] font-display text-[34px] font-semibold leading-[1] tracking-[-0.04em] text-white min-[400px]:text-[38px] sm:text-[52px] lg:text-[60px] xl:text-[68px] xl:leading-[0.95]">
                    Read something.
                    <br />
                    <span className="text-[#62c9df]">Then make it useful.</span>
                  </h2>
                </div>

                <Link
                  to="/programs"
                  className="group inline-flex w-full shrink-0 items-center justify-center gap-3 border border-white/25 px-6 py-4 text-[11px] font-black uppercase tracking-[0.17em] text-white transition-all hover:border-[#62c9df] hover:bg-[#62c9df] hover:text-[#102d4a] sm:w-auto sm:justify-start"
                >
                  Explore Programs
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ARTICLE MODAL */}
        <AnimatePresence>
          {selectedResource && (
            <ArticleModal
              resource={selectedResource}
              onClose={() => setSelectedResource(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}