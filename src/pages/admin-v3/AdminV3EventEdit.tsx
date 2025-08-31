import { useParams } from "react-router-dom";
import { AdminV3Breadcrumb } from "@/components/admin/common/AdminV3Breadcrumb";
import { AdminEventForm } from "@/components/admin/events/AdminEventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminV3EventEdit() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["admin-event", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do evento é obrigatório");
      
      const { data, error } = await supabase
        .from("agenda_itens")
        .select(`
          *,
          venue:venues(*),
          organizer:organizers(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const breadcrumbItems = [
    { label: "Eventos", path: "/admin-v3/eventos" },
    { label: event?.title || "Editar Evento" }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center text-destructive">
          Erro ao carregar evento: {error?.message || "Evento não encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminV3Breadcrumb items={breadcrumbItems} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Evento</h1>
          <p className="text-muted-foreground">
            Atualize as informações do evento
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEventForm event={event} />
        </CardContent>
      </Card>
    </div>
  );
}