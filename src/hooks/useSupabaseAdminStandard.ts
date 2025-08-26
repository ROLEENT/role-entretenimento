import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para operações administrativas com autenticação real
 */
export const useSupabaseAdminStandard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc('is_admin', {
        uid: session.user.id
      });

      if (error || !isAdmin) {
        toast.error('Acesso negado: privilégios de administrador necessários');
        navigate('/admin/login');
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };
  const updateHighlight = useCallback(async (highlightId: string, data: any) => {
    try {
      // Primeiro, verificar se o highlight existe
      const { data: existing } = await supabase
        .from('highlights')
        .select('id')
        .eq('id', highlightId)
        .single();

      if (!existing) {
        throw new Error('Destaque não encontrado');
      }

      const { data: result, error } = await supabase
        .from('highlights')
        .update({
          city: data.city,
          event_title: data.event_title,
          venue: data.venue,
          ticket_url: data.ticket_url || null,
          role_text: data.role_text,
          selection_reasons: data.selection_reasons,
          image_url: data.image_url,
          photo_credit: data.photo_credit || null,
          event_date: data.event_date || null,
          event_time: data.event_time || null,
          ticket_price: data.ticket_price || null,
          sort_order: data.sort_order,
          is_published: data.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', highlightId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Destaque atualizado com sucesso!');
      return { data: result };
    } catch (error) {
      console.error('❌ Erro ao atualizar destaque:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar destaque');
      throw error;
    }
  }, []);

  const createHighlight = useCallback(async (data: any) => {
    try {
      const { data: result, error } = await supabase
        .from('highlights')
        .insert({
          city: data.city,
          event_title: data.event_title,
          venue: data.venue,
          ticket_url: data.ticket_url || null,
          role_text: data.role_text,
          selection_reasons: data.selection_reasons,
          image_url: data.image_url,
          photo_credit: data.photo_credit || null,
          event_date: data.event_date || null,
          event_time: data.event_time || null,
          ticket_price: data.ticket_price || null,
          sort_order: data.sort_order,
          is_published: data.is_published
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Destaque criado com sucesso!');
      return { data: result };
    } catch (error) {
      console.error('❌ Erro ao criar destaque:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar destaque');
      throw error;
    }
  }, []);

  const getHighlightById = useCallback(async (highlightId: string) => {
    try {
      const { data: result, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('id', highlightId)
        .maybeSingle();

      if (error) throw error;

      if (!result) {
        throw new Error('Destaque não encontrado');
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao carregar destaque:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar destaque');
      throw error;
    }
  }, []);

  return {
    updateHighlight,
    createHighlight,
    getHighlightById,
    isAuthenticated,
    isLoading,
    checkAdminAuth
  };
};