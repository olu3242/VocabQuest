-- 003_create_gamification.sql

CREATE TABLE IF NOT EXISTS student_gamification (
  student_id        UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp_total          INTEGER NOT NULL DEFAULT 0,
  level             INTEGER NOT NULL DEFAULT 1,
  streak_current    INTEGER NOT NULL DEFAULT 0,
  streak_longest    INTEGER NOT NULL DEFAULT 0,
  last_active_date  DATE,
  badges_earned     INTEGER NOT NULL DEFAULT 0,
  words_mastered    INTEGER NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create gamification row for new students
CREATE OR REPLACE FUNCTION init_student_gamification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO student_gamification (student_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_student_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION init_student_gamification();

-- XP events ledger (append-only)
CREATE TABLE IF NOT EXISTS xp_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  xp_amount   INTEGER NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_events_student_id ON xp_events(student_id);
CREATE INDEX idx_xp_events_created_at ON xp_events(created_at);

-- Badges catalogue
CREATE TABLE IF NOT EXISTS badges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  description         TEXT NOT NULL,
  icon_url            TEXT,
  category            TEXT NOT NULL CHECK (category IN ('streak', 'mastery', 'world', 'battle', 'pronunciation')),
  requirement_type    TEXT NOT NULL,
  requirement_value   INTEGER NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student earned badges
CREATE TABLE IF NOT EXISTS student_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, badge_id)
);

-- Unlockables (avatar frames, themes, titles)
CREATE TABLE IF NOT EXISTS unlockables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('avatar_frame', 'theme', 'title', 'powerup')),
  grade_band  TEXT,
  xp_cost     INTEGER NOT NULL DEFAULT 0,
  preview_url TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student owned unlockables
CREATE TABLE IF NOT EXISTS student_unlockables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unlockable_id   UUID NOT NULL REFERENCES unlockables(id) ON DELETE CASCADE,
  equipped        BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, unlockable_id)
);
