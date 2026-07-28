const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Payment = sequelize.define(
  "Payment",
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
    plan: {
      type: DataTypes.ENUM("monthly", "yearly"),
      allowNull: false,
    },
    razorpay_order_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    razorpay_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },
    status: {
      type: DataTypes.ENUM("created", "paid", "failed"),
      allowNull: false,
      defaultValue: "created",
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ["user_id"] }, { fields: ["status"] }],
  }
);

module.exports = Payment;