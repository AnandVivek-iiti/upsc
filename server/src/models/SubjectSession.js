
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

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },


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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    start_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

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
      { fields: ["user_id"] },
      { fields: ["user_id", "date"] },
      { fields: ["subject"] },
      { fields: ["created_at"] },
    ],
  }
);

module.exports = SubjectSession;