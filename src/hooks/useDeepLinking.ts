import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseDeepLinkingProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  validTabs: string[];
}

export function useDeepLinking({ activeTab, onTabChange, validTabs }: UseDeepLinkingProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read tab from URL on mount
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      onTabChange(tabFromUrl);
    }
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (activeTab !== 'visao-geral' && activeTab !== currentTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', activeTab);
      setSearchParams(newParams, { replace: true });
    } else if (activeTab === 'visao-geral' && currentTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tab');
      setSearchParams(newParams, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);
}