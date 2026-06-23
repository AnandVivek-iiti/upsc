const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Feedback = sequelize.define(
  "Feedback",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      index: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 },
    },
    feature: {
      type: DataTypes.ENUM(
        "ai_mentor",
        "notes_auditor",
        "syllabus_tracker",
        "dashboard",
        "study_timer",
        "mains_practice",
        "prelims_practice",
        "pyq_vault",
        "resource_library",
        "test_series",
        "profile",
        "general"
      ),
      allowNull: false,
      defaultValue: "general",
    },
    feedbackText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    wouldRecommend: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    trigger: {
      type: DataTypes.ENUM(
        "welcome_email",
        "active_user_email",
        "in_app_modal",
        "manual"
      ),
      allowNull: true,
    },
    allowReply: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "feedback",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id", "created_at"] },
      { fields: ["feature"] },
      { fields: ["rating"] },
    ],
  }
);
Feedback.belongsTo(User, { foreignKey: "userId" });

module.exports = Feedback;