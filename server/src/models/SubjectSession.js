/**
 * SubjectSession model
 * ─────────────────────────────────────────────────────────────────────────────
 * Records every discrete subject-tagged study session the timer produces.
 * One row = one contiguous block of focused study on a named UPSC subject.
 *
 * Architecture note (Feature 5 – Syllabus Tracker connection):
 *   When you later want study hours → syllabus progress, add a Sequelize
 *   association here and a background job that reads `subject_sessions`
 *   grouped by `subject` and maps to `UserData.syllabus_progress`.
 *   The `subject` values below are intentionally kept identical to the
 *   subject keys used in syllabusData.js so the mapping is a direct lookup.
 *
 * Migration safety:
 *   Sequelize `sync({ alter: true })` will ADD this table on first boot.
 *   No destructive changes to existing tables.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SubjectSession = sequelize.define(
  "SubjectSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // FK → users.id
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },

    /**
     * UPSC subject tag — constrained to the canonical list so reports
     * aggregate cleanly. "Other" is the escape hatch for anything
     * outside the standard 12 subjects.
     *
     * Feature 5 note: these values mirror the keys in SUBJECT_REGISTRY
     * (Topicwise.jsx) and SYLLABUS (syllabusData.js).
     *   History   → prelims.GS / mains.GS1
     *   Polity    → prelims.GS / mains.GS2
     *   Economy   → prelims.GS / mains.GS3
     *   Geography → prelims.GS / mains.GS1
     *   etc.
     */
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
        "Other"
      ),
      allowNull: false,
    },

    // IST date string "YYYY-MM-DD" — lets you query "sessions on day X" fast
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Epoch ms — stored as BIGINT so no precision loss
    start_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.BIGINT,
      allowNull: true, // null while session is still running
    },

    // Duration in seconds — computed on close, null while running
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Optional free-text note the user added ("Reading Laxmikanth Ch 3")
    notes: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "subject_sessions",
    timestamps: true,
    underscored: true,
    indexes: [
      // Fast per-user queries (most common access pattern)
      { fields: ["user_id"] },
      // Fast per-user per-date queries (daily session history)
      { fields: ["user_id", "date"] },
      // Admin subject-distribution reports
      { fields: ["subject"] },
    ],
  }
);

module.exports = SubjectSession;