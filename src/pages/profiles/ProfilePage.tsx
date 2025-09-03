import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { NewProfileHeader } from "@/features/profiles/components/NewProfileHeader";
import { ProfileNavNew } from "@/features/profiles/components/ProfileNavNew";
import { ProfileContentNew } from "@/features/profiles/components/ProfileContentNew";

import { ProfileSidebarNew } from "@/features/profiles/components/ProfileSidebarNew";
import { SEOHelmet } from '@/components/SEOHelmet';
import { PublicLayout } from "@/components/PublicLayout";
import { ProfileHeaderSkeleton } from "@/components/skeletons/ProfileHeaderSkeleton";
import { ProfileContentSkeleton } from "@/components/skeletons/ProfileContentSkeleton";
import { ProfileSidebarSkeleton } from "@/components/skeletons/ProfileSidebarSkeleton";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

// Mobile components
import { ProfileHeroMobile } from "@/features/profiles/components/mobile/ProfileHeroMobile";
import { ProfileStickyHeaderMobile } from "@/features/profiles/components/mobile/ProfileStickyHeaderMobile";
import { ProfileActionsMobile } from "@/features/profiles/components/mobile/ProfileActionsMobile";
import { ProfileGenreChipsMobile } from "@/features/profiles/components/mobile/ProfileGenreChipsMobile";
import { ProfileTabsMobile } from "@/features/profiles/components/mobile/ProfileTabsMobile";
import { ProfileContentMobile } from "@/features/profiles/components/mobile/ProfileContentMobile";
import { ProfileSkeletonMobile } from "@/features/profiles/components/mobile/ProfileSkeletonMobile";
import { useProfileStats } from "@/features/profiles/hooks/useProfileStats";
import { useTabPrefetch } from "@/hooks/useTabPrefetch";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { useDeepLinking } from "@/hooks/useDeepLinking";

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const cleanHandle = handle?.replace(/^@/, "").toLowerCase() || "";
  const [activeTab, setActiveTab] = useState("visao-geral");

  const { data: profile, isLoading, error, refetch } = useProfile(cleanHandle);
  const stats = useProfileStats(
    cleanHandle, 
    profile?.type || '', 
    profile?.user_id || ''
  );

  // Apply final refinements
  useTabPrefetch(profile, activeTab);
  useProfileAnalytics(profile, activeTab);
  useDeepLinking({
    activeTab,
    onTabChange: setActiveTab,
    validTabs: ['visao-geral', 'agenda', 'conteudos', 'fotos-videos', 'avaliacoes', 'sobre']
  });

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <PublicLayout>
        {/* Desktop skeleton */}
        <div className="hidden md:block space-y-6">
          <ProfileHeaderSkeleton />
          <div className="container mx-auto px-3 md:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ProfileContentSkeleton />
              </div>
              <div className="space-y-6">
                <ProfileSidebarSkeleton />
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile skeleton */}
        <ProfileSkeletonMobile />
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return <Navigate to="/404" replace />;
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": profile.type === 'artista' ? 'Person' : profile.type === 'local' ? 'Place' : 'Organization',
    "name": profile.name,
    "url": `${window.location.origin}/perfil/@${profile.handle}`,
    "image": profile.avatar_url,
    "description": profile.bio,
    ...(profile.type === 'artista' && {
      "jobTitle": "Artista",
      "worksFor": {
        "@type": "Organization",
        "name": "Música"
      }
    }),
    ...(profile.type === 'local' && {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": profile.city,
        "addressRegion": profile.state,
        "addressCountry": "BR"
      }
    })
  };

  return (
    <ErrorBoundary>
      <PublicLayout>
        <ConnectionStatus />
        
        <SEOHelmet
          title={`${profile.name} (@${profile.handle}) - Revista Aplauso`}
          description={profile.bio || `Perfil de ${profile.name} na Revista Aplauso. ${profile.type === 'artista' ? 'Artista' : profile.type === 'local' ? 'Local' : 'Organizador'} em ${profile.city}.`}
          image={profile.avatar_url}
          url={`/perfil/@${profile.handle}`}
          type="profile"
          profile={{
            firstName: profile.name.split(' ')[0],
            lastName: profile.name.split(' ').slice(1).join(' '),
            username: profile.handle
          }}
          structuredData={structuredData}
        />
        
        <PullToRefresh onRefresh={handleRefresh}>
          <main id="main-content" role="main" tabIndex={-1}>
            {/* Mobile Profile Layout */}
            <div className="md:hidden">
              <ProfileHeroMobile profile={profile} />
              <ProfileActionsMobile profile={profile} />
              <ProfileGenreChipsMobile profile={profile} />
              <ProfileTabsMobile 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                eventCount={stats.eventCount}
                mediaCount={stats.mediaCount}
              />
              <ProfileContentMobile 
                profile={profile} 
                activeTab={activeTab} 
              />
            </div>

            {/* Desktop Profile Layout */}
            <div className="hidden md:block">
              {/* Desktop Profile Header */}
              <NewProfileHeader profile={profile} />

              {/* Profile Navigation */}
              <ProfileNavNew activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Profile Content - Two Column Layout */}
              <section className="container mx-auto px-3 md:px-0 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content - 2 columns */}
                  <div className="lg:col-span-2">
                    <ProfileContentNew 
                      profile={profile} 
                      activeTab={activeTab} 
                      onTabChange={setActiveTab}
                    />
                  </div>
                  
                  {/* Sidebar - 1 column */}
                  <aside className="lg:col-span-1">
                    <ProfileSidebarNew profile={profile} />
                  </aside>
                </div>
              </section>
            </div>
          </main>
        </PullToRefresh>

        {/* Mobile Sticky Header (appears on scroll) */}
        <ProfileStickyHeaderMobile profile={profile} />
        
      </PublicLayout>
    </ErrorBoundary>
  );
}