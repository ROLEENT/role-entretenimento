import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, MessageCircle } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard';
import { CompanionRequestCard } from '@/components/CompanionRequestCard';
import { useGroups } from '@/hooks/useGroups';
import { useEventCompanions } from '@/hooks/useEventCompanions';
import { Helmet } from 'react-helmet';

const CITIES = ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Porto Alegre', 'Florianópolis'];
const CATEGORIES = ['Jazz', 'Rock', 'MPB', 'Teatro', 'Eletrônica', 'Pop', 'Indie', 'Clássica'];

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState('explore');

  const { 
    groups, 
    userGroups, 
    loading: groupsLoading, 
    fetchGroups, 
    joinGroup, 
    leaveGroup 
  } = useGroups();

  const { 
    companionRequests, 
    loading: companionsLoading 
  } = useEventCompanions();

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || group.city === selectedCity;
    const matchesCategory = !selectedCategory || group.category === selectedCategory;
    
    return matchesSearch && matchesCity && matchesCategory;
  });

  const handleSearch = () => {
    fetchGroups(selectedCity || undefined, selectedCategory || undefined);
  };

  useEffect(() => {
    handleSearch();
  }, [selectedCity, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Grupos & Companhias - ROLÊ</title>
        <meta name="description" content="Encontre grupos com interesses similares ou procure companhia para eventos culturais no ROLÊ." />
      </Helmet>
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Grupos e Comunidades</h1>
          <p className="text-muted-foreground">
            Conecte-se com pessoas que compartilham suas paixões musicais e culturais
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="explore">Explorar Grupos</TabsTrigger>
            <TabsTrigger value="my-groups">Meus Grupos</TabsTrigger>
            <TabsTrigger value="companions">Procuro Companhia</TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Encontrar Grupos</CardTitle>
                <CardDescription>
                  Use os filtros para encontrar grupos de seu interesse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Buscar grupos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="col-span-1 md:col-span-2"
                  />
                  
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as cidades</SelectItem>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Grupos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredGroups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhum grupo encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou criar um novo grupo
                  </p>
                </div>
              ) : (
                filteredGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={joinGroup}
                    onLeave={leaveGroup}
                    loading={groupsLoading}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-groups" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Meus Grupos</h2>
                <p className="text-muted-foreground">
                  Grupos dos quais você faz parte
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Grupo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Você ainda não faz parte de nenhum grupo</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore grupos interessantes e faça parte da comunidade
                  </p>
                  <Button onClick={() => setActiveTab('explore')}>
                    Explorar Grupos
                  </Button>
                </div>
              ) : (
                userGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onLeave={leaveGroup}
                    loading={groupsLoading}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="companions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Procuro Companhia</h2>
                <p className="text-muted-foreground">
                  Encontre pessoas para ir a eventos juntos
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Pedido
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companionsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : companionRequests.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhum pedido de companhia no momento</h3>
                  <p className="text-muted-foreground">
                    Seja o primeiro a procurar companhia para um evento
                  </p>
                </div>
              ) : (
                companionRequests.map(request => (
                  <CompanionRequestCard
                    key={request.id}
                    request={request}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}