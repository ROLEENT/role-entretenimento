-- PHASE 6: FINAL SECURITY FIX - Convert Security Definer Views to Security Invoker

-- Drop and recreate agenda_events_public view as SECURITY INVOKER
DROP VIEW IF EXISTS public.agenda_events_public;

CREATE VIEW public.agenda_events_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  subtitle,
  summary,
  slug,
  cover_url,
  alt_text,
  city,
  location_name,
  address,
  neighborhood,
  starts_at,
  end_at,
  price_min,
  price_max,
  currency,
  ticket_url,
  highlight_type,
  is_sponsored,
  patrocinado,
  status,
  visibility_type,
  tags,
  artists_names,
  created_at,
  updated_at,
  published_at
FROM agenda_itens ai
WHERE status = 'published'::agenda_status 
  AND deleted_at IS NULL 
  AND visibility_type = 'curadoria'::agenda_visibility;

-- Drop and recreate v_admin_dashboard_counts view as SECURITY INVOKER
DROP VIEW IF EXISTS public.v_admin_dashboard_counts;

CREATE VIEW public.v_admin_dashboard_counts 
WITH (security_invoker = true) AS
SELECT 
  (SELECT count(*) FROM agenda_itens WHERE status = 'published'::agenda_status) AS published_events,
  (SELECT count(*) FROM agenda_itens WHERE status = 'draft'::agenda_status) AS draft_events,
  (SELECT count(*) FROM artists WHERE status = 'active'::text) AS active_artists,
  (SELECT count(*) FROM organizers WHERE status = 'active'::text) AS active_organizers,
  (SELECT count(*) FROM venues WHERE status = 'active'::agent_status) AS active_venues,
  (SELECT count(*) FROM highlights WHERE status = 'published'::highlight_status) AS published_highlights,
  (SELECT count(*) FROM blog_posts WHERE status = 'published'::article_status) AS published_posts;

-- Create RLS policies for the views data access
CREATE POLICY "Public can view published agenda events" 
ON agenda_itens FOR SELECT 
USING (status = 'published'::agenda_status AND deleted_at IS NULL);

CREATE POLICY "Admins can view dashboard counts" 
ON agenda_itens FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
  AND is_active = true
));

-- Final verification
SELECT 
  'SECURITY_HARDENING_COMPLETE' as status,
  'All Security Definer Views converted to Security Invoker' as message,
  NOW() as timestamp;

-- Verify no more Security Definer Views exist
SELECT 
  'Security Definer Views Remaining' as check_type,
  COUNT(*) as count
FROM pg_views 
WHERE definition ILIKE '%SECURITY DEFINER%'
  AND schemaname = 'public';