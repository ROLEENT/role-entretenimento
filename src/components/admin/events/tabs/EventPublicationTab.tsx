import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { PublicationChecklist } from '@/components/form/PublicationChecklist';
import { validateEventForPublish } from '@/schemas/event-v3';
import { EventFormV3 } from '@/schemas/event-v3';

interface EventPublicationTabProps {
  isPending: boolean;
  onPublish: () => void;
  canPublish: boolean;
}

export function EventPublicationTab({ isPending, onPublish, canPublish }: EventPublicationTabProps) {
  const form = useFormContext<EventFormV3>();
  const formData = form.watch();
  
  const validationErrors = validateEventForPublish(formData);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agendamento de Publicação</CardTitle>
        </CardHeader>
        <CardContent>
          <DateTimePicker
            name="publish_at"
            label="Agendar Publicação"
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Publicação</CardTitle>
        </CardHeader>
        <CardContent>
          <PublicationChecklist
            data={formData}
            onPublish={onPublish}
            isPublishing={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}