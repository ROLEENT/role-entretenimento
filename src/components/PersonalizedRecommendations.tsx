import { useState, useEffect } from 'react';
import { Heart, Music, MapPin, Calendar, Sparkles, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeeklyEvent } from '@/data/weeklyData';
import { useFavorites } from '@/hooks/useFavorites';

interface PersonalizedRecommendationsProps {
  allEvents: WeeklyEvent[];
  onEventSelect?: (event: WeeklyEvent) => void;
}

interface UserPreferences {
  favoriteGenres: string[];
  favoriteVenues: string[];
  priceRange: { min: number; max: number };
  preferredDays: string[];
  location: string;
}

const PersonalizedRecommendations = ({ allEvents, onEventSelect }: PersonalizedRecommendationsProps) => {
  const { favorites } = useFavorites();
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteGenres: [],
    favoriteVenues: [],
    priceRange: { min: 0, max: 1000 },
    preferredDays: [],
    location: 'São Paulo'
  });

  // Analyze user preferences based on favorites
  useEffect(() => {
    if (favorites.length > 0) {
      const genres = favorites.map(fav => fav.category).filter(Boolean);
      const uniqueGenres = [...new Set(genres)];
      
      setUserPreferences(prev => ({
        ...prev,
        favoriteGenres: uniqueGenres.slice(0, 3) // Top 3 genres
      }));
    }
  }, [favorites]);

  // Calculate recommendation score for each event
  const getRecommendationScore = (event: WeeklyEvent): number => {
    let score = 0;

    // Genre preference (40% weight)
    if (userPreferences.favoriteGenres.includes(event.category)) {
      score += 40;
    }

    // Price preference (20% weight)
    const priceScore = event.price >= userPreferences.priceRange.min && 
                      event.price <= userPreferences.priceRange.max ? 20 : 0;
    score += priceScore;

    // Trending factor (20% weight)
    score += (event.trendingScore / 100) * 20;

    // Popularity factor (10% weight)
    const popularityScore = Math.min((event.attendees / 1000) * 10, 10);
    score += popularityScore;

    // Location preference (10% weight)
    if (event.city === userPreferences.location) {
      score += 10;
    }

    return Math.round(score);
  };

  // Get recommendations
  const recommendations = allEvents
    .map(event => ({
      ...event,
      recommendationScore: getRecommendationScore(event)
    }))
    .filter(event => event.recommendationScore > 30)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 6);

  const getRecommendationReason = (event: WeeklyEvent & { recommendationScore: number }): string => {
    const reasons = [];
    
    if (userPreferences.favoriteGenres.includes(event.category)) {
      reasons.push(`Você curte ${event.category}`);
    }
    
    if (event.trendingScore > 80) {
      reasons.push('Evento em alta');
    }
    
    if (event.price === 0) {
      reasons.push('Evento gratuito');
    } else if (event.price <= 50) {
      reasons.push('Preço acessível');
    }
    
    if (event.city === userPreferences.location) {
      reasons.push('Na sua cidade');
    }
    
    if (event.attendees > 1000) {
      reasons.push('Muito procurado');
    }

    return reasons.slice(0, 2).join(' • ') || 'Recomendado para você';
  };

  const recommendationCategories = [
    {
      title: 'Para Você',
      description: 'Baseado no seu histórico',
      events: recommendations.slice(0, 3),
      icon: User,
      color: 'text-blue-500'
    },
    {
      title: 'Trending e Você',
      description: 'Em alta e do seu gosto',
      events: recommendations.filter(e => e.trending).slice(0, 2),
      icon: Sparkles,
      color: 'text-purple-500'
    },
    {
      title: 'Favoritos Similares',
      description: 'Baseado nos seus favoritos',
      events: recommendations.filter(e => 
        userPreferences.favoriteGenres.includes(e.category)
      ).slice(0, 2),
      icon: Heart,
      color: 'text-red-500'
    }
  ];

  if (recommendations.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Personalize suas Recomendações
              </h3>
              <p className="text-muted-foreground mb-6">
                Favorite alguns eventos para recebermos recomendações personalizadas
              </p>
              <Button>Explorar Eventos</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-500" />
            Recomendado para Você
          </h2>
          <p className="text-muted-foreground">
            Eventos selecionados especialmente baseados nos seus gostos
          </p>
        </div>

        {/* User Preferences Display */}
        {userPreferences.favoriteGenres.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Seus gêneros:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userPreferences.favoriteGenres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userPreferences.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendation Categories */}
        <div className="space-y-8">
          {recommendationCategories.map((category) => {
            if (category.events.length === 0) return null;
            
            const IconComponent = category.icon;
            
            return (
              <div key={category.title}>
                <div className="flex items-center gap-3 mb-4">
                  <IconComponent className={`h-6 w-6 ${category.color}`} />
                  <div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.events.map((event) => (
                    <Card 
                      key={event.id} 
                      className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => onEventSelect?.(event)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Recommendation Score */}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500 text-white">
                            {event.recommendationScore}% match
                          </Badge>
                        </div>

                        {/* Special Badges */}
                        <div className="absolute top-2 left-2">
                          {event.trending && (
                            <Badge variant="destructive" className="mb-1">
                              Trending
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h4>
                        
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}, {event.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date} • {event.time}</span>
                          </div>
                        </div>

                        {/* Recommendation Reason */}
                        <div className="mb-4">
                          <p className="text-xs text-primary font-medium">
                            {getRecommendationReason(event)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}
                          </span>
                          <Button size="sm">
                            Ver Evento
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Improve Recommendations CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Melhore suas Recomendações
            </h3>
            <p className="text-muted-foreground mb-4">
              Quanto mais você usa o app, melhores ficam nossas sugestões
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Favoritar Mais Eventos
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Atualizar Preferências
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;