import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  MessageCircle,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { getWhatsAppLink } from "../data/contact";
import { API_URL } from "../config";

const API_BASE_URL = (
  API_URL
).replace(/\/+$/, "");

const FAQ_API_URL = `${API_BASE_URL}/api/faqs`;

/* Alternating light blue / light teal tones for the cards. */
const TONES = [
  {
    name: "blue",
    card: "border-[#D3E4F6] bg-gradient-to-br from-[#EEF6FF] to-white",
    cardOpen: "border-[#338DFD]/50 shadow-[0_18px_45px_rgba(51,141,253,0.14)]",
    cardHover: "hover:border-[#338DFD]/40 hover:shadow-[0_14px_36px_rgba(51,141,253,0.12)]",
    accent: "from-[#338DFD] to-[#72b9ff]",
    badge: "bg-[#DCEBFD] text-[#2A78D6]",
    badgeOpen: "bg-[#338DFD] text-white",
    chevron: "bg-[#DCEBFD] text-[#2A78D6]",
    chevronOpen: "bg-[#338DFD] text-white",
    answerBox: "border-[#CFE3F8] bg-white",
    link: "bg-[#DCEBFD] text-[#1F5FAE] hover:bg-[#338DFD] hover:text-white",
    divider: "from-[#338DFD]/60 via-[#338DFD]/20 to-transparent",
  },
  {
    name: "teal",
    card: "border-[#CFE9E4] bg-gradient-to-br from-[#E8F8F4] to-white",
    cardOpen: "border-[#2A9D8F]/50 shadow-[0_18px_45px_rgba(42,157,143,0.14)]",
    cardHover: "hover:border-[#2A9D8F]/40 hover:shadow-[0_14px_36px_rgba(42,157,143,0.12)]",
    accent: "from-[#2A9D8F] to-[#61D6BD]",
    badge: "bg-[#D2F0EA] text-[#1F7F73]",
    badgeOpen: "bg-[#2A9D8F] text-white",
    chevron: "bg-[#D2F0EA] text-[#1F7F73]",
    chevronOpen: "bg-[#2A9D8F] text-white",
    answerBox: "border-[#C3E6DF] bg-white",
    link: "bg-[#D2F0EA] text-[#175F56] hover:bg-[#2A9D8F] hover:text-white",
    divider: "from-[#2A9D8F]/60 via-[#61D6BD]/25 to-transparent",
  },
];

/*
  Renders answer text with **bold** support, so editors can
  emphasise key words from the admin panel. Everything else
  stays dark, semi-bold and easy to read.
*/
const renderAnswer = (text = "") =>
  String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-extrabold text-[#0B1F38]">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );

const isExternalLink = (url = "") => /^https?:\/\//i.test(url);

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeFAQs, setActiveFAQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(FAQ_API_URL, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load FAQs right now.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.faqs)) {
          throw new Error("The FAQ response could not be loaded.");
        }

        const publishedFAQs = data.faqs;

        setFaqs(publishedFAQs);

        // Open the first FAQ by default.
        setActiveFAQs(publishedFAQs.length > 0 ? [publishedFAQs[0]._id] : []);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Failed to load FAQs:", err);
        setError("We're unable to load the FAQs at the moment.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFAQs();

    return () => controller.abort();
  }, [reloadKey]);

  const toggleFAQ = useCallback((id) => {
    setActiveFAQs((current) =>
      current.includes(id)
        ? current.filter((faqId) => faqId !== id)
        : [...current, id],
    );
  }, []);

  /* Search keeps original numbering so "01" always means the same question. */
  const visibleFAQs = useMemo(() => {
    const term = query.trim().toLowerCase();

    return faqs
      .map((faq, index) => ({ faq, index }))
      .filter(
        ({ faq }) =>
          !term ||
          String(faq.question || "").toLowerCase().includes(term) ||
          String(faq.answer || "").toLowerCase().includes(term),
      );
  }, [faqs, query]);

  const allOpen =
    visibleFAQs.length > 0 &&
    visibleFAQs.every(({ faq }) => activeFAQs.includes(faq._id));

  const toggleAll = () => {
    const ids = visibleFAQs.map(({ faq }) => faq._id);

    setActiveFAQs((current) =>
      allOpen
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  };

  const handleRetry = () => setReloadKey((k) => k + 1);

  const askLink = getWhatsAppLink(
    "Hello Dr. Shivam Sir, I would like to know more about Jashna Edu programs.",
  );

  const questionLink = getWhatsAppLink(
    "Hello Dr. Shivam Sir, I have a question about Jashna Edu.",
  );

  const searchMissLink = getWhatsAppLink(
    `Hello Dr. Shivam Sir, I couldn't find an answer to "${query.trim()}" in the FAQs. Could you help?`,
  );

  return (
    <section
      id="faqs"
      aria-labelledby="faq-heading"
      className="relative isolate overflow-hidden bg-[#F3F9FC] py-14 sm:py-16 lg:py-20"
    >
      {/* Decorative background — alternating blue / teal washes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-10 -z-10 h-72 w-72 rounded-full bg-[#61D6BD]/20 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-[40%] -z-10 h-72 w-72 rounded-full bg-[#338DFD]/12 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-[15%] -z-10 h-64 w-64 rounded-full bg-[#2A9D8F]/12 blur-3xl sm:h-80 sm:w-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.25] [background-image:radial-gradient(circle_at_1px_1px,rgba(16,43,78,0.10)_1px,transparent_0)] [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />

      {/* Main container: 94% mobile, 92% tablet, 90% desktop */}
      <div className="mx-auto w-[94%] max-w-[1600px] sm:w-[92%] lg:w-[90%]">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-9 max-w-3xl text-center sm:mb-12 lg:mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C7E8E2] bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#1F7F73] shadow-sm sm:text-xs">
            <Sparkles size={13} className="text-[#2A9D8F]" />
            Got questions?
          </span>

          <h2
            id="faq-heading"
            className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-[#102B4E] sm:text-4xl lg:text-5xl xl:text-6xl"
          >
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#338DFD] to-[#2A9D8F] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">
            Everything you need to know about our programs, batch timings,
            eligibility, and learning opportunities at Jashna Edu.
          </p>
        </motion.div>

        {/* Main responsive layout */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-7 md:gap-9 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,2fr)] lg:gap-10 xl:gap-12">
          {/* Left information panel */}
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#102B4E] via-[#123560] to-[#0F4A58] p-6 text-white shadow-xl sm:rounded-3xl sm:p-8 lg:sticky lg:top-24 lg:p-7 xl:p-9"
          >
            {/* Decorative shapes */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border-[24px] border-white/5 sm:h-44 sm:w-44"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#61D6BD]/15 blur-2xl"
            />

            <div className="relative">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#61D6BD] text-[#102B4E] shadow-[0_10px_28px_rgba(97,214,189,0.35)] sm:h-14 sm:w-14"
              >
                <MessageCircle size={26} />
              </motion.div>

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#61D6BD] sm:text-sm sm:tracking-[0.18em]">
                Let's make it clear
              </p>

              <h3 className="text-2xl font-extrabold leading-snug sm:text-3xl xl:text-4xl">
                Your learning journey starts with the right questions.
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/80 sm:mt-5 sm:text-base">
                Explore our frequently asked questions to understand our
                programs and find the information you need before getting
                started.
              </p>

              {!loading && !error && faqs.length > 0 && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white/90">
                  <span className="h-2 w-2 rounded-full bg-[#61D6BD]" />
                  {faqs.length} {faqs.length === 1 ? "answer" : "answers"} ready
                  for you
                </div>
              )}

              {/* Contact information */}
              <div className="mt-7 flex items-start gap-3 border-t border-white/15 pt-5 sm:mt-8 sm:pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <MessageCircle size={19} className="text-[#61D6BD]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-white sm:text-base">
                    Need more information?
                  </p>

                  <p className="mt-1 text-xs leading-6 text-white/70 sm:text-sm">
                    Contact us for guidance on choosing the right program for
                    your goals.
                  </p>
                </div>
              </div>

              <motion.a
                href={askLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#61D6BD] px-4 py-3.5 text-sm font-extrabold text-[#102B4E] shadow-[0_10px_28px_rgba(97,214,189,0.3)] transition duration-200 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#61D6BD]/30 sm:px-5 sm:text-base"
              >
                Ask Us a Question
                <ArrowRight size={18} className="shrink-0" />
              </motion.a>

              <p className="mt-4 text-center text-xs leading-5 text-white/60">
                We're here to help you take the next step.
              </p>
            </div>
          </motion.aside>

          {/* Right FAQ area */}
          <div className="min-w-0">
            {/* Loading state */}
            {loading && (
              <div role="status" aria-live="polite" className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-[#D3E4F6] bg-white p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-[#DCEBFD]" />
                      <div className="h-4 flex-1 rounded-full bg-[#E3EEF8]" />
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm font-semibold text-slate-600">
                  Loading frequently asked questions...
                </p>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-white p-7 text-center sm:p-10"
              >
                <CircleHelp size={34} className="mx-auto mb-4 text-red-500" />

                <p className="font-bold text-red-700">{error}</p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#102B4E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1c416b] focus:outline-none focus:ring-4 focus:ring-[#338DFD]/25"
                  >
                    <RefreshCw size={15} />
                    Try Again
                  </button>

                  <a
                    href={questionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#E6F7F3] px-5 py-3 text-sm font-bold text-[#175F56] transition hover:bg-[#D2F0EA]"
                  >
                    <MessageCircle size={15} />
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && faqs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#338DFD]/30 bg-white p-8 text-center sm:p-12">
                <CircleHelp size={38} className="mx-auto mb-4 text-[#338DFD]" />

                <h3 className="text-xl font-extrabold text-[#102B4E] sm:text-2xl">
                  FAQs are being prepared
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-600 sm:text-base">
                  Our team is preparing answers to help you learn more about
                  Jashna Edu and its programs.
                </p>
              </div>
            )}

            {/* Toolbar + FAQ grid */}
            {!loading && !error && faqs.length > 0 && (
              <>
                {/* Search + expand all */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={18}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#338DFD]"
                    />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search a question, e.g. batch timings"
                      aria-label="Search frequently asked questions"
                      className="w-full rounded-full border border-[#D3E4F6] bg-white py-3 pl-11 pr-11 text-sm font-semibold text-[#102B4E] shadow-sm outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-[#338DFD]/60 focus:ring-4 focus:ring-[#338DFD]/10"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#EEF6FF] text-[#2A78D6] transition hover:bg-[#DCEBFD]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={toggleAll}
                    disabled={visibleFAQs.length === 0}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#C7E8E2] bg-[#E6F7F3] px-5 py-3 text-sm font-extrabold text-[#175F56] transition hover:bg-[#D2F0EA] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        allOpen ? "rotate-180" : ""
                      }`}
                    />
                    {allOpen ? "Collapse all" : "Expand all"}
                  </button>
                </div>

                {query.trim() && (
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {visibleFAQs.length}{" "}
                    {visibleFAQs.length === 1 ? "result" : "results"} for “
                    {query.trim()}”
                  </p>
                )}

                {/* No search matches */}
                {visibleFAQs.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#338DFD]/30 bg-white p-8 text-center sm:p-10">
                    <Search size={32} className="mx-auto mb-3 text-[#338DFD]" />
                    <h3 className="text-lg font-extrabold text-[#102B4E]">
                      No matching questions
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-slate-600">
                      Try a different word, or ask our team directly and we'll
                      get back to you.
                    </p>
                    <a
                      href={searchMissLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1FA855] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,168,85,0.25)] transition hover:-translate-y-0.5"
                    >
                      <MessageCircle size={16} />
                      Ask Dr. Shivam Sir
                    </a>
                  </div>
                )}

                {/* Responsive FAQ grid */}
                <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 md:grid-cols-2">
                  {visibleFAQs.map(({ faq, index }, position) => {
                    const isOpen = activeFAQs.includes(faq._id);
                    const tone = TONES[index % TONES.length];

                    const questionId = `faq-question-${faq._id}`;
                    const answerId = `faq-answer-${faq._id}`;

                    const externalLink = isExternalLink(faq.linkUrl);

                    return (
                      <motion.article
                        key={faq._id}
                        layout="position"
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                          duration: 0.45,
                          delay: Math.min(position, 6) * 0.05,
                        }}
                        className={`group relative min-w-0 overflow-hidden rounded-2xl border transition-all duration-300 ${
                          tone.card
                        } ${
                          isOpen
                            ? tone.cardOpen
                            : `shadow-sm hover:-translate-y-0.5 ${tone.cardHover}`
                        }`}
                      >
                        {/* Left accent bar grows when open */}
                        <span
                          aria-hidden="true"
                          className={`absolute left-0 top-0 w-1 bg-gradient-to-b transition-all duration-500 ${
                            tone.accent
                          } ${isOpen ? "h-full" : "h-0 group-hover:h-full"}`}
                        />

                        {/* Question button */}
                        <button
                          type="button"
                          id={questionId}
                          aria-expanded={isOpen}
                          aria-controls={answerId}
                          onClick={() => toggleFAQ(faq._id)}
                          className="flex w-full min-w-0 items-start gap-3 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#338DFD] sm:gap-4 sm:px-5 sm:py-5"
                        >
                          {/* Question number */}
                          <span
                            aria-hidden="true"
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition duration-300 sm:h-10 sm:w-10 sm:text-sm ${
                              isOpen ? tone.badgeOpen : tone.badge
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {/* Question text */}
                          <span className="min-w-0 flex-1 break-words pt-1 text-sm font-extrabold leading-6 text-[#0B1F38] sm:text-base sm:leading-7">
                            {faq.question}
                          </span>

                          {/* Expand icon */}
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 sm:h-9 sm:w-9 ${
                              isOpen
                                ? `rotate-180 ${tone.chevronOpen}`
                                : tone.chevron
                            }`}
                          >
                            <ChevronDown size={19} />
                          </span>
                        </button>

                        {/* Answer — animated open / close */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key="answer"
                              id={answerId}
                              role="region"
                              aria-labelledby={questionId}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-5 sm:px-5 sm:pb-6">
                                <div
                                  className={`mb-4 h-px bg-gradient-to-r ${tone.divider}`}
                                />

                                <div
                                  className={`rounded-xl border p-4 ${tone.answerBox}`}
                                >
                                  <p className="whitespace-pre-line break-words text-sm font-semibold leading-7 text-[#14304F] sm:text-[15px] sm:leading-7">
                                    {renderAnswer(faq.answer)}
                                  </p>
                                </div>

                                {/* Optional FAQ link */}
                                {faq.linkText && faq.linkUrl && (
                                  <a
                                    href={faq.linkUrl}
                                    target={externalLink ? "_blank" : undefined}
                                    rel={
                                      externalLink
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                    className={`mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#338DFD] ${tone.link}`}
                                  >
                                    <span className="break-words">
                                      {faq.linkText}
                                    </span>

                                    <ArrowRight size={16} className="shrink-0" />
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom contact prompt */}
        {!loading && !error && faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#C7E8E2] bg-gradient-to-r from-[#EAF4FF] via-white to-[#E6F7F3] px-6 py-6 text-center sm:mt-12 sm:flex-row sm:text-left"
          >
            <div>
              <p className="text-base font-extrabold text-[#102B4E] sm:text-lg">
                Still have questions about Jashna Edu?
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                Message Dr. Shivam Sir and get a clear answer.
              </p>
            </div>

            <motion.a
              href={questionLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1FA855] px-6 py-3 text-sm font-extrabold text-white shadow-[0_10px_26px_rgba(31,168,85,0.25)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1FA855]/30"
            >
              <MessageCircle size={17} />
              Talk to our team
              <ArrowRight size={16} />
            </motion.a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;