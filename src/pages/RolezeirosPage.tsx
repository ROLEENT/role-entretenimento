import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Users, Calendar, Heart } from 'lucide-react';
import { FollowButton } from '@/components/profiles/FollowButton';
import Chip from '@/components/ui/chip';
import { PublicLayout } from '@/components/PublicLayout';

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
  const sentinelRef = useRef<HTMLDivElement | null>(null);
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
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <Helmet>
          <title>Rolezeiros - ROLÊ</title>
          <meta name="description" content="Descubra e conecte-se com outros amantes da vida noturna" />
        </Helmet>

        {/* Header */}
        <header className="grid gap-4">
          <h1 className="text-3xl font-bold">Rolezeiros</h1>
          <p className="text-muted-foreground">Descubra e conecte-se com outros amantes da vida noturna</p>

          {/* Cidades frequentes */}
          <div className="flex flex-wrap gap-2 pt-1">
            {["Porto Alegre", "São Paulo", "Rio de Janeiro", "Florianópolis", "Curitiba"].map(c => (
              <Chip 
                key={c} 
                active={selectedCity === c} 
                onClick={() => setSelectedCity(selectedCity === c ? '' : c)}
              >
                {c}
              </Chip>
            ))}
            {selectedCity && (
              <button 
                className="text-sm underline text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedCity('')}
              >
                Limpar cidade
              </button>
            )}
          </div>
        </header>

        {/* Barra de filtros sticky */}
        <section className="sticky top-2 z-20">
          <div className="rounded-2xl border border-border p-4 md:p-5 bg-card shadow-sm grid gap-3">
            <div className="grid gap-3 md:grid-cols-4">
              {/* Buscar */}
              <label className="md:col-span-2 relative">
                <span className="sr-only">Buscar rolezeiros</span>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar rolezeiros..."
                  className="h-10 w-full rounded-md border border-border bg-background px-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </label>

              {/* Gênero */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos os gêneros</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              {/* Cidade livre */}
              <input
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="Cidade"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Chips de filtros ativos + contagem */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2 text-sm">
                {searchTerm && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Busca: {searchTerm}</span>}
                {selectedGenre && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Gênero: {selectedGenre}</span>}
                {selectedCity && <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Cidade: {selectedCity}</span>}
              </div>
              <div className="flex items-center gap-3">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  {loading ? 'Carregando...' : `${rolezeiros.length} resultado${rolezeiros.length === 1 ? "" : "s"}`}
                </p>
                {(searchTerm || selectedGenre || selectedCity) && (
                  <button 
                    onClick={clearFilters}
                    className="h-8 px-3 rounded-md border border-border text-sm hover:bg-muted"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Skeletons */}
        {loading ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-[3/1] bg-muted" />
                <div className="p-4 grid gap-2">
                  <div className="h-4 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </section>
        ) : rolezeiros.length > 0 ? (
          <>
            {/* Grid de rolezeiros */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rolezeiros.map((rolezeiro) => (
                <div key={rolezeiro.id} className="rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow bg-card">
                  <div className="p-4 space-y-4">
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
                </div>
              ))}
            </section>
            
            {/* Sentinel para possível infinite scroll futuro */}
            <div ref={sentinelRef} className="h-10" />
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20 grid gap-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Nenhum rolezeiro encontrado</h3>
            <p className="text-sm text-muted-foreground">Ajuste filtros ou busque por outro nome.</p>
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={clearFilters}
                className="px-4 py-2 rounded-md border border-border hover:bg-muted"
              >
                Limpar tudo
              </button>
              <Button asChild>
                <a href="/me">Criar Meu Perfil</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}