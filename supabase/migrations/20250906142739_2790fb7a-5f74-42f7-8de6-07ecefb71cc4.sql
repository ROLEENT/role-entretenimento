-- RPC para presenças públicas por username (corrigindo nomes das colunas)
CREATE OR REPLACE FUNCTION public.get_user_public_attendance_by_username(
  p_username text,
  p_limit integer DEFAULT 50
) RETURNS TABLE(
  event_id uuid,
  status attendance_status,
  updated_at timestamptz,
  title text,
  starts_at timestamptz,
  city text,
  cover_url text
) LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT ai.id as event_id,
         a.status,
         a.updated_at,
         ai.title,
         ai.date_start as starts_at,
         ai.city,
         ai.cover_url
  FROM public.users_public up
  JOIN public.event_attendance a ON a.user_id = up.id
  JOIN public.events ai ON ai.id = a.event_id
  WHERE up.username = p_username
    AND up.is_profile_public = true
    AND a.show_publicly = true
  ORDER BY a.updated_at DESC
  LIMIT p_limit;
$$;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_attendance_user_updated ON public.event_attendance(user_id, updated_at DESC);