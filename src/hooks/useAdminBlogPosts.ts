import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
          author:user_profiles(display_name, avatar_url)
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
      
      await postsQuery.refetch();
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const duplicatePost = async (post: any) => {
    try {
      const duplicatedPost = {
        ...post,
        id: undefined,
        title: `${post.title} (Cópia)`,
        slug: `${post.slug || post.slug_data}-copy-${Date.now()}`,
        slug_data: `${post.slug || post.slug_data}-copy-${Date.now()}`,
        status: 'draft',
        published_at: null,
        created_at: undefined,
        updated_at: undefined,
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(duplicatedPost)
        .select()
        .single();

      if (error) throw error;
      
      await postsQuery.refetch();
      return data;
    } catch (error) {
      console.error('Error duplicating post:', error);
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