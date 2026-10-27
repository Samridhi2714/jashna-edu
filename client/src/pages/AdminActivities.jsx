import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AudioWaveform,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  FileText,
  Languages,
  Leaf,
  MessageCircle,
  Mic,
  Rocket,
  Save,
  Search,
  ShieldCheck,
  SpellCheck,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import DESCRIPTORS, { CEFR_LEVELS } from "../data/Descriptors";

const API_URL = "http://localhost:5000";
const LEVELS = CEFR_LEVELS; // ["A1","A2","B1","B2","C1","C2"]

/* =====================================================================
   1. THEME — skill colours, icons, progressive shade generator
   ===================================================================== */

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// mix(hex, "white" | "black", amount 0..1)
const mix = (hex, target, amount) => {
  const from = hexToRgb(hex);
  const to = target === "white" ? [255, 255, 255] : [0, 0, 0];

  return (
    "#" +
    from
      .map((c, i) =>
        Math.round(c + (to[i] - c) * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
};

// A1 (very light) -> C2 (deepest)
const SHADES = [
  ["white", 0.88], // A1
  ["white", 0.68], // A2
  ["white", 0.45], // B1
  ["white", 0.2], // B2
  ["black", 0.1], // C1
  ["black", 0.38], // C2
];

const themeCache = {};

function getLevelTheme(skill, level) {
  const i = LEVELS.indexOf(level);

  if (i < 0) return null;

  const id = `${skill.key}-${level}`;

  if (themeCache[id]) return themeCache[id];

  const [target, amount] = SHADES[i];
  const bg = mix(skill.color, target, amount);
  const [r, g, b] = hexToRgb(bg);

  const dark = 0.299 * r + 0.587 * g + 0.114 * b < 140;

  themeCache[id] = {
    index: i,
    bg,
    dark,
    border: mix(bg, "black", 0.14),
    text: dark ? "#FFFFFF" : mix(skill.color, "black", 0.55),
    sub: dark ? "rgba(255,255,255,0.80)" : mix(skill.color, "black", 0.4),
    tile: dark ? "rgba(255,255,255,0.22)" : skill.color,
  };

  return themeCache[id];
}

// Fluency orange aur Interaction gold.
const RAW_SKILLS = [
  {
    key: "communication",
    label: "Communication",
    short: "COMM",
    color: "#2FA866",
    Icon: MessageCircle,
  },
  {
    key: "vocabulary",
    label: "Vocabulary",
    short: "VOCAB",
    color: "#338DFD",
    Icon: Languages,
  },
  {
    key: "grammar",
    label: "Grammar",
    short: "GRAM",
    color: "#8B5CF6",
    Icon: SpellCheck,
  },
  {
    key: "fluency",
    label: "Fluency",
    short: "FLUENCY",
    color: "#F08A1C",
    Icon: AudioWaveform,
  },
  {
    key: "pronunciation",
    label: "Pronunciation",
    short: "PRON",
    color: "#E04F78",
    Icon: Mic,
  },
  {
    key: "confidence",
    label: "Confidence",
    short: "CONF",
    color: "#0E9AA7",
    Icon: ShieldCheck,
  },
  {
    key: "interaction",
    label: "Interaction",
    short: "INTER",
    color: "#D4A017",
    Icon: Users,
  },
];

const CEFR_SKILLS = RAW_SKILLS.map((skill) => {
  const t = getLevelTheme(skill, "A1");

  return {
    ...skill,
    soft: t.bg,
    border: t.border,
    text: t.text,
  };
});

const REMARK_STYLE = {
  color: "#C65375",
  soft: "#FFF0F4",
  border: "#F2C3D0",
  text: "#9E3453",
};

const LEVEL_META = {
  A1: {
    title: "Foundation",
    description: "Basic familiar communication",
    Icon: Sprout,
  },
  A2: {
    title: "Elementary",
    description: "Routine everyday communication",
    Icon: Leaf,
  },
  B1: {
    title: "Intermediate",
    description: "Independent familiar communication",
    Icon: TrendingUp,
  },
  B2: {
    title: "Upper Intermediate",
    description: "Clear and increasingly flexible use",
    Icon: Rocket,
  },
  C1: {
    title: "Advanced",
    description: "Precise and flexible language",
    Icon: Award,
  },
  C2: {
    title: "Mastery",
    description: "Highly precise and nuanced use",
    Icon: Crown,
  },
};

/* =====================================================================
   2. HELPERS
   ===================================================================== */

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const shiftMonth = (monthString, amount) => {
  const [year, month] = monthString.split("-").map(Number);

  const date = new Date(year, month - 1 + amount, 1);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");

  return `${nextYear}-${nextMonth}`;
};

/**
 * A student is eligible for a monthly CEFR evaluation only from
 * their admission month through their course-end month, inclusive.
 * Dates are converted to YYYY-MM before comparison so the day of
 * admission/end does not accidentally exclude either boundary month.
 */
const getDateMonthKey = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
};

const isStudentEligibleForMonth = (student, monthKey) => {
  const admissionMonth = getDateMonthKey(student?.joiningDate);
  const courseEndMonth = getDateMonthKey(student?.courseEndDate);

  // Missing/invalid dates should not make a student appear in every month.
  if (!admissionMonth || !courseEndMonth || courseEndMonth < admissionMonth) {
    return false;
  }

  return monthKey >= admissionMonth && monthKey <= courseEndMonth;
};

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "?";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
};

const createEmptyEvaluation = () =>
  Object.fromEntries(CEFR_SKILLS.map(({ key }) => [key, ""]));

const isCompleteEvaluation = (evaluation = {}) =>
  CEFR_SKILLS.every(({ key }) => LEVELS.includes(evaluation?.[key]));

const getEvaluationScore = (evaluation = {}) => {
  const values = CEFR_SKILLS.map(
    ({ key }) => LEVELS.indexOf(evaluation?.[key]) + 1,
  ).filter((value) => value > 0);

  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getDisplayLevel = (evaluation = {}) => {
  const score = getEvaluationScore(evaluation);

  if (!score) return "—";

  const index = Math.max(0, Math.min(LEVELS.length - 1, Math.round(score) - 1));

  return LEVELS[index];
};

/* =====================================================================
   3. LEVEL PICKER — progressive shade button + popover
   ===================================================================== */

const POPOVER_WIDTH = 480;

function LevelPicker({ skill, value, onChange, studentName }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  const SkillIcon = skill.Icon;
  const theme = getLevelTheme(skill, value);
  const meta = value ? LEVEL_META[value] : null;

  const place = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    const height = popoverRef.current?.offsetHeight || 560;

    const pad = 16;

    const width = Math.min(POPOVER_WIDTH, window.innerWidth - pad * 2);

    const left = Math.min(
      Math.max(rect.left, pad),
      window.innerWidth - width - pad,
    );

    const fitsBelow = window.innerHeight - rect.bottom >= height + pad;

    const top = fitsBelow
      ? rect.bottom + 10
      : Math.max(
          pad,
          Math.min(rect.top - height - 10, window.innerHeight - height - pad),
        );

    setPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    place();

    const raf = requestAnimationFrame(place);

    const onOutside = (e) => {
      if (
        buttonRef.current?.contains(e.target) ||
        popoverRef.current?.contains(e.target)
      ) {
        return;
      }

      setOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutside);

    document.addEventListener("keydown", onKey);

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    return () => {
      cancelAnimationFrame(raf);

      document.removeEventListener("mousedown", onOutside);

      document.removeEventListener("keydown", onKey);

      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);

      setHover(null);
    };
  }, [open]);

  const previewLevel = hover || value;
  const previewTheme = getLevelTheme(skill, previewLevel);

  const descriptor = previewLevel
    ? DESCRIPTORS?.[skill.key]?.[previewLevel]?.[0]
    : `Hover on a level to preview what it means for ${skill.label.toLowerCase()}. Click to select.`;

  const popover = createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{
            opacity: 0,
            y: 8,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 8,
            scale: 0.97,
          }}
          transition={{
            duration: 0.18,
            ease: "easeOut",
          }}
          className="fixed z-[9999] max-h-[calc(100vh-32px)] overflow-y-auto rounded-[24px] border-2 border-[#CBD8E5] bg-white shadow-[0_28px_80px_rgba(16,43,78,0.28)]"
          style={{
            top: pos.top,
            left: pos.left,
            width: `min(${POPOVER_WIDTH}px, calc(100vw - 32px))`,
          }}
        >
          <div
            className="border-b-2 p-5 transition-colors duration-300"
            style={{
              background: `linear-gradient(135deg, ${
                previewTheme?.bg || skill.soft
              } 0%, #FFFFFF 85%)`,
              borderColor: skill.border,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3.5">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{
                    backgroundColor: skill.color,
                  }}
                >
                  <SkillIcon size={24} strokeWidth={2.4} />
                </span>

                <div className="min-w-0">
                  <p
                    className="truncate text-[16px] font-black tracking-wide"
                    style={{
                      color: skill.text,
                    }}
                  >
                    {skill.label}
                  </p>

                  <p className="truncate text-[14px] font-bold text-[#102B4E]/65">
                    {studentName}
                  </p>
                </div>
              </div>

              <span
                className="shrink-0 rounded-full border-2 bg-white px-4 py-1.5 text-[14px] font-black"
                style={{
                  color: skill.text,
                  borderColor: skill.border,
                }}
              >
                {previewLevel || "Not selected"}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-white bg-white/85 px-4 py-3.5">
              <p className="text-[12px] font-black uppercase tracking-[0.1em] text-[#102B4E]/50">
                What this level means
              </p>

              <p className="mt-1.5 min-h-[44px] text-[14px] font-semibold leading-[22px] text-[#102B4E]/80">
                {descriptor}
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[16px] font-black text-[#102B4E]">
                Choose proficiency level
              </p>

              <span className="rounded-lg bg-[#F3F6F9] px-2.5 py-1 text-[12px] font-black text-[#102B4E]/55">
                A1 → C2
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {LEVELS.map((level) => {
                const t = getLevelTheme(skill, level);

                const m = LEVEL_META[level];
                const LevelIcon = m.Icon;
                const selected = value === level;

                return (
                  <motion.button
                    key={level}
                    type="button"
                    whileHover={{
                      y: -4,
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                    onMouseEnter={() => setHover(level)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(level)}
                    onBlur={() => setHover(null)}
                    onClick={() => {
                      onChange(level);
                      setOpen(false);
                    }}
                    className="relative flex min-h-[132px] flex-col rounded-2xl border-2 p-3.5 text-left outline-none transition-shadow duration-200 hover:shadow-[0_14px_28px_rgba(16,43,78,0.18)] focus-visible:ring-4"
                    style={{
                      backgroundColor: t.bg,
                      borderColor: selected ? "#102B4E" : t.border,
                      color: t.text,
                      boxShadow: selected
                        ? `0 0 0 3px ${skill.color}66`
                        : undefined,
                      "--tw-ring-color": `${skill.color}55`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[30px] font-black leading-none">
                        {level}
                      </span>

                      {selected ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102B4E] text-white">
                          <Check size={16} strokeWidth={3.5} />
                        </span>
                      ) : (
                        <LevelIcon
                          size={22}
                          strokeWidth={2.4}
                          style={{
                            color: t.sub,
                          }}
                        />
                      )}
                    </div>

                    <p className="mt-3 text-[13px] font-black leading-4">
                      {m.title}
                    </p>

                    <p
                      className="mt-1 text-[12px] font-semibold leading-4"
                      style={{
                        color: t.sub,
                      }}
                    >
                      {m.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <>
      <motion.button
        ref={buttonRef}
        type="button"
        whileHover={{
          y: -3,
          scale: 1.015,
        }}
        whileTap={{
          scale: 0.97,
        }}
        aria-expanded={open}
        aria-label={`${skill.label} level for ${studentName}`}
        onClick={() => setOpen((current) => !current)}
        className="group relative flex h-[84px] w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-3 text-left outline-none transition-shadow duration-200 hover:shadow-[0_14px_30px_rgba(16,43,78,0.18)] focus-visible:ring-4"
        style={{
          backgroundColor: theme ? theme.bg : "#FFFFFF",
          borderColor: theme ? theme.border : "#C9D5E1",
          borderStyle: theme ? "solid" : "dashed",
          "--tw-ring-color": `${skill.color}33`,
        }}
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:rotate-[-6deg] group-hover:scale-105"
          style={{
            backgroundColor: theme ? theme.tile : "#94A3B8",
          }}
        >
          <SkillIcon size={23} strokeWidth={2.4} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span
              className="text-[22px] font-black leading-none"
              style={{
                color: theme ? theme.text : "#64748B",
              }}
            >
              {value || "—"}
            </span>

            <span
              className="truncate text-[12px] font-extrabold uppercase tracking-[0.04em]"
              style={{
                color: theme ? theme.sub : "#64748B",
              }}
            >
              {meta ? meta.title : "Select level"}
            </span>
          </span>

          <span className="mt-2.5 flex gap-1">
            {LEVELS.map((lvl, i) => (
              <span
                key={lvl}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    theme && i <= theme.index
                      ? theme.dark
                        ? "rgba(255,255,255,0.95)"
                        : skill.color
                      : theme?.dark
                        ? "rgba(255,255,255,0.28)"
                        : "#DCE4EC",
                }}
              />
            ))}
          </span>
        </span>

        <ChevronDown
          size={22}
          strokeWidth={2.8}
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{
            color: theme ? theme.text : skill.color,
          }}
        />
      </motion.button>

      {popover}
    </>
  );
}

/* =====================================================================
   3b. MARK ALL PICKER
   ===================================================================== */

function MarkAllPicker({ studentName, onSelect }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const MENU_WIDTH = 220;

  const place = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    const height = menuRef.current?.offsetHeight || 300;

    const pad = 16;

    const left = Math.min(
      Math.max(rect.left, pad),
      window.innerWidth - MENU_WIDTH - pad,
    );

    const fitsBelow = window.innerHeight - rect.bottom >= height + pad;

    const top = fitsBelow
      ? rect.bottom + 8
      : Math.max(pad, rect.top - height - 8);

    setPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    place();

    const raf = requestAnimationFrame(place);

    const onOutside = (e) => {
      if (
        buttonRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }

      setOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutside);

    document.addEventListener("keydown", onKey);

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    return () => {
      cancelAnimationFrame(raf);

      document.removeEventListener("mousedown", onOutside);

      document.removeEventListener("keydown", onKey);

      window.removeEventListener("resize", place);

      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const menu = createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{
            opacity: 0,
            y: 6,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 6,
            scale: 0.97,
          }}
          transition={{
            duration: 0.15,
            ease: "easeOut",
          }}
          className="fixed z-[9999] overflow-hidden rounded-2xl border-2 border-[#CBD8E5] bg-white shadow-[0_20px_50px_rgba(16,43,78,0.25)]"
          style={{
            top: pos.top,
            left: pos.left,
            width: MENU_WIDTH,
          }}
        >
          <div className="border-b-2 border-[#E3EAF1] bg-[#F3F6F9] px-4 py-3">
            <p className="text-[12px] font-black uppercase tracking-[0.1em] text-[#102B4E]/55">
              Set all 7 skills to
            </p>

            <p className="truncate text-[13px] font-bold text-[#102B4E]">
              {studentName}
            </p>
          </div>

          <div className="p-2">
            {LEVELS.map((level) => {
              const m = LEVEL_META[level];
              const LevelIcon = m.Icon;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    onSelect(level);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-[#EEF3F8] focus-visible:bg-[#EEF3F8]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#102B4E] text-[13px] font-black text-white">
                    {level}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-black text-[#102B4E]">
                      {m.title}
                    </span>
                  </span>

                  <LevelIcon
                    size={18}
                    strokeWidth={2.4}
                    className="shrink-0 text-[#102B4E]/50"
                  />
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-label={`Mark all skills for ${studentName}`}
        onClick={() => setOpen((c) => !c)}
        className="flex h-[48px] w-full items-center justify-between gap-2 rounded-xl border-2 border-[#102B4E] bg-white px-3 text-[13px] font-black text-[#102B4E] outline-none transition-colors hover:bg-[#102B4E] hover:text-white focus-visible:ring-4 focus-visible:ring-[#102B4E]/20"
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 size={18} strokeWidth={2.6} />
          Mark All
        </span>

        <ChevronDown
          size={18}
          strokeWidth={2.8}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {menu}
    </>
  );
}

/* =====================================================================
   4. EVALUATION TABLE
   ===================================================================== */

const COL = {
  sno: 64,
  name: 270,
  batch: 150,
  markAll: 170,
  skill: 210,
  remarks: 330,
};

const LEFT = {
  sno: 0,
  name: COL.sno,
  batch: COL.sno + COL.name,
  markAll: COL.sno + COL.name + COL.batch,
};

const TABLE_WIDTH =
  COL.sno +
  COL.name +
  COL.batch +
  COL.markAll +
  COL.skill * CEFR_SKILLS.length +
  COL.remarks;

const HEAD_BG = "#102B4E";
const ROW_BORDER = "border-b-2 border-[#E3EAF1]";

function EvaluationTable({
  students,
  evaluations,
  remarks,
  onLevelChange,
  onRemarkChange,
  onMarkAll,
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full table-fixed border-separate border-spacing-0"
        style={{
          minWidth: TABLE_WIDTH,
        }}
      >
        <colgroup>
          <col style={{ width: COL.sno }} />
          <col style={{ width: COL.name }} />
          <col style={{ width: COL.batch }} />
          <col style={{ width: COL.markAll }} />

          {CEFR_SKILLS.map((skill) => (
            <col
              key={skill.key}
              style={{
                width: COL.skill,
              }}
            />
          ))}

          <col
            style={{
              width: COL.remarks,
            }}
          />
        </colgroup>

        <thead>
          <tr>
            <th
              className="sticky z-30 border-r border-white/15 px-2 py-5 text-center text-[13px] font-black uppercase tracking-[0.1em] text-white"
              style={{
                left: LEFT.sno,
                backgroundColor: HEAD_BG,
              }}
            >
              S.No
            </th>

            <th
              className="sticky z-30 border-r border-white/15 px-5 py-5 text-left text-[13px] font-black uppercase tracking-[0.1em] text-white"
              style={{
                left: LEFT.name,
                backgroundColor: HEAD_BG,
              }}
            >
              Student
            </th>

            <th
              className="sticky z-30 border-r-2 border-[#3B5977] px-5 py-5 text-left text-[13px] font-black uppercase tracking-[0.1em] text-white shadow-[6px_0_12px_-6px_rgba(0,0,0,0.5)]"
              style={{
                left: LEFT.batch,
                backgroundColor: HEAD_BG,
              }}
            >
              Batch
            </th>

            <th
              className="sticky z-30 border-r-2 border-[#3B5977] px-3 py-5 text-center text-[13px] font-black uppercase tracking-[0.1em] text-white shadow-[6px_0_12px_-6px_rgba(0,0,0,0.5)]"
              style={{
                left: LEFT.markAll,
                backgroundColor: HEAD_BG,
              }}
            >
              Mark All
            </th>

            {CEFR_SKILLS.map((skill) => {
              const Icon = skill.Icon;

              return (
                <th
                  key={skill.key}
                  className="border-r border-white/15 px-3 py-4 text-center align-middle text-white"
                  style={{
                    backgroundColor: HEAD_BG,
                    boxShadow: `inset 0 4px 0 ${skill.color}`,
                  }}
                >
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
                      style={{
                        backgroundColor: skill.color,
                      }}
                    >
                      <Icon size={22} strokeWidth={2.4} />
                    </span>

                    <span className="text-[13px] font-black uppercase tracking-[0.05em]">
                      {skill.label}
                    </span>
                  </div>
                </th>
              );
            })}

            <th
              className="px-5 py-5 text-left text-[13px] font-black uppercase tracking-[0.1em] text-white"
              style={{
                backgroundColor: HEAD_BG,
                boxShadow: `inset 0 4px 0 ${REMARK_STYLE.color}`,
              }}
            >
              Teacher Remarks
            </th>
          </tr>
        </thead>

        <tbody>
          {students.map((student, index) => {
            const evaluation =
              evaluations[student._id] || createEmptyEvaluation();

            const complete = isCompleteEvaluation(evaluation);

            const derived = getDisplayLevel(evaluation);

            const filled = CEFR_SKILLS.filter((skill) =>
              LEVELS.includes(evaluation[skill.key]),
            ).length;

            const stickyBase = `sticky z-20 h-[124px] bg-white px-4 align-middle transition-colors group-hover:bg-[#F2F8FF] ${ROW_BORDER}`;

            return (
              <motion.tr
                key={student._id}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: Math.min(index * 0.025, 0.3),
                }}
                className="group"
              >
                {/* Serial */}
                <td
                  className={`${stickyBase} border-r border-[#DCE4EC] text-center`}
                  style={{
                    left: LEFT.sno,
                  }}
                >
                  <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border-2 border-[#DCE4EC] bg-[#F8FAFC] px-2 text-[14px] font-black text-[#102B4E]/70">
                    {index + 1}
                  </span>
                </td>

                {/* Student */}
                <td
                  className={`${stickyBase} border-r border-[#DCE4EC]`}
                  style={{
                    left: LEFT.name,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#102B4E] text-[14px] font-black text-white shadow-sm">
                      {getInitials(student.name)}

                      {complete && (
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#49C4A5] text-white">
                          <Check size={11} strokeWidth={4} />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-black text-[#102B4E]">
                        {student.name}
                      </p>

                      <p className="truncate text-[13px] font-bold text-[#102B4E]/55">
                        @{student.username}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E3EAF1]">
                          <motion.div
                            animate={{
                              width: `${(filled / CEFR_SKILLS.length) * 100}%`,
                            }}
                            transition={{
                              duration: 0.4,
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-[#338DFD] to-[#49C4A5]"
                          />
                        </div>

                        <span
                          className={`shrink-0 text-[12px] font-black ${
                            complete ? "text-[#16896F]" : "text-[#102B4E]/55"
                          }`}
                        >
                          {complete
                            ? `Done · ${derived}`
                            : `${filled}/${CEFR_SKILLS.length}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Batch */}
                <td
                  className={`${stickyBase} border-r-2 border-[#C9D5E1] shadow-[6px_0_12px_-8px_rgba(16,43,78,0.35)]`}
                  style={{
                    left: LEFT.batch,
                  }}
                >
                  <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#C9DDF2] bg-[#F3F8FD] px-3.5 py-2.5 text-[15px] font-black text-[#1768C5]">
                    <Clock3 size={18} className="shrink-0 text-[#338DFD]" />

                    <span className="truncate">
                      {student.batch ||
                        student.timing ||
                        student.classTiming ||
                        "—"}
                    </span>
                  </div>
                </td>

                {/* Mark All */}
                <td
                  className={`${stickyBase} border-r-2 border-[#C9D5E1] shadow-[6px_0_12px_-8px_rgba(16,43,78,0.35)]`}
                  style={{
                    left: LEFT.markAll,
                  }}
                >
                  <MarkAllPicker
                    studentName={student.name}
                    onSelect={(level) => {
                      if (onMarkAll) {
                        onMarkAll(student._id, level);
                      } else {
                        CEFR_SKILLS.forEach(({ key }) =>
                          onLevelChange(student._id, key, level),
                        );
                      }
                    }}
                  />
                </td>

                {/* 7 skills */}
                {CEFR_SKILLS.map((skill) => (
                  <td
                    key={skill.key}
                    className={`h-[124px] border-r border-[#E3EAF1] px-3 align-middle ${ROW_BORDER} group-hover:bg-[#FAFCFF]`}
                  >
                    <LevelPicker
                      skill={skill}
                      value={evaluation[skill.key] || ""}
                      studentName={student.name}
                      onChange={(level) =>
                        onLevelChange(student._id, skill.key, level)
                      }
                    />
                  </td>
                ))}

                {/* Remarks */}
                <td
                  className={`h-[124px] px-4 align-middle ${ROW_BORDER} group-hover:bg-[#FAFCFF]`}
                >
                  <div
                    className="flex items-center gap-2 rounded-2xl border-2 p-2 transition-all focus-within:ring-4"
                    style={{
                      backgroundColor: REMARK_STYLE.soft,
                      borderColor: REMARK_STYLE.border,
                      "--tw-ring-color": `${REMARK_STYLE.color}22`,
                    }}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white"
                      style={{
                        color: REMARK_STYLE.text,
                      }}
                    >
                      <FileText size={19} />
                    </span>

                    <input
                      value={remarks[student._id] || ""}
                      onChange={(event) =>
                        onRemarkChange(student._id, event.target.value)
                      }
                      placeholder="Add teacher observation..."
                      className="h-12 min-w-0 flex-1 rounded-xl border-0 bg-white px-3.5 text-[14px] font-bold text-[#102B4E] outline-none placeholder:text-[#102B4E]/40"
                    />
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================================
   5. PAGE
   ===================================================================== */

function AdminActivities() {
  const [students, setStudents] = useState([]);

  /*
   * MONTHLY SYSTEM
   * Format: YYYY-MM
   */
  const [selectedMonth, setSelectedMonth] = useState(getMonthString());

  const [evaluations, setEvaluations] = useState({});

  const [remarks, setRemarks] = useState({});

  const [search, setSearch] = useState("");

  const [selectedBatch, setSelectedBatch] = useState("all");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  });

  /* ===================================================================
     FETCH STUDENTS
     =================================================================== */

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/students`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load students.");
    }
  };

  /* ===================================================================
     FETCH MONTHLY ACTIVITIES
     =================================================================== */

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * IMPORTANT:
       * Backend monthly controller should read:
       *
       * GET /api/activities?month=YYYY-MM
       */
      const response = await fetch(
        `${API_URL}/api/activities?month=${selectedMonth}`,
        {
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch monthly activities");
      }

      const data = await response.json();

      const nextEvaluations = {};
      const nextRemarks = {};

      (data.activities || []).forEach((activity) => {
        const studentId = activity.student?._id || activity.student;

        if (!studentId) return;

        nextEvaluations[studentId] = {
          ...createEmptyEvaluation(),
          ...(activity.evaluation || {}),
        };

        nextRemarks[studentId] =
          activity.teacherRemarks || activity.remarks || "";
      });

      setEvaluations(nextEvaluations);

      setRemarks(nextRemarks);
    } catch (err) {
      console.error(err);

      setError("Unable to load monthly CEFR evaluations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [selectedMonth]);

  /* ===================================================================
     FILTER DATA
     =================================================================== */

  const batches = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          students.map((student) => student.batch?.trim()).filter(Boolean),
        ),
      ),
    ],
    [students],
  );

  const activeStudents = useMemo(() => {
    return (
      students
        .filter((student) => student.isActive)
        // Show students only during their admission month through course-end month.
        .filter((student) => isStudentEligibleForMonth(student, selectedMonth))
        .filter(
          (student) =>
            selectedBatch === "all" || student.batch?.trim() === selectedBatch,
        )
        .filter((student) => {
          if (!search.trim()) return true;

          const query = search.toLowerCase();

          return (
            student.name?.toLowerCase().includes(query) ||
            student.username?.toLowerCase().includes(query)
          );
        })
    );
  }, [students, selectedMonth, selectedBatch, search]);

  /* ===================================================================
     MONTHLY STATISTICS
     =================================================================== */

  const evaluatedCount = activeStudents.filter((student) =>
    isCompleteEvaluation(evaluations[student._id]),
  ).length;

  const remainingCount = Math.max(activeStudents.length - evaluatedCount, 0);

  const completionPercentage =
    activeStudents.length > 0
      ? Math.round((evaluatedCount / activeStudents.length) * 100)
      : 0;

  const skillEvaluationsCount = activeStudents.reduce((total, student) => {
    const evaluation = evaluations[student._id] || {};

    return (
      total +
      CEFR_SKILLS.filter(({ key }) => LEVELS.includes(evaluation[key])).length
    );
  }, 0);

  const averageLevel = useMemo(() => {
    const scores = activeStudents
      .map((student) => getEvaluationScore(evaluations[student._id]))
      .filter(Boolean);

    if (!scores.length) return "—";

    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const index = Math.max(
      0,
      Math.min(LEVELS.length - 1, Math.round(average) - 1),
    );

    return LEVELS[index];
  }, [activeStudents, evaluations]);

  const currentMonth = getMonthString();

  const isCurrentMonth = selectedMonth === currentMonth;

  /* ===================================================================
     LEVEL / REMARK HANDLERS
     =================================================================== */

  const handleLevelChange = (studentId, skill, level) => {
    setEvaluations((previous) => ({
      ...previous,

      [studentId]: {
        ...createEmptyEvaluation(),
        ...(previous[studentId] || {}),
        [skill]: level,
      },
    }));

    setMessage("");
    setError("");
  };

  const handleMarkAll = (studentId, level) => {
    setEvaluations((previous) => ({
      ...previous,

      [studentId]: {
        ...createEmptyEvaluation(),
        ...(previous[studentId] || {}),
        ...Object.fromEntries(CEFR_SKILLS.map(({ key }) => [key, level])),
      },
    }));

    setMessage("");
    setError("");
  };

  const handleRemarkChange = (studentId, text) => {
    setRemarks((previous) => ({
      ...previous,
      [studentId]: text,
    }));

    setMessage("");
  };

  /* ===================================================================
     SAVE MONTHLY EVALUATION
     =================================================================== */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!activeStudents.length) {
        setError("There are no active students to evaluate.");
        return;
      }

      const incompleteStudent = activeStudents.find(
        (student) => !isCompleteEvaluation(evaluations[student._id]),
      );

      if (incompleteStudent) {
        setError(
          `Please complete all seven CEFR skills for ${incompleteStudent.name} before saving.`,
        );

        return;
      }

      const records = activeStudents.map((student) => ({
        studentId: student._id,

        evaluation: evaluations[student._id],

        teacherRemarks: remarks[student._id] || "",
      }));

      /*
       * IMPORTANT:
       * Backend monthly controller should receive:
       *
       * {
       *   month: "YYYY-MM",
       *   records: [...]
       * }
       */
      const response = await fetch(`${API_URL}/api/activities`, {
        method: "POST",
        headers: getHeaders(),

        body: JSON.stringify({
          month: selectedMonth,
          records,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save CEFR evaluations.");
      }

      setMessage("Monthly CEFR evaluations have been saved successfully.");

      await fetchActivities();
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to save CEFR evaluations.");
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================================
     MONTH FORMATTING
     =================================================================== */

  const formatMonth = (monthString) => {
    if (!monthString) return "—";

    const [year, month] = monthString.split("-").map(Number);

    const date = new Date(year, month - 1, 1);

    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  /* ===================================================================
     UI
     =================================================================== */

  return (
    <div className="min-h-full space-y-7 bg-[#F6F8FB] pb-12">
      {/* ==================== TOP HERO ==================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative isolate overflow-hidden rounded-[30px] border-2 border-[#27486C] bg-[#102B4E] px-6 py-8 text-white shadow-[0_25px_75px_rgba(16,43,78,0.20)] sm:px-8 sm:py-10"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border-[45px] border-[#338DFD]/10 blur-[2px]"
        />

        <motion.div
          animate={{
            x: [-25, 30, -25],
            y: [10, -18, 10],
            opacity: [0.18, 0.3, 0.18],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -bottom-36 left-[35%] h-72 w-72 rounded-full bg-[#49C4A5]/20 blur-3xl"
        />

        <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10" />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#49C4A5]/35 bg-[#49C4A5]/10 px-4 py-2 text-[13px] font-black uppercase tracking-[0.14em] text-[#8CEBD0]"
            >
              <Sparkles size={16} />
              Monthly CEFR Evaluation
            </motion.div>

            <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-[50px] lg:leading-[1.02]">
              Student Performance
            </h1>

            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/80 sm:text-lg">
              A structured monthly workspace for evaluating communication,
              language skills, confidence and interaction using CEFR levels.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <motion.div
                whileHover={{
                  y: -2,
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"
              >
                <Clock3 size={18} className="text-[#49C4A5]" />

                <span className="text-[15px] font-extrabold">
                  {formatMonth(selectedMonth)}
                </span>
              </motion.div>

              {isCurrentMonth && (
                <motion.span
                  animate={{
                    boxShadow: ["0 0 0 0 #49C4A5aa", "0 0 0 8px #49C4A500"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                  }}
                  className="rounded-xl border border-[#49C4A5]/40 bg-[#49C4A5] px-4 py-3 text-[13px] font-black uppercase tracking-wide text-[#062D24]"
                >
                  Current Month
                </motion.span>
              )}
            </div>
          </div>

          {/* MONTH SELECTOR */}
          <div className="w-full max-w-[400px] rounded-2xl border border-white/20 bg-white/[0.09] p-2.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                aria-label="Previous month"
                whileHover={{
                  scale: 1.06,
                  x: -2,
                }}
                whileTap={{
                  scale: 0.92,
                }}
                onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
              >
                <ChevronLeft size={26} />
              </motion.button>

              <div className="min-w-0 flex-1 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/55">
                  Evaluation Month
                </p>

                <p className="mt-1 truncate text-lg font-black text-white">
                  {formatMonth(selectedMonth)}
                </p>
              </div>

              <motion.button
                type="button"
                aria-label="Next month"
                whileHover={{
                  scale: 1.06,
                  x: 2,
                }}
                whileTap={{
                  scale: 0.92,
                }}
                onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
              >
                <ChevronRight size={26} />
              </motion.button>
            </div>

            {!isCurrentMonth && (
              <motion.button
                initial={{
                  opacity: 0,
                  y: 4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                type="button"
                onClick={() => setSelectedMonth(currentMonth)}
                className="mt-2.5 w-full rounded-xl border border-[#49C4A5]/20 bg-[#49C4A5]/10 py-3 text-[15px] font-black text-[#80E5C8] transition hover:bg-[#49C4A5]/20"
              >
                Return to Current Month
              </motion.button>
            )}

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["Students", activeStudents.length, "#FFFFFF"],
                ["Evaluated", evaluatedCount, "#8CEBD0"],
                ["Progress", `${completionPercentage}%`, "#7CB7FF"],
              ].map(([label, value, color]) => (
                <motion.div
                  key={label}
                  whileHover={{
                    y: -2,
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-3 text-center"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/55">
                    {label}
                  </p>

                  <p
                    className="mt-1 text-2xl font-black"
                    style={{
                      color,
                    }}
                  >
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ==================== STATS ==================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Active Students",
            activeStudents.length,
            Users,
            "Current filtered list",
          ],
          [
            "Evaluated",
            evaluatedCount,
            CheckCircle2,
            `${completionPercentage}% complete`,
          ],
          [
            "Remaining",
            remainingCount,
            Clock3,
            remainingCount ? "Awaiting evaluation" : "All evaluated",
          ],
          ["Average Level", averageLevel, Target, "Derived display level"],
        ].map(([label, value, Icon, description], index) => (
          <motion.div
            key={label}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.06,
            }}
            whileHover={{
              y: -5,
            }}
            className="group relative overflow-hidden rounded-[24px] border-2 border-[#DCE4EC] bg-white p-6 shadow-[0_12px_40px_rgba(16,43,78,0.07)] transition-all hover:border-[#BFD0E0] hover:shadow-[0_20px_50px_rgba(16,43,78,0.11)]"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#338DFD]/[0.035] transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#102B4E]/55">
                  {label}
                </p>

                <p className="mt-2 text-4xl font-black tracking-tight text-[#102B4E]">
                  {value}
                </p>

                <p className="mt-1.5 text-[14px] font-bold text-[#102B4E]/55">
                  {description}
                </p>
              </div>

              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-2 border-[#DDE8F3] bg-[#338DFD]/10 text-[#338DFD] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <Icon size={23} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ==================== FILTERS ==================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-[30px] border-2 border-[#D3DFEA] bg-white p-7 shadow-[0_18px_55px_rgba(16,43,78,0.08)] sm:p-8"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Target size={22} className="text-[#338DFD]" />

              <h2 className="text-2xl font-black tracking-tight text-[#102B4E] sm:text-[28px]">
                Evaluation Workspace
              </h2>
            </div>

            <p className="mt-1.5 text-[15px] font-semibold leading-6 text-[#102B4E]/60">
              Filter the student list before entering monthly evaluations.
            </p>
          </div>

          <div className="rounded-xl border-2 border-[#DCE4EC] bg-[#F6F8FB] px-4 py-2.5 text-[14px] font-black text-[#102B4E]/70">
            {skillEvaluationsCount} /{" "}
            {activeStudents.length * CEFR_SKILLS.length || 0} skill evaluations
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <label className="mb-2 block text-[13px] font-black uppercase tracking-[0.12em] text-[#102B4E]/60">
              Find Student
            </label>

            <div className="relative">
              <Search
                size={21}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#102B4E]/50"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or username..."
                className="h-[60px] w-full rounded-2xl border-2 border-[#DCE4EC] bg-[#F8FAFC] pl-12 pr-4 text-[16px] font-bold text-[#102B4E] outline-none transition-all placeholder:text-[#102B4E]/40 hover:border-[#B9C8D8] focus:border-[#338DFD]/60 focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-black uppercase tracking-[0.12em] text-[#102B4E]/60">
              Student Batch
            </label>

            <div className="relative">
              <select
                value={selectedBatch}
                onChange={(event) => setSelectedBatch(event.target.value)}
                className="h-[60px] w-full cursor-pointer appearance-none rounded-2xl border-2 border-[#DCE4EC] bg-[#F8FAFC] px-4 pr-10 text-[16px] font-black text-[#102B4E] outline-none transition-all hover:border-[#B9C8D8] focus:border-[#338DFD]/60 focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch === "all" ? "All Batches" : batch}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={20}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
              />
            </div>
          </div>
        </div>

        <div className="mt-7 border-t-2 border-[#EEF2F6] pt-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[16px] font-black text-[#102B4E]">
                Evaluation Progress
              </p>

              <p className="mt-1 text-[14px] font-semibold text-[#102B4E]/55">
                {evaluatedCount} of {activeStudents.length} students have all
                seven skills evaluated
              </p>
            </div>

            <span className="text-[18px] font-black text-[#338DFD]">
              {completionPercentage}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full border border-[#DCE4EC] bg-[#E9EEF4]">
            <motion.div
              animate={{
                width: `${completionPercentage}%`,
              }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
              className="h-full rounded-full bg-gradient-to-r from-[#338DFD] to-[#49C4A5]"
            />
          </div>
        </div>
      </motion.section>

      {/* ==================== MESSAGES ==================== */}

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key="success"
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            className="flex items-start gap-3 rounded-2xl border-2 border-[#B9E8CE] bg-[#EAF8F0] px-5 py-4"
          >
            <CheckCircle2 size={23} className="mt-0.5 text-[#16896F]" />

            <div className="flex-1">
              <p className="text-[16px] font-black text-[#126B58]">
                Saved successfully
              </p>

              <p className="mt-0.5 text-[14px] font-semibold text-[#126B58]/80">
                {message}
              </p>
            </div>

            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setMessage("")}
              className="rounded-lg p-1.5 transition hover:bg-white/70"
            >
              <X className="text-[#126B58]/70" size={19} />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4"
          >
            <X size={23} className="mt-0.5 text-red-600" />

            <div className="flex-1">
              <p className="text-[16px] font-black text-red-700">
                Something needs attention
              </p>

              <p className="mt-0.5 text-[14px] font-semibold text-red-700/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setError("")}
              className="rounded-lg p-1.5 transition hover:bg-white/70"
            >
              <X className="text-red-500/70" size={19} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== EVALUATION TABLE ==================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="overflow-hidden rounded-[30px] border-2 border-[#CBD7E3] bg-white shadow-[0_18px_65px_rgba(16,43,78,0.09)]"
      >
        <div className="relative overflow-hidden border-b-2 border-[#D2DEE9] bg-gradient-to-br from-[#F8FAFC] via-white to-[#F4F8FC] px-7 py-8 sm:px-9">
          <motion.div
            animate={{
              x: [-100, 80, -100],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -right-20 top-0 h-40 w-80 rounded-full bg-[#338DFD]/[0.045] blur-3xl"
          />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#C9DDF2] bg-[#EAF3FF] text-[#338DFD]">
                <Users size={26} strokeWidth={2.4} />
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-[#102B4E] sm:text-2xl">
                  Monthly CEFR Evaluation
                </h2>

                <p className="mt-1.5 text-[15px] font-semibold leading-6 text-[#102B4E]/60">
                  Pick one CEFR level per skill. Darker shade = higher level.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["7 Skills", "1 Remark", "A1 – C2"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-xl border-2 border-[#DCE4EC] bg-white px-4 py-2.5 text-[14px] font-black text-[#102B4E]/70"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Skill legend */}
          <div className="relative mt-6 grid grid-cols-2 gap-2.5 border-t-2 border-[#E5EBF1] pt-5 sm:grid-cols-4 xl:grid-cols-8">
            {CEFR_SKILLS.map((skill) => {
              const Icon = skill.Icon;

              return (
                <motion.div
                  key={skill.key}
                  whileHover={{
                    y: -3,
                  }}
                  className="rounded-xl border px-3 py-2.5"
                  style={{
                    backgroundColor: skill.soft,
                    borderColor: skill.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      size={17}
                      strokeWidth={2.5}
                      style={{
                        color: skill.color,
                      }}
                    />

                    <span
                      className="truncate text-[12px] font-black uppercase tracking-[0.04em]"
                      style={{
                        color: skill.text,
                      }}
                    >
                      {skill.label}
                    </span>
                  </div>

                  <div className="mt-2 flex gap-0.5">
                    {LEVELS.map((level) => (
                      <span
                        key={level}
                        className="h-2 flex-1 first:rounded-l-full last:rounded-r-full"
                        style={{
                          backgroundColor: getLevelTheme(skill, level).bg,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              whileHover={{
                y: -3,
              }}
              className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={{
                backgroundColor: REMARK_STYLE.soft,
                borderColor: REMARK_STYLE.border,
              }}
            >
              <FileText
                size={17}
                strokeWidth={2.5}
                style={{
                  color: REMARK_STYLE.color,
                }}
              />

              <span
                className="truncate text-[12px] font-black uppercase tracking-[0.04em]"
                style={{
                  color: REMARK_STYLE.text,
                }}
              >
                Remarks
              </span>
            </motion.div>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#338DFD]/10">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#338DFD]/15 border-t-[#338DFD]" />
            </div>

            <p className="mt-5 text-[19px] font-black text-[#102B4E]">
              Preparing evaluation grid
            </p>

            <p className="mx-auto mt-1.5 max-w-sm text-[14px] font-semibold leading-6 text-[#102B4E]/55">
              Loading students and existing CEFR evaluations for this month...
            </p>
          </div>
        ) : activeStudents.length === 0 ? (
          <div className="px-6 py-24 text-center">
            <Users size={35} className="mx-auto text-[#102B4E]/30" />

            <p className="mt-5 text-[20px] font-black text-[#102B4E]">
              No students match your filters
            </p>

            <p className="mx-auto mt-2 max-w-md text-[14px] font-semibold leading-6 text-[#102B4E]/55">
              Try clearing the search or selecting a different batch.
            </p>
          </div>
        ) : (
          <>
            <EvaluationTable
              students={activeStudents}
              evaluations={evaluations}
              remarks={remarks}
              onLevelChange={handleLevelChange}
              onRemarkChange={handleRemarkChange}
              onMarkAll={handleMarkAll}
            />

            {/* Bottom helper / save area */}
            <div className="border-t-2 border-[#DCE4EC] bg-[#F7FAFC] px-6 py-7 sm:px-9">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#C9DDF2] bg-[#EAF3FF] text-[#338DFD]">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <p className="text-[16px] font-black text-[#102B4E]">
                      {evaluatedCount === activeStudents.length
                        ? "All visible students are ready to save."
                        : `${remainingCount} ${
                            remainingCount === 1
                              ? "student remains"
                              : "students remain"
                          } to be evaluated.`}
                    </p>

                    <p className="mt-1 max-w-3xl text-[13px] font-semibold leading-5 text-[#102B4E]/55">
                      The selected CEFR levels are stored as the teacher's
                      monthly evaluation. Student-facing indicators are resolved
                      separately from the descriptor bank.
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading}
                  whileHover={{
                    y: -3,
                    scale: 1.01,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="inline-flex min-h-[58px] shrink-0 items-center justify-center gap-2.5 rounded-2xl border-2 border-[#0C2039] bg-[#102B4E] px-8 text-[16px] font-black text-white shadow-[0_12px_30px_rgba(16,43,78,0.20)] transition-all hover:border-[#173B68] hover:bg-[#173B68] hover:shadow-[0_17px_38px_rgba(16,43,78,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={20} strokeWidth={2.5} />

                  {saving ? "Saving Evaluation..." : "Save Monthly Evaluation"}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.section>
    </div>
  );
}

export default AdminActivities;
