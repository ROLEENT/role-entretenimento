import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para normalizar slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífens
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get JWT token from Authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const url = new URL(req.url)
    const pathname = url.pathname
    const searchParams = url.searchParams

    // Extract type from path: /options/artist-types or /options/genres
    const pathParts = pathname.split('/')
    const optionType = pathParts[pathParts.length - 1] // "artist-types" or "genres"
    
    // Map URL paths to table names
    const tableMap: Record<string, string> = {
      'artist-types': 'artist_types',
      'genres': 'genres'
    }

    const tableName = tableMap[optionType]
    if (!tableName) {
      return new Response(
        JSON.stringify({ error: 'Invalid option type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'GET') {
      // Handle search query
      const query = searchParams.get('q') || ''
      
      let supabaseQuery = supabase
        .from(tableName)
        .select('id, name')
        .eq('active', true)
        .order('name')
        .limit(50)

      if (query.trim()) {
        supabaseQuery = supabaseQuery.ilike('name', `%${query}%`)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        console.error(`Error fetching ${tableName}:`, error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch options' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify(data || []),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (req.method === 'POST') {
      // Handle create new option
      const body = await req.json()
      const { name } = body

      if (!name || typeof name !== 'string' || !name.trim()) {
        return new Response(
          JSON.stringify({ error: 'Name is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const normalizedName = name.trim()
      const slug = slugify(normalizedName)

      // Upsert by slug
      const { data, error } = await supabase
        .from(tableName)
        .upsert(
          { 
            name: normalizedName, 
            slug: slug,
            active: true 
          },
          { 
            onConflict: 'slug',
            ignoreDuplicates: false 
          }
        )
        .select('id, name')
        .single()

      if (error) {
        console.error(`Error creating ${tableName}:`, error)
        return new Response(
          JSON.stringify({ error: 'Failed to create option' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify(data),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Options API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})