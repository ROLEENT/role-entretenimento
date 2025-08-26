import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Edit, Eye, Calendar, MapPin, User, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  city: string;
  author_name: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  scheduled_at: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  cover_image: string;
  summary: string;
  reading_time: number;
  featured: boolean;
}

const AdminBlogPostsHistory = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  const cities = ['Porto Alegre', 'Florianópolis', 'Curitiba', 'São Paulo', 'Rio de Janeiro'];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (cityFilter !== 'all') {
        query = query.eq('city', cityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, cityFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary' as const, label: 'Rascunho' },
      published: { variant: 'default' as const, label: 'Publicado' },
      scheduled: { variant: 'outline' as const, label: 'Agendado' }
    };
    
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (postId: string) => {
    navigate(`/admin/posts/edit/${postId}`);
  };

  const handleView = (slug: string) => {
    window.open(`/blog/${slug}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Histórico de Posts do Blog</h1>
                <p className="text-muted-foreground">
                  Gerencie e visualize todos os posts publicados no blog
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/admin/posts/new')}>
              <FileText className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-lg">Carregando posts...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const statusInfo = getStatusBadge(post.status);
              
              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {post.cover_image && (
                        <div className="w-full md:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={post.cover_image} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {post.summary}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(post.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {post.status === 'published' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(post.slug)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.author_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{post.city}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views} visualizações</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.reading_time} min de leitura</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge {...statusInfo}>
                            {statusInfo.label}
                          </Badge>
                          
                          {post.featured && (
                            <Badge variant="outline">
                              Destaque
                            </Badge>
                          )}

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {post.status === 'published' && post.published_at ? (
                              <span>Publicado em {format(new Date(post.published_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            ) : post.status === 'scheduled' && post.scheduled_at ? (
                              <span>Agendado para {format(new Date(post.scheduled_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                            ) : (
                              <span>Criado em {format(new Date(post.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum post encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || cityFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando seu primeiro post'
              }
            </p>
            <Button onClick={() => navigate('/admin/posts/new')}>
              <FileText className="h-4 w-4 mr-2" />
              Criar Post
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminBlogPostsHistory;