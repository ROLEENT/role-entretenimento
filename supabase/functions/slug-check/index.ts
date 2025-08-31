import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function checkSlugAvailability(slug: string, table: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from(table)
    .select('id')
    .eq('slug', slug);
  
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  
  const { data, error } = await query.limit(1);
  
  if (error) {
    console.error(`Error checking slug in ${table}:`, error);
    throw error;
  }
  
  return !data || data.length === 0;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

async function generateUniqueSlug(baseText: string, table: string, excludeId?: string): Promise<string> {
  let baseSlug = generateSlug(baseText);
  let slug = baseSlug;
  let counter = 1;
  
  while (!(await checkSlugAvailability(slug, table, excludeId))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { slug, table, excludeId, generateFromText } = await req.json();
    
    if (!table) {
      return new Response(JSON.stringify({ error: 'Table is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    let result;
    
    if (generateFromText) {
      // Generate a unique slug from text
      result = {
        available: true,
        slug: await generateUniqueSlug(generateFromText, table, excludeId),
        generated: true
      };
    } else if (slug) {
      // Check if specific slug is available
      const available = await checkSlugAvailability(slug, table, excludeId);
      result = {
        available,
        slug,
        generated: false
      };
      
      // If not available and no excludeId (new record), generate alternative
      if (!available && !excludeId) {
        result.suggestedSlug = await generateUniqueSlug(slug, table);
      }
    } else {
      return new Response(JSON.stringify({ error: 'Either slug or generateFromText is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in slug-check function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});