import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Plus, GripVertical } from "lucide-react";
import { OrganizerCombobox } from "@/components/OrganizerCombobox";
import { useEventOrganizers, EventOrganizerData } from "@/hooks/useEventOrganizers";

interface MultipleOrganizerSelectorProps {
  agendaId?: string;
  disabled?: boolean;
}

const ORGANIZER_ROLES = [
  { value: "organizer", label: "Organizador" },
  { value: "co-organizer", label: "Co-organizador" },
  { value: "support", label: "Apoio" },
  { value: "partner", label: "Parceiro" },
];

export function MultipleOrganizerSelector({
  agendaId,
  disabled = false,
}: MultipleOrganizerSelectorProps) {
  const [selectedOrganizerId, setSelectedOrganizerId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("organizer");
  const [setAsMain, setSetAsMain] = useState<boolean>(false);

  const {
    organizers,
    isLoading,
    addOrganizer,
    removeOrganizer,
    updateOrganizer,
    isAddingOrganizer,
  } = useEventOrganizers(agendaId);

  const handleAddOrganizer = () => {
    if (!selectedOrganizerId || !agendaId) return;

    addOrganizer({
      agenda_id: agendaId,
      organizer_id: selectedOrganizerId,
      role: selectedRole,
      main_organizer: setAsMain,
    });

    // Reset form
    setSelectedOrganizerId("");
    setSelectedRole("organizer");
    setSetAsMain(false);
  };

  const handleRemoveOrganizer = (organizerId: string) => {
    removeOrganizer(organizerId);
  };

  const handleToggleMainOrganizer = (organizerId: string, isMain: boolean) => {
    updateOrganizer({
      id: organizerId,
      updates: { main_organizer: isMain },
    });
  };

  const handleRoleChange = (organizerId: string, role: string) => {
    updateOrganizer({
      id: organizerId,
      updates: { role },
    });
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando organizadores...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add new organizer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Adicionar Organizador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Organizador</Label>
              <OrganizerCombobox
                value={selectedOrganizerId}
                onValueChange={setSelectedOrganizerId}
                disabled={disabled || isAddingOrganizer}
              />
            </div>

            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger disabled={disabled || isAddingOrganizer}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZER_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="main-organizer"
              checked={setAsMain}
              onCheckedChange={setSetAsMain}
              disabled={disabled || isAddingOrganizer}
            />
            <Label htmlFor="main-organizer" className="text-sm">
              Organizador principal
            </Label>
          </div>

          <Button
            onClick={handleAddOrganizer}
            disabled={!selectedOrganizerId || disabled || isAddingOrganizer}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAddingOrganizer ? "Adicionando..." : "Adicionar Organizador"}
          </Button>
        </CardContent>
      </Card>

      {/* Current organizers */}
      {organizers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Organizadores do Evento</h4>
          <div className="space-y-2">
            {organizers.map((organizer) => (
              <OrganizerItem
                key={organizer.id}
                organizer={organizer}
                disabled={disabled}
                onRemove={() => handleRemoveOrganizer(organizer.id)}
                onToggleMain={(isMain) => handleToggleMainOrganizer(organizer.id, isMain)}
                onRoleChange={(role) => handleRoleChange(organizer.id, role)}
              />
            ))}
          </div>
        </div>
      )}

      {organizers.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Nenhum organizador adicionado ainda.</p>
          <p className="text-xs">Adicione organizadores para o evento acima.</p>
        </div>
      )}
    </div>
  );
}

interface OrganizerItemProps {
  organizer: EventOrganizerData;
  disabled: boolean;
  onRemove: () => void;
  onToggleMain: (isMain: boolean) => void;
  onRoleChange: (role: string) => void;
}

function OrganizerItem({
  organizer,
  disabled,
  onRemove,
  onToggleMain,
  onRoleChange,
}: OrganizerItemProps) {
  const organizerData = organizer.organizers;
  const roleLabel = ORGANIZER_ROLES.find((r) => r.value === organizer.role)?.label || organizer.role;

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">
                {organizerData?.name || "Organizador"}
              </span>
              {organizer.main_organizer && (
                <Badge variant="default" className="text-xs">
                  Principal
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Select
                value={organizer.role}
                onValueChange={onRoleChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-32 h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZER_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={organizer.main_organizer}
                  onCheckedChange={onToggleMain}
                  disabled={disabled}
                />
                <Label className="text-xs">Principal</Label>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}