import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Edit, Trash2, Plus, Upload, Star, MapPin } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/alert-dialog-confirm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { EnvironmentBanner } from '@/components/EnvironmentBanner';
import { useSimulationMode } from '@/hooks/useSimulationMode';

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact_email: '',
    website: '',
    instagram: '',
    image_url: '',
    types: [],
    capacity: '',
    featured: false
  });

  const { isAuthenticated } = useAdminAuth();
  const { isSimulating, simulateOperation, isReadOnlyError } = useSimulationMode();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPartners();
    }
  }, [isAuthenticated]);

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
      toast.error("Falha ao carregar parceiros.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('partner-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('partner-logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Logo enviado com sucesso!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Falha ao enviar logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let result;
      if (editingPartner) {
        result = await supabase
          .from('partners')
          .update(formData)
          .eq('id', editingPartner.id);
      } else {
        result = await supabase
          .from('partners')
          .insert([formData]);
      }

      if (result.error) {
        if (isReadOnlyError(result.error)) {
          return simulateOperation(
            editingPartner ? 'Atualização' : 'Criação', 
            'parceiro',
            () => {
              if (editingPartner) {
                setPartners(prev => prev.map(partner => 
                  partner.id === editingPartner.id ? { ...partner, ...formData } : partner
                ));
              } else {
                setPartners(prev => [...prev, { 
                  ...formData, 
                  id: Date.now().toString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  rating: 0.0
                }]);
              }
              setFormData({
                name: '',
                location: '',
                contact_email: '',
                website: '',
                instagram: '',
                image_url: '',
                types: [],
                capacity: '',
                featured: false
              });
              setEditingPartner(null);
            }
          );
        }
        throw result.error;
      }

      toast.success(editingPartner ? "Parceiro atualizado com sucesso!" : "Parceiro criado com sucesso!");

      setFormData({
        name: '',
        location: '',
        contact_email: '',
        website: '',
        instagram: '',
        image_url: '',
        types: [],
        capacity: '',
        featured: false
      });
      setEditingPartner(null);
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error("Falha ao salvar parceiro.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      location: partner.location || '',
      contact_email: partner.contact_email || '',
      website: partner.website || '',
      instagram: partner.instagram || '',
      image_url: partner.image_url || '',
      types: partner.types || [],
      capacity: partner.capacity || '',
      featured: partner.featured || false
    });
  };

  const handleDelete = async (partnerId) => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) {
        if (isReadOnlyError(error)) {
          return simulateOperation('Exclusão', 'parceiro', () => {
            setPartners(prev => prev.filter(partner => partner.id !== partnerId));
          });
        }
        throw error;
      }

      toast.success("Parceiro excluído com sucesso!");
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error("Falha ao excluir parceiro.");
    }
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
            
            <EnvironmentBanner className="mb-6" />

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
                        placeholder="@usuario"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidade</Label>
                      <Input
                        id="capacity"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="Ex: 500 pessoas"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo">Logo do Parceiro</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                      </div>
                      {formData.image_url && (
                        <div className="mt-2">
                          <img
                            src={formData.image_url}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                      />
                      <Label htmlFor="featured">Parceiro em Destaque</Label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving || isSimulating || uploading}>
                      {(saving || isSimulating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                            contact_email: '',
                            website: '',
                            instagram: '',
                            image_url: '',
                            types: [],
                            capacity: '',
                            featured: false
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
                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(partner)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <ConfirmDialog
                            title="Excluir Parceiro"
                            description="Tem certeza que deseja excluir este parceiro? Esta ação não pode ser desfeita."
                            onConfirm={() => handleDelete(partner.id)}
                            confirmText="Excluir"
                            cancelText="Cancelar"
                            variant="destructive"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </ConfirmDialog>
                        </div>

                        <CardContent className="p-4">
                          {partner.image_url && (
                            <div className="mb-4">
                              <img
                                src={partner.image_url}
                                alt={partner.name}
                                className="w-full h-32 object-cover rounded"
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{partner.name}</h3>
                              {partner.featured && (
                                <Badge variant="default">
                                  <Star className="w-3 h-3 mr-1" />
                                  Destaque
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-1" />
                              {partner.location}
                            </div>
                            
                            {partner.capacity && (
                              <p className="text-sm text-muted-foreground">
                                Capacidade: {partner.capacity}
                              </p>
                            )}
                            
                            {partner.contact_email && (
                              <p className="text-sm text-muted-foreground">
                                {partner.contact_email}
                              </p>
                            )}
                            
                            <div className="flex gap-2 pt-2">
                              {partner.website && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                                    Website
                                  </a>
                                </Button>
                              )}
                              {partner.instagram && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`https://instagram.com/${partner.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                    Instagram
                                  </a>
                                </Button>
                              )}
                            </div>
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

export default AdminPartners;