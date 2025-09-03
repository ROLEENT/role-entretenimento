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
    const urlTab = searchParams.get('tab');
    if (urlTab && validTabs.includes(urlTab) && urlTab !== activeTab) {
      onTabChange(urlTab);
    }
  }, [searchParams, onTabChange, validTabs, activeTab]);

  // Update URL when tab changes
  useEffect(() => {
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
  }, [activeTab, searchParams, setSearchParams]);
}