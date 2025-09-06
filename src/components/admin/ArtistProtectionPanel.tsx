import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useArtistProtection, ProtectionStats } from '@/hooks/useArtistProtection';
import { Shield, Database, Activity, AlertTriangle, Download } from 'lucide-react';

export const ArtistProtectionPanel = () => {
  const { loading, getAuditLogs, getProtectionStats, createBackup } = useArtistProtection();
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState<ProtectionStats>({
    total_artists: 0,
    recent_changes: 0,
    failed_operations: 0,
    backup_status: 'inactive'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [logs, statistics] = await Promise.all([
      getAuditLogs(20),
      getProtectionStats()
    ]);
    
    setAuditLogs(logs);
    setStats(statistics);
  };

  const handleCreateBackup = async () => {
    await createBackup();
    await loadData(); // Refresh data
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'DELETE':
        return 'destructive';
      case 'UPDATE':
        return 'default';
      case 'INSERT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sistema de Proteção</h2>
          <p className="text-muted-foreground">
            Monitoramento e proteção dos dados dos artistas
          </p>
        </div>
        <Button onClick={handleCreateBackup} disabled={loading}>
          <Database className="mr-2 h-4 w-4" />
          Criar Backup
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Artistas</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_artists}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mudanças (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent_changes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operações Falhadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed_operations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Backup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={stats.backup_status === 'active' ? 'default' : 'destructive'}>
              {stats.backup_status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="protection">Configurações de Proteção</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>
                Histórico de operações realizadas nos artistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum log encontrado
                  </p>
                ) : (
                  auditLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {log.admin_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          ID: {log.record_id?.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Proteção</CardTitle>
              <CardDescription>
                Configure as regras de proteção e validação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Confirmação de Exclusão</h4>
                  <p className="text-sm text-muted-foreground">
                    Requer confirmação dupla para excluir artistas
                  </p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Backup Automático</h4>
                  <p className="text-sm text-muted-foreground">
                    Criar backup antes de operações críticas
                  </p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Auditoria Completa</h4>
                  <p className="text-sm text-muted-foreground">
                    Registrar todas as mudanças nos artistas
                  </p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};