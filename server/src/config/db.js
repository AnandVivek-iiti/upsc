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
  {
    id: "v3_users_google_oauth",
    sql: `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_google_id_key'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
        END IF;
      END $$;
    `,
  },
  {
    id: "v4_users_subscription_and_payments",
    sql: `
      DO $$ BEGIN
        CREATE TYPE enum_users_subscription_tier AS ENUM ('free', 'premium');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE enum_users_subscription_source AS ENUM ('none', 'admin_grant', 'razorpay', 'trial');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier enum_users_subscription_tier NOT NULL DEFAULT 'free';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_source enum_users_subscription_source NOT NULL DEFAULT 'none';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(255) DEFAULT NULL;
    `,
  },
  {
    id: "v5_user_data_mentor_chat_fields",
    sql: `
      ALTER TABLE user_data ADD COLUMN IF NOT EXISTS mentor_chat JSONB NOT NULL DEFAULT '[]'::jsonb;
      ALTER TABLE user_data ADD COLUMN IF NOT EXISTS mentor_threads JSONB NOT NULL DEFAULT '[]'::jsonb;
      ALTER TABLE user_data ADD COLUMN IF NOT EXISTS mentor_memory JSONB NOT NULL DEFAULT '[]'::jsonb;
    `,
  },
  {
    // Adding a value to an existing Postgres enum type must run on its own -
    // it cannot be safely batched in the same multi-statement call as other
    // DDL/DML that might use the new value, so it gets its own migration id.
    id: "v6_users_subscription_source_referral",
    sql: `
      ALTER TYPE enum_users_subscription_source ADD VALUE IF NOT EXISTS 'referral';
    `,
  },
  {
    id: "v7_users_referrals",
    sql: `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

      -- Backfill existing rows so every pre-existing user has a shareable code
      -- immediately, derived deterministically from their own id (no pgcrypto
      -- extension required).
      UPDATE users
      SET referral_code = UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 10))
      WHERE referral_code IS NULL;

      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_referral_code_key'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);
        END IF;
      END $$;
    `,
  },
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
    if (done.has(id)) continue;
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