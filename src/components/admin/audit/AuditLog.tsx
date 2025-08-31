import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface AuditLogProps {
  adminEmail: string;
}

export function AuditLog({ adminEmail }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');

  const { data: auditData, isLoading, error } = useQuery({
    queryKey: ['audit-log', adminEmail, selectedTable, selectedAction],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_recent_audit_activity', {
        p_admin_email: selectedAction === 'my-actions' ? adminEmail : null,
        p_table_name: selectedTable || null,
        p_limit: 100
      });
      
      if (error) throw error;
      return data as AuditEntry[];
    },
    enabled: !!adminEmail
  });

  const filteredData = auditData?.filter(entry => 
    !searchTerm || 
    entry.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      return `Criado novo registro`;
    }
    
    if (action === 'DELETE') {
      return `Registro removido`;
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
          <p className="text-red-600">Erro ao carregar log de auditoria: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as tabelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as tabelas</SelectItem>
                <SelectItem value="artists">Artistas</SelectItem>
                <SelectItem value="agenda_itens">Agenda</SelectItem>
                <SelectItem value="blog_posts">Blog</SelectItem>
                <SelectItem value="highlights">Destaques</SelectItem>
                <SelectItem value="organizers">Organizadores</SelectItem>
                <SelectItem value="partners">Parceiros</SelectItem>
                <SelectItem value="venues">Locais</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                <SelectItem value="INSERT">Criação</SelectItem>
                <SelectItem value="UPDATE">Atualização</SelectItem>
                <SelectItem value="DELETE">Exclusão</SelectItem>
                <SelectItem value="my-actions">Minhas ações</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedTable('');
                setSelectedAction('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Log de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted h-16 rounded" />
              ))}
            </div>
          ) : filteredData && filteredData.length > 0 ? (
            <div className="space-y-3">
              {filteredData.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action}
                      </Badge>
                      <Badge variant="outline">
                        {entry.table_name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        por {entry.admin_email}
                      </span>
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
              Nenhuma atividade encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}