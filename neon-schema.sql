-- Run this in Neon → SQL Editor (or Vercel → Storage → wander_database → Query)
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards

-- ============================================================
-- Core tables
-- ============================================================

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

-- ============================================================
-- Section 14 — Collaboration / Family Groups
-- ============================================================

CREATE TABLE IF NOT EXISTS family_groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
  group_id  UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS family_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  invited_by  UUID NOT NULL REFERENCES users(id),
  token       TEXT UNIQUE NOT NULL,
  accepted_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_shares (
  trip_id    UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  group_id   UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  shared_by  UUID NOT NULL REFERENCES users(id),
  shared_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (trip_id, group_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id        UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id),
  body           TEXT NOT NULL,
  reference_type TEXT NOT NULL DEFAULT 'trip',
  reference_id   TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS comment_reads (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

ALTER TABLE trips ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES family_groups(id);

-- Google OAuth: password_hash is not needed for SSO users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Public link sharing: anyone with the link can view
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS family_members_user_id_idx ON family_members(user_id);
CREATE INDEX IF NOT EXISTS family_members_group_id_idx ON family_members(group_id);
CREATE INDEX IF NOT EXISTS trip_shares_group_id_idx ON trip_shares(group_id);
CREATE INDEX IF NOT EXISTS comments_trip_id_idx ON comments(trip_id);
CREATE INDEX IF NOT EXISTS comment_reads_user_id_idx ON comment_reads(user_id);
