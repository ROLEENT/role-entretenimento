import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EventFilters {
  search?: string;
  status?: string;
  city?: string;
  dateStart?: string;
  dateEnd?: string;
  organizer?: string;
  venue?: string;
  completion?: string;
}

interface AdminEventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
}

export function AdminEventFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: AdminEventFiltersProps) {
  // Fetch organizers for filter
  const { data: organizers = [] } = useQuery({
    queryKey: ["organizers-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizers")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch venues for filter
  const { data: venues = [] } = useQuery({
    queryKey: ["venues-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const updateFilter = (key: keyof EventFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Título ou descrição..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={filters.status || ""} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            placeholder="Nome da cidade..."
            value={filters.city || ""}
            onChange={(e) => updateFilter("city", e.target.value)}
          />
        </div>

        {/* Organizer */}
        <div className="space-y-2">
          <Label>Organizador</Label>
          <Select value={filters.organizer || ""} onValueChange={(value) => updateFilter("organizer", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos organizadores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {organizers.map((organizer) => (
                <SelectItem key={organizer.id} value={organizer.id}>
                  {organizer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Start */}
        <div className="space-y-2">
          <Label htmlFor="dateStart">Data de Início</Label>
          <Input
            id="dateStart"
            type="date"
            value={filters.dateStart || ""}
            onChange={(e) => updateFilter("dateStart", e.target.value)}
          />
        </div>

        {/* Date End */}
        <div className="space-y-2">
          <Label htmlFor="dateEnd">Data de Fim</Label>
          <Input
            id="dateEnd"
            type="date"
            value={filters.dateEnd || ""}
            onChange={(e) => updateFilter("dateEnd", e.target.value)}
          />
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label>Local</Label>
          <Select value={filters.venue || ""} onValueChange={(value) => updateFilter("venue", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os locais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Completion */}
        <div className="space-y-2">
          <Label>Completude</Label>
          <Select value={filters.completion || ""} onValueChange={(value) => updateFilter("completion", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os níveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="complete">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Completo
                </div>
              </SelectItem>
              <SelectItem value="good">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Bom
                </div>
              </SelectItem>
              <SelectItem value="incomplete">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Incompleto
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}