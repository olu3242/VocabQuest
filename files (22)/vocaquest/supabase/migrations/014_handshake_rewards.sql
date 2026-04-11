-- 014_handshake_rewards.sql
-- Parent-child handshake challenges and reward lifecycle

CREATE TABLE IF NOT EXISTS handshake_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN (
    'quest_completion',
    'pronunciation_score',
    'sentence_score',
    'streak_target',
    'words_mastered',
    'boss_battle_completion',
    'speaking_confidence_improvement',
    'hybrid_goal'
  )),
  target_metric TEXT NOT NULL,
  target_value NUMERIC(10,2) NOT NULL CHECK (target_value >= 0),
  min_result_value NUMERIC(10,2),
  progress_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  progress_percent NUMERIC(5,2),
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'xp_bonus',
    'badge_unlock',
    'unlockable_item',
    'parent_real_world_reward',
    'mixed_reward'
  )),
  reward_description TEXT NOT NULL,
  reward_value NUMERIC(10,2),
  reward_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_type TEXT NOT NULL DEFAULT 'automatic',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'active',
    'completed',
    'claimable',
    'claimed',
    'fulfilled',
    'expired',
    'cancelled'
  )),
  child_accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  claimable_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_handshake_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_claimable_requires_completion CHECK (
    claimable_at IS NULL OR completed_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_handshake_parent_status ON handshake_agreements(parent_id, status);
CREATE INDEX IF NOT EXISTS idx_handshake_student_status ON handshake_agreements(student_id, status);
CREATE INDEX IF NOT EXISTS idx_handshake_end_date ON handshake_agreements(end_date);

CREATE TABLE IF NOT EXISTS handshake_progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handshake_id UUID NOT NULL REFERENCES handshake_agreements(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metric_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  source_type TEXT NOT NULL,
  source_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handshake_progress_events_handshake ON handshake_progress_events(handshake_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_handshake_progress_events_student ON handshake_progress_events(student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS handshake_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handshake_id UUID NOT NULL UNIQUE REFERENCES handshake_agreements(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claim_status TEXT NOT NULL DEFAULT 'submitted' CHECK (claim_status IN ('submitted', 'approved', 'fulfilled', 'rejected')),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parent_confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handshake_claims_student ON handshake_claims(student_id, claim_status);

CREATE TABLE IF NOT EXISTS handshake_reward_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_metric TEXT NOT NULL,
  target_value NUMERIC(10,2) NOT NULL,
  reward_type TEXT NOT NULL,
  reward_description TEXT NOT NULL,
  reward_value NUMERIC(10,2),
  reward_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handshake_reward_templates_parent ON handshake_reward_templates(parent_id, created_at DESC);

CREATE OR REPLACE FUNCTION expire_overdue_handshakes()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE handshake_agreements
  SET status = 'expired',
      updated_at = NOW()
  WHERE status IN ('pending', 'active', 'completed', 'claimable')
    AND end_date < CURRENT_DATE;

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_handshake_progress_percent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_value > 0 THEN
    NEW.progress_percent := LEAST(100, ROUND((NEW.progress_value / NEW.target_value) * 100, 2));
  ELSE
    NEW.progress_percent := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_handshake_progress_percent ON handshake_agreements;
CREATE TRIGGER trg_set_handshake_progress_percent
  BEFORE INSERT OR UPDATE OF progress_value, target_value
  ON handshake_agreements
  FOR EACH ROW
  EXECUTE FUNCTION set_handshake_progress_percent();

DROP TRIGGER IF EXISTS trg_handshake_agreements_updated_at ON handshake_agreements;
CREATE TRIGGER trg_handshake_agreements_updated_at
  BEFORE UPDATE ON handshake_agreements
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_handshake_claims_updated_at ON handshake_claims;
CREATE TRIGGER trg_handshake_claims_updated_at
  BEFORE UPDATE ON handshake_claims
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_handshake_reward_templates_updated_at ON handshake_reward_templates;
CREATE TRIGGER trg_handshake_reward_templates_updated_at
  BEFORE UPDATE ON handshake_reward_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE handshake_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE handshake_progress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE handshake_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE handshake_reward_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "handshake_parent_create" ON handshake_agreements
FOR INSERT WITH CHECK (
  current_user_role() = 'parent'
  AND parent_id = auth.uid()
  AND student_id IN (
    SELECT student_id
    FROM parent_child_links
    WHERE parent_id = auth.uid() AND verified = TRUE
  )
);

CREATE POLICY "handshake_parent_manage" ON handshake_agreements
FOR UPDATE USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "handshake_parent_read" ON handshake_agreements
FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "handshake_student_read" ON handshake_agreements
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "handshake_student_update" ON handshake_agreements
FOR UPDATE USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "handshake_admin_all" ON handshake_agreements
FOR ALL USING (current_user_role() = 'admin')
WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "handshake_progress_parent_student_read" ON handshake_progress_events
FOR SELECT USING (
  student_id = auth.uid() OR handshake_id IN (
    SELECT id FROM handshake_agreements WHERE parent_id = auth.uid()
  )
);

CREATE POLICY "handshake_progress_parent_student_insert" ON handshake_progress_events
FOR INSERT WITH CHECK (
  student_id = auth.uid() OR handshake_id IN (
    SELECT id FROM handshake_agreements WHERE parent_id = auth.uid()
  )
);

CREATE POLICY "handshake_progress_admin_all" ON handshake_progress_events
FOR ALL USING (current_user_role() = 'admin')
WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "handshake_claim_student_create" ON handshake_claims
FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "handshake_claim_student_read" ON handshake_claims
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "handshake_claim_parent_manage" ON handshake_claims
FOR SELECT USING (
  handshake_id IN (
    SELECT id FROM handshake_agreements WHERE parent_id = auth.uid()
  )
);

CREATE POLICY "handshake_claim_parent_update" ON handshake_claims
FOR UPDATE USING (
  handshake_id IN (
    SELECT id FROM handshake_agreements WHERE parent_id = auth.uid()
  )
)
WITH CHECK (
  handshake_id IN (
    SELECT id FROM handshake_agreements WHERE parent_id = auth.uid()
  )
);

CREATE POLICY "handshake_claim_admin_all" ON handshake_claims
FOR ALL USING (current_user_role() = 'admin')
WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "handshake_templates_parent_own" ON handshake_reward_templates
FOR ALL USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "handshake_templates_admin_all" ON handshake_reward_templates
FOR ALL USING (current_user_role() = 'admin')
WITH CHECK (current_user_role() = 'admin');
