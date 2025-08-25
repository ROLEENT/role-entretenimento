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
import { X, Plus, Save, ArrowLeft, Upload, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import HighlightPreview from "@/components/admin/HighlightPreview";
import { usePublishedHighlights } from "@/hooks/usePublishedHighlights";
import { uploadHighlightImage } from "@/lib/upload";

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
  
  // Estados separados para imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newReason, setNewReason] = useState('');

  const [form, setForm] = useState<HighlightForm>({
    city: 'porto_alegre',
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

  // Função para selecionar arquivo (sem upload automático)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação básica
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Arquivo muito grande (máximo 5MB).');
      return;
    }

    setImageFile(file);
    
    // Preview local
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);

    toast.success('Arquivo selecionado! Clique em "Enviar Imagem" para fazer upload.');
  };

  // Função para upload direto
  const handleUploadImage = async () => {
    if (!imageFile) {
      toast.error('Selecione uma imagem primeiro');
      return;
    }

    setUploading(true);
    
    try {
      console.log('🔥 Iniciando upload da imagem...');
      
      // Fazer upload usando a função robusta para highlights
      const imageUrl = await uploadHighlightImage(imageFile, form.event_title || 'highlight');
      
      console.log('✅ Upload concluído! URL:', imageUrl);
      
      // Atualizar form com a URL
      setForm(prev => ({ ...prev, image_url: imageUrl }));
      
      // Usar a URL direta para preview
      setImagePreviewUrl(imageUrl);
      
      // Limpar arquivo selecionado
      setImageFile(null);
      
      toast.success('Imagem enviada com sucesso! Agora você pode salvar o destaque.');
      
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erro no upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  // Função para remover imagem
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl('');
    setForm(prev => ({ ...prev, image_url: '' }));
    
    // Limpar preview URL se era objeto URL local
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    
    toast.success('Imagem removida');
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
      return;
    }
    
    if (isEdit && id && adminUser?.email) {
      console.log('🎯 Chamando fetchHighlight - condições atendidas:', {
        isEdit,
        id,
        adminEmail: adminUser.email,
        isAuthenticated
      });
      fetchHighlight();
    }
  }, [isAuthenticated, authLoading, navigate, isEdit, id, adminUser?.email]);

  const fetchHighlight = async () => {
    if (!id) return;
    
    try {
      if (!adminUser?.email) {
        console.error('❌ Admin não autenticado - email:', adminUser?.email);
        toast.error('Admin não autenticado');
        navigate('/admin/highlights');
        return;
      }

      console.log('🔄 Carregando destaque via RPC:', { 
        adminEmail: adminUser.email, 
        highlightId: id,
        isEdit 
      });

      const { data, error } = await supabase.rpc('admin_get_highlight_by_id', {
        p_admin_email: adminUser.email,
        p_highlight_id: id
      });

      console.log('📦 Resposta da RPC:', { data, error });

      if (error) {
        console.error('❌ Erro RPC ao carregar destaque:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('❌ Destaque não encontrado - data:', data);
        toast.error('Destaque não encontrado ou sem permissão para acessar');
        navigate('/admin/highlights');
        return;
      }
      
      const highlight = data[0];
      console.log('✅ Destaque carregado para edição:', highlight);
      
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
      
      // Se há imagem, definir preview
      if (highlight.image_url) {
        console.log('🖼️ Definindo preview da imagem:', highlight.image_url);
        setImagePreviewUrl(highlight.image_url);
      }
      
      console.log('✅ Form preenchido com sucesso:', {
        event_title: highlight.event_title,
        is_published: highlight.is_published,
        city: highlight.city
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar destaque:', error);
      toast.error(`Erro ao carregar destaque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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

  // Função para salvar destaque
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

    // Se está publicando, precisa ter imagem
    if (form.is_published && !form.image_url) {
      toast.error('Imagem é obrigatória para publicar o destaque');
      return;
    }

    setSaving(true);

    try {
      const dataToSave = {
        ...form,
        selection_reasons: form.selection_reasons.filter(reason => reason.trim() !== '')
      };

      console.log('💾 Salvando destaque:', dataToSave);
      console.log('🖼️ URL da imagem que será salva:', dataToSave.image_url);

      let result;
      if (isEdit && id) {
        // Atualizar destaque existente
        result = await supabase.rpc('admin_update_highlight', {
          p_admin_email: adminUser?.email,
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
      } else {
        // Criar novo destaque
        result = await supabase.rpc('admin_create_highlight', {
          p_admin_email: adminUser?.email,
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
      }

      if (result?.error) {
        console.error('❌ Erro ao salvar destaque:', result.error);
        throw result.error;
      }

      console.log('✅ Destaque salvo com sucesso:', result?.data);

      toast.success(`Destaque ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
      navigate('/admin/highlights');
    } catch (error) {
      console.error('❌ Erro geral ao salvar:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar destaque');
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
                placeholder="https://shotgun.link/eventos/destaque"
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

            {/* Seção de Imagem Simplificada */}
            <div className="space-y-4">
              <Label htmlFor="image">Imagem do Evento</Label>
              
              {/* Status da imagem */}
              <div className="text-sm p-3 bg-muted rounded-md">
                {form.image_url ? (
                  <span className="text-green-600 font-medium">✅ Imagem enviada e pronta para publicação</span>
                ) : imageFile ? (
                  <span className="text-yellow-600 font-medium">⏳ Imagem selecionada (clique em "Enviar Imagem")</span>
                ) : (
                  <span className="text-gray-500">❌ Nenhuma imagem selecionada</span>
                )}
              </div>

              {/* Seleção de arquivo */}
              <Input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />

              {/* Botões de ação */}
              <div className="flex gap-2">
                {imageFile && !form.image_url && (
                  <Button 
                    type="button"
                    onClick={handleUploadImage}
                    disabled={uploading}
                    variant="default"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar Imagem
                      </>
                    )}
                  </Button>
                )}

                {(imagePreviewUrl || form.image_url) && (
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover Imagem
                  </Button>
                )}
              </div>

              {/* Preview da imagem */}
              {imagePreviewUrl && (
                <div className="mt-4">
                  <img 
                    src={imagePreviewUrl} 
                    alt="Preview" 
                    className="max-w-sm rounded-lg border shadow-sm"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
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
            disabled={saving || uploading}
            className="ml-auto"
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </div>
            ) : (
              `${isEdit ? 'Atualizar' : 'Criar'} Destaque`
            )}
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
                image_url: imagePreviewUrl || form.image_url,
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