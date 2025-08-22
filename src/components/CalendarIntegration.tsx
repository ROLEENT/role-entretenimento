import { Calendar, CalendarPlus, Download, Share2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeeklyEvent } from '@/data/weeklyData';
import { toast } from 'sonner';

interface CalendarIntegrationProps {
  weekEvents: WeeklyEvent[];
  weekTitle: string;
}

const CalendarIntegration = ({ weekEvents, weekTitle }: CalendarIntegrationProps) => {
  const handleAddToCalendar = (event: WeeklyEvent) => {
    // Create ICS file content
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours duration
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ROLÊ//Event Calendar//PT
BEGIN:VEVENT
UID:${event.id}@role.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}\\n\\nLocal: ${event.venue}\\nGênero: ${event.genre}\\nPreço: ${event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}
LOCATION:${event.venue}, ${event.location}
END:VEVENT
END:VCALENDAR`;

    // Create and download file
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Evento adicionado ao calendário!');
  };

  const handleAddAllToCalendar = () => {
    const allEventsIcs = weekEvents.map(event => {
      const startDate = new Date(`${event.date}T${event.time}`);
      const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      return `BEGIN:VEVENT
UID:${event.id}@role.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}\\n\\nLocal: ${event.venue}\\nGênero: ${event.genre}\\nPreço: ${event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}
LOCATION:${event.venue}, ${event.location}
END:VEVENT`;
    }).join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ROLÊ//Event Calendar//PT
${allEventsIcs}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `role_${weekTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${weekEvents.length} eventos adicionados ao calendário!`);
  };

  const handleShareCalendar = async () => {
    const shareText = `Confira os eventos da ${weekTitle}! ${weekEvents.length} eventos incríveis aguardando você.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: weekTitle,
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        toast.success('Link copiado para a área de transferência!');
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const upcomingEvents = weekEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate >= today;
  }).slice(0, 5);

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Integration Main */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  Integração com Calendário
                </CardTitle>
                <p className="text-muted-foreground">
                  Sincronize os eventos da semana com seu calendário pessoal
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleAddAllToCalendar}
                    className="gap-2"
                    size="lg"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Todos ({weekEvents.length})
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleShareCalendar}
                    className="gap-2"
                    size="lg"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    size="lg"
                  >
                    <Settings className="h-4 w-4" />
                    Configurar
                  </Button>
                </div>

                {/* Calendar Providers */}
                <div>
                  <h4 className="font-semibold mb-3">Compatível com:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: 'Google Calendar', icon: '📅' },
                      { name: 'Apple Calendar', icon: '🍎' },
                      { name: 'Outlook', icon: '📧' },
                      { name: 'Others', icon: '📋' }
                    ].map((provider) => (
                      <div 
                        key={provider.name}
                        className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-lg">{provider.icon}</span>
                        <span className="text-sm font-medium">{provider.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                    Como funciona:
                  </h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>1. Clique em "Baixar Todos" para obter o arquivo .ics</li>
                    <li>2. Abra seu aplicativo de calendário favorito</li>
                    <li>3. Importe o arquivo baixado</li>
                    <li>4. Todos os eventos aparecerão automaticamente</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Quick Add */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarPlus className="h-5 w-5" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum evento programado</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm truncate">
                          {event.title}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {event.date} • {event.time}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {event.genre}
                          </Badge>
                          {event.trending && (
                            <Badge variant="destructive" className="text-xs">
                              Trending
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddToCalendar(event)}
                        className="p-2"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}

                {upcomingEvents.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      upcomingEvents.forEach(event => handleAddToCalendar(event));
                      toast.success('Todos os eventos próximos adicionados!');
                    }}
                  >
                    Adicionar Todos
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Calendar Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de eventos</span>
                  <span className="font-semibold">{weekEvents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Eventos gratuitos</span>
                  <span className="font-semibold">
                    {weekEvents.filter(e => e.price === 0).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gêneros únicos</span>
                  <span className="font-semibold">
                    {new Set(weekEvents.map(e => e.genre)).size}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cidades</span>
                  <span className="font-semibold">
                    {new Set(weekEvents.map(e => e.city)).size}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarIntegration;