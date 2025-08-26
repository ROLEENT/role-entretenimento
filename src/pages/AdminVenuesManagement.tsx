import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Search, Edit, Trash2, MapPin, ExternalLink, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/lib/simpleUpload';

interface Venue {
  id: string;
  name: string;
  slug?: string;
  address: string;
  city: string;
  state: string;
  map_url?: string;
  capacity?: number;
  cover_url?: string;
  contacts_json?: {
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
  };
  created_at: string;
  updated_at?: string;
}

const AdminVenuesManagement = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    city: '',
    state: '',
    map_url: '',
    capacity: '',
    cover_url: '',
    contacts: {
      phone: '',
      email: '',
      website: '',
      instagram: ''
    }
  });

  const cities = ['Porto Alegre', 'Florianópolis', 'Curitiba', 'São Paulo', 'Rio de Janeiro'];
  const states = [
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'PR', label: 'Paraná' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' }
  ];

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      toast.error('Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.city || !formData.state) {
      toast.error('Nome, endereço, cidade e estado são obrigatórios');
      return;
    }

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      // Check if slug already exists (excluding current venue if editing)
      const { data: existingVenue } = await supabase
        .from('venues')
        .select('id')
        .eq('slug', slug)
        .not('id', 'eq', editingVenue?.id || 'none')
        .single();

      if (existingVenue) {
        toast.error('URL já existe. Escolha um nome diferente ou defina uma URL personalizada.');
        return;
      }

      const venueData = {
        name: formData.name,
        slug,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        map_url: formData.map_url || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        cover_url: formData.cover_url || null,
        contacts_json: formData.contacts
      };

      if (editingVenue) {
        const { error } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', editingVenue.id);
        
        if (error) throw error;
        toast.success('Local atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('venues')
          .insert([venueData]);
        
        if (error) throw error;
        toast.success('Local criado com sucesso!');
      }

      resetForm();
      fetchVenues();
    } catch (error: any) {
      console.error('Erro ao salvar local:', error);
      toast.error(error.message || 'Erro ao salvar local');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      address: '',
      city: '',
      state: '',
      map_url: '',
      capacity: '',
      cover_url: '',
      contacts: {
        phone: '',
        email: '',
        website: '',
        instagram: ''
      }
    });
    setShowCreateForm(false);
    setEditingVenue(null);
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      slug: venue.slug || '',
      address: venue.address,
      city: venue.city,
      state: venue.state,
      map_url: venue.map_url || '',
      capacity: venue.capacity?.toString() || '',
      cover_url: venue.cover_url || '',
      contacts: {
        phone: venue.contacts_json?.phone || '',
        email: venue.contacts_json?.email || '',
        website: venue.contacts_json?.website || '',
        instagram: venue.contacts_json?.instagram || ''
      }
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este local?')) return;

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Local excluído com sucesso!');
      fetchVenues();
    } catch (error: any) {
      console.error('Erro ao excluir local:', error);
      toast.error(error.message || 'Erro ao excluir local');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file, 'venues');
      setFormData(prev => ({ ...prev, cover_url: imageUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || venue.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Gestão de Locais</h1>
                <p className="text-muted-foreground">Gerencie os locais e venues da plataforma</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Local
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as cidades</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingVenue ? 'Editar Local' : 'Novo Local'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do local"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL (slug)</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-do-local (opcional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Endereço *</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua, número, bairro"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Cidade *</label>
                    <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
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
                    <label className="text-sm font-medium">Estado *</label>
                    <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Capacidade</label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">URL do Google Maps</label>
                  <Input
                    value={formData.map_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, map_url: e.target.value }))}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Imagem de Capa</label>
                  <div className="space-y-2">
                    {formData.cover_url && (
                      <div className="flex items-center gap-2">
                        <img src={formData.cover_url} alt="Preview" className="w-20 h-20 object-cover rounded" />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, cover_url: '' }))}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                      />
                      {uploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contatos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      <Input
                        value={formData.contacts.phone}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contacts: { ...prev.contacts, phone: e.target.value }
                        }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={formData.contacts.email}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contacts: { ...prev.contacts, email: e.target.value }
                        }))}
                        placeholder="contato@local.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Website</label>
                      <Input
                        value={formData.contacts.website}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contacts: { ...prev.contacts, website: e.target.value }
                        }))}
                        placeholder="https://exemplo.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Instagram</label>
                      <Input
                        value={formData.contacts.instagram}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contacts: { ...prev.contacts, instagram: e.target.value }
                        }))}
                        placeholder="@instagram"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {editingVenue ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-lg">Carregando locais...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <Card key={venue.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{venue.name}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {venue.city}, {venue.state}
                      </p>
                      {venue.slug && (
                        <Badge variant="outline" className="text-xs mt-1">
                          /{venue.slug}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(venue)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(venue.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {venue.cover_url && (
                      <img 
                        src={venue.cover_url} 
                        alt={venue.name}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    
                    <p className="text-sm">{venue.address}</p>
                    
                    {venue.capacity && (
                      <Badge variant="secondary" className="text-xs">
                        Capacidade: {venue.capacity}
                      </Badge>
                    )}

                    {venue.contacts_json && (
                      <div className="space-y-1">
                        {venue.contacts_json.phone && (
                          <p className="text-xs text-muted-foreground">📞 {venue.contacts_json.phone}</p>
                        )}
                        {venue.contacts_json.website && (
                          <a 
                            href={venue.contacts_json.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Site oficial
                          </a>
                        )}
                      </div>
                    )}

                    {venue.map_url && (
                      <a 
                        href={venue.map_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3" />
                        Ver no Google Maps
                      </a>
                    )}

                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">
                        Criado em {new Date(venue.created_at).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredVenues.length === 0 && !loading && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum local encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCity ? 'Tente ajustar seus filtros' : 'Comece criando seu primeiro local'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Local
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminVenuesManagement;