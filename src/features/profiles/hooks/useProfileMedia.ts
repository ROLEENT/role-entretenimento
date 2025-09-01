import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileMedia = {
  id: string;
  profile_user_id: string;
  type: 'image' | 'video';
  url: string;
  alt_text?: string;
  caption?: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export function useProfileMedia(profileUserId: string) {
  return useQuery({
    queryKey: ['profile-media', profileUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_media')
        .select('*')
        .eq('profile_user_id', profileUserId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as ProfileMedia[];
    },
    enabled: !!profileUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}