import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook para operações administrativas (modo desenvolvimento - sem autenticação)
 */
export const useSupabaseAdminStandard = () => {
  const [isAuthenticated] = useState(true); // Sempre autenticado em desenvolvimento
  const [isLoading] = useState(false); // Nunca carregando
  const updateHighlight = useCallback(async (highlightId: string, data: any) => {
    try {
      console.log('🔄 Atualizando destaque:', highlightId, data);

      // Primeiro, verificar se o highlight existe
      const { data: existing } = await supabase
        .from('highlights')
        .select('id')
        .eq('id', highlightId)
        .maybeSingle();

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
          selection_reasons: data.selection_reasons || [],
          image_url: data.image_url,
          photo_credit: data.photo_credit || null,
          event_date: data.event_date || null,
          event_time: data.event_time || null,
          ticket_price: data.ticket_price || null,
          sort_order: data.sort_order || 100,
          is_published: data.is_published || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', highlightId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro na atualização:', error);
        throw error;
      }

      console.log('✅ Destaque atualizado com sucesso:', result);
      return { data: result };
    } catch (error) {
      console.error('❌ Erro ao atualizar destaque:', error);
      throw error;
    }
  }, []);

  const createHighlight = useCallback(async (data: any) => {
    try {
      console.log('🆕 Criando destaque:', data);

      const { data: result, error } = await supabase
        .from('highlights')
        .insert({
          city: data.city,
          event_title: data.event_title,
          venue: data.venue,
          ticket_url: data.ticket_url || null,
          role_text: data.role_text,
          selection_reasons: data.selection_reasons || [],
          image_url: data.image_url,
          photo_credit: data.photo_credit || null,
          event_date: data.event_date || null,
          event_time: data.event_time || null,
          ticket_price: data.ticket_price || null,
          sort_order: data.sort_order || 100,
          is_published: data.is_published || false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro na criação:', error);
        throw error;
      }

      console.log('✅ Destaque criado com sucesso:', result);
      return { data: result };
    } catch (error) {
      console.error('❌ Erro ao criar destaque:', error);
      throw error;
    }
  }, []);

  const getHighlightById = useCallback(async (highlightId: string) => {
    try {
      console.log('🔍 Carregando destaque:', highlightId);
      
      // Validar se o ID é válido
      if (!highlightId || highlightId.trim() === '') {
        throw new Error('ID do destaque inválido');
      }

      // Timeout para evitar loading infinito
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao carregar destaque')), 10000);
      });

      const queryPromise = supabase
        .from('highlights')
        .select('*')
        .eq('id', highlightId)
        .maybeSingle();

      const { data: result, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Erro na consulta:', error);
        throw error;
      }

      if (!result) {
        console.warn('⚠️ Destaque não encontrado para ID:', highlightId);
        throw new Error('Destaque não encontrado');
      }

      console.log('✅ Destaque carregado:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao carregar destaque:', error);
      throw error;
    }
  }, []);

  return {
    updateHighlight,
    createHighlight,
    getHighlightById,
    isAuthenticated,
    isLoading
  };
};