import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { ProfileHeader } from "@/features/profiles/components/ProfileHeader";
import { ProfileNav } from "@/features/profiles/components/ProfileNav";
import { ProfileContent } from "@/features/profiles/components/ProfileContent";

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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{profile.name} - @{profile.handle}</title>
        <meta name="description" content={profile.bio_short ?? `Perfil de ${profile.name}`} />
        {profile.cover_url && <meta property="og:image" content={profile.cover_url} />}
        <link rel="canonical" href={`/perfil/${profile.handle}`} />
      </Helmet>

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