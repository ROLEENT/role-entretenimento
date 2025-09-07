-- FASE 2: Configurar RLS para eventos públicos serem visíveis

-- Remover política se existir e criar nova
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;

-- Criar política para permitir leitura pública de eventos publicados
CREATE POLICY "Anyone can view published events" 
ON public.events 
FOR SELECT 
USING (status = 'published');

-- Verificar se a política foi criada
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'events' AND policyname = 'Anyone can view published events';