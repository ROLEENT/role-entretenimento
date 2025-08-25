import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Music, Headphones, Play, Pause, Plus, Settings, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useMusicDiscovery } from '@/hooks/useMusicDiscovery';
import { usePlaylistManager } from '@/hooks/usePlaylistManager';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import SEOHead from '@/components/SEOHead';

const MusicPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('evento');
  const eventTitle = searchParams.get('titulo');
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(eventId);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);

  const { 
    isConnected, 
    loading: authLoading, 
    profile, 
    connect, 
    disconnect 
  } = useSpotifyAuth();

  const { 
    artists, 
    loading: discoveryLoading,
    currentTrack,
    isPlaying,
    discoverFromEvent,
    playPreview,
    stopPreview,
    getEventArtists
  } = useMusicDiscovery();

  const { 
    playlists, 
    loading: playlistLoading,
    creating,
    generateFromFavorites,
    getPlaylistsByType
  } = usePlaylistManager();

  const { favorites } = useFavorites();

  useEffect(() => {
    if (eventId && eventTitle) {
      // Descobrir artistas do evento específico
      discoverFromEvent(decodeURIComponent(eventTitle), eventId);
    } else if (isConnected) {
      // Carregar dados gerais do usuário conectado
      loadUserMusicData();
    }
  }, [eventId, eventTitle, isConnected]);

  const loadUserMusicData = async () => {
    // Carregar artistas dos eventos favoritos
    if (favorites.length > 0) {
      for (const favorite of favorites.slice(0, 3)) {
        await getEventArtists(favorite.id);
      }
    }
  };

  const handleConnectSpotify = () => {
    connect();
  };

  const handleGeneratePlaylist = async () => {
    if (!isConnected) {
      toast.error('Conecte-se ao Spotify primeiro');
      return;
    }

    await generateFromFavorites();
  };

  const handlePlayTrack = (track: any) => {
    playPreview(track);
    setShowPlayer(true);
  };

  const allTracks = artists.flatMap(artist => 
    artist.preview_tracks.map(track => ({
      ...track,
      artist: artist.artist_name,
      image_url: artist.image_url
    }))
  ).filter(track => track.preview_url);

  const favoritePlaylists = getPlaylistsByType('favorites');
  const customPlaylists = getPlaylistsByType('custom');

  return (
    <>
      <SEOHead 
        title="Música | ROLÊ - Descubra a trilha sonora dos seus eventos"
        description="Conecte-se ao Spotify e descubra a música dos seus eventos favoritos. Crie playlists automáticas e ouça previews dos artistas."
      />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Central de Música</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubra a trilha sonora dos seus eventos, crie playlists automáticas e conecte-se com a música dos artistas que você ama.
          </p>
        </div>

        {/* Event Context */}
        {eventId && eventTitle && (
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Music className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">
                    Descobrindo música para: {decodeURIComponent(eventTitle)}
                  </h2>
                  <p className="text-muted-foreground">
                    Encontre os artistas e as músicas que fazem parte deste evento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spotify Connection */}
        {!isConnected && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Headphones className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Conecte-se ao Spotify</h3>
                <p className="text-muted-foreground mb-4">
                  Para descobrir música, criar playlists automáticas e ter acesso completo às funcionalidades musicais.
                </p>
                <Button 
                  onClick={handleConnectSpotify} 
                  disabled={authLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {authLoading ? 'Conectando...' : 'Conectar ao Spotify'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connected User Info */}
        {isConnected && profile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {profile.images?.[0] && (
                    <img 
                      src={profile.images[0].url} 
                      alt={profile.display_name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">Conectado como {profile.display_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.followers?.total.toLocaleString()} seguidores no Spotify
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={disconnect}>
                  Desconectar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="discovery" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discovery">Descoberta</TabsTrigger>
            <TabsTrigger value="playlists">Minhas Playlists</TabsTrigger>
            <TabsTrigger value="favorites">Eventos Favoritos</TabsTrigger>
          </TabsList>

          {/* Discovery Tab */}
          <TabsContent value="discovery" className="space-y-6">
            {discoveryLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Descobrindo artistas...</p>
                </CardContent>
              </Card>
            )}

            {artists.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Artistas Descobertos</h2>
                  {allTracks.length > 0 && (
                    <Button onClick={() => setShowPlayer(!showPlayer)}>
                      <Music className="h-4 w-4 mr-2" />
                      {showPlayer ? 'Ocultar Player' : 'Mostrar Player'}
                    </Button>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {artists.map((artist) => (
                    <Card key={artist.id} className="overflow-hidden">
                      <div className="relative">
                        {artist.image_url && (
                          <img 
                            src={artist.image_url} 
                            alt={artist.artist_name}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="absolute top-3 right-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-background/80 backdrop-blur-sm"
                            onClick={() => window.open(artist.spotify_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{artist.artist_name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {artist.followers_count.toLocaleString()} seguidores
                        </p>
                        
                        <div className="flex gap-1 mb-4 flex-wrap">
                          {artist.genres.slice(0, 3).map(genre => (
                            <Badge key={genre} variant="secondary" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>

                        {artist.preview_tracks.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Top Tracks</h4>
                            {artist.preview_tracks.slice(0, 2).map((track) => (
                              <div key={track.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handlePlayTrack({...track, artist: artist.artist_name, image_url: artist.image_url})}
                                  disabled={!track.preview_url}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{track.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {artists.length === 0 && !discoveryLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum artista descoberto ainda</h3>
                  <p className="text-muted-foreground">
                    Explore eventos para descobrir novos artistas e suas músicas.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Minhas Playlists</h2>
              <Button 
                onClick={handleGeneratePlaylist}
                disabled={!isConnected || creating}
              >
                <Plus className="h-4 w-4 mr-2" />
                {creating ? 'Criando...' : 'Gerar dos Favoritos'}
              </Button>
            </div>

            {playlistLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando playlists...</p>
                </CardContent>
              </Card>
            )}

            {playlists.length > 0 ? (
              <div className="space-y-6">
                {favoritePlaylists.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dos Seus Favoritos</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {favoritePlaylists.map((playlist) => (
                        <Card key={playlist.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold">{playlist.playlist_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {playlist.track_count} músicas
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(playlist.platform_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              Atualizada em {new Date(playlist.last_updated_at).toLocaleDateString('pt-BR')}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {playlist.platform}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {customPlaylists.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Personalizadas</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {customPlaylists.map((playlist) => (
                        <Card key={playlist.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold">{playlist.playlist_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {playlist.track_count} músicas
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(playlist.platform_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {playlist.platform}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma playlist ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Conecte-se ao Spotify e crie sua primeira playlist baseada nos seus eventos favoritos.
                  </p>
                  {isConnected && (
                    <Button onClick={handleGeneratePlaylist} disabled={creating}>
                      <Plus className="h-4 w-4 mr-2" />
                      {creating ? 'Criando...' : 'Criar Primeira Playlist'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-2xl font-semibold">Música dos Seus Eventos Favoritos</h2>
            
            {favorites.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favorites.slice(0, 6).map((favorite) => (
                  <Card key={favorite.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{favorite.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{favorite.city}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSelectedEventId(favorite.id);
                          discoverFromEvent(favorite.title, favorite.id);
                        }}
                      >
                        <Music className="h-4 w-4 mr-2" />
                        Descobrir Música
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum evento favorito</h3>
                  <p className="text-muted-foreground">
                    Adicione eventos aos favoritos para descobrir sua música automaticamente.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Spotify Player */}
        {showPlayer && allTracks.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <SpotifyPlayer
              tracks={allTracks}
              currentTrackIndex={currentTrackIndex}
              onTrackChange={setCurrentTrackIndex}
              onPlay={() => playPreview(allTracks[currentTrackIndex])}
              onPause={stopPreview}
              isPlaying={isPlaying}
              className="shadow-lg"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default MusicPage;