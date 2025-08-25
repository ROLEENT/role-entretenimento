-- Add search_path to critical functions to fix security warnings
-- This approach preserves all dependencies while fixing the security issues

ALTER FUNCTION public.get_contact_messages() SET search_path = public;
ALTER FUNCTION public.update_contact_message_status(uuid, text) SET search_path = public;
ALTER FUNCTION public.auto_approve_blog_comments() SET search_path = public;
ALTER FUNCTION public.get_user_checkin_status(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.user_liked_highlight(uuid) SET search_path = public;
ALTER FUNCTION public.add_blog_comment_secure(uuid, text, text, text, uuid) SET search_path = public;
ALTER FUNCTION public.get_blog_comments_admin() SET search_path = public;
ALTER FUNCTION public.approve_blog_comment(uuid) SET search_path = public;
ALTER FUNCTION public.reject_blog_comment(uuid) SET search_path = public;
ALTER FUNCTION public.get_nearby_events(numeric, numeric, integer) SET search_path = public;
ALTER FUNCTION public.delete_blog_comment(uuid) SET search_path = public;