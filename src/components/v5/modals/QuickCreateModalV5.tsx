import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { useCities } from '@/hooks/useCities';
import { useVenueTypes } from '@/hooks/useVenueTypes';
import { useDebouncedCallback } from 'use-debounce';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

// V5 Components
import { RHFText } from '@/components/v5/forms/RHFText';
import { RHFTextarea } from '@/components/v5/forms/RHFTextarea';
import { RHFSlug } from '@/components/v5/forms/RHFSlug';
import { RHFSelect } from '@/components/v5/forms/RHFSelect';

// Hooks
import { useAgentManagement } from '@/hooks/useAgentManagement';

type AgentType = 'artist' | 'venue' | 'organizer';

// Simplified schema for quick create - just the essential fields
const quickCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  city_id: z.number().min(1, "Cidade é obrigatória"),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(), 
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  bio_short: z.string().min(10, "Bio deve ter pelo menos 10 caracteres"),
  // Artist specific
  artist_type: z.enum(['banda', 'dj', 'solo', 'duo']).optional(),
  profile_image_url: z.string().url("URL inválida").optional().or(z.literal("")),
  // Venue specific
  address: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  venue_type_id: z.number().optional(),
  // Organizer specific
  organizer_type: z.enum(['organizador', 'produtora', 'empresa']).optional(),
});

type QuickCreateForm = z.infer<typeof quickCreateSchema>;

interface QuickCreateModalV5Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: AgentType;
  onCreated?: (newAgent: ComboboxAsyncOption) => void;
}

export function QuickCreateModalV5({
  open,
  onOpenChange,
  agentType,
  onCreated,
}: QuickCreateModalV5Props) {
  const { toast } = useToast();
  const { loading, createAgent, checkSlugExists } = useAgentManagement();
  const { cities } = useCities();
  const { venueTypes } = useVenueTypes();
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const defaultValues: Partial<QuickCreateForm> = {
    name: '',
    slug: '',
    city_id: undefined,
    instagram: '',
    whatsapp: '',
    email: '',
    bio_short: '',
    artist_type: 'banda',
    profile_image_url: '',
    address: '',
    capacity: undefined,
    venue_type_id: undefined,
    organizer_type: 'organizador',
  };

  const form = useForm<QuickCreateForm>({
    resolver: zodResolver(quickCreateSchema.partial()),
    mode: 'onChange',
    defaultValues,
  });

  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');

  // Auto-generate slug when name changes
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === 'name' && value.name && !form.getValues('slug')) {
        const slug = value.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        
        if (slug) {
          form.setValue('slug', slug, { shouldDirty: true });
        }
      }
    });
    
    return () => subscription.unsubscribe?.();
  }, [form]);

  // Check slug availability with debounce
  const debouncedSlugCheck = useDebouncedCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const exists = await checkSlugExists(slug);
    setSlugStatus(exists ? 'taken' : 'available');
  }, 500);

  useEffect(() => {
    if (slugValue) {
      debouncedSlugCheck(slugValue);
    }
  }, [slugValue, debouncedSlugCheck]);

  const onSubmit = async (data: QuickCreateForm) => {
    if (slugStatus === 'taken') {
      toast({
        title: "Erro",
        description: "Este slug já está em uso. Escolha outro.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert to AgentFormValues format for useAgentManagement
      const agentData = {
        type: agentType,
        name: data.name,
        slug: data.slug,
        city_id: data.city_id,
        instagram: data.instagram,
        whatsapp: data.whatsapp,
        email: data.email,
        bio_short: data.bio_short,
        status: 'draft' as const,
        ...(agentType === 'artist' && {
          artist_subtype: data.artist_type,
          profile_image_url: data.profile_image_url,
        }),
        ...(agentType === 'venue' && {
          address: data.address,
          capacity: data.capacity,
          venue_type_id: data.venue_type_id,
        }),
        ...(agentType === 'organizer' && {
          organizer_subtype: data.organizer_type,
        }),
      };

      const agentId = await createAgent(agentData as any);
      if (agentId) {
        const selectedCity = cities.find(c => c.id === data.city_id);
        
        const newAgent: ComboboxAsyncOption = {
          id: agentId,
          name: data.name,
          city: selectedCity?.name,
          value: agentId,
          subtitle: agentType === 'venue' ? data.address : 
                    agentType === 'organizer' ? data.email : undefined,
        };

        onCreated?.(newAgent);
        form.reset(defaultValues);
        setSlugStatus('idle');
        onOpenChange(false);
        
        toast({
          title: "Sucesso",
          description: `${getAgentTypeLabel()} criado e selecionado com sucesso!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar agente. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    setSlugStatus('idle');
    onOpenChange(false);
  };

  const getAgentTypeLabel = () => {
    switch (agentType) {
      case 'artist': return 'Artista';
      case 'venue': return 'Local';
      case 'organizer': return 'Organizador';
      default: return 'Agente';
    }
  };

  const getSlugStatusIcon = () => {
    switch (slugStatus) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'taken':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const cityOptions = cities.map(city => ({
    value: city.id.toString(),
    label: `${city.name} – ${city.uf}`,
  }));

  const venueTypeOptions = venueTypes.map(type => ({
    value: type.id.toString(),
    label: type.name,
  }));

  const artistTypeOptions = [
    { value: 'banda', label: 'Banda' },
    { value: 'dj', label: 'DJ' },
    { value: 'solo', label: 'Artista Solo' },
    { value: 'duo', label: 'Duo' },
  ];

  const organizerTypeOptions = [
    { value: 'organizador', label: 'Organizador' },
    { value: 'produtora', label: 'Produtora' },
    { value: 'empresa', label: 'Empresa' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar {getAgentTypeLabel()}</DialogTitle>
          <DialogDescription>
            Preencha as informações básicas para criar um novo {getAgentTypeLabel().toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <RHFText
                name="name"
                label="Nome"
                placeholder="Nome do agente"
                required
              />

              {/* Slug */}
              <div className="relative">
                <RHFSlug
                  name="slug"
                  label="Slug"
                  table={agentType === 'artist' ? 'artists' : agentType === 'venue' ? 'venues' : 'organizers'}
                  generateFrom="name"
                />
                <div className="absolute right-3 top-9">
                  {getSlugStatusIcon()}
                </div>
                {slugStatus !== 'idle' && (
                  <p className={`text-sm mt-1 ${
                    slugStatus === 'available' ? 'text-green-600' :
                    slugStatus === 'taken' ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {slugStatus === 'checking' ? 'Verificando disponibilidade...' :
                     slugStatus === 'available' ? 'Slug disponível' : 'Slug já está em uso'}
                  </p>
                )}
              </div>

              {/* Cidade */}
              <RHFSelect
                name="city_id"
                label="Cidade"
                placeholder="Selecione a cidade"
                options={cityOptions}
              />

              {/* Instagram */}
              <RHFText
                name="instagram"
                label="Instagram"
                placeholder="@usuario ou usuario"
              />

              {/* WhatsApp */}
              <RHFText
                name="whatsapp"
                label="WhatsApp"
                placeholder="(11) 99999-9999"
              />

              {/* Email */}
              <RHFText
                name="email"
                label="Email"
                placeholder="email@exemplo.com"
                type="email"
              />
            </div>

            {/* Bio Curta */}
            <RHFTextarea
              name="bio_short"
              label="Bio Curta"
              placeholder="Descrição breve..."
              rows={3}
              required
            />

            {/* Campos Específicos por Tipo */}
            {agentType === 'artist' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RHFSelect
                    name="artist_type"
                    label="Tipo de Artista"
                    placeholder="Selecione o tipo"
                    options={artistTypeOptions}
                  />
                  
                  <RHFText
                    name="profile_image_url"
                    label="URL da Foto"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>
              </div>
            )}

            {agentType === 'venue' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RHFSelect
                    name="venue_type_id"
                    label="Tipo do Local"
                    placeholder="Selecione o tipo"
                    options={venueTypeOptions}
                  />
                  
                  <RHFText
                    name="capacity"
                    label="Capacidade"
                    placeholder="200"
                    type="number"
                  />
                </div>

                <RHFText
                  name="address"
                  label="Endereço"
                  placeholder="Rua, número - bairro"
                />
              </div>
            )}

            {agentType === 'organizer' && (
              <RHFSelect
                name="organizer_type"
                label="Tipo de Organizador"
                placeholder="Selecione o tipo"
                options={organizerTypeOptions}
              />
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || slugStatus === 'taken'}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar'
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}