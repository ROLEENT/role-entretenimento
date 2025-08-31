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
    // Run all KPI queries in parallel
    const [publishedResult, scheduledResult, draftResult, agentsResult] = await Promise.all([
      countSafe('agenda_itens', { column: 'status', value: 'published' }),
      countSafe('agenda_itens', { column: 'status', value: 'scheduled' }),
      countSafe('agenda_itens', { column: 'status', value: 'draft' }),
      getAgentsTotal()
    ]);

    return {
      publishedEvents: publishedResult.count,
      scheduledEvents: scheduledResult.count,
      draftEvents: draftResult.count,
      agentsTotal: agentsResult.count
    };
  } catch (error) {
    console.error('Error fetching KPIs:', error);
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
    // First try the unified 'agentes' table
    const agentesResult = await countSafe('agentes');
    
    // If agentes table exists and has data, use it
    if (agentesResult.count > 0 || (agentesResult.error === null && agentesResult.count === 0)) {
      return agentesResult;
    }

    // Fallback to individual tables
    const individualTablesResult = await countSafeMultiple(['artists', 'organizers', 'venues']);
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
    // Try to fetch with updated_at first
    let { data, error } = await supabase
      .from('agenda_itens')
      .select('id, title, status, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    // If updated_at column doesn't exist, try created_at
    if (error && error.code === '42703') {
      console.warn('updated_at column not found, trying created_at');
      
      const result = await supabase
        .from('agenda_itens')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (result.error) {
        if (result.error.code === '42P01') {
          console.warn('agenda_itens table does not exist, returning empty activity');
          return [];
        }
        console.error('Error fetching recent activity:', result.error);
        return [];
      }

      // Map data ensuring updated_at is always present
      return (result.data || []).map(item => ({
        id: item.id,
        title: item.title || 'Sem título',
        status: item.status,
        updated_at: item.created_at, // Use created_at as updated_at fallback
        created_at: item.created_at,
        type: 'agenda_item'
      }));
    }

    // If table doesn't exist at all
    if (error && error.code === '42P01') {
      console.warn('agenda_itens table does not exist, returning empty activity');
      return [];
    }

    if (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      title: item.title || 'Sem título',
      status: item.status,
      updated_at: item.updated_at || item.created_at, // Fallback to created_at if updated_at doesn't exist
      created_at: item.created_at,
      type: 'agenda_item'
    }));
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
    schema: { status: 'ok', message: 'Versão atual' }
  };

  // Test database connection with simple ping
  try {
    const { error } = await supabase
      .from('agenda_itens')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, but connection works
      health.database = { status: 'warning', message: 'Tabelas não encontradas' };
    } else if (error) {
      health.database = { status: 'error', message: 'Erro de conexão' };
    }
  } catch (error) {
    health.database = { status: 'error', message: 'Não conectado' };
  }

  // Test storage access
  try {
    const { error } = await supabase.storage.listBuckets();
    if (error) {
      health.storage = { status: 'warning', message: 'Acesso limitado' };
    }
  } catch (error) {
    health.storage = { status: 'error', message: 'Não acessível' };
  }

  // Check schema version if available (optional)
  try {
    const { data, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'get_schema_version')
      .maybeSingle();
    
    if (error || !data) {
      health.schema = { status: 'warning', message: 'Versão não disponível' };
    }
  } catch (error) {
    health.schema = { status: 'warning', message: 'Versão não detectada' };
  }

  return health;
}