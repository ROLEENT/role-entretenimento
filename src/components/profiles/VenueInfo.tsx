import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Clock, Wifi, Car, Accessibility } from 'lucide-react';
import { Profile } from '@/features/profiles/api';

interface VenueInfoProps {
  profile: Profile;
}

export function VenueInfo({ profile }: VenueInfoProps) {
  // Mock venue data - replace with real venue-specific data
  const venueData = {
    capacity: '500 pessoas',
    hours: 'Qui - Sáb: 22h às 04h',
    amenities: ['Wi-Fi Gratuito', 'Estacionamento', 'Acessível'],
    musicGenres: ['Electronic', 'House', 'Techno']
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Local</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.bio && (
            <div className="prose prose-sm max-w-none mb-6">
              {profile.bio.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Capacidade: {venueData.capacity}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{venueData.hours}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Comodidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {venueData.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                {amenity === 'Wi-Fi Gratuito' && <Wifi className="h-3 w-3" />}
                {amenity === 'Estacionamento' && <Car className="h-3 w-3" />}
                {amenity === 'Acessível' && <Accessibility className="h-3 w-3" />}
                {amenity}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {profile.tags && profile.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gêneros Musicais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}