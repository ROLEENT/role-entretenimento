import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface SEOOptimizationsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  structuredData?: object;
  noindex?: boolean;
}

const SEOOptimizations = ({
  title = "ROLÊ - Agenda Cultural",
  description = "Descubra os melhores eventos culturais do Brasil. Shows, peças, exposições e muito mais!",
  image = "/banner-home.png",
  url = typeof window !== 'undefined' ? window.location.href : "",
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags = ['eventos', 'cultura', 'agenda', 'brasil'],
  structuredData,
  noindex = false
}: SEOOptimizationsProps) => {
  
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;
  
  useEffect(() => {
    // Performance optimizations - preloads temporarily disabled
    // const preloadCriticalResources = () => {
    //   // Preload critical images
    //   const criticalImages = ['/banner-home.png', '/role-logo.png'];
    //   criticalImages.forEach(src => {
    //     const link = document.createElement('link');
    //     link.rel = 'preload';
    //     link.as = 'image';
    //     link.href = src;
    //     document.head.appendChild(link);
    //   });
    // };

    // preloadCriticalResources();
  }, []);

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? "Article" : "WebSite",
    "name": title,
    "description": description,
    "url": url,
    "image": fullImageUrl,
    ...(type === 'article' && {
      "author": {
        "@type": "Organization",
        "name": author || "ROLÊ"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ROLÊ",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/role-logo.png`
        }
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "keywords": tags.join(', ')
    }),
    ...(type === 'website' && {
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    })
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Essential Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={tags.join(', ')} />
      <meta name="author" content={author || "ROLÊ"} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="ROLÊ" />
      <meta property="og:locale" content="pt_BR" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* WhatsApp/Telegram optimization */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />

      {/* Performance & Security */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      <meta name="theme-color" content="#9333ea" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* PWA Tags */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/favicon.png" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://nutlcbnruabjsxecqpnd.supabase.co" />
      <link rel="dns-prefetch" href="https://nutlcbnruabjsxecqpnd.supabase.co" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEOOptimizations;