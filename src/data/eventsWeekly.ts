import { supabase } from '@/integrations/supabase/client';

export interface WeeklyEventData {
  week_start: string;
  total: number;
}

/**
 * Fetches weekly event aggregation data
 * @param lastDays Number of days to look back (default: 60)
 * @returns Promise<WeeklyEventData[]>
 */
export async function getEventsWeekly(lastDays: number = 60): Promise<WeeklyEventData[]> {
  try {
    // First try the RPC function for better performance
    const { data, error } = await supabase.rpc('events_by_week', { 
      last_days: lastDays 
    });

    if (!error && data) {
      return data.map((item: any) => ({
        week_start: item.week_start,
        total: item.total
      }));
    }

    // If RPC doesn't exist, fallback to manual aggregation
    console.warn('RPC events_by_week not available, using fallback method');
    return await getEventsWeeklyFallback(lastDays);
  } catch (error) {
    console.warn('RPC events_by_week failed, using fallback method:', error);
    return await getEventsWeeklyFallback(lastDays);
  }
}

/**
 * Fallback method: fetch events and aggregate in JavaScript
 */
async function getEventsWeeklyFallback(lastDays: number): Promise<WeeklyEventData[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lastDays);

    const { data, error } = await supabase
      .from('agenda_itens')
      .select('starts_at')
      .gte('starts_at', cutoffDate.toISOString())
      .not('starts_at', 'is', null);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, return empty data
        console.warn('agenda_itens table does not exist');
        return [];
      }
      throw error;
    }

    // Aggregate by week in JavaScript
    const weeklyData: { [key: string]: number } = {};

    (data || []).forEach((item) => {
      if (item.starts_at) {
        const date = new Date(item.starts_at);
        // Get start of week (Monday)
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(date.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
      }
    });

    // Convert to array and sort by date
    return Object.entries(weeklyData)
      .map(([week_start, total]) => ({
        week_start,
        total
      }))
      .sort((a, b) => a.week_start.localeCompare(b.week_start));
  } catch (error) {
    console.error('Error in fallback events weekly fetch:', error);
    return [];
  }
}