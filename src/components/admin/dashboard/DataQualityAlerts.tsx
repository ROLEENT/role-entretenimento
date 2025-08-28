import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileX, MapPin, Calendar, Users, Building, ExternalLink } from 'lucide-react';
import { useDataQualityIssues } from '@/hooks/useDashboardData';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export const DataQualityAlerts = () => {
  const { data: issues, isLoading, error } = useDataQualityIssues();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Qualidade dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Qualidade dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-destructive">
          Erro ao verificar qualidade dos dados
          <button 
            onClick={() => window.location.reload()} 
            className="block mx-auto mt-2 text-sm underline"
          >
            Recarregar
          </button>
        </CardContent>
      </Card>
    );
  }

  const hasIssues = 
    (issues?.highlightsMissingData?.length || 0) > 0 ||
    (issues?.eventsMissingData?.length || 0) > 0 ||
    (issues?.duplicateSlugs?.length || 0) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Qualidade dos Dados
        </CardTitle>
        <CardDescription>
          Pendências e dados faltantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasIssues ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-green-600 mb-2">✓</div>
            <div>Todos os dados estão em ordem</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Destaques com dados faltantes */}
            {issues?.highlightsMissingData && issues.highlightsMissingData.length > 0 && (
              <Alert>
                <FileX className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">
                    {issues.highlightsMissingData.length} destaques com dados faltantes
                  </div>
                  <div className="space-y-2">
                    {issues.highlightsMissingData.slice(0, 3).map((highlight) => (
                      <div
                        key={highlight.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <div className="text-sm font-medium">{highlight.event_title}</div>
                          <div className="flex gap-1 mt-1">
                            {highlight.issues.map((issue) => (
                              <Badge key={issue} variant="destructive" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin-v2/highlights/${highlight.id}/edit`)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {issues.highlightsMissingData.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin-v2/highlights?filter=missing-data')}
                      >
                        Ver todos ({issues.highlightsMissingData.length})
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Eventos com dados faltantes */}
            {issues?.eventsMissingData && issues.eventsMissingData.length > 0 && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">
                    {issues.eventsMissingData.length} eventos com dados faltantes
                  </div>
                  <div className="space-y-2">
                    {issues.eventsMissingData.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <div className="text-sm font-medium">{event.title}</div>
                          <div className="flex gap-1 mt-1">
                            {event.issues.map((issue) => (
                              <Badge key={issue} variant="destructive" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin-v2/events/${event.id}/edit`)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {issues.eventsMissingData.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin-v2/events?filter=missing-data')}
                      >
                        Ver todos ({issues.eventsMissingData.length})
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Slugs duplicados */}
            {issues?.duplicateSlugs && issues.duplicateSlugs.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">
                    {issues.duplicateSlugs.length} slugs duplicados encontrados
                  </div>
                  <div className="space-y-2">
                    {issues.duplicateSlugs.slice(0, 3).map((item) => (
                      <div
                        key={item.slug}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <div className="text-sm font-medium">/{item.slug}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.count} itens com mesmo slug
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                    {issues.duplicateSlugs.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{issues.duplicateSlugs.length - 3} mais...
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};