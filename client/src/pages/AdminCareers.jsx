import { useCallback, useEffect, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2, X } from "lucide-react";

const API_URL = "http://localhost:5000";
const BASE = `${API_URL}/api/admin/careers`;

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"];

const EMPTY_FORM = {
  title: "",
  type: "Full-time",
  location: "",
  description: "",
  requirementsText: "",
};

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

/* Small fetch helper that attaches the admin token */
async function api(path, options = {}) {
  const token = localStorage.getItem("adminToken");

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.status = response.status;
    throw error;
  }

  return data;
}

const fieldClass =
  "w-full rounded-xl border border-[#102B4E]/15 bg-white px-3.5 py-2.5 text-sm font-medium text-[#102B4E] outline-none transition focus:border-[#338DFD] focus:ring-2 focus:ring-[#338DFD]/20";

export default function AdminCareers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      setPageError("");
      setJobs(await api("/jobs"));
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (job) => {
    setForm({
      title: job.title,
      type: job.type,
      location: job.location,
      description: job.description,
      requirementsText: (job.requirements || []).join("\n"),
    });
    setEditingId(job._id);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        title: form.title,
        type: form.type,
        location: form.location,
        description: form.description,
        requirements: form.requirementsText.split("\n"),
      };

      await api(editingId ? `/jobs/${editingId}` : "/jobs", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      setModalOpen(false);
      loadJobs();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (job) => {
    try {
      await api(`/jobs/${job._id}/toggle`, { method: "PATCH" });
      loadJobs();
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete the job posting "${job.title}"?`)) return;

    try {
      await api(`/jobs/${job._id}`, { method: "DELETE" });
    } catch (error) {
      if (error.status === 409) {
        const confirmed = window.confirm(
          `${error.message}\n\nDo you still want to delete it?`,
        );

        if (confirmed) {
          try {
            await api(`/jobs/${job._id}?force=true`, { method: "DELETE" });
          } catch (forceError) {
            setPageError(forceError.message);
          }
        }
      } else {
        setPageError(error.message);
      }
    }

    loadJobs();
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#1FA886]">
            Content Management
          </p>

          <h1 className="mt-1 font-display text-3xl font-bold text-[#102B4E]">
            Careers
          </h1>

          <p className="mt-1 text-sm font-medium text-[#102B4E]/60">
            Add, edit, close or delete job openings.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#338DFD] to-[#38BDF8] px-5 py-3 text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(51,141,253,0.3)] transition hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={18} />
          Add Job
        </button>
      </div>

      {pageError && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {pageError}
        </p>
      )}

      {/* JOBS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-[#102B4E]/10 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-[#F3F8FF] text-xs font-extrabold uppercase tracking-wider text-[#102B4E]/55">
            <tr>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Posted on</th>
              <th className="px-4 py-3">Last edited</th>
              <th className="px-4 py-3">Applicants</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center font-medium text-[#102B4E]/50"
                >
                  Loading job postings...
                </td>
              </tr>
            )}

            {!loading && jobs.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center">
                  <Briefcase
                    className="mx-auto mb-2 text-[#102B4E]/30"
                    size={28}
                  />
                  <p className="font-semibold text-[#102B4E]/55">
                    No job postings yet. Click "Add Job" to create one.
                  </p>
                </td>
              </tr>
            )}

            {jobs.map((job) => (
              <tr key={job._id} className="border-t border-[#102B4E]/10">
                <td className="px-4 py-3">
                  <p className="font-extrabold text-[#102B4E]">{job.title}</p>
                  <p className="text-xs font-medium text-[#102B4E]/55">
                    {job.type} · {job.location}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      job.isActive
                        ? "bg-[#49C4A5]/15 text-[#177A62]"
                        : "bg-[#102B4E]/10 text-[#102B4E]/60"
                    }`}
                  >
                    {job.isActive ? "Open" : "Closed"}
                  </span>
                </td>

                <td className="px-4 py-3 text-[#102B4E]/75">
                  {formatDateTime(job.createdAt)}
                </td>

                <td className="px-4 py-3 text-[#102B4E]/75">
                  {formatDateTime(job.updatedAt)}
                </td>

                <td className="px-4 py-3 font-bold text-[#102B4E]">
                  {job.applicationsCount}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(job)}
                      className="rounded-lg p-2 text-[#1D6FD8] transition hover:bg-[#338DFD]/10"
                      aria-label={`Edit ${job.title}`}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle(job)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-50"
                    >
                      {job.isActive ? "Close" : "Reopen"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(job)}
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                      aria-label={`Delete ${job.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#102B4E]/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[#102B4E]">
                {editingId ? "Edit Job" : "Add Job"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-[#102B4E]/60 hover:bg-[#102B4E]/5"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#102B4E]/60">
                Job title
              </label>
              <input
                required
                className={fieldClass}
                placeholder="e.g. Spoken English Trainer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#102B4E]/60">
                  Job type
                </label>
                <select
                  className={fieldClass}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#102B4E]/60">
                  Location
                </label>
                <input
                  required
                  className={fieldClass}
                  placeholder="e.g. Faridabad / Remote"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#102B4E]/60">
                Job description
              </label>
              <textarea
                required
                rows="4"
                className={fieldClass}
                placeholder="Describe the role and responsibilities"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#102B4E]/60">
                Requirements / eligibility
              </label>
              <textarea
                rows="4"
                className={fieldClass}
                placeholder={
                  "Bachelor's degree\n1+ year of teaching experience\nFluent in English"
                }
                value={form.requirementsText}
                onChange={(e) =>
                  setForm({ ...form, requirementsText: e.target.value })
                }
              />
              <p className="mt-1 text-xs font-medium text-[#102B4E]/50">
                One line = one requirement point.
              </p>
            </div>

            {formError && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#102B4E]/15 px-5 py-2.5 text-sm font-bold text-[#102B4E]/70 hover:bg-[#102B4E]/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-br from-[#338DFD] to-[#38BDF8] px-5 py-2.5 text-sm font-extrabold text-white shadow-md disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update Job" : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}