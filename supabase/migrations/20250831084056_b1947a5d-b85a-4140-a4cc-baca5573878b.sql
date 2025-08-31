-- Dropar função existente que tem conflito de tipos
DROP FUNCTION IF EXISTS public.events_by_week(integer);

-- Criar nova função RPC para eventos por semana para dashboard
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