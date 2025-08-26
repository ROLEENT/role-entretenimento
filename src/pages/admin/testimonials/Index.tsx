import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
// Removed useAdminAuth - using Supabase Auth via AdminProtectedRoute
import { Loader2, MessageSquare, Edit, Trash2, Plus, Upload, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AdminTestimonialsIndex = () => {
  // Authentication handled by AdminProtectedRoute
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    quote: '',
    rating: 5,
    is_published: false,
    avatar_url: ''
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      quote: '',
      rating: 5,
      is_published: false,
      avatar_url: ''
    });
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      quote: testimonial.quote,
      rating: testimonial.rating,
      is_published: testimonial.is_published,
      avatar_url: testimonial.avatar_url || ''
    });
    setShowDialog(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Selecione apenas arquivos de imagem",
        variant: "destructive"
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('testimonials')
        .upload(fileName, file);

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        avatar_url: data.path
      }));

      toast({
        title: "Sucesso!",
        description: "Avatar enviado com sucesso"
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar avatar",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Authentication handled by AdminProtectedRoute

    setLoading(true);

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(formData)
          .eq('id', editingTestimonial.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Depoimento atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Depoimento criado com sucesso"
        });
      }

      setShowDialog(false);
      resetForm();
      loadTestimonials();
    } catch (error: any) {
      console.error('Erro ao salvar depoimento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar depoimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Depoimento excluído com sucesso"
      });

      loadTestimonials();
    } catch (error: any) {
      console.error('Erro ao excluir depoimento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir depoimento",
        variant: "destructive"
      });
    }
  };

  const togglePublished = async (testimonial: any) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_published: !testimonial.is_published })
        .eq('id', testimonial.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Depoimento ${!testimonial.is_published ? 'publicado' : 'despublicado'} com sucesso`
      });

      loadTestimonials();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status",
        variant: "destructive"
      });
    }
  };

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    if (avatarUrl.startsWith('/')) return avatarUrl;
    return `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/testimonials/${avatarUrl}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Depoimentos</h1>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Depoimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="role">Função/Cargo</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote">Depoimento *</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Avaliação</Label>
                <div className="flex items-center gap-2">
                  <select
                    id="rating"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>
                        {rating} estrela{rating > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {formData.avatar_url && (
                  <img
                    src={getAvatarUrl(formData.avatar_url)}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <Label htmlFor="published">Publicar depoimento</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingTestimonial ? 'Atualizar' : 'Criar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loadingTestimonials ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Carregando depoimentos...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum depoimento encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={testimonial.is_published ? 'border-green-200' : 'border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAvatarUrl(testimonial.avatar_url) ? (
                      <img
                        src={getAvatarUrl(testimonial.avatar_url)}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {testimonial.role && (
                        <p className="text-sm text-muted-foreground mb-2">{testimonial.role}</p>
                      )}
                      <p className="text-sm italic">"{testimonial.quote}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={testimonial.is_published}
                        onCheckedChange={() => togglePublished(testimonial)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {testimonial.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTestimonialsIndex;