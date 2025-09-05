-- Remover políticas RLS conflitantes da tabela events
-- Manter apenas a política dev_unrestricted_access para desenvolvimento

-- Remover políticas específicas que podem estar causando conflitos
DROP POLICY IF EXISTS "Admin can manage all events" ON public.events;
DROP POLICY IF EXISTS "Admin full access to events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Editors can manage events" ON public.events;
DROP POLICY IF EXISTS "events_admin_all" ON public.events;
DROP POLICY IF EXISTS "events_public_read" ON public.events;
DROP POLICY IF EXISTS "Public can view published events" ON public.events;

-- Verificar se a política dev_unrestricted_access existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'dev_unrestricted_access'
    ) THEN
        CREATE POLICY "dev_unrestricted_access" ON public.events
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Comentário: Política simplificada para desenvolvimento - permite todas as operações
COMMENT ON POLICY "dev_unrestricted_access" ON public.events IS 'Política temporária para desenvolvimento - permite todas as operações';