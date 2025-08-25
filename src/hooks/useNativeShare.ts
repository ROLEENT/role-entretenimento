import { useState } from 'react';
import { toast } from 'sonner';

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export const useNativeShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  const canShare = () => {
    return typeof navigator !== 'undefined' && navigator.share;
  };

  const share = async (data: ShareData): Promise<boolean> => {
    if (!canShare()) {
      return false;
    }

    setIsSharing(true);
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Erro ao compartilhar');
      }
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const shareOrFallback = async (data: ShareData, fallbackAction: () => void): Promise<void> => {
    const shared = await share(data);
    if (!shared) {
      fallbackAction();
    }
  };

  return {
    canShare: canShare(),
    share,
    shareOrFallback,
    isSharing
  };
};