import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Music, Headphones, Play, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    total: number;
  };
}

interface MusicIntegrationsProps {
  eventTitle: string;
  eventCity: string;
  eventGenres?: string[];
  className?: string;
}

export function MusicIntegrations({ 
  eventTitle, 
  eventCity, 
  eventGenres = [], 
  className = "" 
}: MusicIntegrationsProps) {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock Spotify integration (would require Spotify Web API in production)
  const suggestedPlaylists = [
    {
      id: '1',
      name: `Esquenta ${eventTitle}`,
      description: `Playlist especial para o evento ${eventTitle} em ${eventCity}`,
      external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd' },
      images: [{ url: '/placeholder.svg', height: 300, width: 300 }],
      tracks: { total: 25 }
    },
    {
      id: '2',
      name: `${eventCity} Underground`,
      description: `Sons alternativos de ${eventCity}`,
      external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n' },
      images: [{ url: '/placeholder.svg', height: 300, width: 300 }],
      tracks: { total: 30 }
    }
  ];

  const generatePlaylistLink = (platform: 'spotify' | 'apple') => {
    const searchQuery = `${eventTitle} ${eventGenres.join(' ')} ${eventCity}`.replace(/\s+/g, '+');
    
    if (platform === 'spotify') {
      return `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`;
    } else {
      return `https://music.apple.com/search?term=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleCreatePlaylist = async () => {
    setLoading(true);
    try {
      // Simulate playlist creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlaylist(suggestedPlaylists[0]);
      toast.success('Playlist criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar playlist');
    } finally {
      setLoading(false);
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
    // Try to open in Spotify app first, fallback to web
    const appUrl = url.replace('https://open.spotify.com', 'spotify:');
    window.location.href = appUrl;
    
    // Fallback to web version after a short delay
    setTimeout(() => {
      window.open(url, '_blank');
    }, 500);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Integração Musical
        </CardTitle>
        <CardDescription>
          Conecte-se às playlists e descubra a trilha sonora do evento
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Access */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(generatePlaylistLink('spotify'), '_blank')}
            className="flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            Buscar no Spotify
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(generatePlaylistLink('apple'), '_blank')}
            className="flex items-center gap-2"
          >
            <Headphones className="h-4 w-4" />
            Apple Music
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

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
                    <Share2 className="h-4 w-4" />
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
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Suggested Playlists */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Playlists Sugeridas</h4>
            <Button 
              size="sm" 
              onClick={handleCreatePlaylist}
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Playlist'}
            </Button>
          </div>

          <div className="grid gap-3">
            {suggestedPlaylists.map((playlist) => (
              <div 
                key={playlist.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <img 
                  src={playlist.images[0]?.url || '/placeholder.svg'}
                  alt={playlist.name}
                  className="w-12 h-12 rounded object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium truncate">{playlist.name}</h5>
                  <p className="text-sm text-muted-foreground truncate">
                    {playlist.description}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {playlist.tracks.total} músicas
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openInSpotify(playlist.external_urls.spotify)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleShare(playlist.external_urls.spotify, 'Spotify')}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Tags */}
        {eventGenres.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Gêneros Musicais</h4>
            <div className="flex flex-wrap gap-2">
              {eventGenres.map((genre) => (
                <Badge key={genre} variant="outline">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Integration Tips */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h5 className="font-medium mb-2">💡 Dicas de Integração</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Conecte sua conta Spotify para criar playlists automaticamente</li>
            <li>• Compartilhe playlists nas redes sociais para engajar o público</li>
            <li>• Use as playlists sugeridas como aquecimento para o evento</li>
            <li>• Peça para artistas compartilharem suas próprias playlists</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}