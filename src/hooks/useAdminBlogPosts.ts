import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  slug_data: string;
  city: string;
  status: 'draft' | 'scheduled' | 'published';
  featured: boolean;
  author_name: string;
  author_id: string;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  cover_image: string;
  cover_alt: string;
  summary: string;
  content_html: string;
  content_md: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  category_ids: string[];
}

interface UseAdminBlogPostsParams {
  searchTerm?: string;
  cityFilter?: string;
  statusFilter?: string;
  page?: number;
  limit?: number;
}

export const useAdminBlogPosts = ({
  searchTerm = '',
  cityFilter = '',
  statusFilter = '',
  page = 1,
  limit = 20
}: UseAdminBlogPostsParams = {}) => {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('admin_get_blog_posts', {
        p_search: searchTerm || null,
        p_city: cityFilter || null,
        p_status: statusFilter || null,
        p_limit: limit,
        p_offset: (page - 1) * limit
      });

      if (error) throw error;
      
      setPosts(data || []);
      setTotalCount(data?.length || 0);
    } catch (err: any) {
      console.error('Error fetching blog posts:', err);
      setError(err.message);
      toast({
        title: "Erro ao carregar artigos",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, cityFilter, statusFilter, page, limit]);

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Artigo excluído",
        description: "O artigo foi removido com sucesso.",
      });

      fetchPosts();
    } catch (err: any) {
      console.error('Error deleting post:', err);
      toast({
        title: "Erro ao excluir artigo",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const duplicatePost = async (post: AdminBlogPost) => {
    try {
      const duplicatedPost = {
        title: `${post.title} (Cópia)`,
        slug: `${post.slug}-copia`,
        slug_data: `${post.slug_data}-copia`,
        city: post.city,
        status: 'draft' as const,
        featured: false,
        author_name: post.author_name,
        author_id: post.author_id,
        summary: post.summary,
        content_html: post.content_html,
        content_md: post.content_md,
        cover_image: post.cover_image,
        cover_alt: post.cover_alt,
        tags: post.tags,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        category_ids: post.category_ids
      };

      const { error } = await supabase
        .from('blog_posts')
        .insert(duplicatedPost);

      if (error) throw error;

      toast({
        title: "Artigo duplicado",
        description: "O artigo foi duplicado com sucesso.",
      });

      fetchPosts();
    } catch (err: any) {
      console.error('Error duplicating post:', err);
      toast({
        title: "Erro ao duplicar artigo",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return {
    posts,
    totalCount,
    isLoading,
    error,
    refetch: fetchPosts,
    deletePost,
    duplicatePost
  };
};

export const checkSlugAvailability = async (slug: string, postId?: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_blog_slug_available', {
      p_slug: slug,
      p_post_id: postId || null
    });

    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[áàâãäå]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};