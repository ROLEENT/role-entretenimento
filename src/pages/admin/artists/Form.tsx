import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { artistSchema, type ArtistFormData } from '@/lib/artistSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminFileUpload } from '@/components/ui/admin-file-upload';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminEmail } from '@/hooks/useAdminEmail';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { withAdminAuth } from '@/components/withAdminAuth';

interface ArtistFormProps {
  mode: 'create' | 'edit';
}

function ArtistForm({ mode }: ArtistFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const adminEmail = useAdminEmail();
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
      fetchArtist(id);
    }
  }, [mode, id]);

  const fetchArtist = async (artistId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          ...data,
          cities_active: data.cities_active || [],
          availability_days: data.availability_days || [],
          image_rights_authorized: data.image_rights_authorized || false,
          status: data.status || 'active',
          priority: data.priority || 0,
        });
        setCities(data.cities_active || []);
        setAvailabilityDays(data.availability_days || []);
      }
    } catch (error) {
      console.error('Error fetching artist:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o artista.',
        variant: 'destructive',
      });
      navigate('/admin-v2/artists');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ArtistFormData) => {
    setLoading(true);
    try {
      // Gerar slug único
      const baseSlug = data.stage_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      let slug = baseSlug;
      let counter = 1;
      
      // Verificar se slug já existe
      while (true) {
        const { data: existingArtist } = await supabase
          .from('artists')
          .select('id')
          .eq('slug', slug)
          .neq('id', mode === 'edit' ? id : '')
          .single();
        
        if (!existingArtist) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const artistData = {
        ...data,
        slug,
        cities_active: cities,
        availability_days: availabilityDays,
      };

      if (mode === 'create') {
        const { error } = await supabase.from('artists').insert(artistData);
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Artista criado com sucesso!',
        });
      } else {
        const { error } = await supabase
          .from('artists')
          .update(artistData)
          .eq('id', id);
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Artista atualizado com sucesso!',
        });
      }

      navigate('/admin-v2/artists');
    } catch (error) {
      console.error('Error saving artist:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o artista.',
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
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? 'Criar Artista' : 'Editar Artista'}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campos Obrigatórios */}
        <Card>
          <CardHeader>
            <CardTitle>Campos Obrigatórios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage_name">Nome Artístico *</Label>
                <Input
                  id="stage_name"
                  {...form.register('stage_name')}
                  placeholder="Nome artístico..."
                />
                {form.formState.errors.stage_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.stage_name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="artist_type">Tipo de Artista *</Label>
                <Select onValueChange={(value) => form.setValue('artist_type', value as "banda" | "dj" | "solo" | "drag")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banda">Banda</SelectItem>
                    <SelectItem value="dj">DJ</SelectItem>
                    <SelectItem value="solo">Artista Solo</SelectItem>
                    <SelectItem value="drag">Drag</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.artist_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.artist_type.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="city">Cidade Base *</Label>
                <Input
                  id="city"
                  {...form.register('city')}
                  placeholder="Porto Alegre, São Paulo..."
                />
                {form.formState.errors.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="instagram">Instagram *</Label>
                <Input
                  id="instagram"
                  {...form.register('instagram')}
                  placeholder="@usuario (sem https://)"
                />
                {form.formState.errors.instagram && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.instagram.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="booking_email">Email de Booking *</Label>
                <Input
                  id="booking_email"
                  type="email"
                  {...form.register('booking_email')}
                  placeholder="booking@artista.com"
                />
                {form.formState.errors.booking_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.booking_email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="booking_whatsapp">WhatsApp de Booking *</Label>
                <Input
                  id="booking_whatsapp"
                  {...form.register('booking_whatsapp')}
                  placeholder="(51) 99999-9999"
                />
                {form.formState.errors.booking_whatsapp && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.booking_whatsapp.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <AdminFileUpload
                bucket="artists"
                onUploadComplete={(url) => form.setValue('profile_image_url', url)}
                currentUrl={form.watch('profile_image_url')}
                label="Foto de Perfil 1x1 *"
                adminEmail={adminEmail}
              />
              {form.formState.errors.profile_image_url && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.profile_image_url.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bio_short">Bio Curta ({watchedBioShort?.length || 0}/300) *</Label>
              <Textarea
                id="bio_short"
                {...form.register('bio_short')}
                placeholder="Descrição breve do artista..."
                maxLength={300}
                rows={3}
              />
              {form.formState.errors.bio_short && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.bio_short.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campos Complementares */}
        <Card>
          <CardHeader>
            <CardTitle>Campos Complementares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="real_name">Nome Civil</Label>
                <Input
                  id="real_name"
                  {...form.register('real_name')}
                  placeholder="João Silva"
                />
              </div>

              <div>
                <Label htmlFor="pronouns">Pronomes</Label>
                <Input
                  id="pronouns"
                  {...form.register('pronouns')}
                  placeholder="ele/dele, ela/dela..."
                />
              </div>

              <div>
                <Label htmlFor="website_url">Site ou Linktree</Label>
                <Input
                  id="website_url"
                  {...form.register('website_url')}
                  placeholder="https://linktr.ee/artista"
                />
              </div>

              <div>
                <Label htmlFor="spotify_url">Spotify</Label>
                <Input
                  id="spotify_url"
                  {...form.register('spotify_url')}
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>

              <div>
                <Label htmlFor="fee_range">Faixa de Cachê</Label>
                <Input
                  id="fee_range"
                  {...form.register('fee_range')}
                  placeholder="R$ 500 - R$ 1500"
                />
              </div>

              <div>
                <Label htmlFor="home_city">Cidade de Origem</Label>
                <Input
                  id="home_city"
                  {...form.register('home_city')}
                  placeholder="Para cálculo de deslocamento"
                />
              </div>
            </div>

            <div>
              <AdminFileUpload
                bucket="artists"
                onUploadComplete={(url) => form.setValue('cover_image_url', url)}
                currentUrl={form.watch('cover_image_url')}
                label="Foto de Capa 16x9"
                adminEmail={adminEmail}
              />
            </div>

            <div>
              <Label htmlFor="bio_long">Release Longo (até 1500 caracteres)</Label>
              <Textarea
                id="bio_long"
                {...form.register('bio_long')}
                placeholder="Biografia completa do artista..."
                maxLength={1500}
                rows={4}
              />
              <div className="text-sm text-muted-foreground mt-1">
                {form.watch('bio_long')?.length || 0}/1500 caracteres
              </div>
            </div>

            {/* Cidades onde atua */}
            <div>
              <Label>Cidades em que Atua</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Adicionar cidade..."
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                />
                <Button type="button" onClick={addCity} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {cities.map((city) => (
                  <Badge key={city} variant="secondary" className="gap-1">
                    {city}
                    <button
                      type="button"
                      onClick={() => removeCity(city)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Disponibilidade */}
            <div>
              <Label>Disponibilidade</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Segunda, Terça, Fins de semana..."
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAvailabilityDay())}
                />
                <Button type="button" onClick={addAvailabilityDay} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {availabilityDays.map((day) => (
                  <Badge key={day} variant="secondary" className="gap-1">
                    {day}
                    <button
                      type="button"
                      onClick={() => removeAvailabilityDay(day)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Autorização de imagem */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="image_rights_authorized"
                checked={form.watch('image_rights_authorized')}
                onCheckedChange={(value) => form.setValue('image_rights_authorized', value as boolean)}
              />
              <Label htmlFor="image_rights_authorized">
                Autorização de uso de imagem no site do ROLÊ
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Criar Artista' : 'Salvar Alterações'}
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
    </div>
  );
}

export default withAdminAuth(ArtistForm, 'editor');