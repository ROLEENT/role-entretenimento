-- Fase 3: Remover Security Definer Views problemáticas

-- Verificar se a view blog_comments_safe ainda existe e removê-la
DROP VIEW IF EXISTS public.blog_comments_safe CASCADE;

-- Se houver outras views problemáticas, vamos identificá-las e corrigi-las
-- Vamos recriar views sem SECURITY DEFINER se necessário

-- Criar uma view segura alternativa para comentários de blog (se necessário)
-- que não use SECURITY DEFINER
CREATE OR REPLACE VIEW public.blog_comments_public AS
SELECT 
  id,
  post_id,
  author_name,
  content,
  created_at,
  parent_id
FROM public.blog_comments
WHERE is_approved = true;

-- Garantir que não há nenhuma view com SECURITY DEFINER
-- Verificar e corrigir quaisquer outras views problemáticas