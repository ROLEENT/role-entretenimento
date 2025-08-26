import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search, Edit, Trash2, ExternalLink, Instagram, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Organizer {
  id: string;
  name: string;
  contact_email: string;
  site?: string;
  instagram?: string;
  created_at: string;
}

const AdminOrganizers = () => {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    site: '',
    instagram: ''
  });

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error) {
      console.error('Erro ao carregar organizadores:', error);
      toast.error('Erro ao carregar organizadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact_email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    try {
      if (editingOrganizer) {
        const { error } = await supabase
          .from('organizers')
          .update(formData)
          .eq('id', editingOrganizer.id);
        
        if (error) throw error;
        toast.success('Organizador atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('organizers')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Organizador criado com sucesso!');
      }

      setFormData({ name: '', contact_email: '', site: '', instagram: '' });
      setShowCreateForm(false);
      setEditingOrganizer(null);
      fetchOrganizers();
    } catch (error: any) {
      console.error('Erro ao salvar organizador:', error);
      toast.error(error.message || 'Erro ao salvar organizador');
    }
  };

  const handleEdit = (organizer: Organizer) => {
    setEditingOrganizer(organizer);
    setFormData({
      name: organizer.name,
      contact_email: organizer.contact_email,
      site: organizer.site || '',
      instagram: organizer.instagram || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este organizador?')) return;

    try {
      const { error } = await supabase
        .from('organizers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Organizador excluído com sucesso!');
      fetchOrganizers();
    } catch (error: any) {
      console.error('Erro ao excluir organizador:', error);
      toast.error(error.message || 'Erro ao excluir organizador');
    }
  };

  const filteredOrganizers = organizers.filter(organizer =>
    organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-3xl font-bold">Organizadores</h1>
                <p className="text-muted-foreground">Gerencie os organizadores de eventos</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Organizador
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar organizadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingOrganizer ? 'Editar Organizador' : 'Novo Organizador'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do organizador"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Site</label>
                    <Input
                      value={formData.site}
                      onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                      placeholder="https://exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Instagram</label>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@organizador"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingOrganizer ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingOrganizer(null);
                      setFormData({ name: '', contact_email: '', site: '', instagram: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-lg">Carregando organizadores...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizers.map((organizer) => (
              <Card key={organizer.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{organizer.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{organizer.contact_email}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(organizer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(organizer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {organizer.site && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={organizer.site} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Site oficial
                        </a>
                      </div>
                    )}
                    {organizer.instagram && (
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{organizer.instagram}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-xs">
                        Criado em {new Date(organizer.created_at).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredOrganizers.length === 0 && !loading && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum organizador encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro organizador'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Organizador
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminOrganizers;