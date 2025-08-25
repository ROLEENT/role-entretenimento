import { memo } from 'react';
import { SEOHelmet } from '@/components/SEOHelmet';
import { LazySection } from '@/components/performance/LazySection';
import { useResponsive } from '@/hooks/useResponsive';

// Global page wrapper for consistent SEO and performance
interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  structuredData?: any;
  className?: string;
  skipLazyLoading?: boolean;
}

export const PageWrapper = memo(function PageWrapper({
  children,
  title,
  description,
  image,
  type,
  publishedTime,
  modifiedTime,
  author,
  tags,
  structuredData,
  className = '',
  skipLazyLoading = false
}: PageWrapperProps) {
  const { isMobile } = useResponsive();

  const content = (
    <main className={`min-h-screen ${className}`}>
      {children}
    </main>
  );

  return (
    <>
      <SEOHelmet
        title={title}
        description={description}
        image={image}
        type={type}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        author={author}
        tags={tags}
        structuredData={structuredData}
      />
      
      {skipLazyLoading ? content : (
        <LazySection 
          threshold={isMobile ? 0.05 : 0.1}
          rootMargin={isMobile ? '50px' : '100px'}
        >
          {content}
        </LazySection>
      )}
    </>
  );
});