-- Corrigir migração: primeiro remover funções existentes e depois recriar

-- 1. Migrar dados restantes de blog_likes se necessário
UPDATE public.blog_likes 
SET email_hash = md5(lower(trim(user_email)))
WHERE email_hash IS NULL AND user_email IS NOT NULL;

-- 2. Remover coluna user_email da tabela blog_likes
ALTER TABLE public.blog_likes DROP COLUMN IF EXISTS user_email;

-- 3. Fazer email_hash NOT NULL em blog_likes
ALTER TABLE public.blog_likes ALTER COLUMN email_hash SET NOT NULL;

-- 4. Verificar se blog_comments tem author_email e removê-la se existir
ALTER TABLE public.blog_comments DROP COLUMN IF EXISTS author_email;

-- 5. Fazer email_hash NOT NULL em blog_comments se não for
ALTER TABLE public.blog_comments ALTER COLUMN email_hash SET NOT NULL;

-- 6. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_blog_likes_email_hash ON public.blog_likes(email_hash);
CREATE INDEX IF NOT EXISTS idx_blog_comments_email_hash ON public.blog_comments(email_hash);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email_hash ON public.contact_messages(email_hash);

-- 7. Remover função existente e recriar
DROP FUNCTION IF EXISTS public.get_contact_messages();

CREATE OR REPLACE FUNCTION public.get_contact_messages()
RETURNS TABLE(
  id uuid,
  name text,
  email_hash text,
  subject text,
  message text,
  status text,
  handled boolean,
  handled_by uuid,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id,
    cm.name,
    cm.email_hash,
    cm.subject,
    cm.message,
    cm.status,
    cm.handled,
    cm.handled_by,
    cm.created_at
  FROM public.contact_messages cm
  ORDER BY cm.created_at DESC;
END;
$function$;