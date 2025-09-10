import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FavoriteButton } from '@/components/FavoriteButton';

interface HighlightEvent {
  id: string;
  title: string;
  slug: string;
  city: string;
  date_start: string;
  image_url?: string;
  category: string;
  venue?: { name: string } | null;
  organizer?: { name: string } | null;
  price_min?: number;
  ticket_url?: string;
}

export function WeeklyHighlights() {
  const [highlights, setHighlights] = useState<HighlightEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const { data, error } = await supabase
        .from('events')
        .select(`
          id, title, slug, city, date_start, image_url, category,
          venue:venues!inner(name),
          organizer:organizers(name),
          price_min, ticket_url
        `)
        .eq('status', 'published')
        .gte('date_start', today.toISOString())
        .lte('date_start', nextWeek.toISOString())
        .order('date_start', { ascending: true })
        .limit(6);

      if (error) throw error;
      
      // Transformar dados para o formato correto
      const transformedData = (data || []).map(item => ({
        ...item,
        venue: Array.isArray(item.venue) && item.venue.length > 0 ? item.venue[0] : null,
        organizer: Array.isArray(item.organizer) && item.organizer.length > 0 ? item.organizer[0] : null,
      }));
      
      setHighlights(transformedData);
    } catch (error) {
      console.error('Erro ao buscar destaques:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Grátis';
    return `A partir de R$ ${price}`;
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">⭐ Destaques da Semana</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border animate-pulse">
                <div className="aspect-video bg-muted rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (highlights.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">⭐ Destaques da Semana</h2>
          <p className="text-muted-foreground">Nada por aqui… que tal conferir eventos da sua cidade?</p>
          <Button asChild className="mt-4">
            <Link to="/agenda">Ver todos os eventos</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">⭐ Destaques da Semana</h2>
          <p className="text-muted-foreground text-lg">
            Os eventos que não podem ficar de fora da sua agenda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {highlights.map((event) => (
            <article 
              key={event.id} 
              className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-primary/30"
            >
              {/* Event Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={event.image_url || '/placeholder.svg'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {event.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <FavoriteButton eventId={event.id} />
                </div>
              </div>

              {/* Event Info */}
              <div className="p-4 space-y-3">
                <Link 
                  to={`/evento/${event.slug}`}
                  className="block group-hover:text-primary transition-colors"
                >
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {event.title}
                  </h3>
                </Link>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date_start)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue?.name || event.city}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>{formatPrice(event.price_min)}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  {event.ticket_url ? (
                    <Button 
                      asChild 
                      size="sm" 
                      className="w-full"
                    >
                      <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                        <Ticket className="h-4 w-4 mr-2" />
                        Comprar ingressos
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <Link to={`/evento/${event.slug}`}>
                        Ver detalhes
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Ver mais */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/agenda">
              Ver todos os eventos da semana
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}