-- Criar função RPC para eventos por semana para dashboard
CREATE OR REPLACE FUNCTION public.events_by_week(last_days integer DEFAULT 60)
RETURNS TABLE(week_start text, total bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    TO_CHAR(
      DATE_TRUNC('week', 
        CASE 
          WHEN starts_at IS NOT NULL THEN starts_at
          ELSE created_at
        END
      ), 
      'YYYY-MM-DD'
    ) as week_start,
    COUNT(*) as total
  FROM public.agenda_itens
  WHERE 
    (
      CASE 
        WHEN starts_at IS NOT NULL THEN starts_at
        ELSE created_at
      END
    ) >= NOW() - INTERVAL '1 day' * last_days
    AND status IN ('published', 'scheduled')
  GROUP BY DATE_TRUNC('week', 
    CASE 
      WHEN starts_at IS NOT NULL THEN starts_at
      ELSE created_at
    END
  )
  ORDER BY week_start;
$function$;

-- Função para estatísticas do dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'published_events', (
      SELECT COUNT(*) FROM public.agenda_itens 
      WHERE status = 'published'
    ),
    'draft_events', (
      SELECT COUNT(*) FROM public.agenda_itens 
      WHERE status = 'draft'
    ),
    'scheduled_events', (
      SELECT COUNT(*) FROM public.agenda_itens 
      WHERE status = 'scheduled'
    ),
    'total_artists', (
      SELECT COUNT(*) FROM public.artists 
      WHERE status = 'active'
    ),
    'total_venues', (
      SELECT COUNT(*) FROM public.venues 
      WHERE status = 'active'
    ),
    'total_organizers', (
      SELECT COUNT(*) FROM public.organizers 
      WHERE status = 'active'
    ),
    'events_this_week', (
      SELECT COUNT(*) FROM public.agenda_itens 
      WHERE starts_at >= DATE_TRUNC('week', NOW())
      AND starts_at < DATE_TRUNC('week', NOW()) + INTERVAL '7 days'
      AND status = 'published'
    ),
    'events_next_week', (
      SELECT COUNT(*) FROM public.agenda_itens 
      WHERE starts_at >= DATE_TRUNC('week', NOW()) + INTERVAL '7 days'
      AND starts_at < DATE_TRUNC('week', NOW()) + INTERVAL '14 days'
      AND status = 'published'
    )
  );
$function$;

-- Função para atividade recente do dashboard
CREATE OR REPLACE FUNCTION public.get_recent_activity()
RETURNS TABLE(
  id uuid,
  title text,
  status text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone,
  type text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  (
    SELECT 
      a.id,
      a.title,
      a.status::text,
      a.updated_at,
      a.created_at,
      'agenda_item' as type
    FROM public.agenda_itens a
    WHERE a.title IS NOT NULL
    ORDER BY a.updated_at DESC
    LIMIT 5
  )
  UNION ALL
  (
    SELECT 
      ar.id,
      ar.name as title,
      ar.status::text,
      ar.updated_at,
      ar.created_at,
      'artist' as type
    FROM public.artists ar
    WHERE ar.name IS NOT NULL
    ORDER BY ar.updated_at DESC
    LIMIT 5
  )
  ORDER BY updated_at DESC
  LIMIT 10;
$function$;