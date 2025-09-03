import React from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Edit, Copy, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Removido: usando sistema unificado de dropdowns
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VenueCompletionBadge } from '@/components/admin/common/CompletionBadgeList';

interface AdminVenueTableProps {
  venues: any[];
  onDuplicate: (venue: any) => void;
  onDeactivate: (venue: any) => void;
}

export const AdminVenueTable: React.FC<AdminVenueTableProps> = ({
  venues,
  onDuplicate,
  onDeactivate,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Local</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Capacidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Última Atualização</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum local encontrado</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            venues?.map((venue) => (
              <TableRow key={venue.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={venue.cover_url} 
                        alt={venue.cover_alt || venue.name}
                      />
                      <AvatarFallback>
                        {venue.name?.charAt(0)?.toUpperCase() || 'L'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{venue.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{venue.slug}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {venue.city || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  {venue.capacity ? `${venue.capacity} pessoas` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={venue.status === 'active' ? 'default' : 'secondary'}>
                    {venue.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <VenueCompletionBadge venue={venue} />
                </TableCell>
                <TableCell>
                  {venue.updated_at 
                    ? new Date(venue.updated_at).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="dd" data-dd data-dd-align="right">
                    <Button variant="ghost" className="h-8 w-8 p-0 dd-trigger" data-dd-trigger aria-label="Ações do local">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <div className="dd-menu" data-dd-menu role="menu">
                      <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border">Ações</div>
                      <Link to={`/admin-v3/agentes/venues/${venue.id}/edit`} role="menuitem">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Link>
                      <button role="menuitem" type="button" onClick={() => onDuplicate(venue)}>
                        <Copy className="h-4 w-4" />
                        Duplicar
                      </button>
                      <hr />
                      <button 
                        role="menuitem" 
                        type="button"
                        onClick={() => onDeactivate(venue)}
                        style={{ color: 'hsl(var(--destructive))' }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Desativar
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
  );
};