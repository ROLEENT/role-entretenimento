import React, { useState } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminAgendaTable } from '@/components/admin/agenda/AdminAgendaTable';
import { AdminAgendaFilters } from '@/components/admin/agenda/AdminAgendaFilters';
import { useAdminAgendaData } from '@/hooks/useAdminAgendaData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminV3AgendaList() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: '',
    dateRange: { from: null as Date | null, to: null as Date | null },
    tags: [] as string[]
  });

  const { data, loading, error, refetch } = useAdminAgendaData(filters);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-v3' },
    { label: 'Agenda' }
  ];

  const handleExport = () => {
    // TODO: Implementar exportação CSV
    console.log('Export CSV');
  };

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    // TODO: Implementar ações em lote
    console.log('Bulk action:', action, selectedIds);
  };

  const statsCards = [
    {
      title: 'Total de Eventos',
      value: data?.total || 0,
      icon: FileText,
      change: '+12%'
    },
    {
      title: 'Rascunhos',
      value: data?.drafts || 0,
      icon: FileText,
      change: '+5%'
    },
    {
      title: 'Publicados',
      value: data?.published || 0,
      icon: FileText,
      change: '+8%'
    },
    {
      title: 'Desta Semana',
      value: data?.thisWeek || 0,
      icon: FileText,
      change: '+15%'
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
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button asChild className="gap-2">
            <Link to="/admin-v3/agenda/criar">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Link>
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} desde o último mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <AdminAgendaFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onReset={() => setFilters({
            search: '',
            status: '',
            city: '',
            dateRange: { from: null, to: null },
            tags: []
          })}
        />
      )}

      {/* Table */}
      <AdminAgendaTable
        data={data?.items || []}
        loading={loading}
        error={error}
        onRefresh={refetch}
        onBulkAction={handleBulkAction}
      />
    </AdminPageWrapper>
  );
}