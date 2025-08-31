import { supabase } from '@/integrations/supabase/client';

interface SafeCountFilter {
  column: string;
  value: any;
}

interface SafeCountResult {
  count: number;
  error: string | null;
}

/**
 * Safely counts rows in a table, returning 0 if table doesn't exist
 * @param table - Table name to count from
 * @param filter - Optional filter to apply
 * @returns Promise<SafeCountResult>
 */
export async function countSafe(
  table: string, 
  filter?: SafeCountFilter
): Promise<SafeCountResult> {
  try {
    // Build query
    let query = supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    // Apply filter if provided
    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    const { count, error } = await query;

    if (error) {
      // PostgreSQL error code 42P01 = relation does not exist (table not found)
      if (error.code === '42P01') {
        console.warn(`Table '${table}' does not exist, returning count: 0`);
        return { count: 0, error: null };
      }

      // PostgreSQL error code 42703 = column does not exist
      if (error.code === '42703') {
        console.warn(`Column '${filter?.column}' does not exist in table '${table}', returning count: 0`);
        return { count: 0, error: null };
      }

      console.error(`Error counting ${table}:`, error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error(`Unexpected error counting ${table}:`, err);
    return { 
      count: 0, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Safely counts multiple tables and returns the sum
 * @param tables - Array of table names to count
 * @returns Promise<SafeCountResult>
 */
export async function countSafeMultiple(tables: string[]): Promise<SafeCountResult> {
  try {
    const results = await Promise.all(
      tables.map(table => countSafe(table))
    );

    const totalCount = results.reduce((sum, result) => sum + result.count, 0);
    const errors = results.filter(result => result.error).map(result => result.error);

    return {
      count: totalCount,
      error: errors.length > 0 ? errors.join('; ') : null
    };
  } catch (err) {
    console.error('Error counting multiple tables:', err);
    return { 
      count: 0, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}