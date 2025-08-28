import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useBlogManagement, BlogPostFormData } from '@/hooks/useBlogManagement';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
}

import { withAdminAuth } from '@/components/withAdminAuth';

function AdminBlogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, updatePost } = useBlogManagement();
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    slug: '',
    content_html: '',
    summary: '',
    city: '',
    author_name: '',
    cover_image: '',
    status: 'draft',
    tags: [],
    category_ids: []
  });

  useEffect(() => {
    if (id) {
      fetchPost();
    }
    fetchCategories();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (post) {
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          content_html: post.content_html || '',
          summary: post.summary || '',
          city: post.city || '',
          author_name: post.author_name || '',
          cover_image: post.cover_image || '',
          status: post.status || 'draft',
          tags: post.tags || [],
          category_ids: post.category_ids || []
        });
      }
    } catch (error: any) {
      console.error('Error fetching post:', error);
      toast.error('Erro ao carregar post');
      navigate('/admin-v2/blog');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
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
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.content_html.trim()) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    if (!id) {
      toast.error('ID do post não encontrado');
      return;
    }

    try {
      await updatePost(id, formData);
      navigate('/admin-v2/blog');
    } catch (error) {
      // Error already handled in the hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin-v2/blog')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Post</h1>
          <p className="text-muted-foreground">
            Edite as informações do post do blog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Informações principais do post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Digite o título do post"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-amigavel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Resumo *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Breve descrição do post"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={formData.content_html}
                onChange={(e) => setFormData(prev => ({ ...prev, content_html: e.target.value }))}
                placeholder="Conteúdo completo do post (HTML permitido)"
                rows={12}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>
              Selecione as categorias do post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={formData.category_ids.includes(category.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
            <CardDescription>
              Informações adicionais do post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="author">Autor *</Label>
                <Input
                  id="author"
                  value={formData.author_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                  placeholder="Nome do autor"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Porto Alegre">Porto Alegre</SelectItem>
                    <SelectItem value="Florianópolis">Florianópolis</SelectItem>
                    <SelectItem value="Curitiba">Curitiba</SelectItem>
                    <SelectItem value="São Paulo">São Paulo</SelectItem>
                    <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Tag1, Tag2, Tag3"
              />
              <p className="text-sm text-muted-foreground">
                Separe as tags com vírgulas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Mídia</CardTitle>
            <CardDescription>
              Imagem de capa do post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Escolher Imagem'}
                </Button>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {formData.cover_image && (
                <div className="relative inline-block">
                  <img
                    src={formData.cover_image}
                    alt="Preview"
                    className="h-32 w-auto rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin-v2/blog')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default withAdminAuth(AdminBlogEdit, 'editor');