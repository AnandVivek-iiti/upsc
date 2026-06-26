// models/UserEvents.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const UserEvents = sequelize.define(
  "UserEvents",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // Note: no `references` here - FK constraint is set up via the
      // User.hasMany(UserEvents) association in models/index.js (or server.js),
      // which runs after ALL tables are created. Defining references inline
      // causes Sequelize to try to validate the "User" table exists during
      // sync(), before it has been created, crashing with
      // 'relation "User" does not exist'.
    },
    event_type: {
      type: DataTypes.ENUM(
        "dashboard_visit",
        "timer_start",
        "mentor_open",
        "answer_evaluated",
        "notes_audited",
        "test_attempted",
        "pyq_used",
        "syllabus_tracked",
        "day_return"
      ),
      allowNull: false,
    },
    feature_name: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "UserEvents",
    timestamps: true,
    updatedAt: false,
    createdAt: "created_at",
    indexes: [
      { fields: ["user_id"] },
      { fields: ["event_type"] },
      { fields: ["created_at"] },
      { fields: ["feature_name"] },
    ],
  }
);

module.exports = UserEvents;