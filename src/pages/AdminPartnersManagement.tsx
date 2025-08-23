import { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2, MapPin, Star, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

const AdminPartnersManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    image_url: '',
    rating: 0,
    capacity: '',
    types: [],
    featured: false,
    contact_email: '',
    website: '',
    instagram: ''
  });

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPartners();
    }
  }, [isAuthenticated]);

  // Temporary bypass of role check - will be handled by RLS
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar parceiros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        types: formData.types.filter(type => type.trim() !== '')
      };

      let result;
      if (editingPartner) {
        result = await supabase
          .from('partners')
          .update(submitData)
          .eq('id', editingPartner.id);
      } else {
        result = await supabase
          .from('partners')
          .insert([submitData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: editingPartner ? "Parceiro atualizado com sucesso!" : "Parceiro criado com sucesso!"
      });

      setFormData({
        name: '',
        location: '',
        image_url: '',
        rating: 0,
        capacity: '',
        types: [],
        featured: false,
        contact_email: '',
        website: '',
        instagram: ''
      });
      setEditingPartner(null);
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar parceiro.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      location: partner.location || '',
      image_url: partner.image_url || '',
      rating: partner.rating || 0,
      capacity: partner.capacity || '',
      types: partner.types || [],
      featured: partner.featured || false,
      contact_email: partner.contact_email || '',
      website: partner.website || '',
      instagram: partner.instagram || ''
    });
  };

  const handleDelete = async (partnerId) => {
    if (!confirm('Tem certeza que deseja excluir este parceiro?')) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parceiro excluído com sucesso!"
      });

      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir parceiro.",
        variant: "destructive"
      });
    }
  };

  const handleTypesChange = (value) => {
    const typesArray = value.split(',').map(type => type.trim());
    setFormData(prev => ({ ...prev, types: typesArray }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gerenciar Parceiros – ROLÊ ENTRETENIMENTO</title>
      </Helmet>

      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Gerenciar Parceiros</h1>

            {/* Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingPartner ? 'Editar Parceiro' : 'Adicionar Novo Parceiro'}</CardTitle>
                <CardDescription>
                  {editingPartner ? 'Atualize as informações do parceiro' : 'Preencha os dados do novo parceiro'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Localização *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">URL da Imagem</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Avaliação (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidade</Label>
                      <Input
                        id="capacity"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="ex: 800 pessoas"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="types">Tipos (separados por vírgula)</Label>
                      <Input
                        id="types"
                        value={formData.types.join(', ')}
                        onChange={(e) => handleTypesChange(e.target.value)}
                        placeholder="ex: Eletrônica, Techno"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email de Contato</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="@username"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                      />
                      <Label htmlFor="featured">Destaque</Label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingPartner ? 'Atualizar' : 'Criar'} Parceiro
                    </Button>
                    
                    {editingPartner && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingPartner(null);
                          setFormData({
                            name: '',
                            location: '',
                            image_url: '',
                            rating: 0,
                            capacity: '',
                            types: [],
                            featured: false,
                            contact_email: '',
                            website: '',
                            instagram: ''
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Partners List */}
            <Card>
              <CardHeader>
                <CardTitle>Parceiros Cadastrados ({partners.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : partners.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">Nenhum parceiro cadastrado</h3>
                    <p className="text-muted-foreground">Adicione o primeiro parceiro usando o formulário acima.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partners.map((partner) => (
                      <Card key={partner.id} className="relative">
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(partner)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(partner.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {partner.image_url && (
                          <img 
                            src={partner.image_url} 
                            alt={partner.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}

                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{partner.name}</h3>
                            {partner.featured && (
                              <Badge className="bg-primary text-primary-foreground">
                                Destaque
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{partner.location}</span>
                          </div>

                          {partner.rating > 0 && (
                            <div className="flex items-center text-muted-foreground mb-2">
                              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                              <span className="text-sm">{partner.rating}</span>
                            </div>
                          )}

                          {partner.capacity && (
                            <div className="flex items-center text-muted-foreground mb-3">
                              <Users className="w-4 h-4 mr-1" />
                              <span className="text-sm">{partner.capacity}</span>
                            </div>
                          )}

                          {partner.types?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {partner.types.map((type, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
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

export default AdminPartnersManagement;