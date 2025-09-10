import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { TrendingUp, Users, Target, Share2, Eye, Heart, MousePointer } from 'lucide-react';

export const AdvancedAnalyticsDashboard = () => {
  const {
    conversionFunnel,
    userCohorts,
    topPerformers,
    loading
  } = useAdvancedAnalytics();

  if (loading) {
    return <div className="text-center py-8">Carregando analytics avançado...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Analytics Avançado</h2>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Funil de Conversão (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnel.map((step, index) => (
              <div key={step.step} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{step.step}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{step.count.toLocaleString()}</span>
                    {step.conversionRate && (
                      <Badge variant="secondary">
                        {step.conversionRate.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress 
                  value={step.conversionRate || 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Cohorts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Análise de Coorte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userCohorts.map((cohort) => (
              <div key={cohort.period} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{cohort.period}</div>
                  <div className="text-sm text-muted-foreground">
                    {cohort.newUsers} novos • {cohort.returningUsers} retornando
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {cohort.retentionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">retenção</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.slice(0, 5).map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{performer.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {performer.type === 'event' ? 'Evento' : 
                       performer.type === 'artist' ? 'Artista' : 'Local'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    {performer.metrics.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    {performer.metrics.saves}
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    {performer.metrics.shares}
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    {performer.metrics.clicks}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};