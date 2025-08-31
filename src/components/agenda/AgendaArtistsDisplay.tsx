import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Music } from 'lucide-react';

interface AgendaArtistsDisplayProps {
  registeredArtists?: Array<{
    id: string;
    stage_name: string;
    profile_image_url?: string;
  }>;
  extraArtists?: string[];
  maxDisplay?: number;
  showImages?: boolean;
  compact?: boolean;
}

export function AgendaArtistsDisplay({
  registeredArtists = [],
  extraArtists = [],
  maxDisplay = 5,
  showImages = false,
  compact = false
}: AgendaArtistsDisplayProps) {
  const totalArtists = registeredArtists.length + extraArtists.length;
  
  if (totalArtists === 0) {
    return null;
  }

  const displayedRegistered = registeredArtists.slice(0, maxDisplay);
  const remainingRegistered = Math.max(0, registeredArtists.length - maxDisplay);
  
  const availableSlots = maxDisplay - displayedRegistered.length;
  const displayedExtra = extraArtists.slice(0, availableSlots);
  const remainingExtra = Math.max(0, extraArtists.length - availableSlots);
  
  const totalRemaining = remainingRegistered + remainingExtra;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Music className="h-4 w-4" />
        <span>
          {totalArtists} artista{totalArtists > 1 ? 's' : ''}
          {registeredArtists.length > 0 && extraArtists.length > 0 && 
            ` (${registeredArtists.length} cadastrados, ${extraArtists.length} extras)`
          }
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Music className="h-4 w-4" />
        Artistas
      </div>
      
      <div className="flex flex-wrap gap-1">
        {/* Artistas cadastrados */}
        {displayedRegistered.map((artist) => (
          <Badge 
            key={artist.id} 
            variant="default"
            className="flex items-center gap-1"
          >
            {showImages && artist.profile_image_url && (
              <img 
                src={artist.profile_image_url} 
                alt={artist.stage_name}
                className="w-4 h-4 rounded-full object-cover"
              />
            )}
            {artist.stage_name}
          </Badge>
        ))}

        {/* Artistas extras */}
        {displayedExtra.map((name, index) => (
          <Badge 
            key={`extra-${index}`} 
            variant="secondary"
          >
            {name}
          </Badge>
        ))}

        {/* Indicador de mais artistas */}
        {totalRemaining > 0 && (
          <Badge variant="outline">
            +{totalRemaining} mais
          </Badge>
        )}
      </div>

      {/* Legenda para diferenciação */}
      {registeredArtists.length > 0 && extraArtists.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="inline-block w-3 h-3 bg-primary rounded mr-1"></span>
          Cadastrados
          <span className="inline-block w-3 h-3 bg-secondary rounded mr-1 ml-3"></span>
          Extras
        </div>
      )}
    </div>
  );
}