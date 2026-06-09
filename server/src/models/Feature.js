const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Feature = sequelize.define(
  "Feature",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    featureName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "feature_name",
      validate: { notEmpty: { msg: "Feature name is required" } },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: "Description is required" } },
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = Feature;