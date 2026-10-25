-- Society-admin resident transfer and access restoration.
-- Apply after 012_property_management.sql.

CREATE OR REPLACE FUNCTION admin_transfer_resident(
  p_society_id UUID,
  p_admin_id UUID,
  p_resident_id UUID,
  p_assignment_id UUID,
  p_target_unit_id UUID,
  p_assignment_role TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_source unit_assignments%ROWTYPE;
  v_target units%ROWTYPE;
  v_new unit_assignments%ROWTYPE;
BEGIN
  IF p_assignment_role NOT IN ('owner', 'tenant') THEN
    RAISE EXCEPTION 'Choose owner or tenant' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_source FROM unit_assignments
  WHERE id = p_assignment_id AND society_id = p_society_id
    AND resident_id = p_resident_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active assignment not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_target FROM units
  WHERE id = p_target_unit_id AND society_id = p_society_id AND lifecycle_status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Target property not found' USING ERRCODE = 'P0002'; END IF;
  IF v_source.unit_id = p_target_unit_id THEN RAISE EXCEPTION 'Choose a different property' USING ERRCODE = '22023'; END IF;
  IF p_assignment_role = 'owner' AND EXISTS (
    SELECT 1 FROM unit_assignments WHERE unit_id = p_target_unit_id
      AND status = 'active' AND assignment_role = 'owner'
  ) THEN RAISE EXCEPTION 'Target property already has an active owner' USING ERRCODE = '23505'; END IF;

  UPDATE unit_assignments SET status = 'ended', end_date = CURRENT_DATE WHERE id = v_source.id;
  INSERT INTO unit_assignments (society_id, unit_id, resident_id, assignment_role)
  VALUES (p_society_id, p_target_unit_id, p_resident_id, p_assignment_role) RETURNING * INTO v_new;
  UPDATE vehicles SET unit_id = p_target_unit_id
  WHERE society_id = p_society_id AND resident_id = p_resident_id
    AND unit_id = v_source.unit_id AND status = 'active';
  UPDATE residents SET status = 'active' WHERE id = p_resident_id AND society_id = p_society_id;
  INSERT INTO audit_events (society_id, actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES (p_society_id, 'society_admin', p_admin_id, 'resident.transferred', 'resident', p_resident_id,
    jsonb_build_object('from_unit_id', v_source.unit_id, 'to_unit_id', p_target_unit_id,
      'old_assignment_id', v_source.id, 'new_assignment_id', v_new.id, 'role', p_assignment_role));
  RETURN jsonb_build_object('assignment_id', v_new.id, 'unit_id', p_target_unit_id, 'role', p_assignment_role);
END;
$$;

CREATE OR REPLACE FUNCTION admin_restore_resident_access(
  p_society_id UUID,
  p_admin_id UUID,
  p_resident_id UUID,
  p_assignment_id UUID
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_assignment unit_assignments%ROWTYPE;
BEGIN
  IF EXISTS (SELECT 1 FROM unit_assignments WHERE society_id = p_society_id AND resident_id = p_resident_id AND status = 'active') THEN
    RAISE EXCEPTION 'Resident already has active property access' USING ERRCODE = '23505';
  END IF;
  SELECT * INTO v_assignment FROM unit_assignments
  WHERE id = p_assignment_id AND society_id = p_society_id
    AND resident_id = p_resident_id AND status = 'ended' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ended assignment not found' USING ERRCODE = 'P0002'; END IF;
  IF NOT EXISTS (SELECT 1 FROM units WHERE id = v_assignment.unit_id AND society_id = p_society_id AND lifecycle_status <> 'inactive') THEN
    RAISE EXCEPTION 'Property is archived' USING ERRCODE = '22023';
  END IF;
  IF v_assignment.assignment_role = 'owner' AND EXISTS (
    SELECT 1 FROM unit_assignments WHERE unit_id = v_assignment.unit_id
      AND status = 'active' AND assignment_role = 'owner'
  ) THEN RAISE EXCEPTION 'Property already has an active owner' USING ERRCODE = '23505'; END IF;
  UPDATE unit_assignments SET status = 'active', start_date = CURRENT_DATE, end_date = NULL WHERE id = v_assignment.id;
  UPDATE residents SET status = 'active' WHERE id = p_resident_id AND society_id = p_society_id;
  INSERT INTO audit_events (society_id, actor_type, actor_id, action, entity_type, entity_id, metadata)
  VALUES (p_society_id, 'society_admin', p_admin_id, 'resident.access_restored', 'resident', p_resident_id,
    jsonb_build_object('unit_id', v_assignment.unit_id, 'assignment_id', v_assignment.id));
  RETURN jsonb_build_object('assignment_id', v_assignment.id, 'unit_id', v_assignment.unit_id, 'role', v_assignment.assignment_role);
END;
$$;

REVOKE ALL ON FUNCTION admin_transfer_resident(UUID, UUID, UUID, UUID, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_restore_resident_access(UUID, UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_transfer_resident(UUID, UUID, UUID, UUID, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION admin_restore_resident_access(UUID, UUID, UUID, UUID) TO service_role;
