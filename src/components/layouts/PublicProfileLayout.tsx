import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PublicProfileLayoutProps {
  children: ReactNode;
  profile: {
    name: string;
    bio?: string;
    type: string;
    city?: string;
    avatar_url?: string;
    handle: string;
  };
}

export function PublicProfileLayout({ children, profile }: PublicProfileLayoutProps) {
  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case 'artista': return 'Artista';
      case 'local': return 'Local';
      case 'organizador': return 'Organizador';
      default: return 'Perfil';
    }
  };

  const title = `${profile.name} - ${getProfileTypeLabel(profile.type)} | Rolezeiro`;
  const description = profile.bio || `Conheça ${profile.name}, ${getProfileTypeLabel(profile.type).toLowerCase()} ${profile.city ? `de ${profile.city}` : ''} no Rolezeiro.`;
  const profileUrl = `${window.location.origin}/perfil/${profile.handle}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={profileUrl} />
        {profile.avatar_url && <meta property="og:image" content={profile.avatar_url} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {profile.avatar_url && <meta name="twitter:image" content={profile.avatar_url} />}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": profile.type === 'artista' ? 'MusicGroup' : profile.type === 'local' ? 'EventVenue' : 'Organization',
            "name": profile.name,
            "description": description,
            "url": profileUrl,
            ...(profile.avatar_url && { "image": profile.avatar_url }),
            ...(profile.city && { "address": { "@type": "PostalAddress", "addressLocality": profile.city } })
          })}
        </script>
        
        <link rel="canonical" href={profileUrl} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}