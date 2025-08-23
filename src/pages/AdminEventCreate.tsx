import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, DollarSign, Image as ImageIcon, Ticket, Eye, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EventForm {
  title: string;
  description: string;
  date_start: string;
  date_end: string;
  city: string;
  state: string;
  price_min: number;
  price_max: number;
  image_url: string;
  external_url: string;
  venue_id: string;
  organizer_id: string;
  category_ids: string[];
  tickets: {
    type: string;
    price: number;
    stock: number;
  }[];
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Organizer {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const AdminEventCreate = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    date_start: '',
    date_end: '',
    city: '',
    state: '',
    price_min: 0,
    price_max: 0,
    image_url: '',
    external_url: '',
    venue_id: '',
    organizer_id: '',
    category_ids: [],
    tickets: []
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    if (!session) {
      navigate('/admin/login');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (profile?.role !== 'admin') {
        toast.error('Acesso negado');
        navigate('/');
        return;
      }

      await Promise.all([
        loadVenues(),
        loadOrganizers(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/admin/login');
    }
  };

  const loadVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

  const loadOrganizers = async () => {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .order('name');

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error) {
      console.error('Error loading organizers:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `events/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      setForm(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setImageUploading(false);
    }
  };

  const addTicket = () => {
    setForm(prev => ({
      ...prev,
      tickets: [...prev.tickets, { type: '', price: 0, stock: 0 }]
    }));
  };

  const removeTicket = (index: number) => {
    setForm(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }));
  };

  const updateTicket = (index: number, field: string, value: string | number) => {
    setForm(prev => ({
      ...prev,
      tickets: prev.tickets.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setForm(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const validateForm = () => {
    if (!form.title) {
      toast.error('Título é obrigatório');
      return false;
    }
    if (!form.date_start) {
      toast.error('Data de início é obrigatória');
      return false;
    }
    if (!form.city) {
      toast.error('Cidade é obrigatória');
      return false;
    }
    if (!form.venue_id) {
      toast.error('Local é obrigatório');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title: form.title,
          description: form.description,
          date_start: form.date_start,
          date_end: form.date_end || null,
          city: form.city,
          state: form.state,
          price_min: form.price_min,
          price_max: form.price_max || null,
          image_url: form.image_url || null,
          external_url: form.external_url || null,
          venue_id: form.venue_id || null,
          organizer_id: form.organizer_id || null,
          status: 'active'
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create event categories
      if (form.category_ids.length > 0) {
        const categoryInserts = form.category_ids.map(categoryId => ({
          event_id: event.id,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('event_categories')
          .insert(categoryInserts);

        if (categoriesError) throw categoriesError;
      }

      // Create tickets
      if (form.tickets.length > 0) {
        const ticketInserts = form.tickets.map(ticket => ({
          event_id: event.id,
          type: ticket.type,
          price: ticket.price,
          stock: ticket.stock
        }));

        const { error: ticketsError } = await supabase
          .from('tickets')
          .insert(ticketInserts);

        if (ticketsError) throw ticketsError;
      }

      toast.success('Evento criado com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Erro ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategories = categories.filter(cat => form.category_ids.includes(cat.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Criar Novo Evento</h1>
              <p className="text-muted-foreground">Preencha as informações do evento</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Publicar Evento'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="tickets">Ingressos</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título do Evento</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Nome do evento"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o evento..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date_start">Data/Hora de Início</Label>
                        <Input
                          id="date_start"
                          type="datetime-local"
                          value={form.date_start}
                          onChange={(e) => setForm(prev => ({ ...prev, date_start: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="date_end">Data/Hora de Fim (opcional)</Label>
                        <Input
                          id="date_end"
                          type="datetime-local"
                          value={form.date_end}
                          onChange={(e) => setForm(prev => ({ ...prev, date_end: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={form.city}
                          onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="São Paulo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={form.state}
                          onChange={(e) => setForm(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="SP"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="venue">Local</Label>
                      <Select value={form.venue_id} onValueChange={(value) => setForm(prev => ({ ...prev, venue_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um local" />
                        </SelectTrigger>
                        <SelectContent>
                          {venues.map((venue) => (
                            <SelectItem key={venue.id} value={venue.id}>
                              {venue.name} - {venue.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="organizer">Organizador</Label>
                      <Select value={form.organizer_id} onValueChange={(value) => setForm(prev => ({ ...prev, organizer_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um organizador" />
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

                    <div>
                      <Label>Categorias</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {categories.map((category) => (
                          <Badge
                            key={category.id}
                            variant={form.category_ids.includes(category.id) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleCategory(category.id)}
                            style={form.category_ids.includes(category.id) ? {
                              backgroundColor: category.color,
                              color: 'white'
                            } : {}}
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price_min">Preço Mínimo (R$)</Label>
                        <Input
                          id="price_min"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price_min}
                          onChange={(e) => setForm(prev => ({ ...prev, price_min: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price_max">Preço Máximo (R$) - opcional</Label>
                        <Input
                          id="price_max"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price_max}
                          onChange={(e) => setForm(prev => ({ ...prev, price_max: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="external_url">Link para Ingressos (opcional)</Label>
                      <Input
                        id="external_url"
                        type="url"
                        value={form.external_url}
                        onChange={(e) => setForm(prev => ({ ...prev, external_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">Imagem do Evento</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                      />
                      {form.image_url && (
                        <img 
                          src={form.image_url} 
                          alt="Preview"
                          className="mt-2 w-full max-w-md h-48 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tickets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipos de Ingresso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.tickets.map((ticket, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Ingresso {index + 1}</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeTicket(index)}
                          >
                            Remover
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Tipo</Label>
                            <Input
                              value={ticket.type}
                              onChange={(e) => updateTicket(index, 'type', e.target.value)}
                              placeholder="Ex: Pista, VIP, Camarote"
                            />
                          </div>
                          <div>
                            <Label>Preço (R$)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={ticket.price}
                              onChange={(e) => updateTicket(index, 'price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              min="0"
                              value={ticket.stock}
                              onChange={(e) => updateTicket(index, 'stock', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button onClick={addTicket} variant="outline" className="w-full">
                      <Ticket className="h-4 w-4 mr-2" />
                      Adicionar Tipo de Ingresso
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview do Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {form.image_url && (
                      <img 
                        src={form.image_url} 
                        alt={form.title}
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    
                    <h2 className="text-2xl font-bold mb-4">{form.title || 'Título do Evento'}</h2>
                    
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedCategories.map((cat) => (
                          <Badge 
                            key={cat.id}
                            style={{ backgroundColor: cat.color + '20', color: cat.color }}
                          >
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {form.date_start && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span>{format(new Date(form.date_start), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                        </div>
                      )}
                      {form.date_start && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <span>{format(new Date(form.date_start), 'HH:mm', { locale: ptBR })}</span>
                        </div>
                      )}
                      {form.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span>{form.city}, {form.state}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>
                          {form.price_min === 0 ? 'Gratuito' : 
                           form.price_max && form.price_max !== form.price_min ? 
                           `R$ ${form.price_min} - R$ ${form.price_max}` : 
                           `R$ ${form.price_min}`}
                        </span>
                      </div>
                    </div>

                    {form.description && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Sobre o Evento</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{form.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground">Rascunho</p>
                </div>
                
                {form.title && (
                  <div>
                    <Label className="text-sm font-medium">Título</Label>
                    <p className="text-sm text-muted-foreground">{form.title}</p>
                  </div>
                )}
                
                {form.date_start && (
                  <div>
                    <Label className="text-sm font-medium">Data</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(form.date_start), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                )}
                
                {form.city && (
                  <div>
                    <Label className="text-sm font-medium">Local</Label>
                    <p className="text-sm text-muted-foreground">{form.city}, {form.state}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Preço</Label>
                  <p className="text-sm text-muted-foreground">
                    {form.price_min === 0 ? 'Gratuito' : 
                     form.price_max && form.price_max !== form.price_min ? 
                     `R$ ${form.price_min} - R$ ${form.price_max}` : 
                     `R$ ${form.price_min}`}
                  </p>
                </div>
                
                {form.tickets.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Tipos de Ingresso</Label>
                    <p className="text-sm text-muted-foreground">{form.tickets.length} tipo(s)</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminEventCreate;