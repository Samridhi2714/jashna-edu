import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  AudioWaveform,
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Crown,
  Languages,
  Leaf,
  MessageCircle,
  MessageSquareText,
  Mic,
  Minus,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  SpellCheck,
  Sprout,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DESCRIPTORS, { CEFR_LEVELS } from "../data/Descriptors";

import { API_URL } from "../config";
const LEVELS = CEFR_LEVELS;

/* =====================================================================
   1. THEME
   ===================================================================== */

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

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

const SHADES = [
  ["white", 0.88],
  ["white", 0.68],
  ["white", 0.45],
  ["white", 0.2],
  ["black", 0.1],
  ["black", 0.38],
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

const RAW_SKILLS = [
  {
    key: "communication",
    label: "Communication",
    color: "#2FA866",
    Icon: MessageCircle,
  },
  {
    key: "vocabulary",
    label: "Vocabulary",
    color: "#338DFD",
    Icon: Languages,
  },
  {
    key: "grammar",
    label: "Grammar",
    color: "#8B5CF6",
    Icon: SpellCheck,
  },
  {
    key: "fluency",
    label: "Fluency",
    color: "#F08A1C",
    Icon: AudioWaveform,
  },
  {
    key: "pronunciation",
    label: "Pronunciation",
    color: "#E04F78",
    Icon: Mic,
  },
  {
    key: "confidence",
    label: "Confidence",
    color: "#0E9AA7",
    Icon: ShieldCheck,
  },
  {
    key: "interaction",
    label: "Interaction",
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

const OVERALL = {
  key: "overall",
  label: "Overall",
  color: "#2F6FD6",
  Icon: Target,
};

const LEVEL_META = {
  A1: { title: "Foundation", Icon: Sprout },
  A2: { title: "Elementary", Icon: Leaf },
  B1: { title: "Intermediate", Icon: TrendingUp },
  B2: { title: "Upper Intermediate", Icon: Rocket },
  C1: { title: "Advanced", Icon: Award },
  C2: { title: "Mastery", Icon: Crown },
};

/* =====================================================================
   2. HELPERS
   ===================================================================== */

const LEVEL_VALUE = Object.fromEntries(
  LEVELS.map((level, index) => [level, index + 1]),
);

const getOverallLevel = (evaluation = {}) => {
  const values = CEFR_SKILLS.map(
    ({ key }) => LEVEL_VALUE[evaluation?.[key]],
  ).filter(Boolean);

  if (!values.length) return null;

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  return LEVELS[Math.max(0, Math.min(5, Math.round(average) - 1))];
};

const getLevelLabel = (level) => LEVEL_META[level]?.title || "Not evaluated";

/*
=========================================================
MONTH FORMATTERS
=========================================================
*/

const formatMonth = (monthStart) => {
  if (!monthStart) return "—";

  const parsed = new Date(monthStart);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const formatMonthShort = (monthStart) => {
  if (!monthStart) return "—";

  const parsed = new Date(monthStart);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* =====================================================================
   3. PAGE
   ===================================================================== */

function StudentMonthlyActivities() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadActivities = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("studentToken");

      if (!token) {
        navigate("/student/login", { replace: true });
        return;
      }

      const storedStudent = localStorage.getItem("studentData");

      if (storedStudent) {
        try {
          setStudent(JSON.parse(storedStudent));
        } catch {
          localStorage.removeItem("studentData");
        }
      }

      const response = await fetch(`${API_URL}/api/activities/student`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentData");

        navigate("/student/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load monthly evaluations.");
      }

      const data = await response.json();

      setActivities(data.activities || []);
    } catch (err) {
      console.error("Student monthly activities error:", err);

      setError(
        err.message || "Unable to load your monthly evaluation records.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [navigate]);

  const displayStudent = useMemo(() => student || {}, [student]);

  /*
  =========================================================
  MONTHLY ACTIVITY RECORDS
  =========================================================

  Backend fields:

  monthKey
  monthStart
  evaluation
  teacherRemarks
  createdAt
  updatedAt

  The backend already sorts by monthStart descending,
  but we sort again here so the frontend remains safe.
  */

  const activityRecords = useMemo(() => {
    return [...activities]
      .sort(
        (a, b) =>
          new Date(b.monthStart || b.createdAt) -
          new Date(a.monthStart || a.createdAt),
      )
      .map((activity) => {
        const evaluation = activity.evaluation || null;

        return {
          ...activity,
          evaluation,
          overallLevel: getOverallLevel(evaluation),
        };
      });
  }, [activities]);

  /*
  =========================================================
  SUMMARY
  =========================================================
  */

  const summary = useMemo(() => {
    const evaluatedRecords = activityRecords.filter(
      (activity) => activity.overallLevel,
    );

    const levelValues = evaluatedRecords
      .map((activity) => LEVEL_VALUE[activity.overallLevel])
      .filter(Boolean);

    const latest = evaluatedRecords[0] || null;
    const previous = evaluatedRecords[1] || null;

    let trend = "steady";

    if (latest && previous) {
      if (
        LEVEL_VALUE[latest.overallLevel] > LEVEL_VALUE[previous.overallLevel]
      ) {
        trend = "up";
      }

      if (
        LEVEL_VALUE[latest.overallLevel] < LEVEL_VALUE[previous.overallLevel]
      ) {
        trend = "down";
      }
    }

    /*
    Latest month's skills, high → low
    */

    const rankedSkills = latest
      ? CEFR_SKILLS.map((skill) => ({
          ...skill,
          level: latest.evaluation?.[skill.key],
          value: LEVEL_VALUE[latest.evaluation?.[skill.key]] || 0,
        }))
          .filter((item) => item.value)
          .sort((a, b) => b.value - a.value)
      : [];

    return {
      evaluatedRecords,
      latest,
      previous,
      trend,
      currentLevel: latest?.overallLevel || null,
      highestLevel: levelValues.length
        ? LEVELS[Math.max(...levelValues) - 1]
        : null,
      rankedSkills,
    };
  }, [activityRecords]);

  /*
  =========================================================
  LAST 8 MONTHS
  =========================================================
  */

  const trendData = useMemo(
    () => [...summary.evaluatedRecords].reverse().slice(-8),
    [summary.evaluatedRecords],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] text-[#102B4E]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 4, -4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-[#102B4E] to-[#244F80] shadow-[0_20px_50px_rgba(16,43,78,0.2)]"
            >
              <Activity size={32} className="text-[#49C4A5]" />
            </motion.div>

            <h2 className="mt-7 font-display text-2xl font-extrabold text-[#102B4E]">
              Building your learning view
            </h2>

            <p className="mt-2 text-base font-semibold leading-relaxed text-[#102B4E]/60">
              Bringing together your monthly CEFR evaluations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F6FB] text-[#102B4E]">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10 xl:px-12">
        {/* =========================================================
            DESKTOP TOP BAR
        ========================================================= */}

        <div className="mb-7 hidden items-center justify-between gap-6 lg:flex">
          <div>
            <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#338DFD]">
              Student workspace
            </p>

            <h2 className="mt-1 font-display text-3xl font-black tracking-tight text-[#102B4E]">
              Monthly Activities
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => loadActivities(true)}
              className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-[#DCE4EC] bg-white px-5 py-3 text-[15px] font-extrabold text-[#102B4E]/75 shadow-[0_8px_25px_rgba(16,43,78,0.05)] transition-colors hover:border-[#B9C8D8]"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh records
            </motion.button>

            <div className="flex items-center gap-3 border-l-2 border-[#102B4E]/10 pl-5">
              <Avatar name={displayStudent?.name} />

              <div>
                <p className="text-[15px] font-black text-[#102B4E]">
                  {displayStudent?.name || "Student"}
                </p>

                <p className="mt-0.5 text-[13px] font-semibold text-[#102B4E]/55">
                  Student Portal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            ERROR
        ========================================================= */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-7 flex flex-col gap-4 rounded-[22px] border-2 border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[16px] font-black text-red-700">
                We couldn't load your records
              </p>

              <p className="mt-1 text-[14px] font-semibold leading-relaxed text-red-600/80">
                {error}
              </p>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => loadActivities(true)}
              className="rounded-xl bg-white px-6 py-3 text-[15px] font-black text-red-600 shadow-sm"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {/* =========================================================
            HERO
        ========================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative mb-7 overflow-hidden rounded-[34px] border-2 border-[#27486C] bg-[#102B4E] shadow-[0_25px_70px_rgba(16,43,78,0.18)]"
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
            className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full border-[48px] border-[#338DFD]/10 blur-[2px]"
          />

          <motion.div
            animate={{
              x: [-25, 30, -25],
              y: [10, -18, 10],
              opacity: [0.14, 0.26, 0.14],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -bottom-40 left-[30%] h-80 w-80 rounded-full bg-[#49C4A5]/25 blur-3xl"
          />

          <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1fr_340px] lg:px-12 lg:py-12">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#49C4A5]/35 bg-[#49C4A5]/10 px-4 py-2 text-[13px] font-black uppercase tracking-[0.14em] text-[#8CEBD0]">
                <Sparkles size={15} />
                CEFR learning journey
              </div>

              <h1 className="mt-6 max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[58px]">
                Your language growth,
                <span className="block bg-gradient-to-r from-[#6FE0C1] via-[#62B7FF] to-[#A78BFA] bg-clip-text text-transparent">
                  month by month.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/75 sm:text-lg">
                Your mentor evaluates seven skills every month using CEFR
                levels. Each skill has its own colour, and the shade gets deeper
                as your level grows.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <HeroBadge
                  icon={<CalendarDays size={16} />}
                  text={`${summary.evaluatedRecords.length} ${
                    summary.evaluatedRecords.length === 1
                      ? "monthly evaluation"
                      : "monthly evaluations"
                  } recorded`}
                />

                <HeroBadge
                  icon={<TrendingUp size={16} />}
                  text={`Current ${summary.currentLevel || "—"}`}
                />

                {summary.highestLevel && (
                  <HeroBadge
                    icon={<CheckCircle2 size={16} />}
                    text={`Highest ${summary.highestLevel}`}
                  />
                )}
              </div>
            </div>

            <LevelVisual level={summary.currentLevel} />
          </div>
        </motion.section>

        {/* =========================================================
            METRICS
        ========================================================= */}

        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ActivityMetric
            index={0}
            title="Evaluations"
            value={summary.evaluatedRecords.length}
            subtitle="Monthly evaluations available"
            icon={<CalendarDays size={23} />}
            tone="blue"
            progress={Math.min(summary.evaluatedRecords.length * 12.5, 100)}
          />

          <ActivityMetric
            index={1}
            title="Current Level"
            value={summary.currentLevel || "—"}
            subtitle={getLevelLabel(summary.currentLevel)}
            icon={<TrendingUp size={23} />}
            tone="green"
            progress={(LEVEL_VALUE[summary.currentLevel] || 0) * 16.67}
          />

          <ActivityMetric
            index={2}
            title="Highest Level"
            value={summary.highestLevel || "—"}
            subtitle="Highest recorded overall level"
            icon={<Target size={23} />}
            tone="purple"
            progress={(LEVEL_VALUE[summary.highestLevel] || 0) * 16.67}
          />

          <ActivityMetric
            index={3}
            title="Skills Tracked"
            value={CEFR_SKILLS.length}
            subtitle="Communication through Interaction"
            icon={<CheckCircle2 size={23} />}
            tone="orange"
            progress={100}
          />
        </section>

        {/* =========================================================
            LATEST + MOVEMENT
        ========================================================= */}

        {summary.latest && (
          <>
            <section className="mb-7 grid items-start gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <DashboardCard
                title="Latest Monthly Evaluation"
                subtitle={`${formatMonth(
                  summary.latest.monthStart,
                )} · tap a skill to see what it means`}
                icon={<Activity size={21} />}
              >
                <LatestEvaluation activity={summary.latest} />
              </DashboardCard>

              <DashboardCard
                title="Performance Movement"
                subtitle="Latest overall level compared with the previous monthly evaluation."
                icon={<TrendingUp size={21} />}
              >
                <TrendInsight
                  latest={summary.latest}
                  previous={summary.previous}
                />
              </DashboardCard>
            </section>

            <section className="mb-7">
              <DashboardCard
                title="Strengths & Focus Areas"
                subtitle="Based on your latest monthly evaluation."
                icon={<Award size={21} />}
              >
                <StrengthsAndFocus ranked={summary.rankedSkills} />
              </DashboardCard>
            </section>
          </>
        )}

        {/* =========================================================
            CHART
        ========================================================= */}

        <section className="mb-7">
          <DashboardCard
            title="CEFR Progress Journey"
            subtitle="Pick Overall or any single skill to see how it moved month by month."
            icon={<BarChart3 size={21} />}
          >
            {trendData.length === 0 ? (
              <EmptyState
                icon={<BarChart3 size={28} />}
                title="Your CEFR journey is waiting"
                description="Once your first monthly evaluation is recorded, your language-development pattern will appear here."
              />
            ) : (
              <CEFRChart data={trendData} />
            )}
          </DashboardCard>
        </section>

        {/* =========================================================
            MONTHLY RECORDS
        ========================================================= */}

        <section>
          <DashboardCard
            title="Your Monthly Records"
            subtitle={
              summary.evaluatedRecords.length
                ? `${summary.evaluatedRecords.length} CEFR ${
                    summary.evaluatedRecords.length === 1
                      ? "evaluation"
                      : "evaluations"
                  } from your course.`
                : "Your monthly records will appear here."
            }
            icon={<CalendarDays size={21} />}
          >
            {summary.evaluatedRecords.length === 0 ? (
              <EmptyState
                icon={<Activity size={28} />}
                title="No monthly evaluations yet"
                description="Your mentor's CEFR evaluations and observations will appear here once they are recorded."
              />
            ) : (
              <div className="space-y-4">
                {summary.evaluatedRecords.map((activity, index) => (
                  <MonthlyRecord
                    key={
                      activity._id || activity.monthKey || `activity-${index}`
                    }
                    activity={activity}
                    index={index}
                  />
                ))}
              </div>
            )}
          </DashboardCard>
        </section>

        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-px max-w-[180px] bg-gradient-to-r from-transparent via-[#338DFD]/30 to-transparent" />

          <p className="font-display text-lg font-black italic text-[#338DFD] sm:text-xl">
            Keep showing up. Keep growing. ♡
          </p>

          <p className="mt-2 text-[14px] font-semibold text-[#102B4E]/50">
            Every monthly evaluation is part of the journey.
          </p>
        </div>
      </main>
    </div>
  );
}

/* =====================================================================
   4. SMALL COMPONENTS
   ===================================================================== */

function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#338DFD] via-[#6366F1] to-[#8B5CF6] text-[14px] font-black text-white shadow-md">
      {initials}
    </div>
  );
}

function HeroBadge({ icon, text }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-[14px] font-bold text-white/85 backdrop-blur-sm"
    >
      <span className="text-[#6FE0C1]">{icon}</span>
      {text}
    </motion.div>
  );
}

/* =====================================================================
   LEVEL VISUAL
   ===================================================================== */

function LevelVisual({ level }) {
  const value = LEVEL_VALUE[level] || 0;
  const theme = getLevelTheme(OVERALL, level);

  const radius = 92;
  const circumference = 2 * Math.PI * radius;

  const LevelIcon = level ? LEVEL_META[level].Icon : Target;

  return (
    <div className="relative flex min-h-[290px] items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[280px] w-[280px] rounded-full border border-dashed border-[#338DFD]/30"
      />

      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        className="absolute -rotate-90"
      >
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="12"
        />

        <motion.circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="#6FE0C1"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDashoffset: circumference * (1 - value / 6),
          }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
          }}
        />
      </svg>

      <div className="relative flex h-[170px] w-[170px] flex-col items-center justify-center rounded-full border border-white/15 bg-white/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <LevelIcon size={22} className="text-[#6FE0C1]" />

        <motion.p
          key={level}
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          className="mt-1 font-display text-6xl font-black tracking-tight text-white"
        >
          {level || "—"}
        </motion.p>

        <p className="mt-1 text-[13px] font-extrabold text-white/70">
          {getLevelLabel(level)}
        </p>
      </div>

      {theme && (
        <span
          className="absolute bottom-2 rounded-full px-4 py-1.5 text-[12px] font-black uppercase tracking-wider"
          style={{
            backgroundColor: theme.bg,
            color: theme.text,
          }}
        >
          Current level
        </span>
      )}
    </div>
  );
}

/* =====================================================================
   ACTIVITY METRIC
   ===================================================================== */

function ActivityMetric({
  title,
  value,
  subtitle,
  icon,
  tone,
  progress = 0,
  index = 0,
}) {
  const toneConfig = {
    blue: {
      icon: "bg-[#338DFD]/10 text-[#338DFD]",
      accent: "from-[#338DFD] to-[#6366F1]",
    },

    green: {
      icon: "bg-[#49C4A5]/12 text-[#149A75]",
      accent: "from-[#49C4A5] to-[#1CA982]",
    },

    purple: {
      icon: "bg-[#8B5CF6]/10 text-[#7C3AED]",
      accent: "from-[#8B5CF6] to-[#6366F1]",
    },

    orange: {
      icon: "bg-[#FF9A3D]/12 text-[#E77716]",
      accent: "from-[#FFB84D] to-[#FF7A45]",
    },
  };

  const config = toneConfig[tone] || toneConfig.blue;

  return (
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
        delay: index * 0.06,
      }}
      whileHover={{
        y: -6,
      }}
      className="group relative overflow-hidden rounded-[25px] border-2 border-[#DCE4EC] bg-white p-6 shadow-[0_12px_35px_rgba(16,43,78,0.06)] transition-colors hover:border-[#BFD0E0]"
    >
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${config.accent} opacity-[0.06] blur-2xl transition-transform duration-500 group-hover:scale-150`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[16px] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${config.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-6">
        <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#102B4E]/55">
          {title}
        </p>

        <p className="mt-1 font-display text-[38px] font-black tracking-tight text-[#102B4E]">
          {value}
        </p>

        <p className="mt-1.5 text-[14px] font-semibold leading-6 text-[#102B4E]/60">
          {subtitle}
        </p>
      </div>

      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-[#102B4E]/[0.07]">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(Math.max(Number(progress) || 0, 0), 100)}%`,
          }}
          transition={{
            duration: 0.9,
          }}
          className={`h-full rounded-full bg-gradient-to-r ${config.accent}`}
        />
      </div>
    </motion.div>
  );
}

/* =====================================================================
   DASHBOARD CARD
   ===================================================================== */

function DashboardCard({ title, subtitle, icon, children }) {
  return (
    <section className="overflow-hidden rounded-[28px] border-2 border-[#D3DFEA] bg-white shadow-[0_14px_42px_rgba(16,43,78,0.06)]">
      <div className="flex items-center gap-4 border-b-2 border-[#E3EAF1] bg-gradient-to-br from-[#F8FAFC] via-white to-[#F4F8FC] px-6 py-6 sm:px-7">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] border-2 border-[#C9DDF2] bg-[#EAF3FF] text-[#338DFD]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="font-display text-xl font-black tracking-tight text-[#102B4E] sm:text-2xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[14px] font-semibold leading-6 text-[#102B4E]/60">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

/* =====================================================================
   LEVEL PILL
   ===================================================================== */

function LevelPill({ skill, level, size = "md" }) {
  const theme = getLevelTheme(skill, level);

  const sizes = {
    sm: "px-2.5 py-1 text-[12px]",
    md: "px-3.5 py-1.5 text-[14px]",
    lg: "px-5 py-2 text-[18px]",
  };

  if (!theme) {
    return (
      <span
        className={`rounded-full border-2 border-dashed border-[#C9D5E1] font-black text-[#102B4E]/45 ${sizes[size]}`}
      >
        —
      </span>
    );
  }

  return (
    <span
      className={`rounded-full border-2 font-black ${sizes[size]}`}
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      {level}
    </span>
  );
}

/* =====================================================================
   SKILL TILE
   ===================================================================== */

function SkillTile({ skill, level, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const theme = getLevelTheme(skill, level);

  const descriptors = level ? DESCRIPTORS?.[skill.key]?.[level] || [] : [];

  const Icon = skill.Icon;
  const meta = level ? LEVEL_META[level] : null;

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="overflow-hidden rounded-2xl border-2 transition-shadow duration-200 hover:shadow-[0_14px_30px_rgba(16,43,78,0.16)]"
      style={{
        backgroundColor: theme ? theme.bg : "#FFFFFF",
        borderColor: theme ? theme.border : "#C9D5E1",
        borderStyle: theme ? "solid" : "dashed",
      }}
    >
      <button
        type="button"
        onClick={() => descriptors.length > 0 && setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-3.5 text-left outline-none"
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{
            backgroundColor: theme ? theme.tile : "#94A3B8",
          }}
        >
          <Icon size={23} strokeWidth={2.4} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-[15px] font-black"
            style={{
              color: theme ? theme.text : "#64748B",
            }}
          >
            {skill.label}
          </span>

          <span className="mt-0.5 flex items-baseline gap-2">
            <span
              className="text-[22px] font-black leading-none"
              style={{
                color: theme ? theme.text : "#64748B",
              }}
            >
              {level || "—"}
            </span>

            <span
              className="truncate text-[12px] font-extrabold uppercase tracking-[0.04em]"
              style={{
                color: theme ? theme.sub : "#64748B",
              }}
            >
              {meta ? meta.title : "Not evaluated"}
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

        {descriptors.length > 0 && (
          <ChevronDown
            size={22}
            strokeWidth={2.8}
            className={`shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            style={{
              color: theme?.text,
            }}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && descriptors.length > 0 && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
            }}
            className="overflow-hidden"
          >
            <div
              className="mx-3.5 mb-3.5 space-y-2.5 rounded-xl p-3.5"
              style={{
                backgroundColor: theme.dark
                  ? "rgba(255,255,255,0.16)"
                  : "rgba(255,255,255,0.75)",
              }}
            >
              <p
                className="text-[12px] font-black uppercase tracking-[0.1em]"
                style={{
                  color: theme.sub,
                }}
              >
                What you demonstrated
              </p>

              {descriptors.map((descriptor, index) => (
                <div
                  key={`${skill.key}-${index}`}
                  className="flex items-start gap-2.5"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{
                      color: theme.dark ? "#FFFFFF" : skill.color,
                    }}
                  />

                  <p
                    className="text-[14px] font-semibold leading-[22px]"
                    style={{
                      color: theme.text,
                    }}
                  >
                    {descriptor}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =====================================================================
   REMARK BOX
   ===================================================================== */

function RemarkBox({ activity }) {
  return (
    <div
      className="flex items-start gap-3.5 rounded-2xl border-2 p-5"
      style={{
        backgroundColor: "#FFF0F4",
        borderColor: "#F2C3D0",
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white"
        style={{
          color: "#9E3453",
        }}
      >
        <MessageSquareText size={20} />
      </span>

      <div>
        <p
          className="text-[12px] font-black uppercase tracking-[0.12em]"
          style={{
            color: "#9E3453",
          }}
        >
          Mentor remark
        </p>

        <p className="mt-1.5 text-[15px] font-semibold leading-7 text-[#102B4E]/80">
          {activity.teacherRemarks ||
            activity.remarks ||
            "No remark was added for this month."}
        </p>
      </div>
    </div>
  );
}

/* =====================================================================
   LATEST MONTHLY EVALUATION
   ===================================================================== */

function LatestEvaluation({ activity }) {
  const overallTheme = getLevelTheme(OVERALL, activity.overallLevel);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-[#E3EAF1] bg-[#F8FAFC] p-5">
        <div>
          <p className="text-[16px] font-black text-[#102B4E]">
            {formatMonth(activity.monthStart)}
          </p>

          <p className="mt-1 text-[14px] font-semibold text-[#102B4E]/60">
            Overall CEFR level · average of 7 skills
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[13px] font-extrabold text-[#102B4E]/60">
            {getLevelLabel(activity.overallLevel)}
          </span>

          <span
            className="rounded-2xl px-5 py-2 text-[26px] font-black"
            style={{
              backgroundColor: overallTheme?.bg,
              color: overallTheme?.text,
            }}
          >
            {activity.overallLevel}
          </span>
        </div>
      </div>

      <div className="grid items-start gap-3 sm:grid-cols-2">
        {CEFR_SKILLS.map((skill) => (
          <SkillTile
            key={skill.key}
            skill={skill}
            level={activity.evaluation?.[skill.key]}
          />
        ))}
      </div>

      <RemarkBox activity={activity} />
    </div>
  );
}

/* =====================================================================
   TREND INSIGHT
   ===================================================================== */

function TrendInsight({ latest, previous }) {
  if (!previous) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] bg-gradient-to-br from-[#F0F6FF] to-[#F8FAFD] px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#338DFD]/10 text-[#338DFD]">
          <Activity size={28} />
        </div>

        <h3 className="mt-5 text-xl font-black text-[#102B4E]">
          Your first monthly evaluation is in
        </h3>

        <p className="mt-3 max-w-sm text-[15px] font-semibold leading-7 text-[#102B4E]/60">
          Once another monthly evaluation is recorded, you'll see how your
          overall level is moving over time.
        </p>
      </div>
    );
  }

  const difference =
    (LEVEL_VALUE[latest.overallLevel] || 0) -
    (LEVEL_VALUE[previous.overallLevel] || 0);

  const isUp = difference > 0;
  const isDown = difference < 0;

  const skillMoves = CEFR_SKILLS.map((skill) => {
    const now = LEVEL_VALUE[latest.evaluation?.[skill.key]];

    const before = LEVEL_VALUE[previous.evaluation?.[skill.key]];

    if (!now || !before) return null;

    return {
      skill,
      from: previous.evaluation[skill.key],
      to: latest.evaluation[skill.key],
      delta: now - before,
    };
  }).filter(Boolean);

  return (
    <div className="space-y-5">
      <div
        className={`rounded-[25px] border-2 p-6 ${
          isUp
            ? "border-[#B9E8CE] bg-gradient-to-br from-[#E9FAF5] to-[#F6FCFA]"
            : isDown
              ? "border-red-200 bg-gradient-to-br from-[#FFF0F0] to-[#FFF8F8]"
              : "border-[#C9DDF2] bg-gradient-to-br from-[#EEF5FF] to-[#F7F9FD]"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-[17px] ${
              isUp
                ? "bg-[#49C4A5]/15 text-[#129575]"
                : isDown
                  ? "bg-red-100 text-red-600"
                  : "bg-[#338DFD]/10 text-[#338DFD]"
            }`}
          >
            {isUp ? (
              <ArrowUpRight size={28} />
            ) : isDown ? (
              <ArrowDownRight size={28} />
            ) : (
              <TrendingUp size={28} />
            )}
          </div>

          <span
            className={`font-display text-5xl font-black ${
              isUp
                ? "text-[#129575]"
                : isDown
                  ? "text-red-600"
                  : "text-[#2867AD]"
            }`}
          >
            {difference > 0 ? "+" : ""}
            {difference}
          </span>
        </div>

        <p className="mt-6 text-xl font-black text-[#102B4E]">
          {isUp
            ? "Your latest level moved up."
            : isDown
              ? "Your latest level moved down."
              : "Your latest level stayed steady."}
        </p>

        <p className="mt-2 text-[14px] font-semibold leading-6 text-[#102B4E]/60">
          {previous.overallLevel} → {latest.overallLevel}, compared with your
          previous monthly evaluation.
        </p>
      </div>

      {skillMoves.length > 0 && (
        <div>
          <p className="mb-3 text-[13px] font-black uppercase tracking-[0.12em] text-[#102B4E]/55">
            Skill by skill
          </p>

          <div className="space-y-2">
            {skillMoves.map(({ skill, from, to, delta }) => {
              const Icon = skill.Icon;

              return (
                <motion.div
                  key={skill.key}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 rounded-xl border-2 border-[#E3EAF1] bg-[#FBFCFE] px-3.5 py-2.5"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{
                      backgroundColor: skill.color,
                    }}
                  >
                    <Icon size={18} />
                  </span>

                  <span className="min-w-0 flex-1 truncate text-[14px] font-black text-[#102B4E]">
                    {skill.label}
                  </span>

                  <span className="text-[13px] font-extrabold text-[#102B4E]/60">
                    {from} → {to}
                  </span>

                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      delta > 0
                        ? "bg-[#49C4A5]/15 text-[#129575]"
                        : delta < 0
                          ? "bg-red-100 text-red-600"
                          : "bg-[#EEF2F6] text-[#102B4E]/45"
                    }`}
                  >
                    {delta > 0 ? (
                      <ArrowUpRight size={16} strokeWidth={3} />
                    ) : delta < 0 ? (
                      <ArrowDownRight size={16} strokeWidth={3} />
                    ) : (
                      <Minus size={16} strokeWidth={3} />
                    )}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   STRENGTHS + FOCUS
   ===================================================================== */

function StrengthsAndFocus({ ranked }) {
  if (!ranked.length) return null;

  const top = ranked[0].value;
  const bottom = ranked[ranked.length - 1].value;

  if (top === bottom) {
    return (
      <div className="rounded-2xl border-2 border-[#B9E8CE] bg-[#EAF8F0] p-6 text-center">
        <p className="text-[18px] font-black text-[#126B58]">
          Balanced across all skills
        </p>

        <p className="mt-1.5 text-[15px] font-semibold text-[#126B58]/80">
          All your skills are at {ranked[0].level} right now. Great consistency!
        </p>
      </div>
    );
  }

  const strengths = ranked.filter((s) => s.value === top);

  const focus = ranked.filter((s) => s.value === bottom);

  const Group = ({ title, hint, items, accent, Icon }) => (
    <div
      className="rounded-2xl border-2 p-5"
      style={{
        borderColor: accent.border,
        backgroundColor: accent.bg,
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
          style={{
            backgroundColor: accent.color,
          }}
        >
          <Icon size={21} />
        </span>

        <div>
          <p className="text-[17px] font-black text-[#102B4E]">{title}</p>

          <p className="text-[13px] font-semibold text-[#102B4E]/60">{hint}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {items.map((skill) => {
          const SkillIcon = skill.Icon;

          const theme = getLevelTheme(skill, skill.level);

          return (
            <motion.span
              key={skill.key}
              whileHover={{
                y: -3,
                scale: 1.04,
              }}
              className="inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-[14px] font-black"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
            >
              <SkillIcon size={17} />
              {skill.label} · {skill.level}
            </motion.span>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Group
        title="Strongest skills"
        hint="Where you're doing best"
        items={strengths}
        Icon={Award}
        accent={{
          color: "#2FA866",
          bg: "#F4FBF7",
          border: "#B9E8CE",
        }}
      />

      <Group
        title="Next to work on"
        hint="A little more practice here"
        items={focus}
        Icon={Target}
        accent={{
          color: "#F08A1C",
          bg: "#FFF9F1",
          border: "#F5D5A8",
        }}
      />
    </div>
  );
}

/* =====================================================================
   MONTHLY RECORD
   ===================================================================== */

function MonthlyRecord({ activity, index }) {
  const [open, setOpen] = useState(index === 0);

  const overallTheme = getLevelTheme(OVERALL, activity.overallLevel);

  return (
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
        duration: 0.4,
        delay: Math.min(index * 0.06, 0.35),
      }}
      className="overflow-hidden rounded-[25px] border-2 border-[#DCE4EC] bg-[#F8FAFD] transition-shadow duration-300 hover:bg-white hover:shadow-[0_18px_45px_rgba(16,43,78,0.10)]"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-4 p-5 text-left outline-none sm:p-6"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border-2 border-[#C9DDF2] bg-[#EAF3FF] text-[#338DFD]">
          <CalendarDays size={23} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-black text-[#102B4E]">
              {formatMonth(activity.monthStart)}
            </span>

            {index === 0 && (
              <span className="rounded-full bg-[#338DFD]/10 px-3 py-1 text-[12px] font-black uppercase tracking-wider text-[#338DFD]">
                Latest
              </span>
            )}
          </div>

          <p className="mt-1 text-[13px] font-semibold text-[#102B4E]/55">
            Evaluation recorded {formatDate(activity.createdAt)}
          </p>

          {/* 7 skill chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CEFR_SKILLS.map((skill) => {
              const t = getLevelTheme(skill, activity.evaluation?.[skill.key]);

              const Icon = skill.Icon;

              return (
                <span
                  key={skill.key}
                  title={`${skill.label}: ${
                    activity.evaluation?.[skill.key] || "—"
                  }`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-black"
                  style={{
                    backgroundColor: t?.bg || "#EEF2F6",
                    color: t?.text || "#64748B",
                  }}
                >
                  <Icon size={14} />

                  {activity.evaluation?.[skill.key] || "—"}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="rounded-2xl px-5 py-3 text-center"
            style={{
              backgroundColor: overallTheme?.bg,
              color: overallTheme?.text,
            }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.12em] opacity-80">
              Overall
            </p>

            <p className="font-display text-3xl font-black leading-none">
              {activity.overallLevel}
            </p>

            <p className="mt-1 text-[11px] font-bold opacity-80">
              {getLevelLabel(activity.overallLevel)}
            </p>
          </div>

          <ChevronDown
            size={26}
            strokeWidth={2.8}
            className={`shrink-0 text-[#338DFD] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t-2 border-[#E3EAF1] p-5 sm:p-6">
              <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {CEFR_SKILLS.map((skill) => (
                  <SkillTile
                    key={skill.key}
                    skill={skill}
                    level={activity.evaluation?.[skill.key]}
                  />
                ))}
              </div>

              <RemarkBox activity={activity} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =====================================================================
   CEFR CHART
   ===================================================================== */

function CEFRChart({ data }) {
  const [selected, setSelected] = useState("overall");

  const [hovered, setHovered] = useState(null);

  const options = [OVERALL, ...CEFR_SKILLS];

  const active = options.find((o) => o.key === selected) || OVERALL;

  const ActiveIcon = active.Icon;

  const width = 1000;
  const height = 380;

  const paddingLeft = 64;
  const paddingRight = 40;
  const paddingTop = 50;
  const paddingBottom = 64;

  const chartWidth = width - paddingLeft - paddingRight;

  const chartHeight = height - paddingTop - paddingBottom;

  const getLevel = (item) =>
    selected === "overall" ? item.overallLevel : item.evaluation?.[selected];

  const points = data
    .map((item, i) => ({
      item,
      i,
      level: getLevel(item),
    }))
    .filter((p) => LEVEL_VALUE[p.level]);

  const getX = (i) =>
    data.length === 1
      ? paddingLeft + chartWidth / 2
      : paddingLeft + (i / (data.length - 1)) * chartWidth;

  const getY = (level) =>
    paddingTop +
    chartHeight -
    (((LEVEL_VALUE[level] || 1) - 1) / 5) * chartHeight;

  const line = points.map((p) => `${getX(p.i)},${getY(p.level)}`).join(" ");

  const area =
    points.length > 1
      ? `${getX(points[0].i)},${paddingTop + chartHeight} ${line} ${getX(
          points[points.length - 1].i,
        )},${paddingTop + chartHeight}`
      : "";

  const hoveredPoint = points.find((p) => p.i === hovered);

  return (
    <div className="w-full">
      {/* Skill selector */}
      <div className="mb-5 flex flex-wrap gap-2.5">
        {options.map((option) => {
          const Icon = option.Icon;
          const isActive = option.key === selected;

          return (
            <motion.button
              key={option.key}
              type="button"
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={() => setSelected(option.key)}
              className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-[14px] font-black transition-colors"
              style={{
                backgroundColor: isActive ? option.color : "#FFFFFF",
                borderColor: isActive ? option.color : "#DCE4EC",
                color: isActive ? "#FFFFFF" : "#102B4E",
              }}
            >
              <Icon
                size={16}
                style={{
                  color: isActive ? "#FFFFFF" : option.color,
                }}
              />

              {option.label}
            </motion.button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-[#E3EAF1] bg-[#FBFCFE]">
        <div className="min-w-[640px] p-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={active.color} stopOpacity="0.28" />

                <stop offset="100%" stopColor={active.color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* CEFR horizontal levels */}
            {LEVELS.map((level) => {
              const y = getY(level);

              const t = getLevelTheme(active, level);

              return (
                <g key={level}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#102B4E"
                    strokeOpacity="0.08"
                    strokeDasharray="4 6"
                  />

                  <rect
                    x="6"
                    y={y - 13}
                    width="44"
                    height="26"
                    rx="8"
                    fill={t.bg}
                  />

                  <text
                    x="28"
                    y={y + 5}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="900"
                    fill={t.text}
                  >
                    {level}
                  </text>
                </g>
              );
            })}

            {area && <polygon points={area} fill="url(#chartFill)" />}

            {points.length > 1 && (
              <motion.polyline
                key={selected}
                points={line}
                fill="none"
                stroke={active.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                }}
              />
            )}

            {/* Month labels */}
            {data.map((item, i) => (
              <text
                key={`d-${i}`}
                x={getX(i)}
                y={height - 22}
                textAnchor="middle"
                fontSize="14"
                fontWeight="800"
                fill="#102B4E"
                fillOpacity="0.55"
              >
                {formatMonthShort(item.monthStart)}
              </text>
            ))}

            {/* Points */}
            {points.map((p) => {
              const x = getX(p.i);
              const y = getY(p.level);

              const t = getLevelTheme(active, p.level);

              const isHover = hovered === p.i;

              return (
                <g
                  key={`${p.item.monthKey || p.item._id || "month"}-${p.i}`}
                  onMouseEnter={() => setHovered(p.i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHover ? 22 : 16}
                    fill={active.color}
                    fillOpacity="0.14"
                    style={{
                      transition: "all .15s",
                    }}
                  />

                  <circle
                    cx={x}
                    cy={y}
                    r={isHover ? 12 : 10}
                    fill={t.bg}
                    stroke={active.color}
                    strokeWidth="4"
                    style={{
                      transition: "all .15s",
                    }}
                  />

                  <text
                    x={x}
                    y={y - 26}
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="900"
                    fill="#102B4E"
                  >
                    {p.level}
                  </text>
                </g>
              );
            })}

            {/* Tooltip */}
            {hoveredPoint &&
              (() => {
                const x = getX(hoveredPoint.i);

                const y = getY(hoveredPoint.level);

                const boxW = 190;

                const boxX = Math.min(
                  Math.max(x - boxW / 2, 8),
                  width - boxW - 8,
                );

                const boxY = Math.max(y - 100, 4);

                return (
                  <g pointerEvents="none">
                    <rect
                      x={boxX}
                      y={boxY}
                      width={boxW}
                      height="56"
                      rx="14"
                      fill="#102B4E"
                    />

                    <text
                      x={boxX + boxW / 2}
                      y={boxY + 23}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="700"
                      fill="#FFFFFF"
                      fillOpacity="0.75"
                    >
                      {formatMonth(hoveredPoint.item.monthStart)}
                    </text>

                    <text
                      x={boxX + boxW / 2}
                      y={boxY + 44}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="900"
                      fill="#FFFFFF"
                    >
                      {active.label}: {hoveredPoint.level} ·{" "}
                      {getLevelLabel(hoveredPoint.level)}
                    </text>
                  </g>
                );
              })()}
          </svg>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border-2 border-[#E3EAF1] bg-[#F6F9FD] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{
              backgroundColor: active.color,
            }}
          >
            <ActiveIcon size={16} />
          </span>

          <span className="text-[15px] font-black text-[#102B4E]/80">
            {selected === "overall"
              ? "Overall CEFR level"
              : `${active.label} level`}
          </span>
        </div>

        <span className="text-[14px] font-semibold text-[#102B4E]/55">
          Latest 8 monthly evaluations · hover a point for details
        </span>
      </div>
    </div>
  );
}

/* =====================================================================
   EMPTY STATE
   ===================================================================== */

function EmptyState({ icon, title, description }) {
  return (
    <div className="relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-[25px] bg-gradient-to-br from-[#F1F6FD] via-white to-[#F0FBF8] px-6 py-12 text-center">
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-[#338DFD] shadow-[0_12px_30px_rgba(51,141,253,0.1)]"
      >
        {icon}
      </motion.div>

      <h3 className="relative mt-6 text-xl font-black text-[#102B4E]">
        {title}
      </h3>

      <p className="relative mt-3 max-w-lg text-[15px] font-semibold leading-7 text-[#102B4E]/60 sm:text-base">
        {description}
      </p>
    </div>
  );
}

export default StudentMonthlyActivities;
