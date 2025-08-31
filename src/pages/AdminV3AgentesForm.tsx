import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { AdminV3Guard } from "@/components/AdminV3Guard";
import { AdminV3Header } from "@/components/AdminV3Header";
import { AdminV3Breadcrumb } from "@/components/AdminV3Breadcrumb";
import { AgentesForm } from "@/components/agentes/AgentesForm";
import ActionBar from "@/components/ui/action-bar";

export default function AdminV3AgentesForm() {
  const [formSubmitFn, setFormSubmitFn] = useState<(() => void) | null>(null);
  const [formState, setFormState] = useState({
    isSubmitting: false,
    isSaving: false, 
    hasError: false,
    lastSavedAt: null as Date | null
  });
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar tipo de agente baseado na URL
  const getAgentType = () => {
    const path = location.pathname;
    if (path.includes('/artistas')) return 'artistas';
    if (path.includes('/organizadores')) return 'organizadores';
    if (path.includes('/locais')) return 'locais';
    return 'artistas';
  };

  const agentType = getAgentType();
  const isEditing = !!id;

  const getTypeName = () => {
    switch (agentType) {
      case 'artistas': return 'Artista';
      case 'organizadores': return 'Organizador';
      case 'locais': return 'Local';
      default: return 'Artista';
    }
  };

  const getBackLink = () => {
    return `/admin-v3/agentes/${agentType}`;
  };

  const handleSuccess = () => {
    navigate(getBackLink());
  };

  return (
    <AdminV3Guard>
      <div className="flex min-h-screen flex-col">
        <AdminV3Header />
        
        <main className="flex-1 pb-24">
          <div className="mx-auto w-full max-w-5xl px-4 py-8">
            <AdminV3Breadcrumb 
              items={[
                { label: "Dashboard", path: "/admin-v3" },
                { label: "Agentes", path: "/admin-v3/agentes" },
                { label: getTypeName() + "s", path: getBackLink() },
                { label: isEditing ? "Editar" : "Novo" }
              ]} 
            />

            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">
                {isEditing ? `Editar ${getTypeName()}` : `Novo ${getTypeName()}`}
              </h1>
              <p className="text-muted-foreground">
                {isEditing 
                  ? `Atualize as informações do ${getTypeName().toLowerCase()}`
                  : `Adicione um novo ${getTypeName().toLowerCase()} à plataforma`
                }
              </p>
            </div>

            <AgentesForm
              agentType={agentType}
              agentId={id}
              onSuccess={handleSuccess}
              onFormSubmit={setFormSubmitFn}
              onFormState={setFormState}
            />
          </div>
        </main>

        <ActionBar 
          className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur"
          isVisible={true}
          isSubmitting={formState.isSubmitting}
          isSaving={formState.isSaving}
          hasError={formState.hasError}
          lastSavedAt={formState.lastSavedAt}
          onSave={() => {
            if (formSubmitFn) formSubmitFn();
          }}
        />
      </div>
    </AdminV3Guard>
  );
}