import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-store, max-age=0',
}

interface RevistaPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverUrl: string;
  section: string;
  readingTimeMin: number;
  dateISO: string;
}

Deno.serve(async (req: Request) => {
  console.log(`[revista-unified] ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ data: [], total: 0, error: 'method_not_allowed' }),
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[revista-unified] Missing environment variables');
      return new Response(
        JSON.stringify({ data: [], total: 0, error: 'config_error' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') ?? '').trim();
    const section = url.searchParams.get('section') ?? '';
    const sort = url.searchParams.get('sort') ?? 'recent';
    const limit = parseInt(url.searchParams.get('limit') ?? '12');
    const offset = parseInt(url.searchParams.get('offset') ?? '0');

    console.log(`[revista-unified] Query params:`, { q, section, sort, limit, offset });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Build query - using blog_posts table since posts_public doesn't exist
    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        slug,
        title,
        summary,
        cover_image,
        city,
        reading_time,
        published_at
      `, { count: 'exact' })
      .eq('status', 'published');

    // Apply filters
    if (section) {
      query = query.eq('city', section); // Using city as section
    }
    
    if (q) {
      query = query.ilike('title', `%${q}%`);
    }

    // Apply sorting
    if (sort === 'most_read') {
      query = query.order('views', { ascending: false });
    } else if (sort === 'alphabetical') {
      query = query.order('title', { ascending: true });
    } else {
      query = query.order('published_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 15000);
    });

    const queryPromise = query;
    const { data, error, count } = await Promise.race([queryPromise, timeoutPromise]) as any;

    if (error) {
      console.error('[revista-unified] Database error:', error);
      
      // Fallback query with minimal data
      try {
        const fallbackQuery = supabase
          .from('blog_posts')
          .select('id, slug, title, published_at', { count: 'exact' })
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(limit);

        const fallbackResult = await fallbackQuery;
        
        if (fallbackResult.data) {
          const fallbackItems = fallbackResult.data.map((r: any) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            excerpt: '',
            coverUrl: '',
            section: '',
            readingTimeMin: 5,
            dateISO: r.published_at,
          }));

          return new Response(
            JSON.stringify({ 
              data: fallbackItems, 
              total: fallbackResult.count ?? 0,
              error: 'partial_data'
            }),
            { status: 200, headers: corsHeaders }
          );
        }
      } catch (fallbackError) {
        console.error('[revista-unified] Fallback query failed:', fallbackError);
      }

      return new Response(
        JSON.stringify({ data: [], total: 0, error: 'db_error' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Transform data to match expected format
    const items: RevistaPost[] = (data ?? []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.summary || '',
      coverUrl: r.cover_image || '',
      section: r.city || '',
      readingTimeMin: r.reading_time || 5,
      dateISO: r.published_at,
    }));

    console.log(`[revista-unified] Success: ${items.length} items, total: ${count}`);

    return new Response(
      JSON.stringify({ 
        data: items, 
        total: count ?? 0,
        pagination: {
          limit,
          offset,
          hasMore: (count ?? 0) > offset + limit
        }
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('[revista-unified] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        data: [], 
        total: 0, 
        error: 'fatal_error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 200, headers: corsHeaders }
    );
  }
});