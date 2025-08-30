-- Corrigir problemas críticos de RLS

-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_discovery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_spotify_data ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para cities (público pode ver)
CREATE POLICY "Anyone can view cities" 
ON public.cities 
FOR SELECT 
USING (true);

-- Políticas básicas para analytics_events (apenas sistema)
CREATE POLICY "System can insert analytics" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Políticas básicas para admin_audit_log (apenas admins)
CREATE POLICY "Admins can view audit log" 
ON public.admin_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- Políticas básicas para artist_discovery_log (usuários próprios)
CREATE POLICY "Users can view own discovery log" 
ON public.artist_discovery_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own discovery log" 
ON public.artist_discovery_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas básicas para artist_spotify_data (público pode ver)
CREATE POLICY "Anyone can view artist spotify data" 
ON public.artist_spotify_data 
FOR SELECT 
USING (true);