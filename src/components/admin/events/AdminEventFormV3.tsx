import { useNavigate } from "react-router-dom";
import { EventCreateWizard } from "@/components/events/EventCreateWizard";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AdminEventFormV3() {
  const navigate = useNavigate();

  // Debug info para diagnóstico
  console.log("🚀 AdminEventFormV3: Componente carregado", {
    timestamp: new Date().toISOString(),
    wizard: "EventCreateWizard",
    version: "v3"
  });

  const handleSave = (eventData: any) => {
    console.log("✅ Event saved:", eventData);
    toast.success("Evento criado com sucesso!");
    navigate("/admin-v3/eventos");
  };

  const handleCancel = () => {
    navigate("/admin-v3/eventos");
  };

  return (
    <div className="space-y-4">
      {/* Indicador visual de diagnóstico */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            🧙‍♂️ EventCreateWizard
          </Badge>
          <span className="text-xs text-blue-700 dark:text-blue-300">
            Formulário wizard multi-etapas em funcionamento
          </span>
        </div>
      </div>
      
      <EventCreateWizard 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}