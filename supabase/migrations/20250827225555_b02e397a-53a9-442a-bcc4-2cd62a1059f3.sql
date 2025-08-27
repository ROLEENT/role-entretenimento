-- Migrate existing data from highlight_likes to event_engagement
INSERT INTO public.event_engagement (user_id, highlight_id, engagement_type, created_at)
SELECT user_id, highlight_id, 'interest', created_at
FROM public.highlight_likes
ON CONFLICT DO NOTHING;

-- Migrate existing data from event_favorites to event_engagement  
INSERT INTO public.event_engagement (user_id, event_id, engagement_type, created_at)
SELECT user_id, event_id, 'interest', created_at
FROM public.event_favorites
ON CONFLICT DO NOTHING;