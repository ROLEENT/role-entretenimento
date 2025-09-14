import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { venueV5Schema, VenueV5Form } from '@/schemas/v5/venue';
import { useEntityFormV5, useAutosaveV5 } from '@/hooks/v5/useEntityFormV5';
import { FormShellV5, RHFText, RHFTextarea, RHFSlug, RHFImageUpload } from '@/components/v5/forms';

interface VenueFormV5Props {
  initialData?: Partial<VenueV5Form>;
  onSuccess?: (data: any) => void;
  onBack?: () => void;
  backUrl?: string;
}

export function VenueFormV5({ initialData, onSuccess, onBack, backUrl }: VenueFormV5Props) {
  const form = useForm<VenueV5Form>({
    resolver: zodResolver(venueV5Schema),
    defaultValues: {
      name: '',
      slug: '',
      address: '',
      city: 'POA',
      state: '',
      latitude: undefined,
      longitude: undefined,
      capacity: undefined,
      about: '',
      cover_url: '',
      cover_alt: '',
      ...initialData
    }
  });

  const saveVenue = useEntityFormV5({ entityType: 'venues', onSuccess });
  const autosave = useAutosaveV5({ entityType: 'venues' });

  const handleSubmit = (data: VenueV5Form) => {
    saveVenue.mutate(data);
  };

  const handleAutosave = (data: VenueV5Form) => {
    autosave.mutate(data);
  };

  return (
    <FormProvider {...form}>
      <FormShellV5
        title={initialData?.id ? 'Editar Local' : 'Novo Local'}
        description="Complete as informações do local"
        form={form}
        onSubmit={handleSubmit}
        onBack={onBack}
        backUrl={backUrl}
        isSubmitting={saveVenue.isPending}
        onAutosave={handleAutosave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identificação */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Identificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFText name="name" label="Nome do Local" placeholder="Nome do espaço" required />
              <RHFSlug name="slug" label="URL" table="venues" generateFrom="name" required />
            </div>
            <RHFTextarea name="about" label="Sobre" placeholder="Descrição do local" rows={3} />
          </div>

          {/* Endereço */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFText name="address" label="Endereço" placeholder="Rua, número" />
              <RHFText name="city" label="Cidade (POA, FLN, CWB, SP, RJ)" placeholder="POA" required />
              <RHFText name="state" label="Estado" placeholder="RS" />
              <RHFText name="capacity" label="Capacidade" type="number" placeholder="Ex: 500" />
              <RHFText name="latitude" label="Latitude" type="number" placeholder="-30.0" />
              <RHFText name="longitude" label="Longitude" type="number" placeholder="-51.0" />
            </div>
          </div>

          {/* Imagem */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Imagem</h3>
            <RHFImageUpload name="cover_url" altName="cover_alt" label="Capa do Local" bucket="venues" />
          </div>
        </div>
      </FormShellV5>
    </FormProvider>
  );
}