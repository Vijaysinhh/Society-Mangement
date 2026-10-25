-- Enable Postgres change events for the authenticated server-side visitor stream.
-- The browser never receives Supabase credentials or raw replication payloads.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'visitor_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE visitor_requests;
  END IF;
END $$;
