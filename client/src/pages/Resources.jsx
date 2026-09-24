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

import { motion, AnimatePresence } from "framer-motion";
import { resourcesData } from "../data/resourcesData";

// ============================================================
// SAFE IMAGE
// ============================================================

function SafeImage({ src, alt, className = "" }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`relative overflow-hidden bg-[#dbe9ef] ${className}`}>
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
      initial={{
        opacity: 0,
        y: 35,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={() => onOpen(resource)}
      className="group relative cursor-pointer"
    >
      {/* =====================================================
          OUTER HOVER GLOW
      ===================================================== */}

      <motion.div
        className="absolute -inset-[2px] bg-gradient-to-r from-[#299fd1]/40 via-[#62c9df]/20 to-[#14304f]/30 opacity-0 blur-md"
        initial={false}
        whileHover={{
          opacity: 1,
        }}
        transition={{
          duration: 0.45,
        }}
      />

      {/* =====================================================
          CARD
      ===================================================== */}

      <div className="relative grid overflow-hidden border border-[#14304f]/15 bg-white transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[#299fd1]/45 group-hover:shadow-[0_28px_80px_rgba(16,45,74,.16)] lg:grid-cols-[1.08fr_0.92fr]">
        {/* ===================================================
            IMAGE
        =================================================== */}

        <div className="relative h-[360px] overflow-hidden sm:h-[470px] lg:h-[590px]">
          <motion.div
            whileHover={{
              scale: 1.055,
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full w-full"
          >
            <SafeImage src={resource.image} alt={resource.title} />
          </motion.div>

          {/* IMAGE OVERLAY */}

          <motion.div
            initial={false}
            whileHover={{
              opacity: 0.9,
            }}
            transition={{
              duration: 0.5,
            }}
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

          <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 shadow-xl transition-transform duration-500 group-hover:-translate-y-1">
              <motion.span
                animate={{
                  scale: [1, 1.25, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-2 w-2 rounded-full bg-[#299fd1]"
              />

              <span className="text-[11px] font-black uppercase tracking-[0.19em] text-[#102d4a]">
                Featured Research
              </span>
            </div>
          </div>

          {/* NUMBER */}

          <motion.div
            initial={false}
            whileHover={{
              y: -8,
            }}
            transition={{
              duration: 0.5,
            }}
            className="absolute bottom-[-20px] left-5 sm:left-7"
          >
            <span className="font-display text-[130px] leading-none tracking-[-0.08em] text-white/20 transition-colors duration-500 group-hover:text-white/25 sm:text-[180px]">
              01
            </span>
          </motion.div>

          {/* OPEN RESEARCH MICRO LABEL */}

          <div className="absolute right-5 top-5 hidden sm:block">
            <div className="flex items-center gap-2 border border-white/25 bg-[#071b2d]/25 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md opacity-0 translate-y-2 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              Open research
              <ArrowUpRight size={12} />
            </div>
          </div>

          {/* META */}

          <div className="absolute bottom-6 left-5 right-5 flex items-end justify-between text-white sm:bottom-7 sm:left-7 sm:right-7">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
                {resource.type}
              </p>

              <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold">
                <Clock3 size={13} />
                {resource.readTime}
              </p>
            </div>

            {/* CIRCULAR ARROW */}

            <motion.div
              initial={false}
              whileHover={{
                rotate: 45,
                scale: 1.08,
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-[#14304f]"
            >
              <ArrowUpRight size={19} />
            </motion.div>
          </div>
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-10 lg:p-12">
          {/* RIGHT VERTICAL DETAIL */}

          <div className="absolute right-7 top-0 hidden h-full w-px bg-[#14304f]/8 lg:block" />

          {/* DECORATIVE CIRCLE */}

          <motion.div
            initial={false}
            whileHover={{
              scale: 1.2,
              opacity: 0.8,
            }}
            transition={{
              duration: 0.7,
            }}
            className="absolute right-[-60px] top-[-60px] h-48 w-48 rounded-full bg-[#299fd1]/10 blur-3xl"
          />

          {/* DECORATIVE SMALL RING */}

          <div className="pointer-events-none absolute right-10 top-10 hidden h-20 w-20 rounded-full border border-[#299fd1]/10 lg:block transition-all duration-700 group-hover:scale-125 group-hover:border-[#299fd1]/25" />

          <div className="relative">
            {/* CATEGORY */}

            <div className="mb-8 flex items-center gap-3">
              <motion.span
                initial={false}
                whileHover={{
                  width: 70,
                }}
                className="h-[3px] w-12 bg-[#299fd1] transition-all duration-500"
              />

              <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#14304f]">
                {resource.category}
              </span>
            </div>

            {/* TITLE */}

            <motion.h2
              initial={false}
              whileHover={{
                x: 4,
              }}
              transition={{
                duration: 0.35,
              }}
              className="max-w-xl font-display text-[39px] font-semibold leading-[0.96] tracking-[-0.045em] text-[#0b2238] transition-colors duration-500 group-hover:text-[#102d4a] sm:text-[49px] lg:text-[55px]"
            >
              {resource.title}
            </motion.h2>

            {/* DESCRIPTION */}

            <p className="mt-7 max-w-xl text-[17px] font-medium leading-[1.85] text-[#435b6f] sm:text-[18px] lg:text-[19px]">
              {resource.shortDescription}
            </p>

            {/* HOVER DETAIL */}

            <div className="mt-8 flex items-center gap-3 opacity-0 translate-y-2 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="h-px w-8 bg-[#299fd1]" />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#299fd1]">
                Research insight
              </span>
            </div>
          </div>

          {/* READ ARTICLE */}

          <div className="relative mt-12 flex items-center justify-between border-t border-[#14304f]/10 pt-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#14304f]">
                Read the research
              </p>

              <p className="mt-1 text-[13px] font-medium text-[#71818d]">
                Explore the full article
              </p>
            </div>

            <motion.div
              initial={false}
              whileHover={{
                scale: 1.08,
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#102d4a] text-white transition-all duration-500 group-hover:bg-[#299fd1]"
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
        amount: 0.15,
      }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={() => onOpen(resource)}
      className="group cursor-pointer border-b border-[#14304f]/15 py-8 transition-colors duration-300 hover:border-[#299fd1]/40 sm:py-10 lg:py-12"
    >
      <div className="grid gap-7 lg:grid-cols-[90px_320px_1fr_auto] xl:grid-cols-[100px_360px_1fr_auto] lg:items-center">
        {/* NUMBER */}

        <div className="hidden lg:block">
          <span className="font-display text-[48px] font-medium tracking-[-0.05em] text-[#8a9aa6] transition-colors duration-300 group-hover:text-[#14304f]">
            {number}
          </span>
        </div>

        {/* IMAGE */}

        <div className="relative h-[230px] overflow-hidden sm:h-[280px] lg:h-[215px]">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.65 }}
            className="h-full w-full"
          >
            <SafeImage src={resource.image} alt={resource.title} />
          </motion.div>

          <div className="absolute left-4 top-4 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.17em] text-[#102d4a] shadow-sm">
            {resource.category}
          </div>

          <div className="absolute bottom-2 right-3 lg:hidden">
            <span className="font-display text-[65px] leading-none text-white/45">
              {number}
            </span>
          </div>
        </div>

        {/* CONTENT */}

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#14304f]">
              {resource.type}
            </span>

            <span className="h-1 w-1 rounded-full bg-[#14304f]" />

            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#52677c]">
              <Clock3 size={11} />
              {resource.readTime}
            </span>
          </div>

          <h2 className="max-w-3xl font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#0b2238] transition-colors duration-300 group-hover:text-[#299fd1] sm:text-[34px]">
            {resource.title}
          </h2>

          <p className="mt-4 max-w-2xl text-[16px] font-medium leading-[1.85] text-[#52677c] sm:text-[17px]">
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
// ============================================================

function ArticleLearningCTA({ resource }) {
  const cta = resource.cardCta;

  if (!cta) return null;

  const ctaEyebrow = cta.eyebrow || cta.label;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 150,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.75,
        delay: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="pointer-events-auto absolute bottom-5 right-5 z-30 w-[calc(100%-40px)] max-w-[410px] sm:bottom-7 sm:right-7"
    >
      <div className="relative overflow-hidden border border-[#62c9df]/40 bg-[#102d4a] shadow-[0_20px_60px_rgba(7,27,45,.3)]">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#299fd1] via-[#62c9df] to-transparent" />

        <div className="relative p-5 sm:p-6">
          <div className="absolute right-[-50px] top-[-60px] h-40 w-40 rounded-full bg-[#299fd1]/20 blur-3xl" />

          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#62c9df]" />

              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#62c9df]">
                {ctaEyebrow}
              </span>
            </div>

            <h3 className="font-display text-[27px] font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-[31px]">
              {cta.title}
            </h3>

            <p className="mt-3 text-[14px] font-medium leading-[1.7] text-white/70 sm:text-[15px]">
              {cta.description}
            </p>

            <Link
              to={cta.buttonLink}
              className="group mt-5 inline-flex items-center gap-2 bg-[#62c9df] px-4 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-[#102d4a] transition-all duration-300 hover:bg-white"
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

  return (
    <AnimatePresence>
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#061a2b]/80 p-2 backdrop-blur-lg sm:p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{
            opacity: 0,
            x: 70,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            x: 50,
            scale: 0.98,
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          onClick={(event) => event.stopPropagation()}
          className="relative h-[96vh] w-full max-w-[1180px] overflow-hidden bg-gradient-to-br from-[#299fd1] via-[#8bd7e5] to-[#14304f] p-[1px] shadow-[0_35px_120px_rgba(0,0,0,.4)] sm:h-[92vh]"
        >
          <div className="relative flex h-full flex-col overflow-hidden bg-[#f7f5ef]">
            <div className="absolute left-0 right-0 top-0 z-40 h-[3px] bg-gradient-to-r from-[#299fd1] via-[#62c9df] to-[#14304f]" />

            <div className="pointer-events-none absolute bottom-[-35px] right-[-10px] z-0 font-display text-[180px] font-semibold leading-none tracking-[-0.08em] text-[#14304f]/[0.035] sm:text-[250px]">
              {number}
            </div>

            <div className="relative z-20 shrink-0 border-b border-[#14304f]/12 bg-white/90 px-5 py-6 backdrop-blur-xl sm:px-9 sm:py-8">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="bg-[#102d4a] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                      {resource.category}
                    </span>

                    <span className="text-[11px] font-black tracking-[0.2em] text-[#299fd1]">
                      RESEARCH / {number}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#52677c]">
                      <Clock3 size={12} />
                      {resource.readTime}
                    </span>
                  </div>

                  <h2 className="max-w-4xl font-display text-[31px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#0b2238] sm:text-[45px] lg:text-[56px]">
                    {resource.title}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close article"
                  className="group flex h-11 w-11 shrink-0 items-center justify-center border border-[#14304f]/20 bg-white text-[#14304f] transition-all duration-300 hover:border-[#14304f] hover:bg-[#14304f] hover:text-white"
                >
                  <X
                    size={19}
                    className="transition-transform duration-300 group-hover:rotate-90"
                  />
                </button>
              </div>
            </div>

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-[900px] px-5 py-10 pb-40 sm:px-10 sm:py-14 sm:pb-48">
                <div className="mb-14 border-l-[4px] border-[#299fd1] pl-5 sm:pl-7">
                  <p className="text-[17px] font-medium leading-[1.9] text-[#435b6f] sm:text-[19px] lg:text-[20px]">
                    {resource.shortDescription}
                  </p>
                </div>

                {!hasContent ? (
                  <div className="border border-dashed border-[#14304f]/20 bg-white p-7 sm:p-10">
                    <div className="mb-4 flex items-center gap-2">
                      <BookOpen size={17} className="text-[#299fd1]" />

                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#14304f]">
                        Research article
                      </span>
                    </div>

                    <p className="text-[17px] font-medium leading-[1.9] text-[#52677c]">
                      Full article content will appear here once it has been
                      added to the research library.
                    </p>

                    <p className="mt-4 text-[14px] font-medium leading-[1.8] text-[#8a98a3]">
                      Add the article sections inside this resource&apos;s{" "}
                      <strong>content</strong> array in resourcesData.js.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-14">
                    {resource.content.map((section, index) => (
                      <section key={index}>
                        {section.heading && (
                          <div className="mb-6 flex gap-4">
                            <span className="mt-4 h-[4px] w-9 shrink-0 bg-[#299fd1]" />

                            <h3 className="font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.025em] text-[#0b2238] sm:text-[38px]">
                              {section.heading}
                            </h3>
                          </div>
                        )}

                        <div className="space-y-6">
                          {section.paragraphs?.map(
                            (paragraph, paragraphIndex) => (
                              <p
                                key={paragraphIndex}
                                className="text-[17px] font-medium leading-[1.95] text-[#354f64] sm:text-[18px] lg:text-[19px]"
                              >
                                {paragraph}
                              </p>
                            ),
                          )}
                        </div>
                      </section>
                    ))}

                    {resource.citation && (
                      <div className="border-t border-[#14304f]/15 pt-8">
                        <p className="text-[13px] font-medium leading-[1.9] text-[#687b89] sm:text-[14px]">
                          <span className="font-black text-[#14304f]">
                            Citation:
                          </span>{" "}
                          {resource.citation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <ArticleLearningCTA resource={resource} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// MAIN RESOURCES PAGE
// ============================================================

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("All");

  const [selectedResource, setSelectedResource] = useState(null);

  // ----------------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------------

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(resourcesData.map((resource) => resource.category)),
    ];

    return ["All", ...uniqueCategories];
  }, []);

  // ----------------------------------------------------------
  // FILTERED ARTICLES
  // ----------------------------------------------------------

  const filteredResources = useMemo(() => {
    if (activeCategory === "All") {
      return resourcesData;
    }

    return resourcesData.filter(
      (resource) => resource.category === activeCategory,
    );
  }, [activeCategory]);

  // ----------------------------------------------------------
  // FEATURED
  // ----------------------------------------------------------

  const featured = activeCategory === "All" ? filteredResources[0] : null;

  const remaining =
    activeCategory === "All" ? filteredResources.slice(1) : filteredResources;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f3ec] text-[#102d4a]">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[100px] h-[650px] w-[650px] rounded-full bg-[#46b8dc]/10 blur-[130px]" />

        <div className="absolute right-[-180px] top-[350px] h-[550px] w-[550px] rounded-full bg-[#6bcdd0]/10 blur-[130px]" />

        <div className="absolute right-[8%] top-[80px] h-[300px] w-[300px] rounded-full border border-[#299fd1]/10" />

        <div className="absolute right-[11%] top-[110px] h-[240px] w-[240px] rounded-full border border-[#299fd1]/10" />

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16,45,74,.25) 1px, transparent 1px),linear-gradient(90deg,rgba(16,45,74,.25) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative px-5 pb-14 pt-28 sm:px-8 sm:pt-32 lg:px-[4.5vw] lg:pb-20 lg:pt-32">
        <div className="mx-auto max-w-[1600px]">
          <div className="relative">
            {/* BACKGROUND WORD */}

            <div className="pointer-events-none absolute right-[-3%] top-[-35px] hidden select-none font-display text-[180px] font-semibold leading-none tracking-[-0.08em] text-[#14304f]/[0.035] xl:block">
              THINK
            </div>

            {/* EYEBROW */}

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="relative mb-8 flex items-center gap-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#102d4a] text-white">
                <Sparkles size={13} />
              </span>

              <span className="text-[15px] font-black uppercase tracking-[0.25em] text-[#102d4a]">
                Jashna Knowledge Hub
              </span>

              <span className="hidden h-px w-16 bg-[#14304f]/20 sm:block" />

              <span className="hidden text-[13px] font-black uppercase tracking-[0.18em] text-[#14304f] sm:block">
                2026
              </span>
            </motion.div>

            {/* TITLE */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 35,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-display text-[61px] font-semibold leading-[0.82] tracking-[-0.065em] text-[#081f35] sm:text-[88px] lg:text-[115px] xl:text-[140px]"
            >
              Research
              <span className="relative ml-[5vw] inline-block text-[#299fd1]">
                & Insights
                {/* MAIN UNDERLINE */}
                <span className="absolute bottom-[-12px] left-[5%] right-[-5%] h-[5px] overflow-hidden bg-[#299fd1]/15 sm:bottom-[-18px]">
                  <motion.span
                    initial={{
                      x: "-100%",
                    }}
                    animate={{
                      x: "0%",
                    }}
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
                  initial={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: 1.15,
                  }}
                  className="absolute bottom-[-18px] right-[-12px] h-3 w-3 rounded-full border-2 border-[#299fd1] bg-[#f6f3ec] sm:bottom-[-25px]"
                />
              </span>
            </motion.h1>

            {/* HERO LOWER */}

            <div className="mt-14 grid gap-10 border-t border-[#14304f]/15 pt-8 lg:grid-cols-[1fr_420px] lg:items-end xl:grid-cols-[1fr_500px]">
              {/* DESCRIPTION */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.25,
                }}
              >
                <p className="max-w-[820px] text-[19px] font-medium leading-[1.65] text-[#304960] sm:text-[22px] lg:text-[24px]">
                  Ideas about{" "}
                  <span className="font-black text-[#081f35]">
                    language, psychology, confidence
                  </span>{" "}
                  and communication — explored through research and translated
                  into practical learning.
                </p>

                <div className="mt-7 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#102d4a]" />

                  <span className="text-[12px] font-black uppercase tracking-[0.22em] text-[#102d4a]">
                    Read. Question. Apply.
                  </span>
                </div>
              </motion.div>

              {/* =================================================
                  IMPROVED STATS
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
                  duration: 0.6,
                  delay: 0.35,
                }}
                className="relative grid grid-cols-2 gap-3"
              >
                {/* CARD 01 */}

                <motion.div
                  whileHover={{
                    y: -5,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="group/stat relative overflow-hidden border border-[#14304f]/15 bg-white p-5 shadow-[0_10px_35px_rgba(16,45,74,.06)] transition-all duration-500 hover:border-[#299fd1]/45 hover:shadow-[0_18px_45px_rgba(16,45,74,.12)] sm:p-6"
                >
                  <div className="absolute left-0 top-0 h-full w-[3px] bg-[#299fd1]" />

                  <div className="absolute right-[-25px] top-[-25px] h-24 w-24 rounded-full border border-[#299fd1]/10 transition-transform duration-700 group-hover/stat:scale-125" />

                  <div className="relative">
                    <div className="mb-7 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#71818d]">
                        Library
                      </span>

                      <span className="h-2 w-2 rounded-full bg-[#299fd1] transition-transform duration-300 group-hover/stat:scale-150" />
                    </div>

                    <p className="font-display text-[62px] font-semibold leading-none tracking-[-0.07em] text-[#081f35] sm:text-[72px]">
                      {resourcesData.length}
                      <span className="ml-1 text-[25px] text-[#299fd1]">+</span>
                    </p>

                    <div className="mt-4 h-px w-full bg-[#14304f]/10" />

                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#102d4a]">
                      Research pieces
                    </p>
                  </div>
                </motion.div>

                {/* CARD 02 */}

                <motion.div
                  whileHover={{
                    y: -5,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="group/stat relative overflow-hidden border border-[#14304f]/15 bg-[#102d4a] p-5 shadow-[0_10px_35px_rgba(16,45,74,.10)] transition-all duration-500 hover:border-[#62c9df]/50 hover:shadow-[0_18px_45px_rgba(16,45,74,.18)] sm:p-6"
                >
                  <div className="absolute right-0 top-0 h-full w-[3px] bg-[#62c9df]" />

                  <div className="absolute bottom-[-35px] right-[-35px] h-32 w-32 rounded-full border border-[#62c9df]/15 transition-transform duration-700 group-hover/stat:scale-125" />

                  <div className="relative">
                    <div className="mb-7 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
                        Scope
                      </span>

                      <span className="h-2 w-2 rounded-full bg-[#62c9df] transition-transform duration-300 group-hover/stat:scale-150" />
                    </div>

                    <p className="font-display text-[62px] font-semibold leading-none tracking-[-0.07em] text-white sm:text-[72px]">
                      07
                    </p>

                    <div className="mt-4 h-px w-full bg-white/15" />

                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                      Fields explored
                    </p>
                  </div>
                </motion.div>

                {/* MICRO FOOTNOTE */}

                <div className="col-span-2 flex items-center justify-end gap-2 pr-1">
                  <span className="h-px w-8 bg-[#14304f]/20" />

                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#71818d]">
                    Updated research library · 2026
                  </span>
                </div>
              </motion.div>
            </div>

            {/* MOVING TOPIC STRIP */}

            <div className="mt-10 overflow-hidden border-y border-[#14304f]/15 py-4">
              <motion.div
                animate={{
                  x: ["0%", "-50%"],
                }}
                transition={{
                  duration: 22,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex w-max items-center gap-8 whitespace-nowrap"
              >
                {[
                  "LANGUAGE",
                  "PSYCHOLOGY",
                  "LEADERSHIP",
                  "PRONUNCIATION",
                  "FLUENCY",
                  "CAREER",
                  "COMMUNICATION",
                  "LANGUAGE",
                  "PSYCHOLOGY",
                  "LEADERSHIP",
                  "PRONUNCIATION",
                  "FLUENCY",
                  "CAREER",
                  "COMMUNICATION",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-8">
                    <span className="text-[13px] font-black uppercase tracking-[0.22em] text-[#102d4a]">
                      {item}
                    </span>

                    <span className="h-1.5 w-1.5 rounded-full bg-[#102d4a]" />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY FILTER
      ===================================================== */}

      <section className="relative px-5 sm:px-8 lg:px-[4.5vw]">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex overflow-x-auto border-y border-[#14304f]/15 scrollbar-hide">
            {categories.map((category) => {
              const active = category === activeCategory;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative shrink-0 px-5 py-5 text-[14px] uppercase tracking-[0.16em] transition-all ${
                    active
                      ? "font-black text-[#081f35]"
                      : "font-bold text-[#435b6f] hover:text-[#14304f]"
                  }`}
                >
                  {category}

                  {active && (
                    <motion.span
                      layoutId="activeCategory"
                      className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#299fd1]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          ARTICLES
      ===================================================== */}

      <section className="relative px-5 pb-28 pt-12 sm:px-8 sm:pt-16 lg:px-[4.5vw] lg:pb-36">
        <div className="mx-auto max-w-[1600px]">
          {featured && (
            <FeaturedArticle resource={featured} onOpen={setSelectedResource} />
          )}

          <div className={featured ? "mt-16" : ""}>
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
            <div className="flex min-h-[300px] items-center justify-center border-y border-[#14304f]/10">
              <p className="text-[16px] font-medium text-[#52677c]">
                No research pieces found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative px-5 pb-20 sm:px-8 lg:px-[4.5vw]">
        <div className="mx-auto max-w-[1600px]">
          <div className="relative overflow-hidden bg-[#102d4a] px-7 py-14 sm:px-12 sm:py-18 lg:px-16 lg:py-20">
            <div className="absolute right-[-100px] top-[-130px] h-[400px] w-[400px] rounded-full bg-[#299fd1]/20 blur-[100px]" />

            <div className="absolute bottom-[-180px] left-[30%] h-[350px] w-[350px] rounded-full bg-[#62c9df]/10 blur-[100px]" />

            <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div>
                <div className="mb-6 flex items-center gap-2">
                  <Sparkles size={15} className="text-[#62c9df]" />

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#62c9df]">
                    Beyond the research
                  </span>
                </div>

                <h2 className="max-w-[850px] font-display text-[42px] font-semibold leading-[0.95] tracking-[-0.045em] text-white sm:text-[56px] lg:text-[68px]">
                  Read something.
                  <br />
                  <span className="text-[#62c9df]">Then make it useful.</span>
                </h2>
              </div>

              <Link
                to="/programs"
                className="group inline-flex shrink-0 items-center gap-3 border border-white/25 px-6 py-4 text-[11px] font-black uppercase tracking-[0.17em] text-white transition-all hover:border-[#62c9df] hover:bg-[#62c9df] hover:text-[#102d4a]"
              >
                Explore Programs
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ARTICLE MODAL
      ===================================================== */}

      <AnimatePresence>
        {selectedResource && (
          <ArticleModal
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
