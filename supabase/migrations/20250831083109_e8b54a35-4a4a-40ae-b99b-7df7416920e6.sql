-- CORREÇÃO CRÍTICA DE SEGURANÇA: Habilitar RLS apenas em tabelas (não views)

-- 1. Habilitar RLS nas tabelas reais (excluindo views analytics_summary e cities_other_counts)
ALTER TABLE public.agenda_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_slug_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agentes ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas RLS seguras para as tabelas

-- Agenda Media - Apenas admins podem gerenciar, público pode ver
CREATE POLICY "Admins can manage agenda media" ON public.agenda_media
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Public can view agenda media" ON public.agenda_media
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.agenda_itens 
    WHERE id = agenda_media.agenda_id 
    AND status = 'published'
  )
);

-- Agenda Occurrences - Apenas admins podem gerenciar, público pode ver
CREATE POLICY "Admins can manage agenda occurrences" ON public.agenda_occurrences
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Public can view agenda occurrences" ON public.agenda_occurrences
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.agenda_itens 
    WHERE id = agenda_occurrences.agenda_id 
    AND status = 'published'
  )
);

-- Agenda Slug History - Apenas admins podem ver
CREATE POLICY "Admins can view agenda slug history" ON public.agenda_slug_history
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- Agenda Ticket Tiers - Público pode ver, admins podem gerenciar
CREATE POLICY "Public can view ticket tiers" ON public.agenda_ticket_tiers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.agenda_itens 
    WHERE id = agenda_ticket_tiers.agenda_id 
    AND status = 'published'
  )
);

CREATE POLICY "Admins can manage ticket tiers" ON public.agenda_ticket_tiers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

-- Agentes - Público pode ver ativos, admins podem gerenciar
CREATE POLICY "Public can view active agents" ON public.agentes
FOR SELECT USING (status = 'active' OR status IS NULL);

CREATE POLICY "Admins can manage agents" ON public.agentes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);