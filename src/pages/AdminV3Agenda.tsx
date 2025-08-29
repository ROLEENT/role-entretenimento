import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Copy, 
  Trash2, 
  PlayCircle, 
  PauseCircle, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendaItem {
  id: string;
  title: string;
  slug: string;
  city: string;
  start_at: string;
  end_at: string;
  visibility_type: string;
  status: string;
  updated_at: string;
  cover_url?: string;
  alt_text?: string;
  type?: string;
  artists_names?: string[];
}

const ITEMS_PER_PAGE = 20;
const CITIES = ['porto_alegre', 'sao_paulo', 'rio_de_janeiro', 'florianopolis', 'curitiba'];
const STATUS_OPTIONS = ['draft', 'published'];
const VISIBILITY_OPTIONS = ['curadoria', 'vitrine'];

export default function AdminV3Agenda() {
  // Development-only error checking for empty SelectItem values
  if (process.env.NODE_ENV === 'development') {
    const checkSelectItems = () => {
      const selectItems = document.querySelectorAll('[data-radix-select-item]');
      selectItems.forEach((item) => {
        const value = item.getAttribute('data-value');
        if (value === '') {
          console.error('SelectItem vazio encontrado em AdminV3Agenda');
        }
      });
    };
    
    // Check after component renders
    setTimeout(checkSelectItems, 100);
  }
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // State
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; itemId?: string }>({
    isOpen: false
  });
  
  // Helper function to convert empty URL params to sentinel values
  const fromQuery = (p: URLSearchParams, key: string, fallback = 'all') =>
    p.get(key) && p.get(key)!.trim() !== '' ? p.get(key)! : fallback;

  // Filters from URL with sentinel values
  const search = searchParams.get('search') || '';
  const statusFilter = fromQuery(searchParams, 'status');
  const visibilityFilter = fromQuery(searchParams, 'visibility');
  const cityFilter = fromQuery(searchParams, 'city');
  const dateStart = searchParams.get('dateStart') || '';
  const dateEnd = searchParams.get('dateEnd') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  // Total count for pagination
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Update URL params
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // Reset page when filters change
    if (Object.keys(updates).some(key => key !== 'page')) {
      newParams.delete('page');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('agenda_itens')
        .select('id, title, slug, city, start_at, end_at, visibility_type, status, updated_at, cover_url, alt_text, type, artists_names', { count: 'exact' });
      
      // Filter out deleted items
      query = query.is('deleted_at', null);
      
      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
      }
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (visibilityFilter && visibilityFilter !== 'all') {
        query = query.eq('visibility_type', visibilityFilter);
      }
      
      if (cityFilter && cityFilter !== 'all') {
        query = query.eq('city', cityFilter);
      }
      
      if (dateStart) {
        query = query.gte('start_at', dateStart);
      }
      
      if (dateEnd) {
        query = query.lte('end_at', dateEnd);
      }
      
      // Pagination and ordering
      const offset = (page - 1) * ITEMS_PER_PAGE;
      query = query
        .order('updated_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setItems(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, visibilityFilter, cityFilter, dateStart, dateEnd, page]);

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const handleAction = async (action: string, itemId: string) => {
    try {
      switch (action) {
        case 'publish':
          await supabase
            .from('agenda_itens')
            .update({ status: 'published' })
            .eq('id', itemId);
          break;
        case 'unpublish':
          await supabase
            .from('agenda_itens')
            .update({ status: 'draft' })
            .eq('id', itemId);
          break;
        case 'duplicate':
          const { data: original } = await supabase
            .from('agenda_itens')
            .select('*')
            .eq('id', itemId)
            .single();
          
          if (original) {
            const { id, created_at, updated_at, ...itemData } = original;
            await supabase
              .from('agenda_itens')
              .insert({
                ...itemData,
                title: `${itemData.title} (Cópia)`,
                slug: `${itemData.slug}-copia-${Date.now()}`,
                status: 'draft'
              });
          }
          break;
        case 'delete':
          await supabase
            .from('agenda_itens')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', itemId);
          break;
        case 'edit':
          window.location.href = `/admin-v3/agenda/${itemId}/edit`;
          return;
        case 'view':
          window.open(`/agenda/${items.find(i => i.id === itemId)?.slug}`, '_blank');
          return;
      }
      
      toast({
        title: "Sucesso",
        description: "Ação executada com sucesso."
      });
      
      fetchData();
    } catch (err) {
      console.error('Erro na ação:', err);
      toast({
        title: "Erro",
        description: "Erro ao executar ação.",
        variant: "destructive"
      });
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'publish' | 'unpublish') => {
    if (selectedItems.size === 0) return;
    
    try {
      const status = action === 'publish' ? 'published' : 'draft';
      await supabase
        .from('agenda_itens')
        .update({ status })
        .in('id', Array.from(selectedItems));
      
      toast({
        title: "Sucesso",
        description: `${selectedItems.size} itens ${action === 'publish' ? 'publicados' : 'despublicados'}.`
      });
      
      setSelectedItems(new Set());
      fetchData();
    } catch (err) {
      console.error('Erro na ação em massa:', err);
      toast({
        title: "Erro",
        description: "Erro ao executar ação em massa.",
        variant: "destructive"
      });
    }
  };

  // Toggle selection
  const toggleSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  // Format period
  const formatPeriod = (startAt: string, endAt: string) => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    
    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return format(start, "dd/MM/yyyy 'das' HH:mm", { locale: ptBR }) + 
             format(end, " 'às' HH:mm", { locale: ptBR });
    } else {
      return format(start, "dd/MM/yyyy HH:mm", { locale: ptBR }) + 
             ' até ' + format(end, "dd/MM/yyyy HH:mm", { locale: ptBR });
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  // Get situation badge
  const getSituationBadge = (item: AgendaItem) => {
    const now = new Date();
    const startDate = new Date(item.start_at);
    const endDate = new Date(item.end_at);
    
    if (item.status === 'published') {
      if (endDate < now) {
        return <Badge variant="outline">Expirado</Badge>;
      } else if (startDate <= now && endDate >= now) {
        return <Badge variant="default">Ativo</Badge>;
      } else if (startDate > now) {
        return <Badge variant="secondary">Agendado</Badge>;
      }
    }
    
    // Check for incomplete data
    const isIncomplete = !item.city || !item.cover_url || !item.alt_text;
    if (isIncomplete) {
      return <Badge variant="destructive">Incompleto</Badge>;
    }
    
    return <Badge variant="outline">Rascunho</Badge>;
  };

  // Format artists
  const formatArtists = (artists: string[] = []) => {
    if (artists.length === 0) return '-';
    if (artists.length <= 2) return artists.join(', ');
    return `${artists.slice(0, 2).join(', ')} +${artists.length - 2}`;
  };

  if (error) {
    return (
      <AdminV3Guard>
        <div className="min-h-screen bg-background">
          <AdminV3Header />
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-destructive mb-4">
                    <p className="font-semibold">Erro ao carregar dados</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                  <Button onClick={fetchData} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Recarregar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminV3Guard>
    );
  }

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <AdminV3Breadcrumb 
            items={[
              { label: 'Agenda' }
            ]}
          />
          
           {/* Header */}
           <div className="flex items-center justify-between">
             <h1 className="text-3xl font-bold">Agenda</h1>
             <div className="space-x-2">
               {selectedItems.size > 0 && (
                 <>
                   <Button onClick={() => handleBulkAction('publish')} variant="default" size="sm">
                     <PlayCircle className="w-4 h-4 mr-2" />
                     Publicar ({selectedItems.size})
                   </Button>
                   <Button onClick={() => handleBulkAction('unpublish')} variant="outline" size="sm">
                     <PauseCircle className="w-4 h-4 mr-2" />
                     Despublicar ({selectedItems.size})
                   </Button>
                 </>
               )}
               <Button onClick={fetchData} variant="outline" size="sm">
                 <RefreshCw className="w-4 h-4" />
               </Button>
               <Button onClick={() => window.location.href = '/admin-v3/agenda/create'} variant="default">
                 Criar Novo
               </Button>
             </div>
           </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por título ou slug..."
                      value={search}
                      onChange={(e) => updateParams({ search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter ?? 'all'} onValueChange={(value) => updateParams({ status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={String(status)}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={visibilityFilter ?? 'all'} onValueChange={(value) => updateParams({ visibility: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Visibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {VISIBILITY_OPTIONS.map(visibility => (
                      <SelectItem key={visibility} value={String(visibility)}>{visibility}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={cityFilter ?? 'all'} onValueChange={(value) => updateParams({ city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {CITIES.map(city => (
                      <SelectItem key={city} value={String(city)}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  placeholder="Data inicial"
                  value={dateStart}
                  onChange={(e) => updateParams({ dateStart: e.target.value })}
                />
              </div>
              
              <div className="flex gap-4">
                <Input
                  type="date"
                  placeholder="Data final"
                  value={dateEnd}
                  onChange={(e) => updateParams({ dateEnd: e.target.value })}
                  className="max-w-xs"
                />
                {(search || (statusFilter && statusFilter !== 'all') || (visibilityFilter && visibilityFilter !== 'all') || (cityFilter && cityFilter !== 'all') || dateStart || dateEnd) && (
                  <Button 
                    variant="outline" 
                    onClick={() => updateParams({ 
                      search: null, 
                      status: null, 
                      visibility: null, 
                      city: null, 
                      dateStart: null, 
                      dateEnd: null 
                    })}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner />
                  <p className="mt-4 text-muted-foreground">Carregando agenda...</p>
                </div>
              ) : (
                <>
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead className="w-12">
                           <Checkbox
                             checked={items.length > 0 && selectedItems.size === items.length}
                             onCheckedChange={toggleSelectAll}
                           />
                         </TableHead>
                         <TableHead className="w-20">Thumb</TableHead>
                         <TableHead>Título</TableHead>
                         <TableHead>Tipo</TableHead>
                         <TableHead>Cidade</TableHead>
                         <TableHead>Período</TableHead>
                         <TableHead>Artistas</TableHead>
                         <TableHead>Situação</TableHead>
                         <TableHead>Status</TableHead>
                        <TableHead>Atualizado em</TableHead>
                        <TableHead className="w-32">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                     <TableBody>
                       {items.map((item) => (
                         <TableRow key={item.id}>
                           <TableCell>
                             <Checkbox
                               checked={selectedItems.has(item.id)}
                               onCheckedChange={() => toggleSelection(item.id)}
                             />
                           </TableCell>
                           <TableCell>
                             {item.cover_url ? (
                               <img 
                                 src={item.cover_url} 
                                 alt={item.alt_text || item.title}
                                 className="w-12 h-12 object-cover rounded"
                               />
                             ) : (
                               <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                 Sem imagem
                               </div>
                             )}
                           </TableCell>
                           <TableCell className="font-medium max-w-xs truncate">
                             {item.title}
                           </TableCell>
                           <TableCell className="text-sm">
                             {item.type || '-'}
                           </TableCell>
                           <TableCell>{item.city || '-'}</TableCell>
                           <TableCell className="text-sm">
                             {item.start_at && item.end_at ? formatPeriod(item.start_at, item.end_at) : '-'}
                           </TableCell>
                           <TableCell className="text-sm">
                             {formatArtists(item.artists_names)}
                           </TableCell>
                           <TableCell>
                             {getSituationBadge(item)}
                           </TableCell>
                           <TableCell>
                             {getStatusBadge(item.status)}
                           </TableCell>
                           <TableCell className="text-sm text-muted-foreground">
                             {format(new Date(item.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                           </TableCell>
                           <TableCell>
                             <div className="flex gap-1">
                               <Button size="sm" variant="ghost" onClick={() => handleAction('edit', item.id)}>
                                 <Edit className="w-3 h-3" />
                               </Button>
                               <Button size="sm" variant="ghost" onClick={() => handleAction('view', item.id)}>
                                 <Eye className="w-3 h-3" />
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 onClick={() => setDeleteDialog({ isOpen: true, itemId: item.id })}
                               >
                                 <Trash2 className="w-3 h-3" />
                               </Button>
                             </div>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                  </Table>

                  {items.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      Nenhum item encontrado com os filtros aplicados.
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a {Math.min(page * ITEMS_PER_PAGE, totalCount)} de {totalCount} itens
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: (page - 1).toString() })}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: (page + 1).toString() })}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Delete Dialog */}
          <AlertDialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog({ isOpen })}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (deleteDialog.itemId) {
                      handleAction('delete', deleteDialog.itemId);
                    }
                    setDeleteDialog({ isOpen: false });
                  }}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}