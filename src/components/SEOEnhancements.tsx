import { Helmet } from 'react-helmet';

interface SEOEnhancementsProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

const SEOEnhancements = ({ 
  title = "ROLÊ - Curadoria Independente de Cultura & Experiências",
  description = "Conectamos pessoas através de experiências culturais autênticas. Agenda completa com shows, peças, exposições e eventos em São Paulo, Rio de Janeiro, Porto Alegre, Florianópolis e Curitiba.",
  canonical,
  noindex = false,
  structuredData
}: SEOEnhancementsProps) => {
  const baseUrl = "https://role.com.br";
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;
  
  return (
    <Helmet>
      {/* Essential meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Viewport and mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      
      {/* Robots directives */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:160, max-image-preview:large" />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ROLÊ" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Language and geo targeting */}
      <meta name="language" content="pt-BR" />
      <meta name="geo.region" content="BR" />
      <meta name="geo.placename" content="Brasil" />
      
      {/* Performance hints */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOEnhancements;