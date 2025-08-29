import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RevistaPost {
  id: string;
  title: string;
  slug: string;
  slug_data: string;
  city: string;
  author_id: string;
  author_name: string;
  published_at: string | null;
  summary: string;
  content_html: string;
  cover_image: string;
  tags: string[];
  reading_time: number;
  featured: boolean;
  status: 'draft' | 'published' | 'scheduled';
  views: number;
  created_at: string;
  updated_at: string;
  category_ids?: string[];
  categories?: { name: string; slug: string }[];
  seo_title?: string;
  seo_description?: string;
}

interface UseRevistaDataParams {
  searchTerm?: string;
  cityFilter?: string;
  sectionFilter?: string;
  page?: number;
  limit?: number;
}

export const useRevistaData = ({
  searchTerm = '',
  cityFilter = '',
  sectionFilter = '',
  page = 1,
  limit = 12
}: UseRevistaDataParams = {}) => {
  const [posts, setPosts] = useState<RevistaPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("blog_posts")
        .select("*, categories(name, slug)", { count: 'exact' })
        .eq("status", "published");

      // Apply filters
      if (cityFilter) {
        query = query.eq("city", cityFilter);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%, summary.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query
        .order("published_at", { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      setPosts((data as any) || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error("Error fetching revista posts:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, cityFilter, sectionFilter, page, limit]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    posts,
    totalCount,
    totalPages,
    isLoading,
    error,
    refetch: fetchPosts
  };
};

export const getRevistaPostBySlug = async (slug: string): Promise<RevistaPost | null> => {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, categories(name, slug)")
      .eq("slug_data", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return (data as any) || null;
  } catch (error) {
    console.error("Error fetching revista post by slug:", error);
    return null;
  }
};

export const getRevistaCities = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("city")
      .eq("status", "published");

    if (error) throw error;
    
    const uniqueCities = [...new Set((data as any)?.map((post: any) => post.city) || [])];
    return uniqueCities.filter(Boolean) as string[];
  } catch (error) {
    console.error("Error fetching revista cities:", error);
    return [];
  }
};

export const getRevistaSections = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .eq("type", "blog");

    if (error) throw error;
    
    return (data as any)?.map((cat: any) => cat.name) || [];
  } catch (error) {
    console.error("Error fetching revista sections:", error);
    return [];
  }
};