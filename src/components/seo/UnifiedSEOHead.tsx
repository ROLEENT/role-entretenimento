import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  structuredData?: object;
  canonicalUrl?: string;
}

interface UnifiedSEOHeadProps extends SEOData {
  siteName?: string;
  twitterUsername?: string;
}

export function UnifiedSEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags,
  structuredData,
  canonicalUrl,
  siteName = 'ROLÊ - Agenda Cultural',
  twitterUsername = '@role_agenda'
}: UnifiedSEOHeadProps) {
  const location = useLocation();
  
  // Default values
  const defaultTitle = 'ROLÊ - Descubra os melhores eventos culturais';
  const defaultDescription = 'Encontre shows, teatro, exposições e muito mais. Sua agenda cultural completa em São Paulo, Rio de Janeiro e outras cidades.';
  const defaultImage = '/role-logo.png';
  const baseUrl = 'https://role.lovable.app';
  
  // Computed values
  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}${defaultImage}`;
  const finalUrl = url || `${baseUrl}${location.pathname}`;
  const finalCanonical = canonicalUrl || finalUrl;

  // Generate keywords from tags
  const keywords = tags ? tags.join(', ') : 'eventos, cultura, shows, teatro, exposições, agenda cultural, entretenimento';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && tags && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterUsername} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="content-language" content="pt-BR" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Specialized SEO components for different page types
export function EventSEO({
  event,
  venue,
  artists
}: {
  event: any;
  venue?: any;
  artists?: any[];
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.start_date,
    "endDate": event.end_date,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": venue ? {
      "@type": "Place",
      "name": venue.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": venue.address,
        "addressLocality": venue.city,
        "addressCountry": "BR"
      }
    } : undefined,
    "performer": artists?.map(artist => ({
      "@type": "Person",
      "name": artist.name
    })),
    "offers": event.ticket_url ? {
      "@type": "Offer",
      "url": event.ticket_url,
      "price": event.ticket_price,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock"
    } : undefined,
    "organizer": {
      "@type": "Organization",
      "name": "ROLÊ"
    }
  };

  return (
    <UnifiedSEOHead
      title={event.title}
      description={event.description || `${event.title} - Evento cultural em ${venue?.city || 'São Paulo'}`}
      type="article"
      image={event.image_url}
      publishedTime={event.created_at}
      modifiedTime={event.updated_at}
      tags={event.tags}
      structuredData={structuredData}
    />
  );
}

export function ProfileSEO({
  profile,
  type = 'artist'
}: {
  profile: any;
  type?: 'artist' | 'venue' | 'organizer';
}) {
  const typeMap = {
    artist: 'Person',
    venue: 'Place',
    organizer: 'Organization'
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": typeMap[type],
    "name": profile.name,
    "description": profile.bio,
    "image": profile.avatar_url,
    "url": `https://role.lovable.app/${type}/${profile.handle}`,
    ...(type === 'venue' && profile.address && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": profile.address,
        "addressLocality": profile.city,
        "addressCountry": "BR"
      }
    })
  };

  return (
    <UnifiedSEOHead
      title={profile.name}
      description={profile.bio || `${profile.name} - ${type === 'artist' ? 'Artista' : type === 'venue' ? 'Local' : 'Organizador'} cultural`}
      type="profile"
      image={profile.avatar_url}
      structuredData={structuredData}
    />
  );
}

export function CitySEO({ city }: { city: string }) {
  const cityNames = {
    'sao_paulo': 'São Paulo',
    'rio_de_janeiro': 'Rio de Janeiro',
    'porto_alegre': 'Porto Alegre',
    'belo_horizonte': 'Belo Horizonte'
  };

  const cityName = cityNames[city as keyof typeof cityNames] || city;
  
  return (
    <UnifiedSEOHead
      title={`Agenda Cultural de ${cityName}`}
      description={`Descubra os melhores eventos culturais em ${cityName}: shows, teatro, exposições e muito mais. Sua agenda cultural completa.`}
      canonicalUrl={`https://role.lovable.app/agenda/cidade/${city}`}
    />
  );
}