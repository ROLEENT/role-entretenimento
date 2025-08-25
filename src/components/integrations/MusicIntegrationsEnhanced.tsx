import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, ExternalLink, Heart, Plus, Shuffle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMusicDiscovery } from '@/hooks/useMusicDiscovery';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { toast } from 'sonner';

interface MusicIntegrationsProps {
  eventTitle: string;
  eventCity: string;
  eventId?: string;
  eventGenres?: string[];
  className?: string;
}

const MusicIntegrations: React.FC<MusicIntegrationsProps> = ({
  eventTitle,
  eventCity,
  eventId,
  eventGenres = [],
  className = ''
}) => {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

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

  const { isConnected, profile, connect } = useSpotifyAuth();

  useEffect(() => {
    if (eventId) {
      getEventArtists(eventId);
    } else {
      discoverFromEvent(eventTitle, eventId);
    }
  }, [eventTitle, eventId]);

  const generatePlaylistLink = (platform: 'spotify' | 'apple-music', query: string) => {
    const encodedQuery = encodeURIComponent(query);
    
    if (platform === 'spotify') {
      return `https://open.spotify.com/search/${encodedQuery}`;
    } else {
      return `https://music.apple.com/search?term=${encodedQuery}`;
    }
  };

  const handleShare = (url: string, platform: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Playlist do evento ${eventTitle}`,
        text: `Confira a playlist do evento ${eventTitle} em ${eventCity}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success(`Link do ${platform} copiado!`);
    }
  };

  const openInSpotify = (url: string) => {
    const spotifyApp = url.replace('https://open.spotify.com', 'spotify:');
    window.location.href = spotifyApp;
    
    setTimeout(() => {
      window.open(url, '_blank');
    }, 1000);
  };

  const playNextTrack = () => {
    const allTracks = artists.flatMap(artist => artist.preview_tracks);
    if (allTracks.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % allTracks.length;
      setCurrentTrackIndex(nextIndex);
      playPreview(allTracks[nextIndex]);
    }
  };

  const allTracks = artists.flatMap(artist => artist.preview_tracks);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Integração Musical
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Access */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openInSpotify(generatePlaylistLink('spotify', eventTitle))}
            className="flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            Buscar no Spotify
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(generatePlaylistLink('apple-music', eventTitle), '_blank')}
            className="flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            Apple Music
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <Separator />

        {/* Artists Discovery */}
        {discoveryLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Descobrindo artistas...</p>
          </div>
        )}

        {artists.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Artistas Descobertos</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = `/musica?evento=${eventId}&titulo=${encodeURIComponent(eventTitle)}`}
              >
                Ver Todos
              </Button>
            </div>
            
            {artists.slice(0, 2).map((artist) => (
              <div key={artist.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {artist.image_url && (
                      <img 
                        src={artist.image_url} 
                        alt={artist.artist_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h5 className="font-medium">{artist.artist_name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {artist.followers_count.toLocaleString()} seguidores
                      </p>
                      <div className="flex gap-1 mt-1">
                        {artist.genres.slice(0, 2).map(genre => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openInSpotify(artist.spotify_url)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview Tracks */}
                {artist.preview_tracks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Top Tracks</p>
                    {artist.preview_tracks.slice(0, 1).map((track) => (
                      <div key={track.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => 
                            currentTrack?.id === track.id && isPlaying 
                              ? stopPreview() 
                              : playPreview(track)
                          }
                          disabled={!track.preview_url}
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.name}</p>
                          {currentTrack?.id === track.id && isPlaying && (
                            <Progress value={50} className="h-1 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Custom Playlist Links */}
        <div className="space-y-4">
          <h4 className="font-medium">Links Personalizados</h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="spotify-url">Playlist do Spotify</Label>
              <Input
                id="spotify-url"
                placeholder="https://open.spotify.com/playlist/..."
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
              />
              {spotifyUrl && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openInSpotify(spotifyUrl)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Abrir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleShare(spotifyUrl, 'Spotify')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apple-url">Playlist do Apple Music</Label>
              <Input
                id="apple-url"
                placeholder="https://music.apple.com/playlist/..."
                value={appleMusicUrl}
                onChange={(e) => setAppleMusicUrl(e.target.value)}
              />
              {appleMusicUrl && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(appleMusicUrl, '_blank')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Abrir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleShare(appleMusicUrl, 'Apple Music')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integration Tips */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h5 className="font-medium mb-2">💡 Dicas de Integração</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Conecte sua conta Spotify para recursos avançados</li>
            <li>• Use os previews para conhecer os artistas antes do evento</li>
            <li>• Compartilhe playlists nas redes sociais</li>
            {!isConnected && (
              <li>• <Button variant="link" className="p-0 h-auto text-sm" onClick={connect}>Conectar ao Spotify</Button> para criar playlists automaticamente</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicIntegrations;