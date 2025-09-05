import { PerformanceDashboard } from "@/components/admin/PerformanceDashboard";
import { RealTimeMonitor } from "@/components/admin/RealTimeMonitor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Performance & Analytics</h1>
        <p className="text-muted-foreground">
          Monitoramento completo da performance e analytics da aplicação
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard de Performance</TabsTrigger>
          <TabsTrigger value="realtime">Monitor em Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}