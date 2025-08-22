import { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { eventsData, type Event } from '@/data/eventsData';

interface UserLocation {
  lat: number;
  lng: number;
}

const GeolocationEvents = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<(Event & { distance: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Calculate distances and filter nearby events
        const eventsWithDistance = eventsData
          .filter(event => event.coordinates)
          .map(event => ({
            ...event,
            distance: calculateDistance(
              latitude,
              longitude,
              event.coordinates!.lat,
              event.coordinates!.lng
            )
          }))
          .filter(event => event.distance <= 50) // Within 50km
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 6); // Show top 6 nearest events

        setNearbyEvents(eventsWithDistance);
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite para obter localização';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  useEffect(() => {
    // Auto-request location on component mount
    requestLocation();
  }, []);

  if (error) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={requestLocation}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  if (loading || !userLocation) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Navigation className="h-8 w-8 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Encontrando eventos próximos...</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (nearbyEvents.length === 0) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhum evento encontrado nas proximidades
              </p>
              <Button variant="outline" className="mt-4" onClick={requestLocation}>
                Atualizar localização
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gradient-to-br from-secondary/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Eventos Próximos a Você
            </h2>
            <p className="text-muted-foreground">
              Encontramos {nearbyEvents.length} eventos na sua região
            </p>
          </div>
          <Button variant="outline" onClick={requestLocation} disabled={loading}>
            <Navigation className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyEvents.map((event) => (
            <Card key={event.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm"
                >
                  {event.distance < 1 
                    ? `${Math.round(event.distance * 1000)}m` 
                    : `${event.distance.toFixed(1)}km`
                  }
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}
                  </span>
                  <Button size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GeolocationEvents;