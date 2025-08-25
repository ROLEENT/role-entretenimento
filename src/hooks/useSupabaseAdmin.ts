import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from './useAdminAuth';
import { toast } from 'sonner';

/**
 * Hook para operações administrativas com validação de autorização
 */
export const useSupabaseAdmin = () => {
  const { adminUser, isAuthenticated } = useAdminAuth();

  const callAdminRPC = useCallback(async (
    functionName: string, 
    params: Record<string, any> = {}
  ) => {
    if (!isAuthenticated || !adminUser?.email) {
      throw new Error('Admin não autenticado');
    }

    console.log(`🔄 Chamando ${functionName} com admin:`, adminUser.email);
    
    // Debug da autorização antes da chamada
    try {
      const debugResult = await supabase.rpc('debug_admin_highlight_auth', {
        p_admin_email: adminUser.email,
        p_highlight_id: params.p_highlight_id || null
      });
      
      console.log('🐛 Debug autorização:', debugResult.data);
      
      if (debugResult.data && !debugResult.data.admin_valid) {
        throw new Error('Admin não é válido no sistema');
      }
      
      if (debugResult.data && !debugResult.data.header_matches) {
        console.warn('⚠️ Header email não confere com admin email');
      }
    } catch (debugError) {
      console.warn('⚠️ Erro no debug (continuando):', debugError);
    }

    // Adicionar email do admin aos parâmetros se não existir
    const finalParams = {
      ...params,
      p_admin_email: adminUser.email
    };

    console.log(`📤 Parâmetros finais para ${functionName}:`, finalParams);

    const result = await supabase.rpc(functionName, finalParams);
    
    console.log(`📥 Resultado de ${functionName}:`, result);

    if (result.error) {
      console.error(`❌ Erro em ${functionName}:`, result.error);
      throw result.error;
    }

    return result;
  }, [adminUser, isAuthenticated]);

  const updateHighlight = useCallback(async (highlightId: string, data: any) => {
    try {
      const result = await callAdminRPC('admin_update_highlight_v2', {
        p_highlight_id: highlightId,
        p_city: data.city,
        p_event_title: data.event_title,
        p_venue: data.venue,
        p_ticket_url: data.ticket_url || null,
        p_role_text: data.role_text,
        p_selection_reasons: data.selection_reasons,
        p_image_url: data.image_url,
        p_photo_credit: data.photo_credit || null,
        p_event_date: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : null,
        p_event_time: data.event_time || null,
        p_ticket_price: data.ticket_price || null,
        p_sort_order: data.sort_order,
        p_is_published: data.is_published
      });

      toast.success('Destaque atualizado com sucesso!');
      return result;
    } catch (error) {
      console.error('❌ Erro ao atualizar destaque:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar destaque');
      throw error;
    }
  }, [callAdminRPC]);

  const createHighlight = useCallback(async (data: any) => {
    try {
      const result = await callAdminRPC('admin_create_highlight_v2', {
        p_city: data.city,
        p_event_title: data.event_title,
        p_venue: data.venue,
        p_ticket_url: data.ticket_url || null,
        p_role_text: data.role_text,
        p_selection_reasons: data.selection_reasons,
        p_image_url: data.image_url,
        p_photo_credit: data.photo_credit || null,
        p_event_date: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : null,
        p_event_time: data.event_time || null,
        p_ticket_price: data.ticket_price || null,
        p_sort_order: data.sort_order,
        p_is_published: data.is_published
      });

      toast.success('Destaque criado com sucesso!');
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar destaque:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar destaque');
      throw error;
    }
  }, [callAdminRPC]);

  const getHighlightById = useCallback(async (highlightId: string) => {
    try {
      const result = await callAdminRPC('admin_get_highlight_by_id', {
        p_highlight_id: highlightId
      });

      if (!result.data || result.data.length === 0) {
        throw new Error('Destaque não encontrado ou sem permissão para acessar');
      }

      return result.data[0];
    } catch (error) {
      console.error('❌ Erro ao carregar destaque:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar destaque');
      throw error;
    }
  }, [callAdminRPC]);

  return {
    updateHighlight,
    createHighlight,
    getHighlightById,
    callAdminRPC,
    isAuthenticated
  };
};