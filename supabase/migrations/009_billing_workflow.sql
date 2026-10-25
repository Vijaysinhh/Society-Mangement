-- Maintenance billing and manually verified resident payments.
-- Apply after 008_issue_workflow.sql.

CREATE TABLE maintenance_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES society_admins(id) ON DELETE RESTRICT,
  billing_period DATE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Monthly maintenance',
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'payment_pending', 'paid', 'void')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_bills_period_first_day CHECK (billing_period = date_trunc('month', billing_period)::date),
  CONSTRAINT maintenance_bills_due_after_period CHECK (due_date >= billing_period),
  CONSTRAINT maintenance_bills_paid_state CHECK ((status = 'paid' AND paid_at IS NOT NULL) OR (status <> 'paid' AND paid_at IS NULL))
);

CREATE UNIQUE INDEX maintenance_bills_unit_period_unique ON maintenance_bills (society_id, unit_id, billing_period);
CREATE INDEX maintenance_bills_society_status_idx ON maintenance_bills (society_id, status, due_date);
CREATE INDEX maintenance_bills_unit_time_idx ON maintenance_bills (unit_id, billing_period DESC);
CREATE TRIGGER maintenance_bills_set_updated_at BEFORE UPDATE ON maintenance_bills FOR EACH ROW EXECUTE FUNCTION set_updated_at();
ALTER TABLE maintenance_bills ENABLE ROW LEVEL SECURITY;

CREATE TABLE bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  bill_id UUID NOT NULL REFERENCES maintenance_bills(id) ON DELETE RESTRICT,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE RESTRICT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'bank_transfer', 'cash', 'cheque')),
  payment_reference TEXT NOT NULL,
  proof_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  review_note TEXT,
  reviewed_by UUID REFERENCES society_admins(id) ON DELETE RESTRICT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  CONSTRAINT bill_payments_reference_not_blank CHECK (length(trim(payment_reference)) >= 3),
  CONSTRAINT bill_payments_review_state CHECK (
    (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR
    (status IN ('confirmed', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
  ),
  CONSTRAINT bill_payments_rejection_note CHECK (status <> 'rejected' OR coalesce(length(trim(review_note)), 0) > 0)
);

CREATE UNIQUE INDEX bill_payments_one_pending_per_bill ON bill_payments (bill_id) WHERE status = 'pending';
CREATE INDEX bill_payments_society_status_idx ON bill_payments (society_id, status, submitted_at DESC);
CREATE INDEX bill_payments_resident_time_idx ON bill_payments (resident_id, submitted_at DESC);
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-proofs', 'payment-proofs', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE OR REPLACE FUNCTION review_bill_payment(p_payment_id UUID, p_society_id UUID, p_admin_id UUID, p_decision TEXT, p_note TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_payment bill_payments%ROWTYPE;
BEGIN
  IF p_decision NOT IN ('confirmed', 'rejected') THEN RAISE EXCEPTION 'Invalid payment decision'; END IF;
  SELECT * INTO v_payment FROM bill_payments WHERE id = p_payment_id AND society_id = p_society_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF v_payment.status <> 'pending' THEN RAISE EXCEPTION 'Payment has already been reviewed'; END IF;
  IF p_decision = 'rejected' AND coalesce(length(trim(p_note)), 0) = 0 THEN RAISE EXCEPTION 'Rejection note is required'; END IF;
  UPDATE bill_payments SET status = p_decision, review_note = nullif(trim(p_note), ''), reviewed_by = p_admin_id, reviewed_at = now() WHERE id = p_payment_id;
  IF p_decision = 'confirmed' THEN
    UPDATE maintenance_bills SET status = 'paid', paid_at = now() WHERE id = v_payment.bill_id AND society_id = p_society_id AND status = 'payment_pending';
  ELSE
    UPDATE maintenance_bills SET status = 'unpaid' WHERE id = v_payment.bill_id AND society_id = p_society_id AND status = 'payment_pending';
  END IF;
  RETURN v_payment.bill_id;
END;
$$;

REVOKE ALL ON FUNCTION review_bill_payment(UUID, UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION review_bill_payment(UUID, UUID, UUID, TEXT, TEXT) TO service_role;

COMMENT ON TABLE maintenance_bills IS 'Monthly unit maintenance charges created by society administrators.';
COMMENT ON TABLE bill_payments IS 'Resident payment submissions awaiting society-admin verification.';
