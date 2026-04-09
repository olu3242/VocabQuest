-- 009_rls_policies.sql
-- Row Level Security for all tables

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE boss_battle_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_self_read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"   ON profiles FOR ALL    USING (current_user_role() = 'admin');

-- Teachers can view students in their classrooms
CREATE POLICY "profiles_teacher_read" ON profiles FOR SELECT USING (
  current_user_role() = 'teacher' AND
  id IN (
    SELECT cs.student_id FROM classroom_students cs
    JOIN classrooms c ON c.id = cs.classroom_id
    WHERE c.teacher_id = auth.uid()
  )
);

-- Parents can view linked children
CREATE POLICY "profiles_parent_read" ON profiles FOR SELECT USING (
  current_user_role() = 'parent' AND
  id IN (SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid() AND verified = TRUE)
);

-- ─── STUDENT_GAMIFICATION ─────────────────────────────────────────────────────
CREATE POLICY "sg_student_own"   ON student_gamification FOR ALL    USING (auth.uid() = student_id);
CREATE POLICY "sg_admin_all"     ON student_gamification FOR ALL    USING (current_user_role() = 'admin');
CREATE POLICY "sg_teacher_read"  ON student_gamification FOR SELECT USING (
  current_user_role() = 'teacher' AND
  student_id IN (
    SELECT cs.student_id FROM classroom_students cs
    JOIN classrooms c ON c.id = cs.classroom_id WHERE c.teacher_id = auth.uid()
  )
);
CREATE POLICY "sg_parent_read"   ON student_gamification FOR SELECT USING (
  current_user_role() = 'parent' AND
  student_id IN (SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid() AND verified = TRUE)
);

-- ─── XP_EVENTS ────────────────────────────────────────────────────────────────
CREATE POLICY "xp_student_own"  ON xp_events FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "xp_student_insert" ON xp_events FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "xp_admin_all"    ON xp_events FOR ALL    USING (current_user_role() = 'admin');

-- ─── DAILY_QUESTS ─────────────────────────────────────────────────────────────
CREATE POLICY "dq_student_own"   ON daily_quests FOR ALL    USING (auth.uid() = student_id);
CREATE POLICY "dq_teacher_read"  ON daily_quests FOR SELECT USING (current_user_role() = 'teacher');
CREATE POLICY "dq_admin_all"     ON daily_quests FOR ALL    USING (current_user_role() = 'admin');

-- ─── CLASSROOMS ───────────────────────────────────────────────────────────────
CREATE POLICY "classrooms_teacher_own"  ON classrooms FOR ALL    USING (auth.uid() = teacher_id);
CREATE POLICY "classrooms_student_read" ON classrooms FOR SELECT USING (
  id IN (SELECT classroom_id FROM classroom_students WHERE student_id = auth.uid())
);
CREATE POLICY "classrooms_admin_all"    ON classrooms FOR ALL    USING (current_user_role() = 'admin');

-- ─── LEADERBOARD_SNAPSHOTS ────────────────────────────────────────────────────
-- Students can see their classroom leaderboard
CREATE POLICY "lb_student_classroom" ON leaderboard_snapshots FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_students WHERE student_id = auth.uid())
);
CREATE POLICY "lb_teacher_own"       ON leaderboard_snapshots FOR SELECT USING (
  classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
);
CREATE POLICY "lb_admin_all"         ON leaderboard_snapshots FOR ALL USING (current_user_role() = 'admin');

-- ─── WORDS (public read) ──────────────────────────────────────────────────────
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "words_public_read" ON words FOR SELECT USING (is_active = TRUE);
CREATE POLICY "words_admin_all"   ON words FOR ALL    USING (current_user_role() = 'admin');
