import { Helmet } from 'react-helmet';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  structuredData?: any;
}

export function SEOHelmet({
  title = 'ROLÊ - Curadoria Independente de Cultura e Experiências',
  description = 'O ROLÊ é uma curadoria independente de eventos, cultura e experiências. A gente vive a cena pra te mostrar o que realmente importa com estética, presença e muita opinião.',
  image = `${window.location.origin}/banner-home.png`,
  url = window.location.href,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'ROLÊ',
  tags = [],
  structuredData
}: SEOHelmetProps) {
  const fullTitle = title.includes('ROLÊ') ? title : `${title} | ROLÊ`;
  
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : type === 'event' ? 'Event' : 'WebSite',
    "name": title,
    "description": description,
    "url": url,
    "image": image,
    ...(type === 'website' && {
      "publisher": {
        "@type": "Organization",
        "name": "ROLÊ",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/role-logo.png`
        }
      }
    }),
    ...(author && type === 'article' && {
      "author": {
        "@type": "Person",
        "name": author
      }
    }),
    ...(publishedTime && { "datePublished": publishedTime }),
    ...(modifiedTime && { "dateModified": modifiedTime })
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`eventos, cultura, entretenimento, ${tags.join(', ')}`} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="ROLÊ" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* WhatsApp */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
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
      {tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>

      {/* Performance and Mobile */}
      <meta name="format-detection" content="telephone=no" />
      {/* Note: PWA meta tags are managed in index.html to avoid duplicates */}
      
      {/* Preconnect */}
      <link rel="preconnect" href="https://nutlcbnruabjsxecqpnd.supabase.co" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//nutlcbnruabjsxecqpnd.supabase.co" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Helmet>
  );
}