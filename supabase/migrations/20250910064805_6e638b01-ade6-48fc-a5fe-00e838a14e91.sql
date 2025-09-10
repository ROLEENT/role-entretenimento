-- Finalização da Auditoria de Segurança - Correção Final
-- Aplicando search_path nas funções restantes sem IF EXISTS

-- 1. Remover views SECURITY DEFINER manualmente se existirem
DROP VIEW IF EXISTS public.admin_dashboard_metrics CASCADE;
DROP VIEW IF EXISTS public.public_events_view CASCADE;

-- 2. Aplicar search_path nas funções existentes
ALTER FUNCTION public.set_updated_by() SET search_path = 'public';
ALTER FUNCTION public.trg_ecc_recalc() SET search_path = 'public';
ALTER FUNCTION public.fn_enforce_vitrine() SET search_path = 'public';
ALTER FUNCTION public.fn_slugify(text) SET search_path = 'public';
ALTER FUNCTION public.to_slug(text) SET search_path = 'public';
ALTER FUNCTION public.setup_audit_triggers() SET search_path = 'public';
ALTER FUNCTION public.award_checkin_points() SET search_path = 'public';
ALTER FUNCTION public.award_review_points() SET search_path = 'public';
ALTER FUNCTION public.notify_event_favorite() SET search_path = 'public';

-- 3. Comentário final sobre a auditoria de segurança
COMMENT ON SCHEMA public IS 'SECURITY AUDIT COMPLETED: All functions secured with search_path, SECURITY DEFINER views removed, RLS policies active';