// hooks/useQuestionAttempts.js
// ─── Question Attempt Tracker ─────────────────────────────────────────────────
// Persists every answered question to localStorage + auto-pushes syllabus
// progress whenever a subject crosses the 70% correct threshold.
//
// KEY DESIGN DECISIONS
// ─────────────────────
// • We match on `meta.subject` (the subject.label from SUBJECT_REGISTRY), NOT
//   on q.topic — topic is too granular and varies per question.
// • meta.paper is the paper LABEL from SUBJECT_REGISTRY, e.g. "GS Paper I",
//   "CSAT Paper II", "GS Paper II" — used to disambiguate subjects that appear
//   in both prelims and mains (Economy, Geography, Science & Technology,
//   Art & Culture).
// • Prelims paper key in syllabusData is "GS1" (not "GS") and "CSAT".
// • Mains paper keys are "GS1", "GS2", "GS3", "GS4".

import { useState, useCallback, useMemo, useEffect } from "react";
import { syncQuestionAttempts } from "../utils/api";

const STORAGE_KEY = "upsc-question-attempts";
const THRESHOLD   = 0.70; // ≥70% correct → "progress" status

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
}

// ─── MASTER SUBJECT → SYLLABUS MAP ───────────────────────────────────────────
// Keys are subject.label values from SUBJECT_REGISTRY in Topicwise.jsx.
// Values: { stage, paper, module } matching syllabusData.js keys EXACTLY.
//
// For subjects that exist in both prelims & mains, we use a nested object
// keyed by the paper LABEL ("GS Paper I", "GS Paper II", etc.).

const SUBJECT_TO_SYLLABUS = {
  // ── PRELIMS GS Paper I (paper key "GS1" in syllabusData) ─────────────────
  "Ancient & Medieval History": {
    stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement",
  },
  "Modern History": {
    stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement",
  },
  "Polity & Governance": {
    stage: "prelims", paper: "GS1", module: "Indian Polity & Governance",
  },
  "Social Issues": {
    stage: "prelims", paper: "GS1", module: "Economic & Social Development",
  },
  "IR & Current Affairs": {
    stage: "prelims", paper: "GS1", module: "Current Events",
  },

  // ── PRELIMS CSAT (paper key "CSAT" in syllabusData) ──────────────────────
  "Logical Reasoning": {
    stage: "prelims", paper: "CSAT", module: "Logical Reasoning & Analytical Ability",
  },
  "Reading Comprehension": {
    stage: "prelims", paper: "CSAT", module: "Comprehension",
  },
  "Quantitative Aptitude": {
    stage: "prelims", paper: "CSAT", module: "Basic Numeracy & Data Interpretation",
  },

  // ── MAINS-ONLY SUBJECTS ──────────────────────────────────────────────────
  // GS Paper I (mains) → paper key "GS1"
  "History": {
    stage: "mains", paper: "GS1", module: "Modern Indian History",
  },
  "Culture": {
    stage: "mains", paper: "GS1", module: "Indian Art, Culture & Architecture",
  },
  "Society": {
    stage: "mains", paper: "GS1", module: "Indian Society & Diversity",
  },
  "Indian Society": {
    stage: "mains", paper: "GS1", module: "Indian Society & Diversity",
  },
  "Post-independence consolidation": {
    stage: "mains", paper: "GS1", module: "Post-Independence India",
  },
  "Freedom Struggle": {
    stage: "mains", paper: "GS1", module: "Freedom Struggle",
  },

  // GS Paper II (mains) → paper key "GS2"
  "Indian Polity": {
    stage: "mains", paper: "GS2", module: "Indian Constitution",
  },
  "Constitution": {
    stage: "mains", paper: "GS2", module: "Indian Constitution",
  },
  "Governance": {
    stage: "mains", paper: "GS2", module: "Functioning of Parliamentary System",
  },
  "International Relations": {
    stage: "mains", paper: "GS2", module: "India's Foreign Policy & Bilateral Relations",
  },
  "Social Justice": {
    stage: "mains", paper: "GS2", module: "Welfare Schemes & Social Justice",
  },
  "Pressure Groups": {
    stage: "mains", paper: "GS2", module: "Role of Civil Services in Democracy",
  },

  // GS Paper III (mains) → paper key "GS3"
  "Economic Development": {
    stage: "mains", paper: "GS3", module: "Economic Development & Growth",
  },
  "Agriculture": {
    stage: "mains", paper: "GS3", module: "Agriculture & Allied Activities",
  },
  "Internal Security": {
    stage: "mains", paper: "GS3", module: "Internal Security",
  },
  "Disaster Management": {
    stage: "mains", paper: "GS3", module: "Environment & Disaster Management",
  },

  // GS Paper IV (mains) → paper key "GS4"
  "Ethics": {
    stage: "mains", paper: "GS4", module: "Ethics & Human Interface",
  },
  "Integrity": {
    stage: "mains", paper: "GS4", module: "Public/Civil Service Values & Ethics",
  },
  "Aptitude": {
    stage: "mains", paper: "GS4", module: "Aptitude & Foundational Values",
  },
  "Case Studies": {
    stage: "mains", paper: "GS4", module: "Case Studies",
  },
  "Emotional Intelligence": {
    stage: "mains", paper: "GS4", module: "Emotional Intelligence",
  },
};

// ── Ambiguous subjects — same label in both prelims & mains ──────────────────
// Resolved by checking the paper label passed via meta.paper.
// SUBJECT_REGISTRY prelims paper labels: "GS Paper I", "CSAT Paper II"
// SUBJECT_REGISTRY mains paper labels:   "GS Paper I", "GS Paper II", "GS Paper III", "GS Paper IV"
// Disambiguate: if meta.paper contains "Paper II/III/IV" → mains.
// "GS Paper I" is shared; further disambiguated by whether the subject label
// is in the prelims or mains color-map (prelims uses "Economy", mains uses "Economy" in GS3).

const AMBIGUOUS_SUBJECT_MAP = {
  // subject label → { prelims: mapping, mains: mapping }
  "Economy": {
    prelims: { stage: "prelims", paper: "GS1", module: "Economic & Social Development" },
    mains:   { stage: "mains",   paper: "GS3", module: "Economic Development & Growth" },
  },
  "Geography": {
    prelims: { stage: "prelims", paper: "GS1", module: "Indian & World Geography" },
    mains:   { stage: "mains",   paper: "GS1", module: "World Physical Geography" },
  },
  "Science & Technology": {
    prelims: { stage: "prelims", paper: "GS1", module: "General Science" },
    mains:   { stage: "mains",   paper: "GS3", module: "Science & Technology" },
  },
  "Art & Culture": {
    prelims: { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
    mains:   { stage: "mains",   paper: "GS1", module: "Indian Art, Culture & Architecture" },
  },
  "Environment": {
    prelims: { stage: "prelims", paper: "GS1", module: "Environment, Ecology & Climate Change" },
    mains:   { stage: "mains",   paper: "GS3", module: "Environment & Disaster Management" },
  },
  "Environment & Ecology": {
    prelims: { stage: "prelims", paper: "GS1", module: "Environment, Ecology & Climate Change" },
    mains:   { stage: "mains",   paper: "GS3", module: "Environment & Disaster Management" },
  },
};

// Paper labels that only appear in mains SUBJECT_REGISTRY
const MAINS_PAPER_LABELS = new Set(["GS Paper II", "GS Paper III", "GS Paper IV"]);

function resolveMapping(subjectLabel, paperLabel) {
  // 1. Check ambiguous map first — needs paper context to decide
  if (AMBIGUOUS_SUBJECT_MAP[subjectLabel]) {
    const isMains = MAINS_PAPER_LABELS.has(paperLabel) ||
      // "GS Paper I" in mains registry has isMains subjects (History, Culture etc)
      // We can't tell from paperLabel alone, so for GS Paper I we check if
      // the subject is a known mains-only label (handled by SUBJECT_TO_SYLLABUS fallthrough)
      false;
    return isMains
      ? AMBIGUOUS_SUBJECT_MAP[subjectLabel].mains
      : AMBIGUOUS_SUBJECT_MAP[subjectLabel].prelims;
  }
  // 2. Unambiguous direct lookup
  return SUBJECT_TO_SYLLABUS[subjectLabel] || null;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useQuestionAttempts({ onSyllabusUpdate, serverAttempts = null } = {}) {
  const [attempts, setAttempts] = useState(() => {
    const local = load();
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

  // Cross-tab sync
  useEffect(() => {
    const sync = () => setAttempts(load());
    window.addEventListener("question-attempt-updated", sync);
    return () => window.removeEventListener("question-attempt-updated", sync);
  }, []);

  // Debounced server sync — batches every 10s
  useEffect(() => {
    if (attempts.length === 0) return;
    const timer = setTimeout(async () => {
      try { await syncQuestionAttempts(attempts); } catch { /* best-effort */ }
    }, 10_000);
    return () => clearTimeout(timer);
  }, [attempts]);

  const attemptedIds = useMemo(() => new Set(attempts.map(a => a.id)), [attempts]);

  const recordAttempt = useCallback((question, result, meta = {}) => {
    const id = question._id || question.id || `q-${Date.now()}`;

    setAttempts(prev => {
      const exists = prev.findIndex(a => a.id === id);
      const record = {
        id,
        questionText: question.questionText || "",
        topic:        question.topic        || "",
        subTopic:     question.subTopic     || "",
        difficulty:   question.difficulty   || "Medium",
        year:         question.year         || null,
        // subject + paper come from subjectMeta passed by SubjectPanel/MainsSubjectPanel
        subject:      meta.subject || "",
        paper:        meta.paper   || "",
        result,                           // "correct" | "wrong" | "skipped" | "attempted"
        attemptedAt:  new Date().toISOString(),
      };

      let next;
      if (exists >= 0) { next = [...prev]; next[exists] = record; }
      else              { next = [record, ...prev]; }

      save(next);
      window.dispatchEvent(new Event("question-attempt-updated"));

      // ── Auto-push progress to SyllabusTracker ────────────────────────────
      if (result !== "skipped" && onSyllabusUpdate) {
        const map = resolveMapping(record.subject, record.paper);
        if (map) {
          // All attempts for this exact subject+paper combination
          const bucket = next.filter(
            a => a.subject === record.subject && a.paper === record.paper
          );
          const correctCount  = bucket.filter(a => a.result === "correct").length;
          const attemptedCount = bucket.filter(a => a.result !== "skipped").length;
          const ratio = attemptedCount > 0 ? correctCount / attemptedCount : 0;

          // For mains essay-style ("attempted"), every attempt counts as progress
          const isEssay = result === "attempted";

          // Progress: 0–90 auto range (last 10% is manual mastery confirmation)
          const progress = isEssay
            ? Math.min(Math.round((bucket.length / 10) * 100), 90)   // 10 essays = 90%
            : Math.min(Math.round(ratio * 100), 90);
   const status =
            ratio >= THRESHOLD ? "progress" :
            ratio >= 0.50      ? "revision" :
            attemptedCount > 0 ? "progress" : "pending";

          onSyllabusUpdate(map.stage, map.paper, map.module, progress, status);
        }
      }

      return next;
    });
  }, [onSyllabusUpdate]);

  const clearAttempts = useCallback(() => {
    save([]);
    setAttempts([]);
    window.dispatchEvent(new Event("question-attempt-updated"));
  }, []);

  return { attempts, attemptedIds, recordAttempt, clearAttempts };
}