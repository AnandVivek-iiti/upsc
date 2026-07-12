const { Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User       = require("../models/User");
const UserData   = require("../models/UserData").UserData ?? require("../models/UserData");
const UserEvents = require("../models/UserEvents");

// in-memory cache, 5 min TTL
const cache = {};
function getCached(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > 5 * 60 * 1000) { delete cache[key]; return null; }
  return entry.data;
}
function setCached(key, data) { cache[key] = { data, ts: Date.now() }; }

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function pct(numerator, denominator, decimals = 1) {
  if (!denominator || denominator <= 0) return 0;
  const factor = 10 ** decimals;
  return Math.round((numerator / denominator) * 100 * factor) / factor;
}
function round(n, decimals = 1) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return 0;
  const factor = 10 ** decimals;
  return Math.round(Number(n) * factor) / factor;
}
function normalize(value, cap) {
  if (!cap || cap <= 0) return 0;
  return Math.max(0, Math.min(100, (value / cap) * 100));
}

const ALL_FEATURES = [
  "AI Mentor", "Notes Auditor", "Syllabus Tracker",
  "Dashboard", "Timer", "Topic Practice",
  "PYQs", "Mock Tests", "AI Evaluator",
];

// activation = one meaningful session: 20+ min timer, AI Mentor, Notes Audit, or Answer Evaluation
const STUDY_TIMER_QUALIFYING_MINUTES = 20;
const AI_INTERACTION_EVENT_TYPES = ["mentor_open", "answer_evaluated"];
const REVISION_FEATURE_NAME = "Topic Practice"; // proxy until a dedicated revision event exists
const DAILY_LOG_DATE_EXPR = `COALESCE(log->>'date', log->>'day')`;

const EXCL_NAMES     = ["admin", "anand vivek"];
const EXCL_SQL       = EXCL_NAMES.map(n => `'${n}'`).join(", ");
const EXCL_USER_COND = `LOWER(u.name) NOT IN (${EXCL_SQL})`;
const EXCL_NAME_COND = `LOWER(name) NOT IN (${EXCL_SQL})`;
const EXCL_UID_COND  = `user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))`;

const SESSION_GAP_SECONDS = 1800; // 30 min inactivity = new session

// one row per raw event, tagged with which session (session_seq) it belongs to
const SESSIONIZED_CTE = `
  sessionized AS (
    SELECT
      user_id,
      event_type,
      feature_name,
      created_at,
      SUM(
        CASE WHEN gap_seconds IS NULL OR gap_seconds > ${SESSION_GAP_SECONDS} THEN 1 ELSE 0 END
      ) OVER (PARTITION BY user_id ORDER BY created_at) AS session_seq
    FROM (
      SELECT
        user_id, event_type, feature_name, created_at,
        EXTRACT(EPOCH FROM (
          created_at - LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at)
        )) AS gap_seconds
      FROM "UserEvents"
      WHERE ${EXCL_UID_COND}
    ) raw_events
  )`;

// one row per (user_id, session_seq)
const SESSIONS_CTE = `
  sessions AS (
    SELECT
      user_id,
      session_seq,
      MIN(created_at) AS started_at,
      MAX(created_at) AS ended_at,
      COUNT(*) AS event_count,
      COUNT(DISTINCT feature_name) AS features_count,
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 60.0 AS duration_minutes
    FROM sessionized
    GROUP BY user_id, session_seq
  )`;

// cumulative funnel: a user only counts toward stage N if they cleared stage N-1
function buildFunnelSql(stages) {
  let sql = `WITH base AS (
    SELECT id AS user_id FROM "users" WHERE role = 'user' AND ${EXCL_NAME_COND}
  )`;
  let prevAlias = "base";
  stages.forEach((stage, i) => {
    const alias = `s${i + 1}`;
    const eventList = stage.eventTypes.map((e) => `'${e}'`).join(", ");
    sql += `,
  ${alias} AS (
    SELECT DISTINCT p.user_id
    FROM ${prevAlias} p
    JOIN "UserEvents" ue ON ue.user_id = p.user_id AND ue.event_type IN (${eventList})
  )`;
    prevAlias = alias;
  });
  const selects = [`(SELECT COUNT(*) FROM base) AS c0`];
  stages.forEach((_, i) => selects.push(`(SELECT COUNT(*) FROM s${i + 1}) AS c${i + 1}`));
  sql += `
  SELECT ${selects.join(",\n         ")}`;
  return sql;
}

async function runFunnel(stages) {
  const rows = await sequelize.query(buildFunnelSql(stages), { type: QueryTypes.SELECT });
  const row = rows[0] || {};
  const counts = [parseInt(row.c0 || 0)];
  stages.forEach((_, i) => counts.push(parseInt(row[`c${i + 1}`] || 0)));
  return counts;
}

function shapeFunnelSteps(counts, labels) {
  return labels.map((label, i) => {
    const users = counts[i];
    const prev = i === 0 ? users : counts[i - 1];
    const conversionPct = i === 0 ? 100 : pct(users, prev);
    const dropoffPct = i === 0 ? 0 : round(100 - conversionPct);
    const pctOfTotal = pct(users, counts[0]);
    return { step: i + 1, label, users, conversionPct, dropoffPct, pctOfTotal };
  });
}

// eligibleUsers = signed up long enough ago for the window to have fully elapsed
async function retentionCohort(days) {
  const sql = `
    WITH eligible AS (
      SELECT id AS user_id, created_at
      FROM "users"
      WHERE role = 'user' AND ${EXCL_NAME_COND}
        AND created_at <= NOW() - INTERVAL '${days + 1} days'
    ),
    returned AS (
      SELECT DISTINCT e.user_id
      FROM eligible e
      JOIN "UserEvents" ue ON ue.user_id = e.user_id
      WHERE ue.created_at >= e.created_at + INTERVAL '${days} days'
        AND ue.created_at <  e.created_at + INTERVAL '${days + 1} days'
    )
    SELECT
      (SELECT COUNT(*) FROM eligible) AS eligible_users,
      (SELECT COUNT(*) FROM returned) AS retained_users`;
  const rows = await sequelize.query(sql, { type: QueryTypes.SELECT });
  const eligibleUsers = parseInt(rows[0]?.eligible_users || 0);
  const retainedUsers = parseInt(rows[0]?.retained_users || 0);
  return { retainedUsers, eligibleUsers, percentage: pct(retainedUsers, eligibleUsers) };
}

// segments: lost (30+ days) > churn risk (14-30) > dormant (7-14) > power/activated/new by recency + depth
async function classifyUsers() {
  const rows = await sequelize.query(
    `WITH ${SESSIONIZED_CTE},
     session_counts AS (
       SELECT user_id, COUNT(DISTINCT session_seq) AS sessions
       FROM sessionized GROUP BY user_id
     ),
     study AS (
       SELECT ud.user_id, SUM((log->>'hours')::float) AS study_hours
       FROM "user_data" ud
       CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ud.daily_logs, '[]'::jsonb)) AS log
       GROUP BY ud.user_id
     ),
     last_active AS (
       SELECT user_id, MAX(created_at) AS last_active
       FROM "UserEvents" WHERE ${EXCL_UID_COND} GROUP BY user_id
     )
     SELECT
       u.id, u.name, u.email, u.streak, u.longest_streak, u.created_at,
       COALESCE(sc.sessions, 0) AS sessions,
       COALESCE(st.study_hours, 0) AS study_hours,
       la.last_active
     FROM "users" u
     LEFT JOIN session_counts sc ON sc.user_id = u.id
     LEFT JOIN study st ON st.user_id = u.id
     LEFT JOIN last_active la ON la.user_id = u.id
     WHERE u.role = 'user' AND ${EXCL_USER_COND}`,
    { type: QueryTypes.SELECT }
  );

  const now = Date.now();
  const segments = { newUsers: [], activated: [], powerUsers: [], dormant: [], churnRisk: [], lost: [] };

  rows.forEach((u) => {
    const daysSinceActive = u.last_active ? (now - new Date(u.last_active)) / 86400000 : Infinity;
    const sessions = parseInt(u.sessions || 0);
    const studyHours = parseFloat(u.study_hours || 0);
    const streak = parseInt(u.streak || 0);

    if (daysSinceActive > 30) {
      segments.lost.push(u);
    } else if (daysSinceActive > 14) {
      segments.churnRisk.push(u);
    } else if (daysSinceActive > 7) {
      segments.dormant.push(u);
    } else if (streak >= 5 || sessions >= 10 || studyHours >= 10) {
      segments.powerUsers.push(u);
    } else if (sessions >= 2 || studyHours > 0) {
      segments.activated.push(u);
    } else {
      segments.newUsers.push(u);
    }
  });

  return { rows, segments };
}

// weights sum to 1.0, each input normalized 0-100 against its cap
const ENGAGEMENT_WEIGHTS = {
  studyHours:     0.25, // capped at 50 hours
  activeDays:     0.20, // capped at 30 days
  retention:      0.20, // 100 if returned the day after signup, else 0
  featureBreadth: 0.15, // capped at total feature count
  sessions:       0.10, // capped at 20 sessions
  aiInteractions: 0.10, // capped at 20 AI interactions
};
function computeEngagementScore({ studyHours, activeDays, hasReturned, featuresUsed, sessions, aiInteractions }) {
  const score =
    normalize(studyHours, 50)               * ENGAGEMENT_WEIGHTS.studyHours +
    normalize(activeDays, 30)                * ENGAGEMENT_WEIGHTS.activeDays +
    (hasReturned ? 100 : 0)                  * ENGAGEMENT_WEIGHTS.retention +
    normalize(featuresUsed, ALL_FEATURES.length) * ENGAGEMENT_WEIGHTS.featureBreadth +
    normalize(sessions, 20)                  * ENGAGEMENT_WEIGHTS.sessions +
    normalize(aiInteractions, 20)            * ENGAGEMENT_WEIGHTS.aiInteractions;
  return round(score, 1);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const m = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return round(m, 1);
}

async function computeActivation() {
  const rows = await sequelize.query(
    `WITH ${SESSIONIZED_CTE}, ${SESSIONS_CTE},
     timer_sessions AS (
       SELECT DISTINCT user_id, session_seq FROM sessionized WHERE event_type = 'timer_start'
     ),
     qualifying_timer AS (
       SELECT ts.user_id, MIN(s.started_at) AS first_at
       FROM timer_sessions ts
       JOIN sessions s ON s.user_id = ts.user_id AND s.session_seq = ts.session_seq
       WHERE s.duration_minutes >= ${STUDY_TIMER_QUALIFYING_MINUTES}
       GROUP BY ts.user_id
     ),
     mentor AS (
       SELECT user_id, MIN(created_at) AS first_at FROM "UserEvents"
       WHERE event_type = 'mentor_open' AND ${EXCL_UID_COND} GROUP BY user_id
     ),
     notes AS (
       SELECT user_id, MIN(created_at) AS first_at FROM "UserEvents"
       WHERE event_type = 'notes_audited' AND ${EXCL_UID_COND} GROUP BY user_id
     ),
     answer AS (
       SELECT user_id, MIN(created_at) AS first_at FROM "UserEvents"
       WHERE event_type = 'answer_evaluated' AND ${EXCL_UID_COND} GROUP BY user_id
     )
     SELECT
       u.id AS user_id, u.created_at AS signup_at,
       qt.first_at AS timer_at, m.first_at AS mentor_at,
       n.first_at AS notes_at, a.first_at AS answer_at
     FROM "users" u
     LEFT JOIN qualifying_timer qt ON qt.user_id = u.id
     LEFT JOIN mentor m ON m.user_id = u.id
     LEFT JOIN notes n ON n.user_id = u.id
     LEFT JOIN answer a ON a.user_id = u.id
     WHERE u.role = 'user' AND ${EXCL_USER_COND}`,
    { type: QueryTypes.SELECT }
  );

  const totalUsers = rows.length;
  let activatedCount = 0;
  const daysToActivation = [];
  const pathwayCounts = { studyTimer: 0, aiMentor: 0, notesAudit: 0, answerEvaluation: 0 };
  const adoptionCounts = { studyTimer: 0, aiMentor: 0, notesAudit: 0, answerEvaluation: 0 };

  rows.forEach((r) => {
    const candidates = [
      { key: "studyTimer", at: r.timer_at },
      { key: "aiMentor", at: r.mentor_at },
      { key: "notesAudit", at: r.notes_at },
      { key: "answerEvaluation", at: r.answer_at },
    ].filter((c) => c.at);

    candidates.forEach((c) => { adoptionCounts[c.key]++; }); // standalone adoption, independent of activation

    if (candidates.length === 0) return;
    candidates.sort((a, b) => new Date(a.at) - new Date(b.at));
    const earliest = candidates[0];
    activatedCount++;
    pathwayCounts[earliest.key]++;
    daysToActivation.push((new Date(earliest.at) - new Date(r.signup_at)) / 86400000);
  });

  const pathwayLabels = { studyTimer: "Study Timer (20+ min)", aiMentor: "AI Mentor", notesAudit: "Notes Audit", answerEvaluation: "Answer Evaluation" };
  const pathwayBreakdown = Object.keys(pathwayCounts).map((key) => ({
    pathway: pathwayLabels[key], users: pathwayCounts[key], pct: pct(pathwayCounts[key], activatedCount),
  })).sort((a, b) => b.users - a.users);

  const adoption = Object.keys(adoptionCounts).map((key) => ({
    feature: pathwayLabels[key], users: adoptionCounts[key], pct: pct(adoptionCounts[key], totalUsers),
  }));

  return {
    activatedUsers: activatedCount,
    totalUsers,
    activationRatePct: pct(activatedCount, totalUsers),
    avgDaysToActivation: daysToActivation.length ? round(daysToActivation.reduce((a, b) => a + b, 0) / daysToActivation.length) : 0,
    medianDaysToActivation: median(daysToActivation),
    pathwayBreakdown,
    adoption,
  };
}

async function computeNorthStar() {
  const learnerWindow = (startExpr, endExpr) => `
    SELECT DISTINCT user_id FROM "UserEvents"
    WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
      AND created_at >= ${startExpr} ${endExpr ? `AND created_at < ${endExpr}` : ""}
  `;

  const rows = await sequelize.query(
    `WITH this_week AS (${learnerWindow("NOW() - INTERVAL '7 days'", null)}),
     prior_week AS (${learnerWindow("NOW() - INTERVAL '14 days'", "NOW() - INTERVAL '7 days'")}),
     weekly_hours AS (
       SELECT COALESCE(SUM((log->>'hours')::float), 0) AS hours
       FROM "user_data" ud
       CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ud.daily_logs, '[]'::jsonb)) AS log
       WHERE ud.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
         AND ${DAILY_LOG_DATE_EXPR} IS NOT NULL
         AND (${DAILY_LOG_DATE_EXPR})::date >= (NOW() - INTERVAL '7 days')::date
     ),
     ai_interactions AS (
       SELECT COUNT(*) AS cnt FROM "UserEvents"
       WHERE event_type IN ('mentor_open','answer_evaluated') AND ${EXCL_UID_COND}
         AND created_at >= NOW() - INTERVAL '7 days'
     )
     SELECT
       (SELECT COUNT(*) FROM this_week) AS weekly_active_learners,
       (SELECT COUNT(*) FROM this_week t JOIN prior_week p ON p.user_id = t.user_id) AS weekly_retained_learners,
       (SELECT hours FROM weekly_hours) AS weekly_study_hours,
       (SELECT cnt FROM ai_interactions) AS weekly_ai_interactions`,
    { type: QueryTypes.SELECT }
  );

  const r = rows[0] || {};
  const weeklyActiveLearners = parseInt(r.weekly_active_learners || 0);
  const weeklyStudyHours = parseFloat(r.weekly_study_hours || 0);
  const weeklyAiInteractions = parseInt(r.weekly_ai_interactions || 0);

  const allUD = await UserData.findAll({
    where: { [Op.and]: sequelize.literal(`user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))`) },
    attributes: ["daily_logs"],
  });
  let totalStudyHours = 0;
  allUD.forEach((ud) => { if (Array.isArray(ud.daily_logs)) totalStudyHours += ud.daily_logs.reduce((s, l) => s + (l.hours || 0), 0); });

  return {
    weeklyActiveLearners,
    totalStudyHours: round(totalStudyHours, 0),
    avgStudyHoursPerActiveLearnerWeekly: weeklyActiveLearners > 0 ? round(weeklyStudyHours / weeklyActiveLearners, 2) : 0,
    weeklyRetainedLearners: parseInt(r.weekly_retained_learners || 0),
    aiInteractionsPerActiveLearner: weeklyActiveLearners > 0 ? round(weeklyAiInteractions / weeklyActiveLearners, 2) : 0,
  };
}

async function computeTimeToValue() {
  const [sessionRows, aiRows, sixtyMinRows] = await Promise.all([
    sequelize.query(
      `SELECT u.id AS user_id, u.created_at AS signup_at, MIN(ue.created_at) AS first_at
       FROM "users" u
       JOIN "UserEvents" ue ON ue.user_id = u.id AND ue.event_type = 'timer_start'
       WHERE u.role = 'user' AND ${EXCL_USER_COND}
       GROUP BY u.id, u.created_at`,
      { type: QueryTypes.SELECT }
    ),
    sequelize.query(
      `SELECT u.id AS user_id, u.created_at AS signup_at, MIN(ue.created_at) AS first_at
       FROM "users" u
       JOIN "UserEvents" ue ON ue.user_id = u.id AND ue.event_type IN ('mentor_open','answer_evaluated')
       WHERE u.role = 'user' AND ${EXCL_USER_COND}
       GROUP BY u.id, u.created_at`,
      { type: QueryTypes.SELECT }
    ),
    sequelize.query(
      `WITH logs AS (
         SELECT ud.user_id, (${DAILY_LOG_DATE_EXPR})::date AS log_date, (log->>'hours')::float AS hours
         FROM "user_data" ud
         CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ud.daily_logs, '[]'::jsonb)) AS log
         WHERE ${DAILY_LOG_DATE_EXPR} IS NOT NULL
           AND ud.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
       ),
       cum AS (
         SELECT user_id, log_date, SUM(hours) OVER (PARTITION BY user_id ORDER BY log_date) AS cumulative_hours
         FROM logs
       ),
       first_60 AS (
         SELECT DISTINCT ON (user_id) user_id, log_date
         FROM cum WHERE cumulative_hours >= 1.0
         ORDER BY user_id, log_date ASC
       )
       SELECT f.user_id, u.created_at AS signup_at, f.log_date
       FROM first_60 f JOIN "users" u ON u.id = f.user_id
       WHERE u.role = 'user' AND ${EXCL_USER_COND}`,
      { type: QueryTypes.SELECT }
    ),
  ]);

  const daysDiff = (a, b) => (new Date(a) - new Date(b)) / 86400000;

  return {
    medianDaysToFirstStudySession: median(sessionRows.map((r) => daysDiff(r.first_at, r.signup_at))),
    medianDaysToFirstAiInteraction: median(aiRows.map((r) => daysDiff(r.first_at, r.signup_at))),
    medianDaysToFirst60MinStudied: median(sixtyMinRows.map((r) => daysDiff(r.log_date, r.signup_at))),
  };
}

async function computeStudyHabits() {
  const [streakRow, consistencyRows, weeklyHoursRow, revisionRow, sessionRow] = await Promise.all([
    sequelize.query(`SELECT AVG(streak)::numeric(10,2) AS avg_streak FROM "users" WHERE role = 'user' AND ${EXCL_NAME_COND}`, { type: QueryTypes.SELECT }),
    sequelize.query(
      `WITH logs AS (
         SELECT ud.user_id, (${DAILY_LOG_DATE_EXPR})::date AS log_date, (log->>'hours')::float AS hours
         FROM "user_data" ud
         CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ud.daily_logs, '[]'::jsonb)) AS log
         WHERE ${DAILY_LOG_DATE_EXPR} IS NOT NULL AND (log->>'hours')::float > 0
           AND ud.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
       ),
       last7 AS (
         SELECT user_id, COUNT(DISTINCT log_date) AS days_studied
         FROM logs WHERE log_date >= (NOW() - INTERVAL '7 days')::date
         GROUP BY user_id
       )
       SELECT AVG(days_studied)::numeric(10,2) AS avg_days_studied, COUNT(*) AS learner_count FROM last7`,
      { type: QueryTypes.SELECT }
    ),
    sequelize.query(
      `SELECT COALESCE(SUM((log->>'hours')::float), 0)::numeric(10,1) AS total_hours
       FROM "user_data" ud
       CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ud.daily_logs, '[]'::jsonb)) AS log
       WHERE ${DAILY_LOG_DATE_EXPR} IS NOT NULL AND (${DAILY_LOG_DATE_EXPR})::date >= (NOW() - INTERVAL '7 days')::date
         AND ud.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))`,
      { type: QueryTypes.SELECT }
    ),
    sequelize.query(
      `SELECT COUNT(*) AS total_uses, COUNT(DISTINCT user_id) AS learners
       FROM "UserEvents"
       WHERE feature_name = '${REVISION_FEATURE_NAME}' AND ${EXCL_UID_COND}
         AND created_at >= NOW() - INTERVAL '7 days'`,
      { type: QueryTypes.SELECT }
    ),
    sequelize.query(
      `WITH ${SESSIONIZED_CTE}, ${SESSIONS_CTE}
       SELECT AVG(duration_minutes)::numeric(10,1) AS avg_duration FROM sessions`,
      { type: QueryTypes.SELECT }
    ),
  ]);

  // topic_completed isn't in the UserEvents enum yet, so this stays at 0 until the migration + trackEvent() call land
  const topicsCompletedPerLearnerPerWeek = 0;

  const learnerCount = parseInt(consistencyRows[0]?.learner_count || 0);
  const avgDaysStudied = parseFloat(consistencyRows[0]?.avg_days_studied || 0);
  const revisionLearners = parseInt(revisionRow[0]?.learners || 0);

  return {
    avgStreak: parseFloat(streakRow[0]?.avg_streak || 0),
    sevenDayConsistencyPct: learnerCount > 0 ? pct(avgDaysStudied, 7) : 0,
    weeklyStudyHoursTotal: parseFloat(weeklyHoursRow[0]?.total_hours || 0),
    revisionFrequencyPerLearner: revisionLearners > 0 ? round(parseInt(revisionRow[0].total_uses) / revisionLearners, 2) : 0,
    topicsCompletedPerLearnerPerWeek,
    avgSessionLengthMin: parseFloat(sessionRow[0]?.avg_duration || 0),
  };
}

const getMetrics = async (req, res, next) => {
  try {
    const cached = getCached("metrics");
    if (cached) return res.json({ success: true, metrics: cached });

    const now          = new Date();
    const todayStart    = startOfDay(now);
    const yesterdayStart = startOfDay(daysAgo(1));
    const wauStart      = daysAgo(7);
    const mauStart      = daysAgo(30);

    const [totalUsers, todaySignups, dau, dauPrev, wau, mau] = await Promise.all([
      User.count({ where: { role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) } }),
      User.count({ where: { role: "user", createdAt: { [Op.gte]: todayStart }, [Op.and]: sequelize.literal(EXCL_NAME_COND) } }),
      UserEvents.count({ distinct: true, col: "user_id", where: { created_at: { [Op.gte]: todayStart }, [Op.and]: sequelize.literal(EXCL_UID_COND) } }),
      UserEvents.count({ distinct: true, col: "user_id", where: { created_at: { [Op.gte]: yesterdayStart, [Op.lt]: todayStart }, [Op.and]: sequelize.literal(EXCL_UID_COND) } }),
      UserEvents.count({ distinct: true, col: "user_id", where: { created_at: { [Op.gte]: wauStart }, [Op.and]: sequelize.literal(EXCL_UID_COND) } }),
      UserEvents.count({ distinct: true, col: "user_id", where: { created_at: { [Op.gte]: mauStart }, [Op.and]: sequelize.literal(EXCL_UID_COND) } }),
    ]);
    const stickinessPct = pct(dau, mau);

    const breadthCount = (n) => sequelize.query(
      `SELECT COUNT(*) AS cnt FROM (
         SELECT user_id FROM "UserEvents"
         WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
         GROUP BY user_id HAVING COUNT(DISTINCT feature_name) >= ${n}
       ) sub`,
      { type: QueryTypes.SELECT }
    ).then(r => parseInt(r[0]?.cnt || 0));
    const [usedAnyFeature, used3Plus, used5Plus] = await Promise.all([breadthCount(1), breadthCount(3), breadthCount(5)]);

    const countEvent = (type) => UserEvents.count({ where: { event_type: type, [Op.and]: sequelize.literal(EXCL_UID_COND) } });
    const [answersEvaluated, notesAudited, testsAttempted, aiMentorConversations] = await Promise.all([
      countEvent("answer_evaluated"), countEvent("notes_audited"), countEvent("test_attempted"), countEvent("mentor_open"),
    ]);

    const allUD = await UserData.findAll({
      where: { [Op.and]: sequelize.literal(`user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))`) },
      attributes: ["daily_logs"],
    });
    let totalStudyHours = 0;
    allUD.forEach((ud) => {
      if (Array.isArray(ud.daily_logs)) totalStudyHours += ud.daily_logs.reduce((s, l) => s + (l.hours || 0), 0);
    });
    const avgStudyHours = allUD.length > 0 ? round(totalStudyHours / allUD.length) : 0;
    const activeStreakUsers = await User.count({ where: { role: "user", streak: { [Op.gt]: 0 }, [Op.and]: sequelize.literal(EXCL_NAME_COND) } });

    const [d1, d7, d30] = await Promise.all([retentionCohort(1), retentionCohort(7), retentionCohort(30)]);

    const sessionRows = await sequelize.query(
      `WITH ${SESSIONIZED_CTE}, ${SESSIONS_CTE}
       SELECT
         COUNT(*) AS total_sessions,
         COUNT(DISTINCT user_id) AS users_with_sessions,
         AVG(duration_minutes)::numeric(10,2) AS avg_duration_min,
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_minutes)::numeric(10,2) AS median_duration_min,
         MAX(duration_minutes)::numeric(10,2) AS longest_session_min,
         COUNT(*) FILTER (WHERE event_count = 1) AS bounce_sessions
       FROM sessions`,
      { type: QueryTypes.SELECT }
    );
    const sr = sessionRows[0] || {};
    const totalSessions = parseInt(sr.total_sessions || 0);
    const bounceSessions = parseInt(sr.bounce_sessions || 0);
    const usersWithSessions = parseInt(sr.users_with_sessions || 0);
    const sessions = {
      totalSessions,
      sessionsPerUser: usersWithSessions > 0 ? round(totalSessions / usersWithSessions, 2) : 0,
      avgDurationMin: parseFloat(sr.avg_duration_min || 0),
      medianDurationMin: parseFloat(sr.median_duration_min || 0),
      longestSessionMin: parseFloat(sr.longest_session_min || 0),
      bounceSessions,
      bounceRatePct: pct(bounceSessions, totalSessions),
    };

    // onboarding_completed isn't in the UserEvents enum yet, so this stays at 0 until it's added + fired
    const onboardingCompleted = 0;
    const activationResult = await computeActivation();

    const [northStar, timeToValue, studyHabits] = await Promise.all([
      computeNorthStar(), computeTimeToValue(), computeStudyHabits(),
    ]);

    const metrics = {
      users: {
        total: totalUsers, todaySignups,
        dau, wau, mau, stickinessPct,
        usedAnyFeature, used3PlusFeatures: used3Plus, used5PlusFeatures: used5Plus,
        activeStreakUsers,
      },
      retention: { d1, d7, d30 },
      sessions,
      activation: {
        onboardingCompleted,
        onboardingCompletedPct: pct(onboardingCompleted, totalUsers),
        ...activationResult,
      },
      northStar,
      timeToValue,
      studyHabits,
      engagement: { avgStudyHours, totalStudyHours: round(totalStudyHours, 0) },
      activity: { answersEvaluated, notesAudited, testsAttempted, aiMentorConversations },
      trends: { dau_delta: dau - dauPrev },
    };

    setCached("metrics", metrics);
    res.json({ success: true, metrics });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const dir    = req.query.dir === "asc" ? "ASC" : "DESC";

    const SORTABLE = {
      name: "u.name", email: "u.email",
      registration_date: "u.created_at", streak: "u.streak",
      longest_streak: "u.longest_streak", total_study_hours: "total_study_hours",
      answers_evaluated: "answers_evaluated", notes_audited: "notes_audited",
      tests_attempted: "tests_attempted", days_active: "days_active",
      features_used: "features_used", last_active: "last_active",
      engagement_score: "engagement_score", sessions: "sessions",
    };
    const sortCol = SORTABLE[req.query.sort] || SORTABLE.engagement_score;

    const rows = await sequelize.query(
      `WITH ${SESSIONIZED_CTE},
       session_counts AS (
         SELECT user_id, COUNT(DISTINCT session_seq) AS sessions
         FROM sessionized GROUP BY user_id
       ),
       returners AS (
         SELECT DISTINCT user_id FROM "UserEvents" WHERE event_type = 'day_return' AND ${EXCL_UID_COND}
       )
       SELECT
         u.id, u.name, u.email, u.created_at AS registration_date,
         u.streak, u.longest_streak,
         COALESCE(daily.total_hours, 0)::numeric(10,1)    AS total_study_hours,
         COALESCE(ev.answers_evaluated, 0)                AS answers_evaluated,
         COALESCE(ev.notes_audited, 0)                    AS notes_audited,
         COALESCE(ev.tests_attempted, 0)                  AS tests_attempted,
         COALESCE(ev.days_active, 0)                      AS days_active,
         COALESCE(ev.features_used, 0)                    AS features_used,
         COALESCE(sc.sessions, 0)                         AS sessions,
         ev.last_active,
         ev.first_active,
         ev.first_feature_used,
         (
           LEAST(COALESCE(daily.total_hours,0) / 50.0, 1) * 100 * 0.25 +
           LEAST(COALESCE(ev.days_active,0) / 30.0, 1) * 100 * 0.20 +
           (CASE WHEN r.user_id IS NOT NULL THEN 100 ELSE 0 END) * 0.20 +
           LEAST(COALESCE(ev.features_used,0) / ${ALL_FEATURES.length}.0, 1) * 100 * 0.15 +
           LEAST(COALESCE(sc.sessions,0) / 20.0, 1) * 100 * 0.10 +
           LEAST(COALESCE(ev.answers_evaluated,0) / 20.0, 1) * 100 * 0.10
         )::numeric(10,2) AS engagement_score
       FROM "users" u
       LEFT JOIN (
         SELECT
           user_id,
           COUNT(*) FILTER (WHERE event_type = 'answer_evaluated') AS answers_evaluated,
           COUNT(*) FILTER (WHERE event_type = 'notes_audited')    AS notes_audited,
           COUNT(*) FILTER (WHERE event_type = 'test_attempted')   AS tests_attempted,
           COUNT(DISTINCT feature_name)                            AS features_used,
           COUNT(DISTINCT DATE(created_at))                        AS days_active,
           MAX(created_at)                                         AS last_active,
           MIN(created_at)                                         AS first_active,
           (ARRAY_AGG(feature_name ORDER BY created_at ASC) FILTER (WHERE feature_name IS NOT NULL))[1] AS first_feature_used
         FROM "UserEvents"
         GROUP BY user_id
       ) ev ON ev.user_id = u.id
       LEFT JOIN (
         SELECT ud.user_id, SUM((log->>'hours')::float) AS total_hours
         FROM "user_data" ud
         CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ud.daily_logs, '[]'::jsonb)) AS log
         GROUP BY ud.user_id
       ) daily ON daily.user_id = u.id
       LEFT JOIN session_counts sc ON sc.user_id = u.id
       LEFT JOIN returners r ON r.user_id = u.id
       WHERE u.role = 'user' AND ${EXCL_USER_COND}
       ORDER BY ${sortCol} ${dir}
       LIMIT :limit OFFSET :offset`,
      { replacements: { limit, offset }, type: QueryTypes.SELECT }
    );

    const [{ total }] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM "users" WHERE role = 'user' AND ${EXCL_NAME_COND}`,
      { type: QueryTypes.SELECT }
    );

    res.json({ success: true, total: parseInt(total), page, pages: Math.ceil(parseInt(total) / limit), users: rows });
  } catch (err) {
    next(err);
  }
};

const getFunnel = async (req, res, next) => {
  try {
    const labels = [
      "Registered", "Visited Dashboard", "Started Study Timer",
      "Opened AI Mentor", "Evaluated an Answer", "Returned Next Day",
    ];
    const counts = await runFunnel([
      { eventTypes: ["dashboard_visit"] },
      { eventTypes: ["timer_start"] },
      { eventTypes: ["mentor_open"] },
      { eventTypes: ["answer_evaluated"] },
      { eventTypes: ["day_return"] },
    ]);

    const funnel = labels.map((label, i) => {
      const count = counts[i];
      const prev = counts[i - 1];
      const pctOfTotal = pct(count, counts[0]);
      const dropOffPct = i === 0 ? 0 : round(100 - pct(count, prev));
      return { step: i + 1, label, count, pctOfTotal, dropOffPct };
    });

    res.json({ success: true, funnel });
  } catch (err) {
    next(err);
  }
};

const getFeatureAnalytics = async (req, res, next) => {
  try {
    const coreRows = await sequelize.query(
      `WITH feature_events AS (
         SELECT user_id, feature_name, created_at
         FROM "UserEvents"
         WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
       ),
       per_user AS (
         SELECT feature_name, user_id, COUNT(*) AS opens
         FROM feature_events GROUP BY feature_name, user_id
       ),
       first_feature AS (
         SELECT DISTINCT ON (user_id) user_id, feature_name AS first_feature
         FROM feature_events ORDER BY user_id, created_at ASC
       ),
       returners AS (
         SELECT DISTINCT user_id FROM "UserEvents" WHERE event_type = 'day_return' AND ${EXCL_UID_COND}
       )
       SELECT
         pu.feature_name,
         COUNT(DISTINCT pu.user_id) AS unique_users,
         SUM(pu.opens) AS total_opens,
         AVG(pu.opens)::numeric(10,2) AS avg_opens_per_user,
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pu.opens)::numeric(10,2) AS median_opens_per_user,
         COUNT(DISTINCT pu.user_id) FILTER (WHERE pu.opens >= 2) AS repeat_users,
         COUNT(DISTINCT r.user_id) AS returned_users,
         COUNT(DISTINCT CASE WHEN ff.first_feature = pu.feature_name THEN pu.user_id END) AS first_feature_users
       FROM per_user pu
       LEFT JOIN returners r ON r.user_id = pu.user_id
       LEFT JOIN first_feature ff ON ff.user_id = pu.user_id
       GROUP BY pu.feature_name`,
      { type: QueryTypes.SELECT }
    );

    const sessionTimeRows = await sequelize.query(
      `WITH ${SESSIONIZED_CTE}, ${SESSIONS_CTE},
       session_features AS (
         SELECT DISTINCT user_id, session_seq, feature_name
         FROM sessionized WHERE feature_name IS NOT NULL
       )
       SELECT sf.feature_name, AVG(s.duration_minutes)::numeric(10,1) AS avg_session_minutes
       FROM session_features sf
       JOIN sessions s ON s.user_id = sf.user_id AND s.session_seq = sf.session_seq
       GROUP BY sf.feature_name`,
      { type: QueryTypes.SELECT }
    );
    const sessionTimeMap = {};
    sessionTimeRows.forEach((r) => { sessionTimeMap[r.feature_name] = parseFloat(r.avg_session_minutes || 0); });

    const totalUsersWithFirstFeature = coreRows.reduce((sum, r) => sum + parseInt(r.first_feature_users || 0), 0);
    const coreMap = {};
    coreRows.forEach((r) => { coreMap[r.feature_name] = r; });

    const features = ALL_FEATURES.map((name) => {
      const r = coreMap[name];
      if (!r) {
        return {
          name, uniqueUsers: 0, totalOpens: 0, avgOpensPerUser: 0, medianOpensPerUser: 0,
          avgSessionTimeMin: 0, repeatUsageRatePct: 0, retentionRatePct: 0, firstFeaturePct: 0,
        };
      }
      const uniqueUsers = parseInt(r.unique_users);
      return {
        name,
        uniqueUsers,
        totalOpens: parseInt(r.total_opens),
        avgOpensPerUser: parseFloat(r.avg_opens_per_user || 0),
        medianOpensPerUser: parseFloat(r.median_opens_per_user || 0),
        avgSessionTimeMin: sessionTimeMap[name] || 0,
        repeatUsageRatePct: pct(parseInt(r.repeat_users || 0), uniqueUsers),
        retentionRatePct: pct(parseInt(r.returned_users || 0), uniqueUsers),
        firstFeaturePct: pct(parseInt(r.first_feature_users || 0), totalUsersWithFirstFeature),
      };
    });

    features.sort((a, b) => b.uniqueUsers - a.uniqueUsers);
    res.json({ success: true, features });
  } catch (err) {
    next(err);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const events = await sequelize.query(
      `SELECT ue.id, ue.event_type, ue.feature_name, ue.metadata, ue.created_at, u.name AS user_name
       FROM "UserEvents" ue
       LEFT JOIN "users" u ON u.id = ue.user_id
       WHERE ue.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
       ORDER BY ue.created_at DESC LIMIT 50`,
      { type: QueryTypes.SELECT }
    );
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
};

const getRetention = async (req, res, next) => {
  try {
    const [d1, d7, d30] = await Promise.all([retentionCohort(1), retentionCohort(7), retentionCohort(30)]);

    const cohortRows = await sequelize.query(
      `WITH cohorts AS (
         SELECT id AS user_id, DATE_TRUNC('week', created_at) AS cohort_week FROM "users" WHERE role = 'user' AND ${EXCL_NAME_COND}
       ), activity AS (
         SELECT ue.user_id, DATE_TRUNC('week', ue.created_at) AS active_week FROM "UserEvents" ue
         WHERE ue.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
         GROUP BY ue.user_id, DATE_TRUNC('week', ue.created_at)
       )
       SELECT
         TO_CHAR(c.cohort_week, 'YYYY-MM-DD') AS cohort_week,
         COUNT(DISTINCT c.user_id) AS cohort_size,
         COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week THEN c.user_id END) AS week0,
         COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '7d' THEN c.user_id END) AS week1,
         COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '14d' THEN c.user_id END) AS week2,
         COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '21d' THEN c.user_id END) AS week3
       FROM cohorts c LEFT JOIN activity a ON a.user_id = c.user_id
       GROUP BY c.cohort_week ORDER BY c.cohort_week DESC LIMIT 8`,
      { type: QueryTypes.SELECT }
    );

    const cohort = cohortRows.map((r) => ({
      cohortWeek: r.cohort_week,
      cohortSize: parseInt(r.cohort_size),
      week0: pct(r.week0, r.cohort_size),
      week1: pct(r.week1, r.cohort_size),
      week2: pct(r.week2, r.cohort_size),
      week3: pct(r.week3, r.cohort_size),
    }));

    const churnList = await sequelize.query(
      `SELECT u.id, u.name, u.email, u.streak, ev.last_active
       FROM "users" u
       LEFT JOIN (SELECT user_id, MAX(created_at) AS last_active FROM "UserEvents" GROUP BY user_id) ev ON ev.user_id = u.id
       WHERE u.role = 'user' AND ${EXCL_USER_COND} AND (ev.last_active IS NULL OR ev.last_active < NOW() - INTERVAL '7 days')
       ORDER BY ev.last_active ASC NULLS FIRST LIMIT 20`,
      { type: QueryTypes.SELECT }
    );

    res.json({ success: true, retention: { d1, d7, d30 }, cohort, churnList });
  } catch (err) {
    next(err);
  }
};

const getJourney = async (req, res, next) => {
  try {
    const cached = getCached("journey");
    if (cached) return res.json({ success: true, ...cached });

    const milestoneRows = await sequelize.query(
      `WITH featord AS (
         SELECT user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS rn
         FROM "UserEvents" WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
       )
       SELECT
         u.id AS user_id,
         MAX(CASE WHEN fo.rn >= 1 THEN 1 ELSE 0 END) AS reached_first_feature,
         MAX(CASE WHEN fo.rn >= 2 THEN 1 ELSE 0 END) AS reached_second_feature,
         MAX(CASE WHEN fo.rn >= 3 THEN 1 ELSE 0 END) AS reached_third_feature,
         MAX(CASE WHEN ue.event_type = 'timer_start' THEN 1 ELSE 0 END) AS reached_first_session,
         MAX(CASE WHEN ue.event_type IN ('mentor_open','answer_evaluated') THEN 1 ELSE 0 END) AS reached_first_ai,
         MAX(CASE WHEN ue.event_type = 'day_return' THEN 1 ELSE 0 END) AS reached_first_return
       FROM "users" u
       LEFT JOIN featord fo ON fo.user_id = u.id
       LEFT JOIN "UserEvents" ue ON ue.user_id = u.id
       WHERE u.role = 'user' AND ${EXCL_USER_COND}
       GROUP BY u.id`,
      { type: QueryTypes.SELECT }
    );

    const { segments } = await classifyUsers();
    const powerUserIds = new Set(segments.powerUsers.map((u) => String(u.id)));

    const flags = milestoneRows.map((r) => ({
      userId: r.user_id,
      signup: 1,
      firstFeature: parseInt(r.reached_first_feature),
      secondFeature: parseInt(r.reached_second_feature),
      thirdFeature: parseInt(r.reached_third_feature),
      firstSession: parseInt(r.reached_first_session),
      firstAi: parseInt(r.reached_first_ai),
      firstReturn: parseInt(r.reached_first_return),
      powerUser: powerUserIds.has(String(r.user_id)) ? 1 : 0,
    }));

    const stageKeys = ["signup", "firstFeature", "secondFeature", "thirdFeature", "firstSession", "firstAi", "firstReturn", "powerUser"];
    const stageLabels = ["Signup", "First Feature", "Second Feature", "Third Feature", "First Study Session", "First AI Interaction", "First Return", "Power User"];

    const stageCounts = stageKeys.map((key) => flags.reduce((sum, f) => sum + f[key], 0));

    const transitions = [];
    for (let i = 0; i < stageKeys.length - 1; i++) {
      const fromKey = stageKeys[i];
      const toKey = stageKeys[i + 1];
      const count = flags.reduce((sum, f) => sum + (f[fromKey] && f[toKey] ? 1 : 0), 0);
      transitions.push({
        from: stageLabels[i],
        to: stageLabels[i + 1],
        users: count,
        conversionPct: pct(count, stageCounts[i]),
      });
    }

    const stages = stageLabels.map((label, i) => ({ stage: label, users: stageCounts[i], pctOfSignups: pct(stageCounts[i], stageCounts[0]) }));

    const featureOrderRows = await sequelize.query(
      `WITH ordered AS (
         SELECT ue.user_id, ue.feature_name, ROW_NUMBER() OVER (PARTITION BY ue.user_id ORDER BY ue.created_at ASC) AS rn
         FROM "UserEvents" ue WHERE ue.feature_name IS NOT NULL AND ${EXCL_UID_COND}
       )
       SELECT feature_name, COUNT(*) AS cnt FROM ordered WHERE rn = 1 GROUP BY feature_name ORDER BY cnt DESC`,
      { type: QueryTypes.SELECT }
    );
    const totalWithFirst = featureOrderRows.reduce((s, r) => s + parseInt(r.cnt), 0);
    const firstFeatureRanked = featureOrderRows.map((r) => ({
      feature: r.feature_name, count: parseInt(r.cnt), pct: pct(r.cnt, totalWithFirst),
    }));

    const data = { stages, transitions, firstFeatureRanked };
    setCached("journey", data);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

const getUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ where: { id: userId, role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) }, attributes: ["id", "name", "email", "streak", "longest_streak", "created_at"] });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const events = await sequelize.query(
      `SELECT id, event_type, feature_name, metadata, created_at
       FROM "UserEvents" WHERE user_id = :userId ORDER BY created_at ASC`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    const sessionsRaw = [];
    let current = null;
    events.forEach((ev) => {
      const ts = new Date(ev.created_at).getTime();
      if (!current || ts - current.lastTs > SESSION_GAP_SECONDS * 1000) {
        if (current) sessionsRaw.push(current);
        current = { startedAt: ev.created_at, lastTs: ts, events: [] };
      }
      current.lastTs = ts;
      current.endedAt = ev.created_at;
      current.events.push({ id: ev.id, eventType: ev.event_type, featureName: ev.feature_name, metadata: ev.metadata, timestamp: ev.created_at });
    });
    if (current) sessionsRaw.push(current);

    const enriched = sessionsRaw.map((s) => ({
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      durationMin: round((new Date(s.endedAt) - new Date(s.startedAt)) / 60000),
      eventCount: s.events.length,
      isBounce: s.events.length === 1,
      featuresVisited: [...new Set(s.events.map((e) => e.featureName).filter(Boolean))],
      events: s.events,
    })).reverse();

    const ud = await UserData.findOne({ where: { user_id: userId }, attributes: ["daily_logs"] });
    let totalStudyHours = 0;
    if (ud && Array.isArray(ud.daily_logs)) totalStudyHours = ud.daily_logs.reduce((s, l) => s + (l.hours || 0), 0);

    const featureCounts = {};
    events.forEach((ev) => { if (ev.feature_name) featureCounts[ev.feature_name] = (featureCounts[ev.feature_name] || 0) + 1; });
    const featuresUsed = Object.entries(featureCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    const firstFeatureEvent = events.find((e) => e.feature_name);
    const lastEvent = events[events.length - 1];
    const daysActive = new Set(events.map((e) => new Date(e.created_at).toDateString())).size;

    const signupDate = new Date(user.created_at);
    const returnedNextDay = events.some((e) => {
      const diff = (new Date(e.created_at) - signupDate) / 86400000;
      return diff >= 1 && diff <= 2;
    });

    const durations = enriched.map((s) => s.durationMin).sort((a, b) => a - b);
    const medianDuration = durations.length ? durations[Math.floor(durations.length / 2)] : 0;

    res.json({
      success: true,
      user: {
        id: user.id, name: user.name, email: user.email,
        streak: user.streak, longestStreak: user.longest_streak,
        joinedAt: user.created_at,
        totalStudyHours: round(totalStudyHours),
        totalSessions: sessionsRaw.length,
        avgSessionDurationMin: sessionsRaw.length ? round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
        medianSessionDurationMin: medianDuration,
        bounceSessions: enriched.filter((s) => s.isBounce).length,
        daysActive,
        returnedNextDay,
        firstFeatureUsed: firstFeatureEvent?.feature_name || null,
        firstFeatureAt: firstFeatureEvent?.created_at || null,
        lastActiveAt: lastEvent?.created_at || null,
        featuresUsed,
      },
      sessions: enriched,
    });
  } catch (err) {
    next(err);
  }
};

const getSegments = async (req, res, next) => {
  try {
    const cached = getCached("segments");
    if (cached) return res.json({ success: true, ...cached });

    const { rows, segments } = await classifyUsers();

    const shape = (list) => ({ count: list.length, users: list.slice(0, 20) });
    const data = {
      newUsers:   shape(segments.newUsers),
      activated:  shape(segments.activated),
      powerUsers: shape(segments.powerUsers),
      dormant:    shape(segments.dormant),
      churnRisk:  shape(segments.churnRisk),
      lost:       shape(segments.lost),
      total: rows.length,
    };

    setCached("segments", data);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

const getDiscovery = async (req, res, next) => {
  try {
    const cached = getCached("discovery");
    if (cached) return res.json({ success: true, ...cached });

    const rows = await sequelize.query(
      `WITH ${SESSIONIZED_CTE},
       first_use AS (
         SELECT DISTINCT ON (user_id, feature_name)
           user_id, feature_name, created_at, session_seq
         FROM sessionized
         WHERE feature_name IS NOT NULL
         ORDER BY user_id, feature_name, created_at ASC
       ),
       signup AS (
         SELECT id AS user_id, created_at AS signup_at FROM "users" WHERE role = 'user' AND ${EXCL_NAME_COND}
       ),
       returned_after AS (
         SELECT fu.user_id, fu.feature_name,
           EXISTS (
             SELECT 1 FROM sessionized s2
             WHERE s2.user_id = fu.user_id AND s2.session_seq > fu.session_seq
           ) AS came_back
         FROM first_use fu
       )
       SELECT
         fu.feature_name,
         COUNT(DISTINCT fu.user_id) AS discovered_users,
         AVG(EXTRACT(EPOCH FROM (fu.created_at - su.signup_at)) / 86400.0)::numeric(10,1) AS avg_days_after_signup,
         AVG(fu.session_seq)::numeric(10,1) AS avg_session_before_discovery,
         COUNT(DISTINCT CASE WHEN ra.came_back THEN fu.user_id END) AS users_returning_after_discovery
       FROM first_use fu
       JOIN signup su ON su.user_id = fu.user_id
       JOIN returned_after ra ON ra.user_id = fu.user_id AND ra.feature_name = fu.feature_name
       GROUP BY fu.feature_name`,
      { type: QueryTypes.SELECT }
    );

    const map = {};
    rows.forEach((r) => { map[r.feature_name] = r; });

    const discovery = ALL_FEATURES.map((name) => {
      const r = map[name];
      if (!r) {
        return { feature: name, discoveredUsers: 0, avgDaysAfterSignup: 0, avgSessionBeforeDiscovery: 0, usersReturningAfterDiscovery: 0, returnRatePct: 0 };
      }
      const discoveredUsers = parseInt(r.discovered_users);
      const returning = parseInt(r.users_returning_after_discovery);
      return {
        feature: name,
        discoveredUsers,
        avgDaysAfterSignup: parseFloat(r.avg_days_after_signup || 0),
        avgSessionBeforeDiscovery: parseFloat(r.avg_session_before_discovery || 0),
        usersReturningAfterDiscovery: returning,
        returnRatePct: pct(returning, discoveredUsers),
      };
    });

    const totalUsers = await User.count({ where: { role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) } });
    const ignoredFeatures = discovery.filter((d) => totalUsers > 0 && pct(d.discoveredUsers, totalUsers) < 10).map((d) => d.feature);

    const data = { discovery, ignoredFeatures };
    setCached("discovery", data);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

const getInsights = async (req, res, next) => {
  try {
    const cached = getCached("insights");
    if (cached) return res.json({ success: true, insights: cached });

    const totalUsers = await User.count({ where: { role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) } });
    if (totalUsers === 0) return res.json({ success: true, insights: [] });

    const [featureRows, breadthRow, growthRows, dauMauRows] = await Promise.all([
      sequelize.query(
        `WITH feature_events AS (
           SELECT user_id, feature_name, created_at FROM "UserEvents"
           WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
         ),
         per_user AS (SELECT feature_name, user_id, COUNT(*) AS opens FROM feature_events GROUP BY feature_name, user_id),
         returners AS (SELECT DISTINCT user_id FROM "UserEvents" WHERE event_type = 'day_return' AND ${EXCL_UID_COND})
         SELECT
           pu.feature_name,
           COUNT(DISTINCT pu.user_id) AS total_users,
           COUNT(DISTINCT r.user_id) AS returned_users,
           COUNT(DISTINCT pu.user_id) FILTER (WHERE pu.opens = 1) AS single_use_users
         FROM per_user pu
         LEFT JOIN returners r ON r.user_id = pu.user_id
         GROUP BY pu.feature_name
         HAVING COUNT(DISTINCT pu.user_id) >= 3`,
        { type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT AVG(cnt)::numeric(4,1) AS avg_features FROM (
           SELECT user_id, COUNT(DISTINCT feature_name) AS cnt FROM "UserEvents"
           WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND} GROUP BY user_id
         ) sub`,
        { type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS this_week,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') AS last_week
         FROM "users" WHERE role = 'user' AND ${EXCL_NAME_COND}`,
        { type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `WITH last7 AS (SELECT DISTINCT user_id FROM "UserEvents" WHERE created_at >= NOW() - INTERVAL '7 days' AND ${EXCL_UID_COND}),
         prior7 AS (SELECT DISTINCT user_id FROM "UserEvents" WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' AND ${EXCL_UID_COND})
         SELECT
           (SELECT COUNT(*) FROM last7) AS wau,
           (SELECT COUNT(*) FROM last7 l JOIN prior7 p ON p.user_id = l.user_id) AS returning`,
        { type: QueryTypes.SELECT }
      ),
    ]);

    const insights = [];

    const retentionRanked = featureRows
      .map((r) => ({ feature: r.feature_name, total: parseInt(r.total_users), rate: pct(r.returned_users, r.total_users) }))
      .sort((a, b) => b.rate - a.rate);

    if (retentionRanked.length > 0) {
      const top = retentionRanked[0];
      insights.push({
        id: "highest_retention_feature", type: "positive",
        title: `${top.feature} has the highest retention`,
        body: `${top.rate}% of users who use ${top.feature} return the next day — the strongest retention driver in the product.`,
        feature: top.feature,
      });
    }
    if (retentionRanked.length > 1) {
      const bottom = retentionRanked[retentionRanked.length - 1];
      insights.push({
        id: "lowest_retention_feature", type: "warning",
        title: `${bottom.feature} has the highest drop-off`,
        body: `Only ${bottom.rate}% of ${bottom.feature} users return the next day, the lowest of any feature with meaningful usage.`,
        feature: bottom.feature,
      });
    }

    const firstFeatureRow = await sequelize.query(
      `WITH ordered AS (
         SELECT user_id, feature_name, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) rn
         FROM "UserEvents" WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
       ) SELECT feature_name, COUNT(*) AS cnt FROM ordered WHERE rn = 1 GROUP BY feature_name ORDER BY cnt DESC LIMIT 1`,
      { type: QueryTypes.SELECT }
    );
    if (firstFeatureRow.length > 0) {
      insights.push({
        id: "most_common_first_feature", type: "neutral",
        title: `${firstFeatureRow[0].feature_name} is the most common first feature`,
        body: `${firstFeatureRow[0].feature_name} is the first feature new users try most often — it's effectively your onboarding path.`,
        feature: firstFeatureRow[0].feature_name,
      });
    }

    const { segments } = await classifyUsers();
    if (segments.lost.length > 0) {
      const lostIds = segments.lost.map((u) => u.id);
      const lastFeatureRows = await sequelize.query(
        `SELECT feature_name, COUNT(*) AS cnt FROM (
           SELECT DISTINCT ON (user_id) user_id, feature_name
           FROM "UserEvents" WHERE feature_name IS NOT NULL AND user_id IN (:lostIds)
           ORDER BY user_id, created_at DESC
         ) sub GROUP BY feature_name ORDER BY cnt DESC LIMIT 1`,
        { replacements: { lostIds }, type: QueryTypes.SELECT }
      );
      if (lastFeatureRows.length > 0) {
        insights.push({
          id: "most_common_last_feature", type: "warning",
          title: `${lastFeatureRows[0].feature_name} is often the last thing churned users do`,
          body: `Among users who have gone quiet for 30+ days, ${lastFeatureRows[0].feature_name} was most often the last feature they touched.`,
          feature: lastFeatureRows[0].feature_name,
        });
      }
    }

    const activationResult = await computeActivation();
    insights.push({
      id: "activation_rate", type: activationResult.activationRatePct >= 30 ? "positive" : "warning",
      title: `${activationResult.activationRatePct}% activation rate`,
      body: `${activationResult.activationRatePct}% of users (${activationResult.activatedUsers} of ${activationResult.totalUsers}) have had at least one meaningful study session (20+ min study timer, AI Mentor, Notes Audit, or Answer Evaluation). Median time to get there: ${activationResult.medianDaysToActivation} day(s). Most common path: ${activationResult.pathwayBreakdown[0]?.pathway || "n/a"}.`,
      feature: null,
    });

    const answerEval = activationResult.adoption.find((a) => a.feature === "Answer Evaluation");
    if (answerEval) {
      insights.push({
        id: "answer_evaluation_adoption", type: "neutral",
        title: `${answerEval.pct}% of users have tried Answer Evaluation`,
        body: `${answerEval.users} of ${activationResult.totalUsers} users (${answerEval.pct}%) have used Answer Evaluation at least once. This is an advanced feature, so a lower adoption rate here is expected and not itself a red flag.`,
        feature: "AI Evaluator",
      });
    }

    const avgFeatures = parseFloat(breadthRow[0]?.avg_features || 0);
    insights.push({
      id: "feature_adoption", type: avgFeatures / ALL_FEATURES.length >= 0.3 ? "positive" : "neutral",
      title: `Users try ${pct(avgFeatures, ALL_FEATURES.length)}% of available features on average`,
      body: `On average, users explore ${avgFeatures} of ${ALL_FEATURES.length} features.`,
      feature: null,
    });

    const thisWeek = parseInt(growthRows[0]?.this_week || 0);
    const lastWeek = parseInt(growthRows[0]?.last_week || 0);
    const growthPct = lastWeek > 0 ? round(((thisWeek - lastWeek) / lastWeek) * 100) : (thisWeek > 0 ? 100 : 0);
    insights.push({
      id: "weekly_growth", type: growthPct >= 0 ? "positive" : "warning",
      title: `${growthPct >= 0 ? "+" : ""}${growthPct}% signup growth week-over-week`,
      body: `${thisWeek} signups this week vs ${lastWeek} the prior week.`,
      feature: null,
    });

    const wau = parseInt(dauMauRows[0]?.wau || 0);
    const returning = parseInt(dauMauRows[0]?.returning || 0);
    insights.push({
      id: "returning_users", type: "neutral",
      title: `${pct(returning, wau)}% of active users are returning users`,
      body: `Of ${wau} users active in the last 7 days, ${returning} (${pct(returning, wau)}%) were also active the week before.`,
      feature: null,
    });

    if (segments.powerUsers.length > 0) {
      insights.push({
        id: "power_users", type: "positive",
        title: `${segments.powerUsers.length} power user${segments.powerUsers.length > 1 ? "s" : ""} identified`,
        body: `${segments.powerUsers.length} user(s) meet the power-user bar (5+ day streak, 10+ sessions, or 10+ study hours). Understand what's keeping them engaged.`,
        feature: null,
      });
    }

    const northStar = await computeNorthStar();
    insights.push({
      id: "weekly_active_learners", type: "neutral",
      title: `${northStar.weeklyActiveLearners} weekly active learners`,
      body: `${northStar.weeklyActiveLearners} distinct users engaged with a learning feature in the last 7 days, averaging ${northStar.avgStudyHoursPerActiveLearnerWeekly} study hour(s) each. ${northStar.weeklyRetainedLearners} of them were also active the week before.`,
      feature: null,
    });

    setCached("insights", insights);
    res.json({ success: true, insights });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await User.findOne({ where: { id, role: "user" } });
    if (!target) return res.status(404).json({ success: false, error: "User not found or not deletable." });
    await Promise.all([
      UserEvents.destroy({ where: { user_id: id } }),
      UserData.destroy({ where: { user_id: id } }),
    ]);
    await target.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const recordEvent = async (req, res, next) => {
  try {
    const { user_id, event_type, feature_name, metadata } = req.body;
    if (!user_id || !event_type) {
      return res.status(400).json({ success: false, error: "user_id and event_type are required." });
    }
    await UserEvents.create({ user_id, event_type, feature_name: feature_name || null, metadata: metadata || null });
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMetrics, listUsers, getFunnel, getFeatureAnalytics,
  getActivity, getRetention, recordEvent, deleteUser,
  getJourney, getUserSessions, getSegments, getDiscovery, getInsights,
};