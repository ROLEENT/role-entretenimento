import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { organizerSchema, type OrganizerFormData } from '@/lib/organizerSchema';
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

interface OrganizerFormProps {
  mode: 'create' | 'edit';
}

export default function OrganizerForm({ mode }: OrganizerFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [newCity, setNewCity] = useState('');
  const [newGenre, setNewGenre] = useState('');

  const form = useForm<OrganizerFormData>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      name: '',
      type: 'organizador',
      city: '',
      contact_email: '',
      contact_whatsapp: '',
      instagram: '',
      cities_active: [],
      genres: [],
      status: 'active',
      priority: 0,
    }
  });

  const watchedCities = form.watch('cities_active');
  const watchedGenres = form.watch('genres');

  useEffect(() => {
    if (mode === 'edit' && id) {
      // TODO: Fetch organizer data
      setLoading(true);
      // Simulated fetch - replace with actual API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [mode, id]);

  const onSubmit = async (data: OrganizerFormData) => {
    try {
      setLoading(true);
      
      // Generate slug from name
      const slug = data.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const organizerData = {
        ...data,
        slug,
        cities_active: cities,
        genres: genres,
      };

      console.log('Organizer data:', organizerData);
      
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: mode === 'create' ? 'Organizador criado!' : 'Organizador atualizado!',
        description: 'Os dados foram salvos com sucesso.',
      });

      navigate('/admin-v2/organizers');
    } catch (error) {
      console.error('Error saving organizer:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar organizador.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addCity = () => {
    if (newCity.trim() && !cities.includes(newCity.trim())) {
      setCities(prev => [...prev, newCity.trim()]);
      setNewCity('');
    }
  };

  const removeCity = (cityToRemove: string) => {
    setCities(prev => prev.filter(city => city !== cityToRemove));
  };

  const addGenre = () => {
    if (newGenre.trim() && !genres.includes(newGenre.trim())) {
      setGenres(prev => [...prev, newGenre.trim()]);
      setNewGenre('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setGenres(prev => prev.filter(genre => genre !== genreToRemove));
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
          {mode === 'create' ? 'Criar Organizador' : 'Editar Organizador'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'create' 
            ? 'Cadastre um novo organizador, produtora ou coletivo'
            : 'Edite as informações do organizador'
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
                      <FormLabel>Nome Oficial *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do organizador..." {...field} />
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
                      <FormLabel>Tipo de Perfil *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="organizador">Organizador</SelectItem>
                          <SelectItem value="produtora">Produtora</SelectItem>
                          <SelectItem value="coletivo">Coletivo</SelectItem>
                          <SelectItem value="selo">Selo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade Sede *</FormLabel>
                      <FormControl>
                        <Input placeholder="Porto Alegre, São Paulo..." {...field} />
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
                        <Input placeholder="(51) 99999-9999" {...field} />
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
              </div>

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo do Projeto *</FormLabel>
                    <FormControl>
                      <AdminFileUpload
                        bucket="organizers"
                        currentUrl={field.value}
                        onUploadComplete={(url) => field.onChange(url)}
                        label="Selecionar Logo"
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
              <FormField
                control={form.control}
                name="bio_short"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio Curta (200-300 caracteres)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição breve do organizador..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      {field.value?.length || 0}/300 caracteres
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site ou Linktree</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linktr.ee/usuario" {...field} />
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
                      <FormLabel>Portfólio ou Mídia Kit</FormLabel>
                      <FormControl>
                        <Input placeholder="https://portfolio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cidades onde atua */}
              <div className="space-y-2">
                <FormLabel>Cidades onde Atua</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar cidade..."
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                  />
                  <Button type="button" onClick={addCity}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Badge key={city} variant="secondary" className="gap-1">
                      {city}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeCity(city)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Gêneros principais */}
              <div className="space-y-2">
                <FormLabel>Principais Gêneros ou Cenas</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar gênero..."
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                  />
                  <Button type="button" onClick={addGenre}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="gap-1">
                      {genre}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeGenre(genre)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto de Capa</FormLabel>
                    <FormControl>
                      <AdminFileUpload
                        bucket="organizers"
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

          {/* Campos Internos */}
          <Card>
            <CardHeader>
              <CardTitle>Campos Internos (não exibir no site)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Diretor, Produtor..." {...field} />
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
                      <FormLabel>WhatsApp de Booking</FormLabel>
                      <FormControl>
                        <Input placeholder="(51) 99999-9999" {...field} />
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
                      <FormLabel>Email de Contrato</FormLabel>
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
                    <FormLabel>Observações Internas do ROLÊ</FormLabel>
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
                      <FormLabel>Prioridade de Exibição</FormLabel>
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
            </CardContent>
          </Card>

          <Separator />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (mode === 'create' ? 'Criar Organizador' : 'Salvar Alterações')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin-v2/organizers')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}