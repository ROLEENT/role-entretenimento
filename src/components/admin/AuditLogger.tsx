import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, FileText, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export const AuditLogger = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterAdmin, setFilterAdmin] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filterAction) {
        query = query.eq('action', filterAction);
      }

      if (filterAdmin) {
        query = query.ilike('admin_email', `%${filterAdmin}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, filterAction, filterAdmin]);

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      role_change: 'default',
      create: 'secondary',
      update: 'default',
      delete: 'destructive'
    };
    
    return variants[action] || 'secondary';
  };

  const formatJsonDiff = (oldValues: any, newValues: any) => {
    if (!oldValues || !newValues) return null;
    
    const changes = [];
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes.push({
          field: key,
          from: oldValues[key],
          to: newValues[key]
        });
      }
    }
    
    return changes;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log de Auditoria</h1>
        <p className="text-muted-foreground">
          Histórico de ações administrativas no sistema
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ação</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as ações</SelectItem>
                  <SelectItem value="role_change">Mudança de Role</SelectItem>
                  <SelectItem value="create">Criação</SelectItem>
                  <SelectItem value="update">Atualização</SelectItem>
                  <SelectItem value="delete">Exclusão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Admin</label>
              <Input
                placeholder="Email do administrador"
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={() => {
                setPage(0);
                loadLogs();
              }}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum log encontrado</p>
              <p className="text-muted-foreground">Não há registros de auditoria para os filtros aplicados</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getActionBadge(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        em {log.table_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        {log.admin_email}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {formatDistanceToNow(new Date(log.created_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                    
                    {/* Mudanças */}
                    {log.action === 'role_change' && log.old_values && log.new_values && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Mudanças:</p>
                        {formatJsonDiff(log.old_values, log.new_values)?.map((change, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{change.field}:</span>
                            <span className="text-destructive"> {String(change.from)}</span>
                            <span> → </span>
                            <span className="text-success">{String(change.to)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginação */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Anterior
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Página {page + 1}
        </span>
        
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={logs.length < pageSize}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
};