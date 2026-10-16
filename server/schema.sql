CREATE TABLE IF NOT EXISTS wedding_rsvps (
  id TEXT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
  guests INTEGER NOT NULL DEFAULT 1 CHECK (guests BETWEEN 1 AND 20),
  message VARCHAR(1000) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wedding_rsvps_created_at_idx
  ON wedding_rsvps (created_at);

CREATE TABLE IF NOT EXISTS wedding_guestbook (
  id TEXT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wedding_guestbook_created_at_idx
  ON wedding_guestbook (created_at);
