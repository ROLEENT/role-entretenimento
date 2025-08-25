-- Update function to increment highlight likes with proper search_path
CREATE OR REPLACE FUNCTION increment_highlight_likes(highlight_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE highlights 
    SET like_count = like_count + 1 
    WHERE id = highlight_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';