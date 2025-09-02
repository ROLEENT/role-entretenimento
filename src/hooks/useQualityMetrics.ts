import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QualityMetrics {
  events: {
    total: number;
    complete: number; // >= 60% completeness
    incomplete: number; // < 60% completeness
    draft: number;
    published: number;
    needsReview: number; // complete but still draft
  };
  venues: {
    total: number;
    complete: number;
    incomplete: number;
    draft: number;
    published: number;
    needsReview: number;
  };
  overall: {
    completenessRate: number; // % of items with >= 60% completion
    publishRate: number; // % of complete items that are published
    qualityScore: number; // combined metric 0-100
  };
}

export const useQualityMetrics = () => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch events data
        const { data: events, error: eventsError } = await supabase
          .from('agenda_itens')
          .select('id, status, title, summary, starts_at, venue_id, organizer_id, cover_url, tags')
          .is('deleted_at', null);

        if (eventsError) throw eventsError;

        // Fetch venues data
        const { data: venues, error: venuesError } = await supabase
          .from('venues')
          .select('id, status, name, description, address, city, cover_image_url, contact_info');

        if (venuesError) throw venuesError;

        // Calculate event metrics
        const eventMetrics = {
          total: events?.length || 0,
          complete: 0,
          incomplete: 0,
          draft: 0,
          published: 0,
          needsReview: 0,
        };

        events?.forEach(event => {
          const completeness = calculateEventCompleteness(event);
          
          if (completeness >= 60) {
            eventMetrics.complete++;
            if (event.status === 'draft') {
              eventMetrics.needsReview++;
            }
          } else {
            eventMetrics.incomplete++;
          }

          if (event.status === 'draft') eventMetrics.draft++;
          if (event.status === 'published') eventMetrics.published++;
        });

        // Calculate venue metrics
        const venueMetrics = {
          total: venues?.length || 0,
          complete: 0,
          incomplete: 0,
          draft: 0,
          published: 0,
          needsReview: 0,
        };

        venues?.forEach(venue => {
          const completeness = calculateVenueCompleteness(venue);
          
          if (completeness >= 60) {
            venueMetrics.complete++;
            if (venue.status === 'draft') {
              venueMetrics.needsReview++;
            }
          } else {
            venueMetrics.incomplete++;
          }

          if (venue.status === 'draft') venueMetrics.draft++;
          if (venue.status === 'published') venueMetrics.published++;
        });

        // Calculate overall metrics
        const totalItems = eventMetrics.total + venueMetrics.total;
        const totalComplete = eventMetrics.complete + venueMetrics.complete;
        const totalPublished = eventMetrics.published + venueMetrics.published;

        const completenessRate = totalItems > 0 ? (totalComplete / totalItems) * 100 : 0;
        const publishRate = totalComplete > 0 ? (totalPublished / totalComplete) * 100 : 0;
        const qualityScore = (completenessRate * 0.6) + (publishRate * 0.4);

        setMetrics({
          events: eventMetrics,
          venues: venueMetrics,
          overall: {
            completenessRate,
            publishRate,
            qualityScore,
          },
        });
      } catch (err) {
        console.error('Error fetching quality metrics:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar métricas de qualidade');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
};

// Helper functions to calculate completeness
function calculateEventCompleteness(event: any): number {
  const fields = [
    { key: 'title', weight: 20 },
    { key: 'summary', weight: 15 },
    { key: 'starts_at', weight: 15 },
    { key: 'venue_id', weight: 10 },
    { key: 'organizer_id', weight: 10 },
    { key: 'cover_url', weight: 15 },
    { key: 'tags', weight: 15, isArray: true },
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  fields.forEach(field => {
    totalWeight += field.weight;
    const value = event[field.key];
    
    if (field.isArray) {
      if (Array.isArray(value) && value.length > 0) {
        completedWeight += field.weight;
      }
    } else {
      if (value && value.toString().trim() !== '') {
        completedWeight += field.weight;
      }
    }
  });

  return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
}

function calculateVenueCompleteness(venue: any): number {
  const fields = [
    { key: 'name', weight: 25 },
    { key: 'description', weight: 20 },
    { key: 'address', weight: 20 },
    { key: 'city', weight: 10 },
    { key: 'cover_image_url', weight: 15 },
    { key: 'contact_info', weight: 10 },
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  fields.forEach(field => {
    totalWeight += field.weight;
    const value = venue[field.key];
    
    if (value && value.toString().trim() !== '') {
      completedWeight += field.weight;
    }
  });

  return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
}