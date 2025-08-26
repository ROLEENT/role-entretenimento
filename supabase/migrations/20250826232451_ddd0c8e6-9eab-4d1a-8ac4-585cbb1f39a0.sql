-- CORREÇÃO DE FUNÇÃO DUPLICADA is_admin()
-- Primeiro, remover todas as versões da função is_admin para evitar conflitos

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_secure() CASCADE;

-- Criar versão unificada e segura da função is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar role do usuário na tabela profiles
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Retornar se é admin (assumindo que existe uma coluna 'role' ou 'is_admin')
  RETURN COALESCE(user_role = 'admin', false);
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, negar acesso por segurança
  RETURN false;
END;
$$;

-- Agora corrigir as funções restantes sem search_path
ALTER FUNCTION public.set_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.touch_profiles_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.touch_venues_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.touch_organizers_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.notify_new_follower() SET search_path TO 'public';
ALTER FUNCTION public.notify_event_favorite() SET search_path TO 'public';
ALTER FUNCTION public.create_activity(uuid, text, text, uuid, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.update_follow_counts() SET search_path TO 'public';
ALTER FUNCTION public.update_group_members_count() SET search_path TO 'public';