-- Persistent watchman clock-in and clock-out history.
-- Apply after 013_resident_management.sql.

CREATE TABLE watchman_duty_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  watchman_id UUID NOT NULL REFERENCES watchmen(id) ON DELETE RESTRICT,
  duty_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'on_duty' CHECK (status IN ('on_duty', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT watchman_duty_checkout_order CHECK (check_out_at IS NULL OR check_out_at >= check_in_at),
  CONSTRAINT watchman_duty_status_state CHECK (
    (status = 'on_duty' AND check_out_at IS NULL) OR
    (status = 'completed' AND check_out_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX watchman_one_open_duty
  ON watchman_duty_logs (watchman_id) WHERE status = 'on_duty';
CREATE INDEX watchman_duty_society_date_idx
  ON watchman_duty_logs (society_id, duty_date DESC, check_in_at DESC);
CREATE INDEX watchman_duty_watchman_date_idx
  ON watchman_duty_logs (watchman_id, duty_date DESC, check_in_at DESC);

CREATE TRIGGER watchman_duty_logs_set_updated_at
  BEFORE UPDATE ON watchman_duty_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE watchman_duty_logs ENABLE ROW LEVEL SECURITY;

-- Access is intentionally limited to authenticated Next.js server routes
-- using the service role, matching the rest of the platform foundation.
