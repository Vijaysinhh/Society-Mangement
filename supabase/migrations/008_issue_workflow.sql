-- Resident issue reporting and society-admin resolution workflow.
-- Apply after 007_parcel_workflow.sql.

CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE RESTRICT,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'water', 'plumbing', 'electrical', 'cleaning', 'noise', 'security', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  photo_path TEXT,
  admin_note TEXT,
  handled_by UUID REFERENCES society_admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT issues_title_not_blank CHECK (length(trim(title)) >= 3),
  CONSTRAINT issues_description_not_blank CHECK (length(trim(description)) >= 10),
  CONSTRAINT issues_resolution_state CHECK (status NOT IN ('resolved', 'closed') OR (resolved_at IS NOT NULL AND coalesce(length(trim(admin_note)), 0) > 0))
);

CREATE INDEX issues_society_status_idx ON issues (society_id, status, created_at DESC);
CREATE INDEX issues_resident_time_idx ON issues (resident_id, created_at DESC);
CREATE INDEX issues_unit_time_idx ON issues (unit_id, created_at DESC);
CREATE TRIGGER issues_set_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION set_updated_at();
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('issue-photos', 'issue-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE issues IS 'Resident-reported society issues managed by society administrators.';
