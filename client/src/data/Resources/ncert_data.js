// ─── NCERT Stack ──────────────────────────────────────────────────────────────
// Books relevant for UPSC Prelims + Mains

export const NCERT_LAST_UPDATED = "June 14, 2026";

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD YOUR OWN BOOKS
// Each object needs:
//   id        : unique string key  (e.g. "hist-11-themes")
//   class     : number 6–12
//   subject   : one of the SUBJECTS below
//   title     : display title
//   filePath  : absolute or relative path on your machine (served via /api/ncert/file)
//   url       : PDF link  ← set to null if file not yet available
//   done      : boolean — have you finished reading it?
// ─────────────────────────────────────────────────────────────────────────────

export const SUBJECTS = [
  "Art And Culture",
  "Economics",
  "Geography",
  "History",
  "Polity",
  "Sociology",
];

export const SUBJECT_PAPER_MAP = {
  "Art And Culture": ["GS1 (Mains)", "Prelims GS1"],
  Economics:         ["GS3 (Mains)", "Prelims GS1"],
  Geography:         ["GS1 (Mains)", "Prelims GS1"],
  History:           ["GS1 (Mains)", "Prelims GS1"],
  Polity:            ["GS2 (Mains)", "Prelims GS1"],
  Sociology:         ["GS1 (Mains)", "Prelims GS1"],
};

export const NCERT_BOOKS = [

  // ─── CLASS 6 — no PDFs in folder yet ─────────────────────────────────────
  // {
  //   id: "geo-6-earth-habitat",
  //   class: 6,
  //   subject: "Geography",
  //   title: "The Earth: Our Habitat",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "hist-6-our-past1",
  //   class: 6,
  //   subject: "History",
  //   title: "Our Pasts – I",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "pol-6-social-political1",
  //   class: 6,
  //   subject: "Polity",
  //   title: "Social and Political Life – I",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },

  // // ─── CLASS 7 — no PDFs in folder yet ─────────────────────────────────────
  // {
  //   id: "geo-7-environment",
  //   class: 7,
  //   subject: "Geography",
  //   title: "Our Environment",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "hist-7-our-past2",
  //   class: 7,
  //   subject: "History",
  //   title: "Our Pasts – II",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "pol-7-social-political2",
  //   class: 7,
  //   subject: "Polity",
  //   title: "Social and Political Life – II",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },

  // // ─── CLASS 8 — no PDFs in folder yet ─────────────────────────────────────
  // {
  //   id: "geo-8-resources",
  //   class: 8,
  //   subject: "Geography",
  //   title: "Resources and Development",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "hist-8-our-past3",
  //   class: 8,
  //   subject: "History",
  //   title: "Our Pasts – III",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "pol-8-social-political3",
  //   class: 8,
  //   subject: "Polity",
  //   title: "Social and Political Life – III",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },

  // // ─── CLASS 9 — no PDFs in folder yet ─────────────────────────────────────
  // {
  //   id: "geo-9-contemporary",
  //   class: 9,
  //   subject: "Geography",
  //   title: "Contemporary India – I",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "hist-9-india-world",
  //   class: 9,
  //   subject: "History",
  //   title: "India and the Contemporary World – I",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "pol-9-democratic-politics1",
  //   class: 9,
  //   subject: "Polity",
  //   title: "Democratic Politics – I",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },

  // // ─── CLASS 10 — no PDFs in folder yet ────────────────────────────────────
  // {
  //   id: "eco-10-understanding",
  //   class: 10,
  //   subject: "Economics",
  //   title: "Understanding Economic Development",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "geo-10-contemporary2",
  //   class: 10,
  //   subject: "Geography",
  //   title: "Contemporary India – II",
  //   filePath: null,
  //   url: "/assets/Books/Refrence/Geography.pdf",
  //   done: false,
  // },
  // {
  //   id: "hist-10-india-world2",
  //   class: 10,
  //   subject: "History",
  //   title: "India and the Contemporary World – II",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },
  // {
  //   id: "pol-10-democratic-politics2",
  //   class: 10,
  //   subject: "Polity",
  //   title: "Democratic Politics – II",
  //   filePath: null,
  //   url: null,
  //   done: false,
  // },

  // ─── CLASS 11 ─────────────────────────────────────────────────────────────

  // Art & Culture — only Heritage Crafts is available
  {
    id: "art-11-heritage-crafts",
    class: 11,
    subject: "Art And Culture",
    title: "Heritage Crafts (Introduction to Indian Art)",
    filePath: null,
    url: "/assets/Books/NCERT11/ART-culture/NCERT-Class-11-Heritage-Crafts.pdf",
    done: false,
  },

  // Economics — file is in economy/ folder
  {
    id: "eco-11-fundamentals",
    class: 11,
    subject: "Economics",
    title: "Fundamentals of Economics (Class XI)",
    filePath: null,
    url: "/assets/Books/NCERT11/economy/Fundamental of Physical Geography (Class XI) 2.pdf",
    done: false,
  },

  // Geography
  {
    id: "geo-11-physical",
    class: 11,
    subject: "Geography",
    title: "Fundamentals of Physical Geography",
    filePath: null,
    url: "/assets/Books/NCERT11/geography/Fundamental of Physical Geography (Class XI) 2.pdf",
    done: false,
  },
  {
    id: "geo-11-india",
    class: 11,
    subject: "Geography",
    title: "India — Physical Environment",
    filePath: null,
    url: "/assets/Books/NCERT11/geography/India Physical Environment (Class XI) 2.pdf",
    done: false,
  },

  // History
  {
    id: "hist-11-world",
    class: 11,
    subject: "History",
    title: "Themes in World History",
    filePath: null,
    url: "/assets/Books/NCERT11/history/NCERT-Class-11-History.pdf",
    done: false,
  },

  // Polity
  {
    id: "pol-11-indian-constitution",
    class: 11,
    subject: "Polity",
    title: "Indian Constitution at Work",
    filePath: null,
    url: "/assets/Books/NCERT11/Polity/NCERT-Class-11-Political-Science-Part-1.pdf",
    done: false,
  },
  {
    id: "pol-11-political-theory",
    class: 11,
    subject: "Polity",
    title: "Political Theory",
    filePath: null,
    url: "/assets/Books/NCERT11/Polity/NCERT-Class-11-Political-Science-Part-2-1.pdf",
    done: false,
  },

  // Sociology
  {
    id: "soc-11-intro",
    class: 11,
    subject: "Sociology",
    title: "Introducing Sociology",
    filePath: null,
    url: "/assets/Books/NCERT11/sociology/NCERT-Class-11-Sociology-Part-1 (1).pdf",
    done: false,
  },
  {
    id: "soc-11-understanding",
    class: 11,
    subject: "Sociology",
    title: "Understanding Society",
    filePath: null,
    url: "/assets/Books/NCERT11/sociology/NCERT-Class-11-Sociology-Part-2.pdf",
    done: false,
  },

  // ─── CLASS 12 ─────────────────────────────────────────────────────────────

  // Art & Culture
  {
    id: "art-12-craft-traditions",
    class: 12,
    subject: "Art And Culture",
    title: "Craft Traditions of India",
    filePath: null,
    url: "/assets/Books/NCERT12/ART-culture/Class_XII_Heritage_Craft_-_Craft_Traditions_of_India.pdf",
    done: false,
  },

  // Economics
  {
    id: "eco-12-micro",
    class: 12,
    subject: "Economics",
    title: "Introductory Microeconomics",
    filePath: null,
    url: "/assets/Books/NCERT12/Economy/NCERT-Class-12-Economics-Part-1.pdf",
    done: false,
  },
  {
    id: "eco-12-macro",
    class: 12,
    subject: "Economics",
    title: "Introductory Macroeconomics",
    filePath: null,
    url: "/assets/Books/NCERT12/Economy/NCERT-Class-12-Economics-Part-2.pdf",
    done: false,
  },

  // Geography
  {
    id: "geo-12-human",
    class: 12,
    subject: "Geography",
    title: "Fundamentals of Human Geography",
    filePath: null,
    url: "/assets/Books/NCERT12/Geography/Fundamentals of Human Geography (Class XII) 1.pdf",
    done: false,
  },
  {
    id: "geo-12-india-people",
    class: 12,
    subject: "Geography",
    title: "India — People and Economy",
    filePath: null,
    url: "/assets/Books/NCERT12/Geography/India People and Economy (Class XII).pdf",
    done: false,
  },

  // History
  {
    id: "hist-12-part1",
    class: 12,
    subject: "History",
    title: "Themes in Indian History – Part I",
    filePath: null,
    url: "/assets/Books/NCERT12/history/NCERT-Class-12-History-Part-1 (1).pdf",
    done: false,
  },
  {
    id: "hist-12-part2",
    class: 12,
    subject: "History",
    title: "Themes in Indian History – Part II",
    filePath: null,
    url: "/assets/Books/NCERT12/history/NCERT-Class-12-History-Part-2.pdf",
    done: false,
  },
  {
    id: "hist-12-part3",
    class: 12,
    subject: "History",
    title: "Themes in Indian History – Part III",
    filePath: null,
    url: "/assets/Books/NCERT12/history/NCERT-Class-12-History-Part-3.pdf",
    done: false,
  },

  // Polity
  {
    id: "pol-12-contemporary-world",
    class: 12,
    subject: "Polity",
    title: "Contemporary World Politics",
    filePath: null,
    url: "/assets/Books/NCERT12/Polity/NCERT-Class-12-Political-Science-Part-1.pdf",
    done: false,
  },
  {
    id: "pol-12-politics-india",
    class: 12,
    subject: "Polity",
    title: "Politics in India since Independence",
    filePath: null,
    url: "/assets/Books/NCERT12/Polity/NCERT-Class-12-Political-Science-Part-2.pdf",
    done: false,
  },

  // Sociology
  {
    id: "soc-12-india",
    class: 12,
    subject: "Sociology",
    title: "Indian Society",
    filePath: null,
    url: "/assets/Books/NCERT12/Sociology/NCERT-Class-12-Sociology-Part-1.pdf",
    done: false,
  },
  {
    id: "soc-12-change",
    class: 12,
    subject: "Sociology",
    title: "Social Change and Development in India",
    filePath: null,
    url: "/assets/Books/NCERT12/Sociology/NCERT-Class-12-Sociology-Part-2.pdf",
    done: false,
  },
];