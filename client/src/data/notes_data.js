// ─── Notes Stack — Placeholder ───────────────────────────────────────────────
// File routes will be added from local storage by the user.
// Add your note files/folders below in the NOTES array.

export const NOTES_LAST_UPDATED = "June 5, 2026";

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD YOUR NOTES
// Each object needs:
//   id        : unique string key  (e.g. "gs1-art-culture")
//   paper     : "Prelims GS1" | "Prelims CSAT" | "GS1" | "GS2" | "GS3" |
//               "GS4" | "Essay" | "Optional" | "General"
//   module    : the syllabus module name (matches syllabusData.js)
//   title     : display title for the note
//   type      : "pdf" | "docx" | "txt" | "md" | "image" | "link"
//   filePath  : absolute path on your machine — served via /api/notes/file
//   url       : optional web URL (Google Drive, Notion, etc.)
//   tags      : array of string tags for quick filtering
//   createdAt : ISO date string
// ─────────────────────────────────────────────────────────────────────────────

export const NOTE_PAPERS = [
  "Prelims GS1",
  "Prelims CSAT",
  "GS1",
  "GS2",
  "GS3",
  "GS4",
  "Essay",
  "Optional",
  "General",
];

// ─── ADD YOUR FILE PATHS BELOW ────────────────────────────────────────────────
export const NOTES = [
  // Example (uncomment and fill your real paths):
  {
    id: "gs2-const-notes",
    paper: "GS2",
    module: "Indian Constitution",
    title: "Constitution — Articles Summary",
    type: "pdf",
    filePath: null,   // e.g. "C:/UPSC/Notes/GS2/Constitution_Articles.pdf"
    url: null,        // or a Google Drive share link
    tags: ["constitution", "articles", "preamble"],
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "gs3-economy-notes",
    paper: "GS3",
    module: "Indian Economy",
    title: "Economy Handwritten Notes",
    type: "pdf",
    filePath: null,
    url: null,
    tags: ["economy", "planning", "budget"],
    createdAt: "2026-06-01T00:00:00.000Z",
  },
];