import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidateInstagramRequest {
  instagram: string;
  type: 'artist' | 'organizer' | 'venue';
  excludeId?: string; // For edit mode - exclude current record
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { instagram, type, excludeId }: ValidateInstagramRequest = await req.json();

    if (!instagram || !type) {
      return new Response(
        JSON.stringify({ 
          error: 'Instagram handle and type are required',
          isDuplicate: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Normalize instagram handle (remove @ and convert to lowercase)
    const normalizedInstagram = instagram.replace(/^@+/, '').toLowerCase().trim();

    console.log(`Validating Instagram @${normalizedInstagram} for ${type}`);

    // Determine which table to check based on type
    let tableName: string;
    switch (type) {
      case 'artist':
        tableName = 'artists';
        break;
      case 'organizer':
        tableName = 'organizers';
        break;
      case 'venue':
        tableName = 'venues';
        break;
      default:
        return new Response(
          JSON.stringify({ 
            error: 'Invalid type. Must be artist, organizer, or venue',
            isDuplicate: false 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    // Build query to check for duplicates
    let query = supabase
      .from(tableName)
      .select('id, instagram')
      .ilike('instagram', normalizedInstagram);

    // Exclude current record if editing
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Database error',
          isDuplicate: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const isDuplicate = data && data.length > 0;

    console.log(`Duplicate check result: ${isDuplicate ? 'DUPLICATE' : 'UNIQUE'}`);

    if (isDuplicate) {
      console.log(`Found existing record(s):`, data);
    }

    return new Response(
      JSON.stringify({ 
        isDuplicate,
        normalizedInstagram,
        existingRecords: isDuplicate ? data.length : 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        isDuplicate: false // Fail open for better UX
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});