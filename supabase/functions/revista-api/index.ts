import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

interface RevistaPost {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  cover_image?: string;
  section?: string;
  reading_time: number;
  published_at: string;
  author_name?: string;
  views?: number;
}

Deno.serve(async (req) => {
  console.log(`[revista-api] ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const section = url.searchParams.get("section") ?? "";
    const sort = url.searchParams.get("sort") ?? "recent";
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "12"), 50); // Max 50
    const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0"), 0);

    console.log(`[revista-api] Query params:`, { q, section, sort, limit, offset });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[revista-api] Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          data: [], 
          total: 0, 
          error: "server_config_error",
          message: "Configuração do servidor incompleta"
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        slug,
        title,
        summary,
        cover_image,
        section,
        reading_time,
        published_at,
        author_name,
        views
      `, { count: 'exact' })
      .eq('status', 'published');

    // Filtro por seção
    if (section && section.trim()) {
      query = query.eq('section', section.trim());
    }

    // Busca simples por título para evitar problemas com FTS
    if (q && q.trim()) {
      query = query.ilike('title', `%${q.trim()}%`);
    }

    // Ordenação robusta
    switch (sort) {
      case 'most_read':
        query = query.order('views', { ascending: false, nullsLast: true });
        break;
      case 'alphabetical':
        query = query.order('title', { ascending: true });
        break;
      case 'recent':
      default:
        query = query.order('published_at', { ascending: false, nullsLast: true });
        break;
    }

    // Paginação
    query = query.range(offset, offset + limit - 1);

    console.log(`[revista-api] Executing query with timeout...`);
    
    // Add timeout to prevent hanging
    const queryPromise = query;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 15000)
    );
    
    const { data, error, count } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('[revista-api] Database error:', error);
      
      // Try fallback query with minimal data
      try {
        console.log('[revista-api] Attempting fallback query...');
        const fallbackQuery = supabase
          .from('blog_posts')
          .select('id, title, slug, published_at', { count: 'exact' })
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6);
          
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        
        if (!fallbackError && fallbackData) {
          console.log('[revista-api] Fallback successful');
          const transformedFallback = fallbackData.map(post => ({
            id: post.id,
            slug: post.slug,
            title: post.title || 'Sem título',
            summary: '',
            cover_image: '',
            section: '',
            reading_time: 5,
            published_at: post.published_at || new Date().toISOString(),
            author_name: 'ROLÊ',
            views: 0,
          }));
          
          return new Response(
            JSON.stringify({ 
              data: transformedFallback, 
              total: fallbackData.length,
              error: 'partial_data',
              message: 'Dados parciais carregados'
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } catch (fallbackErr) {
        console.error('[revista-api] Fallback also failed:', fallbackErr);
      }
      
      return new Response(
        JSON.stringify({ 
          data: [], 
          total: 0, 
          error: 'database_error',
          message: 'Erro ao buscar artigos',
          details: error.message
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[revista-api] Success: ${data?.length || 0} items, total: ${count}`);

    // Transformar dados para compatibilidade
    const transformedData: RevistaPost[] = (data || []).map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title || 'Sem título',
      summary: post.summary || '',
      cover_image: post.cover_image || '',
      section: post.section || '',
      reading_time: post.reading_time || 0,
      published_at: post.published_at || new Date().toISOString(),
      author_name: post.author_name || 'ROLÊ',
      views: post.views || 0,
    }));

    return new Response(
      JSON.stringify({ 
        data: transformedData, 
        total: count || 0,
        offset,
        limit,
        has_more: (count || 0) > offset + limit
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (e) {
    console.error('[revista-api] Fatal error:', e);
    
    // Always return 200 to prevent client-side errors and provide fallback
    return new Response(
      JSON.stringify({ 
        data: [], 
        total: 0, 
        error: 'fatal_error',
        message: 'Erro interno do servidor',
        details: e instanceof Error ? e.message : String(e),
        timestamp: new Date().toISOString(),
        fallback_available: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});