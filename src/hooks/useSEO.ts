import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event' | 'profile';
  structuredData?: object;
  canonical?: string;
  noIndex?: boolean;
}

export const useSEO = (data: SEOData) => {
  const location = useLocation();

  useEffect(() => {
    // Set title
    if (data.title) {
      document.title = `${data.title} - ROLÊ`;
    }

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && data.description) {
      metaDescription.setAttribute('content', data.description);
    }

    // Set canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const canonicalUrl = data.canonical || `${window.location.origin}${location.pathname}`;
    canonicalLink.setAttribute('href', canonicalUrl);

    // Set robots meta
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', data.noIndex ? 'noindex' : 'index,follow');

    // Set Open Graph tags
    const ogTags = [
      { property: 'og:title', content: data.title || 'ROLÊ' },
      { property: 'og:description', content: data.description || 'Descubra os melhores eventos da sua cidade' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: data.type || 'website' },
      { property: 'og:image', content: data.image || '/og-image.jpg' }
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Set Twitter Cards
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: data.title || 'ROLÊ' },
      { name: 'twitter:description', content: data.description || 'Descubra os melhores eventos da sua cidade' },
      { name: 'twitter:image', content: data.image || '/og-image.jpg' }
    ];

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Set structured data
    if (data.structuredData) {
      let structuredDataScript = document.querySelector('#structured-data');
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.setAttribute('id', 'structured-data');
        structuredDataScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(data.structuredData);
    }
  }, [data, location.pathname]);
};

// Auto-generate structured data for different content types
export const generateEventStructuredData = (event: any) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event.title,
  "description": event.summary || event.description,
  "startDate": event.date_start || event.starts_at,
  "endDate": event.date_end || event.end_at,
  "location": {
    "@type": "Place",
    "name": event.location_name,
    "address": event.address
  },
  "offers": event.price_min ? {
    "@type": "Offer",
    "price": event.price_min,
    "priceCurrency": event.currency || "BRL",
    "url": event.ticket_url
  } : undefined,
  "image": event.cover_url || event.image_url,
  "url": `${window.location.origin}/evento/${event.slug}`
});

export const generateArtistStructuredData = (artist: any) => ({
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": artist.stage_name || artist.name,
  "description": artist.bio_short || artist.bio,
  "image": artist.profile_image_url || artist.avatar_url,
  "url": `${window.location.origin}/artista/${artist.slug}`,
  "sameAs": [
    artist.instagram && `https://instagram.com/${artist.instagram.replace('@', '')}`,
    artist.spotify_url,
    artist.soundcloud_url
  ].filter(Boolean)
});

export const generateVenueStructuredData = (venue: any) => ({
  "@context": "https://schema.org",
  "@type": "EventVenue",
  "name": venue.name,
  "description": venue.description,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": venue.address,
    "addressLocality": venue.city,
    "addressRegion": venue.state,
    "addressCountry": "BR"
  },
  "image": venue.cover_url || venue.image_url,
  "url": `${window.location.origin}/local/${venue.slug}`
});