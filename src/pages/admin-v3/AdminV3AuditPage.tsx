import React, { useState } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditLog, AuditStats } from '@/components/admin/audit';
import { Shield, BarChart3, History } from 'lucide-react';

export default function AdminV3AuditPage() {
  // In a real app, this would come from authentication context
  const adminEmail = 'admin@example.com'; // TODO: Get from auth context

  const breadcrumbs = [
    { label: 'Admin v3', path: '/admin-v3' },
    { label: 'Auditoria' }
  ];

  return (
    <AdminPageWrapper
      title="Sistema de Auditoria"
      description="Monitore todas as atividades administrativas da plataforma"
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Log de Atividade
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6">
          <AuditStats adminEmail={adminEmail} />
        </TabsContent>

        <TabsContent value="log" className="mt-6">
          <AuditLog adminEmail={adminEmail} />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="grid gap-6">
            <div className="p-6 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-2">Recursos de Segurança</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Todas as ações administrativas são registradas automaticamente</p>
                <p>• IPs e user agents são capturados para análise forense</p>
                <p>• Histórico completo de alterações em registros</p>
                <p>• Triggers de auditoria aplicados em todas as tabelas críticas</p>
                <p>• Dados de auditoria protegidos por RLS (Row Level Security)</p>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">Políticas de Retenção</h3>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>• Logs são mantidos por 365 dias por padrão</p>
                <p>• Ações críticas (DELETE) são mantidas indefinidamente</p>
                <p>• Backup automático dos logs de auditoria</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
}