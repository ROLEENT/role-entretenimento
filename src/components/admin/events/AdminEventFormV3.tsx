import { useNavigate } from "react-router-dom";
import { EventCreateWizard } from "@/components/events/EventCreateWizard";
import { toast } from "sonner";

export function AdminEventFormV3() {
  const navigate = useNavigate();

  const handleSave = (eventData: any) => {
    console.log("Event saved:", eventData);
    toast.success("Evento criado com sucesso!");
    navigate("/admin-v3/eventos");
  };

  const handleCancel = () => {
    navigate("/admin-v3/eventos");
  };

  return (
    <EventCreateWizard 
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}