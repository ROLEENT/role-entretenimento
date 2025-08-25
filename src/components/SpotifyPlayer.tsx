import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Track {
  id: string;
  name: string;
  artist: string;
  preview_url?: string;
  external_urls: { spotify: string };
  duration_ms: number;
  image_url?: string;
}

interface SpotifyPlayerProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  className?: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  tracks,
  currentTrackIndex,
  onTrackChange,
  onPlay,
  onPause,
  isPlaying,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isFavorited, setIsFavorited] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current && currentTrack?.preview_url) {
      audioRef.current.src = currentTrack.preview_url;
      audioRef.current.volume = volume / 100;
      
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrackIndex]);

  const handlePlayPause = () => {
    if (!currentTrack?.preview_url) return;
    
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    onTrackChange(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    onTrackChange(prevIndex);
  };

  const handleSeek = (percentage: number) => {
    if (audioRef.current && currentTrack?.preview_url) {
      const newTime = (percentage / 100) * 30; // 30 seconds max for preview
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openInSpotify = () => {
    if (currentTrack) {
      // Try to open in app first
      const spotifyApp = currentTrack.external_urls.spotify.replace('https://open.spotify.com', 'spotify:');
      window.location.href = spotifyApp;
      
      // Fallback to web
      setTimeout(() => {
        window.open(currentTrack.external_urls.spotify, '_blank');
      }, 1000);
    }
  };

  if (!currentTrack) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">Nenhuma música selecionada</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = currentTrack.preview_url ? (currentTime / 30) * 100 : 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <audio ref={audioRef} />
        
        {/* Track Info */}
        <div className="flex items-center gap-3 mb-4">
          {currentTrack.image_url && (
            <img 
              src={currentTrack.image_url} 
              alt={currentTrack.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{currentTrack.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
            {!currentTrack.preview_url && (
              <Badge variant="secondary" className="mt-1 text-xs">
                Preview não disponível
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsFavorited(!isFavorited)}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={openInSpotify}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <Progress 
            value={progressPercentage} 
            className="cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percentage = ((e.clientX - rect.left) / rect.width) * 100;
              handleSeek(percentage);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{currentTrack.preview_url ? '0:30' : '--:--'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={tracks.length <= 1}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={handlePlayPause}
            disabled={!currentTrack.preview_url}
            className="h-10 w-10 rounded-full"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={tracks.length <= 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Progress 
            value={volume} 
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percentage = ((e.clientX - rect.left) / rect.width) * 100;
              setVolume(Math.max(0, Math.min(100, percentage)));
            }}
          />
          <span className="text-xs text-muted-foreground w-8">{volume}%</span>
        </div>

        {/* Track List */}
        {tracks.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Fila de Reprodução</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-colors ${
                    index === currentTrackIndex 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => onTrackChange(index)}
                >
                  <span className="w-4 text-xs">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{track.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  {!track.preview_url && (
                    <Badge variant="outline" className="text-xs">
                      No preview
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpotifyPlayer;