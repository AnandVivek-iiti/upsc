const { Feedback, User } = require("../models/Feedback");
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
  const mostRequested = [
      { feature: "Daily Revision Reminders", count: 12 },
      { feature: "Voice Notes", count: 8 },
      { feature: "More PYQs", count: 7 },
      { feature: "Offline Mode", count: 5 },
      { feature: "Mobile App", count: 4 },
    ]; // this could be computed later

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

// ─── Admin list (with filters) ─────────────────────────────────────────────
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