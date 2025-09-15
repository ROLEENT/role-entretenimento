-- CORREÇÕES MASSIVAS DE SEGURANÇA FINAL
-- Remover TODAS as políticas de acesso público desnecessárias

-- 1. Corrigir tabelas administrativas - manter apenas acesso admin
DROP POLICY IF EXISTS "Anyone can view cities" ON public.agenda_cities;
DROP POLICY IF EXISTS "Anyone can view active artist categories" ON public.artist_categories;
DROP POLICY IF EXISTS "Anyone can view artist genres" ON public.artist_genres;
DROP POLICY IF EXISTS "Anyone can view artist roles" ON public.artist_roles;
DROP POLICY IF EXISTS "Anyone can view active artist roles" ON public.artist_roles_lookup;
DROP POLICY IF EXISTS "Anyone can view active artist types" ON public.artist_types;
DROP POLICY IF EXISTS "Anyone can view artist types relationships" ON public.artists_artist_types;
DROP POLICY IF EXISTS "Anyone can view artist categories relationships" ON public.artists_categories;
DROP POLICY IF EXISTS "Anyone can view artist genres relationships" ON public.artists_genres;
DROP POLICY IF EXISTS "Anyone can view active artist types" ON public.artist_types;
DROP POLICY IF EXISTS "artist_types_read" ON public.artist_types;

-- 2. Corrigir tabelas de blog - manter apenas conteúdo aprovado público
DROP POLICY IF EXISTS "Anyone can view approved blog comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Public can view blog likes" ON public.blog_likes;

-- 3. Corrigir tabelas de eventos - manter apenas eventos publicados públicos
DROP POLICY IF EXISTS "Public can view published agenda events" ON public.agenda_itens;
DROP POLICY IF EXISTS "Anyone can view agenda item artists" ON public.agenda_item_artists;
DROP POLICY IF EXISTS "Anyone can view agenda item organizers" ON public.agenda_item_organizers;
DROP POLICY IF EXISTS "Public can view published agenda media" ON public.agenda_media;
DROP POLICY IF EXISTS "Public can view agenda occurrences" ON public.agenda_occurrences;
DROP POLICY IF EXISTS "Public can view ticket tiers" ON public.agenda_ticket_tiers;

-- 4. Corrigir outras tabelas com acesso público desnecessário
DROP POLICY IF EXISTS "Anyone can view artist data" ON public.artist_spotify_data;
DROP POLICY IF EXISTS "Anyone can view active badges" ON public.badges;
DROP POLICY IF EXISTS "Public can view cities" ON public.cities;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view countries" ON public.countries;
DROP POLICY IF EXISTS "Authenticated users can view approved admins" ON public.approved_admins;

-- 5. MANTER apenas políticas públicas essenciais para funcionamento básico da plataforma:

-- Eventos publicados (conteúdo principal)
CREATE POLICY "Public can view published events only" 
ON public.agenda_itens 
FOR SELECT 
USING (status = 'published' AND deleted_at IS NULL);

-- Artistas em eventos publicados
CREATE POLICY "Public can view artists in published events" 
ON public.agenda_item_artists 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agenda_itens ai 
  WHERE ai.id = agenda_id 
  AND ai.status = 'published' 
  AND ai.deleted_at IS NULL
));

-- Organizadores em eventos publicados  
CREATE POLICY "Public can view organizers in published events" 
ON public.agenda_item_organizers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agenda_itens ai 
  WHERE ai.id = agenda_id 
  AND ai.status = 'published' 
  AND ai.deleted_at IS NULL
));

-- Media de eventos publicados
CREATE POLICY "Public can view media of published events" 
ON public.agenda_media 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agenda_itens ai 
  WHERE ai.id = agenda_id 
  AND ai.status = 'published' 
  AND ai.deleted_at IS NULL
));

-- Ocorrências de eventos publicados
CREATE POLICY "Public can view occurrences of published events" 
ON public.agenda_occurrences 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agenda_itens ai 
  WHERE ai.id = agenda_id 
  AND ai.status = 'published' 
  AND ai.deleted_at IS NULL
));

-- Tickets de eventos publicados
CREATE POLICY "Public can view tickets of published events" 
ON public.agenda_ticket_tiers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agenda_itens ai 
  WHERE ai.id = agenda_id 
  AND ai.status = 'published' 
  AND ai.deleted_at IS NULL
));

-- Artistas (perfis públicos básicos)
CREATE POLICY "Public can view basic artist profiles" 
ON public.artists 
FOR SELECT 
USING (true);

-- Tipos de artista (dados de referência)
CREATE POLICY "Public can view artist types for reference" 
ON public.artist_types 
FOR SELECT 
USING (active = true);

-- Cidades (dados de referência)
CREATE POLICY "Public can view cities for reference" 
ON public.cities 
FOR SELECT 
USING (true);

-- Países (dados de referência)  
CREATE POLICY "Public can view countries for reference" 
ON public.countries 
FOR SELECT 
USING (true);

-- Categorias ativas (dados de referência)
CREATE POLICY "Public can view active categories for reference" 
ON public.categories 
FOR SELECT 
USING (active = true);

-- Posts de blog publicados
CREATE POLICY "Public can view published blog posts only" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published' AND published_at <= NOW());

-- Comentários aprovados em posts publicados
CREATE POLICY "Public can view approved comments on published posts" 
ON public.blog_comments 
FOR SELECT 
USING (is_approved = true AND EXISTS (
  SELECT 1 FROM public.blog_posts bp 
  WHERE bp.id = post_id 
  AND bp.status = 'published' 
  AND bp.published_at <= NOW()
));

-- 6. MANTER políticas necessárias para funcionalidade de anúncios
-- (Anúncios ativos são necessários para funcionamento da plataforma)
-- Política já existente: "Anyone can view active advertisements"

-- 7. LOG de segurança
PERFORM log_security_event(
  'massive_security_correction',
  NULL,
  'system',
  jsonb_build_object(
    'action', 'massive_public_policy_removal',
    'timestamp', NOW(),
    'description', 'Removed all unnecessary public access policies, kept only essential ones'
  ),
  'critical'
);