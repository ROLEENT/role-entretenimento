import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Playlist {
  id: string;
  playlist_name: string;
  platform: string;
  platform_playlist_id: string;
  platform_url: string;
  playlist_type: string;
  description?: string;
  cover_image?: string;
  track_count: number;
  is_public: boolean;
  auto_update: boolean;
  last_updated_at: string;
  created_at: string;
}

interface PlaylistState {
  playlists: Playlist[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
}

export const usePlaylistManager = () => {
  const [state, setState] = useState<PlaylistState>({
    playlists: [],
    loading: false,
    creating: false,
    updating: false,
  });
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPlaylists();
    } else {
      setState(prev => ({ ...prev, playlists: [] }));
    }
  }, [user]);

  const loadPlaylists = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase
        .from('user_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({ ...prev, playlists: data || [], loading: false }));
    } catch (error) {
      console.error('Error loading playlists:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  const createPlaylist = useCallback(async (name: string, type: string = 'custom') => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      setState(prev => ({ ...prev, creating: true }));

      const { data, error } = await supabase.functions.invoke('playlist-manager', {
        body: { 
          action: 'create-playlist', 
          playlistName: name,
          playlistType: type
        }
      });

      if (error) throw error;

      if (data?.playlist) {
        setState(prev => ({ 
          ...prev, 
          playlists: [data.playlist, ...prev.playlists],
          creating: false
        }));
        
        toast.success(`Playlist "${name}" criada com sucesso!`);
        return data.playlist;
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Erro ao criar playlist');
      setState(prev => ({ ...prev, creating: false }));
    }
    return null;
  }, [user]);

  const generateFromFavorites = useCallback(async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      setState(prev => ({ ...prev, creating: true }));

      const { data, error } = await supabase.functions.invoke('playlist-manager', {
        body: { action: 'generate-from-favorites' }
      });

      if (error) throw error;

      if (data?.playlist) {
        setState(prev => ({ 
          ...prev, 
          playlists: [data.playlist, ...prev.playlists],
          creating: false
        }));
        
        toast.success(`Playlist criada com ${data.tracks_added} músicas dos seus eventos favoritos!`);
        return data.playlist;
      }
    } catch (error) {
      console.error('Error generating playlist from favorites:', error);
      toast.error('Erro ao gerar playlist dos favoritos');
      setState(prev => ({ ...prev, creating: false }));
    }
    return null;
  }, [user]);

  const updatePlaylist = useCallback(async (playlistId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    try {
      setState(prev => ({ ...prev, updating: true }));

      const { data, error } = await supabase.functions.invoke('playlist-manager', {
        body: { 
          action: 'update-playlist', 
          playlistId
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Update local playlist data
        setState(prev => ({
          ...prev,
          playlists: prev.playlists.map(p => 
            p.id === playlistId 
              ? { ...p, last_updated_at: new Date().toISOString() }
              : p
          ),
          updating: false
        }));
        
        toast.success(`Playlist atualizada com ${data.tracks_updated} músicas!`);
        return true;
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast.error('Erro ao atualizar playlist');
      setState(prev => ({ ...prev, updating: false }));
    }
    return false;
  }, [user]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        playlists: prev.playlists.filter(p => p.id !== playlistId)
      }));
      
      toast.success('Playlist removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Erro ao remover playlist');
    }
    return false;
  }, [user]);

  const getPlaylistsByType = useCallback((type: string) => {
    return state.playlists.filter(p => p.playlist_type === type);
  }, [state.playlists]);

  return {
    ...state,
    loadPlaylists,
    createPlaylist,
    generateFromFavorites,
    updatePlaylist,
    deletePlaylist,
    getPlaylistsByType,
  };
};