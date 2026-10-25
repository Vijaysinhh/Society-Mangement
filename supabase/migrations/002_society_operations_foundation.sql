-- Society operations foundation. Apply after 001_platform_foundation.sql.
-- All access remains server-side through the service role; tenant identity is
-- derived from the authenticated application session.

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('villa', 'bungalow', 'flat')),
  floor INTEGER CHECK (floor IS NULL OR floor >= 0),
  area_sqft NUMERIC(10,2) CHECK (area_sqft IS NULL OR area_sqft > 0),
  bedroom_count INTEGER CHECK (bedroom_count IS NULL OR bedroom_count >= 0),
  bathroom_count INTEGER CHECK (bathroom_count IS NULL OR bathroom_count >= 0),
  lifecycle_status TEXT NOT NULL DEFAULT 'active'
    CHECK (lifecycle_status IN ('active', 'maintenance', 'inactive')),
  created_by UUID NOT NULL REFERENCES society_admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT units_number_not_blank CHECK (length(trim(unit_number)) > 0)
);

CREATE UNIQUE INDEX units_society_number_unique ON units (society_id, lower(unit_number));
CREATE INDEX units_society_status_idx ON units (society_id, lifecycle_status);

CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  phone TEXT NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deactivated')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT residents_phone_not_blank CHECK (length(trim(phone)) >= 6),
  CONSTRAINT residents_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE UNIQUE INDEX residents_society_phone_unique ON residents (society_id, phone);
CREATE UNIQUE INDEX residents_society_email_unique ON residents (society_id, lower(email)) WHERE email IS NOT NULL;
CREATE INDEX residents_society_status_idx ON residents (society_id, status);

CREATE TABLE resident_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  assignment_role TEXT NOT NULL CHECK (assignment_role IN ('owner', 'tenant', 'co-owner', 'caretaker')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES society_admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES residents(id) ON DELETE RESTRICT,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT resident_invitation_state CHECK (NOT (redeemed_at IS NOT NULL AND revoked_at IS NOT NULL)),
  CONSTRAINT resident_invitation_expiry CHECK (expires_at > created_at)
);

CREATE INDEX resident_invitations_society_unit_idx ON resident_invitations (society_id, unit_id, created_at DESC);
CREATE INDEX resident_invitations_active_idx ON resident_invitations (token_hash, expires_at)
  WHERE redeemed_at IS NULL AND revoked_at IS NULL;

CREATE TABLE unit_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE RESTRICT,
  assignment_role TEXT NOT NULL CHECK (assignment_role IN ('owner', 'tenant', 'co-owner', 'caretaker')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unit_assignment_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT unit_assignment_end_state CHECK (
    (status = 'active' AND end_date IS NULL) OR (status = 'ended' AND end_date IS NOT NULL)
  )
);

CREATE UNIQUE INDEX unit_assignments_active_resident_unit_unique
  ON unit_assignments (unit_id, resident_id, assignment_role) WHERE status = 'active';
CREATE UNIQUE INDEX unit_assignments_one_active_owner
  ON unit_assignments (unit_id) WHERE status = 'active' AND assignment_role = 'owner';
CREATE INDEX unit_assignments_society_unit_idx ON unit_assignments (society_id, unit_id, status);
CREATE INDEX unit_assignments_society_resident_idx ON unit_assignments (society_id, resident_id, status);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  registration_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_registration_not_blank CHECK (length(trim(registration_number)) >= 4)
);

CREATE UNIQUE INDEX vehicles_society_registration_unique ON vehicles (society_id, upper(registration_number));
CREATE INDEX vehicles_society_unit_idx ON vehicles (society_id, unit_id, status);

CREATE TABLE watchmen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  assigned_area TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deactivated')),
  created_by UUID NOT NULL REFERENCES society_admins(id) ON DELETE RESTRICT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT watchmen_username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$'),
  CONSTRAINT watchmen_name_not_blank CHECK (length(trim(name)) > 0)
);

-- Universal watchman login requires a globally unique username.
CREATE UNIQUE INDEX watchmen_username_unique ON watchmen (lower(username));
CREATE INDEX watchmen_society_status_idx ON watchmen (society_id, status);

CREATE TABLE watchman_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  watchman_id UUID NOT NULL REFERENCES watchmen(id) ON DELETE RESTRICT,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT watchman_shift_dates CHECK (effective_until IS NULL OR effective_until >= effective_from),
  CONSTRAINT watchman_shift_end_state CHECK (
    (status = 'active' AND effective_until IS NULL) OR (status = 'ended' AND effective_until IS NOT NULL)
  )
);

CREATE UNIQUE INDEX watchman_one_active_shift ON watchman_shifts (watchman_id) WHERE status = 'active';
CREATE INDEX watchman_shifts_society_idx ON watchman_shifts (society_id, status);

CREATE TRIGGER units_set_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER residents_set_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER unit_assignments_set_updated_at BEFORE UPDATE ON unit_assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER vehicles_set_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER watchmen_set_updated_at BEFORE UPDATE ON watchmen FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER watchman_shifts_set_updated_at BEFORE UPDATE ON watchman_shifts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchmen ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchman_shifts ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies are created. Foundation access goes through
-- authenticated Next.js server routes using the service role.
