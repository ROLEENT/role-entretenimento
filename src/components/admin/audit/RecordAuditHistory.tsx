import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  old_values: any;
  new_values: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface RecordAuditHistoryProps {
  tableName: string;
  recordId: string;
  recordTitle?: string;
}

export function RecordAuditHistory({ tableName, recordId, recordTitle }: RecordAuditHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: history, isLoading, error } = useQuery({
    queryKey: ['audit-history', tableName, recordId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_audit_history', {
        p_table_name: tableName,
        p_record_id: recordId,
        p_limit: 50
      });
      
      if (error) throw error;
      return data as AuditEntry[];
    },
    enabled: !!tableName && !!recordId
  });

  const filteredHistory = history?.filter(entry => 
    !searchTerm || 
    entry.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatChanges = (oldValues: any, newValues: any, action: string) => {
    if (action === 'INSERT') {
      return 'Registro criado';
    }
    
    if (action === 'DELETE') {
      return 'Registro removido';
    }
    
    if (action === 'UPDATE' && oldValues && newValues) {
      const changes = [];
      for (const key in newValues) {
        if (oldValues[key] !== newValues[key] && key !== 'updated_at' && key !== 'id') {
          changes.push(`${key}: "${oldValues[key]}" → "${newValues[key]}"`);
        }
      }
      return changes.length > 0 ? changes.join(', ') : 'Atualização sem mudanças visíveis';
    }
    
    return 'Sem detalhes';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Erro ao carregar histórico: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações
            {recordTitle && <span className="text-sm font-normal text-muted-foreground">- {recordTitle}</span>}
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted h-16 rounded" />
            ))}
          </div>
        ) : filteredHistory && filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.map((entry, index) => (
              <div
                key={entry.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(entry.action)}>
                      {entry.action}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      por {entry.admin_email}
                    </span>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Mais recente
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formatChanges(entry.old_values, entry.new_values, entry.action)}
                </div>
                
                {entry.ip_address && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    IP: {entry.ip_address}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum histórico encontrado para este registro
          </div>
        )}
      </CardContent>
    </Card>
  );
}