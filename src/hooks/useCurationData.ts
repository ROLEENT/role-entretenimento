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

      // Buscar chips e dados do evento
      const { data: chipData, error: chipError } = await supabase
        .from('event_curation_chips')
        .select('chips, curation_score, curation_notes')
        .eq('event_id', eventId)
        .single();

      if (chipError) {
        console.error('Error fetching curation chips:', chipError);
      }

      return {
        eventId,
        criteria: criteria || [],
        chips: chipData?.chips || [],
        score: chipData?.curation_score || 0,
        notes: chipData?.curation_notes || undefined
      };
    },
    enabled: !!eventId,
  });
}