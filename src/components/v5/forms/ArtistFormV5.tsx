import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { artistV5Schema, ArtistV5Form } from '@/schemas/v5/artist';
import { useEntityFormV5, useAutosaveV5 } from '@/hooks/v5/useEntityFormV5';
import { FormShellV5, RHFText, RHFTextarea, RHFSlug, RHFImageUpload } from '@/components/v5/forms';

interface ArtistFormV5Props {
  initialData?: Partial<ArtistV5Form>;
  onSuccess?: (data: any) => void;
  onBack?: () => void;
  backUrl?: string;
}

export function ArtistFormV5({ 
  initialData, 
  onSuccess, 
  onBack, 
  backUrl 
}: ArtistFormV5Props) {
  const form = useForm<ArtistV5Form>({
    resolver: zodResolver(artistV5Schema),
    defaultValues: {
      name: '',
      slug: '',
      bio_short: '',
      links: {
        instagram: '',
        soundcloud: '',
        spotify: '',
        website: '',
      },
      photo_url: '',
      photo_alt: '',
      ...initialData
    }
  });

  const saveArtist = useEntityFormV5({
    entityType: 'artists',
    onSuccess
  });

  const autosave = useAutosaveV5({ entityType: 'artists' });

  const handleSubmit = (data: ArtistV5Form) => {
    saveArtist.mutate(data);
  };

  const handleAutosave = (data: ArtistV5Form) => {
    autosave.mutate(data);
  };

  return (
    <FormProvider {...form}>
      <FormShellV5
        title={initialData?.id ? "Editar Artista" : "Novo Artista"}
        description="Complete as informações do artista"
        form={form}
        onSubmit={handleSubmit}
        onBack={onBack}
        backUrl={backUrl}
        isSubmitting={saveArtist.isPending}
        onAutosave={handleAutosave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identificação */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Identificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFText 
                name="name" 
                label="Nome do Artista" 
                placeholder="Nome completo ou artístico"
                required
              />
              <RHFSlug 
                name="slug" 
                label="URL" 
                table="artists"
                generateFrom="name"
                required
              />
            </div>
            <RHFTextarea 
              name="bio_short" 
              label="Bio Resumida" 
              placeholder="Breve descrição do artista (máx. 400 caracteres)"
              rows={3}
            />
          </div>

          {/* Foto */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Foto do Artista</h3>
            <RHFImageUpload
              name="photo_url"
              altName="photo_alt"
              label="Foto de Perfil"
              bucket="artists"
            />
          </div>

          {/* Links */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Links e Redes Sociais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFText 
                name="links.instagram" 
                label="Instagram" 
                placeholder="https://instagram.com/usuario"
                type="url"
              />
              <RHFText 
                name="links.soundcloud" 
                label="SoundCloud" 
                placeholder="https://soundcloud.com/usuario"
                type="url"
              />
              <RHFText 
                name="links.spotify" 
                label="Spotify" 
                placeholder="https://open.spotify.com/artist/..."
                type="url"
              />
              <RHFText 
                name="links.website" 
                label="Website" 
                placeholder="https://meusite.com"
                type="url"
              />
            </div>
          </div>
        </div>
      </FormShellV5>
    </FormProvider>
  );
}