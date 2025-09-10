import { AuditReport } from "@/components/ui/audit-report";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { getMetricsSnapshot, getPerformanceScore, areMetricsHealthy } from "@/utils/webVitalsTracker";
import { useState, useEffect } from "react";

export default function AuditDashboard() {
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [performanceScore, setPerformanceScore] = useState(100);
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    const updateMetrics = () => {
      setPerformanceMetrics(getMetricsSnapshot());
      setPerformanceScore(getPerformanceScore());
      setIsHealthy(areMetricsHealthy());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const implementedFixes = [
    {
      title: "500 Error Page Created",
      description: "Página de erro 500 com tom ROLÊ e opções de recuperação",
      status: "completed",
      priority: "P0"
    },
    {
      title: "404 Page Updated", 
      description: "Página 404 atualizada com design consistente e tom da marca",
      status: "completed",
      priority: "P0"
    },
    {
      title: "Web Vitals Tracking Enhanced",
      description: "Sistema de monitoramento detalhado de performance implementado",
      status: "completed", 
      priority: "P0"
    },
    {
      title: "Color System Audit Started",
      description: "Identificação e início da correção de 305+ instâncias de cores diretas",
      status: "in-progress",
      priority: "P0"
    },
    {
      title: "Performance Monitoring Dashboard",
      description: "Dashboard para acompanhamento de métricas em tempo real",
      status: "completed",
      priority: "P1"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <TrendingUp className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UI/UX Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Monitoramento e correção de issues de usabilidade e performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isHealthy ? "success" : "destructive" as any}>
            Performance: {performanceScore}/100
          </Badge>
        </div>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Web Vitals - Performance Atual
          </CardTitle>
          <CardDescription>
            Métricas de performance conforme Google Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(performanceMetrics).map(([key, metric]: [string, any]) => (
              <div key={key} className="text-center">
                <div className={`text-2xl font-bold ${
                  metric.rating === 'good' ? 'text-success' :
                  metric.rating === 'needs-improvement' ? 'text-warning' :
                  'text-destructive'
                }`}>
                  {key === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}
                  {key !== 'CLS' && 'ms'}
                </div>
                <div className="text-sm text-muted-foreground">{key}</div>
                <Badge variant={
                  metric.rating === 'good' ? 'success' :
                  metric.rating === 'needs-improvement' ? 'warning' :
                  'destructive'
                } className="text-xs">
                  {metric.rating}
                </Badge>
              </div>
            ))}
          </div>
          
          {Object.keys(performanceMetrics).length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Aguardando dados de performance... Navegue pela aplicação para gerar métricas.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixes Implemented */}
      <Card>
        <CardHeader>
          <CardTitle>Correções Implementadas</CardTitle>
          <CardDescription>
            Status das correções críticas e melhorias aplicadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {implementedFixes.map((fix, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(fix.status)}
                  <div>
                    <div className="font-medium">{fix.title}</div>
                    <div className="text-sm text-muted-foreground">{fix.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={fix.priority === 'P0' ? 'destructive' : 'warning'}>
                    {fix.priority}
                  </Badge>
                  <Badge variant={getStatusColor(fix.status) as any}>
                    {fix.status === 'completed' ? 'Concluído' :
                     fix.status === 'in-progress' ? 'Em progresso' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Audit Report */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório Completo de Auditoria</CardTitle>
          <CardDescription>
            Análise detalhada de todos os issues identificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditReport showDetails={true} />
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Corrigir todas as 305+ instâncias de cores diretas</span>
              <Badge variant="destructive">P0</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Implementar testes automatizados de acessibilidade</span>
              <Badge variant="warning">P1</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Auditoria sistemática de responsividade mobile</span>
              <Badge variant="warning">P1</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Padronização completa do microcopy ROLÊ</span>
              <Badge variant="secondary">P2</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}