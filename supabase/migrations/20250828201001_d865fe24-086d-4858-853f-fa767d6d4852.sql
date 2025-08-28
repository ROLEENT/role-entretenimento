-- ETAPA 2: Schema Normalization and RLS Policies (Fixed)

-- 1. Drop existing conflicting functions first
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_editor_or_admin();

-- 2. Create robust security definer functions for role validation
CREATE OR REPLACE FUNCTION check_user_is_admin()
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

CREATE OR REPLACE FUNCTION check_user_is_editor_or_admin()
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

-- 3. Add unique constraints for slugs
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

-- 4. Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Add triggers where missing
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

-- 5. Update RLS policies for artists
DROP POLICY IF EXISTS "Anyone can view published artists" ON artists;
DROP POLICY IF EXISTS "Admins can manage artists" ON artists;

CREATE POLICY "Public can view active artists"
ON artists FOR SELECT
USING (status = 'active');

CREATE POLICY "Admin full access to artists"
ON artists FOR ALL
TO authenticated
USING (check_user_is_admin())
WITH CHECK (check_user_is_admin());

CREATE POLICY "Editors can view artists"
ON artists FOR SELECT
TO authenticated
USING (check_user_is_editor_or_admin());

CREATE POLICY "Editors can insert artists"
ON artists FOR INSERT
TO authenticated
WITH CHECK (check_user_is_editor_or_admin());

CREATE POLICY "Editors can update artists"
ON artists FOR UPDATE
TO authenticated
USING (check_user_is_editor_or_admin())
WITH CHECK (check_user_is_editor_or_admin());

-- 6. Add integrity constraints
DO $$ 
BEGIN
    ALTER TABLE artists ADD CONSTRAINT unique_artist_instagram UNIQUE (instagram);
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;