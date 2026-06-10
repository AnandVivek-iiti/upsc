// ─── NCERT Stack ──────────────────────────────────────────────────────────────
// Class 11 & 12 books relevant for UPSC Prelims + Mains
// All URLs point to the official NCERT textbook portal: ncert.nic.in

export const NCERT_LAST_UPDATED = "June 10, 2026";

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD YOUR OWN BOOKS
// Each object needs:
//   id        : unique string key  (e.g. "hist-11-themes")
//   class     : number 6–12
//   subject   : one of the SUBJECTS below
//   title     : display title
//   filePath  : absolute or relative path on your machine (served via /api/ncert/file)
//   url       : official NCERT website PDF link
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

export const SUBJECT_PAPER_MAP = {
  History:     ["GS1 (Mains)", "Prelims GS1"],
  Geography:   ["GS1 (Mains)", "Prelims GS1"],
  Polity:      ["GS2 (Mains)", "Prelims GS1"],
  Economics:   ["GS3 (Mains)", "Prelims GS1"],
  Science:     ["GS3 (Mains)", "Prelims GS1"],
  Sociology:   ["GS1 (Mains)", "Prelims GS1"],
  Environment: ["GS3 (Mains)", "Prelims GS1"],
};

export const NCERT_BOOKS = [

  // ─── HISTORY — Class 11 ──────────────────────────────────────────────────
  {
    id: "hist-11-intro",
    class: 11,
    subject: "History",
    title: "Themes in World History",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lehh1=0-11",
    done: false,
  },

  // ─── HISTORY — Class 12 ──────────────────────────────────────────────────
  {
    id: "hist-12-part1",
    class: 12,
    subject: "History",
    title: "Themes in Indian History – Part I",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhss1=0-9",
    done: false,
  },
  {
    id: "hist-12-part2",
    class: 12,
    subject: "History",
    title: "Themes in Indian History – Part II",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhss2=0-10",
    done: false,
  },
  {
    id: "hist-12-part3",
    class: 12,
    subject: "History",
    title: "Themes in Indian History – Part III",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhss3=0-9",
    done: false,
  },

  // ─── GEOGRAPHY — Class 11 ────────────────────────────────────────────────
  {
    id: "geo-11-physical",
    class: 11,
    subject: "Geography",
    title: "Fundamentals of Physical Geography",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?kegy2=0-14",
    done: false,
  },
  {
    id: "geo-11-india",
    class: 11,
    subject: "Geography",
    title: "India — Physical Environment",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?kegy1=0-10",
    done: false,
  },
  {
    id: "geo-11-practical",
    class: 11,
    subject: "Geography",
    title: "Practical Work in Geography – Part I",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?kegp2=0-6",
    done: false,
  },

  // ─── GEOGRAPHY — Class 12 ────────────────────────────────────────────────
  {
    id: "geo-12-human",
    class: 12,
    subject: "Geography",
    title: "Fundamentals of Human Geography",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?legy1=0-8",
    done: false,
  },
  {
    id: "geo-12-india-people",
    class: 12,
    subject: "Geography",
    title: "India — People and Economy",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?legy2=0-10",
    done: false,
  },
  {
    id: "geo-12-practical",
    class: 12,
    subject: "Geography",
    title: "Practical Work in Geography – Part II",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhgp1=0-6",
    done: false,
  },

  // ─── POLITY — Class 11 ───────────────────────────────────────────────────
  {
    id: "pol-11-indian-constitution",
    class: 11,
    subject: "Polity",
    title: "Indian Constitution at Work",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?leps1=0-9",
    done: false,
  },
  {
    id: "pol-11-political-theory",
    class: 11,
    subject: "Polity",
    title: "Political Theory",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?leps2=0-10",
    done: false,
  },

  // ─── POLITY — Class 12 ───────────────────────────────────────────────────
  {
    id: "pol-12-contemporary-india",
    class: 12,
    subject: "Polity",
    title: "Contemporary World Politics",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhps1=0-9",
    done: false,
  },
  {
    id: "pol-12-politics-india",
    class: 12,
    subject: "Polity",
    title: "Politics in India since Independence",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhps2=0-10",
    done: false,
  },

  // ─── ECONOMICS — Class 11 ────────────────────────────────────────────────
  {
    id: "eco-11-statistics",
    class: 11,
    subject: "Economics",
    title: "Statistics for Economics",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?less1=0-9",
    done: false,
  },
  {
    id: "eco-11-indian-eco",
    class: 11,
    subject: "Economics",
    title: "Indian Economic Development",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?less2=0-10",
    done: false,
  },

  // ─── ECONOMICS — Class 12 ────────────────────────────────────────────────
  {
    id: "eco-12-micro",
    class: 12,
    subject: "Economics",
    title: "Introductory Microeconomics",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhec1=0-7",
    done: false,
  },
  {
    id: "eco-12-macro",
    class: 12,
    subject: "Economics",
    title: "Introductory Macroeconomics",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhec2=0-6",
    done: false,
  },

  // ─── SCIENCE — Class 11 ──────────────────────────────────────────────────
  {
    id: "sci-11-physics-1",
    class: 11,
    subject: "Science",
    title: "Physics Part I",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?leph1=0-8",
    done: false,
  },
  {
    id: "sci-11-physics-2",
    class: 11,
    subject: "Science",
    title: "Physics Part II",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?leph2=0-7",
    done: false,
  },
  {
    id: "sci-11-chemistry-1",
    class: 11,
    subject: "Science",
    title: "Chemistry Part I",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lech1=0-7",
    done: false,
  },
  {
    id: "sci-11-chemistry-2",
    class: 11,
    subject: "Science",
    title: "Chemistry Part II",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lech2=0-8",
    done: false,
  },
  {
    id: "sci-11-biology",
    class: 11,
    subject: "Science",
    title: "Biology",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lebo1=0-22",
    done: false,
  },

  // ─── SCIENCE — Class 12 ──────────────────────────────────────────────────
  {
    id: "sci-12-physics-1",
    class: 12,
    subject: "Science",
    title: "Physics Part I",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhph1=0-8",
    done: false,
  },
  {
    id: "sci-12-physics-2",
    class: 12,
    subject: "Science",
    title: "Physics Part II",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhph2=0-7",
    done: false,
  },
  {
    id: "sci-12-chemistry-1",
    class: 12,
    subject: "Science",
    title: "Chemistry Part I",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhch1=0-8",
    done: false,
  },
  {
    id: "sci-12-chemistry-2",
    class: 12,
    subject: "Science",
    title: "Chemistry Part II",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhch2=0-8",
    done: false,
  },
  {
    id: "sci-12-biology",
    class: 12,
    subject: "Science",
    title: "Biology",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhbo1=0-16",
    done: false,
  },

  // ─── SOCIOLOGY — Class 11 ────────────────────────────────────────────────
  {
    id: "soc-11-intro",
    class: 11,
    subject: "Sociology",
    title: "Introducing Sociology",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?less3=0-6",
    done: false,
  },
  {
    id: "soc-11-understanding",
    class: 11,
    subject: "Sociology",
    title: "Understanding Society",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?less4=0-7",
    done: false,
  },

  // ─── SOCIOLOGY — Class 12 ────────────────────────────────────────────────
  {
    id: "soc-12-india",
    class: 12,
    subject: "Sociology",
    title: "Indian Society",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhss4=0-8",
    done: false,
  },
  {
    id: "soc-12-change",
    class: 12,
    subject: "Sociology",
    title: "Social Change and Development in India",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhss5=0-8",
    done: false,
  },

  // ─── ENVIRONMENT — Class 11 ──────────────────────────────────────────────
  {
    id: "env-11-bio",
    class: 11,
    subject: "Environment",
    title: "Biology (Ecology & Environment chapters)",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lebo1=0-22",
    done: false,
  },

  // ─── ENVIRONMENT — Class 12 ──────────────────────────────────────────────
  {
    id: "env-12-bio",
    class: 12,
    subject: "Environment",
    title: "Biology (Ecology & Biodiversity chapters)",
    filePath: null,
    url: "https://ncert.nic.in/textbook.php?lhbo1=0-16",
    done: false,
  },
];