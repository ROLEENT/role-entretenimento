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
    experience_type?: string;
  }) => {
    if (!user) {
      toast.error('Você precisa estar logado para deixar uma avaliação');
      return { error: { message: 'Não autenticado' } };
    }

    setLoading(true);
    try {
      // Verificar se já existe uma review deste usuário para este perfil
      const { data: existingReview } = await supabase
        .from('profile_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .single();

      if (existingReview) {
        // Atualizar review existente
        const { error } = await supabase
          .from('profile_reviews')
          .update({
            rating: data.rating,
            comment: data.comment,
            experience_type: data.experience_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        toast.success('Sua avaliação foi atualizada!');
      } else {
        // Criar nova review
        const { error } = await supabase
          .from('profile_reviews')
          .insert({
            user_id: user.id,
            profile_id: profileId,
            rating: data.rating,
            comment: data.comment,
            experience_type: data.experience_type,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Sua avaliação foi enviada!');
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro ao enviar avaliação');
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
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .single();

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