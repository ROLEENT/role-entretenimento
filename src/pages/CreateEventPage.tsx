import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { eventsApi } from '@/lib/eventsApi';
import { EventFormData } from '@/schemas/eventSchema';

interface FormData {
  title: string;
  description: string;
  date_start: Date | undefined;
  date_end: Date | undefined;
  city: string;
  state: string;
  venue_name: string;
  venue_address: string;
  price_min: number;
  price_max: number;
  external_url: string;
  image_url: string;
  organizer_id?: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Organizer {
  id: string;
  name: string;
}

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    date_start: undefined,
    date_end: undefined,
    city: '',
    state: '',
    venue_name: '',
    venue_address: '',
    price_min: 0,
    price_max: 0,
    external_url: '',
    image_url: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Faça login para criar eventos');
      navigate('/auth');
      return;
    }
    loadVenues();
    loadOrganizers();
  }, [isAuthenticated, navigate]);

  const loadVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, address, city, state')
        .order('name');

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Erro ao carregar venues:', error);
    }
  };

  const loadOrganizers = async () => {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error) {
      console.error('Erro ao carregar organizadores:', error);
    }
  };

  const handleVenueSelect = (venueId: string) => {
    setSelectedVenue(venueId);
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
      setForm(prev => ({
        ...prev,
        venue_name: venue.name,
        venue_address: venue.address,
        city: venue.city,
        state: venue.state
      }));
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      setImagePreview(data.publicUrl);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(form.title && form.description && form.date_start && selectedOrganizer);
      case 2:
        return !!(form.city && form.state && form.venue_name && form.venue_address);
      case 3:
        return form.price_min >= 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Preencha todos os campos obrigatórios');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user || !form.title || !form.date_start || !selectedOrganizer) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      // Criar ou encontrar venue
      let venueId = selectedVenue;
      if (!venueId && form.venue_name) {
        const { data: newVenue, error: venueError } = await supabase
          .from('venues')
          .insert({
            name: form.venue_name,
            address: form.venue_address,
            city: form.city,
            state: form.state
          })
          .select()
          .single();

        if (venueError) throw venueError;
        venueId = newVenue.id;
      }

      // Gerar slug baseado no título
      const slug = form.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Criar evento diretamente com organizer_id
      const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert({
          title: form.title,
          description: form.description,
          date_start: form.date_start.toISOString(),
          date_end: form.date_end?.toISOString(),
          city: form.city,
          state: form.state,
          venue_id: venueId,
          organizer_id: selectedOrganizer,
          price_min: form.price_min,
          price_max: form.price_max || form.price_min,
          image_url: form.image_url,
          slug: slug,
          status: 'published',
          visibility: 'public'
        })
        .select()
        .single();

      if (eventError) throw eventError;

      toast.success('Evento criado com sucesso!');
      navigate(`/evento/${newEvent.id}`);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Criar Evento | ROLÊ" 
        description="Crie e publique seu evento na plataforma ROLÊ"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Criar Novo Evento</h1>
            <p className="text-muted-foreground">Publique seu evento e alcance milhares de pessoas</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>Básico</span>
              <span>Local</span>
              <span>Preços</span>
              <span>Revisão</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Informações Básicas'}
                {step === 2 && 'Local do Evento'}
                {step === 3 && 'Preços e Ingressos'}
                {step === 4 && 'Revisão e Publicação'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 - Basic Info */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Evento *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Show da Banda XYZ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva seu evento..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Início *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.date_start ? format(form.date_start, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={form.date_start}
                            onSelect={(date) => setForm(prev => ({ ...prev, date_start: date }))}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Fim (opcional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.date_end ? format(form.date_end, "dd/MM/yyyy", { locale: ptBR }) : "Mesmo dia"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={form.date_end}
                            onSelect={(date) => setForm(prev => ({ ...prev, date_end: date }))}
                            disabled={(date) => date < (form.date_start || new Date())}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizer">Organizador *</Label>
                    <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar organizador" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizers.map((organizer) => (
                          <SelectItem key={organizer.id} value={organizer.id}>
                            {organizer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Imagem do Evento</Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={loading}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Escolher Imagem
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
                    )}
                  </div>
                </>
              )}

              {/* Step 2 - Location */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Venue Existente</Label>
                    <Select value={selectedVenue} onValueChange={handleVenueSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar venue existente (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {venues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name} - {venue.city}, {venue.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue_name">Nome do Local *</Label>
                    <Input
                      id="venue_name"
                      value={form.venue_name}
                      onChange={(e) => setForm(prev => ({ ...prev, venue_name: e.target.value }))}
                      placeholder="Ex: Teatro Municipal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue_address">Endereço *</Label>
                    <Input
                      id="venue_address"
                      value={form.venue_address}
                      onChange={(e) => setForm(prev => ({ ...prev, venue_address: e.target.value }))}
                      placeholder="Ex: Rua das Flores, 123"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Ex: São Paulo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Select value={form.state} onValueChange={(value) => setForm(prev => ({ ...prev, state: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3 - Pricing */}
              {step === 3 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_min">Preço Mínimo (R$)</Label>
                      <Input
                        id="price_min"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price_min}
                        onChange={(e) => setForm(prev => ({ ...prev, price_min: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00 (gratuito)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_max">Preço Máximo (R$)</Label>
                      <Input
                        id="price_max"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price_max}
                        onChange={(e) => setForm(prev => ({ ...prev, price_max: parseFloat(e.target.value) || 0 }))}
                        placeholder="Deixe vazio se igual ao mínimo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="external_url">Link para Ingressos</Label>
                    <Input
                      id="external_url"
                      type="url"
                      value={form.external_url}
                      onChange={(e) => setForm(prev => ({ ...prev, external_url: e.target.value }))}
                      placeholder="https://ingressos.exemplo.com"
                    />
                  </div>
                </>
              )}

              {/* Step 4 - Review */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Revisar Informações</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Título:</strong> {form.title}</p>
                      <p><strong>Data:</strong> {form.date_start ? format(form.date_start, "dd/MM/yyyy", { locale: ptBR }) : 'Não definida'}</p>
                      <p><strong>Local:</strong> {form.venue_name}, {form.city}</p>
                      <p><strong>Preço:</strong> {form.price_min === 0 ? 'Gratuito' : `R$ ${form.price_min}`}</p>
                    </div>
                  </div>

                  {imagePreview && (
                    <div>
                      <h4 className="font-medium mb-2">Imagem do Evento</h4>
                      <img src={imagePreview} alt="Preview do evento" className="h-48 w-full object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Anterior
                </Button>

                {step < 4 ? (
                  <Button onClick={nextStep}>
                    Próximo
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Evento'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateEventPage;