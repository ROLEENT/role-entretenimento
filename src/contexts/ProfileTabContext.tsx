import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface ProfileTabContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isChanging: boolean;
}

const ProfileTabContext = createContext<ProfileTabContextType | undefined>(undefined);

interface ProfileTabProviderProps {
  children: React.ReactNode;
  initialTab?: string;
}

export function ProfileTabProvider({ children, initialTab = 'visao-geral' }: ProfileTabProviderProps) {
  const [activeTab, setActiveTabState] = useState(initialTab);
  const [isChanging, setIsChanging] = useState(false);

  const setActiveTab = useCallback((tab: string) => {
    if (tab === activeTab) return; // Prevent unnecessary updates
    
    setIsChanging(true);
    setActiveTabState(tab);
    
    // Reset changing state after a short delay
    setTimeout(() => {
      setIsChanging(false);
    }, 150);
  }, [activeTab]);

  const value = useMemo(() => ({
    activeTab,
    setActiveTab,
    isChanging,
  }), [activeTab, setActiveTab, isChanging]);

  return (
    <ProfileTabContext.Provider value={value}>
      {children}
    </ProfileTabContext.Provider>
  );
}

export function useProfileTab() {
  const context = useContext(ProfileTabContext);
  if (context === undefined) {
    throw new Error('useProfileTab must be used within a ProfileTabProvider');
  }
  return context;
}