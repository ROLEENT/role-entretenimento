import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ALLOWED_CITIES = ['poa','sp','rj','curitiba','floripa'] as const;
type City = typeof ALLOWED_CITIES[number];

function normalizeCity(input?: string | null): City | null {
  if (!input) return null;
  const v = input.trim().toLowerCase();
  return (ALLOWED_CITIES as readonly string[]).includes(v) ? (v as City) : null;
}

function validateBlogPayload(p: any) {
  const city = normalizeCity(p.city);
  const hasCitiesArray = Array.isArray(p.cities) && p.cities.length > 0;

  // Regra compatível com o CHECK típico
  if (!city && !hasCitiesArray) {
    throw new Error('Selecione uma cidade válida ou preencha o campo de cidades do post.');
  }
  return { ...p, city };
}

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
  tags: string[] | string;
  published_at?: string;
  scheduled_at?: string;
}

export const useUpsertBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BlogPostForm) => {
      console.log("Upserting blog post:", data);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Process and convert data
      const processedData = {
        ...data,
        author_id: user.id, // Use authenticated user's UUID
        slug_data: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        reading_time: 5, // Default reading time
        category_ids: Array.isArray(data.category_ids) 
          ? data.category_ids.filter(id => id && id.trim())
          : [],
        tags: Array.isArray(data.tags) 
          ? data.tags.filter(tag => tag && tag.trim())
          : typeof data.tags === 'string' && data.tags
            ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            : [],
        views: 0,
        featured: data.featured || false,
        ...(data.status === 'published' && { published_at: new Date().toISOString() }),
        ...(data.status === 'scheduled' && data.scheduled_at && { scheduled_at: data.scheduled_at }),
      };

      // Remove empty or undefined timestamp fields to avoid DB errors
      if (!processedData.published_at || processedData.published_at === '') {
        delete processedData.published_at;
      }
      if (!processedData.scheduled_at || processedData.scheduled_at === '') {
        delete processedData.scheduled_at;
      }

      console.log("Processed blog post data:", processedData);

      // Validate payload before upsert
      const validatedData = validateBlogPayload(processedData);

      const { data: result, error } = await supabase
        .from("blog_posts")
        .upsert(validatedData, { 
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
    onError: (error: any) => {
      console.error("Blog post save error:", error);
      const message = String(error?.message || '');
      if (message.includes('blog_posts_city_check')) {
        toast.error('Cidade inválida. Use: POA, SP, RJ, Curitiba ou Floripa.');
      } else {
        toast.error('Não foi possível salvar o post. Tenta de novo mais tarde.');
      }
    },
  });
};