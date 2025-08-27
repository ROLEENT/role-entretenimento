import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { ImageFallback } from '@/components/ui/image-fallback';

interface Organizer {
  id: string;
  name: string;
  type: string;
  city: string;
  contact_email: string;
  instagram: string;
  logo_url?: string;
  status: string;
  created_at: string;
}

export default function AdminOrganizersList() {
  const [search, setSearch] = useState('');
  const [organizers] = useState<Organizer[]>([
    {
      id: '1',
      name: 'Coletivo GREZZ',
      type: 'coletivo',
      city: 'Porto Alegre',
      contact_email: 'contato@grezz.com',
      instagram: '@grezz',
      status: 'active',
      created_at: '2024-01-15',
    },
    {
      id: '2', 
      name: 'Vitrine Cultural',
      type: 'produtora',
      city: 'Porto Alegre',
      contact_email: 'vitrine@cultural.com',
      instagram: '@vitrinecultural',
      status: 'active',
      created_at: '2024-01-10',
    }
  ]);

  const filteredOrganizers = organizers.filter(organizer =>
    organizer.name.toLowerCase().includes(search.toLowerCase()) ||
    organizer.contact_email.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    const labels = {
      organizador: 'Organizador',
      produtora: 'Produtora',
      coletivo: 'Coletivo',
      selo: 'Selo'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizadores</h1>
          <p className="text-muted-foreground">Gerencie organizadores, produtoras e coletivos</p>
        </div>
        <Button asChild>
          <Link to="/admin-v2/organizers/create">
            <Plus className="mr-2 h-4 w-4" />
            Novo Organizador
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Organizadores */}
      <div className="grid gap-4">
        {filteredOrganizers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum organizador encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrganizers.map((organizer) => (
            <Card key={organizer.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <ImageFallback
                      src={organizer.logo_url || ''}
                      alt={organizer.name}
                      className="w-full h-full object-cover"
                      showIcon
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{organizer.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {getTypeLabel(organizer.type)}
                          </Badge>
                          <Badge className={getStatusColor(organizer.status)}>
                            {organizer.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin-v2/organizers/${organizer.id}/edit`}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p><strong>Cidade:</strong> {organizer.city}</p>
                      <p><strong>Email:</strong> {organizer.contact_email}</p>
                      <p><strong>Instagram:</strong> {organizer.instagram}</p>
                      <p><strong>Cadastrado em:</strong> {new Date(organizer.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
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