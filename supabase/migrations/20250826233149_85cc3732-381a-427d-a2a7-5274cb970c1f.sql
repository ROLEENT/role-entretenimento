-- CORREÇÃO DEFINITIVA DAS VULNERABILIDADES RESTANTES
-- Fase 1 - Correção das 2 tabelas e 7 funções identificadas

-- 1. Corrigir as 2 tabelas sem políticas RLS
-- admin_audit_log
CREATE POLICY "Admin can view audit log" ON public.admin_audit_log 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- blog_post_revisions  
CREATE POLICY "Admin can manage blog post revisions" ON public.blog_post_revisions 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Corrigir as 7 funções sem search_path
ALTER FUNCTION public.create_blog_post_revision() SET search_path TO 'public';
ALTER FUNCTION public.generate_category_slug(text) SET search_path TO 'public';
ALTER FUNCTION public.generate_venue_slug(text) SET search_path TO 'public';
ALTER FUNCTION public.restore_blog_post_revision(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.set_category_slug() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_metrics() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_testimonials() SET search_path TO 'public';

-- 3. Tentar identificar e remover a view SECURITY DEFINER problemática
-- Executar comando para verificar se há views problemáticas
SELECT viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND definition LIKE '%SECURITY DEFINER%';