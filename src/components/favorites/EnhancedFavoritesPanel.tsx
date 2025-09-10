import { useState } from 'react';
import { Heart, Calendar, MapPin, Users, Building, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';
import EventCard from '@/components/EventCard';
import { Link } from 'react-router-dom';

interface EnhancedFavoritesPanelProps {
  className?: string;
}

export function EnhancedFavoritesPanel({ className }: EnhancedFavoritesPanelProps) {
  const { favorites, loading } = useFavorites();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Organizar favoritos por categoria
  const organizeFavorites = () => {
    const events = favorites.filter(fav => fav.type === 'event' || !fav.type);
    const artists = favorites.filter(fav => fav.type === 'artist');
    const venues = favorites.filter(fav => fav.type === 'venue');
    const organizers = favorites.filter(fav => fav.type === 'organizer');

    return { events, artists, venues, organizers };
  };

  const { events, artists, venues, organizers } = organizeFavorites();

  // Estados vazios no tom ROLÊ
  const EmptyState = ({ type }: { type: string }) => {
    const messages = {
      events: {
        icon: Calendar,
        title: 'Nenhum evento salvo ainda',
        description: 'Que tal salvar alguns eventos da sua cidade?',
        action: 'Explorar eventos',
        href: '/agenda'
      },
      artists: {
        icon: Users,
        title: 'Nenhum artista seguido',
        description: 'Siga seus artistas favoritos para não perder nenhum show',
        action: 'Descobrir artistas',
        href: '/artistas'
      },
      venues: {
        icon: Building,
        title: 'Nenhum local salvo',
        description: 'Salve os locais que você mais curte frequentar',
        action: 'Explorar locais',
        href: '/locais'
      },
      organizers: {
        icon: Users,
        title: 'Nenhum organizador seguido',
        description: 'Acompanhe os organizadores que fazem a diferença',
        action: 'Descobrir organizadores',
        href: '/organizadores'
      }
    };

    const config = messages[type as keyof typeof messages];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className="text-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{config.title}</h3>
        <p className="text-muted-foreground mb-4">{config.description}</p>
        <Button asChild variant="outline">
          <Link to={config.href}>{config.action}</Link>
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Meus Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando seus favoritos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalFavorites = favorites.length;

  if (totalFavorites === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Meus Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-medium mb-3">Nada por aqui… ainda!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Sua lista de favoritos está vazia. Clique no ❤️ em eventos, artistas, locais ou organizadores para salvá-los aqui.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/agenda">Explorar eventos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/artistas">Descobrir artistas</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-primary text-primary" />
            Meus Favoritos
            <Badge variant="secondary" className="ml-2">
              {totalFavorites}
            </Badge>
          </CardTitle>
          
          {/* Controles de visualização */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events" className="text-xs sm:text-sm">
              Eventos
              {events.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {events.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="artists" className="text-xs sm:text-sm">
              Artistas
              {artists.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {artists.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="venues" className="text-xs sm:text-sm">
              Locais
              {venues.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {venues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="organizers" className="text-xs sm:text-sm">
              Organizadores
              {organizers.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {organizers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Eventos */}
          <TabsContent value="events" className="space-y-4">
            {events.length === 0 ? (
              <EmptyState type="events" />
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={{ ...event, price: event.price || 0 }}
                    className="h-fit"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Artistas */}
          <TabsContent value="artists" className="space-y-4">
            {artists.length === 0 ? (
              <EmptyState type="artists" />
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {artists.map((artist) => (
                  <Card key={artist.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{artist.title}</h3>
                          <p className="text-sm text-muted-foreground">{artist.category}</p>
                          {artist.city && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{artist.city}</span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/artista/${artist.id}`}>Ver perfil</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Locais */}
          <TabsContent value="venues" className="space-y-4">
            {venues.length === 0 ? (
              <EmptyState type="venues" />
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {venues.map((venue) => (
                  <Card key={venue.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/60 rounded-full flex items-center justify-center">
                          <Building className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{venue.title}</h3>
                          <p className="text-sm text-muted-foreground">{venue.category}</p>
                          {venue.city && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{venue.city}</span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/local/${venue.id}`}>Ver perfil</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Organizadores */}
          <TabsContent value="organizers" className="space-y-4">
            {organizers.length === 0 ? (
              <EmptyState type="organizers" />
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {organizers.map((organizer) => (
                  <Card key={organizer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{organizer.title}</h3>
                          <p className="text-sm text-muted-foreground">{organizer.category}</p>
                          {organizer.city && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{organizer.city}</span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/organizador/${organizer.id}`}>Ver perfil</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Ação final */}
        {totalFavorites > 0 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-3">
              💡 <strong>Dica:</strong> Ative os alertas para ser avisado sobre novos eventos dos seus favoritos
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/conta/alertas">Configurar alertas</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}