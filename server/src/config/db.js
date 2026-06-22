const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected");

    // sync() with no options:
    //   • Creates tables that don't exist yet  ✓
    //   • Skips tables that already exist      ✓  (safe for production)
    //   • Does NOT drop/recreate anything      ✓
    //
    // Use { alter: true } only locally when you need to add a column to an
    // existing table — it breaks on fresh DBs because ALTER TABLE requires
    // the table to already exist.
    await sequelize.sync();
    console.log("✅ Database synced");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };