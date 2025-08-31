import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BlogPostForm {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  content_md?: string;
  cover_image: string;
  cover_alt?: string;
  seo_title?: string;
  seo_description?: string;
  author_name: string;
  author_id: string;
  city: string;
  status: 'draft' | 'published' | 'scheduled';
  featured: boolean;
  category_ids: string[];
  tags: string[];
  published_at?: string;
  scheduled_at?: string;
}

export const useUpsertBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BlogPostForm) => {
      console.log("Upserting blog post:", data);

      const { data: result, error } = await supabase
        .from("blog_posts")
        .upsert(data, { 
          onConflict: "id",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Blog post upsert error:", error);
        throw new Error(`Erro ao salvar post: ${error.message}`);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", data.id] });
      toast.success("Post salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Blog post save error:", error);
      toast.error(error.message || "Erro ao salvar post");
    },
  });
};