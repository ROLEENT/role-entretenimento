import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePublicAuth } from './usePublicAuth';
import { toast } from 'sonner';

export interface ArtistReview {
  id: string;
  profile_user_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: { [key: number]: number };
}

export function useArtistReview(profileUserId: string) {
  const { user, isAuthenticated } = usePublicAuth();
  const [loading, setLoading] = useState(false);
  const [userReview, setUserReview] = useState<ArtistReview | null>(null);
  const [reviews, setReviews] = useState<ArtistReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Carregar review do usuário atual
  const loadUserReview = async () => {
    if (!user?.id || !profileUserId) return;

    try {
      const { data, error } = await supabase
        .from('profile_reviews')
        .select('*')
        .eq('profile_user_id', profileUserId)
        .eq('reviewer_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserReview(data);
    } catch (error) {
      console.error('Erro ao carregar review do usuário:', error);
    }
  };

  // Carregar todas as reviews
  const loadReviews = async () => {
    if (!profileUserId) return;

    try {
      const { data, error } = await supabase
        .from('profile_reviews')
        .select('*')
        .eq('profile_user_id', profileUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Erro ao carregar reviews:', error);
    }
  };

  // Calcular estatísticas
  const calculateStats = (reviewsData: ArtistReview[]) => {
    if (!reviewsData.length) {
      setStats({
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
    const average = Math.round((sum / total) * 10) / 10;
    
    const distribution = reviewsData.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as { [key: number]: number });

    setStats({ average, total, distribution });
  };

  // Submeter review
  const submitReview = async (rating: number, comment?: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Você precisa estar logado para avaliar');
      return { success: false, error: 'Não autenticado' };
    }

    if (!profileUserId) {
      toast.error('Perfil inválido');
      return { success: false, error: 'Perfil inválido' };
    }

    if (rating < 1 || rating > 5) {
      toast.error('Avaliação deve ser entre 1 e 5 estrelas');
      return { success: false, error: 'Rating inválido' };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('upsert_artist_review', {
        p_profile_user_id: profileUserId,
        p_rating: rating,
        p_comment: comment || null
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string; error?: string };
      
      if (result.success) {
        toast.success(result.message);
        // Recarregar dados
        await Promise.all([loadUserReview(), loadReviews()]);
        return { success: true };
      } else {
        toast.error(result.message);
        return { success: false, error: result.error || result.message };
      }
    } catch (error: any) {
      console.error('Erro ao submeter review:', error);
      const message = error.message || 'Erro ao enviar avaliação';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Deletar review
  const deleteReview = async () => {
    if (!isAuthenticated || !user?.id || !userReview) {
      toast.error('Não é possível deletar a avaliação');
      return { success: false };
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profile_reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      toast.success('Avaliação removida com sucesso!');
      setUserReview(null);
      await loadReviews();
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar review:', error);
      toast.error('Erro ao remover avaliação');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar ou quando profileUserId mudar
  useEffect(() => {
    if (profileUserId) {
      loadReviews();
    }
  }, [profileUserId]);

  // Carregar review do usuário quando autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id && profileUserId) {
      loadUserReview();
    }
  }, [isAuthenticated, user?.id, profileUserId]);

  return {
    // Estado
    loading,
    userReview,
    reviews,
    stats,
    
    // Ações
    submitReview,
    deleteReview,
    
    // Utilitários
    canReview: isAuthenticated && user?.id !== profileUserId,
    isAuthenticated
  };
}