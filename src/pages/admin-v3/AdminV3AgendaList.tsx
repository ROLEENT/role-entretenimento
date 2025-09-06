import React, { useState, useEffect } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Download, FileText } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminAgendaTable } from '@/components/admin/agenda/AdminAgendaTable';
import { AdminAgendaFilters } from '@/components/admin/agenda/AdminAgendaFilters';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminV3AgendaList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    city: searchParams.get('city') || '',
    dateRange: { 
      from: searchParams.get('date_from') ? new Date(searchParams.get('date_from')!) : null,
      to: searchParams.get('date_to') ? new Date(searchParams.get('date_to')!) : null
    },
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || []
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.city) params.set('city', filters.city);
    if (filters.dateRange.from) params.set('date_from', filters.dateRange.from.toISOString());
    if (filters.dateRange.to) params.set('date_to', filters.dateRange.to.toISOString());
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch agenda items (legacy table)
  const { data: events = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ["admin-agenda", filters],
    queryFn: async () => {
      let query = supabase
        .from("agenda_itens")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Simple stats for agenda
  const stats = {
    total: events.length,
    draft: events.filter(e => e.status === 'draft').length,
    published: events.filter(e => e.status === 'published').length,
    thisMonth: events.filter(e => {
      const eventDate = new Date(e.created_at);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).length,
  };

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
      value: stats?.total || 0,
      icon: FileText,
      change: '+12%'
    },
    {
      title: 'Rascunhos',
      value: stats?.draft || 0,
      icon: FileText,
      change: '+5%'
    },
    {
      title: 'Publicados',
      value: stats?.published || 0,
      icon: FileText,
      change: '+8%'
    },
    {
      title: 'Desta Semana',
      value: stats?.thisMonth || 0,
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
            <Link to="/admin-v3/eventos/criar">
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
          onReset={() => {
            const resetFilters = {
              search: '',
              status: '',
              city: '',
              dateRange: { from: null, to: null },
              tags: []
            };
            setFilters(resetFilters);
          }}
        />
      )}

      {/* Table */}
      <AdminAgendaTable
        data={events || []}
        loading={loading}
        error={error}
        onRefresh={refetch}
        onBulkAction={handleBulkAction}
      />
    </AdminPageWrapper>
  );
}