import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { useGeolocation } from '@/hooks/useEvents';

interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

interface EventMapProps {
  venues: Venue[];
  onVenueSelect?: (venue: Venue) => void;
}

export const EventMap = ({ venues, onVenueSelect }: EventMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const { location, requestLocation, loading } = useGeolocation();

  // Mock map implementation (replace with real map library like Mapbox/Google Maps)
  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    onVenueSelect?.(venue);
  };

  const requestUserLocation = () => {
    requestLocation();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Locais dos Eventos</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={requestUserLocation}
          disabled={loading}
        >
          <Navigation className="h-4 w-4 mr-2" />
          {loading ? 'Localizando...' : 'Minha Localização'}
        </Button>
      </div>

      {/* Mock map container */}
      <Card className="h-64 bg-muted relative overflow-hidden">
        <div 
          ref={mapContainer} 
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100"
        >
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Mapa Interativo</p>
            <p className="text-xs text-muted-foreground">
              {venues.length} locais encontrados
            </p>
          </div>
        </div>
      </Card>

      {/* Venue list */}
      <div className="grid gap-2 max-h-48 overflow-y-auto">
        {venues.map((venue) => (
          <Card 
            key={venue.id}
            className={`p-3 cursor-pointer transition-colors hover:bg-muted ${
              selectedVenue?.id === venue.id ? 'bg-primary/10 border-primary' : ''
            }`}
            onClick={() => handleVenueClick(venue)}
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{venue.name}</h4>
                <p className="text-xs text-muted-foreground">{venue.address}</p>
                <p className="text-xs text-muted-foreground">
                  {venue.city}, {venue.state}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {location && (
        <Card className="p-3 bg-primary/5 border-primary">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Sua localização</p>
              <p className="text-xs text-muted-foreground">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};