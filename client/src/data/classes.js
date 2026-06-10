// ─── YouTube Classes — Free UPSC Content ─────────────────────────────────────
// Top educators with free YouTube playlists for each GS subject.
// All links verified as free public YouTube playlists / channels.

export const YT_LAST_UPDATED = "June 10, 2026";

// ─────────────────────────────────────────────────────────────────────────────
// Each entry:
//   id          : unique string key
//   teacher     : educator's name
//   channel     : YouTube channel name
//   subject     : matches SUBJECTS from ncert_data / broad topic
//   paper       : "Prelims GS1" | "Prelims CSAT" | "GS1" | "GS2" | "GS3" | "GS4" | "Essay" | "General"
//   title       : playlist / course title
//   description : 1-line description
//   url         : YouTube playlist or channel URL
//   language    : "Hindi" | "English" | "Bilingual"
//   totalVideos : approximate count (null if not known)
//   tags        : string[]
// ─────────────────────────────────────────────────────────────────────────────

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
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "vd-ancient-history",
    teacher: "Vikas Divyakriti",
    channel: "Drishti IAS",
    subject: "History",
    paper: "GS1",
    title: "Ancient & Medieval History Complete Course",
    description: "Comprehensive ancient and medieval history by Vikas Sir — from Harappa to Mughals.",
    url: "https://www.youtube.com/@DrishtiIAS/playlists",
    language: "Hindi",
    totalVideos: null,
    tags: ["ancient-history", "medieval-history", "vikas-divyakriti", "drishti-ias"],
  },
  {
    id: "vd-essay",
    teacher: "Vikas Divyakriti",
    channel: "Drishti IAS",
    subject: "Essay",
    paper: "Essay",
    title: "Essay Writing Masterclass for UPSC Mains",
    description: "Essay approach, structure, quotes, and practice by Vikas Sir.",
    url: "https://www.youtube.com/playlist?list=PLZqB8AoG4ZP98oNzMRPQ0mJdcHHMXqNhP",
    language: "Hindi",
    totalVideos: 30,
    tags: ["essay", "mains", "vikas-divyakriti", "writing"],
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
    language: "Hindi",
    totalVideos: null,
    tags: ["current-affairs", "monthly", "drishti-ias"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // KHAN SIR — GS Research Centre (Polity, GS General)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "khan-polity",
    teacher: "Khan Sir",
    channel: "Khan GS Research Centre",
    subject: "Polity",
    paper: "GS2",
    title: "Indian Polity Full Course",
    description: "Polity and constitution in simple Hindi — very popular for concept clarity.",
    url: "https://www.youtube.com/@KhanGSResearchCentre/playlists",
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
    description: "Wide coverage of GS topics with engaging teaching style.",
    url: "https://www.youtube.com/@KhanGSResearchCentre",
    language: "Hindi",
    totalVideos: null,
    tags: ["general", "current-affairs", "khan-sir"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MRUNAL PATEL — Economy, History, Geography (English/Bilingual)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "mrunal-economy",
    teacher: "Mrunal Patel",
    channel: "Mrunal.org",
    subject: "Economics",
    paper: "GS3",
    title: "Indian Economy Full Course for UPSC",
    description: "Best free economy lectures — budget, banking, agriculture and more.",
    url: "https://www.youtube.com/playlist?list=PLm8al35IsNh_xf-HfNXDJbHqEyXB5y_9y",
    language: "Bilingual",
    totalVideos: 80,
    tags: ["economy", "mrunal", "budget", "banking", "agriculture"],
  },
  {
    id: "mrunal-history",
    teacher: "Mrunal Patel",
    channel: "Mrunal.org",
    subject: "History",
    paper: "GS1",
    title: "World History for UPSC Mains GS1",
    description: "World history — Colonialism, World Wars, Cold War, Decolonisation.",
    url: "https://www.youtube.com/playlist?list=PLm8al35IsNh8FWn53SjNaY7x5V7sK2uMu",
    language: "Bilingual",
    totalVideos: 40,
    tags: ["world-history", "mrunal", "colonialism", "cold-war"],
  },
  {
    id: "mrunal-geography",
    teacher: "Mrunal Patel",
    channel: "Mrunal.org",
    subject: "Geography",
    paper: "GS1",
    title: "Geography Full Course — Physical & Indian",
    description: "Physical geography, Indian geography, maps — structured playlist.",
    url: "https://www.youtube.com/playlist?list=PLm8al35IsNh8pKJGIEbDMI3c6IHZiUlWN",
    language: "Bilingual",
    totalVideos: 60,
    tags: ["geography", "physical", "india", "mrunal"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STUDY IQ — Polity, Current Affairs, GS General (Hindi)
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
    language: "Hindi",
    totalVideos: null,
    tags: ["current-affairs", "daily", "studyiq"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNACADEMY — UPSC (Bilingual / English)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "unacademy-polity-sidharth",
    teacher: "Sidharth Arora",
    channel: "Unacademy UPSC",
    subject: "Polity",
    paper: "GS2",
    title: "Polity by Sidharth Arora",
    description: "In-depth polity sessions — frequently recommended by toppers.",
    url: "https://www.youtube.com/@UnacademyIASEnglish/playlists",
    language: "English",
    totalVideos: null,
    tags: ["polity", "sidharth-arora", "unacademy", "english"],
  },
  {
    id: "unacademy-economy",
    teacher: "Ayussh Sanghi",
    channel: "Unacademy UPSC",
    subject: "Economics",
    paper: "GS3",
    title: "Indian Economy by Ayussh Sanghi",
    description: "Macroeconomics, fiscal policy, monetary policy explained simply.",
    url: "https://www.youtube.com/@UnacademyIASEnglish/playlists",
    language: "English",
    totalVideos: null,
    tags: ["economy", "ayussh-sanghi", "unacademy", "fiscal"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHANKAR IAS ACADEMY — Environment (Tamil Nadu focused, all-India popular)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "shankar-environment",
    teacher: "Shankar IAS Faculty",
    channel: "Shankar IAS Academy",
    subject: "Environment",
    paper: "GS3",
    title: "Environment & Ecology Complete Series",
    description: "Best free environment lectures — biodiversity, conventions, climate change.",
    url: "https://www.youtube.com/@ShankarIASAcademy/playlists",
    language: "Bilingual",
    totalVideos: null,
    tags: ["environment", "ecology", "shankar", "biodiversity", "climate"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PMFIAS (P.M. Ias) — Geography (English)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pmfias-geography",
    teacher: "P.M. Ias",
    channel: "PMFIAS",
    subject: "Geography",
    paper: "GS1",
    title: "Geography Masterclass — Physical, Human & Indian",
    description: "Detailed geography notes and video series — excellent for Mains.",
    url: "https://www.youtube.com/@PMF_IAS/playlists",
    language: "English",
    totalVideos: null,
    tags: ["geography", "pmfias", "physical", "human", "india"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LAXMIKANTH — Polity (No direct YouTube, but Vision IAS covers it)
  // VISION IAS — All GS topics (Hindi + English)
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
    language: "Bilingual",
    totalVideos: null,
    tags: ["vision-ias", "gs", "current-affairs", "prelims", "mains"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BYJU'S IAS — Polity, History, Geography (English)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "byjus-history",
    teacher: "Byju's IAS Faculty",
    channel: "BYJU'S IAS",
    subject: "History",
    paper: "GS1",
    title: "Modern History for UPSC — Complete",
    description: "Modern Indian history — 1857 to Independence, nationalism, movements.",
    url: "https://www.youtube.com/@BYJUSIASOfficial/playlists",
    language: "English",
    totalVideos: null,
    tags: ["modern-history", "byjus", "freedom-struggle", "nationalism"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRATIK NAYAK — Art & Culture (English, very popular)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pratik-art-culture",
    teacher: "Pratik Nayak",
    channel: "Pratik Nayak",
    subject: "History",
    paper: "Prelims GS1",
    title: "Indian Art & Culture for UPSC",
    description: "Art & Culture — architecture, painting, dance, music — very concise.",
    url: "https://www.youtube.com/@PratikNayak/playlists",
    language: "English",
    totalVideos: null,
    tags: ["art", "culture", "architecture", "dance", "music", "prelims"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NITIN SANGWAN — Ethics (IAS 2015 AIR 28, famous for Ethics)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "nitin-sangwan-ethics",
    teacher: "Nitin Sangwan",
    channel: "Nitin Sangwan",
    subject: "Ethics",
    paper: "GS4",
    title: "Ethics Integrity & Aptitude — Complete Guidance",
    description: "Ethics GS4 by IAS topper Nitin Sangwan — theory, case studies, approach.",
    url: "https://www.youtube.com/@NitinSangwan/playlists",
    language: "Hindi",
    totalVideos: null,
    tags: ["ethics", "gs4", "integrity", "aptitude", "nitin-sangwan", "ias-topper"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CSAT — Reasoning & Aptitude
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
    language: "Hindi",
    totalVideos: null,
    tags: ["csat", "reasoning", "aptitude", "maths", "paper-2"],
  },
  {
    id: "csat-maths-mrunal",
    teacher: "Mrunal Patel",
    channel: "Mrunal.org",
    subject: "CSAT",
    paper: "Prelims CSAT",
    title: "CSAT Paper 2 — Maths & Data Interpretation",
    description: "Mrunal's CSAT maths playlist — percentage, ratio, DI, comprehension.",
    url: "https://www.youtube.com/playlist?list=PLm8al35IsNh_bkRhfCBKJNzRRETaIpB1V",
    language: "Bilingual",
    totalVideos: 25,
    tags: ["csat", "maths", "di", "percentage", "mrunal"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE & TECHNOLOGY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "sci-tech-studyiq",
    teacher: "Study IQ Team",
    channel: "Study IQ Education",
    subject: "Science & Technology",
    paper: "GS3",
    title: "Science & Technology for UPSC Prelims & Mains",
    description: "Space, defence, biotech, AI, environment tech — free lecture series.",
    url: "https://www.youtube.com/@StudyIQEducation/playlists",
    language: "Hindi",
    totalVideos: null,
    tags: ["science", "technology", "space", "defence", "ai", "biotech"],
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
    language: "Bilingual",
    totalVideos: null,
    tags: ["science", "technology", "monthly", "vision-ias"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNATIONAL RELATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ir-the-hindu",
    teacher: "The Hindu Analysis",
    channel: "The Hindu",
    subject: "General",
    paper: "GS2",
    title: "The Hindu Editorial Analysis (Daily)",
    description: "Daily editorial analysis — builds IR, governance, and current affairs.",
    url: "https://www.youtube.com/@TheHindu/playlists",
    language: "English",
    totalVideos: null,
    tags: ["editorial", "the-hindu", "ir", "governance", "daily"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DISASTER MANAGEMENT & INTERNAL SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "disaster-mgmt-studyiq",
    teacher: "Study IQ Team",
    channel: "Study IQ Education",
    subject: "General",
    paper: "GS3",
    title: "Disaster Management & Internal Security",
    description: "NDMA framework, Sendai, internal security challenges for GS3.",
    url: "https://www.youtube.com/@StudyIQEducation/playlists",
    language: "Hindi",
    totalVideos: null,
    tags: ["disaster-management", "internal-security", "ndma", "gs3"],
  },
];