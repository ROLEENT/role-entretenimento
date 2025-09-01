import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseAdminBlogPostsProps {
  search?: string;
  status?: string;
  category?: string;
  searchTerm?: string;
  cityFilter?: string;
  statusFilter?: string;
}

export const useAdminBlogPosts = ({ search, status, category, searchTerm, cityFilter, statusFilter }: UseAdminBlogPostsProps = {}) => {
  const postsQuery = useQuery({
    queryKey: ['admin-blog-posts', { search: search || searchTerm, status: status || statusFilter, category: category || cityFilter }],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:user_profiles!inner(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      const finalSearch = search || searchTerm;
      if (finalSearch) {
        query = query.or(`title.ilike.%${finalSearch}%,summary.ilike.%${finalSearch}%`);
      }

      const finalStatus = status || statusFilter;
      if (finalStatus && finalStatus !== 'all') {
        query = query.eq('status', finalStatus);
      }

      const finalCategory = category || cityFilter;
      if (finalCategory && finalCategory !== 'all') {
        query = query.contains('category_ids', [finalCategory]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw new Error('Erro ao carregar posts');
      }

      return data || [];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('kind', 'revista')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Erro ao carregar categorias');
      }

      return data || [];
    },
  });

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post excluído com sucesso!');
      postsQuery.refetch();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error(error.message || 'Erro ao excluir post');
      throw error;
    }
  };

  const duplicatePost = async (post: any) => {
    try {
      const duplicatedPost = {
        title: `${post.title} (Cópia)`,
        slug: `${post.slug}-copia-${Date.now()}`,
        slug_data: `${post.slug_data || post.slug}-copia-${Date.now()}`,
        summary: post.summary,
        content_html: post.content_html,
        content_md: post.content_md,
        cover_image: post.cover_image,
        cover_alt: post.cover_alt,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        author_name: post.author_name,
        author_id: post.author_id,
        city: post.city,
        status: 'draft', // Always create duplicates as drafts
        featured: false, // Don't duplicate featured status
        category_ids: post.category_ids || [],
        tags: post.tags || [],
        reading_time: post.reading_time || 5,
        views: 0, // Reset views for duplicated post
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(duplicatedPost)
        .select()
        .single();

      if (error) throw error;

      toast.success('Post duplicado com sucesso!');
      postsQuery.refetch();
      return data;
    } catch (error: any) {
      console.error('Error duplicating post:', error);
      toast.error(error.message || 'Erro ao duplicar post');
      throw error;
    }
  };

  return {
    posts: postsQuery.data,
    categories: categoriesQuery.data,
    isLoading: postsQuery.isLoading || categoriesQuery.isLoading,
    error: postsQuery.error || categoriesQuery.error,
    refetch: postsQuery.refetch,
    deletePost,
    duplicatePost,
  };
};