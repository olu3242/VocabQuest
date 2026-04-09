-- 006_create_classrooms.sql

CREATE TABLE IF NOT EXISTS classrooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  teacher_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grade_band  TEXT NOT NULL CHECK (grade_band IN ('k2', '35', '68', '912')),
  school_id   UUID REFERENCES schools(id) ON DELETE SET NULL,
  class_code  TEXT UNIQUE NOT NULL DEFAULT upper(substring(gen_random_uuid()::text, 1, 6)),
  hide_leaderboard BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classrooms_teacher_id ON classrooms(teacher_id);

CREATE TABLE IF NOT EXISTS classroom_students (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id  UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (classroom_id, student_id)
);

-- Teacher word assignments
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id  UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  word_ids      UUID[] NOT NULL,
  due_date      DATE,
  assigned_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
