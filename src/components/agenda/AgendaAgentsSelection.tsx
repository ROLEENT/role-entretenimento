import { useFormContext } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { OrganizerCombobox } from '@/components/OrganizerCombobox';
import { VenueCombobox } from '@/components/VenueCombobox';
import { MultipleOrganizerSelector } from './MultipleOrganizerSelector';

export function AgendaAgentsSelection() {
  const { watch } = useFormContext();
  const status = watch('status');
  const organizerId = watch('organizer_id');
  const venueId = watch('venue_id');
  const eventId = watch('id');

  const isPublished = status === 'published';
  const missingOrganizer = isPublished && !organizerId;
  const missingVenue = isPublished && !venueId;

  return (
    <div className="space-y-6">
      {(missingOrganizer || missingVenue) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para publicar o evento, é necessário:
            {missingOrganizer && <div>• Selecionar pelo menos um organizador</div>}
            {missingVenue && <div>• Selecionar um local</div>}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Local do Evento</h3>
            <VenueCombobox 
              value={venueId}
              onValueChange={() => {}}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Organizador Principal (Legado)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Campo mantido para compatibilidade. Use o seletor múltiplo abaixo.
            </p>
            <OrganizerCombobox 
              value={organizerId}
              onValueChange={() => {}}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Organizadores do Evento</h3>
        <MultipleOrganizerSelector agendaId={eventId} />
      </div>

      {isPublished && (
        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Regras para Publicação
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Pelo menos um organizador deve ser definido</li>
            <li>• Um local deve ser selecionado</li>
            <li>• Título e data de início são obrigatórios</li>
          </ul>
        </div>
      )}
    </div>
  );
}