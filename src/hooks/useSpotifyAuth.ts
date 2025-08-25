import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SpotifyAuthState {
  isConnected: boolean;
  loading: boolean;
  profile: any | null;
}

export const useSpotifyAuth = () => {
  const [state, setState] = useState<SpotifyAuthState>({
    isConnected: false,
    loading: true,
    profile: null,
  });
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkConnection();
    } else {
      setState({ isConnected: false, loading: false, profile: null });
    }
  }, [user]);

  const checkConnection = async () => {
    if (!user) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase
        .from('user_music_tokens')
        .select('expires_at')
        .eq('user_id', user.id)
        .eq('platform', 'spotify')
        .maybeSingle();

      if (error) {
        console.error('Error checking Spotify connection:', error);
        setState({ isConnected: false, loading: false, profile: null });
        return;
      }

      const isConnected = data && new Date(data.expires_at) > new Date();
      setState(prev => ({ ...prev, isConnected, loading: false }));
      
      if (isConnected) {
        // Get profile if connected
        await getProfile();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setState({ isConnected: false, loading: false, profile: null });
    }
  };

  const getProfile = async () => {
    try {
      const { data: tokenData } = await supabase
        .from('user_music_tokens')
        .select('access_token')
        .eq('user_id', user?.id)
        .eq('platform', 'spotify')
        .maybeSingle();

      if (tokenData?.access_token) {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          setState(prev => ({ ...prev, profile }));
        }
      }
    } catch (error) {
      console.error('Error getting profile:', error);
    }
  };

  const connect = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para conectar com o Spotify');
      return;
    }

    try {
      console.log('🔐 Starting Spotify connection for user:', user.id);
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.functions.invoke('spotify-auth', {
        body: { action: 'get-auth-url' }
      });

      if (error) {
        console.error('❌ Spotify auth function error:', error);
        throw error;
      }

      console.log('✅ Got auth URL from Spotify:', data?.authUrl ? 'success' : 'missing');
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('❌ Error connecting to Spotify:', error);
      toast.error('Erro ao conectar com o Spotify');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const disconnect = async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase
        .from('user_music_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'spotify');

      if (error) throw error;

      setState({ isConnected: false, loading: false, profile: null });
      toast.success('Desconectado do Spotify com sucesso');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erro ao desconectar do Spotify');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCallback = async (code: string, state: string) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.functions.invoke('spotify-auth', {
        body: { action: 'exchange-code', code, state }
      });

      if (error) throw error;

      if (data?.success) {
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          loading: false,
          profile: data.profile 
        }));
        toast.success('Conectado ao Spotify com sucesso!');
        return true;
      }
    } catch (error) {
      console.error('Error handling callback:', error);
      toast.error('Erro ao conectar com o Spotify');
      setState(prev => ({ ...prev, loading: false }));
    }
    return false;
  };

  const refreshToken = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('spotify-auth', {
        body: { action: 'refresh-token' }
      });

      if (error) throw error;

      return data?.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  return {
    ...state,
    connect,
    disconnect,
    handleCallback,
    refreshToken,
    checkConnection,
  };
};