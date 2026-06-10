// hooks/useQuestionStats.js
// ─── Question Statistics Hook ─────────────────────────────────────────────────
// Persists every question attempt to localStorage.
// Reads are O(1) via a derived index map.
//
// Schema stored at "upsc-question-stats":
// {
//   attempts: [
//     {
//       id:         string,   // question _id or generated id
//       questionText: string, // first 80 chars (for display)
//       result:     "correct" | "wrong",
//       difficulty: "Easy" | "Medium" | "Hard",
//       year:       number | null,
//       topic:      string | null,
//       subject:    string | null,
//       paper:      string | null,
//       stage:      "prelims" | "mains",
//       attemptedAt: ISO string,
//     }
//   ]
// }
//
// API:
//   stats.record(question, result, meta)    — log an attempt
//   stats.getAttemptedIds()                 — Set of all attempted question IDs
//   stats.summary                           — computed summary object (see below)
//   stats.yearBreakdown                     — { year: { correct, wrong, total } }
//   stats.diffBreakdown                     — { Easy/Medium/Hard: { correct, wrong, total } }
//   stats.subjectBreakdown                  — { subjectName: { correct, wrong, total } }
//   stats.recentAttempts(n)                 — last n attempts (newest first)
//   stats.clearAll()                        — wipe everything

import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "upsc-question-stats";

function loadRaw() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveRaw(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useQuestionStats() {
  const [attempts, setAttempts] = useState(() => loadRaw().attempts || []);

  // ── record a new attempt ───────────────────────────────────────────────────
  const record = useCallback((question, result, meta = {}) => {
    const entry = {
      id:           question._id || question.id || `q-${Date.now()}`,
      questionText: (question.questionText || "").slice(0, 80),
      result,                            // "correct" | "wrong"
      difficulty:   question.difficulty || null,
      year:         question.year || null,
      topic:        question.topic || null,
      subject:      meta.subject || null,
      paper:        meta.paper || null,
      stage:        meta.stage || "prelims",
      attemptedAt:  new Date().toISOString(),
    };
    setAttempts(prev => {
      // Only keep the latest attempt per question (overwrite earlier)
      const without = prev.filter(a => a.id !== entry.id);
      const next = [entry, ...without];
      saveRaw({ attempts: next });
      return next;
    });
  }, []);

  // ── derived data ───────────────────────────────────────────────────────────

  const attemptedIds = useMemo(() => new Set(attempts.map(a => a.id)), [attempts]);

  const summary = useMemo(() => {
    const total   = attempts.length;
    const correct = attempts.filter(a => a.result === "correct").length;
    const wrong   = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, wrong, accuracy };
  }, [attempts]);

  // Year breakdown
  const yearBreakdown = useMemo(() => {
    const map = {};
    for (const a of attempts) {
      const y = a.year || "Unknown";
      if (!map[y]) map[y] = { correct: 0, wrong: 0, total: 0 };
      map[y].total++;
      map[y][a.result]++;
    }
    return map;
  }, [attempts]);

  // Difficulty breakdown
  const diffBreakdown = useMemo(() => {
    const map = { Easy: { correct: 0, wrong: 0, total: 0 }, Medium: { correct: 0, wrong: 0, total: 0 }, Hard: { correct: 0, wrong: 0, total: 0 } };
    for (const a of attempts) {
      const d = a.difficulty || "Medium";
      if (!map[d]) map[d] = { correct: 0, wrong: 0, total: 0 };
      map[d].total++;
      map[d][a.result]++;
    }
    return map;
  }, [attempts]);

  // Subject breakdown
  const subjectBreakdown = useMemo(() => {
    const map = {};
    for (const a of attempts) {
      const s = a.subject || "Unknown";
      if (!map[s]) map[s] = { correct: 0, wrong: 0, total: 0 };
      map[s].total++;
      map[s][a.result]++;
    }
    return map;
  }, [attempts]);

  // Topic breakdown
  const topicBreakdown = useMemo(() => {
    const map = {};
    for (const a of attempts) {
      const t = a.topic || "Unknown";
      if (!map[t]) map[t] = { correct: 0, wrong: 0, total: 0 };
      map[t].total++;
      map[t][a.result]++;
    }
    return map;
  }, [attempts]);

  const recentAttempts = useCallback((n = 10) => attempts.slice(0, n), [attempts]);

  const clearAll = useCallback(() => {
    saveRaw({ attempts: [] });
    setAttempts([]);
  }, []);

  return {
    attempts,
    attemptedIds,
    summary,
    yearBreakdown,
    diffBreakdown,
    subjectBreakdown,
    topicBreakdown,
    recentAttempts,
    record,
    clearAll,
  };
}