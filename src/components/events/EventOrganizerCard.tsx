import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LazyImage from '@/components/LazyImage';
import { Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventOrganizerCardProps {
  organizer?: any; // Organizador principal do evento
  venue?: any; // Local como fallback se não há organizador
}

export function EventOrganizerCard({ organizer, venue }: EventOrganizerCardProps) {
  // Se não há organizador nem venue, não mostrar o card
  if (!organizer && !venue) return null;

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Organizado por
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mostrar organizador principal se existir */}
        {organizer && (
          <div className="flex items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
            {/* Organizer Logo */}
            <div className="flex-shrink-0 mr-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border">
                {organizer.avatar_url ? (
                  <LazyImage 
                    src={organizer.avatar_url} 
                    alt={organizer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Organizer Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{organizer.name}</h4>
              <p className="text-sm text-muted-foreground">Organizador</p>
            </div>
            
            {/* Link to Organizer Profile */}
            {organizer.slug ? (
              <Button 
                asChild 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Link to={`/perfil/${organizer.slug}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>
        )}

        {/* Fallback: Mostrar venue como organizador se não há organizador */}
        {!organizer && venue && (
          <div className="flex items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
            {/* Venue Logo */}
            <div className="flex-shrink-0 mr-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border">
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            {/* Venue Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{venue.name}</h4>
              <p className="text-sm text-muted-foreground">Local</p>
            </div>
            
            {/* Link to Venue Profile */}
            {venue.slug ? (
              <Button 
                asChild 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Link to={`/perfil/${venue.slug}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>
        )}
        
        {/* Ver todos os eventos do organizador */}
        {organizer?.slug && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/perfil/${organizer.slug}`}>
              Ver todos os eventos deste organizador
            </Link>
          </Button>
        )}
        
        {/* Ver todos os eventos do local (fallback) */}
        {!organizer && venue?.slug && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/perfil/${venue.slug}`}>
              Ver todos os eventos deste local
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}