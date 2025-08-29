import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface HighlightFormData {
  event_title: string;
  city: string;
  venue: string;
  role_text: string;
  image_url: string;
  ticket_url: string;
  event_date: string;
  event_time: string;
  ticket_price: string;
  is_published: boolean;
}

const CITIES = [
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
];

const AdminHighlightForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HighlightFormData>({
    event_title: '',
    city: '',
    venue: '',
    role_text: '',
    image_url: '',
    ticket_url: '',
    event_date: '',
    event_time: '',
    ticket_price: '',
    is_published: false,
  });

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadHighlight();
    }
  }, [id]);

  const loadHighlight = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        event_title: data.event_title || '',
        city: data.city || '',
        venue: data.venue || '',
        role_text: data.role_text || '',
        image_url: data.image_url || '',
        ticket_url: data.ticket_url || '',
        event_date: data.event_date || '',
        event_time: data.event_time || '',
        ticket_price: data.ticket_price || '',
        is_published: data.is_published || false,
      });
    } catch (error: any) {
      toast.error('Erro ao carregar destaque');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        ticket_price: formData.ticket_price || null,
        event_date: formData.event_date || null,
        event_time: formData.event_time || null,
        ticket_url: formData.ticket_url || null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('highlights')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        toast.success('Destaque atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('highlights')
          .insert(payload);

        if (error) throw error;
        toast.success('Destaque criado com sucesso!');
      }

      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar destaque');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof HighlightFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEdit ? 'Editar Destaque' : 'Novo Destaque'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Preencha os dados do evento em destaque
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {isEdit ? 'Editar Destaque' : 'Criar Novo Destaque'}
            </CardTitle>
            <CardDescription>
              Complete as informações do evento que será destacado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título do Evento */}
              <div className="space-y-2">
                <Label htmlFor="event_title">Título do Evento *</Label>
                <Input
                  id="event_title"
                  value={formData.event_title}
                  onChange={(e) => handleInputChange('event_title', e.target.value)}
                  placeholder="Nome do evento"
                  required
                />
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => handleInputChange('city', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Local */}
              <div className="space-y-2">
                <Label htmlFor="venue">Local do Evento *</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder="Nome do local/casa/venue"
                  required
                />
              </div>

              {/* Texto Role */}
              <div className="space-y-2">
                <Label htmlFor="role_text">Descrição Role *</Label>
                <Textarea
                  id="role_text"
                  value={formData.role_text}
                  onChange={(e) => handleInputChange('role_text', e.target.value)}
                  placeholder="Descreva o que torna este evento especial..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* URL da Imagem */}
              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem *</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                />
              </div>

              {/* Informações Opcionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Data do Evento</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => handleInputChange('event_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_time">Horário</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => handleInputChange('event_time', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket_price">Preço do Ingresso</Label>
                  <Input
                    id="ticket_price"
                    value={formData.ticket_price}
                    onChange={(e) => handleInputChange('ticket_price', e.target.value)}
                    placeholder="R$ 0,00 ou Gratuito"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket_url">Link dos Ingressos</Label>
                  <Input
                    id="ticket_url"
                    type="url"
                    value={formData.ticket_url}
                    onChange={(e) => handleInputChange('ticket_url', e.target.value)}
                    placeholder="https://link-ingressos.com"
                  />
                </div>
              </div>

              {/* Publicar */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                />
                <Label htmlFor="is_published">Publicar destaque</Label>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Salvando...' : 'Salvar Destaque'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminHighlightForm;