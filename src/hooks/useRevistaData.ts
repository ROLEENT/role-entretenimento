import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeFetchJSON } from '@/lib/safeFetch';

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
    let alive = true;
    setIsLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      const qs = new URLSearchParams();
      if (params.searchTerm?.trim()) qs.set("q", params.searchTerm.trim());
      if (params.sectionFilter?.trim()) qs.set("section", params.sectionFilter.trim());
      if (params.sortBy && params.sortBy !== "recent") qs.set("sort", params.sortBy);
      if (params.limit) qs.set("limit", params.limit.toString());
      if (params.page && params.page > 1) {
        const offset = (params.page - 1) * (params.limit || 12);
        qs.set("offset", offset.toString());
      }

      // Try /functions/v1/revista-unified first, fallback to /functions/v1/revista-api
      let r = await safeFetchJSON(`https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/revista-unified?${qs}`);
      if (!r.ok && r.status === 404) {
        r = await safeFetchJSON(`https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/revista-api?${qs}`);
      }

      console.debug("[useRevistaData] status", r.status, r.json?.error);

      if (!alive) return;
      const payload = r.json as any;

      if (payload?.data) {
        const transformedArticles: RevistaArticle[] = (payload.data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          excerpt: item.summary || item.excerpt || '',
          cover_url: item.cover_image || item.coverUrl || '',
          publish_at: item.published_at || item.dateISO,
          reading_time_min: item.reading_time || item.readingTimeMin || 5,
          slug: item.slug,
          city: item.city || item.section || ''
        }));

        const transformedPosts: RevistaPost[] = (payload.data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary || item.excerpt || '',
          cover_image: item.cover_image || item.coverUrl || '',
          published_at: item.published_at || item.dateISO,
          reading_time: item.reading_time || item.readingTimeMin || 5,
          slug: item.slug,
          section: item.city || item.section || '',
          author_name: item.author_name || 'ROLÊ',
          views: item.views || 0,
          // Aliases for compatibility
          excerpt: item.summary || item.excerpt || '',
          reading_time_min: item.reading_time || item.readingTimeMin || 5,
          featured_image: item.cover_image || item.coverUrl || '',
          cover_url: item.cover_image || item.coverUrl || '',
          categories: (item.tags || []).map((tag: string) => ({ name: tag })),
          seo_title: item.meta_title,
          seo_description: item.meta_description,
          content_html: item.content,
          featured: false,
          updated_at: item.published_at || item.dateISO,
          slug_data: { slug: item.slug },
        }));

        setArticles(transformedArticles);
        setPosts(transformedPosts);
        setTotalCount(payload.total ?? payload.data.length ?? 0);
        setTotalPages(Math.ceil((payload.total ?? payload.data.length ?? 0) / (params.limit || 12)));
      } else {
        setArticles([]);
        setPosts([]);
        setTotalCount(0);
        setTotalPages(0);
        setError("Não foi possível carregar agora.");
      }

      setIsLoading(false);
    }, 200);

    return () => { 
      alive = false; 
      clearTimeout(timeout); 
    };
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