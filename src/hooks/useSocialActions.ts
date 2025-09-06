import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePublicAuth } from '@/hooks/usePublicAuth';

export interface EventSocialData {
  going_count: number;
  maybe_count: number;
  went_count: number;
  avatars: string[];
}

export type AttendanceStatus = 'going' | 'maybe' | 'went';

export const useSocialActions = () => {
  const { toast } = useToast();
  const { isAuthenticated } = usePublicAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setButtonLoading = (key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  };

  const requireAuth = (action: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: `Você precisa estar logado para ${action}.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const toggleSave = async (eventId: string, collection = 'default') => {
    if (!requireAuth('salvar evento')) return false;

    const key = `save-${eventId}`;
    setButtonLoading(key, true);

    try {
      const { data, error } = await supabase.rpc('toggle_save', {
        event_id: eventId,
        collection
      });

      if (error) throw error;

      const saved = data?.[0]?.saved ?? false;
      toast({
        title: saved ? "Evento salvo!" : "Evento removido dos salvos",
        description: saved 
          ? "Você pode ver seus eventos salvos no seu perfil." 
          : "O evento foi removido da sua lista.",
      });

      return saved;
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setButtonLoading(key, false);
    }
  };

  const setAttendance = async (eventId: string, status: AttendanceStatus, showPublicly = true) => {
    if (!requireAuth('marcar presença')) return false;

    const key = `attendance-${eventId}`;
    setButtonLoading(key, true);

    try {
      const { error } = await supabase.rpc('set_attendance', {
        p_event_id: eventId,
        p_status: status,
        p_show_publicly: showPublicly
      });

      if (error) throw error;

      const statusLabels = {
        going: 'Vou',
        maybe: 'Talvez',
        went: 'Fui'
      };

      toast({
        title: "Presença atualizada!",
        description: `Marcado como "${statusLabels[status]}" no evento.`,
      });

      return true;
    } catch (error) {
      console.error('Error setting attendance:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar presença. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setButtonLoading(key, false);
    }
  };

  const toggleFollow = async (entityType: string, entityUuid?: string, entitySlug?: string) => {
    if (!requireAuth('seguir')) return false;

    const key = `follow-${entityType}-${entityUuid || entitySlug}`;
    setButtonLoading(key, true);

    try {
      const { data, error } = await supabase.rpc('toggle_follow', {
        p_entity_type: entityType,
        p_entity_uuid: entityUuid,
        p_entity_slug: entitySlug
      });

      if (error) throw error;

      const following = data?.[0]?.following ?? false;
      toast({
        title: following ? "Seguindo!" : "Deixou de seguir",
        description: following 
          ? "Você será notificado sobre novidades." 
          : "Você não receberá mais notificações.",
      });

      return following;
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setButtonLoading(key, false);
    }
  };

  const getEventSocial = async (eventId: string, limit = 12): Promise<EventSocialData | null> => {
    try {
      const { data, error } = await supabase.rpc('get_event_social', {
        p_event_id: eventId,
        p_limit: limit
      });

      if (error) throw error;

      return data?.[0] || {
        going_count: 0,
        maybe_count: 0,
        went_count: 0,
        avatars: []
      };
    } catch (error) {
      console.error('Error getting event social:', error);
      return null;
    }
  };

  const isLoading = (key: string) => loading[key] || false;

  return {
    toggleSave,
    setAttendance,
    toggleFollow,
    getEventSocial,
    isLoading,
  };
};