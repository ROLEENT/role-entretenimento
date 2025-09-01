-- Correções RLS mínimas e seguras
-- Apenas functions básicas sem dependências externas

CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT md5(lower(trim(email_text)));
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;