import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, MapPin, DollarSign, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Venue {
  id: string;
  name: string;
  address: string;
}

interface Organizer {
  id: string;
  name: string;
}

const AdminEventCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_start: '',
    date_end: '',
    city: '',
    state: '',
    venue_id: '',
    organizer_id: '',
    price_min: '',
    price_max: '',
    image_url: '',
    external_url: '',
    status: 'active'
  });

  const cities = [
    'Porto Alegre', 'Florianópolis', 'Curitiba', 'São Paulo', 'Rio de Janeiro'
  ];

  const states = [
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'PR', label: 'Paraná' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venuesResult, organizersResult] = await Promise.all([
          supabase.from('venues').select('id, name, address').order('name'),
          supabase.from('organizers').select('id, name').order('name')
        ]);

        if (venuesResult.data) setVenues(venuesResult.data);
        if (organizersResult.data) setOrganizers(organizersResult.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date_start || !formData.city || !formData.state) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      
      const eventData = {
        ...formData,
        price_min: formData.price_min ? parseFloat(formData.price_min) : null,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        venue_id: formData.venue_id || null,
        organizer_id: formData.organizer_id || null,
        date_end: formData.date_end || null
      };

      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) throw error;
      
      toast.success('Evento criado com sucesso!');
      navigate('/admin/events');
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      toast.error(error.message || 'Erro ao criar evento');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Criar Evento</h1>
              <p className="text-muted-foreground">Adicione um novo evento à plataforma</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Nome do evento"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descrição do evento"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data/Hora Início *</label>
                    <Input
                      type="datetime-local"
                      value={formData.date_start}
                      onChange={(e) => handleInputChange('date_start', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data/Hora Fim</label>
                    <Input
                      type="datetime-local"
                      value={formData.date_end}
                      onChange={(e) => handleInputChange('date_end', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização e Organizador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Cidade *</label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estado *</label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Local</label>
                  <Select value={formData.venue_id} onValueChange={(value) => handleInputChange('venue_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} - {venue.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Organizador</label>
                  <Select value={formData.organizer_id} onValueChange={(value) => handleInputChange('organizer_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o organizador" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Preço Mínimo</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price_min}
                      onChange={(e) => handleInputChange('price_min', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Preço Máximo</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price_max}
                      onChange={(e) => handleInputChange('price_max', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Mídia e Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">URL da Imagem</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Link Externo</label>
                <Input
                  value={formData.external_url}
                  onChange={(e) => handleInputChange('external_url', e.target.value)}
                  placeholder="https://exemplo.com/ingressos"
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex gap-4">
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Criando...' : 'Criar Evento'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AdminEventCreate;