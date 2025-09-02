import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePublicAuth } from './usePublicAuth';
import { toast } from 'sonner';

export const useSubmitReview = () => {
  const { user, isAuthenticated } = usePublicAuth();
  const [loading, setLoading] = useState(false);

  const submitReview = async (profileId: string, data: {
    rating: number;
    comment?: string;
  }) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para deixar uma avaliação');
      return { error: { message: 'Não autenticado' } };
    }

    if (!profileId) {
      toast.error('Perfil inválido');
      return { error: { message: 'Perfil inválido' } };
    }

    setLoading(true);
    try {
      // Usar função RPC para upsert atômico e seguro
      const { data: reviewData, error } = await supabase.rpc('upsert_profile_review', {
        p_profile_user_id: profileId,
        p_rating: data.rating,
        p_comment: data.comment || null
      });

      if (error) {
        console.error('Erro na RPC:', error);
        throw error;
      }

      // Determinar se foi criação ou atualização baseado no timestamp
      const wasUpdate = reviewData?.updated_at !== reviewData?.created_at;
      const message = wasUpdate ? 'Sua avaliação foi atualizada!' : 'Sua avaliação foi salva!';
      
      toast.success(message);
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      
      // Tratar erros específicos da RPC
      if (error.message?.includes('não autenticado')) {
        toast.error('Você precisa estar logado para avaliar');
      } else if (error.message?.includes('Rating deve estar entre')) {
        toast.error('Avaliação deve ser entre 1 e 5 estrelas');
      } else if (error.message?.includes('ID do perfil')) {
        toast.error('Perfil inválido');
      } else {
        toast.error('Erro ao enviar avaliação. Tente novamente.');
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getUserReview = async (profileId: string) => {
    if (!user) return null;

    try {
      const { data } = await supabase
        .from('profile_reviews')
        .select('*')
        .eq('reviewer_id', user.id)
        .eq('profile_user_id', profileId)
        .maybeSingle();

      return data;
    } catch (error) {
      return null;
    }
  };

  return {
    submitReview,
    getUserReview,
    loading,
    isAuthenticated,
    canReview: isAuthenticated
  };
};