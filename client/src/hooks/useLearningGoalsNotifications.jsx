import { useCallback, useEffect, useState } from "react";

import { API_URL } from "../config";
const SEEN_KEY = "learningGoalsLastSeenAt";
const SEEN_EVENT = "learning-goals-seen";
const POLL_INTERVAL_MS = 60 * 1000;

const getLatestHistoryTime = (record) => {
  const history = Array.isArray(record?.history) ? record.history : [];
  return history.reduce((latest, snapshot) => {
    const value = snapshot?.updatedAt ? new Date(snapshot.updatedAt).getTime() : 0;
    return Number.isNaN(value) ? latest : Math.max(latest, value);
  }, 0);
};

// Latest activity time: newest history snapshot first, then current goals,
// document update, and finally initial assessment submission.
export const getRecordTime = (record) => {
  const historyTime = getLatestHistoryTime(record);
  const value =
    historyTime ||
    record?.currentGoals?.updatedAt ||
    record?.updatedAt ||
    record?.initialAssessment?.submittedAt ||
    null;

  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

export const sortByLatest = (records) =>
  [...records].sort((a, b) => getRecordTime(b) - getRecordTime(a));

export const getLastSeenAt = () => {
  try {
    const stored = localStorage.getItem(SEEN_KEY);
    const time = stored ? new Date(stored).getTime() : 0;
    return Number.isNaN(time) ? 0 : time;
  } catch {
    return 0;
  }
};

// Called when the admin opens Learning Goals. Uses the newest server timestamp.
export const markLearningGoalsSeen = (records = []) => {
  try {
    const newest = records.reduce(
      (max, record) => Math.max(max, getRecordTime(record)),
      0,
    );
    const seenAt = Math.max(newest, getLastSeenAt());

    if (seenAt > 0) {
      localStorage.setItem(SEEN_KEY, new Date(seenAt).toISOString());
    }

    window.dispatchEvent(new Event(SEEN_EVENT));
  } catch {
    // Storage unavailable; notification badge may not clear.
  }
};

export default function useLearningGoalsNotifications() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    let token = null;
    try {
      token = localStorage.getItem("adminToken");
    } catch {
      setCount(0);
      return;
    }

    if (!token) {
      setCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/student-learning-goals/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      const records = Array.isArray(data) ? data : data?.goals || [];
      const lastSeen = getLastSeenAt();

      // Count students with new activity, not every snapshot. The full history
      // remains available on the admin page.
      setCount(
        records.filter((record) => getRecordTime(record) > lastSeen).length,
      );
    } catch {
      // Keep the previous count if the request fails.
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    window.addEventListener(SEEN_EVENT, refresh);
    window.addEventListener("focus", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener(SEEN_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return count;
}

export function LearningGoalsBadge({ className = "" }) {
  const count = useLearningGoalsNotifications();

  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} student learning goal updates`}
      className={`ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[12px] font-extrabold leading-none ${className}`}
      style={{ background: "#EF4444", color: "#FFFFFF" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
