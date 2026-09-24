import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

const API_BASE_URL = "http://localhost:5000/api";

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
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={30} className="animate-spin text-[#1769e0]" />

          <p className="mt-4 text-sm text-[#4b101e]/55">
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
    <div className="mx-auto max-w-[1180px]">
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b48a35]">
            Challenge Management
          </p>

          <h1 className="mt-2 font-serif text-3xl text-[#351019] sm:text-[36px]">
            Weekly Challenges
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4b101e]/60">
            Create, manage and publish interactive English challenges for the
            Jashna Edu website.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/challenges/settings"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-black/[0.08]
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-[#351019]
              shadow-sm
              transition
              hover:bg-[#faf8f4]
            "
          >
            <Trophy size={17} />
            Publish
          </Link>

          <Link
            to="/admin/challenges/new"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-emerald-500
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-[0_8px_20px_rgba(37,99,235,0.18)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-[0_12px_25px_rgba(37,99,235,0.25)]
            "
          >
            <Plus size={17} />
            Add Challenge
          </Link>
        </div>
      </div>

      {/* ===================================================
          PUBLISHED CHALLENGE
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[22px]
          bg-[#142b49]
          px-7
          py-6
          text-white
          shadow-[0_12px_35px_rgba(20,43,73,0.12)]
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-24
            h-64
            w-64
            rounded-full
            bg-emerald-400/10
            blur-3xl
          "
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-white/10
              "
            >
              <Trophy size={23} className="text-white" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d7b46a]">
                Currently Published
              </p>

              <h2 className="mt-1 font-serif text-[27px] leading-tight">
                {publishedChallenge?.title || "No challenge published"}
              </h2>

              <p className="mt-1 text-sm text-white/60">
                Selection mode: {settings?.selectionMode || "Not configured"}
              </p>
            </div>
          </div>

          <div
            className="
              flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-white/15
              bg-white/10
              px-4
              py-2
              text-xs
              font-semibold
            "
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            {settings?.selectionMode === "fixed" ? "Fixed" : "Weekly"}
          </div>
        </div>
      </section>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-red-700
          "
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-semibold">Unable to load challenges</p>

            <p className="mt-1 text-xs text-red-600/80">{error}</p>
          </div>
        </div>
      )}

      {/* ===================================================
          STATISTICS
      =================================================== */}

      <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Challenges"
          value={totalChallenges}
          icon={Sparkles}
          iconClass="bg-[#f0e9eb] text-[#6e2638]"
        />

        <StatCard
          label="Active"
          value={activeChallenges}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          label="Text Challenges"
          value={textChallenges}
          icon={FileText}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          label="MCQ Challenges"
          value={mcqChallenges}
          icon={Zap}
          iconClass="bg-amber-50 text-amber-600"
        />
      </section>

      {/* ===================================================
          SEARCH + FILTERS
      =================================================== */}

      <section
        className="
          mt-7
          rounded-[20px]
          border
          border-black/[0.06]
          bg-white
          p-4
          shadow-[0_5px_20px_rgba(30,30,30,0.04)]
        "
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#4b101e]/45
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search challenges..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-black/[0.08]
                bg-[#fcfbf8]
                pl-11
                pr-4
                text-sm
                text-[#28151a]
                outline-none
                transition
                placeholder:text-[#4b101e]/40
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-500/5
              "
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="
              h-12
              min-w-[170px]
              rounded-xl
              border
              border-black/[0.08]
              bg-[#fcfbf8]
              px-4
              text-sm
              text-[#28151a]
              outline-none
            "
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="mcq">MCQ</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="
              h-12
              min-w-[170px]
              rounded-xl
              border
              border-black/[0.08]
              bg-[#fcfbf8]
              px-4
              text-sm
              text-[#28151a]
              outline-none
            "
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            onClick={() => {
              fetchChallenges(true);
              fetchSettings();
            }}
            disabled={refreshing}
            className="
              flex
              h-12
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-black/[0.08]
              bg-white
              px-5
              text-sm
              font-semibold
              text-[#28151a]
              transition
              hover:bg-[#faf8f4]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {/* ===================================================
          LIST HEADER
      =================================================== */}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#4b101e]/60">
          Showing{" "}
          <span className="font-semibold text-[#4b101e]">
            {filteredChallenges.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#4b101e]">
            {totalChallenges}
          </span>{" "}
          challenges
        </p>
      </div>

      {/* ===================================================
          EMPTY STATE
      =================================================== */}

      {filteredChallenges.length === 0 && (
        <div
          className="
            mt-5
            rounded-[22px]
            border
            border-black/[0.06]
            bg-white
            px-6
            py-16
            text-center
          "
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1ebed] text-[#6e2638]">
            <Sparkles size={24} />
          </div>

          <h2 className="mt-5 font-serif text-2xl text-[#351019]">
            No challenges found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#4b101e]/55">
            Try changing your search or filters, or create a new challenge.
          </p>
        </div>
      )}

      {/* ===================================================
          CHALLENGE CARDS
      =================================================== */}

      <div className="mt-5 space-y-5">
        {filteredChallenges.map((challenge) => {
          const challengeIsPublished =
            publishedChallenge &&
            String(publishedChallenge._id) === String(challenge._id);

          return (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              isPublished={challengeIsPublished}
              onDelete={() => setDeleteId(challenge._id)}
            />
          );
        })}
      </div>

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deleteId && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/35
            px-5
            backdrop-blur-sm
          "
        >
          <div
            className="
              relative
              w-full
              max-w-md
              rounded-[24px]
              bg-white
              p-7
              shadow-2xl
            "
          >
            <button
              type="button"
              onClick={() => !deleting && setDeleteId(null)}
              className="
                absolute
                right-5
                top-5
                rounded-full
                p-2
                text-black/45
                hover:bg-black/5
              "
            >
              <X size={18} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <h3 className="mt-5 font-serif text-2xl text-[#351019]">
              Delete challenge?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#4b101e]/60">
              This action cannot be undone. A currently published challenge
              cannot be deleted.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => !deleting && setDeleteId(null)}
                disabled={deleting}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-black/10
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-[#351019]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="
                  flex-1
                  rounded-xl
                  bg-red-600
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:opacity-60
                "
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-[18px]
        border
        border-black/[0.06]
        bg-white
        px-5
        py-5
        shadow-[0_5px_20px_rgba(30,30,30,0.04)]
      "
    >
      <div>
        <p className="text-sm text-[#4b101e]/55">{label}</p>

        <p className="mt-1 text-[29px] font-semibold leading-none text-[#4b101e]">
          {value}
        </p>
      </div>

      <div
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}

/* =========================================================
   CHALLENGE CARD
========================================================= */

function ChallengeCard({ challenge, isPublished, onDelete }) {
  return (
    <article
      className="
        overflow-hidden
        rounded-[22px]
        border
        border-black/[0.06]
        bg-white
        shadow-[0_5px_20px_rgba(30,30,30,0.04)]
      "
    >
      <div className="p-6">
        {/* TOP LABELS */}

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="
              rounded-full
              bg-[#faf5e9]
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-[#b48a35]
            "
          >
            {challenge.label}
          </span>

          <span
            className="
              rounded-full
              bg-[#f1f4f7]
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-[#38516d]
            "
          >
            {challenge.type === "mcq" ? "MCQ" : "TEXT"}
          </span>

          <span
            className={`
              rounded-full
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              ${
                challenge.active
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-500"
              }
            `}
          >
            {challenge.active ? "ACTIVE" : "INACTIVE"}
          </span>

          {isPublished && (
            <span
              className="
                rounded-full
                bg-blue-50
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-blue-600
              "
            >
              PUBLISHED
            </span>
          )}
        </div>

        {/* TITLE */}

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-serif text-[27px] leading-tight text-[#351019]">
              {challenge.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4b101e]/65">
              {challenge.description}
            </p>
          </div>

          <span
            className="
              shrink-0
              rounded-full
              border
              border-black/[0.08]
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-[#4b101e]/55
            "
          >
            {challenge.difficulty || "Intermediate+"}
          </span>
        </div>

        {/* TASK */}

        <div
          className="
            mt-6
            rounded-2xl
            bg-[#faf9f6]
            px-5
            py-5
          "
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b48a35]">
            Challenge Task
          </p>

          <p className="mt-2 text-sm leading-6 text-[#28151a]">
            {challenge.task}
          </p>
        </div>

        {/* MCQ PREVIEW */}

        {challenge.type === "mcq" && Array.isArray(challenge.options) && (
          <div className="mt-5 grid gap-2 md:grid-cols-2">
            {challenge.options.map((option, index) => (
              <div
                key={index}
                className="
                      rounded-xl
                      border
                      border-black/[0.06]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-[#4b101e]/70
                    "
              >
                <span className="mr-2 font-semibold text-[#4b101e]/40">
                  {String.fromCharCode(65 + index)}.
                </span>

                {option}
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-5">
          <div className="text-xs text-[#4b101e]/45">
            {challenge.createdAt
              ? `Created ${new Date(challenge.createdAt).toLocaleDateString()}`
              : ""}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/challenges/edit/${challenge._id}`}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-black/[0.08]
                px-4
                py-2.5
                text-xs
                font-semibold
                text-[#351019]
                transition
                hover:bg-[#faf8f4]
              "
            >
              <Pencil size={15} />
              Edit
            </Link>

            <button
              type="button"
              onClick={onDelete}
              disabled={isPublished}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-red-100
                px-4
                py-2.5
                text-xs
                font-semibold
                text-red-600
                transition
                hover:bg-red-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              title={
                isPublished
                  ? "Unpublish this challenge before deleting it."
                  : "Delete challenge"
              }
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default AdminChallenges;
