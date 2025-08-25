import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, playlistName, eventIds, playlistType = 'favorites' } = await req.json();

    // Get user's Spotify token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('user_music_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('platform', 'spotify')
      .maybeSingle();

    if (tokenError || !tokenData?.access_token) {
      return new Response(JSON.stringify({ error: 'Spotify not connected' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create-playlist') {
      if (!playlistName) {
        return new Response(JSON.stringify({ error: 'Playlist name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get Spotify user profile
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!profileResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to get Spotify profile' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const profile = await profileResponse.json();

      // Create playlist on Spotify
      const createResponse = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          description: `Created by ROLÊ - ${playlistType === 'favorites' ? 'Seus eventos favoritos' : 'Playlist personalizada'}`,
          public: false,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.text();
        console.error('Playlist creation error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to create playlist' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const playlist = await createResponse.json();

      // Store playlist in database
      const { data: dbPlaylist, error: dbError } = await supabaseClient
        .from('user_playlists')
        .insert({
          user_id: user.id,
          playlist_name: playlistName,
          platform: 'spotify',
          platform_playlist_id: playlist.id,
          platform_url: playlist.external_urls.spotify,
          playlist_type: playlistType,
          description: playlist.description,
          cover_image: playlist.images?.[0]?.url,
          is_public: playlist.public,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(JSON.stringify({ error: 'Failed to store playlist' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        playlist: dbPlaylist,
        spotify_playlist: playlist,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate-from-favorites') {
      // Get user's favorite events
      const { data: favorites, error: favError } = await supabaseClient
        .from('event_favorites')
        .select(`
          event_id,
          events (
            id,
            title
          )
        `)
        .eq('user_id', user.id);

      if (favError || !favorites?.length) {
        return new Response(JSON.stringify({ error: 'No favorite events found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const eventIds = favorites.map(f => f.event_id);

      // Get artists for these events
      const { data: eventArtists, error: artistError } = await supabaseClient
        .from('event_artists')
        .select(`
          artist_spotify_data (
            spotify_id,
            artist_name,
            preview_tracks
          )
        `)
        .in('event_id', eventIds);

      if (artistError || !eventArtists?.length) {
        return new Response(JSON.stringify({ error: 'No artists found for favorite events' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Collect track URIs
      const trackUris = [];
      for (const eventArtist of eventArtists) {
        if (eventArtist.artist_spotify_data?.preview_tracks) {
          const tracks = eventArtist.artist_spotify_data.preview_tracks;
          for (const track of tracks) {
            if (track.id) {
              trackUris.push(`spotify:track:${track.id}`);
            }
          }
        }
      }

      if (!trackUris.length) {
        return new Response(JSON.stringify({ error: 'No tracks found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create playlist first
      const playlistName = `ROLÊ - Meus Eventos Favoritos`;
      const createResult = await createPlaylistOnSpotify(tokenData.access_token, playlistName, 'Playlist gerada automaticamente com base nos seus eventos favoritos no ROLÊ');

      if (!createResult.success) {
        return new Response(JSON.stringify({ error: createResult.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const playlist = createResult.playlist;

      // Add tracks to playlist (Spotify limits to 100 tracks per request)
      const trackBatches = [];
      for (let i = 0; i < trackUris.length; i += 100) {
        trackBatches.push(trackUris.slice(i, i + 100));
      }

      for (const batch of trackBatches) {
        await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: batch,
          }),
        });
      }

      // Store in database
      const { data: dbPlaylist, error: dbError } = await supabaseClient
        .from('user_playlists')
        .insert({
          user_id: user.id,
          playlist_name: playlistName,
          platform: 'spotify',
          platform_playlist_id: playlist.id,
          platform_url: playlist.external_urls.spotify,
          playlist_type: 'favorites',
          description: playlist.description,
          cover_image: playlist.images?.[0]?.url,
          track_count: trackUris.length,
          is_public: false,
        })
        .select()
        .single();

      return new Response(JSON.stringify({
        playlist: dbPlaylist,
        tracks_added: trackUris.length,
        spotify_playlist: playlist,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update-playlist') {
      const { playlistId } = await req.json();
      
      if (!playlistId) {
        return new Response(JSON.stringify({ error: 'Playlist ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get playlist from database
      const { data: playlist, error: playlistError } = await supabaseClient
        .from('user_playlists')
        .select('*')
        .eq('id', playlistId)
        .eq('user_id', user.id)
        .single();

      if (playlistError || !playlist) {
        return new Response(JSON.stringify({ error: 'Playlist not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (playlist.playlist_type === 'favorites') {
        // Re-generate from current favorites
        const { data: favorites } = await supabaseClient
          .from('event_favorites')
          .select('event_id')
          .eq('user_id', user.id);

        if (favorites?.length) {
          const eventIds = favorites.map(f => f.event_id);
          
          // Get updated artists
          const { data: eventArtists } = await supabaseClient
            .from('event_artists')
            .select(`
              artist_spotify_data (
                spotify_id,
                preview_tracks
              )
            `)
            .in('event_id', eventIds);

          // Clear existing tracks
          await fetch(`https://api.spotify.com/v1/playlists/${playlist.platform_playlist_id}/tracks`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: [] }),
          });

          // Add new tracks
          const trackUris = [];
          for (const eventArtist of eventArtists || []) {
            if (eventArtist.artist_spotify_data?.preview_tracks) {
              for (const track of eventArtist.artist_spotify_data.preview_tracks) {
                if (track.id) {
                  trackUris.push(`spotify:track:${track.id}`);
                }
              }
            }
          }

          if (trackUris.length) {
            await fetch(`https://api.spotify.com/v1/playlists/${playlist.platform_playlist_id}/tracks`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uris: trackUris }),
            });
          }

          // Update database
          await supabaseClient
            .from('user_playlists')
            .update({
              track_count: trackUris.length,
              last_updated_at: new Date().toISOString(),
            })
            .eq('id', playlistId);

          return new Response(JSON.stringify({
            success: true,
            tracks_updated: trackUris.length,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Unable to update playlist' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in playlist-manager function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createPlaylistOnSpotify(accessToken: string, name: string, description: string) {
  try {
    // Get user profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      return { success: false, error: 'Failed to get Spotify profile' };
    }

    const profile = await profileResponse.json();

    // Create playlist
    const createResponse = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        public: false,
      }),
    });

    if (!createResponse.ok) {
      return { success: false, error: 'Failed to create playlist' };
    }

    const playlist = await createResponse.json();
    return { success: true, playlist };

  } catch (error) {
    return { success: false, error: error.message };
  }
}