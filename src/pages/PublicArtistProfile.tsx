import { useParams, Navigate } from 'react-router-dom';
import { useProfile } from '@/features/profiles/hooks/useProfiles';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PublicProfileLayout } from '@/components/layouts/PublicProfileLayout';
import { ArtistHeader } from '@/components/profiles/ArtistHeader';
import { ArtistBio } from '@/components/profiles/ArtistBio';
import { ArtistEvents } from '@/components/profiles/ArtistEvents';
import { ProfileSocialShare } from '@/components/profiles/ProfileSocialShare';

export default function PublicArtistProfile() {
  const { handle } = useParams<{ handle: string }>();
  const { data: profile, isLoading, error } = useProfile(handle || '');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile || profile.type !== 'artista') {
    return <Navigate to="/404" replace />;
  }

  return (
    <PublicProfileLayout profile={profile}>
      <div className="space-y-8">
        <ArtistHeader 
          profile={profile}
          showActions={true}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ArtistBio profile={profile} />
            <ArtistEvents artistId={profile.id} />
          </div>
          
          <div className="space-y-6">
            <ProfileSocialShare 
              profile={profile}
              type="artista"
            />
            
            {/* Spotify Integration placeholder */}
            {profile.links?.find(link => link.type === 'spotify') && (
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Ouça no Spotify</h3>
                <div className="text-sm text-muted-foreground">
                  Integração com Spotify em breve
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicProfileLayout>
  );
}