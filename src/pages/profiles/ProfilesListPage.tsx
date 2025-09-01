import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileCard } from '@/components/profiles/ProfileCard';
import { useProfiles, type ProfileType, type Profile } from '@/hooks/useProfiles';
import { Plus, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilesListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProfileType | 'all'>('all');
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  
  const { profiles, loading, listProfiles } = useProfiles();

  useEffect(() => {
    listProfiles();
  }, [listProfiles]);

  useEffect(() => {
    let filtered = profiles;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(profile => profile.type === typeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(term) ||
        profile.handle.toLowerCase().includes(term) ||
        profile.bio?.toLowerCase().includes(term) ||
        profile.location?.toLowerCase().includes(term)
      );
    }

    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, typeFilter]);

  const handleViewProfile = (profile: Profile) => {
    window.open(`/perfil/${profile.handle}`, '_blank');
  };

  const handleEditProfile = (profile: Profile) => {
    window.open(`/perfil/${profile.handle}/editar`, '_blank');
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Perfis</h1>
            <p className="text-muted-foreground">Gerencie os perfis da plataforma</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Perfis</h1>
          <p className="text-muted-foreground">
            {filteredProfiles.length} {filteredProfiles.length === 1 ? 'perfil encontrado' : 'perfis encontrados'}
          </p>
        </div>
        
        <Button asChild>
          <Link to="/perfis/criar">
            <Plus className="h-4 w-4 mr-2" />
            Novo Perfil
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, handle, bio ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ProfileType | 'all')}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="artist">Artistas</SelectItem>
            <SelectItem value="venue">Locais</SelectItem>
            <SelectItem value="organizer">Organizadores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum perfil encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Ainda não há perfis cadastrados'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <Button asChild>
                <Link to="/perfis/criar">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Perfil
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onView={handleViewProfile}
              onEdit={handleEditProfile}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}