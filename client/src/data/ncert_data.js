// ─── NCERT Stack — Placeholder ───────────────────────────────────────────────
// File routes will be added from local storage by the user.
// Structure: each entry maps a class/subject to a local file path or URL.
// Add your entries below in the NCERT_BOOKS array.

export const NCERT_LAST_UPDATED = "June 5, 2026";

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD YOUR BOOKS
// Each object needs:
//   id        : unique string key  (e.g. "hist-6")
//   class     : number 6–12
//   subject   : one of the SUBJECTS below
//   title     : display title
//   filePath  : absolute or relative path on your machine (will be served via
//               the /api/ncert/file route you configure in server.js)
//   url       : optional fallback URL (NCERT website PDF link)
//   done      : boolean — have you finished reading it?
// ─────────────────────────────────────────────────────────────────────────────

export const SUBJECTS = [
  "History",
  "Geography",
  "Polity",
  "Economics",
  "Science",
  "Sociology",
  "Environment",
];

// Subject → papers it is most relevant for
export const SUBJECT_PAPER_MAP = {
  History:     ["GS1 (Mains)", "Prelims GS1"],
  Geography:   ["GS1 (Mains)", "Prelims GS1"],
  Polity:      ["GS2 (Mains)", "Prelims GS1"],
  Economics:   ["GS3 (Mains)", "Prelims GS1"],
  Science:     ["GS3 (Mains)", "Prelims GS1"],
  Sociology:   ["GS1 (Mains)", "Prelims GS1"],
  Environment: ["GS3 (Mains)", "Prelims GS1"],
};

// ─── ADD YOUR FILE PATHS BELOW ────────────────────────────────────────────────
export const NCERT_BOOKS = [
  // Example (uncomment and fill your real paths):
  // {
  //   id: "hist-6",
  //   class: 6,
  //   subject: "History",
  //   title: "Our Pasts I",
  //   filePath: null,          // e.g. "C:/NCERT/History/Class6_OurPastsI.pdf"
  //   url: "https://ncert.nic.in/textbook.php?fhss1=0-8",
  //   done: false,
  // },
  // {
  //   id: "hist-7",
  //   class: 7,
  //   subject: "History",
  //   title: "Our Pasts II",
  //   filePath: null,
  //   url: "https://ncert.nic.in/textbook.php?ghss1=0-10",
  //   done: false,
  // },
];