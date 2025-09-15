import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RowActions } from '@/components/admin/common/RowActions';

interface Organizer {
  id: string;
  name: string;
  type?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  instagram?: string;
  status: string;
  bio_short?: string;
  updated_at: string;
  avatar_url?: string;
}

interface AdminOrganizerTableProps {
  organizers: Organizer[];
  onDuplicate: (organizerId: string) => void;
  onStatusChange: (organizerId: string, status: string) => void;
  onDelete: (organizerId: string) => void;
  isLoading?: boolean;
}

export const AdminOrganizerTable: React.FC<AdminOrganizerTableProps> = ({
  organizers,
  onDuplicate,
  onStatusChange,
  onDelete,
  isLoading = false
}) => {
  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  const getOrganizerTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: string }> = {
      organizador: { label: 'Organizador', variant: 'outline' },
      produtora: { label: 'Produtora', variant: 'secondary' },
      coletivo: { label: 'Coletivo', variant: 'default' },
      selo: { label: 'Selo', variant: 'destructive' },
    };

    const typeInfo = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={typeInfo.variant as any}>{typeInfo.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (organizers.length === 0) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organizador</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {isLoading ? 'Carregando organizadores...' : 'Nenhum organizador encontrado'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organizador</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Atualizado</TableHead>
            <TableHead className="w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizers.map((organizer) => (
            <TableRow key={organizer.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={organizer.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(organizer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{organizer.name}</span>
                    {organizer.bio_short && (
                      <span className="text-sm text-muted-foreground truncate max-w-48">
                        {organizer.bio_short}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {organizer.type ? getOrganizerTypeBadge(organizer.type) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-1">
                  {organizer.contact_email && (
                    <span className="text-sm">{organizer.contact_email}</span>
                  )}
                  {organizer.contact_whatsapp && (
                    <span className="text-sm text-muted-foreground">{organizer.contact_whatsapp}</span>
                  )}
                  {!organizer.contact_email && !organizer.contact_whatsapp && (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(organizer.status)}
              </TableCell>
              
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(organizer.updated_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </TableCell>
              
              <TableCell>
                <RowActions
                  entity="organizers"
                  id={organizer.id}
                  name={organizer.name}
                  instagram={organizer.instagram}
                  editPath={`/admin-v3/organizadores/${organizer.id}`}
                  viewPath={`/admin-v3/agentes/organizadores/${organizer.id}`}
                  onDuplicate={onDuplicate}
                  onStatusChange={onStatusChange}
                  onAfterDelete={() => onDelete(organizer.id)}
                  isLoading={isLoading}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};