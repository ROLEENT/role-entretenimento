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
    } else if (path.includes('/venues')) {
      return await handleVenues(req, supabase, query);
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
    // Search genres with hierarchical support
    let dbQuery = supabase
      .from('genres_with_hierarchy')
      .select('id, name, parent_name, source')
      .eq('is_active', true)
      .order('name');

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%, parent_name.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery.limit(30);

    if (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }

    console.log('Genres fetched:', data?.length || 0, 'items');

    const items = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      parent_name: item.parent_name,
      source: item.source,
      // Display format: "Deep House (House)" ou "House"
      display_name: item.parent_name ? `${item.name} (${item.parent_name})` : item.name
    }));

    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } else if (req.method === 'POST') {
    // Create new genre with auto-activation
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Nome é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if genre already exists (case insensitive)
    const { data: existing } = await supabase
      .from('genres')
      .select('id, name, is_active')
      .ilike('name', name)
      .single();

    if (existing) {
      // If exists but inactive, activate it
      if (!existing.is_active) {
        await supabase.rpc('activate_genre_and_parents', { genre_id: existing.id });
      }
      
      return new Response(
        JSON.stringify({ id: existing.id, name: existing.name }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new genre
    const { data, error } = await supabase
      .from('genres')
      .insert([{ 
        name: name.trim(), 
        source: 'manual',
        is_active: true,
        active: true // manter compatibilidade
      }])
      .select('id, name')
      .single();

    if (error) {
      console.error('Error creating genre:', error);
      throw error;
    }

    console.log('Genre created:', data);

    return new Response(
      JSON.stringify({ id: data.id, name: data.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleVenues(req: Request, supabase: any, query: string) {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const venueId = url.searchParams.get('id');
    
    // If ID is provided, fetch specific venue details
    if (venueId) {
      console.log(`Fetching venue details for ID: ${venueId}`);
      
      const { data: venue, error } = await supabase
        .from('venues')
        .select(`
          id, name, address_line, district, city, state, postal_code, country,
          latitude, longitude, capacity, about, tags, cover_url, cover_alt
        `)
        .eq('id', venueId)
        .eq('status', 'active')
        .single();
      
      if (error || !venue) {
        console.error('Error fetching venue details:', error);
        return new Response(JSON.stringify({ error: 'Venue not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`Venue details fetched for: ${venue.name}`);
      
      return new Response(JSON.stringify({ venue }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Search venues for autocomplete
    let dbQuery = supabase
      .from('venues')
      .select('id, name, city, address_line')
      .eq('status', 'active')
      .order('name');

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%, city.ilike.%${query}%, address_line.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery.limit(20);

    if (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }

    console.log('Venues fetched:', data?.length || 0, 'items');

    const items = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      city: item.city,
      address: item.address_line
    }));

    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } else if (req.method === 'POST') {
    // Create new venue
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('venues')
      .insert([{ 
        name: name.trim(), 
        status: 'active'
      }])
      .select('id, name, city, address')
      .single();

    if (error) {
      console.error('Error creating venue:', error);
      throw error;
    }

    console.log('Venue created:', data);

    return new Response(
      JSON.stringify({ 
        id: data.id, 
        name: data.name, 
        city: data.city, 
        address: data.address
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}