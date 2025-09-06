import { useState } from "react";
import { EventCreateWizard } from "@/components/events/EventCreateWizard";
import { ChecklistWidget } from "@/components/events/ChecklistWidget";
import { getEventDefaults } from "@/schemas/eventSchema";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function AdminV3EventCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromAgenda = searchParams.get('from') === 'agenda';
  
  const [wizardData, setWizardData] = useState(() => {
    return getEventDefaults();
  });

  const handleSave = async (eventData: any) => {
    try {
      if (isFromAgenda) {
        toast.success("Evento da agenda criado com sucesso!");
        navigate("/admin-v3/agenda");
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
    if (isFromAgenda) {
      navigate("/admin-v3/agenda");
    } else {
      navigate("/admin-v3/eventos");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Wizard */}
        <div className="lg:col-span-3">
          <EventCreateWizard
            initialData={getEventDefaults()}
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