-- Finalizar migração de segurança: remover colunas de email em texto claro e adicionar constraints

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

-- 7. Atualizar funções para garantir consistência
CREATE OR REPLACE FUNCTION public.get_blog_comments_admin_hash()
RETURNS TABLE(
  id uuid,
  post_id uuid,
  author_name text,
  email_hash text,
  content text,
  is_approved boolean,
  created_at timestamp with time zone,
  post_title text
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
    bc.id,
    bc.post_id,
    bc.author_name,
    bc.email_hash,
    bc.content,
    bc.is_approved,
    bc.created_at,
    bp.title as post_title
  FROM public.blog_comments bc
  LEFT JOIN public.blog_posts bp ON bc.post_id = bp.id
  ORDER BY bc.created_at DESC;
END;
$function$;

-- 8. Função para inserir mensagens de contato com hash
CREATE OR REPLACE FUNCTION public.insert_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  hashed_email text;
BEGIN
  -- Generate email hash
  hashed_email := md5(lower(trim(p_email)));
  
  -- Insert contact message with email hash
  INSERT INTO public.contact_messages (
    name, email_hash, subject, message
  ) VALUES (
    p_name, hashed_email, p_subject, p_message
  );
END;
$function$;

-- 9. Função para obter mensagens de contato para admin
CREATE OR REPLACE FUNCTION public.get_contact_messages()
RETURNS TABLE(
  id uuid,
  name text,
  email_hash text,
  subject text,
  message text,
  body text,
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
    cm.body,
    cm.status,
    cm.handled,
    cm.handled_by,
    cm.created_at
  FROM public.contact_messages cm
  ORDER BY cm.created_at DESC;
END;
$function$;

-- 10. Função para marcar mensagem como tratada
CREATE OR REPLACE FUNCTION public.mark_contact_message_handled(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.contact_messages 
  SET 
    handled = true,
    status = 'handled'
  WHERE id = p_id;
END;
$function$;

-- 11. Função para marcar mensagem como não tratada
CREATE OR REPLACE FUNCTION public.mark_contact_message_unhandled(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.contact_messages 
  SET 
    handled = false,
    status = 'pending'
  WHERE id = p_id;
END;
$function$;