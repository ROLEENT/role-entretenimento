import React, { useState, useEffect } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { NewAdminAgendaTable } from '@/components/admin/agenda/NewAdminAgendaTable';
import { NewAdminAgendaFilters } from '@/components/admin/agenda/NewAdminAgendaFilters';
import { useNewAdminAgendaData } from '@/hooks/useNewAdminAgendaData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminV3AgendaListNew() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    city: searchParams.get('city') || '',
    dateRange: {
      from: searchParams.get('from') ? new Date(searchParams.get('from')!) : null,
      to: searchParams.get('to') ? new Date(searchParams.get('to')!) : null,
    },
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    showTrash: searchParams.get('showTrash') === 'true' || false,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.city) params.set('city', filters.city);
    if (filters.dateRange.from) params.set('from', filters.dateRange.from.toISOString());
    if (filters.dateRange.to) params.set('to', filters.dateRange.to.toISOString());
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.showTrash) params.set('showTrash', 'true');
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Use the new robust agenda data hook
  const {
    items,
    stats,
    page,
    totalPages,
    totalItems,
    setPage,
    loading,
    statsLoading,
    mutating,
    error,
    refetch,
    bulkDelete,
    bulkRestore,
    bulkUpdateStatus,
    duplicateItem,
    exportData
  } = useNewAdminAgendaData(filters);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-v3' },
    { label: 'Agenda' }
  ];

  const handleFiltersReset = () => {
    const newFilters = {
      search: '',
      status: '',
      city: '',
      dateRange: { from: null, to: null },
      tags: [],
      showTrash: false
    };
    setFilters(newFilters);
  };

  const statsCards = [
    {
      title: 'Total',
      value: stats.total,
      description: 'Total de itens'
    },
    {
      title: 'Rascunhos',
      value: stats.drafts,
      description: 'Aguardando publicação'
    },
    {
      title: 'Publicados',
      value: stats.published,
      description: 'Visíveis no site'
    },
    {
      title: 'Esta Semana',
      value: stats.thisWeek,
      description: 'Criados esta semana'
    }
  ];

  return (
    <AdminPageWrapper
      title="Agenda"
      description="Gerencie todos os eventos da agenda"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          <Button asChild>
            <Link to="/admin-v3/agenda/novo" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <NewAdminAgendaFilters
          filters={filters}
          onFiltersChange={(newFilters) => setFilters({...filters, ...newFilters})}
          onReset={handleFiltersReset}
          collapsed={!showFilters}
          onToggleCollapse={() => setShowFilters(!showFilters)}
        />

        {/* Table */}
        <NewAdminAgendaTable
          items={items}
          loading={loading}
          mutating={mutating}
          error={error}
          showTrash={filters.showTrash}
          onRefresh={refetch}
          onBulkDelete={bulkDelete}
          onBulkRestore={bulkRestore}
          onBulkUpdateStatus={bulkUpdateStatus}
          onDuplicate={duplicateItem}
          onExport={exportData}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {items.length} de {totalItems} itens
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || loading}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
}