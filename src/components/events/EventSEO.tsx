import React from 'react';
import { Helmet } from 'react-helmet-async';

interface EventSEOProps {
  event: any;
  highlightType?: string;
  isSponsored?: boolean;
}

export function EventSEO({ event, highlightType, isSponsored }: EventSEOProps) {
  const isVitrine = highlightType === 'sponsored' || isSponsored;
  
  // Prefixar descrição com aviso de publicidade se for vitrine
  const description = isVitrine 
    ? `Publicidade • ${event.seo_description || event.summary || event.title}`
    : event.seo_description || event.summary || event.title;

  const title = event.seo_title || event.title;
  const ogImage = event.og_image_url || event.cover_url || event.image_url;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="event" />
      <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Schema.org estruturado */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          description: description,
          startDate: event.date_start,
          endDate: event.date_end,
          location: {
            "@type": "Place",
            name: event.location_name,
            address: {
              "@type": "PostalAddress",
              addressLocality: event.city,
              addressRegion: event.state,
              addressCountry: event.country || "BR"
            }
          },
          organizer: {
            "@type": "Organization",
            name: "ROLÊ Entretenimento"
          },
          offers: event.price_min ? {
            "@type": "Offer",
            price: event.price_min,
            priceCurrency: event.currency || "BRL",
            url: event.ticket_url,
            availability: "https://schema.org/InStock"
          } : undefined,
          image: ogImage,
          ...(isVitrine && {
            // Indicar natureza publicitária no schema
            additionalType: "https://schema.org/Advertisement"
          })
        })}
      </script>
      
      {/* Data attributes para tracking */}
      {isVitrine && <meta name="advertising-content" content="true" />}
    </Helmet>
  );
}