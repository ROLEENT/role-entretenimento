import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ArtistEventsProps {
  artistId: string;
}

// Mock data - replace with real API calls
const mockEvents = {
  upcoming: [
    {
      id: '1',
      title: 'Festival de Música Eletrônica',
      date: new Date('2024-03-15T22:00:00'),
      venue: 'Allianz Parque',
      city: 'São Paulo',
      image: '/placeholder.svg',
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Noite Underground',
      date: new Date('2024-03-22T23:00:00'),
      venue: 'Clube Xxxxx',
      city: 'São Paulo',
      image: '/placeholder.svg',
      status: 'confirmed'
    }
  ],
  past: [
    {
      id: '3',
      title: 'Festa de Ano Novo',
      date: new Date('2023-12-31T23:00:00'),
      venue: 'Club XYZ',
      city: 'São Paulo',
      image: '/placeholder.svg',
      status: 'completed'
    }
  ]
};

export function ArtistEvents({ artistId }: ArtistEventsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const renderEvent = (event: any) => (
    <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium truncate">{event.title}</h3>
              <Badge 
                variant={event.status === 'confirmed' ? 'default' : 'secondary'}
                className="text-xs flex-shrink-0"
              >
                {event.status === 'confirmed' ? 'Confirmado' : 'Realizado'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(event.date, 'dd MMM', { locale: ptBR })}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(event.date, 'HH:mm')}
              </div>
              
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.venue}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Próximos ({mockEvents.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Passados ({mockEvents.past.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {mockEvents.upcoming.length > 0 ? (
              mockEvents.upcoming.map(renderEvent)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento próximo agendado
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4 mt-6">
            {mockEvents.past.length > 0 ? (
              mockEvents.past.map(renderEvent)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento passado encontrado
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}