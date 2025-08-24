import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { eventsData } from "@/data/eventsData";

const FeaturedEventsToday = () => {
  // Get today's events
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = eventsData
    .filter(event => event.date === today)
    .slice(0, 4);

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Eventos em Destaque Hoje
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Os melhores eventos acontecendo hoje na sua cidade. Não perca!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {todayEvents.map((event) => (
            <Card 
              key={event.id} 
              className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                event.featured ? 'ring-2 ring-primary/20 bg-primary/5' : ''
              }`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {event.featured && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                    Destaque
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-full text-xs font-medium">
                  {event.genre}
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} interessados</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}
                  </span>
                  <Button size="sm" className="group-hover:bg-primary/90">
                    Ver Evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link to="/eventos/hoje">
              Ver Todos os Eventos de Hoje
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEventsToday;