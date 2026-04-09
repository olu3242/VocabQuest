-- 007_create_leaderboards.sql

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  classroom_id  UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  week_start    DATE NOT NULL,
  xp_this_week  INTEGER NOT NULL DEFAULT 0,
  rank          INTEGER NOT NULL DEFAULT 0,
  streak        INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, classroom_id, week_start)
);

CREATE INDEX idx_leaderboard_classroom_week ON leaderboard_snapshots(classroom_id, week_start);
