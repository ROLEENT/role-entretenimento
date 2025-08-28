import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, AlertCircle, Eye, Image, Link, FileX } from 'lucide-react';
import { useDataQualityIssues } from '@/hooks/useDashboardData';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const DataQualityAlerts = () => {
  const { data: issues, isLoading, error } = useDataQualityIssues();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

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
          Erro ao carregar alertas de qualidade
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
    <Card className="min-h-[400px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Qualidade dos Dados
        </CardTitle>
        <CardDescription>
          {showAll ? 'Todos os problemas de qualidade' : 'Principais problemas de qualidade dos dados'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {!hasIssues ? (
          <div className="text-center text-muted-foreground py-8 flex-1 flex items-center justify-center">
            <div>
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div>Todos os dados estão em ordem!</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Destaques com dados faltantes */}
            {issues?.highlightsMissingData && issues.highlightsMissingData.length > 0 && (
              <Alert className="border-red-200 bg-red-50/50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Dados faltantes (Destaques)</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileX className="h-4 w-4" />
                      <span>{issues.highlightsMissingData.length} destaques</span>
                      <Badge variant="destructive" className="text-xs">Crítico</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate('/admin-highlight-editor')}
                    >
                      Corrigir
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Eventos com dados faltantes */}
            {issues?.eventsMissingData && issues.eventsMissingData.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50/50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Dados faltantes (Eventos)</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileX className="h-4 w-4" />
                      <span>{issues.eventsMissingData.length} eventos</span>
                      <Badge variant="outline" className="text-xs bg-yellow-100">Aviso</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate('/admin-event-management')}
                    >
                      Corrigir
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Slugs duplicados */}
            {issues?.duplicateSlugs && issues.duplicateSlugs.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50/50">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Slugs duplicados</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{issues.duplicateSlugs.length} conflitos</span>
                      <Badge variant="outline" className="text-xs bg-yellow-100">Aviso</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate('/admin-event-management')}
                    >
                      Revisar
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Botão Ver Todos */}
            {!showAll && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalhes completos
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};