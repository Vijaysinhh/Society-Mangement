-- Persistent read state for dynamically generated society-admin notifications.
-- Apply after 017_watchman_weekly_schedules.sql.

CREATE TABLE society_admin_notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  admin_id UUID NOT NULL REFERENCES society_admins(id) ON DELETE CASCADE,
  notification_key TEXT NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT society_admin_notification_key_not_blank CHECK (length(trim(notification_key)) > 0),
  CONSTRAINT society_admin_notification_read_unique UNIQUE (admin_id, notification_key)
);

CREATE INDEX society_admin_notification_reads_society_idx
  ON society_admin_notification_reads (society_id, admin_id, read_at DESC);

ALTER TABLE society_admin_notification_reads ENABLE ROW LEVEL SECURITY;

-- Access is intentionally limited to authenticated Next.js server routes
-- using the service role, matching the rest of the platform foundation.
