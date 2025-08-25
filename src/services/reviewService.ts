import { supabase } from '@/integrations/supabase/client';

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export const reviewStatsService = {
  async getEventReviewStats(eventId: string): Promise<ReviewStats> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event review stats:', error);
      return { averageRating: 0, totalReviews: 0 };
    }

    if (!data || data.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalReviews = data.length;
    const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews
    };
  },

  async getHighlightReviewStats(highlightId: string): Promise<ReviewStats> {
    const { data, error } = await supabase
      .from('highlight_reviews')
      .select('rating')
      .eq('highlight_id', highlightId);

    if (error) {
      console.error('Error fetching highlight review stats:', error);
      return { averageRating: 0, totalReviews: 0 };
    }

    if (!data || data.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalReviews = data.length;
    const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews
    };
  },

  async getBatchEventReviewStats(eventIds: string[]): Promise<Record<string, ReviewStats>> {
    if (eventIds.length === 0) return {};

    const { data, error } = await supabase
      .from('reviews')
      .select('event_id, rating')
      .in('event_id', eventIds);

    if (error) {
      console.error('Error fetching batch event review stats:', error);
      return {};
    }

    const statsMap: Record<string, ReviewStats> = {};
    
    // Initialize all event IDs with zero stats
    eventIds.forEach(id => {
      statsMap[id] = { averageRating: 0, totalReviews: 0 };
    });

    if (!data || data.length === 0) {
      return statsMap;
    }

    // Group reviews by event_id
    const reviewsByEvent = data.reduce((acc, review) => {
      if (!acc[review.event_id]) {
        acc[review.event_id] = [];
      }
      acc[review.event_id].push(review.rating);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate stats for each event
    Object.entries(reviewsByEvent).forEach(([eventId, ratings]) => {
      const totalReviews = ratings.length;
      const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
      const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

      statsMap[eventId] = { averageRating, totalReviews };
    });

    return statsMap;
  },

  async getBatchHighlightReviewStats(highlightIds: string[]): Promise<Record<string, ReviewStats>> {
    if (highlightIds.length === 0) return {};

    const { data, error } = await supabase
      .from('highlight_reviews')
      .select('highlight_id, rating')
      .in('highlight_id', highlightIds);

    if (error) {
      console.error('Error fetching batch highlight review stats:', error);
      return {};
    }

    const statsMap: Record<string, ReviewStats> = {};
    
    // Initialize all highlight IDs with zero stats
    highlightIds.forEach(id => {
      statsMap[id] = { averageRating: 0, totalReviews: 0 };
    });

    if (!data || data.length === 0) {
      return statsMap;
    }

    // Group reviews by highlight_id
    const reviewsByHighlight = data.reduce((acc, review) => {
      if (!acc[review.highlight_id]) {
        acc[review.highlight_id] = [];
      }
      acc[review.highlight_id].push(review.rating);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate stats for each highlight
    Object.entries(reviewsByHighlight).forEach(([highlightId, ratings]) => {
      const totalReviews = ratings.length;
      const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
      const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

      statsMap[highlightId] = { averageRating, totalReviews };
    });

    return statsMap;
  }
};