import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';

interface Event {
  id: string;
  title: string;
  description: string;
  date_start: string;
  city: string;
  state: string;
  price_min: number;
  image_url?: string;
  venue?: {
    name: string;
    address: string;
  };
  categories?: Array<{
    category: {
      name: string;
      color: string;
    };
  }>;
}

const PersonalizedRecommendations = () => {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserPreferences();
      loadRecommendations();
    } else {
      loadPopularEvents();
    }
  }, [isAuthenticated, user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    try {
      // Buscar preferências do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences_json')
        .eq('user_id', user.id)
        .single();

      if (profile?.preferences_json) {
        setUserPreferences(profile.preferences_json);
      }

      // Buscar eventos favoritos para entender preferências
      const { data: favorites } = await supabase
        .from('event_favorites')
        .select(`
          event:events(
            city,
            state,
            categories:event_categories(category:categories(name))
          )
        `)
        .eq('user_id', user.id)
        .limit(10);

      if (favorites && favorites.length > 0) {
        const favoriteCities = [...new Set(
          favorites.map(f => (f as any).event?.city).filter(Boolean)
        )];
        const favoriteCategories = [...new Set(
          favorites.flatMap(f => (f as any).event?.categories?.map((c: any) => c.category.name) || [])
        )];

        setUserPreferences({
          cities: favoriteCities,
          categories: favoriteCategories,
          ...profile?.preferences_json
        });
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          venue:venues(name, address),
          categories:event_categories(category:categories(name, color))
        `)
        .eq('status', 'active')
        .gte('date_start', new Date().toISOString())
        .order('date_start', { ascending: true })
        .limit(6);

      // Se temos preferências do usuário, usar para filtrar
      if (userPreferences) {
        if (userPreferences.cities && userPreferences.cities.length > 0) {
          query = query.in('city', userPreferences.cities);
        }
        
        // TODO: Filtrar por categorias quando disponível
      }

      const { data, error } = await query;

      if (error) throw error;

      setRecommendations(data || []);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      // Fallback para eventos populares
      loadPopularEvents();
    } finally {
      setLoading(false);
    }
  };

  const loadPopularEvents = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(name, address),
          categories:event_categories(category:categories(name, color))
        `)
        .eq('status', 'active')
        .gte('date_start', new Date().toISOString())
        .order('date_start', { ascending: true })
        .limit(6);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos populares:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!recommendations.length && !loading) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {isAuthenticated ? 'Recomendados Para Você' : 'Eventos Populares'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isAuthenticated 
              ? 'Eventos selecionados baseados nas suas preferências e histórico'
              : 'Os eventos mais populares e bem avaliados da nossa plataforma'
            }
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {event.image_url ? (
                    <LazyImage
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  
                  {/* Badge de personalização */}
                  {isAuthenticated && userPreferences?.cities?.includes(event.city) && (
                    <Badge variant="secondary" className="absolute top-2 left-2">
                      <Heart className="h-3 w-3 mr-1" />
                      Sua cidade
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                        {event.title}
                      </h3>
                      
                      {event.categories && event.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {event.categories.slice(0, 2).map((cat, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              style={{
                                backgroundColor: cat.category.color + '20',
                                borderColor: cat.category.color + '40',
                                color: cat.category.color
                              }}
                              className="text-xs"
                            >
                              {cat.category.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.date_start), "dd MMM", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(event.date_start), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {event.venue?.name || 'Local a definir'}, {event.city}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-semibold text-primary">
                        {event.price_min === 0 ? 'Gratuito' : `R$ ${event.price_min}`}
                      </span>
                      
                      <Button asChild size="sm">
                        <Link to={`/evento/${event.id}`} className="inline-flex items-center justify-center">
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link to="/eventos" className="inline-flex items-center justify-center">
              Ver Todos os Eventos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;