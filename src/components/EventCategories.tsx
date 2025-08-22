import { MapPin, Music, Waves, TreePine, Building, Sun, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router-dom";
import saoPauloImage from "@/assets/sao-paulo-events.jpg";
import rioImage from "@/assets/rio-events.jpg";
import curitibaImage from "@/assets/curitiba-events.jpg";
import portoAlegreImage from "@/assets/porto-alegre-events.jpg";
import florianopolisImage from "@/assets/florianopolis-events.jpg";

const EventCategories = () => {
  const cities = [
    {
      name: "Porto Alegre",
      description: "A cena alternativa pulsa forte no Sul.",
      state: "Rio Grande do Sul",
      badge: "08 a 10/agosto",
      icon: Music,
      events: "9 eventos em destaque",
      rating: "4.8",
      link: "/destaques/porto-alegre",
      image: portoAlegreImage
    },
    {
      name: "Florianópolis",
      description: "Beira-mar, eletrônica e coletivo.",
      state: "Santa Catarina", 
      badge: "Hoje",
      icon: Waves,
      events: "9 eventos em destaque",
      rating: "4.9",
      link: "/destaques/florianopolis",
      image: florianopolisImage
    },
    {
      name: "Curitiba",
      description: "Frio na rua, calor nas pistas.",
      state: "Paraná",
      badge: "Amanhã",
      icon: TreePine,
      events: "9 eventos em destaque", 
      rating: "4.2",
      link: "/destaques/curitiba",
      image: curitibaImage
    },
    {
      name: "São Paulo",
      description: "A cidade que nunca dorme... nem para de dançar.",
      state: "São Paulo",
      badge: "Hoje",
      icon: Building,
      events: "11 eventos em destaque",
      rating: "4.7", 
      link: "/destaques/sao-paulo",
      image: saoPauloImage
    },
    {
      name: "Rio de Janeiro",
      description: "Funk, favela, cor e calor cultural.",
      state: "Rio de Janeiro",
      badge: "Sábado",
      icon: Sun,
      events: "9 eventos de destaque",
      rating: "4.6",
      link: "/destaques/rio-de-janeiro",
      image: rioImage
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            DESTAQUES DA SEMANA
          </h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80">
            Ver todos os destaques →
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {cities.map((city) => {
            const IconComponent = city.icon;
            return (
              <Card key={city.name} className="group cursor-pointer hover:shadow-elevated transition-all duration-300">
                <Link to={city.link} className="block">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium z-10">
                      {city.badge}
                    </div>
                    <img 
                      src={city.image}
                      alt={`Cena cultural de ${city.name}`}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-foreground mb-2">{city.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{city.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{city.state}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconComponent className="h-4 w-4 mr-2" />
                        <span>{city.events}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="text-xs">
                        Ler Destaques
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventCategories;