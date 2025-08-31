-- Habilitar RLS
ALTER TABLE public.posts_public ENABLE ROW LEVEL SECURITY;

-- Política de leitura para anônimo e autenticado
DROP POLICY IF EXISTS revista_read_published ON public.posts_public;
CREATE POLICY revista_read_published
ON public.posts_public
FOR SELECT
TO anon, authenticated
USING (COALESCE(status,'published') = 'published');

-- Grants
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.posts_public TO anon;