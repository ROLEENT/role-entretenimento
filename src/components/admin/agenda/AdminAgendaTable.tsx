import React, { useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Copy, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { AgendaItemInput } from '@/schemas/agenda';

interface AdminAgendaTableProps {
  data: AgendaItemInput[];
  loading: boolean;
  error: any;
  onRefresh: () => void;
  onBulkAction: (action: string, selectedIds: string[]) => void;
}

// Simplified agenda item for table display
interface AgendaTableItem {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  city?: string;
  starts_at?: string;
  tags?: string[];
  slug: string;
}

export function AdminAgendaTable({ 
  data, 
  loading, 
  error, 
  onRefresh, 
  onBulkAction 
}: AdminAgendaTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Transform data for table
  const tableData: AgendaTableItem[] = data.map(item => ({
    id: item.id || '',
    title: item.title || '',
    subtitle: item.subtitle,
    status: item.status || 'draft',
    city: item.city,
    starts_at: item.start_at_utc ? item.start_at_utc.toISOString() : undefined,
    tags: item.tags,
    slug: item.slug || ''
  }));

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

  const getCityBadge = (city: string) => {
    const cityColors = {
      'sao-paulo': 'bg-blue-100 text-blue-800',
      'rio-de-janeiro': 'bg-green-100 text-green-800',
      'brasilia': 'bg-purple-100 text-purple-800',
      'belo-horizonte': 'bg-orange-100 text-orange-800'
    } as const;

    const colorClass = cityColors[city as keyof typeof cityColors] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {city === 'sao-paulo' ? 'São Paulo' : 
         city === 'rio-de-janeiro' ? 'Rio de Janeiro' :
         city === 'brasilia' ? 'Brasília' :
         city === 'belo-horizonte' ? 'Belo Horizonte' : city}
      </span>
    );
  };

  const renderActions = (item: AgendaTableItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/admin-v3/agenda/${item.id}/editar`} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicate(item.id)} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/preview/agenda/${item.slug}`} target="_blank" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDelete(item.id)} 
          className="flex items-center gap-2 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleDuplicate = (id: string) => {
    // TODO: Implementar duplicação
    console.log('Duplicate:', id);
  };

  const handleDelete = (id: string) => {
    // TODO: Implementar exclusão
    console.log('Delete:', id);
  };

  const handleView = (item: AgendaTableItem) => {
    window.open(`/preview/agenda/${item.slug}`, '_blank');
  };

  const handleBatchStatusChange = (selectedItems: AgendaTableItem[], newStatus: string) => {
    const selectedIds = selectedItems.map(item => item.id);
    onBulkAction(newStatus, selectedIds);
  };

  const handleDeleteSelected = (selectedItems: AgendaTableItem[]) => {
    const selectedIds = selectedItems.map(item => item.id);
    onBulkAction('delete', selectedIds);
  };

  const columns = [
    {
      key: 'title' as keyof AgendaTableItem,
      label: 'Título',
      sortable: true,
      render: (value: any, item: AgendaTableItem) => (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">{item.title}</div>
          {item.subtitle && (
            <div className="text-sm text-muted-foreground truncate">{item.subtitle}</div>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof AgendaTableItem,
      label: 'Status',
      sortable: true,
      render: (value: any, item: AgendaTableItem) => getStatusBadge(item.status)
    },
    {
      key: 'city' as keyof AgendaTableItem,
      label: 'Cidade',
      sortable: true,
      render: (value: any, item: AgendaTableItem) => item.city ? getCityBadge(item.city) : '-'
    },
    {
      key: 'starts_at' as keyof AgendaTableItem,
      label: 'Data do Evento',
      sortable: true,
      render: (value: any, item: AgendaTableItem) => 
        item.starts_at ? format(new Date(item.starts_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'
    },
    {
      key: 'tags' as keyof AgendaTableItem,
      label: 'Tags',
      render: (value: any, item: AgendaTableItem) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {item.tags?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags && item.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: 'published', label: 'Publicar' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'scheduled', label: 'Agendar' },
    { value: 'archived', label: 'Arquivar' }
  ];

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
    <DataTable
      data={tableData}
      columns={columns}
      loading={loading}
      searchPlaceholder="Buscar por título, cidade ou tag..."
      statusOptions={statusOptions}
      onView={handleView}
      onBatchStatusChange={handleBatchStatusChange}
      onDelete={handleDeleteSelected}
      getRowId={(item) => item.id}
      showActions={true}
    />
  );
}