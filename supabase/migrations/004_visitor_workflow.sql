-- Core visitor workflow. Apply after 003_resident_self_onboarding.sql.
-- Access is server-side through the service role. Every route derives the
-- society and account identity from the opaque application session.

CREATE TABLE visitor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  watchman_id UUID NOT NULL REFERENCES watchmen(id) ON DELETE RESTRICT,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'denied', 'checked_in', 'checked_out', 'cancelled')),
  decision_by UUID REFERENCES residents(id) ON DELETE RESTRICT,
  decision_at TIMESTAMPTZ,
  denial_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT visitor_name_not_blank CHECK (length(trim(visitor_name)) > 0),
  CONSTRAINT visitor_phone_not_blank CHECK (length(trim(visitor_phone)) >= 6),
  CONSTRAINT visitor_decision_state CHECK (
    (status = 'pending' AND decision_by IS NULL AND decision_at IS NULL) OR
    (status = 'cancelled') OR
    (status IN ('approved', 'denied', 'checked_in', 'checked_out') AND decision_by IS NOT NULL AND decision_at IS NOT NULL)
  ),
  CONSTRAINT visitor_denial_reason_state CHECK (status <> 'denied' OR length(trim(denial_reason)) > 0),
  CONSTRAINT visitor_check_in_state CHECK (status NOT IN ('checked_in', 'checked_out') OR checked_in_at IS NOT NULL),
  CONSTRAINT visitor_check_out_state CHECK (status <> 'checked_out' OR checked_out_at IS NOT NULL),
  CONSTRAINT visitor_event_order CHECK (
    (decision_at IS NULL OR decision_at >= requested_at) AND
    (checked_in_at IS NULL OR checked_in_at >= requested_at) AND
    (checked_out_at IS NULL OR (checked_in_at IS NOT NULL AND checked_out_at >= checked_in_at))
  )
);

CREATE INDEX visitor_requests_society_time_idx ON visitor_requests (society_id, requested_at DESC);
CREATE INDEX visitor_requests_unit_time_idx ON visitor_requests (unit_id, requested_at DESC);
CREATE INDEX visitor_requests_watchman_time_idx ON visitor_requests (watchman_id, requested_at DESC);
CREATE INDEX visitor_requests_pending_idx ON visitor_requests (society_id, status, requested_at DESC)
  WHERE status = 'pending';

CREATE TRIGGER visitor_requests_set_updated_at
  BEFORE UPDATE ON visitor_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE visitor_requests ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE visitor_requests IS 'Resident-approved visitor gate requests with auditable lifecycle timestamps.';
