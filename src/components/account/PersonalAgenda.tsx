import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, MapPin, Clock, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserAuth } from '@/hooks/useUserAuth';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface AgendaEvent {
  id: string;
  event_id: string;
  created_at: string;
  status: string;
  event?: {
    title: string;
    slug: string;
    image_url?: string;
    date_start: string;
    city?: string;
    location_name?: string;
    subtitle?: string;
  };
}

export function PersonalAgenda() {
  const { user } = useUserAuth();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAgendaEvents();
  }, [user]);

  const fetchAgendaEvents = async () => {
    if (!user) return;

    try {
      // Buscar eventos salvos e de presença
      const [savedEvents, attendanceEvents] = await Promise.all([
        supabase
          .from('saves')
          .select(`
            id,
            event_id,
            created_at,
            event:agenda_itens(
              title,
              slug,
              image_url,
              date_start,
              city,
              location_name,
              subtitle
            )
          `)
          .eq('user_id', user.id),
        
        supabase
          .from('attendance')
          .select(`
            id,
            event_id,
            created_at,
            status,
            event:agenda_itens(
              title,
              slug,
              image_url,
              date_start,
              city,
              location_name,
              subtitle
            )
          `)
          .eq('user_id', user.id)
          .in('status', ['going', 'interested'])
      ]);

      // Combinar e dedplicar eventos
      const allEvents: AgendaEvent[] = [];
      
      savedEvents.data?.forEach(save => {
        allEvents.push({
          ...save,
          status: 'saved',
          event: Array.isArray(save.event) ? save.event[0] : save.event
        });
      });

      attendanceEvents.data?.forEach(attendance => {
        // Evitar duplicatas
        if (!allEvents.find(e => e.event_id === attendance.event_id)) {
          allEvents.push({
            ...attendance,
            event: Array.isArray(attendance.event) ? attendance.event[0] : attendance.event
          });
        }
      });

      // Ordenar por data do evento
      allEvents.sort((a, b) => {
        const dateA = new Date(a.event?.date_start || '');
        const dateB = new Date(b.event?.date_start || '');
        return dateA.getTime() - dateB.getTime();
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching agenda events:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar sua agenda",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToICS = () => {
    if (events.length === 0) {
      toast({
        title: "Nenhum evento",
        description: "Não há eventos para exportar",
        variant: "destructive"
      });
      return;
    }

    // Gerar arquivo ICS
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ROLÊ//Agenda Pessoal//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach(agendaEvent => {
      if (!agendaEvent.event?.date_start) return;

      const startDate = new Date(agendaEvent.event.date_start);
      const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // +3h

      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:role-${agendaEvent.id}@role.com.br`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${agendaEvent.event.title}`,
        `DESCRIPTION:${agendaEvent.event.subtitle || ''}`,
        `LOCATION:${agendaEvent.event.location_name || agendaEvent.event.city || ''}`,
        `URL:https://role.com.br/agenda/${agendaEvent.event.slug}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    // Download do arquivo
    const blob = new Blob([icsContent.join('\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minha-agenda-role.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Agenda exportada",
      description: "Arquivo ICS baixado com sucesso"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'going':
        return <Badge className="bg-green-100 text-green-800">Vou</Badge>;
      case 'interested':
        return <Badge variant="outline">Interessado</Badge>;
      case 'saved':
        return <Badge variant="secondary">Salvo</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="h-16 w-16 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Minha Agenda</h3>
          <p className="text-sm text-muted-foreground">
            {events.length} evento{events.length !== 1 ? 's' : ''} na sua agenda
          </p>
        </div>
        
        {events.length > 0 && (
          <Button onClick={exportToICS} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar ICS
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sua agenda está vazia</h3>
            <p className="text-muted-foreground mb-4">
              Salve eventos ou marque presença para ver sua agenda pessoal
            </p>
            <Button asChild>
              <Link to="/agenda">Explorar Eventos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((agendaEvent) => (
            <Card key={agendaEvent.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {agendaEvent.event?.image_url && (
                    <img
                      src={agendaEvent.event.image_url}
                      alt={agendaEvent.event.title}
                      className="h-16 w-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">
                          <Link 
                            to={`/agenda/${agendaEvent.event?.slug}`}
                            className="hover:text-primary transition-colors flex items-center gap-2"
                          >
                            {agendaEvent.event?.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </h4>
                        {agendaEvent.event?.subtitle && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {agendaEvent.event.subtitle}
                          </p>
                        )}
                      </div>
                      
                      {getStatusBadge(agendaEvent.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {agendaEvent.event?.date_start && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(agendaEvent.event.date_start).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                      
                      {(agendaEvent.event?.location_name || agendaEvent.event?.city) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {agendaEvent.event.location_name || agendaEvent.event.city}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}