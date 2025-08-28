import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHighlightsManagement } from '@/hooks/useHighlightsManagement';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteButton, PublishButton } from '@/components/ui/admin-button';
import { Plus, Edit, Eye, EyeOff, Search, ArrowLeft } from 'lucide-react';
import { withAdminAuth } from '@/components/withAdminAuth';

const cities = [
  { value: 'all', label: 'Todas as cidades' },
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

function AdminHighlightsList() {
  const { highlights, isLoading, deleteHighlight, togglePublished } = useHighlightsManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  console.log('[HIGHLIGHTS LIST] Highlights:', highlights);

  const filteredHighlights = highlights.filter(highlight => {
    const matchesSearch = (highlight.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (highlight.summary || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || highlight.city === cityFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && highlight.status === 'published') ||
                         (statusFilter === 'draft' && highlight.status === 'draft');
    
    return matchesSearch && matchesCity && matchesStatus;
  });

  const handleTogglePublish = async (highlightId: string) => {
    setLoadingAction(highlightId);
    try {
      console.log('[HIGHLIGHTS LIST] Alterando status do highlight:', highlightId);
      await togglePublished(highlightId);
    } catch (error) {
      console.error('[HIGHLIGHTS LIST] Erro ao alterar status:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (highlightId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este destaque?')) {
      setLoadingAction(highlightId);
      try {
        console.log('[HIGHLIGHTS LIST] Deletando highlight:', highlightId);
        await deleteHighlight(highlightId);
      } catch (error) {
        console.error('[HIGHLIGHTS LIST] Erro ao deletar highlight:', error);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Carregando destaques..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin-v2" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Destaques</h1>
            <p className="text-muted-foreground">
              {highlights.length} destaques • {highlights.filter(h => h.status === 'published').length} publicados
            </p>
          </div>
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
                  placeholder="Buscar por título..."
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
              <TableHead>Cidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHighlights.map((highlight) => (
              <TableRow key={highlight.id}>
                <TableCell>
                  {highlight.cover_url && (
                    <img
                      src={highlight.cover_url}
                      alt={highlight.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {highlight.title}
                </TableCell>
                <TableCell>
                  {cities.find(c => c.value === highlight.city)?.label || highlight.city}
                </TableCell>
                <TableCell>
                  <Badge variant={highlight.status === 'published' ? "default" : "secondary"}>
                    {highlight.status === 'published' ? "Publicado" : "Rascunho"}
                  </Badge>
                </TableCell>
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
                      variant={highlight.status === 'published' ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleTogglePublish(highlight.id)}
                      disabled={loadingAction === highlight.id}
                    >
                      {highlight.status === 'published' ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </PublishButton>

                    <DeleteButton
                      size="sm"
                      onClick={() => handleDelete(highlight.id)}
                      disabled={loadingAction === highlight.id}
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

export default withAdminAuth(AdminHighlightsList, 'editor');