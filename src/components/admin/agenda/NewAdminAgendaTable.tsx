import React, { useState, useCallback } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Eye, 
  Trash2, 
  Download,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface AgendaItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  city?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  starts_at?: string;
  end_at?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface NewAdminAgendaTableProps {
  items: AgendaItem[];
  loading: boolean;
  mutating: boolean;
  error: any;
  showTrash?: boolean;
  
  // Actions
  onRefresh: () => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkRestore: (ids: string[]) => Promise<void>;
  onBulkUpdateStatus: (ids: string[], status: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<string>;
  onExport: (format: 'csv' | 'excel') => Promise<void>;
}

export function NewAdminAgendaTable({
  items,
  loading,
  mutating,
  error,
  showTrash = false,
  onRefresh,
  onBulkDelete,
  onBulkRestore,
  onBulkUpdateStatus,
  onDuplicate,
  onExport
}: NewAdminAgendaTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  }, [items]);

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  }, [selectedItems]);

  const selectedIds = Array.from(selectedItems);
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  // Action handlers
  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedIds.length === 0) return;
    
    setActionLoading(true);
    try {
      switch (action) {
        case 'delete':
          await onBulkDelete(selectedIds);
          break;
        case 'restore':
          await onBulkRestore(selectedIds);
          break;
        case 'published':
        case 'draft':
        case 'scheduled':
        case 'archived':
          await onBulkUpdateStatus(selectedIds, action);
          break;
      }
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedIds, onBulkDelete, onBulkRestore, onBulkUpdateStatus]);

  const handleDuplicate = useCallback(async (id: string) => {
    setActionLoading(true);
    try {
      await onDuplicate(id);
    } finally {
      setActionLoading(false);
    }
  }, [onDuplicate]);

  const handleExport = useCallback(async (format: 'csv' | 'excel') => {
    setActionLoading(true);
    try {
      await onExport(format);
    } finally {
      setActionLoading(false);
    }
  }, [onExport]);

  // Status badge component
  const getStatusBadge = (status: string) => {
    const variants = {
      'published': { variant: 'default', label: 'Publicado' },
      'draft': { variant: 'secondary', label: 'Rascunho' },
      'scheduled': { variant: 'outline', label: 'Agendado' },
      'archived': { variant: 'destructive', label: 'Arquivado' }
    } as const;

    const config = variants[status as keyof typeof variants] || variants.draft;
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  // City badge component
  const getCityBadge = (city: string) => {
    if (!city) return <span className="text-muted-foreground">-</span>;

    const cityColors = {
      'sao-paulo': 'bg-blue-50 text-blue-700 border-blue-200',
      'rio-de-janeiro': 'bg-green-50 text-green-700 border-green-200',
      'brasilia': 'bg-purple-50 text-purple-700 border-purple-200',
      'belo-horizonte': 'bg-orange-50 text-orange-700 border-orange-200'
    } as const;

    const colorClass = cityColors[city as keyof typeof cityColors] || 'bg-gray-50 text-gray-700 border-gray-200';
    
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
        {city === 'sao-paulo' ? 'São Paulo' : 
         city === 'rio-de-janeiro' ? 'Rio de Janeiro' :
         city === 'brasilia' ? 'Brasília' :
         city === 'belo-horizonte' ? 'Belo Horizonte' : city}
      </span>
    );
  };

  // Actions dropdown for each row
  const renderActions = (item: AgendaItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!showTrash && (
          <>
            <DropdownMenuItem asChild>
              <Link to={`/admin-v3/agenda/${item.id}/editar`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDuplicate(item.id)} 
              className="flex items-center gap-2"
              disabled={actionLoading}
            >
              <Copy className="h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/evento/${item.slug}`} target="_blank" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualizar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleBulkAction('delete')} 
              className="flex items-center gap-2 text-destructive"
              disabled={actionLoading}
            >
              <Trash2 className="h-4 w-4" />
              Mover para Lixeira
            </DropdownMenuItem>
          </>
        )}
        
        {showTrash && (
          <DropdownMenuItem 
            onClick={() => handleBulkAction('restore')} 
            className="flex items-center gap-2"
            disabled={actionLoading}
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Table columns configuration - Otimizada para responsividade
  const columns = [
    {
      key: 'select' as keyof AgendaItem,
      label: 'Selecionar',
      render: (value: any, item: AgendaItem) => (
        <Checkbox
          checked={selectedItems.has(item.id)}
          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
        />
      ),
      sortable: false,
      width: '50px'
    },
    {
      key: 'title' as keyof AgendaItem,
      label: 'Título',
      sortable: true,
      render: (value: any, item: AgendaItem) => (
        <div className="min-w-[200px] max-w-[300px]">
          <div className="font-medium truncate">{item.title}</div>
          {item.subtitle && (
            <div className="text-sm text-muted-foreground truncate">{item.subtitle}</div>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof AgendaItem,
      label: 'Status',
      sortable: true,
      render: (value: any, item: AgendaItem) => getStatusBadge(item.status),
      width: '120px'
    },
    {
      key: 'city' as keyof AgendaItem,
      label: 'Cidade',
      sortable: true,
      render: (value: any, item: AgendaItem) => getCityBadge(item.city || ''),
      className: 'hidden md:table-cell',
      width: '140px'
    },
    {
      key: 'starts_at' as keyof AgendaItem,
      label: 'Data',
      sortable: true,
      render: (value: any, item: AgendaItem) => 
        item.starts_at ? (
          <div className="text-sm">
            {format(new Date(item.starts_at), 'dd/MM/yyyy', { locale: ptBR })}
            <div className="text-xs text-muted-foreground">
              {format(new Date(item.starts_at), 'HH:mm', { locale: ptBR })}
            </div>
          </div>
        ) : '-',
      width: '100px'
    },
    {
      key: 'tags' as keyof AgendaItem,
      label: 'Tags',
      render: (value: any, item: AgendaItem) => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {item.tags?.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags && item.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{item.tags.length - 2}
            </Badge>
          )}
        </div>
      ),
      className: 'hidden lg:table-cell',
      width: '150px'
    },
    {
      key: 'created_at' as keyof AgendaItem,
      label: 'Criado',
      sortable: true,
      render: (value: any, item: AgendaItem) => 
        format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      className: 'hidden xl:table-cell',
      width: '100px'
    }
  ];

  // Bulk action toolbar
  const BulkActionToolbar = () => {
    if (selectedIds.length === 0) return null;

    return (
      <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
        <span className="text-sm font-medium">
          {selectedIds.length} item(s) selecionado(s)
        </span>
        
        {!showTrash && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={actionLoading}>
                  Alterar Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('published')}>
                  Publicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('draft')}>
                  Rascunho
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('scheduled')}>
                  Agendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('archived')}>
                  Arquivar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={actionLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Mover para Lixeira
            </Button>
          </>
        )}
        
        {showTrash && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleBulkAction('restore')}
            disabled={actionLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setSelectedItems(new Set())}
        >
          Cancelar
        </Button>
      </div>
    );
  };

  // Header actions
  const HeaderActions = () => (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={actionLoading}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            Exportar CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            Exportar Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={loading || actionLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar dados: {error.message}</p>
        <Button onClick={onRefresh} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {showTrash ? 'Itens na Lixeira' : 'Agenda de Eventos'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {items.length} item(s) encontrado(s)
          </p>
        </div>
        <HeaderActions />
      </div>

      <BulkActionToolbar />

      <DataTable
        data={items}
        columns={columns}
        loading={loading || mutating}
        getRowId={(item) => item.id}
        showActions={true}
        renderActions={renderActions}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente mover {selectedIds.length} item(s) para a lixeira? 
              Esta ação pode ser desfeita posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBulkAction('delete');
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Mover para Lixeira
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}