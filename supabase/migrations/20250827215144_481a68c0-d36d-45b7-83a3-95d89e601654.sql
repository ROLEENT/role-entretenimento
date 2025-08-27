-- Remover política ALL conflitante do bucket organizers
DROP POLICY IF EXISTS "Admin can manage organizer files" ON storage.objects;

-- Verificar que só temos as políticas específicas
-- Lista das políticas restantes:
-- - Admin can upload organizer files (INSERT)
-- - Admin can update organizer files (UPDATE) 
-- - Admin can delete organizer files (DELETE)
-- - Anyone can view organizer files (SELECT)