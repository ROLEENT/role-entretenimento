import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizerSchema, type OrganizerFormData } from '@/lib/organizerSchema';
import { useAdminV2Auth } from '@/hooks/useAdminV2Auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminFileUpload } from '@/components/ui/admin-file-upload';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { useToast } from '@/hooks/use-toast';

const organizerTypes = [
  { value: 'organizador', label: 'Organizador' },
  { value: 'produtora', label: 'Produtora' },
  { value: 'coletivo', label: 'Coletivo' },
  { value: 'selo', label: 'Selo' },
];

const cities = [
  'Porto Alegre',
  'São Paulo',
  'Rio de Janeiro',
  'Florianópolis',
  'Curitiba',
  'Belo Horizonte',
  'Salvador',
  'Brasília',
  'Recife',
  'Fortaleza'
];

const musicGenres = [
  'Rock',
  'Pop',
  'Eletrônica',
  'Hip Hop',
  'Reggae',
  'Folk',
  'Jazz',
  'Blues',
  'Country',
  'Funk',
  'MPB',
  'Sertanejo',
  'Forró',
  'Pagode',
  'Samba'
];

interface OrganizerFormProps {
  mode: 'create' | 'edit';
}

export default function OrganizerForm({ mode }: OrganizerFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAdminV2Auth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [tempCity, setTempCity] = useState('');
  const [tempGenre, setTempGenre] = useState('');

  const form = useForm<OrganizerFormData>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      name: '',
      type: 'organizador',
      city: '',
      contact_email: '',
      contact_whatsapp: '',
      instagram: '',
      logo_url: '',
      bio_short: '',
      bio_long: '',
      website_url: '',
      portfolio_url: '',
      cover_image_url: '',
      cities_active: [],
      genres: [],
      responsible_name: '',
      responsible_role: '',
      booking_whatsapp: '',
      booking_email: '',
      internal_notes: '',
      status: 'active',
      priority: 0,
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors, isValid } } = form;
  const citiesActive = watch('cities_active');
  const genres = watch('genres');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
      if (e.key === 'Escape') {
        navigate('/admin-v2/organizers');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, navigate]);

  // Carregar dados para edição
  useEffect(() => {
    if (mode === 'edit' && id) {
      loadOrganizer();
    }
  }, [mode, id]);

  const loadOrganizer = async () => {
    try {
      // Mock data - em produção seria uma chamada à API
      setTimeout(() => {
        form.reset({
          name: 'Produtora Music Wave',
          type: 'produtora',
          city: 'Porto Alegre',
          contact_email: 'contato@musicwave.com',
          contact_whatsapp: '+5551999999999',
          instagram: '@musicwave',
          bio_short: 'Produtora especializada em eventos eletrônicos',
          bio_long: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
          website_url: 'https://musicwave.com',
          cities_active: ['Porto Alegre', 'São Paulo'],
          genres: ['Eletrônica', 'House'],
          status: 'active',
          priority: 0,
        });
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Erro ao carregar organizador:', error);
      setLoading(false);
    }
  };

  const onSubmit = async (data: OrganizerFormData) => {
    setSaving(true);
    try {
      // Aqui seria a chamada à API
      console.log('Dados do organizador:', data);
      
      toast({
        title: mode === 'create' ? 'Organizador criado!' : 'Organizador atualizado!',
        description: `O organizador foi ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso.`,
      });
      
      navigate('/admin-v2/organizers');
    } catch (error: any) {
      console.error('Erro ao salvar organizador:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addCity = () => {
    if (tempCity.trim() && !citiesActive.includes(tempCity.trim())) {
      setValue('cities_active', [...citiesActive, tempCity.trim()]);
      setTempCity('');
    }
  };

  const removeCity = (cityToRemove: string) => {
    setValue('cities_active', citiesActive.filter(city => city !== cityToRemove));
  };

  const addGenre = () => {
    if (tempGenre.trim() && !genres.includes(tempGenre.trim())) {
      setValue('genres', [...genres, tempGenre.trim()]);
      setTempGenre('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setValue('genres', genres.filter(genre => genre !== genreToRemove));
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Carregando organizador..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AdminBreadcrumbs />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin-v2/organizers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Criar Novo Organizador' : 'Editar Organizador'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create' 
                ? 'Preencha os dados do novo organizador'
                : 'Altere os dados do organizador selecionado'
              }
            </p>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd> para salvar • 
          <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">Esc</kbd> para voltar
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campos Obrigatórios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Produtora Music Wave" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {organizerTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade Principal *</FormLabel>
                        <FormControl>
                          <Input placeholder="Porto Alegre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contato *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contato@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp *</FormLabel>
                        <FormControl>
                          <Input placeholder="+5551999999999" {...field} />
                        </FormControl>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campos Complementares</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <AdminFileUpload
                          bucket="organizers"
                          currentUrl={field.value}
                          onUploadComplete={field.onChange}
                          label="Logo do Organizador"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cover_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagem de Capa</FormLabel>
                        <AdminFileUpload
                          bucket="organizers"
                          currentUrl={field.value}
                          onUploadComplete={field.onChange}
                          label="Imagem de Capa"
                        />
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
                            placeholder="Descrição curta para cards e listagens..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground text-right">
                          {field.value?.length || 0}/300 caracteres
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio_long"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio Longa</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descrição completa para página de perfil..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground text-right">
                          {field.value?.length || 0}/1500 caracteres
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portfolio_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfólio</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cidades de Atuação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar cidade..."
                      value={tempCity}
                      onChange={(e) => setTempCity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                    />
                    <Button type="button" onClick={addCity} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {citiesActive.map((city) => (
                      <Badge key={city} variant="secondary" className="flex items-center gap-1">
                        {city}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeCity(city)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gêneros Musicais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar gênero..."
                      value={tempGenre}
                      onChange={(e) => setTempGenre(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                    />
                    <Button type="button" onClick={addGenre} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                        {genre}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeGenre(genre)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campos Internos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="responsible_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Responsável</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="responsible_role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo do Responsável</FormLabel>
                          <FormControl>
                            <Input placeholder="Diretor" {...field} />
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
                          <FormLabel>WhatsApp Booking</FormLabel>
                          <FormControl>
                            <Input placeholder="+5551999999999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="booking_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Booking</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="booking@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="internal_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações Internas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notas para uso interno da equipe..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="inactive">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => navigate('/admin-v2/organizers')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !isValid}>
              {saving ? 'Salvando...' : mode === 'create' ? 'Criar Organizador' : 'Atualizar Organizador'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}