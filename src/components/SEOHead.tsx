import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

const SEOHead = ({
  title = "ROLÊ - Curadoria de Eventos e Cultura",
  description = "Descubra os melhores eventos de cultura, shows, festas e arte na sua cidade. Curadoria independente para quem vive a cena cultural.",
  image = "/banner-home.png",
  url = "https://role.ent",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "ROLÊ Entretenimento",
  tags = []
}: SEOHeadProps) => {
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;
  
  // Generate Instagram Stories optimized image URL
  const instagramImageUrl = `${url}/api/og-image?title=${encodeURIComponent(title)}&type=story`;
  
  // Generate structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebSite",
    "name": title,
    "description": description,
    "url": url,
    "image": fullImageUrl,
    ...(type === "article" && {
      "author": {
        "@type": "Organization",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "ROLÊ Entretenimento",
        "logo": {
          "@type": "ImageObject",
          "url": `${url}/role-logo.png`
        }
      },
      ...(publishedTime && { "datePublished": publishedTime }),
      ...(modifiedTime && { "dateModified": modifiedTime }),
      ...(tags.length > 0 && { "keywords": tags.join(", ") })
    })
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="ROLÊ" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Instagram Stories optimized meta tags */}
      <meta property="og:image:story" content={instagramImageUrl} />
      <meta property="og:image:story:width" content="1080" />
      <meta property="og:image:story:height" content="1920" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:image:alt" content={title} />
      <meta property="twitter:creator" content="@role.ent" />
      <meta property="twitter:site" content="@role.ent" />
      
      {/* WhatsApp optimized sharing */}
      <meta property="whatsapp:title" content={title} />
      <meta property="whatsapp:description" content={description} />
      <meta property="whatsapp:image" content={fullImageUrl} />
      
      {/* Additional social media optimizations */}
      <meta property="pinterest:description" content={description} />
      <meta property="pinterest:media" content={fullImageUrl} />
      
      {/* Article specific meta tags */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* PWA and mobile optimizations */}
      <meta name="theme-color" content="#c026d3" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="ROLÊ" />
      <link rel="apple-touch-icon" href="/role-logo.png" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;