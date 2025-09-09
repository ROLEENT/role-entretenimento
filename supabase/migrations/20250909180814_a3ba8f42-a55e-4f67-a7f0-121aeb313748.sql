-- Add publication fields to agenda_itens table
ALTER TABLE public.agenda_itens
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_by uuid;

-- Create auto-publish function with validation
CREATE OR REPLACE FUNCTION public.auto_publish_agenda_itens()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Check minimum requirements for publication
  IF COALESCE(NEW.title, '') = '' OR COALESCE(NEW.slug, '') = '' THEN 
    RETURN NEW; 
  END IF;
  
  IF COALESCE(NEW.city, '') = '' THEN 
    RETURN NEW; 
  END IF;
  
  IF NEW.starts_at IS NULL OR NEW.end_at IS NULL THEN 
    RETURN NEW; 
  END IF;
  
  IF COALESCE(NEW.alt_text, '') = '' THEN 
    RETURN NEW; 
  END IF;
  
  IF COALESCE(NEW.cover_url, '') = '' AND COALESCE(NEW.cover_path, '') = '' THEN 
    RETURN NEW; 
  END IF;

  -- If all requirements are met, auto-publish
  IF TG_OP = 'INSERT' THEN
    NEW.is_published := true;
    NEW.published_at := NOW();
    IF NEW.published_by IS NULL THEN 
      NEW.published_by := auth.uid(); 
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only publish if not already published
    IF NOT COALESCE(OLD.is_published, false) THEN
      NEW.is_published := true;
      NEW.published_at := NOW();
      IF NEW.published_by IS NULL THEN 
        NEW.published_by := auth.uid(); 
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END $$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_auto_publish_agenda_itens ON public.agenda_itens;
CREATE TRIGGER trg_auto_publish_agenda_itens
  BEFORE INSERT OR UPDATE ON public.agenda_itens
  FOR EACH ROW EXECUTE FUNCTION public.auto_publish_agenda_itens();