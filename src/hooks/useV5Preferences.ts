import { useState, useEffect } from 'react';

export type V5Preference = 'always-v4' | 'always-v5' | 'ask-each-time' | null;

export const useV5Preferences = () => {
  const [preference, setPreference] = useState<V5Preference>(null);
  const [hasShownChoiceModal, setHasShownChoiceModal] = useState(false);

  useEffect(() => {
    // Load preference from localStorage
    const stored = localStorage.getItem('v5-preference');
    if (stored) {
      setPreference(stored as V5Preference);
    }

    // Check if choice modal was shown
    const shownModal = localStorage.getItem('v5-choice-modal-shown');
    setHasShownChoiceModal(shownModal === 'true');
  }, []);

  const setV5Preference = (pref: V5Preference) => {
    setPreference(pref);
    if (pref) {
      localStorage.setItem('v5-preference', pref);
    } else {
      localStorage.removeItem('v5-preference');
    }
  };

  const markChoiceModalShown = () => {
    setHasShownChoiceModal(true);
    localStorage.setItem('v5-choice-modal-shown', 'true');
  };

  const resetPreferences = () => {
    setPreference(null);
    setHasShownChoiceModal(false);
    localStorage.removeItem('v5-preference');
    localStorage.removeItem('v5-choice-modal-shown');
  };

  const shouldShowV5ByDefault = () => {
    return preference === 'always-v5';
  };

  const shouldShowV4ByDefault = () => {
    return preference === 'always-v4';
  };

  const shouldShowChoiceModal = () => {
    return !hasShownChoiceModal && preference === null;
  };

  const getPreferredEditUrl = (entityType: string, id: string) => {
    const baseUrl = `/admin-v3/${entityType}`;
    
    if (preference === 'always-v5') {
      return `${baseUrl}/${id}/edit-v5`;
    }
    
    // Default to V4 for existing behavior
    return `${baseUrl}/${id}/edit`;
  };

  return {
    preference,
    hasShownChoiceModal,
    setV5Preference,
    markChoiceModalShown,
    resetPreferences,
    shouldShowV5ByDefault,
    shouldShowV4ByDefault,
    shouldShowChoiceModal,
    getPreferredEditUrl
  };
};