import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

interface VenueForm {
  name: string;
  address: string;
  city: string;
  state: string;
  lat: string;
  lng: string;
}

const AdminVenuesManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<VenueForm>({
    name: '',
    address: '',
    city: '',
    state: '',
    lat: '',
    lng: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    if (isAuthenticated) {
      loadVenues();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadVenues = async () => {
    try {
      setVenuesLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error loading venues:', error);
      toast.error('Erro ao carregar locais');
    } finally {
      setVenuesLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingVenue(null);
    setForm({
      name: '',
      address: '',
      city: '',
      state: '',
      lat: '',
      lng: ''
    });
    setDialogOpen(true);
  };

  const openEditDialog = (venue: Venue) => {
    setEditingVenue(venue);
    setForm({
      name: venue.name,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      lat: venue.lat?.toString() || '',
      lng: venue.lng?.toString() || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address || !form.city || !form.state) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const venueData = {
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null
      };

      if (editingVenue) {
        const { error } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', editingVenue.id);

        if (error) throw error;
        toast.success('Local atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('venues')
          .insert(venueData);

        if (error) throw error;
        toast.success('Local criado com sucesso!');
      }

      setDialogOpen(false);
      await loadVenues();
    } catch (error) {
      console.error('Error saving venue:', error);
      toast.error('Erro ao salvar local');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (venue: Venue) => {
    if (!confirm(`Tem certeza que deseja excluir o local "${venue.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venue.id);

      if (error) throw error;
      
      toast.success('Local excluído com sucesso!');
      await loadVenues();
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Erro ao excluir local');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Gerenciar Locais</h1>
                <p className="text-muted-foreground">Cadastre e gerencie locais para eventos</p>
              </div>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Local
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingVenue ? 'Editar Local' : 'Novo Local'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Local</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Teatro Municipal"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, número, bairro"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => setForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitude (opcional)</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={form.lat}
                        onChange={(e) => setForm(prev => ({ ...prev, lat: e.target.value }))}
                        placeholder="-23.5505"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude (opcional)</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={form.lng}
                        onChange={(e) => setForm(prev => ({ ...prev, lng: e.target.value }))}
                        placeholder="-46.6333"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Locais Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {venuesLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : venues.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum local cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando o primeiro local para seus eventos.
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Local
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Coordenadas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venues.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell className="font-medium">{venue.name}</TableCell>
                      <TableCell className="text-muted-foreground">{venue.address}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {venue.city}, {venue.state}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {venue.lat && venue.lng ? (
                          <Badge variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            Localizado
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sem coordenadas</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(venue)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(venue)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminVenuesManagement;