import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Copy, UserX, MoreHorizontal, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// Removido: usando sistema unificado de dropdowns
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Artist {
  id: string;
  stage_name: string;
  name: string;
  artist_type: string;
  city: string | null;
  instagram: string | null;
  status: string;
  profile_image_url: string | null;
  updated_at: string;
  bio_short: string | null;
}

interface AdminArtistTableProps {
  artists: Artist[];
  onDuplicate: (artistId: string) => void;
  onStatusChange: (artistId: string, status: string) => void;
  onDelete: (artistId: string) => void;
  isLoading?: boolean;
}

export const AdminArtistTable: React.FC<AdminArtistTableProps> = ({
  artists,
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

  const getArtistTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: string }> = {
      banda: { label: 'Banda', variant: 'outline' },
      dj: { label: 'DJ', variant: 'secondary' },
      solo: { label: 'Solo', variant: 'default' },
      drag: { label: 'Drag', variant: 'destructive' },
      dupla: { label: 'Dupla', variant: 'outline' },
      grupo: { label: 'Grupo', variant: 'secondary' },
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

  if (artists.length === 0) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artista</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {isLoading ? 'Carregando artistas...' : 'Nenhum artista encontrado'}
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
            <TableHead>Artista</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Atualizado</TableHead>
            <TableHead className="w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists.map((artist) => (
            <TableRow key={artist.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={artist.profile_image_url || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(artist.stage_name || artist.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{artist.stage_name}</span>
                    {artist.bio_short && (
                      <span className="text-sm text-muted-foreground truncate max-w-48">
                        {artist.bio_short}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {getArtistTypeBadge(artist.artist_type)}
              </TableCell>
              
              <TableCell>
                {artist.city || (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              
              <TableCell>
                {getStatusBadge(artist.status)}
              </TableCell>
              
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(artist.updated_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </TableCell>
              
               <TableCell>
                <div className="dd" data-dd data-dd-align="right">
                  <Button variant="ghost" size="sm" className="dd-trigger" data-dd-trigger aria-label="Ações">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <div className="dd-menu" data-dd-menu role="menu">
                    <Link to={`/admin-v3/agentes/artistas/${artist.id}/edit`} role="menuitem">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Link>
                    
                    <Link to={`/admin-v3/agentes/artistas/${artist.id}`} role="menuitem">
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Link>
                    
                    <hr />
                    
                    <button role="menuitem" type="button" onClick={() => onDuplicate(artist.id)}>
                      <Copy className="h-4 w-4" />
                      Duplicar
                    </button>
                    
                    <button 
                      role="menuitem"
                      type="button"
                      onClick={() => onStatusChange(
                        artist.id, 
                        artist.status === 'active' ? 'inactive' : 'active'
                      )}
                    >
                      <UserX className="h-4 w-4" />
                      {artist.status === 'active' ? 'Inativar' : 'Ativar'}
                    </button>
                    
                    {artist.instagram && (
                      <>
                        <hr />
                        <a 
                          href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          role="menuitem"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver Instagram
                        </a>
                      </>
                    )}
                    
                    <hr />
                    <button 
                      role="menuitem"
                      type="button"
                      onClick={() => onDelete(artist.id)}
                      style={{ color: 'hsl(var(--destructive))' }}
                    >
                      <UserX className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};