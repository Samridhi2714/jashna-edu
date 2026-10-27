import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  X,
} from "lucide-react";

const TIMES = { fontFamily: '"Times New Roman", Times, serif' };
import { API_URL } from "../config";

const LINKEDIN_REGEX =
  /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[\w\-%.]+\/?(\?.*)?$/i;
const DRIVE_FILE_REGEX =
  /^https:\/\/(drive|docs)\.google\.com\/(file\/d\/|open\?id=|document\/d\/)[\w-]+/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s-]{10,15}$/;

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  resumeLink: "",
  qualification: "",
  experienceYears: "0",
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  });

const inputClass =
  "w-full rounded-xl border border-[#215e93]/20 bg-white px-4 py-3 text-base text-[#173B5E] outline-none transition placeholder:text-[#173B5E]/40 focus:border-[#215e93] focus:ring-2 focus:ring-[#215e93]/20";

function validate(form, confirmed) {
  if (!form.fullName.trim()) return "Please enter your full name.";
  if (!EMAIL_REGEX.test(form.email.trim())) return "Please enter a valid email address.";
  if (!PHONE_REGEX.test(form.phone.trim())) return "Please enter a valid phone number.";
  if (!LINKEDIN_REGEX.test(form.linkedinUrl.trim()))
    return "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/your-name).";
  if (!DRIVE_FILE_REGEX.test(form.resumeLink.trim()))
    return "Please paste a valid Google Drive link to your resume.";
  if (!form.qualification.trim()) return "Please enter your highest qualification.";
  const years = Number(form.experienceYears);
  if (!Number.isFinite(years) || years < 0 || years > 50)
    return "Please enter valid years of experience.";
  if (!confirmed) return "Please confirm that your resume link is set to 'Anyone with the link'.";
  return "";
}

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmed, setConfirmed] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      setLoadError("");
      const response = await fetch(`${API_URL}/api/careers/jobs`);
      if (!response.ok) throw new Error("Unable to load job openings.");
      setJobs(await response.json());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Lock page scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = selectedJob ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedJob]);

  const openJob = (job) => {
    setSelectedJob(job);
    setForm(EMPTY_FORM);
    setConfirmed(false);
    setFormError("");
    setSubmitted(false);
  };

  const closeModal = () => {
    if (submitting) return;
    setSelectedJob(null);
  };

  const setField = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const problem = validate(form, confirmed);
    if (problem) {
      setFormError(problem);
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(`${API_URL}/api/careers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jobId: selectedJob._id }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={TIMES} className="min-h-screen bg-[#F3F7FB] text-[#173B5E]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#215e93] px-4 pb-16 pt-32 text-white sm:px-6 sm:pb-20 sm:pt-36 lg:px-10">
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-1.5 w-full bg-[#84e245]"
        />
        <div className="mx-auto max-w-[1100px]">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#84e245]">
            Careers at Jashna Edu
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Join us in building{" "}
            <span className="text-[#84e245]">better communication.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Explore our current openings and apply in a couple of minutes.
          </p>
        </div>
      </section>

      {/* OPENINGS */}
      <section className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:px-10">
        <h2 className="text-2xl font-bold text-[#215e93] sm:text-3xl">
          Current Openings
        </h2>
        <span className="mt-2 block h-[3px] w-12 rounded-full bg-[#84e245]" />

        {loading && (
          <p className="mt-8 text-lg text-[#173B5E]/60">Loading openings...</p>
        )}

        {loadError && (
          <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
            {loadError}
          </p>
        )}

        {!loading && !loadError && jobs.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#215e93]/10 bg-white p-10 text-center">
            <Briefcase className="mx-auto mb-3 text-[#215e93]/40" size={32} />
            <p className="text-lg font-bold text-[#173B5E]/70">
              There are no open positions right now.
            </p>
            <p className="mt-1 text-base text-[#173B5E]/60">
              Please check back soon.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {jobs.map((job) => (
            <article
              key={job._id}
              className="rounded-2xl border border-[#215e93]/10 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-bold text-[#215e93]">
                    {job.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-base font-bold text-[#173B5E]/75">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase size={16} /> {job.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={16} /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={16} /> Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openJob(job)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#215e93] px-6 py-3 text-base font-bold text-white transition hover:bg-[#173B5E] active:scale-95"
                >
                  View & Apply
                  <ArrowUpRight size={18} />
                </button>
              </div>

              <p className="mt-4 line-clamp-2 text-base leading-7 text-[#173B5E]/80">
                {job.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* JOB DETAILS + APPLY MODAL */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-[#173B5E]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={closeModal}
        >
          <div
            style={TIMES}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-[#215e93] sm:text-3xl">
                  {selectedJob.title}
                </h2>
                <p className="mt-1 text-base font-bold text-[#173B5E]/70">
                  {selectedJob.type} · {selectedJob.location}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="shrink-0 rounded-lg p-2 text-[#173B5E]/60 hover:bg-[#215e93]/10"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto text-[#84e245]" size={56} />
                <h3 className="mt-4 text-2xl font-bold text-[#215e93]">
                  Application submitted!
                </h3>
                <p className="mx-auto mt-2 max-w-md text-lg text-[#173B5E]/80">
                  Thank you for applying for {selectedJob.title}. Our team will
                  review your profile and contact you if you are shortlisted.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-6 rounded-full bg-[#215e93] px-7 py-3 text-base font-bold text-white hover:bg-[#173B5E]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* JD */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold uppercase tracking-[0.15em] text-[#215e93]">
                    Job Description
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-base leading-7 text-[#173B5E]/85">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.requirements?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] text-[#215e93]">
                      Requirements
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {selectedJob.requirements.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 text-base leading-7 text-[#173B5E]/85"
                        >
                          <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#84e245]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <hr className="my-7 border-[#215e93]/15" />

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <h3 className="text-lg font-bold uppercase tracking-[0.15em] text-[#215e93]">
                    Apply Now
                  </h3>

                  <Field label="Full name">
                    <input
                      className={inputClass}
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={setField("fullName")}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email">
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={setField("email")}
                      />
                    </Field>

                    <Field label="Phone number">
                      <input
                        type="tel"
                        className={inputClass}
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={setField("phone")}
                      />
                    </Field>
                  </div>

                  <Field label="LinkedIn profile URL">
                    <input
                      type="url"
                      className={inputClass}
                      placeholder="https://www.linkedin.com/in/your-name"
                      value={form.linkedinUrl}
                      onChange={setField("linkedinUrl")}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Highest qualification">
                      <input
                        className={inputClass}
                        placeholder="e.g. BCA, MA English"
                        value={form.qualification}
                        onChange={setField("qualification")}
                      />
                    </Field>

                    <Field label="Experience (years)">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        className={inputClass}
                        value={form.experienceYears}
                        onChange={setField("experienceYears")}
                      />
                    </Field>
                  </div>

                  <Field label="Resume (Google Drive link)">
                    <input
                      type="url"
                      className={inputClass}
                      placeholder="https://drive.google.com/file/d/..."
                      value={form.resumeLink}
                      onChange={setField("resumeLink")}
                    />
                    <p className="mt-1.5 text-md leading-6 text-[#173B5E]/80">
                      Upload your resume to Google Drive, click Share, set
                      General access to <b>Anyone with the link</b> (Viewer),
                      then paste the link here.
                    </p>
                  </Field>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#F3F7FB] p-4 text-base leading-6 text-[#173B5E]/85">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(event) => setConfirmed(event.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#215e93]"
                    />
                    <span>
                      I confirm my resume link is set to "Anyone with the link
                      can view", and I agree that Jashna Edu may store these
                      details for hiring purposes.
                    </span>
                  </label>

                  {formError && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
                      {formError}
                    </p>
                  )}

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-[#215e93]/25 px-6 py-3 text-base font-bold text-[#215e93] hover:bg-[#215e93]/5"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full bg-[#215e93] px-7 py-3 text-base font-bold text-white transition hover:bg-[#173B5E] disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-[#173B5E]/80">
        {label}
      </label>
      {children}
    </div>
  );
}