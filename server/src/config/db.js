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
const MIGRATIONS = [
  {
    id: "v1_users_quote",
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS quote TEXT DEFAULT NULL`,
  },
  {
    id: "v2_user_data_note_audits",
    sql: `ALTER TABLE user_data ADD COLUMN IF NOT EXISTS note_audits JSONB NOT NULL DEFAULT '[]'::jsonb`,
  },
  // ← append future migrations here
];

async function runMigrations() {
  // Ensure the tracking table exists
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Find which migrations have already run
  const [rows] = await sequelize.query(`SELECT id FROM _migrations`);
  const done = new Set(rows.map((r) => r.id));

  let applied = 0;
  for (const { id, sql } of MIGRATIONS) {
    if (done.has(id)) continue; // already ran — skip
    await sequelize.query(sql);
    await sequelize.query(`INSERT INTO _migrations (id) VALUES (:id)`, {
      replacements: { id },
    });
    console.log(`   ✔ migration: ${id}`);
    applied++;
  }

  if (applied === 0) {
    console.log("✅ Migrations: nothing new");
  } else {
    console.log(`✅ Migrations: ${applied} applied`);
  }
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected");

    await sequelize.sync();
    console.log("✅ Database synced");

    await runMigrations();
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };