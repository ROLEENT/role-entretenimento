import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  type: 'highlight' | 'event';
  slug?: string;
  city?: string;
  status?: string;
}

export const useGlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['global-search', searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const searchPattern = `%${searchTerm}%`;

      const [highlightsResult, eventsResult] = await Promise.all([
        supabase
          .from('highlights')
          .select('id, event_title, slug, city, status')
          .or(`event_title.ilike.${searchPattern},slug.ilike.${searchPattern}`)
          .limit(10),
        supabase
          .from('events')
          .select('id, title, slug, city, status')
          .or(`title.ilike.${searchPattern},slug.ilike.${searchPattern}`)
          .limit(10)
      ]);

      const highlights = (highlightsResult.data || []).map(h => ({
        id: h.id,
        title: h.event_title,
        type: 'highlight' as const,
        slug: h.slug,
        city: h.city,
        status: h.status,
      }));

      const events = (eventsResult.data || []).map(e => ({
        id: e.id,
        title: e.title,
        type: 'event' as const,
        slug: e.slug,
        city: e.city,
        status: e.status,
      }));

      return [...highlights, ...events].sort((a, b) => a.title.localeCompare(b.title));
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000,
  });

  const findExactMatch = (term: string): SearchResult | null => {
    const exactMatch = results.find(
      result => 
        result.title.toLowerCase() === term.toLowerCase() ||
        result.slug?.toLowerCase() === term.toLowerCase()
    );
    return exactMatch || null;
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    findExactMatch,
  };
};