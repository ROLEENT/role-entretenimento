import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import { Music2, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventLineupSectionProps {
  lineup: any[];
  performances: any[];
  visualArtists: any[];
  event?: any; // Adicionar event para fallback
}

export function EventLineupSection({ lineup, performances, visualArtists, event }: EventLineupSectionProps) {
  const hasLineupData = lineup?.length > 0 || performances?.length > 0 || visualArtists?.length > 0;
  const hasEventTags = event?.tags?.length > 0;

  // Se não há dados estruturados E não há tags do evento, não mostrar
  if (!hasLineupData && !hasEventTags) return null;

  const renderArtistCard = (artist: any, isHeadliner = false, role?: string) => (
    <div 
      key={artist.id || artist.stage_name}
      className="flex items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      {/* Artist Avatar */}
      <div className="relative flex-shrink-0 mr-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
          {artist.profile_image_url ? (
            <LazyImage 
              src={artist.profile_image_url} 
              alt={artist.stage_name || artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        {isHeadliner && (
          <div className="absolute -top-1 -right-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          </div>
        )}
      </div>
      
      {/* Artist Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">
          {artist.stage_name || artist.name}
        </h4>
        {role && (
          <p className="text-sm text-muted-foreground">{role}</p>
        )}
        {isHeadliner && (
          <Badge variant="secondary" className="text-xs mt-1">
            Headliner
          </Badge>
        )}
      </div>
      
      {/* Link to Profile */}
      {artist.slug && (
        <Button asChild variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/artistas/${artist.slug}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music2 className="h-5 w-5 text-primary" />
          Lineup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Lineup */}
        {lineup?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Artistas
            </h4>
            {lineup.map((slot) => {
              if (slot.event_lineup_slot_artists?.length > 0) {
                return slot.event_lineup_slot_artists.map((slotArtist: any) => 
                  renderArtistCard(
                    slotArtist.artists, 
                    slotArtist.is_headliner || slot.is_headliner,
                    slot.slot_name !== slotArtist.artists?.stage_name ? slot.slot_name : undefined
                  )
                );
              }
              
              // Fallback for slots without artists
              return (
                <div key={slot.id} className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium">{slot.slot_name}</h4>
                  {slot.description && (
                    <p className="text-sm text-muted-foreground mt-1">{slot.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Performances */}
        {performances?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Performances
            </h4>
            {performances.map((performance, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium">{performance.name}</h4>
                {performance.description && (
                  <p className="text-sm text-muted-foreground mt-1">{performance.description}</p>
                )}
                {performance.type && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {performance.type}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Visual Artists */}
        {visualArtists?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Arte Visual
            </h4>
            {visualArtists.map((artist, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium">{artist.name}</h4>
                {artist.description && (
                  <p className="text-sm text-muted-foreground mt-1">{artist.description}</p>
                )}
                {artist.type && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {artist.type}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fallback: Mostrar artistas das tags quando não há lineup estruturado */}
        {!hasLineupData && hasEventTags && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Artistas do Evento
            </h4>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Este evento apresenta música ao vivo com artistas locais e convidados.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {event.tags
                  ?.filter((tag: string) => !['show', 'festa', 'música ao vivo', 'eletrônica', 'underground'].includes(tag.toLowerCase()))
                  ?.slice(0, 6)
                  ?.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}