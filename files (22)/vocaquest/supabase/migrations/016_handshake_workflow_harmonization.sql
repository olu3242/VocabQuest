-- 016_handshake_workflow_harmonization.sql
-- Extends handshake rewards into a full parent-child funded/testing/redemption workflow.

ALTER TABLE handshake_agreements
  ADD COLUMN IF NOT EXISTS task_type TEXT,
  ADD COLUMN IF NOT EXISTS target_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS minimum_score_required NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS reward_label TEXT,
  ADD COLUMN IF NOT EXISTS funding_status TEXT NOT NULL DEFAULT 'not_funded',
  ADD COLUMN IF NOT EXISTS funded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS task_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS testing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scored_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS score_value NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS pass_fail_result TEXT,
  ADD COLUMN IF NOT EXISTS parent_redemption_decision TEXT,
  ADD COLUMN IF NOT EXISTS approved_for_claim_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS allow_retake BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS max_retakes INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS retake_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE handshake_agreements
SET due_date = COALESCE(due_date, end_date),
    accepted_at = COALESCE(accepted_at, child_accepted_at),
    minimum_score_required = COALESCE(minimum_score_required, min_result_value),
    reward_label = COALESCE(reward_label, reward_description),
    task_type = COALESCE(task_type, challenge_type)
WHERE due_date IS NULL
   OR accepted_at IS NULL
   OR minimum_score_required IS NULL
   OR reward_label IS NULL
   OR task_type IS NULL;

ALTER TABLE handshake_agreements
  ALTER COLUMN due_date SET NOT NULL;

ALTER TABLE handshake_agreements
  DROP CONSTRAINT IF EXISTS handshake_agreements_status_check,
  DROP CONSTRAINT IF EXISTS handshake_agreements_funding_status_check,
  DROP CONSTRAINT IF EXISTS handshake_agreements_pass_fail_result_check,
  DROP CONSTRAINT IF EXISTS handshake_agreements_parent_redemption_decision_check;

ALTER TABLE handshake_agreements
  ADD CONSTRAINT handshake_agreements_status_check
  CHECK (status IN (
    'draft',
    'initiated',
    'funded',
    'pending_acceptance',
    'accepted',
    'task_in_progress',
    'awaiting_test_initiation',
    'testing_in_progress',
    'scored_passed',
    'scored_failed',
    'awaiting_parent_redemption_review',
    'approved_for_claim',
    'retake_required',
    'redemption_rejected',
    'claimed',
    'fulfilled',
    'expired',
    'cancelled',
    -- Backward compatibility for already-stored statuses:
    'pending',
    'active',
    'completed',
    'claimable'
  )),
  ADD CONSTRAINT handshake_agreements_funding_status_check
  CHECK (funding_status IN ('not_funded', 'pending', 'funded', 'failed', 'refunded')),
  ADD CONSTRAINT handshake_agreements_pass_fail_result_check
  CHECK (pass_fail_result IS NULL OR pass_fail_result IN ('passed', 'failed')),
  ADD CONSTRAINT handshake_agreements_parent_redemption_decision_check
  CHECK (parent_redemption_decision IS NULL OR parent_redemption_decision IN ('approved', 'rejected', 'retake_required'));

CREATE TABLE IF NOT EXISTS handshake_funding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handshake_id UUID NOT NULL REFERENCES handshake_agreements(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  funding_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handshake_funding_events_handshake ON handshake_funding_events(handshake_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_handshake_funding_events_parent ON handshake_funding_events(parent_id, created_at DESC);

CREATE TABLE IF NOT EXISTS handshake_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handshake_id UUID NOT NULL REFERENCES handshake_agreements(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  initiated_by_parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  test_type TEXT NOT NULL,
  score_value NUMERIC(5,2),
  pass_fail_result TEXT CHECK (pass_fail_result IN ('passed', 'failed')),
  analysis_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handshake_test_sessions_handshake ON handshake_test_sessions(handshake_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_handshake_test_sessions_child ON handshake_test_sessions(child_id, created_at DESC);

CREATE TABLE IF NOT EXISTS handshake_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handshake_id UUID NOT NULL UNIQUE REFERENCES handshake_agreements(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'rejected', 'claimed', 'fulfilled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handshake_redemptions_child ON handshake_redemptions(child_id, created_at DESC);

CREATE TABLE IF NOT EXISTS handshake_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handshake_id UUID NOT NULL REFERENCES handshake_agreements(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handshake_audit_log_handshake ON handshake_audit_log(handshake_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_handshake_test_sessions_updated_at ON handshake_test_sessions;
CREATE TRIGGER trg_handshake_test_sessions_updated_at
  BEFORE UPDATE ON handshake_test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_handshake_redemptions_updated_at ON handshake_redemptions;
CREATE TRIGGER trg_handshake_redemptions_updated_at
  BEFORE UPDATE ON handshake_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE handshake_funding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE handshake_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handshake_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handshake_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "handshake_funding_parent_manage" ON handshake_funding_events
FOR ALL USING (
  parent_id = auth.uid() OR current_user_role() = 'admin'
)
WITH CHECK (
  parent_id = auth.uid() OR current_user_role() = 'admin'
);

CREATE POLICY "handshake_test_parent_child_read" ON handshake_test_sessions
FOR SELECT USING (
  child_id = auth.uid() OR
  handshake_id IN (SELECT id FROM handshake_agreements WHERE parent_id = auth.uid()) OR
  current_user_role() = 'admin'
);

CREATE POLICY "handshake_test_parent_create" ON handshake_test_sessions
FOR INSERT WITH CHECK (
  initiated_by_parent_id = auth.uid() OR current_user_role() = 'admin'
);

CREATE POLICY "handshake_test_parent_update" ON handshake_test_sessions
FOR UPDATE USING (
  initiated_by_parent_id = auth.uid() OR current_user_role() = 'admin'
)
WITH CHECK (
  initiated_by_parent_id = auth.uid() OR current_user_role() = 'admin'
);

CREATE POLICY "handshake_redemption_parent_child_manage" ON handshake_redemptions
FOR ALL USING (
  child_id = auth.uid() OR
  handshake_id IN (SELECT id FROM handshake_agreements WHERE parent_id = auth.uid()) OR
  current_user_role() = 'admin'
)
WITH CHECK (
  child_id = auth.uid() OR
  handshake_id IN (SELECT id FROM handshake_agreements WHERE parent_id = auth.uid()) OR
  current_user_role() = 'admin'
);

CREATE POLICY "handshake_audit_parent_child_read" ON handshake_audit_log
FOR SELECT USING (
  handshake_id IN (
    SELECT id
    FROM handshake_agreements
    WHERE parent_id = auth.uid() OR student_id = auth.uid()
  ) OR current_user_role() = 'admin'
);

CREATE POLICY "handshake_audit_insert" ON handshake_audit_log
FOR INSERT WITH CHECK (
  handshake_id IN (
    SELECT id
    FROM handshake_agreements
    WHERE parent_id = auth.uid() OR student_id = auth.uid()
  ) OR current_user_role() = 'admin'
);

CREATE OR REPLACE FUNCTION expire_overdue_handshakes()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE handshake_agreements
  SET status = 'expired',
      expired_at = NOW(),
      updated_at = NOW()
  WHERE status IN (
    'initiated',
    'funded',
    'pending_acceptance',
    'accepted',
    'task_in_progress',
    'awaiting_test_initiation',
    'testing_in_progress',
    'scored_passed',
    'scored_failed',
    'awaiting_parent_redemption_review',
    'approved_for_claim',
    'retake_required',
    -- Legacy statuses
    'pending',
    'active',
    'completed',
    'claimable'
  )
  AND due_date < CURRENT_DATE;

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION evaluate_handshake_progress_sql(p_handshake_id UUID)
RETURNS VOID AS $$
DECLARE
  h handshake_agreements%ROWTYPE;
  v_value NUMERIC := 0;
  v_target NUMERIC := 0;
  v_percent NUMERIC := 0;
  v_completed BOOLEAN := FALSE;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT * INTO h
  FROM handshake_agreements
  WHERE id = p_handshake_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF h.status IN ('fulfilled', 'claimed', 'cancelled', 'expired', 'testing_in_progress', 'awaiting_parent_redemption_review', 'approved_for_claim') THEN
    RETURN;
  END IF;

  IF h.due_date < CURRENT_DATE THEN
    UPDATE handshake_agreements
    SET status = 'expired',
        expired_at = COALESCE(expired_at, NOW()),
        updated_at = NOW()
    WHERE id = h.id;

    RETURN;
  END IF;

  v_target := NULLIF(h.target_value, 0);

  IF h.challenge_type = 'quest_completion' THEN
    SELECT COUNT(*)::NUMERIC INTO v_value
    FROM daily_quests dq
    WHERE dq.student_id = h.student_id
      AND dq.status = 'completed'
      AND dq.date BETWEEN h.start_date AND h.due_date;
  ELSIF h.challenge_type = 'words_mastered' THEN
    SELECT COUNT(*)::NUMERIC INTO v_value
    FROM student_word_progress swp
    WHERE swp.student_id = h.student_id
      AND swp.status = 'mastered'
      AND swp.last_practiced_at::date BETWEEN h.start_date AND h.due_date;
  ELSE
    SELECT COALESCE(MAX(metric_value), 0) INTO v_value
    FROM handshake_progress_events e
    WHERE e.handshake_id = h.id
      AND e.created_at::date BETWEEN h.start_date AND h.due_date;
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
        WHEN v_completed THEN 'awaiting_test_initiation'
        WHEN h.accepted_at IS NOT NULL THEN 'task_in_progress'
        ELSE h.status
      END,
      task_completed_at = CASE WHEN v_completed THEN COALESCE(h.task_completed_at, v_now) ELSE h.task_completed_at END,
      updated_at = NOW()
  WHERE id = h.id;
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
    WHERE status IN (
      'accepted',
      'task_in_progress',
      'awaiting_test_initiation',
      -- legacy
      'active',
      'pending',
      'completed'
    )
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
