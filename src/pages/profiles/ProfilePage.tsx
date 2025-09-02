import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { ProfileHeader } from "@/features/profiles/components/ProfileHeader";
import { ProfileNav } from "@/features/profiles/components/ProfileNav";
import { ProfileContent } from "@/features/profiles/components/ProfileContent";
import { ProfileMobileActions } from "@/components/profiles/ProfileMobileActions";
import { SEOHelmet } from '@/components/SEOHelmet';
import { PublicLayout } from "@/components/PublicLayout";

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const cleanHandle = handle?.replace(/^@/, "").toLowerCase() || "";
  const [activeTab, setActiveTab] = useState("visao-geral");

  const { data: profile, isLoading, error } = useProfile(cleanHandle);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
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
    <PublicLayout>
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

      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Profile Navigation */}
      <ProfileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Profile Content - Grid Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <ProfileContent profile={profile} activeTab={activeTab} />
          </div>
          
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            {activeTab === 'visao-geral' && (
              <>
                {/* Próximos Eventos */}
                <div className="lg:sticky lg:top-24">
                  <div className="space-y-4">
                    {/* Eventos em sidebar serão mostrados aqui */}
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile Action Bar */}
      <ProfileMobileActions profile={profile} />
      
      {/* Spacer para action bar fixa no mobile */}
      <div className="h-20 md:hidden" />
    </PublicLayout>
  );
}