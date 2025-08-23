import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  slug_data: string;
  city: string;
  author_id: string;
  author_name: string;
  published_at: string | null;
  scheduled_at: string | null;
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
}

export const useBlogData = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, isLoading, error, refetch: fetchPosts };
};

export const getLatestPostByCity = async (citySlug: string): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("city", citySlug)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching latest post:", error);
    return null;
  }
};

export const getCitiesWithPosts = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("city")
      .eq("status", "published");

    if (error) throw error;
    
    const uniqueCities = [...new Set(data?.map(post => post.city) || [])];
    return uniqueCities;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

export const getPostBySlug = async (citySlug: string, dataSlug: string): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("city", citySlug)
      .eq("slug_data", dataSlug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
};

export const getCityPosts = async (citySlug: string): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("city", citySlug)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching city posts:", error);
    return [];
  }
};

export const incrementPostViews = async (postId: string) => {
  try {
    const { error } = await supabase
      .rpc('increment_post_views', {
        post_id: postId
      });

    if (error) throw error;
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};