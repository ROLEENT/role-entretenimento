import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Artist {
  id: string;
  artist_name: string;
  spotify_id: string;
  spotify_url: string;
  image_url?: string;
  genres: string[];
  popularity: number;
  followers_count: number;
  preview_tracks: Track[];
}

interface Track {
  id: string;
  name: string;
  preview_url?: string;
  external_urls: { spotify: string };
  duration_ms: number;
}

interface DiscoveryState {
  loading: boolean;
  artists: Artist[];
  currentTrack: Track | null;
  isPlaying: boolean;
}

export const useMusicDiscovery = () => {
  const [state, setState] = useState<DiscoveryState>({
    loading: false,
    artists: [],
    currentTrack: null,
    isPlaying: false,
  });
  
  const { user } = useAuth();

  const searchArtist = useCallback(async (artistName: string, eventId?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.functions.invoke('music-discovery', {
        body: { 
          action: 'search-artist', 
          artistName,
          eventId
        }
      });

      if (error) throw error;

      setState(prev => ({ ...prev, loading: false }));
      return data?.artist;
    } catch (error) {
      console.error('Error searching artist:', error);
      toast.error('Erro ao buscar artista');
      setState(prev => ({ ...prev, loading: false }));
      return null;
    }
  }, [user]);

  const discoverFromEvent = useCallback(async (eventTitle: string, eventId?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return { artists: [], extractedNames: [] };
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.functions.invoke('music-discovery', {
        body: { 
          action: 'discover-from-event', 
          eventTitle,
          eventId
        }
      });

      if (error) throw error;

      const artists = data?.artists || [];
      setState(prev => ({ 
        ...prev, 
        loading: false,
        artists: [...prev.artists, ...artists]
      }));

      return {
        artists,
        extractedNames: data?.extractedNames || []
      };
    } catch (error) {
      console.error('Error discovering from event:', error);
      toast.error('Erro ao descobrir artistas do evento');
      setState(prev => ({ ...prev, loading: false }));
      return { artists: [], extractedNames: [] };
    }
  }, [user]);

  const playPreview = useCallback((track: Track) => {
    if (!track.preview_url) {
      toast.error('Preview não disponível para esta música');
      return;
    }

    // Stop current track if playing
    if (state.isPlaying && state.currentTrack) {
      const currentAudio = document.getElementById('preview-audio') as HTMLAudioElement;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Create or update audio element
    let audio = document.getElementById('preview-audio') as HTMLAudioElement;
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'preview-audio';
      audio.volume = 0.7;
      document.body.appendChild(audio);
    }

    audio.src = track.preview_url;
    audio.play();

    setState(prev => ({ 
      ...prev, 
      currentTrack: track, 
      isPlaying: true 
    }));

    // Auto-stop after 30 seconds
    audio.onended = () => {
      setState(prev => ({ 
        ...prev, 
        currentTrack: null, 
        isPlaying: false 
      }));
    };

    // Log interaction
    if (user) {
      logInteraction(track.id, 'preview_played');
    }
  }, [state.isPlaying, state.currentTrack, user]);

  const stopPreview = useCallback(() => {
    const audio = document.getElementById('preview-audio') as HTMLAudioElement;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState(prev => ({ 
      ...prev, 
      currentTrack: null, 
      isPlaying: false 
    }));
  }, []);

  const logInteraction = useCallback(async (artistId: string, interactionType: string, eventId?: string) => {
    if (!user || !eventId) return;

    try {
      await supabase.functions.invoke('music-discovery', {
        body: { 
          action: 'log-interaction', 
          artistId,
          interactionType,
          eventId
        }
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }, [user]);

  const getEventArtists = useCallback(async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_artists')
        .select(`
          artist_spotify_data (
            id,
            artist_name,
            spotify_id,
            spotify_url,
            image_url,
            genres,
            popularity,
            followers_count,
            preview_tracks
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      const artists: Artist[] = [];
      if (data) {
        for (const item of data) {
          if (item.artist_spotify_data) {
            const artist = item.artist_spotify_data as any;
            artists.push({
              id: artist.id,
              artist_name: artist.artist_name,
              spotify_id: artist.spotify_id,
              spotify_url: artist.spotify_url,
              image_url: artist.image_url,
              genres: artist.genres || [],
              popularity: artist.popularity || 0,
              followers_count: artist.followers_count || 0,
              preview_tracks: artist.preview_tracks || []
            });
          }
        }
      }
      
      setState(prev => ({ ...prev, artists }));
      return artists;
    } catch (error) {
      console.error('Error getting event artists:', error);
      return [];
    }
  }, []);

  const clearArtists = useCallback(() => {
    setState(prev => ({ ...prev, artists: [] }));
  }, []);

  return {
    ...state,
    searchArtist,
    discoverFromEvent,
    playPreview,
    stopPreview,
    logInteraction,
    getEventArtists,
    clearArtists,
  };
};