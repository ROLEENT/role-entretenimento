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

    const { action, artistName, eventId, eventTitle } = await req.json();

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

    if (action === 'search-artist') {
      if (!artistName) {
        return new Response(JSON.stringify({ error: 'Artist name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Search for artist on Spotify
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        }
      );

      if (!searchResponse.ok) {
        const errorData = await searchResponse.text();
        console.error('Spotify search error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to search artist' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.artists?.items?.length) {
        return new Response(JSON.stringify({ artist: null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const artist = searchData.artists.items[0];

      // Get artist's top tracks
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?country=BR`,
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        }
      );

      let topTracks = [];
      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json();
        topTracks = tracksData.tracks.slice(0, 3).map((track: any) => ({
          id: track.id,
          name: track.name,
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          duration_ms: track.duration_ms,
        }));
      }

      // Store or update artist data
      const { data: artistData, error: artistError } = await supabaseClient
        .from('artist_spotify_data')
        .upsert({
          artist_name: artist.name,
          spotify_id: artist.id,
          spotify_url: artist.external_urls.spotify,
          image_url: artist.images?.[0]?.url,
          genres: artist.genres,
          popularity: artist.popularity,
          followers_count: artist.followers.total,
          preview_tracks: topTracks,
        }, {
          onConflict: 'spotify_id'
        })
        .select()
        .single();

      if (artistError) {
        console.error('Database error:', artistError);
        return new Response(JSON.stringify({ error: 'Failed to store artist data' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Link artist to event if eventId is provided
      if (eventId && artistData) {
        await supabaseClient
          .from('event_artists')
          .upsert({
            event_id: eventId,
            artist_spotify_data_id: artistData.id,
            is_main_artist: true,
          }, {
            onConflict: 'event_id,artist_spotify_data_id'
          });
      }

      return new Response(JSON.stringify({
        artist: {
          ...artistData,
          topTracks,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'discover-from-event') {
      if (!eventTitle) {
        return new Response(JSON.stringify({ error: 'Event title is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Extract potential artist names from event title
      const artistNames = extractArtistNames(eventTitle);
      const discoveredArtists = [];

      for (const artistName of artistNames) {
        try {
          // Search for each potential artist
          const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
            {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
              },
            }
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            
            if (searchData.artists?.items?.length) {
              const artist = searchData.artists.items[0];
              
              // Get top tracks
              const tracksResponse = await fetch(
                `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?country=BR`,
                {
                  headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                  },
                }
              );

              let topTracks = [];
              if (tracksResponse.ok) {
                const tracksData = await tracksResponse.json();
                topTracks = tracksData.tracks.slice(0, 3).map((track: any) => ({
                  id: track.id,
                  name: track.name,
                  preview_url: track.preview_url,
                  external_urls: track.external_urls,
                  duration_ms: track.duration_ms,
                }));
              }

              // Store artist data
              const { data: artistData, error: artistError } = await supabaseClient
                .from('artist_spotify_data')
                .upsert({
                  artist_name: artist.name,
                  spotify_id: artist.id,
                  spotify_url: artist.external_urls.spotify,
                  image_url: artist.images?.[0]?.url,
                  genres: artist.genres,
                  popularity: artist.popularity,
                  followers_count: artist.followers.total,
                  preview_tracks: topTracks,
                }, {
                  onConflict: 'spotify_id'
                })
                .select()
                .single();

              if (!artistError && artistData && eventId) {
                // Link to event
                await supabaseClient
                  .from('event_artists')
                  .upsert({
                    event_id: eventId,
                    artist_spotify_data_id: artistData.id,
                    is_main_artist: discoveredArtists.length === 0,
                  }, {
                    onConflict: 'event_id,artist_spotify_data_id'
                  });

                discoveredArtists.push({
                  ...artistData,
                  topTracks,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error searching for artist ${artistName}:`, error);
        }
      }

      return new Response(JSON.stringify({
        artists: discoveredArtists,
        extractedNames: artistNames,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'log-interaction') {
      const { artistId, interactionType } = await req.json();
      
      if (!artistId || !interactionType || !eventId) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await supabaseClient
        .from('artist_discovery_log')
        .insert({
          user_id: user.id,
          event_id: eventId,
          artist_spotify_data_id: artistId,
          interaction_type: interactionType,
        });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in music-discovery function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to extract potential artist names from event titles
function extractArtistNames(eventTitle: string): string[] {
  const artists = [];
  
  // Common patterns in event titles
  const patterns = [
    // "Show de [Artist]", "Apresenta [Artist]", etc.
    /(?:show|apresenta|com|feat\.?|featuring)\s+([A-Za-zÀ-ÿ\s]+?)(?:\s+[-–—]|\s*$|\s+no\s|\s+na\s|\s+em\s)/gi,
    // "[Artist] ao vivo", "[Artist] em concert", etc.
    /^([A-Za-zÀ-ÿ\s]+?)\s+(?:ao vivo|em concert|live|show)/gi,
    // "Noite de [Artist]", "Tributo a [Artist]", etc.
    /(?:noite|tributo|homenagem)\s+(?:de|a|ao|à)\s+([A-Za-zÀ-ÿ\s]+?)(?:\s+[-–—]|\s*$|\s+no\s|\s+na\s|\s+em\s)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(eventTitle)) !== null) {
      const artistName = match[1].trim();
      if (artistName.length > 2 && artistName.length < 50) {
        artists.push(artistName);
      }
    }
  }

  // If no patterns matched, try to extract the first part of the title
  if (artists.length === 0) {
    const firstPart = eventTitle.split(/[-–—]/)[0].trim();
    if (firstPart.length > 2 && firstPart.length < 50) {
      artists.push(firstPart);
    }
  }

  return [...new Set(artists)]; // Remove duplicates
}