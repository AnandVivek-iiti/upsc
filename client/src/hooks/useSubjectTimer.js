
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

export const SUBJECT_SYLLABUS_MAP = {
  History: [
    { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
    { stage: "mains", paper: "GS1", module: "Indian Art, Culture & Architecture" },
    { stage: "mains", paper: "GS1", module: "Modern Indian History" },
    { stage: "mains", paper: "GS1", module: "Freedom Struggle" },
    { stage: "mains", paper: "GS1", module: "Post-Independence India" },
    { stage: "mains", paper: "GS1", module: "World History" },
  ],
  Polity: [
    { stage: "prelims", paper: "GS1", module: "Indian Polity & Governance" },
    { stage: "mains", paper: "GS2", module: "Indian Constitution" },
    { stage: "mains", paper: "GS2", module: "Federal Structure" },
    { stage: "mains", paper: "GS2", module: "Separation of Powers & Institutions" },
    { stage: "mains", paper: "GS2", module: "Legislature" },
    { stage: "mains", paper: "GS2", module: "Executive & Judiciary" },
    { stage: "mains", paper: "GS2", module: "Constitutional & Statutory Bodies" },
    { stage: "mains", paper: "GS2", module: "Governance & Accountability" },
  ],
  Economy: [
    { stage: "prelims", paper: "GS1", module: "Economic & Social Development" },
    { stage: "mains", paper: "GS3", module: "Indian Economy" },
    { stage: "mains", paper: "GS3", module: "Agriculture" },
    { stage: "mains", paper: "GS3", module: "Food Processing & Industry" },
    { stage: "mains", paper: "GS3", module: "Infrastructure & Investment" },
  ],
  Geography: [
    { stage: "prelims", paper: "GS1", module: "Indian & World Geography" },
    { stage: "mains", paper: "GS1", module: "World Physical Geography" },
    { stage: "mains", paper: "GS1", module: "Geophysical Phenomena" },
  ],
  Environment: [
    { stage: "prelims", paper: "GS1", module: "Environment, Ecology & Climate Change" },
    { stage: "mains", paper: "GS3", module: "Environment & Disaster Management" },
  ],
  "Science & Tech": [
    { stage: "prelims", paper: "GS1", module: "General Science" },
    { stage: "mains", paper: "GS3", module: "Science & Technology" },
  ],
  CSAT: [
    { stage: "prelims", paper: "CSAT", module: "Comprehension" },
    { stage: "prelims", paper: "CSAT", module: "Interpersonal & Communication Skills" },
    { stage: "prelims", paper: "CSAT", module: "Logical Reasoning & Analytical Ability" },
    { stage: "prelims", paper: "CSAT", module: "Decision Making & Problem Solving" },
    { stage: "prelims", paper: "CSAT", module: "General Mental Ability" },
    { stage: "prelims", paper: "CSAT", module: "Basic Numeracy & Data Interpretation" },
  ],
  Ethics: [
    { stage: "mains", paper: "GS4", module: "Ethics & Human Interface" },
    { stage: "mains", paper: "GS4", module: "Attitude" },
    { stage: "mains", paper: "GS4", module: "Aptitude & Foundational Values" },
    { stage: "mains", paper: "GS4", module: "Emotional Intelligence" },
    { stage: "mains", paper: "GS4", module: "Moral Thinkers & Philosophers" },
    { stage: "mains", paper: "GS4", module: "Public/Civil Service Values & Ethics" },
    { stage: "mains", paper: "GS4", module: "Probity in Governance" },
    { stage: "mains", paper: "GS4", module: "Case Studies" },
  ],
  Essay: [{ stage: "mains", paper: "Essay", module: "Essay Writing" }],
  Optional: [
    { stage: "mains", paper: "OptionalSubject", module: "Optional Subject Paper I" },
    { stage: "mains", paper: "OptionalSubject", module: "Optional Subject Paper II" },
  ],
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

// ─── Today's Topic persistence - date-keyed, mirrors TodayPlanner's pattern ───
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
    // localStorage unavailable - the topic just won't survive a reload, the timer still works
  }
}
function clearTodayTopic() {
  try {
    localStorage.removeItem(todayTopicKey());
  } catch {
    // no-op
  }
}

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
    // localStorage unavailable - selection just won't survive a reload
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

  const sessionStartElapsedRef = useRef(0);
  const [lastSession, setLastSession] = useState(null); // { id, subject, chapter, durationSeconds } | null


  useEffect(() => {
    const savedId = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    const savedSubject = sessionStorage.getItem(ACTIVE_SUBJECT_KEY);
    const savedTopic = loadTodayTopic();

    if (savedId && savedSubject) {

      setActiveId(savedId);
      setSubject(savedSubject);
      setChapter(savedTopic?.chapter || "");
      setPhase("paused");
    } else if (savedTopic?.subject) {
      
      setSubject(savedTopic.subject);
      setChapter(savedTopic.chapter || "");
      setPhase("idle");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTodaySessions();
      fetchAnalytics("lifetime");
      retryPendingEnd();
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
  // started - they happen as one atomic step so they can never go out of sync.
  const startStudy = useCallback(async (selectedSubject, selectedChapter = "") => {
    setError(null);
    startedAtRef.current = Date.now();
    sessionStartElapsedRef.current = timerStore.elapsed;
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

    // This session's own length, independent of timerStore.elapsed (which is
    // the day's running total across all subjects/sessions).
    const thisSessionSeconds = Math.max(0, timerStore.elapsed - sessionStartElapsedRef.current);

    const currentId = activeId;
    if (!currentId || !userId) return;


    let endedOnServer = false;
    try {
      const res = await fetch(`${BASE}/subject-sessions/${currentId}/end`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const json = await res.json();
      console.log("⏹️ End session response:", json);
      if (json.success) {
        endedOnServer = true;
        const totalHours = timerStore.elapsed / 3600;
        if (onLogHours) {
          const note = chapter ? `${subject} - ${chapter} session` : `${subject} session`;
          await onLogHours(totalHours, note);
          onSynced?.(totalHours);
        }
        // Server's own duration_seconds is the authoritative figure if present;
        // fall back to the local diff (e.g. if the response shape ever changes).
        const durationSeconds = json.session?.duration_seconds ?? thisSessionSeconds;
        setLastSession({ id: currentId, subject, chapter, durationSeconds });
        await fetchTodaySessions();
        await fetchAnalytics("lifetime");
      } else {
        console.error("❌ End session error:", json.error);
        setError("Couldn't save this session - will retry. Don't force-close the app yet.");
      }
    } catch (err) {
      console.error("❌ End session network error:", err);
      setError("Couldn't save this session (network issue) - will retry when back online.");
    }

    if (endedOnServer) {
      setActiveId(null);
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
      sessionStorage.removeItem(ACTIVE_SUBJECT_KEY);
    }
    // If it didn't end on the server, activeId/sessionStorage are deliberately
    // left in place so a retry (see retryPendingEnd) can still close it out.
  }, [activeId, userId, subject, chapter, onLogHours, onSynced, fetchTodaySessions, fetchAnalytics]);

  // ─── Retry a session that failed to close on the server ──────────────────
  // Call this on mount/reconnect: if sessionStorage still has an activeId
  // (meaning the last pause's PATCH /end never actually succeeded), try again
  // instead of leaving it to rot until the next startSession() stale-sweep.
  const retryPendingEnd = useCallback(async () => {
    const pendingId = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    if (!pendingId || !userId || timerStore.running) return;
    try {
      const res = await fetch(`${BASE}/subject-sessions/${pendingId}/end`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success || json.error === "Session already closed.") {
        setActiveId(null);
        sessionStorage.removeItem(ACTIVE_SESSION_KEY);
        sessionStorage.removeItem(ACTIVE_SUBJECT_KEY);
        setError(null);
        await fetchTodaySessions();
        await fetchAnalytics("lifetime");
      }
    } catch (err) {
      console.error("❌ retryPendingEnd error:", err);
    }
  }, [userId, fetchTodaySessions, fetchAnalytics]);

  // ── Attach a free-text note to a session after the fact ──────────────────
  // Used by the syllabus-sync modal's "didn't cover any of these?" fallback.
  const addSessionNote = useCallback(async (sessionId, note) => {
    if (!sessionId || !note?.trim() || !userId) return false;
    try {
      const res = await fetch(`${BASE}/subject-sessions/${sessionId}/notes`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ notes: note.trim() }),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error("❌ addSessionNote error:", err);
      return false;
    }
  }, [userId]);

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
    // Syllabus-sync modal support:
    lastSession,               // { id, subject, chapter, durationSeconds } for the most recently *ended* session
    sessionStartElapsedRef,    // .current = timerStore.elapsed snapshot at start, so callers can derive a live running-session duration
    addSessionNote,
    retryPendingEnd,           // manual retry hook, e.g. a "Sync" button, in case the automatic mount-time retry also hit a network error
  };
}
