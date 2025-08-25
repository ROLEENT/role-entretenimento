import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'activity' | 'achievement' | 'special' | 'milestone';
  points_required: number;
  criteria: any;
  is_active: boolean;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  progress: any;
  badge: Badge;
}

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  monthly_points: number;
  current_streak: number;
  best_streak: number;
  last_activity_date: string;
}

export interface PointsHistory {
  id: string;
  points: number;
  activity_type: string;
  activity_id?: string;
  description?: string;
  created_at: string;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do usuário
  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Carregar pontos do usuário
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') {
        throw pointsError;
      }

      setUserPoints(pointsData);

      // Carregar badges do usuário
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (badgesError) throw badgesError;
      setUserBadges(badgesData || []);

      // Carregar histórico de pontos
      const { data: historyData, error: historyError } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;
      setPointsHistory(historyData || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de gamificação');
      console.error('Erro na gamificação:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar todos os badges disponíveis
  const loadAllBadges = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAllBadges(data || []);
    } catch (err) {
      console.error('Erro ao carregar badges:', err);
    }
  }, []);

  // Obter nível do usuário com detalhes
  const getLevelDetails = useCallback((level: string, points: number) => {
    const levels = {
      bronze: { name: 'Bronze', color: '#CD7F32', minPoints: 0, maxPoints: 100, icon: '🥉' },
      silver: { name: 'Prata', color: '#C0C0C0', minPoints: 101, maxPoints: 500, icon: '🥈' },
      gold: { name: 'Ouro', color: '#FFD700', minPoints: 501, maxPoints: 1000, icon: '🥇' },
      platinum: { name: 'Platina', color: '#E5E4E2', minPoints: 1001, maxPoints: 2500, icon: '💎' },
      diamond: { name: 'Diamante', color: '#B9F2FF', minPoints: 2501, maxPoints: Infinity, icon: '💠' }
    };

    const currentLevel = levels[level as keyof typeof levels] || levels.bronze;
    const nextLevelKey = Object.keys(levels).find(key => 
      levels[key as keyof typeof levels].minPoints > points
    );
    const nextLevel = nextLevelKey ? levels[nextLevelKey as keyof typeof levels] : null;

    const progress = nextLevel 
      ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
      : 100;

    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(progress, 100),
      pointsToNext: nextLevel ? nextLevel.minPoints - points : 0
    };
  }, []);

  // Obter badges próximos de serem conquistados
  const getUpcomingBadges = useCallback(() => {
    if (!userPoints) return [];

    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
    const availableBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));

    return availableBadges.map(badge => {
      let progress = 0;
      let progressText = '';

      // Calcular progresso baseado nos critérios
      const criteria = badge.criteria;
      
      if (criteria.checkins) {
        // Simular contagem de check-ins (seria obtida de uma query real)
        progress = Math.min((userPoints.total_points / 10) / criteria.checkins * 100, 100);
        progressText = `Check-ins: ${Math.floor(userPoints.total_points / 10)}/${criteria.checkins}`;
      } else if (criteria.reviews) {
        // Simular contagem de reviews
        progress = Math.min((userPoints.total_points / 15) / criteria.reviews * 100, 100);
        progressText = `Reviews: ${Math.floor(userPoints.total_points / 15)}/${criteria.reviews}`;
      } else if (criteria.points) {
        progress = Math.min((userPoints.total_points / criteria.points) * 100, 100);
        progressText = `Pontos: ${userPoints.total_points}/${criteria.points}`;
      } else if (criteria.streak) {
        progress = Math.min((userPoints.current_streak / criteria.streak) * 100, 100);
        progressText = `Sequência: ${userPoints.current_streak}/${criteria.streak} dias`;
      }

      return {
        ...badge,
        progress,
        progressText
      };
    }).sort((a, b) => b.progress - a.progress);
  }, [userPoints, userBadges, allBadges]);

  // Adicionar pontos manualmente (para testes ou ações específicas)
  const addPoints = useCallback(async (
    points: number, 
    activityType: string, 
    description: string,
    activityId?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('add_user_points', {
        p_user_id: user.id,
        p_points: points,
        p_activity_type: activityType,
        p_activity_id: activityId,
        p_description: description
      });

      if (error) throw error;

      // Recarregar dados
      await loadUserData();
      
      toast.success(`+${points} pontos! ${description}`);
      return true;
    } catch (err) {
      console.error('Erro ao adicionar pontos:', err);
      toast.error('Erro ao adicionar pontos');
      return false;
    }
  }, [user, loadUserData]);

  // Verificar novos badges
  const checkForNewBadges = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('check_and_award_badges', {
        p_user_id: user.id
      });

      if (error) throw error;

      // Recarregar badges
      await loadUserData();
    } catch (err) {
      console.error('Erro ao verificar badges:', err);
    }
  }, [user, loadUserData]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadAllBadges();
    }
  }, [user, loadUserData, loadAllBadges]);

  return {
    userPoints,
    userBadges,
    pointsHistory,
    allBadges,
    loading,
    error,
    getLevelDetails,
    getUpcomingBadges,
    addPoints,
    checkForNewBadges,
    refreshData: loadUserData,
    clearError: () => setError(null)
  };
};