import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminV3Guard } from "@/components/AdminV3Guard";
import { AdminV3Header } from "@/components/AdminV3Header";
import { AdminV3Breadcrumb } from "@/components/admin/common/AdminV3Breadcrumb";
import { EventGrid } from "@/components/events/EventGrid";
import { ChecklistWidget } from "@/components/events/ChecklistWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Calendar, Users, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminV3EventsDashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    highlight_type: "",
    city: ""
  });

  // Fetch events from new events table
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events-v3", filters],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          id, title, subtitle, summary, city, location_name,
          date_start, date_end, doors_open_utc, image_url, cover_url,
          price_min, price_max, currency, highlight_type, is_sponsored,
          age_rating, genres, slug, ticket_url, status,
          lineup_slots, partners, performances, visual_artists
        `)
        .order("created_at", { ascending: false });

      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.highlight_type) {
        query = query.eq("highlight_type", filters.highlight_type);
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ["admin-events-stats"],
    queryFn: async () => {
      const [
        { count: totalEvents },
        { count: publishedEvents },
        { count: highlightedEvents },
        { count: draftEvents }
      ] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("events").select("*", { count: "exact", head: true }).neq("highlight_type", "none"),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "draft")
      ]);

      return {
        total: totalEvents || 0,
        published: publishedEvents || 0,
        highlighted: highlightedEvents || 0,
        draft: draftEvents || 0
      };
    }
  });

  const handleEventClick = (event: any) => {
    navigate(`/admin-v3/eventos/${event.id}/editar`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const breadcrumbItems = [
    { label: "Eventos", path: "/admin-v3/eventos" }
  ];

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        
        <div className="container mx-auto p-6 space-y-6">
          <AdminV3Breadcrumb items={breadcrumbItems} />
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
              <p className="text-muted-foreground">
                Gerencie eventos com o novo sistema unificado
              </p>
            </div>
            <Button 
              onClick={() => navigate("/admin-v3/eventos/criar")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês passado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Publicados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.published || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.total ? Math.round((stats.published / stats.total) * 100) : 0}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Destaque</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.highlighted || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Destaque ou vitrine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.draft || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando publicação
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Título do evento..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destaque</label>
                  <Select value={filters.highlight_type} onValueChange={(value) => handleFilterChange("highlight_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="none">Sem destaque</SelectItem>
                      <SelectItem value="destaque">Destaque</SelectItem>
                      <SelectItem value="vitrine">Vitrine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cidade</label>
                  <Input
                    placeholder="Filtrar por cidade..."
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Eventos Recentes</CardTitle>
                    <Badge variant="secondary">
                      {events.length} evento(s)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <EventGrid
                    events={events}
                    variant="compact"
                    columns={1}
                    onEventClick={handleEventClick}
                    loading={isLoading}
                    className="space-y-4"
                  />

                  {events.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Comece criando seu primeiro evento com o novo sistema.
                      </p>
                      <Button onClick={() => navigate("/admin-v3/eventos/criar")}>
                        Criar Primeiro Evento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/admin-v3/eventos/criar")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Evento
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/admin-v3/agenda")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Agenda Legacy
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/admin-v3/venues")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Venues
                  </Button>
                </CardContent>
              </Card>

              {/* Latest Event Checklist */}
              {events.length > 0 && (
                <ChecklistWidget
                  eventData={events[0]}
                  onItemClick={(itemId) => {
                    navigate(`/admin-v3/eventos/${events[0].id}/editar`, { 
                      state: { focusField: itemId } 
                    });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}