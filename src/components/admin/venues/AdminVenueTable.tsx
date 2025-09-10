import React from 'react';
import { MapPin } from 'lucide-react';
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
import { RowActions } from '@/components/admin/common/RowActions';

interface AdminVenueTableProps {
  venues: any[];
  onDuplicate: (venue: any) => void;
  onStatusChange: (venueId: string, status: string) => void;
  onDelete: (venueId: string) => void;
  isLoading?: boolean;
}

export const AdminVenueTable: React.FC<AdminVenueTableProps> = ({
  venues,
  onDuplicate,
  onStatusChange,
  onDelete,
  isLoading = false,
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
                  <RowActions
                    entity="venues"
                    id={venue.id}
                    name={venue.name}
                    instagram={venue.instagram}
                    editPath={`/admin-v3/agentes/venues/${venue.id}/edit`}
                    viewPath={`/admin-v3/agentes/venues/${venue.id}`}
                    onDuplicate={(id) => onDuplicate(venue)}
                    onStatusChange={onStatusChange}
                    onAfterDelete={() => onDelete(venue.id)}
                    isLoading={isLoading}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};