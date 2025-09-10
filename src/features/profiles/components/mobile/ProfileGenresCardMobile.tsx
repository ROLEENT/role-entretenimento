import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfileGenres } from "@/features/profiles/hooks/useProfileGenres";
import { Profile } from "@/features/profiles/api";
import ArtistGenres from "../ArtistGenres";

interface ProfileGenresCardMobileProps {
  profile: Profile;
}

export function ProfileGenresCardMobile({ profile }: ProfileGenresCardMobileProps) {
  const { data: genres = [], isLoading } = useProfileGenres(profile.id, profile.type);

  // Combine genres with profile tags
  const allTags = [
    ...genres.map(genre => ({ name: genre.name, type: 'genre' })),
    ...(profile.tags || []).map(tag => ({ name: tag, type: 'tag' }))
  ];
  
  const hasArtistGenres = ((profile as any).music_genres?.length > 0) || 
                         ((profile as any).acting_genres?.length > 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tags</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-muted animate-pulse rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasArtistGenres && allTags.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Tags</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Artist Genres (Music & Acting) */}
          <ArtistGenres 
            music={(profile as any).music_genres} 
            acting={(profile as any).acting_genres} 
          />
          
          {/* Legacy tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant={tag.type === 'genre' ? 'default' : 'secondary'}
                  className="text-xs px-2 py-1 rounded-full"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}