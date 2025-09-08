-- Recriar funções de slug sem unaccent para corrigir o erro definitivamente

-- Primeiro, vamos garantir que a extensão unaccent está na search_path correta
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Recriar função fn_slugify sem dependência problemática de unaccent
CREATE OR REPLACE FUNCTION public.fn_slugify(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN 'untitled-event';
  END IF;
  
  -- Usar unaccent da extensão se disponível, senão fazer limpeza básica
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          COALESCE(extensions.unaccent(trim(input_text)), trim(input_text)), 
          '[^a-zA-Z0-9\s\-_]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Fallback sem unaccent se houver erro
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text), 
          '[^a-zA-Z0-9\s\-_]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$function$;

-- Recriar função slugify também
CREATE OR REPLACE FUNCTION public.slugify(inp text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- Tentar usar unaccent, senão usar fallback
  RETURN lower(
    regexp_replace(
      regexp_replace(
        COALESCE(extensions.unaccent(coalesce(inp,'')), coalesce(inp,'')), 
        '[^a-zA-Z0-9]+', '-', 'g'
      ),
      '(^-|-$)', '', 'g'
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Fallback sem unaccent
  RETURN lower(
    regexp_replace(
      regexp_replace(
        coalesce(inp,''), 
        '[^a-zA-Z0-9]+', '-', 'g'
      ),
      '(^-|-$)', '', 'g'
    )
  );
END;
$function$;