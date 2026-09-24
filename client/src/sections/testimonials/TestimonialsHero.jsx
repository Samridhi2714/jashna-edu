import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Quote, Star, X } from "lucide-react";

import testimonialsData from "../../data/testimonials";

function TestimonialsHero() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedOrigin, setSelectedOrigin] = useState({ x: 0, y: 0 });

  const portraitPositions = [
    {
      left: "1.5%",
      top: "53%",
      rotate: -10,
      delay: 0,
      floatY: [0, -10, 0],
      floatRotate: [-10, -7, -10],
    },

    {
      left: "7%",
      top: "35%",
      rotate: 8,
      delay: 0.12,
      floatY: [0, 12, 0],
      floatRotate: [8, 4, 8],
    },

    {
      left: "16.5%",
      top: "22%",
      rotate: -7,
      delay: 0.24,
      floatY: [0, -9, 0],
      floatRotate: [-7, -3, -7],
    },

    {
      left: "29%",
      top: "13%",
      rotate: 5,
      delay: 0.36,
      floatY: [0, 10, 0],
      floatRotate: [5, 9, 5],
    },

    {
      left: "40.5%",
      top: "10%",
      rotate: -5,
      delay: 0.48,
      floatY: [0, -8, 0],
      floatRotate: [-5, -1, -5],
    },

    {
      left: "51.5%",
      top: "10%",
      rotate: 6,
      delay: 0.6,
      floatY: [0, 9, 0],
      floatRotate: [6, 2, 6],
    },

    {
      left: "63%",
      top: "13%",
      rotate: -6,
      delay: 0.72,
      floatY: [0, -11, 0],
      floatRotate: [-6, -2, -6],
    },

    {
      left: "75.5%",
      top: "22%",
      rotate: 8,
      delay: 0.84,
      floatY: [0, 10, 0],
      floatRotate: [8, 3, 8],
    },

    {
      left: "85%",
      top: "35%",
      rotate: -8,
      delay: 0.96,
      floatY: [0, -9, 0],
      floatRotate: [-8, -3, -8],
    },

    {
      left: "90%",
      top: "53%",
      rotate: 10,
      delay: 1.08,
      floatY: [0, 11, 0],
      floatRotate: [10, 5, 10],
    },

    {
      left: "11%",
      top: "69%",
      rotate: -6,
      delay: 1.2,
      floatY: [0, -10, 0],
      floatRotate: [-6, -1, -6],
    },

    {
      left: "81%",
      top: "69%",
      rotate: 6,
      delay: 1.32,
      floatY: [0, 10, 0],
      floatRotate: [6, 1, 6],
    },
  ];

  const openTestimonial = (student, event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setSelectedOrigin({
      x: rect.left + rect.width / 2 - window.innerWidth / 2,
      y: rect.top + rect.height / 2 - window.innerHeight / 2,
    });

    setSelectedStudent(student);
  };

  const closeTestimonial = () => {
    setSelectedStudent(null);
  };

  return (
    <section
      className="
        relative min-h-[92vh] overflow-hidden
        px-5 pb-24 pt-44
        sm:px-8 sm:pt-48
        lg:px-10 lg:pb-32 lg:pt-48
      "
    >
      {/* =====================================================
          MAIN COLORFUL BACKGROUND — KEPT FROM ORIGINAL
      ====================================================== */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_8%_18%,rgba(51,141,253,0.42),transparent_34%),radial-gradient(circle_at_92%_22%,rgba(73,196,165,0.40),transparent_34%),radial-gradient(circle_at_50%_58%,rgba(124,108,255,0.25),transparent_38%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.95),transparent_55%)]
        "
      />

      <div
        className="
          pointer-events-none absolute left-1/2 top-[45%]
          h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2
          rounded-full bg-white/[0.50] blur-[90px]
        "
      />

      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -12, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="
          pointer-events-none absolute -left-28 top-20
          h-[430px] w-[430px] rounded-full bg-[#338DFD]/[0.16] blur-[90px]
        "
      />

      <motion.div
        animate={{ x: [0, -18, 0], y: [0, 15, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="
          pointer-events-none absolute -right-28 top-24
          h-[450px] w-[450px] rounded-full bg-[#49C4A5]/[0.16] blur-[95px]
        "
      />

      <div
        className="
          pointer-events-none absolute left-1/2 top-[58%]
          h-[420px] w-[420px] -translate-x-1/2
          rounded-full bg-[#7C6CFF]/[0.30] blur-[100px]
        "
      />

      <div
        className="
          pointer-events-none absolute inset-0 opacity-[0.035]
          bg-[linear-gradient(to_right,#10243E_1px,transparent_1px),linear-gradient(to_bottom,#10243E_1px,transparent_1px)]
          bg-[size:70px_70px]
        "
      />

      <div
        className="
          pointer-events-none absolute inset-0 opacity-[0.025]
          bg-[radial-gradient(circle_at_center,#10243E_0.7px,transparent_0.8px)]
          bg-[size:9px_9px]
        "
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="
          pointer-events-none absolute left-1/2 top-[28%]
          h-[510px] w-[510px] -translate-x-1/2 rounded-full
          border border-[#338DFD]/[0.12]
          sm:h-[610px] sm:w-[610px] lg:h-[690px] lg:w-[690px]
        "
      >
        <span className="absolute right-[9%] top-[18%] h-1.5 w-1.5 rounded-full bg-[#338DFD]/40 shadow-[0_0_14px_rgba(51,141,253,0.25)]" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        className="
          pointer-events-none absolute left-1/2 top-[32%]
          h-[360px] w-[360px] -translate-x-1/2 rounded-full
          border border-[#7C6CFF]/[0.075]
          sm:h-[450px] sm:w-[450px]
        "
      >
        <span className="absolute left-[7%] top-1/2 h-1 w-1 rounded-full bg-[#7C6CFF]/35" />
      </motion.div>

      {/* =====================================================
          STUDENT PORTRAITS
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        {testimonialsData.slice(0, 12).map((student, index) => {
          const position = portraitPositions[index];

          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.65, y: 25 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: position.floatY,
                rotate: position.floatRotate,
              }}
              transition={{
                opacity: { duration: 0.7, delay: position.delay },
                scale: {
                  duration: 0.8,
                  delay: position.delay,
                  ease: [0.22, 1, 0.36, 1],
                },
                y: {
                  duration: 4 + (index % 3) * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: position.delay,
                },
                rotate: {
                  duration: 4 + (index % 3) * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: position.delay,
                },
              }}
              className="absolute hidden lg:block"
              style={{ left: position.left, top: position.top }}
            >
              <motion.button
                type="button"
                aria-label={`Open testimonial from ${student.name}`}
                onClick={(event) => openTestimonial(student, event)}
                whileHover={{
                  scale: 1.15,
                  rotate:
                    position.rotate > 0
                      ? position.rotate + 7
                      : position.rotate - 7,
                  zIndex: 50,
                }}
                whileTap={{ scale: 0.96 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 16,
                }}
                className="
                  pointer-events-auto group relative block
                  h-[112px] w-[112px] cursor-pointer
                  sm:h-[120px] sm:w-[120px]
                  lg:h-[132px] lg:w-[132px]
                  xl:h-[142px] xl:w-[142px]
                "
              >
                {/* Animated transition border */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 5.5 + index * 0.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    pointer-events-none absolute -inset-[6px]
                    rounded-[31px]
                    bg-[conic-gradient(from_0deg,#338DFD,#7C6CFF,#49C4A5,#F7C65D,#338DFD)]
                    opacity-85 blur-[1px]
                  "
                />

                {/* Secondary glass ring */}
                <div
                  className="
                    pointer-events-none absolute -inset-[10px]
                    rounded-[35px] border border-white/45
                    opacity-50 transition-all duration-500
                    group-hover:border-white group-hover:opacity-100
                  "
                />

                {/* Soft halo */}
                <div
                  className="
                    pointer-events-none absolute -inset-5 rounded-[38px]
                    bg-gradient-to-br from-[#338DFD]/30 via-[#7C6CFF]/15 to-[#49C4A5]/30
                    opacity-0 blur-2xl transition-all duration-500
                    group-hover:opacity-100
                  "
                />

                {/* Diamond */}
                <div
                  className="
                    relative h-full w-full rotate-45 overflow-hidden
                    rounded-[25px] border-[3.5px] border-white/95
                    bg-white shadow-[0_18px_45px_rgba(16,36,62,0.20)]
                    transition-all duration-500
                    group-hover:shadow-[0_25px_65px_rgba(51,141,253,0.38)]
                  "
                >
                  <img
                    src={student.image}
                    alt={`${student.name} - Jashna Edu student testimonial`}
                    className="
                      h-full w-full -rotate-45 scale-[1.18] object-cover
                      transition-transform duration-700 ease-out
                      group-hover:scale-[1.28]
                    "
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#338DFD]/5 via-transparent to-[#49C4A5]/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                <div
                  className="
                    pointer-events-none absolute left-1/2 top-1/2 z-30
                    -translate-x-1/2 -translate-y-1/2 whitespace-nowrap
                    rounded-full bg-[#10141C]/90 px-3 py-1.5
                    text-[7px] font-bold uppercase tracking-[0.16em] text-white
                    opacity-0 shadow-xl backdrop-blur-md transition-all duration-300
                    group-hover:opacity-100
                  "
                >
                  Tap to explore ↗
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div
        className="
          relative z-10 mx-auto flex min-h-[64vh] max-w-6xl
          translate-y-7 flex-col items-center justify-center text-center
          lg:translate-y-10
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mb-7 flex items-center justify-center gap-3"
        >
          <span className="h-px w-9 bg-gradient-to-r from-transparent to-[#338DFD]/60" />

          <span className="rounded-full border border-[#338DFD]/20 bg-white/60 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-[#276FD1] shadow-[0_8px_25px_rgba(51,141,253,0.07)] backdrop-blur-xl">
            Jashna Edu Student Testimonials
          </span>

          <span className="h-px w-9 bg-gradient-to-r from-[#49C4A5]/60 to-transparent" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.85,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            max-w-6xl font-display text-[clamp(3rem,7.2vw,7rem)]
            font-bold leading-[0.9] tracking-[-0.065em] text-[#10141C]
          "
        >
          Trusted by Learners
          <br />
          <span className="bg-gradient-to-r from-[#338DFD] via-[#6678F5] to-[#42BFA0] bg-clip-text text-transparent">
            at Every Stage.
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-base font-semibold tracking-[-0.01em] text-[#182235]/85 sm:text-lg lg:text-xl"
        >
          <span>Different Ages.</span>
          <span className="text-[#338DFD]">Different Ambitions.</span>
          <span className="text-[#31A989]">One Shared Journey.</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38 }}
          className="mt-6 max-w-2xl text-sm leading-7 text-[#182235]/65 sm:text-base sm:leading-8"
        >
          Meet learners from different academic, professional and personal
          backgrounds who are developing the confidence to communicate,
          participate and express themselves.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.52 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-2"
        >
          {["School", "College", "IELTS", "Professionals", "Career Growth"].map(
            (item) => (
              <motion.span
                key={item}
                whileHover={{ y: -3, scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="
                  rounded-full border border-white/70 bg-white/60 px-3.5 py-2
                  text-[9px] font-bold uppercase tracking-[0.12em] text-[#26344B]/55
                  shadow-[0_6px_22px_rgba(16,36,62,0.055)] backdrop-blur-xl
                  transition-colors duration-300 hover:border-[#338DFD]/20 hover:text-[#338DFD]
                "
              >
                {item}
              </motion.span>
            ),
          )}
        </motion.div>

        <motion.span
          animate={{ y: [0, -7, 0], rotate: [-3, 1, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[3%] top-[38%] hidden rounded-full border border-white/60 bg-white/35 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-[#338DFD]/55 shadow-[0_8px_25px_rgba(51,141,253,0.06)] backdrop-blur-xl lg:block"
        >
          Speak
        </motion.span>

        <motion.span
          animate={{ y: [0, 8, 0], rotate: [3, -1, 3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-[4%] top-[45%] hidden rounded-full border border-white/60 bg-white/35 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-[#31A989]/65 shadow-[0_8px_25px_rgba(73,196,165,0.06)] backdrop-blur-xl lg:block"
        >
          Express
        </motion.span>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="absolute bottom-[-18px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#182235]/35">
            Meet the voices
          </span>

          <motion.span
            animate={{ height: [18, 32, 18], opacity: [0.3, 0.75, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-px bg-gradient-to-b from-[#338DFD]/60 via-[#49C4A5]/50 to-transparent"
          />
        </motion.div>
      </div>

      {/* =====================================================
          CENTER TESTIMONIAL CARD
      ====================================================== */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-8 sm:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              aria-label="Close testimonial"
              onClick={closeTestimonial}
              className="absolute inset-0 cursor-default bg-[#07111F]/50 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute h-[440px] w-[440px] rounded-full border border-white/15"
            />

            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, 12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute h-[330px] w-[330px] rounded-full bg-[#338DFD]/20 blur-[80px]"
            />

            <motion.article
              initial={{
                opacity: 0,
                x: selectedOrigin.x,
                y: selectedOrigin.y,
                scale: 0.28,
                rotate: selectedOrigin.x >= 0 ? 10 : -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
              }}
              exit={{
                opacity: 0,
                x: selectedOrigin.x * 0.55,
                y: selectedOrigin.y * 0.55,
                scale: 0.3,
                rotate: selectedOrigin.x >= 0 ? 8 : -8,
              }}
              transition={{
                type: "spring",
                stiffness: 145,
                damping: 18,
                mass: 0.9,
              }}
              className="
                relative z-10 w-full max-w-[900px] overflow-hidden
                rounded-[34px] border border-white/60
                bg-[#081525]/90 p-3
                shadow-[0_35px_120px_rgba(0,0,0,0.38)]
                backdrop-blur-2xl sm:rounded-[42px] sm:p-4
              "
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="
                  pointer-events-none absolute -inset-[2px] -z-10
                  rounded-[44px]
                  bg-[conic-gradient(from_0deg,#338DFD,#7C6CFF,#49C4A5,#F7C65D,#338DFD)]
                  opacity-90 blur-[2px]
                "
              />

              <div
                className="
                  relative overflow-hidden rounded-[29px]
                  bg-[radial-gradient(circle_at_15%_10%,rgba(51,141,253,0.32),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(73,196,165,0.28),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(124,108,255,0.24),transparent_45%),linear-gradient(135deg,#0A1728,#101A30)]
                  px-6 py-8 text-white sm:px-10 sm:py-10
                "
              >
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:42px_42px]" />

                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#49C4A5]/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[#7C6CFF]/20 blur-3xl" />

                <button
                  type="button"
                  onClick={closeTestimonial}
                  aria-label="Close testimonial"
                  className="absolute right-5 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 backdrop-blur-xl transition hover:bg-white/20 hover:text-white"
                >
                  <X size={18} />
                </button>

                <div className="relative z-10 grid items-center gap-8 md:grid-cols-[250px_1fr]">
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0.65, rotate: -15 }}
                      animate={{ scale: 1, rotate: -6 }}
                      transition={{
                        delay: 0.12,
                        type: "spring",
                        stiffness: 180,
                      }}
                      className="relative h-[190px] w-[190px] sm:h-[220px] sm:w-[220px]"
                    >
                      <div className="absolute -inset-5 rounded-[48px] bg-gradient-to-br from-[#338DFD]/40 via-[#7C6CFF]/30 to-[#49C4A5]/35 blur-2xl" />

                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 7,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute -inset-[6px] rounded-[45px] bg-[conic-gradient(from_0deg,#338DFD,#7C6CFF,#49C4A5,#F7C65D,#338DFD)]"
                      />

                      <div className="relative h-full w-full rotate-45 overflow-hidden rounded-[38px] border-4 border-white bg-white shadow-[0_25px_70px_rgba(0,0,0,0.32)]">
                        <img
                          src={selectedStudent.image}
                          alt={selectedStudent.name}
                          className="h-full w-full -rotate-45 scale-[1.43] object-cover"
                        />
                      </div>

                      <motion.div
                        animate={{ y: [0, -7, 0], rotate: [0, 4, 0] }}
                        transition={{
                          duration: 3.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute -bottom-4 -right-5 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl"
                      >
                        Jashna Voice
                      </motion.div>
                    </motion.div>
                  </div>

                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#7ED8FF]">
                        <Quote size={18} />
                      </span>

                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-white/45">
                          Student voice
                        </p>

                        <div className="mt-1 flex gap-1 text-[#F7C65D]">
                          {Array.from({ length: selectedStudent.rating }).map(
                            (_, i) => (
                              <Star key={i} size={13} fill="currentColor" />
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="max-w-2xl text-[clamp(1.35rem,2.5vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-white">
                      “{selectedStudent.review}”
                    </p>

                    <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5">
                      <div>
                        <h3 className="text-xl font-bold tracking-[-0.02em]">
                          {selectedStudent.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/55">
                          {selectedStudent.course} · {selectedStudent.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/65">
                        Explore the journey
                        <ArrowUpRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default TestimonialsHero;
