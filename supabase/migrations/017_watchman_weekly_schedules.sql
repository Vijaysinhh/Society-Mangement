-- Recurring weekly duty schedule managed by society administrators.
-- Apply after 016_amenity_booking_workflow.sql.

CREATE TABLE watchman_weekly_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  watchman_id UUID NOT NULL REFERENCES watchmen(id) ON DELETE RESTRICT,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by UUID NOT NULL REFERENCES society_admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT watchman_weekly_schedule_unique UNIQUE (watchman_id, day_of_week, start_time, end_time)
);

CREATE INDEX watchman_weekly_schedules_society_day_idx
  ON watchman_weekly_schedules (society_id, day_of_week, start_time);
CREATE INDEX watchman_weekly_schedules_watchman_idx
  ON watchman_weekly_schedules (watchman_id, day_of_week);

CREATE TRIGGER watchman_weekly_schedules_set_updated_at
  BEFORE UPDATE ON watchman_weekly_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE watchman_weekly_schedules ENABLE ROW LEVEL SECURITY;

-- Access is intentionally limited to authenticated Next.js server routes
-- using the service role, matching the rest of the platform foundation.
