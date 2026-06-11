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

import { useState, useCallback, useMemo } from "react";
import { useEffect } from "react";

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

export function useQuestionAttempts({ onSyllabusUpdate } = {}) {
  const [attempts, setAttempts] = useState(load);
useEffect(() => {
  const sync = () => setAttempts(load());

  window.addEventListener(
    "question-attempt-updated",
    sync
  );

  return () => {
    window.removeEventListener(
      "question-attempt-updated",
      sync
    );
  };
}, []);
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
      if (result === "correct" && onSyllabusUpdate && record.subject) {
        const map = TOPIC_TO_SYLLABUS[record.subject];
        if (map) {
          const subjectAttempts = next.filter(a => a.subject === record.subject);
          const subjectCorrect  = subjectAttempts.filter(a => a.result === "correct").length;
          const ratio           = subjectAttempts.length > 0
            ? subjectCorrect / subjectAttempts.length : 0;

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