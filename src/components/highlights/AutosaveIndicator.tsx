import { Badge } from '@/components/ui/badge';
import { Clock, Save, AlertCircle } from 'lucide-react';

interface AutosaveIndicatorProps {
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
}

export const AutosaveIndicator = ({ 
  lastSaved, 
  hasUnsavedChanges = false, 
  isSaving = false 
}: AutosaveIndicatorProps) => {
  if (isSaving) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Save className="w-3 h-3 animate-pulse" />
        Salvando rascunho...
      </Badge>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-600">
        <AlertCircle className="w-3 h-3" />
        Alterações não salvas
      </Badge>
    );
  }

  if (lastSaved) {
    const timeString = lastSaved.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    return (
      <Badge variant="secondary" className="flex items-center gap-1 text-green-600">
        <Clock className="w-3 h-3" />
        Rascunho salvo {timeString}
      </Badge>
    );
  }

  return null;
};