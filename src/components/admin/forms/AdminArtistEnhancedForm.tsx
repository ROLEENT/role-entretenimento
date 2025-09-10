import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TabsWrapper } from './TabsWrapper';
import { ArtistBasicFields } from './enhanced-fields/ArtistBasicFields';
import { ArtistContactFields } from './enhanced-fields/ArtistContactFields';
import { ArtistMediaFields } from './enhanced-fields/ArtistMediaFields';
import { ArtistTypeFields } from './entity-fields/ArtistTypeFields';
import { artistEnhancedSchema, ArtistEnhancedForm, validateArtistByType } from '@/schemas/entities/artist-enhanced';

export type ArtistEnhancedFormData = ArtistEnhancedForm;

interface AdminArtistEnhancedFormProps {
  artist?: Partial<ArtistEnhancedForm>;
  onSubmit: (data: ArtistEnhancedForm) => void;
  isLoading?: boolean;
}

export const AdminArtistEnhancedForm: React.FC<AdminArtistEnhancedFormProps> = ({
  artist,
  onSubmit,
  isLoading = false
}) => {
  const navigate = useNavigate();
  
  const form = useForm<ArtistEnhancedForm>({
    resolver: zodResolver(artistEnhancedSchema),
    defaultValues: {
      name: '',
      handle: '',
      type: 'dj',
      categories: [],
      genres: [],
      city: '',
      country: 'Brasil',
      bio_short: '',
      whatsapp: '',
      instagram: '',
      profile_image_url: '',
      profile_image_alt: '',
      links: {
        instagram: '',
      },
      gallery: [],
      status: 'draft',
      priority: 0,
      ...artist,
    },
  });

  // Auto-generate slug from handle
  const handle = form.watch('handle');
  useEffect(() => {
    if (handle && !artist?.slug) {
      const slug = handle
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '');
      form.setValue('slug', slug);
    }
  }, [handle, form, artist?.slug]);

  const handleSubmit = (data: ArtistEnhancedForm) => {
    // Additional type-specific validation
    const typeErrors = validateArtistByType(data);
    if (typeErrors.length > 0) {
      // You could show these errors in a toast or similar
      console.error('Type validation errors:', typeErrors);
    }
    
    onSubmit(data);
  };

  const artistType = form.watch('type');

  const tabs = [
    {
      id: 'basic',
      label: 'Informações Básicas',
      content: <ArtistBasicFields form={form} />
    },
    {
      id: 'contact',
      label: 'Contato & Localização',
      content: <ArtistContactFields form={form} />
    },
    {
      id: 'type-specific',
      label: 'Informações Específicas',
      content: <ArtistTypeFields form={form} artistType={artistType} />
    },
    {
      id: 'media',
      label: 'Mídia & Links',
      content: <ArtistMediaFields form={form} />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin-v3/agentes/artistas')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {artist ? 'Editar Artista' : 'Novo Artista'}
            </h1>
            <p className="text-muted-foreground">
              {artist ? 'Atualize as informações do artista' : 'Cadastre um novo artista no sistema'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <TabsWrapper
            title="Perfil do Artista"
            tabs={tabs}
          />
        </form>
      </Form>
    </div>
  );
};