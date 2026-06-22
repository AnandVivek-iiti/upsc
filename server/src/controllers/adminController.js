
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

// ─── GET /api/admin/metrics ───────────────────────────────────────────────────
const getMetrics = async (req, res, next) => {
  try {
    const cached = getCached("metrics");
    if (cached) return res.json({ success: true, metrics: cached });

    const now        = new Date();
    const todayStart = startOfDay(now);
    const wauStart   = daysAgo(7);
    const mauStart   = daysAgo(30);

    // ── User counts ──────────────────────────────────────────────────────────
    const [totalUsers, todaySignups, dauRaw] = await Promise.all([
      User.count({ where: { role: "user" } }),
      User.count({ where: { role: "user", createdAt: { [Op.gte]: todayStart } } }),
      // DAU = distinct users with any event today
      UserEvents.count({
        distinct: true,
        col: "user_id",
        where: { created_at: { [Op.gte]: todayStart } },
      }),
    ]);

    const [wauRaw, mauRaw] = await Promise.all([
      UserEvents.count({
        distinct: true, col: "user_id",
        where: { created_at: { [Op.gte]: wauStart } },
      }),
      UserEvents.count({
        distinct: true, col: "user_id",
        where: { created_at: { [Op.gte]: mauStart } },
      }),
    ]);

    // ── Feature adoption (using UserEvents feature_name) ─────────────────────
    // Count distinct users per feature bucket
    const [usedAnyFeature, used3Plus, used5Plus] = await Promise.all([
      // users with >= 1 distinct feature
      sequelize.query(
        `SELECT COUNT(*) AS cnt FROM (
           SELECT user_id FROM "UserEvents"
           WHERE feature_name IS NOT NULL
           GROUP BY user_id HAVING COUNT(DISTINCT feature_name) >= 1
         ) sub`,
        { type: QueryTypes.SELECT }
      ).then(r => parseInt(r[0]?.cnt || 0)),

      sequelize.query(
        `SELECT COUNT(*) AS cnt FROM (
           SELECT user_id FROM "UserEvents"
           WHERE feature_name IS NOT NULL
           GROUP BY user_id HAVING COUNT(DISTINCT feature_name) >= 3
         ) sub`,
        { type: QueryTypes.SELECT }
      ).then(r => parseInt(r[0]?.cnt || 0)),

      sequelize.query(
        `SELECT COUNT(*) AS cnt FROM (
           SELECT user_id FROM "UserEvents"
           WHERE feature_name IS NOT NULL
           GROUP BY user_id HAVING COUNT(DISTINCT feature_name) >= 5
         ) sub`,
        { type: QueryTypes.SELECT }
      ).then(r => parseInt(r[0]?.cnt || 0)),
    ]);

    // ── Activity counts ───────────────────────────────────────────────────────
    const countEvent = (type) =>
      UserEvents.count({ where: { event_type: type } });

    const [answersEvaluated, notesAudited, testsAttempted, aiMentorConversations] =
      await Promise.all([
        countEvent("answer_evaluated"),
        countEvent("notes_audited"),
        countEvent("test_attempted"),
        countEvent("mentor_open"),
      ]);

    // ── Engagement: study hours from UserData, streak from User ──────────────
    // (streak lives on the "users" table — UserData/user_data has no such column)
    const allUD = await UserData.findAll({ attributes: ["daily_logs"] });

    let totalStudyHours = 0;
    allUD.forEach((ud) => {
      if (Array.isArray(ud.daily_logs)) {
        totalStudyHours += ud.daily_logs.reduce((s, l) => s + (l.hours || 0), 0);
      }
    });
    const avgStudyHours =
      allUD.length > 0 ? parseFloat((totalStudyHours / allUD.length).toFixed(1)) : 0;

    const activeStreakUsers = await User.count({
      where: { role: "user", streak: { [Op.gt]: 0 } },
    });

    // ── Retention D1/D7 (quick approximation from UserEvents) ─────────────────
    // D1: users who have a day_return event within 1 day of their signup
    const [d1Rows, d7Rows] = await Promise.all([
      sequelize.query(
        `SELECT COUNT(DISTINCT ue.user_id) AS cnt
         FROM "UserEvents" ue
         JOIN "users" u ON u.id = ue.user_id
         WHERE ue.event_type = 'day_return'
           AND ue.created_at <= u.created_at + INTERVAL '2 days'`,
        { type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT COUNT(DISTINCT ue.user_id) AS cnt
         FROM "UserEvents" ue
         JOIN "users" u ON u.id = ue.user_id
         WHERE ue.event_type = 'day_return'
           AND ue.created_at <= u.created_at + INTERVAL '7 days'`,
        { type: QueryTypes.SELECT }
      ),
    ]);
    const retentionD1 =
      totalUsers > 0 ? Math.round((parseInt(d1Rows[0]?.cnt || 0) / totalUsers) * 100) : 0;
    const retentionD7 =
      totalUsers > 0 ? Math.round((parseInt(d7Rows[0]?.cnt || 0) / totalUsers) * 100) : 0;

    // ── Trends: compare DAU vs same window yesterday ──────────────────────────
    const yesterdayStart = startOfDay(daysAgo(1));
    const dau_prev = await UserEvents.count({
      distinct: true, col: "user_id",
      where: { created_at: { [Op.gte]: yesterdayStart, [Op.lt]: todayStart } },
    });

    const metrics = {
      users: {
        total: totalUsers,
        todaySignups,
        dau: dauRaw,
        wau: wauRaw,
        mau: mauRaw,
        usedAnyFeature,
        used3PlusFeatures: used3Plus,
        used5PlusFeatures: used5Plus,
        activeStreakUsers,
      },
      engagement: {
        avgStudyHours,
        totalStudyHours: Math.round(totalStudyHours),
        retentionD1,
        retentionD7,
      },
      activity: {
        answersEvaluated,
        notesAudited,
        testsAttempted,
        aiMentorConversations,
      },
      trends: {
        dau_delta: dauRaw - dau_prev,
      },
    };

    setCached("metrics", metrics);
    res.json({ success: true, metrics });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// Returns paginated user list enriched with per-user engagement score.
const listUsers = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const dir = req.query.dir === "asc" ? "ASC" : "DESC";

    // Whitelist sortable columns — req.query.sort was being interpolated
    // directly into ORDER BY, which is a SQL-injection hole on an admin route.
    const SORTABLE = {
      name: "u.name",
      email: "u.email",
      registration_date: 'u.created_at',
      streak: "u.streak",
      longest_streak: "u.longest_streak",
      total_study_hours: "total_study_hours",
      answers_evaluated: "answers_evaluated",
      notes_audited: "notes_audited",
      tests_attempted: "tests_attempted",
      days_active: "days_active",
      features_used: "features_used",
      last_active: "last_active",
      engagement_score: "engagement_score",
    };
    const sortCol = SORTABLE[req.query.sort] || SORTABLE.engagement_score;

    // Pull base user rows + their activity in one query.
    // user_data has no study_hours/answers_evaluated/etc columns — those are
    // derived here from UserEvents (activity) and daily_logs (JSONB hours log).
    // engagement_score = (streak × 2) + (study_hours × 1.5) + answers_evaluated + (days_active × 1.2)
    const rows = await sequelize.query(
      `SELECT
         u.id, u.name, u.email, u.created_at AS registration_date,
         u.streak,
         u.longest_streak,
         COALESCE(daily.total_hours, 0)::numeric(10,1) AS total_study_hours,
         COALESCE(ev.answers_evaluated, 0)             AS answers_evaluated,
         COALESCE(ev.notes_audited, 0)                 AS notes_audited,
         COALESCE(ev.tests_attempted, 0)               AS tests_attempted,
         COALESCE(ev.days_active, 0)                   AS days_active,
         COALESCE(ev.features_used, 0)                 AS features_used,
         ev.last_active,
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
           MAX(created_at)                                         AS last_active
         FROM "UserEvents"
         GROUP BY user_id
       ) ev ON ev.user_id = u.id
       LEFT JOIN (
         SELECT ud.user_id, SUM((log->>'hours')::float) AS total_hours
         FROM "user_data" ud
         CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ud.daily_logs, '[]'::jsonb)) AS log
         GROUP BY ud.user_id
       ) daily ON daily.user_id = u.id
       WHERE u.role = 'user'
       ORDER BY ${sortCol} ${dir}
       LIMIT :limit OFFSET :offset`,
      {
        replacements: { limit, offset },
        type: QueryTypes.SELECT,
      }
    );

    const [{ total }] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM "users" WHERE role = 'user'`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      total: parseInt(total),
      page,
      pages: Math.ceil(parseInt(total) / limit),
      users: rows,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/funnel ────────────────────────────────────────────────────
const getFunnel = async (req, res, next) => {
  try {
    const totalUsers = await User.count({ where: { role: "user" } });

    // Each step: count distinct users who have fired that event at least once
    const steps = [
      { label: "Registered",        event: null,              /* all users */ },
      { label: "Visited Dashboard", event: "dashboard_visit" },
      { label: "Started Study Timer", event: "timer_start"   },
      { label: "Opened AI Mentor",  event: "mentor_open"     },
      { label: "Evaluated an Answer", event: "answer_evaluated" },
      { label: "Returned Next Day", event: "day_return"      },
    ];

    const counts = await Promise.all(
      steps.map(async (s) => {
        if (!s.event) return totalUsers;
        const c = await UserEvents.count({
          distinct: true,
          col: "user_id",
          where: { event_type: s.event },
        });
        return c;
      })
    );

    const funnel = steps.map((s, i) => {
      const count    = counts[i];
      const pctTotal = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
      const dropOff  = i === 0 ? 0
        : counts[i - 1] > 0
          ? Math.round(((counts[i - 1] - count) / counts[i - 1]) * 100)
          : 0;
      return { step: i + 1, label: s.label, count, pctOfTotal: pctTotal, dropOffPct: dropOff };
    });

    res.json({ success: true, funnel });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/features ──────────────────────────────────────────────────
// Read-only analytics — NOT feature CRUD.
const getFeatureAnalytics = async (req, res, next) => {
  try {
    const FEATURES = [
      "AI Evaluator", "Notes Auditor", "Timer",
      "Syllabus Tracker", "PYQs", "Mock Tests", "AI Mentor",
    ];

    // GROUP BY feature_name — one SQL round-trip
    const rows = await sequelize.query(
      `SELECT
         feature_name,
         COUNT(*)                        AS total_uses,
         COUNT(DISTINCT user_id)         AS unique_users,
         MAX(created_at)                 AS last_used
       FROM "UserEvents"
       WHERE feature_name IS NOT NULL
       GROUP BY feature_name`,
      { type: QueryTypes.SELECT }
    );

    // For top-3 users per feature we do individual small queries
    const featureMap = {};
    rows.forEach((r) => { featureMap[r.feature_name] = r; });

    const features = await Promise.all(
      FEATURES.map(async (name) => {
        const base = featureMap[name] || { total_uses: 0, unique_users: 0, last_used: null };
        const totalUses   = parseInt(base.total_uses);
        const uniqueUsers = parseInt(base.unique_users);

        // recency score: days since last use (lower = more recent = higher score)
        const daysSince = base.last_used
          ? (Date.now() - new Date(base.last_used)) / 86400000
          : 999;
        const recencyScore = Math.max(0, 100 - daysSince); // 100 = today, 0 = 100+ days

        const engagementScore = parseFloat(
          (uniqueUsers * 0.5 + totalUses * 0.3 + recencyScore * 0.2).toFixed(2)
        );

        const topUsers = await sequelize.query(
          `SELECT u.name, u.email, COUNT(*) AS uses
           FROM "UserEvents" ue
           JOIN "users" u ON u.id = ue.user_id
           WHERE ue.feature_name = :name
           GROUP BY u.id, u.name, u.email
           ORDER BY uses DESC
           LIMIT 3`,
          { replacements: { name }, type: QueryTypes.SELECT }
        );

        return {
          name,
          uniqueUsers,
          totalUses,
          avgUsagePerUser: uniqueUsers > 0
            ? parseFloat((totalUses / uniqueUsers).toFixed(1)) : 0,
          lastUsed: base.last_used || null,
          engagementScore,
          topUsers,
        };
      })
    );

    // Sort by engagementScore desc
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
      `SELECT
         ue.id, ue.event_type, ue.feature_name, ue.metadata, ue.created_at,
         u.name AS user_name
       FROM "UserEvents" ue
       LEFT JOIN "users" u ON u.id = ue.user_id
       ORDER BY ue.created_at DESC
       LIMIT 50`,
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
    const totalUsers = await User.count({ where: { role: "user" } });

    // D1 / D7 / D30 — count users who fired ANY event after day N of signup
    const retentionQuery = (days) => sequelize.query(
      `SELECT COUNT(DISTINCT ue.user_id) AS cnt
       FROM "UserEvents" ue
       JOIN "users" u ON u.id = ue.user_id
       WHERE u.role = 'user'
         AND ue.created_at >= u.created_at + INTERVAL '1 day'
         AND ue.created_at <= u.created_at + INTERVAL '${days + 1} days'`,
      { type: QueryTypes.SELECT }
    ).then(r => parseInt(r[0]?.cnt || 0));

    const [d1Count, d7Count, d30Count] = await Promise.all([
      retentionQuery(1),
      retentionQuery(7),
      retentionQuery(30),
    ]);

    const pct = (n) => totalUsers > 0 ? Math.round((n / totalUsers) * 100) : 0;

    // ── Weekly cohort table ──────────────────────────────────────────────────
    // rows = signup week, columns = Week 0 retained / Week 1 / Week 2 / Week 3
    const cohortRows = await sequelize.query(
      `WITH cohorts AS (
         SELECT
           id AS user_id,
           DATE_TRUNC('week', created_at) AS cohort_week
         FROM "users"
         WHERE role = 'user'
       ),
       activity AS (
         SELECT
           ue.user_id,
           DATE_TRUNC('week', ue.created_at) AS active_week
         FROM "UserEvents" ue
         GROUP BY ue.user_id, DATE_TRUNC('week', ue.created_at)
       )
       SELECT
         TO_CHAR(c.cohort_week, 'YYYY-MM-DD')     AS cohort_week,
         COUNT(DISTINCT c.user_id)                  AS cohort_size,
         COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week                    THEN c.user_id END) AS week0,
         COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '7d'   THEN c.user_id END) AS week1,
         COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '14d'  THEN c.user_id END) AS week2,
         COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '21d'  THEN c.user_id END) AS week3
       FROM cohorts c
       LEFT JOIN activity a ON a.user_id = c.user_id
       GROUP BY c.cohort_week
       ORDER BY c.cohort_week DESC
       LIMIT 8`,
      { type: QueryTypes.SELECT }
    );

    // Convert raw counts to percentages of cohort_size
    const cohort = cohortRows.map((r) => ({
      cohortWeek: r.cohort_week,
      cohortSize: parseInt(r.cohort_size),
      week0: r.cohort_size > 0 ? Math.round((r.week0 / r.cohort_size) * 100) : 0,
      week1: r.cohort_size > 0 ? Math.round((r.week1 / r.cohort_size) * 100) : 0,
      week2: r.cohort_size > 0 ? Math.round((r.week2 / r.cohort_size) * 100) : 0,
      week3: r.cohort_size > 0 ? Math.round((r.week3 / r.cohort_size) * 100) : 0,
    }));

    // ── Churn risk list ───────────────────────────────────────────────────────
    // last_active isn't a stored column anywhere — derive it as the most
    // recent UserEvents row per user.
    const churnList = await sequelize.query(
      `SELECT
         u.id, u.name, u.email, u.streak,
         ev.last_active
       FROM "users" u
       LEFT JOIN (
         SELECT user_id, MAX(created_at) AS last_active
         FROM "UserEvents"
         GROUP BY user_id
       ) ev ON ev.user_id = u.id
       WHERE u.role = 'user'
         AND (ev.last_active IS NULL OR ev.last_active < NOW() - INTERVAL '7 days')
       ORDER BY ev.last_active ASC NULLS FIRST
       LIMIT 20`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      retention: {
        d1: pct(d1Count),
        d7: pct(d7Count),
        d30: pct(d30Count),
      },
      cohort,
      churnList,
    });
  } catch (err) {
    next(err);
  }
};
// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only allow deleting role=user — protects admin accounts
    const target = await User.findOne({ where: { id, role: "user" } });
    if (!target)
      return res.status(404).json({ success: false, error: "User not found or not deletable." });

    // Cascade: wipe dependent rows first to avoid FK constraint errors
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
// Internal — called by app code to record a user action.
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
  getMetrics,
  listUsers,
  getFunnel,
  getFeatureAnalytics,
  getActivity,
  getRetention,
  recordEvent,
  deleteUser,
};