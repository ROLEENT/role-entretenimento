import { supabase } from '@/integrations/supabase/client';

export interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  message: string;
}

export interface SystemHealth {
  database: HealthStatus;
  storage: HealthStatus;
  schema: HealthStatus;
}

/**
 * Simple database ping to check connectivity
 */
export async function pingSupabase(): Promise<HealthStatus> {
  try {
    const { error } = await supabase
      .from('agenda_itens')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist but connection works
        return {
          status: 'warning',
          message: 'Conectado (tabela não encontrada)'
        };
      }
      return {
        status: 'error',
        message: 'Erro de conexão'
      };
    }

    return {
      status: 'ok',
      message: 'Conectado'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Falha na conexão'
    };
  }
}

/**
 * Check storage access by listing buckets
 */
export async function listBuckets(): Promise<HealthStatus> {
  try {
    const { error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        status: 'warning',
        message: 'Acesso limitado'
      };
    }

    return {
      status: 'ok',
      message: 'Acessível'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Não acessível'
    };
  }
}

/**
 * Get schema version from environment or return default
 */
export function schemaVersion(): HealthStatus {
  try {
    // Check for schema version in environment
    const version = process.env.NEXT_PUBLIC_SCHEMA_VERSION;
    
    if (version) {
      return {
        status: 'ok',
        message: `v${version}`
      };
    }

    return {
      status: 'warning',
      message: 'n/d'
    };
  } catch (error) {
    return {
      status: 'warning',
      message: 'n/d'
    };
  }
}

/**
 * Get comprehensive system health status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const [database, storage] = await Promise.all([
      pingSupabase(),
      listBuckets()
    ]);

    const schema = schemaVersion();

    return {
      database,
      storage,
      schema
    };
  } catch (error) {
    console.error('Error getting system health:', error);
    
    // Return safe fallback state
    return {
      database: { status: 'error', message: 'Erro' },
      storage: { status: 'error', message: 'Erro' },
      schema: { status: 'warning', message: 'n/d' }
    };
  }
}