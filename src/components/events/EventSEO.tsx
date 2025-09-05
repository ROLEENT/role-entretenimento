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
  const canonicalUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Dados estruturados completos para evento
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: description,
    startDate: event.date_start,
    endDate: event.date_end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.is_online ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    location: event.is_online ? {
      "@type": "VirtualLocation",
      url: event.location_url || event.ticket_url
    } : {
      "@type": "Place",
      name: event.location_name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.location_address,
        addressLocality: event.city,
        addressRegion: event.state,
        postalCode: event.postal_code,
        addressCountry: event.country || "BR"
      },
      ...(event.location_url && { url: event.location_url })
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer_name || "ROLÊ Entretenimento",
      url: "https://roleentretenimento.com.br"
    },
    performer: event.lineup ? event.lineup.map((artist: any) => ({
      "@type": "Person",
      name: artist.name || artist
    })) : [],
    offers: event.price_min ? {
      "@type": "Offer",
      price: event.price_min,
      priceCurrency: event.currency || "BRL",
      url: event.ticket_url,
      availability: event.tickets_available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      validFrom: event.sale_start_date,
      validThrough: event.sale_end_date || event.date_start
    } : {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock"
    },
    image: ogImage ? [ogImage] : [],
    url: canonicalUrl,
    ...(event.category && { genre: event.category }),
    ...(event.age_rating && { audience: { "@type": "Audience", suggestedMinAge: event.age_rating } }),
    ...(isVitrine && {
      additionalType: "https://schema.org/Advertisement",
      sponsor: {
        "@type": "Organization", 
        name: event.organizer_name || event.producer_name
      }
    })
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Keywords baseadas no evento */}
      {event.tags && (
        <meta name="keywords" content={event.tags.join(', ')} />
      )}
      
      {/* Open Graph completo */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="event" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ROLÊ Entretenimento" />
      <meta property="og:locale" content="pt_BR" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={`Imagem do evento ${event.title}`} />}
      
      {/* Article específico para eventos */}
      {event.date_start && <meta property="article:published_time" content={event.date_start} />}
      {event.tags && <meta property="article:tag" content={event.tags.join(', ')} />}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@roleentretenimento" />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image:alt" content={`Imagem do evento ${event.title}`} />}
      
      {/* WhatsApp específico */}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      
      {/* Schema.org estruturado completo */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Data attributes para tracking e publicidade */}
      {isVitrine && <meta name="advertising-content" content="true" />}
      {event.category && <meta name="event-category" content={event.category} />}
      {event.city && <meta name="event-city" content={event.city} />}
    </Helmet>
  );
}