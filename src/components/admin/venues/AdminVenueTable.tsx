import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit, Copy, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const navigate = useNavigate();
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Local</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Capacidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última Atualização</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
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
                       <div className="font-medium">{venue.name || 'Nome não informado'}</div>
                       <div className="text-sm text-muted-foreground">
                         @{venue.slug || 'sem-slug'}
                       </div>
                     </div>
                  </div>
                </TableCell>
                 <TableCell>
                   <div className="flex items-center gap-1">
                     <MapPin className="h-4 w-4 text-muted-foreground" />
                     {venue.city || 'Cidade não informada'}
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
                  {venue.updated_at 
                    ? new Date(venue.updated_at).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/admin-v3/agentes/venues/${venue.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(venue)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDeactivate(venue)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Desativar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};