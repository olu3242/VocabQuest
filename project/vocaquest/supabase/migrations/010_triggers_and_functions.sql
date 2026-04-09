-- 010_triggers_and_functions.sql
-- XP processor, streak updater, leaderboard helpers

-- ─── Process XP event: update totals + level ──────────────────────────────────
CREATE OR REPLACE FUNCTION process_xp_event()
RETURNS TRIGGER AS $$
DECLARE
  new_xp_total  INTEGER;
  new_level     INTEGER;
BEGIN
  -- Add XP to student total
  UPDATE student_gamification
  SET xp_total = xp_total + NEW.xp_amount,
      updated_at = NOW()
  WHERE student_id = NEW.student_id
  RETURNING xp_total INTO new_xp_total;

  -- Calculate level from XP thresholds
  new_level := CASE
    WHEN new_xp_total >= 12000 THEN 9
    WHEN new_xp_total >= 8000  THEN 8
    WHEN new_xp_total >= 5500  THEN 7
    WHEN new_xp_total >= 3500  THEN 6
    WHEN new_xp_total >= 2000  THEN 5
    WHEN new_xp_total >= 1000  THEN 4
    WHEN new_xp_total >= 500   THEN 3
    WHEN new_xp_total >= 200   THEN 2
    ELSE 1
  END;

  UPDATE student_gamification
  SET level = new_level
  WHERE student_id = NEW.student_id AND level <> new_level;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_xp_event_insert
  AFTER INSERT ON xp_events
  FOR EACH ROW EXECUTE FUNCTION process_xp_event();

-- ─── Update streak on quest completion ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_streak_on_quest()
RETURNS TRIGGER AS $$
DECLARE
  last_date   DATE;
  new_streak  INTEGER;
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    SELECT last_active_date INTO last_date
    FROM student_gamification
    WHERE student_id = NEW.student_id;

    IF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Consecutive day — extend streak
      UPDATE student_gamification
      SET streak_current = streak_current + 1,
          streak_longest = GREATEST(streak_longest, streak_current + 1),
          last_active_date = CURRENT_DATE,
          updated_at = NOW()
      WHERE student_id = NEW.student_id;
    ELSIF last_date = CURRENT_DATE THEN
      -- Same day quest re-completion — no streak change
      NULL;
    ELSE
      -- Streak reset
      UPDATE student_gamification
      SET streak_current = 1,
          last_active_date = CURRENT_DATE,
          updated_at = NOW()
      WHERE student_id = NEW.student_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quest_completed
  AFTER UPDATE ON daily_quests
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_quest();

-- ─── Nightly streak reset (called by Edge Function cron) ─────────────────────
CREATE OR REPLACE FUNCTION reset_lapsed_streaks()
RETURNS void AS $$
BEGIN
  UPDATE student_gamification
  SET streak_current = 0,
      updated_at = NOW()
  WHERE last_active_date < CURRENT_DATE - INTERVAL '1 day'
    AND streak_current > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Word mastery counter ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_words_mastered()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'mastered' AND (OLD.status IS NULL OR OLD.status <> 'mastered') THEN
    UPDATE student_gamification
    SET words_mastered = words_mastered + 1,
        updated_at = NOW()
    WHERE student_id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_word_mastered
  AFTER INSERT OR UPDATE ON student_word_progress
  FOR EACH ROW EXECUTE FUNCTION update_words_mastered();

-- ─── Badge counter ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_badge_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE student_gamification
  SET badges_earned = badges_earned + 1,
      updated_at = NOW()
  WHERE student_id = NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_badge_earned
  AFTER INSERT ON student_badges
  FOR EACH ROW EXECUTE FUNCTION update_badge_count();
