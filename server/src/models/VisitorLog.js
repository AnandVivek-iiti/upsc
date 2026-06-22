const { DataTypes } = require("sequelize");
const crypto = require("crypto");
const { sequelize } = require("../config/db");

const VisitorLog = sequelize.define(
  "VisitorLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY, // "YYYY-MM-DD"
      allowNull: false,
      unique: true,
    },
    hits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    distinct_visitors: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Stored as a JSON array of hashed IPs
    visitor_hashes: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    // Stored as a JSON object: { "/api/evaluate": 12, "/api/user-data": 40 }
    routes: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: "visitor_logs", // production table is lowercase/underscored — Sequelize would default to "VisitorLogs"
    timestamps: false,
    underscored: true,
  }
);

VisitorLog.recordHit = async function (ip, route) {
  const today = new Date().toISOString().split("T")[0];
  const hashedIP = crypto
    .createHash("sha256")
    .update(ip || "unknown")
    .digest("hex");

  // Upsert today's log row
  let [log, created] = await VisitorLog.findOrCreate({
    where: { date: today },
    defaults: {
      hits: 0,
      distinct_visitors: 0,
      visitor_hashes: [],
      routes: {},
    },
  });

  // Increment hits
  log.hits += 1;

  // Increment route count
  const safeRoute = route.replace(/\./g, "_");
  const routes = log.routes || {};
  routes[safeRoute] = (routes[safeRoute] || 0) + 1;
  log.routes = routes;

  // Track distinct visitors
  const hashes = log.visitor_hashes || [];
  if (!hashes.includes(hashedIP)) {
    hashes.push(hashedIP);
    log.visitor_hashes = hashes;
    log.distinct_visitors += 1;
  }

  // Mark JSONB fields as changed so Sequelize saves them
  log.changed("routes", true);
  log.changed("visitor_hashes", true);

  await log.save();
};

module.exports = VisitorLog;