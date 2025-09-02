import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQualityMetrics } from '@/hooks/useQualityMetrics';
import { AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function QualityHealthCard() {
  const { metrics, loading, error } = useQualityMetrics();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Saúde Editorial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Erro na Saúde Editorial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar as métricas de qualidade.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getHealthStatus = () => {
    const score = metrics.overall.qualityScore;
    if (score >= 80) return { status: 'Excelente', color: 'bg-success', variant: 'default' as const };
    if (score >= 60) return { status: 'Boa', color: 'bg-warning', variant: 'secondary' as const };
    return { status: 'Precisa Atenção', color: 'bg-destructive', variant: 'destructive' as const };
  };

  const health = getHealthStatus();
  const totalIncomplete = metrics.events.incomplete + metrics.venues.incomplete;
  const totalNeedsReview = metrics.events.needsReview + metrics.venues.needsReview;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Saúde Editorial
          </div>
          <Badge variant={health.variant} className="px-3">
            {health.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quality Score Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Score de Qualidade</span>
            <span className="font-medium">{Math.round(metrics.overall.qualityScore)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${health.color}`}
              style={{ width: `${Math.min(metrics.overall.qualityScore, 100)}%` }}
            />
          </div>
        </div>

        {/* Key Issues */}
        <div className="space-y-2">
          {totalIncomplete > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>{totalIncomplete} itens incompletos</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                Crítico
              </Badge>
            </div>
          )}

          {totalNeedsReview > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <span>{totalNeedsReview} aguardam revisão</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Revisar
              </Badge>
            </div>
          )}

          {totalIncomplete === 0 && totalNeedsReview === 0 && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>Todos os itens estão em boa qualidade</span>
            </div>
          )}
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.events.total}</div>
            <div className="text-xs text-muted-foreground">Eventos</div>
            <div className="text-xs">
              {metrics.events.complete} completos
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.venues.total}</div>
            <div className="text-xs text-muted-foreground">Locais</div>
            <div className="text-xs">
              {metrics.venues.complete} completos
            </div>
          </div>
        </div>

        {/* Action Button */}
        {(totalIncomplete > 0 || totalNeedsReview > 0) && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <NavLink to="/admin-v3/qualidade">
              Ver Detalhes de Qualidade
              <ArrowRight className="h-4 w-4 ml-2" />
            </NavLink>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}