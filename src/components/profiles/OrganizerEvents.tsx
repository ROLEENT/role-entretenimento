import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrganizerEventsProps {
  organizerId: string;
}

// Mock data - replace with real API calls
const mockEvents = {
  upcoming: [
    {
      id: '1',
      title: 'Festival de Verão 2024',
      date: new Date('2024-03-15T20:00:00'),
      venue: 'Parque da Cidade',
      city: 'São Paulo',
      artists: ['DJ Summer', 'Banda Tropical'],
      image: '/placeholder.svg',
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Noite Cultural',
      date: new Date('2024-03-22T19:00:00'),
      venue: 'Centro Cultural',
      city: 'São Paulo',
      artists: ['Grupo Local', 'Artistas Independentes'],
      image: '/placeholder.svg',
      status: 'confirmed'
    }
  ],
  past: [
    {
      id: '3',
      title: 'Festa de Ano Novo 2024',
      date: new Date('2023-12-31T22:00:00'),
      venue: 'Casa de Shows',
      city: 'São Paulo',
      artists: ['DJ NYE', 'Banda Celebration'],
      image: '/placeholder.svg',
      status: 'completed'
    }
  ]
};

export function OrganizerEvents({ organizerId }: OrganizerEventsProps) {
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
            
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {event.artists.join(', ')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos Organizados</CardTitle>
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