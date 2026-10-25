-- Parcel gate-to-resident workflow. Apply after 006_visitor_photos.sql.

CREATE TABLE parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  watchman_id UUID NOT NULL REFERENCES watchmen(id) ON DELETE RESTRICT,
  recipient_name TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  parcel_type TEXT NOT NULL DEFAULT 'package' CHECK (parcel_type IN ('small', 'medium', 'large', 'package', 'food')),
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'stored' CHECK (status IN ('stored', 'collected')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  collected_at TIMESTAMPTZ,
  collected_by_type TEXT CHECK (collected_by_type IN ('resident', 'watchman')),
  collected_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT parcels_recipient_not_blank CHECK (length(trim(recipient_name)) > 0),
  CONSTRAINT parcels_sender_not_blank CHECK (length(trim(sender_name)) > 0),
  CONSTRAINT parcels_collection_state CHECK (
    (status = 'stored' AND collected_at IS NULL AND collected_by_type IS NULL AND collected_by IS NULL) OR
    (status = 'collected' AND collected_at IS NOT NULL AND collected_by_type IS NOT NULL AND collected_by IS NOT NULL)
  )
);

CREATE INDEX parcels_society_time_idx ON parcels (society_id, received_at DESC);
CREATE INDEX parcels_unit_time_idx ON parcels (unit_id, received_at DESC);
CREATE INDEX parcels_stored_idx ON parcels (society_id, received_at DESC) WHERE status = 'stored';

CREATE TRIGGER parcels_set_updated_at BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE FUNCTION set_updated_at();
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE parcels IS 'Parcels logged at the gate and acknowledged when handed to a resident.';
