import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHighlightsAdmin } from '@/hooks/useHighlightsAdmin';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteButton, PublishButton } from '@/components/ui/admin-button';
import { Plus, Edit, Eye, EyeOff, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminV2Auth } from '@/hooks/useAdminV2Auth';

const cities = [
  { value: 'all', label: 'Todas as cidades' },
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

export default function AdminHighlightsList() {
  const { highlights, loading, error, refreshHighlights } = useHighlightsAdmin();
  const { user } = useAdminV2Auth();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHighlights = highlights.filter(highlight => {
    const matchesSearch = highlight.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         highlight.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || highlight.city === cityFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && highlight.is_published) ||
                         (statusFilter === 'draft' && !highlight.is_published);
    
    return matchesSearch && matchesCity && matchesStatus;
  });

  const handleTogglePublish = async (highlightId: string, currentStatus: boolean) => {
    if (!user?.email) return;
    
    const { error } = await supabase.rpc('admin_toggle_highlight_published', {
      p_admin_email: user.email,
      p_highlight_id: highlightId,
      p_is_published: !currentStatus
    });

    if (error) throw error;
    refreshHighlights();
  };

  const handleDelete = async (highlightId: string) => {
    if (!user?.email) return;
    
    const { error } = await supabase.rpc('admin_delete_highlight', {
      p_admin_email: user.email,
      p_highlight_id: highlightId
    });

    if (error) throw error;
    refreshHighlights();
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Carregando destaques..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Erro ao carregar destaques: {error}</p>
            <Button onClick={refreshHighlights} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Destaques</h1>
          <p className="text-muted-foreground">
            {highlights.length} destaques • {highlights.filter(h => h.is_published).length} publicados
          </p>
        </div>
        <Button asChild>
          <Link to="/admin-v2/highlights/create">
            <Plus className="h-4 w-4 mr-2" />
            Novo Destaque
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCityFilter('all');
                setStatusFilter('all');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHighlights.map((highlight) => (
              <TableRow key={highlight.id}>
                <TableCell>
                  <img
                    src={highlight.image_url}
                    alt={highlight.event_title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {highlight.event_title}
                </TableCell>
                <TableCell>{highlight.venue}</TableCell>
                <TableCell>
                  {cities.find(c => c.value === highlight.city)?.label || highlight.city}
                </TableCell>
                <TableCell>
                  <Badge variant={highlight.is_published ? "default" : "secondary"}>
                    {highlight.is_published ? "Publicado" : "Rascunho"}
                  </Badge>
                </TableCell>
                <TableCell>{highlight.like_count}</TableCell>
                <TableCell>
                  {new Date(highlight.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin-v2/highlights/edit/${highlight.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <PublishButton
                      variant={highlight.is_published ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleTogglePublish(highlight.id, highlight.is_published)}
                    >
                      {highlight.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </PublishButton>

                    <DeleteButton
                      size="sm"
                      onClick={() => handleDelete(highlight.id)}
                    >
                      Excluir
                    </DeleteButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredHighlights.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm || cityFilter !== 'all' || statusFilter !== 'all' 
              ? 'Nenhum destaque encontrado com os filtros aplicados.'
              : 'Nenhum destaque cadastrado ainda.'}
          </div>
        )}
      </Card>
    </div>
  );
}