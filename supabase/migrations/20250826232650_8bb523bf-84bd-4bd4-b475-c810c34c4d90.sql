-- CORREÇÃO FINAL DE SEGURANÇA CRÍTICA - FASE 1
-- Resolver todas as vulnerabilidades restantes

-- 1. Criar políticas RLS para as 3 tabelas sem políticas
-- Tabela performance_metrics
CREATE POLICY "Admin can manage performance_metrics" ON public.performance_metrics FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "System can insert performance data" ON public.performance_metrics FOR INSERT WITH CHECK (true);

-- Tabela user_notification_preferences
CREATE POLICY "Users can manage their notification preferences" ON public.user_notification_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can create default preferences" ON public.user_notification_preferences FOR INSERT WITH CHECK (true);

-- Tabela notification_logs
CREATE POLICY "Admin can view notification logs" ON public.notification_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert notification logs" ON public.notification_logs FOR INSERT WITH CHECK (true);

-- 2. Corrigir as 7 funções restantes sem search_path
-- Identificar e corrigir funções específicas que ainda não foram corrigidas
ALTER FUNCTION public.add_user_points(uuid, integer, text, uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.create_notification(uuid, text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.mark_notification_read(uuid) SET search_path TO 'public';
ALTER FUNCTION public.mark_all_notifications_read() SET search_path TO 'public';
ALTER FUNCTION public.add_favorite_to_calendar(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.auto_approve_blog_comments() SET search_path TO 'public';
ALTER FUNCTION public.add_group_creator_as_admin() SET search_path TO 'public';

-- 3. Verificar se existe alguma view SECURITY DEFINER e removê-la
-- O erro indica que há uma view problemática que precisa ser removida
DO $$
DECLARE
    view_name TEXT;
BEGIN
    -- Encontrar e remover views SECURITY DEFINER
    FOR view_name IN
        SELECT viewname
        FROM pg_views
        WHERE schemaname = 'public'
        AND definition LIKE '%SECURITY DEFINER%'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', view_name);
    END LOOP;
END $$;

-- 4. Garantir que todas as funções administrativas têm search_path correto
ALTER FUNCTION public.admin_create_highlight(text, city, text, text, text, character varying, text[], text, text, date, time, text, integer, boolean) SET search_path TO 'public';
ALTER FUNCTION public.admin_update_highlight(text, uuid, city, text, text, text, character varying, text[], text, text, date, time, text, integer, boolean) SET search_path TO 'public';
ALTER FUNCTION public.admin_update_highlight_v2(text, uuid, city, text, text, text, character varying, text[], text, text, date, time, text, integer, boolean) SET search_path TO 'public';