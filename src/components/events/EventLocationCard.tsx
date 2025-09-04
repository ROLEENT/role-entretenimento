import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventLocationCardProps {
  event: any;
  venue?: any;
}

export function EventLocationCard({ event, venue }: EventLocationCardProps) {
  const location = venue || {
    name: event.location_name,
    address: event.address,
    city: event.city,
    neighborhood: event.neighborhood
  };

  const getFullAddress = () => {
    const parts = [];
    
    if (location.address) parts.push(location.address);
    if (location.neighborhood) parts.push(location.neighborhood);
    if (location.city) parts.push(location.city);
    
    return parts.join(', ');
  };

  const fullAddress = getFullAddress();

  const handleOpenMaps = () => {
    if (venue?.latitude && venue?.longitude) {
      // Use coordinates if available
      const mapsUrl = `https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`;
      window.open(mapsUrl, '_blank');
    } else if (fullAddress) {
      // Fallback to address search
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5 text-primary" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Venue Name */}
        {location.name && (
          <div>
            {venue?.slug ? (
              <Link 
                to={`/venues/${venue.slug}`}
                className="font-medium hover:text-primary transition-colors cursor-pointer"
              >
                {location.name}
              </Link>
            ) : (
              <h4 className="font-medium">{location.name}</h4>
            )}
          </div>
        )}
        
        {/* Address */}
        {fullAddress && (
          <div className="text-sm text-muted-foreground">
            <p>{fullAddress}</p>
          </div>
        )}
        
        {/* Opening Hours */}
        {venue?.opening_hours && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{venue.opening_hours}</span>
          </div>
        )}
        
        {/* Map Embed - Simple placeholder for now */}
        {venue?.latitude && venue?.longitude && (
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Mapa do local</p>
            </div>
          </div>
        )}
        
        {/* Open in Maps Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenMaps}
          className="w-full"
          disabled={!fullAddress && (!venue?.latitude || !venue?.longitude)}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir no Google Maps
        </Button>
      </CardContent>
    </Card>
  );
}