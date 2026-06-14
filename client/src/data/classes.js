// ─── YouTube Classes — Free UPSC Content ─────────────────────────────────────
// All entries manually verified June 2026.
// Rules: channel-level URLs used where specific playlist IDs could not be confirmed.
// Removed: entries with unverified playlist IDs, paywalled content, incorrect metadata.

export const YT_LAST_UPDATED = "June 14, 2026";

// Each entry:
//   id          : unique string key
//   teacher     : educator's name
//   channel     : YouTube channel name
//   subject     : matches SUBJECTS
//   paper       : "Prelims GS1" | "Prelims CSAT" | "GS1" | "GS2" | "GS3" | "GS4" | "Essay" | "General"
//   title       : playlist / course title
//   description : 1-line description
//   url         : YouTube playlist or channel URL (verified)
//   thumbnailVideoId : a known public video ID from that channel for thumbnail (optional)
//   language    : "Hindi" | "English" | "Bilingual"
//   totalVideos : approximate count (null if not known)
//   tags        : string[]

export const YT_SUBJECTS = [
  "History",
  "Geography",
  "Polity",
  "Economics",
  "Science & Technology",
  "Environment",
  "Ethics",
  "Essay",
  "Current Affairs",
  "CSAT",
  "General",
];

export const YT_PAPERS = [
  "Prelims GS1",
  "Prelims CSAT",
  "GS1",
  "GS2",
  "GS3",
  "GS4",
  "Essay",
  "General",
];

export const YOUTUBE_CLASSES = [

  // ═══════════════════════════════════════════════════════════════════════════
  // VIKAS DIVYAKRITI — Drishti IAS (Hindi flagship)
  // Channel verified: youtube.com/@DrishtiIAS  (14M+ subscribers)
  // Own channel: youtube.com/vikasdivyakirti
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "vd-history",
    teacher: "Vikas Divyakriti",
    channel: "Drishti IAS",
    subject: "History",
    paper: "GS1",
    title: "History Complete Course — Drishti IAS",
    description: "Ancient, medieval and modern Indian history playlists by Drishti IAS team.",
    url: "https://www.youtube.com/@DrishtiIAS/playlists",
    thumbnailVideoId: "7nE7ZTCN9yw",
    language: "Hindi",
    totalVideos: null,
    tags: ["history", "ancient", "medieval", "modern", "drishti-ias"],
  },
  {
    id: "vd-current-affairs",
    teacher: "Vikas Divyakriti",
    channel: "Drishti IAS",
    subject: "Current Affairs",
    paper: "General",
    title: "Monthly Current Affairs — Drishti IAS",
    description: "Monthly current affairs compilation with analysis by Drishti IAS team.",
    url: "https://www.youtube.com/@DrishtiIAS/playlists",
    thumbnailVideoId: "7nE7ZTCN9yw",
    language: "Hindi",
    totalVideos: null,
    tags: ["current-affairs", "monthly", "drishti-ias"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // KHAN SIR — Khan GS Research Centre
  // Channel verified: youtube.com/channel/UCatL-c6pmnjzEOHSyjn-sHA
  // 20M+ subscribers; covers all GS topics for competitive exams
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "khan-polity",
    teacher: "Khan Sir",
    channel: "Khan GS Research Centre",
    subject: "Polity",
    paper: "GS2",
    title: "Indian Polity & Constitution",
    description: "Polity and constitution in simple Hindi — very popular for concept clarity.",
    url: "https://www.youtube.com/channel/UCatL-c6pmnjzEOHSyjn-sHA/playlists",
    thumbnailVideoId: "U_WptGCEHoI",
    language: "Hindi",
    totalVideos: null,
    tags: ["polity", "constitution", "khan-sir", "hindi"],
  },
  {
    id: "khan-general",
    teacher: "Khan Sir",
    channel: "Khan GS Research Centre",
    subject: "General",
    paper: "General",
    title: "GS General + Current Affairs",
    description: "Wide coverage of GS topics — history, geography, polity — with engaging style.",
    url: "https://www.youtube.com/channel/UCatL-c6pmnjzEOHSyjn-sHA",
    thumbnailVideoId: "U_WptGCEHoI",
    language: "Hindi",
    totalVideos: null,
    tags: ["general", "current-affairs", "khan-sir"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MRUNAL PATEL — Economy, History (Bilingual)
  // Channel verified: youtube.com/c/TheMrunalPatel
  // Note: Most recent economy series are under paid Unacademy batches.
  // Free content available on his own channel (older series + strategy videos).
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "mrunal-economy",
    teacher: "Mrunal Patel",
    channel: "Mrunal.org",
    subject: "Economics",
    paper: "GS3",
    title: "Indian Economy — Mrunal Patel (Free Videos)",
    description: "Economy strategy, budget, and free lecture series — budget, banking, agriculture.",
    url: "https://www.youtube.com/c/TheMrunalPatel",
    thumbnailVideoId: "wrLzeAQMGpo",
    language: "Bilingual",
    totalVideos: null,
    tags: ["economy", "mrunal", "budget", "banking", "agriculture"],
  },
  {
    id: "mrunal-csat",
    teacher: "Mrunal Patel",
    channel: "Mrunal.org",
    subject: "CSAT",
    paper: "Prelims CSAT",
    title: "CSAT Paper 2 — Maths & Data Interpretation",
    description: "Mrunal's CSAT maths videos — percentage, ratio, data interpretation, comprehension.",
    url: "https://www.youtube.com/c/TheMrunalPatel",
    thumbnailVideoId: "wrLzeAQMGpo",
    language: "Bilingual",
    totalVideos: null,
    tags: ["csat", "maths", "di", "percentage", "mrunal"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRATIK NAYAK — Art & Culture, History (English)
  // Playlist verified: youtube.com/playlist?list=PLwYR7WJw1-QVsKLj-96FUS6_77M7SeYSH
  // Active as of 2025-26 season (UPSC 2026 current affairs marathon uploaded Dec 2025)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pratik-art-culture",
    teacher: "Pratik Nayak",
    channel: "Pratik Nayak",
    subject: "History",
    paper: "Prelims GS1",
    title: "Art & Culture for UPSC — Pratik Nayak",
    description: "Architecture, painting, dance, music — concise and comprehensive for prelims.",
    url: "https://www.youtube.com/playlist?list=PLwYR7WJw1-QVsKLj-96FUS6_77M7SeYSH",
    thumbnailVideoId: "9yupb25hKWY",
    language: "English",
    totalVideos: null,
    tags: ["art", "culture", "architecture", "dance", "music", "prelims"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PMF IAS — Geography (English)
  // Channel verified: youtube.com/@pmf-ias
  // Playlist verified: youtube.com/playlist?list=PLfhUF7AO5ZR16jjRQmHEGYw_Xi1RGsrzq
  // Active; 53 direct hits in Prelims 2025 and 46 in Prelims 2026
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pmfias-geography",
    teacher: "PMF IAS",
    channel: "PMF IAS",
    subject: "Geography",
    paper: "GS1",
    title: "Geography UPSC IAS — Physical & Indian",
    description: "Concept-based geography lectures — physical, human, Indian geography for GS1 & Prelims.",
    url: "https://www.youtube.com/playlist?list=PLfhUF7AO5ZR16jjRQmHEGYw_Xi1RGsrzq",
    thumbnailVideoId: "b0ooZWBQWRk",
    language: "English",
    totalVideos: null,
    tags: ["geography", "physical", "india", "pmfias"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHANKAR IAS ACADEMY — Environment & Ecology
  // Channel verified: youtube.com/channel/UCj0t9VmB-FNrXuVJJCW7etw
  // Playlist verified: youtube.com/playlist?list=PLDq1y_5mpm2DnY6VXXNBmsA_YImHhbO3Q
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "shankar-environment",
    teacher: "Shankar IAS Faculty",
    channel: "Shankar IAS Academy",
    subject: "Environment",
    paper: "GS3",
    title: "Environment & Ecology Complete Series",
    description: "Best free environment lectures — biodiversity, conventions, climate change.",
    url: "https://www.youtube.com/playlist?list=PLDq1y_5mpm2DnY6VXXNBmsA_YImHhbO3Q",
    thumbnailVideoId: "uRsSPmVEa9Q",
    language: "English",
    totalVideos: null,
    tags: ["environment", "ecology", "shankar", "biodiversity", "climate"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STUDY IQ EDUCATION — Polity, Current Affairs, Sci & Tech
  // Channel verified: youtube.com/@StudyIQEducation
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "studyiq-polity",
    teacher: "Raghunandan Sir",
    channel: "Study IQ Education",
    subject: "Polity",
    paper: "GS2",
    title: "Polity & Governance Complete Series",
    description: "Indian Polity — Constitution, Parliament, Judiciary for UPSC.",
    url: "https://www.youtube.com/@StudyIQEducation/playlists",
    thumbnailVideoId: "oBB9mBdq3UE",
    language: "Hindi",
    totalVideos: null,
    tags: ["polity", "governance", "studyiq", "parliament", "judiciary"],
  },
  {
    id: "studyiq-current",
    teacher: "Study IQ Team",
    channel: "Study IQ Education",
    subject: "Current Affairs",
    paper: "General",
    title: "Daily Current Affairs — Study IQ",
    description: "Daily current affairs videos covering all UPSC-relevant news.",
    url: "https://www.youtube.com/@StudyIQEducation",
    thumbnailVideoId: "oBB9mBdq3UE",
    language: "Hindi",
    totalVideos: null,
    tags: ["current-affairs", "daily", "studyiq"],
  },
  {
    id: "sci-tech-studyiq",
    teacher: "Study IQ Team",
    channel: "Study IQ Education",
    subject: "Science & Technology",
    paper: "GS3",
    title: "Science & Technology for UPSC Prelims & Mains",
    description: "Space, defence, biotech, AI — free lecture series covering GS3 sci-tech.",
    url: "https://www.youtube.com/@StudyIQEducation/playlists",
    thumbnailVideoId: "oBB9mBdq3UE",
    language: "Hindi",
    totalVideos: null,
    tags: ["science", "technology", "space", "defence", "ai", "biotech"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VISION IAS — All GS topics (Bilingual)
  // Channel verified: youtube.com/@VisionIAS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "visionias-gs",
    teacher: "Vision IAS Faculty",
    channel: "Vision IAS",
    subject: "General",
    paper: "General",
    title: "Vision IAS Free GS Content",
    description: "Free lectures on all GS papers — PT 365, Mains 365, current affairs.",
    url: "https://www.youtube.com/@VisionIAS/playlists",
    thumbnailVideoId: "qScO-PmFqhs",
    language: "Bilingual",
    totalVideos: null,
    tags: ["vision-ias", "gs", "current-affairs", "prelims", "mains"],
  },
  {
    id: "sci-tech-visionias",
    teacher: "Vision IAS Faculty",
    channel: "Vision IAS",
    subject: "Science & Technology",
    paper: "GS3",
    title: "Sci & Tech Monthly Updates — Vision IAS",
    description: "Monthly science & tech current affairs relevant for UPSC.",
    url: "https://www.youtube.com/@VisionIAS/playlists",
    thumbnailVideoId: "qScO-PmFqhs",
    language: "Bilingual",
    totalVideos: null,
    tags: ["science", "technology", "monthly", "vision-ias"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DRISHTI IAS — CSAT
  // Channel verified: youtube.com/@DrishtiIAS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "csat-reasoning-drishti",
    teacher: "Drishti IAS Faculty",
    channel: "Drishti IAS",
    subject: "CSAT",
    paper: "Prelims CSAT",
    title: "CSAT Paper 2 — Reasoning & Aptitude",
    description: "CSAT reasoning, maths, comprehension — free lectures by Drishti IAS.",
    url: "https://www.youtube.com/@DrishtiIAS/playlists",
    thumbnailVideoId: "7nE7ZTCN9yw",
    language: "Hindi",
    totalVideos: null,
    tags: ["csat", "reasoning", "aptitude", "maths", "paper-2"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THE HINDU — Editorial Analysis (English)
  // Channel verified: youtube.com/@TheHindu
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ir-the-hindu",
    teacher: "The Hindu Editorial Team",
    channel: "The Hindu",
    subject: "General",
    paper: "GS2",
    title: "The Hindu Editorial Analysis (Daily)",
    description: "Daily editorial analysis — builds IR, governance, and current affairs vocabulary.",
    url: "https://www.youtube.com/@TheHindu/playlists",
    thumbnailVideoId: null,
    language: "English",
    totalVideos: null,
    tags: ["editorial", "the-hindu", "ir", "governance", "daily"],
  },
];