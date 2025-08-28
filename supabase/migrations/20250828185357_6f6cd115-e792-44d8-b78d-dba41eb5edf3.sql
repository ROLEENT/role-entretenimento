-- ETAPA 1: CORREÇÃO DE AUTENTICAÇÃO E RBAC - CORRIGIDA
-- Usar o enum user_role existente ao invés de criar novo
-- Função segura para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Função para verificar se usuário pode deletar (apenas admin)
CREATE OR REPLACE FUNCTION public.can_delete()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_current_user_admin();
$$;

-- Atualizar policies da tabela artists para RBAC
DROP POLICY IF EXISTS "Admins can manage artists" ON public.artists;
DROP POLICY IF EXISTS "Anyone can view published artists" ON public.artists;

CREATE POLICY "Users can view active artists" 
  ON public.artists FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Authenticated users can create artists" 
  ON public.artists FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update artists" 
  ON public.artists FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete artists" 
  ON public.artists FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Atualizar policies da tabela organizers para RBAC
DROP POLICY IF EXISTS "Admins can manage organizers" ON public.organizers;

CREATE POLICY "Anyone can view organizers" 
  ON public.organizers FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create organizers" 
  ON public.organizers FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update organizers" 
  ON public.organizers FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete organizers" 
  ON public.organizers FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Atualizar policies da tabela venues para RBAC
DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;

CREATE POLICY "Anyone can view venues" 
  ON public.venues FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create venues" 
  ON public.venues FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update venues" 
  ON public.venues FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete venues" 
  ON public.venues FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Atualizar policies da tabela events para RBAC
DROP POLICY IF EXISTS "dev_events_all_access" ON public.events;
DROP POLICY IF EXISTS "events_read_all" ON public.events;
DROP POLICY IF EXISTS "Public can view active events" ON public.events;

CREATE POLICY "Anyone can view published events" 
  ON public.events FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Authenticated users can view all events" 
  ON public.events FOR SELECT 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create events" 
  ON public.events FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update events" 
  ON public.events FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete events" 
  ON public.events FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Policies para highlights com RBAC
DROP POLICY IF EXISTS "Admins can manage highlights" ON public.highlights;
DROP POLICY IF EXISTS "Anyone can view published highlights" ON public.highlights;

CREATE POLICY "Anyone can view published highlights" 
  ON public.highlights FOR SELECT 
  USING (published = true);

CREATE POLICY "Authenticated users can view all highlights" 
  ON public.highlights FOR SELECT 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create highlights" 
  ON public.highlights FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update highlights" 
  ON public.highlights FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete highlights" 
  ON public.highlights FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Criar função para auditoria
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  table_name text,
  record_id uuid,
  old_data jsonb DEFAULT NULL,
  new_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_email,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  )
  VALUES (
    auth.email(),
    action_type,
    table_name,
    record_id,
    old_data,
    new_data
  );
END;
$$;