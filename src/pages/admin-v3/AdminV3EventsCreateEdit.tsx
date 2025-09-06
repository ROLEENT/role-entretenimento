import { useState } from "react";
import { useParams } from "react-router-dom";
import { EventCreateWizard } from "@/components/events/EventCreateWizard";
import { ChecklistWidget } from "@/components/events/ChecklistWidget";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getEventDefaults } from "@/schemas/eventSchema";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUpsertEventV3 } from "@/hooks/useUpsertEventV3";

export default function AdminV3EventsCreateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const upsertEventMutation = useUpsertEventV3();

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
      // Add the ID to the event data if editing
      const dataToSave = isEditing ? { ...eventData, id } : eventData;
      
      await upsertEventMutation.mutateAsync(dataToSave);
      
      navigate("/admin-v3/eventos");
    } catch (error) {
      console.error("Error saving event:", error);
      // Error toast is handled by the mutation hook
    }
  };

  const handleCancel = () => {
    navigate("/admin-v3/eventos");
  };

  if (isLoading && isEditing) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar evento: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
  );
}