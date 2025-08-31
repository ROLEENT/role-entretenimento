import { supabase } from '@/integrations/supabase/client';
import { countSafe, countSafeMultiple } from './safeCount';

export interface DashboardKpis {
  publishedEvents: number;
  scheduledEvents: number;
  draftEvents: number;
  agentsTotal: number;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  status?: string;
  updated_at?: string;
  created_at?: string;
  type?: string;
}

/**
 * Fetches KPI data for the dashboard
 * @returns Promise<DashboardKpis>
 */
export async function getKpis(): Promise<DashboardKpis> {
  try {
    // Use the new RPC function for dashboard stats
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    
    if (error) {
      console.warn('RPC get_dashboard_stats failed, using fallback:', error);
      return await getKpisFallback();
    }

    if (data) {
      return {
        publishedEvents: data.published_events || 0,
        scheduledEvents: data.scheduled_events || 0,
        draftEvents: data.draft_events || 0,
        agentsTotal: (data.total_artists || 0) + (data.total_venues || 0) + (data.total_organizers || 0)
      };
    }

    return await getKpisFallback();
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return await getKpisFallback();
  }
}

/**
 * Fallback method for KPIs
 */
async function getKpisFallback(): Promise<DashboardKpis> {
  try {
    // Run all KPI queries in parallel - using both agenda_itens and events tables
    const [
      publishedAgendaResult, 
      scheduledAgendaResult, 
      draftAgendaResult,
      publishedEventsResult,
      agentsResult
    ] = await Promise.all([
      countSafe('agenda_itens', { column: 'status', value: 'published' }),
      countSafe('agenda_itens', { column: 'status', value: 'scheduled' }),
      countSafe('agenda_itens', { column: 'status', value: 'draft' }),
      countSafe('events', { column: 'status', value: 'active' }),
      getAgentsTotal()
    ]);

    return {
      publishedEvents: publishedAgendaResult.count + publishedEventsResult.count,
      scheduledEvents: scheduledAgendaResult.count,
      draftEvents: draftAgendaResult.count,
      agentsTotal: agentsResult.count
    };
  } catch (error) {
    console.error('Error in fallback KPIs:', error);
    return {
      publishedEvents: 0,
      scheduledEvents: 0,
      draftEvents: 0,
      agentsTotal: 0
    };
  }
}

/**
 * Gets total agent count from available tables
 * @returns Promise<SafeCountResult>
 */
async function getAgentsTotal() {
  try {
    // Count active artists as the primary metric for agents
    const artistsResult = await countSafe('artists', { column: 'status', value: 'active' });
    
    // If artists table exists, use it as primary count
    if (artistsResult.error === null) {
      return artistsResult;
    }

    // Fallback to unified agentes table if artists table doesn't exist
    const agentesResult = await countSafe('agentes');
    if (agentesResult.error === null) {
      return agentesResult;
    }

    // Last fallback to counting all tables
    const individualTablesResult = await countSafeMultiple(['organizers', 'venues']);
    return individualTablesResult;
  } catch (error) {
    console.error('Error counting agents:', error);
    return { count: 0, error: 'Failed to count agents' };
  }
}

/**
 * Fetches recent activity from agenda items
 * @returns Promise<RecentActivityItem[]>
 */
export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  try {
    // Try using the RPC function first
    const { data, error } = await supabase.rpc('get_recent_activity');
    
    if (!error && data) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Item sem título',
        status: item.status,
        updated_at: item.updated_at,
        created_at: item.created_at,
        type: item.type
      }));
    }

    console.warn('RPC get_recent_activity failed, using fallback:', error);
    return await getRecentActivityFallback();
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return await getRecentActivityFallback();
  }
}

/**
 * Fallback method for recent activity
 */
async function getRecentActivityFallback(): Promise<RecentActivityItem[]> {
  try {
    const activities: RecentActivityItem[] = [];

    // Fetch recent artists
    try {
      const { data: artistsData } = await supabase
        .from('artists')
        .select('id, name, status, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (artistsData) {
        activities.push(...artistsData.map(item => ({
          id: item.id,
          title: item.name || 'Artista sem nome',
          status: item.status,
          updated_at: item.updated_at || item.created_at,
          created_at: item.created_at,
          type: 'artist'
        })));
      }
    } catch (error) {
      console.warn('Could not fetch recent artists:', error);
    }

    // Fetch recent agenda items
    try {
      const { data: agendaData } = await supabase
        .from('agenda_itens')
        .select('id, title, status, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (agendaData) {
        activities.push(...agendaData.map(item => ({
          id: item.id,
          title: item.title || 'Evento sem título',
          status: item.status,
          updated_at: item.updated_at || item.created_at,
          created_at: item.created_at,
          type: 'agenda_item'
        })));
      }
    } catch (error) {
      console.warn('Could not fetch recent agenda items:', error);
    }

    // Sort all activities by updated_at and limit to 10
    return activities
      .sort((a, b) => new Date(b.updated_at || b.created_at!).getTime() - new Date(a.updated_at || a.created_at!).getTime())
      .slice(0, 10);

  } catch (error) {
    console.error('Unexpected error fetching recent activity:', error);
    return [];
  }
}

/**
 * Fetches health status of system components
 * @returns Promise<{database: {status: string, message: string}, storage: {status: string, message: string}, schema: {status: string, message: string}}>
 */
export interface SystemHealth {
  database: {
    status: 'ok' | 'warning' | 'error';
    message: string;
  };
  storage: {
    status: 'ok' | 'warning' | 'error';
    message: string;
  };
  schema: {
    status: 'ok' | 'warning' | 'error';
    message: string;
  };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const health: SystemHealth = {
    database: { status: 'ok', message: 'Conectado' },
    storage: { status: 'ok', message: 'Acessível' },
    schema: { status: 'ok', message: 'Dados disponíveis' }
  };

  // Test database connection by checking core tables
  try {
    const [artistsResult, agendaResult, venuesResult] = await Promise.all([
      supabase.from('artists').select('id', { count: 'exact' }).limit(1),
      supabase.from('agenda_itens').select('id', { count: 'exact' }).limit(1),
      supabase.from('venues').select('id', { count: 'exact' }).limit(1)
    ]);
    
    const tableStatus = [];
    let totalRecords = 0;
    
    if (!artistsResult.error) {
      tableStatus.push('Artists');
      totalRecords += artistsResult.count || 0;
    }
    if (!agendaResult.error) {
      tableStatus.push('Agenda');
      totalRecords += agendaResult.count || 0;
    }
    if (!venuesResult.error) {
      tableStatus.push('Venues');
      totalRecords += venuesResult.count || 0;
    }
    
    if (tableStatus.length >= 2) {
      health.database = { status: 'ok', message: `${tableStatus.length} tabelas principais acessíveis` };
    } else if (tableStatus.length > 0) {
      health.database = { status: 'warning', message: `${tableStatus.length}/3 tabelas disponíveis` };
    } else {
      health.database = { status: 'error', message: 'Tabelas principais inacessíveis' };
    }

    // Update schema status with actual counts
    if (totalRecords > 0) {
      const artistCount = artistsResult.count || 0;
      const venueCount = venuesResult.count || 0;
      const agendaCount = agendaResult.count || 0;
      health.schema = { 
        status: 'ok', 
        message: `${artistCount} artistas, ${venueCount} locais, ${agendaCount} eventos` 
      };
    } else {
      health.schema = { status: 'warning', message: 'Sem dados cadastrados' };
    }
  } catch (error) {
    health.database = { status: 'error', message: 'Erro de conexão' };
    health.schema = { status: 'error', message: 'Dados inacessíveis' };
  }

  // Test storage access
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      health.storage = { status: 'warning', message: 'Acesso limitado' };
    } else {
      const activeBuckets = buckets?.length || 0;
      health.storage = { status: 'ok', message: `${activeBuckets} buckets disponíveis` };
    }
  } catch (error) {
    health.storage = { status: 'error', message: 'Storage inacessível' };
  }

  return health;
}