import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { 
  agentSchema, 
  AgentFormData, 
  AGENT_TYPES, 
  ARTIST_SUBTYPES, 
  VENUE_TYPES, 
  ORGANIZER_SUBTYPES,
  STATUS_OPTIONS,
  CITIES
} from '@/lib/agentSchema';
import { useAgentManagement } from '@/hooks/useAgentManagement';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useAutosave } from '@/hooks/useAutosave';
import { Users, Check, AlertCircle } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

function AgentesContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, createAgent, checkSlugExists, generateSlug, saveDraft, loadDraft, clearDraft } = useAgentManagement();
  
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isDirty, setIsDirty] = useState(false);
  
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      agent_type: 'artist',
      name: '',
      slug: '',
      city: '',
      instagram: '',
      whatsapp: '',
      email: '',
      website: '',
      bio_short: '',
      status: 'active',
    }
  });

  // Carregar rascunho ao montar o componente
  React.useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      Object.keys(draft).forEach(key => {
        form.setValue(key as keyof AgentFormData, draft[key as keyof AgentFormData]);
      });
      setIsDirty(true);
      toast({
        title: "Rascunho carregado",
        description: "Seus dados anteriores foram restaurados.",
      });
    }
  }, [form, loadDraft, toast]);

  const agentType = form.watch('agent_type');
  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');
  const formValues = form.watch();

  // Monitorar mudanças no formulário
  React.useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Navigation guard
  const { confirmNavigation } = useNavigationGuard({
    when: isDirty,
    message: 'Você tem alterações não salvas. Deseja realmente sair?'
  });

  // Autosave
  useAutosave({
    data: formValues,
    onSave: saveDraft,
    delay: 800,
    enabled: isDirty && !!formValues.name
  });

  // Gerar slug automaticamente quando o nome muda
  React.useEffect(() => {
    if (nameValue && !slugValue) {
      const autoSlug = generateSlug(nameValue);
      form.setValue('slug', autoSlug);
    }
  }, [nameValue, slugValue, form, generateSlug]);

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
      form.reset();
      setSlugStatus('idle');
      setIsDirty(false);
      clearDraft(); // Limpar rascunho após salvar com sucesso
      
      // Navegar para listagem (quando implementada)
      // navigate('/admin-v3/agentes');
      
      toast({
        title: "Sucesso",
        description: "Agente salvo com sucesso! Você pode criar outro.",
      });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      confirmNavigation('/admin-v3');
    } else {
      navigate('/admin-v3');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Agente</h1>
          <p className="text-muted-foreground">
            Cadastre artistas, locais ou organizadores em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={loading || slugStatus === 'taken'}
          >
            {loading ? 'Salvando...' : 'Salvar Agente'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Agente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tipo de Agente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="agent_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Selecione o tipo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-6"
                      >
                        {AGENT_TYPES.map((type) => (
                          <FormItem key={type.value} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={type.value} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {type.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
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
                      <FormLabel>Slug</FormLabel>
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario (sem @)" {...field} />
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
                      <FormLabel>WhatsApp</FormLabel>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio_short"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio Curta</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição breve..."
                          className="resize-none"
                          maxLength={500}
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground text-right">
                        {field.value?.length || 0}/500
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Campos Específicos por Tipo */}
          {agentType === 'artist' && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Artista</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="artist_subtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormLabel>URL da Foto</FormLabel>
                        <FormControl>
                          <Input placeholder="https://exemplo.com/foto.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="spotify_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spotify (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://open.spotify.com/artist/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="soundcloud_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SoundCloud (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://soundcloud.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="youtube_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/c/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="presskit_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Press Kit (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://exemplo.com/presskit.pdf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {agentType === 'venue' && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Local</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="venue_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo do Local</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormLabel>Capacidade (opcional)</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número - bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regras (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Regras da casa, política de entrada, etc..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {agentType === 'organizer' && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Organizador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="organizer_subtype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="booking_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Comercial (opcional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="comercial@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="booking_whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Comercial (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}

export default function AdminV3Agentes() {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-4xl mx-auto">
            <AdminV3Breadcrumb 
              items={[
                { label: 'Dashboard', path: '/admin-v3' },
                { label: 'Agentes' }
              ]} 
            />
            <AgentesContent />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}