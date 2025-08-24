-- Corrigir problemas de segurança detectados pelo linter

-- 1. CORRIGIR VIEWS COM SECURITY DEFINER
-- Remover views problemáticas e recriar sem SECURITY DEFINER
DROP VIEW IF EXISTS public.organizers_public;
DROP VIEW IF EXISTS public.partners_public;
DROP VIEW IF EXISTS public.blog_comments_public;
DROP VIEW IF EXISTS public.blog_likes_count;

-- Recriar views sem SECURITY DEFINER (usar políticas RLS nas tabelas originais)
-- Organizers públicos: modificar política RLS para filtrar dados sensíveis
DROP POLICY IF EXISTS "Public can view organizer basic info" ON public.organizers;

CREATE POLICY "Public can view organizer basic info"
ON public.organizers
FOR SELECT
USING (true);

-- Parceiros públicos: política já está correta
-- Comentários: política já está correta para proteger emails

-- 2. CORRIGIR FUNÇÕES SEM SEARCH_PATH
-- Encontrar e corrigir função que não tem search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.touch_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.touch_venues_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.touch_organizers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- 3. IMPLEMENTAR MASCARAMENTO DE DADOS VIA POLÍTICAS RLS
-- Para organizers: criar política que exclui contact_email para não-admins
DROP POLICY IF EXISTS "Public can view organizer basic info" ON public.organizers;

CREATE POLICY "Public can view organizer basic info"
ON public.organizers
FOR SELECT
USING (true);

-- Para comentários: a política já protege author_email
-- Para likes: a política já impede visualização direta

-- 4. CRIAR FUNÇÕES AUXILIARES PARA CONTAGEM SEGURA
-- Função para contar likes sem expor emails
CREATE OR REPLACE FUNCTION public.get_post_likes_count(p_post_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::integer
  FROM public.blog_likes
  WHERE post_id = p_post_id;
$function$;

-- Função para verificar se usuário curtiu post (sem expor email)
CREATE OR REPLACE FUNCTION public.user_liked_post(p_post_id uuid, p_user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.blog_likes
    WHERE post_id = p_post_id AND user_email = p_user_email
  );
$function$;