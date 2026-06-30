const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

// ─── Note ───────────────────────────────────────────────────────────────────
// One row per note. Notes belong directly to a User (same pattern as
// TestAttempt, see UserData.js) rather than living inside the UserData JSONB
// blob — notes are edited character-by-character via autosave, so a
// normalized table with per-row UPDATEs is the right shape; stuffing every
// note + AI version into a single JSONB column would mean rewriting the
// entire blob on every autosave tick.
//
// EVERY query against this model in notesController MUST filter by
// user_id = req.user.id. That is the only thing that makes a note visible
// only to its owner — there is no other access control layer.

const Note = sequelize.define(
  "Note",
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: "",
    },
    // One of TOPICS ids from the client (polity | history | economy |
    // geography | sociology | ethics | environment | scitech), or null.
    topic: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: null,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    // AI-generated versions of this note. Shape: { enhanced?, revision?, mains? }
    // (each value is a markdown-lite string returned by the AI mentor chain).
    versions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: "notes",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["user_id", "updated_at"] },
    ],
  }
);

// ─── Associations ───────────────────────────────────────────────────────────
User.hasMany(Note, { foreignKey: "user_id", as: "notes", onDelete: "CASCADE" });
Note.belongsTo(User, { foreignKey: "user_id" });

module.exports = Note;
