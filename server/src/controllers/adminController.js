const { Op, fn, col, literal, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User       = require("../models/User");
const UserData   = require("../models/UserData").UserData ?? require("../models/UserData");
const UserEvents = require("../models/UserEvents");

// ─── Simple in-memory cache ───────────────────────────────────────────────────
const cache = {};
function getCached(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > 5 * 60 * 1000) { delete cache[key]; return null; }
  return entry.data;
}
function setCached(key, data) { cache[key] = { data, ts: Date.now() }; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const ALL_FEATURES = [
  "AI Mentor", "Notes Auditor", "Syllabus Tracker",
  "Dashboard", "Timer", "Topic Practice",
  "PYQs", "Mock Tests", "AI Evaluator",
];

// ─── Test-account exclusions ──────────────────────────────────────────────────
const EXCL_NAMES     = ["admin", "anand vivek"];
const EXCL_SQL       = EXCL_NAMES.map(n => `'${n}'`).join(", ");
// For raw SQL where users table is aliased as u:
const EXCL_USER_COND = `LOWER(u.name) NOT IN (${EXCL_SQL})`;
// For raw SQL where users table has no alias:
const EXCL_NAME_COND = `LOWER(name) NOT IN (${EXCL_SQL})`;
// For UserEvents queries (filter by user_id subquery):
const EXCL_UID_COND  = `user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))`;

// ─── GET /api/admin/metrics ───────────────────────────────────────────────────
const getMetrics = async (req, res, next) => {
  try {
    const cached = getCached("metrics");
    if (cached) return res.json({ success: true, metrics: cached });

    const now        = new Date();
    const todayStart = startOfDay(now);
    const wauStart   = daysAgo(7);
    const mauStart   = daysAgo(30);

    const [totalUsers, todaySignups, dauRaw] = await Promise.all([
      User.count({ where: { role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) } }),
      User.count({ where: { role: "user", createdAt: { [Op.gte]: todayStart }, [Op.and]: sequelize.literal(EXCL_NAME_COND) } }),
      UserEvents.count({
        distinct: true, col: "user_id",
        where: { created_at: { [Op.gte]: todayStart }, [Op.and]: sequelize.literal(EXCL_UID_COND) },
      }),
    ]);

    const [wauRaw, mauRaw] = await Promise.all([
      UserEvents.count({ distinct: true, col: "user_id", where: { created_at: { [Op.gte]: wauStart }, [Op.and]: sequelize.literal(EXCL_UID_COND) } }),
      UserEvents.count({ distinct: true, col: "user_id", where: { created_at: { [Op.gte]: mauStart }, [Op.and]: sequelize.literal(EXCL_UID_COND) } }),
    ]);

    const [usedAnyFeature, used3Plus, used5Plus] = await Promise.all([
      sequelize.query(
        `SELECT COUNT(*) AS cnt FROM (SELECT user_id FROM "UserEvents" WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND} GROUP BY user_id HAVING COUNT(DISTINCT feature_name) >= 1) sub`,
        { type: QueryTypes.SELECT }
      ).then(r => parseInt(r[0]?.cnt || 0)),
      sequelize.query(
        `SELECT COUNT(*) AS cnt FROM (SELECT user_id FROM "UserEvents" WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND} GROUP BY user_id HAVING COUNT(DISTINCT feature_name) >= 3) sub`,
        { type: QueryTypes.SELECT }
      ).then(r => parseInt(r[0]?.cnt || 0)),
      sequelize.query(
        `SELECT COUNT(*) AS cnt FROM (SELECT user_id FROM "UserEvents" WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND} GROUP BY user_id HAVING COUNT(DISTINCT feature_name) >= 5) sub`,
        { type: QueryTypes.SELECT }
      ).then(r => parseInt(r[0]?.cnt || 0)),
    ]);

    const countEvent = (type) => UserEvents.count({ where: { event_type: type, [Op.and]: sequelize.literal(EXCL_UID_COND) } });
    const [answersEvaluated, notesAudited, testsAttempted, aiMentorConversations] = await Promise.all([
      countEvent("answer_evaluated"),
      countEvent("notes_audited"),
      countEvent("test_attempted"),
      countEvent("mentor_open"),
    ]);

    const allUD = await UserData.findAll({
      where: { [Op.and]: sequelize.literal(`user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))`) },
      attributes: ["daily_logs"],
    });
    let totalStudyHours = 0;
    allUD.forEach((ud) => {
      if (Array.isArray(ud.daily_logs)) {
        totalStudyHours += ud.daily_logs.reduce((s, l) => s + (l.hours || 0), 0);
      }
    });
    const avgStudyHours = allUD.length > 0 ? parseFloat((totalStudyHours / allUD.length).toFixed(1)) : 0;
    const activeStreakUsers = await User.count({ where: { role: "user", streak: { [Op.gt]: 0 }, [Op.and]: sequelize.literal(EXCL_NAME_COND) } });

    const [d1Rows, d7Rows] = await Promise.all([
      sequelize.query(
        `SELECT COUNT(DISTINCT ue.user_id) AS cnt FROM "UserEvents" ue JOIN "users" u ON u.id = ue.user_id WHERE ue.event_type = 'day_return' AND ue.created_at <= u.created_at + INTERVAL '2 days' AND ${EXCL_USER_COND}`,
        { type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT COUNT(DISTINCT ue.user_id) AS cnt FROM "UserEvents" ue JOIN "users" u ON u.id = ue.user_id WHERE ue.event_type = 'day_return' AND ue.created_at <= u.created_at + INTERVAL '7 days' AND ${EXCL_USER_COND}`,
        { type: QueryTypes.SELECT }
      ),
    ]);
    const retentionD1 = totalUsers > 0 ? Math.round((parseInt(d1Rows[0]?.cnt || 0) / totalUsers) * 100) : 0;
    const retentionD7 = totalUsers > 0 ? Math.round((parseInt(d7Rows[0]?.cnt || 0) / totalUsers) * 100) : 0;

    const yesterdayStart = startOfDay(daysAgo(1));
    const dau_prev = await UserEvents.count({
      distinct: true, col: "user_id",
      where: { created_at: { [Op.gte]: yesterdayStart, [Op.lt]: todayStart }, [Op.and]: sequelize.literal(EXCL_UID_COND) },
    });

    const metrics = {
      users: { total: totalUsers, todaySignups, dau: dauRaw, wau: wauRaw, mau: mauRaw, usedAnyFeature, used3PlusFeatures: used3Plus, used5PlusFeatures: used5Plus, activeStreakUsers },
      engagement: { avgStudyHours, totalStudyHours: Math.round(totalStudyHours), retentionD1, retentionD7 },
      activity: { answersEvaluated, notesAudited, testsAttempted, aiMentorConversations },
      trends: { dau_delta: dauRaw - dau_prev },
    };

    setCached("metrics", metrics);
    res.json({ success: true, metrics });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
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
      engagement_score: "engagement_score",
    };
    const sortCol = SORTABLE[req.query.sort] || SORTABLE.engagement_score;

    const rows = await sequelize.query(
      `SELECT
         u.id, u.name, u.email, u.created_at AS registration_date,
         u.streak, u.longest_streak,
         COALESCE(daily.total_hours, 0)::numeric(10,1)    AS total_study_hours,
         COALESCE(ev.answers_evaluated, 0)                AS answers_evaluated,
         COALESCE(ev.notes_audited, 0)                    AS notes_audited,
         COALESCE(ev.tests_attempted, 0)                  AS tests_attempted,
         COALESCE(ev.days_active, 0)                      AS days_active,
         COALESCE(ev.features_used, 0)                    AS features_used,
         ev.last_active,
         ev.first_active,
         ev.first_feature_used,
         (
           COALESCE(u.streak,0) * 2 +
           COALESCE(daily.total_hours,0) * 1.5 +
           COALESCE(ev.answers_evaluated,0) +
           COALESCE(ev.days_active,0) * 1.2
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

// ─── GET /api/admin/funnel ────────────────────────────────────────────────────
const getFunnel = async (req, res, next) => {
  try {
    const totalUsers = await User.count({ where: { role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) } });

    const steps = [
      { label: "Registered",          event: null },
      { label: "Visited Dashboard",   event: "dashboard_visit" },
      { label: "Started Study Timer", event: "timer_start" },
      { label: "Opened AI Mentor",    event: "mentor_open" },
      { label: "Evaluated an Answer", event: "answer_evaluated" },
      { label: "Returned Next Day",   event: "day_return" },
    ];

    const counts = await Promise.all(steps.map(async (s) => {
      if (!s.event) return totalUsers;
      return UserEvents.count({ distinct: true, col: "user_id", where: { event_type: s.event, [Op.and]: sequelize.literal(EXCL_UID_COND) } });
    }));

    const funnel = steps.map((s, i) => {
      const count    = counts[i];
      const pctTotal = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
      const dropOff  = i === 0 ? 0 : counts[i - 1] > 0 ? Math.round(((counts[i - 1] - count) / counts[i - 1]) * 100) : 0;
      return { step: i + 1, label: s.label, count, pctOfTotal: pctTotal, dropOffPct: dropOff };
    });

    res.json({ success: true, funnel });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/features ──────────────────────────────────────────────────
const getFeatureAnalytics = async (req, res, next) => {
  try {
    const rows = await sequelize.query(
  `SELECT
     feature_name,
     COUNT(*) AS total_uses,
     COUNT(DISTINCT user_id) AS unique_users,
     MAX(created_at) AS last_used,
     AVG(time_diff_minutes) AS avg_session_minutes
   FROM (
     SELECT
       feature_name,
       user_id,
       created_at,
       EXTRACT(EPOCH FROM (
         LEAD(created_at) OVER (PARTITION BY user_id ORDER BY created_at) - created_at
       )) / 60 AS time_diff_minutes
     FROM "UserEvents"
     WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
   ) sub
   WHERE time_diff_minutes IS NOT NULL
   GROUP BY feature_name`,
  { type: QueryTypes.SELECT }
);

    const featureMap = {};
    rows.forEach((r) => { featureMap[r.feature_name] = r; });

    const features = await Promise.all(
      ALL_FEATURES.map(async (name) => {
        const base = featureMap[name] || { total_uses: 0, unique_users: 0, last_used: null, avg_session_minutes: null };
        const totalUses   = parseInt(base.total_uses);
        const uniqueUsers = parseInt(base.unique_users);
        const daysSince   = base.last_used ? (Date.now() - new Date(base.last_used)) / 86400000 : 999;
        const recencyScore = Math.max(0, 100 - daysSince);
        const engagementScore = parseFloat((uniqueUsers * 0.5 + totalUses * 0.3 + recencyScore * 0.2).toFixed(2));

        const topUsers = await sequelize.query(
          `SELECT u.name, u.email, COUNT(*) AS uses
           FROM "UserEvents" ue
           JOIN "users" u ON u.id = ue.user_id
           WHERE ue.feature_name = :name AND ${EXCL_USER_COND}
           GROUP BY u.id, u.name, u.email
           ORDER BY uses DESC LIMIT 3`,
          { replacements: { name }, type: QueryTypes.SELECT }
        );

        return {
          name, uniqueUsers, totalUses,
          avgUsagePerUser: uniqueUsers > 0 ? parseFloat((totalUses / uniqueUsers).toFixed(1)) : 0,
          avgTimeSpentMin: base.avg_session_minutes ? parseFloat(parseFloat(base.avg_session_minutes).toFixed(1)) : null,
          lastUsed: base.last_used || null,
          engagementScore,
          topUsers,
        };
      })
    );

    features.sort((a, b) => b.engagementScore - a.engagementScore);
    res.json({ success: true, features });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/activity ──────────────────────────────────────────────────
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

// ─── GET /api/admin/retention ─────────────────────────────────────────────────
const getRetention = async (req, res, next) => {
  try {
    const totalUsers = await User.count({ where: { role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) } });

    const retentionQuery = (days) => sequelize.query(
      `SELECT COUNT(DISTINCT ue.user_id) AS cnt FROM "UserEvents" ue JOIN "users" u ON u.id = ue.user_id
       WHERE u.role = 'user' AND ${EXCL_USER_COND}
         AND ue.created_at >= u.created_at + INTERVAL '1 day'
         AND ue.created_at <= u.created_at + INTERVAL '${days + 1} days'`,
      { type: QueryTypes.SELECT }
    ).then(r => parseInt(r[0]?.cnt || 0));

    const [d1Count, d7Count, d30Count] = await Promise.all([
      retentionQuery(1), retentionQuery(7), retentionQuery(30),
    ]);
    const pct = (n) => totalUsers > 0 ? Math.round((n / totalUsers) * 100) : 0;

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
      week0: r.cohort_size > 0 ? Math.round((r.week0 / r.cohort_size) * 100) : 0,
      week1: r.cohort_size > 0 ? Math.round((r.week1 / r.cohort_size) * 100) : 0,
      week2: r.cohort_size > 0 ? Math.round((r.week2 / r.cohort_size) * 100) : 0,
      week3: r.cohort_size > 0 ? Math.round((r.week3 / r.cohort_size) * 100) : 0,
    }));

    const churnList = await sequelize.query(
      `SELECT u.id, u.name, u.email, u.streak, ev.last_active
       FROM "users" u
       LEFT JOIN (SELECT user_id, MAX(created_at) AS last_active FROM "UserEvents" GROUP BY user_id) ev ON ev.user_id = u.id
       WHERE u.role = 'user' AND ${EXCL_USER_COND} AND (ev.last_active IS NULL OR ev.last_active < NOW() - INTERVAL '7 days')
       ORDER BY ev.last_active ASC NULLS FIRST LIMIT 20`,
      { type: QueryTypes.SELECT }
    );

    res.json({ success: true, retention: { d1: pct(d1Count), d7: pct(d7Count), d30: pct(d30Count) }, cohort, churnList });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/journey ───────────────────────────────────────────────────
// PART 1 - User journey: signup → first feature → second feature → most used → returned
const getJourney = async (req, res, next) => {
  try {
    const cached = getCached("journey");
    if (cached) return res.json({ success: true, ...cached });

    // Per-user first two features, most-used feature, and whether they returned next day
    const journeyRows = await sequelize.query(
      `WITH ordered AS (
         SELECT
           ue.user_id,
           ue.feature_name,
           ue.created_at,
           ROW_NUMBER() OVER (PARTITION BY ue.user_id ORDER BY ue.created_at ASC) AS rn
         FROM "UserEvents" ue
         WHERE ue.feature_name IS NOT NULL
       ),
       feature_counts AS (
         SELECT user_id, feature_name, COUNT(*) AS cnt
         FROM "UserEvents" WHERE feature_name IS NOT NULL GROUP BY user_id, feature_name
       ),
       most_used AS (
         SELECT DISTINCT ON (user_id) user_id, feature_name AS most_used_feature
         FROM feature_counts ORDER BY user_id, cnt DESC
       ),
       returned AS (
         SELECT DISTINCT user_id FROM "UserEvents"
         WHERE event_type = 'day_return'
       )
       SELECT
         u.id AS user_id, u.name, u.created_at AS signed_up,
         f1.feature_name AS first_feature, f1.created_at AS first_feature_at,
         f2.feature_name AS second_feature, f2.created_at AS second_feature_at,
         mu.most_used_feature,
         CASE WHEN r.user_id IS NOT NULL THEN true ELSE false END AS returned_next_day
       FROM "users" u
       LEFT JOIN ordered f1 ON f1.user_id = u.id AND f1.rn = 1
       LEFT JOIN ordered f2 ON f2.user_id = u.id AND f2.rn = 2
       LEFT JOIN most_used mu ON mu.user_id = u.id
       LEFT JOIN returned r ON r.user_id = u.id
       WHERE u.role = 'user' AND ${EXCL_USER_COND}
       ORDER BY u.created_at DESC
       LIMIT 200`,
      { type: QueryTypes.SELECT }
    );

    // Aggregate: first feature distribution
    const firstFeatureDist = {};
    const returnByFeature  = {};
    const retentionByFirst = {};

    journeyRows.forEach((j) => {
      const f = j.first_feature;
      if (!f) return;
      firstFeatureDist[f] = (firstFeatureDist[f] || 0) + 1;
      if (!returnByFeature[f]) returnByFeature[f] = { returned: 0, total: 0 };
      returnByFeature[f].total++;
      if (j.returned_next_day) returnByFeature[f].returned++;
    });

    // Return rate per first-feature
    Object.keys(returnByFeature).forEach((f) => {
      const { returned, total } = returnByFeature[f];
      retentionByFirst[f] = total > 0 ? Math.round((returned / total) * 100) : 0;
    });

    const totalWithFirst = journeyRows.filter(j => j.first_feature).length;
    const firstFeatureRanked = Object.entries(firstFeatureDist)
      .map(([feature, count]) => ({ feature, count, pct: Math.round((count / Math.max(totalWithFirst, 1)) * 100), returnRate: retentionByFirst[feature] || 0 }))
      .sort((a, b) => b.count - a.count);

    const data = { journeyRows, firstFeatureRanked };
    setCached("journey", data);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/sessions/:userId ─────────────────────────────────────────
// PART 2 - Session timeline for a specific user
const getUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ where: { id: userId, role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) }, attributes: ["id", "name", "email", "streak", "longest_streak", "created_at"] });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    // All events for this user, ordered chronologically
    const events = await sequelize.query(
      `SELECT id, event_type, feature_name, metadata, created_at
       FROM "UserEvents" WHERE user_id = :userId ORDER BY created_at ASC`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    // Group into sessions: new session if gap > 30 minutes
    const SESSION_GAP_MS = 30 * 60 * 1000;
    const sessions = [];
    let current = null;

    events.forEach((ev) => {
      const ts = new Date(ev.created_at).getTime();
      if (!current || ts - current.lastTs > SESSION_GAP_MS) {
        if (current) sessions.push(current);
        current = { startedAt: ev.created_at, lastTs: ts, events: [] };
      }
      current.lastTs = ts;
      current.endedAt = ev.created_at;
      current.events.push({
        id: ev.id, eventType: ev.event_type, featureName: ev.feature_name,
        metadata: ev.metadata, timestamp: ev.created_at,
      });
    });
    if (current) sessions.push(current);

    // Enrich sessions with duration
    const enriched = sessions.map((s) => ({
      startedAt: s.startedAt,
      endedAt:   s.endedAt,
      durationMin: Math.round((new Date(s.endedAt) - new Date(s.startedAt)) / 60000),
      eventCount: s.events.length,
      events: s.events,
    })).reverse(); // most recent first

    // Study hours from UserData
    const ud = await UserData.findOne({ where: { user_id: userId }, attributes: ["daily_logs"] });
    let totalStudyHours = 0;
    if (ud && Array.isArray(ud.daily_logs)) {
      totalStudyHours = ud.daily_logs.reduce((s, l) => s + (l.hours || 0), 0);
    }

    // Feature use counts
    const featureCounts = {};
    events.forEach((ev) => {
      if (ev.feature_name) featureCounts[ev.feature_name] = (featureCounts[ev.feature_name] || 0) + 1;
    });
    const featuresUsed = Object.entries(featureCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // First feature
    const firstFeatureEvent = events.find(e => e.feature_name);
    const lastEvent = events[events.length - 1];

    // Streak: count distinct days with events
    const activeDays = new Set(events.map(e => new Date(e.created_at).toDateString()));
    const daysActive = activeDays.size;

    // Compute retention: returned next day after signup?
    const signupDate = new Date(user.created_at);
    const returnedNextDay = events.some(e => {
      const d = new Date(e.created_at);
      const diff = (d - signupDate) / 86400000;
      return diff >= 1 && diff <= 2;
    });

    res.json({
      success: true,
      user: {
        id: user.id, name: user.name, email: user.email,
        streak: user.streak, longestStreak: user.longest_streak,
        joinedAt: user.created_at,
        totalStudyHours: parseFloat(totalStudyHours.toFixed(1)),
        totalSessions: sessions.length,
        daysActive,
        returnedNextDay,
        firstFeatureUsed: firstFeatureEvent?.feature_name || null,
        firstFeatureAt:   firstFeatureEvent?.created_at || null,
        lastActiveAt:     lastEvent?.created_at || null,
        featuresUsed,
      },
      sessions: enriched,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/segments ──────────────────────────────────────────────────
// PART 5 - Retention segments: Power Users / At Risk / Dormant
const getSegments = async (req, res, next) => {
  try {
    const cached = getCached("segments");
    if (cached) return res.json({ success: true, ...cached });

    // Last active date per user
    const activityRows = await sequelize.query(
      `SELECT
         u.id, u.name, u.email, u.streak,
         ev.last_active,
         ev.days_active
       FROM "users" u
       LEFT JOIN (
         SELECT user_id, MAX(created_at) AS last_active, COUNT(DISTINCT DATE(created_at)) AS days_active
         FROM "UserEvents" GROUP BY user_id
       ) ev ON ev.user_id = u.id
       WHERE u.role = 'user' AND ${EXCL_USER_COND}`,
      { type: QueryTypes.SELECT }
    );

    const now = Date.now();
    const powerUsers = [], atRisk = [], dormant = [], newUsers = [];

    activityRows.forEach((u) => {
      const daysSince = u.last_active ? (now - new Date(u.last_active)) / 86400000 : 999;
      const daysActive = parseInt(u.days_active || 0);

      if (daysActive >= 3 && daysSince <= 3) {
        powerUsers.push(u);
      } else if (daysSince > 7) {
        dormant.push(u);
      } else if (daysSince > 3) {
        atRisk.push(u);
      } else {
        newUsers.push(u);
      }
    });

    const data = {
      powerUsers:  { count: powerUsers.length,  users: powerUsers.slice(0, 20)  },
      atRisk:      { count: atRisk.length,       users: atRisk.slice(0, 20)       },
      dormant:     { count: dormant.length,      users: dormant.slice(0, 20)      },
      newUsers:    { count: newUsers.length,     users: newUsers.slice(0, 20)     },
      total:       activityRows.length,
    };

    setCached("segments", data);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/discovery ─────────────────────────────────────────────────
// PART 6 - Feature discovery analysis
const getDiscovery = async (req, res, next) => {
  try {
    const cached = getCached("discovery");
    if (cached) return res.json({ success: true, ...cached });

    // Which feature users discover first
    const firstFeatureRows = await sequelize.query(
      `SELECT
         (ARRAY_AGG(feature_name ORDER BY created_at ASC) FILTER (WHERE feature_name IS NOT NULL))[1] AS first_feature,
         COUNT(*) AS cnt
       FROM "UserEvents"
       WHERE ${EXCL_UID_COND}
       GROUP BY user_id`,
      { type: QueryTypes.SELECT }
    );

    const firstFeatureDist = {};
    firstFeatureRows.forEach((r) => {
      if (r.first_feature) firstFeatureDist[r.first_feature] = parseInt(r.cnt);
    });

    // Which feature correlates with return visits (users who fired day_return)
    const returnFeatureRows = await sequelize.query(
      `SELECT
         ue.feature_name,
         COUNT(DISTINCT ue.user_id) AS users_who_returned
       FROM "UserEvents" ue
       WHERE ue.feature_name IS NOT NULL
         AND ue.user_id IN (SELECT DISTINCT user_id FROM "UserEvents" WHERE event_type = 'day_return')
         AND ue.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
       GROUP BY ue.feature_name
       ORDER BY users_who_returned DESC`,
      { type: QueryTypes.SELECT }
    );

    // Total unique users per feature (for rate calculation)
    const featureUserRows = await sequelize.query(
      `SELECT feature_name, COUNT(DISTINCT user_id) AS total_users FROM "UserEvents"
       WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND} GROUP BY feature_name`,
      { type: QueryTypes.SELECT }
    );
    const featureTotals = {};
    featureUserRows.forEach((r) => { featureTotals[r.feature_name] = parseInt(r.total_users); });

    // Total users who returned
    const totalReturners = await UserEvents.count({ distinct: true, col: "user_id", where: { event_type: "day_return", [Op.and]: sequelize.literal(EXCL_UID_COND) } });
    const totalUsers = await User.count({ where: { role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) } });

    // Retention rate per feature: among users who used feature X, what % returned?
    const retentionByFeature = returnFeatureRows.map((r) => {
      const total = featureTotals[r.feature_name] || 0;
      return {
        feature: r.feature_name,
        usersWhoReturned: parseInt(r.users_who_returned),
        totalUsersOfFeature: total,
        returnRate: total > 0 ? Math.round((parseInt(r.users_who_returned) / total) * 100) : 0,
      };
    }).sort((a, b) => b.returnRate - a.returnRate);

    // Ignored features: used by < 10% of users
    const ignoredFeatures = ALL_FEATURES.filter((f) => {
      const users = featureTotals[f] || 0;
      return totalUsers > 0 && (users / totalUsers) < 0.10;
    });

    // Feature that most causes a 2nd visit (used most frequently by returning users BEFORE their first return)
    const causeOfReturnRows = await sequelize.query(
      `WITH first_return AS (
         SELECT user_id, MIN(created_at) AS return_at FROM "UserEvents"
         WHERE event_type = 'day_return'
           AND user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
         GROUP BY user_id
       )
       SELECT ue.feature_name, COUNT(DISTINCT ue.user_id) AS cnt
       FROM "UserEvents" ue
       JOIN first_return fr ON fr.user_id = ue.user_id
       WHERE ue.feature_name IS NOT NULL AND ue.created_at < fr.return_at
         AND ue.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
       GROUP BY ue.feature_name ORDER BY cnt DESC LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    const data = {
      firstFeatureDist,
      retentionByFeature,
      ignoredFeatures,
      causeOfReturn: causeOfReturnRows.map((r) => ({ feature: r.feature_name, count: parseInt(r.cnt) })),
    };

    setCached("discovery", data);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/insights ──────────────────────────────────────────────────
// PART 7 - Auto-generated founder insights
const getInsights = async (req, res, next) => {
  try {
    const cached = getCached("insights");
    if (cached) return res.json({ success: true, insights: cached });

    const totalUsers = await User.count({ where: { role: "user", [Op.and]: sequelize.literal(EXCL_NAME_COND) } });
    if (totalUsers === 0) return res.json({ success: true, insights: [] });

    // Parallel queries for all insight data
    const [
      featureRetentionRows,
      featureTotalRows,
      totalReturners,
      dropOffRows,
      avgFeatureCountRow,
      highEngageRow,
    ] = await Promise.all([
      // Users of each feature who also returned
      sequelize.query(
        `SELECT ue.feature_name, COUNT(DISTINCT ue.user_id) AS returners
         FROM "UserEvents" ue
         WHERE ue.feature_name IS NOT NULL
           AND ue.user_id IN (SELECT DISTINCT user_id FROM "UserEvents" WHERE event_type = 'day_return')
           AND ue.user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))
         GROUP BY ue.feature_name`,
        { type: QueryTypes.SELECT }
      ),
      // Total unique users per feature
      sequelize.query(
        `SELECT feature_name, COUNT(DISTINCT user_id) AS total FROM "UserEvents"
         WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND} GROUP BY feature_name`,
        { type: QueryTypes.SELECT }
      ),
      // Total users who returned at least once
      UserEvents.count({ distinct: true, col: "user_id", where: { event_type: "day_return", [Op.and]: sequelize.literal(EXCL_UID_COND) } }),
      // Features with high drop-off: used once by many but rarely again
      sequelize.query(
        `SELECT feature_name,
           COUNT(DISTINCT CASE WHEN use_count = 1 THEN user_id END) AS single_use,
           COUNT(DISTINCT user_id) AS total
         FROM (
           SELECT user_id, feature_name, COUNT(*) AS use_count
           FROM "UserEvents" WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
           GROUP BY user_id, feature_name
         ) sub
         GROUP BY feature_name
         HAVING COUNT(DISTINCT user_id) >= 5`,
        { type: QueryTypes.SELECT }
      ),
      // Avg features used per user
      sequelize.query(
        `SELECT AVG(cnt)::numeric(4,1) AS avg_features FROM (
           SELECT user_id, COUNT(DISTINCT feature_name) AS cnt FROM "UserEvents"
           WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND} GROUP BY user_id
         ) sub`,
        { type: QueryTypes.SELECT }
      ),
      // Most engaging feature by avg uses per user
      sequelize.query(
        `SELECT feature_name, COUNT(*)::float / COUNT(DISTINCT user_id) AS avg_uses
         FROM "UserEvents" WHERE feature_name IS NOT NULL AND ${EXCL_UID_COND}
         GROUP BY feature_name ORDER BY avg_uses DESC LIMIT 1`,
        { type: QueryTypes.SELECT }
      ),
    ]);

    const totalMap = {};
    featureTotalRows.forEach((r) => { totalMap[r.feature_name] = parseInt(r.total); });
    const returnMap = {};
    featureRetentionRows.forEach((r) => { returnMap[r.feature_name] = parseInt(r.returners); });

    const baseReturnRate = totalUsers > 0 ? totalReturners / totalUsers : 0;

    const insights = [];

    // Insight 1: Feature that most correlates with return visits vs baseline
    const featureRetentionRates = Object.keys(totalMap).map((f) => ({
      feature: f,
      rate: totalMap[f] > 0 ? (returnMap[f] || 0) / totalMap[f] : 0,
      total: totalMap[f],
    })).filter((f) => f.total >= 3).sort((a, b) => b.rate - a.rate);

    if (featureRetentionRates.length > 0 && baseReturnRate > 0) {
      const top = featureRetentionRates[0];
      const multiplier = (top.rate / baseReturnRate).toFixed(1);
      if (multiplier > 1.5) {
        insights.push({
          id: "retention_driver",
          type: "positive",
          title: `${top.feature} drives retention`,
          body: `Users who use ${top.feature} are ${multiplier}× more likely to return the next day compared to your average user.`,
          feature: top.feature,
        });
      }
    }

    // Insight 2: Most engaging feature
    if (highEngageRow.length > 0) {
      const f = highEngageRow[0];
      insights.push({
        id: "most_engaging",
        type: "positive",
        title: `${f.feature_name} is your most engaging feature`,
        body: `Users who open ${f.feature_name} use it an average of ${parseFloat(f.avg_uses).toFixed(1)} times - the highest of any feature.`,
        feature: f.feature_name,
      });
    }

    // Insight 3: Ignored features (< 10% adoption)
    const ignored = ALL_FEATURES.filter((f) => {
      const users = totalMap[f] || 0;
      return (users / totalUsers) < 0.10;
    });
    if (ignored.length > 0) {
      insights.push({
        id: "ignored_features",
        type: "warning",
        title: `${ignored.length} feature${ignored.length > 1 ? "s" : ""} almost undiscovered`,
        body: `${ignored.join(", ")} ${ignored.length > 1 ? "have" : "has"} been used by fewer than 10% of your users. Consider improving discoverability.`,
        feature: ignored[0],
      });
    }

    // Insight 4: High drop-off features (> 60% used only once)
    const dropOffs = dropOffRows
      .map((r) => ({ feature: r.feature_name, single: parseInt(r.single_use), total: parseInt(r.total), rate: Math.round((parseInt(r.single_use) / parseInt(r.total)) * 100) }))
      .filter((r) => r.rate >= 60)
      .sort((a, b) => b.rate - a.rate);

    if (dropOffs.length > 0) {
      const top = dropOffs[0];
      insights.push({
        id: "drop_off",
        type: "warning",
        title: `${top.feature} has a high drop-off`,
        body: `${top.rate}% of users who tried ${top.feature} never came back to it. The first-time experience may need improvement.`,
        feature: top.feature,
      });
    }

    // Insight 5: Feature breadth
    const avgFeatures = parseFloat(avgFeatureCountRow[0]?.avg_features || 0);
    if (avgFeatures > 0) {
      const breadthLabel = avgFeatures < 2 ? "very low" : avgFeatures < 4 ? "moderate" : "strong";
      insights.push({
        id: "feature_breadth",
        type: avgFeatures < 2 ? "warning" : "neutral",
        title: `Feature breadth is ${breadthLabel}`,
        body: `On average, users explore ${avgFeatures} features. ${avgFeatures < 2
          ? "Most users are stuck in one area - guide them to discover more of the app."
          : "Users are discovering multiple features, which is a healthy sign."}`,
        feature: null,
      });
    }

    // Insight 6: Power user presence
    const powerUserCount = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM (
         SELECT user_id FROM "UserEvents"
         WHERE ${EXCL_UID_COND}
         GROUP BY user_id HAVING COUNT(DISTINCT DATE(created_at)) >= 3
           AND MAX(created_at) >= NOW() - INTERVAL '3 days'
       ) sub`,
      { type: QueryTypes.SELECT }
    ).then(r => parseInt(r[0]?.cnt || 0));

    if (powerUserCount > 0) {
      insights.push({
        id: "power_users",
        type: "positive",
        title: `${powerUserCount} power user${powerUserCount > 1 ? "s" : ""} identified`,
        body: `${powerUserCount} user${powerUserCount > 1 ? "s have" : " has"} studied 3+ days in the last 3 days. These are your most engaged users - understand what's keeping them coming back.`,
        feature: null,
      });
    }

    // Insight 7: Lowest retention feature
    if (featureRetentionRates.length > 1) {
      const bottom = featureRetentionRates[featureRetentionRates.length - 1];
      if (bottom.rate < 0.2 && bottom.total >= 5) {
        insights.push({
          id: "lowest_retention",
          type: "warning",
          title: `${bottom.feature} doesn't bring users back`,
          body: `Only ${Math.round(bottom.rate * 100)}% of ${bottom.feature} users return the next day. This feature may not be creating a habit loop.`,
          feature: bottom.feature,
        });
      }
    }

    setCached("insights", insights);
    res.json({ success: true, insights });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
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

// ─── POST /api/admin/events ───────────────────────────────────────────────────
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