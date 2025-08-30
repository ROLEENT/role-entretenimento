-- Corrigir RLS crítico - Habilitar RLS nas tabelas que ainda não têm
-- Verificando quais tabelas precisam de RLS

-- Tabelas que precisam de RLS básico
ALTER TABLE public.agenda_item_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_discovery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_slug_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para leitura pública (agenda e events relacionados)
CREATE POLICY "Anyone can view agenda item artists" 
ON public.agenda_item_artists FOR SELECT USING (true);

CREATE POLICY "Anyone can view agenda media" 
ON public.agenda_media FOR SELECT USING (true);

CREATE POLICY "Anyone can view agenda occurrences" 
ON public.agenda_occurrences FOR SELECT USING (true);

CREATE POLICY "Anyone can view agenda ticket tiers" 
ON public.agenda_ticket_tiers FOR SELECT USING (true);

CREATE POLICY "Anyone can view event artists" 
ON public.event_artists FOR SELECT USING (true);

CREATE POLICY "Anyone can view agenda slug history" 
ON public.agenda_slug_history FOR SELECT USING (true);

-- Políticas restritas para analytics
CREATE POLICY "Admins can view analytics summary" 
ON public.analytics_summary FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- Política para artist discovery log (somente usuários próprios)
CREATE POLICY "Users can view own discovery log" 
ON public.artist_discovery_log FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own discovery log" 
ON public.artist_discovery_log FOR INSERT 
WITH CHECK (auth.uid() = user_id);