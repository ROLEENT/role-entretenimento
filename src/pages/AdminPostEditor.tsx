import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface BlogPostForm {
  title: string;
  slug_data: string;
  city: string;
  summary: string;
  content_html: string;
  cover_image: string;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_at: string;
}

const AdminPostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState("");
  
  const [formData, setFormData] = useState<BlogPostForm>({
    title: "",
    slug_data: "",
    city: "",
    summary: "",
    content_html: "",
    cover_image: "",
    tags: [],
    featured: false,
    status: 'draft',
    scheduled_at: ""
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    checkAuthAndLoadPost();
  }, [id]);

  const checkAuthAndLoadPost = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        return;
      }

      setUser(session.user);

      if (isEditing) {
        await loadPost();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        slug_data: data.slug_data,
        city: data.city,
        summary: data.summary,
        content_html: data.content_html,
        cover_image: data.cover_image,
        tags: data.tags || [],
        featured: data.featured,
        status: data.status,
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : ""
      });
    } catch (error) {
      console.error("Error loading post:", error);
      toast.error("Erro ao carregar artigo");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, cover_image: publicUrl }));
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleSave = async (status: 'draft' | 'published' | 'scheduled') => {
    if (!formData.title || !formData.city || !formData.summary || !formData.content_html) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        ...formData,
        status,
        slug: generateSlug(formData.title),
        author_id: user?.id,
        author_name: user?.user_metadata?.full_name || user?.email || 'Admin',
        published_at: status === 'published' ? new Date().toISOString() : null,
        scheduled_at: status === 'scheduled' && formData.scheduled_at ? 
          new Date(formData.scheduled_at).toISOString() : null
      };

      if (isEditing) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Artigo atualizado!");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData]);

        if (error) throw error;
        toast.success("Artigo criado!");
      }

      navigate("/admin");
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast.error(error.message || "Erro ao salvar artigo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">
              {isEditing ? "Editar Artigo" : "Novo Artigo"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={isLoading}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Publicar
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Eventos em Porto Alegre: os rolês que vão tomar conta da cidade"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cidade *</label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porto-alegre">Porto Alegre</SelectItem>
                    <SelectItem value="florianopolis">Florianópolis</SelectItem>
                    <SelectItem value="curitiba">Curitiba</SelectItem>
                    <SelectItem value="sao-paulo">São Paulo</SelectItem>
                    <SelectItem value="rio-de-janeiro">Rio de Janeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug da Data *</label>
                <Input
                  value={formData.slug_data}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug_data: e.target.value }))}
                  placeholder="Ex: 14-17-agosto"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resumo *</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Breve descrição do artigo que aparecerá nos cards"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>Imagem de Capa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="mb-2"
              />
              {uploadingImage && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
            </div>
            
            {formData.cover_image && (
              <div className="relative">
                <img
                  src={formData.cover_image}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.content_html}
              onChange={(e) => setFormData(prev => ({ ...prev, content_html: e.target.value }))}
              placeholder="HTML do artigo..."
              rows={20}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Digite uma tag e pressione Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button onClick={addTag} variant="outline">
                Adicionar
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPostEditor;