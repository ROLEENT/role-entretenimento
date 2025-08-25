import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const DevCacheButton = () => {
  const [clearing, setClearing] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const clearAllCache = async () => {
    if (typeof window === 'undefined') return;
    
    setClearing(true);
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name) {
              return new Promise<void>((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!);
                deleteReq.onsuccess = () => resolve();
                deleteReq.onerror = () => reject(deleteReq.error);
                deleteReq.onblocked = () => {
                  console.warn(`Database ${db.name} is blocked, trying to continue`);
                  resolve();
                };
              });
            }
          })
        );
      }
      
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }
      
      toast.success('Cache limpo! Recarregando página...');
      
      // Reload page after clearing
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={clearAllCache}
      disabled={clearing}
      className="fixed top-4 right-4 z-50 bg-red-100 text-red-700 hover:bg-red-200"
      title="[DEV] Limpar todo o cache"
    >
      <Trash2 className="h-4 w-4" />
      {clearing ? 'Limpando...' : 'Clear Cache'}
    </Button>
  );
};