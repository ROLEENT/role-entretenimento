import React from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Edit, Eye, Copy, Trash2, Calendar, FileText } from 'lucide-react';
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

interface AdminBlogTableProps {
  posts: any[];
  onDuplicate: (post: any) => void;
  onDelete: (post: any) => void;
}

export const AdminBlogTable: React.FC<AdminBlogTableProps> = ({
  posts,
  onDuplicate,
  onDelete,
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'scheduled': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'scheduled': return 'Agendado';
      default: return status;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Post</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Visualizações</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum post encontrado</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            posts?.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={post.cover_image} 
                        alt={post.cover_alt || post.title}
                      />
                      <AvatarFallback>
                        {post.title?.charAt(0)?.toUpperCase() || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium line-clamp-1">{post.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {post.summary}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.author?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {post.author_name?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{post.author_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(post.status)}>
                    {getStatusLabel(post.status)}
                  </Badge>
                  {post.featured && (
                    <Badge variant="outline" className="ml-1">Destaque</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    {post.views || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {post.published_at 
                      ? new Date(post.published_at).toLocaleDateString('pt-BR')
                      : new Date(post.created_at).toLocaleDateString('pt-BR')
                    }
                  </div>
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
                      <DropdownMenuItem asChild>
                        <Link to={`/revista/${post.slug_data || post.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin-v3/revista/${post.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(post)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(post)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
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