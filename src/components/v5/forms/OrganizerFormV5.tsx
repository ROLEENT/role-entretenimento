import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizerV5Schema, OrganizerV5Form } from '@/schemas/v5/organizer';
import { useEntityFormV5, useAutosaveV5 } from '@/hooks/v5/useEntityFormV5';
import { FormShellV5, RHFText, RHFTextarea, RHFSlug, RHFImageUpload } from '@/components/v5/forms';

interface OrganizerFormV5Props {
  initialData?: Partial<OrganizerV5Form>;
  onSuccess?: (data: any) => void;
  onBack?: () => void;
  backUrl?: string;
}

export function OrganizerFormV5({ 
  initialData, 
  onSuccess, 
  onBack, 
  backUrl 
}: OrganizerFormV5Props) {
  const form = useForm<OrganizerV5Form>({
    resolver: zodResolver(organizerV5Schema),
    defaultValues: {
      name: '',
      slug: '',
      about: '',
      contacts: {
        email: '',
        instagram: '',
        whatsapp: '',
        website: '',
      },
      logo_url: '',
      logo_alt: '',
      ...initialData
    }
  });

  const saveOrganizer = useEntityFormV5({
    entityType: 'organizers',
    onSuccess
  });

  const autosave = useAutosaveV5({ entityType: 'organizers' });

  const handleSubmit = (data: OrganizerV5Form) => {
    saveOrganizer.mutate(data);
  };

  const handleAutosave = (data: OrganizerV5Form) => {
    autosave.mutate(data);
  };

  return (
    <FormProvider {...form}>
      <FormShellV5
        title={initialData?.id ? "Editar Organizador" : "Novo Organizador"}
        description="Complete as informações do organizador"
        form={form}
        onSubmit={handleSubmit}
        onBack={onBack}
        backUrl={backUrl}
        isSubmitting={saveOrganizer.isPending}
        onAutosave={handleAutosave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identificação */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Identificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFText 
                name="name" 
                label="Nome do Organizador" 
                placeholder="Nome do coletivo, empresa ou pessoa"
                required
              />
              <RHFSlug 
                name="slug" 
                label="URL" 
                table="organizers"
                generateFrom="name"
                required
              />
            </div>
            <RHFTextarea 
              name="about" 
              label="Sobre" 
              placeholder="Descrição sobre o organizador, manifesto, filosofia (máx. 600 caracteres)"
              rows={4}
            />
          </div>

          {/* Logo */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Logo</h3>
            <RHFImageUpload
              name="logo_url"
              altName="logo_alt"
              label="Logo do Organizador"
              bucket="organizers"
            />
          </div>

          {/* Contatos */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Contatos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFText 
                name="contacts.email" 
                label="Email" 
                placeholder="contato@organizador.com"
                type="email"
              />
              <RHFText 
                name="contacts.whatsapp" 
                label="WhatsApp" 
                placeholder="(11) 99999-9999"
              />
              <RHFText 
                name="contacts.instagram" 
                label="Instagram" 
                placeholder="@organizador"
              />
              <RHFText 
                name="contacts.website" 
                label="Website" 
                placeholder="https://organizador.com"
                type="url"
              />
            </div>
          </div>
        </div>
      </FormShellV5>
    </FormProvider>
  );
}