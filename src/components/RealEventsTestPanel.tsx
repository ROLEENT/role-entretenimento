import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Database, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useRealEventsTest } from '@/hooks/useRealEvents';
import { useAgendaData } from '@/hooks/useAgendaData';

const RealEventsTestPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: testReport, isLoading: testLoading, refetch: refetchTest } = useRealEventsTest();
  const { upcomingEvents, stats, isLoadingEvents } = useAgendaData({ status: 'upcoming' });

  const handleRefreshTest = () => {
    refetchTest();
  };

  if (testLoading || isLoadingEvents) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/20 rounded animate-pulse" />
              <span className="text-sm">Testando eventos reais...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="mb-2 bg-background shadow-lg border-primary/20 hover:bg-primary/5"
          >
            <Database className="w-4 h-4 mr-2" />
            Test Eventos Reais
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="w-96 bg-background shadow-xl border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                Admin-v3 Events Status
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Eventos (Admin-v3)</div>
                  <div className="text-lg font-bold text-primary">
                    {testReport?.events.count || 0}
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Total Expostos</div>
                  <div className="text-lg font-bold text-secondary">
                    {upcomingEvents.length}
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testReport?.summary.eventsTableActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    Tabela 'events': {testReport?.events.count || 0} eventos
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">
                    Fonte recomendada: {testReport?.summary.recommendedDataSource}
                  </span>
                </div>
              </div>

              {/* Sample Event */}
              {testReport?.events.sample && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-2">Evento de exemplo:</div>
                  <div className="text-sm font-medium">{testReport.events.sample.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {testReport.events.sample.city} • {testReport.events.sample.highlight_type}
                  </div>
                </div>
              )}

              {/* Cities with Events */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Cidades com eventos:</div>
                <div className="text-sm">
                  <Badge variant="secondary" className="mr-1 mb-1">
                    Total: {stats.totalCities} cidades
                  </Badge>
                  <Badge variant="outline" className="mr-1 mb-1">
                    {stats.totalEvents} eventos
                  </Badge>
                </div>
              </div>

              <Button 
                onClick={handleRefreshTest} 
                size="sm" 
                variant="outline" 
                className="w-full"
              >
                Atualizar Teste
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                Último teste: {testReport ? new Date(testReport.timestamp).toLocaleTimeString() : '--:--'}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default RealEventsTestPanel;