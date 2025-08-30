import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Filter, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserCalendar, UserCalendarEvent, CalendarFilters } from '@/hooks/useUserCalendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UserPersonalCalendar: React.FC = () => {
  const { events, loading, downloadICS, loadUserEvents } = useUserCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSource, setSelectedSource] = useState<string>('all');

  // Calcular dias do calendário
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Agrupar eventos por data
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: UserCalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = format(new Date(event.start_datetime), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);

  // Estatísticas dos eventos
  const eventStats = useMemo(() => {
    const stats = {
      total: events.length,
      favorites: events.filter(e => e.source === 'favorite').length,
      attending: events.filter(e => e.source === 'attending').length,
      manual: events.filter(e => e.source === 'manual').length,
      upcoming: events.filter(e => new Date(e.start_datetime) >= new Date()).length
    };
    return stats;
  }, [events]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleFilterChange = (value: string) => {
    setSelectedSource(value);
    const filters: CalendarFilters = {};
    
    if (value !== 'all') {
      filters.source = value as any;
    }
    
    loadUserEvents(filters);
  };

  const getDayEvents = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'favorite':
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Favorito</Badge>;
      case 'attending':
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Confirmado</Badge>;
      case 'manual':
        return <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">Manual</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Meu Calendário</h2>
              <p className="text-muted-foreground">
                {eventStats.total} eventos • {eventStats.upcoming} próximos
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedSource} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                 <SelectContent position="popper" className="z-[100]">
                   <SelectItem value="all">Todos os tipos</SelectItem>
                   <SelectItem value="favorite">Favoritos ({eventStats.favorites})</SelectItem>
                   <SelectItem value="attending">Confirmados ({eventStats.attending})</SelectItem>
                   <SelectItem value="manual">Manuais ({eventStats.manual})</SelectItem>
                 </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={downloadICS}>
                <Download className="h-4 w-4 mr-2" />
                Baixar ICS
              </Button>
              
              <Button variant="outline" asChild>
                <a 
                  href="https://calendar.google.com/calendar/u/0/r" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Calendar
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendário */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {/* Cabeçalhos dos dias da semana */}
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Dias do calendário */}
            {calendarDays.map((day) => {
              const dayEvents = getDayEvents(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[100px] p-1 border border-border/50
                    ${!isCurrentMonth ? 'opacity-50' : ''}
                    ${isToday ? 'bg-primary/10 border-primary/30' : ''}
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isToday ? 'text-primary' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                        title={`${event.title} - ${format(new Date(event.start_datetime), 'HH:mm')}`}
                      >
                        <div className="font-medium truncate">
                          {event.all_day ? (
                            event.title
                          ) : (
                            `${format(new Date(event.start_datetime), 'HH:mm')} ${event.title}`
                          )}
                        </div>
                        {event.source && (
                          <div className="mt-1">
                            {getSourceBadge(event.source)}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de próximos eventos */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Próximos Eventos</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter(event => new Date(event.start_datetime) >= new Date())
              .slice(0, 10)
              .map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between p-3 bg-accent/30 rounded-lg border"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{event.title}</div>
                    {event.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      📅 {format(new Date(event.start_datetime), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      {event.location && (
                        <span className="ml-2">📍 {event.location}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {getSourceBadge(event.source)}
                  {event.event_id && (
                    <Badge variant="outline" className="text-xs">
                      ROLÊ #{event.event_id.slice(-6)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {events.filter(event => new Date(event.start_datetime) >= new Date()).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento próximo encontrado.</p>
                <p className="text-sm mt-1">
                  Favorite eventos na agenda para vê-los aqui!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPersonalCalendar;