import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersIcon, MapPinIcon } from "lucide-react";
import { useProfileSimilar } from "@/features/profiles/hooks/useProfileSimilar";
import { Profile } from "@/features/profiles/api";

interface ProfileSimilarArtistsProps {
  profile: Profile;
}

export function ProfileSimilarArtists({ profile }: ProfileSimilarArtistsProps) {
  const { data: similarProfiles = [], isLoading } = useProfileSimilar(
    profile.id, 
    profile.tags || [], 
    profile.type
  );

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Artistas Similares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarProfiles.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5" />
          Artistas Similares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {similarProfiles.map((similarProfile) => (
            <Button
              key={similarProfile.id}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent/50 transition-colors"
              asChild
            >
              <a href={`/perfil/${similarProfile.handle}`}>
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={similarProfile.avatar_url} 
                    alt={similarProfile.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {similarProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center space-y-1">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {similarProfile.name}
                  </h4>
                  
                  {similarProfile.city && (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <MapPinIcon className="w-3 h-3" />
                      <span className="truncate">{similarProfile.city}</span>
                    </div>
                  )}
                  
                  {/* Show most relevant shared tag */}
                  {similarProfile.tags && similarProfile.tags.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs max-w-full truncate"
                    >
                      {similarProfile.tags[0]}
                    </Badge>
                  )}
                </div>
              </a>
            </Button>
          ))}
        </div>
        
        {similarProfiles.length >= 6 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Ver mais artistas similares
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}