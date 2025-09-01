import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProfileStats {
  followers_count: number;
  following_count: number;
  events_count: number;
  average_rating: number;
  total_reviews: number;
}

export function useProfileStats(profileId?: string) {
  const [stats, setStats] = useState<ProfileStats>({
    followers_count: 0,
    following_count: 0,
    events_count: 0,
    average_rating: 0,
    total_reviews: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      // Buscar contadores de seguidores (calculated from followers table)
      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);

      const { count: followingCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      // Buscar contagem de eventos (placeholder - ajustar quando tabela de eventos existir)
      const { count: eventsCount } = await supabase
        .from('agenda_itens')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', profileId)
        .eq('status', 'published');

      // Buscar reviews/avaliações
      const { data: reviewsData } = await supabase
        .from('profile_reviews')
        .select('rating')
        .eq('profile_user_id', profileId);

      let averageRating = 0;
      let totalReviews = 0;

      if (reviewsData && reviewsData.length > 0) {
        totalReviews = reviewsData.length;
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        averageRating = Math.round((totalRating / totalReviews) * 10) / 10;
      }

      setStats({
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        events_count: eventsCount || 0,
        average_rating: averageRating,
        total_reviews: totalReviews,
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas do perfil:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [profileId]);

  // Subscrever a mudanças em tempo real
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel('profile-stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'entity_profiles',
          filter: `id=eq.${profileId}`,
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}