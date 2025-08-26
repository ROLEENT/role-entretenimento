-- Create push_subscriptions table for Web Push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  city_pref text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  user_agent text,
  
  -- Ensure one subscription per endpoint
  UNIQUE(endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own subscriptions" 
ON public.push_subscriptions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
USING (is_admin_user());

-- Create notification_logs table for tracking
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid REFERENCES public.push_subscriptions(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  url text,
  city_filter text,
  category_filter text,
  status text NOT NULL DEFAULT 'pending', -- pending, sent, failed
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for notification logs
CREATE POLICY "Admins can manage notification logs" 
ON public.notification_logs 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_city_pref ON public.push_subscriptions(city_pref);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at DESC);

-- Function to get active subscriptions by filters
CREATE OR REPLACE FUNCTION public.get_filtered_subscriptions(
  p_city_filter text DEFAULT NULL,
  p_category_filter text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  endpoint text,
  p256dh text,
  auth text,
  city_pref text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    ps.id,
    ps.endpoint,
    ps.p256dh,
    ps.auth,
    ps.city_pref
  FROM public.push_subscriptions ps
  WHERE ps.is_active = true
    AND (p_city_filter IS NULL OR ps.city_pref = p_city_filter)
  ORDER BY ps.created_at DESC;
END;
$function$;

-- Function to update subscription status
CREATE OR REPLACE FUNCTION public.update_subscription_status(
  p_subscription_id uuid,
  p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.push_subscriptions
  SET 
    is_active = p_is_active,
    updated_at = now()
  WHERE id = p_subscription_id;
END;
$function$;