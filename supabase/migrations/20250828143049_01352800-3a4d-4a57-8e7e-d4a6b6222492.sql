-- Create storage bucket for artists if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artists', 'artists', true)
ON CONFLICT (id) DO NOTHING;