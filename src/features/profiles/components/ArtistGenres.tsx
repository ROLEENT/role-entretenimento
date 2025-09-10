import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ArtistGenresProps {
  music?: string[];
  acting?: string[];
}

const titleize = (s: string) =>
  s.replace(/\s+/g, ' ')
   .trim()
   .toLowerCase()
   .replace(/(^|\s)\S/g, m => m.toUpperCase());

export default function ArtistGenres({ music = [], acting = [] }: ArtistGenresProps) {
  const musicGenres = [...new Set(music)].filter(Boolean).map(titleize);
  const actingGenres = [...new Set(acting)].filter(Boolean).map(titleize);

  if (!musicGenres.length && !actingGenres.length) return null;

  return (
    <div className="space-y-4">
      {!!actingGenres.length && (
        <div className="tags-block">
          <p className="text-xs text-muted-foreground mb-2 tags-subtitle">Gêneros de atuação</p>
          <div className="flex flex-wrap gap-2 chips">
            {actingGenres.map(genre => (
              <Badge 
                key={`acting-${genre}`}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors chip"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {!!musicGenres.length && (
        <div className="tags-block">
          <p className="text-xs text-muted-foreground mb-2 tags-subtitle">Gêneros musicais</p>
          <div className="flex flex-wrap gap-2 chips">
            {musicGenres.map(genre => (
              <Button
                key={`music-${genre}`}
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white chip"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}