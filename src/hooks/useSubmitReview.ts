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
    if (!user || !user.id) {
      toast.error('Você precisa estar logado para deixar uma avaliação');
      return { error: { message: 'Não autenticado' } };
    }

    if (!profileId) {
      toast.error('Perfil inválido');
      return { error: { message: 'Perfil inválido' } };
    }

    setLoading(true);
    try {
      // Usar estratégia de upsert com ON CONFLICT
      const { error } = await supabase
        .from('profile_reviews')
        .upsert({
          reviewer_id: user.id,
          profile_user_id: profileId,
          rating: data.rating,
          comment: data.comment,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'reviewer_id,profile_user_id'
        });

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      toast.success('Sua avaliação foi salva!');
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      
      // Tentar detectar se é um erro de constraint e fazer fallback
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        try {
          // Fallback: buscar review existente e atualizar
          const { data: existingReview } = await supabase
            .from('profile_reviews')
            .select('id')
            .eq('reviewer_id', user.id)
            .eq('profile_user_id', profileId)
            .maybeSingle();

          if (existingReview) {
            const { error: updateError } = await supabase
              .from('profile_reviews')
              .update({
                rating: data.rating,
                comment: data.comment,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingReview.id);

            if (!updateError) {
              toast.success('Sua avaliação foi atualizada!');
              return { error: null };
            }
          }
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      }
      
      toast.error('Erro ao enviar avaliação. Tente novamente.');
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