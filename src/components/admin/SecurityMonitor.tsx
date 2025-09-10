import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Activity, Database, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityStatus {
  tables_without_rls: number;
  functions_without_search_path: number;
  audit_time: string;
  recommendations: string[];
}

interface SecurityMonitor {
  admin_logins_24h: number;
  errors_1h: number;
  status: 'ok' | 'warning' | 'critical';
  last_check: string;
}

export const SecurityMonitor = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [securityMonitor, setSecurityMonitor] = useState<SecurityMonitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSecurityStatus = async () => {
    try {
      setRefreshing(true);
      
      // Buscar auditoria de segurança
      const { data: auditData, error: auditError } = await supabase.rpc('security_audit_summary');
      if (auditError) throw auditError;
      
      // Buscar monitoramento de segurança
      const { data: monitorData, error: monitorError } = await supabase.rpc('security_monitor');
      if (monitorError) throw monitorError;
      
      setSecurityStatus(auditData);
      setSecurityMonitor(monitorData);
    } catch (error) {
      console.error('Erro ao buscar status de segurança:', error);
      toast.error('Erro ao carregar dados de segurança');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyHardening = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.rpc('apply_basic_security_hardening');
      if (error) throw error;
      
      toast.success('Hardening básico aplicado: ' + data);
      await fetchSecurityStatus();
    } catch (error) {
      console.error('Erro ao aplicar hardening:', error);
      toast.error('Erro ao aplicar hardening de segurança');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando status de segurança...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            {securityMonitor && getStatusIcon(securityMonitor.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {securityMonitor?.status || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema de segurança
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tabelas sem RLS</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {securityStatus?.tables_without_rls || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções Inseguras</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {securityStatus?.functions_without_search_path || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sem search_path
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Recentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMonitor?.errors_1h || 0}</div>
            <p className="text-xs text-muted-foreground">
              Última hora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas críticos */}
      {securityStatus && (securityStatus.tables_without_rls > 0 || securityStatus.functions_without_search_path > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>🚨 FASE 6: Vulnerabilidades Críticas Detectadas!</strong>
            <br />
            {securityStatus.tables_without_rls > 0 && (
              <span>• {securityStatus.tables_without_rls} tabelas sem RLS habilitado (CRÍTICO)<br /></span>
            )}
            {securityStatus.functions_without_search_path > 0 && (
              <span>• {securityStatus.functions_without_search_path} funções sem search_path seguro (ALTO RISCO)</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Recomendações */}
      {securityStatus?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Recomendações de Segurança - Fase 6</span>
            </CardTitle>
            <CardDescription>
              Ações necessárias para correção das vulnerabilidades críticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityStatus.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Correção</CardTitle>
          <CardDescription>
            Aplicar correções de segurança da Fase 6
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={applyHardening}
              disabled={refreshing}
              variant="default"
            >
              <Shield className="h-4 w-4 mr-2" />
              Aplicar Hardening Básico
            </Button>
            
            <Button 
              onClick={fetchSecurityStatus} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar Status
            </Button>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Fase 6 - Segurança Crítica:</strong> Este hardening corrige vulnerabilidades 
              de segurança identificadas no scan. É essencial para a proteção dos dados.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Detalhes técnicos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Última auditoria:</strong>
              <br />
              {securityStatus?.audit_time ? new Date(securityStatus.audit_time).toLocaleString() : 'N/A'}
            </div>
            <div>
              <strong>Último monitoramento:</strong>
              <br />
              {securityMonitor?.last_check ? new Date(securityMonitor.last_check).toLocaleString() : 'N/A'}
            </div>
            <div>
              <strong>Logins admin (24h):</strong>
              <br />
              {securityMonitor?.admin_logins_24h || 0} acessos
            </div>
            <div>
              <strong>Status do sistema:</strong>
              <br />
              <Badge variant={getStatusColor(securityMonitor?.status || 'outline')}>
                {securityMonitor?.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};