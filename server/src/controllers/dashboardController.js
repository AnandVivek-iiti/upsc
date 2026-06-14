const User = require("../models/User");
const { UserData } = require("../models/UserData");

// ─── GET /api/dashboard ────────────────────────────────────────────────────────
// Returns profile + daily logs + answers + spaced_repetition + question_attempts.
const getUserData = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });

    if (!userData) {
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
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      target_year: user.target_year,
      daily_target_hours: user.daily_target_hours,
      streak: user.streak || 0,
      longest_streak: user.longest_streak || 0,
      examDate: user.exam_date ?? null,
    },
    syllabus_progress: userData.syllabus_progress || {},
    answers: userData.answers || [],
    daily_logs: userData.daily_logs || [],
    spaced_repetition: userData.spaced_repetition || { queue: [] },
    // ── NEW: server-persisted question attempts for cross-device sync ──────
    question_attempts: userData.question_attempts || [],
  });
}

// ─── PATCH /api/dashboard/syllabus/:stage/:paper/:module ──────────────────────
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

    const sp = userData.syllabus_progress ? { ...userData.syllabus_progress } : {};
    if (!sp[stage])                     sp[stage]                     = {};
    if (!sp[stage][paper])              sp[stage][paper]              = {};
    if (!sp[stage][paper][moduleName])  sp[stage][paper][moduleName]  = { progress: 0, state: "pending" };

    if (progress !== undefined) sp[stage][paper][moduleName].progress = progress;
    if (state)                  sp[stage][paper][moduleName].state    = state;

    userData.syllabus_progress = sp;
    userData.changed("syllabus_progress", true);
    await userData.save();

    res.json({
      success: true,
      stage, paper, module: moduleName,
      progress: sp[stage][paper][moduleName].progress,
      state:    sp[stage][paper][moduleName].state,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/dashboard/syllabus/bulk ────────────────────────────────────────
// Bulk-update multiple modules in one request — prevents race conditions when
// question solving auto-syncs several topics at once.
// Body: { updates: [{ stage, paper, module, progress, state }, ...] }
const bulkUpdateSyllabus = async (req, res, next) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, error: "updates must be a non-empty array." });
    }
    if (updates.length > 50) {
      return res.status(400).json({ success: false, error: "Max 50 updates per request." });
    }

    const validStages = ["prelims", "mains"];
    const validStates = ["pending", "progress", "revision", "done"];

    for (const u of updates) {
      if (!validStages.includes(u.stage)) {
        return res.status(400).json({ success: false, error: `Invalid stage: ${u.stage}` });
      }
      if (u.progress !== undefined && (typeof u.progress !== "number" || u.progress < 0 || u.progress > 100)) {
        return res.status(400).json({ success: false, error: `progress must be 0–100 for module ${u.module}` });
      }
      if (u.state && !validStates.includes(u.state)) {
        return res.status(400).json({ success: false, error: `Invalid state: ${u.state}` });
      }
    }

    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) {
      return res.status(404).json({ success: false, error: "User data not found." });
    }

    const sp = userData.syllabus_progress ? JSON.parse(JSON.stringify(userData.syllabus_progress)) : {};

    for (const u of updates) {
      const { stage, paper, module: mod, progress, state } = u;
      if (!sp[stage])          sp[stage]          = {};
      if (!sp[stage][paper])   sp[stage][paper]   = {};
      if (!sp[stage][paper][mod]) sp[stage][paper][mod] = { progress: 0, state: "pending" };

      if (progress !== undefined) sp[stage][paper][mod].progress = progress;
      if (state)                  sp[stage][paper][mod].state    = state;
    }

    userData.syllabus_progress = sp;
    userData.changed("syllabus_progress", true);
    await userData.save();

    res.json({ success: true, updated: updates.length, syllabus_progress: sp });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/dashboard/profile ─────────────────────────────────────────────
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
      user.exam_date = exam_date || null;
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
// Upserts today's study hours. Hours=0 is valid (explicit reset).
const logStudyHours = async (req, res, next) => {
  try {
    const { hours, notes } = req.body;

    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 24) {
      return res.status(400).json({ success: false, error: "hours must be a number between 0 and 24." });
    }
    const hours_val = Math.round(parsedHours * 100) / 100;

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
    const isNewDay = existingIndex < 0;

    if (existingIndex >= 0) {
      logs[existingIndex] = logEntry;
    } else {
      logs.push(logEntry);
    }

    userData.daily_logs = logs;
    userData.changed("daily_logs", true);
    await userData.save();

    // Update streak only for a brand-new day entry with actual hours studied
    if (isNewDay && hours_val > 0) {
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

// ─── POST /api/dashboard/question-attempts ────────────────────────────────────
// Saves question attempts to the server for cross-device sync and profile stats.
// Body: { attempts: [{ id, topic, subject, result, attemptedAt, ... }] }
// Uses upsert-by-id: if attempt id already exists, update it; else append.
const syncQuestionAttempts = async (req, res, next) => {
  try {
    const { attempts } = req.body;

    if (!Array.isArray(attempts)) {
      return res.status(400).json({ success: false, error: "attempts must be an array." });
    }
    if (attempts.length > 500) {
      return res.status(400).json({ success: false, error: "Max 500 attempts per sync." });
    }

    const validResults = ["correct", "wrong", "skipped"];
    for (const a of attempts) {
      if (!a.id) {
        return res.status(400).json({ success: false, error: "Each attempt must have an id." });
      }
      if (!validResults.includes(a.result)) {
        return res.status(400).json({ success: false, error: `Invalid result: ${a.result}` });
      }
    }

    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) {
      return res.status(404).json({ success: false, error: "User data not found." });
    }

    const existing = Array.isArray(userData.question_attempts) ? [...userData.question_attempts] : [];
    const byId = {};
    for (const a of existing) byId[a.id] = a;

    // Upsert: incoming attempts override existing ones with same id
    for (const a of attempts) {
      byId[a.id] = {
        id:           a.id,
        topic:        a.topic        || "",
        subject:      a.subject      || "",
        paper:        a.paper        || "",
        difficulty:   a.difficulty   || "Medium",
        result:       a.result,
        attemptedAt:  a.attemptedAt  || new Date().toISOString(),
        year:         a.year         || null,
        source:       a.source       || "Practice",
      };
    }

    const merged = Object.values(byId);
    userData.question_attempts = merged;
    userData.changed("question_attempts", true);
    await userData.save();

    const stats = {
      total:   merged.length,
      correct: merged.filter(a => a.result === "correct").length,
      wrong:   merged.filter(a => a.result === "wrong").length,
      skipped: merged.filter(a => a.result === "skipped").length,
    };

    res.json({ success: true, synced: attempts.length, total: merged.length, stats });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/dashboard/spaced-repetition ─────────────────────────────────────
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

// ─── POST /api/dashboard/spaced-repetition ────────────────────────────────────
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
  bulkUpdateSyllabus,
  logStudyHours,
  updateProfile,
  syncQuestionAttempts,
  getSpacedRepetition,
  addSpacedRepetition,
};