-- ETAPA 2: Schema Normalization and RLS Policies
-- Fix linter issues and normalize schema

-- 1. Create standardized status enum for all entities (corrected syntax)
DO $$ 
BEGIN
    CREATE TYPE entity_status AS ENUM ('active', 'inactive', 'draft', 'archived');
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add unique constraints for slugs across all relevant tables
DO $$ 
BEGIN
    ALTER TABLE artists ADD CONSTRAINT unique_artist_slug UNIQUE (slug);
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE blog_posts ADD CONSTRAINT unique_blog_post_slug UNIQUE (slug);
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Add updated_at triggers for all admin-managed tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Add updated_at triggers where missing
DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizers_updated_at ON organizers;
CREATE TRIGGER update_organizers_updated_at
    BEFORE UPDATE ON organizers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
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

-- 6. Add integrity constraints
DO $$ 
BEGIN
    ALTER TABLE organizers ADD CONSTRAINT unique_organizer_email UNIQUE (contact_email);
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE artists ADD CONSTRAINT unique_artist_instagram UNIQUE (instagram);
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE venues ADD CONSTRAINT unique_venue_booking_email UNIQUE (booking_email);
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

-- 7. Create audit function for admin operations
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
DROP TRIGGER IF EXISTS audit_artists ON artists;
CREATE TRIGGER audit_artists
    AFTER INSERT OR UPDATE OR DELETE ON artists
    FOR EACH ROW EXECUTE FUNCTION log_admin_operation();

DROP TRIGGER IF EXISTS audit_venues ON venues;
CREATE TRIGGER audit_venues
    AFTER INSERT OR UPDATE OR DELETE ON venues
    FOR EACH ROW EXECUTE FUNCTION log_admin_operation();

DROP TRIGGER IF EXISTS audit_organizers ON organizers;
CREATE TRIGGER audit_organizers
    AFTER INSERT OR UPDATE OR DELETE ON organizers
    FOR EACH ROW EXECUTE FUNCTION log_admin_operation();

DROP TRIGGER IF EXISTS audit_events ON events;
CREATE TRIGGER audit_events
    AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION log_admin_operation();