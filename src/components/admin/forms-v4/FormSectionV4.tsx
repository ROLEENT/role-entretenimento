import React from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSection } from './types';

interface FormSectionV4Props<T extends FieldValues> {
  section: FormSection;
  form: UseFormReturn<T>;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
}

export function FormSectionV4<T extends FieldValues>({
  section,
  form,
  children,
  isOpen = section.defaultOpen || false,
  onToggle,
  className
}: FormSectionV4Props<T>) {
  const { formState: { errors } } = form;
  
  // Verificar se há erros nesta seção
  const hasErrors = React.useMemo(() => {
    const checkErrors = (obj: any, sectionId: string): boolean => {
      // Mapeamento de seção para campos relacionados
      const sectionFieldMap: Record<string, string[]> = {
        basic: ['name', 'handle', 'slug', 'bio_short', 'bio_long'],
        type: ['type', 'categories', 'genres'],
        contact: ['email', 'phone', 'whatsapp', 'instagram'],
        location: ['address_line', 'district', 'city', 'state', 'postal_code'],
        media: ['profile_image_url', 'logo_url', 'cover_url', 'gallery'],
        links: ['links'],
        professional: ['dj_style', 'equipment_needs', 'band_members', 'instruments'],
        business: ['booking_contact', 'fee_range', 'availability'],
        capacity: ['capacity', 'opening_hours'],
        features: ['features', 'bar_style', 'cuisine_type'],
        internal: ['status', 'priority', 'internal_notes']
      };
      
      const fieldsToCheck = sectionFieldMap[sectionId] || [];
      
      return fieldsToCheck.some(field => {
        const fieldError = obj[field];
        return fieldError !== undefined;
      });
    };
    
    return checkErrors(errors, section.id);
  }, [errors, section.id]);

  // Verificar se a seção está completa (tem dados válidos)
  const isComplete = React.useMemo(() => {
    // Lógica básica de completude - pode ser expandida
    if (hasErrors) return false;
    if (section.required) {
      // Para seções obrigatórias, verificar se campos básicos estão preenchidos
      const watchedValues = form.watch();
      
      switch (section.id) {
        case 'basic':
          return !!watchedValues.name;
        case 'type':
          return !!watchedValues.type;
        case 'contact':
          return !!watchedValues.email || !!watchedValues.phone;
        case 'location':
          return !!watchedValues.city;
        case 'media':
          return !!watchedValues.profile_image_url || !!watchedValues.logo_url;
        default:
          return true;
      }
    }
    return true;
  }, [form, section.id, section.required, hasErrors]);

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={onToggle}
      className={cn("border rounded-lg", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            {section.icon && (
              <section.icon className="h-5 w-5 text-muted-foreground" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">{section.title}</h3>
                
                {section.required && (
                  <Badge variant="secondary" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
                
                {hasErrors && (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Erros
                  </Badge>
                )}
                
                {!hasErrors && isComplete && (
                  <Badge variant="default" className="text-xs gap-1 bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3" />
                    Completo
                  </Badge>
                )}
              </div>
              
              {section.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
              )}
            </div>
          </div>
          
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-4 pb-4">
        <div className="border-t pt-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}