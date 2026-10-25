-- Private visitor photographs. Apply after 005_visitor_realtime.sql.
-- Files are written and read only by authenticated server routes using the
-- service role; the bucket is intentionally not public.

ALTER TABLE visitor_requests
  ADD COLUMN photo_path TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'visitor-photos',
  'visitor-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON COLUMN visitor_requests.photo_path IS
  'Private Supabase Storage object path for the visitor photograph.';
