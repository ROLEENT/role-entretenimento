import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useSimulationMode } from '@/hooks/useSimulationMode';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/alert-dialog-confirm';
import { 
  listAdvertisements, 
  deleteAdvertisement, 
  toggleAdvertisementActive,
  type Advertisement,
  type AdvertisementFilters 
} from '@/lib/repositories/advertisements';

export default function AdvertisementsList() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdvertisementFilters>({
    search: '',
    type: '',
    active: null
  });

  const { isSimulating, simulateOperation, isReadOnlyError } = useSimulationMode();

  useEffect(() => {
    loadAdvertisements();
  }, [filters]);

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      const data = await listAdvertisements(filters);
      setAdvertisements(data);
    } catch (error: any) {
      console.error('Error loading advertisements:', error);
      toast.error(error.message || 'Erro ao carregar anúncios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteAdvertisement(id);
      setAdvertisements(prev => prev.filter(ad => ad.id !== id));
      toast.success('Anúncio excluído com sucesso!');
    } catch (error: any) {
      if (isReadOnlyError(error)) {
        simulateOperation('Exclusão', 'anúncio', () => {
          setAdvertisements(prev => prev.filter(ad => ad.id !== id));
        });
      } else {
        console.error('Error deleting advertisement:', error);
        toast.error(error.message || 'Erro ao excluir anúncio');
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setToggling(id);
    try {
      const updated = await toggleAdvertisementActive(id, !currentActive);
      setAdvertisements(prev => prev.map(ad => ad.id === id ? updated : ad));
      toast.success(`Anúncio ${!currentActive ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error: any) {
      if (isReadOnlyError(error)) {
        simulateOperation(
          !currentActive ? 'Ativação' : 'Desativação', 
          'anúncio', 
          () => {
            setAdvertisements(prev => prev.map(ad => 
              ad.id === id ? { ...ad, active: !currentActive } : ad
            ));
          }
        );
      } else {
        console.error('Error toggling advertisement:', error);
        toast.error(error.message || 'Erro ao alterar status do anúncio');
      }
    } finally {
      setToggling(null);
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      card: 'Card',
      banner: 'Banner',
      newsletter: 'Newsletter'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Anúncios</h1>
          <p className="text-muted-foreground">Gerencie os anúncios da plataforma</p>
        </div>
        <Link to="/admin/advertisements/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Anúncio
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, type: value === 'all' ? '' : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.active === null ? 'all' : filters.active.toString()}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  active: value === 'all' ? null : value === 'true' 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advertisements List */}
      <Card>
        <CardHeader>
          <CardTitle>Anúncios ({advertisements.length})</CardTitle>
          <CardDescription>
            Lista de todos os anúncios cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : advertisements.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Nenhum anúncio encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(v => v) 
                  ? 'Ajuste os filtros ou cadastre um novo anúncio.'
                  : 'Cadastre o primeiro anúncio da plataforma.'
                }
              </p>
              <Link to="/admin/advertisements/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Anúncio
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {advertisements.map((ad) => (
                <Card key={ad.id} className="relative">
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(ad.id, ad.active)}
                      disabled={toggling === ad.id}
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      {toggling === ad.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : ad.active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Link to={`/admin/advertisements/${ad.id}/edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-background/80 backdrop-blur-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <ConfirmDialog
                      title="Excluir Anúncio"
                      description={`Tem certeza que deseja excluir o anúncio "${ad.title}"? Esta ação não pode ser desfeita.`}
                      onConfirm={() => handleDelete(ad.id)}
                      variant="destructive"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deleting === ad.id}
                        className="bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                      >
                        {deleting === ad.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </ConfirmDialog>
                  </div>

                  {/* Advertisement Preview */}
                  <div 
                    className="p-6 rounded-t-lg text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(to right, ${ad.gradient_from}, ${ad.gradient_to})`
                    }}
                  >
                    {ad.badge_text && (
                      <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                        {ad.badge_text}
                      </Badge>
                    )}
                    <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
                    {ad.description && (
                      <p className="text-white/90 text-sm mb-4">{ad.description}</p>
                    )}
                    <button className="bg-white text-primary px-4 py-2 rounded text-sm font-medium">
                      {ad.cta_text}
                    </button>
                  </div>

                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span>{getTypeLabel(ad.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posição:</span>
                        <span>{ad.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={ad.active ? 'default' : 'secondary'}>
                          {ad.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Criado:</span>
                        <span>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}