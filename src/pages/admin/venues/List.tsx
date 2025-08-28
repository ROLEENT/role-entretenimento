import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Search, MoreHorizontal, Edit, Trash2, MapPin, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { withAdminAuth } from '@/components/withAdminAuth';

interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  capacity?: number;
  status: 'active' | 'inactive';
  instagram?: string;
  created_at: string;
}

const typeLabels = {
  bar: 'Bar',
  clube: 'Clube',
  casa_de_shows: 'Casa de Shows',
  teatro: 'Teatro',
  galeria: 'Galeria',
  espaco_cultural: 'Espaço Cultural',
  restaurante: 'Restaurante'
};

function VenuesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = (type: string) => typeLabels[type as keyof typeof typeLabels] || type;

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    // Mock data - em produção seria uma chamada à API
    setTimeout(() => {
      setVenues([
        {
          id: '1',
          name: 'Bar do Zeca',
          type: 'bar',
          address: 'Rua das Flores, 123',
          city: 'Porto Alegre',
          state: 'RS',
          capacity: 150,
          status: 'active',
          instagram: '@barzeca',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Teatro Municipal',
          type: 'teatro',
          address: 'Av. Borges de Medeiros, 456',
          city: 'Porto Alegre',
          state: 'RS',
          capacity: 800,
          status: 'active',
          instagram: '@teatromunicipal',
          created_at: '2024-01-10T10:00:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDelete = async (venueId: string) => {
    if (!confirm('Tem certeza que deseja excluir este local?')) return;
    
    try {
      // Aqui seria a chamada para deletar o local
      setVenues(venues.filter(v => v.id !== venueId));
      toast({
        title: 'Local excluído',
        description: 'O local foi excluído com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Carregando locais..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <AdminBreadcrumbs />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Locais</h1>
          <p className="text-muted-foreground">
            Gerencie os locais cadastrados na plataforma
          </p>
        </div>
        <Button onClick={() => navigate('/admin-v2/venues/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Local
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Locais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, cidade ou endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {filteredVenues.length === 0 ? (
        <EmptyState
          msg={searchQuery ? "Nenhum local corresponde aos critérios de busca." : "Não há locais cadastrados ainda."}
          actionLabel="Criar Primeiro Local"
          onAction={() => navigate('/admin-v2/venues/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{venue.name}</h3>
                    <Badge variant={getStatusColor(venue.status)}>
                      {venue.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin-v2/venues/${venue.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(venue.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getTypeLabel(venue.type)}</Badge>
                  </div>
                  
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{venue.address}</div>
                      <div>{venue.city}, {venue.state}</div>
                    </div>
                  </div>
                  
                  {venue.capacity && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Capacidade: {venue.capacity} pessoas</span>
                    </div>
                  )}
                  
                  {venue.instagram && (
                    <div className="text-muted-foreground">
                      <span className="font-medium">Instagram:</span> {venue.instagram}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                    <Clock className="h-4 w-4" />
                    <span>Criado em {formatDate(venue.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(VenuesList, 'editor');