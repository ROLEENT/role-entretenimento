import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileReview = {
  id: string;
  profile_user_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  reviewer_profile?: {
    name: string;
    avatar_url?: string;
  };
};

export function useProfileReviews(profileUserId: string) {
  return useQuery({
    queryKey: ['profile-reviews', profileUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_reviews')
        .select(`
          id,
          profile_user_id,
          reviewer_id,
          rating,
          comment,
          created_at,
          updated_at,
          reviewer_profile:entity_profiles(name, avatar_url)
        `)
        .eq('profile_user_id', profileUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to handle the join result
      const transformedData = data?.map(review => ({
        ...review,
        reviewer_profile: Array.isArray(review.reviewer_profile) && review.reviewer_profile.length > 0 
          ? review.reviewer_profile[0] 
          : undefined
      })) || [];
      
      return transformedData as ProfileReview[];
    },
    enabled: !!profileUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProfileReviewsStats(profileUserId: string) {
  return useQuery({
    queryKey: ['profile-reviews-stats', profileUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_reviews')
        .select('rating')
        .eq('profile_user_id', profileUserId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          average: 0,
          total: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const total = data.length;
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const average = Math.round((sum / total) * 10) / 10;
      
      const distribution = data.reduce((acc, review) => {
        acc[review.rating as keyof typeof acc]++;
        return acc;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

      return { average, total, distribution };
    },
    enabled: !!profileUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}