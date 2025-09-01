-- Criar tabela para mídia dos perfis (portfolio)
CREATE TABLE public.profile_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para avaliações dos perfis
CREATE TABLE public.profile_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_user_id, reviewer_id)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.profile_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para profile_media
CREATE POLICY "Anyone can view profile media" 
ON public.profile_media 
FOR SELECT 
USING (true);

CREATE POLICY "Profile owners can manage their media" 
ON public.profile_media 
FOR ALL 
USING (auth.uid() = profile_user_id);

-- Políticas para profile_reviews
CREATE POLICY "Anyone can view profile reviews" 
ON public.profile_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.profile_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" 
ON public.profile_reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.profile_reviews 
FOR DELETE 
USING (auth.uid() = reviewer_id);

-- Triggers para updated_at
CREATE TRIGGER update_profile_media_updated_at
  BEFORE UPDATE ON public.profile_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profile_reviews_updated_at
  BEFORE UPDATE ON public.profile_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_profile_media_profile_user_id ON public.profile_media(profile_user_id);
CREATE INDEX idx_profile_media_position ON public.profile_media(profile_user_id, position);
CREATE INDEX idx_profile_reviews_profile_user_id ON public.profile_reviews(profile_user_id);
CREATE INDEX idx_profile_reviews_rating ON public.profile_reviews(profile_user_id, rating);