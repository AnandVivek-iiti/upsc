// ─── Reference Books Stack ────────────────────────────────────────────────────
// Standard UPSC reference books used across Prelims & Mains GS papers.
//
// IMPORTANT — no "buy" links here anymore. Every book opens as a PDF, the same
// way NCERT books and notes do. There are two ways a book gets a working
// "Open PDF" button:
//   1. filePath — point this at your own scanned/owned copy on disk, served
//      via /api/refbooks/file (mirrors how ncert_data.js and notes_data.js work).
//   2. url — ONLY used for resources that are genuinely free & official
//      (government portals, official magazine archives). Commercial/copyrighted
//      coaching books (Laxmikanth, Spectrum, Shankar IAS, etc.) intentionally
//      have no url here — there's no legitimate free copy of those online, so
//      add your own PDF via filePath instead.
//
// If both filePath and url are null, the card shows "Add Your PDF" and is
// disabled until you fill one in.

export const REF_BOOKS_LAST_UPDATED = "June 18, 2026";

// ─────────────────────────────────────────────────────────────────────────────
// Each entry:
//   id        : unique string key
//   paper     : primary GS paper relevance
//   module    : syllabus module
//   title     : book title
//   author    : author / publication
//   edition   : latest edition year (update when new editions release)
//   filePath  : absolute path to YOUR OWN pdf on disk — served via /api/refbooks/file
//   url       : free + official link only (govt portal / official archive). null if none exists.
//   priority  : "must-read" | "recommended" | "optional"
//   tags      : array of string tags
// ─────────────────────────────────────────────────────────────────────────────

export const REF_BOOK_PAPERS = [
  "Prelims GS1",
  "Prelims CSAT",
  "GS1",
  "GS2",
  "GS3",
  "GS4",
  "Essay",
  "General",
];

export const PRIORITY_COLORS = {
  "must-read":    "#f87171",
  "recommended":  "#60a5fa",
  "optional":     "#a78bfa",
};

export const REFERENCE_BOOKS = [

  // ═══════════════════════════════════════════════════════════════════════════
  // PRELIMS GS1 — HISTORY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-hist-bipin",
    paper: "Prelims GS1",
    module: "Modern History",
    title: "India's Struggle for Independence",
    author: "Bipan Chandra",
    edition: "2016",
    filePath: null,  // e.g. "C:/UPSC/RefBooks/BipanChandra.pdf"
    url: null,       // no legitimate free copy — add your own scanned PDF
    priority: "must-read",
    tags: ["modern-history", "freedom-struggle", "nationalism", "bipan-chandra"],
  },
  {
    id: "ref-hist-spectrum",
    paper: "Prelims GS1",
    module: "Modern History",
    title: "A Brief History of Modern India (Spectrum)",
    author: "Rajiv Ahir",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["modern-history", "spectrum", "upsc-standard", "brief"],
  },
  {
    id: "ref-hist-satish",
    paper: "GS1",
    module: "Ancient & Medieval History",
    title: "History of Medieval India",
    author: "Satish Chandra",
    edition: "2018",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["medieval-history", "satish-chandra", "sultanate", "mughal"],
  },
  {
    id: "ref-hist-rs-sharma",
    paper: "GS1",
    module: "Ancient History",
    title: "Ancient India (Old NCERT)",
    author: "R.S. Sharma",
    edition: "1977",
    filePath: null,  // withdrawn from NCERT's official catalogue, no authorized free copy online
    url: null,
    priority: "recommended",
    tags: ["ancient-history", "rs-sharma", "vedic", "maurya", "gupta"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRELIMS GS1 — ART & CULTURE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-art-nitin",
    paper: "Prelims GS1",
    module: "Art & Culture",
    title: "Indian Art and Culture",
    author: "Nitin Singhania",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["art", "culture", "architecture", "music", "nitin-singhania"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRELIMS GS1 — GEOGRAPHY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-geo-certificate",
    paper: "Prelims GS1",
    module: "Physical Geography",
    title: "Certificate Physical and Human Geography",
    author: "Goh Cheng Leong",
    edition: "2019",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["geography", "physical", "human", "goh-cheng-leong"],
  },
  {
    id: "ref-geo-majid-hussain",
    paper: "GS1",
    module: "Indian Geography",
    title: "Geography of India",
    author: "Majid Husain",
    edition: "2021",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["geography", "india", "majid-husain", "upsc-mains"],
  },
  {
    id: "ref-geo-atlas",
    paper: "Prelims GS1",
    module: "Geography",
    title: "Oxford Student Atlas for India",
    author: "Oxford Press",
    edition: "2022",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["atlas", "maps", "geography", "oxford"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GS2 — POLITY & GOVERNANCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-pol-laxmikanth",
    paper: "GS2",
    module: "Indian Polity",
    title: "Indian Polity",
    author: "M. Laxmikanth",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["polity", "constitution", "laxmikanth", "upsc-bible"],
  },
  {
    id: "ref-pol-dd-basu",
    paper: "GS2",
    module: "Indian Constitution",
    title: "Introduction to the Constitution of India",
    author: "D.D. Basu",
    edition: "2022",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["constitution", "dd-basu", "articles", "legal"],
  },
  {
    id: "ref-governance-second-arc",
    paper: "GS2",
    module: "Governance",
    title: "Second Administrative Reforms Commission Reports",
    author: "Government of India",
    edition: "2009",
    filePath: null,
    url: "https://darpg.gov.in/en/arc-reports",  // official, free — all 15 reports
    priority: "recommended",
    tags: ["governance", "arc", "administrative-reform", "e-governance"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GS2 — INTERNATIONAL RELATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-ir-pavneet",
    paper: "GS2",
    module: "International Relations",
    title: "International Relations",
    author: "Pavneet Singh",
    edition: "2022",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["international-relations", "foreign-policy", "pavneet-singh"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GS3 — ECONOMY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-eco-ramesh-singh",
    paper: "GS3",
    module: "Indian Economy",
    title: "Indian Economy",
    author: "Ramesh Singh",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["economy", "ramesh-singh", "indian-economy", "upsc"],
  },
  {
    id: "ref-eco-survey",
    paper: "GS3",
    module: "Indian Economy",
    title: "Economic Survey (Annual)",
    author: "Ministry of Finance, GoI",
    edition: "2024-25",
    filePath: null,
    url: "https://www.indiabudget.gov.in/economicsurvey/",  // official, free PDF per chapter
    priority: "must-read",
    tags: ["economy", "economic-survey", "annual", "budget", "data"],
  },
  {
    id: "ref-eco-budget",
    paper: "GS3",
    module: "Indian Economy",
    title: "Union Budget Documents (Annual)",
    author: "Ministry of Finance, GoI",
    edition: "2025-26",
    filePath: null,
    url: "https://www.indiabudget.gov.in/",  // official, free
    priority: "must-read",
    tags: ["economy", "budget", "fiscal", "annual"],
  },
  {
    id: "ref-eco-uma-kapila",
    paper: "GS3",
    module: "Indian Economy",
    title: "Indian Economy Since Independence",
    author: "Uma Kapila",
    edition: "2022",
    filePath: null,
    url: null,
    priority: "optional",
    tags: ["economy", "uma-kapila", "post-independence", "development"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GS3 — SCIENCE & TECHNOLOGY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-sci-raven",
    paper: "GS3",
    module: "Science & Technology",
    title: "Science & Technology for UPSC CSE",
    author: "Ravi P. Agrahari",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["science", "technology", "upsc", "space", "biotech"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GS3 — ENVIRONMENT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-env-shankar",
    paper: "GS3",
    module: "Environment & Ecology",
    title: "Environment (for Civil Services Examinations)",
    author: "Shankar IAS Academy",
    edition: "2024",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["environment", "ecology", "biodiversity", "shankar", "conventions"],
  },
  {
    id: "ref-env-down-to-earth",
    paper: "GS3",
    module: "Environment",
    title: "Down to Earth Magazine",
    author: "Centre for Science and Environment",
    edition: "2026",
    filePath: null,
    url: "https://www.downtoearth.org.in/",  // free articles on official site
    priority: "recommended",
    tags: ["environment", "current-affairs", "cse", "down-to-earth"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GS3 — INTERNAL SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-security-ashok-kumar",
    paper: "GS3",
    module: "Internal Security",
    title: "Internal Security Challenges in India",
    author: "Ashok Kumar & Vipul Anekant",
    edition: "2022",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["internal-security", "naxalism", "terrorism", "border"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GS4 — ETHICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-ethics-lexicon",
    paper: "GS4",
    module: "Ethics Theory",
    title: "Lexicon for Ethics, Integrity & Aptitude",
    author: "Chronicle IAS",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["ethics", "integrity", "lexicon", "chronicle"],
  },
  {
    id: "ref-ethics-subba-rao",
    paper: "GS4",
    module: "Ethics Theory & Case Studies",
    title: "Ethics, Integrity and Aptitude for Civil Services",
    author: "G. Subba Rao & P.N. Roy Chowdhury",
    edition: "2022",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["ethics", "case-studies", "aptitude", "subba-rao"],
  },
  {
    id: "ref-ethics-nanda",
    paper: "GS4",
    module: "Ethics — Thinkers",
    title: "A New Approach to UPSC Civil Services Ethics",
    author: "Nanda Kishore Reddy",
    edition: "2022",
    filePath: null,
    url: null,
    priority: "optional",
    tags: ["ethics", "thinkers", "philosophers", "moral"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ESSAY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-essay-pulkit",
    paper: "Essay",
    module: "Essay Writing",
    title: "151 Essays for UPSC Mains",
    author: "Disha Experts",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["essay", "mains", "upsc", "writing"],
  },
  {
    id: "ref-essay-arihant",
    paper: "Essay",
    module: "Essay Writing",
    title: "Essays for Civil Services",
    author: "Arihant Experts",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "optional",
    tags: ["essay", "civil-services", "arihant"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRELIMS CSAT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-csat-tmh",
    paper: "Prelims CSAT",
    module: "Quantitative Aptitude & Reasoning",
    title: "CSAT Paper 2 Manual",
    author: "TMH Editorial Board",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "must-read",
    tags: ["csat", "paper-2", "aptitude", "reasoning", "tmh"],
  },
  {
    id: "ref-csat-arihant",
    paper: "Prelims CSAT",
    module: "General Mental Ability",
    title: "UPSC CSAT Compendium",
    author: "Arihant Experts",
    edition: "2023",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["csat", "mental-ability", "upsc", "arihant"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL — CURRENT AFFAIRS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-ca-vision",
    paper: "General",
    module: "Current Affairs",
    title: "Vision IAS Monthly Current Affairs Magazine",
    author: "Vision IAS",
    edition: "2026",
    filePath: null,
    url: "https://visionias.in/current-affairs/monthly-magazine",  // official, needs free account login
    priority: "must-read",
    tags: ["current-affairs", "vision-ias", "monthly", "magazine"],
  },
  {
    id: "ref-ca-pib",
    paper: "General",
    module: "Current Affairs",
    title: "PIB (Press Information Bureau) Daily",
    author: "Government of India",
    edition: "2026",
    filePath: null,
    url: "https://pib.gov.in/",  // official, fully free
    priority: "must-read",
    tags: ["current-affairs", "pib", "government", "daily"],
  },
  {
    id: "ref-ca-hindu",
    paper: "General",
    module: "Current Affairs",
    title: "The Hindu Newspaper (Daily reading)",
    author: "The Hindu Group",
    edition: "2026",
    filePath: null,
    url: "https://www.thehindu.com/",
    priority: "must-read",
    tags: ["current-affairs", "newspaper", "the-hindu", "daily"],
  },
  {
    id: "ref-ca-yojana",
    paper: "General",
    module: "Current Affairs",
    title: "Yojana Magazine (Monthly)",
    author: "Publications Division, GoI",
    edition: "2026",
    filePath: null,
    url: "https://www.publicationsdivision.nic.in/journals/index.php?route=page/archives",  // official, free PDF archive
    priority: "recommended",
    tags: ["current-affairs", "yojana", "government", "schemes", "magazine"],
  },
  {
    id: "ref-ca-kurukshetra",
    paper: "General",
    module: "Current Affairs",
    title: "Kurukshetra Magazine (Monthly — Rural Dev)",
    author: "Publications Division, GoI",
    edition: "2026",
    filePath: null,
    url: "https://www.publicationsdivision.nic.in/journals/index.php?route=page/archives",  // official, free PDF archive
    priority: "recommended",
    tags: ["current-affairs", "kurukshetra", "rural-development", "agriculture"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL — COMPILATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ref-gen-gs-score",
    paper: "General",
    module: "GS Preparation",
    title: "GS Score Integrated Study Materials",
    author: "GS Score",
    edition: "2024",
    filePath: null,
    url: "https://www.gsscore.com/study-material",  // free downloadable notes
    priority: "optional",
    tags: ["gs", "integrated", "study-material", "gsscore"],
  },
];