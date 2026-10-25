-- Property-management approval workflow. Apply after 011_resident_property_editing.sql.

CREATE TABLE resident_role_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  assignment_id UUID NOT NULL REFERENCES unit_assignments(id) ON DELETE RESTRICT,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE RESTRICT,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('owner', 'tenant')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES society_admins(id) ON DELETE RESTRICT,
  review_note TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX resident_role_change_one_pending
  ON resident_role_change_requests (assignment_id) WHERE status = 'pending';
CREATE INDEX resident_role_change_society_status
  ON resident_role_change_requests (society_id, status, created_at DESC);
CREATE TRIGGER resident_role_change_requests_set_updated_at BEFORE UPDATE ON resident_role_change_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
ALTER TABLE resident_role_change_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE resident_role_change_requests FROM anon, authenticated;

COMMENT ON TABLE resident_role_change_requests IS
  'Resident owner or tenant role changes awaiting society-admin approval.';

CREATE OR REPLACE FUNCTION review_resident_role_change(
  p_society_id UUID,
  p_request_id UUID,
  p_admin_id UUID,
  p_decision TEXT,
  p_note TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request resident_role_change_requests%ROWTYPE;
  v_assignment unit_assignments%ROWTYPE;
BEGIN
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Choose approve or reject' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_request FROM resident_role_change_requests
  WHERE id = p_request_id AND society_id = p_society_id AND status = 'pending'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending request not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_assignment FROM unit_assignments
  WHERE id = v_request.assignment_id AND society_id = p_society_id AND status = 'active'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active property assignment not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_decision = 'approved' THEN
    UPDATE unit_assignments SET assignment_role = v_request.requested_role
    WHERE id = v_assignment.id;
  END IF;

  UPDATE resident_role_change_requests
  SET status = p_decision, reviewed_by = p_admin_id,
      reviewed_at = now(), review_note = nullif(trim(p_note), '')
  WHERE id = v_request.id;

  INSERT INTO audit_events (society_id, actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES (p_society_id, 'society_admin', p_admin_id,
    'resident.role_change_' || p_decision, 'unit_assignment', v_assignment.id,
    jsonb_build_object('requested_role', v_request.requested_role, 'resident_id', v_request.resident_id));

  RETURN jsonb_build_object('id', v_request.id, 'status', p_decision,
    'assignment_id', v_assignment.id, 'requested_role', v_request.requested_role);
END;
$$;

REVOKE ALL ON FUNCTION review_resident_role_change(UUID, UUID, UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION review_resident_role_change(UUID, UUID, UUID, TEXT, TEXT) TO service_role;
