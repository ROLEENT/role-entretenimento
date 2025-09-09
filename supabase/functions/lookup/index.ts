import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let type, query, limit;

    if (req.method === 'GET') {
      const url = new URL(req.url)
      type = url.searchParams.get('type')
      query = url.searchParams.get('q') || ''
      limit = parseInt(url.searchParams.get('limit') || '20')
    } else {
      const body = await req.json()
      type = body.type
      query = body.q || ''
      limit = body.limit || 20
    }

    console.log(`Lookup request - type: ${type}, query: ${query}, limit: ${limit}`)

    if (!type) {
      return new Response(
        JSON.stringify({ error: 'Type parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate type parameter
    const validTypes = ['artists', 'organizers', 'venues']
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let queryBuilder;
    
    // Build query based on type - using original tables that work
    switch (type) {
      case 'artists':
        queryBuilder = supabase
          .from('artists')
          .select(`
            id, 
            stage_name as name,
            city,
            booking_email as contact_email,
            slug as handle
          `)
          .eq('status', 'active')
          .ilike('stage_name', `%${query}%`)
        break;
        
      case 'organizers':
        queryBuilder = supabase
          .from('organizers')
          .select(`
            id, 
            name,
            city,
            email as contact_email,
            slug as handle
          `)
          .ilike('name', `%${query}%`)
        break;
        
      case 'venues':
        queryBuilder = supabase
          .from('venues')
          .select(`
            id, 
            name,
            city,
            contact_email,
            slug as handle
          `)
          .ilike('name', `%${query}%`)
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    const { data, error } = await queryBuilder
      .order('name')
      .limit(Math.min(limit, 50)) // Max 50 results

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Database query failed', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${data?.length || 0} results`)

    return new Response(
      JSON.stringify({ data: data || [] }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Lookup function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})