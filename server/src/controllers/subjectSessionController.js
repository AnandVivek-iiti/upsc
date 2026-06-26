const { Op, fn, col, literal } = require("sequelize");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { getISTDateString } = require("../utils/dateUtils");
const { UserData } = require("../models/UserData"); // default export
const User = require("../models/User");
const trackEvent = require("../utils/trackEvent");

// ─── Model (defined once here; also exported for server.js sync) ──────────────
const SubjectSession = sequelize.define(
  "SubjectSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    subject: {
      type: DataTypes.ENUM(
        "History",
        "Polity",
        "Economy",
        "Geography",
        "Environment",
        "Science & Tech",
        "CSAT",
        "Ethics",
        "Essay",
        "Optional",
        "Current Affairs",
        "Other",
      ),
      allowNull: false,
    },
    // IST date "YYYY-MM-DD" for fast per-day group-bys
    date: { type: DataTypes.DATEONLY, allowNull: false },
    // Epoch ms as BIGINT - no precision loss
    start_time: { type: DataTypes.BIGINT, allowNull: false },
    end_time: { type: DataTypes.BIGINT, allowNull: true }, // null = running
    duration_seconds: { type: DataTypes.INTEGER, allowNull: true },
    notes: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    tableName: "subject_sessions",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["user_id", "date"] },
      { fields: ["subject"] },
      { fields: ["created_at"] },
    ],
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDisplay(secs) {
  if (!secs) return "0m";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function toHours(secs) {
  return Math.round((secs / 3600) * 100) / 100;
}

function periodRange(period) {
  const today = getISTDateString();
  if (period === "day") return { start: today, end: today };
  if (period === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return { start: getISTDateString(d), end: today };
  }
  if (period === "month") {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return { start: getISTDateString(d), end: today };
  }
  return null;
}

const SUBJECT_SYLLABUS_MAP = {
  History: [
    // Prelims GS1 - History section
    {
      stage: "prelims",
      paper: "GS1",
      module: "History of India & Indian National Movement",
    },
    // Mains GS1 - Multiple history modules; we nudge the most directly relevant
    { stage: "mains", paper: "GS1", module: "Modern Indian History" },
    { stage: "mains", paper: "GS1", module: "Freedom Struggle" },
  ],

  Polity: [
    { stage: "prelims", paper: "GS1", module: "Indian Polity & Governance" },
    { stage: "mains", paper: "GS2", module: "Indian Constitution" },
    { stage: "mains", paper: "GS2", module: "Federal Structure" },
  ],

  Economy: [
    { stage: "prelims", paper: "GS1", module: "Economic & Social Development" },
    { stage: "mains", paper: "GS3", module: "Indian Economy" },
  ],

  Geography: [
    { stage: "prelims", paper: "GS1", module: "Indian & World Geography" },
    { stage: "mains", paper: "GS1", module: "World Physical Geography" },
    { stage: "mains", paper: "GS1", module: "Geophysical Phenomena" },
  ],

  Environment: [
    {
      stage: "prelims",
      paper: "GS1",
      module: "Environment, Ecology & Climate Change",
    },
    {
      stage: "mains",
      paper: "GS3",
      module: "Environment & Disaster Management",
    },
  ],

  "Science & Tech": [
    { stage: "prelims", paper: "GS1", module: "General Science" },
    { stage: "mains", paper: "GS3", module: "Science & Technology" },
  ],

  CSAT: [
    { stage: "prelims", paper: "CSAT", module: "Comprehension" },
    {
      stage: "prelims",
      paper: "CSAT",
      module: "Logical Reasoning & Analytical Ability",
    },
    {
      stage: "prelims",
      paper: "CSAT",
      module: "Basic Numeracy & Data Interpretation",
    },
  ],

  Ethics: [
    { stage: "mains", paper: "GS4", module: "Ethics & Human Interface" },
    {
      stage: "mains",
      paper: "GS4",
      module: "Public/Civil Service Values & Ethics",
    },
  ],

  Essay: [{ stage: "mains", paper: "Essay", module: "Essay Writing" }],

  Optional: [
    {
      stage: "mains",
      paper: "OptionalSubject",
      module: "Optional Subject Paper I",
    },
    {
      stage: "mains",
      paper: "OptionalSubject",
      module: "Optional Subject Paper II",
    },
  ],

  // Current Affairs and Other don't map cleanly to specific syllabus modules;
  // they're cross-cutting. Adding them would produce misleading progress nudges.
  // Feature 5 extension: if you want CA to nudge "Current Events" in prelims,
  // uncomment below:
  // "Current Affairs": [{ stage: "prelims", paper: "GS1", module: "Current Events" }],
};

// ─── POST /api/subject-sessions/start ────────────────────────────────────────
const startSession = async (req, res, next) => {
  try {
    const { subject, notes } = req.body;

    const VALID = [
      "History",
      "Polity",
      "Economy",
      "Geography",
      "Environment",
      "Science & Tech",
      "CSAT",
      "Ethics",
      "Essay",
      "Optional",
      "Current Affairs",
      "Other",
    ];
    if (!VALID.includes(subject)) {
      return res.status(400).json({
        success: false,
        error: `Invalid subject. Must be one of: ${VALID.join(", ")}`,
      });
    }

    const now = Date.now();
    const dateStr = getISTDateString();

   await SubjectSession.update(
  {
    end_time: now,
    duration_seconds: literal(`GREATEST(0, ROUND((${now} - "start_time") / 1000.0))::integer`),
  },
  { where: { user_id: req.user.id, end_time: null } }
);
    const session = await SubjectSession.create({
      user_id: req.user.id,
      subject,
      date: dateStr,
      start_time: now,
      end_time: null,
      duration_seconds: null,
      notes: notes?.trim() || null,
    });

    // Track the event (fire-and-forget)
    trackEvent(req.user.id, "timer_start", "Subject Study Timer", {
      subject,
    }).catch(() => {});

    return res.status(201).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/subject-sessions/:id/end ─────────────────────────────────────
const endSession = async (req, res, next) => {
  try {
    const session = await SubjectSession.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found." });
    }
    if (session.end_time) {
      return res
        .status(409)
        .json({ success: false, error: "Session already closed." });
    }

    const now = Date.now();
    const duration_seconds = Math.max(
      0,
      Math.round((now - Number(session.start_time)) / 1000),
    );

    session.end_time = now;
    session.duration_seconds = duration_seconds;
    if (req.body?.notes) session.notes = req.body.notes.trim();
    await session.save();

    // Feature 5: fire-and-forget syllabus nudge on every session close
    nudgeSyllabusProgress(req.user.id, session.subject, duration_seconds).catch(
      () => {},
    );

    return res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/subject-sessions/today (Feature 6) ─────────────────────────────
const getTodaySessions = async (req, res, next) => {
  try {
    const today = getISTDateString();
    const sessions = await SubjectSession.findAll({
      where: { user_id: req.user.id, date: today },
      order: [["start_time", "ASC"]],
    });

    // Build Feature 8 timeline entries from today's sessions
    const timeline = [];
    for (const s of sessions) {
      timeline.push({
        type: "session_start",
        subject: s.subject,
        time: Number(s.start_time),
        label: `Started ${s.subject} session`,
      });
      if (s.end_time) {
        timeline.push({
          type: "session_end",
          subject: s.subject,
          time: Number(s.end_time),
          duration: s.duration_seconds,
          label: `Ended ${s.subject} session · ${fmtDisplay(s.duration_seconds)}`,
        });
      }
    }
    timeline.sort((a, b) => a.time - b.time);

    const totalSeconds = sessions.reduce(
      (acc, s) => acc + (s.duration_seconds || 0),
      0,
    );

    return res.json({
      success: true,
      sessions: sessions.map((s) => ({
        ...s.toJSON(),
        display: fmtDisplay(s.duration_seconds),
        started_at: s.start_time,
      })),
      timeline,
      total_seconds: totalSeconds,
      total_display: fmtDisplay(totalSeconds),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/subject-sessions/analytics (Features 3 & 4) ────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const period = req.query.period || "lifetime";
    const range = periodRange(period);

    const where = {
      user_id: req.user.id,
      duration_seconds: { [Op.not]: null },
    };
    if (range) where.date = { [Op.between]: [range.start, range.end] };

    const rows = await SubjectSession.findAll({
      where,
      attributes: [
        "subject",
        [fn("SUM", col("duration_seconds")), "total_seconds"],
        [fn("COUNT", col("id")), "session_count"],
      ],
      group: ["subject"],
      order: [[literal("total_seconds"), "DESC"]],
      raw: true,
    });

    const grandTotal = rows.reduce((s, r) => s + Number(r.total_seconds), 0);
    const distribution = rows.map((r) => ({
      subject: r.subject,
      total_seconds: Number(r.total_seconds),
      session_count: Number(r.session_count),
      display: fmtDisplay(Number(r.total_seconds)),
      percentage:
        grandTotal > 0
          ? Math.round((Number(r.total_seconds) / grandTotal) * 100)
          : 0,
    }));

    const most_studied = distribution[0] || null;
    const least_studied =
      distribution.length > 1 ? distribution[distribution.length - 1] : null;

    // Always pull week + month top regardless of selected period (Feature 4)
    const weekRange = periodRange("week");
    const monthRange = periodRange("month");

    const [weekRows, monthRows] = await Promise.all([
      SubjectSession.findAll({
        where: {
          user_id: req.user.id,
          date: { [Op.between]: [weekRange.start, weekRange.end] },
          duration_seconds: { [Op.not]: null },
        },
        attributes: [
          "subject",
          [fn("SUM", col("duration_seconds")), "total_seconds"],
        ],
        group: ["subject"],
        order: [[literal("total_seconds"), "DESC"]],
        limit: 1,
        raw: true,
      }),
      SubjectSession.findAll({
        where: {
          user_id: req.user.id,
          date: { [Op.between]: [monthRange.start, monthRange.end] },
          duration_seconds: { [Op.not]: null },
        },
        attributes: [
          "subject",
          [fn("SUM", col("duration_seconds")), "total_seconds"],
        ],
        group: ["subject"],
        order: [[literal("total_seconds"), "DESC"]],
        limit: 3,
        raw: true,
      }),
    ]);

    return res.json({
      success: true,
      period,
      distribution,
      total_seconds: grandTotal,
      total_hours: toHours(grandTotal),
      total_sessions: rows.reduce((s, r) => s + Number(r.session_count), 0),
      insights: {
        most_studied,
        least_studied,
        this_week: weekRows.map((r) => ({
          subject: r.subject,
          total_seconds: Number(r.total_seconds),
          display: fmtDisplay(Number(r.total_seconds)),
        })),
        this_month: monthRows.map((r) => ({
          subject: r.subject,
          total_seconds: Number(r.total_seconds),
          display: fmtDisplay(Number(r.total_seconds)),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/subject-sessions/timeline (Feature 8) ──────────────────────────
const getTimeline = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    const sessions = await SubjectSession.findAll({
      where: { user_id: req.user.id, end_time: { [Op.not]: null } },
      order: [["start_time", "DESC"]],
      limit,
      offset,
    });

    const events = [];
    for (const s of sessions) {
      events.push(
        {
          type: "session_start",
          subject: s.subject,
          time: Number(s.start_time),
          date: s.date,
          label: `Started ${s.subject}`,
        },
        {
          type: "session_end",
          subject: s.subject,
          time: Number(s.end_time),
          date: s.date,
          duration: s.duration_seconds,
          label: `Ended ${s.subject} · ${fmtDisplay(s.duration_seconds)}`,
        },
      );
    }
    events.sort((a, b) => b.time - a.time);

    return res.json({ success: true, events, offset, limit });
  } catch (err) {
    next(err);
  }
};
async function nudgeSyllabusProgress(userId, subject, durationSeconds) {
  const mappings = SUBJECT_SYLLABUS_MAP[subject];
  if (!mappings || mappings.length === 0) return;

  const minutesStudied = Math.floor(durationSeconds / 60);
  if (minutesStudied < 5) return;

  const progressGain = Math.min(minutesStudied * 0.15, 10);

  const userData = await UserData.findOne({ where: { user_id: userId } });
  if (!userData) return;

  const sp = userData.syllabus_progress
    ? JSON.parse(JSON.stringify(userData.syllabus_progress))
    : {};

  let changed = false;
  for (const { stage, paper, module: mod } of mappings) {
    if (!sp[stage]) sp[stage] = {};
    if (!sp[stage][paper]) sp[stage][paper] = {};
    if (!sp[stage][paper][mod])
      sp[stage][paper][mod] = { progress: 0, state: "pending" };

    const current = sp[stage][paper][mod].progress || 0;
    const next = Math.min(95, current + progressGain);
    if (next > current) {
      sp[stage][paper][mod].progress = Math.round(next * 10) / 10;
      if (sp[stage][paper][mod].state === "pending") {
        sp[stage][paper][mod].state = "progress";
      }
      changed = true;
    }
  }

  if (changed) {
    userData.syllabus_progress = sp;
    userData.changed("syllabus_progress", true);
    await userData.save();
  }
}

// ─── POST /api/subject-sessions/sync-syllabus (Feature 5 manual) ─────────────
/**
 * Re-computes syllabus progress from lifetime study hours.
 * Safe to call multiple times - uses max(current, computed) so it never
 * downgrades progress the user may have set manually.
 * Formula: 1 hour = 10% progress, capped at 95%.
 */
const syncSyllabus = async (req, res, next) => {
  try {
    const rows = await SubjectSession.findAll({
      where: { user_id: req.user.id, duration_seconds: { [Op.not]: null } },
      attributes: [
        "subject",
        [fn("SUM", col("duration_seconds")), "total_seconds"],
      ],
      group: ["subject"],
      raw: true,
    });

   const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, error: "User data not found." });
    }

    const sp = userData.syllabus_progress
      ? JSON.parse(JSON.stringify(userData.syllabus_progress))
      : {};

    let synced = 0;
    for (const row of rows) {
      const mappings = SUBJECT_SYLLABUS_MAP[row.subject];
      if (!mappings) continue;

      const hoursStudied = Number(row.total_seconds) / 3600;
      const targetProgress = Math.min(
        95,
        Math.round(hoursStudied * 10 * 10) / 10,
      );

      for (const { stage, paper, module: mod } of mappings) {
        if (!sp[stage]) sp[stage] = {};
        if (!sp[stage][paper]) sp[stage][paper] = {};
        if (!sp[stage][paper][mod])
          sp[stage][paper][mod] = { progress: 0, state: "pending" };

        const current = sp[stage][paper][mod].progress || 0;
        if (targetProgress > current) {
          sp[stage][paper][mod].progress = targetProgress;
          if (sp[stage][paper][mod].state === "pending") {
            sp[stage][paper][mod].state = "progress";
          }
          synced++;
        }
      }
    }

    userData.syllabus_progress = sp;
    userData.changed("syllabus_progress", true);
    await userData.save();

    return res.json({
      success: true,
      synced_modules: synced,
      syllabus_progress: sp,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/subject-sessions/admin/users (Feature 7) ───────────────────────
const adminUserBreakdown = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin only." });
    }

    const period = req.query.period || "month";
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const range = periodRange(period);

    const whereSession = { duration_seconds: { [Op.not]: null } };
    if (range) whereSession.date = { [Op.between]: [range.start, range.end] };

    // Step 1: aggregate per user
    const aggRows = await SubjectSession.findAll({
      where: whereSession,
      attributes: [
        "user_id",
        [fn("SUM", col("duration_seconds")), "total_seconds"],
        [fn("COUNT", col("id")), "total_sessions"],
        [fn("AVG", col("duration_seconds")), "avg_session_seconds"],
        [fn("MAX", col("date")), "last_active"],
        [fn("COUNT", fn("DISTINCT", col("date"))), "study_days"],
      ],
      group: ["user_id"],
      order: [[literal("total_seconds"), "DESC"]],
      limit,
      offset,
      raw: true,
    });

    if (aggRows.length === 0) {
      return res.json({ success: true, users: [], period, total: 0 });
    }

    const userIds = aggRows.map((r) => r.user_id);

    // Step 2: user profiles
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "name", "email"],
      raw: true,
    });
    const userMap = {};
    for (const u of users) userMap[u.id] = u;

    // Step 3: subject breakdown per user
    const subjectRows = await SubjectSession.findAll({
      where: { ...whereSession, user_id: { [Op.in]: userIds } },
      attributes: [
        "user_id",
        "subject",
        [fn("SUM", col("duration_seconds")), "total_seconds"],
        [fn("COUNT", col("id")), "session_count"],
      ],
      group: ["user_id", "subject"],
      raw: true,
    });

    const subjectByUser = {};
    for (const r of subjectRows) {
      if (!subjectByUser[r.user_id]) subjectByUser[r.user_id] = [];
      subjectByUser[r.user_id].push({
        subject: r.subject,
        seconds: Number(r.total_seconds),
        session_count: Number(r.session_count),
        display: fmtDisplay(Number(r.total_seconds)),
      });
    }

    const result = aggRows.map((r) => {
      const subs = (subjectByUser[r.user_id] || []).sort(
        (a, b) => b.seconds - a.seconds,
      );
      return {
        user_id: r.user_id,
        name: userMap[r.user_id]?.name || "Unknown",
        email: userMap[r.user_id]?.email || "",
        total_hours: toHours(Number(r.total_seconds)),
        total_sessions: Number(r.total_sessions),
        study_days: Number(r.study_days),
        avg_session_min: Math.round(Number(r.avg_session_seconds) / 60),
        last_active: r.last_active,
        most_studied: subs[0]?.subject || null,
        subject_breakdown: subs,
      };
    });

    const totalCount = await SubjectSession.count({
      where: whereSession,
      distinct: true,
      col: "user_id",
    });

    return res.json({
      success: true,
      period,
      users: result,
      total: totalCount,
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/subject-sessions/admin/global (Feature 9) ──────────────────────
const adminGlobalInsights = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin only." });
    }

    const period = req.query.period || "month";
    const range = periodRange(period);

    const whereSession = { duration_seconds: { [Op.not]: null } };
    if (range) whereSession.date = { [Op.between]: [range.start, range.end] };

    const [
      subjectTotals,
      platformTotals,
      topUsers,
      consistentRows,
      dailyActivity,
    ] = await Promise.all([
      // Most studied subjects platform-wide
      SubjectSession.findAll({
        where: whereSession,
        attributes: [
          "subject",
          [fn("SUM", col("duration_seconds")), "total_seconds"],
          [fn("COUNT", col("id")), "session_count"],
          [fn("COUNT", fn("DISTINCT", col("user_id"))), "user_count"],
        ],
        group: ["subject"],
        order: [[literal("total_seconds"), "DESC"]],
        raw: true,
      }),
      // Platform totals
      SubjectSession.findAll({
        where: whereSession,
        attributes: [
          [fn("SUM", col("duration_seconds")), "total_seconds"],
          [fn("COUNT", col("id")), "total_sessions"],
          [fn("COUNT", fn("DISTINCT", col("user_id"))), "active_users"],
          [fn("AVG", col("duration_seconds")), "avg_session_seconds"],
        ],
        raw: true,
      }),
      // Top 10 users by study hours
      SubjectSession.findAll({
        where: whereSession,
        attributes: [
          "user_id",
          [fn("SUM", col("duration_seconds")), "total_seconds"],
          [fn("COUNT", col("id")), "session_count"],
        ],
        group: ["user_id"],
        order: [[literal("total_seconds"), "DESC"]],
        limit: 10,
        raw: true,
      }),
      // Consistent studiers: ≥ 5 distinct study days in the period
      SubjectSession.findAll({
        where: whereSession,
        attributes: [
          "user_id",
          [fn("COUNT", fn("DISTINCT", col("date"))), "study_days"],
        ],
        group: ["user_id"],
        having: literal("COUNT(DISTINCT date) >= 5"),
        order: [[literal("study_days"), "DESC"]],
        raw: true,
      }),
      // Daily activity last 30 days
      SubjectSession.findAll({
        where: {
          duration_seconds: { [Op.not]: null },
          date: {
            [Op.gte]: (() => {
              const d = new Date();
              d.setDate(d.getDate() - 29);
              return getISTDateString(d);
            })(),
          },
        },
        attributes: [
          "date",
          [fn("COUNT", fn("DISTINCT", col("user_id"))), "active_users"],
          [fn("SUM", col("duration_seconds")), "total_seconds"],
        ],
        group: ["date"],
        order: [["date", "ASC"]],
        raw: true,
      }),
    ]);

    // Hydrate top users with names/emails
    const topUserIds = topUsers.map((r) => r.user_id);
    const topUserRecords = await User.findAll({
      where: { id: { [Op.in]: topUserIds } },
      attributes: ["id", "name", "email"],
      raw: true,
    });
    const topUserMap = {};
    for (const u of topUserRecords) topUserMap[u.id] = u;

    const pt = platformTotals[0] || {};
    const activeUsers = Math.max(Number(pt.active_users) || 1, 1);

    return res.json({
      success: true,
      period,
      platform: {
        total_hours: toHours(Number(pt.total_seconds) || 0),
        total_sessions: Number(pt.total_sessions) || 0,
        active_users: activeUsers,
        avg_hours_per_user: toHours(
          Math.round((Number(pt.total_seconds) || 0) / activeUsers),
        ),
        avg_session_min: Math.round((Number(pt.avg_session_seconds) || 0) / 60),
      },
      subject_distribution: subjectTotals.map((r) => ({
        subject: r.subject,
        total_hours: toHours(Number(r.total_seconds)),
        session_count: Number(r.session_count),
        user_count: Number(r.user_count),
        display: fmtDisplay(Number(r.total_seconds)),
      })),
      top_users: topUsers.map((r) => ({
        user_id: r.user_id,
        name: topUserMap[r.user_id]?.name || "Unknown",
        email: topUserMap[r.user_id]?.email || "",
        total_hours: toHours(Number(r.total_seconds)),
        session_count: Number(r.session_count),
      })),
      consistent_studiers: consistentRows.map((r) => ({
        user_id: r.user_id,
        study_days: Number(r.study_days),
      })),
      daily_activity: dailyActivity.map((r) => ({
        date: r.date,
        active_users: Number(r.active_users),
        total_hours: toHours(Number(r.total_seconds)),
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  SubjectSession,
  startSession,
  endSession,
  getTodaySessions,
  getAnalytics,
  getTimeline,
  syncSyllabus,
  adminUserBreakdown,
  adminGlobalInsights,
  SUBJECT_SYLLABUS_MAP,
};
