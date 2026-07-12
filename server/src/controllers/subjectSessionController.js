const { Op, fn, col, literal } = require("sequelize");
const { sequelize } = require("../config/db");
const { getISTDateString } = require("../utils/dateUtils");
const { UserData } = require("../models/UserData");
const User = require("../models/User");
const SubjectSession = require("../models/SubjectSession");
const trackEvent = require("../utils/trackEvent");

const EXCL_NAMES = ["admin", "anand vivek"];
const EXCL_SQL = EXCL_NAMES.map((n) => `'${n}'`).join(", ");
const EXCL_UID_COND = `user_id NOT IN (SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL}))`;
const MAX_SESSION_SECONDS = 4 * 60 * 60;

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
async function addSubjectSessionToDailyLog(userId, dateStr, sessionSeconds) {
  if (!sessionSeconds || sessionSeconds <= 0) return;

  const userData = await UserData.findOne({ where: { user_id: userId } });
  if (!userData) return;

  const logs = Array.isArray(userData.daily_logs) ? [...userData.daily_logs] : [];
  const idx = logs.findIndex((l) => l.date === dateStr);
  const addedHours = Math.round((sessionSeconds / 3600) * 100) / 100;
  const isNewDay = idx < 0;

  if (idx >= 0) {
    logs[idx] = { ...logs[idx], hours: Math.round(((logs[idx].hours || 0) + addedHours) * 100) / 100 };
  } else {
    logs.push({ date: dateStr, hours: addedHours, notes: "", logged_at: new Date().toISOString() });
  }

  userData.daily_logs = logs;
  userData.changed("daily_logs", true);
  await userData.save();

  // mirror the streak logic from dashboardController's logStudyHours - only on a fresh day with real hours
  if (isNewDay) {
    const user = await User.findByPk(userId);
    if (user) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yDate = getISTDateString(yesterday);
      const hadYesterday = logs.some((l) => l.date === yDate && l.hours > 0);
      user.streak = hadYesterday ? (user.streak || 0) + 1 : 1;
      if (user.streak > (user.longest_streak || 0)) user.longest_streak = user.streak;
      await user.save();
    }
  }
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
    { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
    { stage: "mains", paper: "GS1", module: "Indian Art, Culture & Architecture" },
    { stage: "mains", paper: "GS1", module: "Modern Indian History" },
    { stage: "mains", paper: "GS1", module: "Freedom Struggle" },
    { stage: "mains", paper: "GS1", module: "Post-Independence India" },
    { stage: "mains", paper: "GS1", module: "World History" },
  ],
  Polity: [
    { stage: "prelims", paper: "GS1", module: "Indian Polity & Governance" },
    { stage: "mains", paper: "GS2", module: "Indian Constitution" },
    { stage: "mains", paper: "GS2", module: "Federal Structure" },
    { stage: "mains", paper: "GS2", module: "Separation of Powers & Institutions" },
    { stage: "mains", paper: "GS2", module: "Legislature" },
    { stage: "mains", paper: "GS2", module: "Executive & Judiciary" },
    { stage: "mains", paper: "GS2", module: "Constitutional & Statutory Bodies" },
    { stage: "mains", paper: "GS2", module: "Governance & Accountability" },
  ],
  Economy: [
    { stage: "prelims", paper: "GS1", module: "Economic & Social Development" },
    { stage: "mains", paper: "GS3", module: "Indian Economy" },
    { stage: "mains", paper: "GS3", module: "Agriculture" },
    { stage: "mains", paper: "GS3", module: "Food Processing & Industry" },
    { stage: "mains", paper: "GS3", module: "Infrastructure & Investment" },
  ],
  Geography: [
    { stage: "prelims", paper: "GS1", module: "Indian & World Geography" },
    { stage: "mains", paper: "GS1", module: "World Physical Geography" },
    { stage: "mains", paper: "GS1", module: "Geophysical Phenomena" },
  ],
  Environment: [
    { stage: "prelims", paper: "GS1", module: "Environment, Ecology & Climate Change" },
    { stage: "mains", paper: "GS3", module: "Environment & Disaster Management" },
  ],
  "Science & Tech": [
    { stage: "prelims", paper: "GS1", module: "General Science" },
    { stage: "mains", paper: "GS3", module: "Science & Technology" },
  ],
  CSAT: [
    { stage: "prelims", paper: "CSAT", module: "Comprehension" },
    { stage: "prelims", paper: "CSAT", module: "Interpersonal & Communication Skills" },
    { stage: "prelims", paper: "CSAT", module: "Logical Reasoning & Analytical Ability" },
    { stage: "prelims", paper: "CSAT", module: "Decision Making & Problem Solving" },
    { stage: "prelims", paper: "CSAT", module: "General Mental Ability" },
    { stage: "prelims", paper: "CSAT", module: "Basic Numeracy & Data Interpretation" },
  ],
  Ethics: [
    { stage: "mains", paper: "GS4", module: "Ethics & Human Interface" },
    { stage: "mains", paper: "GS4", module: "Attitude" },
    { stage: "mains", paper: "GS4", module: "Aptitude & Foundational Values" },
    { stage: "mains", paper: "GS4", module: "Emotional Intelligence" },
    { stage: "mains", paper: "GS4", module: "Moral Thinkers & Philosophers" },
    { stage: "mains", paper: "GS4", module: "Public/Civil Service Values & Ethics" },
    { stage: "mains", paper: "GS4", module: "Probity in Governance" },
    { stage: "mains", paper: "GS4", module: "Case Studies" },
  ],
  Essay: [{ stage: "mains", paper: "Essay", module: "Essay Writing" }],
  Optional: [
    { stage: "mains", paper: "OptionalSubject", module: "Optional Subject Paper I" },
    { stage: "mains", paper: "OptionalSubject", module: "Optional Subject Paper II" },
  ],
  };

// ─── POST /api/subject-sessions/start ────────────────────────────────────────
const startSession = async (req, res, next) => {
  try {
    const { subject, notes } = req.body;

    const VALID = [
      "History", "Polity", "Economy", "Geography", "Environment",
      "Science & Tech", "CSAT", "Ethics", "Essay", "Optional",
      "Current Affairs", "Other",
    ];
    if (!VALID.includes(subject)) {
      return res.status(400).json({
        success: false,
        error: `Invalid subject. Must be one of: ${VALID.join(", ")}`,
      });
    }

    const now = Date.now();
    const dateStr = getISTDateString();
  const staleOpen = await SubjectSession.findAll({ where: { user_id: req.user.id, end_time: null } });
    for (const stale of staleOpen) {
      const rawSeconds = Math.max(0, Math.round((now - Number(stale.start_time)) / 1000));
      const duration_seconds = Math.min(rawSeconds, MAX_SESSION_SECONDS);
      stale.end_time = now;
      stale.duration_seconds = duration_seconds;
      await stale.save();
      addSubjectSessionToDailyLog(req.user.id, stale.date, duration_seconds).catch(() => {});
    }

    const session = await SubjectSession.create({
      user_id: req.user.id,
      subject,
      date: dateStr,
      start_time: now,
      end_time: null,
      duration_seconds: null,
      notes: notes?.trim() || null,
    });

    trackEvent(req.user.id, "timer_start", "Subject Study Timer", { subject }).catch(() => {});

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
      return res.status(404).json({ success: false, error: "Session not found." });
    }
    if (session.end_time) {
      return res.status(409).json({ success: false, error: "Session already closed." });
    }

    const now = Date.now();
    const rawSeconds = Math.max(0, Math.round((now - Number(session.start_time)) / 1000));
    const duration_seconds = Math.min(rawSeconds, MAX_SESSION_SECONDS);

    session.end_time = now;
    session.duration_seconds = duration_seconds;
    if (req.body?.notes) session.notes = req.body.notes.trim();
    await session.save();

    addSubjectSessionToDailyLog(req.user.id, session.date, duration_seconds).catch(() => {});

    return res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/subject-sessions/:id/notes ───────────────────────────────────
// Lightweight, standalone note attach - used by the "didn't cover any of
// these? add a quick note" fallback in the syllabus-sync confirm modal.
// Deliberately separate from `end` (which 409s once a session is closed) so
// a note can be attached after the session has already ended.
const updateSessionNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, error: "notes is required." });
    }

    const session = await SubjectSession.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found." });
    }

    session.notes = notes.trim().slice(0, 500);
    await session.save();

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

    const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

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

    const where = { user_id: req.user.id, duration_seconds: { [Op.not]: null } };
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
      percentage: grandTotal > 0 ? Math.round((Number(r.total_seconds) / grandTotal) * 100) : 0,
    }));

    const most_studied = distribution[0] || null;
    const least_studied = distribution.length > 1 ? distribution[distribution.length - 1] : null;

    const weekRange = periodRange("week");
    const monthRange = periodRange("month");

    const [weekRows, monthRows] = await Promise.all([
      SubjectSession.findAll({
        where: {
          user_id: req.user.id,
          date: { [Op.between]: [weekRange.start, weekRange.end] },
          duration_seconds: { [Op.not]: null },
        },
        attributes: ["subject", [fn("SUM", col("duration_seconds")), "total_seconds"]],
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
        attributes: ["subject", [fn("SUM", col("duration_seconds")), "total_seconds"]],
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
        { type: "session_start", subject: s.subject, time: Number(s.start_time), date: s.date, label: `Started ${s.subject}` },
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

    const whereSession = { duration_seconds: { [Op.not]: null }, [Op.and]: sequelize.literal(EXCL_UID_COND) };
    if (range) whereSession.date = { [Op.between]: [range.start, range.end] };

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

    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "name", "email"],
      raw: true,
    });
    const userMap = {};
    for (const u of users) userMap[u.id] = u;

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
      const subs = (subjectByUser[r.user_id] || []).sort((a, b) => b.seconds - a.seconds);
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

    return res.json({ success: true, period, users: result, total: totalCount, limit, offset });
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

    const whereSession = { duration_seconds: { [Op.not]: null }, [Op.and]: sequelize.literal(EXCL_UID_COND) };
    if (range) whereSession.date = { [Op.between]: [range.start, range.end] };

    const [subjectTotals, platformTotals, topUsers, consistentRows, dailyActivity] = await Promise.all([
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
      SubjectSession.findAll({
        where: whereSession,
        attributes: ["user_id", [fn("COUNT", fn("DISTINCT", col("date"))), "study_days"]],
        group: ["user_id"],
        having: literal("COUNT(DISTINCT date) >= 5"),
        order: [[literal("study_days"), "DESC"]],
        raw: true,
      }),
      SubjectSession.findAll({
        where: {
          duration_seconds: { [Op.not]: null },
          [Op.and]: sequelize.literal(EXCL_UID_COND),
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
        avg_hours_per_user: toHours(Math.round((Number(pt.total_seconds) || 0) / activeUsers)),
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
      consistent_studiers: consistentRows.map((r) => ({ user_id: r.user_id, study_days: Number(r.study_days) })),
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
  updateSessionNotes,
  adminUserBreakdown,
  adminGlobalInsights,
  SUBJECT_SYLLABUS_MAP,
};