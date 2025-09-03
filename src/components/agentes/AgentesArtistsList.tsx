import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Edit, Copy, UserX, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Removido: usando sistema unificado de dropdowns
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgentesArtistsListProps {
  search: string;
}

export function AgentesArtistsList({ search }: AgentesArtistsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  const { data: artists, isLoading, error } = useQuery({
    queryKey: ["artists", search, statusFilter, cityFilter],
    queryFn: async () => {
      let query = supabase
        .from("artists")
        .select("*")
        .order("updated_at", { ascending: false });

      if (search) {
        query = query.ilike("stage_name", `%${search}%`);
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
    queryKey: ["artist-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("city")
        .not("city", "is", null);
      
      if (error) throw error;
      
      const uniqueCities = [...new Set(data.map(item => item.city))].filter(Boolean);
      return uniqueCities.sort();
    },
  });

  const handleDuplicate = async (artist: any) => {
    // TODO: Implementar duplicação
    console.log("Duplicar artista:", artist.id);
  };

  const handleDeactivate = async (artist: any) => {
    // TODO: Implementar inativação
    console.log("Inativar artista:", artist.id);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar artistas</p>
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
            {artists?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum artista encontrado
                </TableCell>
              </TableRow>
            ) : (
              artists?.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">
                    {artist.stage_name}
                  </TableCell>
                  <TableCell>
                    {artist.city || "-"}
                  </TableCell>
                  <TableCell>
                    {artist.instagram ? (
                      <a 
                        href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{artist.instagram.replace('@', '')}
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={artist.status === 'active' ? 'default' : 'secondary'}>
                      {artist.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(artist.updated_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="dd" data-dd data-dd-align="right">
                      <Button variant="ghost" size="sm" className="dd-trigger" data-dd-trigger aria-label="Ações do artista">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <div className="dd-menu" data-dd-menu role="menu">
                        <Link to={`/admin-v3/agentes/artistas/${artist.id}/edit`} role="menuitem">
                          <Edit className="h-4 w-4" />
                          Editar
                        </Link>
                        <button role="menuitem" type="button" onClick={() => handleDuplicate(artist)}>
                          <Copy className="h-4 w-4" />
                          Duplicar
                        </button>
                        <button 
                          role="menuitem" 
                          type="button"
                          onClick={() => handleDeactivate(artist)}
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

      {artists && artists.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {artists.length} artista{artists.length !== 1 ? 's' : ''} encontrado{artists.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}