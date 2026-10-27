import { API_BASE } from "../config";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Sparkles,
  CheckCircle2,
  FileText,
  Zap,
  Trophy,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

const API_BASE_URL = API_BASE;

const FONT_FAMILY = '"Times New Roman", Times, serif';

const fieldClass =
  "h-14 rounded-xl border-2 border-[#DCE3EC] bg-white px-4 text-[18px] font-bold text-[#28151A] outline-none transition-all duration-200 placeholder:font-semibold placeholder:text-[#8A97A8] hover:-translate-y-0.5 hover:border-[#93B4E8] hover:shadow-md focus:-translate-y-0.5 focus:border-[#2563EB] focus:shadow-lg focus:ring-4 focus:ring-[#2563EB]/15";

/* =========================================================
   AUTH HEADERS
========================================================= */

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

/* =========================================================
   ADMIN CHALLENGES
========================================================= */

function AdminChallenges() {
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* =======================================================
     HANDLE AUTH FAILURE
  ======================================================= */

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    navigate("/admin/login");
  };

  /* =======================================================
     FETCH CHALLENGES
  ======================================================= */

  const fetchChallenges = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/challenges`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch challenges.");
      }

      setChallenges(data.challenges || []);
    } catch (err) {
      console.error("FETCH CHALLENGES ERROR:", err);

      setError(err.message || "Unable to load challenges.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     FETCH CURRENT SETTINGS
  ======================================================= */

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/challenges/settings/current`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch challenge settings.");
      }

      setSettings(data.settings || null);
    } catch (err) {
      console.error("FETCH CHALLENGE SETTINGS ERROR:", err);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchChallenges();
    fetchSettings();
  }, []);

  /* =======================================================
     DELETE CHALLENGE
  ======================================================= */

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/challenges/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete challenge.");
      }

      setDeleteId(null);

      await fetchChallenges(true);
      await fetchSettings();
    } catch (err) {
      console.error("DELETE CHALLENGE ERROR:", err);

      alert(err.message || "Unable to delete challenge.");
    } finally {
      setDeleting(false);
    }
  };

  /* =======================================================
     FILTERED CHALLENGES
  ======================================================= */

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        challenge.title?.toLowerCase().includes(searchText) ||
        challenge.label?.toLowerCase().includes(searchText) ||
        challenge.description?.toLowerCase().includes(searchText);

      const matchesType = typeFilter === "all" || challenge.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? challenge.active : !challenge.active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [challenges, search, typeFilter, statusFilter]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalChallenges = challenges.length;

  const activeChallenges = challenges.filter(
    (challenge) => challenge.active,
  ).length;

  const textChallenges = challenges.filter(
    (challenge) => challenge.type === "text",
  ).length;

  const mcqChallenges = challenges.filter(
    (challenge) => challenge.type === "mcq",
  ).length;

  /* =======================================================
     CURRENT PUBLISHED CHALLENGE
  ======================================================= */

  const activeChallengeId = settings?.activeChallengeId;

  const publishedChallenge =
    activeChallengeId && typeof activeChallengeId === "object"
      ? activeChallengeId
      : challenges.find(
          (challenge) => String(challenge._id) === String(activeChallengeId),
        );

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div
        className="flex min-h-[500px] items-center justify-center"
        style={{ fontFamily: FONT_FAMILY }}
      >
        <div className="flex flex-col items-center">
          <Loader2 size={46} className="animate-spin text-[#1769e0]" />

          <p className="mt-5 text-[22px] font-bold text-[#4b101e]/70">
            Loading challenges...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="admin-challenges-root mx-auto max-w-[1220px] pb-14"
      style={{ fontFamily: FONT_FAMILY }}
    >
      {/* Force Times New Roman everywhere + subtle animations */}
      <style>{`
        .admin-challenges-root, .admin-challenges-root * { font-family: ${FONT_FAMILY} !important; }
        @keyframes ac-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes ac-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.6); } 50% { box-shadow: 0 0 0 7px rgba(52,211,153,0); } }
        .ac-shimmer::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transform: translateX(-120%); animation: ac-shimmer 3.2s ease-in-out infinite; }
        .ac-live-dot { animation: ac-pulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-[15px] font-extrabold uppercase tracking-[0.25em] text-[#b48a35]">
            Challenge Management
          </p>

          <h1 className="mt-2 text-5xl font-extrabold leading-tight text-[#351019] sm:text-6xl">
            Weekly Challenges
          </h1>

          <p className="mt-3 max-w-2xl text-[20px] font-semibold leading-8 text-[#4b101e]/70">
            Create, manage and publish interactive English challenges for the
            Jashna Edu website.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <motion.div
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
          >
            <Link
              to="/admin/challenges/settings"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#142b49]/20 bg-white px-6 py-4 text-[18px] font-extrabold text-[#142b49] shadow-sm transition-all hover:border-[#142b49] hover:bg-[#142b49] hover:text-white hover:shadow-lg"
            >
              <Trophy size={22} />
              Publish
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
          >
            <Link
              to="/admin/challenges/new"
              className="ac-shimmer relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-7 py-4 text-[18px] font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-shadow hover:shadow-[0_16px_34px_rgba(37,99,235,0.4)]"
            >
              <Plus size={22} strokeWidth={3} />
              Add Challenge
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ===================================================
          PUBLISHED CHALLENGE
      =================================================== */}

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-[26px] border-2 border-[#27456D] bg-gradient-to-br from-[#142b49] to-[#1D3F6B] px-8 py-8 text-white shadow-[0_18px_44px_rgba(20,43,73,0.25)]"
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-2 ring-white/15">
              <Trophy size={31} className="text-[#F4D58D]" />
            </div>

            <div>
              <p className="text-[15px] font-extrabold uppercase tracking-[0.24em] text-[#d7b46a]">
                Currently Published
              </p>

              <h2 className="mt-1 text-[34px] font-extrabold leading-tight">
                {publishedChallenge?.title || "No challenge published"}
              </h2>

              <p className="mt-1 text-[18px] font-semibold text-white/70">
                Selection mode: {settings?.selectionMode || "Not configured"}
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2.5 rounded-full border-2 border-white/20 bg-white/10 px-5 py-2.5 text-[17px] font-extrabold">
            <span className="ac-live-dot h-3 w-3 rounded-full bg-emerald-400" />

            {settings?.selectionMode === "fixed" ? "Fixed" : "Weekly"}
          </div>
        </div>
      </motion.section>

      {/* ===================================================
          ERROR
      =================================================== */}

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex items-start gap-4 rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-5 text-red-700"
          >
            <AlertCircle size={26} className="mt-0.5 shrink-0" />

            <div>
              <p className="text-[20px] font-extrabold">
                Unable to load challenges
              </p>

              <p className="mt-1 text-[17px] font-semibold text-red-600/90">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          STATISTICS
      =================================================== */}

      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Challenges"
          value={totalChallenges}
          icon={Sparkles}
          iconClass="bg-[#f0e9eb] text-[#6e2638]"
          accent="#6e2638"
        />

        <StatCard
          label="Active"
          value={activeChallenges}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
          accent="#059669"
        />

        <StatCard
          label="Text Challenges"
          value={textChallenges}
          icon={FileText}
          iconClass="bg-blue-50 text-blue-600"
          accent="#2563EB"
        />

        <StatCard
          label="MCQ Challenges"
          value={mcqChallenges}
          icon={Zap}
          iconClass="bg-amber-50 text-amber-600"
          accent="#D97706"
        />
      </section>

      {/* ===================================================
          SEARCH + FILTERS
      =================================================== */}

      <section className="mt-8 rounded-[24px] border-2 border-[#E1E7EF] bg-white p-5 shadow-[0_8px_28px_rgba(30,30,30,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={22}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search challenges..."
              className={`${fieldClass} w-full pl-13`}
              style={{ paddingLeft: "3.25rem" }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className={`${fieldClass} min-w-[190px]`}
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="mcq">MCQ</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${fieldClass} min-w-[190px]`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <motion.button
            type="button"
            onClick={() => {
              fetchChallenges(true);
              fetchSettings();
            }}
            disabled={refreshing}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.93 }}
            className="flex h-14 items-center justify-center gap-2.5 rounded-xl bg-[#142b49] px-6 text-[18px] font-extrabold text-white shadow-md transition-all hover:bg-[#1D3F6B] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </section>

      {/* ===================================================
          LIST HEADER
      =================================================== */}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[19px] font-bold text-[#4b101e]/70">
          Showing{" "}
          <span className="rounded-md bg-[#E8F0FE] px-2.5 py-0.5 font-extrabold text-[#1D4ED8]">
            {filteredChallenges.length}
          </span>{" "}
          of{" "}
          <span className="rounded-md bg-[#F3ECEE] px-2.5 py-0.5 font-extrabold text-[#6e2638]">
            {totalChallenges}
          </span>{" "}
          challenges
        </p>
      </div>

      {/* ===================================================
          EMPTY STATE
      =================================================== */}

      {filteredChallenges.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 rounded-[26px] border-2 border-dashed border-[#C9D5E4] bg-white px-6 py-20 text-center"
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#142b49] text-[#F4D58D] shadow-lg"
          >
            <Sparkles size={36} />
          </motion.div>

          <h2 className="mt-6 text-4xl font-extrabold text-[#351019]">
            No challenges found
          </h2>

          <p className="mx-auto mt-3 max-w-md text-[20px] font-semibold leading-8 text-[#4b101e]/65">
            Try changing your search or filters, or create a new challenge.
          </p>
        </motion.div>
      )}

      {/* ===================================================
          CHALLENGE CARDS
      =================================================== */}

      <div className="mt-5 space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredChallenges.map((challenge, index) => {
            const challengeIsPublished =
              publishedChallenge &&
              String(publishedChallenge._id) === String(challenge._id);

            return (
              <ChallengeCard
                key={challenge._id}
                challenge={challenge}
                index={index}
                isPublished={challengeIsPublished}
                onDelete={() => setDeleteId(challenge._id)}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      <AnimatePresence>
        {deleteId && (
          <motion.div
            key="delete-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-5 backdrop-blur-sm"
            style={{ fontFamily: FONT_FAMILY }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="admin-challenges-root relative w-full max-w-lg rounded-[28px] border-2 border-[#F3D0D5] bg-white p-8 shadow-2xl"
            >
              <motion.button
                type="button"
                whileHover={{ rotate: 90, scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => !deleting && setDeleteId(null)}
                aria-label="Close"
                className="absolute right-5 top-5 rounded-full p-2 text-black/50 transition-colors hover:bg-black/5 hover:text-black"
              >
                <X size={24} />
              </motion.button>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-2 ring-red-100">
                <Trash2 size={29} />
              </div>

              <h3 className="mt-6 text-[34px] font-extrabold leading-tight text-[#351019]">
                Delete challenge?
              </h3>

              <p className="mt-3 text-[19px] font-semibold leading-8 text-[#4b101e]/70">
                This action cannot be undone. A currently published challenge
                cannot be deleted.
              </p>

              <div className="mt-8 flex gap-4">
                <motion.button
                  type="button"
                  onClick={() => !deleting && setDeleteId(null)}
                  disabled={deleting}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 rounded-xl border-2 border-black/15 px-4 py-3.5 text-[18px] font-extrabold text-[#351019] transition-colors hover:bg-[#F4F6F9]"
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3.5 text-[18px] font-extrabold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-xl disabled:opacity-60"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ label, value, icon: Icon, iconClass, accent }) {
  return (
    <motion.div
      whileHover={{ y: -7, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="relative flex cursor-default items-center justify-between overflow-hidden rounded-[22px] border-2 border-[#E1E7EF] bg-white px-6 py-6 shadow-[0_8px_26px_rgba(30,30,30,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(30,30,30,0.14)]"
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: accent }}
      />

      <div>
        <p className="text-[17px] font-extrabold text-[#4b101e]/65">{label}</p>

        <motion.p
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-2 text-[44px] font-extrabold leading-none text-[#351019]"
        >
          {value}
        </motion.p>
      </div>

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconClass}`}
      >
        <Icon size={27} />
      </div>
    </motion.div>
  );
}

/* =========================================================
   CHALLENGE CARD
========================================================= */

function ChallengeCard({ challenge, index, isPublished, onDelete }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.35 }}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-[26px] border-2 bg-white transition-shadow duration-300 hover:shadow-[0_24px_50px_rgba(20,43,73,0.16)] ${
        isPublished ? "border-[#93B4E8]" : "border-[#E1E7EF]"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-2 ${
          challenge.active
            ? "bg-gradient-to-b from-emerald-400 to-blue-500"
            : "bg-gray-300"
        }`}
      />

      <div className="p-6 pl-9 sm:p-7 sm:pl-10">
        {/* TOP LABELS */}

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex h-9 min-w-[36px] items-center justify-center rounded-full bg-[#142b49] px-2 text-[16px] font-extrabold text-white">
            {index + 1}
          </span>

          <span className="rounded-full bg-[#faf5e9] px-4 py-1.5 text-[14px] font-extrabold uppercase tracking-wider text-[#9A7326]">
            {challenge.label}
          </span>

          <span className="rounded-full bg-[#EAF0F7] px-4 py-1.5 text-[14px] font-extrabold uppercase tracking-wider text-[#38516d]">
            {challenge.type === "mcq" ? "MCQ" : "TEXT"}
          </span>

          <span
            className={`rounded-full px-4 py-1.5 text-[14px] font-extrabold uppercase tracking-wider ${
              challenge.active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {challenge.active ? "ACTIVE" : "INACTIVE"}
          </span>

          {isPublished && (
            <span className="rounded-full bg-blue-600 px-4 py-1.5 text-[14px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              PUBLISHED
            </span>
          )}
        </div>

        {/* TITLE */}

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-[34px] font-extrabold leading-tight text-[#351019] transition-colors group-hover:text-[#1D4ED8]">
              {challenge.title}
            </h2>

            <p className="mt-3 text-[19px] font-semibold leading-8 text-[#4b101e]/75">
              {challenge.description}
            </p>
          </div>

          <span className="shrink-0 rounded-full border-2 border-[#142b49]/15 bg-[#F6F8FB] px-4 py-1.5 text-[14px] font-extrabold uppercase tracking-wider text-[#142b49]/75">
            {challenge.difficulty || "Intermediate+"}
          </span>
        </div>

        {/* TASK */}

        <div className="mt-6 rounded-2xl border-l-4 border-[#b48a35] bg-[#faf9f6] px-6 py-6 transition-colors group-hover:bg-[#F7F4EC]">
          <p className="text-[14px] font-extrabold uppercase tracking-[0.2em] text-[#9A7326]">
            Challenge Task
          </p>

          <p className="mt-2 text-[19px] font-bold leading-8 text-[#28151a]">
            {challenge.task}
          </p>
        </div>

        {/* MCQ PREVIEW */}

        {challenge.type === "mcq" && Array.isArray(challenge.options) && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {challenge.options.map((option, optionIndex) => (
              <motion.div
                key={optionIndex}
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center gap-3 rounded-xl border-2 border-[#E1E7EF] bg-white px-4 py-3.5 text-[18px] font-bold text-[#28151a] transition-colors hover:border-[#93B4E8] hover:bg-[#F3F7FE]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#142b49] text-[16px] font-extrabold text-white">
                  {String.fromCharCode(65 + optionIndex)}
                </span>

                {option}
              </motion.div>
            ))}
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#EDF1F6] pt-6">
          <div className="text-[17px] font-bold text-[#4b101e]/55">
            {challenge.createdAt
              ? `Created ${new Date(challenge.createdAt).toLocaleDateString()}`
              : ""}
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.07, y: -3 }}
              whileTap={{ scale: 0.93 }}
            >
              <Link
                to={`/admin/challenges/edit/${challenge._id}`}
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#142b49] px-6 py-3.5 text-[17px] font-extrabold text-white shadow-md transition-all hover:bg-[#2563EB] hover:shadow-xl"
              >
                <Pencil size={19} />
                Edit
              </Link>
            </motion.div>

            <motion.button
              type="button"
              onClick={onDelete}
              disabled={isPublished}
              whileHover={isPublished ? undefined : { scale: 1.07, y: -3 }}
              whileTap={isPublished ? undefined : { scale: 0.93 }}
              className="inline-flex items-center gap-2.5 rounded-xl border-2 border-red-200 bg-red-50 px-6 py-3.5 text-[17px] font-extrabold text-red-600 transition-all hover:border-red-500 hover:bg-red-600 hover:text-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-red-200 disabled:hover:bg-red-50 disabled:hover:text-red-600 disabled:hover:shadow-none"
              title={
                isPublished
                  ? "Unpublish this challenge before deleting it."
                  : "Delete challenge"
              }
            >
              <Trash2 size={19} />
              Delete
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default AdminChallenges;
