const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        len: { args: [1, 80], msg: "Name cannot exceed 80 characters" },
        notEmpty: { msg: "Name is required" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Please enter a valid email" },
        notEmpty: { msg: "Email is required" },
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        passwordLength(value) {
          if (value && value.length < 8 && !value.startsWith("$2")) {
            throw new Error("Password must be at least 8 characters");
          }
        },
      },
    },
    // ── Google OAuth ──────────────────────────────────────────────────────────
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ─────────────────────────────────────────────────────────────────────────
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    longest_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    daily_target_hours: {
      type: DataTypes.INTEGER,
      defaultValue: 8,
      validate: { min: 1, max: 24 },
    },
    target_year: {
      type: DataTypes.INTEGER,
      defaultValue: () => new Date().getFullYear() + 1,
    },
    exam_date: {
      type: DataTypes.DATEONLY,
      defaultValue: () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        d.setMonth(3);
        d.setDate(1);
        return d;
      },
    },
    quote: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password") && user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.prototype.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;