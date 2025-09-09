-- Corrigir função auto_publish_agenda_itens para não referenciar campo inexistente cover_path
CREATE OR REPLACE FUNCTION public.auto_publish_agenda_itens()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
  
  IF COALESCE(NEW.cover_url, '') = '' THEN 
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
END;
$$;