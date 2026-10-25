-- Society community posts, reactions, and versioned guidelines.
-- Apply after 014_watchman_duty_management.sql.

CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  author_type TEXT NOT NULL CHECK (author_type IN ('society_admin', 'resident')),
  author_id UUID NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'post' CHECK (post_type IN ('announcement', 'post')),
  message TEXT NOT NULL,
  category TEXT CHECK (category IN ('safety', 'maintenance', 'event', 'general')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT community_posts_message_not_blank CHECK (length(trim(message)) > 0),
  CONSTRAINT community_posts_announcement_author CHECK (post_type <> 'announcement' OR author_type = 'society_admin')
);

CREATE TABLE community_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL DEFAULT 'like' CHECK (reaction = 'like'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, resident_id, reaction)
);

CREATE TABLE community_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'archived')),
  created_by UUID NOT NULL REFERENCES society_admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT community_guidelines_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT community_guidelines_content_not_blank CHECK (length(trim(content)) > 0),
  CONSTRAINT community_guidelines_version_positive CHECK (version_number > 0),
  UNIQUE (society_id, version_number)
);

CREATE INDEX community_posts_society_time_idx ON community_posts (society_id, status, created_at DESC);
CREATE INDEX community_reactions_post_idx ON community_post_reactions (post_id);
CREATE INDEX community_guidelines_society_version_idx ON community_guidelines (society_id, version_number DESC);

CREATE TRIGGER community_posts_set_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER community_guidelines_set_updated_at BEFORE UPDATE ON community_guidelines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_guidelines ENABLE ROW LEVEL SECURITY;

-- Access is intentionally limited to authenticated Next.js server routes
-- using the service role, matching the rest of the platform foundation.
