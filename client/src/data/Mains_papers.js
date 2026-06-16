export const MAINS_LAST_VERIFIED_DATE = "June 16, 2026";

const BASE = "https://www.upsc.gov.in/sites/default/files/";

// Fallback: official UPSC previous question papers page (all years listed here)
const UPSC_PYQ_PAGE =
  "https://www.upsc.gov.in/examinations/previous-question-papers?field_exam_name_value=Civil+Services+(Main)+Examination";

// Google Drive mirrors for 2009–2015 (sourced from iasgyan.in — publicly accessible)
const GD = {
  // 2015
  "2015-essay":
    "https://drive.google.com/open?id=15okPRn71zoB7JBpICkSz5ADRy_yW2ojq",
  "2015-gs1":
    "https://drive.google.com/open?id=1AOKejkASHl6s9n1CnDTKAlU-HT9rkqNd",
  "2015-gs2":
    "https://drive.google.com/open?id=1j3vdulxvTiI0ltVAzPLm7u_edf90RPUc",
  "2015-gs3":
    "https://drive.google.com/open?id=1gnrCTLGtZ3Pc_xEPMRLQ1qbkPqHH7jfe",
  "2015-gs4":
    "https://drive.google.com/open?id=1XgrvLPuHRLJ-iixmXhpox3YmrSJlPpE_",
  // 2014
  "2014-essay":
    "https://drive.google.com/open?id=1ore4-4PTKHva8UUJ12PyL_Ae2N7fYSLv",
  "2014-gs1":
    "https://drive.google.com/open?id=1qbClX8zEEcnRcZJ7go4i19d017N-4eeA",
  "2014-gs2":
    "https://drive.google.com/open?id=1liozXXtZEKhsZjcXo6PyNfF_M7G0hGUa",
  "2014-gs3":
    "https://drive.google.com/open?id=1k-N_PPhJFHw9Wx-W_nx_0lJdUXs7e3cN",
  "2014-gs4":
    "https://drive.google.com/open?id=1vMfu2KF0FMFIAX_NHwvPwWyNopGv4Hlb",
  // 2013
  "2013-essay":
    "https://drive.google.com/open?id=1v9xE4DFi88CGPSGHd5Td18-Yi093fTig",
  "2013-gs1":
    "https://drive.google.com/open?id=1_XuCAmINRwkgOmV7pmkhgq9Fq_FY5Ujo",
  "2013-gs2":
    "https://drive.google.com/open?id=1yFPP0YxGexVsXgno-dAx30KLqpQA4PVn",
  "2013-gs3":
    "https://drive.google.com/open?id=184gOnDLMgBhv2DIQqdPPnaGT6NXlF7dU",
  "2013-gs4":
    "https://drive.google.com/open?id=1XeVu91o77jDq4uaN4q_qIVX5U0aQl3Kn",
  // 2012 (old 2-GS pattern; gs3/gs4 did not exist)
  "2012-essay":
    "https://drive.google.com/open?id=14DDmVjcQbYKIxbmPo9KGZ32yW3To9YCs",
  "2012-gs1":
    "https://drive.google.com/open?id=1ZLbtAfDNfMX7U3cRo_h1i7nk7XsWB1XS",
  "2012-gs2":
    "https://drive.google.com/open?id=1q7nboAeoyOtjWqtLvQapfWsoNHTylHML",
  // 2011
  "2011-essay":
    "https://drive.google.com/open?id=12czbJEuOXcWKISyfV_nZcQB9Zyd5f6iI",
  "2011-gs1":
    "https://drive.google.com/open?id=1kUXvhNOUfydlUG6Pwr9SovNblCgiIXHf",
  "2011-gs2":
    "https://drive.google.com/open?id=1MAYhJKi2S4U1YyNgoJO1AcyZYB3IpkDv",
  // 2010
  "2010-essay":
    "https://drive.google.com/open?id=18FMbQ37U68iCj1R9dxGnlkonES-6Fhlp",
  "2010-gs1":
    "https://drive.google.com/open?id=1bofodlL2O7ns_DTBContZSit3mtX0bgy",
  // 2009 (only GS2 available via this source)
  "2009-gs2":
    "https://drive.google.com/open?id=16dXtaJhrpGPPS95Y3DoniiMi4ZhM-r_b",
};

// ─────────────────────────────────────────────────────────────────────────────
// 2026  (Mains not yet conducted)
// ─────────────────────────────────────────────────────────────────────────────
const Y2026 = {
  essay: null,
  gs1: null,
  gs2: null,
  gs3: null,
  gs4: null,
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": null,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2025  (Mains: 22–31 Aug 2025)
// ─────────────────────────────────────────────────────────────────────────────
const Y2025 = {
  essay:           `${BASE}ESSAY-QP-CSM-25-010925.pdf`,
  gs1:             `${BASE}GENERAL-STUDIES-PAPER%20I-QP-CSM-25-010925.pdf`,
  gs2:             `${BASE}GENERAL-STUDIES-PAPER-II-QP-CSM-25-010925.pdf`,
  gs3:             `${BASE}GENERAL-STUDIES-PAPER-III-QP-CSM-25-010925.pdf`,
  gs4:             `${BASE}GENERAL-STUDIES-PAPER-IV-QP-CSM-25-010925.pdf`,
  // Optional: Sociology (Paper I = Fundamentals, Paper II = Indian Society)
  "optional-i":    `${BASE}SOCIOLOGY-PAPER-I-QP-CSM-25-010925.pdf`,
  "optional-ii":   `${BASE}SOCIOLOGY-PAPER-II-QP-CSM-25-010925.pdf`,
  // Qualifying papers (language-i = Hindi, language-ii = English)
  "language-i":    `${BASE}HINDI-COMPULSORY-QP-CSM-25-010925.pdf`,
  "language-ii":   `${BASE}ENGLISH-COMPULSORY-QP-CSM-25-010925.pdf`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2024  (Mains: 20–29 Sep 2024)
// ─────────────────────────────────────────────────────────────────────────────
const Y2024 = {
  essay:           `${BASE}QP_CSM_2024_ESSAY_03102024.pdf`,
  gs1:             `${BASE}QP_CSM_2024_GenStud_I_03102024.pdf`,
  gs2:             `${BASE}QP_CSM_2024_GenStud_II_03102024.pdf`,
  gs3:             `${BASE}QP_CSM_2024_GenStud_III_03102024.pdf`,
  gs4:             `${BASE}QP_CSM_2024_GenStud_IV_03102024.pdf`,
  // Optional: Sociology
  "optional-i":    `${BASE}QP-CSM-24-SOCIOLOGY-PAPER-I-031024.pdf`,
  "optional-ii":   `${BASE}QP-CSM-24-SOCIOLOGY-PAPER-II-031024.pdf`,
  // Qualifying papers
  "language-i":    `${BASE}QP_CSM_2024_Hn_Comp_03102024.pdf`,
  "language-ii":   `${BASE}QP_CSM_2024_Eng_Comp_03102024.pdf`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2023  (Mains: 15–24 Sep 2023)
// ─────────────────────────────────────────────────────────────────────────────
const Y2023 = {
  essay:           `${BASE}QP-CSM-23-ESSAY-180923.pdf`,
  gs1:             `${BASE}QP-CSM-23-GENERAL-STUDIES-PAPER-I-180923.pdf`,
  gs2:             `${BASE}QP-CSM-23-GENERAL-STUDIES-PAPER-II-180923.pdf`,
  gs3:             `${BASE}QP-CSM-23-GENERAL-STUDIES-PAPER-III-180923.pdf`,
  gs4:             `${BASE}QP-CSM-23-GENERAL-STUDIES-PAPER-IV-180923.pdf`,
  // Optional: Sociology
  "optional-i":    `${BASE}QP-CSM-23-SOCIOLOGY-PAPER-I-29092023.pdf`,
  "optional-ii":   `${BASE}QP-CSM-23-SOCIOLOGY-PAPER-II-29092023.pdf`,
  // Qualifying papers
  "language-i":    `${BASE}QP-CSM-23-HINDI-COMPULSORY-290923.pdf`,
  "language-ii":   `${BASE}QP-CSM-23-ENGLISH-COMPULSORY-290923.pdf`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2022  (Mains: 16–25 Sep 2022)
// ─────────────────────────────────────────────────────────────────────────────
const Y2022 = {
  essay:           `${BASE}QP-CSM-22-ESSAY-190922.pdf`,
  gs1:             `${BASE}QP-CSM-22-GENERAL-STUDIES-PAPER%20I-190922.pdf`,
  gs2:             `${BASE}QP-CSM-22-GENERAL-STUDIES-PAPER-II-190922.pdf`,
  gs3:             `${BASE}QP-CSM-22-GENERAL-STUDIES-PAPER-III-190922.pdf`,
  gs4:             `${BASE}QP-CSM-22-GENERAL-STUDIES-PAPER%20IV-190922.pdf`,
  // Optional: Sociology
  "optional-i":    `${BASE}QP-CSM-22-SOCIOLOGY%20PAPER%20-%20I-280922.pdf`,
  "optional-ii":   `${BASE}QP-CSM-22-SOCIOLOGY%20PAPER%20-%20II-280922.pdf`,
  // Qualifying papers
  "language-i":    `${BASE}QP-CSM-22-HINDI-Compl-280922.pdf`,
  "language-ii":   `${BASE}QP-CSM-22-ENGLISH-Compl-280922.pdf`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2021  (Mains: 7–16 Jan 2022)
// ─────────────────────────────────────────────────────────────────────────────
const Y2021 = {
  essay:           `${BASE}QP-CSM-21-ESSAY-110122.pdf`,
  gs1:             `${BASE}QP-CSM-21-GENSTUDIESPAPER-I-110122.pdf`,
  gs2:             `${BASE}QP-CSM-21-GENSTUDIESPAPER-II-110122.pdf`,
  gs3:             `${BASE}QP-CSM-21-GENSTUDIESPAPER-III-110122.pdf`,
  gs4:             `${BASE}QP-CSM-21-GENSTUDIESPAPER-IV-110122.pdf`,
  // Optional: Sociology (CDN filenames for 2021 not confirmed; using PYQ page)
  "optional-i":    UPSC_PYQ_PAGE,
  "optional-ii":   UPSC_PYQ_PAGE,
  // Qualifying papers (generic filenames, no year tag — not reliably year-specific; use PYQ page)
  "language-i":    UPSC_PYQ_PAGE,
  "language-ii":   UPSC_PYQ_PAGE,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2020  (Mains: 8–17 Jan 2021)
// ─────────────────────────────────────────────────────────────────────────────
const Y2020 = {
  essay:           `${BASE}ESSAY_1.pdf`,
  gs1:             `${BASE}Gen_St_P1.pdf`,
  gs2:             `${BASE}Gen_St_P2.pdf`,
  gs3:             `${BASE}Gen_St_P3.pdf`,
  gs4:             `${BASE}Gen_St_P4.pdf`,
  // Optional: Sociology (CDN filenames for 2020 not confirmed; using PYQ page)
  "optional-i":    UPSC_PYQ_PAGE,
  "optional-ii":   UPSC_PYQ_PAGE,
  // Qualifying papers (generic filenames, no year tag — not reliably year-specific; use PYQ page)
  "language-i":    UPSC_PYQ_PAGE,
  "language-ii":   UPSC_PYQ_PAGE,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2019  (Mains: 20–29 Sep 2019)
// ─────────────────────────────────────────────────────────────────────────────
const Y2019 = {
  essay:           `${BASE}QP-CSM19-Essay.pdf`,
  gs1:             `${BASE}QP-CSM19-GeneralStudies-I.pdf`,
  gs2:             `${BASE}QP-CSM19-GeneralStudies-II.pdf`,
  gs3:             `${BASE}QP-CSM19-GeneralStudies-III.pdf`,
  gs4:             `${BASE}QP-CSM19-GeneralStudies-IV.pdf`,
  // Optional: Sociology
  "optional-i":    `${BASE}QP-CSM19-Sociology-I.pdf`,
  "optional-ii":   `${BASE}QP-CSM19-Sociology-II.pdf`,
  // Qualifying papers
  "language-i":    `${BASE}QP-CSM-19-HindiCompulory.pdf`,
  "language-ii":   `${BASE}QP-CSM19-EnglishCompulsory.pdf`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2018  (Mains: 28 Sep – 7 Oct 2018)
// ─────────────────────────────────────────────────────────────────────────────
const Y2018 = {
  essay:           `${BASE}ESSAY_0.pdf`,
  gs1:             `${BASE}GENERAL-STUDIES-PAPER-I.pdf`,
  gs2:             `${BASE}GENERAL-STUDIES-PAPER-II.pdf`,
  gs3:             `${BASE}GENERAL-STUDIES-PAPER-III.pdf`,
  gs4:             `${BASE}GENERAL-STUDIES-PAPER-IV.pdf`,
  // Optional: Sociology (generic filenames shared with other years — not year-specific; use PYQ page)
  "optional-i":    UPSC_PYQ_PAGE,
  "optional-ii":   UPSC_PYQ_PAGE,
  // Qualifying papers (generic filenames, no year tag; use PYQ page)
  "language-i":    UPSC_PYQ_PAGE,
  "language-ii":   UPSC_PYQ_PAGE,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2017  (Mains: 28 Oct – 5 Nov 2017)
// ─────────────────────────────────────────────────────────────────────────────
const Y2017 = {
  essay:           `${BASE}ESSAY.pdf`,
  gs1:             `${BASE}GS1_1.pdf`,
  gs2:             `${BASE}GS2_0.pdf`,
  gs3:             `${BASE}GS3_0.pdf`,
  gs4:             `${BASE}GS4_0.pdf`,
  // Optional: Sociology (CDN filenames for 2017 not confirmed; using PYQ page)
  "optional-i":    UPSC_PYQ_PAGE,
  "optional-ii":   UPSC_PYQ_PAGE,
  // Qualifying papers (generic filenames, no year tag; use PYQ page)
  "language-i":    UPSC_PYQ_PAGE,
  "language-ii":   UPSC_PYQ_PAGE,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2016  (Mains: 3–9 Dec 2016)
// ─────────────────────────────────────────────────────────────────────────────
const Y2016 = {
  essay:           `${BASE}EASSY_0.pdf`,
  gs1:             `${BASE}GS1_0.pdf`,
  gs2:             `${BASE}GS2.pdf`,
  gs3:             `${BASE}GS3.pdf`,
  gs4:             `${BASE}GS4.pdf`,
  // Optional: Sociology (CDN filenames for 2016 not confirmed; using PYQ page)
  "optional-i":    UPSC_PYQ_PAGE,
  "optional-ii":   UPSC_PYQ_PAGE,
  // Qualifying papers (generic filenames, no year tag; use PYQ page)
  "language-i":    UPSC_PYQ_PAGE,
  "language-ii":   UPSC_PYQ_PAGE,
};
// ─────────────────────────────────────────────────────────────────────────────
// 2015  (Mains: 18–27 Dec 2015 — first year of new pattern on CDN gap)
// Google Drive mirrors sourced from iasgyan.in
// ─────────────────────────────────────────────────────────────────────────────
const Y2015 = {
  essay: GD["2015-essay"],
  gs1: GD["2015-gs1"],
  gs2: GD["2015-gs2"],
  gs3: GD["2015-gs3"],
  gs4: GD["2015-gs4"],
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": UPSC_PYQ_PAGE,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2014  (Mains: 14–23 Nov 2014)
// Google Drive mirrors sourced from iasgyan.in
// ─────────────────────────────────────────────────────────────────────────────
const Y2014 = {
  essay: GD["2014-essay"],
  gs1: GD["2014-gs1"],
  gs2: GD["2014-gs2"],
  gs3: GD["2014-gs3"],
  gs4: GD["2014-gs4"],
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": UPSC_PYQ_PAGE,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2013  (Mains: 1–10 Dec 2013 — first year of new 4-GS-paper pattern)
// Google Drive mirrors sourced from iasgyan.in
// ─────────────────────────────────────────────────────────────────────────────
const Y2013 = {
  essay: GD["2013-essay"],
  gs1: GD["2013-gs1"],
  gs2: GD["2013-gs2"],
  gs3: GD["2013-gs3"],
  gs4: GD["2013-gs4"],
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": UPSC_PYQ_PAGE,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2012 and older — old pattern (only 2 GS papers; gs3/gs4 do not apply).
// gs1/gs2 map to the old GS Paper I / GS Paper II respectively.
// Google Drive mirrors sourced from iasgyan.in where available;
// UPSC PYQ page used as fallback for unavailable papers.
// ─────────────────────────────────────────────────────────────────────────────
const Y2012 = {
  essay: GD["2012-essay"],
  gs1: GD["2012-gs1"],
  gs2: GD["2012-gs2"],
  gs3: null, // did not exist in old pattern
  gs4: null,
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": UPSC_PYQ_PAGE,
};

const Y2011 = {
  essay: GD["2011-essay"],
  gs1: GD["2011-gs1"],
  gs2: GD["2011-gs2"],
  gs3: null,
  gs4: null,
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": UPSC_PYQ_PAGE,
};

const Y2010 = {
  essay: GD["2010-essay"],
  gs1: GD["2010-gs1"],
  gs2: UPSC_PYQ_PAGE, // GS2 not found in iasgyan source for 2010
  gs3: null,
  gs4: null,
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": UPSC_PYQ_PAGE,
};

const Y2009 = {
  essay: UPSC_PYQ_PAGE, // essay not found in iasgyan source for 2009
  gs1: UPSC_PYQ_PAGE,
  gs2: GD["2009-gs2"],
  gs3: null,
  gs4: null,
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": UPSC_PYQ_PAGE,
};

// 2005–2008: no CDN or Google Drive mirrors confirmed for these years.
// All entries point to the UPSC official previous-question-papers page.
const Y2008 = {
  essay: UPSC_PYQ_PAGE,
  gs1: UPSC_PYQ_PAGE,
  gs2: UPSC_PYQ_PAGE,
  gs3: null,
  gs4: null,
  "optional-i": null,
  "optional-ii": null,
  "language-i": null,
  "language-ii": UPSC_PYQ_PAGE,
};

const Y2007 = { ...Y2008 };
const Y2006 = { ...Y2008 };
const Y2005 = { ...Y2008 };

// ── Core lookup table: paperId → { year → url | null } ───────────────────────

export const MAINS_PAPERS = {
  essay: {
    2026: null,
    2025: Y2025.essay,
    2024: Y2024.essay,
    2023: Y2023.essay,
    2022: Y2022.essay,
    2021: Y2021.essay,
    2020: Y2020.essay,
    2019: Y2019.essay,
    2018: Y2018.essay,
    2017: Y2017.essay,
    2016: Y2016.essay,
    2015: Y2015.essay,
    2014: Y2014.essay,
    2013: Y2013.essay,
    2012: Y2012.essay,
    2011: Y2011.essay,
    2010: Y2010.essay,
    2009: Y2009.essay,
    2008: Y2008.essay,
    2007: Y2007.essay,
    2006: Y2006.essay,
    2005: Y2005.essay,
  },
  gs1: {
    2026: null,
    2025: Y2025.gs1,
    2024: Y2024.gs1,
    2023: Y2023.gs1,
    2022: Y2022.gs1,
    2021: Y2021.gs1,
    2020: Y2020.gs1,
    2019: Y2019.gs1,
    2018: Y2018.gs1,
    2017: Y2017.gs1,
    2016: Y2016.gs1,
    2015: Y2015.gs1,
    2014: Y2014.gs1,
    2013: Y2013.gs1,
    2012: Y2012.gs1,
    2011: Y2011.gs1,
    2010: Y2010.gs1,
    2009: Y2009.gs1,
    2008: Y2008.gs1,
    2007: Y2007.gs1,
    2006: Y2006.gs1,
    2005: Y2005.gs1,
  },
  gs2: {
    2026: null,
    2025: Y2025.gs2,
    2024: Y2024.gs2,
    2023: Y2023.gs2,
    2022: Y2022.gs2,
    2021: Y2021.gs2,
    2020: Y2020.gs2,
    2019: Y2019.gs2,
    2018: Y2018.gs2,
    2017: Y2017.gs2,
    2016: Y2016.gs2,
    2015: Y2015.gs2,
    2014: Y2014.gs2,
    2013: Y2013.gs2,
    2012: Y2012.gs2,
    2011: Y2011.gs2,
    2010: Y2010.gs2,
    2009: Y2009.gs2,
    2008: Y2008.gs2,
    2007: Y2007.gs2,
    2006: Y2006.gs2,
    2005: Y2005.gs2,
  },
  gs3: {
    2026: null,
    2025: Y2025.gs3,
    2024: Y2024.gs3,
    2023: Y2023.gs3,
    2022: Y2022.gs3,
    2021: Y2021.gs3,
    2020: Y2020.gs3,
    2019: Y2019.gs3,
    2018: Y2018.gs3,
    2017: Y2017.gs3,
    2016: Y2016.gs3,
    2015: Y2015.gs3,
    2014: Y2014.gs3,
    2013: Y2013.gs3,
    2012: Y2012.gs3,
    2011: Y2011.gs3,
    2010: Y2010.gs3,
    2009: Y2009.gs3,
    2008: Y2008.gs3,
    2007: Y2007.gs3,
    2006: Y2006.gs3,
    2005: Y2005.gs3,
  },
  gs4: {
    2026: null,
    2025: Y2025.gs4,
    2024: Y2024.gs4,
    2023: Y2023.gs4,
    2022: Y2022.gs4,
    2021: Y2021.gs4,
    2020: Y2020.gs4,
    2019: Y2019.gs4,
    2018: Y2018.gs4,
    2017: Y2017.gs4,
    2016: Y2016.gs4,
    2015: Y2015.gs4,
    2014: Y2014.gs4,
    2013: Y2013.gs4,
    2012: Y2012.gs4,
    2011: Y2011.gs4,
    2010: Y2010.gs4,
    2009: Y2009.gs4,
    2008: Y2008.gs4,
    2007: Y2007.gs4,
    2006: Y2006.gs4,
    2005: Y2005.gs4,
  },
  // Sociology Optional Paper I (Fundamentals of Sociology)
  // 2022–2025: direct UPSC CDN links; 2019–2018: direct CDN links;
  // 2016–2021 (excl. confirmed years): UPSC PYQ page fallback; 2015 and older: null
  "optional-i": {
    2026: null,
    2025: Y2025["optional-i"],
    2024: Y2024["optional-i"],
    2023: Y2023["optional-i"],
    2022: Y2022["optional-i"],
    2021: Y2021["optional-i"],
    2020: Y2020["optional-i"],
    2019: Y2019["optional-i"],
    2018: Y2018["optional-i"],
    2017: Y2017["optional-i"],
    2016: Y2016["optional-i"],
    2015: null,
    2014: null,
    2013: null,
    2012: null,
    2011: null,
    2010: null,
    2009: null,
    2008: null,
    2007: null,
    2006: null,
    2005: null,
  },
  // Sociology Optional Paper II (Indian Society – Structure and Change)
  "optional-ii": {
    2026: null,
    2025: Y2025["optional-ii"],
    2024: Y2024["optional-ii"],
    2023: Y2023["optional-ii"],
    2022: Y2022["optional-ii"],
    2021: Y2021["optional-ii"],
    2020: Y2020["optional-ii"],
    2019: Y2019["optional-ii"],
    2018: Y2018["optional-ii"],
    2017: Y2017["optional-ii"],
    2016: Y2016["optional-ii"],
    2015: null,
    2014: null,
    2013: null,
    2012: null,
    2011: null,
    2010: null,
    2009: null,
    2008: null,
    2007: null,
    2006: null,
    2005: null,
  },
  "language-i": {
    2026: null,
    2025: Y2025["language-i"],
    2024: Y2024["language-i"],
    2023: Y2023["language-i"],
    2022: Y2022["language-i"],
    2021: Y2021["language-i"],
    2020: Y2020["language-i"],
    2019: Y2019["language-i"],
    2018: Y2018["language-i"],
    2017: Y2017["language-i"],
    2016: Y2016["language-i"],
    2015: null,
    2014: null,
    2013: null,
    2012: null,
    2011: null,
    2010: null,
    2009: null,
    2008: null,
    2007: null,
    2006: null,
    2005: null,
  },
  "language-ii": {
    2026: null,
    2025: Y2025["language-ii"],
    2024: Y2024["language-ii"],
    2023: Y2023["language-ii"],
    2022: Y2022["language-ii"],
    2021: Y2021["language-ii"],
    2020: Y2020["language-ii"],
    2019: Y2019["language-ii"],
    2018: Y2018["language-ii"],
    2017: Y2017["language-ii"],
    2016: Y2016["language-ii"],
    2015: Y2015["language-ii"],
    2014: Y2014["language-ii"],
    2013: Y2013["language-ii"],
    2012: Y2012["language-ii"],
    2011: Y2011["language-ii"],
    2010: Y2010["language-ii"],
    2009: Y2009["language-ii"],
    2008: Y2008["language-ii"],
    2007: Y2007["language-ii"],
    2006: Y2006["language-ii"],
    2005: Y2005["language-ii"],
  },
};

// ── Public API consumed by MainsGrind ─────────────────────────────────────────

/**
 * Returns the official UPSC direct PDF URL (or Google Drive mirror) for a
 * given mains paper and year, or null when the paper has not yet been
 * published or is candidate-specific.
 *
 * Link sources by year range:
 *   2016–2025  → UPSC CDN direct PDF  (upsc.gov.in/sites/default/files/)
 *   2013–2015  → Google Drive mirrors (sourced from iasgyan.in)
 *   2009–2012  → Google Drive mirrors (sourced from iasgyan.in, where found)
 *   2005–2008  → UPSC official previous-question-papers page (fallback)
 *
 * Optional papers (optional-i / optional-ii):
 *   Set to Sociology Paper I / Paper II for 2018–2025.
 *   For 2016–2017 and 2020–2021 the UPSC CDN filenames were not confirmed;
 *   those entries fall back to the UPSC PYQ page.
 *   2015 and older: null (papers pre-date available CDN links).
 *
 * Qualifying papers (language-i = Hindi, language-ii = English):
 *   CDN links confirmed for 2019 and 2022–2025 (year-tagged filenames).
 *   2016–2018 and 2020–2021 used generic filenames without year tags on the CDN
 *   and cannot be reliably resolved to a specific year; those entries use UPSC_PYQ_PAGE.
 *   2015 and older: null.
 *
 * @param {number} year       e.g. 2024
 * @param {"essay"|"gs1"|"gs2"|"gs3"|"gs4"|"optional-i"|"optional-ii"|"language-i"|"language-ii"} paperId
 * @returns {string | null}   Direct PDF URL, Google Drive URL, UPSC PYQ page URL, or null
 */
export function getMainsPaperLink(year, paperId) {
  return MAINS_PAPERS[paperId]?.[year] ?? null;
}

/**
 * Convenience alias: returns the qualifying paper link for a given year.
 * language = "hindi" → language-i (Hindi compulsory)
 * language = "english" → language-ii (English compulsory)
 *
 * @param {number} year
 * @param {"hindi"|"english"} language
 * @returns {string | null}
 */
export function getQualifyingPaperLink(year, language) {
  const paperId = language === "hindi" ? "language-i" : "language-ii";
  return MAINS_PAPERS[paperId]?.[year] ?? null;
}

// ─── mains_papers.js ─────────────────────────────────────────────────────────
// Last verified: June 16, 2026
//
// Schema: { paperId → { year → url | null } }
//   url  = direct PDF on the UPSC CDN, Google Drive mirror, or UPSC PYQ page
//   null = paper not yet released / not available for that year
//
// Paper IDs match PAPER_OPTIONS in MainsGrind.jsx:
//   essay | gs1 | gs2 | gs3 | gs4 | optional-i | optional-ii | language-i | language-ii
//
// Optional papers: set to Sociology (Paper I & Paper II) for 2018–2025.
//   Direct CDN links confirmed for 2018–2019, 2022–2025.
//   UPSC PYQ page used as fallback for 2016–2017, 2020–2021.
//
// Qualifying papers:
//   language-i  = Hindi Compulsory: CDN links confirmed for 2019, 2022–2025.
//                 2016–2018, 2020–2021 used generic filenames (not year-tagged) → UPSC_PYQ_PAGE.
//   language-ii = English Compulsory: CDN links confirmed for 2019, 2022–2025.
//                 2016–2018, 2020–2021 → UPSC_PYQ_PAGE.
//   Use getQualifyingPaperLink(year, "hindi"|"english") as a convenience wrapper.
//
// gs3/gs4 are null for 2005–2012 (old pattern had only 2 GS papers).
// ─────────────────────────────────────────────────────────────────────────────