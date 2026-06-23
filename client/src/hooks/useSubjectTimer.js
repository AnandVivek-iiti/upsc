/**
 * useSubjectTimer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Bridges timerStore with subject-session API. Includes detailed logging.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import timerStore from "./timerStore";
import { getISTDateString } from "../utils/dateUtils";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const UPSC_SUBJECTS = [
  "History", "Polity", "Economy", "Geography", "Environment",
  "Science & Tech", "CSAT", "Ethics", "Essay", "Optional",
  "Current Affairs", "Other",
];

export const SUBJECT_COLORS = {
  History: "#f59e0b", Polity: "#6366f1", Economy: "#10b981",
  Geography: "#06b6d4", Environment: "#84cc16", "Science & Tech": "#8b5cf6",
  CSAT: "#f43f5e", Ethics: "#ec4899", Essay: "#14b8a6",
  Optional: "#fb923c", "Current Affairs": "#3b82f6", Other: "#94a3b8",
};

export const SUBJECT_ICONS = {
  History: "📜", Polity: "⚖️", Economy: "📈",
  Geography: "🗺️", Environment: "🌿", "Science & Tech": "🔬",
  CSAT: "🧮", Ethics: "🧭", Essay: "✍️",
  Optional: "📖", "Current Affairs": "📰", Other: "📚",
};

function authHeaders() {
  const token = localStorage.getItem("upsc_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const ACTIVE_SESSION_KEY = "upsc_active_session_id";
const ACTIVE_SUBJECT_KEY = "upsc_active_subject";

export function useSubjectTimer({
  userId,
  onLogHours,
  onSynced,
  targetHours = 8,
  serverHours = 0,
  dataReady = false,
}) {
  const [phase, setPhase] = useState("idle");
  const [subject, setSubject] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [todayTimeline, setTodayTimeline] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);
  const startedAtRef = useRef(null);

  // Restore session across reloads
  useEffect(() => {
    const savedId = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    const savedSubject = sessionStorage.getItem(ACTIVE_SUBJECT_KEY);
    if (savedId && savedSubject && timerStore.elapsed > 0) {
      setActiveId(savedId);
      setSubject(savedSubject);
      setPhase(timerStore.running ? "running" : "paused");
    } else if (savedId && timerStore.elapsed === 0) {
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
      sessionStorage.removeItem(ACTIVE_SUBJECT_KEY);
    }
  }, []);

  // Fetch today's sessions & analytics on mount
  useEffect(() => {
    if (userId) {
      fetchTodaySessions();
      fetchAnalytics("lifetime");
    }
  }, [userId]);

  // ─── API calls ──────────────────────────────────────────────────────────

  const fetchTodaySessions = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE}/subject-sessions/today`, { headers: authHeaders() });
      const json = await res.json();
      console.log("📅 Today sessions:", json);
      if (json.success) {
        setTodaySessions(json.sessions || []);
        setTodayTimeline(json.timeline || []);
      }
    } catch (err) {
      console.error("❌ fetchTodaySessions error:", err);
    }
  }, [userId]);

  const fetchAnalytics = useCallback(async (period = "lifetime") => {
    if (!userId) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${BASE}/subject-sessions/analytics?period=${period}`, { headers: authHeaders() });
      const json = await res.json();
      console.log("📊 Analytics response:", json);
      if (json.success) setAnalytics(json);
    } catch (err) {
      console.error("❌ fetchAnalytics error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [userId]);

  // ─── Controls ───────────────────────────────────────────────────────────

  const showSubjectPicker = useCallback(() => setPhase("selecting"), []);

  const startStudy = useCallback(async (selectedSubject) => {
    setError(null);
    startedAtRef.current = Date.now();
    timerStore.start();
    setSubject(selectedSubject);
    setPhase("running");

    if (userId) {
      try {
        const res = await fetch(`${BASE}/subject-sessions/start`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ subject: selectedSubject }),
        });
        const json = await res.json();
        console.log("🚀 Start session response:", json);
        if (json.success) {
          const id = json.session.id;
          setActiveId(id);
          sessionStorage.setItem(ACTIVE_SESSION_KEY, id);
          sessionStorage.setItem(ACTIVE_SUBJECT_KEY, selectedSubject);
        } else {
          console.error("❌ Start session error:", json.error);
          setError("Could not start session on server. Timer still runs locally.");
        }
      } catch (err) {
        console.error("❌ Start session network error:", err);
        setError("Network error while starting session.");
      }
    }
  }, [userId]);

  const pauseStudy = useCallback(async () => {
    timerStore.pause();
    setPhase("paused");

    const currentId = activeId;
    if (!currentId || !userId) return;

    try {
      const res = await fetch(`${BASE}/subject-sessions/${currentId}/end`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const json = await res.json();
      console.log("⏹️ End session response:", json);
      if (json.success) {
        const totalHours = timerStore.elapsed / 3600;
        if (onLogHours) {
          await onLogHours(totalHours, `${subject} session`);
          onSynced?.(totalHours);
        }
        await fetchTodaySessions();
        await fetchAnalytics("lifetime");
      }
    } catch (err) {
      console.error("❌ End session error:", err);
    }

    setActiveId(null);
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    sessionStorage.removeItem(ACTIVE_SUBJECT_KEY);
  }, [activeId, userId, subject, onLogHours, onSynced, fetchTodaySessions, fetchAnalytics]);

  const resumeStudy = useCallback(async () => {
    if (!subject) {
      setPhase("selecting");
      return;
    }
    await startStudy(subject);
  }, [subject, startStudy]);

  const resetStudy = useCallback(async () => {
    if (activeId && userId) {
      try {
        await fetch(`${BASE}/subject-sessions/${activeId}/end`, {
          method: "PATCH",
          headers: authHeaders(),
        });
      } catch (err) {
        console.error("❌ Reset end error:", err);
      }
    }
    timerStore.reset();
    setPhase("idle");
    setSubject(null);
    setActiveId(null);
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    sessionStorage.removeItem(ACTIVE_SUBJECT_KEY);
    await fetchTodaySessions();
    await fetchAnalytics("lifetime");
  }, [activeId, userId, fetchTodaySessions, fetchAnalytics]);

  return {
    phase,
    subject,
    activeId,
    error,
    todaySessions,
    todayTimeline,
    analytics,
    analyticsLoading,
    showSubjectPicker,
    startStudy,
    pauseStudy,
    resumeStudy,
    resetStudy,
    setSubject,
    fetchTodaySessions,
    fetchAnalytics,
  };
}