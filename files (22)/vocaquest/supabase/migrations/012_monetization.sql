-- 012_monetization.sql

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

CREATE TABLE IF NOT EXISTS vocab_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE words ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES vocab_packs(id) ON DELETE SET NULL;

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_subscriptions_select_own ON user_subscriptions;
DROP POLICY IF EXISTS user_subscriptions_insert_own ON user_subscriptions;
DROP POLICY IF EXISTS user_subscriptions_update_own ON user_subscriptions;
DROP POLICY IF EXISTS subscription_plans_read_all ON subscription_plans;
DROP POLICY IF EXISTS vocab_packs_read_all ON vocab_packs;

CREATE POLICY user_subscriptions_select_own
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_subscriptions_insert_own
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_subscriptions_update_own
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY subscription_plans_read_all
  ON subscription_plans FOR SELECT
  USING (TRUE);

CREATE POLICY vocab_packs_read_all
  ON vocab_packs FOR SELECT
  USING (TRUE);

INSERT INTO subscription_plans (name, price, features)
SELECT 'Premium', 5, ARRAY['Unlimited words', 'Advanced difficulty', 'Faster XP']
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Premium');

INSERT INTO vocab_packs (name, is_premium)
SELECT 'Core Pack', FALSE
WHERE NOT EXISTS (SELECT 1 FROM vocab_packs WHERE name = 'Core Pack');

INSERT INTO vocab_packs (name, is_premium)
SELECT 'Advanced Pack', TRUE
WHERE NOT EXISTS (SELECT 1 FROM vocab_packs WHERE name = 'Advanced Pack');

UPDATE words
SET pack_id = (SELECT id FROM vocab_packs WHERE name = 'Core Pack' LIMIT 1)
WHERE pack_id IS NULL;

UPDATE words
SET pack_id = (SELECT id FROM vocab_packs WHERE name = 'Advanced Pack' LIMIT 1)
WHERE difficulty = 3;

CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INT DEFAULT 20)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  xp_total INT,
  is_premium BOOLEAN
) AS $$
  SELECT
    sg.student_id,
    p.full_name,
    sg.xp_total,
    EXISTS (
      SELECT 1
      FROM user_subscriptions us
      JOIN subscription_plans sp ON sp.id = us.plan_id
      WHERE us.user_id = sg.student_id
        AND us.status = 'active'
        AND sp.name = 'Premium'
        AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
    ) AS is_premium
  FROM student_gamification sg
  JOIN profiles p ON p.id = sg.student_id
  ORDER BY sg.xp_total DESC
  LIMIT GREATEST(limit_count, 1);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_leaderboard(INT) TO authenticated;