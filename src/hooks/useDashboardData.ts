import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getKpis, getRecentActivity, getSystemHealth } from '@/data/dashboard';
import { getEventsWeekly } from '@/data/eventsWeekly';
import type { DashboardKpis, RecentActivityItem, SystemHealth } from '@/data/dashboard';
import type { WeeklyEventData } from '@/data/eventsWeekly';

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

// New comprehensive dashboard data hook
export interface DashboardData {
  kpis: DashboardKpis | null;
  recentActivity: RecentActivityItem[];
  systemHealth: SystemHealth | null;
  weeklyEvents: WeeklyEventData[];
}

export interface DashboardState {
  data: DashboardData;
  loading: {
    kpis: boolean;
    recentActivity: boolean;
    systemHealth: boolean;
    weeklyEvents: boolean;
  };
  error: {
    kpis: string | null;
    recentActivity: string | null;
    systemHealth: string | null;
    weeklyEvents: string | null;
  };
  lastUpdated: Date | null;
}

export function useDashboardData(autoRefresh = true, refreshInterval = 60000) {
  const [state, setState] = useState<DashboardState>({
    data: {
      kpis: null,
      recentActivity: [],
      systemHealth: null,
      weeklyEvents: []
    },
    loading: {
      kpis: true,
      recentActivity: true,
      systemHealth: true,
      weeklyEvents: true
    },
    error: {
      kpis: null,
      recentActivity: null,
      systemHealth: null,
      weeklyEvents: null
    },
    lastUpdated: null
  });

  const updateLoadingState = (section: keyof DashboardState['loading'], isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        [section]: isLoading
      }
    }));
  };

  const updateErrorState = (section: keyof DashboardState['error'], error: string | null) => {
    setState(prev => ({
      ...prev,
      error: {
        ...prev.error,
        [section]: error
      }
    }));
  };

  const loadKpis = async () => {
    try {
      updateLoadingState('kpis', true);
      updateErrorState('kpis', null);
      
      const kpis = await getKpis();
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          kpis
        }
      }));
    } catch (error: any) {
      console.error('Failed to load KPIs:', error);
      updateErrorState('kpis', error.message || 'Erro ao carregar KPIs');
    } finally {
      updateLoadingState('kpis', false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      updateLoadingState('recentActivity', true);
      updateErrorState('recentActivity', null);
      
      const recentActivity = await getRecentActivity();
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          recentActivity
        }
      }));
    } catch (error: any) {
      console.error('Failed to load recent activity:', error);
      updateErrorState('recentActivity', error.message || 'Erro ao carregar atividade recente');
    } finally {
      updateLoadingState('recentActivity', false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      updateLoadingState('systemHealth', true);
      updateErrorState('systemHealth', null);
      
      const systemHealth = await getSystemHealth();
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          systemHealth
        }
      }));
    } catch (error: any) {
      console.error('Failed to load system health:', error);
      updateErrorState('systemHealth', error.message || 'Erro ao carregar status do sistema');
    } finally {
      updateLoadingState('systemHealth', false);
    }
  };

  const loadWeeklyEvents = async () => {
    try {
      updateLoadingState('weeklyEvents', true);
      updateErrorState('weeklyEvents', null);
      
      const weeklyEvents = await getEventsWeekly(60);
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          weeklyEvents
        }
      }));
    } catch (error: any) {
      console.error('Failed to load weekly events:', error);
      updateErrorState('weeklyEvents', error.message || 'Erro ao carregar eventos semanais');
    } finally {
      updateLoadingState('weeklyEvents', false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadKpis(),
      loadRecentActivity(),
      loadSystemHealth(),
      loadWeeklyEvents()
    ]);

    setState(prev => ({
      ...prev,
      lastUpdated: new Date()
    }));
  };

  const refresh = () => {
    loadAllData();
  };

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAllData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const isLoading = Object.values(state.loading).some(Boolean);
  const hasError = Object.values(state.error).some(Boolean);

  return {
    ...state,
    isLoading,
    hasError,
    refresh,
    loadKpis,
    loadRecentActivity,
    loadSystemHealth,
    loadWeeklyEvents
  };
}

// Legacy hooks for backwards compatibility
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [highlightsResult, eventsResult, venuesResult, organizersResult] = await Promise.all([
        supabase.from('highlights').select('id, status'),
        supabase.from('agenda_itens').select('id, status'), // Updated table name
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
          published: events.filter(e => e.status === 'published').length,
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
          .from('agenda_itens')
          .select('id, title, starts_at, city')
          .gte('starts_at', today.toISOString())
          .lt('starts_at', next7Days.toISOString())
          .eq('status', 'published')
          .order('starts_at', { ascending: true })
          .limit(10),
        supabase
          .from('highlights')
          .select('id, title, start_at, city')
          .gte('start_at', today.toISOString())
          .lt('start_at', next7Days.toISOString())
          .eq('status', 'published')
          .order('start_at', { ascending: true })
          .limit(10)
      ]);

      const events = eventsResult.data || [];
      const highlights = highlightsResult.data || [];

      const todayEnd = new Date(today);
      todayEnd.setDate(today.getDate() + 1);

      return {
        today: {
          events: events.filter(e => new Date(e.starts_at) < todayEnd).map(e => ({
            id: e.id,
            title: e.title,
            date_start: e.starts_at,
            city: e.city
          })),
          highlights: highlights.filter(h => new Date(h.start_at) < todayEnd).map(h => ({
            id: h.id,
            event_title: h.title,
            event_date: h.start_at,
            city: h.city
          })),
        },
        next7Days: {
          events: events.filter(e => new Date(e.starts_at) >= todayEnd).map(e => ({
            id: e.id,
            title: e.title,
            date_start: e.starts_at,
            city: e.city
          })),
          highlights: highlights.filter(h => new Date(h.start_at) >= todayEnd).map(h => ({
            id: h.id,
            event_title: h.title,
            event_date: h.start_at,
            city: h.city
          })),
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
          .select('id, title, start_at, cover_url, city, slug')
          .order('created_at', { ascending: false }),
        supabase
          .from('agenda_itens')
          .select('id, title, organizer_id, venue_id, slug')
          .order('created_at', { ascending: false })
      ]);

      const highlights = highlightsResult.data || [];
      const events = eventsResult.data || [];

      // Verificar dados faltantes em highlights
      const highlightsMissingData = highlights
        .map(h => {
          const issues: string[] = [];
          if (!h.start_at) issues.push('Data do evento');
          if (!h.cover_url) issues.push('Imagem de capa');
          if (!h.city) issues.push('Cidade');
          if (!h.slug) issues.push('Slug');
          return { 
            id: h.id, 
            event_title: h.title,
            issues 
          };
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
          return { 
            id: e.id,
            title: e.title,
            issues 
          };
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