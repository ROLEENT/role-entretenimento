import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Music } from "lucide-react";

const FeaturedEventsToday = () => {
  const todayEvents = [
    {
      id: 1,
      title: "Noite Eletrônica no D-Edge",
      venue: "D-Edge",
      location: "Vila Olímpia, SP",
      time: "22:00",
      genre: "Eletrônica",
      attendees: 1200,
      price: "R$ 80",
      image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
      featured: true
    },
    {
      id: 2,
      title: "Rock in Roll Pub",
      venue: "Pub Rock Station",
      location: "Vila Madalena, SP",
      time: "20:30",
      genre: "Rock",
      attendees: 350,
      price: "R$ 45",
      image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
      featured: false
    },
    {
      id: 3,
      title: "Baile Funk da Quebrada",
      venue: "Casa do Funk",
      location: "Cidade Tiradentes, SP",
      time: "23:00",
      genre: "Funk",
      attendees: 800,
      price: "R$ 25",
      image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
      featured: true
    },
    {
      id: 4,
      title: "Jazz & Blues Night",
      venue: "Blue Note SP",
      location: "Itaim Bibi, SP",
      time: "21:00",
      genre: "Jazz",
      attendees: 180,
      price: "R$ 90",
      image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
      featured: false
    }
  ];

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
                  <span className="text-lg font-bold text-primary">{event.price}</span>
                  <Button size="sm" className="group-hover:bg-primary/90">
                    Ver Evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Ver Todos os Eventos de Hoje
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEventsToday;