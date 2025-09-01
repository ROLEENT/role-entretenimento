import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { ProfileHeader } from "@/features/profiles/components/ProfileHeader";
import { ProfileNav } from "@/features/profiles/components/ProfileNav";
import { ProfileContent } from "@/features/profiles/components/ProfileContent";
import { SEOHelmet } from '@/components/SEOHelmet';

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const cleanHandle = handle?.replace(/^@/, "").toLowerCase() || "";
  const [activeTab, setActiveTab] = useState("visao-geral");

  const { data: profile, isLoading, error } = useProfile(cleanHandle);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
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
    <div className="min-h-screen bg-background">
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

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <ProfileContent profile={profile} activeTab={activeTab} />
      </div>
    </div>
  );
}