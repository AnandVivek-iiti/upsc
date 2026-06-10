// ─── Reference Books Stack ────────────────────────────────────────────────────
// Standard UPSC reference books used across Prelims & Mains GS papers.
// Links point to the publisher's site or Amazon India product pages.

export const REF_BOOKS_LAST_UPDATED = "June 10, 2026";

// ─────────────────────────────────────────────────────────────────────────────
// Each entry:
//   id        : unique string key
//   paper     : primary GS paper relevance
//   module    : syllabus module
//   title     : book title
//   author    : author / publication
//   edition   : latest edition year (update when new editions release)
//   url       : buy/read link
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
    url: "https://www.amazon.in/dp/0143424807",
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
    url: "https://www.amazon.in/dp/9387383075",
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
    url: "https://www.amazon.in/dp/8125031200",
    priority: "recommended",
    tags: ["medieval-history", "satish-chandra", "sultanate", "mughal"],
  },
  {
    id: "ref-hist-rs-sharma",
    paper: "GS1",
    module: "Ancient History",
    title: "Ancient India (NCERT Replacement)",
    author: "R.S. Sharma",
    edition: "2018",
    url: "https://www.amazon.in/dp/8121505194",
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
    url: "https://www.amazon.in/dp/9357055584",
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
    url: "https://www.amazon.in/dp/0195612299",
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
    url: "https://www.amazon.in/dp/9352839137",
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
    url: "https://www.amazon.in/dp/0190121459",
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
    url: "https://www.amazon.in/dp/9355327501",
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
    url: "https://www.amazon.in/dp/9389176026",
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
    url: "https://arc.gov.in/",
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
    url: "https://www.amazon.in/dp/9388144961",
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
    url: "https://www.amazon.in/dp/9356192936",
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
    url: "https://www.indiabudget.gov.in/economicsurvey/",
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
    url: "https://www.indiabudget.gov.in/",
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
    url: "https://www.amazon.in/dp/8177081136",
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
    url: "https://www.amazon.in/dp/9357055282",
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
    url: "https://www.amazon.in/dp/9390871360",
    priority: "must-read",
    tags: ["environment", "ecology", "biodiversity", "shankar", "conventions"],
  },
  {
    id: "ref-env-down-to-earth",
    paper: "GS3",
    module: "Environment",
    title: "Down to Earth Magazine (Annual Compilation)",
    author: "Centre for Science and Environment",
    edition: "2024",
    url: "https://www.downtoearth.org.in/",
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
    url: "https://www.amazon.in/dp/9352839439",
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
    url: "https://www.amazon.in/dp/9388144856",
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
    url: "https://www.amazon.in/dp/9350950979",
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
    url: "https://www.amazon.in/dp/9390260949",
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
    url: "https://www.amazon.in/dp/9355792662",
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
    url: "https://www.amazon.in/dp/9325291193",
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
    url: "https://www.amazon.in/dp/9355473273",
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
    url: "https://www.amazon.in/dp/9325295016",
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
    url: "https://visionias.in/current-affairs/monthly-magazine",
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
    url: "https://pib.gov.in/",
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
    url: "https://yojana.gov.in/",
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
    url: "https://kurukshetra.nic.in/",
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
    url: "https://www.gsscore.com/study-material",
    priority: "optional",
    tags: ["gs", "integrated", "study-material", "gsscore"],
  },
];