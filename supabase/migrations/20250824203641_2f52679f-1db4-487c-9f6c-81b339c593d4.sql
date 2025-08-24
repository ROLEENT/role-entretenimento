-- Add like_count field to highlights table
ALTER TABLE public.highlights 
ADD COLUMN like_count integer DEFAULT 0 NOT NULL;

-- Create index for performance on like_count queries
CREATE INDEX idx_highlights_like_count ON public.highlights(like_count DESC);

-- Create index for city + published + like_count queries (for the /destaques page)
CREATE INDEX idx_highlights_city_published_likes ON public.highlights(city, is_published, like_count DESC) WHERE is_published = true;

-- Create index for date-based queries (last 30 days filter)
CREATE INDEX idx_highlights_event_date_recent ON public.highlights(event_date) WHERE event_date >= (CURRENT_DATE - INTERVAL '30 days');