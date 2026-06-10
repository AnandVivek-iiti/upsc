const User = require("../models/User");
const { UserData } = require("../models/UserData");

// ─── GET /api/dashboard ────────────────────────────────────────────────────────
// Returns profile + daily logs + answers + spaced_repetition.
// Syllabus is NOT returned — frontend loads it from syllabusData.js
// and only persists progress back via PATCH.
const getUserData = async (req, res, next) => {
  try {
    // req.user.id = UUID set by authMiddleware
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });

    if (!userData) {
      // Auto-seed if missing (edge case: user created before UserData existed)
      await UserData.seedForUser(req.user.id);
      const seeded = await UserData.findOne({ where: { user_id: req.user.id } });
      return buildResponse(res, req.user, seeded);
    }

    return buildResponse(res, req.user, userData);
  } catch (err) {
    next(err);
  }
};

function buildResponse(res, user, userData) {
  return res.json({
    success: true,
    profile: {
      name: user.name,
      email: user.email,
      target_year: user.target_year,
      daily_target_hours: user.daily_target_hours,
      streak: user.streak || 0,
      longest_streak: user.longest_streak || 0,
      examDate: user.exam_date ?? null,
    },
    // syllabus_progress is a plain JSON column: { prelims: {...}, mains: {...} }
    // Each module entry: { progress: number, state: string }
    syllabus_progress: userData.syllabus_progress || {},
    answers: userData.answers || [],
    daily_logs: userData.daily_logs || [],
    spaced_repetition: userData.spaced_repetition || { queue: [] },
  });
}

// ─── PATCH /api/dashboard/syllabus/:stage/:paper/:module ──────────────────────
// Persists only the progress number + state string for a single module.
// The full syllabus structure lives in the frontend (syllabusData.js).
const updateModuleProgress = async (req, res, next) => {
  try {
    const { stage, paper, module: moduleName } = req.params;
    const { progress, state } = req.body;

    const validStages = ["prelims", "mains"];
    const validStates = ["pending", "progress", "revision", "done"];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, error: `Invalid stage. Must be: ${validStages.join(", ")}` });
    }
    if (progress !== undefined && (typeof progress !== "number" || progress < 0 || progress > 100)) {
      return res.status(400).json({ success: false, error: "progress must be a number 0–100." });
    }
    if (state && !validStates.includes(state)) {
      return res.status(400).json({ success: false, error: `Invalid state. Must be: ${validStates.join(", ")}` });
    }

    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) {
      return res.status(404).json({ success: false, error: "User data not found." });
    }

    // syllabus_progress is a PostgreSQL JSONB column — read, mutate, write back
    const sp = userData.syllabus_progress ? { ...userData.syllabus_progress } : {};
    if (!sp[stage])               sp[stage]               = {};
    if (!sp[stage][paper])        sp[stage][paper]        = {};
    if (!sp[stage][paper][moduleName]) sp[stage][paper][moduleName] = { progress: 0, state: "pending" };

    if (progress !== undefined)   sp[stage][paper][moduleName].progress = progress;
    if (state)                    sp[stage][paper][moduleName].state    = state;

    // Sequelize requires explicit reassignment for JSONB mutations
    userData.syllabus_progress = sp;
    userData.changed("syllabus_progress", true);
    await userData.save();

    res.json({
      success: true,
      stage,
      paper,
      module: moduleName,
      progress: sp[stage][paper][moduleName].progress,
      state:    sp[stage][paper][moduleName].state,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/dashboard/profile ─────────────────────────────────────────────
// Updates mutable profile fields: daily_target_hours, target_year, exam_date
const updateProfile = async (req, res, next) => {
  try {
    const { daily_target_hours, target_year, exam_date } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    if (daily_target_hours !== undefined) {
      const hrs = Number(daily_target_hours);
      if (isNaN(hrs) || hrs < 1 || hrs > 20)
        return res.status(400).json({ success: false, error: "daily_target_hours must be 1–20." });
      user.daily_target_hours = hrs;
    }
    if (target_year !== undefined) {
      const yr = Number(target_year);
      if (isNaN(yr) || yr < 2025 || yr > 2035)
        return res.status(400).json({ success: false, error: "target_year must be 2025–2035." });
      user.target_year = yr;
    }
    if (exam_date !== undefined) {
      user.exam_date = exam_date;
    }

    await user.save();

    res.json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        target_year: user.target_year,
        daily_target_hours: user.daily_target_hours,
        streak: user.streak || 0,
        longest_streak: user.longest_streak || 0,
        examDate: user.exam_date ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/dashboard/daily-log ────────────────────────────────────────────
const logStudyHours = async (req, res, next) => {
  try {
    const { hours, notes } = req.body;

    // Accept floats (timer sends e.g. 1.25h), clamp to 2 decimal places
    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 24) {
      return res.status(400).json({ success: false, error: "hours must be a number between 0 and 24." });
    }
    const hours_val = Math.round(parsedHours * 100) / 100; // 2dp precision

    const today = new Date().toISOString().split("T")[0];
    const logEntry = {
      date: today,
      hours: hours_val,
      notes: notes?.trim() || "",
      logged_at: new Date().toISOString(),
    };

    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) {
      return res.status(404).json({ success: false, error: "User data not found." });
    }

    const logs = Array.isArray(userData.daily_logs) ? [...userData.daily_logs] : [];
    const existingIndex = logs.findIndex((l) => l.date === today);
    let isNewDay = false;

    if (existingIndex >= 0) {
      logs[existingIndex] = logEntry;
    } else {
      logs.push(logEntry);
      isNewDay = true;
    }

    userData.daily_logs = logs;
    userData.changed("daily_logs", true);
    await userData.save();

    // Update streak only for a brand-new day entry
    if (isNewDay) {
      const user = await User.findByPk(req.user.id);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().split("T")[0];
      const hadYesterday = logs.some((l) => l.date === yDate && l.hours > 0);

      user.streak = hadYesterday ? (user.streak || 0) + 1 : 1;
      if (user.streak > (user.longest_streak || 0)) {
        user.longest_streak = user.streak;
      }
      await user.save();

      return res.json({
        success: true,
        log: logEntry,
        streak: user.streak,
        longest_streak: user.longest_streak,
        milestone: user.streak % 7 === 0 ? `${user.streak}-day streak milestone!` : null,
      });
    }

    res.json({
      success: true,
      log: logEntry,
      streak: req.user.streak || 0,
      longest_streak: req.user.longest_streak || 0,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/dashboard/spaced-repetition ────────────────────────────────────
const getSpacedRepetition = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) {
      return res.status(404).json({ success: false, error: "User data not found." });
    }

    const today = new Date().toISOString().split("T")[0];
    const queue = userData.spaced_repetition?.queue || [];
    const due   = queue.filter((item) => item.next_review <= today);

    res.json({ success: true, due_count: due.length, items: due });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/dashboard/spaced-repetition ───────────────────────────────────
const addSpacedRepetition = async (req, res, next) => {
  try {
    const { topic, paper, difficulty } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({ success: false, error: "topic is required." });
    }

    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) {
      return res.status(404).json({ success: false, error: "User data not found." });
    }

    const intervalMap = { easy: 7, medium: 3, hard: 1 };
    const interval    = intervalMap[difficulty] || 3;
    const today       = new Date();
    const nextReview  = new Date(today);
    nextReview.setDate(today.getDate() + interval);

    const newItem = {
      id:            `sr_${Date.now()}`,
      topic:         topic.trim(),
      paper:         paper || "General",
      difficulty:    difficulty || "medium",
      added:         today.toISOString().split("T")[0],
      next_review:   nextReview.toISOString().split("T")[0],
      review_count:  0,
      interval_days: interval,
    };

    const sr = userData.spaced_repetition ?? { queue: [] };
    sr.queue  = [...(sr.queue || []), newItem];

    userData.spaced_repetition = sr;
    userData.changed("spaced_repetition", true);
    await userData.save();

    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserData,
  updateModuleProgress,
  logStudyHours,
  updateProfile,
  getSpacedRepetition,
  addSpacedRepetition,
};