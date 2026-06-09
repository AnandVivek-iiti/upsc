const { Op, fn, col, literal } = require("sequelize");
const User      = require("../models/User");
const UserData  = require("../models/UserData").UserData ?? require("../models/UserData");
const Feature   = require("../models/Feature");
// VisitorLog is optional — only used if you have that table
let VisitorLog;
try { VisitorLog = require("../models/VisitorLog"); } catch { VisitorLog = null; }

// ─── GET /api/admin/metrics ───────────────────────────────────────────────────
const getMetrics = async (req, res, next) => {
  try {
    // Sequelize count with where clause
    const totalUsers  = await User.count({ where: { role: "user" } });
    const totalAdmins = await User.count({ where: { role: "admin" } });

    // Count answers across all UserData rows
    // answers is a JSONB array column; easiest to pull all and sum lengths
    const allUserData = await UserData.findAll({ attributes: ["answers"] });
    const totalEvaluations = allUserData.reduce(
      (acc, ud) => acc + (Array.isArray(ud.answers) ? ud.answers.length : 0),
      0
    );

    // Active users — have a daily_log entry in the last 7 days
    // daily_logs is JSONB; do a JS-side filter
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString().split("T")[0];

    const allUD = await UserData.findAll({ attributes: ["daily_logs"] });
    const activeUsers = allUD.filter((ud) =>
      (ud.daily_logs || []).some((l) => l.date >= cutoff && l.hours > 0)
    ).length;

    // Visitor logs (optional feature)
    let trafficData = { totalHits: 0, totalDistinctVisitors: 0, dailyBreakdown: [] };
    if (VisitorLog) {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

        const visitorLogs = await VisitorLog.findAll({
          where: { date: { [Op.gte]: dateStr } },
          order: [["date", "ASC"]],
          attributes: ["date", "hits", "distinct_visitors"],
        });

        trafficData = {
          totalHits: visitorLogs.reduce((a, l) => a + (l.hits || 0), 0),
          totalDistinctVisitors: visitorLogs.reduce((a, l) => a + (l.distinct_visitors || 0), 0),
          dailyBreakdown: visitorLogs.map((l) => ({
            date: l.date,
            hits: l.hits,
            distinct_visitors: l.distinct_visitors,
          })),
        };
      } catch { /* VisitorLog table may not exist yet */ }
    }

    res.json({
      success: true,
      metrics: {
        users: { total: totalUsers, admins: totalAdmins, activeLastWeek: activeUsers },
        ai: { totalEvaluations },
        traffic: trafficData,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
const listUsers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { count: total, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/features ──────────────────────────────────────────────────
const getFeatures = async (req, res, next) => {
  try {
    const features = await Feature.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, features });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/features ─────────────────────────────────────────────────
const createFeature = async (req, res, next) => {
  try {
    const { featureName, description, path, isActive } = req.body;

    if (!featureName?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        error: "featureName and description are required.",
      });
    }

    const feature = await Feature.create({
      featureName: featureName.trim(),
      description: description.trim(),
      path: path?.trim() || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, feature });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/admin/features/:id ───────────────────────────────────────────
const updateFeature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { featureName, description, path, isActive } = req.body;

    // Sequelize: findByPk for UUID/integer PK
    const feature = await Feature.findByPk(id);
    if (!feature) {
      return res.status(404).json({ success: false, error: "Feature not found." });
    }

    if (featureName !== undefined) feature.featureName = featureName.trim();
    if (description !== undefined) feature.description = description.trim();
    if (path        !== undefined) feature.path        = path?.trim() || null;
    if (isActive    !== undefined) feature.isActive    = isActive;

    await feature.save();
    res.json({ success: true, feature });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/admin/features/:id ──────────────────────────────────────────
const deleteFeature = async (req, res, next) => {
  try {
    // Sequelize: findByPk then destroy()
    const feature = await Feature.findByPk(req.params.id);
    if (!feature) {
      return res.status(404).json({ success: false, error: "Feature not found." });
    }
    const name = feature.featureName;
    await feature.destroy();
    res.json({ success: true, message: `Feature "${name}" deleted.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMetrics, listUsers, getFeatures, createFeature, updateFeature, deleteFeature };