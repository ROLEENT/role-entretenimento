import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CriterionKey = 'relevancia' | 'qualidade' | 'diversidade' | 'impacto' | 'coerencia' | 'experiencia' | 'tecnica' | 'acessibilidade';
export type CriterionStatus = 'met' | 'partial' | 'na';

export interface CriterionData {
  key: CriterionKey;
  status: CriterionStatus;
  is_primary: boolean;
}

export interface CurationData {
  eventId: string;
  criteria: CriterionData[];
  chips: string[];
  score: number;
  notes?: string;
}

export function useCurationData(eventId: string) {
  return useQuery({
    queryKey: ['curation-data', eventId],
    queryFn: async (): Promise<CurationData | null> => {
      if (!eventId) return null;

      // Buscar critérios
      const { data: criteria, error: criteriaError } = await supabase
        .from('event_curation_criteria')
        .select('key, status, is_primary')
        .eq('event_id', eventId);

      if (criteriaError) {
        console.error('Error fetching curation criteria:', criteriaError);
        return null;
      }

      // Buscar dados do evento (score e notes)
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('curation_score, curation_notes')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error fetching event curation data:', eventError);
      }

      // Gerar chips dos critérios principais (até 3)
      const chips = (criteria || [])
        .filter(c => c.is_primary && (c.status === 'met' || c.status === 'partial'))
        .slice(0, 3)
        .map(c => c.key);

      // Se não há chips primários suficientes, pegar os primeiro com status 'met'
      if (chips.length < 3) {
        const additionalChips = (criteria || [])
          .filter(c => !c.is_primary && c.status === 'met')
          .slice(0, 3 - chips.length)
          .map(c => c.key);
        chips.push(...additionalChips);
      }

      return {
        eventId,
        criteria: criteria || [],
        chips,
        score: eventData?.curation_score || 0,
        notes: eventData?.curation_notes || undefined
      };
    },
    enabled: !!eventId,
  });
}