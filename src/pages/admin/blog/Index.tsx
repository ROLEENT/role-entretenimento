import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBlogManagement } from '@/hooks/useBlogManagement';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  status: string;
  author_name: string;
  city: string;
  created_at: string;
  reading_time: number;
  views: number;
}

import { withAdminAuth } from '@/components/withAdminAuth';

function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [cities, setCities] = useState<string[]>([]);
  const { loading, getPosts, deletePost } = useBlogManagement();

  useEffect(() => {
    fetchPosts();
    fetchCities();
  }, [statusFilter, cityFilter]);

  const fetchPosts = async () => {
    const data = await getPosts({ status: statusFilter, city: cityFilter });
    setPosts(data);
  };

  const fetchCities = async () => {
    // ... keep existing code (implement fetch cities)
    setCities(['Porto Alegre', 'Florianópolis', 'Curitiba', 'São Paulo', 'Rio de Janeiro']);
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    fetchPosts();
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Agendado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Gerencie artigos e posts do blog
          </p>
        </div>
        <Button asChild>
          <Link to="/admin-v2/blog/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Cidades</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchPosts}>
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum post encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      {getStatusBadge(post.status)}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {post.summary}
                    </p>
                    <div className="text-xs text-muted-foreground flex items-center gap-4">
                      <span>Por {post.author_name}</span>
                      <span>{format(new Date(post.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                      <span>{post.reading_time} min de leitura</span>
                      <span>{post.views || 0} visualizações</span>
                      <span>{post.city}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin-v2/blog/edit/${post.id}`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o post "{post.title}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredPosts.length} de {posts.length} posts
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminBlog, 'editor');