const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const getLeaderboard = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));

    const SORTABLE = {
      streak:    "longest_streak", // all-time best streak, not the resettable current one
      hours:     "total_study_hours",
      mains:     "mains_evaluations",
      accuracy:  "avg_test_accuracy",
      composite: "composite_score",
    };
    const sortKey = SORTABLE[req.query.sort] ? req.query.sort : "composite";
    const sortCol = SORTABLE[sortKey];

    const yearRaw = req.query.year;
    const year = yearRaw && yearRaw !== "all" ? parseInt(yearRaw, 10) : null;
    const yearFilter = year && !isNaN(year) ? `AND u.target_year = :year` : "";

    const search = (req.query.search || "").trim();

    const rows = await sequelize.query(
      `WITH answers_agg AS (
         SELECT user_id, jsonb_array_length(COALESCE(answers, '[]'::jsonb)) AS mains_evaluations
         FROM user_data
       ),
       study_agg AS (
         SELECT ud.user_id, SUM((log->>'hours')::float) AS total_hours
         FROM user_data ud
         CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ud.daily_logs, '[]'::jsonb)) AS log
         GROUP BY ud.user_id
       ),
       test_agg AS (
         SELECT user_id,
           COUNT(*)        AS tests_attempted,
           AVG(accuracy)   AS avg_accuracy
         FROM test_attempts
         GROUP BY user_id
       ),
       ranked AS (
         SELECT
           u.id,
           u.name,
           u.target_year,
           u.streak,
           u.longest_streak,
           COALESCE(sa.total_hours, 0)::numeric(10,1)      AS total_study_hours,
           COALESCE(aa.mains_evaluations, 0)                AS mains_evaluations,
           COALESCE(ta.tests_attempted, 0)                  AS tests_attempted,
           COALESCE(ta.avg_accuracy, 0)::numeric(10,1)       AS avg_test_accuracy,
           (
             LEAST(u.streak / 60.0, 1) * 25 +
             LEAST(COALESCE(sa.total_hours, 0) / 100.0, 1) * 25 +
             LEAST(COALESCE(aa.mains_evaluations, 0) / 20.0, 1) * 20 +
             LEAST(COALESCE(ta.avg_accuracy, 0) / 100.0, 1) * 30
           )::numeric(10,2) AS composite_score
         FROM "users" u
         LEFT JOIN answers_agg aa ON aa.user_id = u.id
         LEFT JOIN study_agg   sa ON sa.user_id = u.id
         LEFT JOIN test_agg    ta ON ta.user_id = u.id
         WHERE u.role = 'user' ${yearFilter}
       )
       SELECT *, ROW_NUMBER() OVER (ORDER BY ${sortCol} DESC, composite_score DESC, name ASC) AS rank
       FROM ranked
       ORDER BY rank ASC`,
      {
        replacements: year ? { year } : {},
        type: QueryTypes.SELECT,
      }
    );

    // Search narrows the visible set but keeps each row's rank as computed
    // against the full (year-filtered) leaderboard above, so "rank" stays honest.
    const filteredRows = search
      ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
      : rows;

    const total = filteredRows.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const pageRows = filteredRows.slice(start, start + limit);

    const meRow = req.user?.id ? rows.find((r) => r.id === req.user.id) : null;

    const shape = (r) => ({
      id: r.id,
      name: r.name,
      target_year: r.target_year,
      rank: parseInt(r.rank, 10),
      streak: r.streak,
      longest_streak: r.longest_streak,
      total_study_hours: parseFloat(r.total_study_hours),
      mains_evaluations: parseInt(r.mains_evaluations, 10),
      tests_attempted: parseInt(r.tests_attempted, 10),
      avg_test_accuracy: parseFloat(r.avg_test_accuracy),
      composite_score: parseFloat(r.composite_score),
    });

    // Only years that actually have at least one student, for the filter dropdown.
    const yearRows = await sequelize.query(
      `SELECT DISTINCT u.target_year
       FROM "users" u
       WHERE u.role = 'user' AND u.target_year IS NOT NULL
       ORDER BY u.target_year ASC`,
      { type: QueryTypes.SELECT }
    );
    const availableYears = yearRows.map((r) => r.target_year);

    res.json({
      success: true,
      sortBy: sortKey,
      year: year || "all",
      search,
      page,
      pages,
      total,
      leaderboard: pageRows.map(shape),
      me: meRow ? shape(meRow) : null,
      availableYears,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard };