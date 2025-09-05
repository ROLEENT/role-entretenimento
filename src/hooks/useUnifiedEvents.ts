import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createHybridEventFetcher, UnifiedEvent, transformEventTableData, transformAgendaTableData } from "@/lib/eventDataAdapters";

// Hook that provides a unified interface for both events and agenda_itens tables
export function useUnifiedEvents(filters?: {
  city?: string;
  search?: string;
  status?: string;
  limit?: number;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ["unified-events", filters],
    queryFn: async () => {
      console.log("🔄 Buscando eventos unificados com filtros:", filters);
      
      const hybridFetcher = createHybridEventFetcher(supabase);
      const events = await hybridFetcher(filters || {});
      
      console.log("✅ Eventos unificados encontrados:", {
        count: events.length,
        sources: events.reduce((acc, event) => {
          acc[event.source] = (acc[event.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      return events;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook specifically for real events from admin-v3 (events table)
export function useRealEvents(filters?: {
  city?: string;
  search?: string;
  status?: string;
  limit?: number;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ["real-events", filters],
    queryFn: async () => {
      console.log("🎯 Buscando eventos reais (tabela events) com filtros:", filters);
      
      let query = supabase
        .from('events')
        .select(`
          id, title, subtitle, summary, description, slug,
          date_start, date_end, doors_open_utc,
          city, state, country, location_name, address,
          image_url, cover_url, price_min, price_max, currency,
          highlight_type, is_sponsored, age_rating, genres, tags,
          ticket_url, status, visibility, created_at, updated_at
        `)
        .order('date_start', { ascending: true });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'published'); // Default to published events
      }

      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.featured) {
        query = query.in('highlight_type', ['curatorial', 'vitrine']);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Erro ao buscar eventos reais:", error);
        throw error;
      }

      const events: UnifiedEvent[] = (data || []).map(transformEventTableData);
      
      console.log("✅ Eventos reais encontrados:", {
        count: events.length,
        cities: [...new Set(events.map(e => e.city))],
        statuses: [...new Set(events.map(e => e.status))]
      });
      
      return events;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for legacy events (agenda_itens table) - for backward compatibility
export function useLegacyEvents(filters?: {
  city?: string;
  search?: string;
  status?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["legacy-events", filters],
    queryFn: async () => {
      console.log("📜 Buscando eventos legados (tabela agenda_itens) com filtros:", filters);
      
      let query = supabase
        .from('agenda_itens')
        .select(`
          id, title, subtitle, summary, slug,
          starts_at, end_at, city, location_name, address,
          cover_url, price_min, price_max, currency,
          highlight_type, is_sponsored, age_rating, tags,
          ticket_url, status, visibility_type, created_at, updated_at
        `)
        .eq('status', 'published')
        .order('starts_at', { ascending: true });

      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Erro ao buscar eventos legados:", error);
        throw error;
      }

      const events: UnifiedEvent[] = (data || []).map(transformAgendaTableData);
      
      console.log("✅ Eventos legados encontrados:", events.length);
      
      return events;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}