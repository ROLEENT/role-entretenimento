import React from 'react';
import { Helmet } from 'react-helmet-async';

interface GlobalSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
}

export function GlobalSEO({ 
  title = "ROLÊ Entretenimento - Eventos Culturais Curados",
  description = "Descubra eventos culturais únicos selecionados por nossa curadoria especializada. Shows, festivais, teatros e experiências exclusivas.",
  canonical,
  noindex = false
}: GlobalSEOProps) {
  const baseUrl = 'https://roleentretenimento.com.br';
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const ogImage = `${baseUrl}/og-default.jpg`;

  // Schema.org para organização
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ROLÊ Entretenimento",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
      width: 200,
      height: 60
    },
    sameAs: [
      "https://instagram.com/roleentretenimento",
      "https://twitter.com/roleentretenimento"
    ],
    description: description,
    areaServed: {
      "@type": "Country",
      name: "Brasil"
    },
    knowsAbout: [
      "Eventos culturais",
      "Curadoria musical",
      "Shows e festivais",
      "Entretenimento",
      "Cultura brasileira"
    ]
  };

  // Website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ROLÊ Entretenimento",
    url: baseUrl,
    description: description,
    publisher: {
      "@type": "Organization",
      name: "ROLÊ Entretenimento",
      url: baseUrl
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/agenda?busca={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Language and region */}
      <html lang="pt-BR" />
      <meta name="language" content="pt-BR" />
      <meta name="geo.region" content="BR" />
      <meta name="geo.country" content="Brasil" />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content="ROLÊ Entretenimento" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="ROLÊ Entretenimento - Eventos Culturais" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@roleentretenimento" />
      <meta name="twitter:creator" content="@roleentretenimento" />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="ROLÊ Entretenimento - Eventos Culturais" />
      
      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="ROLÊ" />
      
      {/* Mobile optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Performance and SEO hints */}
      <link rel="preconnect" href="https://nutlcbnruabjsxecqpnd.supabase.co" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      
      {/* Theme color */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
    </Helmet>
  );
}