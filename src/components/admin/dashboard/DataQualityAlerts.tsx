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
    <Card className="min-h-[500px] flex flex-col shadow-md border-0 bg-gradient-card">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <AlertTriangle className="h-6 w-6 text-primary" />
          Qualidade dos Dados
        </CardTitle>
        <CardDescription className="text-base">
          {showAll ? 'Todos os problemas de qualidade' : 'Principais alertas de qualidade'}
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
            {/* Grupo: Sem imagem de capa */}
            {issues?.highlightsMissingData && issues.highlightsMissingData.length > 0 && (
              <Alert className="border-destructive/30 bg-destructive/5">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="font-semibold text-destructive text-lg">
                      Sem imagem de capa ({issues.highlightsMissingData.length} itens)
                    </div>
                    <div className="text-sm text-destructive/80">
                      Destaques sem imagem de capa prejudicam o engajamento
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      onClick={() => navigate('/admin-highlight-editor')}
                    >
                      Corrigir Todos
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Grupo: Sem slug */}
            {issues?.eventsMissingData && issues.eventsMissingData.length > 0 && (
              <Alert className="border-warning/50 bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="font-semibold text-warning-foreground text-lg">
                      Sem slug ({issues.eventsMissingData.length} itens)
                    </div>
                    <div className="text-sm text-warning-foreground/80">
                      Eventos sem slug podem causar problemas de SEO
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-warning hover:bg-warning/90 text-warning-foreground"
                      onClick={() => navigate('/admin-event-management')}
                    >
                      Corrigir Todos
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