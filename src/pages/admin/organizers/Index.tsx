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
import { useOrganizerManagement, type OrganizerData } from '@/hooks/useOrganizerManagement';
import { OrganizerFormData } from '@/lib/organizerSchema';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminOrganizers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<any | null>(null);
  const { organizers, isLoading, createOrganizer, updateOrganizer, deleteOrganizer } = useOrganizerManagement();

  const [formData, setFormData] = useState<OrganizerFormData>({
    name: '',
    type: 'organizador',
    city: '',
    contact_email: '',
    contact_whatsapp: '',
    instagram: '',
    logo_url: '',
    bio_short: '',
    bio_long: '',
    website_url: '',
    portfolio_url: '',
    cover_image_url: '',
    cities_active: [],
    genres: [],
    responsible_name: '',
    responsible_role: '',
    booking_whatsapp: '',
    booking_email: '',
    internal_notes: '',
    status: 'active',
    priority: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact_email) {
      return;
    }

    try {
      if (editingOrganizer) {
        await updateOrganizer({ id: editingOrganizer.id, data: formData });
      } else {
        await createOrganizer(formData);
      }
      
      setDialogOpen(false);
      setEditingOrganizer(null);
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = (organizer: OrganizerData) => {
    setEditingOrganizer(organizer);
    setFormData({
      name: organizer.name,
      type: organizer.type,
      city: organizer.city,
      contact_email: organizer.contact_email,
      contact_whatsapp: organizer.contact_whatsapp,
      instagram: organizer.instagram,
      logo_url: organizer.logo_url || '',
      bio_short: organizer.bio_short || '',
      bio_long: organizer.bio_long || '',
      website_url: organizer.website_url || '',
      portfolio_url: organizer.portfolio_url || '',
      cover_image_url: organizer.cover_image_url || '',
      cities_active: organizer.cities_active || [],
      genres: organizer.genres || [],
      responsible_name: organizer.responsible_name || '',
      responsible_role: organizer.responsible_role || '',
      booking_whatsapp: organizer.booking_whatsapp || '',
      booking_email: organizer.booking_email || '',
      internal_notes: organizer.internal_notes || '',
      status: organizer.status,
      priority: organizer.priority,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (organizerId: string) => {
    await deleteOrganizer(organizerId);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'organizador',
      city: '',
      contact_email: '',
      contact_whatsapp: '',
      instagram: '',
      logo_url: '',
      bio_short: '',
      bio_long: '',
      website_url: '',
      portfolio_url: '',
      cover_image_url: '',
      cities_active: [],
      genres: [],
      responsible_name: '',
      responsible_role: '',
      booking_whatsapp: '',
      booking_email: '',
      internal_notes: '',
      status: 'active',
      priority: 0,
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
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organizador">Organizador</SelectItem>
                      <SelectItem value="produtora">Produtora</SelectItem>
                      <SelectItem value="coletivo">Coletivo</SelectItem>
                      <SelectItem value="selo">Selo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="São Paulo"
                    required
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
                  <Label htmlFor="contact_whatsapp">WhatsApp *</Label>
                  <Input
                    id="contact_whatsapp"
                    value={formData.contact_whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_whatsapp: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="website_url">Website</Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
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
                <Label htmlFor="genres">Gêneros</Label>
                <Input
                  id="genres"
                  value={formData.genres?.join(', ') || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    genres: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  }))}
                  placeholder="Música eletrônica, Shows, Festivais"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separe múltiplos gêneros com vírgulas
                </p>
              </div>
              
              <div>
                <Label htmlFor="bio_short">Bio Curta</Label>
                <Textarea
                  id="bio_short"
                  value={formData.bio_short}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio_short: e.target.value }))}
                  placeholder="Descrição breve do organizador..."
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : (editingOrganizer ? 'Atualizar' : 'Criar')}
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
            <Button variant="outline">
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizers List */}
      <div className="grid gap-4">
        {isLoading ? (
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
                      
                      {organizer.website_url && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={organizer.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {organizer.website_url}
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
                    
                    {organizer.bio_short && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {organizer.bio_short}
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

export default withAdminAuth(AdminOrganizers, 'editor');