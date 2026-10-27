import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  CalendarDays,
  BookOpen,
  Layers3,
  Upload,
  Link2,
  Video,
  Play,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  Target,
  MessageCircle,
  Save,
  RotateCcw,
  Clock3,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Lightbulb,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const API_URL = "http://localhost:5000";
const ALLOWED_SKILLS = [
  "Spoken English",
  "Fluency",
  "Grammar",
  "Vocabulary",
  "Pronunciation",
  "Communication Confidence",
  "Public Speaking",
  "Presentation Skills",
  "Interview Skills",
  "Business English",
  "Listening Skills",
  "Reading Skills",
  "Writing Skills",
  "IELTS Preparation",
  "Other",
];
const ALLOWED_CHALLENGES = [
  "Hesitation while speaking",
  "Fear of making grammatical mistakes",
  "Limited vocabulary",
  "Difficulty forming sentences",
  "Incorrect pronunciation",
  "Difficulty understanding spoken English",
  "Lack of confidence in group discussions",
  "Difficulty speaking spontaneously",
  "Public speaking anxiety",
  "Interview communication",
  "Other",
];
/* ========================================================= HELPERS ========================================================= */
function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "S";
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatDateTime(dateValue) {
  if (!dateValue) return "Not submitted yet";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not submitted yet";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function getStatusLabel(status) {
  if (!status) return "Active";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
function getGoalSelectionLabel(value) {
  if (!value) return "";
  return value.startsWith("Custom: ") ? value.slice("Custom: ".length) : value;
}
function getGoalFormValues(goals) {
  const currentGoals = goals?.currentGoals;
  return {
    targetSkills: currentGoals?.targetSkills || [],
    currentChallenges: currentGoals?.currentChallenges || [],
    additionalNotes: currentGoals?.additionalNotes || "",
  };
}
/* ========================================================= YOUTUBE HELPERS ========================================================= */
function getYouTubeEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let videoId = "";
    if (hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    }
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v") || "";
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/")[2] || "";
      }
      if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/")[2] || "";
      }
    }
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
      return null;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
/* ========================================================= REUSABLE GOAL SELECTION CARD ========================================================= */
function GoalOption({ label, selected, onClick, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex min-h-[58px] w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all duration-200 active:scale-[0.98] ${selected ? "border-[#167A67] bg-[#DDF7F0] shadow-[0_5px_16px_rgba(22,122,103,0.09)]" : "border-[#D6E5E4] bg-white hover:border-[#61D6BD] hover:bg-[#F5FFFC]"}`}
    >
      {" "}
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${selected ? "border-[#167A67] bg-[#167A67] text-white" : "border-[#B8CACB] bg-white text-transparent group-hover:border-[#61D6BD]"}`}
      >
        {" "}
        <Check size={13} strokeWidth={3} />{" "}
      </span>{" "}
      <span className="min-w-0 flex-1">
        {" "}
        <span
          className={`block text-sm font-black leading-5 ${selected ? "text-[#102B4E]" : "text-[#102B4E]/75"}`}
        >
          {" "}
          {label}{" "}
        </span>{" "}
        {description && (
          <span className="mt-0.5 block text-xs font-bold text-[#102B4E]/40">
            {" "}
            {description}{" "}
          </span>
        )}{" "}
      </span>{" "}
    </button>
  );
}
/* ========================================================= REUSABLE SAVED GOALS DISPLAY ========================================================= */
function GoalList({ items = [], emptyText }) {
  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed border-[#C7DAD8] bg-white/70 px-4 py-4 text-sm font-bold text-[#102B4E]/40">
        {" "}
        {emptyText}{" "}
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {" "}
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#8FD6C7] bg-white px-3.5 py-2.5 text-sm font-black text-[#167A67] shadow-sm"
        >
          {" "}
          <CheckCircle2 size={15} className="shrink-0" />{" "}
          <span className="break-words">
            {" "}
            {getGoalSelectionLabel(item)}{" "}
          </span>{" "}
        </span>
      ))}{" "}
    </div>
  );
}
/* ========================================================= COMPONENT ========================================================= */
/* ========================================================= LEARNING GOALS UPDATE HISTORY ========================================================= */

function GoalUpdateHistory({ history = [] }) {
  const [expanded, setExpanded] = useState(false);

  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();

    return dateB - dateA;
  });

  if (!sortedHistory.length) {
    return null;
  }

  return (
    <section className="mt-7 overflow-hidden rounded-[24px] border-2 border-[#8FD6C7] bg-gradient-to-br from-white via-[#F6FFFC] to-[#E8FAF5]">
      <button
        type="button"
        onClick={() => setExpanded((previous) => !previous)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-[#E8FAF5]/70 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#8FD6C7] bg-white text-[#167A67]">
            <Clock3 size={21} />
          </div>

          <div>
            <p className="text-base font-black text-[#102B4E]">
              Learning Goals Update History
            </p>

            <p className="mt-1 text-sm font-bold text-[#102B4E]/50">
              {sortedHistory.length} previous{" "}
              {sortedHistory.length === 1 ? "update" : "updates"} recorded
            </p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp size={22} className="shrink-0 text-[#167A67]" />
        ) : (
          <ChevronDown size={22} className="shrink-0 text-[#167A67]" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t-2 border-[#BDE7DD] p-5 sm:p-6">
              {sortedHistory.map((entry, index) => (
                <article
                  key={entry._id || entry.id || `${entry.updatedAt}-${index}`}
                  className="rounded-2xl border-2 border-[#D5E9E5] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8FAF5] text-sm font-black text-[#167A67]">
                        {sortedHistory.length - index}
                      </span>

                      <h4 className="text-base font-black text-[#102B4E]">
                        Goals Update
                      </h4>
                    </div>

                    <p className="flex items-center gap-2 text-xs font-bold text-[#102B4E]/50">
                      <CalendarDays size={15} />

                      {formatDateTime(entry.updatedAt || entry.createdAt)}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#167A67]">
                      Skills selected
                    </p>

                    <GoalList
                      items={entry.targetSkills || []}
                      emptyText="No skills recorded for this update."
                    />
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#315779]">
                      Challenges recorded
                    </p>

                    <GoalList
                      items={entry.currentChallenges || []}
                      emptyText="No challenges recorded for this update."
                    />
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#6E4CA5]">
                      Additional notes
                    </p>

                    <p className="whitespace-pre-wrap break-words rounded-xl border border-[#D5C9F2] bg-[#FCFAFF] p-4 text-sm font-bold leading-6 text-[#102B4E]/70">
                      {entry.additionalNotes?.trim() ||
                        "No additional notes were provided."}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
export default function StudentProfile() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoMode, setVideoMode] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  /* ========================================================= LEARNING GOALS STATE ========================================================= */
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [savingGoals, setSavingGoals] = useState(false);
  const [learningGoals, setLearningGoals] = useState(null);
  const [targetSkills, setTargetSkills] = useState([]);
  const [currentChallenges, setCurrentChallenges] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [customChallenge, setCustomChallenge] = useState("");
  const [goalsError, setGoalsError] = useState("");
  const [goalsSuccess, setGoalsSuccess] = useState("");
  const [showGoalHistory, setShowGoalHistory] = useState(false);
  /* ========================================================= SHARED AUTHENTICATION HELPER ========================================================= */
  const getStudentToken = () => {
    return localStorage.getItem("studentToken");
  };
  /* ========================================================= LOAD STUDENT ========================================================= */
  const loadStudent = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getStudentToken();
      if (!token) {
        navigate("/student/login", { replace: true });
        return;
      }
      const response = await fetch(`${API_URL}/api/auth/student/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentData");
        navigate("/student/login", { replace: true });
        return;
      }
      const data = await response.json();
      if (!response.ok || !data?.student) {
        throw new Error(data?.message || "Unable to load profile.");
      }
      setStudent(data.student);
      localStorage.setItem("studentData", JSON.stringify(data.student));
    } catch (err) {
      console.error("Student profile loading error:", err);
      setError(err?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };
  /* ========================================================= LOAD LEARNING GOALS ========================================================= */
  const loadLearningGoals = async () => {
    try {
      setGoalsLoading(true);
      setGoalsError("");
      const token = getStudentToken();
      if (!token) {
        setGoalsLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/api/student-learning-goals/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentData");
        navigate("/student/login", { replace: true });
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to load your learning goals.");
      }
      const goals = data?.goals || null;
      setLearningGoals(goals);
      const formValues = getGoalFormValues(goals);
      setTargetSkills(formValues.targetSkills);
      setCurrentChallenges(formValues.currentChallenges);
      setAdditionalNotes(formValues.additionalNotes);
    } catch (err) {
      console.error("Learning goals loading error:", err);
      setGoalsError(err?.message || "Unable to load your learning goals.");
    } finally {
      setGoalsLoading(false);
    }
  };
  useEffect(() => {
    loadStudent();
    loadLearningGoals();
  }, []);
  /* ========================================================= CLEAR FEEDBACK ========================================================= */
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [success]);
  useEffect(() => {
    if (!goalsSuccess) return;
    const timer = setTimeout(() => {
      setGoalsSuccess("");
    }, 3500);
    return () => clearTimeout(timer);
  }, [goalsSuccess]);
  /* ========================================================= PROFILE IMAGE ========================================================= */
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Profile picture must be smaller than 10 MB.");
      return;
    }
    try {
      setUploadingImage(true);
      setError("");
      setSuccess("");
      const token = getStudentToken();
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(
        `${API_URL}/api/auth/student/profile-image`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to update profile picture.");
      }
      const updatedStudent = { ...student, profileImage: data.imageUrl };
      setStudent(updatedStudent);
      localStorage.setItem("studentData", JSON.stringify(updatedStudent));
      setSuccess("Profile picture updated.");
    } catch (err) {
      console.error("Profile image upload error:", err);
      setError(err?.message || "Unable to update profile picture.");
    } finally {
      setUploadingImage(false);
    }
  };
  /* ========================================================= VIDEO FILE ========================================================= */
  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload an MP4, WebM, MOV, or AVI video.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("Your video must be smaller than 100 MB.");
      return;
    }
    try {
      setUploadingVideo(true);
      setError("");
      setSuccess("");
      const token = getStudentToken();
      const formData = new FormData();
      formData.append("video", file);
      const response = await fetch(
        `${API_URL}/api/auth/student/starting-point-video`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to upload starting-point video.",
        );
      }
      const updatedStudent = {
        ...student,
        startingPointVideo: data.videoUrl,
        startingPointVideoType: "upload",
      };
      setStudent(updatedStudent);
      localStorage.setItem("studentData", JSON.stringify(updatedStudent));
      setVideoMode(null);
      setSuccess("Your starting-point video has been saved.");
    } catch (err) {
      console.error("Starting-point video upload error:", err);
      setError(err?.message || "Unable to upload starting-point video.");
    } finally {
      setUploadingVideo(false);
    }
  };
  /* ========================================================= VIDEO LINK ========================================================= */
  const handleSaveVideoLink = async () => {
    const cleanUrl = videoLink.trim();
    if (!cleanUrl) {
      setError("Please enter your video link.");
      return;
    }
    const youtubeUrl = getYouTubeEmbedUrl(cleanUrl);
    if (!youtubeUrl) {
      setError("Please enter a valid YouTube or YouTube Shorts link.");
      return;
    }
    try {
      setUploadingVideo(true);
      setError("");
      setSuccess("");
      const token = getStudentToken();
      const response = await fetch(
        `${API_URL}/api/auth/student/starting-point-video-link`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoUrl: cleanUrl }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to save video link.");
      }
      const updatedStudent = {
        ...student,
        startingPointVideo: data.videoUrl,
        startingPointVideoType: "embed",
      };
      setStudent(updatedStudent);
      localStorage.setItem("studentData", JSON.stringify(updatedStudent));
      setVideoLink("");
      setVideoMode(null);
      setSuccess("Your starting-point video has been saved.");
    } catch (err) {
      console.error("Starting-point video link error:", err);
      setError(err?.message || "Unable to save video link.");
    } finally {
      setUploadingVideo(false);
    }
  };
  /* ========================================================= LEARNING GOALS: SKILL SELECTION ========================================================= */
  const toggleSkill = (skill) => {
    setGoalsError("");
    setGoalsSuccess("");
    setTargetSkills((previous) => {
      if (previous.includes(skill)) {
        return previous.filter((item) => item !== skill);
      }
      if (previous.length >= 20) {
        setGoalsError("You can select up to 20 skills.");
        return previous;
      }
      return [...previous, skill];
    });
  };
  /* ========================================================= LEARNING GOALS: CHALLENGE SELECTION ========================================================= */
  const toggleChallenge = (challenge) => {
    setGoalsError("");
    setGoalsSuccess("");
    setCurrentChallenges((previous) => {
      if (previous.includes(challenge)) {
        return previous.filter((item) => item !== challenge);
      }
      if (previous.length >= 20) {
        setGoalsError("You can select up to 20 challenges.");
        return previous;
      }
      return [...previous, challenge];
    });
  };
  /* ========================================================= LEARNING GOALS: CUSTOM SKILL ========================================================= */
  const handleAddCustomSkill = () => {
    const value = customSkill.trim();
    if (!value) {
      setGoalsError("Please enter a custom skill.");
      return;
    }
    if (value.length > 90) {
      setGoalsError("Custom skill must be 90 characters or fewer.");
      return;
    }
    const formattedValue = `Custom: ${value}`;
    const alreadyExists = targetSkills.some(
      (item) => item.toLowerCase() === formattedValue.toLowerCase(),
    );
    if (alreadyExists) {
      setGoalsError("This skill has already been added.");
      return;
    }
    if (targetSkills.length >= 20) {
      setGoalsError("You can select up to 20 skills.");
      return;
    }
    setTargetSkills((previous) => [...previous, formattedValue]);
    setCustomSkill("");
    setGoalsError("");
    setGoalsSuccess("");
  };
  /* ========================================================= LEARNING GOALS: CUSTOM CHALLENGE ========================================================= */
  const handleAddCustomChallenge = () => {
    const value = customChallenge.trim();
    if (!value) {
      setGoalsError("Please describe your challenge.");
      return;
    }
    if (value.length > 140) {
      setGoalsError("Custom challenge must be 140 characters or fewer.");
      return;
    }
    const formattedValue = `Custom: ${value}`;
    const alreadyExists = currentChallenges.some(
      (item) => item.toLowerCase() === formattedValue.toLowerCase(),
    );
    if (alreadyExists) {
      setGoalsError("This challenge has already been added.");
      return;
    }
    if (currentChallenges.length >= 20) {
      setGoalsError("You can select up to 20 challenges.");
      return;
    }
    setCurrentChallenges((previous) => [...previous, formattedValue]);
    setCustomChallenge("");
    setGoalsError("");
    setGoalsSuccess("");
  };
  /* ========================================================= LEARNING GOALS: SAVE ========================================================= */
  const handleSaveLearningGoals = async (event) => {
    event.preventDefault();
    if (savingGoals) return;
    if (!targetSkills.length) {
      setGoalsError("Please select at least one skill you want to improve.");
      return;
    }
    if (!currentChallenges.length) {
      setGoalsError("Please select at least one challenge you currently face.");
      return;
    }
    if (additionalNotes.length > 1000) {
      setGoalsError("Additional notes cannot exceed 1,000 characters.");
      return;
    }
    try {
      setSavingGoals(true);
      setGoalsError("");
      setGoalsSuccess("");
      setError("");
      const token = getStudentToken();
      if (!token) {
        navigate("/student/login", { replace: true });
        return;
      }
      const response = await fetch(`${API_URL}/api/student-learning-goals/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetSkills,
          currentChallenges,
          additionalNotes: additionalNotes.trim(),
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentData");
        navigate("/student/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(data?.message || "Unable to save learning goals.");
      }
      /* Use the server response as the source of truth. This preserves the original initial assessment. */
      const savedGoals = data?.goals;

      if (savedGoals) {
        setLearningGoals(savedGoals);

        const formValues = getGoalFormValues(savedGoals);

        setTargetSkills(formValues.targetSkills);
        setCurrentChallenges(formValues.currentChallenges);
        setAdditionalNotes(formValues.additionalNotes);
      }

      /*
       * Reload the saved goals so the latest history returned by
       * the backend appears immediately after the update.
       */
      await loadLearningGoals();

      setGoalsSuccess(
        learningGoals?.initialAssessment?.submittedAt
          ? "Your learning goals have been updated successfully."
          : "Your initial learning goals have been saved successfully.",
      );
      setCustomSkill("");
      setCustomChallenge("");
    } catch (err) {
      console.error("Save learning goals error:", err);
      setGoalsError(err?.message || "Unable to save your learning goals.");
    } finally {
      setSavingGoals(false);
    }
  };
  /* ========================================================= LEARNING GOALS: RESET FORM TO LAST SAVED VALUES ========================================================= */
  const handleResetGoals = () => {
    const formValues = getGoalFormValues(learningGoals);
    setTargetSkills(formValues.targetSkills);
    setCurrentChallenges(formValues.currentChallenges);
    setAdditionalNotes(formValues.additionalNotes);
    setCustomSkill("");
    setCustomChallenge("");
    setGoalsError("");
    setGoalsSuccess("");
  };
  /* ========================================================= LOADING ========================================================= */ if (
    loading
  ) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#EAF2F0] px-4 py-8 sm:px-6 lg:px-10">
        {" "}
        <div className="mx-auto flex min-h-[70vh] max-w-[1450px] items-center justify-center">
          {" "}
          <div className="text-center">
            {" "}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#61D6BD]/40 bg-[#102B4E] shadow-[0_0_35px_rgba(97,214,189,0.18)]">
              {" "}
              <Loader2 size={28} className="animate-spin text-[#61D6BD]" />{" "}
            </div>{" "}
            <p className="mt-5 text-base font-black text-[#102B4E]">
              {" "}
              Loading your profile...{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </main>
    );
  }
  if (!student) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#EAF2F0] px-4 py-8">
        {" "}
        <div className="mx-auto max-w-[700px] pt-20">
          {" "}
          <div className="rounded-[30px] border-2 border-red-200 bg-gradient-to-br from-white to-red-50 p-10 text-center shadow-xl shadow-red-900/5">
            {" "}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-500 shadow-inner">
              {" "}
              <AlertCircle size={34} />{" "}
            </div>{" "}
            <h2 className="mt-5 text-2xl font-black text-[#102B4E]">
              {" "}
              Profile unavailable{" "}
            </h2>{" "}
            {error && (
              <p className="mt-3 text-sm font-bold text-red-600"> {error} </p>
            )}{" "}
            <button
              onClick={loadStudent}
              className="mt-7 rounded-xl border-2 border-[#102B4E] bg-[#102B4E] px-7 py-3.5 text-sm font-black text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-[#193C67] active:translate-y-0 active:scale-[0.97]"
            >
              {" "}
              Try again{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </main>
    );
  }
  const initials = getInitials(student.name);
  const hasStartingVideo = Boolean(student.startingPointVideo);
  const embedUrl =
    student.startingPointVideoType === "embed"
      ? getYouTubeEmbedUrl(student.startingPointVideo)
      : null;
  const hasSavedGoals = Boolean(learningGoals?.initialAssessment?.submittedAt);
  /* ========================================================= MAIN UI ========================================================= */ return (
    <>
      {" "}
      <main className="min-h-[calc(100vh-80px)] bg-[#EAF2F0] px-4 py-7 sm:px-6 lg:px-10 xl:px-12">
        {" "}
        <div className="mx-auto w-full max-w-[1450px]">
          {" "}
          {/* ================================================= PAGE HEADING ================================================= */}{" "}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7"
          >
            {" "}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              {" "}
              <div>
                {" "}
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border-2 border-[#61D6BD]/30 bg-[#F5FFFC] px-3.5 py-1.5 shadow-sm">
                  {" "}
                  <span className="h-2.5 w-2.5 rounded-full bg-[#61D6BD] shadow-[0_0_10px_rgba(97,214,189,0.7)]" />{" "}
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#167A67]">
                    {" "}
                    Student space{" "}
                  </span>{" "}
                </div>{" "}
                <h1 className="text-4xl font-black tracking-[-0.05em] text-[#102B4E] sm:text-5xl">
                  {" "}
                  My Profile{" "}
                </h1>{" "}
                <p className="mt-2 text-base font-bold text-[#102B4E]/55">
                  {" "}
                  Everything about your learning journey, in one place.{" "}
                </p>{" "}
              </div>{" "}
              <div className="hidden rounded-2xl border-2 border-[#61D6BD]/25 bg-gradient-to-br from-white to-[#E8FBF6] px-5 py-3 shadow-[0_8px_25px_rgba(22,122,103,0.07)] sm:block">
                {" "}
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#102B4E]/40">
                  {" "}
                  Profile status{" "}
                </p>{" "}
                <div className="mt-1.5 flex items-center gap-2">
                  {" "}
                  <span className="h-2.5 w-2.5 rounded-full bg-[#61D6BD] shadow-[0_0_9px_rgba(97,214,189,0.8)]" />{" "}
                  <span className="text-sm font-black text-[#102B4E]">
                    {" "}
                    {getStatusLabel(student.enrollmentStatus)}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>{" "}
          {/* ================================================= PROFILE HERO ================================================= */}{" "}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[32px] border-2 border-[#102B4E] bg-[#102B4E] shadow-[0_25px_65px_rgba(16,43,78,0.2)]"
          >
            {" "}
            <div className="pointer-events-none absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-[#315779] opacity-70 blur-3xl" />{" "}
            <div className="pointer-events-none absolute -bottom-48 left-[30%] h-[450px] w-[450px] rounded-full bg-[#61D6BD]/20 blur-3xl" />{" "}
            <div className="pointer-events-none absolute right-[30%] top-1/2 h-40 w-40 rounded-full bg-[#61D6BD]/10 blur-3xl" />{" "}
            <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-11">
              {" "}
              {/* Identity */}{" "}
              <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:text-left">
                {" "}
                <div className="relative shrink-0">
                  {" "}
                  <motion.div
                    whileHover={{
                      scale: 1.025,
                      boxShadow: "0 0 40px rgba(97,214,189,0.18)",
                    }}
                    className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[30px] border-[5px] border-[#61D6BD]/30 bg-gradient-to-br from-[#315779] to-[#173858] shadow-2xl sm:h-40 sm:w-40"
                  >
                    {" "}
                    {student.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-black text-[#61D6BD]">
                        {" "}
                        {initials}{" "}
                      </span>
                    )}{" "}
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#102B4E]/85">
                        {" "}
                        <Loader2
                          size={32}
                          className="animate-spin text-white"
                        />{" "}
                      </div>
                    )}{" "}
                  </motion.div>{" "}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-[#102B4E] bg-[#61D6BD] text-[#102B4E] shadow-[0_8px_25px_rgba(97,214,189,0.3)] transition-all duration-200 hover:scale-110 hover:bg-[#7AE4CC] active:scale-95 disabled:opacity-60"
                    title="Change profile photo"
                  >
                    {" "}
                    <Camera size={20} strokeWidth={2.8} />{" "}
                  </button>{" "}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />{" "}
                </div>{" "}
                <div className="min-w-0">
                  {" "}
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    {" "}
                    <span className="h-2.5 w-2.5 rounded-full bg-[#61D6BD] shadow-[0_0_14px_rgba(97,214,189,0.9)]" />{" "}
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-[#61D6BD]">
                      {" "}
                      {getStatusLabel(student.enrollmentStatus)}{" "}
                    </span>{" "}
                  </div>{" "}
                  <h2 className="mt-2 break-words text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                    {" "}
                    {student.name}{" "}
                  </h2>{" "}
                  <p className="mt-2 text-base font-bold text-white/45">
                    {" "}
                    @{student.username}{" "}
                  </p>{" "}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-black text-white/70 transition-all duration-200 hover:border-[#61D6BD]/50 hover:bg-[#61D6BD]/10 hover:text-[#61D6BD] active:scale-95"
                  >
                    {" "}
                    <Camera size={15} />{" "}
                    {student.profileImage
                      ? "Change profile photo"
                      : "Add your photo"}{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              {/* Journey statement */}{" "}
              <div className="relative overflow-hidden rounded-[24px] border border-[#61D6BD]/20 bg-gradient-to-br from-[#1A3A5D] to-[#102B4E] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.15)] lg:max-w-[390px]">
                {" "}
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#61D6BD]/10 blur-2xl" />{" "}
                <div className="relative">
                  {" "}
                  <div className="flex items-center gap-2 text-[#61D6BD]">
                    {" "}
                    <Sparkles size={18} />{" "}
                    <span className="text-xs font-black uppercase tracking-[0.17em]">
                      {" "}
                      Your journey{" "}
                    </span>{" "}
                  </div>{" "}
                  <p className="mt-3 text-sm font-bold leading-6 text-white/65">
                    {" "}
                    Every confident speaker starts somewhere. This space
                    captures where you began and how far you grow.{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </motion.section>{" "}
          {/* ================================================= GENERAL FEEDBACK ================================================= */}{" "}
          <AnimatePresence>
            {" "}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-white px-5 py-4 text-sm font-black text-red-600 shadow-[0_8px_25px_rgba(220,38,38,0.06)]"
              >
                {" "}
                <AlertCircle size={19} className="shrink-0" />{" "}
                <span>{error}</span>{" "}
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-auto rounded-lg p-1 transition hover:bg-red-100 active:scale-90"
                  aria-label="Dismiss error"
                >
                  {" "}
                  <X size={17} />{" "}
                </button>{" "}
              </motion.div>
            )}{" "}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-[#61D6BD]/35 bg-gradient-to-r from-[#E5FAF5] to-white px-5 py-4 text-sm font-black text-[#167A67] shadow-[0_8px_25px_rgba(22,122,103,0.07)]"
              >
                {" "}
                <CheckCircle2 size={19} /> <span>{success}</span>{" "}
              </motion.div>
            )}{" "}
          </AnimatePresence>{" "}
          {/* ================================================= LEARNING SNAPSHOT ================================================= */}{" "}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            {" "}
            <div className="mb-4">
              {" "}
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#167A67]">
                {" "}
                Your journey{" "}
              </p>{" "}
              <h3 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#102B4E]">
                {" "}
                Learning snapshot{" "}
              </h3>{" "}
            </div>{" "}
            <div className="grid gap-4 md:grid-cols-3">
              {" "}
              {/* Batch */}{" "}
              <motion.div
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.985 }}
                className="group relative overflow-hidden rounded-[26px] border-2 border-[#B9D5EE] bg-gradient-to-br from-[#F8FCFF] via-[#EDF6FF] to-[#E3F0FF] p-6 shadow-[0_8px_25px_rgba(49,87,121,0.07)] transition-all duration-300 hover:border-[#4D91C9] hover:shadow-[0_18px_40px_rgba(49,87,121,0.16)]"
              >
                {" "}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#79B7E8]/20 blur-2xl" />{" "}
                <div className="relative">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#9EC7E9] bg-[#DCEEFF] text-[#315779] shadow-sm transition-all group-hover:border-[#315779] group-hover:bg-[#315779] group-hover:text-white">
                      {" "}
                      <Layers3 size={24} />{" "}
                    </div>{" "}
                    <ArrowUpRight
                      size={20}
                      className="text-[#315779]/50"
                    />{" "}
                  </div>{" "}
                  <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#315779]/60">
                    {" "}
                    Batch{" "}
                  </p>{" "}
                  <p className="mt-2 break-words text-xl font-black text-[#102B4E]">
                    {" "}
                    {student.batch || "Not assigned"}{" "}
                  </p>{" "}
                </div>{" "}
              </motion.div>{" "}
              {/* Joining date */}{" "}
              <motion.div
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.985 }}
                className="group relative overflow-hidden rounded-[26px] border-2 border-[#BDE7DD] bg-gradient-to-br from-[#F8FFFD] via-[#ECFBF7] to-[#DDF7F0] p-6 shadow-[0_8px_25px_rgba(22,122,103,0.07)] transition-all duration-300 hover:border-[#61D6BD] hover:shadow-[0_18px_40px_rgba(22,122,103,0.16)]"
              >
                {" "}
                <div className="relative">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#9ADFD0] bg-[#D8F6EF] text-[#167A67] shadow-sm transition-all group-hover:border-[#167A67] group-hover:bg-[#61D6BD] group-hover:text-[#102B4E]">
                      {" "}
                      <CalendarDays size={24} />{" "}
                    </div>{" "}
                    <ArrowUpRight
                      size={20}
                      className="text-[#167A67]/50"
                    />{" "}
                  </div>{" "}
                  <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#167A67]/60">
                    {" "}
                    Joined{" "}
                  </p>{" "}
                  <p className="mt-2 text-xl font-black text-[#102B4E]">
                    {" "}
                    {formatDate(student.joiningDate)}{" "}
                  </p>{" "}
                </div>{" "}
              </motion.div>{" "}
              {/* Course plan */}{" "}
              <motion.div
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.985 }}
                className="group relative overflow-hidden rounded-[26px] border-2 border-[#D5C9F2] bg-gradient-to-br from-[#FCFAFF] via-[#F4F0FF] to-[#EBE4FF] p-6 shadow-[0_8px_25px_rgba(103,74,156,0.07)] transition-all duration-300 hover:border-[#9A7ED0] hover:shadow-[0_18px_40px_rgba(103,74,156,0.16)]"
              >
                {" "}
                <div className="relative">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#C6B5EA] bg-[#E9E0FC] text-[#6E4CA5] shadow-sm transition-all group-hover:border-[#6E4CA5] group-hover:bg-[#8B6DC2] group-hover:text-white">
                      {" "}
                      <BookOpen size={24} />{" "}
                    </div>{" "}
                    <ArrowUpRight
                      size={20}
                      className="text-[#6E4CA5]/50"
                    />{" "}
                  </div>{" "}
                  <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#6E4CA5]/60">
                    {" "}
                    Course plan{" "}
                  </p>{" "}
                  <p className="mt-2 text-xl font-black text-[#102B4E]">
                    {" "}
                    {student.durationMonths
                      ? `${student.durationMonths} months`
                      : "—"}{" "}
                  </p>{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>{" "}
          </motion.section>{" "}
          {/* ================================================= MY LEARNING GOALS ================================================= */}{" "}
          <motion.section
            id="learning-goals"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mt-9 overflow-hidden rounded-[30px] border-2 border-[#8FD6C7] bg-gradient-to-br from-white via-[#F6FFFC] to-[#E8FAF5] shadow-[0_15px_40px_rgba(22,122,103,0.09)]"
          >
            {" "}
            {/* Header */}{" "}
            <div className="border-b-2 border-[#BDE7DD] bg-gradient-to-r from-[#E1F8F1] via-[#F5FFFC] to-[#E6F5FF] px-5 py-7 sm:px-8 lg:px-10">
              {" "}
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                {" "}
                <div className="flex items-start gap-4">
                  {" "}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#8FD6C7] bg-white text-[#167A67] shadow-sm">
                    {" "}
                    <Target size={26} strokeWidth={2.5} />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <div className="flex flex-wrap items-center gap-2">
                      {" "}
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#167A67]">
                        {" "}
                        Your personal roadmap{" "}
                      </p>{" "}
                      {hasSavedGoals && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#8FD6C7] bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#167A67]">
                          {" "}
                          <CheckCircle2 size={12} /> Saved{" "}
                        </span>
                      )}{" "}
                    </div>{" "}
                    <h3 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#102B4E] sm:text-3xl">
                      {" "}
                      My Learning Goals{" "}
                    </h3>{" "}
                    <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#102B4E]/55">
                      {" "}
                      Tell us what you want to improve and the challenges you
                      face. Your responses help you and your mentor understand
                      your learning journey.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex shrink-0 items-center gap-2 rounded-xl border-2 border-[#BDE7DD] bg-white px-4 py-3 text-xs font-black text-[#167A67] shadow-sm">
                  {" "}
                  <Lightbulb size={17} />{" "}
                  <span>
                    {" "}
                    {hasSavedGoals
                      ? "Keep growing"
                      : "Start with your goals"}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="p-5 sm:p-7 lg:p-10">
              {" "}
              {/* Loading state */}{" "}
              {goalsLoading ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  {" "}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#61D6BD]/30 bg-[#102B4E]">
                    {" "}
                    <Loader2
                      size={25}
                      className="animate-spin text-[#61D6BD]"
                    />{" "}
                  </div>{" "}
                  <p className="mt-4 text-sm font-black text-[#102B4E]">
                    {" "}
                    Loading your learning goals...{" "}
                  </p>{" "}
                </div>
              ) : (
                <>
                  {" "}
                  {/* Goal feedback */}{" "}
                  <AnimatePresence>
                    {" "}
                    {goalsError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mb-5 flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-4 text-sm font-bold text-red-700"
                      >
                        {" "}
                        <AlertCircle
                          size={19}
                          className="mt-0.5 shrink-0"
                        />{" "}
                        <span className="flex-1">{goalsError}</span>{" "}
                        <button
                          type="button"
                          onClick={() => setGoalsError("")}
                          aria-label="Dismiss learning goals error"
                        >
                          {" "}
                          <X size={17} />{" "}
                        </button>{" "}
                      </motion.div>
                    )}{" "}
                    {goalsSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mb-5 flex items-start gap-3 rounded-2xl border-2 border-[#8FD6C7] bg-[#E8FAF5] px-4 py-4 text-sm font-black text-[#167A67]"
                      >
                        {" "}
                        <CheckCircle2
                          size={19}
                          className="mt-0.5 shrink-0"
                        />{" "}
                        <span>{goalsSuccess}</span>{" "}
                      </motion.div>
                    )}{" "}
                  </AnimatePresence>{" "}
                  {/* Form */}{" "}
                  <form onSubmit={handleSaveLearningGoals}>
                    {" "}
                    {/* Skills */}{" "}
                    <div className="rounded-[24px] border-2 border-[#D5E9E5] bg-white p-5 shadow-sm sm:p-7">
                      {" "}
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        {" "}
                        <div className="flex items-start gap-3">
                          {" "}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#BDE7DD] bg-[#E8FAF5] text-[#167A67]">
                            {" "}
                            <Target size={21} />{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <h4 className="text-lg font-black text-[#102B4E] sm:text-xl">
                              {" "}
                              Skills I Want to Improve{" "}
                            </h4>{" "}
                            <p className="mt-1 text-sm font-bold leading-5 text-[#102B4E]/45">
                              {" "}
                              Select the skills you want to work on.{" "}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                        <span className="w-fit rounded-full border border-[#BDE7DD] bg-[#F2FCF8] px-3 py-1.5 text-xs font-black text-[#167A67]">
                          {" "}
                          {targetSkills.length}/20 selected{" "}
                        </span>{" "}
                      </div>{" "}
                      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {" "}
                        {ALLOWED_SKILLS.map((skill) => (
                          <GoalOption
                            key={skill}
                            label={skill}
                            selected={targetSkills.includes(skill)}
                            onClick={() => toggleSkill(skill)}
                          />
                        ))}{" "}
                      </div>{" "}
                      {/* Custom skill input */}{" "}
                      <div className="mt-6 rounded-2xl border-2 border-dashed border-[#BDE7DD] bg-[#F7FCFA] p-4 sm:p-5">
                        {" "}
                        <label
                          htmlFor="custom-learning-skill"
                          className="block text-sm font-black text-[#102B4E]"
                        >
                          {" "}
                          Have another skill in mind?{" "}
                        </label>{" "}
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                          {" "}
                          <input
                            id="custom-learning-skill"
                            type="text"
                            value={customSkill}
                            onChange={(event) =>
                              setCustomSkill(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAddCustomSkill();
                              }
                            }}
                            maxLength={90}
                            placeholder="e.g. Debate skills"
                            className="min-w-0 flex-1 rounded-xl border-2 border-[#D5E5E2] bg-white px-4 py-3.5 text-sm font-bold text-[#102B4E] outline-none transition placeholder:text-[#102B4E]/30 focus:border-[#61D6BD] focus:ring-4 focus:ring-[#61D6BD]/10"
                          />{" "}
                          <button
                            type="button"
                            onClick={handleAddCustomSkill}
                            disabled={!customSkill.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#167A67] bg-[#167A67] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#105C4F] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {" "}
                            <Plus size={17} /> Add skill{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Selected custom skills */}{" "}
                      {targetSkills.some((skill) =>
                        skill.startsWith("Custom: "),
                      ) && (
                        <div className="mt-5">
                          {" "}
                          <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#167A67]">
                            {" "}
                            Your additional skills{" "}
                          </p>{" "}
                          <div className="flex flex-wrap gap-2">
                            {" "}
                            {targetSkills
                              .filter((skill) => skill.startsWith("Custom: "))
                              .map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => toggleSkill(skill)}
                                  className="inline-flex max-w-full items-center gap-2 rounded-xl border-2 border-[#8FD6C7] bg-[#E8FAF5] px-3 py-2.5 text-sm font-black text-[#167A67] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                  title="Remove custom skill"
                                >
                                  {" "}
                                  <span className="break-words">
                                    {" "}
                                    {getGoalSelectionLabel(skill)}{" "}
                                  </span>{" "}
                                  <X size={15} className="shrink-0" />{" "}
                                </button>
                              ))}{" "}
                          </div>{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                    {/* Challenges */}{" "}
                    <div className="mt-6 rounded-[24px] border-2 border-[#D5E9E5] bg-white p-5 shadow-sm sm:p-7">
                      {" "}
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        {" "}
                        <div className="flex items-start gap-3">
                          {" "}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B9D5EE] bg-[#EDF6FF] text-[#315779]">
                            {" "}
                            <MessageCircle size={21} />{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <h4 className="text-lg font-black text-[#102B4E] sm:text-xl">
                              {" "}
                              My Current Challenges{" "}
                            </h4>{" "}
                            <p className="mt-1 text-sm font-bold leading-5 text-[#102B4E]/45">
                              {" "}
                              Choose the difficulties you experience.{" "}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                        <span className="w-fit rounded-full border border-[#B9D5EE] bg-[#F3F8FF] px-3 py-1.5 text-xs font-black text-[#315779]">
                          {" "}
                          {currentChallenges.length}/20 selected{" "}
                        </span>{" "}
                      </div>{" "}
                      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {" "}
                        {ALLOWED_CHALLENGES.map((challenge) => (
                          <GoalOption
                            key={challenge}
                            label={challenge}
                            selected={currentChallenges.includes(challenge)}
                            onClick={() => toggleChallenge(challenge)}
                          />
                        ))}{" "}
                      </div>{" "}
                      {/* Custom challenge */}{" "}
                      <div className="mt-6 rounded-2xl border-2 border-dashed border-[#B9D5EE] bg-[#F7FAFF] p-4 sm:p-5">
                        {" "}
                        <label
                          htmlFor="custom-learning-challenge"
                          className="block text-sm font-black text-[#102B4E]"
                        >
                          {" "}
                          Facing another challenge?{" "}
                        </label>{" "}
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                          {" "}
                          <input
                            id="custom-learning-challenge"
                            type="text"
                            value={customChallenge}
                            onChange={(event) =>
                              setCustomChallenge(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAddCustomChallenge();
                              }
                            }}
                            maxLength={140}
                            placeholder="Describe your challenge"
                            className="min-w-0 flex-1 rounded-xl border-2 border-[#D5E5F2] bg-white px-4 py-3.5 text-sm font-bold text-[#102B4E] outline-none transition placeholder:text-[#102B4E]/30 focus:border-[#61D6BD] focus:ring-4 focus:ring-[#61D6BD]/10"
                          />{" "}
                          <button
                            type="button"
                            onClick={handleAddCustomChallenge}
                            disabled={!customChallenge.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#315779] bg-[#315779] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#244361] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {" "}
                            <Plus size={17} /> Add challenge{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Selected custom challenges */}{" "}
                      {currentChallenges.some((challenge) =>
                        challenge.startsWith("Custom: "),
                      ) && (
                        <div className="mt-5">
                          {" "}
                          <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#315779]">
                            {" "}
                            Your additional challenges{" "}
                          </p>{" "}
                          <div className="flex flex-wrap gap-2">
                            {" "}
                            {currentChallenges
                              .filter((challenge) =>
                                challenge.startsWith("Custom: "),
                              )
                              .map((challenge) => (
                                <button
                                  key={challenge}
                                  type="button"
                                  onClick={() => toggleChallenge(challenge)}
                                  className="inline-flex max-w-full items-center gap-2 rounded-xl border-2 border-[#B9D5EE] bg-[#EDF6FF] px-3 py-2.5 text-sm font-black text-[#315779] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                  title="Remove custom challenge"
                                >
                                  {" "}
                                  <span className="break-words">
                                    {" "}
                                    {getGoalSelectionLabel(challenge)}{" "}
                                  </span>{" "}
                                  <X size={15} className="shrink-0" />{" "}
                                </button>
                              ))}{" "}
                          </div>{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                    {/* Additional notes */}{" "}
                    <div className="mt-6 rounded-[24px] border-2 border-[#D5E9E5] bg-white p-5 shadow-sm sm:p-7">
                      {" "}
                      <div className="flex items-start gap-3">
                        {" "}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D5C9F2] bg-[#F4F0FF] text-[#6E4CA5]">
                          {" "}
                          <BookOpen size={21} />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <h4 className="text-lg font-black text-[#102B4E] sm:text-xl">
                            {" "}
                            Additional Notes{" "}
                          </h4>{" "}
                          <p className="mt-1 text-sm font-bold leading-5 text-[#102B4E]/45">
                            {" "}
                            Share anything else you want your mentor to
                            know.{" "}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                      <textarea
                        value={additionalNotes}
                        onChange={(event) => {
                          setAdditionalNotes(event.target.value);
                          setGoalsError("");
                          setGoalsSuccess("");
                        }}
                        maxLength={1000}
                        rows={5}
                        placeholder="For example: I want to speak confidently in group discussions and express my thoughts without hesitation..."
                        className="mt-5 min-h-[135px] w-full resize-y rounded-2xl border-2 border-[#D5E5E2] bg-[#FCFEFD] px-5 py-4 text-sm font-bold leading-6 text-[#102B4E] outline-none transition placeholder:text-[#102B4E]/30 focus:border-[#61D6BD] focus:ring-4 focus:ring-[#61D6BD]/10"
                      />{" "}
                      <div className="mt-2 flex justify-end">
                        {" "}
                        <span className="text-xs font-bold text-[#102B4E]/40">
                          {" "}
                          {additionalNotes.length}/1000 characters{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    {/* Save buttons */}{" "}
                    <div className="mt-6 flex flex-col gap-3 rounded-[24px] border-2 border-[#BDE7DD] bg-gradient-to-r from-[#E8FAF5] via-white to-[#EDF6FF] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      {" "}
                      <div>
                        {" "}
                        <p className="text-base font-black text-[#102B4E]">
                          {" "}
                          {hasSavedGoals
                            ? "Keep your goals up to date"
                            : "Ready to start your journey?"}{" "}
                        </p>{" "}
                        <p className="mt-1 text-sm font-bold leading-5 text-[#102B4E]/45">
                          {" "}
                          {hasSavedGoals
                            ? "Your original assessment will remain preserved."
                            : "Your first submission will become your initial assessment."}{" "}
                        </p>{" "}
                      </div>{" "}
                      <div className="flex flex-col gap-3 sm:flex-row">
                        {" "}
                        <button
                          type="button"
                          onClick={handleResetGoals}
                          disabled={savingGoals}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#C6DAD6] bg-white px-5 py-3.5 text-sm font-black text-[#102B4E]/65 transition hover:border-[#8FD6C7] hover:bg-[#F7FCFA] active:scale-95 disabled:opacity-50"
                        >
                          {" "}
                          <RotateCcw size={16} /> Reset changes{" "}
                        </button>{" "}
                        <button
                          type="submit"
                          disabled={savingGoals}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#102B4E] bg-[#102B4E] px-6 py-3.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(16,43,78,0.15)] transition-all hover:-translate-y-0.5 hover:border-[#167A67] hover:bg-[#167A67] hover:shadow-[0_12px_28px_rgba(22,122,103,0.2)] active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {" "}
                          {savingGoals ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Save size={18} />
                          )}{" "}
                          {savingGoals
                            ? "Saving..."
                            : hasSavedGoals
                              ? "Update Goals"
                              : "Save My Goals"}{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                  </form>{" "}
                  {/* ================================================= INITIAL ASSESSMENT HISTORY ================================================= */}{" "}
                  {hasSavedGoals && (
                    <div className="mt-7 overflow-hidden rounded-[24px] border-2 border-[#B9D5EE] bg-gradient-to-br from-[#F7FBFF] to-white">
                      {" "}
                      <button
                        type="button"
                        onClick={() =>
                          setShowGoalHistory((previous) => !previous)
                        }
                        aria-expanded={showGoalHistory}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-[#EDF6FF]/70 sm:p-6"
                      >
                        {" "}
                        <div className="flex items-start gap-3">
                          {" "}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B9D5EE] bg-white text-[#315779]">
                            {" "}
                            <Clock3 size={21} />{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <p className="text-base font-black text-[#102B4E]">
                              {" "}
                              Your Initial Assessment{" "}
                            </p>{" "}
                            <p className="mt-1 text-sm font-bold text-[#102B4E]/45">
                              {" "}
                              Submitted{" "}
                              {formatDateTime(
                                learningGoals.initialAssessment?.submittedAt,
                              )}{" "}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                        {showGoalHistory ? (
                          <ChevronUp
                            size={22}
                            className="shrink-0 text-[#315779]"
                          />
                        ) : (
                          <ChevronDown
                            size={22}
                            className="shrink-0 text-[#315779]"
                          />
                        )}{" "}
                      </button>{" "}
                      <AnimatePresence initial={false}>
                        {" "}
                        {showGoalHistory && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            {" "}
                            <div className="space-y-6 border-t-2 border-[#B9D5EE]/50 p-5 sm:p-6">
                              {" "}
                              <div>
                                {" "}
                                <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#167A67]">
                                  {" "}
                                  Skills selected initially{" "}
                                </p>{" "}
                                <GoalList
                                  items={
                                    learningGoals.initialAssessment
                                      ?.targetSkills || []
                                  }
                                  emptyText="No initial skills recorded."
                                />{" "}
                              </div>{" "}
                              <div>
                                {" "}
                                <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#315779]">
                                  {" "}
                                  Initial challenges{" "}
                                </p>{" "}
                                <GoalList
                                  items={
                                    learningGoals.initialAssessment
                                      ?.currentChallenges || []
                                  }
                                  emptyText="No initial challenges recorded."
                                />{" "}
                              </div>{" "}
                              <div>
                                {" "}
                                <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#6E4CA5]">
                                  {" "}
                                  Original notes{" "}
                                </p>{" "}
                                <p className="whitespace-pre-wrap break-words rounded-xl border border-[#D5C9F2] bg-white p-4 text-sm font-bold leading-6 text-[#102B4E]/70">
                                  {" "}
                                  {learningGoals.initialAssessment?.additionalNotes?.trim() ||
                                    "No additional notes were provided."}{" "}
                                </p>{" "}
                              </div>{" "}
                              <div className="rounded-xl border border-[#B9D5EE] bg-[#EDF6FF] p-4">
                                {" "}
                                <p className="text-xs font-black uppercase tracking-wider text-[#315779]">
                                  {" "}
                                  Why keep this?{" "}
                                </p>{" "}
                                <p className="mt-2 text-sm font-bold leading-6 text-[#102B4E]/60">
                                  {" "}
                                  Your initial assessment remains unchanged when
                                  you update your current goals. It provides a
                                  reference point for reflecting on your
                                  progress.{" "}
                                </p>{" "}
                              </div>{" "}
                            </div>{" "}
                          </motion.div>
                        )}{" "}
                      </AnimatePresence>{" "}
                    </div>
                  )}{" "}
                  {/* ================================================= LEARNING GOALS UPDATE HISTORY ================================================= */}
                  {hasSavedGoals && (
                    <GoalUpdateHistory
                      history={
                        learningGoals?.history ||
                        learningGoals?.updateHistory ||
                        []
                      }
                    />
                  )}
                </>
              )}{" "}
            </div>{" "}
          </motion.section>{" "}
          {/* ================================================= DAY ONE VIDEO ================================================= */}{" "}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8 overflow-hidden rounded-[30px] border-2 border-[#8FBFD7] bg-gradient-to-br from-[#F9FCFF] via-[#F1F8FC] to-[#E7F4FA] shadow-[0_12px_35px_rgba(49,87,121,0.08)]"
          >
            {" "}
            {/* Header */}{" "}
            <div className="border-b-2 border-[#8FBFD7]/40 bg-gradient-to-r from-[#E5F3FA] via-[#F3FAFD] to-[#E9F9F5] px-6 py-7 sm:px-8 lg:px-10">
              {" "}
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                {" "}
                <div className="flex items-start gap-4">
                  {" "}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#6FAFCB] bg-[#DCEFF8] text-[#286783] shadow-sm">
                    {" "}
                    <Video size={25} strokeWidth={2.5} />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#167A67]">
                      {" "}
                      Your starting point{" "}
                    </p>{" "}
                    <h3 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#102B4E] sm:text-3xl">
                      {" "}
                      Day One Video{" "}
                    </h3>{" "}
                    <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#102B4E]/55">
                      {" "}
                      Your first-day speaking video becomes your communication
                      baseline. Later, you can look back and see your
                      growth.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="inline-flex w-fit items-center gap-2 rounded-xl border-2 border-[#8FBFD7]/60 bg-white px-4 py-2.5 text-xs font-black text-[#286783] shadow-sm">
                  {" "}
                  <Video size={15} /> 15 sec – 3 min{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="p-6 sm:p-8 lg:p-10">
              {" "}
              {hasStartingVideo ? (
                <div className="overflow-hidden rounded-[24px] border-2 border-[#102B4E] bg-[#102B4E] shadow-[0_20px_45px_rgba(16,43,78,0.2)]">
                  {" "}
                  <div className="relative aspect-video">
                    {" "}
                    {student.startingPointVideoType === "upload" ? (
                      <video
                        src={student.startingPointVideo}
                        controls
                        className="h-full w-full object-contain"
                      />
                    ) : embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title="Starting point video"
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-5 text-center text-sm font-bold text-white/70">
                        {" "}
                        This video link could not be displayed.{" "}
                      </div>
                    )}{" "}
                    <div className="pointer-events-none absolute left-5 top-5 rounded-xl border border-[#61D6BD]/30 bg-[#102B4E]/75 px-4 py-2 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
                      {" "}
                      Your starting point{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex flex-col gap-4 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                    {" "}
                    <div>
                      {" "}
                      <p className="text-base font-black text-white">
                        {" "}
                        Your Day One recording{" "}
                      </p>{" "}
                      <p className="mt-1 text-sm font-bold text-white/45">
                        {" "}
                        {student.startingPointVideoType === "upload"
                          ? "Uploaded video"
                          : "Embedded video link"}{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="flex flex-wrap gap-2">
                      {" "}
                      <button
                        type="button"
                        onClick={() => setShowVideoModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#61D6BD] bg-[#61D6BD] px-5 py-3 text-sm font-black text-[#102B4E] transition hover:bg-[#7AE4CC] active:scale-95"
                      >
                        {" "}
                        <Play size={16} fill="currentColor" /> Watch Video{" "}
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => setVideoMode("choose")}
                        className="rounded-xl border-2 border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:border-[#61D6BD]/40 hover:bg-[#61D6BD]/10 hover:text-[#61D6BD] active:scale-95"
                      >
                        {" "}
                        Replace{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              ) : (
                <>
                  {" "}
                  {(videoMode === null || videoMode === "choose") && (
                    <div className="grid gap-5 lg:grid-cols-2">
                      {" "}
                      {/* Upload */}{" "}
                      <motion.button
                        type="button"
                        whileHover={{ y: -6 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingVideo}
                        className="group relative overflow-hidden rounded-[26px] border-2 border-[#8FB7D2] bg-gradient-to-br from-[#F8FCFF] via-[#EEF7FD] to-[#E2F1FA] p-7 text-left shadow-[0_10px_30px_rgba(49,87,121,0.08)] transition-all hover:border-[#4D91C9] hover:shadow-[0_20px_45px_rgba(49,87,121,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {" "}
                        <div className="relative flex items-center justify-between">
                          {" "}
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#9CC8E8] bg-[#DDEFFF] text-[#315779] transition-all group-hover:border-[#315779] group-hover:bg-[#315779] group-hover:text-white">
                            {" "}
                            {uploadingVideo ? (
                              <Loader2 size={24} className="animate-spin" />
                            ) : (
                              <Upload size={24} strokeWidth={2.5} />
                            )}{" "}
                          </div>{" "}
                          <ArrowUpRight
                            size={20}
                            className="text-[#315779]/50"
                          />{" "}
                        </div>{" "}
                        <h4 className="mt-7 text-xl font-black text-[#102B4E]">
                          {" "}
                          Upload your video{" "}
                        </h4>{" "}
                        <p className="mt-2 text-sm font-bold leading-6 text-[#102B4E]/50">
                          {" "}
                          Add your original first-day recording directly from
                          your device.{" "}
                        </p>{" "}
                        <div className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#8FB7D2]/60 bg-white/80 px-3.5 py-2.5 text-xs font-black text-[#315779]">
                          {" "}
                          <Upload size={14} /> Upload recording{" "}
                        </div>{" "}
                      </motion.button>{" "}
                      {/* YouTube link */}{" "}
                      <motion.button
                        type="button"
                        whileHover={{ y: -6 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVideoMode("link")}
                        disabled={uploadingVideo}
                        className="group relative overflow-hidden rounded-[26px] border-2 border-[#8FD6C7] bg-gradient-to-br from-[#FAFFFD] via-[#EDFBF7] to-[#DDF7F0] p-7 text-left shadow-[0_10px_30px_rgba(22,122,103,0.07)] transition-all hover:border-[#61D6BD] hover:shadow-[0_20px_45px_rgba(22,122,103,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {" "}
                        <div className="relative flex items-center justify-between">
                          {" "}
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#9ADFD0] bg-[#D8F6EF] text-[#167A67] transition-all group-hover:border-[#167A67] group-hover:bg-[#61D6BD] group-hover:text-[#102B4E]">
                            {" "}
                            <Link2 size={24} strokeWidth={2.5} />{" "}
                          </div>{" "}
                          <ArrowUpRight
                            size={20}
                            className="text-[#167A67]/50"
                          />{" "}
                        </div>{" "}
                        <h4 className="mt-7 text-xl font-black text-[#102B4E]">
                          {" "}
                          Add a video link{" "}
                        </h4>{" "}
                        <p className="mt-2 text-sm font-bold leading-6 text-[#102B4E]/50">
                          {" "}
                          Already have your recording online? Add your YouTube
                          link instead.{" "}
                        </p>{" "}
                        <div className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#8FD6C7]/60 bg-white/80 px-3.5 py-2.5 text-xs font-black text-[#167A67]">
                          {" "}
                          <Link2 size={14} /> Use YouTube{" "}
                        </div>{" "}
                      </motion.button>{" "}
                    </div>
                  )}{" "}
                  {/* Link form */}{" "}
                  {videoMode === "link" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[26px] border-2 border-[#61D6BD]/40 bg-gradient-to-br from-[#F1FFFB] via-[#E8FAF5] to-[#F5FFFD] p-6 sm:p-7"
                    >
                      {" "}
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#61D6BD]/40 bg-white text-[#167A67]">
                          {" "}
                          <Link2 size={21} />{" "}
                        </div>{" "}
                        <div className="min-w-0 flex-1">
                          {" "}
                          <p className="text-lg font-black text-[#102B4E]">
                            {" "}
                            Add your video link{" "}
                          </p>{" "}
                          <p className="mt-1 text-sm font-bold text-[#102B4E]/50">
                            {" "}
                            Use a YouTube or YouTube Shorts link.{" "}
                          </p>{" "}
                        </div>{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setVideoMode(null);
                            setVideoLink("");
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#102B4E]/10 bg-white text-[#102B4E]/40 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-90"
                          aria-label="Cancel video link"
                        >
                          {" "}
                          <X size={18} />{" "}
                        </button>{" "}
                      </div>{" "}
                      <input
                        type="url"
                        value={videoLink}
                        onChange={(event) => setVideoLink(event.target.value)}
                        placeholder="https://youtube.com/..."
                        className="mt-6 w-full rounded-2xl border-2 border-[#102B4E]/10 bg-white px-5 py-4 text-base font-bold text-[#102B4E] outline-none transition placeholder:text-[#102B4E]/25 focus:border-[#61D6BD] focus:ring-4 focus:ring-[#61D6BD]/10"
                      />{" "}
                      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {" "}
                        <p className="text-sm font-bold text-[#102B4E]/45">
                          {" "}
                          Make sure the video can be viewed by your mentor.{" "}
                        </p>{" "}
                        <button
                          type="button"
                          onClick={handleSaveVideoLink}
                          disabled={uploadingVideo || !videoLink.trim()}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#102B4E] bg-[#102B4E] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#193C67] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {" "}
                          {uploadingVideo ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}{" "}
                          Save video{" "}
                        </button>{" "}
                      </div>{" "}
                    </motion.div>
                  )}{" "}
                  {/* Replace flow: select a new upload or link */}{" "}
                  {videoMode === "choose" && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {" "}
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingVideo}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#315779] bg-[#315779] px-5 py-3 text-sm font-black text-white transition hover:bg-[#244361] disabled:opacity-50"
                      >
                        {" "}
                        <Upload size={17} /> Upload replacement{" "}
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => setVideoMode("link")}
                        disabled={uploadingVideo}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#8FD6C7] bg-white px-5 py-3 text-sm font-black text-[#167A67] transition hover:bg-[#E8FAF5] disabled:opacity-50"
                      >
                        {" "}
                        <Link2 size={17} /> Use a new link{" "}
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => setVideoMode(null)}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#D5E5E2] bg-white px-5 py-3 text-sm font-black text-[#102B4E]/60 transition hover:bg-[#F7FCFA]"
                      >
                        {" "}
                        <X size={17} /> Cancel{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                </>
              )}{" "}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleVideoUpload}
                className="hidden"
              />{" "}
              <div className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-[#61D6BD]/20 bg-gradient-to-r from-[#E8FAF5] to-white px-5 py-4 shadow-sm">
                {" "}
                <Sparkles
                  size={17}
                  className="mt-0.5 shrink-0 text-[#167A67]"
                />{" "}
                <p className="text-sm font-bold leading-6 text-[#102B4E]/55">
                  {" "}
                  This is your starting point — not a test you need to perfect.
                  Speak naturally and let your growth tell the story.{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </motion.section>{" "}
          {/* ================================================= FOOTER NOTE ================================================= */}{" "}
          <div className="pb-10 pt-7 text-center">
            {" "}
            <p className="text-sm font-bold text-[#102B4E]/35">
              {" "}
              Your profile grows with your journey.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </main>{" "}
      {/* ===================================================== VIDEO MODAL ===================================================== */}{" "}
      <AnimatePresence>
        {" "}
        {showVideoModal && hasStartingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07192D]/85 p-4 backdrop-blur-md"
            onClick={() => setShowVideoModal(false)}
          >
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border-2 border-[#61D6BD]/20 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
            >
              {" "}
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur transition hover:border-[#61D6BD] hover:bg-[#102B4E] hover:text-[#61D6BD] active:scale-90"
                aria-label="Close video"
              >
                {" "}
                <X size={20} />{" "}
              </button>{" "}
              <div className="aspect-video">
                {" "}
                {student.startingPointVideoType === "upload" ? (
                  <video
                    src={student.startingPointVideo}
                    controls
                    autoPlay
                    className="h-full w-full"
                  />
                ) : embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title="Your starting point"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold text-white/70">
                    {" "}
                    This video link could not be displayed.{" "}
                  </div>
                )}{" "}
              </div>{" "}
              <div className="flex flex-col gap-4 border-t border-white/10 bg-gradient-to-r from-[#102B4E] to-[#173A5D] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                {" "}
                <div>
                  {" "}
                  <p className="text-base font-black text-white">
                    {" "}
                    Your Starting Point{" "}
                  </p>{" "}
                  <p className="mt-1 text-sm font-bold text-white/40">
                    {" "}
                    The beginning of your Jashna journey{" "}
                  </p>{" "}
                </div>{" "}
                {student.startingPointVideoType === "embed" && (
                  <a
                    href={student.startingPointVideo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/70 transition hover:border-[#61D6BD]/50 hover:bg-[#61D6BD]/10 hover:text-[#61D6BD] active:scale-95"
                  >
                    {" "}
                    Open original <ExternalLink size={15} />{" "}
                  </a>
                )}{" "}
              </div>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </>
  );
}
