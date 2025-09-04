import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import LazyImage from '@/components/LazyImage';

interface RelatedEventsProps {
  currentEventId: string;
  city: string;
  categories?: string[];
}

const RelatedEvents = ({ currentEventId, city, categories = [] }: RelatedEventsProps) => {
  const [relatedEvents, setRelatedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedEvents();
  }, [currentEventId, city, categories]);

  const fetchRelatedEvents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          venue:venues(*),
          categories:event_categories(category:categories(*))
        `)
        .eq('status', 'published')
        .neq('id', currentEventId)
        .gte('date_start', new Date().toISOString())
        .order('date_start', { ascending: true })
        .limit(4);

      // Prioritize events in the same city
      query = query.eq('city', city);

      const { data, error } = await query;

      if (error) throw error;

      // If we have categories, sort by category similarity
      if (categories.length > 0 && data) {
        data.sort((a, b) => {
          const aMatchingCategories = a.categories?.filter((cat: any) => 
            categories.includes(cat.category.name)
          ).length || 0;
          
          const bMatchingCategories = b.categories?.filter((cat: any) => 
            categories.includes(cat.category.name)
          ).length || 0;
          
          return bMatchingCategories - aMatchingCategories;
        });
      }

      setRelatedEvents(data || []);
    } catch (error) {
      console.error('Error fetching related events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eventos Relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eventos Relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum evento relacionado encontrado no momento.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/eventos">
              Ver Todos os Eventos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos Relacionados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedEvents.map((event) => (
          <Link
            key={event.id}
            to={`/evento/${event.id}`}
            className="block group"
          >
            <div className="flex gap-3 p-3 rounded-lg border transition-colors group-hover:bg-muted/50">
              {event.image_url && (
                <div className="flex-shrink-0">
                  <LazyImage
                    src={event.image_url}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h4>
                
                {event.categories && event.categories.length > 0 && (
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {event.categories[0].category.name}
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(new Date(event.date_start), "dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.city}</span>
                  </div>
                </div>

                {event.price_min !== undefined && (
                  <p className="text-xs font-medium">
                    {event.price_min === 0 ? 'Gratuito' : `R$ ${event.price_min}`}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
        
        <Button asChild variant="outline" className="w-full mt-4">
          <Link to="/eventos">
            Ver Mais Eventos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default RelatedEvents;