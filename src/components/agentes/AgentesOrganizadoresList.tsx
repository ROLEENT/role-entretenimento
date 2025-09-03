import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Copy, UserX, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Removido: usando sistema unificado de dropdowns
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgentesOrganizadoresListProps {
  search: string;
}

export function AgentesOrganizadoresList({ search }: AgentesOrganizadoresListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  const { data: organizers, isLoading, error } = useQuery({
    queryKey: ["organizers", search, statusFilter, cityFilter],
    queryFn: async () => {
      let query = supabase
        .from("organizers")
        .select("*")
        .order("updated_at", { ascending: false });

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (cityFilter && cityFilter !== "all") {
        query = query.eq("city", cityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: cities } = useQuery({
    queryKey: ["organizer-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizers")
        .select("city")
        .not("city", "is", null);
      
      if (error) throw error;
      
      const uniqueCities = [...new Set(data.map(item => item.city))].filter(Boolean);
      return uniqueCities.sort();
    },
  });

  const handleDuplicate = async (organizer: any) => {
    // TODO: Implementar duplicação
    console.log("Duplicar organizador:", organizer.id);
  };

  const handleDeactivate = async (organizer: any) => {
    // TODO: Implementar inativação
    console.log("Inativar organizador:", organizer.id);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar organizadores</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cities?.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum organizador encontrado
                </TableCell>
              </TableRow>
            ) : (
              organizers?.map((organizer) => (
                <TableRow key={organizer.id}>
                  <TableCell className="font-medium">
                    {organizer.name}
                  </TableCell>
                  <TableCell>
                    {organizer.city || "-"}
                  </TableCell>
                  <TableCell>
                    {organizer.instagram ? (
                      <a 
                        href={`https://instagram.com/${organizer.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{organizer.instagram.replace('@', '')}
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={organizer.status === 'active' ? 'default' : 'secondary'}>
                      {organizer.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(organizer.updated_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="dd" data-dd data-dd-align="right">
                      <Button variant="ghost" size="sm" className="dd-trigger h-8 w-8 p-0" data-dd-trigger aria-label="Ações do organizador">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <div className="dd-menu" data-dd-menu role="menu">
                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border">Ações</div>
                        <Link to={`/admin-v3/agentes/organizadores/${organizer.id}/edit`} role="menuitem">
                          <Edit className="h-4 w-4" />
                          Editar
                        </Link>
                        <button role="menuitem" type="button" onClick={() => handleDuplicate(organizer)}>
                          <Copy className="h-4 w-4" />
                          Duplicar
                        </button>
                        <hr />
                        <button 
                          role="menuitem" 
                          type="button"
                          onClick={() => handleDeactivate(organizer)}
                          style={{ color: 'hsl(var(--destructive))' }}
                        >
                          <UserX className="h-4 w-4" />
                          Inativar
                        </button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {organizers && organizers.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {organizers.length} organizador{organizers.length !== 1 ? 'es' : ''} encontrado{organizers.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}