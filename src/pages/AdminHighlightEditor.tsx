import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, ArrowLeft } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import HighlightPreview from "@/components/admin/HighlightPreview";
import { usePublishedHighlights } from "@/hooks/usePublishedHighlights";

type CityEnum = 'porto_alegre' | 'sao_paulo' | 'rio_de_janeiro' | 'florianopolis' | 'curitiba';

interface HighlightForm {
  city: CityEnum;
  event_title: string;
  venue: string;
  ticket_url: string;
  event_date: string;
  role_text: string;
  selection_reasons: string[];
  image_url: string;
  photo_credit: string;
  sort_order: number;
  is_published: boolean;
}

const AdminHighlightEditor = () => {
  const { adminUser, loading: authLoading, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  // Estados separados para upload e salvamento
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newReason, setNewReason] = useState('');

  const [form, setForm] = useState<HighlightForm>({
    city: '' as CityEnum,
    event_title: '',
    venue: '',
    ticket_url: '',
    event_date: '',
    role_text: '',
    selection_reasons: [],
    image_url: '',
    photo_credit: '',
    sort_order: 100,
    is_published: false,
  });
  
  const { getImageUrl, getCityDisplayName } = usePublishedHighlights();

  const cities = [
    { value: 'porto_alegre', label: 'Porto Alegre' },
    { value: 'sao_paulo', label: 'São Paulo' },
    { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
    { value: 'florianopolis', label: 'Florianópolis' },
    { value: 'curitiba', label: 'Curitiba' },
  ];

  // Função para gerar slug seguro
  const slugify = (v: string) => {
    return v
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Upload independente para o Storage
  const uploadCoverToStorage = async (file: File, city: string, title: string) => {
    setUploadingCover(true);
    try {
      const cleanCity = slugify(city);
      const cleanTitle = slugify(title || 'destaque');
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `covers/${cleanCity}/${Date.now()}-${cleanTitle}.${ext}`;

      console.log('📤 Uploading to:', path);

      const { error: upErr } = await supabase.storage
        .from('blog-images')
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type || `image/${ext}`,
          upsert: false,
        });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
      console.log('✅ Upload completo:', data.publicUrl);
      return data.publicUrl;
    } finally {
      setUploadingCover(false);
    }
  };

  // Seleção e upload imediato da imagem
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação básica
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo deve ser uma imagem');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Arquivo muito grande (máximo 5MB)');
      return;
    }
    
    setCoverFile(file);
    
    // Preview imediato
    const reader = new FileReader();
    reader.onload = () => {
      setCoverUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload automático se tiver título
    if (form.event_title) {
      try {
        const uploadedUrl = await uploadCoverToStorage(file, form.city, form.event_title);
        setCoverUrl(uploadedUrl);
        setForm(prev => ({ ...prev, image_url: uploadedUrl }));
        toast.success('Imagem enviada com sucesso!');
      } catch (error: any) {
        console.error('Erro no upload:', error);
        toast.error('Erro ao enviar imagem, mas você pode salvar como rascunho');
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
      return;
    }
    
    if (isEdit && id) {
      fetchHighlight();
    }
  }, [isAuthenticated, authLoading, navigate, isEdit, id]);

  const fetchHighlight = async () => {
    if (!id) return;
    
    try {
      if (!adminUser?.email) {
        toast.error('Admin não autenticado');
        navigate('/admin/highlights');
        return;
      }

      console.log('Carregando destaque via RPC:', { adminEmail: adminUser.email, id });

      const { data, error } = await supabase.rpc('admin_get_highlight_by_id', {
        p_admin_email: adminUser.email,
        p_highlight_id: id
      });

      if (error) {
        console.error('Erro RPC ao carregar destaque:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        toast.error('Destaque não encontrado');
        navigate('/admin/highlights');
        return;
      }
      
      const highlight = data[0];
      console.log('Destaque carregado para edição:', highlight);
      
      setForm({
        city: highlight.city,
        event_title: highlight.event_title,
        venue: highlight.venue,
        ticket_url: highlight.ticket_url || '',
        role_text: highlight.role_text,
        selection_reasons: highlight.selection_reasons || [],
        image_url: highlight.image_url,
        photo_credit: highlight.photo_credit || '',
        event_date: highlight.event_date || '',
        sort_order: highlight.sort_order || 100,
        is_published: highlight.is_published,
      });
      
      // Sincronizar coverUrl com image_url para edição
      setCoverUrl(highlight.image_url || '');
    } catch (error) {
      console.error('Erro ao carregar destaque:', error);
      toast.error('Erro ao carregar destaque');
      navigate('/admin/highlights');
    }
  };

  const addReason = () => {
    if (!newReason.trim()) return;
    
    setForm(prev => ({
      ...prev,
      selection_reasons: [...prev.selection_reasons, newReason.trim()]
    }));
    setNewReason('');
  };

  const removeReason = (index: number) => {
    setForm(prev => ({
      ...prev,
      selection_reasons: prev.selection_reasons.filter((_, i) => i !== index)
    }));
  };

  // Função para salvar highlight com tolerância a falhas
  const handleSaveHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!form.event_title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!form.venue.trim()) {
      toast.error('Local é obrigatório');
      return;
    }

    if (form.role_text.length < 50) {
      toast.error('Texto deve ter pelo menos 50 caracteres');
      return;
    }

    if (form.selection_reasons.length === 0) {
      toast.error('Adicione pelo menos um motivo de seleção');
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = form.image_url || coverUrl;

      // Tentar upload se tem arquivo e ainda não tem URL final
      if (!finalImageUrl && coverFile) {
        try {
          finalImageUrl = await uploadCoverToStorage(coverFile, form.city, form.event_title);
          setCoverUrl(finalImageUrl);
        } catch (uploadError: any) {
          console.error('Erro no upload da capa:', uploadError?.message || uploadError);
          toast.error('Falha ao enviar a imagem. Salvando como rascunho sem capa.');
          
          // Converter para rascunho se era para publicar
          if (form.is_published) {
            setForm(prev => ({ ...prev, is_published: false }));
            toast.info('Publicação convertida para Rascunho por falta de imagem.');
          }
          finalImageUrl = '';
        }
      }

      // Preparar dados para salvar
      const dataToSave = {
        ...form,
        image_url: finalImageUrl || ''
      };

      if (isEdit) {
        // Editando highlight existente
        const { error } = await supabase.rpc('admin_update_highlight', {
          p_admin_email: adminUser.email,
          p_highlight_id: id,
          p_city: dataToSave.city as any,
          p_event_title: dataToSave.event_title,
          p_venue: dataToSave.venue,
          p_ticket_url: dataToSave.ticket_url || null,
          p_role_text: dataToSave.role_text,
          p_selection_reasons: dataToSave.selection_reasons,
          p_image_url: dataToSave.image_url,
          p_photo_credit: dataToSave.photo_credit || null,
          p_event_date: dataToSave.event_date ? new Date(dataToSave.event_date).toISOString().split('T')[0] : null,
          p_sort_order: dataToSave.sort_order,
          p_is_published: dataToSave.is_published
        });

        if (error) throw error;
        toast.success(dataToSave.is_published ? 'Destaque publicado!' : 'Destaque atualizado!');
      } else {
        // Criando novo highlight
        const { error } = await supabase.rpc('admin_create_highlight', {
          p_admin_email: adminUser.email,
          p_city: dataToSave.city as any,
          p_event_title: dataToSave.event_title,
          p_venue: dataToSave.venue,
          p_ticket_url: dataToSave.ticket_url || null,
          p_role_text: dataToSave.role_text,
          p_selection_reasons: dataToSave.selection_reasons,
          p_image_url: dataToSave.image_url,
          p_photo_credit: dataToSave.photo_credit || null,
          p_event_date: dataToSave.event_date ? new Date(dataToSave.event_date).toISOString().split('T')[0] : null,
          p_sort_order: dataToSave.sort_order,
          p_is_published: dataToSave.is_published
        });

        if (error) throw error;
        toast.success(dataToSave.is_published ? 'Destaque publicado!' : 'Rascunho salvo!');
      }

      navigate('/admin/highlights');
    } catch (error: any) {
      console.error('Erro ao salvar destaque:', error);
      toast.error(error.message || 'Erro ao salvar destaque');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/admin/highlights')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Editar Destaque' : 'Novo Destaque'}
        </h1>
      </div>

      <form onSubmit={handleSaveHighlight}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Select value={form.city} onValueChange={(value: CityEnum) => setForm(prev => ({ ...prev, city: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date">Data do Evento</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm(prev => ({ ...prev, event_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_title">Título do Evento *</Label>
              <Input
                id="event_title"
                value={form.event_title}
                onChange={(e) => setForm(prev => ({ ...prev, event_title: e.target.value }))}
                placeholder="Ex: Fiesta Latina Baila Baila"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Local do Evento *</Label>
              <Input
                id="venue"
                value={form.venue}
                onChange={(e) => setForm(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Ex: Club Substation, Copacabana"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket_url">Link do Ingresso</Label>
              <Input
                id="ticket_url"
                type="url"
                value={form.ticket_url}
                onChange={(e) => setForm(prev => ({ ...prev, ticket_url: e.target.value }))}
                placeholder="https://shotgun.link/exemplo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_text">
                Texto do ROLÊ * ({form.role_text.length}/400 caracteres)
              </Label>
              <Textarea
                id="role_text"
                value={form.role_text}
                onChange={(e) => setForm(prev => ({ ...prev, role_text: e.target.value }))}
                placeholder="Texto editorial informativo e afiado sobre o evento..."
                className="min-h-[120px]"
                maxLength={400}
                required
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 50 caracteres. Seja direto, afiado e informativo.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Motivos do Destaque *</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Ex: impacto cultural, diversidade, pista..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReason())}
                />
                <Button type="button" onClick={addReason} disabled={!newReason.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="mb-2">
                <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
                <div className="flex flex-wrap gap-1">
                  {['impacto cultural', 'diversidade', 'pista', 'cena local', 'estreia', 'data especial'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        if (!form.selection_reasons.includes(suggestion)) {
                          setForm(prev => ({
                            ...prev,
                            selection_reasons: [...prev.selection_reasons, suggestion]
                          }));
                        }
                      }}
                    >
                      + {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.selection_reasons.map((reason, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {reason}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeReason(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              {form.selection_reasons.length === 0 && (
                <p className="text-xs text-destructive">Adicione pelo menos um motivo</p>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="image">Imagem do Evento</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {uploadingCover && (
                  <p className="text-sm text-blue-600 mt-1">
                    📤 Enviando imagem...
                  </p>
                )}
                {coverFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Imagem selecionada: {coverFile.name}
                  </p>
                )}
                {coverUrl && (
                  <div className="mt-2 relative">
                    <img 
                      src={coverUrl} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white p-0"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverUrl('');
                        setForm(prev => ({ ...prev, image_url: '' }));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  A imagem não é obrigatória. Rascunhos podem ser salvos sem imagem.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo_credit">Crédito da Foto</Label>
                <Input
                  id="photo_credit"
                  value={form.photo_credit}
                  onChange={(e) => setForm(prev => ({ ...prev, photo_credit: e.target.value }))}
                  placeholder="Ex: @fotografo ou Nome do Fotógrafo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordem de Exibição</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 100 }))}
                  placeholder="100"
                  min="0"
                  max="999"
                />
                <p className="text-xs text-muted-foreground">
                  Menor número = aparece primeiro. Padrão: 100
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_published"
                  checked={form.is_published}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_published: checked }))}
                />
                <Label htmlFor="is_published">Publicar destaque</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 mt-6">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => navigate('/admin/highlights')}
          >
            Voltar para Lista
          </Button>
          
          <Button 
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            variant="secondary"
          >
            {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
          </Button>
          
          <Button 
            type="submit"
            disabled={saving}
            className="ml-auto"
          >
            {saving ? 'Salvando...' : (isEdit ? 'Atualizar Destaque' : 'Salvar Destaque')}
          </Button>
        </div>
      </form>

      {showPreview && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview do Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <HighlightPreview 
              highlight={{
                city: form.city,
                event_title: form.event_title,
                venue: form.venue,
                ticket_url: form.ticket_url,
                role_text: form.role_text,
                selection_reasons: form.selection_reasons,
                image_url: coverUrl || form.image_url,
                photo_credit: form.photo_credit,
                event_date: form.event_date,
                like_count: 0
              }}
              getCityDisplayName={getCityDisplayName}
              getImageUrl={getImageUrl}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminHighlightEditor;