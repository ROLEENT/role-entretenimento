import { useParams, Navigate } from 'react-router-dom';
import { useProfile } from '@/features/profiles/hooks/useProfiles';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PublicProfileLayout } from '@/components/layouts/PublicProfileLayout';
import { OrganizerHeader } from '@/components/profiles/OrganizerHeader';
import { OrganizerMission } from '@/components/profiles/OrganizerMission';
import { OrganizerEvents } from '@/components/profiles/OrganizerEvents';
import { ProfileSocialShare } from '@/components/profiles/ProfileSocialShare';

export default function PublicOrganizerProfile() {
  const { handle } = useParams<{ handle: string }>();
  const { data: profile, isLoading, error } = useProfile(handle || '');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile || profile.type !== 'organizador') {
    return <Navigate to="/404" replace />;
  }

  return (
    <PublicProfileLayout profile={profile}>
      <div className="space-y-8">
        <OrganizerHeader 
          profile={profile}
          showActions={true}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <OrganizerMission profile={profile} />
            <OrganizerEvents organizerId={profile.id} />
          </div>
          
          <div className="space-y-6">
            <ProfileSocialShare 
              profile={profile}
              type="organizador"
            />
          </div>
        </div>
      </div>
    </PublicProfileLayout>
  );
}