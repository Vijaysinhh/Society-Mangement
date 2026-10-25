-- Resident self-onboarding through a one-time society invitation.
-- Residents enter their own property details; an existing unit is reused by
-- normalized unit number, otherwise it is created during redemption.

ALTER TABLE resident_invitations ALTER COLUMN unit_id DROP NOT NULL;
ALTER TABLE resident_invitations ALTER COLUMN assignment_role DROP NOT NULL;
ALTER TABLE resident_invitations ADD COLUMN invitation_mode TEXT NOT NULL DEFAULT 'society'
  CHECK (invitation_mode IN ('society', 'unit'));

ALTER TABLE resident_invitations ADD CONSTRAINT resident_invitation_mode_fields CHECK (
  (invitation_mode = 'society' AND (
    (redeemed_at IS NULL AND unit_id IS NULL AND assignment_role IS NULL)
    OR (redeemed_at IS NOT NULL AND unit_id IS NOT NULL AND assignment_role IS NOT NULL)
  ))
  OR
  (invitation_mode = 'unit' AND unit_id IS NOT NULL AND assignment_role IS NOT NULL)
);

CREATE OR REPLACE FUNCTION redeem_resident_self_invitation(
  p_token_hash TEXT,
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_password_hash TEXT,
  p_unit_number TEXT,
  p_unit_type TEXT,
  p_floor INTEGER,
  p_area_sqft NUMERIC,
  p_bedroom_count INTEGER,
  p_bathroom_count INTEGER,
  p_assignment_role TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation resident_invitations%ROWTYPE;
  v_unit units%ROWTYPE;
  v_resident residents%ROWTYPE;
  v_assignment unit_assignments%ROWTYPE;
BEGIN
  SELECT * INTO v_invitation
  FROM resident_invitations
  WHERE token_hash = p_token_hash
    AND invitation_mode = 'society'
  FOR UPDATE;

  IF NOT FOUND OR v_invitation.redeemed_at IS NOT NULL OR v_invitation.revoked_at IS NOT NULL OR v_invitation.expires_at <= now() THEN
    RAISE EXCEPTION 'Invitation is invalid or expired' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM societies WHERE id = v_invitation.society_id AND status = 'active') THEN
    RAISE EXCEPTION 'Society workspace is not active' USING ERRCODE = '42501';
  END IF;
  IF length(trim(p_name)) = 0 OR length(trim(p_phone)) < 6 OR length(trim(p_unit_number)) = 0 THEN
    RAISE EXCEPTION 'Name, phone, and unit number are required' USING ERRCODE = '22023';
  END IF;
  IF p_unit_type NOT IN ('villa', 'bungalow', 'flat') THEN
    RAISE EXCEPTION 'Invalid property type' USING ERRCODE = '22023';
  END IF;
  IF p_assignment_role NOT IN ('owner', 'tenant') THEN
    RAISE EXCEPTION 'Invalid resident role' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM residents WHERE society_id = v_invitation.society_id AND phone = trim(p_phone)) THEN
    RAISE EXCEPTION 'Phone number is already registered in this society' USING ERRCODE = '23505';
  END IF;

  SELECT * INTO v_unit FROM units
  WHERE society_id = v_invitation.society_id AND lower(unit_number) = lower(trim(p_unit_number))
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO units (
      society_id, unit_number, unit_type, floor, area_sqft,
      bedroom_count, bathroom_count, lifecycle_status, created_by
    ) VALUES (
      v_invitation.society_id, trim(p_unit_number), p_unit_type, p_floor,
      p_area_sqft, p_bedroom_count, p_bathroom_count, 'active', v_invitation.created_by
    ) RETURNING * INTO v_unit;
  END IF;

  IF p_assignment_role = 'owner' AND EXISTS (
    SELECT 1 FROM unit_assignments
    WHERE unit_id = v_unit.id AND assignment_role = 'owner' AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'This property already has an owner; register as tenant or contact the society administrator' USING ERRCODE = '23505';
  END IF;

  INSERT INTO residents (society_id, phone, email, password_hash, name, status)
  VALUES (
    v_invitation.society_id, trim(p_phone), nullif(lower(trim(p_email)), ''),
    p_password_hash, trim(p_name), 'active'
  ) RETURNING * INTO v_resident;

  INSERT INTO unit_assignments (society_id, unit_id, resident_id, assignment_role)
  VALUES (v_invitation.society_id, v_unit.id, v_resident.id, p_assignment_role)
  RETURNING * INTO v_assignment;

  UPDATE resident_invitations SET
    unit_id = v_unit.id,
    assignment_role = p_assignment_role,
    redeemed_at = now(),
    redeemed_by = v_resident.id
  WHERE id = v_invitation.id;

  INSERT INTO audit_events (
    society_id, actor_type, actor_id, action, entity_type, entity_id, metadata
  ) VALUES (
    v_invitation.society_id, 'resident', v_resident.id, 'resident.self_registered',
    'resident', v_resident.id,
    jsonb_build_object('unit_id', v_unit.id, 'unit_number', v_unit.unit_number, 'assignment_role', p_assignment_role)
  );

  RETURN jsonb_build_object(
    'resident', to_jsonb(v_resident) - 'password_hash',
    'unit', to_jsonb(v_unit),
    'assignment', to_jsonb(v_assignment)
  );
END;
$$;

REVOKE ALL ON FUNCTION redeem_resident_self_invitation(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC, INTEGER, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION redeem_resident_self_invitation(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC, INTEGER, INTEGER, TEXT) TO service_role;
