// hooks/useQuestionAttempts.js
// ─── Question Attempt Tracker ─────────────────────────────────────────────────
// Two responsibilities:
//   1. Persist every answered question (result: correct|wrong|skipped) to
//      localStorage so QuestionStats can display breakdowns.
//   2. When a topic's questions are ≥70% correct, call onSyllabusUpdate to
//      push progress into the Syllabus Tracker automatically.
//
// Usage (in Topicwise / QuestionCard):
//   const { recordAttempt } = useQuestionAttempts({ onSyllabusUpdate });
//   recordAttempt(question, "correct" | "wrong" | "skipped", { subject, paper });

import { useState, useCallback, useMemo, useEffect } from "react";
import { syncQuestionAttempts } from "../utils/api";

const STORAGE_KEY = "upsc-question-attempts";
const THRESHOLD   = 0.70; // 70% correct in a topic → auto-mark progress

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
}

// Map topic → syllabus module name (best-effort, override as needed)
// Topicwise subject labels → syllabus paper/module structure
const TOPIC_TO_SYLLABUS = {
  // Prelims GS Paper I subjects  →  stage: "prelims", paper: "GS"
  "Ancient & Medieval History": { stage: "prelims", paper: "GS", module: "Ancient History" },
  "Modern History":             { stage: "prelims", paper: "GS", module: "Modern History" },
  "Polity & Governance":        { stage: "prelims", paper: "GS", module: "Indian Polity" },
  "Economy":                    { stage: "prelims", paper: "GS", module: "Indian Economy" },
  "Geography":                  { stage: "prelims", paper: "GS", module: "Physical Geography" },
  "Environment & Ecology":      { stage: "prelims", paper: "GS", module: "Environment" },
  "Science & Technology":       { stage: "prelims", paper: "GS", module: "Science & Technology" },
  "Art & Culture":              { stage: "prelims", paper: "GS", module: "Art & Culture" },
  "Social Issues":              { stage: "prelims", paper: "GS", module: "Social Issues" },
  "IR & Current Affairs":       { stage: "prelims", paper: "GS", module: "International Relations" },
  // CSAT
  "Logical Reasoning":          { stage: "prelims", paper: "CSAT", module: "Reasoning" },
  "Reading Comprehension":      { stage: "prelims", paper: "CSAT", module: "Comprehension" },
  "Quantitative Aptitude":      { stage: "prelims", paper: "CSAT", module: "Mathematics" },
};

export function useQuestionAttempts({ onSyllabusUpdate, serverAttempts = null } = {}) {
  const [attempts, setAttempts] = useState(() => {
    const local = load();
    // If serverAttempts provided on initial load, merge them in
    // (server wins for same id — more recent attempt counts)
    if (serverAttempts && serverAttempts.length > 0) {
      const byId = {};
      for (const a of serverAttempts) byId[a.id] = a;
      for (const a of local) if (!byId[a.id]) byId[a.id] = a;
      const merged = Object.values(byId);
      save(merged);
      return merged;
    }
    return local;
  });

  // Listen for cross-tab updates
  useEffect(() => {
    const sync = () => setAttempts(load());
    window.addEventListener("question-attempt-updated", sync);
    return () => window.removeEventListener("question-attempt-updated", sync);
  }, []);

  // Debounced server sync — batch up attempts and push every 10 seconds
  // when there are unsaved changes, rather than one request per question
  useEffect(() => {
    if (attempts.length === 0) return;
    const timer = setTimeout(async () => {
      try {
        await syncQuestionAttempts(attempts);
      } catch {
        // Silently fail — local storage is the fallback, server sync is best-effort
      }
    }, 10_000); // 10s debounce
    return () => clearTimeout(timer);
  }, [attempts]);
  // Set of IDs already attempted — O(1) dedup
  const attemptedIds = useMemo(() => new Set(attempts.map(a => a.id)), [attempts]);

  const recordAttempt = useCallback((question, result, meta = {}) => {
    const id = question._id || question.id || `q-${Date.now()}`;

    setAttempts(prev => {
      // Update if already attempted (re-attempt), else append
      const exists = prev.findIndex(a => a.id === id);
      const record = {
        id,
        questionText: question.questionText || "",
        topic:        question.topic        || "",
        subTopic:     question.subTopic     || "",
        difficulty:   question.difficulty   || "Medium",
        year:         question.year         || null,
        subject:      meta.subject          || "",
        paper:        meta.paper            || "",
        result,                                 // "correct" | "wrong" | "skipped"
        attemptedAt:  new Date().toISOString(),
      };

      let next;
      if (exists >= 0) {
        next = [...prev];
        next[exists] = record;
      } else {
        next = [record, ...prev];
      }
      save(next);
window.dispatchEvent(
  new Event("question-attempt-updated")
);
      // ── Auto-sync to syllabus when topic crosses threshold ──────────────
      if (result !== "skipped" && onSyllabusUpdate) {
        // Try topic first (PYQ/Topicwise), then subject (Test series)
        const lookupKey = record.topic || record.subject || "";
        const map = lookupKey ? TOPIC_TO_SYLLABUS[lookupKey] : null;
        if (map) {
          // Count attempts for this topic/subject from all attempts
          const topicAttempts = next.filter(
            a => (a.topic || a.subject) === lookupKey
          );
          const topicCorrect = topicAttempts.filter(a => a.result === "correct").length;
          const ratio = topicAttempts.length > 0
            ? topicCorrect / topicAttempts.length : 0;

          // Progress value: proportional 0-100, capped at 90 via auto-sync
          // (leave the last 10% for the user to manually confirm mastery)
          const progress = Math.min(Math.round(ratio * 100), 90);
          const status   = ratio >= THRESHOLD ? "progress" : "pending";
          onSyllabusUpdate(map.stage, map.paper, map.module, progress, status);
        }
      }

      return next;
    });
  }, [onSyllabusUpdate]);

  const clearAttempts = useCallback(() => {
  save([]);
  setAttempts([]);

  window.dispatchEvent(
    new Event("question-attempt-updated")
  );
}, []);

  return { attempts, attemptedIds, recordAttempt, clearAttempts };
}