-- Create partners table for admin management
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  capacity TEXT,
  types TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  contact_email TEXT,
  website TEXT,
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view partners" 
ON public.partners 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage partners" 
ON public.partners 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create advertisements table for admin management
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT NOT NULL,
  cta_url TEXT,
  badge_text TEXT,
  gradient_from TEXT DEFAULT '#3B82F6',
  gradient_to TEXT DEFAULT '#8B5CF6',
  type TEXT NOT NULL CHECK (type IN ('banner', 'card', 'newsletter')),
  position INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active advertisements" 
ON public.advertisements 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage advertisements" 
ON public.advertisements 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add trigger for timestamps
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for partners
INSERT INTO public.partners (name, location, image_url, rating, capacity, types, featured) VALUES
('Audio Club', 'Vila Madalena, SP', '/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png', 4.8, '800 pessoas', '{"Eletrônica", "Techno"}', true),
('Clash Club', 'Santa Cecília, SP', '/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png', 4.6, '500 pessoas', '{"Rock", "Indie"}', false),
('Trackers', 'Moema, SP', '/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png', 4.9, '1200 pessoas', '{"Hip Hop", "Funk"}', true);

-- Insert sample data for advertisements
INSERT INTO public.advertisements (title, description, badge_text, cta_text, gradient_from, gradient_to, type, position, active) VALUES
('Baixe o ROLÊ App', 'Encontre eventos, compre ingressos e conecte-se com amigos', 'Novo App', 'Download Grátis', '#3B82F6', '#8B5CF6', 'card', 1, true),
('Spotify Premium', '3 meses grátis para novos usuários do ROLÊ', 'Parceria', 'Resgatar Oferta', '#EA580C', '#DC2626', 'card', 2, true),
('Heineken Experience', 'Eventos exclusivos Heineken toda semana. Cadastre-se e receba convites VIP para as melhores festas da cidade.', 'Conteúdo Patrocinado', 'Cadastrar Interesse', '#10B981', '#059669', 'newsletter', 3, true);