-- CORREÇÃO ALTERNATIVA PARA VULNERABILIDADES CRÍTICAS
-- Usar abordagem sem is_admin() para evitar conflitos

-- 1. Criar políticas RLS para tabelas sem políticas usando validação direta
-- performance_metrics
CREATE POLICY "Admin can manage performance_metrics" ON public.performance_metrics 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can insert performance data" ON public.performance_metrics 
FOR INSERT WITH CHECK (true);

-- user_notification_preferences  
CREATE POLICY "Users can manage their notification preferences" ON public.user_notification_preferences 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create default preferences" ON public.user_notification_preferences 
FOR INSERT WITH CHECK (true);

-- notification_logs
CREATE POLICY "Admin can view notification logs" ON public.notification_logs 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can insert notification logs" ON public.notification_logs 
FOR INSERT WITH CHECK (true);

-- 2. Corrigir funções restantes sem search_path (tentar uma de cada vez)
ALTER FUNCTION public.add_user_points(uuid, integer, text, uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.create_notification(uuid, text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.mark_notification_read(uuid) SET search_path TO 'public';