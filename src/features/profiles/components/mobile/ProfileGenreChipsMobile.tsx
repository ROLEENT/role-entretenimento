import { Badge } from "@/components/ui/badge";
import { useProfileGenres } from "@/features/profiles/hooks/useProfileGenres";
import { Profile } from "@/features/profiles/api";

interface ProfileGenreChipsMobileProps {
  profile: Profile;
}

export function ProfileGenreChipsMobile({ profile }: ProfileGenreChipsMobileProps) {
  const { data: genres = [] } = useProfileGenres(profile.id, profile.type);

  if (genres.length === 0) return null;

  return (
    <div className="px-4 py-3 md:hidden">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {genres.map((genre) => (
          <Badge 
            key={genre.id}
            variant="secondary"
            className="shrink-0 h-8 px-3 bg-muted text-muted-foreground hover:bg-muted/80 font-medium"
          >
            {genre.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}