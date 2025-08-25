-- Ensure music_categories has proper data and relationships with events
INSERT INTO music_categories (name, slug, icon, color_hex) VALUES
('Eletrônica', 'eletronica', 'Zap', '#8B5CF6'),
('Rock', 'rock', 'Guitar', '#F59E0B'),
('Pop', 'pop', 'Star', '#EC4899'),
('Indie', 'indie', 'Heart', '#10B981'),
('Hip Hop', 'hip-hop', 'Headphones', '#EF4444'),
('Jazz', 'jazz', 'Music', '#3B82F6')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color_hex = EXCLUDED.color_hex;