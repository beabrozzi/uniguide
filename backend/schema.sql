-- UniGuide database schema (PostgreSQL). Runs automatically when the server starts.

-- Accounts: email + hashed password (never the password itself)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile: university, and when the user agreed to store their answers
CREATE TABLE IF NOT EXISTS profiles (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  university  TEXT,
  consent_at  TIMESTAMPTZ
);

-- Saved plan: the user's answers and which checklist items are done
CREATE TABLE IF NOT EXISTS plans (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  answers     JSONB NOT NULL,
  done        JSONB NOT NULL DEFAULT '[]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
