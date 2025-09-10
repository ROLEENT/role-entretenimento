import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface VenueMapProps {
  venue: {
    name: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

export function VenueMap({ venue }: VenueMapProps) {
  // For now, show a placeholder map with address info
  // TODO: Integrate with Mapbox when token is configured
  
  if (!venue.address && !venue.city) return null;

  const fullAddress = [venue.address, venue.city].filter(Boolean).join(', ');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">{venue.name}</p>
            <p className="text-sm text-muted-foreground">{fullAddress}</p>
          </div>
          
          {/* TODO: Replace with real map when Mapbox token is available */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">
                Mapa interativo em breve
              </p>
              <p className="text-xs">
                Configuração do Mapbox necessária
              </p>
            </div>
          </div>
          
          {/* Link to external maps */}
          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-center"
            >
              Ver no Google Maps
            </a>
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors text-center"
            >
              Apple Maps
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}