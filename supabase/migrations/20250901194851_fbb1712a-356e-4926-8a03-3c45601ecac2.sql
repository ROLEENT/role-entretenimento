-- Continuar Fase 4: Corrigir mais functions sem search_path e tentar localizar views Security Definer

-- Corrigir mais functions públicas
CREATE OR REPLACE FUNCTION public.can_edit_highlight()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.calculate_notification_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_notifications', COUNT(*),
    'unread_notifications', COUNT(*) FILTER (WHERE read = false),
    'last_24h', COUNT(*) FILTER (WHERE created_at >= now() - interval '24 hours')
  ) INTO result
  FROM public.notifications
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;