-- Primeiro, adicionar as novas colunas
ALTER TABLE public.blog_comments 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS email_hash TEXT,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Migrar dados existentes se houver email
DO $$
BEGIN
  -- Se existe coluna author_email, migrar para email_hash
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_comments' AND column_name = 'author_email'
  ) THEN
    -- Criar email_hash usando SHA256 do email existente
    UPDATE public.blog_comments 
    SET email_hash = encode(digest(author_email, 'sha256'), 'hex')
    WHERE author_email IS NOT NULL AND email_hash IS NULL;
    
    -- Migrar author_name para display_name se necessário
    UPDATE public.blog_comments 
    SET display_name = author_name
    WHERE author_name IS NOT NULL AND display_name IS NULL;
  END IF;
END $$;

-- Remover coluna author_email se existir (após migração)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_comments' AND column_name = 'author_email'
  ) THEN
    ALTER TABLE public.blog_comments DROP COLUMN author_email;
  END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_is_hidden ON public.blog_comments(is_hidden);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON public.blog_comments(created_at DESC);

-- Criar RLS policies
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can manage comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admin only access to blog_comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.blog_comments;

-- Nova policy: Select para todos (apenas comentários não ocultos)
CREATE POLICY "Anyone can view visible comments"
ON public.blog_comments FOR SELECT
USING (is_hidden = false);

-- Nova policy: Admins podem ver todos os comentários
CREATE POLICY "Admins can view all comments"
ON public.blog_comments FOR SELECT
USING (EXISTS(
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.is_admin = true
));

-- Nova policy: Admins podem gerenciar comentários
CREATE POLICY "Admins can manage comments"
ON public.blog_comments FOR ALL
USING (EXISTS(
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.is_admin = true
))
WITH CHECK (EXISTS(
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.is_admin = true
));

-- Nova policy: Usuários autenticados podem inserir comentários
CREATE POLICY "Authenticated users can insert comments"
ON public.blog_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);