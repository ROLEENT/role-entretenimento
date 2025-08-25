-- Criar tabela de comentários para highlights
CREATE TABLE public.highlight_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  highlight_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.highlight_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for highlight comments
CREATE POLICY "Anyone can view highlight comments" 
ON public.highlight_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create highlight comments" 
ON public.highlight_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlight comments" 
ON public.highlight_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlight comments" 
ON public.highlight_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_highlight_comments_updated_at
BEFORE UPDATE ON public.highlight_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();