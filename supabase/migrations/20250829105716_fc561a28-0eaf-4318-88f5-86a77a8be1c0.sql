-- Limpar dados antigos e configurar aprovados
DELETE FROM public.approved_admins WHERE email IN ('fiih@roleentretenimento.com', 'guilherme@roleentretenimento.com');

-- Inserir emails aprovados como admins
INSERT INTO public.approved_admins (email, approved_by, is_active) VALUES
  ('fiih@roleentretenimento.com', 'system', true),
  ('guilherme@roleentretenimento.com', 'system', true);

-- Atualizar função handle_new_user para auto-provisionar admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role user_role := 'viewer';
BEGIN
  -- Check if email is in approved_admins and assign admin role
  IF EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = NEW.email AND is_active = true
  ) THEN
    user_role := 'admin';
  -- Special case for specific admin emails
  ELSIF NEW.email IN ('fiih@roleentretenimento.com', 'guilherme@roleentretenimento.com') THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    NEW.email,
    user_role
  );
  
  -- Se for admin, garantir entrada na approved_admins
  IF user_role = 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.approved_admins WHERE email = NEW.email
  ) THEN
    INSERT INTO public.approved_admins (email, approved_by, is_active)
    VALUES (NEW.email, 'auto-provision', true);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Atualizar função provision_user_profile para considerar admins específicos
CREATE OR REPLACE FUNCTION public.provision_user_profile(p_user_id uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_profile jsonb;
  new_profile jsonb;
  user_role user_role := 'viewer';
BEGIN
  -- Verificar se profile já existe
  SELECT to_jsonb(p.*) INTO existing_profile
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  -- Se já existe, retornar o existente
  IF existing_profile IS NOT NULL THEN
    RETURN existing_profile;
  END IF;
  
  -- Determinar role baseado no email
  IF EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = p_email AND is_active = true
  ) OR p_email IN ('fiih@roleentretenimento.com', 'guilherme@roleentretenimento.com') THEN
    user_role := 'admin';
  END IF;
  
  -- Criar novo profile
  INSERT INTO public.profiles (
    user_id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_email,
    user_role,
    now(),
    now()
  ) RETURNING to_jsonb(profiles.*) INTO new_profile;
  
  -- Se for admin, garantir entrada na approved_admins
  IF user_role = 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.approved_admins WHERE email = p_email
  ) THEN
    INSERT INTO public.approved_admins (email, approved_by, is_active)
    VALUES (p_email, 'auto-provision', true);
  END IF;
  
  RETURN new_profile;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, tentar buscar novamente
  SELECT to_jsonb(p.*) INTO existing_profile
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  RETURN existing_profile;
END;
$$;