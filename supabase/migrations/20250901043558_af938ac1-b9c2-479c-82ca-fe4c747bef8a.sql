-- PROMPT 2: Configurar Storage para Avatares e Covers

-- Criar buckets para perfis se não existirem
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'profile-avatars', 
    'profile-avatars', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  (
    'profile-covers', 
    'profile-covers', 
    true, 
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies para profile-avatars bucket
CREATE POLICY "Public can view profile avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own profile avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
  AND (
    -- User is owner of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'owner'
    )
    OR
    -- User is editor of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'editor'
    )
  )
);

CREATE POLICY "Users can update their own profile avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
  AND (
    -- User is owner of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'owner'
    )
    OR
    -- User is editor of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'editor'
    )
  )
);

CREATE POLICY "Users can delete their own profile avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
  AND (
    -- User is owner of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'owner'
    )
    OR
    -- User is editor of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'editor'
    )
  )
);

-- RLS Policies para profile-covers bucket
CREATE POLICY "Public can view profile covers"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-covers');

CREATE POLICY "Users can upload their own profile covers"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-covers' 
  AND auth.uid() IS NOT NULL
  AND (
    -- User is owner of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'owner'
    )
    OR
    -- User is editor of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'editor'
    )
  )
);

CREATE POLICY "Users can update their own profile covers"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-covers' 
  AND auth.uid() IS NOT NULL
  AND (
    -- User is owner of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'owner'
    )
    OR
    -- User is editor of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'editor'
    )
  )
);

CREATE POLICY "Users can delete their own profile covers"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-covers' 
  AND auth.uid() IS NOT NULL
  AND (
    -- User is owner of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'owner'
    )
    OR
    -- User is editor of the profile
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id::text = (storage.foldername(name))[1]
      AND pr.user_id = auth.uid()
      AND pr.role = 'editor'
    )
  )
);

-- Função para limpar arquivos órfãos de storage
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_profile_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  orphaned_file RECORD;
BEGIN
  -- Remover avatares órfãos (não referenciados em profiles.avatar_url)
  FOR orphaned_file IN 
    SELECT name, bucket_id 
    FROM storage.objects 
    WHERE bucket_id = 'profile-avatars' 
    AND name NOT IN (
      SELECT REPLACE(avatar_url, 'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/profile-avatars/', '')
      FROM public.profiles 
      WHERE avatar_url IS NOT NULL 
      AND avatar_url LIKE '%profile-avatars%'
    )
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = orphaned_file.bucket_id 
    AND name = orphaned_file.name;
  END LOOP;

  -- Remover covers órfãs (não referenciadas em profiles.cover_url)
  FOR orphaned_file IN 
    SELECT name, bucket_id 
    FROM storage.objects 
    WHERE bucket_id = 'profile-covers' 
    AND name NOT IN (
      SELECT REPLACE(cover_url, 'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/profile-covers/', '')
      FROM public.profiles 
      WHERE cover_url IS NOT NULL 
      AND cover_url LIKE '%profile-covers%'
    )
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = orphaned_file.bucket_id 
    AND name = orphaned_file.name;
  END LOOP;
END;
$$;

-- Trigger para validar URLs de avatar e cover antes de salvar
CREATE OR REPLACE FUNCTION public.validate_profile_image_urls()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar avatar_url
  IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' THEN
    IF NEW.avatar_url NOT LIKE '%profile-avatars%' THEN
      RAISE EXCEPTION 'Avatar URL deve apontar para o bucket profile-avatars';
    END IF;
  END IF;

  -- Validar cover_url
  IF NEW.cover_url IS NOT NULL AND NEW.cover_url != '' THEN
    IF NEW.cover_url NOT LIKE '%profile-covers%' THEN
      RAISE EXCEPTION 'Cover URL deve apontar para o bucket profile-covers';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Aplicar trigger de validação
DROP TRIGGER IF EXISTS validate_profile_images ON public.profiles;
CREATE TRIGGER validate_profile_images
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_image_urls();

-- Função auxiliar para upload de avatar
CREATE OR REPLACE FUNCTION public.upload_profile_avatar(
  p_profile_id uuid,
  p_file_name text,
  p_file_data bytea
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  file_path text;
  public_url text;
BEGIN
  -- Verificar permissões
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_roles pr
    WHERE pr.profile_id = p_profile_id
    AND pr.user_id = auth.uid()
    AND pr.role IN ('owner', 'editor')
  ) THEN
    RAISE EXCEPTION 'Sem permissão para fazer upload de avatar para este perfil';
  END IF;

  -- Gerar caminho do arquivo
  file_path := p_profile_id::text || '/' || p_file_name;
  
  -- Upload para storage (simulado - seria feito via client)
  -- Esta função retorna apenas o path que deve ser usado
  public_url := 'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/profile-avatars/' || file_path;
  
  -- Atualizar URL no perfil
  UPDATE public.profiles 
  SET avatar_url = public_url,
      updated_at = now()
  WHERE id = p_profile_id;

  RETURN public_url;
END;
$$;

-- Função auxiliar para upload de cover
CREATE OR REPLACE FUNCTION public.upload_profile_cover(
  p_profile_id uuid,
  p_file_name text,
  p_file_data bytea
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  file_path text;
  public_url text;
BEGIN
  -- Verificar permissões
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_roles pr
    WHERE pr.profile_id = p_profile_id
    AND pr.user_id = auth.uid()
    AND pr.role IN ('owner', 'editor')
  ) THEN
    RAISE EXCEPTION 'Sem permissão para fazer upload de cover para este perfil';
  END IF;

  -- Gerar caminho do arquivo
  file_path := p_profile_id::text || '/' || p_file_name;
  
  -- Upload para storage (simulado - seria feito via client)
  public_url := 'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/profile-covers/' || file_path;
  
  -- Atualizar URL no perfil
  UPDATE public.profiles 
  SET cover_url = public_url,
      updated_at = now()
  WHERE id = p_profile_id;

  RETURN public_url;
END;
$$;