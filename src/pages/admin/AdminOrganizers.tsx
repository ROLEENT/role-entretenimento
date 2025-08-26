import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Organizer {
  id: string;
  name: string;
  handle: string | null;
  site_url: string | null;
  logo_url: string | null;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

interface OrganizerForm {
  name: string;
  handle: string;
  site_url: string;
  logo_url: string;
  contact_email: string;
}

interface PaginationData {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const AdminOrganizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Paginação
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0
  });

  const [form, setForm] = useState<OrganizerForm>({
    name: '',
    handle: '',
    site_url: '',
    logo_url: '',
    contact_email: '',
  });

  const [errors, setErrors] = useState<Partial<OrganizerForm>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadOrganizers();
  }, [pagination.page, searchTerm]);

  const loadOrganizers = useCallback(async () => {
    try {
      setLoading(true);

      // Calcular offset para paginação
      const offset = (pagination.page - 1) * pagination.perPage;

      // Query com paginação e busca
      let query = supabase
        .from('organizers')
        .select('*', { count: 'exact' });

      // Aplicar filtro de busca se houver
      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Aplicar paginação e ordenação
      const { data, error, count } = await query
        .range(offset, offset + pagination.perPage - 1)
        .order('name');

      if (error) throw error;

      setOrganizers(data || []);
      
      // Atualizar dados de paginação
      setPagination(prev => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / prev.perPage)
      }));

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar organizadores: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchTerm]);

  const validateForm = (): boolean => {
    const newErrors: Partial<OrganizerForm> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!form.contact_email.trim()) {
      newErrors.contact_email = 'Email de contato é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      newErrors.contact_email = 'Email inválido';
    }

    if (form.handle && !/^[a-zA-Z0-9_-]+$/.test(form.handle)) {
      newErrors.handle = 'Handle deve conter apenas letras, números, _ e -';
    }

    if (form.site_url && !/^https?:\/\/.+/.test(form.site_url)) {
      newErrors.site_url = 'URL deve começar com http:// ou https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from('organizers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('organizers')
        .getPublicUrl(filePath);

      return data.publicUrl;

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload da logo: ' + error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo de imagem',
        variant: 'destructive'
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo deve ter no máximo 5MB',
        variant: 'destructive'
      });
      return;
    }

    setLogoFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      let logoUrl = form.logo_url;

      // Upload da logo se houver arquivo selecionado
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const organizerData = {
        name: form.name.trim(),
        handle: form.handle.trim() || null,
        site_url: form.site_url.trim() || null,
        logo_url: logoUrl || null,
        contact_email: form.contact_email.trim(),
      };

      if (editingOrganizer) {
        const { error } = await supabase
          .from('organizers')
          .update(organizerData)
          .eq('id', editingOrganizer.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Organizador atualizado com sucesso!',
        });
      } else {
        const { error } = await supabase
          .from('organizers')
          .insert(organizerData);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Organizador criado com sucesso!',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadOrganizers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar organizador: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (organizer: Organizer) => {
    setEditingOrganizer(organizer);
    setForm({
      name: organizer.name,
      handle: organizer.handle || '',
      site_url: organizer.site_url || '',
      logo_url: organizer.logo_url || '',
      contact_email: organizer.contact_email,
    });
    setLogoPreview(organizer.logo_url || '');
    setErrors({});
    setLogoFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (organizerId: string) => {
    try {
      const { error } = await supabase
        .from('organizers')
        .delete()
        .eq('id', organizerId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Organizador deletado com sucesso!',
      });

      loadOrganizers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar organizador: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      handle: '',
      site_url: '',
      logo_url: '',
      contact_email: '',
    });
    setEditingOrganizer(null);
    setErrors({});
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePerPageChange = (newPerPage: string) => {
    setPagination(prev => ({
      ...prev,
      page: 1,
      perPage: parseInt(newPerPage)
    }));
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Organizadores</h1>
          <p className="text-muted-foreground">
            Gerencie os organizadores de eventos
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Organizador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrganizer ? 'Editar Organizador' : 'Novo Organizador'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou WebP. Máximo 5MB.
                    </p>
                  </div>
                  {logoPreview && (
                    <div className="w-16 h-16 rounded-lg border overflow-hidden bg-muted">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nome do organizador"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handle">Handle</Label>
                  <Input
                    id="handle"
                    value={form.handle}
                    onChange={(e) => setForm({ ...form, handle: e.target.value })}
                    placeholder="@organizador"
                  />
                  {errors.handle && (
                    <p className="text-sm text-destructive">{errors.handle}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de Contato *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  placeholder="contato@organizador.com"
                />
                {errors.contact_email && (
                  <p className="text-sm text-destructive">{errors.contact_email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_url">Site URL</Label>
                <Input
                  id="site_url"
                  value={form.site_url}
                  onChange={(e) => setForm({ ...form, site_url: e.target.value })}
                  placeholder="https://siteorganizador.com"
                />
                {errors.site_url && (
                  <p className="text-sm text-destructive">{errors.site_url}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving || uploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || uploading}>
                  {saving ? 'Salvando...' : uploading ? 'Enviando logo...' : editingOrganizer ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizadores</CardTitle>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Itens por página:</span>
              <Select value={pagination.perPage.toString()} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando...</p>
            </div>
          ) : organizers.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Nenhum organizador encontrado.'
                  : 'Nenhum organizador cadastrado.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizers.map((organizer) => (
                  <Card key={organizer.id} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {organizer.logo_url ? (
                          <img
                            src={organizer.logo_url}
                            alt={`Logo ${organizer.name}`}
                            className="w-12 h-12 rounded-lg object-cover bg-muted"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{organizer.name}</h3>
                          {organizer.handle && (
                            <Badge variant="outline" className="text-xs">
                              {organizer.handle}
                            </Badge>
                          )}
                          <p className="text-sm text-muted-foreground truncate">
                            {organizer.contact_email}
                          </p>
                          {organizer.site_url && (
                            <a
                              href={organizer.site_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Site
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(organizer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar o organizador "{organizer.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(organizer.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(pagination.page - 1) * pagination.perPage + 1} a{' '}
                    {Math.min(pagination.page * pagination.perPage, pagination.total)} de{' '}
                    {pagination.total} organizadores
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrganizers;