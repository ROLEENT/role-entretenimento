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
    <div className="mx-auto max-w-screen-sm px-4 mt-3 overflow-x-auto no-scrollbar md:hidden">
      <div className="flex gap-2">
        {genres.map((genre) => (
          <Badge 
            key={genre.id}
            variant="secondary"
            className="shrink-0 px-3 h-8 rounded-full bg-[#c77dff]/20 border border-[#c77dff]/30 text-sm font-medium flex items-center"
          >
            {genre.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}