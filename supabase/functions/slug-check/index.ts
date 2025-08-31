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
    let table, slug, excludeId;

    if (req.method === 'GET') {
      const url = new URL(req.url)
      table = url.searchParams.get('table')
      slug = url.searchParams.get('slug')
      excludeId = url.searchParams.get('excludeId')
    } else {
      const body = await req.json()
      table = body.table
      slug = body.slug
      excludeId = body.excludeId
    }

    console.log(`Slug check request - table: ${table}, slug: ${slug}, excludeId: ${excludeId}`)

    if (!table || !slug) {
      return new Response(
        JSON.stringify({ error: 'Table and slug parameters are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate table parameter for security
    const validTables = ['artists', 'organizers', 'venues']
    if (!validTables.includes(table)) {
      return new Response(
        JSON.stringify({ error: 'Invalid table parameter' }),
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

    // Build query to check slug existence
    let queryBuilder = supabase
      .from(table)
      .select('id')
      .eq('slug', slug)

    // Exclude current record if editing
    if (excludeId) {
      queryBuilder = queryBuilder.neq('id', excludeId)
    }

    const { data, error } = await queryBuilder.limit(1)

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const exists = data && data.length > 0
    console.log(`Slug '${slug}' exists in ${table}:`, exists)

    return new Response(
      JSON.stringify({ 
        exists,
        available: !exists,
        slug,
        table
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Slug check function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})