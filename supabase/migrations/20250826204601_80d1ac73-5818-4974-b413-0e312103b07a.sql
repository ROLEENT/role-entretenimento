-- Create is_admin function for consistent admin checking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  );
$$;

-- Update RLS policies for admin tables to use consistent is_admin() function

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can manage categories new" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Admins can manage AdSense settings" ON public.adsense_settings;
DROP POLICY IF EXISTS "Only admins can view audit log" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;

-- Categories - Admin full access
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());

-- Advertisements - Admin full access  
CREATE POLICY "Admins can manage advertisements"
ON public.advertisements
FOR ALL
TO authenticated  
USING (is_admin())
WITH CHECK (is_admin());

-- AdSense Settings - Admin full access
CREATE POLICY "Admins can manage adsense settings"
ON public.adsense_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Admin Audit Log - Admin read access
CREATE POLICY "Admins can view audit log"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (is_admin());

-- Analytics Events - Admin read access
CREATE POLICY "Admins can view analytics events"
ON public.analytics_events
FOR SELECT  
TO authenticated
USING (is_admin());

-- Contact Messages - Admin read/update access
DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;

CREATE POLICY "Admins can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (is_admin());

-- Blog Comments - Admin full access for moderation
DROP POLICY IF EXISTS "Admins can manage comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.blog_comments;

CREATE POLICY "Admins can manage blog comments"
ON public.blog_comments
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Blog Posts - Admin can manage all, editors can manage own
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.blog_posts;

CREATE POLICY "Admins can manage all posts"
ON public.blog_posts  
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Editors can manage own posts"
ON public.blog_posts
FOR ALL  
TO authenticated
USING (auth.uid() = author_id OR is_admin())
WITH CHECK (auth.uid() = author_id OR is_admin());

-- Events - Admin full access
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;

CREATE POLICY "Admins can manage events"
ON public.events
FOR ALL
TO authenticated  
USING (is_admin())
WITH CHECK (is_admin());

-- Event Categories - Admin full access
DROP POLICY IF EXISTS "Admins can manage event categories" ON public.event_categories;

CREATE POLICY "Admins can manage event categories"
ON public.event_categories
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Event Reviews - Admin full access, users can manage own
DROP POLICY IF EXISTS "reviews_admin_all" ON public.event_reviews;

CREATE POLICY "Admins can manage all reviews"
ON public.event_reviews
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Event Check-ins - Admin full access, users can manage own  
DROP POLICY IF EXISTS "Admins can manage all check-ins" ON public.event_checkins;

CREATE POLICY "Admins can manage all checkins"
ON public.event_checkins
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Blog Post Revisions - Admin access
DROP POLICY IF EXISTS "Admins can manage revisions" ON public.blog_post_revisions;

CREATE POLICY "Admins can manage revisions"
ON public.blog_post_revisions
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Organizers - Admin full access (using existing admin session validation)
-- Keep existing policies as they use admin session validation

-- Partners - Admin full access (using existing admin session validation) 
-- Keep existing policies as they use admin session validation

-- Venues - Admin full access (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venues') THEN
    DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
    
    CREATE POLICY "Admins can manage venues"
    ON public.venues
    FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;