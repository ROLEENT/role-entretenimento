import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function handleGenres(req: Request, method: string): Promise<Response> {
  if (method === 'GET') {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    
    let dbQuery = supabase
      .from('genres')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }
    
    const { data, error } = await dbQuery.limit(50);
    
    if (error) {
      console.error('Error fetching genres:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  if (method === 'POST') {
    const { name } = await req.json();
    
    if (!name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const { data, error } = await supabase
      .from('genres')
      .insert({ name, is_active: true })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating genre:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleArtistTypes(req: Request, method: string): Promise<Response> {
  if (method === 'GET') {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    
    let dbQuery = supabase
      .from('artist_types')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }
    
    const { data, error } = await dbQuery.limit(50);
    
    if (error) {
      console.error('Error fetching artist types:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  if (method === 'POST') {
    const { name } = await req.json();
    
    if (!name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const { data, error } = await supabase
      .from('artist_types')
      .insert({ name, is_active: true })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating artist type:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    if (path.includes('/genres')) {
      return await handleGenres(req, req.method);
    } else if (path.includes('/artist-types')) {
      return await handleArtistTypes(req, req.method);
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in options function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});