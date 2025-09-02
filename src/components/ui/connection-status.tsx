import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function ConnectionStatus({ 
  className, 
  showWhenOnline = false 
}: ConnectionStatusProps) {
  const isOnline = useOnlineStatus();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
    } else if (showWhenOnline) {
      setShowStatus(true);
      // Hide after 3 seconds when coming back online
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowStatus(false);
    }
  }, [isOnline, showWhenOnline]);

  if (!showStatus) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300',
        isOnline 
          ? 'bg-success text-success-foreground' 
          : 'bg-destructive text-destructive-foreground',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          Conectado
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Sem conexão
        </>
      )}
    </div>
  );
}