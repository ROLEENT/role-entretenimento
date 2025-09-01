import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'event';
  // Legacy props for backwards compatibility
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  // New structured props
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
  profile?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    gender?: string;
  };
  structuredData?: object;
}

export const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  // Legacy props
  publishedTime,
  modifiedTime,
  author,
  tags,
  // New structured props
  article,
  profile,
  structuredData
}) => {
  const siteUrl = window.location.origin;
  const fullUrl = url ? `${siteUrl}${url}` : window.location.href;
  const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : undefined;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Revista Aplauso" />
      
      {imageUrl && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}

      {/* Article specific */}
      {(type === 'article' || type === 'event') && (
        <>
          {(article?.author || author) && <meta property="article:author" content={article?.author || author} />}
          {(article?.publishedTime || publishedTime) && <meta property="article:published_time" content={article?.publishedTime || publishedTime} />}
          {(article?.modifiedTime || modifiedTime) && <meta property="article:modified_time" content={article?.modifiedTime || modifiedTime} />}
          {article?.section && <meta property="article:section" content={article.section} />}
          {(article?.tags || tags)?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Profile specific */}
      {type === 'profile' && profile && (
        <>
          {profile.firstName && <meta property="profile:first_name" content={profile.firstName} />}
          {profile.lastName && <meta property="profile:last_name" content={profile.lastName} />}
          {profile.username && <meta property="profile:username" content={profile.username} />}
          {profile.gender && <meta property="profile:gender" content={profile.gender} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};