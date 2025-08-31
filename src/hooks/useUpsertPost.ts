import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PostForm } from '@/schemas/post';

export const useUpsertPost = () => {
  const [loading, setLoading] = useState(false);

  const upsertPost = async (data: PostForm): Promise<any> => {
    try {
      setLoading(true);

      const postData = {
        title: data.title,
        slug: data.slug,
        status: data.status,
        category_ids: data.category_id ? [data.category_id] : [],
        tags: data.tags || [],
        author_id: data.author_id,
        summary: data.excerpt || '',
        content_html: data.content || '',
        cover_image: data.cover_url || '',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        city: 'São Paulo', // Default city - could be made configurable
        author_name: 'Admin', // Could be fetched from user profile
        slug_data: data.slug,
        cover_alt: data.title || '',
      };

      let result;
      if (data.id) {
        // Update existing post
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', data.id)
          .select()
          .single();
      } else {
        // Create new post
        result = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(data.id ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!');
      return result.data;
    } catch (error: any) {
      console.error('Error upserting post:', error);
      toast.error(error.message || 'Erro ao salvar post');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    upsertPost,
    loading,
  };
};