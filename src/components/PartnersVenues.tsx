import { useState, useEffect } from "react";
import { MapPin, Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const PartnersVenues = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching partners:', error);
          return;
        }

        setPartners(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Carregando parceiros...</div>
          </div>
        </div>
      </section>
    );
  }

  // Usar apenas dados do Supabase, sem dados mockados

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Nossos Parceiros
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Casas noturnas e espaços culturais que confiam no ROLÊ para divulgar seus eventos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((venue, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 bg-card border-border overflow-hidden">
              <div className="relative">
                <img 
                  src={venue.image_url || "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png"} 
                  alt={venue.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {venue.featured && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    Destaque
                  </Badge>
                )}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">{venue.rating}</span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 text-foreground">{venue.name}</h3>
                
                <div className="flex items-center text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{venue.location}</span>
                </div>

                <div className="flex items-center text-muted-foreground mb-3">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">{venue.capacity}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {venue.types.map((type, typeIndex) => (
                    <Badge key={typeIndex} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Quer ser nosso parceiro?
          </p>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Cadastre seu espaço
          </button>
        </div>
      </div>
    </section>
  );
};

export default PartnersVenues;