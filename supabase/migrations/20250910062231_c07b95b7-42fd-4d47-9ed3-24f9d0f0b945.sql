-- Corrigir issues de segurança detectadas pelo linter

-- 1. Adicionar search_path às funções que não têm
ALTER FUNCTION public.set_updated_by() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.notify_event_favorite() SET search_path = 'public';
ALTER FUNCTION public.trg_ecc_recalc() SET search_path = 'public';
ALTER FUNCTION public.sync_artist_to_entity_profile() SET search_path = 'public';
ALTER FUNCTION public.sync_organizer_to_entity_profile() SET search_path = 'public';
ALTER FUNCTION public.auto_publish_agenda_itens() SET search_path = 'public';
ALTER FUNCTION public.fn_enforce_vitrine() SET search_path = 'public';

-- 2. Criar tabela para mídias de perfis (substituir dados mock da galeria)
CREATE TABLE IF NOT EXISTS public.profile_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de mídias
ALTER TABLE public.profile_media ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profile_media
CREATE POLICY "Admins podem gerenciar todas as mídias"
ON public.profile_media
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Donos de perfil podem gerenciar suas mídias"
ON public.profile_media
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.entity_profiles ep
    WHERE ep.user_id = auth.uid() 
    AND ep.user_id = profile_media.profile_user_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.entity_profiles ep
    WHERE ep.user_id = auth.uid() 
    AND ep.user_id = profile_media.profile_user_id
  )
);

CREATE POLICY "Todos podem visualizar mídias públicas"
ON public.profile_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.entity_profiles ep
    WHERE ep.user_id = profile_media.profile_user_id
    AND ep.visibility = 'public'
  )
);

-- 3. Criar bucket para mídias de perfil no storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-media', 'profile-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para profile-media
CREATE POLICY "Mídias de perfil são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-media');

CREATE POLICY "Usuários autenticados podem upload mídias"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-media' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar suas próprias mídias"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-media' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar suas próprias mídias"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-media' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Trigger para atualizar updated_at em profile_media
CREATE TRIGGER update_profile_media_updated_at
BEFORE UPDATE ON public.profile_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Função para upload de mídia de perfil
CREATE OR REPLACE FUNCTION public.upload_profile_media(
  p_profile_user_id UUID,
  p_type TEXT,
  p_url TEXT,
  p_alt_text TEXT DEFAULT NULL,
  p_caption TEXT DEFAULT NULL,
  p_position INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  media_id UUID;
BEGIN
  -- Verificar permissões
  IF NOT (
    auth.uid() = p_profile_user_id OR
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
      AND is_active = true
    )
  ) THEN
    RAISE EXCEPTION 'Sem permissão para adicionar mídia a este perfil';
  END IF;

  -- Inserir nova mídia
  INSERT INTO public.profile_media (
    profile_user_id, type, url, alt_text, caption, position
  ) VALUES (
    p_profile_user_id, p_type, p_url, p_alt_text, p_caption, p_position
  ) RETURNING id INTO media_id;

  RETURN media_id;
END;
$$;