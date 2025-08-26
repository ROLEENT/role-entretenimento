import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BlogPostFormData {
  title: string;
  slug: string;
  content_html: string;
  summary: string;
  city: string;
  author_name: string;
  cover_image: string;
  status: string;
  tags: string[];
  category_ids: string[];
}

export const useBlogManagement = () => {
  const [loading, setLoading] = useState(false);

  const createPost = useCallback(async (data: BlogPostFormData) => {
    try {
      setLoading(true);
      
      const { data: post, error } = await supabase
        .from('blog_posts')
        .insert({
          title: data.title,
          slug: data.slug,
          content_html: data.content_html,
          summary: data.summary,
          city: data.city,
          author_name: data.author_name,
          cover_image: data.cover_image,
          status: data.status,
          tags: data.tags,
          category_ids: data.category_ids,
          author_id: '00000000-0000-0000-0000-000000000000'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Post criado com sucesso!');
      return post;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Erro ao criar post');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (postId: string, data: BlogPostFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: data.title,
          slug: data.slug,
          content_html: data.content_html,
          summary: data.summary,
          city: data.city,
          author_name: data.author_name,
          cover_image: data.cover_image,
          status: data.status,
          tags: data.tags,
          category_ids: data.category_ids,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;
      
      toast.success('Post atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error(error.message || 'Erro ao atualizar post');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPosts = useCallback(async (filters: any = {}) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error(error.message || 'Erro ao carregar posts');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast.success('Post removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error(error.message || 'Erro ao remover post');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createPost,
    updatePost,
    getPosts,
    deletePost
  };
};