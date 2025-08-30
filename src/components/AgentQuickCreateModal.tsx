import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { 
  agentSchema, 
  AgentFormData, 
  ARTIST_SUBTYPES, 
  VENUE_TYPES, 
  ORGANIZER_SUBTYPES
} from '@/lib/agentSchema';
import { useCities } from '@/hooks/useCities';
import { useAgentManagement } from '@/hooks/useAgentManagement';
import { Check, AlertCircle } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';

interface AgentQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: 'artist' | 'venue' | 'organizer';
  onCreated?: (newAgent: ComboboxAsyncOption) => void;
}

export function AgentQuickCreateModal({
  open,
  onOpenChange,
  agentType,
  onCreated,
}: AgentQuickCreateModalProps) {
  const { toast } = useToast();
  const { loading, createAgent, checkSlugExists } = useAgentManagement();
  const { cities } = useCities();
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    mode: 'onChange',
    defaultValues: {
      type: agentType,
      name: '',
      slug: '',
      city_id: undefined,
      instagram: '',
      whatsapp: '',
      email: '',
      website: '',
      bio_short: '',
      status: 'active',
    }
  });

  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');

  // Gerar slug automaticamente quando o nome muda
  React.useEffect(() => {
    if (nameValue && !slugValue) {
      const autoSlug = nameValue
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      form.setValue('slug', autoSlug);
    }
  }, [nameValue, slugValue, form]);

  // Verificar disponibilidade do slug com debounce
  const debouncedSlugCheck = useDebouncedCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const exists = await checkSlugExists(slug);
    setSlugStatus(exists ? 'taken' : 'available');
  }, 500);

  React.useEffect(() => {
    if (slugValue) {
      debouncedSlugCheck(slugValue);
    }
  }, [slugValue, debouncedSlugCheck]);

  const onSubmit = async (data: AgentFormData) => {
    if (slugStatus === 'taken') {
      toast({
        title: "Erro",
        description: "Este slug já está em uso. Escolha outro.",
        variant: "destructive"
      });
      return;
    }

    const agentId = await createAgent(data);
    if (agentId) {
      // Encontrar cidade selecionada para o retorno
      const selectedCity = cities.find(c => c.id === data.city_id);
      
      // Criar objeto para retorno
      const newAgent: ComboboxAsyncOption = {
        id: agentId,
        name: data.name,
        city: selectedCity?.name,
        value: agentId,
        subtitle: agentType === 'venue' ? (data as any).address : 
                  agentType === 'organizer' ? data.email : undefined,
      };

      onCreated?.(newAgent);
      form.reset();
      setSlugStatus('idle');
      onOpenChange(false);
      
      toast({
        title: "Sucesso",
        description: `${getAgentTypeLabel()} criado e selecionado!`,
      });
    }
  };

  const handleCancel = () => {
    form.reset();
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
        return <div className="animate-spin w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'taken':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSlugStatusMessage = () => {
    switch (slugStatus) {
      case 'checking':
        return 'Verificando disponibilidade...';
      case 'available':
        return 'Slug disponível';
      case 'taken':
        return 'Slug já está em uso';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar {getAgentTypeLabel()}</DialogTitle>
          <DialogDescription>
            Preencha as informações básicas para criar um novo {getAgentTypeLabel().toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do agente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="slug-do-agente" {...field} />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {getSlugStatusIcon()}
                        </div>
                      </div>
                    </FormControl>
                    {slugStatus !== 'idle' && (
                      <p className={`text-sm ${
                        slugStatus === 'available' ? 'text-green-600' :
                        slugStatus === 'taken' ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {getSlugStatusMessage()}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel>Cidade *</FormLabel>
                     <Select 
                       onValueChange={(value) => field.onChange(Number(value))} 
                       value={field.value ? String(field.value) : undefined}
                     >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Selecione a cidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={String(city.id)}>
                            {city.name} – {city.uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram *</FormLabel>
                    <FormControl>
                      <Input placeholder="@usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp *</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio_short"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio Curta *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição breve..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos Específicos por Tipo */}
            {agentType === 'artist' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="artist_subtype"
                  render={({ field }) => (
                    <FormItem>
                     <FormLabel>Subtipo *</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Selecione o subtipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ARTIST_SUBTYPES.map((subtype) => (
                            <SelectItem key={subtype.value} value={subtype.value}>
                              {subtype.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Foto *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemplo.com/foto.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {agentType === 'venue' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="venue_type"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel>Tipo do Local *</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                           <FormControl>
                             <SelectTrigger>
                               <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VENUE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidade</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="200" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço *</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número - bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {agentType === 'organizer' && (
              <FormField
                control={form.control}
                name="organizer_subtype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o subtipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORGANIZER_SUBTYPES.map((subtype) => (
                          <SelectItem key={subtype.value} value={subtype.value}>
                            {subtype.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
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
                disabled={!form.formState.isValid || !form.formState.isDirty || loading || slugStatus === 'taken'}
              >
                {loading ? 'Criando...' : 'Criar e Selecionar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}