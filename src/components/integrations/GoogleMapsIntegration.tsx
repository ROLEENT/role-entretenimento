import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Car, 
  Bus, 
  Train, 
  ExternalLink,
  Share2,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';

interface LocationData {
  address: string;
  lat?: number;
  lng?: number;
  city: string;
  state: string;
  venue_name?: string;
}

interface GoogleMapsIntegrationProps {
  location: LocationData;
  eventTitle: string;
  eventDate: string;
  className?: string;
}

interface DirectionsResult {
  distance: string;
  duration: string;
  mode: 'driving' | 'walking' | 'transit';
}

export function GoogleMapsIntegration({ 
  location, 
  eventTitle, 
  eventDate, 
  className = "" 
}: GoogleMapsIntegrationProps) {
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [directions, setDirections] = useState<DirectionsResult[]>([]);
  const [loading, setLoading] = useState(false);

  const { address, lat, lng, city, state, venue_name } = location;

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position);
          toast.success('Localização obtida com sucesso!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Não foi possível obter sua localização');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      toast.error('Geolocalização não é suportada pelo seu navegador');
    }
  }, []);

  // Generate Google Maps URLs
  const generateMapsUrl = (action: 'view' | 'directions' | 'search' = 'view') => {
    const destination = `${venue_name || ''} ${address}, ${city}, ${state}`.trim();
    const encodedDestination = encodeURIComponent(destination);
    
    switch (action) {
      case 'directions':
        if (userLocation) {
          const origin = `${userLocation.coords.latitude},${userLocation.coords.longitude}`;
          return `https://www.google.com/maps/dir/${origin}/${encodedDestination}`;
        }
        return `https://www.google.com/maps/dir//${encodedDestination}`;
      
      case 'search':
        return `https://www.google.com/maps/search/${encodedDestination}`;
      
      default:
        if (lat && lng) {
          return `https://www.google.com/maps/@${lat},${lng},17z`;
        }
        return `https://www.google.com/maps/search/${encodedDestination}`;
    }
  };

  // Generate Waze URL
  const generateWazeUrl = () => {
    if (lat && lng) {
      return `https://www.waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
    }
    const destination = `${address}, ${city}, ${state}`;
    return `https://www.waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;
  };

  // Mock directions calculation (would use Google Directions API in production)
  const calculateDirections = useCallback(async () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock directions data
      const mockDirections: DirectionsResult[] = [
        { distance: '12.5 km', duration: '18 min', mode: 'driving' },
        { distance: '14.2 km', duration: '45 min', mode: 'transit' },
        { distance: '8.3 km', duration: '1h 40min', mode: 'walking' }
      ];
      
      setDirections(mockDirections);
      toast.success('Direções calculadas!');
    } catch (error) {
      toast.error('Erro ao calcular direções');
    } finally {
      setLoading(false);
    }
  }, [userLocation, getUserLocation]);

  // Share location
  const shareLocation = async () => {
    const shareData = {
      title: `Localização: ${eventTitle}`,
      text: `${venue_name || 'Evento'} - ${address}, ${city}`,
      url: generateMapsUrl('view')
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast.success('Localização copiada para a área de transferência!');
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast.success('Localização copiada para a área de transferência!');
    }
  };

  // Save to Google Calendar with location
  const saveToCalendar = () => {
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // +3 hours
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventTitle,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      location: `${venue_name || ''} ${address}, ${city}, ${state}`.trim(),
      details: `Evento: ${eventTitle}\nLocal: ${venue_name || ''}\nEndereço: ${address}, ${city}, ${state}`
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return <Car className="h-4 w-4" />;
      case 'transit': return <Bus className="h-4 w-4" />;
      case 'walking': return <Navigation className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getTransportLabel = (mode: string) => {
    switch (mode) {
      case 'driving': return 'Carro';
      case 'transit': return 'Transporte Público';
      case 'walking': return 'Caminhada';
      default: return 'Desconhecido';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localização e Direções
        </CardTitle>
        <CardDescription>
          Encontre o melhor caminho para chegar ao evento
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Location Info */}
        <div className="space-y-2">
          {venue_name && (
            <h4 className="font-medium text-lg">{venue_name}</h4>
          )}
          <p className="text-muted-foreground">
            {address}, {city} - {state}
          </p>
          {lat && lng && (
            <p className="text-sm text-muted-foreground">
              Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(generateMapsUrl('view'), '_blank')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Ver no Maps
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(generateMapsUrl('directions'), '_blank')}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Como Chegar
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(generateWazeUrl(), '_blank')}
          >
            Waze
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <Separator />

        {/* Directions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Direções</h4>
            <Button 
              size="sm" 
              variant="outline"
              onClick={calculateDirections}
              disabled={loading}
            >
              {loading ? 'Calculando...' : 'Calcular Rota'}
            </Button>
          </div>

          {!userLocation && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📍 Permita o acesso à sua localização para ver direções personalizadas
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={getUserLocation}
              >
                Permitir Localização
              </Button>
            </div>
          )}

          {directions.length > 0 && (
            <div className="grid gap-3">
              {directions.map((direction, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransportIcon(direction.mode)}
                    <div>
                      <p className="font-medium">
                        {getTransportLabel(direction.mode)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {direction.distance} • {direction.duration}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(generateMapsUrl('directions'), '_blank')}
                  >
                    Iniciar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Additional Actions */}
        <div className="space-y-3">
          <h4 className="font-medium">Ações Adicionais</h4>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={shareLocation}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar Local
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={saveToCalendar}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Salvar no Calendário
            </Button>
          </div>
        </div>

        {/* Transportation Tips */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h5 className="font-medium mb-2">🚗 Dicas de Transporte</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Verifique o trânsito antes de sair</li>
            <li>• Considere transporte público nos horários de pico</li>
            <li>• Procure por estacionamentos próximos antecipadamente</li>
            <li>• Use apps como Uber/99 para maior comodidade</li>
          </ul>
        </div>

        {/* Embed Map Preview */}
        {lat && lng && (
          <div className="space-y-2">
            <h4 className="font-medium">Mapa</h4>
            <div className="aspect-video rounded-lg overflow-hidden border">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}&zoom=15`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa do local: ${venue_name || address}`}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Clique no mapa para abrir no Google Maps
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}