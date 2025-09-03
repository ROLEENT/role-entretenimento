import { useState, useEffect } from 'react';
import { useAnimatedToast } from './useAnimatedToast';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { showAnimatedToast } = useAnimatedToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showAnimatedToast({
        title: "Conexão restaurada!",
        description: "Você está novamente online",
        icon: "success",
        duration: 3000
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      showAnimatedToast({
        title: "Sem conexão",
        description: "Verifique sua conexão com a internet",
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showAnimatedToast]);

  return { isOnline };
};