import { AdminV3Breadcrumb } from "@/components/AdminV3Breadcrumb";
import { AdminEventFormV3 } from "@/components/admin/events/AdminEventFormV3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminV3DiagnosticPanel } from "@/components/admin/AdminV3DiagnosticPanel";

export default function AdminV3EventCreate() {
  const breadcrumbItems = [
    { label: "Eventos", path: "/admin-v3/eventos" },
    { label: "Criar Evento" }
  ];

  // Debug info para identificar qual versão está sendo usada
  console.log("🎯 AdminV3EventCreate: Formulário NOVO carregado", {
    timestamp: new Date().toISOString(),
    version: "v3-wizard",
    component: "AdminV3EventCreate"
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminV3Breadcrumb items={breadcrumbItems} />
      
      {/* Indicador visual para diagnóstico */}
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            ✅ Formulário NOVO v3
          </Badge>
          <span className="text-sm text-green-700 dark:text-green-300">
            Este é o formulário wizard multi-etapas (versão atualizada)
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Evento</h1>
          <p className="text-muted-foreground">
            Adicione um novo evento à plataforma com o formulário wizard
          </p>
        </div>
      </div>

      <AdminEventFormV3 />
      
      {/* Painel de diagnóstico - remover após confirmar funcionamento */}
      <AdminV3DiagnosticPanel />
    </div>
  );
}