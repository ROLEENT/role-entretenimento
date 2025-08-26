import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Plus, Search, Edit, Trash2, Mail, Globe, Instagram, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOrganizerManagement, type OrganizerFormData } from '@/hooks/useOrganizerManagement';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Organizer {
  id: string;
  name: string;
  contact_email: string;
  site: string | null;
  instagram: string | null;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  founded_year: number | null;
  specialties: string[];
  created_at: string;
}

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
  const { loading, getOrganizers, createOrganizer, updateOrganizer, deleteOrganizer } = useOrganizerManagement();

  const [formData, setFormData] = useState<OrganizerFormData>({
    name: '',
    contact_email: '',
    site: '',
    instagram: '',
    description: '',
    logo_url: '',
    phone: '',
    whatsapp: '',
    founded_year: undefined,
    specialties: []
  });

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    const data = await getOrganizers(searchTerm);
    setOrganizers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact_email) {
      return;
    }

    try {
      if (editingOrganizer) {
        await updateOrganizer(editingOrganizer.id, formData);
      } else {
        await createOrganizer(formData);
      }
      
      setDialogOpen(false);
      setEditingOrganizer(null);
      resetForm();
      fetchOrganizers();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = (organizer: Organizer) => {
    setEditingOrganizer(organizer);
    setFormData({
      name: organizer.name,
      contact_email: organizer.contact_email,
      site: organizer.site || '',
      instagram: organizer.instagram || '',
      description: organizer.description || '',
      logo_url: organizer.logo_url || '',
      phone: organizer.phone || '',
      whatsapp: organizer.whatsapp || '',
      founded_year: organizer.founded_year || undefined,
      specialties: organizer.specialties || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (organizerId: string) => {
    await deleteOrganizer(organizerId);
    fetchOrganizers();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_email: '',
      site: '',
      instagram: '',
      description: '',
      logo_url: '',
      phone: '',
      whatsapp: '',
      founded_year: undefined,
      specialties: []
    });
  };

  const openCreateDialog = () => {
    setEditingOrganizer(null);
    resetForm();
    setDialogOpen(true);
  };

  const filteredOrganizers = organizers.filter(organizer =>
    organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestão de Organizadores</h2>
          <p className="text-muted-foreground">
            Gerencie organizadores de eventos da plataforma
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Organizador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrganizer ? 'Editar Organizador' : 'Novo Organizador'}
              </DialogTitle>
              <DialogDescription>
                {editingOrganizer ? 'Atualize as informações do organizador' : 'Adicione um novo organizador à plataforma'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Logo do Organizador</Label>
                  <ImageUpload
                    value={formData.logo_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url || '' }))}
                    bucket="events"
                    path="organizers"
                    placeholder="Upload do logo do organizador"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do organizador"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="founded_year">Ano de Fundação</Label>
                  <Input
                    id="founded_year"
                    type="number"
                    value={formData.founded_year || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, founded_year: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_email">Email de Contato *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="contato@organizador.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <Label htmlFor="site">Website</Label>
                  <Input
                    id="site"
                    value={formData.site}
                    onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                    placeholder="https://site.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@username"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="specialties">Especialidades</Label>
                <Input
                  id="specialties"
                  value={formData.specialties?.join(', ') || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  }))}
                  placeholder="Música eletrônica, Shows, Festivais"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separe múltiplas especialidades com vírgulas
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição detalhada do organizador, história, missão..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingOrganizer ? 'Atualizar' : 'Criar')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Organizadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={fetchOrganizers}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizers List */}
      <div className="grid gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredOrganizers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum organizador encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrganizers.map((organizer) => (
            <Card key={organizer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">{organizer.name}</h3>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{organizer.contact_email}</span>
                      </div>
                      
                      {organizer.site && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={organizer.site} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {organizer.site}
                          </a>
                        </div>
                      )}
                      
                      {organizer.instagram && (
                        <div className="flex items-center gap-2 text-sm">
                          <Instagram className="h-4 w-4 text-muted-foreground" />
                          <span>{organizer.instagram}</span>
                        </div>
                      )}
                    </div>
                    
                    {organizer.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {organizer.description}
                      </p>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Criado em {format(new Date(organizer.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(organizer)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o organizador "{organizer.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(organizer.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}