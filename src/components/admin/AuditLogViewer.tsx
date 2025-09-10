import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Search, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  old_values?: any;
  new_values?: any;
  changed_by?: string;
  changed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [operationFilter, setOperationFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, [tableFilter, operationFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(100);

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      if (operationFilter !== 'all') {
        query = query.eq('operation', operationFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    searchTerm === '' ||
    log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.record_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatChanges = (oldValues: any, newValues: any, operation: string) => {
    if (operation === 'INSERT') {
      return Object.entries(newValues || {}).map(([key, value]) => (
        <div key={key} className="mb-2">
          <span className="font-medium text-green-600">+{key}:</span>
          <span className="ml-2 text-sm">{JSON.stringify(value)}</span>
        </div>
      ));
    }

    if (operation === 'DELETE') {
      return Object.entries(oldValues || {}).map(([key, value]) => (
        <div key={key} className="mb-2">
          <span className="font-medium text-red-600">-{key}:</span>
          <span className="ml-2 text-sm">{JSON.stringify(value)}</span>
        </div>
      ));
    }

    if (operation === 'UPDATE' && oldValues && newValues) {
      const changes: any[] = [];
      Object.keys(newValues).forEach(key => {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          changes.push(
            <div key={key} className="mb-2">
              <span className="font-medium">{key}:</span>
              <div className="ml-4">
                <span className="text-red-600">-{JSON.stringify(oldValues[key])}</span>
                <br />
                <span className="text-green-600">+{JSON.stringify(newValues[key])}</span>
              </div>
            </div>
          );
        }
      });
      return changes;
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por tabela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as tabelas</SelectItem>
            <SelectItem value="events">Eventos</SelectItem>
            <SelectItem value="artists">Artistas</SelectItem>
            <SelectItem value="agenda_itens">Agenda</SelectItem>
            <SelectItem value="venues">Locais</SelectItem>
            <SelectItem value="organizers">Organizadores</SelectItem>
          </SelectContent>
        </Select>

        <Select value={operationFilter} onValueChange={setOperationFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por operação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas operações</SelectItem>
            <SelectItem value="INSERT">Criação</SelectItem>
            <SelectItem value="UPDATE">Edição</SelectItem>
            <SelectItem value="DELETE">Exclusão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Carregando logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum log encontrado
          </div>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getOperationColor(log.operation)}>
                      {log.operation}
                    </Badge>
                    <span className="font-medium">{log.table_name}</span>
                    <span className="text-sm text-muted-foreground">
                      ID: {log.record_id?.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.changed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedLog?.id === log.id && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-3">Detalhes da Alteração</h4>
                    <div className="space-y-2 text-sm">
                      {formatChanges(log.old_values, log.new_values, log.operation)}
                    </div>
                    
                    {log.ip_address && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-sm text-muted-foreground">
                          IP: {log.ip_address}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};