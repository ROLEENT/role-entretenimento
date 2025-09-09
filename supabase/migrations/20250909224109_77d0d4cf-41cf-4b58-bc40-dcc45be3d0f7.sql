-- Corrigir a função ensure_preview_token para gerar string corretamente
CREATE OR REPLACE FUNCTION ensure_preview_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preview_token IS NULL OR NEW.preview_token = '' THEN
    NEW.preview_token := replace(gen_random_uuid()::text, '-', '');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;