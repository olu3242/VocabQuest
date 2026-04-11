-- 015_handshake_rewards_automation_and_events.sql
-- Scheduled evaluation helpers + lightweight event log

CREATE TABLE IF NOT EXISTS handshake_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handshake_id UUID NOT NULL REFERENCES handshake_agreements(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handshake_activity_handshake ON handshake_activity_log(handshake_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_handshake_activity_student ON handshake_activity_log(student_id, created_at DESC);

ALTER TABLE handshake_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "handshake_activity_parent_student_read" ON handshake_activity_log
FOR SELECT USING (
  student_id = auth.uid() OR
  handshake_id IN (SELECT id FROM handshake_agreements WHERE parent_id = auth.uid())
);

CREATE POLICY "handshake_activity_parent_student_insert" ON handshake_activity_log
FOR INSERT WITH CHECK (
  student_id = auth.uid() OR
  handshake_id IN (SELECT id FROM handshake_agreements WHERE parent_id = auth.uid())
);

CREATE POLICY "handshake_activity_admin_all" ON handshake_activity_log
FOR ALL USING (current_user_role() = 'admin')
WITH CHECK (current_user_role() = 'admin');

CREATE OR REPLACE FUNCTION evaluate_handshake_progress_sql(p_handshake_id UUID)
RETURNS VOID AS $$
DECLARE
  h handshake_agreements%ROWTYPE;
  v_value NUMERIC := 0;
  v_target NUMERIC := 0;
  v_percent NUMERIC := 0;
  v_completed BOOLEAN := FALSE;
  v_now TIMESTAMPTZ := NOW();
  v_baseline NUMERIC := 0;
  v_latest NUMERIC := 0;
  v_hybrid_required INTEGER := 0;
  v_hybrid_passed INTEGER := 0;
  v_score_threshold NUMERIC;
  v_activity_threshold NUMERIC;
  v_improvement_threshold NUMERIC;
  v_window_days INTEGER;
  v_effective_start DATE;
BEGIN
  SELECT * INTO h
  FROM handshake_agreements
  WHERE id = p_handshake_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF h.status IN ('fulfilled', 'claimed', 'cancelled', 'expired') THEN
    RETURN;
  END IF;

  IF h.end_date < CURRENT_DATE THEN
    UPDATE handshake_agreements
    SET status = 'expired',
        updated_at = NOW()
    WHERE id = h.id;

    INSERT INTO handshake_activity_log (handshake_id, actor_id, student_id, event_type, message, metadata)
    VALUES (h.id, NULL, h.student_id, 'handshake_expired', 'Handshake expired before completion.', jsonb_build_object('end_date', h.end_date));

    RETURN;
  END IF;

  v_target := NULLIF(h.target_value, 0);

  IF h.challenge_type = 'quest_completion' THEN
    SELECT COUNT(*)::NUMERIC INTO v_value
    FROM daily_quests dq
    WHERE dq.student_id = h.student_id
      AND dq.status = 'completed'
      AND dq.date BETWEEN h.start_date AND h.end_date;

  ELSIF h.challenge_type = 'pronunciation_score' THEN
    SELECT COALESCE(AVG(metric_value), 0) INTO v_value
    FROM handshake_progress_events e
    WHERE e.handshake_id = h.id
      AND e.event_type = 'pronunciation_score'
      AND e.created_at::date BETWEEN h.start_date AND h.end_date;

    IF v_value = 0 THEN
      SELECT COALESCE(AVG((metadata->>'score')::NUMERIC), 0) INTO v_value
      FROM xp_events x
      WHERE x.student_id = h.student_id
        AND x.action_type = 'PRONUNCIATION_CORRECT'
        AND x.created_at::date BETWEEN h.start_date AND h.end_date
        AND (x.metadata ? 'score');
    END IF;

  ELSIF h.challenge_type = 'sentence_score' THEN
    SELECT COALESCE(AVG(metric_value), 0) INTO v_value
    FROM handshake_progress_events e
    WHERE e.handshake_id = h.id
      AND e.event_type = 'sentence_score'
      AND e.created_at::date BETWEEN h.start_date AND h.end_date;

    IF v_value = 0 THEN
      SELECT COALESCE(AVG((metadata->>'score')::NUMERIC), 0) INTO v_value
      FROM xp_events x
      WHERE x.student_id = h.student_id
        AND x.action_type = 'SENTENCE_BUILDER'
        AND x.created_at::date BETWEEN h.start_date AND h.end_date
        AND (x.metadata ? 'score');
    END IF;

  ELSIF h.challenge_type = 'streak_target' THEN
    SELECT COALESCE(streak_current, 0)::NUMERIC INTO v_value
    FROM student_gamification sg
    WHERE sg.student_id = h.student_id;

  ELSIF h.challenge_type = 'words_mastered' THEN
    SELECT COUNT(*)::NUMERIC INTO v_value
    FROM student_word_progress swp
    WHERE swp.student_id = h.student_id
      AND swp.status = 'mastered'
      AND swp.last_practiced_at::date BETWEEN h.start_date AND h.end_date;

  ELSIF h.challenge_type = 'boss_battle_completion' THEN
    SELECT COUNT(*)::NUMERIC INTO v_value
    FROM boss_battle_attempts b
    WHERE b.student_id = h.student_id
      AND b.completed_at::date BETWEEN h.start_date AND h.end_date
      AND (h.min_result_value IS NULL OR b.score >= h.min_result_value);

  ELSIF h.challenge_type = 'speaking_confidence_improvement' THEN
    SELECT COALESCE(metric_value, 0) INTO v_baseline
    FROM handshake_progress_events e
    WHERE e.handshake_id = h.id
      AND e.event_type = 'speaking_confidence'
      AND e.created_at::date BETWEEN h.start_date AND h.end_date
    ORDER BY e.created_at ASC
    LIMIT 1;

    SELECT COALESCE(metric_value, 0) INTO v_latest
    FROM handshake_progress_events e
    WHERE e.handshake_id = h.id
      AND e.event_type = 'speaking_confidence'
      AND e.created_at::date BETWEEN h.start_date AND h.end_date
    ORDER BY e.created_at DESC
    LIMIT 1;

    v_value := GREATEST(v_latest - v_baseline, 0);

  ELSIF h.challenge_type = 'hybrid_goal' THEN
    v_score_threshold := NULLIF((h.reward_config->'hybridGoal'->>'scoreThreshold')::NUMERIC, 0);
    v_activity_threshold := NULLIF((h.reward_config->'hybridGoal'->>'minActivityCount')::NUMERIC, 0);
    v_improvement_threshold := NULLIF((h.reward_config->'hybridGoal'->>'improvementThreshold')::NUMERIC, 0);
    v_window_days := NULLIF((h.reward_config->'hybridGoal'->>'dateWindowDays')::INTEGER, 0);

    v_effective_start := COALESCE(CURRENT_DATE - v_window_days, h.start_date);
    IF v_effective_start < h.start_date THEN
      v_effective_start := h.start_date;
    END IF;

    IF v_activity_threshold IS NOT NULL THEN
      v_hybrid_required := v_hybrid_required + 1;
      IF (
        SELECT COUNT(*)
        FROM daily_quests dq
        WHERE dq.student_id = h.student_id
          AND dq.status = 'completed'
          AND dq.date BETWEEN v_effective_start AND h.end_date
      ) >= v_activity_threshold THEN
        v_hybrid_passed := v_hybrid_passed + 1;
      END IF;
    END IF;

    IF v_score_threshold IS NOT NULL THEN
      v_hybrid_required := v_hybrid_required + 1;
      IF (
        SELECT COALESCE(AVG(metric_value), 0)
        FROM handshake_progress_events e
        WHERE e.handshake_id = h.id
          AND e.event_type = 'pronunciation_score'
          AND e.created_at::date BETWEEN v_effective_start AND h.end_date
      ) >= v_score_threshold THEN
        v_hybrid_passed := v_hybrid_passed + 1;
      END IF;
    END IF;

    IF v_improvement_threshold IS NOT NULL THEN
      v_hybrid_required := v_hybrid_required + 1;

      SELECT COALESCE(metric_value, 0) INTO v_baseline
      FROM handshake_progress_events e
      WHERE e.handshake_id = h.id
        AND e.event_type = 'speaking_confidence'
        AND e.created_at::date BETWEEN v_effective_start AND h.end_date
      ORDER BY e.created_at ASC
      LIMIT 1;

      SELECT COALESCE(metric_value, 0) INTO v_latest
      FROM handshake_progress_events e
      WHERE e.handshake_id = h.id
        AND e.event_type = 'speaking_confidence'
        AND e.created_at::date BETWEEN v_effective_start AND h.end_date
      ORDER BY e.created_at DESC
      LIMIT 1;

      IF (v_latest - v_baseline) >= v_improvement_threshold THEN
        v_hybrid_passed := v_hybrid_passed + 1;
      END IF;
    END IF;

    IF v_hybrid_required = 0 THEN
      v_value := 0;
      v_target := 1;
    ELSE
      v_value := v_hybrid_passed;
      v_target := v_hybrid_required;
    END IF;
  END IF;

  IF v_target IS NULL OR v_target <= 0 THEN
    v_percent := 0;
  ELSE
    v_percent := LEAST(100, ROUND((v_value / v_target) * 100, 2));
  END IF;

  v_completed := (v_target > 0 AND v_value >= v_target);

  UPDATE handshake_agreements
  SET progress_value = v_value,
      progress_percent = v_percent,
      status = CASE
        WHEN v_completed THEN 'claimable'
        WHEN h.child_accepted_at IS NOT NULL THEN 'active'
        ELSE h.status
      END,
      completed_at = CASE WHEN v_completed THEN COALESCE(h.completed_at, v_now) ELSE h.completed_at END,
      claimable_at = CASE WHEN v_completed THEN COALESCE(h.claimable_at, v_now) ELSE h.claimable_at END,
      updated_at = NOW()
  WHERE id = h.id;

  IF v_completed AND h.status <> 'claimable' THEN
    INSERT INTO handshake_activity_log (handshake_id, actor_id, student_id, event_type, message, metadata)
    VALUES (
      h.id,
      NULL,
      h.student_id,
      'handshake_claimable',
      'Handshake requirement met. Reward is now claimable.',
      jsonb_build_object('value', v_value, 'target', v_target, 'percent', v_percent)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION process_active_handshake_rewards()
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  processed_count INTEGER := 0;
  expired_count INTEGER := 0;
BEGIN
  SELECT expire_overdue_handshakes() INTO expired_count;

  FOR r IN
    SELECT id
    FROM handshake_agreements
    WHERE status IN ('pending', 'active', 'completed')
  LOOP
    PERFORM evaluate_handshake_progress_sql(r.id);
    processed_count := processed_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'processed', processed_count,
    'expired', COALESCE(expired_count, 0),
    'processed_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
