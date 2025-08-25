import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleAdSenseProps {
  position: 'header' | 'footer' | 'sidebar' | 'in-feed' | 'in-article';
  pageType: 'homepage' | 'events' | 'blog' | 'highlights' | 'all';
  className?: string;
  fallback?: React.ReactNode;
}

interface AdSenseConfig {
  id: string;
  publisher_id: string;
  slot_id: string;
  ad_format: string;
  ad_layout?: string;
  responsive: boolean;
  lazy_loading: boolean;
}

export function GoogleAdSense({ position, pageType, className = '', fallback }: GoogleAdSenseProps) {
  const [adConfig, setAdConfig] = useState<AdSenseConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchAdConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('adsense_settings')
          .select('*')
          .eq('position', position)
          .in('page_type', [pageType, 'all'])
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching AdSense config:', error);
          setHasError(true);
          return;
        }

        if (data) {
          setAdConfig(data);
        }
      } catch (error) {
        console.error('Error loading AdSense config:', error);
        setHasError(true);
      }
    };

    fetchAdConfig();
  }, [position, pageType]);

  useEffect(() => {
    if (!adConfig || !adRef.current) return;

    const loadAd = () => {
      try {
        // Check if AdSense script is loaded
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          const adElement = adRef.current?.querySelector('ins[data-ad-client]');
          if (adElement && !(adElement as any).adsbygoogle) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            setIsLoaded(true);
          }
        } else {
          // AdSense script not loaded, set error state
          setHasError(true);
        }
      } catch (error) {
        console.error('Error loading AdSense ad:', error);
        setHasError(true);
      }
    };

    if (adConfig.lazy_loading) {
      // Use Intersection Observer for lazy loading
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadAd();
              observerRef.current?.disconnect();
            }
          });
        },
        { rootMargin: '100px' }
      );

      if (adRef.current) {
        observerRef.current.observe(adRef.current);
      }
    } else {
      // Load immediately
      setTimeout(loadAd, 100);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [adConfig]);

  // Don't render anything if no config or error - completely remove from DOM
  if (!adConfig || hasError) {
    return null;
  }

  const getAdStyle = () => {
    const baseStyle: React.CSSProperties = {
      display: 'block',
      textAlign: 'center',
    };

    if (adConfig.responsive) {
      return {
        ...baseStyle,
        width: '100%',
        height: 'auto',
      };
    }

    // Default dimensions based on position
    switch (position) {
      case 'header':
      case 'footer':
        return { 
          ...baseStyle, 
          width: '728px', 
          height: '90px', 
          maxWidth: '100%',
          margin: '0',
          padding: '0',
          lineHeight: '0'
        };
      case 'sidebar':
        return { ...baseStyle, width: '300px', height: '250px' };
      case 'in-feed':
        return { ...baseStyle, width: '320px', height: '100px', maxWidth: '100%' };
      case 'in-article':
        return { ...baseStyle, width: '728px', height: '280px', maxWidth: '100%' };
      default:
        return baseStyle;
    }
  };

  return (
    <div 
      ref={adRef}
      className={`google-adsense-container ${className}`}
      data-position={position}
      data-page-type={pageType}
      style={position === 'header' ? { margin: '0', padding: '0', height: '0' } : undefined}
    >
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client={adConfig.publisher_id}
        data-ad-slot={adConfig.slot_id}
        data-ad-format={adConfig.ad_format}
        data-ad-layout={adConfig.ad_layout || undefined}
        data-full-width-responsive={adConfig.responsive ? 'true' : 'false'}
      />
    </div>
  );
}