import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

interface DeepLinkingOptions {
  activeTab: string;
  onTabChange: (tab: string) => void;
  validTabs: string[];
}

export function useDeepLinking({ activeTab, onTabChange, validTabs }: DeepLinkingOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isUpdatingRef = useRef(false);
  const lastUrlTabRef = useRef<string | null>(null);

  // Memoized tab change handler to prevent unnecessary re-renders
  const handleTabChange = useCallback((tab: string) => {
    if (isUpdatingRef.current) return;
    onTabChange(tab);
  }, [onTabChange]);

  // Read tab from URL on mount and when URL changes externally
  useEffect(() => {
    try {
      const urlTab = searchParams.get('tab');
      
      // Only update if URL actually changed and it's different from current tab
      if (urlTab !== lastUrlTabRef.current) {
        lastUrlTabRef.current = urlTab;
        
        if (urlTab && validTabs.includes(urlTab) && urlTab !== activeTab) {
          isUpdatingRef.current = true;
          handleTabChange(urlTab);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        } else if (!urlTab && activeTab !== 'visao-geral') {
          isUpdatingRef.current = true;
          handleTabChange('visao-geral');
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }
      }
    } catch (error) {
      console.debug('Deep linking error:', error);
    }
  }, [searchParams, handleTabChange, validTabs, activeTab]);

  // Update URL when tab changes (but not when we're updating from URL)
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    try {
      const currentTab = searchParams.get('tab');
      
      // Only update URL if it's actually different
      if (activeTab !== 'visao-geral' && currentTab !== activeTab) {
        setSearchParams(params => {
          params.set('tab', activeTab);
          return params;
        }, { replace: true }); // Use replace to avoid history pollution
      } else if (activeTab === 'visao-geral' && currentTab) {
        setSearchParams(params => {
          params.delete('tab');
          return params;
        }, { replace: true });
      }
    } catch (error) {
      console.debug('URL update error:', error);
    }
  }, [activeTab, setSearchParams]); // Removed searchParams dependency to prevent loop
}