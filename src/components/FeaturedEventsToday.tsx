import { useRealEvents } from "@/hooks/useUnifiedEvents";
import { adaptEventForCarousel } from "@/lib/eventDataAdapters";
import { EventCardV3 } from "@/components/events/EventCardV3";

export const FeaturedEventsToday = () => {
  const { data: events, isLoading } = useRealEvents({
    featured: true,
    status: 'published',
    limit: 6
  });

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Nenhum evento em destaque</p>
          <p className="text-sm">Novos eventos serão adicionados em breve</p>
        </div>
      </div>
    );
  }

  // Adapt events for carousel
  const carouselEvents = events.map(adaptEventForCarousel);

  return (
    <section className="py-16 bg-gradient-to-br from-accent/20 to-muted/30 relative overflow-hidden border-y border-border/50 shadow-inner">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-foreground text-4xl md:text-5xl mb-6">
            EVENTOS EM DESTAQUE
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto mb-8">
            Seleção de rolês em alta e da Revista ROLÊ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carouselEvents.map((event) => (
            <EventCardV3 key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

