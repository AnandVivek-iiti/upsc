const { sequelize } = require("../config/db");
const Feedback = require("../models/Feedback");
const User = require("../models/User");
const { Op } = require("sequelize");
// ─── Submit feedback ────────────────────────────────────────────────────────
exports.submitFeedback = async (req, res) => {
  try {
    const {
      rating,
      feature,
      feedbackText,
      wouldRecommend,
      trigger,
      allowReply,
      metadata,
    } = req.body;

    const userId = req.user?.id || null;
    const userEmail = req.user?.email || null;

    const feedback = await Feedback.create({
      userId,
      rating,
      feature: feature || "general",
      feedbackText,
      wouldRecommend,
      trigger,
      allowReply: !!allowReply,
      userEmail,
      userAgent: req.headers["user-agent"],
      metadata: metadata || {},
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.error("Feedback submit error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Admin stats ────────────────────────────────────────────────────────────
exports.getAdminStats = async (req, res) => {
  try {
    const total = await Feedback.count();
    const avgRating = await Feedback.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avg"]],
      raw: true,
    });
    const recommendCount = await Feedback.count({
      where: { wouldRecommend: true },
    });

    // Feature satisfaction
    const featureStats = await Feedback.findAll({
      attributes: [
        "feature",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
      ],
      group: ["feature"],
      order: [[sequelize.fn("AVG", sequelize.col("rating")), "DESC"]],
      raw: true,
    });
    // "Most requested features" has no dedicated field to aggregate yet —
    // feature requests currently live inside free-text feedbackText, not a
    // structured column. Returning an empty list (rather than fabricated
    // numbers) until there's a real field/tagging step to compute this from.
    const mostRequested = [];

    res.json({
      success: true,
      stats: {
        total,
        avgRating: avgRating?.avg || 0,
        recommendCount,
        recommendRate: total ? Math.round((recommendCount / total) * 100) : 0,
        featureStats,
        mostRequested,
      },
    });
  } catch (error) {
    console.error("Admin feedback stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Admin delete ───────────────────────────────────────────────────────────
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ success: false, error: "Feedback not found." });
    }

    await feedback.destroy();

    res.json({ success: true, id });
  } catch (error) {
    console.error("Admin feedback delete error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getAdminList = async (req, res) => {
  try {
    const { page = 1, limit = 20, feature, rating, sort = "createdAt:desc" } = req.query;

    const where = {};
    if (feature) where.feature = feature;
    if (rating) where.rating = rating;

    const [sortField, sortOrder] = sort.split(":");
    const order = [[sortField, sortOrder.toUpperCase()]];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Feedback.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order,
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      feedback: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Admin feedback list error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};