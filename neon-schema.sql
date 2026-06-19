-- Run this in Neon → SQL Editor (or Vercel → Storage → wander_database → Query)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  guidelines JSONB NOT NULL,
  plan JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('upcoming', 'past', 'planning')),
  emoji TEXT NOT NULL DEFAULT '🗺️',
  card_color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
