-- Complete Security Fixes - Add RLS to Views
-- Final step to secure the new views

-- 1. Enable RLS on the safe views  
ALTER TABLE public.blog_comments_safe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers_public ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for safe views
CREATE POLICY "Public can read safe blog comments" ON public.blog_comments_safe
FOR SELECT USING (true);

CREATE POLICY "Public can read safe organizer data" ON public.organizers_public  
FOR SELECT USING (true);

-- 3. Update is_admin_user to ensure it has search_path (final fix)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  session_email text;
BEGIN
  -- Try to get email from admin session headers
  session_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  IF session_email IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = session_email AND is_active = true
  );
END;
$$;