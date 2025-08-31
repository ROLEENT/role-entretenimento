import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHorizontalWheel } from '@/hooks/useHorizontalWheel';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useScrollIndicators } from '@/hooks/useScrollIndicators';
import { AgendaItem } from '@/hooks/useAgendaData';

interface HorizontalCarouselProps {
  items: AgendaItem[];
  title: string;
  isLoading?: boolean;
  className?: string;
}

const EventCard = ({ item }: { item: AgendaItem }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    }).replace('.', '');
  };

  const handlePrefetch = () => {
    // Prefetch the event page on hover/focus
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/agenda/${item.slug || item.id}`;
    document.head.appendChild(link);
  };

  return (
    <Card className="carousel-card overflow-hidden h-full group flex-shrink-0 snap-start w-[82%] sm:w-[48%] md:w-[32%] lg:w-[23%]">
      <Link 
        to={`/agenda/${item.slug || item.id}`}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
      >
        <div className="aspect-[3/2] relative overflow-hidden">
          {item.cover_url ? (
            <picture>
              <source 
                media="(min-width: 768px)"
                srcSet={`${item.cover_url}?w=300&h=200&fit=crop 300w, ${item.cover_url}?w=400&h=267&fit=crop 400w`}
                sizes="(min-width: 1200px) 300px, (min-width: 768px) 250px, 280px"
              />
              <img
                src={`${item.cover_url}?w=280&h=187&fit=crop`}
                alt={item.alt_text || item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-chip text-muted-foreground">
            {item.city} · {item.starts_at ? formatDate(item.starts_at) : 'Data a definir'}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
};

const CarouselSkeleton = () => (
  <div className="carousel-track flex component-spacing overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="carousel-card overflow-hidden h-full flex-shrink-0 snap-start w-[82%] sm:w-[48%] md:w-[32%] lg:w-[23%]">
        <div className="aspect-[3/2] bg-muted animate-pulse" />
        <CardContent className="p-4 space-y-2">
          <div className="h-5 bg-muted animate-pulse rounded" />
          <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const HorizontalCarousel = ({ items, title, isLoading = false, className }: HorizontalCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  
  useHorizontalWheel(trackRef);
  useDragScroll(trackRef);
  const { canScrollLeft, canScrollRight, scrollToLeft, scrollToRight } = useScrollIndicators(trackRef);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (trackRef.current && trackRef.current.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          scrollToLeft();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          scrollToRight();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [scrollToLeft, scrollToRight]);

  if (isLoading) {
    return (
      <section className={cn("section-spacing", className)}>
        <h2 className="text-heading-2 element-spacing">{title}</h2>
        <CarouselSkeleton />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={cn("section-spacing", className)}>
        <h2 className="text-heading-2 element-spacing">{title}</h2>
        <div className="error-state text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-heading-3 mb-2">Nenhum evento encontrado</h3>
          <p className="error-message">Novos eventos serão adicionados em breve.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("section-spacing", className)}>
      <h2 className="text-heading-2 element-spacing">{title}</h2>
      
      <div className="relative carousel-container">
        {/* Fade masks */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Left Arrow */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm shadow-card focus-visible opacity-80 hover:opacity-100 transition-opacity"
            onClick={scrollToLeft}
            aria-label="Eventos anteriores"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm shadow-card focus-visible opacity-80 hover:opacity-100 transition-opacity"
            onClick={scrollToRight}
            aria-label="Próximos eventos"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Carousel Track */}
        <div 
          ref={trackRef}
          className="carousel-track flex component-spacing overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing motion-reduce:scroll-auto"
          role="list"
          aria-label={title}
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {items.map((item) => (
            <div key={item.id} role="listitem">
              <EventCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};