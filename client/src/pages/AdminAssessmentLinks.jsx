import { API_URL as BASE_URL } from "../config";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  FileText,
  Link2,
  LoaderCircle,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";

const API_BASE_URL = (
  BASE_URL
).replace(/\/+$/, "");

const API_URL = `${API_BASE_URL}/api/assessment-links/admin`;

const ASSESSMENT_CONFIG = {
  "general-english": {
    title: "General English",
    description:
      "Manage the six Google Forms used for General English assessments.",
    icon: BookOpen,
  },
  "business-english": {
    title: "Business English",
    description:
      "Manage the six Google Forms used for Business English assessments.",
    icon: BriefcaseBusiness,
  },
};

const DEFAULT_ASSESSMENTS = Object.entries(ASSESSMENT_CONFIG).map(
  ([assessmentType, config]) => ({
    assessmentType,
    title: config.title,
    sets: Array.from({ length: 6 }, (_, index) => ({
      setNumber: index + 1,
      title: `Test Set ${index + 1}`,
      link:
        assessmentType === "general-english" && index === 0
          ? "https://forms.gle/ZCvBieT6vtseHD2Q6"
          : "",
    })),
  }),
);

const normalizeLink = (value) => value.trim();

const isValidGoogleFormLink = (value) => {
  if (!value) return true;

  try {
    const parsed = new URL(value);

    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "forms.gle" ||
        parsed.hostname === "docs.google.com") &&
      (parsed.hostname !== "docs.google.com" ||
        parsed.pathname.startsWith("/forms/"))
    );
  } catch {
    return false;
  }
};

function StatusBadge({ available }) {
  return available ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
      <CheckCircle2 size={13} />
      Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
      <AlertCircle size={13} />
      Coming Soon
    </span>
  );
}

export default function AdminAssessmentLinks() {
  const [activeType, setActiveType] = useState("general-english");
  const [assessments, setAssessments] = useState(DEFAULT_ASSESSMENTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const activeConfig = ASSESSMENT_CONFIG[activeType];
  const activeAssessment = assessments.find(
    (item) => item.assessmentType === activeType,
  );

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your admin session may have expired. Please sign in again.",
          );
        }

        throw new Error(
          data.message || "Unable to load assessment links.",
        );
      }

      const records = data.assessments || data.data || [];

      const normalized = DEFAULT_ASSESSMENTS.map((defaultAssessment) => {
        const saved = records.find(
          (item) =>
            item.assessmentType === defaultAssessment.assessmentType,
        );

        const savedSets = saved?.sets || [];

        return {
          ...defaultAssessment,
          title: saved?.title || defaultAssessment.title,
          sets: Array.from({ length: 6 }, (_, index) => {
            const setNumber = index + 1;
            const matchingSet = savedSets.find(
              (item) => Number(item.setNumber) === setNumber,
            );

            const defaultSet = defaultAssessment.sets[index];

            return {
              setNumber,
              title:
                matchingSet?.title ||
                defaultSet.title ||
                `Test Set ${setNumber}`,
              link:
                matchingSet?.link ??
                defaultSet.link ??
                "",
            };
          }),
        };
      });

      setAssessments(normalized);
    } catch (error) {
      setPageError(
        error.message || "Something went wrong while loading the links.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const updateSet = (setNumber, field, value) => {
    setAssessments((previous) =>
      previous.map((assessment) => {
        if (assessment.assessmentType !== activeType) return assessment;

        return {
          ...assessment,
          sets: assessment.sets.map((set) =>
            set.setNumber === setNumber
              ? { ...set, [field]: value }
              : set,
          ),
        };
      }),
    );

    if (field === "link") {
      setFieldErrors((previous) => ({
        ...previous,
        [setNumber]: "",
      }));
    }

    setSuccessMessage("");
  };

  const saveAssessment = async (event) => {
    event.preventDefault();

    if (!activeAssessment) return;

    const nextErrors = {};

    activeAssessment.sets.forEach((set) => {
      const link = normalizeLink(set.link || "");

      if (!isValidGoogleFormLink(link)) {
        nextErrors[set.setNumber] =
          "Enter a valid HTTPS Google Forms link (forms.gle or docs.google.com/forms).";
      }
    });

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setPageError("Please correct the highlighted links before saving.");
      setSuccessMessage("");
      return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
      setPageError("Admin login token not found. Please sign in again.");
      return;
    }

    setSaving(true);
    setPageError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${activeType}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: activeConfig.title,
            sets: activeAssessment.sets.map((set) => ({
              setNumber: set.setNumber,
              title: set.title || `Test Set ${set.setNumber}`,
              link: normalizeLink(set.link || ""),
            })),
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your admin session may have expired. Please sign in again.",
          );
        }

        throw new Error(
          data.message || "Unable to save the assessment links.",
        );
      }

      const savedAssessment = data.assessment || data.data;

      if (savedAssessment?.sets) {
        setAssessments((previous) =>
          previous.map((assessment) =>
            assessment.assessmentType === activeType
              ? {
                  ...assessment,
                  title: savedAssessment.title || assessment.title,
                  sets: assessment.sets.map((set) => {
                    const savedSet = savedAssessment.sets.find(
                      (item) =>
                        Number(item.setNumber) === set.setNumber,
                    );

                    return savedSet
                      ? {
                          ...set,
                          title: savedSet.title || set.title,
                          link: savedSet.link || "",
                        }
                      : set;
                  }),
                }
              : assessment,
          ),
        );
      }

      setSuccessMessage(`${activeConfig.title} links saved successfully.`);
      setFieldErrors({});
    } catch (error) {
      setPageError(
        error.message || "Something went wrong while saving.",
      );
    } finally {
      setSaving(false);
    }
  };

  const availableCount =
    activeAssessment?.sets.filter((set) => set.link?.trim()).length || 0;

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-6 text-[#102B4E] sm:px-6 sm:py-8 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              <ShieldCheck size={15} />
              Assessment management
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Assessment Links
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Manage the Google Forms shown on the public assessments page.
              Changes are saved to your database.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAssessments}
            disabled={loading || saving}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#102B4E] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh links
          </button>
        </motion.header>

        {pageError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>{pageError}</div>
          </div>
        )}

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
            >
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(ASSESSMENT_CONFIG).map(([type, config]) => {
            const Icon = config.icon;
            const assessment = assessments.find(
              (item) => item.assessmentType === type,
            );
            const count =
              assessment?.sets.filter((set) => set.link?.trim()).length || 0;
            const active = activeType === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setActiveType(type);
                  setFieldErrors({});
                  setPageError("");
                  setSuccessMessage("");
                }}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  active
                    ? "border-[#215e93] bg-white shadow-[0_10px_35px_rgba(16,43,78,0.10)] ring-2 ring-blue-100"
                    : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      active
                        ? "bg-[#102B4E] text-white"
                        : "bg-blue-50 text-[#215e93]"
                    }`}
                  >
                    <Icon size={23} />
                  </div>

                  {active && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Selected
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-lg font-extrabold">
                  {config.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {count} of 6 links configured
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(count / 6) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <section className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#215e93]">
                    <Link2 size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black sm:text-2xl">
                      {activeConfig.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {activeConfig.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <div>
                  <p className="text-lg font-black leading-none text-emerald-800">
                    {availableCount}/6
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    Links configured
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-slate-500">
              <LoaderCircle
                size={32}
                className="animate-spin text-[#215e93]"
              />
              <p className="mt-4 text-sm font-semibold">
                Loading assessment links...
              </p>
            </div>
          ) : (
            <form onSubmit={saveAssessment}>
              <div className="space-y-4 p-4 sm:p-7">
                {activeAssessment?.sets.map((set, index) => {
                  const available = Boolean(set.link?.trim());
                  const fieldError = fieldErrors[set.setNumber];

                  return (
                    <motion.div
                      key={`${activeType}-${set.setNumber}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.035 }}
                      className={`rounded-2xl border p-4 sm:p-5 ${
                        fieldError
                          ? "border-rose-300 bg-rose-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex shrink-0 items-center gap-3 sm:w-40">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102B4E] text-sm font-black text-white">
                            {String(set.setNumber).padStart(2, "0")}
                          </div>

                          <div>
                            <p className="font-extrabold text-[#102B4E]">
                              Test Set {set.setNumber}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Assessment link
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`assessment-link-${set.setNumber}`}
                            className="mb-2 block text-sm font-bold text-slate-700"
                          >
                            Google Forms URL
                          </label>

                          <input
                            id={`assessment-link-${set.setNumber}`}
                            type="url"
                            inputMode="url"
                            autoComplete="url"
                            value={set.link}
                            onChange={(event) =>
                              updateSet(
                                set.setNumber,
                                "link",
                                event.target.value,
                              )
                            }
                            placeholder="https://forms.gle/your-form-link"
                            aria-invalid={Boolean(fieldError)}
                            aria-describedby={
                              fieldError
                                ? `assessment-error-${set.setNumber}`
                                : undefined
                            }
                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                              fieldError
                                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                                : "border-slate-200 focus:border-blue-400 focus:ring-blue-50"
                            }`}
                          />

                          {fieldError && (
                            <p
                              id={`assessment-error-${set.setNumber}`}
                              className="mt-2 text-xs font-medium text-rose-700"
                            >
                              {fieldError}
                            </p>
                          )}

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Leave empty to display Coming Soon on the public
                            page.
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:w-32 sm:flex-col sm:items-end">
                          <StatusBadge available={available} />

                          {available && isValidGoogleFormLink(set.link.trim()) && (
                            <a
                              href={set.link.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Open Test Set ${set.setNumber}`}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-[#215e93] transition hover:bg-blue-50"
                            >
                              Test link
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5">
                <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                  <FileText size={16} className="mt-0.5 shrink-0" />
                  <p>
                    Use a published Google Form link. Saving updates the links
                    stored in the database.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#215e93] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save {activeConfig.title} Links
                      <ArrowUpRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-blue-900">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#215e93]" />
          <p>
            <strong>Admin tip:</strong> After saving, open the public
            Assessments page in another tab and select the relevant assessment
            to verify that the updated test links appear correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
