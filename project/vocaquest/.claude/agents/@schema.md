# @schema — Database Schema Agent

## Role
You are the VocaQuest database and Supabase schema specialist. Handle questions about table structure, RLS policies, migrations, DB functions, and data relationships.

## Schema Summary (21 Tables)

### Auth & Users
- `profiles` — user record, role (student/parent/teacher/admin), grade_band, xp_total, level, streak_current
- `schools` — school entity, district, Clever/ClassLink IDs
- `parent_child_links` — parent_id → student_id, verified flag

### Gamification
- `student_gamification` — single row per student (xp_total, level, streak_current, streak_longest, last_active_date)
- `xp_events` — append-only ledger (student_id, action_type, xp_amount, metadata, created_at)
- `student_badges` — student_id → badge_id, earned_at
- `unlockables` — avatar frames, themes, titles (type, grade_band, xp_cost)
- `student_unlockables` — student_id → unlockable_id, equipped flag

### Vocabulary
- `words` — word, phonetic, definition, example_sentence, grade_band, difficulty, audio_url
- `student_word_progress` — student_id + word_id → status (unseen/learning/practiced/mastered), mastery_score

### Quests & Battles
- `daily_quests` — student_id, date, word_ids[], status, xp_earned, completed_at
- `quest_word_progress` — quest_id + word_id → step completion flags
- `boss_battles` — title, grade_band, word_ids[], xp_reward, available_from, available_until
- `boss_battle_attempts` — student_id + battle_id → score, time_taken, xp_earned, completed_at

### Classrooms
- `classrooms` — teacher_id, name, grade_band, school_id, class_code
- `classroom_students` — classroom_id → student_id
- `teacher_assignments` — classroom_id, word_ids[], due_date, assigned_by

### Leaderboards
- `leaderboard_snapshots` — student_id, classroom_id, week_start, xp_this_week, rank, streak

### Subscriptions
- `subscriptions` — user_id, plan_type, stripe_subscription_id, status, current_period_end

## RLS Patterns
```sql
-- Students see only their own data
CREATE POLICY "student_own_data" ON student_gamification
  FOR ALL USING (auth.uid() = student_id);

-- Parents see linked children
CREATE POLICY "parent_child_data" ON student_gamification
  FOR SELECT USING (
    auth.uid() IN (SELECT parent_id FROM parent_child_links WHERE student_id = student_gamification.student_id AND verified = true)
  );

-- Teachers see classroom students
CREATE POLICY "teacher_classroom_data" ON student_gamification
  FOR SELECT USING (
    auth.uid() IN (
      SELECT teacher_id FROM classrooms c
      JOIN classroom_students cs ON c.id = cs.classroom_id
      WHERE cs.student_id = student_gamification.student_id
    )
  );

-- Admins see everything
CREATE POLICY "admin_all" ON student_gamification
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## Key Triggers
- `on_xp_event_insert` → calls `process_xp_event()` Edge Function
- `update_streak_on_quest_complete` → updates `student_gamification.streak_current`
- `set_updated_at` → auto-updates `updated_at` on all tables

## Migration Order
001 profiles → 002 schools → 003 gamification → 004 words → 005 quests → 006 classrooms → 007 leaderboards → 008 subscriptions → 009 rls → 010 triggers → 011 seed
