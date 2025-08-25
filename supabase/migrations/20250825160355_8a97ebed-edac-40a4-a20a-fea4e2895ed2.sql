-- Corrigir políticas RLS para sistema administrativo - Versão 2

-- 1. SITE_METRICS: Adicionar políticas para admin inserir/atualizar métricas
DROP POLICY IF EXISTS "Admins can insert metrics" ON public.site_metrics;
DROP POLICY IF EXISTS "Admins can update metrics" ON public.site_metrics;

CREATE POLICY "Admins can insert metrics" 
ON public.site_metrics 
FOR INSERT 
WITH CHECK (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));

CREATE POLICY "Admins can update metrics" 
ON public.site_metrics 
FOR UPDATE 
USING (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));

-- 2. VENUES: Atualizar políticas para usar sistema admin correto
DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
DROP POLICY IF EXISTS "venues_write_admin" ON public.venues;

CREATE POLICY "Admins can manage venues new" 
ON public.venues 
FOR ALL 
USING (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'))
WITH CHECK (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));

-- 3. EVENTS: Atualizar políticas para usar sistema admin correto  
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "events_write_admin" ON public.events;

CREATE POLICY "Admins can manage events new" 
ON public.events 
FOR ALL 
USING (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'))
WITH CHECK (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));

-- 4. ORGANIZERS: Atualizar políticas para usar sistema admin correto
DROP POLICY IF EXISTS "Admins can manage organizers" ON public.organizers;
DROP POLICY IF EXISTS "organizers_write_admin" ON public.organizers;

CREATE POLICY "Admins can manage organizers new" 
ON public.organizers 
FOR ALL 
USING (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'))
WITH CHECK (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));

-- 5. CATEGORIES: Atualizar políticas para usar sistema admin correto
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Admins can manage categories new" 
ON public.categories 
FOR ALL 
USING (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'))
WITH CHECK (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));

-- 6. TICKETS: Atualizar políticas para usar sistema admin correto
DROP POLICY IF EXISTS "Admins can manage tickets" ON public.tickets;

CREATE POLICY "Admins can manage tickets new" 
ON public.tickets 
FOR ALL 
USING (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'))
WITH CHECK (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));

-- 7. TESTIMONIALS: Adicionar políticas para admin gerenciar depoimentos
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;

CREATE POLICY "Admins can manage testimonials new" 
ON public.testimonials 
FOR ALL 
USING (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'))
WITH CHECK (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));