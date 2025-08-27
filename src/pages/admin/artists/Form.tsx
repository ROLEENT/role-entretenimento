import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { artistSchema, type ArtistFormData } from '@/lib/artistSchema';
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
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface ArtistFormProps {
  mode: 'create' | 'edit';
}

export default function ArtistForm({ mode }: ArtistFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);
  const [newCity, setNewCity] = useState('');
  const [newDay, setNewDay] = useState('');

  const form = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      stage_name: '',
      artist_type: 'solo',
      city: '',
      instagram: '',
      booking_email: '',
      booking_whatsapp: '',
      bio_short: '',
      profile_image_url: '',
      cities_active: [],
      availability_days: [],
      image_rights_authorized: false,
      status: 'active',
      priority: 0,
    }
  });

  const watchedBioShort = form.watch('bio_short');

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      // TODO: Fetch artist data
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [mode, id]);

  const onSubmit = async (data: ArtistFormData) => {
    try {
      setLoading(true);
      
      const slug = data.stage_name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const artistData = {
        ...data,
        slug,
        cities_active: cities,
        availability_days: availabilityDays,
      };

      console.log('Artist data:', artistData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: mode === 'create' ? 'Artista criado!' : 'Artista atualizado!',
        description: 'Os dados foram salvos com sucesso.',
      });

      navigate('/admin-v2/artists');
    } catch (error) {
      console.error('Error saving artist:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar artista.',
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

  const addAvailabilityDay = () => {
    if (newDay.trim() && !availabilityDays.includes(newDay.trim())) {
      setAvailabilityDays(prev => [...prev, newDay.trim()]);
      setNewDay('');
    }
  };

  const removeAvailabilityDay = (dayToRemove: string) => {
    setAvailabilityDays(prev => prev.filter(day => day !== dayToRemove));
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
          {mode === 'create' ? 'Criar Artista' : 'Editar Artista'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'create' 
            ? 'Cadastre um novo artista, banda, DJ ou drag'
            : 'Edite as informações do artista'
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Identificação */}
          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stage_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Artístico *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome artístico..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="artist_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Artista *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="banda">Banda</SelectItem>
                          <SelectItem value="dj">DJ</SelectItem>
                          <SelectItem value="solo">Artista Solo</SelectItem>
                          <SelectItem value="drag">Drag</SelectItem>
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
                      <FormLabel>Cidade Base *</FormLabel>
                      <FormControl>
                        <Input placeholder="Porto Alegre, São Paulo..." {...field} />
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
                        <Input type="email" placeholder="booking@artista.com" {...field} />
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
                name="profile_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto de Perfil 1x1 *</FormLabel>
                    <FormControl>
                      <AdminFileUpload
                        bucket="artists"
                        currentUrl={field.value}
                        onUploadComplete={(url) => field.onChange(url)}
                        label="Selecionar Foto de Perfil"
                        className="w-full"
                      />
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
                    <FormLabel>Bio Curta (até 300 caracteres) *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição breve do artista..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      {watchedBioShort?.length || 0}/300 caracteres
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Links e Mídia */}
          <Card>
            <CardHeader>
              <CardTitle>Links e Mídia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="real_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Civil (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pronouns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pronomes (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ele/dele, ela/dela..." {...field} />
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
                      <FormLabel>Site ou Linktree</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linktr.ee/artista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spotify_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spotify</FormLabel>
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
                      <FormLabel>SoundCloud</FormLabel>
                      <FormControl>
                        <Input placeholder="https://soundcloud.com/artista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtube_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/@artista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beatport_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beatport</FormLabel>
                      <FormControl>
                        <Input placeholder="https://beatport.com/artist/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audius_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audius</FormLabel>
                      <FormControl>
                        <Input placeholder="https://audius.co/artista" {...field} />
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
                    <FormLabel>Foto de Capa 16x9</FormLabel>
                    <FormControl>
                      <AdminFileUpload
                        bucket="artists"
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

              <FormField
                control={form.control}
                name="bio_long"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Longo (até 1500 caracteres)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Biografia completa do artista..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      {field.value?.length || 0}/1500 caracteres
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presskit_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Press Kit</FormLabel>
                    <FormControl>
                      <Input placeholder="https://presskit.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Técnica */}
          <Card>
            <CardHeader>
              <CardTitle>Técnica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="show_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato do Show</FormLabel>
                      <FormControl>
                        <Input placeholder="DJ set, live, banda, performance drag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="set_time_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo de Set (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60"
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
                  name="team_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Pessoas no Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tech_audio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Necessidades de Áudio</FormLabel>
                    <FormControl>
                      <Input placeholder="2 CDJ 3000 + DJM 900, 2 XLR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tech_light"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Necessidades de Luz</FormLabel>
                    <FormControl>
                      <Input placeholder="Mínimo wash no palco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tech_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Necessidades de Palco</FormLabel>
                    <FormControl>
                      <Input placeholder="Mesa 2m, tomada 220V" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tech_rider_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage Plot ou Rider Técnico</FormLabel>
                    <FormControl>
                      <Input placeholder="https://rider.com/documento.pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Comercial e Logística */}
          <Card>
            <CardHeader>
              <CardTitle>Comercial e Logística</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fee_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa de Cachê (interno)</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 500 - R$ 1500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="home_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade de Origem</FormLabel>
                      <FormControl>
                        <Input placeholder="Para cálculo de deslocamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cidades onde atua */}
              <div className="space-y-2">
                <FormLabel>Cidades em que Atua</FormLabel>
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

              {/* Disponibilidade */}
              <div className="space-y-2">
                <FormLabel>Disponibilidade</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Segunda, Terça, Fins de semana..."
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAvailabilityDay())}
                  />
                  <Button type="button" onClick={addAvailabilityDay}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availabilityDays.map((day) => (
                    <Badge key={day} variant="secondary" className="gap-1">
                      {day}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeAvailabilityDay(day)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="accommodation_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações de Hospedagem e Logística</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Necessidades especiais, preferências..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Mídia e Direitos */}
          <Card>
            <CardHeader>
              <CardTitle>Mídia e Direitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="image_rights_authorized"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Autorização de uso de imagem no site do ROLÊ
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Créditos das Fotos</FormLabel>
                    <FormControl>
                      <Input placeholder="Fotógrafo: João Silva" {...field} />
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
              <CardTitle>Interno ROLÊ (não exibir)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="responsible_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável" {...field} />
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
                        <Input placeholder="Manager, Produtor..." {...field} />
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
            </CardContent>
          </Card>

          <Separator />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (mode === 'create' ? 'Criar Artista' : 'Salvar Alterações')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin-v2/artists')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}