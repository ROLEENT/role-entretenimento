import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RevistaArticle {
  id: string;
  title: string;
  excerpt: string;
  cover_url: string;
  publish_at: string;
  reading_time_min: number;
  city: string;
  slug: string;
}

// Compatibilidade com RevistaPost - interface completa
export interface RevistaPost {
  id: string;
  title: string;
  excerpt: string;
  summary: string; // Alias para excerpt
  cover_url: string;
  cover_image: string; // Alias para cover_url
  publish_at: string;
  published_at: string; // Alias para publish_at
  reading_time_min: number;
  reading_time: number; // Alias para reading_time_min
  city: string;
  slug: string;
  slug_data?: string;
  seo_title?: string;
  seo_description?: string;
  updated_at?: string;
  author_name?: string;
  tags?: string[];
  categories?: any[];
  featured?: boolean;
  content_html?: string;
}

interface UseRevistaDataParams {
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
      
      console.log('[useRevistaData] Iniciando fetch com parâmetros:', params);

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published');

      // Ordenação
      switch (params.sortBy) {
        case 'most_read':
          query = query.order('views', { ascending: false });
          break;
        case 'most_saved':
          // Para implementar quando tivermos sistema de favoritos
          query = query.order('published_at', { ascending: false });
          break;
        case 'recent':
        default:
          query = query.order('published_at', { ascending: false });
          break;
      }

      // Filtro de busca
      if (params.searchTerm) {
        query = query.ilike('title', `%${params.searchTerm}%`);
      }

      // Filtro de seção (usando tags)
      if (params.sectionFilter) {
        query = query.contains('tags', [params.sectionFilter]);
      }

      // Paginação
      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.page && params.page > 1) {
        const offset = (params.page - 1) * (params.limit || 12);
        query = query.range(offset, offset + (params.limit || 12) - 1);
      }

      const { data, error: fetchError, count } = await query;
      
      console.log('[useRevistaData] Resposta do Supabase:', { data: data?.length, count, error: fetchError });

      if (fetchError) {
        console.error('[useRevistaData] Erro no fetch:', fetchError);
        throw fetchError;
      }

      // Transform data to match both interfaces
      const transformedArticles: RevistaArticle[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.summary,
        cover_url: item.cover_image,
        publish_at: item.published_at,
        reading_time_min: item.reading_time,
        city: item.city,
        slug: item.slug
      }));

      const transformedPosts: RevistaPost[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.summary,
        summary: item.summary,
        cover_url: item.cover_image,
        cover_image: item.cover_image,
        publish_at: item.published_at,
        published_at: item.published_at,
        reading_time_min: item.reading_time || 5,
        reading_time: item.reading_time || 5,
        city: item.city,
        slug: item.slug,
        slug_data: item.slug_data,
        seo_title: item.seo_title,
        seo_description: item.seo_description,
        updated_at: item.updated_at,
        author_name: item.author_name,
        tags: item.tags || [],
        categories: item.category_ids ? [] : [],
        featured: item.featured || false,
        content_html: item.content_html
      }));

      setArticles(transformedArticles);
      setPosts(transformedPosts);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / (params.limit || 12)));
      
      console.log('[useRevistaData] Success:', { 
        articles: transformedArticles.length, 
        posts: transformedPosts.length, 
        total: count 
      });
    } catch (err) {
      console.error('[useRevistaData] Error fetching articles:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar artigos';
      console.error('[useRevistaData] Erro detalhado:', errorMessage);
      setError(errorMessage);
      // Não re-fazer fetch em caso de erro - empty state
      setArticles([]);
      setPosts([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      console.log('[useRevistaData] Finalizando fetch, setIsLoading(false)');
      setIsLoading(false);
    }
  }, [params.searchTerm, params.sectionFilter, params.sortBy, params.page, params.limit]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const refetch = useCallback(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    posts, // Compatibilidade com interface correta
    totalCount,
    totalPages,
    isLoading,
    error,
    refetch,
  };
};

// Funções auxiliares para compatibilidade
export const getRevistaCities = async () => {
  const { data } = await supabase
    .from('blog_posts')
    .select('city')
    .eq('status', 'published');
    
  const cities = Array.from(new Set((data || []).map(item => item.city).filter(Boolean)));
  return cities;
};

export const getRevistaSections = async () => {
  // Retorna seções padrão se não existir campo específico
  return ['editorial', 'cultura', 'música', 'arte'];
};

export const getRevistaPostBySlug = async (slug: string): Promise<RevistaPost | null> => {
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
    excerpt: data.summary,
    summary: data.summary,
    cover_url: data.cover_image,
    cover_image: data.cover_image,
    publish_at: data.published_at,
    published_at: data.published_at,
    reading_time_min: data.reading_time,
    reading_time: data.reading_time,
    city: data.city,
    slug: data.slug,
    slug_data: data.slug_data,
    seo_title: data.seo_title,
    seo_description: data.seo_description,
    updated_at: data.updated_at,
    author_name: data.author_name,
    tags: data.tags,
    categories: data.category_ids ? [] : [], // Mapear se necessário
    featured: data.featured,
    content_html: data.content_html
  };
};