
export const DASHBOARD_WIDGETS_EVENT = "upsc:dashboard-widgets-changed";

export const DASHBOARD_WIDGETS = [
  {
    id: "todaysMission",
    label: "Today's Mission",
    description: "Daily study, practice, revision and coverage checklist.",
  },
  {
    id: "onboarding",
    label: "Preparation Journey",
    description: "Milestone cards guiding you through setup and early progress.",
  },
  {
    id: "todayPlanner",
    label: "Today's Tasks",
    description: "Quick add / check-off to-do list for the day.",
  },
  {
    id: "studyChart",
    label: "Study Chart",
    description: "Weekly, monthly and yearly study-hours history.",
  },
  {
    id: "paperProgress",
    label: "Paper Coverage",
    description: "Completion percentage for each GS paper.",
  },
  {
    id: "aiRevision",
    label: "AI Revision Queue",
    description: "Spaced-repetition topics due for review.",
  },
  {
    id: "questionStats",
    label: "Question Statistics",
    description: "PYQ attempt counts and accuracy breakdown.",
  },
];

const VALID_IDS = new Set(DASHBOARD_WIDGETS.map((w) => w.id));

function dashboardWidgetsKey(uid) {
  return `upsc_dashboard_widgets_${uid || "anon"}`;
}

export function loadEnabledWidgets(uid) {
  try {
    const raw = localStorage.getItem(dashboardWidgetsKey(uid));
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => VALID_IDS.has(id)) : [];
  } catch {
    return [];
  }
}

export function saveEnabledWidgets(uid, ids) {
  const clean = Array.isArray(ids) ? ids.filter((id) => VALID_IDS.has(id)) : [];
  try {
    localStorage.setItem(dashboardWidgetsKey(uid), JSON.stringify(clean));
  } catch {
  }
  try {
    window.dispatchEvent(new CustomEvent(DASHBOARD_WIDGETS_EVENT, { detail: { uid, enabled: clean } }));
  } catch {
  }
  return clean;
}