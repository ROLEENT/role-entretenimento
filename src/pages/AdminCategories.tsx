import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'general' | 'music' | 'art' | 'food' | 'sports' | 'technology' | 'business';
  color_hex: string;
  created_at: string;
  description?: string;
}

const categoryTypes = [
  { value: 'general', label: 'Geral' },
  { value: 'music', label: 'Música' },
  { value: 'art', label: 'Arte' },
  { value: 'food', label: 'Gastronomia' },
  { value: 'sports', label: 'Esportes' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'business', label: 'Negócios' }
] as const;

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    type: Category['type'];
    color_hex: string;
    description: string;
  }>({
    name: '',
    slug: '',
    type: 'general',
    color_hex: '#3B82F6',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(dataToSubmit)
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Categoria atualizada com sucesso!'
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([dataToSubmit]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Categoria criada com sucesso!'
        });
      }

      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      
      if (error.code === '23505') {
        if (error.message.includes('categories_name_unique')) {
          toast({
            title: 'Erro',
            description: 'Já existe uma categoria com este nome.',
            variant: 'destructive'
          });
        } else if (error.message.includes('categories_slug_unique')) {
          toast({
            title: 'Erro',
            description: 'Já existe uma categoria com este slug.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Erro',
            description: 'Nome ou slug já existe.',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao salvar categoria.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      type: category.type,
      color_hex: category.color_hex,
      description: category.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Categoria deletada com sucesso!'
      });
      
      fetchCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar categoria.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: 'general',
      color_hex: '#3B82F6',
      description: ''
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Categorias</h1>
            <p className="text-muted-foreground">Gerencie as categorias dos posts e eventos</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Dialog open={showForm} onOpenChange={(open) => {
                setShowForm(open);
                if (!open) {
                  setEditingCategory(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            name,
                            slug: !editingCategory ? generateSlug(name) : prev.slug
                          }));
                        }}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Tipo *</Label>
                      <Select value={formData.type} onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, type: value as Category['type'] }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="color">Cor</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="color"
                          type="color"
                          value={formData.color_hex}
                          onChange={(e) => setFormData(prev => ({ ...prev, color_hex: e.target.value }))}
                          className="w-16 h-10"
                        />
                        <Input
                          value={formData.color_hex}
                          onChange={(e) => setFormData(prev => ({ ...prev, color_hex: e.target.value }))}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição opcional da categoria"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingCategory ? 'Atualizar' : 'Criar'} Categoria
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando categorias...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-muted-foreground">
                {searchTerm ? 'Nenhuma categoria encontrada.' : 'Nenhuma categoria cadastrada.'}
              </div>
            </CardContent>
          </Card>
        ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      style={{ backgroundColor: category.color_hex, color: '#fff' }}
                      className="text-xs font-medium"
                    >
                      {categoryTypes.find(t => t.value === category.type)?.label}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar a categoria "<strong>{category.name}</strong>"?
                              Esta ação não pode ser desfeita e pode afetar posts e eventos relacionados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(category.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">/{category.slug}</p>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: category.color_hex }}
                      />
                      <span className="text-xs font-mono text-muted-foreground">{category.color_hex}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex flex-wrap gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: category.color_hex + '40',
                            backgroundColor: category.color_hex + '10',
                            color: category.color_hex
                          }}
                        >
                          #{category.name.toLowerCase().replace(/\s+/g, '')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminCategories;