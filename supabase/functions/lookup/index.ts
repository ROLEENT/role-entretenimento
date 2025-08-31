import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function searchArtists(query: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('artists')
    .select('id, stage_name, city, booking_email')
    .or(`stage_name.ilike.%${query}%,city.ilike.%${query}%`)
    .eq('status', 'active')
    .order('stage_name')
    .limit(20);

  if (error) {
    console.error('Error searching artists:', error);
    return [];
  }

  return (data || []).map(artist => ({
    id: artist.id,
    name: artist.stage_name,
    city: artist.city,
    value: artist.id,
    subtitle: artist.booking_email || undefined,
  }));
}

async function searchOrganizers(query: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('organizers')
    .select('id, name, city, contact_email')
    .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
    .eq('status', 'active')
    .order('name')
    .limit(20);

  if (error) {
    console.error('Error searching organizers:', error);
    return [];
  }

  return (data || []).map(organizer => ({
    id: organizer.id,
    name: organizer.name,
    city: organizer.city,
    value: organizer.id,
    subtitle: organizer.contact_email || undefined,
  }));
}

async function searchVenues(query: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, address, city')
    .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
    .eq('status', 'active')
    .order('name')
    .limit(20);

  if (error) {
    console.error('Error searching venues:', error);
    return [];
  }

  return (data || []).map(venue => ({
    id: venue.id,
    name: venue.name,
    city: venue.city,
    value: venue.id,
    subtitle: venue.address || undefined,
  }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    if (req.method === 'GET' && path.includes('/artists')) {
      const query = url.searchParams.get('q') || '';
      const results = await searchArtists(query);
      
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (req.method === 'POST') {
      const { query, type } = await req.json();
      
      if (!query || !type) {
        return new Response(JSON.stringify({ error: 'Query and type are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      let results: any[] = [];
      
      switch (type) {
        case 'artists':
          results = await searchArtists(query);
          break;
        case 'organizers':
          results = await searchOrganizers(query);
          break;
        case 'venues':
          results = await searchVenues(query);
          break;
        default:
          return new Response(JSON.stringify({ error: 'Invalid type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }
      
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in lookup function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});