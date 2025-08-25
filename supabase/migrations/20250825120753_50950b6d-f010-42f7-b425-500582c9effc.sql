-- Corrigir função com search_path seguro
CREATE OR REPLACE FUNCTION public.ensure_single_current_metric()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_current THEN
    UPDATE public.site_metrics SET is_current = false WHERE id <> NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END $$;