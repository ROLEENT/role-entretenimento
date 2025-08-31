import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin } from 'lucide-react';
import { VenueCombobox } from '@/components/VenueCombobox';
import { OrganizerCombobox } from '@/components/OrganizerCombobox';

export function AgendaAgentsSelection() {
  const { watch } = useFormContext();

  const status = watch('status');
  const organizerId = watch('organizer_id');
  const venueId = watch('venue_id');

  const isPublishedRequired = status === 'published';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organizador e Local
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção do Organizador */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Organizador
              {isPublishedRequired && <span className="text-destructive">*</span>}
            </label>
          </div>
          <OrganizerCombobox
            value={organizerId}
            onValueChange={(value) => {
              // setValue será manejado pelo combobox internamente
            }}
          />
          {isPublishedRequired && !organizerId && (
            <p className="text-xs text-destructive">
              Organizador é obrigatório para eventos publicados
            </p>
          )}
        </div>

        {/* Seleção do Local */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <label className="text-sm font-medium">
              Local do Evento
              {isPublishedRequired && <span className="text-destructive">*</span>}
            </label>
          </div>
          <VenueCombobox
            value={venueId}
            onValueChange={(value) => {
              // setValue será manejado pelo combobox internamente
            }}
          />
          {isPublishedRequired && !venueId && (
            <p className="text-xs text-destructive">
              Local é obrigatório para eventos publicados
            </p>
          )}
        </div>

        {/* Status Info */}
        {status && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Regras de Publicação:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              {status === 'published' && (
                <p>• <strong>Publicado:</strong> Requer organizador, local, título, cidade, slug, datas</p>
              )}
              {status === 'scheduled' && (
                <p>• <strong>Agendado:</strong> Requer título, cidade, slug, datas</p>
              )}
              {status === 'draft' && (
                <p>• <strong>Rascunho:</strong> Sem restrições</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}