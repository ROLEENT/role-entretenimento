import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePersonalCalendar, CalendarEvent } from '@/hooks/usePersonalCalendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarEventModal from './CalendarEventModal';
import CalendarSettings from './CalendarSettings';

interface PersonalCalendarProps {
  onEventClick?: (event: CalendarEvent) => void;
  onAddEventClick?: () => void;
}

const PersonalCalendar: React.FC<PersonalCalendarProps> = ({
  onEventClick,
  onAddEventClick
}) => {
  const { events, loading, settings } = usePersonalCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Calcular dias do calendário
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weekStartsOn = (settings?.week_starts_on || 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const calendarStart = startOfWeek(monthStart, { 
      weekStartsOn 
    });
    const calendarEnd = endOfWeek(monthEnd, { 
      weekStartsOn 
    });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate, settings?.week_starts_on]);

  // Agrupar eventos por data
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = format(new Date(event.start_datetime), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
    onEventClick?.(event);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
    onAddEventClick?.();
  };

  const getDayEvents = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
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
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Meu Calendário</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === 'month' ? 'week' : 'month')}
            >
              {view === 'month' ? 'Semana' : 'Mês'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleAddEvent}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Cabeçalho do calendário */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

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
                    min-h-[80px] p-1 border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors
                    ${!isCurrentMonth ? 'opacity-50' : ''}
                    ${isToday ? 'bg-primary/10 border-primary/30' : ''}
                  `}
                  onClick={() => handleAddEvent()}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isToday ? 'text-primary' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.all_day ? (
                          event.title
                        ) : (
                          `${format(new Date(event.start_datetime), 'HH:mm')} ${event.title}`
                        )}
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo de eventos */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Próximos Eventos</h4>
            <div className="space-y-2">
              {events
                .filter(event => new Date(event.start_datetime) >= new Date())
                .slice(0, 3)
                .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 bg-accent/50 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div>
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.start_datetime), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  {event.event_id && (
                    <Badge variant="secondary" className="text-xs">
                      Evento ROLÊ
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <CalendarEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
      />

      <CalendarSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default PersonalCalendar;