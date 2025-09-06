import { useState } from "react";
import { useParams } from "react-router-dom";
import { AdminV3Guard } from "@/components/AdminV3Guard";

import { AdminV3Breadcrumb } from "@/components/admin/common/AdminV3Breadcrumb";
import { EventCreateWizard } from "@/components/events/EventCreateWizard";
import { ChecklistWidget } from "@/components/events/ChecklistWidget";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getEventDefaults } from "@/schemas/eventSchema";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminV3EventsCreateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Fetch event data for editing
  const { data: event, isLoading, error } = useQuery({
    queryKey: ["admin-event-v3", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("events_with_relations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const [wizardData, setWizardData] = useState(() => {
    return event || getEventDefaults();
  });

  const handleSave = async (eventData: any) => {
    try {
      if (isEditing) {
        toast.success("Evento atualizado com sucesso!");
        navigate("/admin-v3/eventos");
      } else {
        toast.success("Evento criado com sucesso!");
        navigate("/admin-v3/eventos");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Erro ao salvar evento");
    }
  };

  const handleCancel = () => {
    navigate("/admin-v3/eventos");
  };

  const breadcrumbItems = [
    { label: "Eventos", path: "/admin-v3/eventos" },
    { label: isEditing ? `Editar: ${event?.title || "..."}` : "Criar Evento" }
  ];

  if (isLoading && isEditing) {
    return (
      <AdminV3Guard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminV3Guard>
    );
  }

  if (error) {
    return (
      <AdminV3Guard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-destructive">Erro ao carregar evento: {error.message}</p>
        </div>
      </AdminV3Guard>
    );
  }

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <AdminV3Breadcrumb items={breadcrumbItems} />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Wizard */}
            <div className="lg:col-span-3">
              <EventCreateWizard
                initialData={event || getEventDefaults()}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>

            {/* Sidebar with checklist */}
            <div className="space-y-6">
              <ChecklistWidget
                eventData={wizardData}
                onItemClick={(itemId) => {
                  // Could scroll to specific field in wizard
                  console.log("Focus field:", itemId);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}