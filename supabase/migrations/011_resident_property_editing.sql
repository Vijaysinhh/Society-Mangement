-- Resident property editing. Apply after 010_resident_vehicle_onboarding.sql.
-- BHK/floor and the resident's owner/tenant role are updated atomically.

CREATE OR REPLACE FUNCTION update_resident_property(
  p_society_id UUID,
  p_resident_id UUID,
  p_assignment_id UUID,
  p_bedroom_count INTEGER,
  p_floor INTEGER,
  p_assignment_role TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignment unit_assignments%ROWTYPE;
  v_unit units%ROWTYPE;
BEGIN
  IF p_assignment_role NOT IN ('owner', 'tenant') THEN
    RAISE EXCEPTION 'Choose owner or tenant' USING ERRCODE = '22023';
  END IF;
  IF p_bedroom_count IS NULL OR p_bedroom_count < 1 OR p_bedroom_count > 5 THEN
    RAISE EXCEPTION 'Choose a valid BHK value' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_assignment
  FROM unit_assignments
  WHERE id = p_assignment_id
    AND society_id = p_society_id
    AND resident_id = p_resident_id
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active property assignment not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_unit
  FROM units
  WHERE id = v_assignment.unit_id
    AND society_id = p_society_id
    AND lifecycle_status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active property not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_unit.unit_type = 'flat' AND (p_floor IS NULL OR p_floor < 0) THEN
    RAISE EXCEPTION 'Floor number is required for flats' USING ERRCODE = '22023';
  END IF;

  IF p_assignment_role = 'owner' AND EXISTS (
    SELECT 1 FROM unit_assignments
    WHERE unit_id = v_unit.id
      AND status = 'active'
      AND assignment_role = 'owner'
      AND id <> v_assignment.id
  ) THEN
    RAISE EXCEPTION 'This property already has an active owner' USING ERRCODE = '23505';
  END IF;

  UPDATE units
  SET bedroom_count = p_bedroom_count,
      floor = CASE WHEN unit_type = 'flat' THEN p_floor ELSE NULL END
  WHERE id = v_unit.id
  RETURNING * INTO v_unit;

  UPDATE unit_assignments
  SET assignment_role = p_assignment_role
  WHERE id = v_assignment.id
  RETURNING * INTO v_assignment;

  INSERT INTO audit_events (
    society_id, actor_type, actor_id, action, entity_type, entity_id, metadata
  ) VALUES (
    p_society_id, 'resident', p_resident_id, 'resident.property_updated',
    'unit_assignment', v_assignment.id,
    jsonb_build_object(
      'unit_id', v_unit.id,
      'bedroom_count', v_unit.bedroom_count,
      'floor', v_unit.floor,
      'assignment_role', v_assignment.assignment_role
    )
  );

  RETURN jsonb_build_object(
    'assignment', jsonb_build_object(
      'id', v_assignment.id,
      'role', v_assignment.assignment_role,
      'startDate', v_assignment.start_date,
      'unit', to_jsonb(v_unit)
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION update_resident_property(UUID, UUID, UUID, INTEGER, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_resident_property(UUID, UUID, UUID, INTEGER, INTEGER, TEXT) TO service_role;

COMMENT ON FUNCTION update_resident_property IS
  'Atomically updates a resident-owned assignment role and its unit BHK/floor after server-side session authorization.';
