import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LazyImage from '@/components/LazyImage';
import { Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventOrganizerCardProps {
  partners: any[];
  venue?: any; // Adicionar venue como fallback
}

export function EventOrganizerCard({ partners, venue }: EventOrganizerCardProps) {
  // Se não há partners mas há venue, mostrar venue como organizador
  if ((!partners || partners.length === 0) && !venue) return null;

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Organizado por
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mostrar partners relacionais se existirem */}
        {partners && partners.length > 0 && partners.map((partnerData) => {
          const partner = partnerData.partners;
          if (!partner) return null;
          
          return (
            <div 
              key={partner.id}
              className="flex items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Organizer Logo */}
              <div className="flex-shrink-0 mr-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border">
                  {partner.image_url ? (
                    <LazyImage 
                      src={partner.image_url} 
                      alt={partner.name}
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
                <h4 className="font-medium truncate">{partner.name}</h4>
                {partnerData.role && partnerData.role !== 'organizer' && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {partnerData.role}
                  </p>
                )}
              </div>
              
              {/* Link to Profile */}
              {partner.slug && (
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Link to={`/organizadores/${partner.slug}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          );
        })}

        {/* Fallback: Mostrar venue como organizador se não há partners */}
        {(!partners || partners.length === 0) && venue && (
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
            {venue.slug && (
              <Button 
                asChild 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Link to={`/venues/${venue.slug}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
        
        {/* Ver todos os eventos deste organizador/venue */}
        {partners && partners.length === 1 && partners[0].partners?.slug && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/organizadores/${partners[0].partners.slug}`}>
              Ver todos os eventos deste produtor
            </Link>
          </Button>
        )}
        
        {(!partners || partners.length === 0) && venue?.slug && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/venues/${venue.slug}`}>
              Ver todos os eventos deste local
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}