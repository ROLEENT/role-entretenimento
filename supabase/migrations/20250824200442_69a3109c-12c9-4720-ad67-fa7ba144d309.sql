-- Criar tabela highlights
CREATE TABLE public.highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  event_title TEXT NOT NULL,
  venue TEXT NOT NULL,
  ticket_url TEXT,
  event_date DATE NOT NULL,
  role_text TEXT NOT NULL CHECK (length(role_text) <= 400),
  selection_reasons TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  photo_credit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: leitura pública só de is_published = true
CREATE POLICY "Anyone can view published highlights" 
ON public.highlights 
FOR SELECT 
USING (is_published = true);

-- Edição apenas para approved_admins
CREATE POLICY "Approved admins can manage highlights" 
ON public.highlights 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = (
      SELECT email FROM public.profiles 
      WHERE user_id = auth.uid()
    ) AND is_active = true
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_highlights_updated_at
BEFORE UPDATE ON public.highlights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket highlights no Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('highlights', 'highlights', true);

-- Políticas para o bucket highlights
CREATE POLICY "Anyone can view highlights images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'highlights');

CREATE POLICY "Approved admins can upload highlights images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = (
      SELECT email FROM public.profiles 
      WHERE user_id = auth.uid()
    ) AND is_active = true
  )
);

CREATE POLICY "Approved admins can update highlights images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = (
      SELECT email FROM public.profiles 
      WHERE user_id = auth.uid()
    ) AND is_active = true
  )
);

CREATE POLICY "Approved admins can delete highlights images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'highlights' AND 
  EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = (
      SELECT email FROM public.profiles 
      WHERE user_id = auth.uid()
    ) AND is_active = true
  )
);