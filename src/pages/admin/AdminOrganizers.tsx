import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
// Removed useAdminAuth - using Supabase Auth via AdminProtectedRoute
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Organizer {
  id: string;
  name: string;
  contact_email: string;
  site: string | null;
  instagram: string | null;
  created_at: string;
  updated_at: string;
}

interface OrganizerForm {
  name: string;
  contact_email: string;
  site: string;
  instagram: string;
}

const AdminOrganizers = () => {
  // Authentication handled by AdminProtectedRoute
  const navigate = useNavigate();
  const { toast } = useToast();

  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<OrganizerForm>({
    name: '',
    contact_email: '',
    site: '',
    instagram: '',
  });

  const [errors, setErrors] = useState<Partial<OrganizerForm>>({});

  useEffect(() => {
    loadOrganizers();
  }, []);

  const loadOrganizers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .order('name');

      if (error) throw error;

      setOrganizers(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar organizadores: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const organizerData = {
        name: form.name.trim(),
        contact_email: form.contact_email.trim(),
        site: form.site.trim() || null,
        instagram: form.instagram.trim() || null,
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
      contact_email: organizer.contact_email,
      site: organizer.site || '',
      instagram: organizer.instagram || '',
    });
    setErrors({});
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
      contact_email: '',
      site: '',
      instagram: '',
    });
    setEditingOrganizer(null);
    setErrors({});
  };

  const filteredOrganizers = organizers.filter((organizer) =>
    organizer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
          <h1 className="text-3xl font-bold">Organizadores</h1>
          <p className="text-muted-foreground">
            Gerencie os organizadores de eventos
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Organizador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingOrganizer ? 'Editar Organizador' : 'Novo Organizador'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                  placeholder="https://siteorganizador.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@organizador"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingOrganizer ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizadores</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrganizers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Nenhum organizador encontrado.'
                  : 'Nenhum organizador cadastrado.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Instagram</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizers.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell className="font-medium">{organizer.name}</TableCell>
                    <TableCell>{organizer.contact_email}</TableCell>
                    <TableCell>
                      {organizer.site ? (
                        <a
                          href={organizer.site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Site
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {organizer.instagram ? (
                        <span className="text-sm">{organizer.instagram}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(organizer.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrganizers;