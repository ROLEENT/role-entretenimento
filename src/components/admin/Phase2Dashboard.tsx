import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { AuditLogViewer } from './AuditLogViewer';
import { ContentApprovalPanel } from './ContentApprovalPanel';
import { PWAManager } from '../PWAManager';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  CheckSquare, 
  Smartphone,
  Shield,
  Clock,
  Users
} from 'lucide-react';

export const Phase2Dashboard = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Dashboard Avançado</h1>
          <p className="text-muted-foreground">
            Analytics, governança, auditoria e ferramentas PWA
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Avançado
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Aprovação
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="pwa" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            PWA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics Básico</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Métricas essenciais e KPIs principais
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Monitoramento em tempo real
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Core Web Vitals e otimizações
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Atividade e engajamento
                </p>
              </CardContent>
            </Card>
          </div>
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="approval" className="space-y-6">
          <ContentApprovalPanel />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Log de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLogViewer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pwa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Configurações PWA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PWAManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};