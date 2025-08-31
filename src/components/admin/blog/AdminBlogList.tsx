import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { useAdminBlogPosts } from '@/hooks/useAdminBlogPosts';
import { Search, Plus, Edit, Copy, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { CITY_OPTIONS, STATUS_OPTIONS, clean, getCityLabel, getStatusLabel } from '@/lib/constants';

const STATUS_COLORS = {
  rascunho: 'secondary',
  agendado: 'default',
  publicado: 'default'
} as const;

export function AdminBlogList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { posts, isLoading, deletePost, duplicatePost } = useAdminBlogPosts({
    searchTerm,
    cityFilter,
    statusFilter
  });

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
  };

  const handleDuplicate = async (post: any) => {
    await duplicatePost(post);
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'secondary'}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminV3Header />
      <div className="pt-16 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <AdminV3Breadcrumb 
            items={[
              { label: 'Revista' }
            ]} 
          />
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Revista - Artigos</h1>
              <p className="text-muted-foreground">Gerencie os artigos da revista</p>
            </div>
            <Button asChild>
              <Link to="/admin-v3/revista/novo">
                <Plus className="w-4 h-4 mr-2" />
                Novo Artigo
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por título ou slug..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={cityFilter ?? ""} onValueChange={(value) => setCityFilter(value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {clean([...CITY_OPTIONS]).map(option => (
                      <SelectItem key={option} value={option}>
                        {getCityLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter ?? ""} onValueChange={(value) => setStatusFilter(value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    {clean([...STATUS_OPTIONS]).map(option => (
                      <SelectItem key={option} value={option}>
                        {getStatusLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Articles Table */}
          <Card>
            <CardHeader>
              <CardTitle>{posts.length} artigo{posts.length !== 1 ? 's' : ''}</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum artigo encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Visualizações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{post.title}</p>
                            <p className="text-sm text-muted-foreground">/{post.slug_data}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{post.city.replace('-', ' ')}</TableCell>
                        <TableCell>{getStatusBadge(post.status)}</TableCell>
                        <TableCell>{post.author_name}</TableCell>
                        <TableCell>
                          {post.published_at 
                            ? format(new Date(post.published_at), "dd/MM/yyyy", { locale: ptBR })
                            : format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })
                          }
                        </TableCell>
                        <TableCell>{post.views}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {post.status === 'published' && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/revista/${post.slug_data}`} target="_blank">
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                            )}
                            
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin-v3/revista/${post.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDuplicate(post)}
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Excluir">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir artigo</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir "{post.title}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(post.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}