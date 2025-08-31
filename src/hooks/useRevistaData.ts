import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Interface for basic article data
export interface RevistaArticle {
  id: string;
  title: string;
  excerpt: string;
  cover_url: string;
  publish_at: string;
  reading_time_min: number;
  city?: string;
  slug: string;
}

// Interface for detailed post data with SEO and author info
export interface RevistaPost {
  id: string;
  title: string;
  summary: string;
  cover_image: string;
  published_at: string;
  reading_time: number;
  slug: string;
  section?: string;
  author_name?: string;
  views?: number;
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  seo_title?: string; // Alias
  seo_description?: string; // Alias
  // Content fields  
  content?: string;
  content_html?: string; // Alias
  excerpt?: string;
  reading_time_min?: number; // Alias for compatibility
  city?: string;
  tags?: string[];
  categories?: Array<{ name: string; id?: string; slug?: string }>; // For complex category objects
  status?: string;
  featured_image?: string; // Alias for cover_image
  cover_url?: string; // Alias for cover_image
  featured?: boolean;
  updated_at?: string;
  slug_data?: any; // For compatibility
}

export interface UseRevistaDataParams {
  searchTerm?: string;
  sectionFilter?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const useRevistaData = (params: UseRevistaDataParams = {}) => {
  const [articles, setArticles] = useState<RevistaArticle[]>([]);
  const [posts, setPosts] = useState<RevistaPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useRevistaData] Usando API robusta com parâmetros:', params);

      // Usar a nova API Edge Function robusta
      const searchParams = new URLSearchParams();
      if (params.searchTerm?.trim()) searchParams.set('q', params.searchTerm.trim());
      if (params.sectionFilter?.trim()) searchParams.set('section', params.sectionFilter.trim());
      if (params.sortBy && params.sortBy !== 'recent') searchParams.set('sort', params.sortBy);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.page && params.page > 1) {
        const offset = (params.page - 1) * (params.limit || 12);
        searchParams.set('offset', offset.toString());
      }

      const apiUrl = `https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/revista-api?${searchParams}`;
      
      console.log('[useRevistaData] Chamando API:', apiUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c`,
          },
          signal: controller.signal,
          cache: 'no-store', // Força no-cache
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        console.log('[useRevistaData] Resposta da API:', {
          total: result.total,
          count: result.data?.length,
          hasError: !!result.error
        });

        if (result.error) {
          throw new Error(result.message || result.error);
        }

        const transformedArticles: RevistaArticle[] = (result.data || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.summary || '',
          cover_url: post.cover_image || '',
          publish_at: post.published_at,
          reading_time_min: post.reading_time || 0,
          slug: post.slug,
        }));

        const transformedPosts: RevistaPost[] = (result.data || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          summary: post.summary || '',
          cover_image: post.cover_image || '',
          published_at: post.published_at,
          reading_time: post.reading_time || 0,
          slug: post.slug,
          section: post.section || '',
          author_name: post.author_name || 'ROLÊ',
          views: post.views || 0,
          // Aliases for compatibility
          excerpt: post.summary || '',
          reading_time_min: post.reading_time || 0,
          featured_image: post.cover_image || '',
          cover_url: post.cover_image || '',
          categories: (post.tags || []).map((tag: string) => ({ name: tag })),
          seo_title: post.meta_title,
          seo_description: post.meta_description,
          content_html: post.content,
          featured: false,
          updated_at: post.published_at,
          slug_data: { slug: post.slug },
        }));

        setArticles(transformedArticles);
        setPosts(transformedPosts);
        setTotalCount(result.total || 0);
        setTotalPages(Math.ceil((result.total || 0) / (params.limit || 12)));

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Timeout: a busca demorou muito para responder');
        }
        
        console.error('[useRevistaData] Erro na API, tentando fallback direto:', fetchError);
        
        // Fallback: tentar query direta ao Supabase
        let query = supabase
          .from('blog_posts')
          .select('*', { count: 'exact' })
          .eq('status', 'published');

        // Filtros
        if (params.sectionFilter?.trim()) {
          query = query.eq('section', params.sectionFilter.trim());
        }

        if (params.searchTerm?.trim()) {
          query = query.ilike('title', `%${params.searchTerm.trim()}%`);
        }

        // Ordenação
        switch (params.sortBy) {
          case 'most_read':
            query = query.order('views', { ascending: false });
            break;
          case 'alphabetical':
            query = query.order('title', { ascending: true });
            break;
          case 'recent':
          default:
            query = query.order('published_at', { ascending: false });
            break;
        }

        // Paginação
        const limit = params.limit || 12;
        const offset = params.page ? (params.page - 1) * limit : 0;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        
        if (error) {
          throw new Error(`Erro no banco: ${error.message}`);
        }

        console.log('[useRevistaData] Fallback bem-sucedido:', {
          total: count,
          count: data?.length
        });

        const fallbackArticles: RevistaArticle[] = (data || []).map(post => ({
          id: post.id,
          title: post.title || 'Sem título',
          excerpt: post.summary || '',
          cover_url: post.cover_image || '',
          publish_at: post.published_at || new Date().toISOString(),
          reading_time_min: post.reading_time || 0,
          slug: post.slug || '',
        }));

        const fallbackPosts: RevistaPost[] = (data || []).map(post => ({
          id: post.id,
          title: post.title || 'Sem título',
          summary: post.summary || '',
          cover_image: post.cover_image || '',
          published_at: post.published_at || new Date().toISOString(),
          reading_time: post.reading_time || 0,
          slug: post.slug || '',
          section: post.section || '',
          author_name: post.author_name || 'ROLÊ',
          views: post.views || 0,
          // Aliases
          excerpt: post.summary || '',
          reading_time_min: post.reading_time || 0,
          featured_image: post.cover_image || '',
          cover_url: post.cover_image || '',
          categories: (post.tags || []).map((tag: string) => ({ name: tag })),
          seo_title: post.meta_title,
          seo_description: post.meta_description,
          content_html: post.content,
          featured: false,
          updated_at: post.published_at || new Date().toISOString(),
          slug_data: { slug: post.slug || '' },
        }));

        setArticles(fallbackArticles);
        setPosts(fallbackPosts);
        setTotalCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / limit));
      }

    } catch (error) {
      console.error('[useRevistaData] Erro final:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar artigos');
      setArticles([]);
      setPosts([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [params.searchTerm, params.sectionFilter, params.sortBy, params.page, params.limit]);

  const refetch = useCallback(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    // Data
    articles,
    posts,
    totalCount,
    totalPages,
    // States
    isLoading,
    error,
    // Actions
    refetch,
    fetchArticles
  };
};

// Helper functions for accessing data
export const getRevistaCities = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('city')
      .eq('status', 'published')
      .not('city', 'is', null);

    if (error) throw error;

    const cities = [...new Set(data?.map(item => item.city).filter(Boolean))];
    return cities.sort();
  } catch (error) {
    console.error('[getRevistaCities] Error:', error);
    return [];
  }
};

export const getRevistaSections = (): string[] => {
  return [
    'música',
    'arte',
    'cultura',
    'gastronomia',
    'noite',
    'viagem',
    'lifestyle'
  ];
};

export const getRevistaPostBySlug = async (slug: string): Promise<RevistaPost | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      summary: data.summary || '',
      cover_image: data.cover_image || '',
      published_at: data.published_at,
      reading_time: data.reading_time || 0,
      slug: data.slug,
      section: data.section || '',
      author_name: data.author_name || 'ROLÊ',
      views: data.views || 0,
      content: data.content || '',
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      tags: data.tags || [],
      // Aliases
      excerpt: data.summary || '',
      reading_time_min: data.reading_time || 0,
      featured_image: data.cover_image || '',
      cover_url: data.cover_image || '',
      categories: (data.tags || []).map((tag: string) => ({ name: tag })),
      seo_title: data.meta_title,
      seo_description: data.meta_description,
      content_html: data.content || '',
      featured: false,
      updated_at: data.updated_at || data.published_at,
      slug_data: { slug: data.slug },
    };
  } catch (error) {
    console.error('[getRevistaPostBySlug] Error:', error);
    return null;
  }
};