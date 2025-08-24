-- Create missing storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('event-images', 'event-images', true),
  ('partner-logos', 'partner-logos', true), 
  ('ads-banners', 'ads-banners', true);

-- Create storage policies for event-images bucket
CREATE POLICY "Event images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-images');

CREATE POLICY "Admins can upload event images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'event-images' AND get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update event images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'event-images' AND get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete event images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'event-images' AND get_user_role(auth.uid()) = 'admin');

-- Create storage policies for partner-logos bucket
CREATE POLICY "Partner logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'partner-logos');

CREATE POLICY "Admins can upload partner logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'partner-logos' AND get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update partner logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'partner-logos' AND get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete partner logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'partner-logos' AND get_user_role(auth.uid()) = 'admin');

-- Create storage policies for ads-banners bucket
CREATE POLICY "Ad banners are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ads-banners');

CREATE POLICY "Admins can upload ad banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ads-banners' AND get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update ad banners" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ads-banners' AND get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete ad banners" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ads-banners' AND get_user_role(auth.uid()) = 'admin');

-- Create updated_at triggers for venues
CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at triggers for organizers  
CREATE TRIGGER update_organizers_updated_at
BEFORE UPDATE ON public.organizers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create contact messages table for contact form
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS on contact messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for contact messages
CREATE POLICY "Admins can view all contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Anyone can insert contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin');

-- Insert sample venues
INSERT INTO public.venues (name, address, city, state, lat, lng) VALUES
('Opinião Pub', 'Rua José do Patrocínio, 834 - Cidade Baixa', 'Porto Alegre', 'RS', -30.0346, -51.2177),
('Workroom', 'Rua Luiz Afonso, 234 - Cidade Baixa', 'Porto Alegre', 'RS', -30.0356, -51.2187),
('GREZZ', 'Rua General Lima e Silva, 1023 - Cidade Baixa', 'Porto Alegre', 'RS', -30.0366, -51.2197),
('Ocidente', 'Rua Silva Só, 596 - Floresta', 'Porto Alegre', 'RS', -30.0376, -51.2207),
('Auditório Araújo Vianna', 'Av. Osvaldo Aranha, 685 - Bom Fim', 'Porto Alegre', 'RS', -30.0386, -51.2217),
('Centro Cultural Usina do Gasômetro', 'Av. Presidente João Goulart, 551', 'Porto Alegre', 'RS', -30.0396, -51.2227),
('Teatro Renascença', 'Rua Mostardeiro, 842 - Moinhos de Vento', 'Porto Alegre', 'RS', -30.0406, -51.2237),
('Beco 203', 'Rua Barão do Triunfo, 203 - Centro Histórico', 'Porto Alegre', 'RS', -30.0416, -51.2247),
('Casa de Cultura Mario Quintana', 'Rua dos Andradas, 736 - Centro Histórico', 'Porto Alegre', 'RS', -30.0426, -51.2257),
('Bar do Goethe', 'Rua 24 de Outubro, 112 - Moinhos de Vento', 'Porto Alegre', 'RS', -30.0436, -51.2267);

-- Insert sample organizers
INSERT INTO public.organizers (name, contact_email, instagram, site) VALUES
('Coletivo Melt', 'contato@coletivomelt.com', '@coletivomelt', 'https://coletivomelt.com'),
('Produtora Workroom', 'eventos@workroom.com.br', '@workroomoficial', 'https://workroom.com.br'),
('GREZZ Produções', 'grezz@grezz.com.br', '@grezzoficial', 'https://grezz.com.br'),
('Ocidente Entretenimento', 'ocidente@entretenimento.com', '@ocidenteoficial', 'https://ocidente.com'),
('Porto Alegre Cultura', 'cultura@poa.gov.br', '@poacultura', 'https://poa.gov.br/cultura'),
('Silvetty Montilla Produções', 'silvetty@montilla.com.br', '@silvettymontilla', NULL),
('Tributo Band Productions', 'tributo@band.com.br', '@tributoband', NULL),
('Valéria Barcellos Music', 'valeria@barcellos.com.br', '@valeriabarcellosmsc', NULL);

-- Insert sample events
INSERT INTO public.events (title, description, date_start, date_end, city, state, price_min, price_max, image_url, venue_id, organizer_id) VALUES
('Melt feat. Goodbye Lenin', 'Noite especial com o coletivo Melt apresentando Goodbye Lenin em uma performance única no Ocidente. Uma experiência sonora que conecta eletrônica experimental com elementos acústicos.', '2024-02-15 22:00:00+00', '2024-02-16 03:00:00+00', 'Porto Alegre', 'RS', 25, 40, '/src/assets/Melt feat. Goodbye Lenin no Ocidente.jpg', 
(SELECT id FROM venues WHERE name = 'Ocidente' LIMIT 1),
(SELECT id FROM organizers WHERE name = 'Coletivo Melt' LIMIT 1)),

('Pista Cheia no Opinião', 'Festa com o melhor da música eletrônica nacional e internacional. DJs residentes e convidados especiais fazem a noite no tradicional Opinião Pub.', '2024-02-10 23:00:00+00', '2024-02-11 05:00:00+00', 'Porto Alegre', 'RS', 20, 35, '/src/assets/Pista cheia no Opinião.jpg',
(SELECT id FROM venues WHERE name = 'Opinião Pub' LIMIT 1),
(SELECT id FROM organizers WHERE name = 'Porto Alegre Cultura' LIMIT 1)),

('Silvetty Montilla na Workroom', 'Show intimista da cantora Silvetty Montilla apresentando seu novo álbum. Uma noite especial na atmosfera única da Workroom.', '2024-02-20 21:00:00+00', '2024-02-21 00:00:00+00', 'Porto Alegre', 'RS', 30, 50, '/src/assets/Silvetty Montilla na Workroom.jpg',
(SELECT id FROM venues WHERE name = 'Workroom' LIMIT 1),
(SELECT id FROM organizers WHERE name = 'Silvetty Montilla Produções' LIMIT 1)),

('Tributo a Ozzy no GREZZ', 'Noite de heavy metal com a melhor tribute band de Ozzy Osbourne do Sul do país. Sucessos clássicos e energia pura no palco do GREZZ.', '2024-02-25 21:30:00+00', '2024-02-26 01:00:00+00', 'Porto Alegre', 'RS', 25, 45, '/src/assets/Tributo a Ozzy no GREZZ.jpg',
(SELECT id FROM venues WHERE name = 'GREZZ' LIMIT 1),
(SELECT id FROM organizers WHERE name = 'Tributo Band Productions' LIMIT 1)),

('Valéria Barcellos canta Gal', 'Tributo especial a Gal Costa com a interpretação única de Valéria Barcellos. Clássicos da MPB em uma noite emocionante no Auditório Araújo Vianna.', '2024-03-01 20:00:00+00', '2024-03-01 22:30:00+00', 'Porto Alegre', 'RS', 40, 80, '/src/assets/Valéria Barcellos canta Gal.jpg',
(SELECT id FROM organizers WHERE name = 'Auditório Araújo Vianna' LIMIT 1),
(SELECT id FROM organizers WHERE name = 'Valéria Barcellos Music' LIMIT 1));

-- Associate events with categories (assuming some categories exist)
INSERT INTO public.event_categories (event_id, category_id) 
SELECT e.id, c.id 
FROM public.events e, public.categories c 
WHERE (e.title LIKE '%Melt%' OR e.title LIKE '%Pista%') AND c.name ILIKE '%eletronica%'
LIMIT 2;

INSERT INTO public.event_categories (event_id, category_id)
SELECT e.id, c.id
FROM public.events e, public.categories c
WHERE (e.title LIKE '%Silvetty%' OR e.title LIKE '%Valéria%') AND c.name ILIKE '%mpb%'
LIMIT 2;

INSERT INTO public.event_categories (event_id, category_id)
SELECT e.id, c.id
FROM public.events e, public.categories c  
WHERE e.title LIKE '%Tributo%' AND c.name ILIKE '%rock%'
LIMIT 1;