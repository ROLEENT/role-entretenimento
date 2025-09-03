import { useNavigate } from "react-router-dom";
import { EventCreateWizard } from "@/components/events/EventCreateWizard";
import { toast } from "sonner";

interface AdminEventFormProps {
  event?: any;
}

export function AdminEventForm({ event }: AdminEventFormProps) {
  const navigate = useNavigate();

  const handleSave = (eventData: any) => {
    console.log("Event updated:", eventData);
    toast.success("Evento atualizado com sucesso!");
    navigate("/admin-v3/eventos");
  };

  const handleCancel = () => {
    navigate("/admin-v3/eventos");
  };

  return (
    <EventCreateWizard 
      initialData={event}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}