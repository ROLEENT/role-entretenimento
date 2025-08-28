import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, ExternalLink, Copy, 
  Eye, EyeOff, FileText, Trash, RotateCcw, AlertTriangle, 
  ChevronDown, ChevronUp, Calendar, MapPin, Image, Link,
  RefreshCw, X, SortAsc, SortDesc
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Types
interface Highlight {
  id: string;
  event_title: string;
  slug: string | null;
  city: string;
  venue: string;
  start_at: string | null;
  end_at: string | null;
  status: 'draft' | 'published';
  image_url: string | null;
  updated_at: string;
  created_at: string;
}

type SituationStatus = 'scheduled' | 'active' | 'expired' | 'incomplete';
type SortField = 'updated_at' | 'start_at' | 'event_title';
type SortDirection = 'asc' | 'desc';

const cities = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

export default function AdminV2HighlightsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showTrash, setShowTrash] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'bulk_delete' | 'permanent_delete' | 'publish' | 'unpublish';
    items: string[];
    requireTitle?: boolean;
    title?: string;
  }>({ open: false, type: 'bulk_delete', items: [] });
  const [titleConfirmation, setTitleConfirmation] = useState('');
  
  // URL State - Convert empty/missing to "all" sentinel
  const searchTerm = searchParams.get('search') || '';
  const selectedCities = searchParams.get('cities')?.split(',').filter(Boolean) || [];
  const selectedStatus = searchParams.get('status') || 'all';
  const selectedSituation = searchParams.get('situation') || 'all';
  const selectedQuality = searchParams.get('quality') || 'all';
  const sortField = (searchParams.get('sort') as SortField) || 'updated_at';
  const sortDirection = (searchParams.get('dir') as SortDirection) || 'desc';
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Sanitize and validate Select values
  const sanitizedStatus = ['all', 'draft', 'published'].includes(selectedStatus) ? selectedStatus : 'all';
  const sanitizedSituation = ['all', 'scheduled', 'active', 'active_today', 'next_7_days', 'expired', 'incomplete'].includes(selectedSituation) ? selectedSituation : 'all';
  const sanitizedQuality = ['all', 'issues', 'no_cover', 'no_city', 'duplicate_slug'].includes(selectedQuality) ? selectedQuality : 'all';

  // Calculate situation for a highlight
  const calculateSituation = (highlight: Highlight): SituationStatus => {
    const now = new Date();
    
    // Check for incomplete data
    if (!highlight.image_url || !highlight.city || !highlight.slug || !highlight.start_at || !highlight.end_at) {
      return 'incomplete';
    }
    
    const startDate = new Date(highlight.start_at);
    const endDate = new Date(highlight.end_at);
    
    // Check for invalid dates
    if (isAfter(startDate, endDate)) {
      return 'incomplete';
    }
    
    if (isBefore(now, startDate)) return 'scheduled';
    if (isAfter(now, endDate)) return 'expired';
    return 'active';
  };

  // Get situation badge style
  const getSituationBadge = (situation: SituationStatus) => {
    const variants = {
      scheduled: { variant: 'secondary' as const, label: 'Agendado', className: '' },
      active: { variant: 'default' as const, label: 'Ativo', className: 'bg-success text-success-foreground' },
      expired: { variant: 'destructive' as const, label: 'Expirado', className: '' },
      incomplete: { variant: 'secondary' as const, label: 'Incompleto', className: 'bg-warning text-warning-foreground' }
    };
    return variants[situation];
  };

  // Get quality issues for a highlight
  const getQualityIssues = (highlight: Highlight) => {
    const issues = [];
    if (!highlight.image_url) issues.push('Sem capa');
    if (!highlight.city) issues.push('Sem cidade');
    if (!highlight.slug) issues.push('Sem slug');
    if (highlight.start_at && highlight.end_at && isAfter(new Date(highlight.start_at), new Date(highlight.end_at))) {
      issues.push('Datas invertidas');
    }
    // TODO: Check for duplicate slug
    return issues;
  };

  // Load highlights
  const loadHighlights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('highlights')
        .select(`
          id,
          event_title,
          slug,
          city,
          venue,
          start_at,
          end_at,
          status,
          image_url,
          updated_at,
          created_at
        `);

      // For now, just show all highlights (soft delete not implemented yet)
      // TODO: Implement soft delete with deleted_at column

      // Apply filters
      if (searchTerm) {
        query = query.or(`event_title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
      }
      
      if (selectedCities.length > 0) {
        query = query.in('city', selectedCities);
      }
      
      if (sanitizedStatus && sanitizedStatus !== 'all') {
        query = query.eq('status', sanitizedStatus);
      }

      // Sort
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      const { data, error } = await query;
      
      if (error) throw error;
      
      let filteredHighlights = (data || []) as Highlight[];

      // Apply situation filter
      if (sanitizedSituation && sanitizedSituation !== 'all') {
        filteredHighlights = filteredHighlights.filter(highlight => {
          const situation = calculateSituation(highlight);
          
          switch (sanitizedSituation) {
            case 'active_today':
              return situation === 'active' && highlight.start_at && isToday(new Date(highlight.start_at));
            case 'next_7_days':
              return situation === 'scheduled' && highlight.start_at && 
                     isBefore(new Date(highlight.start_at), addDays(new Date(), 7));
            default:
              return situation === sanitizedSituation;
          }
        });
      }

      // Apply quality filter
      if (sanitizedQuality && sanitizedQuality !== 'all') {
        filteredHighlights = filteredHighlights.filter(highlight => {
          const issues = getQualityIssues(highlight);
          
          switch (sanitizedQuality) {
            case 'no_cover':
              return !highlight.image_url;
            case 'no_city':
              return !highlight.city;
            case 'duplicate_slug':
              // TODO: Implement duplicate slug detection
              return false;
            case 'issues':
              return issues.length > 0;
            default:
              return false;
          }
        });
      }

      setHighlights(filteredHighlights);
    } catch (error) {
      console.error('Error loading highlights:', error);
      setError('Erro ao carregar destaques. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL params
  const updateSearchParams = (updates: Record<string, string | string[] | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        newParams.set(key, value.join(','));
      } else {
        newParams.set(key, String(value));
      }
    });
    
    setSearchParams(newParams);
  };

  // Handle search
  const handleSearch = (value: string) => {
    updateSearchParams({ search: value, page: 1 });
  };

  // Handle filters
  const handleCityFilter = (value: string) => {
    if (value === 'all' || !value) {
      updateSearchParams({ cities: null, page: 1 });
    } else {
      updateSearchParams({ cities: [value], page: 1 });
    }
  };

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    updateSearchParams({ sort: field, dir: newDirection });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Handle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === highlights.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(highlights.map(h => h.id)));
    }
  };

  // Actions
  const handlePublish = async (ids: string[], publish: boolean) => {
    try {
      const { error } = await supabase
        .from('highlights')
        .update({ status: publish ? 'published' : 'draft' })
        .in('id', ids);
      
      if (error) throw error;
      
      toast.success(`${ids.length} destaque(s) ${publish ? 'publicado(s)' : 'despublicado(s)'} com sucesso`);
      loadHighlights();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error updating highlights:', error);
      toast.error('Erro ao atualizar destaques');
    }
  };

  const handleDelete = async (ids: string[], permanent = false) => {
    try {
      // For now, always do permanent delete since soft delete is not implemented
      const { error } = await supabase
        .from('highlights')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      toast.success(`${ids.length} destaque(s) apagado(s) definitivamente`);
      
      loadHighlights();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error deleting highlights:', error);
      toast.error('Erro ao excluir destaques');
    }
  };

  const handleRestore = async (ids: string[]) => {
    // Restore functionality not implemented yet since soft delete is not available
    toast.error('Funcionalidade de restaurar não disponível ainda');
  };

  const handleDuplicate = async (highlight: Highlight) => {
    try {
      const newTitle = `${highlight.event_title} - Cópia`;
      const newSlug = `${highlight.slug || 'destaque'}-copia-${Date.now()}`;
      
      const { error } = await supabase
        .from('highlights')
        .insert({
          event_title: newTitle,
          slug: newSlug,
          city: highlight.city,
          venue: highlight.venue,
          start_at: highlight.start_at,
          end_at: highlight.end_at,
          status: 'draft',
          image_url: highlight.image_url,
          // Copy other relevant fields
        });
      
      if (error) throw error;
      
      toast.success('Destaque duplicado com sucesso');
      loadHighlights();
    } catch (error) {
      console.error('Error duplicating highlight:', error);
      toast.error('Erro ao duplicar destaque');
    }
  };

  const copyLink = (highlight: Highlight) => {
    const url = `${window.location.origin}/destaque/${highlight.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para área de transferência');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'n' || e.key === 'N') {
        navigate('/admin-v2/highlights/create');
      } else if (e.key === 'f' || e.key === 'F') {
        document.getElementById('search-input')?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [navigate]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadHighlights();
  }, [searchParams, showTrash]);

  // Pagination
  const totalPages = Math.ceil(highlights.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedHighlights = highlights.slice(startIndex, startIndex + pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <span className="ml-2">Carregando destaques...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-spartan text-foreground">Destaques</h1>
            <p className="text-muted-foreground">Gerencie destaques culturais e eventos em destaque</p>
          </div>
          <Button onClick={() => navigate('/admin-v2/highlights/create')} className="bg-primary hover:bg-primary-hover">
            <Plus className="mr-2 h-4 w-4" />
            Criar Destaque
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={loadHighlights}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for Active/Trash */}
        <Tabs value={showTrash ? 'trash' : 'active'} onValueChange={(value) => setShowTrash(value === 'trash')}>
          <TabsList>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="trash">Lixeira</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-input"
                      placeholder="Buscar por título ou slug..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* City Filter */}
                  <Select value={selectedCities.length > 0 ? selectedCities[0] : 'all'} onValueChange={handleCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as cidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      {cities.filter(city => city.value && city.value.trim()).map(city => (
                        <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={sanitizedStatus} onValueChange={(value) => updateSearchParams({ status: value === 'all' ? null : value, page: 1 })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Situation Filter */}
                  <Select value={sanitizedSituation} onValueChange={(value) => updateSearchParams({ situation: value === 'all' ? null : value, page: 1 })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as situações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as situações</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="active_today">Ativo hoje</SelectItem>
                      <SelectItem value="next_7_days">Próximos 7 dias</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                      <SelectItem value="incomplete">Incompleto</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Quality Filter */}
                  <Select value={sanitizedQuality} onValueChange={(value) => updateSearchParams({ quality: value === 'all' ? null : value, page: 1 })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="issues">Com problemas</SelectItem>
                      <SelectItem value="no_cover">Sem capa</SelectItem>
                      <SelectItem value="no_city">Sem cidade</SelectItem>
                      <SelectItem value="duplicate_slug">Slug duplicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {(searchTerm || selectedCities.length > 0 || sanitizedStatus !== 'all' || sanitizedSituation !== 'all' || sanitizedQuality !== 'all') && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {highlights.length} destaque(s) encontrado(s)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedItems.size} item(s) selecionado(s)
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setConfirmDialog({ open: true, type: 'publish', items: Array.from(selectedItems) })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Publicar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setConfirmDialog({ open: true, type: 'unpublish', items: Array.from(selectedItems) })}
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Despublicar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setConfirmDialog({ open: true, type: 'bulk_delete', items: Array.from(selectedItems) })}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Mover para Lixeira
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                {highlights.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Nenhum destaque encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || selectedCities.length > 0 || sanitizedStatus !== 'all' || sanitizedSituation !== 'all' || sanitizedQuality !== 'all'
                        ? 'Tente ajustar os filtros de busca.'
                        : 'Crie seu primeiro destaque para começar.'
                      }
                    </p>
                    <Button onClick={() => navigate('/admin-v2/highlights/create')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Destaque
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 w-12">
                            <Checkbox
                              checked={selectedItems.size === highlights.length && highlights.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </th>
                          <th className="text-left p-4 w-16">Thumb</th>
                          <th className="text-left p-4 min-w-48">
                            <Button variant="ghost" onClick={() => handleSort('event_title')} className="h-auto p-0 font-medium">
                              Título
                              {sortField === 'event_title' && (
                                sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </th>
                          <th className="text-left p-4">Slug</th>
                          <th className="text-left p-4">Cidade</th>
                          <th className="text-left p-4">
                            <Button variant="ghost" onClick={() => handleSort('start_at')} className="h-auto p-0 font-medium">
                              Período
                              {sortField === 'start_at' && (
                                sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </th>
                          <th className="text-left p-4">Situação</th>
                          <th className="text-left p-4">Status</th>
                          <th className="text-left p-4">Atualizado por</th>
                          <th className="text-left p-4">
                            <Button variant="ghost" onClick={() => handleSort('updated_at')} className="h-auto p-0 font-medium">
                              Atualizado em
                              {sortField === 'updated_at' && (
                                sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </th>
                          <th className="text-left p-4 w-32">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHighlights.map((highlight) => {
                          const situation = calculateSituation(highlight);
                          const situationBadge = getSituationBadge(situation);
                          const qualityIssues = getQualityIssues(highlight);
                          const cityLabel = cities.find(c => c.value === highlight.city)?.label || highlight.city;

                          return (
                            <tr key={highlight.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <Checkbox
                                  checked={selectedItems.has(highlight.id)}
                                  onCheckedChange={() => toggleSelection(highlight.id)}
                                />
                              </td>
                              <td className="p-4">
                                {highlight.image_url ? (
                                  <img 
                                    src={highlight.image_url} 
                                    alt={highlight.event_title}
                                    className="w-8 h-8 rounded border object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center">
                                    <Image className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="max-w-48">
                                      <div className="line-clamp-2 font-medium text-foreground">
                                        {highlight.event_title}
                                      </div>
                                      {qualityIssues.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                          {qualityIssues.map(issue => (
                                            <Badge key={issue} variant="secondary" className="text-xs bg-warning text-warning-foreground">
                                              {issue}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{highlight.event_title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                              <td className="p-4">
                                <div className="font-mono text-sm text-muted-foreground">
                                  {highlight.slug || <Badge variant="secondary" className="bg-warning text-warning-foreground">Sem slug</Badge>}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{cityLabel}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                {highlight.start_at && highlight.end_at ? (
                                  <div className="text-sm">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-muted-foreground" />
                                      <span>{format(new Date(highlight.start_at), 'dd/MM', { locale: ptBR })}</span>
                                      <span>→</span>
                                      <span>{format(new Date(highlight.end_at), 'dd/MM', { locale: ptBR })}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="bg-warning text-warning-foreground">Sem datas</Badge>
                                )}
                              </td>
                              <td className="p-4">
                                <Badge 
                                  variant={situationBadge.variant}
                                  className={situationBadge.className || ''}
                                >
                                  {situationBadge.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant={highlight.status === 'published' ? 'default' : 'secondary'}>
                                  {highlight.status === 'published' ? 'Publicado' : 'Rascunho'}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                —
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {format(new Date(highlight.updated_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  {highlight.status === 'draft' ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => handlePublish([highlight.id], true)}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Publicar</TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => handlePublish([highlight.id], false)}
                                        >
                                          <EyeOff className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Despublicar</TooltipContent>
                                    </Tooltip>
                                  )}
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate(`/admin-v2/highlights/${highlight.id}/edit`)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDuplicate(highlight)}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Duplicar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => window.open(`/destaque/${highlight.id}`, '_blank')}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Visualizar no site
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => copyLink(highlight)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copiar link
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => setConfirmDialog({ open: true, type: 'bulk_delete', items: [highlight.id] })}
                                        className="text-destructive"
                                      >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Mover para Lixeira
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {highlights.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Itens por página:</span>
                      <Select value={String(pageSize)} onValueChange={(value) => updateSearchParams({ pageSize: Number(value), page: 1 })}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => updateSearchParams({ page: currentPage - 1 })}
                      >
                        Anterior
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === totalPages}
                        onClick={() => updateSearchParams({ page: currentPage + 1 })}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trash" className="space-y-4">
            {/* Trash Content */}
            <Card>
              <CardContent className="p-0">
                {highlights.length === 0 ? (
                  <div className="text-center py-12">
                    <Trash className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Lixeira vazia</h3>
                    <p className="text-muted-foreground">Nenhum destaque foi excluído recentemente.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 w-12">
                            <Checkbox
                              checked={selectedItems.size === highlights.length && highlights.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </th>
                          <th className="text-left p-4">Título</th>
                          <th className="text-left p-4">Cidade</th>
                          <th className="text-left p-4">Excluído por</th>
                          <th className="text-left p-4">Excluído em</th>
                          <th className="text-left p-4 w-32">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHighlights.map((highlight) => (
                          <tr key={highlight.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <Checkbox
                                checked={selectedItems.has(highlight.id)}
                                onCheckedChange={() => toggleSelection(highlight.id)}
                              />
                            </td>
                            <td className="p-4 font-medium">{highlight.event_title}</td>
                            <td className="p-4">{cities.find(c => c.value === highlight.city)?.label || highlight.city}</td>
                            <td className="p-4 text-sm text-muted-foreground">
                              —
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              —
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleRestore([highlight.id])}
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Restaurar</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => setConfirmDialog({ 
                                        open: true, 
                                        type: 'permanent_delete', 
                                        items: [highlight.id],
                                        requireTitle: true,
                                        title: highlight.event_title
                                      })}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Apagar definitivamente</TooltipContent>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bulk Actions for Trash */}
            {selectedItems.size > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedItems.size} item(s) selecionado(s)
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestore(Array.from(selectedItems))}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setConfirmDialog({ 
                          open: true, 
                          type: 'permanent_delete', 
                          items: Array.from(selectedItems),
                          requireTitle: false
                        })}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Apagar Definitivamente
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmDialog.type === 'publish' && 'Publicar Destaques'}
                {confirmDialog.type === 'unpublish' && 'Despublicar Destaques'}
                {confirmDialog.type === 'bulk_delete' && 'Mover para Lixeira'}
                {confirmDialog.type === 'permanent_delete' && 'Apagar Definitivamente'}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog.type === 'publish' && `Tem certeza que deseja publicar ${confirmDialog.items.length} destaque(s)?`}
                {confirmDialog.type === 'unpublish' && `Tem certeza que deseja despublicar ${confirmDialog.items.length} destaque(s)?`}
                {confirmDialog.type === 'bulk_delete' && `Tem certeza que deseja mover ${confirmDialog.items.length} destaque(s) para a lixeira?`}
                {confirmDialog.type === 'permanent_delete' && (
                  <>
                    <p className="mb-4">Esta ação é irreversível. {confirmDialog.items.length > 1 ? 'Os destaques' : 'O destaque'} será(ão) apagado(s) permanentemente.</p>
                    {confirmDialog.requireTitle && confirmDialog.title && (
                      <div>
                        <p className="mb-2">Digite o título do destaque para confirmar:</p>
                        <p className="font-medium mb-2">"{confirmDialog.title}"</p>
                        <Input
                          value={titleConfirmation}
                          onChange={(e) => setTitleConfirmation(e.target.value)}
                          placeholder="Digite o título exato..."
                        />
                      </div>
                    )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
                Cancelar
              </Button>
              <Button
                variant={confirmDialog.type === 'permanent_delete' ? 'destructive' : 'default'}
                onClick={() => {
                  if (confirmDialog.requireTitle && titleConfirmation !== confirmDialog.title) {
                    toast.error('Título não confere');
                    return;
                  }
                  
                  switch (confirmDialog.type) {
                    case 'publish':
                      handlePublish(confirmDialog.items, true);
                      break;
                    case 'unpublish':
                      handlePublish(confirmDialog.items, false);
                      break;
                    case 'bulk_delete':
                      handleDelete(confirmDialog.items, false);
                      break;
                    case 'permanent_delete':
                      handleDelete(confirmDialog.items, true);
                      break;
                  }
                  
                  setConfirmDialog(prev => ({ ...prev, open: false }));
                  setTitleConfirmation('');
                }}
                disabled={confirmDialog.requireTitle && titleConfirmation !== confirmDialog.title}
              >
                {confirmDialog.type === 'publish' && 'Publicar'}
                {confirmDialog.type === 'unpublish' && 'Despublicar'}
                {confirmDialog.type === 'bulk_delete' && 'Mover para Lixeira'}
                {confirmDialog.type === 'permanent_delete' && 'Apagar Definitivamente'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-muted-foreground text-center">
          Atalhos: <kbd className="px-1 py-0.5 text-xs bg-muted rounded">N</kbd> Novo destaque • 
          <kbd className="px-1 py-0.5 text-xs bg-muted rounded">F</kbd> Focar busca
        </div>
      </div>
    </TooltipProvider>
  );
}