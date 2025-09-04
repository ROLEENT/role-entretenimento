import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, type EventFormData } from '@/schemas/eventSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useUpsertEventV3 } from '@/hooks/useUpsertEventV3';

// Step components
import { BasicInfoStep } from './wizard/BasicInfoStep';
import { DateLocationStep } from './wizard/DateLocationStep';
import { LineupStep } from './wizard/LineupStep';
import { MediaStep } from './wizard/MediaStep';
import { LinksStep } from './wizard/LinksStep';
import { ReviewStep } from './wizard/ReviewStep';
import { PublishStep } from './wizard/PublishStep';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  fields: (keyof EventFormData)[];
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    description: 'Título, subtítulo, resumo e cidade',
    component: BasicInfoStep,
    fields: ['title', 'subtitle', 'summary', 'city', 'highlight_type', 'selection_reasons', 'partners']
  },
  {
    id: 'datetime',
    title: 'Data & Local',
    description: 'Horários específicos e endereço completo',
    component: DateLocationStep,
    fields: ['date_start', 'date_end', 'doors_open_utc', 'headliner_starts_utc', 'venue_id', 'location_name', 'address', 'state', 'country']
  },
  {
    id: 'lineup',
    title: 'Lineup',
    description: 'Artistas, slots e performances',
    component: LineupStep,
    fields: ['lineup_slots', 'performances', 'visual_artists']
  },
  {
    id: 'media',
    title: 'Mídia',
    description: 'Imagens, galeria e SEO',
    component: MediaStep,
    fields: ['image_url', 'cover_url', 'cover_alt', 'gallery', 'og_image_url']
  },
  {
    id: 'links',
    title: 'Links & SEO',
    description: 'Metadados e links externos',
    component: LinksStep,
    fields: ['seo_title', 'seo_description', 'links', 'accessibility', 'ticket_url', 'ticketing']
  },
  {
    id: 'review',
    title: 'Revisão',
    description: 'Conferir todos os dados antes de salvar',
    component: ReviewStep,
    fields: []
  },
  {
    id: 'publish',
    title: 'Publicar',
    description: 'Status e checklist de publicação',
    component: PublishStep,
    fields: ['status', 'highlight_type']
  }
];

export interface EventCreateWizardProps {
  initialData?: Partial<EventFormData>;
  onSave?: (data: EventFormData) => void;
  onCancel?: () => void;
}

export const EventCreateWizard: React.FC<EventCreateWizardProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();
  const { mutate: saveEvent, isPending: isSaving } = useUpsertEventV3();

  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      summary: '',
      description: '',
      slug: '',
      city: '',
      state: '',
      country: 'Brasil',
      currency: 'BRL',
      status: 'draft',
      visibility: 'public',
      highlight_type: 'none',
      is_sponsored: false,
      age_rating: 'L',
      genres: [],
      tags: [],
      gallery: [],
      ticket_rules: [],
      links: {},
      accessibility: {},
      ticketing: {},
      lineup_slots: [],
      performances: [],
      visual_artists: [],
      ...initialData
    },
    mode: 'onChange'
  });

  const { watch, formState: { errors, isValid }, trigger, setValue } = methods;
  const watchedTitle = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !initialData?.slug) {
      const slug = watchedTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-|-$/g, '');
      
      setValue('slug', slug);
    }
  }, [watchedTitle, setValue, initialData?.slug]);

  // Progressive validation
  const validateCurrentStep = async () => {
    const currentStepConfig = WIZARD_STEPS[currentStep];
    const fieldsToValidate = currentStepConfig.fields;
    
    if (fieldsToValidate.length === 0) return true;
    
    // Get current form values for conditional validation
    const formValues = methods.getValues();
    
    // Add conditional fields based on current values
    let conditionalFields: (keyof EventFormData)[] = [];
    
    if (currentStep === 0) { // Basic step
      if (formValues.highlight_type === 'destaque') {
        conditionalFields.push('selection_reasons');
      }
    }
    
    const allFieldsToValidate = [...fieldsToValidate, ...conditionalFields];
    
    const isStepValid = await trigger(allFieldsToValidate);
    
    // Debug logging for development
    if (process.env.NODE_ENV === 'development' && !isStepValid) {
      console.log('❌ Validation failed for step:', currentStep);
      console.log('Fields to validate:', allFieldsToValidate);
      console.log('Current errors:', errors);
      console.log('Form values:', formValues);
    }
    
    if (isStepValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    
    return isStepValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    
    if (isValid && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (!isValid) {
      // Get specific error messages for better UX
      const currentErrors = Object.entries(errors)
        .filter(([field, _]) => {
          const currentStepConfig = WIZARD_STEPS[currentStep];
          return currentStepConfig.fields.includes(field as keyof EventFormData);
        })
        .map(([field, error]) => `${field}: ${error?.message || 'Campo obrigatório'}`)
        .join('\n');
      
      toast({
        title: 'Erro de validação',
        description: currentErrors || 'Por favor, corrija os erros antes de continuar.',
        variant: 'destructive'
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1) {
      await handleNext();
    }
  };

  const handleSave = async (data: EventFormData) => {
    try {
      saveEvent(data, {
        onSuccess: (result) => {
          toast({
            title: 'Evento salvo!',
            description: 'O evento foi criado com sucesso.',
          });
          
          if (onSave) {
            onSave(data);
          } else {
            navigate(`/events/${result}`);
          }
        },
        onError: (error) => {
          toast({
            title: 'Erro ao salvar',
            description: error.message,
            variant: 'destructive'
          });
        }
      });
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handlePreview = () => {
    // Implementation for preview functionality
    toast({
      title: 'Preview',
      description: 'Função de preview em desenvolvimento.',
    });
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const CurrentStepComponent = WIZARD_STEPS[currentStep].component;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {initialData ? 'Editar Evento' : 'Criar Novo Evento'}
        </h1>
        <Progress value={progress} className="w-full h-2" />
      </div>

      {/* Steps navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStep;
          const isAccessible = index <= currentStep || completedSteps.has(index);

          return (
            <Button
              key={step.id}
              variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'}
              className={`flex items-center gap-2 ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              onClick={() => isAccessible && handleStepClick(index)}
              disabled={!isAccessible}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.title}</span>
              <span className="sm:hidden">{index + 1}</span>
            </Button>
          );
        })}
      </div>

      {/* Current step content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{currentStep + 1}/{WIZARD_STEPS.length}</Badge>
            {WIZARD_STEPS[currentStep].title}
          </CardTitle>
          <p className="text-muted-foreground">
            {WIZARD_STEPS[currentStep].description}
          </p>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <CurrentStepComponent />
          </FormProvider>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>

          {currentStep === WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={methods.handleSubmit(handleSave)}
              disabled={!isValid || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Evento'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Cancel button */}
      {onCancel && (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8 bg-muted">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>Current Step: {currentStep}</p>
            <p>Completed Steps: {Array.from(completedSteps).join(', ')}</p>
            <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
            <p>Errors: {Object.keys(errors).length}</p>
            {Object.keys(errors).length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Current Errors:</p>
                <pre className="text-xs bg-destructive/10 p-2 rounded">
                  {JSON.stringify(errors, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};