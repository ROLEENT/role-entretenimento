import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileContent = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  cover_image?: string;
  tags?: string[];
  type: string;
  created_at: string;
  author_name?: string;
  city?: string;
  status: string;
};

export function useProfileContent(profileId: string, profileType: string) {
  return useQuery({
    queryKey: ['profile-content', profileId, profileType],
    queryFn: async () => {
      // Buscar posts do blog relacionados ao artista/perfil
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id, title, slug, summary, content_md, 
          cover_image, tags, created_at, author_name, city, status
        `)
        .eq('status', 'published')
        .or(`tags.cs.{${profileId}},content_md.ilike.%${profileId}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return (data || []).map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content_md,
        cover_image: post.cover_image,
        tags: post.tags,
        type: 'article',
        created_at: post.created_at,
        author_name: post.author_name,
        city: post.city,
        status: post.status
      })) as ProfileContent[];
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}