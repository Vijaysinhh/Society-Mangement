-- Society amenities and resident booking workflow.
-- Apply after 015_community_management.sql.

CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  timing TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0),
  availability TEXT[] NOT NULL DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID NOT NULL REFERENCES society_admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT amenities_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT amenities_timing_not_blank CHECK (length(trim(timing)) > 0)
);

CREATE TABLE amenity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE RESTRICT,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  reviewed_by UUID REFERENCES society_admins(id) ON DELETE RESTRICT,
  reviewed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT amenity_booking_slot_not_blank CHECK (length(trim(time_slot)) > 0),
  CONSTRAINT amenity_booking_review_state CHECK (
    (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR
    (status IN ('approved', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL) OR
    status = 'cancelled'
  ),
  CONSTRAINT amenity_booking_cancel_state CHECK (status <> 'cancelled' OR cancelled_at IS NOT NULL),
  CONSTRAINT amenity_booking_payment_state CHECK (payment_status <> 'paid' OR status = 'approved')
);

CREATE UNIQUE INDEX amenity_active_slot_unique
  ON amenity_bookings (amenity_id, booking_date, lower(time_slot))
  WHERE status IN ('pending', 'approved');
CREATE INDEX amenities_society_status_idx ON amenities (society_id, status, name);
CREATE INDEX amenity_bookings_society_date_idx ON amenity_bookings (society_id, booking_date, status);
CREATE INDEX amenity_bookings_resident_idx ON amenity_bookings (resident_id, created_at DESC);

CREATE TRIGGER amenities_set_updated_at BEFORE UPDATE ON amenities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER amenity_bookings_set_updated_at BEFORE UPDATE ON amenity_bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;

-- Access is intentionally limited to authenticated Next.js server routes
-- using the service role, matching the rest of the platform foundation.
