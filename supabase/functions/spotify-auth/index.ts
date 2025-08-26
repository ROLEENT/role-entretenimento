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

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, code, state } = await req.json();
    
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('Missing Spotify credentials');
      return new Response(JSON.stringify({ error: 'Missing Spotify credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-auth-url') {
      console.log('🎵 Gerando URL de autorização do Spotify...');
      const origin = req.headers.get('origin') || 'https://0b445d10-2560-433e-8fca-2c83144c12a9.lovableproject.com';
      const redirectUri = `${origin}/music/callback`;
      const scope = 'user-read-private user-read-email user-library-read user-library-modify playlist-read-private playlist-modify-public playlist-modify-private';
      
      console.log('🔗 Redirect URI:', redirectUri);
      
      const authUrl = `https://accounts.spotify.com/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${user.id}`;

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'exchange-code') {
      if (!code) {
        return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('🔑 Trocando código por tokens...');
      const origin = req.headers.get('origin') || 'https://0b445d10-2560-433e-8fca-2c83144c12a9.lovableproject.com';
      const redirectUri = `${origin}/music/callback`;
      console.log('🔗 Redirect URI para troca:', redirectUri);
      
      // Exchange code for tokens
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Token exchange error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to exchange code for tokens' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokenData = await tokenResponse.json();
      
      // Calculate expiration time
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

      // Store tokens in database
      const { error: insertError } = await supabaseClient
        .from('user_music_tokens')
        .upsert({
          user_id: user.id,
          platform: 'spotify',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          scope: tokenData.scope,
        }, {
          onConflict: 'user_id,platform'
        });

      if (insertError) {
        console.error('Database error:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to store tokens' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user's Spotify profile
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      let spotifyProfile = null;
      if (profileResponse.ok) {
        spotifyProfile = await profileResponse.json();
      }

      return new Response(JSON.stringify({ 
        success: true, 
        profile: spotifyProfile,
        message: 'Successfully connected to Spotify!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'refresh-token') {
      // Get current tokens
      const { data: tokenData, error: fetchError } = await supabaseClient
        .from('user_music_tokens')
        .select('refresh_token')
        .eq('user_id', user.id)
        .eq('platform', 'spotify')
        .single();

      if (fetchError || !tokenData?.refresh_token) {
        return new Response(JSON.stringify({ error: 'No refresh token found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Refresh the token
      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token,
        }),
      });

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.text();
        console.error('Token refresh error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const newTokenData = await refreshResponse.json();
      const expiresAt = new Date(Date.now() + (newTokenData.expires_in * 1000));

      // Update tokens in database
      const { error: updateError } = await supabaseClient
        .from('user_music_tokens')
        .update({
          access_token: newTokenData.access_token,
          refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', user.id)
        .eq('platform', 'spotify');

      if (updateError) {
        console.error('Database update error:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update tokens' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        access_token: newTokenData.access_token
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in spotify-auth function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});