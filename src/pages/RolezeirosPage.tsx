import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Users, Calendar, Heart, Filter } from 'lucide-react';
import { FollowButton } from '@/components/profiles/FollowButton';

interface Rolezeiro {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  city: string;
  preferred_genres: string[];
  created_at: string;
  stats: {
    saved_events_count: number;
    attendances_count: number;
    following_count: number;
  };
}

export default function RolezeirosPage() {
  const [rolezeiros, setRolezeiros] = useState<Rolezeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    fetchRolezeiros();
    fetchFilters();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRolezeiros();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCity, selectedGenre]);

  const fetchRolezeiros = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('search_rolezeiros_public', {
        p_search_term: searchTerm || null,
        p_city_filter: selectedCity || null,
        p_genre_filter: selectedGenre || null,
        p_limit: 50,
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching rolezeiros:', error);
        return;
      }

      setRolezeiros(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      // Get unique cities
      const { data: citiesData } = await supabase
        .from('users_public')
        .select('city')
        .eq('is_profile_public', true)
        .not('city', 'is', null)
        .not('city', 'eq', '');

      if (citiesData) {
        const uniqueCities = [...new Set(citiesData.map(item => item.city))]
          .filter(Boolean)
          .sort();
        setCities(uniqueCities);
      }

      // Get unique genres
      const { data: genresData } = await supabase
        .from('users_public')
        .select('preferred_genres')
        .eq('is_profile_public', true)
        .not('preferred_genres', 'is', null);

      if (genresData) {
        const allGenres = genresData
          .flatMap(item => item.preferred_genres || [])
          .filter(Boolean);
        const uniqueGenres = [...new Set(allGenres)].sort();
        setGenres(uniqueGenres);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedGenre('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Rolezeiros</h1>
          <p className="text-muted-foreground">
            Descubra e conecte-se com outros amantes da vida noturna
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar rolezeiros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as cidades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os gêneros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os gêneros</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {loading ? 'Carregando...' : `${rolezeiros.length} rolezeiro${rolezeiros.length !== 1 ? 's' : ''} encontrado${rolezeiros.length !== 1 ? 's' : ''}`}
        </div>

        {/* Rolezeiros Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rolezeiros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolezeiros.map((rolezeiro) => (
              <Card key={rolezeiro.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={rolezeiro.avatar_url || ''} />
                        <AvatarFallback>
                          {getInitials(rolezeiro.display_name || rolezeiro.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {rolezeiro.display_name || rolezeiro.username}
                        </h3>
                        {rolezeiro.display_name && (
                          <p className="text-sm text-muted-foreground truncate">
                            @{rolezeiro.username}
                          </p>
                        )}
                        {rolezeiro.city && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">
                              {rolezeiro.city}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {rolezeiro.bio && (
                      <p className="text-sm text-muted-foreground">
                        {truncateText(rolezeiro.bio, 100)}
                      </p>
                    )}

                    {/* Genres */}
                    {rolezeiro.preferred_genres && rolezeiro.preferred_genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rolezeiro.preferred_genres.slice(0, 3).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {rolezeiro.preferred_genres.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{rolezeiro.preferred_genres.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{rolezeiro.stats?.saved_events_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{rolezeiro.stats?.attendances_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{rolezeiro.stats?.following_count || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={`/u/${rolezeiro.username}`}>
                          Ver Perfil
                        </a>
                      </Button>
                      <FollowButton profileId={rolezeiro.user_id} size="sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum rolezeiro encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou criar seu próprio perfil público.
              </p>
              <Button asChild>
                <a href="/me">Criar Meu Perfil</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}