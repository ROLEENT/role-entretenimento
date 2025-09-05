import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Settings } from "lucide-react";
import { AdminEventFilters } from "@/components/admin/events/AdminEventFilters";
import { AdminEventTable } from "@/components/admin/events/AdminEventTable";
import { useAdminEventsData } from "@/hooks/useAdminEventsData";
import { AdminV3Breadcrumb } from "@/components/admin/common/AdminV3Breadcrumb";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "@/api/eventsApi";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface EventFilters {
  search?: string;
  status?: string;
  city?: string;
  dateStart?: string;
  dateEnd?: string;
  organizer?: string;
  venue?: string;
}

export default function AdminV3EventsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventIdsToDelete, setEventIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    city: searchParams.get("city") || "",
    dateStart: searchParams.get("dateStart") || "",
    dateEnd: searchParams.get("dateEnd") || "",
    organizer: searchParams.get("organizer") || "",
    venue: searchParams.get("venue") || "",
  });

  const { events, loading, error, refetch, stats } = useAdminEventsData(filters);

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export events");
  };

  const handleBulkAction = (action: string, eventIds: string[]) => {
    if (action === "delete") {
      setEventIdsToDelete(eventIds);
      setDeleteConfirmOpen(true);
    } else {
      // TODO: Implement other bulk actions
      console.log("Bulk action:", action, "for events:", eventIds);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete events one by one
      for (const eventId of eventIdsToDelete) {
        await eventsApi.deleteEvent(eventId);
      }
      
      toast.success(`${eventIdsToDelete.length} evento(s) excluído(s) com sucesso!`);
      refetch(); // Refresh the events list
    } catch (error) {
      console.error("Error deleting events:", error);
      toast.error("Erro ao excluir evento(s). Tente novamente.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setEventIdsToDelete([]);
    }
  };

  const breadcrumbItems = [
    { label: "Eventos", path: "/admin-v3/eventos" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminV3Breadcrumb items={breadcrumbItems} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os eventos da plataforma
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Exportar
          </Button>
          <Button 
            onClick={() => navigate("/admin-v3/eventos/criar")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.published || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rascunhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.draft || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.thisMonth || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEventFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={clearFilters}
          />
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <AdminEventTable
            events={events}
            loading={loading}
            error={error}
            onRefresh={refetch}
            onBulkAction={handleBulkAction}
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Evento(s)"
        description={`Tem certeza que deseja excluir ${eventIdsToDelete.length} evento(s)? Esta ação não pode ser desfeita.`}
        confirmText={isDeleting ? "Excluindo..." : "Excluir"}
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setEventIdsToDelete([]);
        }}
      />
    </div>
  );
}