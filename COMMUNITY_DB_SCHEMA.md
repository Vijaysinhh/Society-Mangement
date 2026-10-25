# Community Management Database Schema

## Overview
This schema defines the database structure for the Community Management System, enabling:
- Admin to post announcements with categorization and scheduling
- Community guidelines management with versioning
- Event management with RSVP tracking
- Resident guideline acknowledgments

---

## Tables

### 1. announcements
Stores all community announcements posted by administrators.

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('safety', 'maintenance', 'event', 'general')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_for TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id),
  FOREIGN KEY (created_by) REFERENCES admins(id),
  INDEX (society_id, created_at DESC),
  INDEX (society_id, status)
);
```

**Fields:**
- `id`: Unique announcement identifier
- `society_id`: References the society this announcement belongs to
- `title`: Announcement title (max 255 chars)
- `content`: Full announcement content
- `category`: Type of announcement (safety, maintenance, event, general)
- `status`: Draft, Scheduled, or Published
- `scheduled_for`: When to publish if scheduled
- `created_at`: When announcement was created
- `updated_at`: When announcement was last modified
- `created_by`: Admin who created the announcement

---

### 2. guidelines
Stores community guidelines with version control.

```sql
CREATE TABLE guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id),
  FOREIGN KEY (created_by) REFERENCES admins(id),
  UNIQUE (society_id, version),
  INDEX (society_id, status),
  INDEX (society_id, created_at DESC)
);
```

**Fields:**
- `id`: Unique guideline identifier
- `society_id`: References the society
- `version`: Version number (e.g., v1.0, v1.1, v2.0)
- `title`: Guideline title
- `content`: Full guideline content
- `status`: Draft, Active, or Archived
- `created_at`: When created
- `updated_at`: When last modified
- `created_by`: Admin who created it

---

### 3. guideline_acknowledgments
Tracks which residents have acknowledged which guideline versions.

```sql
CREATE TABLE guideline_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  resident_id UUID NOT NULL,
  guideline_id UUID NOT NULL,
  guideline_version VARCHAR(50) NOT NULL,
  acknowledged_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (society_id) REFERENCES societies(id),
  FOREIGN KEY (resident_id) REFERENCES residents(id),
  FOREIGN KEY (guideline_id) REFERENCES guidelines(id),
  UNIQUE (resident_id, guideline_id),
  INDEX (society_id, guideline_id),
  INDEX (resident_id, acknowledged_at DESC),
  INDEX (guideline_id, acknowledged_at DESC)
);
```

**Fields:**
- `id`: Unique acknowledgment record id
- `society_id`: References the society
- `resident_id`: References the resident who acknowledged
- `guideline_id`: References the guideline
- `guideline_version`: Version they acknowledged (for historical tracking)
- `acknowledged_at`: Timestamp of acknowledgment

---

### 4. community_events
Stores community events for residents to RSVP.

```sql
CREATE TABLE community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(255),
  capacity INT,
  rsvp_count INT DEFAULT 0,
  status VARCHAR(50) NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id),
  FOREIGN KEY (created_by) REFERENCES admins(id),
  INDEX (society_id, event_date DESC),
  INDEX (society_id, status)
);
```

**Fields:**
- `id`: Unique event identifier
- `society_id`: References the society
- `name`: Event name
- `description`: Event description
- `event_date`: Date of the event
- `event_time`: Time of the event
- `location`: Where the event is held
- `capacity`: Max attendees
- `rsvp_count`: Number of RSVPs
- `status`: Upcoming, Ongoing, Completed, or Cancelled
- `created_at`: When created
- `updated_at`: When last updated
- `created_by`: Admin who created it

---

### 5. community_event_rsvps
Tracks resident RSVPs for community events.

```sql
CREATE TABLE community_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  resident_id UUID NOT NULL,
  rsvp_status VARCHAR(50) NOT NULL CHECK (rsvp_status IN ('interested', 'attending', 'not_attending')),
  rsvped_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (event_id) REFERENCES community_events(id),
  FOREIGN KEY (resident_id) REFERENCES residents(id),
  UNIQUE (event_id, resident_id),
  INDEX (event_id, rsvp_status),
  INDEX (resident_id, event_id)
);
```

**Fields:**
- `id`: Unique RSVP record id
- `event_id`: References the event
- `resident_id`: References the resident
- `rsvp_status`: Interested, Attending, or Not Attending
- `rsvped_at`: When they RSVP'd
- `updated_at`: When status was last changed

---

## Relationships

```
societies
  ├── announcements (society_id)
  ├── guidelines (society_id)
  ├── community_events (society_id)
  └── guideline_acknowledgments (society_id)

admins
  ├── announcements (created_by)
  ├── guidelines (created_by)
  └── community_events (created_by)

residents
  ├── guideline_acknowledgments (resident_id)
  └── community_event_rsvps (resident_id)

guidelines
  ├── guideline_acknowledgments (guideline_id)

community_events
  └── community_event_rsvps (event_id)
```

---

## Queries for Common Operations

### Get all published announcements for a society
```sql
SELECT * FROM announcements
WHERE society_id = $1
AND status = 'published'
AND scheduled_for IS NULL OR scheduled_for <= NOW()
ORDER BY created_at DESC;
```

### Get current active guidelines for a society
```sql
SELECT * FROM guidelines
WHERE society_id = $1
AND status = 'active'
ORDER BY created_at DESC
LIMIT 1;
```

### Check if resident has acknowledged latest guidelines
```sql
SELECT * FROM guideline_acknowledgments
WHERE resident_id = $1
AND guideline_version = (
  SELECT version FROM guidelines
  WHERE society_id = $2 AND status = 'active'
  ORDER BY created_at DESC LIMIT 1
);
```

### Get RSVP count for an event
```sql
SELECT COUNT(*) as rsvp_count
FROM community_event_rsvps
WHERE event_id = $1
AND rsvp_status IN ('attending', 'interested');
```

### Get upcoming events for a society
```sql
SELECT * FROM community_events
WHERE society_id = $1
AND event_date >= CURRENT_DATE
AND status IN ('upcoming', 'ongoing')
ORDER BY event_date, event_time;
```

---

## Indexing Strategy

**Priority Indexes:**
1. `announcements(society_id, status)` - For filtering announcements
2. `guidelines(society_id, status)` - For getting active guidelines
3. `guideline_acknowledgments(resident_id, guideline_id)` - For checking acknowledgments
4. `community_events(society_id, event_date)` - For getting upcoming events
5. `community_event_rsvps(event_id, rsvp_status)` - For RSVP counts

---

## Implementation Notes

### For Neon/PostgreSQL:
- Use `uuid` type for all IDs
- Use `TIMESTAMP` with `DEFAULT NOW()` for automatic timestamps
- Enable Row-Level Security (RLS) to ensure residents only see their society's data
- Create FOREIGN KEY constraints to maintain data integrity

### For Supabase:
- Same schema as above
- Enable RLS policies:
  - Admins can CRUD all community content for their society
  - Residents can only READ announcements and guidelines for their society
  - Residents can CREATE their own guideline acknowledgments
  - Residents can CREATE/UPDATE their own event RSVPs

### Real-time Sync:
- Use Supabase Realtime or custom webhooks to notify residents of:
  - New announcements published
  - New guidelines requiring acknowledgment
  - New events created
  - Event status changes

---

## Growth Considerations

- Add `announcement_attachments` table for images/documents
- Add `announcement_read_status` table to track if residents have read announcements
- Add `community_event_attendee_feedback` table for post-event reviews
- Consider partitioning large tables by `society_id` for multi-tenant performance
