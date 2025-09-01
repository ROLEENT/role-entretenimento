-- Continue fixing Function Search Path Mutable warnings
-- Apply SET search_path = 'public' to remaining functions systematically

-- Core admin functions
DO $$
BEGIN
    -- Use a block to handle potential errors gracefully
    EXECUTE 'ALTER FUNCTION public.admin_create_artist(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, integer, integer, text, text, text, text, text[], text[], integer, text, boolean) SET search_path = ''public''';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not alter admin_create_artist: %', SQLERRM;
END;
$$;

-- Other admin functions
ALTER FUNCTION public.can_delete_highlight() SET search_path = 'public';
ALTER FUNCTION public.generate_email_hash(text) SET search_path = 'public';
ALTER FUNCTION public.user_liked_post_hash(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.user_liked_post(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.get_post_likes_count(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_blog_comments_safe(uuid) SET search_path = 'public';
ALTER FUNCTION public.delete_blog_comment(uuid) SET search_path = 'public';
ALTER FUNCTION public.auto_approve_blog_comments() SET search_path = 'public';
ALTER FUNCTION public.search_users_by_username(text) SET search_path = 'public';
ALTER FUNCTION public.mark_notification_read(uuid) SET search_path = 'public';
ALTER FUNCTION public.notify_event_favorite() SET search_path = 'public';
ALTER FUNCTION public.provision_user_profile() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.promote_to_admin(text) SET search_path = 'public';