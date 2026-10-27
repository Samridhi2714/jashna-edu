import { API_URL as BASE_URL } from "../config";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  Headphones,
  ListChecks,
  LoaderCircle,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const API_BASE_URL = (
  BASE_URL
).replace(/\/+$/, "");

const API_URL = `${API_BASE_URL}/api/assessment-links`;

const WHATSAPP_NUMBER = "919953009947";

const getIELTSWhatsAppLink = () => {
  const message =
    "Hello Dr. Shivam Sir, I would like to know more about the IELTS Mock Band Test at Jashna Edu. Please guide me regarding the process and available timings.";

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const FONT = { fontFamily: '"Times New Roman", Times, serif' };

const DEFAULT_ASSESSMENTS = [
  {
    assessmentType: "general-english",
    title: "General English",
    description:
      "Evaluate your English fundamentals and build confidence in everyday communication.",
    icon: BookOpen,
    accent: "from-blue-600 via-sky-500 to-cyan-400",
    tint: "bg-blue-50 text-blue-700",
    glow: "56,189,248",
    tag: "6 practice sets",
    features: ["English fundamentals", "Six practice sets", "Self-paced assessment"],
  },
  {
    assessmentType: "business-english",
    title: "Business English",
    description:
      "Strengthen the language skills you need for professional communication and the workplace.",
    icon: BriefcaseBusiness,
    accent: "from-emerald-600 via-teal-500 to-emerald-300",
    tint: "bg-emerald-50 text-emerald-700",
    glow: "52,211,153",
    tag: "6 practice sets",
    features: ["Professional communication", "Six practice sets", "Workplace English"],
  },
];

const IELTS_CARD = {
  assessmentType: "ielts-mock",
  title: "IELTS Mock Band Test",
  description:
    "Take the next step towards IELTS preparation with guidance on your mock test and band assessment.",
  icon: Headphones,
  accent: "from-violet-600 via-indigo-500 to-blue-400",
  tint: "bg-violet-50 text-violet-700",
  glow: "167,139,250",
  tag: "Guided by our team",
  features: ["IELTS-focused guidance", "Discuss your preparation", "Connect with our team"],
};

const createDefaultSets = (assessmentType) =>
  Array.from({ length: 6 }, (_, index) => ({
    setNumber: index + 1,
    title: `Test Set ${index + 1}`,
    link:
      assessmentType === "general-english" && index === 0
        ? "https://forms.gle/ZCvBieT6vtseHD2Q6"
        : "",
  }));

/* ------------------------------------------------------------------ */
/* Top ticker – keeps wide screens from feeling empty                  */
/* ------------------------------------------------------------------ */

function Ticker() {
  const items = [
    "Grammar",
    "Vocabulary",
    "Reading",
    "Writing",
    "Listening",
    "Speaking",
    "Workplace English",
    "IELTS preparation",
  ];
  const row = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-[#102B4E]/10 bg-[#C5DDF5] py-3 text-[#102B4E]/80">
      <div className="ja-marquee flex w-max items-center gap-10 whitespace-nowrap text-base sm:text-lg">
        {row.concat(row).map((item, i) => (
          <span key={i} className="inline-flex items-center gap-10">
            <span className="italic">{item}</span>
            <Sparkles size={14} className="text-emerald-600" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#C5DDF5] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#C5DDF5] to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quick picks – fills the top of wide screens with something useful   */
/* ------------------------------------------------------------------ */

function QuickPicks({ reduceMotion }) {
  const picks = [
    { ...DEFAULT_ASSESSMENTS[0], note: "Everyday communication" },
    { ...DEFAULT_ASSESSMENTS[1], note: "Workplace English" },
    { ...IELTS_CARD, note: "Mock band guidance" },
  ];

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:mt-16">
      {picks.map((pick, i) => {
        const Icon = pick.icon;
        return (
          <motion.a
            key={pick.assessmentType}
            href="#assessments"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-4 rounded-3xl border border-white bg-white/80 p-5 text-left shadow-[0_10px_30px_rgba(16,43,78,0.08)] transition-shadow hover:shadow-[0_20px_45px_rgba(16,43,78,0.16)] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/60"
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${pick.tint} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
            >
              <Icon size={26} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-bold text-[#102B4E]">
                {pick.title}
              </span>
              <span className="block text-base italic text-slate-600">
                {pick.note}
              </span>
            </span>
            <ArrowRight
              size={20}
              className="shrink-0 text-[#102B4E]/60 transition-transform duration-300 group-hover:translate-x-1.5"
            />
          </motion.a>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating skill tiles – decorative, wide screens only                */
/* ------------------------------------------------------------------ */

function FloatingTiles({ reduceMotion }) {
  const tiles = [
    { label: "Reading", icon: BookOpen, pos: "left-[4%] top-[28%]", tint: "bg-blue-100 text-blue-700", delay: 0 },
    { label: "Business English", icon: BriefcaseBusiness, pos: "left-[7%] top-[62%]", tint: "bg-emerald-100 text-emerald-700", delay: 1.2 },
    { label: "Listening", icon: Headphones, pos: "right-[4%] top-[26%]", tint: "bg-violet-100 text-violet-700", delay: 0.6 },
    { label: "Confidence", icon: GraduationCap, pos: "right-[7%] top-[60%]", tint: "bg-amber-100 text-amber-700", delay: 1.8 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden 2xl:block">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1, y: [0, -12, 0] }
            }
            transition={{
              opacity: { duration: 0.6, delay: 0.4 + t.delay * 0.2 },
              scale: { duration: 0.6, delay: 0.4 + t.delay * 0.2 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: t.delay },
            }}
            className={`absolute flex flex-col items-center gap-3 rounded-[28px] bg-white/90 px-7 py-6 shadow-[0_16px_40px_rgba(16,43,78,0.12)] ${t.pos}`}
          >
            <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${t.tint}`}>
              <Icon size={30} strokeWidth={1.7} />
            </span>
            <span className="text-lg font-semibold text-[#102B4E]">{t.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function RotatingPhrase({ reduceMotion }) {
  const phrases = [
    "everyday conversations",
    "the modern workplace",
    "IELTS preparation",
  ];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setI((n) => (n + 1) % phrases.length), 2600);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <p className="mt-5 flex flex-wrap items-center justify-center gap-x-3 text-2xl italic text-[#215e93] sm:text-3xl lg:text-4xl">
      <span>Built for</span>
      <span className="relative inline-flex h-[1.4em] min-w-[11ch] items-center justify-center overflow-hidden font-bold text-emerald-700">
        <AnimatePresence mode="wait">
          <motion.span
            key={phrases[i]}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="whitespace-nowrap"
          >
            {phrases[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

function HowItWorks({ reduceMotion }) {
  const steps = [
    {
      icon: MousePointerClick,
      title: "Choose an assessment",
      text: "Pick General English, Business English or the IELTS mock band test.",
    },
    {
      icon: ListChecks,
      title: "Work through a test set",
      text: "Open an available set and practise at your own pace.",
    },
    {
      icon: MessageCircle,
      title: "Ask for guidance",
      text: "Message our team on WhatsApp to plan your next step.",
    },
  ];

  return (
    <section className="mt-20 sm:mt-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-lg font-semibold italic text-emerald-700">How it works</p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#102B4E] sm:text-5xl">
          Three simple steps
        </h2>
      </div>

      <div className="relative mt-12 grid gap-6 md:grid-cols-3">
        <div
          aria-hidden
          className="absolute left-[16%] right-[16%] top-[3.1rem] hidden border-t-2 border-dashed border-blue-200 md:block"
        />
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={reduceMotion ? undefined : { y: -8 }}
              className="group relative rounded-[28px] border border-slate-200/80 bg-white p-7 text-center shadow-[0_14px_40px_rgba(16,43,78,0.07)] transition-shadow hover:shadow-[0_26px_60px_rgba(16,43,78,0.15)]"
            >
              <span className="relative mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[#DCEBFA] text-[#102B4E] ring-8 ring-white transition-colors duration-300 group-hover:bg-[#102B4E] group-hover:text-white">
                <Icon size={30} strokeWidth={1.7} />
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-base font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-5 text-2xl font-bold text-[#102B4E]">{step.title}</h3>
              <p className="mt-2 text-lg leading-8 text-slate-600">{step.text}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Card with tilt + cursor spotlight                                   */
/* ------------------------------------------------------------------ */

function AssessmentCard({ card, index, reduceMotion, action }) {
  const Icon = card.icon;
  const ref = useRef(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), {
    stiffness: 160,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), {
    stiffness: 160,
    damping: 20,
  });
  const spotlight = useMotionTemplate`radial-gradient(380px circle at ${mx}% ${my}%, rgba(${card.glow},0.22), transparent 65%)`;

  const handleMove = (e) => {
    if (reduceMotion || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    px.set(x - 0.5);
    py.set(y - 0.5);
    mx.set(x * 100);
    my.set(y * 100);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
  };

  const buttonClass =
    "mt-8 flex w-full items-center justify-between gap-3 rounded-2xl px-6 py-4 text-left text-lg font-bold text-white transition-all focus:outline-none focus-visible:ring-4";

  return (
    <div className="h-full [perspective:1200px]">
      <motion.article
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={reduceMotion ? undefined : { rotateX, rotateY }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55, delay: index * 0.1 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(16,43,78,0.08)] transition-shadow duration-500 hover:shadow-[0_34px_80px_rgba(16,43,78,0.18)]"
      >
        <motion.div
          aria-hidden
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className={`h-2.5 bg-gradient-to-r ${card.accent}`} />

        <div className="relative flex flex-1 flex-col p-7 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-3xl ${card.tint} transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}
            >
              <Icon size={30} strokeWidth={1.7} />
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
              {card.tag}
            </span>
          </div>

          <h2 className="mt-8 text-3xl font-bold tracking-tight text-[#102B4E] sm:text-4xl">
            {card.title}
          </h2>

          <p className="mt-3 min-h-[96px] text-lg leading-8 text-slate-600">
            {card.description}
          </p>

          <ul className="mt-5 space-y-3">
            {card.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-lg text-slate-700"
              >
                <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            {action.href ? (
              <a
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonClass} bg-[#128C58] hover:bg-[#0E7549] focus-visible:ring-emerald-200`}
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle size={20} />
                  {action.label}
                </span>
                <ArrowRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </a>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className={`${buttonClass} bg-[#102B4E] hover:bg-[#215e93] focus-visible:ring-blue-100`}
              >
                <span>{action.label}</span>
                <ArrowRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </button>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

function TestSetModal({ assessment, sets, loading, error, onClose, onRetry }) {
  const availableCount = sets.filter((set) => set.link?.trim()).length;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <motion.div
      key="assessment-modal"
      style={FONT}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#07172c]/70 p-0 backdrop-blur-md sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="assessment-modal-title"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[32px] bg-white shadow-2xl sm:rounded-[32px]"
      >
        <div className={`h-2.5 bg-gradient-to-r ${assessment.accent}`} />
        <div className="p-6 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold italic text-emerald-700">
                Choose a test set
              </p>
              <h2
                id="assessment-modal-title"
                className="mt-1 text-3xl font-bold text-[#102B4E] sm:text-4xl"
              >
                {assessment.title}
              </h2>
              <p className="mt-2 max-w-xl text-lg leading-7 text-slate-500">
                Select a set to begin. Upcoming sets appear here as soon as they
                are ready.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close test sets"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:rotate-90 hover:bg-slate-200"
            >
              <X size={21} />
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-base font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />
                {availableCount} of {sets.length} available
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={17} />
                Self-paced
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${assessment.accent}`}
                initial={{ width: 0 }}
                animate={{ width: `${(availableCount / (sets.length || 1)) * 100}%` }}
                transition={{ duration: 0.7, delay: 0.15 }}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <LoaderCircle size={32} className="animate-spin text-blue-600" />
              <p className="mt-4 text-lg">Loading available test sets...</p>
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <p className="text-lg font-semibold text-rose-800">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-base font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sets.map((set, index) => {
                const isAvailable = Boolean(set.link?.trim());

                return (
                  <motion.div
                    key={set.setNumber}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={isAvailable ? { y: -4 } : undefined}
                    className={`rounded-2xl border p-5 transition-colors ${
                      isAvailable
                        ? "border-emerald-200 bg-emerald-50/60 hover:border-emerald-400 hover:bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${
                          isAvailable
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {set.setNumber}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          isAvailable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isAvailable ? "Available" : "Coming soon"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-bold text-[#102B4E]">
                      {set.title || `Test Set ${set.setNumber}`}
                    </h3>

                    {isAvailable ? (
                      <a
                        href={set.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-4 py-3 text-base font-bold text-white transition hover:bg-[#215e93]"
                      >
                        Start test
                        <ExternalLink size={16} />
                      </a>
                    ) : (
                      <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-base text-slate-400 ring-1 ring-slate-200">
                        <Clock3 size={16} />
                        Not available yet
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-7 w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Assessment() {
  const reduceMotion = useReducedMotion();
  const [assessments, setAssessments] = useState(
    DEFAULT_ASSESSMENTS.map((a) => ({
      ...a,
      sets: createDefaultSets(a.assessmentType),
    })),
  );
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAssessments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("We couldn't load the assessment links. Please try again.");
      }

      const data = await response.json();
      const records = data.assessments || data.data || [];

      setAssessments(
        DEFAULT_ASSESSMENTS.map((defaultAssessment) => {
          const saved = records.find(
            (item) => item.assessmentType === defaultAssessment.assessmentType,
          );

          return {
            ...defaultAssessment,
            title: saved?.title || defaultAssessment.title,
            sets:
              saved?.sets?.length === 6
                ? saved.sets
                : createDefaultSets(defaultAssessment.assessmentType),
          };
        }),
      );
    } catch (fetchError) {
      setError(
        fetchError.message ||
          "Unable to connect to the assessment service. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const selectedAssessment = assessments.find(
    (a) => a.assessmentType === selectedType,
  );

  const closeModal = () => {
    setSelectedType(null);
    setError("");
  };

  return (
    <div
      style={FONT}
      className="min-h-screen bg-[#F6F4EE] text-[#102B4E] antialiased"
    >
      <style>{`
        @keyframes ja-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ja-marquee { animation: ja-marquee 40s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ja-marquee { animation: none; } }
      `}</style>

      {/* Hero */}
      <header className="relative isolate overflow-hidden pt-20 md:pt-24 bg-gradient-to-b from-[#CFE3F8] via-[#DCEBFA] to-[#E9F3FD]">
        <Ticker />

        <div className="absolute -right-24 top-16 h-96 w-96 rounded-full bg-sky-300/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-emerald-200/60 blur-3xl" />
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
        <div
          aria-hidden
          className="absolute -right-16 top-32 hidden h-72 w-72 rounded-full border-2 border-dashed border-[#215e93]/20 lg:block"
        />
        <div
          aria-hidden
          className="absolute -left-12 bottom-24 hidden h-56 w-56 rounded-full border-2 border-[#215e93]/15 lg:block"
        />
        <FloatingTiles reduceMotion={reduceMotion} />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#102B4E_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="relative mx-auto max-w-[1300px] px-5 pb-24 pt-14 text-center sm:px-8 sm:pb-28 sm:pt-20 lg:px-12 lg:pt-24 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-base text-[#215e93]">
              <Sparkles size={16} />
              Jashna Edu assessments
            </span>

            <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight text-[#102B4E] sm:text-6xl lg:text-7xl 2xl:text-8xl">
              Discover your English potential.
            </h1>

            <RotatingPhrase reduceMotion={reduceMotion} />

            <p className="mx-auto mt-6 max-w-2xl text-xl leading-9 text-slate-700 sm:text-2xl sm:leading-10">
              Explore our English assessments, practise at your own pace, and
              take the next step towards confident communication.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#assessments"
                className="group inline-flex items-center gap-3 rounded-full bg-[#102B4E] px-7 py-4 text-lg font-bold text-white transition hover:bg-[#215e93] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/60"
              >
                Choose an assessment
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
              <span className="inline-flex items-center gap-2 text-lg text-slate-700">
                <GraduationCap size={21} className="text-emerald-600" />
                Learn at your own pace
              </span>
            </div>
          </motion.div>

          <QuickPicks reduceMotion={reduceMotion} />
        </div>

        <svg
          aria-hidden
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-10 w-full text-[#F6F4EE] sm:h-14"
        >
          <path
            fill="currentColor"
            d="M0 60V28C240 4 480 0 720 14s480 26 720 4v42H0Z"
          />
        </svg>
      </header>

      {/* Cards */}
      <main
        id="assessments"
        className="mx-auto max-w-[1500px] scroll-mt-6 px-5 py-14 sm:px-8 sm:py-20 lg:px-12 2xl:px-16"
      >
        <div className="mb-10 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-semibold italic text-emerald-700">
              Find your starting point
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#102B4E] sm:text-5xl">
              Choose your assessment
            </h2>
          </div>

          <p className="max-w-md text-lg leading-8 text-slate-600">
            Start with the assessment that matches your personal or
            professional goals.
          </p>
        </div>

        {error && !selectedAssessment && (
          <div
            role="alert"
            className="mb-8 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-lg text-amber-900">{error}</p>
            <button
              type="button"
              onClick={fetchAssessments}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-base font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
          {assessments.map((assessment, index) => (
            <AssessmentCard
              key={assessment.assessmentType}
              card={assessment}
              index={index}
              reduceMotion={reduceMotion}
              action={{
                label: "Explore test sets",
                onClick: () => {
                  setError("");
                  setSelectedType(assessment.assessmentType);
                },
              }}
            />
          ))}

          <div className="md:col-span-2 xl:col-span-1">
            <AssessmentCard
              card={IELTS_CARD}
              index={2}
              reduceMotion={reduceMotion}
              action={{ label: "Contact Dr. Shivam", href: getIELTSWhatsAppLink() }}
            />
          </div>
        </div>

        <HowItWorks reduceMotion={reduceMotion} />

        {/* Help banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="relative mt-20 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#102B4E] to-[#1d4f86] p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-10"
        >
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="relative">
            <h3 className="text-2xl font-bold sm:text-3xl">
              Not sure which assessment to choose?
            </h3>
            <p className="mt-2 max-w-2xl text-lg leading-8 text-blue-100/85">
              Contact Jashna Edu for guidance on finding the right starting
              point for your goals.
            </p>
          </div>

          <a
            href={getIELTSWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative mt-6 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-lg font-bold text-[#102B4E] transition hover:bg-emerald-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 sm:mt-0"
          >
            Talk to our team
            <ArrowRight
              size={19}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </motion.div>
      </main>

      <AnimatePresence>
        {selectedAssessment && (
          <TestSetModal
            assessment={selectedAssessment}
            sets={
              selectedAssessment.sets ||
              createDefaultSets(selectedAssessment.assessmentType)
            }
            loading={loading}
            error={error}
            onClose={closeModal}
            onRetry={fetchAssessments}
          />
        )}
      </AnimatePresence>
    </div>
  );
}