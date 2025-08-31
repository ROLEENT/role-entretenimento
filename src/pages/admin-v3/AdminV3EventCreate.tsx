import { AdminV3Breadcrumb } from "@/components/admin/common/AdminV3Breadcrumb";
import { AdminEventForm } from "@/components/admin/events/AdminEventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminV3EventCreate() {
  const breadcrumbItems = [
    { label: "Eventos", path: "/admin-v3/eventos" },
    { label: "Criar Evento" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminV3Breadcrumb items={breadcrumbItems} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Evento</h1>
          <p className="text-muted-foreground">
            Adicione um novo evento à plataforma
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEventForm />
        </CardContent>
      </Card>
    </div>
  );
}