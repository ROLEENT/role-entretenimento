import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Data structure interfaces
export interface RevistaArticle {
  id: string;
  title: string;
  excerpt: string;
  cover_url: string;
  publish_at: string;
  reading_time_min: number;
  slug: string;
  city?: string;
}

export interface RevistaPost extends RevistaArticle {
  author_name: string;
  author_avatar?: string;
  seo_title?: string;
  seo_description?: string;
  content: string;
  content_html?: string;
  content_json: Record<string, any>;
  tags: string[];
  categories: string[];
  featured: boolean;
  status: 'published' | 'draft' | 'archived';
  views: number;
  created_at: string;
  updated_at: string;
  author_id: string;
  section: string;
  category_slug?: string;
  category_name?: string;
  author_slug?: string;
  cover_image: string;
  published_at: string;
  reading_time: number;
  summary: string;
  slug_data?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    let alive = true;
    setIsLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      try {
        let q = supabase
          .from("blog_posts")
          .select("id, slug, title, summary, cover_image, city, reading_time, published_at", { count: "exact" })
          .eq("status", "published");

        if (params.sectionFilter) q = q.eq("city", params.sectionFilter);
        if (params.searchTerm) q = q.ilike("title", `%${params.searchTerm}%`);

        const sortCol = params.sortBy === "most_read" ? "views" : "published_at";
        const limit = params.limit || 12;
        const offset = ((params.page || 1) - 1) * limit;
        
        q = q.order(sortCol as "published_at", { ascending: false }).range(offset, offset + limit - 1);

        const { data, error, count } = await q;

        if (!alive) return;

        if (error) {
          throw error;
        }

        // Transform articles
        const transformedArticles: RevistaArticle[] = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          excerpt: item.summary || '',
          cover_url: item.cover_image || '',
          publish_at: item.published_at || '',
          reading_time_min: item.reading_time || 5,
          slug: item.slug,
          city: item.city
        }));

        // Transform posts (for compatibility)
        const transformedPosts: RevistaPost[] = transformedArticles.map(article => ({
          ...article,
          author_name: '',
          author_avatar: '',
          seo_title: article.title,
          seo_description: article.excerpt,
          content: '',
          content_html: '',
          content_json: {},
          tags: [],
          categories: [],
          featured: false,
          status: 'published' as const,
          views: 0,
          created_at: article.publish_at,
          updated_at: article.publish_at,
          author_id: '',
          section: article.city || 'geral',
          category_slug: '',
          category_name: '',
          author_slug: '',
          cover_image: article.cover_url,
          published_at: article.publish_at,
          reading_time: article.reading_time_min,
          summary: article.excerpt,
          slug_data: article.slug
        }));

        setArticles(transformedArticles);
        setPosts(transformedPosts);
        setTotalCount(count ?? 0);
        setTotalPages(Math.ceil((count ?? 0) / limit));
      } catch (error) {
        if (!alive) return;
        console.error("[useRevistaData] fetch error", error);
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

    const cities = [...new Set((data || []).map(item => item.city).filter(Boolean))];
    return cities.sort();
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const getRevistaSections = (): string[] => {
  return ['música', 'arte', 'noite', 'cultura', 'entrevista', 'opinião'];
};

export const getRevistaPostBySlug = async (slug: string): Promise<RevistaPost | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      excerpt: data.summary || '',
      cover_url: data.cover_image || '',
      publish_at: data.published_at || '',
      reading_time_min: data.reading_time || 5,
      slug: data.slug,
      city: data.city,
      author_name: data.author_name || '',
      author_avatar: '',
      seo_title: data.seo_title || data.title,
      seo_description: data.seo_description || data.summary,
      content: data.content_html || '',
      content_html: data.content_html || '',
      content_json: data.content_md ? { content: data.content_md } : {},
      tags: data.tags || [],
      categories: [],
      featured: data.featured || false,
      status: 'published' as const,
      views: data.views || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      author_id: data.author_id || '',
      section: data.city || 'geral',
      category_slug: '',
      category_name: '',
      author_slug: '',
      cover_image: data.cover_image || '',
      published_at: data.published_at || '',
      reading_time: data.reading_time || 5,
      summary: data.summary || '',
      slug_data: data.slug || ''
    };
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
};