/**
 * subjectConstants.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all UPSC subject metadata:
 *   UPSC_SUBJECTS - canonical ordered list
 *   SUBJECT_COLORS - one accent colour per subject (hex)
 *   SUBJECT_ICONS  - one emoji per subject
 *
 * Kept in /data so plain data lives separately from hook logic.
 * Imported by: useSubjectTimer.js, UserTimeline.jsx, SubjectStudyTimer.jsx,
 *              SubjectAnalyticsDashboard.jsx (and any future consumers).
 *
 * Keep in sync with the ENUM in subjectSessionController.js.
 */

export const UPSC_SUBJECTS = [
  "History",
  "Polity",
  "Economy",
  "Geography",
  "Environment",
  "Science & Tech",
  "CSAT",
  "Ethics",
  "Essay",
  "Optional",
  "Current Affairs",
  "Other",
];

export const SUBJECT_COLORS = {
  History:           "#f59e0b",
  Polity:            "#6366f1",
  Economy:           "#10b981",
  Geography:         "#06b6d4",
  Environment:       "#84cc16",
  "Science & Tech":  "#8b5cf6",
  CSAT:              "#f43f5e",
  Ethics:            "#ec4899",
  Essay:             "#14b8a6",
  Optional:          "#fb923c",
  "Current Affairs": "#3b82f6",
  Other:             "#94a3b8",
};

export const SUBJECT_ICONS = {
  History:           "📜",
  Polity:            "⚖️",
  Economy:           "📈",
  Geography:         "🗺️",
  Environment:       "🌿",
  "Science & Tech":  "🔬",
  CSAT:              "🧮",
  Ethics:            "🧭",
  Essay:             "✍️",
  Optional:          "📖",
  "Current Affairs": "📰",
  Other:             "📚",
};