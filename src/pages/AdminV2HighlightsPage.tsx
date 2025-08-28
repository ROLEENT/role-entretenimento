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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, ExternalLink, Copy, 
  Eye, EyeOff, FileText, Trash, RotateCcw, AlertTriangle, 
  ChevronDown, ChevronUp, Calendar, MapPin, Image, Link,
  RefreshCw, X, SortAsc, SortDesc, Clock, Settings2,
  CheckSquare, Square, Grid3X3, List, AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  updated_by: string | null;
  created_at: string;
}

type SituationStatus = 'scheduled' | 'active' | 'expired' | 'incomplete';
type SortField = 'updated_at' | 'start_at' | 'event_title';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'cards';
type DensityMode = 'compact' | 'comfortable';

const cities = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

const situationFilters = [
  { value: 'all', label: 'Todas as situações' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'active', label: 'Ativo' },
  { value: 'active_today', label: 'Ativo hoje' },
  { value: 'next_7_days', label: 'Próximos 7 dias' },
  { value: 'expired', label: 'Expirado' },
  { value: 'incomplete', label: 'Incompleto' },
];

const qualityFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'issues', label: 'Com problemas' },
  { value: 'no_cover', label: 'Sem capa' },
  { value: 'no_city', label: 'Sem cidade' },
  { value: 'invalid_dates', label: 'Datas invertidas' },
  { value: 'duplicate_slug', label: 'Slug duplicado' },
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
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [densityMode, setDensityMode] = useState<DensityMode>('comfortable');
  const [showSecondaryColumns, setShowSecondaryColumns] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
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
  const dateRangeStart = searchParams.get('dateStart') || '';
  const dateRangeEnd = searchParams.get('dateEnd') || '';

  // Sanitize and validate Select values
  const sanitizedStatus = ['all', 'draft', 'published'].includes(selectedStatus) ? selectedStatus : 'all';
  const sanitizedSituation = situationFilters.map(s => s.value).includes(selectedSituation) ? selectedSituation : 'all';
  const sanitizedQuality = qualityFilters.map(q => q.value).includes(selectedQuality) ? selectedQuality : 'all';

  // Check if user has permissions
  const userRole = 'admin'; // TODO: Get from context/auth
  const canPublish = ['admin', 'editor'].includes(userRole);
  const canDelete = userRole === 'admin';
  const canPermanentDelete = userRole === 'admin';

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
      scheduled: { 
        variant: 'secondary' as const, 
        label: 'Agendado', 
        className: 'bg-gray-100 text-gray-800 border-gray-200' 
      },
      active: { 
        variant: 'default' as const, 
        label: 'Ativo', 
        className: 'bg-green-100 text-green-800 border-green-200' 
      },
      expired: { 
        variant: 'destructive' as const, 
        label: 'Expirado', 
        className: 'bg-red-100 text-red-800 border-red-200' 
      },
      incomplete: { 
        variant: 'secondary' as const, 
        label: 'Incompleto', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      }
    };
    return variants[situation];
  };

  // Get quality issues for a highlight
  const getQualityIssues = (highlight: Highlight) => {
    const issues = [];
    if (!highlight.image_url) issues.push({ key: 'no_cover', label: 'Sem capa', action: 'Adicionar capa' });
    if (!highlight.city) issues.push({ key: 'no_city', label: 'Sem cidade', action: 'Definir cidade' });
    if (!highlight.slug) issues.push({ key: 'no_slug', label: 'Sem slug', action: 'Gerar slug' });
    if (highlight.start_at && highlight.end_at && isAfter(new Date(highlight.start_at), new Date(highlight.end_at))) {
      issues.push({ key: 'invalid_dates', label: 'Datas invertidas', action: 'Corrigir datas' });
    }
    // TODO: Check for duplicate slug
    return issues;
  };

  // Format period display
  const formatPeriod = (startAt: string | null, endAt: string | null) => {
    if (!startAt || !endAt) return null;
    
    try {
      const start = new Date(startAt);
      const end = new Date(endAt);
      
      if (format(start, 'dd/MM/yyyy') === format(end, 'dd/MM/yyyy')) {
        // Same day
        return `${format(start, 'dd/MM/yyyy HH:mm', { locale: ptBR })} - ${format(end, 'HH:mm', { locale: ptBR })}`;
      } else {
        // Different days
        return `${format(start, 'dd/MM/yyyy HH:mm', { locale: ptBR })} → ${format(end, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`;
      }
    } catch {
      return 'Data inválida';
    }
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
          updated_by,
          created_at
        `);

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

      // Date range filter
      if (dateRangeStart) {
        query = query.gte('start_at', dateRangeStart);
      }
      if (dateRangeEnd) {
        query = query.lte('end_at', dateRangeEnd);
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
            case 'invalid_dates':
              return highlight.start_at && highlight.end_at && 
                     isAfter(new Date(highlight.start_at), new Date(highlight.end_at));
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
  const handleCityFilter = (values: string[]) => {
    updateSearchParams({ cities: values.length > 0 ? values : null, page: 1 });
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
    if (selectedItems.size === paginatedHighlights.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedHighlights.map(h => h.id)));
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
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
      toast.success(`${ids.length} destaque(s) ${permanent ? 'apagado(s) definitivamente' : 'movido(s) para lixeira'}`);
      
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
      let newSlug = `${highlight.slug || 'destaque'}-copia`;
      
      // Check for unique slug
      const { data: existingSlugs } = await supabase
        .from('highlights')
        .select('slug')
        .like('slug', `${newSlug}%`);
      
      if (existingSlugs && existingSlugs.length > 0) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      
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
    const url = `${window.location.origin}/destaque/${highlight.slug || highlight.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para área de transferência');
  };

  const generateSlug = async (highlightId: string, title: string) => {
    try {
      const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substr(0, 50);
      
      let finalSlug = baseSlug;
      let counter = 1;
      
      // Check for uniqueness
      while (true) {
        const { data } = await supabase
          .from('highlights')
          .select('id')
          .eq('slug', finalSlug)
          .neq('id', highlightId);
        
        if (!data || data.length === 0) break;
        
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const { error } = await supabase
        .from('highlights')
        .update({ slug: finalSlug })
        .eq('id', highlightId);
      
      if (error) throw error;
      
      toast.success('Slug gerado automaticamente');
      loadHighlights();
    } catch (error) {
      console.error('Error generating slug:', error);
      toast.error('Erro ao gerar slug');
    }
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

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedCities.length > 0 || sanitizedStatus !== 'all' || 
                          sanitizedSituation !== 'all' || sanitizedQuality !== 'all' || 
                          dateRangeStart || dateRangeEnd;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <span className="ml-2">Carregando destaques...</span>
      </div>
    );
  }

  // Render thumbnail
  const renderThumbnail = (highlight: Highlight) => (
    <div className="w-8 h-8 rounded border overflow-hidden bg-muted flex-shrink-0">
      {highlight.image_url ? (
        <img 
          src={highlight.image_url} 
          alt={highlight.event_title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Image className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );

  // Render highlight card (mobile)
  const renderHighlightCard = (highlight: Highlight) => {
    const situation = calculateSituation(highlight);
    const situationBadge = getSituationBadge(situation);
    const qualityIssues = getQualityIssues(highlight);
    const cityLabel = cities.find(c => c.value === highlight.city)?.label || highlight.city;
    const isExpanded = expandedRows.has(highlight.id);

    return (
      <Card key={highlight.id} className="rounded-xl">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedItems.has(highlight.id)}
                onCheckedChange={() => toggleSelection(highlight.id)}
                className="mt-1"
              />
              {renderThumbnail(highlight)}
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-medium text-foreground line-clamp-2 leading-snug">
                      {highlight.event_title}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{highlight.event_title}</p>
                  </TooltipContent>
                </Tooltip>
                {qualityIssues.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {qualityIssues.map(issue => (
                      <Tooltip key={issue.key}>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                          >
                            {issue.label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{issue.action}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleRowExpansion(highlight.id)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {/* Status row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={situationBadge.variant}
                  className={situationBadge.className}
                >
                  {situationBadge.label}
                </Badge>
                <Badge variant={highlight.status === 'published' ? 'default' : 'secondary'}>
                  {highlight.status === 'published' ? 'Publicado' : 'Rascunho'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                {canPublish && (
                  highlight.status === 'draft' ? (
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
                  )
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
                    <DropdownMenuItem onClick={() => window.open(`/destaque/${highlight.slug || highlight.id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visualizar no site
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyLink(highlight)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar link
                    </DropdownMenuItem>
                    {qualityIssues.some(issue => issue.key === 'no_slug') && (
                      <DropdownMenuItem onClick={() => generateSlug(highlight.id, highlight.event_title)}>
                        <Link className="h-4 w-4 mr-2" />
                        Gerar slug
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {canDelete && (
                      <DropdownMenuItem 
                        onClick={() => setConfirmDialog({ open: true, type: 'bulk_delete', items: [highlight.id] })}
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Mover para Lixeira
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{cityLabel}</span>
              </div>
              {highlight.start_at && highlight.end_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatPeriod(highlight.start_at, highlight.end_at)}</span>
                </div>
              )}
            </div>

            {/* Expanded details */}
            <Collapsible open={isExpanded}>
              <CollapsibleContent className="space-y-2 pt-2 border-t">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Slug: </span>
                    <span className="font-mono text-xs">
                      {highlight.slug || <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Sem slug</Badge>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Atualizado em: </span>
                    <span>{format(new Date(highlight.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  </div>
                  {highlight.updated_by && (
                    <div>
                      <span className="text-muted-foreground">Por: </span>
                      <span>{highlight.updated_by}</span>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-spartan text-foreground">Destaques</h1>
            <p className="text-muted-foreground">Gerencie destaques culturais e eventos em destaque</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Options */}
            <div className="hidden md:flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Density Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDensityMode('compact')}>
                  <CheckSquare className={`h-4 w-4 mr-2 ${densityMode === 'compact' ? 'opacity-100' : 'opacity-0'}`} />
                  Modo compacto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDensityMode('comfortable')}>
                  <CheckSquare className={`h-4 w-4 mr-2 ${densityMode === 'comfortable' ? 'opacity-100' : 'opacity-0'}`} />
                  Modo confortável
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSecondaryColumns(!showSecondaryColumns)}>
                  <CheckSquare className={`h-4 w-4 mr-2 ${showSecondaryColumns ? 'opacity-100' : 'opacity-0'}`} />
                  Colunas secundárias
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => navigate('/admin-v2/highlights/create')} className="bg-primary hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Criar Destaque
            </Button>
          </div>
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
            {/* Sticky Filters */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
              <Card>
                <CardContent className="pt-6">
                  {/* Main filters row */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={dateRangeStart}
                        onChange={(e) => updateSearchParams({ dateStart: e.target.value, page: 1 })}
                        placeholder="Data início"
                      />
                      <Input
                        type="date"
                        value={dateRangeEnd}
                        onChange={(e) => updateSearchParams({ dateEnd: e.target.value, page: 1 })}
                        placeholder="Data fim"
                      />
                    </div>

                    {/* City Filter */}
                    <Select value={selectedCities.length > 0 ? selectedCities[0] : 'all'} onValueChange={(value) => {
                      if (value === 'all') {
                        handleCityFilter([]);
                      } else {
                        handleCityFilter([value]);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as cidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as cidades</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Situation Filter */}
                    <Select value={sanitizedSituation} onValueChange={(value) => updateSearchParams({ situation: value === 'all' ? null : value, page: 1 })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as situações" />
                      </SelectTrigger>
                      <SelectContent>
                        {situationFilters.map(filter => (
                          <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
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

                    {/* Quality Filter */}
                    <Select value={sanitizedQuality} onValueChange={(value) => updateSearchParams({ quality: value === 'all' ? null : value, page: 1 })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityFilters.map(filter => (
                          <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
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
            </div>

            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedItems.size} item(s) selecionado(s)
                    </span>
                    <div className="flex gap-2">
                      {canPublish && (
                        <>
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
                        </>
                      )}
                      {canDelete && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setConfirmDialog({ open: true, type: 'bulk_delete', items: Array.from(selectedItems) })}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Mover para Lixeira
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            {highlights.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum destaque encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Crie seu primeiro destaque para começar.'
                    }
                  </p>
                  <Button onClick={() => navigate('/admin-v2/highlights/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Destaque
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'cards' ? (
              <div className="space-y-3">
                {paginatedHighlights.map(renderHighlightCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`border-b sticky top-0 z-20 bg-background ${densityMode === 'compact' ? 'h-10' : 'h-12'}`}>
                        <tr>
                          <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'} w-12`}>
                            <Checkbox
                              checked={selectedItems.size === paginatedHighlights.length && paginatedHighlights.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </th>
                          <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'} w-16`}>Thumb</th>
                          <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'} min-w-48`}>
                            <Button variant="ghost" onClick={() => handleSort('event_title')} className="h-auto p-0 font-medium">
                              Título
                              {sortField === 'event_title' && (
                                sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </th>
                          <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'}`}>Situação</th>
                          <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'}`}>Status</th>
                          <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'}`}>Cidade</th>
                          <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'}`}>
                            <Button variant="ghost" onClick={() => handleSort('start_at')} className="h-auto p-0 font-medium">
                              Período
                              {sortField === 'start_at' && (
                                sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </th>
                          {showSecondaryColumns && (
                            <>
                              <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'}`}>Slug</th>
                              <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'}`}>Atualizado por</th>
                              <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'}`}>
                                <Button variant="ghost" onClick={() => handleSort('updated_at')} className="h-auto p-0 font-medium">
                                  Atualizado em
                                  {sortField === 'updated_at' && (
                                    sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                                  )}
                                </Button>
                              </th>
                            </>
                          )}
                          <th className={`text-left ${densityMode === 'compact' ? 'p-2' : 'p-4'} w-32 sticky right-0 bg-background border-l shadow-[-2px_0_4px_rgba(0,0,0,0.1)]`}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHighlights.map((highlight) => {
                          const situation = calculateSituation(highlight);
                          const situationBadge = getSituationBadge(situation);
                          const qualityIssues = getQualityIssues(highlight);
                          const cityLabel = cities.find(c => c.value === highlight.city)?.label || highlight.city;

                          return (
                            <tr key={highlight.id} className={`border-b hover:bg-muted/50 ${densityMode === 'compact' ? 'h-12' : 'h-16'}`}>
                              <td className={densityMode === 'compact' ? 'p-2' : 'p-4'}>
                                <Checkbox
                                  checked={selectedItems.has(highlight.id)}
                                  onCheckedChange={() => toggleSelection(highlight.id)}
                                />
                              </td>
                              <td className={densityMode === 'compact' ? 'p-2' : 'p-4'}>
                                {renderThumbnail(highlight)}
                              </td>
                              <td className={densityMode === 'compact' ? 'p-2' : 'p-4'}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="max-w-48">
                                      <div className="line-clamp-2 font-medium text-foreground">
                                        {highlight.event_title}
                                      </div>
                                      {qualityIssues.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                          {qualityIssues.slice(0, 2).map(issue => (
                                            <Tooltip key={issue.key}>
                                              <TooltipTrigger asChild>
                                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                                  <AlertCircle className="h-3 w-3" />
                                                </Badge>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>{issue.label} - {issue.action}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          ))}
                                          {qualityIssues.length > 2 && (
                                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                              +{qualityIssues.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{highlight.event_title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                              <td className={densityMode === 'compact' ? 'p-2' : 'p-4'}>
                                <Badge 
                                  variant={situationBadge.variant}
                                  className={situationBadge.className}
                                >
                                  {situationBadge.label}
                                </Badge>
                              </td>
                              <td className={densityMode === 'compact' ? 'p-2' : 'p-4'}>
                                <Badge 
                                  variant={highlight.status === 'published' ? 'default' : 'secondary'}
                                  className={highlight.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                >
                                  {highlight.status === 'published' ? 'Publicado' : 'Rascunho'}
                                </Badge>
                              </td>
                              <td className={densityMode === 'compact' ? 'p-2' : 'p-4'}>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{cityLabel}</span>
                                </div>
                              </td>
                              <td className={densityMode === 'compact' ? 'p-2' : 'p-4'}>
                                {highlight.start_at && highlight.end_at ? (
                                  <div className="text-sm">
                                    {formatPeriod(highlight.start_at, highlight.end_at)}
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Sem datas</Badge>
                                )}
                              </td>
                              {showSecondaryColumns && (
                                <>
                                  <td className={densityMode === 'compact' ? 'p-2' : 'p-4'}>
                                    <div className="font-mono text-sm text-muted-foreground max-w-32 truncate">
                                      {highlight.slug || <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Sem slug</Badge>}
                                    </div>
                                  </td>
                                  <td className={`${densityMode === 'compact' ? 'p-2' : 'p-4'} text-sm text-muted-foreground`}>
                                    {highlight.updated_by || '—'}
                                  </td>
                                  <td className={`${densityMode === 'compact' ? 'p-2' : 'p-4'} text-sm text-muted-foreground`}>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {format(new Date(highlight.updated_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                                    </div>
                                  </td>
                                </>
                              )}
                              <td className={`${densityMode === 'compact' ? 'p-2' : 'p-4'} sticky right-0 bg-background border-l shadow-[-2px_0_4px_rgba(0,0,0,0.1)]`}>
                                <div className="flex items-center gap-1">
                                  {canPublish && (
                                    highlight.status === 'draft' ? (
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
                                    )
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
                                      <DropdownMenuItem onClick={() => window.open(`/destaque/${highlight.slug || highlight.id}`, '_blank')}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Visualizar no site
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => copyLink(highlight)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copiar link
                                      </DropdownMenuItem>
                                      {qualityIssues.some(issue => issue.key === 'no_slug') && (
                                        <DropdownMenuItem onClick={() => generateSlug(highlight.id, highlight.event_title)}>
                                          <Link className="h-4 w-4 mr-2" />
                                          Gerar slug
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      {canDelete && (
                                        <DropdownMenuItem 
                                          onClick={() => setConfirmDialog({ open: true, type: 'bulk_delete', items: [highlight.id] })}
                                          className="text-destructive"
                                        >
                                          <Trash className="h-4 w-4 mr-2" />
                                          Mover para Lixeira
                                        </DropdownMenuItem>
                                      )}
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
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {highlights.length > 0 && (
              <Card className="sticky bottom-0 z-10">
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
                        Página {currentPage} de {totalPages} ({highlights.length} itens)
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
              <CardContent className="text-center py-12">
                <Trash className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Lixeira vazia</h3>
                <p className="text-muted-foreground">
                  Funcionalidade de lixeira será implementada em breve.
                  <br />
                  Por enquanto, exclusões são permanentes.
                </p>
              </CardContent>
            </Card>
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
        <div className="text-xs text-muted-foreground text-center space-x-4">
          <span>Atalhos: <kbd className="px-1 py-0.5 text-xs bg-muted rounded">N</kbd> Novo destaque</span>
          <span>•</span>
          <span><kbd className="px-1 py-0.5 text-xs bg-muted rounded">F</kbd> Focar busca</span>
        </div>
      </div>
    </TooltipProvider>
  );
}