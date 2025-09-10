import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/features/profiles/api';

interface ArtistBioProps {
  profile: Profile;
}

export function ArtistBio({ profile }: ArtistBioProps) {
  if (!profile.bio) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sobre</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          {profile.bio.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}