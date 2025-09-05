-- LIMPEZA TOTAL DAS POLÍTICAS RLS CONFLITANTES NA TABELA EVENTS
-- ====================================================================

-- 1. Remover TODAS as políticas RLS existentes da tabela events
DROP POLICY IF EXISTS "Admin can manage all events" ON public.events;
DROP POLICY IF EXISTS "Admin full access to events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can read events" ON public.events;
DROP POLICY IF EXISTS "Development: Allow all operations for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Dev: Authenticated users can manage events" ON public.events;
DROP POLICY IF EXISTS "dev_events_all_access" ON public.events;
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
DROP POLICY IF EXISTS "events_admin_all" ON public.events;
DROP POLICY IF EXISTS "events_public_read" ON public.events;
DROP POLICY IF EXISTS "events_staff_delete" ON public.events;
DROP POLICY IF EXISTS "events_staff_insert" ON public.events;
DROP POLICY IF EXISTS "events_staff_read" ON public.events;
DROP POLICY IF EXISTS "events_staff_update" ON public.events;

-- 2. Verificar se RLS está habilitado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Criar UMA política simples e funcional para desenvolvimento
-- Esta política permite todas as operações para qualquer usuário (temporário para debug)
CREATE POLICY "temporary_dev_full_access" 
ON public.events 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- 4. Conceder permissões básicas para tabela events
GRANT ALL ON public.events TO anon;
GRANT ALL ON public.events TO authenticated;

-- Log da ação
INSERT INTO public.admin_audit_log (
    admin_email,
    action,
    table_name,
    record_id,
    new_values,
    ip_address
) VALUES (
    'system@cleanup',
    'RLS_CLEANUP',
    'events',
    NULL,
    '{"description": "Limpeza completa de políticas RLS conflitantes", "timestamp": "' || now()::text || '"}',
    '127.0.0.1'::inet
);