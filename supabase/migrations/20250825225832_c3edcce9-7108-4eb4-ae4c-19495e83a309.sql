-- Criar tabela para dados dos artistas do Spotify
CREATE TABLE public.artist_spotify_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  spotify_id TEXT UNIQUE NOT NULL,
  spotify_url TEXT NOT NULL,
  image_url TEXT,
  genres TEXT[],
  popularity INTEGER,
  followers_count INTEGER,
  preview_tracks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para relacionar eventos com artistas
CREATE TABLE public.event_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  artist_spotify_data_id UUID NOT NULL,
  is_main_artist BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (artist_spotify_data_id) REFERENCES public.artist_spotify_data(id) ON DELETE CASCADE
);

-- Criar tabela para tokens de autenticação dos usuários com Spotify
CREATE TABLE public.user_music_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'spotify',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Criar tabela para playlists geradas automaticamente
CREATE TABLE public.user_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  playlist_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'spotify',
  platform_playlist_id TEXT,
  platform_url TEXT,
  playlist_type TEXT NOT NULL DEFAULT 'favorites', -- 'favorites', 'event_based', 'custom'
  description TEXT,
  cover_image TEXT,
  track_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  auto_update BOOLEAN DEFAULT true,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para preferências musicais dos usuários
CREATE TABLE public.user_music_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_platforms TEXT[] DEFAULT ARRAY['spotify'],
  favorite_genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  auto_playlist_creation BOOLEAN DEFAULT true,
  playlist_update_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  include_preview_tracks BOOLEAN DEFAULT true,
  notification_new_artists BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para log de descoberta de artistas
CREATE TABLE public.artist_discovery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  artist_spotify_data_id UUID NOT NULL,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  interaction_type TEXT NOT NULL, -- 'preview_played', 'added_to_playlist', 'followed'
  FOREIGN KEY (artist_spotify_data_id) REFERENCES public.artist_spotify_data(id) ON DELETE CASCADE
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.artist_spotify_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_music_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_music_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_discovery_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para artist_spotify_data (dados públicos para leitura)
CREATE POLICY "Anyone can view artist data" 
  ON public.artist_spotify_data 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can manage artist data" 
  ON public.artist_spotify_data 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para event_artists (dados públicos para leitura)
CREATE POLICY "Anyone can view event artists" 
  ON public.event_artists 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can manage event artists" 
  ON public.event_artists 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para user_music_tokens (dados privados do usuário)
CREATE POLICY "Users can view their own music tokens" 
  ON public.user_music_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music tokens" 
  ON public.user_music_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music tokens" 
  ON public.user_music_tokens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music tokens" 
  ON public.user_music_tokens 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para user_playlists (dados privados do usuário)
CREATE POLICY "Users can view their own playlists" 
  ON public.user_playlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" 
  ON public.user_playlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
  ON public.user_playlists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
  ON public.user_playlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para user_music_preferences (dados privados do usuário)
CREATE POLICY "Users can view their own music preferences" 
  ON public.user_music_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music preferences" 
  ON public.user_music_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music preferences" 
  ON public.user_music_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para artist_discovery_log (dados privados do usuário)
CREATE POLICY "Users can view their own discovery log" 
  ON public.artist_discovery_log 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discovery entries" 
  ON public.artist_discovery_log 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_music_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artist_spotify_data_updated_at
  BEFORE UPDATE ON public.artist_spotify_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_music_updated_at_column();

CREATE TRIGGER update_user_music_tokens_updated_at
  BEFORE UPDATE ON public.user_music_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_music_updated_at_column();

CREATE TRIGGER update_user_playlists_updated_at
  BEFORE UPDATE ON public.user_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_music_updated_at_column();

CREATE TRIGGER update_user_music_preferences_updated_at
  BEFORE UPDATE ON public.user_music_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_music_updated_at_column();

-- Inserir dados de exemplo de artistas populares
INSERT INTO public.artist_spotify_data (artist_name, spotify_id, spotify_url, image_url, genres, popularity, followers_count) VALUES
('Anitta', '7eqoqGkKwgOaWNNHx90uEZ', 'https://open.spotify.com/artist/7eqoqGkKwgOaWNNHx90uEZ', 'https://i.scdn.co/image/ab6761610000e5eba92bb6aef81a000a0ffb4c86', ARRAY['latin pop', 'brazilian pop'], 85, 18000000),
('Alok', '1TH7eCYaUDP1ZFEYOAO4jG', 'https://open.spotify.com/artist/1TH7eCYaUDP1ZFEYOAO4jG', 'https://i.scdn.co/image/ab6761610000e5eb80e9bb0e2b50e13e0ad0e6e4', ARRAY['edm', 'brazilian electronic'], 80, 12000000),
('Pabllo Vittar', '6tzRWmbhOdH6hOzrILBYAA', 'https://open.spotify.com/artist/6tzRWmbhOdH6hOzrILBYAA', 'https://i.scdn.co/image/ab6761610000e5eb4d1a2e0e4e3b4e6b7b8b9b9b', ARRAY['pop', 'brazilian pop'], 75, 8000000),
('Emicida', '1u7kkVrr14iBvrpYnZILJR', 'https://open.spotify.com/artist/1u7kkVrr14iBvrpYnZILJR', 'https://i.scdn.co/image/ab6761610000e5eb5f5b8b5b5b5b5b5b5b5b5b5b', ARRAY['hip hop', 'brazilian hip hop'], 70, 4000000),
('Ludmilla', '4kI8Ie27vjvonwaB2ePh8T', 'https://open.spotify.com/artist/4kI8Ie27vjvonwaB2ePh8T', 'https://i.scdn.co/image/ab6761610000e5eb8e8e8e8e8e8e8e8e8e8e8e8e', ARRAY['funk carioca', 'brazilian pop'], 78, 6500000);