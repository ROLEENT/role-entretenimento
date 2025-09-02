import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  ArrowUp,
  Shield
} from 'lucide-react';
import { useIntelligentEventStatus, useIntelligentVenueStatus } from '@/hooks/useIntelligentStatus';
import { toast } from 'sonner';

interface IntelligentStatusFieldProps {
  form: UseFormReturn<any>;
  type: 'event' | 'venue';
  statusFieldName?: string;
}

export const IntelligentStatusField: React.FC<IntelligentStatusFieldProps> = ({
  form,
  type,
  statusFieldName = 'status'
}) => {
  const eventStatus = useIntelligentEventStatus(form);
  const venueStatus = useIntelligentVenueStatus(form);
  
  const { validation, completion, enforceStatus, suggestStatus } = 
    type === 'event' ? eventStatus : venueStatus;

  const statusOptions = type === 'event' 
    ? [
        { value: 'draft', label: 'Rascunho', description: 'Não visível publicamente' },
        { value: 'published', label: 'Publicado', description: 'Visível no site' }
      ]
    : [
        { value: 'inactive', label: 'Inativo', description: 'Não visível publicamente' },
        { value: 'active', label: 'Ativo', description: 'Visível no site' }
      ];

  const currentStatus = form.watch(statusFieldName);
  const publishOption = type === 'event' ? 'published' : 'active';
  const draftOption = type === 'event' ? 'draft' : 'inactive';

  // Auto-enforce status when completion drops below threshold
  useEffect(() => {
    const wasEnforced = enforceStatus();
    if (wasEnforced) {
      toast.warning('Status alterado automaticamente devido à completude insuficiente');
    }
  }, [enforceStatus]);

  const handleStatusChange = (newStatus: string) => {
    // Check if trying to publish without sufficient completion
    if (newStatus === publishOption && !validation.canPublish) {
      toast.error(`Não é possível ${type === 'event' ? 'publicar' : 'ativar'} com completude abaixo de ${validation.completionRequired}%`);
      return;
    }
    
    form.setValue(statusFieldName, newStatus);
    
    if (newStatus === publishOption && validation.canPublish) {
      toast.success(`${type === 'event' ? 'Evento' : 'Local'} ${type === 'event' ? 'publicado' : 'ativado'} com sucesso!`);
    }
  };

  const handleSuggestStatus = () => {
    const suggested = suggestStatus();
    if (suggested) {
      form.setValue(statusFieldName, suggested);
      toast.success(`Status alterado para "${statusOptions.find(opt => opt.value === suggested)?.label}"`);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={statusFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Status
              <Badge variant={validation.canPublish ? "default" : "secondary"} className="text-xs">
                {completion.percentage}% completo
              </Badge>
            </FormLabel>
            <Select 
              onValueChange={handleStatusChange} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.value === publishOption && !validation.canPublish}
                  >
                    <div className="flex items-center gap-2">
                      {option.value === publishOption ? (
                        validation.canPublish ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Shield className="h-4 w-4 text-gray-400" />
                        )
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-gray-300" />
                      )}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Status Suggestions */}
      {validation.canPublish && currentStatus === draftOption && (
        <Alert className="border-green-200 bg-green-50">
          <ArrowUp className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span>Este {type === 'event' ? 'evento' : 'local'} está pronto para ser {type === 'event' ? 'publicado' : 'ativado'}!</span>
            <Button 
              size="sm" 
              onClick={handleSuggestStatus}
              className="ml-2"
            >
              {type === 'event' ? 'Publicar' : 'Ativar'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Atenção:</div>
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-sm">• {warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Improvement Suggestions */}
      {validation.suggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <div className="font-medium text-blue-900">Sugestões para melhorar:</div>
                {validation.suggestions.map((suggestion, index) => (
                  <div key={index} className="text-sm text-blue-800">• {suggestion}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};