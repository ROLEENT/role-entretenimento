import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const path = url.pathname;
    const searchParams = url.searchParams;
    const query = searchParams.get('q') || '';

    // Route based on path
    if (path.includes('/artist-types')) {
      return await handleArtistTypes(req, supabase, query);
    } else if (path.includes('/genres')) {
      return await handleGenres(req, supabase, query);
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleArtistTypes(req: Request, supabase: any, query: string) {
  if (req.method === 'GET') {
    // Search artist types
    let dbQuery = supabase
      .from('artist_types')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }

    const { data, error } = await dbQuery.limit(20);

    if (error) throw error;

    const items = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name
    }));

    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } else if (req.method === 'POST') {
    // Create new artist type
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('artist_types')
      .insert([{ name: name.trim(), is_active: true }])
      .select('id, name')
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ id: data.id, name: data.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGenres(req: Request, supabase: any, query: string) {
  if (req.method === 'GET') {
    // Search genres
    let dbQuery = supabase
      .from('genres')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }

    const { data, error } = await dbQuery.limit(20);

    if (error) throw error;

    const items = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name
    }));

    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } else if (req.method === 'POST') {
    // Create new genre
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('genres')
      .insert([{ name: name.trim(), is_active: true }])
      .select('id, name')
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ id: data.id, name: data.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}