/**
 * Hook to test and verify real events from admin-v3 are being exposed correctly
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealEventsTest = () => {
  return useQuery({
    queryKey: ['real-events-test'],
    queryFn: async () => {
      console.log('🧪 Testing real events from admin-v3...');
      
      // Test 1: Check events table
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, city, status, date_start, highlight_type')
        .eq('status', 'published')
        .limit(10);

      // Test 2: Check agenda_itens table
      const { data: agendaData, error: agendaError } = await supabase
        .from('agenda_itens')
        .select('id, title, city, status, starts_at, visibility_type')
        .eq('status', 'published')
        .limit(10);

      const report = {
        timestamp: new Date().toISOString(),
        events: {
          count: eventsData?.length || 0,
          data: eventsData || [],
          error: eventsError?.message || null,
          sample: eventsData?.[0] || null
        },
        agenda: {
          count: agendaData?.length || 0,
          data: agendaData || [],
          error: agendaError?.message || null,
          sample: agendaData?.[0] || null
        },
        summary: {
          totalPublishedEvents: (eventsData?.length || 0) + (agendaData?.length || 0),
          eventsTableActive: !eventsError && (eventsData?.length || 0) > 0,
          agendaTableActive: !agendaError && (agendaData?.length || 0) > 0,
          recommendedDataSource: (eventsData?.length || 0) > 0 ? 'events' : 'agenda_itens'
        }
      };

      console.log('🧪 Real Events Test Report:', report);
      return report;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};