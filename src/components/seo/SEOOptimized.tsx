import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  eventDate?: string;
  eventLocation?: string;
  eventPrice?: string;
  structuredData?: any;
}

export function SEOOptimized({
  title = 'ROLÊ - Descubra os Melhores Eventos da Sua Cidade',
  description = 'Encontre shows, festas, eventos culturais e muito mais na sua região. A plataforma ROLÊ conecta você aos melhores eventos do Brasil.',
  image = '/banner-home.png',
  url = 'https://role.lovable.app',
  type = 'website',
  keywords = ['eventos', 'shows', 'festas', 'entretenimento', 'cultura', 'música', 'Brasil'],
  author = 'ROLÊ',
  publishedTime,
  modifiedTime,
  eventDate,
  eventLocation,
  eventPrice,
  structuredData
}: SEOProps) {
  
  // Ensure absolute URLs
  const absoluteImage = image?.startsWith('http') ? image : `${url}${image}`;
  const absoluteUrl = url?.startsWith('http') ? url : `https://role.lovable.app${url}`;

  // Generate structured data for events
  const generateEventStructuredData = () => {
    if (type === 'event' && eventDate && eventLocation) {
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": title,
        "description": description,
        "startDate": eventDate,
        "location": {
          "@type": "Place",
          "name": eventLocation
        },
        "image": absoluteImage,
        "url": absoluteUrl,
        "organizer": {
          "@type": "Organization",
          "name": "ROLÊ"
        },
        ...(eventPrice && {
          "offers": {
            "@type": "Offer",
            "price": eventPrice,
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock"
          }
        })
      };
    }
    return null;
  };

  // Generate structured data for website/organization
  const generateWebsiteStructuredData = () => {
    if (type === 'website') {
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ROLÊ",
        "description": "Plataforma de descoberta de eventos no Brasil",
        "url": "https://role.lovable.app",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://role.lovable.app/events?search={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "sameAs": [
          "https://instagram.com/role",
          "https://facebook.com/role"
        ]
      };
    }
    return null;
  };

  const eventStructuredData = generateEventStructuredData();
  const websiteStructuredData = generateWebsiteStructuredData();
  const finalStructuredData = structuredData || eventStructuredData || websiteStructuredData;

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <link rel="canonical" href={absoluteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="ROLÊ" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={absoluteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:creator" content="@role" />

      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:section" content="Eventos" />
          {keywords.map(keyword => (
            <meta key={keyword} property="article:tag" content={keyword} />
          ))}
        </>
      )}

      {/* Event specific meta tags */}
      {type === 'event' && eventDate && (
        <>
          <meta property="event:start_time" content={eventDate} />
          {eventLocation && <meta property="event:location" content={eventLocation} />}
        </>
      )}

      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="format-detection" content="telephone=no" />

      {/* Performance hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://nutlcbnruabjsxecqpnd.supabase.co" />
      <link rel="dns-prefetch" href="//google-analytics.com" />

      {/* Structured Data */}
      {finalStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}

      {/* Additional meta tags for better SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Theme color for mobile browsers */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      
      {/* Language and region */}
      <meta httpEquiv="content-language" content="pt-BR" />
      <meta name="geo.region" content="BR" />
      <meta name="geo.placename" content="Brasil" />
    </Helmet>
  );
}