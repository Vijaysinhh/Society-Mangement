-- Visitor Management System: clean platform foundation
-- Apply to the development Supabase project first.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE superadmins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT superadmins_email_not_blank CHECK (length(trim(email)) > 3)
);

CREATE UNIQUE INDEX superadmins_email_unique
  ON superadmins (lower(email));

CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '',
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  contact_person TEXT NOT NULL DEFAULT '',
  admin_phone TEXT NOT NULL DEFAULT '',
  villas INTEGER NOT NULL DEFAULT 0 CHECK (villas >= 0),
  bungalows INTEGER NOT NULL DEFAULT 0 CHECK (bungalows >= 0),
  flats INTEGER NOT NULL DEFAULT 0 CHECK (flats >= 0),
  total_properties INTEGER GENERATED ALWAYS AS (villas + bungalows + flats) STORED,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT societies_name_not_blank CHECK (length(trim(name)) >= 2),
  CONSTRAINT societies_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX societies_slug_unique ON societies (lower(slug));
CREATE INDEX societies_status_idx ON societies (status);

-- Society administrators are post accounts, not personal identities. The
-- superadmin chooses the username/password; a current post holder may change
-- the password later without changing the account.
CREATE TABLE society_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  post_name TEXT NOT NULL,
  holder_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deactivated')),
  created_by UUID NOT NULL REFERENCES superadmins(id) ON DELETE RESTRICT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT society_admins_username_format
    CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$'),
  CONSTRAINT society_admins_post_name_not_blank CHECK (length(trim(post_name)) > 0)
);

CREATE UNIQUE INDEX society_admins_username_unique
  ON society_admins (lower(username));
CREATE UNIQUE INDEX society_admins_one_primary_per_society
  ON society_admins (society_id)
  WHERE is_primary = TRUE AND status <> 'deactivated';
CREATE INDEX society_admins_society_idx ON society_admins (society_id, status);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  account_type TEXT NOT NULL
    CHECK (account_type IN ('superadmin', 'society_admin', 'resident', 'watchman')),
  account_id UUID NOT NULL,
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT auth_sessions_expiry_after_creation CHECK (expires_at > created_at)
);

CREATE INDEX auth_sessions_active_token_idx
  ON auth_sessions (token_hash, expires_at)
  WHERE revoked_at IS NULL;
CREATE INDEX auth_sessions_account_idx
  ON auth_sessions (account_type, account_id);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES societies(id) ON DELETE RESTRICT,
  actor_type TEXT NOT NULL
    CHECK (actor_type IN ('system', 'superadmin', 'society_admin', 'resident', 'watchman')),
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_society_time_idx
  ON audit_events (society_id, created_at DESC);
CREATE INDEX audit_events_actor_time_idx
  ON audit_events (actor_type, actor_id, created_at DESC);

CREATE TRIGGER superadmins_set_updated_at
  BEFORE UPDATE ON superadmins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER societies_set_updated_at
  BEFORE UPDATE ON societies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER society_admins_set_updated_at
  BEFORE UPDATE ON society_admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE superadmins ENABLE ROW LEVEL SECURITY;
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies are created. All foundation access goes
-- through authenticated Next.js server routes using the service role.

CREATE OR REPLACE FUNCTION provision_society_with_primary_admin(
  p_name TEXT,
  p_slug TEXT,
  p_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_phone TEXT,
  p_contact_person TEXT,
  p_villas INTEGER,
  p_bungalows INTEGER,
  p_flats INTEGER,
  p_admin_username TEXT,
  p_admin_password_hash TEXT,
  p_admin_name TEXT,
  p_admin_phone TEXT,
  p_created_by UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_society societies%ROWTYPE;
  v_admin society_admins%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM superadmins WHERE id = p_created_by AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Active superadmin required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO societies (
    name, slug, address, city, state, contact_person, admin_phone,
    villas, bungalows, flats
  ) VALUES (
    trim(p_name), lower(trim(p_slug)), trim(p_address), trim(p_city),
    trim(COALESCE(p_state, '')), trim(COALESCE(p_contact_person, '')),
    trim(COALESCE(p_phone, '')), COALESCE(p_villas, 0),
    COALESCE(p_bungalows, 0), COALESCE(p_flats, 0)
  ) RETURNING * INTO v_society;

  INSERT INTO society_admins (
    society_id, username, password_hash, post_name, holder_name, phone,
    is_primary, status, created_by
  ) VALUES (
    v_society.id, lower(trim(p_admin_username)), p_admin_password_hash,
    'Primary Society Administrator', trim(COALESCE(p_admin_name, '')),
    trim(COALESCE(p_admin_phone, '')), TRUE, 'active', p_created_by
  ) RETURNING * INTO v_admin;

  INSERT INTO audit_events (
    society_id, actor_type, actor_id, action, entity_type, entity_id, metadata
  ) VALUES (
    v_society.id, 'superadmin', p_created_by, 'society.provisioned',
    'society', v_society.id,
    jsonb_build_object('primary_admin_id', v_admin.id, 'admin_username', v_admin.username)
  );

  RETURN jsonb_build_object(
    'society', to_jsonb(v_society),
    'admin', to_jsonb(v_admin) - 'password_hash'
  );
END;
$$;

REVOKE ALL ON FUNCTION provision_society_with_primary_admin(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER,
  TEXT, TEXT, TEXT, TEXT, UUID
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION provision_society_with_primary_admin(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER,
  TEXT, TEXT, TEXT, TEXT, UUID
) TO service_role;

COMMIT;
