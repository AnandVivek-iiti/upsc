// utils/adminReports.js

function escapeCSV(str) {
  if (str == null) return "";
  const s = String(str);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function sectionToCSV(sectionName, headers, rows) {
  let csv = `\n# SECTION: ${sectionName}\n`;
  csv += headers.join(",") + "\n";
  rows.forEach((row) => {
    csv += row.map((cell) => escapeCSV(cell)).join(",") + "\n";
  });
  return csv;
}

export function downloadFullReport(data) {
  const {
    metrics,
    users,
    usersTotal,
    funnel,
    features,
    events,
    retention,
    cohort,
    churnList,
    journeyData,
    segments,
    discovery,
    insights,
    feedbackStats,
    feedbackList,
  } = data;

  let csv = "# UPSC Mentor Admin Report\n";
  csv += `# Generated: ${new Date().toISOString()}\n`;

  // 1. Overview
  if (metrics) {
    const { users: u = {}, engagement = {}, activity = {} } = metrics;
    csv += sectionToCSV(
      "Overview",
      ["Metric", "Value"],
      [
        ["Total Users", u.total],
        ["Today Signups", u.todaySignups],
        ["DAU", u.dau],
        ["WAU", u.wau],
        ["MAU", u.mau],
        ["Used Any Feature", u.usedAnyFeature],
        ["Used 3+ Features", u.used3PlusFeatures],
        ["Used 5+ Features", u.used5PlusFeatures],
        ["Retention D1", engagement.retentionD1],
        ["Retention D7", engagement.retentionD7],
        ["Avg Study / Day", engagement.avgStudyHours],
        ["Total Study Hours", engagement.totalStudyHours],
        ["Active Streak Users", u.activeStreakUsers],
        ["Answers Evaluated", activity.answersEvaluated],
        ["Notes Audited", activity.notesAudited],
        ["Tests Attempted", activity.testsAttempted],
        ["AI Conversations", activity.aiMentorConversations],
      ],
    );
  }

  // 2. Users
  if (users) {
    const headers = [
      "Name",
      "Email",
      "Streak",
      "Best Streak",
      "Study Hours",
      "Answers",
      "Notes",
      "Tests",
      "Days Active",
      "Features Used",
      "Last Active",
      "Joined",
      "Engagement Score",
    ];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.streak,
      u.longest_streak,
      u.total_study_hours,
      u.answers_evaluated,
      u.notes_audited,
      u.tests_attempted,
      u.days_active,
      u.features_used,
      u.last_active,
      u.registration_date,
      u.engagement_score,
    ]);
    csv += sectionToCSV("Users", headers, rows);
  }

  // 3. Analytics – Funnel
  if (funnel) {
    const headers = ["Step", "Label", "Count", "% of Total", "Drop Off %"];
    const rows = funnel.map((s) => [
      s.step,
      s.label,
      s.count,
      s.pctOfTotal,
      s.dropOffPct,
    ]);
    csv += sectionToCSV("Activation Funnel", headers, rows);
  }

  // 4. Analytics – Feature Engagement
  if (features) {
    const headers = [
      "Feature",
      "Unique Users",
      "Total Uses",
      "Avg / User",
      "Engagement Score",
      "Last Used",
    ];
    const rows = features.map((f) => [
      f.name,
      f.uniqueUsers,
      f.totalUses,
      f.avgUsagePerUser,
      f.engagementScore,
      f.lastUsed,
    ]);
    csv += sectionToCSV("Feature Engagement", headers, rows);
  }

  // 5. Activity Feed
  if (events) {
    const headers = ["User", "Event", "Feature", "Timestamp", "Metadata"];
    const rows = events.map((e) => [
      e.user_name,
      e.event_type,
      e.feature_name,
      e.created_at,
      JSON.stringify(e.metadata || {}),
    ]);
    csv += sectionToCSV("Activity Feed", headers, rows);
  }

  // 6. Retention
  if (retention) {
    csv += sectionToCSV(
      "Retention Rates",
      ["Day", "Rate"],
      [
        ["Day 1", retention.d1],
        ["Day 7", retention.d7],
        ["Day 30", retention.d30],
      ],
    );
  }

  // 7. Cohort
  if (cohort) {
    const headers = [
      "Signup Week",
      "Cohort Size",
      "Week 0 %",
      "Week 1 %",
      "Week 2 %",
      "Week 3 %",
    ];
    const rows = cohort.map((c) => [
      c.cohortWeek,
      c.cohortSize,
      c.week0,
      c.week1,
      c.week2,
      c.week3,
    ]);
    csv += sectionToCSV("Cohort Retention", headers, rows);
  }

  // 8. Churn List
  if (churnList) {
    const headers = ["Name", "Email", "Streak", "Last Active"];
    const rows = churnList.map((u) => [
      u.name,
      u.email,
      u.streak,
      u.last_active,
    ]);
    csv += sectionToCSV("Churn Risk (7+ days)", headers, rows);
  }

  // 9. Journey – First Feature
  if (journeyData?.firstFeatureRanked) {
    const headers = [
      "Feature",
      "First-time Users",
      "% of Total",
      "Return Rate",
    ];
    const rows = journeyData.firstFeatureRanked.map((f) => [
      f.feature,
      f.count,
      f.pct,
      f.returnRate,
    ]);
    csv += sectionToCSV("First Feature Discovery", headers, rows);
  }

  // 10. Journey – Recent Journeys
  if (journeyData?.journeyRows) {
    const headers = [
      "User",
      "Signed Up",
      "First Feature",
      "Second Feature",
      "Most Used",
      "Returned Next Day",
    ];
    const rows = journeyData.journeyRows.map((j) => [
      j.name,
      j.signed_up,
      j.first_feature,
      j.second_feature,
      j.most_used_feature,
      j.returned_next_day,
    ]);
    csv += sectionToCSV("Recent User Journeys", headers, rows);
  }

  // 11. Segments
  if (segments) {
    const { powerUsers, atRisk, dormant, newUsers, total } = segments;
    csv += sectionToCSV(
      "Segments",
      ["Segment", "Count", "Users"],
      [
        [
          "Power Users",
          powerUsers.count,
          powerUsers.users.map((u) => u.name).join("; "),
        ],
        ["At Risk", atRisk.count, atRisk.users.map((u) => u.name).join("; ")],
        ["Dormant", dormant.count, dormant.users.map((u) => u.name).join("; ")],
        [
          "New Users",
          newUsers.count,
          newUsers.users.map((u) => u.name).join("; "),
        ],
        ["Total", total, ""],
      ],
    );
  }

  // 12. Discovery
  if (discovery) {
    // First feature distribution
    if (discovery.firstFeatureDist) {
      const rows = Object.entries(discovery.firstFeatureDist).map(
        ([feature, count]) => [feature, count],
      );
      csv += sectionToCSV(
        "First Feature Distribution",
        ["Feature", "Count"],
        rows,
      );
    }
    // Retention by feature
    if (discovery.retentionByFeature) {
      const headers = ["Feature", "Return Rate"];
      const rows = discovery.retentionByFeature.map((f) => [
        f.feature,
        f.returnRate,
      ]);
      csv += sectionToCSV("Retention by Feature", headers, rows);
    }
    // Ignored features
    if (discovery.ignoredFeatures) {
      const rows = discovery.ignoredFeatures.map((f) => [f]);
      csv += sectionToCSV(
        "Ignored Features (<10% adoption)",
        ["Feature"],
        rows,
      );
    }
    // Cause of return
    if (discovery.causeOfReturn) {
      const rows = discovery.causeOfReturn.map((f) => [f.feature, f.count]);
      csv += sectionToCSV(
        "Features that drive return",
        ["Feature", "Count"],
        rows,
      );
    }
  }

  // 13. Insights
  if (insights) {
    const headers = ["Title", "Body", "Type", "Feature"];
    const rows = insights.map((i) => [
      i.title,
      i.body,
      i.type,
      i.feature || "",
    ]);
    csv += sectionToCSV("Insights", headers, rows);
  }

  // 14. Feedback
  if (feedbackStats) {
    csv += sectionToCSV(
      "Feedback Stats",
      ["Metric", "Value"],
      [
        ["Total Feedback", feedbackStats.total],
        ["Average Rating", feedbackStats.avgRating],
        ["Would Recommend %", feedbackStats.recommendRate],
        ["Best Feature", feedbackStats.featureStats?.[0]?.feature || ""],
      ],
    );
    if (feedbackStats.featureStats) {
      const rows = feedbackStats.featureStats.map((f) => [
        f.feature,
        f.count,
        f.avgRating,
      ]);
      csv += sectionToCSV(
        "Feedback by Feature",
        ["Feature", "Count", "Avg Rating"],
        rows,
      );
    }
    if (feedbackStats.mostRequested) {
      const rows = feedbackStats.mostRequested.map((r) => [r.feature, r.count]);
      csv += sectionToCSV(
        "Most Requested Features",
        ["Feature", "Requests"],
        rows,
      );
    }
  }

  if (feedbackList) {
    const headers = [
      "User",
      "Email",
      "Rating",
      "Feature",
      "Feedback",
      "Recommend",
      "Date",
    ];
    const rows = feedbackList.map((f) => [
      f.User?.name || "Anonymous",
      f.User?.email || "",
      f.rating,
      f.feature,
      f.feedbackText,
      f.wouldRecommend ? "Yes" : f.wouldRecommend === false ? "No" : "",
      f.createdAt,
    ]);
    csv += sectionToCSV("Recent Feedback", headers, rows);
  }

  // Download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `admin_report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}
