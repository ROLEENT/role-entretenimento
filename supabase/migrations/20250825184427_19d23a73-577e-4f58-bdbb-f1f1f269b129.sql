-- Criar tabela de curtidas para highlights
CREATE TABLE IF NOT EXISTS public.highlight_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  highlight_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(highlight_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.highlight_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para highlight_likes
CREATE POLICY "Users can manage their own highlight likes" 
ON public.highlight_likes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view highlight likes count" 
ON public.highlight_likes 
FOR SELECT 
USING (true);

-- Atualizar sistema de comentários para usar profiles
-- Os comentários já existem, mas vamos garantir que as políticas estão corretas

-- Função para atualizar contadores de curtidas em highlights
CREATE OR REPLACE FUNCTION update_highlight_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE highlights 
    SET like_count = like_count + 1 
    WHERE id = NEW.highlight_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE highlights 
    SET like_count = GREATEST(0, like_count - 1) 
    WHERE id = OLD.highlight_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contadores
CREATE TRIGGER update_highlight_like_count_trigger
  AFTER INSERT OR DELETE ON public.highlight_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_highlight_like_count();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_highlight_likes_highlight_id ON public.highlight_likes(highlight_id);
CREATE INDEX IF NOT EXISTS idx_highlight_likes_user_id ON public.highlight_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON public.event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_highlight_comments_highlight_id ON public.highlight_comments(highlight_id);