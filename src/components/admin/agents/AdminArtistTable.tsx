import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Copy, UserX, MoreHorizontal, Eye, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    <DropdownMenuItem asChild>
                      <Link to={`/admin-v3/agentes/artistas/${artist.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to={`/admin-v3/agentes/artistas/${artist.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => onDuplicate(artist.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(
                        artist.id, 
                        artist.status === 'active' ? 'inactive' : 'active'
                      )}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      {artist.status === 'active' ? 'Inativar' : 'Ativar'}
                    </DropdownMenuItem>
                    
                    {artist.instagram && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a 
                            href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Instagram
                          </a>
                        </DropdownMenuItem>
                      </>
                     )}
                     
                     <DropdownMenuSeparator />
                     
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <DropdownMenuItem 
                           onSelect={(e) => e.preventDefault()}
                           className="text-destructive focus:text-destructive focus:bg-destructive/10"
                           data-testid="artist-delete"
                         >
                           <Trash2 className="mr-2 h-4 w-4" />
                           Excluir
                         </DropdownMenuItem>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Excluir artista?</AlertDialogTitle>
                           <AlertDialogDescription>
                             Tem certeza que deseja excluir o artista "{artist.stage_name}"? 
                             Esta ação não pode ser desfeita.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancelar</AlertDialogCancel>
                         <AlertDialogAction 
                           onClick={() => {
                             console.log('Deleting artist:', artist.id, artist.stage_name);
                             onDelete(artist.id);
                           }}
                           className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                         >
                           Excluir
                         </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};