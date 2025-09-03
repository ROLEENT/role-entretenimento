import { useState } from "react";
import { AdminV3Guard } from "@/components/AdminV3Guard";
import { AdminV3Header } from "@/components/AdminV3Header";
import { AdminV3Breadcrumb } from "@/components/admin/common/AdminV3Breadcrumb";
import { EventCreateWizard } from "@/components/events/EventCreateWizard";
import { ChecklistWidget } from "@/components/events/ChecklistWidget";
import { getEventDefaults } from "@/schemas/eventSchema";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminV3EventCreate() {
  const navigate = useNavigate();
  
  const [wizardData, setWizardData] = useState(() => {
    return getEventDefaults();
  });

  const handleSave = async (eventData: any) => {
    try {
      toast.success("Evento criado com sucesso!");
      navigate("/admin-v3/eventos");
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
    { label: "Criar Evento" }
  ];

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        
        <div className="container mx-auto p-6 space-y-6">
          <AdminV3Breadcrumb items={breadcrumbItems} />
          
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
      </div>
    </AdminV3Guard>
  );
}