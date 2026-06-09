// ─── Prelims_paper.js ────────────────────────────────────────────────────────
// Direct PDF links sourced from upsc.gov.in/sites/default/files/
// Last verified: June 5, 2026
//
// Schema: { paperId → { year → url | null } }
//   url  = direct PDF on the UPSC CDN (opens/downloads immediately)
//   null = paper not yet released by UPSC for that year
//
// Only Paper I and Paper II are part of CSE Prelims.
// Paper II (CSAT) is qualifying only; Paper I decides Mains eligibility.
//
// getPrelimspaperLink(year, paperId) is the API consumed by PrelimsGrind.
// ─────────────────────────────────────────────────────────────────────────────

export const PRELIMS_LAST_VERIFIED_DATE = "June 5, 2026";

const BASE = "https://www.upsc.gov.in/sites/default/files/";

// ── Paper I — General Studies ─────────────────────────────────────────────────
// Exam dates: 2025 → 25 May 2025 | 2024 → 16 Jun 2024 | 2023 → 28 May 2023
// 2022 → 5 Jun 2022 | 2021 → 10 Oct 2021 | 2020 → 4 Oct 2020
// 2019 → 2 Jun 2019 | 2018 → 3 Jun 2018 | 2017 → 18 Jun 2017
// 2016 → 7 Aug 2016

const PAPER_I_URLS = {
  2026: `${BASE}QP_CSP_2026_GENERAL_STUDIES_PAPER-I_25052026.pdf`,
  2025: `${BASE}QP-CSP-25-GENERAL-STUDIES-PAPER-I-26052025.pdf`,
  2024: `${BASE}QP-CSP-24-GENERAL-STUDIES-PAPER-I-180624.pdf`,
  2023: `${BASE}QP_CS_Pre_Exam_2023_280523.pdf`,
  2022: `${BASE}GENERAL%20STUDIES%20PAPER%20I.pdf`,
  2021: `${BASE}QP-CSP-21-GeneralStudiesPaper-I-121021.pdf`,
  2020: `${BASE}CSP_2020_GS_Paper-1.pdf`,
  2019: `${BASE}csp-p1.pdf`,
  2018: `${BASE}QP-CSP-18-GS-I-C.pdf`,
  2017: `${BASE}CSP-17-GS_PAPER-1-C.pdf`,
  2016: `${BASE}GENERAL_STUDIES_PAPER-I.pdf`,
  2015: `${BASE}CSP_2015_eng%20(1).pdf`,
  2014: `${BASE}CSP_14_GenStudy_I0001.pdf`, // no official UPSC CDN URL found
  2013: null,
  2012: null,
  2011: null,
  2010: null,
  2009: null,
  2008: null,
  2007: null,
  2006: null,
  2005: null,
};

// ── Paper II — CSAT (General Studies Paper II) ────────────────────────────────
// Same exam days as Paper I; conducted in the afternoon session.

const PAPER_II_URLS = {
  2026: `${BASE}QP_CSP_2026_GENERAL_STUDIES_PAPER-II_25052026.pdf`,
  2025: `${BASE}QP-CSP-25-GENERAL-STUDIES-PAPER-II-26052025.pdf`,
  2024: `${BASE}QP-CSP-24-GENERAL-STUDIES-PAPER-II-180624.pdf`,
  2023: `${BASE}QP_CS_Pre_Exam_2023_GENERAL_STUDIES_PAPER_II_280523.pdf`,
  2022: `${BASE}GENERAL%20STUDIES%20PAPER%20II.pdf`,
  2021: `${BASE}QP-CSP-21-GeneralStudiesPaper-II-121021.pdf`,
  2020: `${BASE}CSP_2020_GS_Paper-2.pdf`,
  2019: `${BASE}GS11.pdf`,
  2018: `${BASE}QP-CSP-18-GS-II-C.pdf`,
  2017: `${BASE}CSP-17-GS_PAPER-II-C.pdf`,
  2016: `${BASE}GENERAL_STUDIES_PAPER-II.pdf`,
  2015: `${BASE}CSP_2015_eng%20(1).pdf`,
  2014: `${BASE}CSP_14_GenStudy_II0001.pdf`,
  2013: null,
  2012: null,
  2011: null,
  2010: null,
  2009: null,
  2008: null,
  2007: null,
  2006: null,
  2005: null,
};

// ── Core lookup table ─────────────────────────────────────────────────────────

export const PRELIMS_PAPERS = {
  "paper-i": PAPER_I_URLS,
  "paper-ii": PAPER_II_URLS,
};

// ── Public API consumed by PrelimsGrind ───────────────────────────────────────

/**
 * Returns the official UPSC direct PDF URL for a given prelims paper and year,
 * or null when the paper has not yet been published.
 *
 * @param {number} year       e.g. 2024
 * @param {"paper-i"|"paper-ii"} paperId
 * @returns {string | null}   Direct PDF URL or null
 */
export function getPrelimsPaperLink(year, paperId) {
  return PRELIMS_PAPERS[paperId]?.[year] ?? null;
}