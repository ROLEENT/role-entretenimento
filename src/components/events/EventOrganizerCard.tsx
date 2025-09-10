import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LazyImage from '@/components/LazyImage';
import { Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface EventOrganizerCardProps {
  organizer?: any; // Organizador principal do evento
  venue?: any; // Local como fallback se não há organizador
}

export function EventOrganizerCard({ organizer, venue }: EventOrganizerCardProps) {
  // Debug logs removidos - funcionamento em produção
  
  // Carregar dados do organizador se apenas o ID foi fornecido
  const [organizerData, setOrganizerData] = React.useState<any>(organizer);
  
  React.useEffect(() => {
    if (organizer?.id && !organizer.name) {
      // Se temos apenas o ID, buscar os dados completos
      const fetchOrganizer = async () => {
        try {
          const { data } = await supabase
            .from('organizers')
            .select('id, name, avatar_url, slug')
            .eq('id', organizer.id)
            .single();
          
          if (data) {
            setOrganizerData(data);
          }
        } catch (error) {
          console.error('Error fetching organizer:', error);
        }
      };
      
      fetchOrganizer();
    } else {
      setOrganizerData(organizer);
    }
  }, [organizer]);

  // REGRA CRÍTICA: NUNCA mostrar venue como organizador se há organizador real
  // Apenas mostrar o card se houver um organizador válido
  const hasValidOrganizer = organizerData?.name || organizerData?.id;
  
  if (!hasValidOrganizer) {
    return null;
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Organizado por
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mostrar organizador principal */}
        <div className="flex items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
          {/* Organizer Logo */}
          <div className="flex-shrink-0 mr-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border">
              {organizerData.avatar_url ? (
                <LazyImage 
                  src={organizerData.avatar_url} 
                  alt={organizerData.name}
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
            <h4 className="font-medium truncate">{organizerData.name}</h4>
            <p className="text-sm text-muted-foreground">Organizador</p>
          </div>
          
          {/* Link to Organizer Profile */}
          {organizerData.slug ? (
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Link to={`/perfil/${organizerData.slug}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="w-8 h-8"></div>
          )}
        </div>
        
        {/* Ver todos os eventos do organizador */}
        {organizerData?.slug && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/perfil/${organizerData.slug}`}>
              Ver todos os eventos deste organizador
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}