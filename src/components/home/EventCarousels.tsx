import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar, MapPin, ArrowRight, Music, Theater, Palette, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FavoriteButton } from '@/components/FavoriteButton';

interface EventCarouselItem {
  id: string;
  title: string;
  slug: string;
  city: string;
  date_start: string;
  image_url?: string;
  category: string;
  venue?: { name: string } | null;
  price_min?: number;
}

interface CarouselSection {
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  category: string;
  events: EventCarouselItem[];
}

export function EventCarousels() {
  const [carousels, setCarousels] = useState<CarouselSection[]>([
    {
      title: 'Shows & Música',
      icon: Music,
      description: 'Da música eletrônica ao indie nacional',
      category: 'show',
      events: []
    },
    {
      title: 'Teatro & Performance',
      icon: Theater,
      description: 'Espetáculos que transformam e emocionam',
      category: 'teatro',
      events: []
    },
    {
      title: 'Arte & Exposições',
      icon: Palette,
      description: 'Galerias, museus e intervenções urbanas',
      category: 'exposicao',
      events: []
    },
    {
      title: 'Cinema & Audiovisual',
      icon: Camera,
      description: 'Festivais, mostras e sessões especiais',
      category: 'cinema',
      events: []
    }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventsByCategory();
  }, []);

  const fetchEventsByCategory = async () => {
    try {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      const promises = carousels.map(async (carousel) => {
        const { data, error } = await supabase
          .from('events')
          .select(`
            id, title, slug, city, date_start, image_url, category,
            venue:venues(name),
            price_min
          `)
          .eq('status', 'published')
          .ilike('category', `%${carousel.category}%`)
          .gte('date_start', today.toISOString())
          .lte('date_start', nextMonth.toISOString())
          .order('date_start', { ascending: true })
          .limit(8);

        if (error) throw error;
        
        // Transformar dados para o formato correto
        const transformedEvents = (data || []).map(item => ({
          ...item,
          venue: Array.isArray(item.venue) && item.venue.length > 0 ? item.venue[0] : null,
        }));
        
        return { ...carousel, events: transformedEvents };
      });

      const results = await Promise.all(promises);
      setCarousels(results);
    } catch (error) {
      console.error('Erro ao buscar eventos por categoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Grátis';
    return `R$ ${price}`;
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Eventos por Categoria</h2>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                <div className="h-6 bg-muted rounded w-48 animate-pulse" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="w-72 bg-card rounded-xl border animate-pulse">
                    <div className="aspect-video bg-muted rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Filtra apenas carrosséis com eventos
  const populatedCarousels = carousels.filter(carousel => carousel.events.length > 0);

  if (populatedCarousels.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Eventos por Categoria</h2>
          <p className="text-muted-foreground">Em breve, novos eventos organizados por categoria</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Eventos por Categoria</h2>
          <p className="text-muted-foreground text-lg">
            Explore experiências organizadas por área de interesse
          </p>
        </div>

        <div className="space-y-12">
          {populatedCarousels.map((carousel) => {
            const Icon = carousel.icon;
            
            return (
              <div key={carousel.category}>
                {/* Header da seção */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{carousel.title}</h3>
                      <p className="text-muted-foreground text-sm">{carousel.description}</p>
                    </div>
                  </div>
                  
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/agenda?categoria=${carousel.category}`}>
                      Ver todos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                {/* Carrossel de eventos */}
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-4 pb-4">
                    {carousel.events.map((event) => (
                      <article 
                        key={event.id}
                        className="w-72 bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-primary/30 group flex-shrink-0"
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
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                              {formatDate(event.date_start)}
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
                            <h4 className="font-medium text-base line-clamp-2">
                              {event.title}
                            </h4>
                          </Link>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{event.venue?.name || event.city}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span>{formatPrice(event.price_min)}</span>
                              <Badge variant="outline" className="text-xs">
                                {event.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}