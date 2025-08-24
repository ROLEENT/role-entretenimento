import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useSimulationMode = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  
  const simulateOperation = useCallback((operationType: string, entityName: string, callback?: () => void) => {
    setIsSimulating(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsSimulating(false);
      
      toast.success(`${operationType} de ${entityName} simulada com sucesso! (Ambiente read-only)`);
      
      // Execute callback if provided (for UI updates)
      if (callback) {
        callback();
      }
    }, 1500);
    
    return true;
  }, []);

  const isReadOnlyError = useCallback((error: any) => {
    const message = error?.message || '';
    return message.includes('read-only') || 
           message.includes('cannot execute') || 
           message.includes('readonly');
  }, []);

  return {
    isSimulating,
    simulateOperation,
    isReadOnlyError
  };
};