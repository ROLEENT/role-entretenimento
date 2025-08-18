import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Star, Calendar, ArrowRight } from "lucide-react";

const FeaturedHighlights = () => {
  const highlights = [
    {
      id: 1,
      city: "Porto Alegre",
      description: "A cena alternativa pulsa forte no Sul.",
      state: "Rio Grande do Sul",
      events: 9,
      rating: 4.8,
      date: "08 a 10/agosto",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      href: "#poa"
    },
    {
      id: 2,
      city: "Florianópolis",
      description: "Beira-mar, eletrônica e coletivo.",
      state: "Santa Catarina", 
      events: 9,
      rating: 4.9,
      date: "Hoje",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      href: "#floripa"
    },
    {
      id: 3,
      city: "Curitiba",
      description: "Vida noturna vibrante e arte urbana.",
      state: "Paraná",
      events: 7,
      rating: 4.7,
      date: "Amanhã",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      href: "#curitiba"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Destaques da Semana
          </h2>
          <Button variant="outline" className="rounded-full">
            Ver todos os destaques
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((highlight) => (
            <Card
              key={highlight.id}
              className="group overflow-hidden bg-gradient-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 border-0"
            >
              <div className="relative overflow-hidden">
                <img
                  src={highlight.image}
                  alt={`Cena cultural de ${highlight.city}`}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {highlight.date}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {highlight.city}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{highlight.rating}</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{highlight.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {highlight.state}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    🎸 {highlight.events} eventos em destaque
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium rounded-full"
                  asChild
                >
                  <a href={highlight.href}>
                    Ler Destaques
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedHighlights;