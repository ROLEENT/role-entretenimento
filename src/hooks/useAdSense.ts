import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface UseAdSenseOptions {
  publisherId: string;
  enableAutoAds?: boolean;
  enablePageLevelAds?: boolean;
}

export function useAdSense({ 
  publisherId, 
  enableAutoAds = true, 
  enablePageLevelAds = true 
}: UseAdSenseOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip AdSense for admin routes
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }

    // Check if AdSense is already loaded
    if (window.adsbygoogle) {
      setIsLoaded(true);
      return;
    }

    const loadAdSense = () => {
      try {
        // Check if script already exists to prevent multiple loads
        const existingScript = document.querySelector(`script[src*="${publisherId}"]`);
        if (existingScript) {
          setIsLoaded(true);
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
        script.crossOrigin = 'anonymous';
        
        // Add error handling
        script.onerror = () => {
          setError('Failed to load AdSense script');
        };
        
        script.onload = () => {
          // Initialize adsbygoogle array if it doesn't exist
          window.adsbygoogle = window.adsbygoogle || [];
          
          // Enable auto ads if requested (only once)
          if (enableAutoAds && !document.querySelector('[data-adsbygoogle-loaded]')) {
            window.adsbygoogle.push({
              google_ad_client: publisherId,
              enable_page_level_ads: enablePageLevelAds
            });
            // Mark as loaded to prevent duplicate calls
            document.body.setAttribute('data-adsbygoogle-loaded', 'true');
          }
          
          setIsLoaded(true);
        };
        
        // Add to document head
        document.head.appendChild(script);
        
        return () => {
          // Cleanup script on unmount
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (err) {
        setError('Error loading AdSense');
        console.error('AdSense loading error:', err);
      }
    };

    // Load with slight delay to ensure page is ready
    const timer = setTimeout(loadAdSense, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [publisherId, enableAutoAds, enablePageLevelAds]);

  const pushAd = (adConfig: any) => {
    if (window.adsbygoogle && isLoaded) {
      try {
        window.adsbygoogle.push(adConfig);
      } catch (err) {
        console.error('Error pushing ad:', err);
      }
    }
  };

  return {
    isLoaded,
    error,
    pushAd
  };
}