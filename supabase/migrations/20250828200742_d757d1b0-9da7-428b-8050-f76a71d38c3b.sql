-- ETAPA 2: Schema Normalization and RLS Policies
-- Fix linter issues and normalize schema

-- 1. Create standardized status enum for all entities
CREATE TYPE IF NOT EXISTS entity_status AS ENUM ('active', 'inactive', 'draft', 'archived');

-- 2. Add unique constraints for slugs across all relevant tables
ALTER TABLE artists ADD CONSTRAINT unique_artist_slug UNIQUE (slug);
ALTER TABLE blog_posts ADD CONSTRAINT unique_blog_post_slug UNIQUE (slug);

-- 3. Add updated_at triggers for all admin-managed tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Add updated_at triggers where missing
CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizers_updated_at
    BEFORE UPDATE ON organizers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Create robust security definer functions for role validation
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- 5. Implement comprehensive RLS policies

-- Artists table policies
DROP POLICY IF EXISTS "Anyone can view published artists" ON artists;
DROP POLICY IF EXISTS "Admins can manage artists" ON artists;

CREATE POLICY "Public can view active artists"
ON artists FOR SELECT
USING (status = 'active');

CREATE POLICY "Admin full access to artists"
ON artists FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Editors can view and create artists"
ON artists FOR SELECT
TO authenticated
USING (is_editor_or_admin());

CREATE POLICY "Editors can insert artists"
ON artists FOR INSERT
TO authenticated
WITH CHECK (is_editor_or_admin());

CREATE POLICY "Editors can update artists"
ON artists FOR UPDATE
TO authenticated
USING (is_editor_or_admin())
WITH CHECK (is_editor_or_admin());

-- Venues table policies
DROP POLICY IF EXISTS "Anyone can view venues" ON venues;

CREATE POLICY "Public can view active venues"
ON venues FOR SELECT
USING (status = 'active');

CREATE POLICY "Admin full access to venues"
ON venues FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Editors can view and manage venues"
ON venues FOR SELECT
TO authenticated
USING (is_editor_or_admin());

CREATE POLICY "Editors can insert venues"
ON venues FOR INSERT
TO authenticated
WITH CHECK (is_editor_or_admin());

CREATE POLICY "Editors can update venues"
ON venues FOR UPDATE
TO authenticated
USING (is_editor_or_admin())
WITH CHECK (is_editor_or_admin());

-- Organizers table policies
DROP POLICY IF EXISTS "Anyone can view organizers" ON organizers;

CREATE POLICY "Public can view active organizers"
ON organizers FOR SELECT
USING (status = 'active');

CREATE POLICY "Admin full access to organizers"
ON organizers FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Editors can view and manage organizers"
ON organizers FOR SELECT
TO authenticated
USING (is_editor_or_admin());

CREATE POLICY "Editors can insert organizers"
ON organizers FOR INSERT
TO authenticated
WITH CHECK (is_editor_or_admin());

CREATE POLICY "Editors can update organizers"
ON organizers FOR UPDATE
TO authenticated
USING (is_editor_or_admin())
WITH CHECK (is_editor_or_admin());

-- Events table policies (replace existing)
DROP POLICY IF EXISTS "Public can view active events" ON events;
DROP POLICY IF EXISTS "dev_events_all_access" ON events;
DROP POLICY IF EXISTS "events_read_all" ON events;

CREATE POLICY "Public can view active events"
ON events FOR SELECT
USING (status = 'active');

CREATE POLICY "Admin full access to events"
ON events FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Editors can view and manage events"
ON events FOR SELECT
TO authenticated
USING (is_editor_or_admin());

CREATE POLICY "Editors can insert events"
ON events FOR INSERT
TO authenticated
WITH CHECK (is_editor_or_admin());

CREATE POLICY "Editors can update events"
ON events FOR UPDATE
TO authenticated
USING (is_editor_or_admin())
WITH CHECK (is_editor_or_admin());

-- Categories table policies (replace existing)
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "dev_categories_all_access" ON categories;

CREATE POLICY "Public can view categories"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Admin full access to categories"
ON categories FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Editors can view categories"
ON categories FOR SELECT
TO authenticated
USING (is_editor_or_admin());

-- Blog posts policies (replace existing)
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Editors can insert own posts" ON blog_posts;
DROP POLICY IF EXISTS "dev_blog_posts_all_access" ON blog_posts;

CREATE POLICY "Public can view published posts"
ON blog_posts FOR SELECT
USING (status = 'published');

CREATE POLICY "Admin full access to blog posts"
ON blog_posts FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Editors can view all posts"
ON blog_posts FOR SELECT
TO authenticated
USING (is_editor_or_admin());

CREATE POLICY "Editors can insert own posts"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (is_editor_or_admin() AND auth.uid() = author_id);

CREATE POLICY "Editors can update own posts"
ON blog_posts FOR UPDATE
TO authenticated
USING (is_editor_or_admin() AND auth.uid() = author_id)
WITH CHECK (is_editor_or_admin() AND auth.uid() = author_id);

-- 6. Add integrity constraints
-- Ensure organizer emails are unique
ALTER TABLE organizers ADD CONSTRAINT unique_organizer_email UNIQUE (contact_email);

-- Ensure artist Instagram handles are unique
ALTER TABLE artists ADD CONSTRAINT unique_artist_instagram UNIQUE (instagram);

-- Ensure venue booking emails are unique
ALTER TABLE venues ADD CONSTRAINT unique_venue_booking_email UNIQUE (booking_email);

-- 7. Update existing status columns to use new enum (where applicable)
-- Note: This is optional and depends on existing data compatibility

-- 8. Create audit function for admin operations
CREATE OR REPLACE FUNCTION log_admin_operation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_audit_log (
        admin_email,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        COALESCE(current_setting('request.headers', true)::json ->> 'x-admin-email', auth.email()),
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Add audit triggers to key tables
CREATE TRIGGER audit_artists
    AFTER INSERT OR UPDATE OR DELETE ON artists
    FOR EACH ROW EXECUTE FUNCTION log_admin_operation();

CREATE TRIGGER audit_venues
    AFTER INSERT OR UPDATE OR DELETE ON venues
    FOR EACH ROW EXECUTE FUNCTION log_admin_operation();

CREATE TRIGGER audit_organizers
    AFTER INSERT OR UPDATE OR DELETE ON organizers
    FOR EACH ROW EXECUTE FUNCTION log_admin_operation();

CREATE TRIGGER audit_events
    AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION log_admin_operation();