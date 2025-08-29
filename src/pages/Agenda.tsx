import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageWrapper } from '@/components/PageWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgendaData } from '@/hooks/useAgendaData';
import { CounterAnimation } from '@/components/CounterAnimation';

const CITIES = [
  { key: 'porto_alegre', name: 'POA', fullName: 'Porto Alegre' },
  { key: 'curitiba', name: 'CWB', fullName: 'Curitiba' },
  { key: 'florianopolis', name: 'FLN', fullName: 'Florianópolis' },
  { key: 'sao_paulo', name: 'SP', fullName: 'São Paulo' },
  { key: 'rio_de_janeiro', name: 'RIO', fullName: 'Rio de Janeiro' },
];

const EventCard = ({ item, onFocus }: { item: any; onFocus: () => void }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    }).replace('.', '');
  };

  return (
    <Card className="overflow-hidden h-full group">
      <Link 
        to={`/agenda/${item.slug || item.id}`}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
        onFocus={onFocus}
      >
        <div className="aspect-[3/2] relative overflow-hidden">
          {item.cover_url ? (
            <picture>
              <source 
                media="(min-width: 768px)"
                srcSet={`${item.cover_url}?w=400&h=300&fit=crop 400w, ${item.cover_url}?w=600&h=400&fit=crop 600w`}
                sizes="(min-width: 1200px) 400px, (min-width: 768px) 350px, 100vw"
              />
              <img
                src={`${item.cover_url}?w=300&h=200&fit=crop`}
                alt={item.alt_text || item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Calendar className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {item.city} · {item.start_at ? formatDate(item.start_at) : 'Data a definir'}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
};

const EventCardSkeleton = () => (
  <Card className="overflow-hidden h-full">
    <div className="aspect-[3/2] bg-muted animate-pulse" />
    <CardContent className="p-4 space-y-2">
      <div className="h-6 bg-muted animate-pulse rounded" />
      <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
    </CardContent>
  </Card>
);

export default function Agenda() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const { upcomingEvents, cityStats, stats, isLoadingEvents, error, refetch } = useAgendaData();

  const itemsPerSlide = 3;
  const maxSlides = Math.max(0, upcomingEvents.length - itemsPerSlide + 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, maxSlides)) % Math.max(1, maxSlides));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (carouselRef.current && carouselRef.current.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextSlide();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEventCardFocus = (eventId: string) => {
    // Prefetch event details when card receives focus
    // This could be implemented with a prefetch hook if needed
    console.log('Prefetching event:', eventId);
  };

  if (error) {
    return (
      <PageWrapper title="Agenda ROLÊ" description="Agenda cultural atualizada semanalmente">
        <Header />
        <main className="min-h-screen pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar agenda</h1>
            <p className="text-muted-foreground mb-6">Não foi possível carregar os eventos.</p>
            <Button onClick={() => refetch()}>Tentar de novo</Button>
          </div>
        </main>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Agenda ROLÊ" description="Agenda cultural atualizada semanalmente">
      <Header />
      
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="px-4 py-12 bg-gradient-subtle">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Agenda</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Eventos culturais selecionados com curadoria especializada, atualizados semanalmente.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-2 px-4">
                <Calendar className="w-4 h-4" />
                Atualizado semanal
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-2 px-4">
                <MapPin className="w-4 h-4" />
                <CounterAnimation target={stats.totalCities} isLoading={stats.isLoading} /> cidades
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-2 px-4">
                <Users className="w-4 h-4" />
                <CounterAnimation target={stats.totalEvents} isLoading={stats.isLoading} /> eventos
              </Badge>
            </div>
          </div>
        </section>

        {/* Upcoming Events Carousel */}
        <section className="px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Próximos eventos</h2>
            
            {isLoadingEvents ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
                <p className="text-muted-foreground">Novos eventos serão adicionados em breve.</p>
              </div>
            ) : (
              <div className="relative" ref={carouselRef} role="region" aria-label="Carrossel de próximos eventos">
                {/* Carousel */}
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out gap-6"
                    style={{ transform: `translateX(-${currentSlide * (100 / itemsPerSlide)}%)` }}
                  >
                    {upcomingEvents.map((item) => (
                      <div key={item.id} className="flex-none w-full md:w-1/3">
                        <EventCard 
                          item={item} 
                          onFocus={() => handleEventCardFocus(item.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Controls */}
                {maxSlides > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background/90 backdrop-blur-sm"
                      onClick={prevSlide}
                      aria-label="Evento anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background/90 backdrop-blur-sm"
                      onClick={nextSlide}
                      aria-label="Próximo evento"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    {/* Pagination Dots */}
                    <div className="flex justify-center mt-6 space-x-2" role="tablist" aria-label="Navegação do carrossel">
                      {[...Array(maxSlides)].map((_, i) => (
                        <button
                          key={i}
                          role="tab"
                          aria-selected={currentSlide === i}
                          className={cn(
                            "w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            currentSlide === i ? "bg-primary scale-110" : "bg-muted hover:bg-muted-foreground/50"
                          )}
                          onClick={() => goToSlide(i)}
                          aria-label={`Ir para slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Cities Grid */}
        <section className="px-4 py-12 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Agendas por cidade</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CITIES.map((city) => {
                const stats = cityStats.find(s => s.city === city.key);
                const count = stats?.count || 0;
                
                return (
                  <Button
                    key={city.key}
                    variant="outline"
                    className="h-20 flex flex-col justify-center hover:bg-primary/5 transition-colors"
                    asChild
                  >
                    <Link to={`/agenda/cidade/${city.key}`}>
                      <span className="font-semibold text-lg">{city.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} eventos
                      </span>
                    </Link>
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                className="h-20 flex flex-col justify-center hover:bg-primary/5 transition-colors"
                asChild
              >
                <Link to="/agenda/cidade/outras">
                  <span className="font-semibold text-lg">Outras cidades</span>
                  <span className="text-sm text-muted-foreground">Selecionar</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageWrapper>
  );
}