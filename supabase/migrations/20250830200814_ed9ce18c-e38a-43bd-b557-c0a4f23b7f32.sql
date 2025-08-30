-- ETAPA 1: Corrigir RLS e Permissões

-- Habilitar RLS em tabelas críticas que não têm
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;

-- Política para admins acessarem newsletter_subscribers
CREATE POLICY "Admins can view all newsletter subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins can manage newsletter subscribers" 
ON public.newsletter_subscribers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Política para usuários verem seus próprios eventos de calendário
CREATE POLICY "Users can view own calendar events" 
ON public.user_calendar_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calendar events" 
ON public.user_calendar_events 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para usuários verem seus próprios favoritos
CREATE POLICY "Users can view own favorites" 
ON public.event_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" 
ON public.event_favorites 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Função segura para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;