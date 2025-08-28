import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { venueSchema, type VenueFormData } from '@/lib/venueSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminFileUpload } from '@/components/ui/admin-file-upload';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { withAdminAuth } from '@/components/withAdminAuth';

interface VenueFormProps {
  mode: 'create' | 'edit';
}

function VenueForm({ mode }: VenueFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');
  const [newAccessibility, setNewAccessibility] = useState('');

  const form = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: '',
      type: 'bar',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      maps_url: '',
      instagram: '',
      booking_email: '',
      booking_whatsapp: '',
      resources: [],
      accessibility: [],
      extra_photos: [],
      status: 'active',
      priority: 0,
    }
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      // TODO: Fetch venue data
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [mode, id]);

  const onSubmit = async (data: VenueFormData) => {
    try {
      setLoading(true);
      
      const slug = data.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const venueData = {
        ...data,
        slug,
        resources,
        accessibility,
      };

      console.log('Venue data:', venueData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: mode === 'create' ? 'Local criado!' : 'Local atualizado!',
        description: 'Os dados foram salvos com sucesso.',
      });

      navigate('/admin-v2/venues');
    } catch (error) {
      console.error('Error saving venue:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar local.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addResource = () => {
    if (newResource.trim() && !resources.includes(newResource.trim())) {
      setResources(prev => [...prev, newResource.trim()]);
      setNewResource('');
    }
  };

  const removeResource = (resourceToRemove: string) => {
    setResources(prev => prev.filter(resource => resource !== resourceToRemove));
  };

  const addAccessibilityItem = () => {
    if (newAccessibility.trim() && !accessibility.includes(newAccessibility.trim())) {
      setAccessibility(prev => [...prev, newAccessibility.trim()]);
      setNewAccessibility('');
    }
  };

  const removeAccessibilityItem = (itemToRemove: string) => {
    setAccessibility(prev => prev.filter(item => item !== itemToRemove));
  };

  if (loading && mode === 'edit') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Criar Local' : 'Editar Local'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'create' 
            ? 'Cadastre um novo local, casa, teatro, bar ou clube'
            : 'Edite as informações do local'
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campos Obrigatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Campos Obrigatórios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Local *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do local..." {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="clube">Clube</SelectItem>
                          <SelectItem value="casa_de_shows">Casa de Shows</SelectItem>
                          <SelectItem value="teatro">Teatro</SelectItem>
                          <SelectItem value="galeria">Galeria</SelectItem>
                          <SelectItem value="espaco_cultural">Espaço Cultural</SelectItem>
                          <SelectItem value="restaurante">Restaurante</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Endereço Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, bairro..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade *</FormLabel>
                      <FormControl>
                        <Input placeholder="Porto Alegre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <FormControl>
                        <Input placeholder="RS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP *</FormLabel>
                      <FormControl>
                        <Input placeholder="90000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maps_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do Google Maps *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.google.com/..." {...field} />
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
                        <Input placeholder="@usuario (sem https://)" {...field} />
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
                      <FormLabel>Email de Booking *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="booking@local.com" {...field} />
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
                      <FormLabel>WhatsApp de Booking *</FormLabel>
                      <FormControl>
                        <Input placeholder="(51) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto de Capa do Local *</FormLabel>
                    <FormControl>
                      <AdminFileUpload
                        bucket="venues"
                        currentUrl={field.value}
                        onUploadComplete={(url) => field.onChange(url)}
                        label="Selecionar Foto de Capa"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Campos Complementares */}
          <Card>
            <CardHeader>
              <CardTitle>Campos Complementares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade Aproximada</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="300"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade Mínima</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="18"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.local.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="opening_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Funcionamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ter-Sáb: 19h às 3h" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recursos */}
              <div className="space-y-2">
                <FormLabel>Recursos Disponíveis</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="palco, som, luz, camarim..."
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                  />
                  <Button type="button" onClick={addResource}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resources.map((resource) => (
                    <Badge key={resource} variant="secondary" className="gap-1">
                      {resource}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeResource(resource)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Acessibilidade */}
              <div className="space-y-2">
                <FormLabel>Acessibilidade</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="rampa, elevador, banheiro PCD..."
                    value={newAccessibility}
                    onChange={(e) => setNewAccessibility(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAccessibilityItem())}
                  />
                  <Button type="button" onClick={addAccessibilityItem}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {accessibility.map((item) => (
                    <Badge key={item} variant="secondary" className="gap-1">
                      {item}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeAccessibilityItem(item)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="photo_policy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Política de Registro de Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="Pode filmar, restrito, sem celular..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Campos Internos */}
          <Card>
            <CardHeader>
              <CardTitle>Campos Internos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="responsible_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável pelo Espaço</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações do ROLÊ</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações internas..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
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
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="-30.0346"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="-51.2177"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (mode === 'create' ? 'Criar Local' : 'Salvar Alterações')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin-v2/venues')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default withAdminAuth(VenueForm, 'editor');