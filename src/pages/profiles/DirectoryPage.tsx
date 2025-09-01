import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import ProfileCard from "@/features/profiles/ProfileCard";
import { ProfileType } from "@/features/profiles/api";

export default function DirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [q, setQ] = useState(searchParams.get('q') || "");
  const [type, setType] = useState<ProfileType | "">(searchParams.get('type') as ProfileType || "");
  const [city, setCity] = useState(searchParams.get('city') || "");
  const [offset, setOffset] = useState(0);

  const filters = useMemo(() => ({
    q: q || undefined,
    type: type || undefined,
    city: city || undefined,
    limit: 24,
    offset,
  }), [q, type, city, offset]);

  const { data, isLoading, error } = useProfiles(filters);
  const profiles = data?.data || [];
  const total = data?.total || 0;

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('type', type);
    if (city) params.set('city', city);
    setSearchParams(params);
    setOffset(0);
  };

  const typeLabels = {
    artista: "Artistas",
    local: "Locais", 
    organizador: "Organizadores"
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Helmet>
          <title>Diretório de Perfis - ROLÊ</title>
          <meta name="description" content="Encontre artistas, locais e organizadores de eventos na sua cidade" />
        </Helmet>
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Diretório de Perfis</h1>
          <p className="text-xl text-muted-foreground">
            Descubra artistas, locais e organizadores de eventos
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar por nome</label>
                <Input
                  placeholder="Nome do perfil..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateSearchParams()}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={type} onValueChange={(value) => setType(value as ProfileType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="artista">Artistas</SelectItem>
                    <SelectItem value="local">Locais</SelectItem>
                    <SelectItem value="organizador">Organizadores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <Input
                  placeholder="Nome da cidade..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateSearchParams()}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium invisible">Buscar</label>
                <Button onClick={updateSearchParams} className="w-full">
                  Buscar
                </Button>
              </div>
            </div>
            
            {/* Results count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total} resultado{total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}
              </p>
              
              {/* Active filters */}
              <div className="flex gap-2">
                {type && (
                  <Badge variant="secondary">
                    {typeLabels[type]}
                  </Badge>
                )}
                {city && (
                  <Badge variant="secondary">
                    {city}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && offset === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar perfis</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum perfil encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tente ajustar os filtros ou criar um novo perfil
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} p={profile} />
              ))}
            </div>
            
            {/* Load more */}
            {profiles.length < total && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setOffset(prev => prev + 24)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Carregando...
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}