import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import EventCard from '@/components/EventCard';
import EventSkeleton from '@/components/EventSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string;
  date_start: string;
  city: string;
  state: string;
  image_url: string | null;
  price_min: number;
  price_max: number | null;
  venues?: {
    name: string;
    address: string;
  };
  organizers?: {
    name: string;
  };
}

interface InfiniteScrollEventsProps {
  city?: string;
  category?: string;
  searchTerm?: string;
  className?: string;
}

const ITEMS_PER_PAGE = 12;

export function InfiniteScrollEvents({ 
  city, 
  category, 
  searchTerm, 
  className = "" 
}: InfiniteScrollEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver>();
  const lastEventElementRef = useRef<HTMLDivElement>();

  // Cache for API responses
  const cacheRef = useRef<Map<string, { data: Event[], timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCacheKey = (page: number) => {
    return `events-${city || 'all'}-${category || 'all'}-${searchTerm || ''}-${page}`;
  };

  const fetchEvents = useCallback(async (pageNum: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const cacheKey = getCacheKey(pageNum);
      const cached = cacheRef.current.get(cacheKey);
      
      // Check cache first
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        const newEvents = isLoadMore ? [...events, ...cached.data] : cached.data;
        setEvents(newEvents);
        setHasMore(cached.data.length === ITEMS_PER_PAGE);
        return;
      }

      const offset = pageNum * ITEMS_PER_PAGE;
      
      let query = supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          date_start,
          city,
          state,
          image_url,
          price_min,
          price_max,
          venues:venue_id (name, address),
          organizers:organizer_id (name)
        `)
        .eq('status', 'published')
        .gte('date_start', new Date().toISOString())
        .order('date_start', { ascending: true })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      // Apply filters
      if (city) {
        query = query.eq('city', city);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (category) {
        // Filter by category through junction table
        const { data: eventCategories } = await supabase
          .from('event_categories')
          .select('event_id')
          .eq('category_id', category);
        
        if (eventCategories && eventCategories.length > 0) {
          const eventIds = eventCategories.map(ec => ec.event_id);
          query = query.in('id', eventIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our Event interface
      const transformedData = (data || []).map(item => ({
        ...item,
        venues: Array.isArray(item.venues) ? item.venues[0] : item.venues,
        organizers: Array.isArray(item.organizers) ? item.organizers[0] : item.organizers
      }));
      
      // Cache the response
      cacheRef.current.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now()
      });

      const newEvents = isLoadMore ? [...events, ...transformedData] : transformedData;
      setEvents(newEvents);
      setHasMore(transformedData.length === ITEMS_PER_PAGE);

    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Erro ao carregar eventos. Tente novamente.');
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [city, category, searchTerm, events]);

  // Intersection Observer for infinite scroll
  const lastEventElementRefCallback = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prevPage => prevPage + 1);
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, loading]);

  // Load more when page changes
  useEffect(() => {
    if (page > 0) {
      fetchEvents(page, true);
    }
  }, [page]);

  // Reset and load first page when filters change
  useEffect(() => {
    setEvents([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    
    // Clear relevant cache entries
    const keysToDelete = Array.from(cacheRef.current.keys()).filter(key => 
      key.includes(`${city || 'all'}-${category || 'all'}-${searchTerm || ''}`)
    );
    keysToDelete.forEach(key => cacheRef.current.delete(key));
    
    fetchEvents(0, false);
  }, [city, category, searchTerm]);

  const handleRetry = () => {
    setError(null);
    fetchEvents(0, false);
  };

  if (loading && events.length === 0) {
    return (
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <EventSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `Nenhum evento encontrado para "${searchTerm}"`
              : 'Nenhum evento disponível no momento'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event, index) => (
          <div
            key={event.id}
            ref={index === events.length - 1 ? lastEventElementRefCallback : undefined}
          >
            <EventCard event={{
              ...event,
              category: event.venues?.name || 'Evento',
              date: event.date_start,
              price: event.price_min,
              description: event.description
            }} />
          </div>
        ))}
      </div>
      
      {loadingMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando mais eventos...</span>
          </div>
        </div>
      )}
      
      {!hasMore && events.length > 0 && (
        <div className="text-center mt-8 text-muted-foreground">
          <p>Todos os eventos foram carregados</p>
        </div>
      )}
    </div>
  );
}