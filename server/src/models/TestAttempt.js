/**
 * TestAttempt — PostgreSQL / Sequelize
 *
 * Stores one row per MCQ Test Series submission (e.g. "SFG 2026 — Level 1 · Test 1").
 * Granularity is test-level + topic-wise breakdown (NOT per-question), matching
 * the existing "Topic-wise breakdown" the Test Series UI already renders.
 *
 * topic_breakdown shape (JSONB array):
 *   [{ topic: "Fundamental Rights", correct: 3, wrong: 2, skipped: 5, total: 10 }, ...]
 *
 * ai_analysis shape (JSONB, populated by the AI analysis pipeline — see
 * controllers/testController.js):
 *   {
 *     summary: "...",
 *     performance_band: "Needs Work" | "Average" | "Good" | "Excellent",
 *     strong_topics: [{ topic, accuracy, note }],
 *     weak_topics:   [{ topic, accuracy, note, priority: "high"|"medium"|"low" }],
 *     study_plan: [{ day, focus, tasks: [] }],
 *     priority_actions: [],
 *     pushed_to_revision: true|false
 *   }
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const TestAttempt = sequelize.define(
  "TestAttempt",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // ── Test identity ──────────────────────────────────────────────────────
    test_series:  { type: DataTypes.STRING, allowNull: false, defaultValue: "General" }, // e.g. "SFG 2026"
    test_title:   { type: DataTypes.STRING, allowNull: false }, // e.g. "Level 1 · Test 1"
    subject:      { type: DataTypes.STRING, allowNull: false, defaultValue: "General Studies" }, // e.g. "Polity"
    total_questions: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 60 },

    // ── Marking scheme ──────────────────────────────────────────────────────
    // marks_wrong default is -2/3 (standard UPSC Prelims: -1/3 of the +2 awarded
    // for a correct answer). Stored at full precision; UI may display it
    // rounded as "-0.67" but the score itself must be computed from the exact
    // fraction or scores drift (7 correct/5 wrong at -0.67 flat = 10.65, but
    // the real UPSC formula gives 10.67 — a real, user-visible discrepancy).
    marks_correct: { type: DataTypes.FLOAT, defaultValue: 2 },
    marks_wrong:   { type: DataTypes.FLOAT, defaultValue: -2 / 3 },
    marks_skipped: { type: DataTypes.FLOAT, defaultValue: 0 },
    max_marks:     { type: DataTypes.FLOAT, allowNull: false, defaultValue: 100 },

    // ── Raw result counts ──────────────────────────────────────────────────
    correct_count: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    wrong_count:   { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    skipped_count: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    attempted_count: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },

    // ── Derived scoring (computed server-side — never trust client-sent scores) ──
    score:    { type: DataTypes.FLOAT, allowNull: false },        // e.g. 10.67
    accuracy: { type: DataTypes.FLOAT, allowNull: false },        // e.g. 58.3 (% of attempted that were correct)
    percentage: { type: DataTypes.FLOAT, allowNull: false },      // score / max_marks * 100
    performance_band: {
      type: DataTypes.ENUM("Needs Work", "Average", "Good", "Excellent"),
      allowNull: false,
    },

    // ── Topic-wise breakdown, as already shown in the Test Series UI ────────
    topic_breakdown: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    // ── AI-generated analysis (filled async after submission, or on demand) ──
    ai_analysis: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    ai_analysis_status: {
      type: DataTypes.ENUM("pending", "processing", "ready", "failed"),
      defaultValue: "pending",
    },
    ai_provider_used: { type: DataTypes.STRING, allowNull: true },

    completed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["user_id", "completed_at"] },
    ],
  }
);

// ─── Helpers ────────────────────────────────────────────────────────────────

TestAttempt.computeBand = function (percentage) {
  if (percentage < 30) return "Needs Work";
  if (percentage < 55) return "Average";
  if (percentage < 75) return "Good";
  return "Excellent";
};

module.exports = TestAttempt;