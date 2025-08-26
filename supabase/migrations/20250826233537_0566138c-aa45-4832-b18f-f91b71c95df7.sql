-- FASE 2 - CRIAR FUNÇÕES RPC NECESSÁRIAS PARA EVENTOS
-- Criar funções administrativas para gestão de eventos

-- Função para criar eventos (admin)
CREATE OR REPLACE FUNCTION public.admin_create_event(
  p_title text,
  p_slug text,
  p_city text,
  p_venue_id uuid DEFAULT NULL,
  p_start_at timestamp with time zone,
  p_end_at timestamp with time zone DEFAULT NULL,
  p_organizer_id uuid DEFAULT NULL,
  p_cover_url text DEFAULT NULL,
  p_tags text[] DEFAULT '{}',
  p_status text DEFAULT 'draft',
  p_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_event_id uuid;
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas admins podem criar eventos';
  END IF;

  -- Inserir evento
  INSERT INTO public.events (
    title, slug, city, venue_id, date_start, date_end,
    organizer_id, cover_url, tags, status, description
  ) VALUES (
    p_title, p_slug, p_city, p_venue_id, p_start_at, p_end_at,
    p_organizer_id, p_cover_url, p_tags, p_status, p_description
  ) RETURNING id INTO new_event_id;

  RETURN new_event_id;
END;
$$;

-- Função para atualizar eventos (admin)
CREATE OR REPLACE FUNCTION public.admin_update_event(
  p_event_id uuid,
  p_title text,
  p_slug text,
  p_city text,
  p_venue_id uuid DEFAULT NULL,
  p_start_at timestamp with time zone,
  p_end_at timestamp with time zone DEFAULT NULL,
  p_organizer_id uuid DEFAULT NULL,
  p_cover_url text DEFAULT NULL,
  p_tags text[] DEFAULT '{}',
  p_status text DEFAULT 'draft',
  p_description text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas admins podem atualizar eventos';
  END IF;

  -- Atualizar evento
  UPDATE public.events SET
    title = p_title,
    slug = p_slug,
    city = p_city,
    venue_id = p_venue_id,
    date_start = p_start_at,
    date_end = p_end_at,
    organizer_id = p_organizer_id,
    cover_url = p_cover_url,
    tags = p_tags,
    status = p_status,
    description = p_description,
    updated_at = NOW()
  WHERE id = p_event_id;

  RETURN TRUE;
END;
$$;

-- Criar bucket de storage para eventos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para eventos
CREATE POLICY "Admin can upload event images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'events' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view event images" ON storage.objects
FOR SELECT USING (bucket_id = 'events');