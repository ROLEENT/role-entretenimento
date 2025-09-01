import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Search, User, MapPin, Building } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

interface Profile {
  user_id: string;
  handle: string;
  name: string;
  type: 'artista' | 'local' | 'organizador';
  city: string;
  state: string;
  bio_short?: string;
  tags?: string[];
  verified: boolean;
  avatar_url?: string;
}

export function ProfileTestingPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['profiles-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, handle, name, type, city, state, bio_short, tags, verified, avatar_url')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    }
  });

  const filteredProfiles = profiles?.filter(profile => 
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'artista': return <User className="h-4 w-4" />;
      case 'local': return <Building className="h-4 w-4" />;
      case 'organizador': return <MapPin className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'artista': return 'bg-blue-100 text-blue-800';
      case 'local': return 'bg-green-100 text-green-800';
      case 'organizador': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Erro ao carregar perfis para teste" />;

  const stats = {
    total: profiles?.length || 0,
    artistas: profiles?.filter(p => p.type === 'artista').length || 0,
    locais: profiles?.filter(p => p.type === 'local').length || 0,
    organizadores: profiles?.filter(p => p.type === 'organizador').length || 0,
    verificados: profiles?.filter(p => p.verified).length || 0
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Painel de Testes - Perfis</h1>
        <p className="text-muted-foreground">
          Teste o fluxo completo de descoberta, visualização e reivindicação de perfis
        </p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total de Perfis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.artistas}</p>
            <p className="text-sm text-muted-foreground">Artistas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.locais}</p>
            <p className="text-sm text-muted-foreground">Locais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.organizadores}</p>
            <p className="text-sm text-muted-foreground">Organizadores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.verificados}</p>
            <p className="text-sm text-muted-foreground">Verificados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, handle ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Test Actions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold mb-2">🧪 Fluxos de Teste Disponíveis</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/claim-profile')}
            className="flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Testar Reivindicação</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/profiles')}
            className="flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Explorar Perfis</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Painel Admin</span>
          </Button>
        </div>
      </div>

      {/* Profiles List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Perfis Disponíveis {searchTerm && `(${filteredProfiles?.length} encontrados)`}
        </h2>
        
        {filteredProfiles?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum perfil encontrado com os critérios de busca' : 'Nenhum perfil disponível'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles?.map((profile) => (
              <Card key={profile.user_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(profile.type)}
                      <span className="font-semibold">@{profile.handle}</span>
                    </div>
                    {profile.verified && (
                      <Badge variant="default" className="text-xs">Verificado</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{profile.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className={getTypeColor(profile.type)}>
                      {profile.type}
                    </Badge>
                    
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {profile.city}, {profile.state}
                    </p>
                    
                    {profile.bio_short && (
                      <p className="text-sm line-clamp-2">{profile.bio_short}</p>
                    )}
                    
                    {profile.tags && profile.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {profile.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/profile/${profile.handle}`)}
                        className="flex-1"
                      >
                        Ver Perfil
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/claim-profile?handle=${profile.handle}`)}
                      >
                        Reivindicar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}