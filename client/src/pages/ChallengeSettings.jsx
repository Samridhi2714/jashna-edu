import { API_BASE } from "../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Check,
  Loader2,
  Save,
  Sparkles,
  Trophy,
  CalendarDays,
  Lock,
} from "lucide-react";

const API_BASE_URL = API_BASE;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

function ChallengeSettings() {
  const [challenges, setChallenges] = useState([]);

  const [selectionMode, setSelectionMode] =
    useState("weekly");

  const [activeChallengeId, setActiveChallengeId] =
    useState("");

  const [weekKey, setWeekKey] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [challengeResponse, settingsResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/challenges`, {
            headers: getAuthHeaders(),
          }),

          fetch(
            `${API_BASE_URL}/challenges/settings/current`,
            {
              headers: getAuthHeaders(),
            },
          ),
        ]);

      const challengeData =
        await challengeResponse.json();

      const settingsData =
        await settingsResponse.json();

      if (!challengeResponse.ok) {
        throw new Error(
          challengeData.message ||
            "Failed to load challenges.",
        );
      }

      if (!settingsResponse.ok) {
        throw new Error(
          settingsData.message ||
            "Failed to load challenge settings.",
        );
      }

      setChallenges(
        challengeData.challenges || [],
      );

      const settings =
        settingsData.settings;

      if (settings) {
        setSelectionMode(
          settings.selectionMode || "weekly",
        );

        setWeekKey(
          settings.weekKey || "",
        );

        const published =
          settings.activeChallengeId;

        if (published?._id) {
          setActiveChallengeId(
            published._id,
          );
        } else if (typeof published === "string") {
          setActiveChallengeId(published);
        } else {
          setActiveChallengeId("");
        }
      }
    } catch (err) {
      console.error(
        "LOAD CHALLENGE SETTINGS ERROR:",
        err,
      );

      setError(
        err.message ||
          "Unable to load challenge settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     SAVE SETTINGS
  ========================================================= */

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!activeChallengeId) {
      setError(
        "Please select a challenge to publish.",
      );

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/challenges/settings/current`,
        {
          method: "PUT",
          headers: getAuthHeaders(),

          body: JSON.stringify({
            selectionMode,
            activeChallengeId,
            weekKey,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update challenge settings.",
        );
      }

      setMessage(
        "Challenge publishing settings updated successfully.",
      );

      await loadData();
    } catch (err) {
      console.error(
        "SAVE CHALLENGE SETTINGS ERROR:",
        err,
      );

      setError(
        err.message ||
          "Unable to update challenge settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CURRENT CHALLENGE
  ========================================================= */

  const currentChallenge =
    challenges.find(
      (challenge) =>
        challenge._id === activeChallengeId,
    );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2
            size={30}
            className="animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm text-[#4b101e]/55">
            Loading challenge settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-7">
        <Link
          to="/admin/challenges"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-[#4b101e]/55
            transition
            hover:text-[#4b101e]
          "
        >
          <ArrowLeft size={16} />

          Back to Challenges
        </Link>

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b48a35]">
            Challenge Control
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#351019]">
            Publish Challenge
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#4b101e]/60">
            Configure the challenge publishing state used by
            the Weekly Challenge system.
          </p>
        </div>
      </div>

      {/* =====================================================
          CURRENTLY CONFIGURED
      ===================================================== */}

      <div
        className="
          overflow-hidden
          rounded-[24px]
          bg-[#142b49]
          p-7
          text-white
          shadow-[0_12px_35px_rgba(20,43,73,0.12)]
        "
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Trophy size={23} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d7b46a]">
              Configured Challenge
            </p>

            <h2 className="mt-1 font-serif text-2xl">
              {currentChallenge?.title ||
                "No challenge selected"}
            </h2>

            <p className="mt-1 text-sm text-white/55">
              {selectionMode === "weekly"
                ? "Configured for weekly publishing."
                : "Configured as a fixed challenge."}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {message && (
        <div
          className="
            mt-5
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            px-5
            py-4
            text-sm
            font-medium
            text-emerald-700
          "
        >
          <Check size={18} />

          {message}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            mt-5
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* =====================================================
          SETTINGS FORM
      ===================================================== */}

      <form
        onSubmit={handleSave}
        className="
          mt-6
          rounded-[24px]
          border
          border-black/[0.06]
          bg-white
          p-7
          shadow-[0_5px_20px_rgba(30,30,30,0.04)]
        "
      >
        {/* MODE */}

        <div>
          <p className="text-sm font-semibold text-[#351019]">
            Selection Mode
          </p>

          <p className="mt-1 text-xs leading-5 text-[#4b101e]/50">
            Store whether the publishing configuration is
            intended for weekly or fixed usage.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {/* WEEKLY */}

            <button
              type="button"
              onClick={() =>
                setSelectionMode("weekly")
              }
              className={`
                rounded-2xl
                border
                p-5
                text-left
                transition
                ${
                  selectionMode === "weekly"
                    ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/10"
                    : "border-black/[0.08] hover:bg-[#faf9f6]"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <CalendarDays size={20} />
                </div>

                {selectionMode === "weekly" && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check size={14} />
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#351019]">
                Weekly Challenge
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#4b101e]/55">
                Associate the publishing configuration with
                the current weekly period.
              </p>
            </button>

            {/* FIXED */}

            <button
              type="button"
              onClick={() =>
                setSelectionMode("fixed")
              }
              className={`
                rounded-2xl
                border
                p-5
                text-left
                transition
                ${
                  selectionMode === "fixed"
                    ? "border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-500/10"
                    : "border-black/[0.08] hover:bg-[#faf9f6]"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Lock size={20} />
                </div>

                {selectionMode === "fixed" && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check size={14} />
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#351019]">
                Fixed Challenge
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#4b101e]/55">
                Associate the publishing configuration with
                one manually selected challenge.
              </p>
            </button>
          </div>
        </div>

        {/* CHALLENGE SELECTOR */}

        <div className="mt-8 border-t border-black/[0.06] pt-8">
          <label
            htmlFor="activeChallenge"
            className="text-sm font-semibold text-[#351019]"
          >
            Challenge to Publish
          </label>

          <p className="mt-1 text-xs leading-5 text-[#4b101e]/50">
            Only active challenges can be selected.
          </p>

          <select
            id="activeChallenge"
            value={activeChallengeId}
            onChange={(event) =>
              setActiveChallengeId(
                event.target.value,
              )
            }
            className="
              mt-4
              h-13
              w-full
              rounded-xl
              border
              border-black/[0.08]
              bg-[#fcfbf8]
              px-4
              text-sm
              text-[#28151a]
              outline-none
              transition
              focus:border-blue-400
              focus:ring-4
              focus:ring-blue-500/5
            "
          >
            <option value="">
              Select a challenge
            </option>

            {challenges
              .filter(
                (challenge) =>
                  challenge.active,
              )
              .map((challenge) => (
                <option
                  key={challenge._id}
                  value={challenge._id}
                >
                  {challenge.title} —{" "}
                  {challenge.type === "mcq"
                    ? "MCQ"
                    : "Text"}
                </option>
              ))}
          </select>
        </div>

        {/* WEEK KEY */}

        {selectionMode === "weekly" && (
          <div className="mt-6">
            <label
              htmlFor="weekKey"
              className="text-sm font-semibold text-[#351019]"
            >
              Week Key
            </label>

            <p className="mt-1 text-xs leading-5 text-[#4b101e]/50">
              Example: 2026-W38. This identifies the intended
              weekly publishing period.
            </p>

            <input
              id="weekKey"
              type="text"
              value={weekKey}
              onChange={(event) =>
                setWeekKey(event.target.value)
              }
              placeholder="2026-W38"
              className="
                mt-4
                h-13
                w-full
                rounded-xl
                border
                border-black/[0.08]
                bg-[#fcfbf8]
                px-4
                text-sm
                text-[#28151a]
                outline-none
                transition
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-500/5
              "
            />
          </div>
        )}

        {/* SAVE */}

        <div className="mt-8 flex justify-end border-t border-black/[0.06] pt-6">
          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-emerald-500
              px-6
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-[0_8px_20px_rgba(37,99,235,0.18)]
              transition-all
              hover:-translate-y-0.5
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save size={17} />

                Save Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* INFO */}

      <div
        className="
          mt-6
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-blue-100
          bg-blue-50/50
          px-5
          py-4
          text-xs
          leading-5
          text-blue-900/65
        "
      >
        <Sparkles
          size={17}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <p>
          These settings are being kept as the publishing
          configuration layer. The public Weekly Challenge
          selection will be connected to the challenge
          selection architecture separately.
        </p>
      </div>
    </div>
  );
}

export default ChallengeSettings;