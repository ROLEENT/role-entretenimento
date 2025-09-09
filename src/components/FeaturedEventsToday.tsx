import { useAgendaEvents, resolveCoverImageUrl } from "@/hooks/useAgendaEvents";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";

export const FeaturedEventsToday = () => {
  const { data: events, isLoading } = useAgendaEvents();

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
            EVENTOS EM ALTA
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto mb-8">
            Seleção de eventos em destaque pela curadoria ROLÊ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="group relative bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all duration-300">
              {/* Event Cover Image */}
              <div className="relative h-[220px] overflow-hidden">
                <img
                  src={resolveCoverImageUrl(event)}
                  alt={event.cover_alt || `Imagem do evento ${event.title}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Event Content */}
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>
                    {formatDate(new Date(event.starts_at), "dd 'de' MMM", { locale: ptBR })}
                  </span>
                  <span>{event.city}</span>
                </div>
                
                <a 
                  href={`/agenda/${event.slug}`}
                  className="block group-hover:text-primary transition-colors duration-200"
                >
                  <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

