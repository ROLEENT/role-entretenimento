import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RankingUser {
  user_id: string;
  total_points: number;
  monthly_points: number;
  level: string;
  current_streak: number;
  profile?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
  rank?: number;
}

export const useRanking = () => {
  const [globalRanking, setGlobalRanking] = useState<RankingUser[]>([]);
  const [monthlyRanking, setMonthlyRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar ranking global
  const loadGlobalRanking = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          monthly_points,
          level,
          current_streak,
          profiles!inner(
            display_name,
            username,
            avatar_url
          )
        `)
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankingWithPositions = (data || []).map((user, index) => ({
        user_id: user.user_id,
        total_points: user.total_points,
        monthly_points: user.monthly_points,
        level: user.level,
        current_streak: user.current_streak,
        rank: index + 1,
        profile: Array.isArray(user.profiles) ? user.profiles[0] : user.profiles
      }));

      setGlobalRanking(rankingWithPositions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking global');
      console.error('Erro no ranking global:', err);
    }
  }, []);

  // Carregar ranking mensal
  const loadMonthlyRanking = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          monthly_points,
          level,
          current_streak,
          profiles!inner(
            display_name,
            username,
            avatar_url
          )
        `)
        .order('monthly_points', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankingWithPositions = (data || []).map((user, index) => ({
        user_id: user.user_id,
        total_points: user.total_points,
        monthly_points: user.monthly_points,
        level: user.level,
        current_streak: user.current_streak,
        rank: index + 1,
        profile: Array.isArray(user.profiles) ? user.profiles[0] : user.profiles
      }));

      setMonthlyRanking(rankingWithPositions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking mensal');
      console.error('Erro no ranking mensal:', err);
    }
  }, []);

  // Obter posição de um usuário específico
  const getUserRank = useCallback((userId: string, type: 'global' | 'monthly' = 'global') => {
    const ranking = type === 'global' ? globalRanking : monthlyRanking;
    const user = ranking.find(u => u.user_id === userId);
    return user?.rank || null;
  }, [globalRanking, monthlyRanking]);

  // Carregar dados
  const loadRankings = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGlobalRanking(),
        loadMonthlyRanking()
      ]);
    } catch (err) {
      console.error('Erro ao carregar rankings:', err);
    } finally {
      setLoading(false);
    }
  }, [loadGlobalRanking, loadMonthlyRanking]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  return {
    globalRanking,
    monthlyRanking,
    loading,
    error,
    getUserRank,
    refreshRankings: loadRankings,
    clearError: () => setError(null)
  };
};