import { useParams, Navigate } from 'react-router-dom';
import { useProfile } from '@/features/profiles/hooks/useProfiles';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PublicProfileLayout } from '@/components/layouts/PublicProfileLayout';
import { VenueHeader } from '@/components/profiles/VenueHeader';
import { VenueInfo } from '@/components/profiles/VenueInfo';
import { VenueEvents } from '@/components/profiles/VenueEvents';
import { VenueGallery } from '@/components/profiles/VenueGallery';
import { ProfileSocialShare } from '@/components/profiles/ProfileSocialShare';

export default function PublicVenueProfile() {
  const { handle } = useParams<{ handle: string }>();
  const { data: profile, isLoading, error } = useProfile(handle || '');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile || profile.type !== 'local') {
    return <Navigate to="/404" replace />;
  }

  return (
    <PublicProfileLayout profile={profile}>
      <div className="space-y-8">
        <VenueHeader 
          profile={profile}
          showActions={true}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <VenueInfo profile={profile} />
            <VenueEvents venueId={profile.id} />
            <VenueGallery profile={profile} />
          </div>
          
          <div className="space-y-6">
            <ProfileSocialShare 
              profile={profile}
              type="local"
            />
            
            {/* Map placeholder */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Localização</h3>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-sm text-muted-foreground text-center">
                  <div>Mapa em breve</div>
                  {profile.city && <div className="mt-1">{profile.city}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicProfileLayout>
  );
}