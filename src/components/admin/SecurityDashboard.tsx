import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock, 
  Users, 
  Lock,
  FileX,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface SecurityLog {
  id: string;
  event_type: string;
  user_id?: string;
  admin_email?: string;
  ip_address?: string;
  severity: string;
  details: any;
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  activeUsers: number;
  lastIncident?: string;
}

export function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Dados simulados para demonstração
  const securityTrends = [
    { date: '2024-01-01', attempts: 12, success: 98, failed: 2 },
    { date: '2024-01-02', attempts: 15, success: 95, failed: 5 },
    { date: '2024-01-03', attempts: 8, success: 100, failed: 0 },
    { date: '2024-01-04', attempts: 20, success: 90, failed: 10 },
    { date: '2024-01-05', attempts: 18, success: 94, failed: 6 },
    { date: '2024-01-06', attempts: 25, success: 92, failed: 8 },
    { date: '2024-01-07', attempts: 22, success: 96, failed: 4 }
  ];

  const threatsByType = [
    { type: 'Tentativas de Login', count: 45, severity: 'medium' },
    { type: 'Acesso Negado', count: 12, severity: 'low' },
    { type: 'Operações Suspeitas', count: 3, severity: 'high' },
    { type: 'Rate Limiting', count: 28, severity: 'low' },
    { type: 'Dados Sensíveis', count: 2, severity: 'critical' }
  ];

  const recentAlerts = [
    {
      id: '1',
      type: 'login_failure',
      message: 'Múltiplas tentativas de login falharam para admin@example.com',
      severity: 'high',
      time: '2 min atrás',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      type: 'suspicious_activity',
      message: 'Atividade suspeita detectada: acesso a dados sensíveis',
      severity: 'critical',
      time: '15 min atrás',
      ip: '10.0.0.1'
    },
    {
      id: '3',
      type: 'rate_limit',
      message: 'Rate limiting ativado para IP 203.0.113.1',
      severity: 'medium',
      time: '1 hora atrás',
      ip: '203.0.113.1'
    }
  ];

  const [securityStatus, setSecurityStatus] = useState<any>(null);

  useEffect(() => {
    loadSecurityData();
    checkSecurityStatus();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Carregar logs de segurança
      const { data: logsData } = await supabase
        .from('security_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsData) {
        setLogs(logsData);
        
        // Calcular métricas
        const criticalCount = logsData.filter(log => log.severity === 'critical').length;
        const failedLoginCount = logsData.filter(log => log.event_type === 'login_failure').length;
        
        setMetrics({
          totalEvents: logsData.length,
          criticalEvents: criticalCount,
          failedLogins: failedLoginCount,
          activeUsers: 156, // Simulado
          lastIncident: logsData.find(log => log.severity === 'critical')?.created_at
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSecurityStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('security_monitor');
      if (error) throw error;
      setSecurityStatus(data);
    } catch (error) {
      console.error('Erro ao verificar status de segurança:', error);
    }
  };

  const applyHardening = async () => {
    try {
      const { data, error } = await supabase.rpc('apply_basic_security_hardening');
      if (error) throw error;
      alert(`Hardening aplicado: ${data}`);
      await checkSecurityStatus();
    } catch (error) {
      console.error('Erro ao aplicar hardening:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return colors[severity as keyof typeof colors] || 'outline';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Totais</p>
                <p className="text-2xl font-bold">{metrics.totalEvents}</p>
                <p className="text-xs text-muted-foreground">Últimas 24h</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Críticos</p>
                <p className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</p>
                <p className="text-xs text-muted-foreground">Requer atenção</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tentativas de Login</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.failedLogins}</p>
                <p className="text-xs text-muted-foreground">Falharam</p>
              </div>
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Online agora</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="logs">Logs de Segurança</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendências de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendências de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={securityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="success" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="failed" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ameaças por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Ameaças por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={threatsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Segurança Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum log de segurança encontrado
                  </p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadge(log.severity)}>
                            {log.severity}
                          </Badge>
                          <span className="font-medium">{log.event_type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.admin_email || log.user_id || 'Sistema'} • {log.ip_address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {alert.ip}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Investigar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status de Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>LGPD</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Conforme
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>GDPR</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Conforme
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cookies</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Configurado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>CSP Headers</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Ativo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fase 6: Correções Críticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityStatus && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Status Geral</span>
                      <Badge variant={securityStatus.status === 'ok' ? 'default' : 'destructive'}>
                        {securityStatus.status?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Logins Admin (24h)</span>
                      <span className="font-mono">{securityStatus.admin_logins_24h || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Erros (1h)</span>
                      <span className="font-mono">{securityStatus.errors_1h || 0}</span>
                    </div>
                    <Button 
                      onClick={applyHardening} 
                      className="w-full" 
                      size="sm"
                    >
                      Aplicar Hardening
                    </Button>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>⚠️ Fase 6 Status:</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>✅ Sistema de logging implementado</li>
                    <li>✅ Monitoramento básico ativo</li>
                    <li>⚠️ 13 avisos de segurança pendentes</li>
                    <li>⚠️ Functions legacy precisam correção</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}