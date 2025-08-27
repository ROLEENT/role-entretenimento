import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type EngagementType = 'interest' | 'bought_ticket' | 'will_attend';

interface EngagementData {
  interestCount: number;
  ticketCount: number;
  attendCount: number;
  userEngagements: EngagementType[];
  loading: boolean;
}

export const useEngagement = (entityId: string, entityType: 'event' | 'highlight') => {
  const [data, setData] = useState<EngagementData>({
    interestCount: 0,
    ticketCount: 0,
    attendCount: 0,
    userEngagements: [],
    loading: true,
  });

  const fetchEngagementData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));

      // Buscar contagens de cada tipo de engajamento
      const entityColumn = entityType === 'event' ? 'event_id' : 'highlight_id';
      
      const { data: engagements, error } = await supabase
        .from('event_engagement')
        .select('engagement_type, user_id')
        .eq(entityColumn, entityId);

      if (error) throw error;

      // Contar cada tipo de engajamento
      const interestCount = engagements?.filter(e => e.engagement_type === 'interest').length || 0;
      const ticketCount = engagements?.filter(e => e.engagement_type === 'bought_ticket').length || 0;
      const attendCount = engagements?.filter(e => e.engagement_type === 'will_attend').length || 0;

      // Verificar engajamentos do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      const userEngagements: EngagementType[] = [];
      
      if (user) {
        const userEngagementData = engagements?.filter(e => e.user_id === user.id) || [];
        userEngagements.push(...userEngagementData.map(e => e.engagement_type as EngagementType));
      }

      setData({
        interestCount,
        ticketCount,
        attendCount,
        userEngagements,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchEngagementData();
  }, [entityId, entityType]);

  const toggleEngagement = async (engagementType: EngagementType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Faça login para interagir com eventos');
        return;
      }

      const entityColumn = entityType === 'event' ? 'event_id' : 'highlight_id';
      const isCurrentlyEngaged = data.userEngagements.includes(engagementType);

      if (isCurrentlyEngaged) {
        // Remove engagement
        const { error } = await supabase
          .from('event_engagement')
          .delete()
          .eq('user_id', user.id)
          .eq(entityColumn, entityId)
          .eq('engagement_type', engagementType);

        if (error) throw error;
      } else {
        // Add engagement
        const insertData = {
          user_id: user.id,
          engagement_type: engagementType,
          [entityColumn]: entityId,
        };

        const { error } = await supabase
          .from('event_engagement')
          .insert(insertData);

        if (error) throw error;
      }

      // Refresh data
      await fetchEngagementData();

      // Show appropriate toast
      const messages = {
        interest: isCurrentlyEngaged ? 'Interesse removido' : 'Interesse demonstrado!',
        bought_ticket: isCurrentlyEngaged ? 'Marcação de ingresso removida' : 'Ingresso marcado como comprado!',
        will_attend: isCurrentlyEngaged ? 'Presença desmarcada' : 'Presença confirmada!',
      };
      
      toast.success(messages[engagementType]);
    } catch (error) {
      console.error('Error toggling engagement:', error);
      toast.error('Erro ao atualizar engajamento');
    }
  };

  return {
    ...data,
    toggleEngagement,
    refetch: fetchEngagementData,
  };
};