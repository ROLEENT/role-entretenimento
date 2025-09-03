import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChipInputDragDrop } from '@/components/form/ChipInputDragDrop';
import { PerformanceEditorV3 } from '@/components/form/PerformanceEditorV3';
import { VisualArtEditorV3 } from '@/components/form/VisualArtEditorV3';
import { TicketingForm } from '@/components/form/TicketingForm';
import { EventFormV3 } from '@/schemas/event-v3';

interface EventArtistsPricesTabProps {
  isPending: boolean;
}

export function EventArtistsPricesTab({ isPending }: EventArtistsPricesTabProps) {
  const form = useFormContext<EventFormV3>();
  const { setValue, watch } = form;
  const formData = watch();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lineup Principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChipInputDragDrop
            name="artists_names"
            value={formData.artists_names}
            onChange={(value) => setValue('artists_names', value)}
            placeholder="Adicionar artista ao lineup"
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shows e Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceEditorV3
            value={formData.performances || []}
            onChange={(value) => setValue('performances', value)}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artes Visuais</CardTitle>
        </CardHeader>
        <CardContent>
          <VisualArtEditorV3
            value={formData.visual_art || []}
            onChange={(value) => setValue('visual_art', value)}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingressos e Preços</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketingForm
            value={formData.ticketing || {}}
            onChange={(value) => setValue('ticketing', value)}
            disabled={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}