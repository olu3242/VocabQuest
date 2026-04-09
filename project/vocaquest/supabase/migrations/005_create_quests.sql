-- 005_create_quests.sql

CREATE TABLE IF NOT EXISTS daily_quests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  word_ids     UUID[] NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, date)
);

CREATE INDEX idx_daily_quests_student_date ON daily_quests(student_id, date);

-- Per-word progress within a quest
CREATE TABLE IF NOT EXISTS quest_word_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id        UUID NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE,
  word_id         UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  learned         BOOLEAN NOT NULL DEFAULT FALSE,
  learned_at      TIMESTAMPTZ,
  pronounced      BOOLEAN NOT NULL DEFAULT FALSE,
  pronounced_at   TIMESTAMPTZ,
  sentence_built  BOOLEAN NOT NULL DEFAULT FALSE,
  sentence_built_at TIMESTAMPTZ,
  UNIQUE (quest_id, word_id)
);

-- Boss battles
CREATE TABLE IF NOT EXISTS boss_battles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  grade_band       TEXT NOT NULL CHECK (grade_band IN ('k2', '35', '68', '912')),
  word_ids         UUID[] NOT NULL,
  xp_reward        INTEGER NOT NULL DEFAULT 150,
  time_limit_secs  INTEGER NOT NULL DEFAULT 300,
  available_from   TIMESTAMPTZ,
  available_until  TIMESTAMPTZ,
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student attempts at boss battles
CREATE TABLE IF NOT EXISTS boss_battle_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  battle_id    UUID NOT NULL REFERENCES boss_battles(id) ON DELETE CASCADE,
  score        FLOAT NOT NULL DEFAULT 0.0,
  correct      INTEGER NOT NULL DEFAULT 0,
  total        INTEGER NOT NULL DEFAULT 0,
  time_taken   INTEGER,
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, battle_id)
);
