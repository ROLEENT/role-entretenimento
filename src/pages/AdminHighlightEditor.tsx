import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadHighlightImage } from "@/lib/upload";
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
import { supabase } from "@/integrations/supabase/client";
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
    sort_order: 0,
    is_published: false,
  });
  
  const [newReason, setNewReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { getImageUrl, getCityDisplayName } = usePublishedHighlights();

  const cities = [
    { value: 'porto_alegre', label: 'Porto Alegre' },
    { value: 'sao_paulo', label: 'São Paulo' },
    { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
    { value: 'florianopolis', label: 'Florianópolis' },
    { value: 'curitiba', label: 'Curitiba' },
  ];

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
    } catch (error) {
      console.error('Erro ao carregar destaque:', error);
      toast.error('Erro ao carregar destaque');
      navigate('/admin/highlights');
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) {
      console.log('❌ UPLOAD DEBUG: Nenhum arquivo selecionado');
      return;
    }

    // Verificar se admin está autenticado
    if (!adminUser?.email) {
      toast.error('Você precisa estar logado como admin para fazer upload');
      navigate('/admin/login');
      return;
    }
    
    // Validação de tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, etc.)');
      console.log('❌ UPLOAD DEBUG: Tipo de arquivo inválido:', file.type);
      return;
    }
    
    // Validação de tamanho (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB. Tamanho atual: ' + (file.size / 1024 / 1024).toFixed(1) + 'MB');
      console.log('❌ UPLOAD DEBUG: Arquivo muito grande:', {
        fileSize: file.size,
        maxSize: maxSize,
        fileSizeMB: (file.size / 1024 / 1024).toFixed(1)
      });
      return;
    }
    
    console.log('🔄 UPLOAD DEBUG: Iniciando upload da imagem:', {
      fileName: file.name,
      fileSize: file.size,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(1),
      fileType: file.type,
      eventTitle: form.event_title,
      adminEmail: adminUser.email
    });
    
    setImageUploading(true);
    try {
      const imageUrl = await uploadHighlightImage(file, form.event_title || 'highlight');
      
      console.log('✅ UPLOAD DEBUG: URL da imagem retornada:', imageUrl);
      
      setForm(prev => {
        const newForm = { ...prev, image_url: imageUrl };
        console.log('📝 UPLOAD DEBUG: Estado atualizado:', {
          previousImageUrl: prev.image_url,
          newImageUrl: imageUrl,
          formUpdated: newForm
        });
        return newForm;
      });
      
      toast.success('Imagem enviada com sucesso');
      console.log('✅ UPLOAD DEBUG: Upload concluído com sucesso');
    } catch (error) {
      console.error('❌ UPLOAD DEBUG: Erro ao enviar imagem:', error);
      
      // Verificar se é erro de autenticação/RLS
      if (error instanceof Error) {
        if (error.message.includes('row-level security') || error.message.includes('insufficient_privilege')) {
          toast.error('Erro de permissão: faça login como admin novamente');
          navigate('/admin/login');
        } else {
          toast.error('Erro ao enviar imagem: ' + error.message);
        }
      } else {
        toast.error('Erro desconhecido ao enviar imagem');
      }
    } finally {
      setImageUploading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações aprimoradas
    if (!form.event_title.trim()) {
      toast.error('O título do evento é obrigatório');
      return;
    }
    
    if (!form.venue.trim()) {
      toast.error('O local do evento é obrigatório');
      return;
    }
    
    if (!form.city) {
      toast.error('Selecione uma cidade');
      return;
    }
    
    if (!form.event_date) {
      toast.error('A data do evento é obrigatória');
      return;
    }
    
    if (!form.role_text.trim()) {
      toast.error('O texto do ROLÊ é obrigatório');
      return;
    }

    if (form.role_text.length < 50) {
      toast.error('O texto do ROLÊ deve ter pelo menos 50 caracteres');
      return;
    }

    if (form.role_text.length > 400) {
      toast.error('O texto do ROLÊ deve ter no máximo 400 caracteres');
      return;
    }

    if (form.selection_reasons.length === 0) {
      toast.error('Adicione pelo menos um motivo do destaque');
      return;
    }
    
    if (form.selection_reasons.length > 6) {
      toast.error('Máximo de 6 motivos de destaque permitidos');
      return;
    }

    console.log('🔍 VALIDATION DEBUG: Verificando imagem:', {
      imageUrl: form.image_url,
      imageUrlTrimmed: form.image_url.trim(),
      imageUrlLength: form.image_url.length,
      formCompleto: form
    });

    if (!form.image_url.trim()) {
      console.error('❌ VALIDATION DEBUG: Imagem obrigatória não encontrada');
      toast.error('A imagem do evento é obrigatória');
      return;
    }
    
    console.log('✅ VALIDATION DEBUG: Imagem validada com sucesso');

    // Validar URL do ticket se fornecida
    if (form.ticket_url && form.ticket_url.trim()) {
      try {
        new URL(form.ticket_url);
      } catch {
        toast.error('URL do ingresso inválida');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        city: form.city,
        event_title: form.event_title,
        venue: form.venue,
        ticket_url: form.ticket_url || null,
        event_date: form.event_date || null,
        role_text: form.role_text,
        selection_reasons: form.selection_reasons,
        image_url: form.image_url,
        photo_credit: form.photo_credit || null,
        sort_order: form.sort_order,
        is_published: form.is_published,
      };

      if (!adminUser?.email) {
        toast.error('Admin não autenticado');
        return;
      }

      console.log('Salvando destaque via RPC:', { isEdit, id, payload, adminEmail: adminUser.email });

      if (isEdit) {
        const { data, error } = await supabase.rpc('admin_update_highlight', {
          p_admin_email: adminUser.email,
          p_highlight_id: id,
          p_city: payload.city,
          p_event_title: payload.event_title,
          p_venue: payload.venue,
          p_ticket_url: payload.ticket_url,
          p_role_text: payload.role_text,
          p_selection_reasons: payload.selection_reasons,
          p_image_url: payload.image_url,
          p_photo_credit: payload.photo_credit,
          p_event_date: payload.event_date,
          p_sort_order: payload.sort_order,
          p_is_published: payload.is_published
        });
        
        if (error) {
          console.error('Erro RPC ao atualizar destaque:', error);
          throw error;
        }
        
        console.log('Destaque atualizado via RPC:', data);
        toast.success('Destaque atualizado com sucesso');
      } else {
        const { data, error } = await supabase.rpc('admin_create_highlight', {
          p_admin_email: adminUser.email,
          p_city: payload.city,
          p_event_title: payload.event_title,
          p_venue: payload.venue,
          p_ticket_url: payload.ticket_url,
          p_role_text: payload.role_text,
          p_selection_reasons: payload.selection_reasons,
          p_image_url: payload.image_url,
          p_photo_credit: payload.photo_credit,
          p_event_date: payload.event_date,
          p_sort_order: payload.sort_order,
          p_is_published: payload.is_published
        });
        
        if (error) {
          console.error('Erro RPC ao criar destaque:', error);
          throw error;
        }
        
        console.log('Destaque criado via RPC:', data);
        toast.success('Destaque criado com sucesso');
      }
      
      navigate('/admin/highlights');
    } catch (error) {
      console.error('Erro ao salvar destaque:', error);
      toast.error('Erro ao salvar destaque');
    } finally {
      setLoading(false);
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

      <form onSubmit={handleSubmit}>
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
                <Label htmlFor="event_date">Data do Evento *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm(prev => ({ ...prev, event_date: e.target.value }))}
                  required
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
                  <Badge key={index} variant="secondary" className="pr-1">
                    {reason}
                    <button
                      type="button"
                      onClick={() => removeReason(index)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Imagem do Evento</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  disabled={imageUploading}
                />
                {imageUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
                {form.image_url && (
                  <img
                    src={form.image_url.startsWith('http') 
                      ? form.image_url 
                      : `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/highlights/${form.image_url}`
                    }
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo_credit">Crédito da Foto</Label>
                <Input
                  id="photo_credit"
                  value={form.photo_credit}
                  onChange={(e) => setForm(prev => ({ ...prev, photo_credit: e.target.value }))}
                  placeholder="Ex: Foto, Divulgação"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordenação</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground">
                  Maior número aparece primeiro
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_published">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={form.is_published}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_published: checked }))}
                  />
                  <Label htmlFor="is_published">
                    {form.is_published ? 'Publicado' : 'Rascunho'}
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4 mt-8">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/highlights')}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
            </Button>
          </div>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Destaque'}
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && form.event_title && form.venue && form.city && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Preview do Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <HighlightPreview
              highlight={form}
              getImageUrl={getImageUrl}
              getCityDisplayName={getCityDisplayName}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminHighlightEditor;