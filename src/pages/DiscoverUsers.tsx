import { useState } from 'react';
import { Search, Users, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCard } from '@/components/UserCard';
import { UserSearchDialog } from '@/components/UserSearchDialog';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useDiscoverUsers } from '@/hooks/useDiscoverUsers';
import { useFollow } from '@/hooks/useFollow';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Skeleton } from '@/components/ui/skeleton';

const DiscoverUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  
  const { results: searchResults, loading: searchLoading, searchUsers } = useUserSearch();
  const { 
    suggestedUsers, 
    popularUsers, 
    nearbyUsers, 
    loading: discoverLoading 
  } = useDiscoverUsers(selectedCity);
  
  const { toggleFollow } = useFollow();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchUsers(value);
    }
  };

  const cities = [
    'São Paulo',
    'Rio de Janeiro', 
    'Belo Horizonte',
    'Porto Alegre',
    'Curitiba',
    'Florianópolis'
  ];

  const UserCardSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEOHead 
        title="Descobrir Usuários - ROLÊ" 
        description="Encontre pessoas incríveis para seguir e compartilhar experiências culturais. Descubra usuários da sua cidade e com interesses similares."
        tags={["descobrir usuários", "seguir pessoas", "rede social cultural", "eventos sociais"]}
      />
      
      <Header />
      
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold text-foreground">
                Descobrir Usuários
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre pessoas incríveis para seguir e compartilhar experiências culturais únicas
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Usuários
              </CardTitle>
              <CardDescription>
                Procure por nome de usuário ou explore nossas sugestões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Digite o nome de usuário..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as cidades</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => setSearchDialogOpen(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Busca Avançada
                </Button>
              </div>

              {/* Search Results */}
              {searchTerm && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Resultados da Busca</h3>
                  {searchLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <UserCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((user) => (
                        <UserCard
                          key={user.user_id}
                          user={user}
                          showFollowButton
                          onToggleFollow={() => toggleFollow()}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum usuário encontrado para "{searchTerm}"
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discover Tabs */}
          <Tabs defaultValue="suggested" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggested" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Sugeridos
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Populares
              </TabsTrigger>
              <TabsTrigger value="nearby" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Próximos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggested">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Sugeridos</CardTitle>
                  <CardDescription>
                    Baseado nos seus interesses e atividades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {discoverLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <UserCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : suggestedUsers.length > 0 ? (
                    <div className="space-y-4">
                      {suggestedUsers.map((user) => (
                        <UserCard
                          key={user.user_id}
                          user={user}
                          showFollowButton
                          onToggleFollow={() => toggleFollow()}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma sugestão disponível no momento
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="popular">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Populares</CardTitle>
                  <CardDescription>
                    Os mais seguidos da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {discoverLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <UserCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : popularUsers.length > 0 ? (
                    <div className="space-y-4">
                      {popularUsers.map((user) => (
                        <UserCard
                          key={user.user_id}
                          user={user}
                          showFollowButton
                          onToggleFollow={() => toggleFollow()}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum usuário popular encontrado
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nearby">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Próximos</CardTitle>
                  <CardDescription>
                    {selectedCity ? `Da sua cidade: ${selectedCity}` : 'Selecione uma cidade para ver usuários próximos'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedCity ? (
                    <p className="text-muted-foreground text-center py-8">
                      Selecione uma cidade acima para descobrir usuários próximos
                    </p>
                  ) : discoverLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <UserCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : nearbyUsers.length > 0 ? (
                    <div className="space-y-4">
                      {nearbyUsers.map((user) => (
                        <UserCard
                          key={user.user_id}
                          user={user}
                          showFollowButton
                          onToggleFollow={() => toggleFollow()}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum usuário encontrado em {selectedCity}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Advanced Search Dialog */}
        {searchDialogOpen && (
          <UserSearchDialog>
            <Button 
              variant="outline" 
              onClick={() => setSearchDialogOpen(false)}
              className="hidden"
            >
              Fechar
            </Button>
          </UserSearchDialog>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default DiscoverUsers;