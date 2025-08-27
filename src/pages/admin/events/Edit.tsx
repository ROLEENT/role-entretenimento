import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useEventManagement } from '@/hooks/useEventManagement';
import { ArrowLeft, Plus, X, Calendar, MapPin, DollarSign, Upload, Link as LinkIcon, Tag, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Venue {
  id: string;
  name: string;
  address: string;
}

interface Organizer {
  id: string;
  name: string;
}

const cities = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 
  'Brasília', 'Fortaleza', 'Recife', 'Curitiba', 'Porto Alegre', 'Goiânia'
];

const states = [
  'SP', 'RJ', 'MG', 'BA', 'DF', 'CE', 'PE', 'PR', 'RS', 'GO'
];

export default function AdminEventEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getEvent, updateEvent, getVenues, getOrganizers, loading } = useEventManagement();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    state: '',
    date_start: '',
    date_end: '',
    price_min: '',
    price_max: '',
    venue_id: '',
    organizer_id: '',
    external_url: '',
    cover_url: '',
    tags: [] as string[],
    status: 'draft'
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      const [eventData, venuesData, organizersData] = await Promise.all([
        getEvent(id!),
        getVenues(),
        getOrganizers()
      ]);
      
      setVenues(venuesData || []);
      setOrganizers(organizersData || []);
      
      if (eventData) {
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          city: eventData.city || '',
          state: eventData.state || '',
          date_start: eventData.date_start ? new Date(eventData.date_start).toISOString().slice(0, 16) : '',
          date_end: eventData.date_end ? new Date(eventData.date_end).toISOString().slice(0, 16) : '',
          price_min: eventData.price_min?.toString() || '',
          price_max: eventData.price_max?.toString() || '',
          venue_id: eventData.venue_id || '',
          organizer_id: eventData.organizer_id || '',
          external_url: eventData.external_url || '',
          cover_url: eventData.cover_url || '',
          tags: eventData.tags || [],
          status: eventData.status || 'draft'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar evento');
      navigate('/admin-v2/events');
    } finally {
      setInitialLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    
    if (!formData.city || !formData.state) {
      toast.error('Cidade e estado são obrigatórios');
      return;
    }
    
    if (!formData.date_start) {
      toast.error('Data de início é obrigatória');
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        city: formData.city,
        state: formData.state,
        start_at: formData.date_start,
        end_at: formData.date_end || null,
        price_min: formData.price_min ? parseFloat(formData.price_min) : 0,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        venue_id: formData.venue_id || null,
        organizer_id: formData.organizer_id || null,
        external_url: formData.external_url || null,
        cover_url: formData.cover_url || null,
        tags: formData.tags,
        status: formData.status,
        slug: generateSlug(formData.title)
      };

      const success = await updateEvent(id!, eventData);
      
      if (success) {
        toast.success('Evento atualizado com sucesso!');
        navigate('/admin-v2/events');
      }
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento');
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin-v2/events')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Eventos
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Editar Evento</h1>
                <p className="text-muted-foreground">Atualizar informações do evento</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Evento *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nome do evento"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrição detalhada do evento"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_start">Data/Hora de Início *</Label>
                  <Input
                    id="date_start"
                    type="datetime-local"
                    value={formData.date_start}
                    onChange={(e) => handleInputChange('date_start', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date_end">Data/Hora de Término</Label>
                  <Input
                    id="date_end"
                    type="datetime-local"
                    value={formData.date_end}
                    onChange={(e) => handleInputChange('date_end', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="completed">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="venue_id">Local (Venue)</Label>
                <Select value={formData.venue_id} onValueChange={(value) => handleInputChange('venue_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum local selecionado</SelectItem>
                    {venues.map(venue => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="organizer_id">Organizador</Label>
                <Select value={formData.organizer_id} onValueChange={(value) => handleInputChange('organizer_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um organizador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum organizador selecionado</SelectItem>
                    {organizers.map(organizer => (
                      <SelectItem key={organizer.id} value={organizer.id}>
                        {organizer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_min">Preço Mínimo (R$)</Label>
                  <Input
                    id="price_min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_min}
                    onChange={(e) => handleInputChange('price_min', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="price_max">Preço Máximo (R$)</Label>
                  <Input
                    id="price_max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_max}
                    onChange={(e) => handleInputChange('price_max', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media & Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Mídia e Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cover_url">URL da Imagem de Capa</Label>
                <Input
                  id="cover_url"
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => handleInputChange('cover_url', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <Label htmlFor="external_url">Link Externo</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => handleInputChange('external_url', e.target.value)}
                  placeholder="https://exemplo.com/ingressos"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Digite uma tag e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin-v2/events')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Evento'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}