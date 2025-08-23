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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

const AdminAdvertisementsManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    cta_text: '',
    cta_url: '',
    badge_text: '',
    gradient_from: '#3B82F6',
    gradient_to: '#8B5CF6',
    type: 'card',
    position: 0,
    active: true
  });

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdvertisements();
    }
  }, [isAuthenticated]);

  // Temporary bypass of role check - will be handled by RLS
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar anúncios.",
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
      let result;
      if (editingAd) {
        result = await supabase
          .from('advertisements')
          .update(formData)
          .eq('id', editingAd.id);
      } else {
        result = await supabase
          .from('advertisements')
          .insert([formData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: editingAd ? "Anúncio atualizado com sucesso!" : "Anúncio criado com sucesso!"
      });

      setFormData({
        title: '',
        description: '',
        image_url: '',
        cta_text: '',
        cta_url: '',
        badge_text: '',
        gradient_from: '#3B82F6',
        gradient_to: '#8B5CF6',
        type: 'card',
        position: 0,
        active: true
      });
      setEditingAd(null);
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar anúncio.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      image_url: ad.image_url || '',
      cta_text: ad.cta_text || '',
      cta_url: ad.cta_url || '',
      badge_text: ad.badge_text || '',
      gradient_from: ad.gradient_from || '#3B82F6',
      gradient_to: ad.gradient_to || '#8B5CF6',
      type: ad.type || 'card',
      position: ad.position || 0,
      active: ad.active ?? true
    });
  };

  const handleDelete = async (adId) => {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Anúncio excluído com sucesso!"
      });

      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir anúncio.",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (adId, currentActive) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ active: !currentActive })
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Anúncio ${!currentActive ? 'ativado' : 'desativado'} com sucesso!`
      });

      fetchAdvertisements();
    } catch (error) {
      console.error('Error toggling advertisement:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status do anúncio.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gerenciar Anúncios – ROLÊ ENTRETENIMENTO</title>
      </Helmet>

      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Gerenciar Anúncios</h1>

            {/* Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingAd ? 'Editar Anúncio' : 'Adicionar Novo Anúncio'}</CardTitle>
                <CardDescription>
                  {editingAd ? 'Atualize as informações do anúncio' : 'Preencha os dados do novo anúncio'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="badge_text">Texto do Badge *</Label>
                      <Input
                        id="badge_text"
                        value={formData.badge_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta_text">Texto do Botão *</Label>
                      <Input
                        id="cta_text"
                        value={formData.cta_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta_url">URL do Botão</Label>
                      <Input
                        id="cta_url"
                        type="url"
                        value={formData.cta_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Anúncio</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Posição</Label>
                      <Input
                        id="position"
                        type="number"
                        min="0"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gradient_from">Cor Inicial do Gradiente</Label>
                      <Input
                        id="gradient_from"
                        type="color"
                        value={formData.gradient_from}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient_from: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gradient_to">Cor Final do Gradiente</Label>
                      <Input
                        id="gradient_to"
                        type="color"
                        value={formData.gradient_to}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient_to: e.target.value }))}
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

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                      />
                      <Label htmlFor="active">Ativo</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div 
                      className="p-6 rounded-lg text-white relative overflow-hidden"
                      style={{
                        background: `linear-gradient(to right, ${formData.gradient_from}, ${formData.gradient_to})`
                      }}
                    >
                      <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                        {formData.badge_text || 'Badge'}
                      </Badge>
                      <h3 className="text-xl font-bold mb-2">{formData.title || 'Título'}</h3>
                      <p className="text-white/90 text-sm mb-4">
                        {formData.description || 'Descrição do anúncio...'}
                      </p>
                      <button className="bg-white text-primary px-4 py-2 rounded text-sm font-medium">
                        {formData.cta_text || 'Botão'}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingAd ? 'Atualizar' : 'Criar'} Anúncio
                    </Button>
                    
                    {editingAd && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingAd(null);
                          setFormData({
                            title: '',
                            description: '',
                            image_url: '',
                            cta_text: '',
                            cta_url: '',
                            badge_text: '',
                            gradient_from: '#3B82F6',
                            gradient_to: '#8B5CF6',
                            type: 'card',
                            position: 0,
                            active: true
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

            {/* Advertisements List */}
            <Card>
              <CardHeader>
                <CardTitle>Anúncios Cadastrados ({advertisements.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : advertisements.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">Nenhum anúncio cadastrado</h3>
                    <p className="text-muted-foreground">Adicione o primeiro anúncio usando o formulário acima.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {advertisements.map((ad) => (
                      <Card key={ad.id} className="relative">
                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(ad.id, ad.active)}
                            className="bg-background/80 backdrop-blur-sm"
                          >
                            {ad.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(ad)}
                            className="bg-background/80 backdrop-blur-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(ad.id)}
                            className="bg-background/80 backdrop-blur-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div 
                          className="p-6 text-white relative overflow-hidden rounded-t-lg"
                          style={{
                            background: `linear-gradient(to right, ${ad.gradient_from}, ${ad.gradient_to})`
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                              {ad.badge_text}
                            </Badge>
                            <Badge variant={ad.active ? "default" : "secondary"}>
                              {ad.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-white">
                              {ad.type}
                            </Badge>
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
                          <p className="text-white/90 text-sm mb-4">
                            {ad.description}
                          </p>
                          <div className="bg-white text-primary px-3 py-1 rounded text-sm font-medium inline-block">
                            {ad.cta_text}
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">
                            <p>Posição: {ad.position}</p>
                            {ad.cta_url && <p>URL: {ad.cta_url}</p>}
                          </div>
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

export default AdminAdvertisementsManagement;