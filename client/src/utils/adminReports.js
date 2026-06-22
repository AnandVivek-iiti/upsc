// src/utils/adminReports.js
// npm install jspdf jspdf-autotable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      [8,   14,  30],
  surface: [18,  26,  46],
  alt:     [14,  22,  40],
  border:  [42,  56,  82],
  text:    [228, 234, 245],
  muted:   [110, 130, 160],
  blue:    [96,  165, 250],
  green:   [74,  222, 128],
  gold:    [251, 191, 36],
  red:     [248, 113, 113],
  purple:  [167, 139, 250],
  orange:  [249, 115, 22],
  cyan:    [34,  211, 238],
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
function relTime(iso) {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function maskEmail(e) {
  return e ? e.replace(/(.{2}).*(@.*)/, "$1\u2022\u2022\u2022\u2022$2") : "\u2014";
}
function fmtDate(iso) {
  return iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
    : "\u2014";
}
function makeDoc(landscape = false) {
  return new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: "a4" });
}

// ─── Page header ──────────────────────────────────────────────────────────────
function pageHeader(doc, title, subtitle = "") {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, w, 30, "F");

  // dual accent stripe
  doc.setFillColor(...C.gold);
  doc.rect(0, 27.5, 40, 1.8, "F");
  doc.setFillColor(...C.blue);
  doc.rect(40, 27.5, w - 40, 1.8, "F");

  // brand label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.gold);
  doc.text("UPSC MENTOR  \u00b7  ADMIN PANEL", 14, 9);

  // report title
  doc.setFontSize(14);
  doc.setTextColor(...C.text);
  doc.text(title, 14, 20);

  // right: subtitle + timestamp
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  if (subtitle) doc.text(subtitle, w - 14, 12, { align: "right" });
  const ts = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
  doc.text(`Generated: ${ts} IST`, w - 14, 20, { align: "right" });
}

// ─── Section label ────────────────────────────────────────────────────────────
function sectionLabel(doc, y, text, color = C.blue) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...color);
  doc.text(text.toUpperCase(), 14, y);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.25);
  doc.line(14, y + 1.3, w - 14, y + 1.3);
  return y + 6;
}

// ─── Metric boxes ─────────────────────────────────────────────────────────────
function metricBoxes(doc, y, items) {
  const w   = doc.internal.pageSize.getWidth();
  const n   = items.length;
  const gap = 3;
  const boxW = (w - 28 - gap * (n - 1)) / n;
  const boxH = 18;

  items.forEach((item, i) => {
    const x = 14 + i * (boxW + gap);
    doc.setFillColor(...C.surface);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, "FD");

    // left accent bar
    doc.setFillColor(...(item.color || C.blue));
    doc.rect(x, y, 2.2, boxH, "F");

    // label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(...C.muted);
    doc.text(item.label.toUpperCase(), x + 5, y + 5.5);

    // value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...(item.color || C.text));
    doc.text(String(item.value ?? "\u2014"), x + 5, y + 14);
  });

  return y + boxH + 5;
}

// ─── Dark autotable ───────────────────────────────────────────────────────────
function darkTable(doc, y, head, body, colStyles = {}, didDrawCell) {
  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    theme: "plain",
    headStyles: {
      fillColor: C.bg,
      textColor: C.muted,
      fontSize: 6.5,
      fontStyle: "bold",
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: C.border,
      lineWidth: { bottom: 0.3 },
    },
    bodyStyles: {
      fillColor: C.surface,
      textColor: C.text,
      fontSize: 7,
      cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 },
      lineColor: C.border,
      lineWidth: { bottom: 0.15 },
    },
    alternateRowStyles: { fillColor: C.alt },
    columnStyles: colStyles,
    didDrawCell,
    margin: { left: 14, right: 14 },
  });
  return (doc.lastAutoTable?.finalY ?? y) + 7;
}

// ─── Page footers ─────────────────────────────────────────────────────────────
function addFooters(doc) {
  const total = doc.internal.getNumberOfPages();
  const w     = doc.internal.pageSize.getWidth();
  const h     = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.bg);
    doc.rect(0, h - 7, w, 7, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(...C.muted);
    doc.text("UPSC Mentor Admin \u2014 Confidential", 14, h - 2.5);
    doc.text(`Page ${i} / ${total}`, w - 14, h - 2.5, { align: "right" });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
export function downloadOverviewReport(metrics) {
  if (!metrics) return;
  const { users = {}, engagement = {}, activity = {}, trends = {} } = metrics;
  const doc = makeDoc();
  pageHeader(doc, "Overview Report", `${users.total ?? 0} total users`);

  let y = 36;

  y = sectionLabel(doc, y, "User Growth", C.blue);
  y = metricBoxes(doc, y, [
    { label: "Total Users",   value: users.total,        color: C.blue   },
    { label: "Today Signups", value: users.todaySignups, color: C.green  },
    { label: "DAU",           value: users.dau,          color: C.gold   },
    { label: "WAU",           value: users.wau,          color: C.purple },
    { label: "MAU",           value: users.mau,          color: C.orange },
  ]);

  y = sectionLabel(doc, y, "Feature Adoption", C.green);
  y = metricBoxes(doc, y, [
    { label: "Registered",       value: users.total,             color: C.blue   },
    { label: "Used 1+ Features", value: users.usedAnyFeature,    color: C.green  },
    { label: "Used 3+ Features", value: users.used3PlusFeatures, color: C.gold   },
    { label: "Used 5+ Features", value: users.used5PlusFeatures, color: C.purple },
  ]);

  y = sectionLabel(doc, y, "Engagement", C.gold);
  y = metricBoxes(doc, y, [
    { label: "Retention D1",    value: engagement.retentionD1    !== undefined ? `${engagement.retentionD1}%`    : "\u2014", color: C.green  },
    { label: "Retention D7",    value: engagement.retentionD7    !== undefined ? `${engagement.retentionD7}%`    : "\u2014", color: C.gold   },
    { label: "Avg Study / Day", value: engagement.avgStudyHours  !== undefined ? `${engagement.avgStudyHours}h`  : "\u2014", color: C.blue   },
    { label: "Total Study Hrs", value: engagement.totalStudyHours !== undefined ? `${engagement.totalStudyHours}h` : "\u2014", color: C.purple },
    { label: "Active Streaks",  value: users.activeStreakUsers,  color: C.orange },
  ]);

  y = sectionLabel(doc, y, "Activity", C.orange);
  metricBoxes(doc, y, [
    { label: "Answers Evaluated", value: activity.answersEvaluated,      color: C.gold   },
    { label: "Notes Audited",     value: activity.notesAudited,          color: C.green  },
    { label: "Tests Attempted",   value: activity.testsAttempted,        color: C.orange },
    { label: "AI Conversations",  value: activity.aiMentorConversations, color: C.purple },
  ]);

  addFooters(doc);
  doc.save("admin-overview.pdf");
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. USERS  (landscape — many columns)
// ══════════════════════════════════════════════════════════════════════════════
export function downloadUsersReport(users, total) {
  if (!users?.length) return;
  const doc = makeDoc(true);
  pageHeader(doc, "Users Report", `Showing ${users.length} of ${total} users`);

  const head = [
    "Name","Email","Streak","Best","Study","Answers",
    "Notes","Tests","Days","Features","Last Active","Joined","Score",
  ];
  const body = users.map(u => [
    u.name || "\u2014",
    maskEmail(u.email),
    u.streak            || "\u2014",
    u.longest_streak    || "\u2014",
    u.total_study_hours ? `${parseFloat(u.total_study_hours).toFixed(1)}h` : "\u2014",
    u.answers_evaluated ?? "\u2014",
    u.notes_audited     ?? "\u2014",
    u.tests_attempted   ?? "\u2014",
    u.days_active       ?? "\u2014",
    u.features_used !== undefined ? `${u.features_used}/7` : "\u2014",
    relTime(u.last_active),
    fmtDate(u.registration_date),
    u.engagement_score  ?? "\u2014",
  ]);

  darkTable(doc, 36, head, body, {
    0:  { cellWidth: 28 },
    1:  { cellWidth: 34 },
    9:  { halign: "center", textColor: C.cyan },
    12: { halign: "right",  textColor: C.gold },
  });

  addFooters(doc);
  doc.save("admin-users.pdf");
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════
export function downloadAnalyticsReport(funnel, features) {
  const doc = makeDoc();
  pageHeader(doc, "Analytics Report", "Activation Funnel & Feature Engagement");

  let y = 36;

  if (funnel?.length) {
    y = sectionLabel(doc, y, "Activation Funnel", C.blue);
    const head = ["Step", "Label", "Users", "% of Total", "Drop-off"];
    const body = funnel.map(s => [
      String(s.step),
      s.label,
      String(s.count),
      `${s.pctOfTotal}%`,
      s.dropOffPct > 0 ? `-${s.dropOffPct}%` : "\u2014",
    ]);
    y = darkTable(doc, y, head, body, {
      0: { halign: "center", cellWidth: 14 },
      2: { halign: "right"  },
      3: { halign: "right"  },
      4: { halign: "right", textColor: C.red },
    });
  }

  if (features?.length) {
    y = sectionLabel(doc, y, "Feature Engagement \u2014 Ranked by Score", C.gold);
    const head = ["#", "Feature", "Unique Users", "Total Uses", "Avg / User", "Score", "Last Used"];
    const body = features.map((f, i) => [
      String(i + 1),
      f.name,
      String(f.uniqueUsers),
      String(f.totalUses),
      `${f.avgUsagePerUser}\u00d7`,
      String(f.engagementScore),
      f.lastUsed
        ? new Date(f.lastUsed).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : "\u2014",
    ]);
    darkTable(doc, y, head, body, {
      0: { halign: "center", cellWidth: 10 },
      2: { halign: "right"  },
      3: { halign: "right"  },
      4: { halign: "right"  },
      5: { halign: "right",  textColor: C.gold },
    });
  }

  addFooters(doc);
  doc.save("admin-analytics.pdf");
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. ACTIVITY
// ══════════════════════════════════════════════════════════════════════════════
export function downloadActivityReport(events) {
  if (!events?.length) return;
  const doc = makeDoc();
  pageHeader(doc, "Activity Report", `${events.length} recent events`);

  const EVENT_LABELS = {
    dashboard_visit:  "Visited Dashboard",
    timer_start:      "Started Timer",
    mentor_open:      "Opened AI Mentor",
    answer_evaluated: "Evaluated Answer",
    notes_audited:    "Audited Notes",
    test_attempted:   "Mock Test",
    pyq_used:         "Practiced PYQs",
    syllabus_tracked: "Updated Syllabus",
    day_return:       "Returned to Study",
  };

  const head = ["#", "User", "Event", "Feature", "Subject", "Time (IST)"];
  const body = events.map((ev, i) => [
    String(i + 1),
    ev.user_name || "\u2014",
    EVENT_LABELS[ev.event_type] || ev.event_type,
    ev.feature_name          || "\u2014",
    ev.metadata?.subject     || "\u2014",
    new Date(ev.created_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    }),
  ]);

  darkTable(doc, 36, head, body, {
    0: { halign: "center", cellWidth: 10 },
    1: { cellWidth: 36 },
    5: { textColor: C.cyan },
  });

  addFooters(doc);
  doc.save("admin-activity.pdf");
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. RETENTION
// ══════════════════════════════════════════════════════════════════════════════
export function downloadRetentionReport(retention, cohort, churnList) {
  const doc = makeDoc();
  const d1  = retention?.d1  ?? "\u2014";
  const d7  = retention?.d7  ?? "\u2014";
  const d30 = retention?.d30 ?? "\u2014";
  pageHeader(doc, "Retention Report", `D1: ${d1}%  \u00b7  D7: ${d7}%  \u00b7  D30: ${d30}%`);

  let y = 36;

  // ── Summary boxes ─────────────────────────────────────────────────────────
  if (retention) {
    y = sectionLabel(doc, y, "Retention Rates", C.green);
    y = metricBoxes(doc, y, [
      { label: "Day 1 \u2014 returned next day",    value: `${d1}%`,  color: C.green  },
      { label: "Day 7 \u2014 returned within week", value: `${d7}%`,  color: C.gold   },
      { label: "Day 30 \u2014 returned in month",   value: `${d30}%`, color: C.orange },
    ]);
  }

  // ── Weekly Cohort table with colour-coded % cells ─────────────────────────
  if (cohort?.length) {
    y = sectionLabel(doc, y, "Weekly Cohort Retention", C.blue);
    const head = ["Signup Week", "Cohort Size", "Week 0", "Week 1", "Week 2", "Week 3"];
    const body = cohort.map(r => [
      r.cohortWeek,
      String(r.cohortSize),
      r.week0 !== undefined ? `${r.week0}%` : "\u2014",
      r.week1 !== undefined ? `${r.week1}%` : "\u2014",
      r.week2 !== undefined ? `${r.week2}%` : "\u2014",
      r.week3 !== undefined ? `${r.week3}%` : "\u2014",
    ]);

    const pctColor = (raw) => {
      const n = parseInt(raw);
      if (isNaN(n)) return C.muted;
      if (n >= 60) return C.green;
      if (n >= 30) return C.gold;
      if (n >= 10) return C.orange;
      return C.red;
    };

    y = darkTable(doc, y, head, body,
      {
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
      (data) => {
        // colour-code week 0–3 cells
        if (data.section === "body" && data.column.index >= 2) {
          const raw = data.cell.raw;
          const color = pctColor(raw);
          const cx = data.cell.x + data.cell.width  / 2;
          const cy = data.cell.y + data.cell.height / 2 + 1;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(...color);
          doc.text(String(raw), cx, cy, { align: "center" });
          data.cell.text = [];     // suppress default renderer
        }
      }
    );
  }

  // ── Churn risk list ───────────────────────────────────────────────────────
  if (churnList?.length) {
    y = sectionLabel(doc, y, `Churn Risk \u2014 Inactive 7+ Days (${churnList.length} users)`, C.red);
    const head = ["Name", "Email", "Streak", "Last Active"];
    const body = churnList.map(u => [
      u.name || "\u2014",
      maskEmail(u.email),
      u.streak ? String(u.streak) : "\u2014",
      u.last_active
        ? new Date(u.last_active).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata", day: "numeric", month: "short",
          })
        : "Never seen",
    ]);
    darkTable(doc, y, head, body, {
      3: { textColor: C.red },
    });
  }

  addFooters(doc);
  doc.save("admin-retention.pdf");
}