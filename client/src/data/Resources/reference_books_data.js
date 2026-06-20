export const REF_BOOKS_LAST_UPDATED = "June 20, 2026";

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
  "must-read": "#f87171",
  recommended: "#60a5fa",
  optional: "#a78bfa",
};

export const REFERENCE_BOOKS = [
  // HISTORY
  {
    id: "ref-hist-bipin",
    paper: "Prelims GS1",
    module: "Modern History",
    title: "India's Struggle for Independence",
    author: "Bipan Chandra",
    edition: "2016",
    filePath: "/assets/Books/Refrence/Modern-India-Bipan-Chandra.pdf",
    url: null,
    priority: "must-read",
    tags: ["modern-history", "freedom-struggle"],
  },
  {
    id: "ref-hist-spectrum",
    paper: "Prelims GS1",
    module: "Modern History",
    title: "A Brief History of Modern India (Spectrum)",
    author: "Rajiv Ahir",
    edition: "2023",
    filePath:
      "/assets/Books/Refrence/A-Brief-History-of-Modern-India-2019-2020-Edition-by-Spectrum-Books-Rajiv-Ahir-Kalpana-Rajaram-z-lib.org_.pdf",
    url: null,
    priority: "must-read",
    tags: ["modern-history", "spectrum"],
  },
  {
    id: "ref-hist-satish",
    paper: "GS1",
    module: "Medieval History",
    title: "History of Medieval India",
    author: "Satish Chandra",
    edition: "2018",
    filePath:
      "/assets/Books/Refrence/AR_History-of-Medieval-India-by-Satish-Chandra.pdf",
    url: null,
    priority: "recommended",
    tags: ["medieval-history"],
  },
  {
    id: "ref-hist-rs-sharma",
    paper: "GS1",
    module: "Ancient History",
    title: "Ancient India",
    author: "R.S. Sharma",
    edition: "1977",
    filePath: "/assets/Books/Refrence/Ancient-India-RS-Sharma.pdf",
    url: null,
    priority: "recommended",
    tags: ["ancient-history"],
  },

  // ART & CULTURE
  {
    id: "ref-art-nitin",
    paper: "Prelims GS1",
    module: "Art & Culture",
    title: "Indian Art and Culture",
    author: "Nitin Singhania",
    edition: "2023",
    filePath:
      "/assets/Books/Refrence/13-General-Indian Art and Culture-Nitin Singhania.pdf",
    url: null,
    priority: "must-read",
    tags: ["art-culture"],
  },

  // GEOGRAPHY
  {
    id: "ref-geo-certificate",
    paper: "Prelims GS1",
    module: "Physical Geography",
    title: "Certificate Physical and Human Geography",
    author: "Goh Cheng Leong",
    edition: "2019",
    filePath:
      "/assets/Books/Refrence/CERTIFICATE IN PHYSICAL AND HUMAN GEOGRAPHY 3ed.pdf",
    url: null,
    priority: "must-read",
    tags: ["physical-geography"],
  },
  {
    id: "ref-geo-majid-hussain",
    paper: "GS1",
    module: "Indian Geography",
    title: "Geography of India",
    author: "Majid Husain",
    edition: "2021",
    filePath: "/assets/Books/Refrence/geography-majid-hussian.pdf",
    url: null,
    priority: "must-read",
    tags: ["indian-geography"],
  },
  {
    id: "ref-geo-atlas",
    paper: "Prelims GS1",
    module: "Atlas",
    title: "Oxford Student Atlas",
    author: "Oxford Press",
    edition: "2022",
    filePath:
      "/assets/Books/Refrence/Oxford-Student-Atlas-35-Edition-@UpscStandardBooks.pdf",
    url: null,
    priority: "recommended",
    tags: ["atlas"],
  },

  // POLITY
  {
    id: "ref-pol-laxmikanth",
    paper: "GS2",
    module: "Indian Polity",
    title: "Indian Polity",
    author: "M. Laxmikanth",
    edition: "2023",
    filePath:
      "/assets/Books/Refrence/Indian_Polity_Laxmi-Kant-6th-Edition-.pdf",
    url: null,
    priority: "must-read",
    tags: ["polity"],
  },
  {
    id: "ref-pol-dd-basu",
    paper: "GS2",
    module: "Constitution",
    title: "Introduction to the Constitution of India",
    author: "D.D. Basu",
    edition: "2022",
    filePath: null,
    url: null,
    priority: "recommended",
    tags: ["constitution"],
  },

  // ECONOMY
  {
    id: "ref-eco-ramesh-singh",
    paper: "GS3",
    module: "Indian Economy",
    title: "Indian Economy",
    author: "Ramesh Singh",
    edition: "2023",
    filePath:
      "/assets/Books/Refrence/Ramesh Singh - Indian Economy - for Civil Services, Universities and Other Examinations-McGraw Hill Education (2018).pdf",
    url: null,
    priority: "must-read",
    tags: ["economy"],
  },
  {
    id: "ref-eco-survey",
    paper: "GS3",
    module: "Economic Survey",
    title: "Economic Survey",
    author: "Government of India",
    edition: "2025-26",
    filePath: null,
    url: "https://www.indiabudget.gov.in/economicsurvey/",
    priority: "must-read",
    tags: ["survey"],
  },
  {
    id: "ref-eco-budget",
    paper: "GS3",
    module: "Union Budget",
    title: "Union Budget Documents",
    author: "Government of India",
    edition: "2025-26",
    filePath: null,
    url: "https://www.indiabudget.gov.in/",
    priority: "must-read",
    tags: ["budget"],
  },

  // ESSAY
  {
    id: "ref-essay-pulkit",
    paper: "Essay",
    module: "Essay Writing",
    title: "151 Essays for UPSC",
    author: "Disha Experts",
    edition: "2023",
    filePath:
      "/assets/Books/Refrence/151 Essays for IAS_ PCS & other - Disha Experts.pdf",
    url: null,
    priority: "recommended",
    tags: ["essay"],
  },

  // CURRENT AFFAIRS
  {
    id: "ref-ca-pib",
    paper: "General",
    module: "Current Affairs",
    title: "PIB",
    author: "Government of India",
    edition: "2026",
    filePath: null,
    url: "https://pib.gov.in/",
    priority: "must-read",
    tags: ["pib"],
  },
  {
    id: "ref-ca-yojana",
    paper: "General",
    module: "Current Affairs",
    title: "Yojana Magazine",
    author: "Publications Division",
    edition: "2026",
    filePath: null,
    url: "https://www.publicationsdivision.nic.in/journals/index.php?route=page/archives",
    priority: "recommended",
    tags: ["yojana"],
  },
  {
    id: "ref-ca-kurukshetra",
    paper: "General",
    module: "Current Affairs",
    title: "Kurukshetra Magazine",
    author: "Publications Division",
    edition: "2026",
    filePath: null,
    url: "https://www.publicationsdivision.nic.in/journals/index.php?route=page/archives",
    priority: "recommended",
    tags: ["kurukshetra"],
  }
];