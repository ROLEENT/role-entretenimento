-- Primeiro, corrigir a função ensure_preview_token que está usando gen_random_bytes inexistente
CREATE OR REPLACE FUNCTION ensure_preview_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preview_token IS NULL OR NEW.preview_token = '' THEN
    NEW.preview_token := encode(gen_random_uuid()::bytea, 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;