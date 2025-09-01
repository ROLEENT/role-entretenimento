-- ETAPA 2: Parte 3 - Finalizar Schema e criar Sistema de Notificações
-- Criar trigger para follows e implementar notificações

-- 1. Criar trigger para atualizar contadores quando seguir/desseguir
DROP TRIGGER IF EXISTS update_follow_counts_trigger ON public.follows;
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follow_counts();

-- 2. Atualizar RLS da tabela follows
DROP POLICY IF EXISTS "Users can view follows" ON public.follows;
DROP POLICY IF EXISTS "Users can manage follows" ON public.follows;

CREATE POLICY "Users can view follows"
ON public.follows FOR SELECT
USING (true); -- Follows públicos

CREATE POLICY "Users can manage their own follows"
ON public.follows FOR ALL
USING (follower_id = auth.uid())
WITH CHECK (follower_id = auth.uid());

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- 4. Garantir unique constraint em follows
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS unique_follow;
ALTER TABLE public.follows ADD CONSTRAINT unique_follow 
  UNIQUE (follower_id, following_id);

-- 5. Função para buscar usuários
CREATE OR REPLACE FUNCTION public.search_users_by_username(search_term text)
RETURNS TABLE(
  user_id uuid, 
  username text, 
  display_name text, 
  avatar_url text, 
  followers_count integer, 
  is_verified boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.followers_count,
    p.is_verified
  FROM public.profiles p
  WHERE (
    p.username ILIKE '%' || search_term || '%' OR
    p.display_name ILIKE '%' || search_term || '%'
  )
    AND p.username IS NOT NULL
    AND NOT p.is_private
  ORDER BY p.followers_count DESC
  LIMIT 20;
$$;