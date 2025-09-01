import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  highlights: {
    total: number;
    draft: number;
    published: number;
  };
  events: {
    total: number;
    draft: number;
    published: number;
  };
  venues: number;
  organizers: number;
}

export interface UpcomingData {
  today: {
    events: Array<{
      id: string;
      title: string;
      date_start: string;
      city: string;
    }>;
    highlights: Array<{
      id: string;
      event_title: string;
      event_date: string;
      city: string;
    }>;
  };
  next7Days: {
    events: Array<{
      id: string;
      title: string;
      date_start: string;
      city: string;
    }>;
    highlights: Array<{
      id: string;
      event_title: string;
      event_date: string;
      city: string;
    }>;
  };
}

export interface DataQualityIssues {
  highlightsMissingData: Array<{
    id: string;
    event_title: string;
    issues: string[];
  }>;
  eventsMissingData: Array<{
    id: string;
    title: string;
    issues: string[];
  }>;
  duplicateSlugs: Array<{
    slug: string;
    count: number;
    type: 'highlight' | 'event';
  }>;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [highlightsResult, eventsResult, venuesResult, organizersResult] = await Promise.all([
        supabase.from('highlights').select('id, status'),
        supabase.from('events').select('id, status'),
        supabase.from('venues').select('id'),
        supabase.from('organizers').select('id')
      ]);

      const highlights = highlightsResult.data || [];
      const events = eventsResult.data || [];

      return {
        highlights: {
          total: highlights.length,
          draft: highlights.filter(h => h.status === 'draft').length,
          published: highlights.filter(h => h.status === 'published').length,
        },
        events: {
          total: events.length,
          draft: events.filter(e => e.status === 'draft').length,
          published: events.filter(e => e.status === 'active').length,
        },
        venues: venuesResult.data?.length || 0,
        organizers: organizersResult.data?.length || 0,
      };
    },
    staleTime: 30000, // 30 segundos
  });
};

export const useUpcomingData = () => {
  return useQuery({
    queryKey: ['upcoming-data'],
    queryFn: async (): Promise<UpcomingData> => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const next7Days = new Date(today);
      next7Days.setDate(today.getDate() + 7);

      const [eventsResult, highlightsResult] = await Promise.all([
        supabase
          .from('events')
          .select('id, title, date_start, city')
          .gte('date_start', today.toISOString())
          .lt('date_start', next7Days.toISOString())
          .eq('status', 'active')
          .order('date_start', { ascending: true })
          .limit(10),
        supabase
          .from('highlights')
          .select('id, event_title, event_date, city')
          .gte('event_date', today.toISOString())
          .lt('event_date', next7Days.toISOString())
          .eq('status', 'published')
          .order('event_date', { ascending: true })
          .limit(10)
      ]);

      const events = eventsResult.data || [];
      const highlights = highlightsResult.data || [];

      const todayEnd = new Date(today);
      todayEnd.setDate(today.getDate() + 1);

      return {
        today: {
          events: events.filter(e => new Date(e.date_start) < todayEnd),
          highlights: highlights.filter(h => new Date(h.event_date) < todayEnd),
        },
        next7Days: {
          events: events.filter(e => new Date(e.date_start) >= todayEnd),
          highlights: highlights.filter(h => new Date(h.event_date) >= todayEnd),
        },
      };
    },
    staleTime: 60000, // 1 minuto
  });
};

export const useDataQualityIssues = () => {
  return useQuery({
    queryKey: ['data-quality-issues'],
    queryFn: async (): Promise<DataQualityIssues> => {
      const [highlightsResult, eventsResult] = await Promise.all([
        supabase
          .from('highlights')
          .select('id, event_title, event_date, cover_url, city, slug')
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('id, title, organizer_id, venue_id, slug')
          .order('created_at', { ascending: false })
      ]);

      const highlights = highlightsResult.data || [];
      const events = eventsResult.data || [];

      // Verificar dados faltantes em highlights
      const highlightsMissingData = highlights
        .map(h => {
          const issues: string[] = [];
          if (!h.event_date) issues.push('Data do evento');
          if (!h.cover_url) issues.push('Imagem de capa');
          if (!h.city) issues.push('Cidade');
          if (!h.slug) issues.push('Slug');
          return { ...h, issues };
        })
        .filter(h => h.issues.length > 0)
        .slice(0, 10);

      // Verificar dados faltantes em eventos
      const eventsMissingData = events
        .map(e => {
          const issues: string[] = [];
          if (!e.organizer_id) issues.push('Organizador');
          if (!e.venue_id) issues.push('Local');
          if (!e.slug) issues.push('Slug');
          return { ...e, issues };
        })
        .filter(e => e.issues.length > 0)
        .slice(0, 10);

      // Verificar slugs duplicados
      const highlightSlugs = highlights.filter(h => h.slug).map(h => h.slug);
      const eventSlugs = events.filter(e => e.slug).map(e => e.slug);
      
      const slugCounts: Record<string, { count: number; type: 'highlight' | 'event' }> = {};
      
      highlightSlugs.forEach(slug => {
        slugCounts[slug] = { count: (slugCounts[slug]?.count || 0) + 1, type: 'highlight' };
      });
      
      eventSlugs.forEach(slug => {
        if (slugCounts[slug]) {
          slugCounts[slug].count++;
        } else {
          slugCounts[slug] = { count: 1, type: 'event' };
        }
      });

      const duplicateSlugs = Object.entries(slugCounts)
        .filter(([_, data]) => data.count > 1)
        .map(([slug, data]) => ({ slug, count: data.count, type: data.type }))
        .slice(0, 10);

      return {
        highlightsMissingData,
        eventsMissingData,
        duplicateSlugs,
      };
    },
    staleTime: 120000, // 2 minutos
  });
};