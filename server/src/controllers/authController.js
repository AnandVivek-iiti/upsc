const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UserData } = require("../models/UserData");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─── Helper — shapes the user object returned in every auth response ──────────
const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  profile: {
    name: user.name,
    target_year: user.target_year,
    daily_target_hours: user.daily_target_hours,
    streak: user.streak || 0,
    longest_streak: user.longest_streak || 0,
    examDate: user.exam_date ?? null,
  },
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, target_year, daily_target_hours, examDate } = req.body;

    const errors = {};
    if (!name?.trim())  errors.name     = "Name is required.";
    if (!email?.trim()) errors.email    = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!password)      errors.password = "Password is required.";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (!examDate)      errors.examDate = "Exam date is required for the countdown tracker.";

    if (target_year !== undefined) {
      const yr = Number(target_year);
      if (isNaN(yr) || yr < 2025 || yr > 2035)
        errors.target_year = "Target year must be between 2025 and 2035.";
    }
    if (daily_target_hours !== undefined) {
      const hrs = Number(daily_target_hours);
      if (isNaN(hrs) || hrs < 1 || hrs > 20)
        errors.daily_target_hours = "Daily target must be between 1 and 20 hours.";
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({
        success: false,
        errors,
        error: "Validation failed. Please check your input.",
      });
    }

    // ── Duplicate email check ─────────────────────────────────────────────────
    const exists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (exists) {
      return res.status(400).json({
        success: false,
        errors: { email: "An account with this email already exists." },
        error: "An account with this email already exists.",
      });
    }

    // ── Create user ───────────────────────────────────────────────────────────
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      target_year: target_year ? Number(target_year) : new Date().getFullYear() + 1,
      daily_target_hours: daily_target_hours ? Number(daily_target_hours) : 8,
      exam_date: examDate ? new Date(examDate) : null,
    });

    // ── Seed UserData row for this user ───────────────────────────────────────
    await UserData.seedForUser(user.id);

    const token = signToken(user.id);
    res.status(201).json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        errors: { email: "An account with this email already exists." },
        error: "An account with this email already exists.",
      });
    }
    if (err.name === "SequelizeValidationError") {
      const errors = {};
      for (const e of err.errors) errors[e.path] = e.message;
      return res.status(400).json({ success: false, errors, error: "Validation failed." });
    }
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const errors = {};
    if (!email?.trim()) errors.email    = "Email is required.";
    if (!password)      errors.password = "Password is required.";
    if (Object.keys(errors).length) {
      return res.status(400).json({
        success: false,
        errors,
        error: "Email and password are required.",
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        errors: { password: "Invalid email or password." },
        error: "Invalid email or password.",
      });
    }

    const token = signToken(user.id);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/auth/profile ──────────────────────────────────────────────────
// Update name, target_year, daily_target_hours, examDate
const updateProfile = async (req, res, next) => {
  try {
    const { name, target_year, daily_target_hours, examDate } = req.body;

    const errors = {};
    if (name !== undefined) {
      if (!name.trim()) errors.name = "Name cannot be empty.";
      else if (name.trim().length > 80) errors.name = "Max 80 characters.";
    }
    if (target_year !== undefined) {
      const yr = Number(target_year);
      if (isNaN(yr) || yr < 2025 || yr > 2035)
        errors.target_year = "Target year must be between 2025 and 2035.";
    }
    if (daily_target_hours !== undefined) {
      const hrs = Number(daily_target_hours);
      if (isNaN(hrs) || hrs < 1 || hrs > 20)
        errors.daily_target_hours = "Daily target must be between 1 and 20 hours.";
    }
    if (examDate !== undefined && examDate !== null && examDate !== "") {
      const d = new Date(examDate);
      if (isNaN(d.getTime())) errors.examDate = "Invalid date format.";
      // Allow past dates in case admin corrects history — no future-only restriction
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, errors, error: "Validation failed." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    if (name !== undefined)               user.name               = name.trim();
    if (target_year !== undefined)        user.target_year        = Number(target_year);
    if (daily_target_hours !== undefined) user.daily_target_hours = Number(daily_target_hours);
    if (examDate !== undefined)           user.exam_date          = examDate ? new Date(examDate) : null;

    await user.save();

    // Also update localStorage-cached name via the response
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const errors = {};
      for (const e of err.errors) errors[e.path] = e.message;
      return res.status(400).json({ success: false, errors, error: "Validation failed." });
    }
    next(err);
  }
};

// ─── PATCH /api/auth/change-password ─────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const errors = {};
    if (!currentPassword) errors.current = "Current password is required.";
    if (!newPassword || newPassword.length < 8)
      errors.next = "New password must be at least 8 characters.";

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, errors, error: "Validation failed." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const match = await user.matchPassword(currentPassword);
    if (!match) {
      return res.status(401).json({
        success: false,
        errors: { current: "Current password is incorrect." },
        error: "Current password is incorrect.",
      });
    }

    user.password = newPassword; // beforeSave hook hashes it
    await user.save();

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };