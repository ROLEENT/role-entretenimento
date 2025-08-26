-- Fix security warnings for new functions by adding search_path
ALTER FUNCTION public.generate_confirmation_token() SET search_path = public;
ALTER FUNCTION public.confirm_newsletter_subscription(TEXT) SET search_path = public;
ALTER FUNCTION public.unsubscribe_newsletter(TEXT) SET search_path = public;