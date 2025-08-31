/**
 * Database Query Optimization Utilities
 * 
 * Optimized queries and patterns for better performance.
 */

import { supabase } from '@/integrations/supabase/client';
import { queryCache } from '@/utils/performance';

// ========== Optimized Query Patterns ==========

/**
 * Optimized events query with proper indexing and pagination
 */
export async function getEventsOptimized(params: {
  city?: string;
  category?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}) {
  const { city, category, limit = 20, offset = 0, startDate, endDate } = params;
  
  const cacheKey = `events-${JSON.stringify(params)}`;
  const cached = queryCache.get(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('events')
    .select(`
      id,
      title,
      slug,
      date_start,
      date_end,
      city,
      state,
      image_url,
      price_min,
      price_max,
      status,
      organizer:organizer_id (
        id,
        name
      ),
      venue:venue_id (
        id,
        name,
        address
      )
    `)
    .eq('status', 'published')
    .gte('date_start', startDate || new Date().toISOString())
    .order('date_start', { ascending: true })
    .range(offset, offset + limit - 1);

  // Apply filters only if provided
  if (city) {
    query = query.eq('city', city);
  }
  
  if (endDate) {
    query = query.lte('date_start', endDate);
  }

  // Category filter through junction table (optimized)
  if (category) {
    const { data: eventIds } = await supabase
      .from('event_categories')
      .select('event_id')
      .eq('category_id', category);
    
    if (eventIds && eventIds.length > 0) {
      query = query.in('id', eventIds.map(e => e.event_id));
    } else {
      // Return empty result if no events in category
      return { data: [], count: 0 };
    }
  }

  const { data, error, count } = await query;
  
  if (error) throw error;
  
  const result = { data: data || [], count: count || 0 };
  queryCache.set(cacheKey, result, 300000); // 5 minutes
  
  return result;
}

/**
 * Optimized cities query with event counts
 */
export async function getCitiesWithEventCounts() {
  const cacheKey = 'cities-with-counts';
  const cached = queryCache.get(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .rpc('get_cities_with_event_counts');
  
  if (error) throw error;
  
  queryCache.set(cacheKey, data, 600000); // 10 minutes
  return data;
}

/**
 * Optimized search with full-text search
 */
export async function searchEventsOptimized(params: {
  query: string;
  city?: string;
  limit?: number;
  offset?: number;
}) {
  const { query: searchQuery, city, limit = 20, offset = 0 } = params;
  
  const cacheKey = `search-${JSON.stringify(params)}`;
  const cached = queryCache.get(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('events')
    .select(`
      id,
      title,
      slug,
      date_start,
      city,
      image_url,
      price_min,
      organizer:organizer_id (name),
      venue:venue_id (name)
    `)
    .eq('status', 'published')
    .gte('date_start', new Date().toISOString())
    .textSearch('title', searchQuery)
    .order('date_start', { ascending: true })
    .range(offset, offset + limit - 1);

  if (city) {
    query = query.eq('city', city);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  queryCache.set(cacheKey, data, 180000); // 3 minutes
  return data || [];
}

/**
 * Batch load related data to prevent N+1 queries
 */
export async function getEventsWithRelatedData(eventIds: string[]) {
  if (eventIds.length === 0) return {};
  
  const cacheKey = `events-related-${eventIds.join(',')}`;
  const cached = queryCache.get(cacheKey);
  if (cached) return cached;

  // Batch load all related data in parallel
  const [categoriesData, imagesData, reviewsData] = await Promise.all([
    // Categories
    supabase
      .from('event_categories')
      .select(`
        event_id,
        category:category_id (
          id,
          name,
          slug
        )
      `)
      .in('event_id', eventIds),
    
    // Images
    supabase
      .from('event_images')
      .select('event_id, url, alt_text, is_cover')
      .in('event_id', eventIds)
      .order('order_index'),
    
    // Reviews summary
    supabase
      .from('event_reviews')
      .select('event_id, rating')
      .in('event_id', eventIds)
  ]);

  // Organize data by event_id
  const result = {
    categories: categoriesData.data?.reduce((acc, item) => {
      if (!acc[item.event_id]) acc[item.event_id] = [];
      acc[item.event_id].push(item.category);
      return acc;
    }, {} as Record<string, any[]>) || {},
    
    images: imagesData.data?.reduce((acc, item) => {
      if (!acc[item.event_id]) acc[item.event_id] = [];
      acc[item.event_id].push(item);
      return acc;
    }, {} as Record<string, any[]>) || {},
    
    reviews: reviewsData.data?.reduce((acc, item) => {
      if (!acc[item.event_id]) acc[item.event_id] = { ratings: [], average: 0, count: 0 };
      acc[item.event_id].ratings.push(item.rating);
      return acc;
    }, {} as Record<string, any>) || {}
  };

  // Calculate review averages
  Object.keys(result.reviews).forEach(eventId => {
    const ratings = result.reviews[eventId].ratings;
    result.reviews[eventId].average = ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length;
    result.reviews[eventId].count = ratings.length;
  });

  queryCache.set(cacheKey, result, 300000);
  return result;
}

/**
 * Optimized infinite scroll query
 */
export async function getEventsInfiniteScroll(params: {
  cursor?: string;
  limit?: number;
  city?: string;
  category?: string;
}) {
  const { cursor, limit = 20, city, category } = params;
  
  let query = supabase
    .from('events')
    .select(`
      id,
      title,
      date_start,
      city,
      image_url,
      price_min,
      created_at
    `)
    .eq('status', 'published')
    .gte('date_start', new Date().toISOString())
    .order('date_start', { ascending: true })
    .limit(limit + 1); // Get one extra to determine if there are more

  if (cursor) {
    query = query.gt('date_start', cursor);
  }

  if (city) {
    query = query.eq('city', city);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  const items = data || [];
  const hasMore = items.length > limit;
  const nextCursor = hasMore ? items[limit - 1]?.date_start : null;
  
  return {
    items: hasMore ? items.slice(0, -1) : items,
    nextCursor,
    hasMore
  };
}

// ========== Database Optimization Functions ==========

/**
 * Create optimized database indexes
 */
export const createOptimizedIndexes = async () => {
  // These would typically be run as migrations
  const indexQueries = [
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status_date ON events(status, date_start)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_city_date ON events(city, date_start)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_search ON events USING gin(to_tsvector(\'portuguese\', title || \' \' || description))',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_categories_event ON event_categories(event_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_categories_category ON event_categories(category_id)'
  ];
  
  console.log('Optimized indexes should be created via migrations:', indexQueries);
};

/**
 * Cache invalidation patterns
 */
export const invalidateEventCaches = (eventId?: string, city?: string) => {
  if (eventId) {
    queryCache.invalidate(`events-.*${eventId}.*`);
  }
  
  if (city) {
    queryCache.invalidate(`events-.*"city":"${city}".*`);
  }
  
  // Invalidate general caches
  queryCache.invalidate('events-.*');
  queryCache.invalidate('cities-with-counts');
  queryCache.invalidate('search-.*');
};