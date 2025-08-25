-- Create highlight_reviews table
CREATE TABLE IF NOT EXISTS public.highlight_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  highlight_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(highlight_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.highlight_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for highlight reviews
CREATE POLICY "Anyone can view highlight reviews" 
ON public.highlight_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own highlight reviews" 
ON public.highlight_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlight reviews" 
ON public.highlight_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlight reviews" 
ON public.highlight_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_highlight_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_highlight_reviews_updated_at
  BEFORE UPDATE ON public.highlight_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_highlight_reviews_updated_at();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_highlight_reviews_highlight_id ON public.highlight_reviews(highlight_id);
CREATE INDEX IF NOT EXISTS idx_highlight_reviews_user_id ON public.highlight_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_highlight_reviews_rating ON public.highlight_reviews(rating);