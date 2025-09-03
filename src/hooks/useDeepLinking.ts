import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface DeepLinkingOptions {
  activeTab: string;
  onTabChange: (tab: string) => void;
  validTabs: string[];
}

export function useDeepLinking({ activeTab, onTabChange, validTabs }: DeepLinkingOptions) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read tab from URL on mount
  useEffect(() => {
    try {
      const urlTab = searchParams.get('tab');
      if (urlTab && validTabs.includes(urlTab) && urlTab !== activeTab && onTabChange) {
        onTabChange(urlTab);
      }
    } catch (error) {
      console.debug('Deep linking error:', error);
    }
  }, [searchParams, onTabChange, validTabs, activeTab]);

  // Update URL when tab changes
  useEffect(() => {
    try {
      const currentTab = searchParams.get('tab');
      if (activeTab !== 'visao' && currentTab !== activeTab) {
        setSearchParams(params => {
          params.set('tab', activeTab);
          return params;
        });
      } else if (activeTab === 'visao' && currentTab) {
        setSearchParams(params => {
          params.delete('tab');
          return params;
        });
      }
    } catch (error) {
      console.debug('URL update error:', error);
    }
  }, [activeTab, searchParams, setSearchParams]);
}