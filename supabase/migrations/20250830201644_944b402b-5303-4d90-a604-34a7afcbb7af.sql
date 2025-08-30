-- Corrigir RLS crítico - Habilitar RLS nas tabelas que ainda não têm
-- (removendo views que não suportam RLS)

-- Tabelas que precisam de RLS básico
ALTER TABLE public.agenda_item_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_slug_history ENABLE ROW LEVEL SECURITY;

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