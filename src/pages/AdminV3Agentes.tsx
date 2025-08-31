'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormProvider } from 'react-hook-form';
import CitySelect from '@/components/fields/CitySelect';
import VenueTypeSelect from '@/components/fields/VenueTypeSelect';
import ArtistSubtypeSelect from '@/components/fields/ArtistSubtypeSelect';
import SimpleSelect from '@/components/form/SimpleSelect';
import OrganizerSubtypeSelect from '@/components/fields/OrganizerSubtypeSelect';
import StatusSelect from '@/components/fields/StatusSelect';
import { useToast } from '@/hooks/use-toast';
import { 
  AgentSchema,
  AgentFormValues,
  AGENT_TYPES
} from '@/lib/agentSchema';
import { useCities } from '@/hooks/useCities';
import { useVenueTypes } from '@/hooks/useVenueTypes';
import { useAgentManagement } from '@/hooks/useAgentManagement';
import { Users, Check, AlertCircle } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from '@/lib/utils';

function AgentesContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, createAgent, checkSlugExists } = useAgentManagement();
  const { cities } = useCities();
  const { venueTypes } = useVenueTypes();
  
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(AgentSchema),
    mode: 'onChange',
    shouldUnregister: false, // Don't unregister fields when switching tabs
    defaultValues: { 
      type: 'artist', 
      name: '', 
      slug: '',
      status: 'draft',
      city_id: undefined
    },
  });

  const watchedType = form.watch('type');
  
  // Auto-fill city from URL context or admin preference
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromUrl = urlParams.get('city_id');
    
    if (cityFromUrl && !form.getValues('city_id')) {
      const cityId = parseInt(cityFromUrl);
      if (!isNaN(cityId)) {
        form.setValue('city_id', cityId, { shouldDirty: false });
      }
    }
  }, [form]);

  // Handle URL params once and preserve form state between type changes
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const t = searchParams.get('type');
    if (t && ['artist', 'venue', 'organizer'].includes(t)) {
      // Only set type if it's different to avoid unnecessary re-renders
      if (form.getValues('type') !== t) {
        form.setValue('type', t as 'artist'|'venue'|'organizer', { shouldDirty: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate slug when name changes - improved implementation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name && !form.getValues('slug')) {
        const slug = value.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
          .trim()
          .replace(/\s+/g, '-'); // Replace spaces with hyphens
        
        if (slug) {
          form.setValue('slug', slug, { shouldDirty: true });
        }
      }
    });
    
    return () => subscription.unsubscribe?.();
  }, [form]);

  // Debounced slug availability check
  const debouncedSlugCheck = useDebouncedCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const exists = await checkSlugExists(slug, watchedType);
    setSlugStatus(exists ? 'taken' : 'available');
  }, 500);

  // Watch slug changes for availability check
  const slugValue = form.watch('slug');
  useEffect(() => {
    if (slugValue) {
      debouncedSlugCheck(slugValue);
    }
  }, [slugValue, watchedType, debouncedSlugCheck]);

  const onSubmit = async (values: AgentFormValues) => {
    if (slugStatus === 'taken') {
      toast({
        title: "Erro",
        description: "Este slug já está em uso. Escolha outro.",
        variant: "destructive"
      });
      return;
    }

    try {
      const agentId = await createAgent(values);
      if (agentId) {
        // Reset form but preserve type and city context
        const currentCityId = form.getValues('city_id');
        form.reset({ 
          type: watchedType, 
          name: '', 
          slug: '', 
          status: 'draft',
          city_id: currentCityId // Preserve city context
        });
        setSlugStatus('idle');
        
        toast({
          title: "Sucesso",
          description: "Agente criado com sucesso!",
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

  const saving = form.formState.isSubmitting;
  const canSave = form.formState.isValid && form.formState.isDirty && !saving;

  const getSlugStatusIcon = () => {
    switch (slugStatus) {
      case 'checking':
        return <div className="animate-spin w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'taken':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Criar Agente</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Cadastre artistas, locais ou organizadores
          </p>
        </div>
      </div>

      <FormProvider {...form}>
        <form id="admin-agents-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Agent Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tipo de Agente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 md:grid-cols-3"
                >
                  <label className={cn(
                    "rounded-xl border p-4 cursor-pointer transition-all hover:bg-muted/50",
                    field.value === 'artist' && "ring-2 ring-primary bg-primary/5"
                  )}>
                    <RadioGroupItem className="sr-only" id="type-artist" value="artist" />
                    <span className="font-medium">Artista</span>
                  </label>
                  <label className={cn(
                    "rounded-xl border p-4 cursor-pointer transition-all hover:bg-muted/50",
                    field.value === 'venue' && "ring-2 ring-primary bg-primary/5"
                  )}>
                    <RadioGroupItem className="sr-only" id="type-venue" value="venue" />
                    <span className="font-medium">Local</span>
                  </label>
                  <label className={cn(
                    "rounded-xl border p-4 cursor-pointer transition-all hover:bg-muted/50",
                    field.value === 'organizer' && "ring-2 ring-primary bg-primary/5"
                  )}>
                    <RadioGroupItem className="sr-only" id="type-organizer" value="organizer" />
                    <span className="font-medium">Organizador</span>
                  </label>
                </RadioGroup>
              )}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Nome *</Label>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Input 
                      id="agent-name" 
                      placeholder="Nome do agente" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear slug when name changes significantly
                        const currentSlug = form.getValues('slug');
                        if (currentSlug && e.target.value.length < 3) {
                          form.setValue('slug', '', { shouldDirty: true });
                        }
                      }}
                    />
                  )}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-slug">Slug *</Label>
                <div className="relative">
                  <Controller
                    name="slug"
                    control={form.control}
                    render={({ field }) => (
                      <Input 
                        id="agent-slug" 
                        placeholder="slug-automatico" 
                        {...field} 
                        className="pr-10"
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset slug status when manually editing
                          if (slugStatus !== 'idle') {
                            setSlugStatus('idle');
                          }
                        }}
                      />
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getSlugStatusIcon()}
                  </div>
                </div>
                {slugStatus !== 'idle' && (
                  <p className={`text-xs ${
                    slugStatus === 'available' ? 'text-green-600' :
                    slugStatus === 'taken' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {slugStatus === 'checking' ? 'Verificando disponibilidade...' :
                     slugStatus === 'available' ? 'Slug disponível' : 'Slug já está em uso'}
                  </p>
                )}
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Cidade (Teste Simples)</Label>
                <Controller
                  name="city_id"
                  control={form.control}
                  render={({ field }) => (
                    <SimpleSelect 
                      onValueChange={(value) => {
                        console.log("[AdminV3Agentes] City selected:", value);
                        field.onChange(Number(value));
                      }}
                      placeholder="Selecione a cidade"
                    />
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cidade (Original)</Label>
                <CitySelect name="city_id" placeholder="Selecione a cidade" />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <StatusSelect name="status" placeholder="Status" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Controller
                  name="instagram"
                  control={form.control}
                  render={({ field }) => (
                    <Input 
                      placeholder="@usuario ou usuario" 
                      {...field}
                      value={field.value ? `@${field.value.replace(/^@+/, '')}` : ''}
                      onChange={(e) => field.onChange(e.target.value.replace(/^@+/, ''))}
                    />
                  )}
                />
                {form.formState.errors.instagram && (
                  <p className="text-sm text-destructive">{form.formState.errors.instagram.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Controller
                  name="whatsapp"
                  control={form.control}
                  render={({ field }) => (
                    <Input 
                      placeholder="(11) 99999-9999" 
                      {...field}
                      value={field.value ? field.value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        field.onChange(digits);
                      }}
                    />
                  )}
                />
                {form.formState.errors.whatsapp && (
                  <p className="text-sm text-destructive">{form.formState.errors.whatsapp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field }) => <Input type="email" placeholder="email@exemplo.com" {...field} />}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Website</Label>
                <Controller
                  name="website"
                  control={form.control}
                  render={({ field }) => <Input placeholder="https://exemplo.com" {...field} />}
                />
              </div>

              <div className="space-y-2">
                <Label>Bio Curta</Label>
                <Controller
                  name="bio_short"
                  control={form.control}
                  render={({ field }) => <Textarea placeholder="Descrição breve..." maxLength={280} rows={3} {...field} />}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type-specific fields */}
        {watchedType === 'artist' && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Artista</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Tipo de Artista</Label>
                    <ArtistSubtypeSelect name="artist_subtype" placeholder="Tipo de artista" />
                  </div>

                <div className="space-y-2">
                  <Label>Spotify URL</Label>
                  <Controller
                    name="spotify_url"
                    control={form.control}
                    render={({ field }) => <Input placeholder="https://spotify.com/..." {...field} />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>SoundCloud URL</Label>
                  <Controller
                    name="soundcloud_url"
                    control={form.control}
                    render={({ field }) => <Input placeholder="https://soundcloud.com/..." {...field} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Controller
                    name="youtube_url"
                    control={form.control}
                    render={({ field }) => <Input placeholder="https://youtube.com/..." {...field} />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Beatport URL</Label>
                  <Controller
                    name="beatport_url"
                    control={form.control}
                    render={({ field }) => <Input placeholder="https://beatport.com/..." {...field} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Presskit URL</Label>
                  <Controller
                    name="presskit_url"
                    control={form.control}
                    render={({ field }) => <Input placeholder="https://..." {...field} />}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Image URL</Label>
                <Controller
                  name="profile_image_url"
                  control={form.control}
                  render={({ field }) => <Input placeholder="https://..." {...field} />}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {watchedType === 'venue' && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Local</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Tipo de Local</Label>
                    <VenueTypeSelect name="venue_type_id" placeholder="Tipo de local" />
                  </div>

                <div className="space-y-2">
                  <Label>Capacidade</Label>
                  <Controller
                    name="capacity"
                    control={form.control}
                    render={({ field }) => <Input type="number" placeholder="Capacidade" {...field} />}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Endereço</Label>
                <Controller
                  name="address"
                  control={form.control}
                  render={({ field }) => <Input placeholder="Endereço completo" {...field} />}
                />
              </div>

              <div className="space-y-2">
                <Label>Bairro</Label>
                <Controller
                  name="neighborhood"
                  control={form.control}
                  render={({ field }) => <Input placeholder="Bairro" {...field} />}
                />
              </div>

              <div className="space-y-2">
                <Label>Regras</Label>
                <Controller
                  name="rules"
                  control={form.control}
                  render={({ field }) => <Textarea placeholder="Regras do local..." rows={3} {...field} />}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {watchedType === 'organizer' && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Organizador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Tipo de Organizador</Label>
                    <OrganizerSubtypeSelect name="organizer_subtype" placeholder="Tipo de organizador" />
                  </div>

                 <div className="space-y-2">
                   <Label>Booking Email</Label>
                   <Controller
                     name="booking_email"
                     control={form.control}
                     render={({ field }) => <Input type="email" placeholder="booking@exemplo.com" {...field} />}
                    />
                  </div>
              </div>

               <div className="space-y-2">
                 <Label>Booking WhatsApp</Label>
                 <Controller
                   name="booking_whatsapp"
                   control={form.control}
                   render={({ field }) => (
                     <Input 
                       placeholder="(11) 99999-9999" 
                       {...field}
                       value={field.value ? field.value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : ''}
                       onChange={(e) => {
                         const digits = e.target.value.replace(/\D/g, '');
                         field.onChange(digits);
                       }}
                      />
                    )}
                  />
                </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => form.reset({ type: watchedType, name: '', slug: '' })}
          >
            Limpar
          </Button>
          <Button 
            type="submit" 
            disabled={!canSave || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Agente'}
          </Button>
        </div>
        </form>
      </FormProvider>
    </div>
  );
}

export default function AdminV3Agentes() {
  return (
    <AdminV3Guard>
      <AdminV3Header />
      <AdminV3Breadcrumb 
        items={[
          { label: 'Admin' },
          { label: 'Agentes' }
        ]} 
      />
      <AgentesContent />
    </AdminV3Guard>
  );
}