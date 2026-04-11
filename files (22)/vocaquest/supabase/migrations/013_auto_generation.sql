CREATE TABLE IF NOT EXISTS auto_generation_settings (
  id INTEGER PRIMARY KEY,
  enable_auto_generation BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO auto_generation_settings (id, enable_auto_generation)
VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS auto_generation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL,
  total_inserted INTEGER NOT NULL DEFAULT 0,
  failed_batches INTEGER NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE auto_generation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_generation_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auto_generation_settings_admin_read ON auto_generation_settings;
DROP POLICY IF EXISTS auto_generation_settings_admin_update ON auto_generation_settings;
DROP POLICY IF EXISTS auto_generation_runs_admin_read ON auto_generation_runs;

CREATE POLICY auto_generation_settings_admin_read
  ON auto_generation_settings FOR SELECT
  USING (current_user_role() = 'admin');

CREATE POLICY auto_generation_settings_admin_update
  ON auto_generation_settings FOR UPDATE
  USING (current_user_role() = 'admin');

CREATE POLICY auto_generation_runs_admin_read
  ON auto_generation_runs FOR SELECT
  USING (current_user_role() = 'admin');

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('auto-generate-words-every-hour')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'auto-generate-words-every-hour'
);

SELECT cron.schedule(
  'auto-generate-words-every-hour',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/auto-generate-words',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'apikey', current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);