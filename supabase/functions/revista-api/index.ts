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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    console.log(`[revista-api] Executing query...`);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[revista-api] Database error:', error);
      return new Response(
        JSON.stringify({ 
          data: [], 
          total: 0, 
          error: 'database_error',
          message: 'Erro ao buscar artigos' 
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
    return new Response(
      JSON.stringify({ 
        data: [], 
        total: 0, 
        error: 'fatal_error',
        message: 'Erro interno do servidor' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});