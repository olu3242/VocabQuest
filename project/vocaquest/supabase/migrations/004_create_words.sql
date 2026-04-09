-- 004_create_words.sql

CREATE TABLE IF NOT EXISTS words (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word             TEXT NOT NULL,
  phonetic         TEXT NOT NULL,
  definition       TEXT NOT NULL,
  example_sentence TEXT NOT NULL,
  grade_band       TEXT NOT NULL CHECK (grade_band IN ('k2', '35', '68', '912')),
  difficulty       INTEGER NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 3),
  audio_url        TEXT,
  topic_tags       TEXT[] DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_words_grade_band ON words(grade_band);
CREATE INDEX idx_words_difficulty ON words(difficulty);

CREATE TRIGGER set_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Student progress per word
CREATE TABLE IF NOT EXISTS student_word_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_id           UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'unseen' CHECK (status IN ('unseen', 'learning', 'practiced', 'mastered')),
  mastery_score     FLOAT NOT NULL DEFAULT 0.0,
  attempts          INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  UNIQUE (student_id, word_id)
);

CREATE INDEX idx_swp_student_id ON student_word_progress(student_id);
CREATE INDEX idx_swp_status ON student_word_progress(status);
