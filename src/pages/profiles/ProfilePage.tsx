import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { ProfileHeader } from "@/features/profiles/components/ProfileHeader";
import { ProfileNav } from "@/features/profiles/components/ProfileNav";
import { ProfileContent } from "@/features/profiles/components/ProfileContent";
import { ProfileMobileActions } from "@/components/profiles/ProfileMobileActions";
import { ProfileSidebar } from "@/components/profiles/ProfileSidebar";
import { SEOHelmet } from '@/components/SEOHelmet';
import { PublicLayout } from "@/components/PublicLayout";
import { ProfileHeaderSkeleton } from "@/components/skeletons/ProfileHeaderSkeleton";
import { ProfileContentSkeleton } from "@/components/skeletons/ProfileContentSkeleton";
import { ProfileSidebarSkeleton } from "@/components/skeletons/ProfileSidebarSkeleton";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const cleanHandle = handle?.replace(/^@/, "").toLowerCase() || "";
  const [activeTab, setActiveTab] = useState("visao-geral");

  const { data: profile, isLoading, error, refetch } = useProfile(cleanHandle);

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="space-y-6">
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
            {/* Profile Header */}
            <ProfileHeader profile={profile} />

            {/* Profile Navigation */}
            <ProfileNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Profile Content - Last.fm Style Grid Layout */}
            <section className="container mx-auto px-3 md:px-0 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content - 8 columns */}
                <div className="lg:col-span-8">
                  <ProfileContent profile={profile} activeTab={activeTab} />
                </div>
                
                {/* Sidebar - 4 columns */}
                <aside className="lg:col-span-4">
                  <ProfileSidebar profile={profile} />
                </aside>
              </div>
            </section>
          </main>
        </PullToRefresh>

        {/* Mobile Action Bar */}
        <ProfileMobileActions profile={profile} />
        
        {/* Spacer para action bar fixa no mobile */}
        <div className="h-16 md:hidden" />
      </PublicLayout>
    </ErrorBoundary>
  );
}