import { Helmet } from 'react-helmet-async';

interface ProfileStructuredDataProps {
  profile: {
    id: string;
    name: string;
    handle: string;
    type: 'artista' | 'local' | 'organizador';
    bio?: string;
    bio_short?: string;
    city: string;
    avatar_url?: string;
    contact_email?: string;
    contact_phone?: string;
    links?: any;
  };
}

export function ProfileStructuredData({ profile }: ProfileStructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/${getProfileRoute(profile.type)}/${profile.handle}`;

    // Base structure
    const structuredData: any = {
      "@context": "https://schema.org",
      "@type": getSchemaType(profile.type),
      "name": profile.name,
      "url": profileUrl,
      "description": profile.bio_short || profile.bio,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": profile.city,
        "addressCountry": "BR"
      }
    };

    // Add image if available
    if (profile.avatar_url) {
      structuredData.image = profile.avatar_url;
    }

    // Add contact info if available
    if (profile.contact_email || profile.contact_phone) {
      structuredData.contactPoint = {
        "@type": "ContactPoint",
        "contactType": "general"
      };
      
      if (profile.contact_email) {
        structuredData.contactPoint.email = profile.contact_email;
      }
      
      if (profile.contact_phone) {
        structuredData.contactPoint.telephone = profile.contact_phone;
      }
    }

    // Add social media links
    if (profile.links) {
      const sameAs = [];
      if (profile.links.instagram) sameAs.push(`https://instagram.com/${profile.links.instagram.replace('@', '')}`);
      if (profile.links.spotify) sameAs.push(profile.links.spotify);
      if (profile.links.website) sameAs.push(profile.links.website);
      
      if (sameAs.length > 0) {
        structuredData.sameAs = sameAs;
      }
    }

    // Artist-specific fields
    if (profile.type === 'artista') {
      structuredData["@type"] = "MusicGroup";
      structuredData.genre = "Electronic Music"; // Could be dynamic based on profile data
    }

    // Venue-specific fields
    if (profile.type === 'local') {
      structuredData["@type"] = "EventVenue";
      structuredData.publicAccess = true;
    }

    // Organization-specific fields
    if (profile.type === 'organizador') {
      structuredData["@type"] = "Organization";
      structuredData.organizationType = "Event Organizer";
    }

    return structuredData;
  };

  const getSchemaType = (type: string) => {
    switch (type) {
      case 'artista':
        return 'MusicGroup';
      case 'local':
        return 'EventVenue';
      case 'organizador':
        return 'Organization';
      default:
        return 'Organization';
    }
  };

  const getProfileRoute = (type: string) => {
    switch (type) {
      case 'artista':
        return 'artistas';
      case 'local':
        return 'locais';
      case 'organizador':
        return 'organizadores';
      default:
        return 'perfis';
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData())}
      </script>
    </Helmet>
  );
}