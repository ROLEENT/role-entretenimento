import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdvertisementBanner = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('active', true as any)
          .order('position', { ascending: true });

        if (error) {
          console.error('Error fetching advertisements:', error);
          return;
        }

        setAdvertisements(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Carregando anúncios...</div>
          </div>
        </div>
      </section>
    );
  }

  const cardAds = advertisements.filter(ad => ad.type === 'card');
  const newsletterAds = advertisements.filter(ad => ad.type === 'newsletter');

  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Banner Principal - Evento Patrocinado */}
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 border-primary/20">
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                Evento Patrocinado
              </Badge>
            </div>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">4.9</span>
            </div>
            
            <div className="relative h-64 overflow-hidden">
              <img
                src="/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png"
                alt="Festival de Verão 2024"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-bold mb-2">Festival de Verão 2024</h3>
                <div className="flex items-center gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>15-17 Dezembro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>50k pessoas</span>
                  </div>
                </div>
                <Button size="sm" className="bg-white text-primary hover:bg-white/90">
                  Comprar Ingressos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Banners Menores */}
          <div className="space-y-6">
            {cardAds.map((ad, index) => (
              <Card 
                key={ad.id} 
                className="text-white border-0 overflow-hidden"
                style={{
                  background: `linear-gradient(to right, ${ad.gradient_from}, ${ad.gradient_to})`
                }}
              >
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="relative z-10">
                    <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                      {ad.badge_text}
                    </Badge>
                    <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
                    <p className="text-white/90 text-sm mb-4">
                      {ad.description}
                    </p>
                    <Button variant="secondary" size="sm" className="bg-white text-primary hover:bg-white/90">
                      {ad.cta_text}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Banners de Newsletter */}
        {newsletterAds.map((ad) => (
          <Card 
            key={ad.id}
            className="mt-8 text-white border-0"
            style={{
              background: `linear-gradient(to right, ${ad.gradient_from}, ${ad.gradient_to})`
            }}
          >
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                    {ad.badge_text}
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">{ad.title}</h3>
                  <p className="text-white/90 max-w-md">
                    {ad.description}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                    {ad.cta_text}
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    Saber Mais
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AdvertisementBanner;