// models/DailyActiveUsers.js
// Materialized daily summary - populated by a cron job (or on-demand).
// Never written to by app request handlers directly.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DailyActiveUsers = sequelize.define(
  "DailyActiveUsers",
  {
    date: {
      type: DataTypes.DATEONLY,
      primaryKey: true,
    },
    dau: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    new_signups: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "DailyActiveUsers",
    timestamps: false,
  }
);

module.exports = DailyActiveUsers;