import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEventManagement } from '@/hooks/useEventManagement';
import { ArrowLeft, Plus, X, Calendar, MapPin, DollarSign, Upload, Link as LinkIcon, Tag, Users, Image, Instagram, Globe } from 'lucide-react';
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
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília', 
  'Fortaleza', 'Recife', 'Curitiba', 'Porto Alegre', 'Goiânia', 'Florianópolis',
  'Vitória', 'João Pessoa', 'Natal', 'Aracaju', 'Maceió', 'Teresina', 'São Luís',
  'Belém', 'Manaus', 'Boa Vista', 'Macapá', 'Palmas', 'Cuiabá', 'Campo Grande',
  'Rio Branco', 'Porto Velho'
];

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const categories = [
  'Show', 'Festa', 'Teatro', 'Eletrônico', 'Samba', 'Rock', 'MPB', 'Jazz',
  'Blues', 'Reggae', 'Hip Hop', 'Funk', 'Forró', 'Bossa Nova', 'Stand-up',
  'Exposição', 'Cinema', 'Festival', 'Workshop', 'Conferência'
];

const ageRanges = [
  'Livre', '10+', '12+', '14+', '16+', '18+'
];

export default function AdminEventCreate() {
  const navigate = useNavigate();
  const { createEvent, getVenues, getOrganizers, loading } = useEventManagement();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  
  const [formData, setFormData] = useState({
    // Campos obrigatórios
    title: '',
    description: '',
    cover_url: '',
    date_start: '',
    date_end: '',
    venue_name: '',
    venue_address: '',
    city: '',
    state: '',
    ticket_url: '',
    instagram_post_url: '',

    // Campos complementares
    category: '',
    artists: [] as string[],
    organizer_id: '',
    price_min: '',
    price_max: '',
    social_media_url: '',

    // Extras opcionais
    special_benefits: '',
    age_range: '',
    observations: '',

    // Campos técnicos
    venue_id: '',
    external_url: '',
    tags: [] as string[],
    status: 'draft'
  });

  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCharCount(formData.description.length);
  }, [formData.description]);

  const fetchData = async () => {
    try {
      const [venuesData, organizersData] = await Promise.all([
        getVenues().catch(() => []),
        getOrganizers().catch(() => [])
      ]);
      setVenues(venuesData || []);
      setOrganizers(organizersData || []);
    } catch (error) {
      console.warn('Erro ao carregar dados auxiliares:', error);
      // Continue mesmo se não conseguir carregar venues/organizers
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

  const addArtist = () => {
    if (artistInput.trim() && !formData.artists.includes(artistInput.trim())) {
      setFormData(prev => ({
        ...prev,
        artists: [...prev.artists, artistInput.trim()]
      }));
      setArtistInput('');
    }
  };

  const removeArtist = (artistToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      artists: prev.artists.filter(artist => artist !== artistToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações obrigatórias
    if (!formData.title.trim()) {
      toast.error('Nome do evento é obrigatório');
      return;
    }
    
    if (formData.description.length > 400) {
      toast.error('Descrição deve ter no máximo 400 caracteres');
      return;
    }
    
    if (!formData.cover_url.trim()) {
      toast.error('Imagem de capa é obrigatória');
      return;
    }
    
    if (!formData.date_start) {
      toast.error('Data e hora de início são obrigatórias');
      return;
    }
    
    if (!formData.venue_name.trim()) {
      toast.error('Nome do local é obrigatório');
      return;
    }
    
    if (!formData.city || !formData.state) {
      toast.error('Cidade e estado são obrigatórios');
      return;
    }
    
    if (!formData.ticket_url.trim()) {
      toast.error('Link de ingressos é obrigatório');
      return;
    }
    
    if (!formData.instagram_post_url.trim()) {
      toast.error('Link do post da Vitrine Cultural no Instagram é obrigatório');
      return;
    }

    try {
      // Compilar tags finais
      const finalTags = [
        ...formData.tags,
        ...(formData.category ? [formData.category] : []),
        ...formData.artists,
        ...(formData.age_range ? [formData.age_range] : [])
      ].filter(Boolean);

      // Compilar descrição final com informações extras
      let finalDescription = formData.description;
      if (formData.special_benefits) {
        finalDescription += `\n\nBenefícios especiais: ${formData.special_benefits}`;
      }
      if (formData.observations) {
        finalDescription += `\n\nObservações: ${formData.observations}`;
      }
      if (formData.social_media_url) {
        finalDescription += `\n\nRedes sociais: ${formData.social_media_url}`;
      }
      if (formData.instagram_post_url) {
        finalDescription += `\n\nPost oficial: ${formData.instagram_post_url}`;
      }

      const eventData = {
        title: formData.title,
        description: finalDescription,
        city: formData.city,
        state: formData.state,
        start_at: formData.date_start,
        end_at: formData.date_end || null,
        price_min: formData.price_min ? parseFloat(formData.price_min) : 0,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        venue_id: formData.venue_id || null,
        organizer_id: formData.organizer_id || null,
        external_url: formData.ticket_url,
        cover_url: formData.cover_url,
        tags: finalTags,
        status: formData.status,
        slug: generateSlug(formData.title)
      };

      const eventId = await createEvent(eventData);
      
      if (eventId) {
        toast.success('Evento criado com sucesso!');
        navigate('/admin-v2/events');
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento');
    }
  };

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
                <h1 className="text-2xl font-bold">Criar Evento</h1>
                <p className="text-muted-foreground">Vitrine Cultural - Novo evento</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          
          {/* CAMPOS OBRIGATÓRIOS */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Calendar className="h-5 w-5" />
                Campos Obrigatórios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Nome do evento *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Show do Artista X no Local Y"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição curta *</Label>
                <div className="space-y-2">
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descrição igual ao que usamos no Instagram (máximo 400 caracteres)"
                    rows={3}
                    maxLength={400}
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {charCount}/400 caracteres
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="cover_url">Imagem de capa *</Label>
                <Input
                  id="cover_url"
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => handleInputChange('cover_url', e.target.value)}
                  placeholder="https://exemplo.com/arte-vitrine.jpg"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Mesma arte usada no post da Vitrine
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_start">Data e hora de início *</Label>
                  <Input
                    id="date_start"
                    type="datetime-local"
                    value={formData.date_start}
                    onChange={(e) => handleInputChange('date_start', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date_end">Data e hora de término</Label>
                  <Input
                    id="date_end"
                    type="datetime-local"
                    value={formData.date_end}
                    onChange={(e) => handleInputChange('date_end', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Local</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue_name">Nome do local *</Label>
                    <Input
                      id="venue_name"
                      value={formData.venue_name}
                      onChange={(e) => handleInputChange('venue_name', e.target.value)}
                      placeholder="Ex: Teatro Municipal"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="venue_address">Endereço *</Label>
                    <Input
                      id="venue_address"
                      value={formData.venue_address}
                      onChange={(e) => handleInputChange('venue_address', e.target.value)}
                      placeholder="Ex: Rua da Consolação, 123 - Centro"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer cidade do país" />
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
                <Label htmlFor="ticket_url">Link de ingressos *</Label>
                <Input
                  id="ticket_url"
                  type="url"
                  value={formData.ticket_url}
                  onChange={(e) => handleInputChange('ticket_url', e.target.value)}
                  placeholder="https://ingressos.com/evento"
                  required
                />
              </div>

              <div>
                <Label htmlFor="instagram_post_url">Link do post da Vitrine Cultural no Instagram *</Label>
                <Input
                  id="instagram_post_url"
                  type="url"
                  value={formData.instagram_post_url}
                  onChange={(e) => handleInputChange('instagram_post_url', e.target.value)}
                  placeholder="https://instagram.com/p/..."
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Para associar evento/site com post/feed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CAMPOS COMPLEMENTARES */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Tag className="h-5 w-5" />
                Campos Complementares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Categoria/Estilo</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ex: festa, show, teatro, eletrônico, samba" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="artists">Artistas/Line-up</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="artists"
                    value={artistInput}
                    onChange={(e) => setArtistInput(e.target.value)}
                    placeholder="Nome do artista principal"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArtist();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addArtist}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.artists.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.artists.map((artist, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {artist}
                        <button
                          type="button"
                          onClick={() => removeArtist(artist)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="organizer_id">Organizador/Produtor</Label>
                <Select value={formData.organizer_id} onValueChange={(value) => handleInputChange('organizer_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nome ou coletivo" />
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
                  <Label htmlFor="price_min">Preço mínimo (R$)</Label>
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
                  <Label htmlFor="price_max">Preço máximo (R$)</Label>
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

              <div>
                <Label htmlFor="social_media_url">Link para redes sociais do evento ou produtor</Label>
                <Input
                  id="social_media_url"
                  type="url"
                  value={formData.social_media_url}
                  onChange={(e) => handleInputChange('social_media_url', e.target.value)}
                  placeholder="https://instagram.com/produtor"
                />
              </div>
            </CardContent>
          </Card>

          {/* EXTRAS OPCIONAIS */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Users className="h-5 w-5" />
                Extras Opcionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="special_benefits">Benefícios especiais</Label>
                <Input
                  id="special_benefits"
                  value={formData.special_benefits}
                  onChange={(e) => handleInputChange('special_benefits', e.target.value)}
                  placeholder="Ex: entrada free até 23h, open CDJ, flash tattoo"
                />
              </div>

              <div>
                <Label htmlFor="age_range">Faixa etária</Label>
                <Select value={formData.age_range} onValueChange={(value) => handleInputChange('age_range', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quando aplicável" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRanges.map(range => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  placeholder="Ex: evento inclusivo e acessível, dress code, etc."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags adicionais</Label>
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

              <div>
                <Label htmlFor="status">Status do evento</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end bg-card p-4 rounded-lg border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin-v2/events')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}