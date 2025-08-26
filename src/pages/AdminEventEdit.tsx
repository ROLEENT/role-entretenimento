import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Plus, Upload, X, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Venue {
  id: string;
  name: string;
  address: string;
}

interface Organizer {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface EventFormData {
  // Básico
  title: string;
  slug: string;
  city: string;
  start_at: string;
  end_at: string;
  
  // Local
  venue_id: string;
  
  // Organizador
  organizer_id: string;
  
  // Mídia
  cover_url: string;
  
  // Conteúdo
  description: string;
  categories: string[];
  tags: string[];
  
  // Publicação
  status: 'draft' | 'active' | 'archived';
}

const initialFormData: EventFormData = {
  title: '',
  slug: '',
  city: '',
  start_at: '',
  end_at: '',
  venue_id: '',
  organizer_id: '',
  cover_url: '',
  description: '',
  categories: [],
  tags: [],
  status: 'draft'
};

const steps = [
  { id: 'basic', title: 'Básico', description: 'Título, cidade e datas' },
  { id: 'venue', title: 'Local', description: 'Venue do evento' },
  { id: 'organizer', title: 'Organizador', description: 'Responsável pelo evento' },
  { id: 'media', title: 'Mídia', description: 'Capa e galeria' },
  { id: 'content', title: 'Conteúdo', description: 'Descrição e categorias' },
  { id: 'publish', title: 'Publicação', description: 'Status e revisão' }
];

export default function AdminEventEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Venue creation
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [newVenue, setNewVenue] = useState({ name: '', address: '' });
  
  // Organizer creation
  const [organizerDialogOpen, setOrganizerDialogOpen] = useState(false);
  const [newOrganizer, setNewOrganizer] = useState({ name: '' });
  
  // Tag input
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchData();
    }
  }, [id]);

  const fetchEvent = async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_categories(category_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          city: data.city || '',
          start_at: data.start_at?.split('.')[0] || '',
          end_at: data.end_at?.split('.')[0] || '',
          venue_id: data.venue_id || '',
          organizer_id: data.organizer_id || '',
          cover_url: data.cover_url || '',
          description: data.description || '',
          categories: data.event_categories?.map((ec: any) => ec.category_id) || [],
          tags: data.tags || [],
          status: data.status || 'draft'
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Erro ao carregar evento');
      navigate('/admin/events');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [venuesResponse, organizersResponse, categoriesResponse] = await Promise.all([
        supabase.from('venues').select('id, name, address').order('name'),
        supabase.from('organizers').select('id, name').order('name'),
        supabase.from('categories').select('id, name, slug').order('name')
      ]);

      if (venuesResponse.data) setVenues(venuesResponse.data);
      if (organizersResponse.data) setOrganizers(organizersResponse.data);
      if (categoriesResponse.data) setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0: // Básico
        if (!formData.title || !formData.city || !formData.start_at) {
          toast.error('Preencha título, cidade e data de início');
          return false;
        }
        if (formData.end_at && formData.end_at < formData.start_at) {
          toast.error('Data fim deve ser posterior à data início');
          return false;
        }
        return true;
      case 1: // Local
        return true; // Opcional
      case 2: // Organizador
        return true; // Opcional
      case 3: // Mídia
        return true; // Opcional
      case 4: // Conteúdo
        return true; // Opcional
      case 5: // Publicação
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `events/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, cover_url: publicUrl }));
      toast.success('Imagem enviada com sucesso');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const createVenue = async () => {
    if (!newVenue.name || !newVenue.address) {
      toast.error('Preencha nome e endereço do venue');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('venues')
        .insert([newVenue])
        .select()
        .single();

      if (error) throw error;

      setVenues(prev => [...prev, data]);
      setFormData(prev => ({ ...prev, venue_id: data.id }));
      setNewVenue({ name: '', address: '' });
      setVenueDialogOpen(false);
      toast.success('Venue criado com sucesso');
    } catch (error) {
      console.error('Error creating venue:', error);
      toast.error('Erro ao criar venue');
    }
  };

  const createOrganizer = async () => {
    if (!newOrganizer.name) {
      toast.error('Preencha o nome do organizador');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('organizers')
        .insert([newOrganizer])
        .select()
        .single();

      if (error) throw error;

      setOrganizers(prev => [...prev, data]);
      setFormData(prev => ({ ...prev, organizer_id: data.id }));
      setNewOrganizer({ name: '' });
      setOrganizerDialogOpen(false);
      toast.success('Organizador criado com sucesso');
    } catch (error) {
      console.error('Error creating organizer:', error);
      toast.error('Erro ao criar organizador');
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim();
    if (!formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);

      // Check slug uniqueness (exclude current event)
      const { data: existingEvent } = await supabase
        .from('events')
        .select('id')
        .eq('slug', formData.slug)
        .neq('id', id)
        .single();

      if (existingEvent) {
        toast.error('Slug já existe, escolha outro');
        return;
      }

      const { error } = await supabase.rpc('admin_update_event', {
        p_event_id: id,
        p_title: formData.title,
        p_slug: formData.slug,
        p_city: formData.city,
        p_venue_id: formData.venue_id || null,
        p_start_at: formData.start_at,
        p_end_at: formData.end_at || null,
        p_organizer_id: formData.organizer_id || null,
        p_cover_url: formData.cover_url || null,
        p_tags: formData.tags,
        p_status: formData.status,
        p_description: formData.description || null
      });

      if (error) throw error;

      toast.success('Evento atualizado com sucesso');
      navigate('/admin/events');
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.message || 'Erro ao atualizar evento');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Básico
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nome do evento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-amigavel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="São Paulo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_at">Data/Hora Início *</Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  value={formData.start_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_at">Data/Hora Fim</Label>
                <Input
                  id="end_at"
                  type="datetime-local"
                  value={formData.end_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 1: // Local
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="venue_id">Local do Evento</Label>
                <Select value={formData.venue_id} onValueChange={(value) => setFormData(prev => ({ ...prev, venue_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map(venue => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={venueDialogOpen} onOpenChange={setVenueDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Venue</DialogTitle>
                    <DialogDescription>
                      Adicione um novo local para eventos
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="venue_name">Nome *</Label>
                      <Input
                        id="venue_name"
                        value={newVenue.name}
                        onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do venue"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="venue_address">Endereço *</Label>
                      <Textarea
                        id="venue_address"
                        value={newVenue.address}
                        onChange={(e) => setNewVenue(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Endereço completo"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={createVenue} className="flex-1">
                        Criar Venue
                      </Button>
                      <Button variant="outline" onClick={() => setVenueDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        );

      case 2: // Organizador
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="organizer_id">Organizador do Evento</Label>
                <Select value={formData.organizer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, organizer_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o organizador" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizers.map(organizer => (
                      <SelectItem key={organizer.id} value={organizer.id}>
                        {organizer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={organizerDialogOpen} onOpenChange={setOrganizerDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Organizador</DialogTitle>
                    <DialogDescription>
                      Adicione um novo organizador de eventos
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizer_name">Nome *</Label>
                      <Input
                        id="organizer_name"
                        value={newOrganizer.name}
                        onChange={(e) => setNewOrganizer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do organizador"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={createOrganizer} className="flex-1">
                        Criar Organizador
                      </Button>
                      <Button variant="outline" onClick={() => setOrganizerDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        );

      case 3: // Mídia
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Capa do Evento</Label>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-muted-foreground">Enviando...</p>}
                {formData.cover_url && (
                  <div className="relative">
                    <img 
                      src={formData.cover_url} 
                      alt="Capa do evento" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, cover_url: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4: // Conteúdo
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Descrição detalhada do evento..."
              />
            </div>

            <div className="space-y-2">
              <Label>Categorias</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={formData.categories.includes(category.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        categories: prev.categories.includes(category.id)
                          ? prev.categories.filter(id => id !== category.id)
                          : [...prev.categories, category.id]
                      }));
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Digite uma tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button onClick={addTag} size="sm">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Publicação
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status de Publicação</Label>
              <Select value={formData.status} onValueChange={(value: 'draft' | 'active' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Publicado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === 'active' && formData.slug && (
              <div className="p-4 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-2">
                  <Label>Link do Evento:</Label>
                  <a 
                    href={`/events/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    /events/{formData.slug}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Resumo do Evento</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Título:</strong> {formData.title || 'Não informado'}</p>
                <p><strong>Cidade:</strong> {formData.city || 'Não informado'}</p>
                <p><strong>Data:</strong> {formData.start_at ? new Date(formData.start_at).toLocaleString() : 'Não informado'}</p>
                <p><strong>Local:</strong> {venues.find(v => v.id === formData.venue_id)?.name || 'Não informado'}</p>
                <p><strong>Organizador:</strong> {organizers.find(o => o.id === formData.organizer_id)?.name || 'Não informado'}</p>
                <p><strong>Status:</strong> {formData.status}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Evento</h1>
            <p className="text-muted-foreground">
              Edite as informações do evento seguindo as etapas abaixo
            </p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <MultiStepForm 
              steps={steps} 
              currentStep={currentStep} 
              onStepChange={setCurrentStep}
            />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h3>
              <p className="text-muted-foreground mb-4">{steps[currentStep].description}</p>
              
              {renderStepContent()}
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Evento'}
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}