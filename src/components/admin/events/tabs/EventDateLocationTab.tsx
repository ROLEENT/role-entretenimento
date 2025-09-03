import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { RHFComboboxAsync } from '@/components/rhf/RHFComboboxAsync';
import { RHFOrganizerMultiSelect } from '@/components/rhf/RHFOrganizerMultiSelect';
import RHFInput from '@/components/form/RHFInput';
import { SupportersEditor } from '@/components/form/SupportersEditor';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import { AgentQuickCreateModal } from '@/components/AgentQuickCreateModal';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { EventFormV3 } from '@/schemas/event-v3';

interface EventDateLocationTabProps {
  isPending: boolean;
}

export function EventDateLocationTab({ isPending }: EventDateLocationTabProps) {
  const form = useFormContext<EventFormV3>();
  const { setValue, watch } = form;
  const formData = watch();
  
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const { searchVenues } = useVenueSearch();

  const handleVenueCreated = (newVenue: ComboboxAsyncOption) => {
    form.setValue('venue_id', newVenue.value);
    setVenueModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horários do Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker
              name="start_utc"
              label="Data/Hora de Início (UTC)"
              disabled={isPending}
            />
            
            <DateTimePicker
              name="end_utc"
              label="Data/Hora de Fim (UTC)"
              disabled={isPending}
            />
          </div>

          <DateTimePicker
            name="doors_open_utc"
            label="Portas Abrem (UTC)"
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFComboboxAsync
            name="venue_id"
            control={form.control}
            label="Local Cadastrado"
            placeholder="Buscar locais..."
            emptyText="Nenhum local encontrado"
            createNewText="Cadastrar novo local"
            onSearch={searchVenues}
            onCreateNew={() => setVenueModalOpen(true)}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                OU
              </span>
            </div>
          </div>

          <RHFInput
            name="free_address"
            label="Endereço Livre"
            placeholder="Rua, número, bairro, cidade"
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizadores</CardTitle>
        </CardHeader>
        <CardContent>
          <RHFOrganizerMultiSelect
            name="organizer_ids"
            control={form.control}
            label="Organizadores"
            description="Selecione os organizadores do evento. O primeiro será marcado como principal."
            maxItems={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apoiadores e Patrocinadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SupportersEditor
            title="Apoiadores"
            addButtonText="Adicionar Apoiador"
            value={formData.supporters || []}
            onChange={(value) => form.setValue('supporters', value as any)}
            disabled={isPending}
          />

          <SupportersEditor
            title="Patrocinadores"
            addButtonText="Adicionar Patrocinador"
            value={formData.sponsors || []}
            onChange={(value) => form.setValue('sponsors', value as any)}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <AgentQuickCreateModal
        open={venueModalOpen}
        onOpenChange={setVenueModalOpen}
        agentType="venue"
        onCreated={handleVenueCreated}
      />
    </div>
  );
}