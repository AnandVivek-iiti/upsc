/**
 * useSubjectTimer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Bridges timerStore with subject-session API. Includes detailed logging.
 *
 * "Today's Topic" = { subject, chapter } chosen once via the subject picker
 * before the timer is allowed to start. It is persisted to localStorage
 * (date-keyed, same pattern as TodayPlanner's `upsc-tasks-${date}` key) so
 * the topic shown to the student and the subject the timer is logging
 * against can never drift apart — even across reloads, pauses, and tab
 * switches. Picking a topic and starting the timer happen as one step.
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

// ─── Today's Topic persistence — date-keyed, mirrors TodayPlanner's pattern ───
// This is the single source of truth for "what is today's topic", independent
// of the active-session bookkeeping above (which only tracks the *currently
// running* server session and gets cleared on every pause).
function todayTopicKey() {
  return `upsc_today_topic_${getISTDateString()}`;
}
function loadTodayTopic() {
  try {
    const raw = localStorage.getItem(todayTopicKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveTodayTopic(subj, chap) {
  try {
    localStorage.setItem(todayTopicKey(), JSON.stringify({ subject: subj, chapter: chap || "" }));
  } catch {
    // localStorage unavailable — the topic just won't survive a reload, the timer still works
  }
}
function clearTodayTopic() {
  try {
    localStorage.removeItem(todayTopicKey());
  } catch {
    // no-op
  }
}

// ─── Preferred Subjects persistence ──────────────────────────────────────────
// Exported (not local to one file) so ProfilePage.jsx's editor and this
// timer's subject picker read/write the exact same storage key — a student's
// saved preferences and what the picker offers first can never drift apart.
// Keyed by user, not by date: a study-subject preference isn't a daily thing.
export function preferredSubjectsKey(uid) {
  return `upsc_preferred_subjects_${uid || "anon"}`;
}
export function loadPreferredSubjects(uid) {
  try {
    const raw = localStorage.getItem(preferredSubjectsKey(uid));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function savePreferredSubjects(uid, subjects) {
  try {
    localStorage.setItem(preferredSubjectsKey(uid), JSON.stringify(subjects || []));
  } catch {
    // localStorage unavailable — selection just won't survive a reload
  }
}

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
  const [chapter, setChapter] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [todayTimeline, setTodayTimeline] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);
  const startedAtRef = useRef(null);

  // Restore session + today's topic across reloads
  useEffect(() => {
    const savedId = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    const savedSubject = sessionStorage.getItem(ACTIVE_SUBJECT_KEY);
    const savedTopic = loadTodayTopic();

    if (savedId && savedSubject && timerStore.elapsed > 0) {
      // A live, server-tracked session survived the reload — restore it exactly.
      setActiveId(savedId);
      setSubject(savedSubject);
      setChapter(savedTopic?.chapter || "");
      setPhase(timerStore.running ? "running" : "paused");
    } else {
      if (savedId && timerStore.elapsed === 0) {
        sessionStorage.removeItem(ACTIVE_SESSION_KEY);
        sessionStorage.removeItem(ACTIVE_SUBJECT_KEY);
      }
      // No live session to restore — but the student may already have picked
      // today's topic earlier (e.g. paused, then reloaded the page). Surface
      // it anyway so what's shown never falls out of sync with what's logged.
      if (savedTopic?.subject) {
        setSubject(savedTopic.subject);
        setChapter(savedTopic.chapter || "");
        setPhase(timerStore.elapsed > 0 ? "paused" : "idle");
      }
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

  // selectedSubject is required; selectedChapter is optional free text.
  // This is the single place "today's topic" gets logged AND the timer gets
  // started — they happen as one atomic step so they can never go out of sync.
  const startStudy = useCallback(async (selectedSubject, selectedChapter = "") => {
    setError(null);
    startedAtRef.current = Date.now();
    timerStore.start();
    setSubject(selectedSubject);
    setChapter(selectedChapter || "");
    saveTodayTopic(selectedSubject, selectedChapter);
    setPhase("running");

    if (userId) {
      try {
        const res = await fetch(`${BASE}/subject-sessions/start`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ subject: selectedSubject, chapter: selectedChapter || "" }),
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
          const note = chapter ? `${subject} — ${chapter} session` : `${subject} session`;
          await onLogHours(totalHours, note);
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
  }, [activeId, userId, subject, chapter, onLogHours, onSynced, fetchTodaySessions, fetchAnalytics]);

  const resumeStudy = useCallback(async () => {
    if (!subject) {
      setPhase("selecting");
      return;
    }
    await startStudy(subject, chapter);
  }, [subject, chapter, startStudy]);

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
    setChapter("");
    setActiveId(null);
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    sessionStorage.removeItem(ACTIVE_SUBJECT_KEY);
    clearTodayTopic();
    await fetchTodaySessions();
    await fetchAnalytics("lifetime");
  }, [activeId, userId, fetchTodaySessions, fetchAnalytics]);

  return {
    phase,
    subject,
    chapter,
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
    setChapter,
    setPhase,
    fetchTodaySessions,
    fetchAnalytics,
  };
}