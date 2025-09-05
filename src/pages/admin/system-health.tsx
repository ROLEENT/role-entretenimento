import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';
import { SystemValidation } from '@/components/admin/SystemValidation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SystemHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistema de Monitoramento</h1>
        <p className="text-muted-foreground mt-2">
          Dashboard completo de saúde, performance e validação da aplicação
        </p>
      </div>
      
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health">Monitoramento</TabsTrigger>
          <TabsTrigger value="validation">Validação Sprint 7</TabsTrigger>
        </TabsList>
        
        <TabsContent value="health" className="space-y-6">
          <SystemHealthDashboard />
        </TabsContent>
        
        <TabsContent value="validation" className="space-y-6">
          <SystemValidation />
        </TabsContent>
      </Tabs>
    </div>
  );
}