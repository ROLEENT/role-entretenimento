import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  canonical?: string;
}

export function PageSEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
  canonical
}: PageSEOProps) {
  const siteName = 'ROLÊ Entretenimento';
  const baseUrl = 'https://roleentretenimento.com.br';
  const fullUrl = url ? `${baseUrl}${url}` : (typeof window !== 'undefined' ? window.location.href : baseUrl);
  const canonicalUrl = canonical || fullUrl;
  const ogImage = image || `${baseUrl}/og-default.jpg`;

  // Schema.org para páginas
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? "Article" : "WebPage",
    name: title,
    description: description,
    url: canonicalUrl,
    ...(image && { image: ogImage }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    ...(author && {
      author: {
        "@type": "Organization",
        name: author
      }
    }),
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Keywords */}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Noindex */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="pt_BR" />
      {image && <meta property="og:image" content={ogImage} />}
      {image && <meta property="og:image:alt" content={title} />}
      {image && <meta property="og:image:width" content="1200" />}
      {image && <meta property="og:image:height" content="630" />}
      
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
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@roleentretenimento" />
      {image && <meta name="twitter:image" content={ogImage} />}
      {image && <meta name="twitter:image:alt" content={title} />}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Performance hints */}
      <link rel="preconnect" href="https://nutlcbnruabjsxecqpnd.supabase.co" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    </Helmet>
  );
}