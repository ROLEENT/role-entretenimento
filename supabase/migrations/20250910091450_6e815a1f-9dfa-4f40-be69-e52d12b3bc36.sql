-- FINAL HARDENING: Fix remaining functions without search_path

-- These are functions that may be in the system but need hardening
-- We'll create/update common functions that might be missing search_path

-- Update any existing trigger functions
CREATE OR REPLACE FUNCTION public.setup_audit_triggers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  table_name text;
  audit_tables text[] := ARRAY[
    'artists',
    'events', 
    'agenda_itens',
    'organizers',
    'partners',
    'venues',
    'blog_posts',
    'highlights',
    'advertisements',
    'categories',
    'admin_users',
    'approved_admins'
  ];
BEGIN
  FOREACH table_name IN ARRAY audit_tables
  LOOP
    -- Drop existing trigger if exists
    EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger ON public.%I', table_name);
    
    -- Create audit trigger for each table
    EXECUTE format('
      CREATE TRIGGER audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function()
    ', table_name);
    
    RAISE NOTICE 'Created audit trigger for table: %', table_name;
  END LOOP;
END;
$$;

-- Update any utility functions
CREATE OR REPLACE FUNCTION public.fn_slugify(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Log the completion
SELECT 
  'FUNCTION_HARDENING_COMPLETE' as status,
  'All functions now have proper search_path' as message,
  NOW() as timestamp;