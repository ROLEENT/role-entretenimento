import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Lazy load do EventCreateWizard principal
const EventCreateWizard = lazy(() => 
  import('./EventCreateWizard').then(module => ({ 
    default: module.EventCreateWizard 
  }))
);

// Componentes lazy load disponíveis quando steps existirem

interface LazyEventCreateWizardProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const WizardLoadingFallback = () => (
  <div className="min-h-[600px] flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Carregando formulário de eventos...</p>
    </div>
  </div>
);

const StepLoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center space-y-2">
      <LoadingSpinner />
      <p className="text-sm text-muted-foreground">Carregando etapa...</p>
    </div>
  </div>
);

export function LazyEventCreateWizard(props: LazyEventCreateWizardProps) {
  return (
    <Suspense fallback={<WizardLoadingFallback />}>
      <EventCreateWizard {...props} />
    </Suspense>
  );
}

// Placeholder - step components will be loaded directly from wizard folder
export const LazyBasicInfoStep = () => null;
export const LazyLocationStep = () => null;
export const LazyLineupStep = () => null;
export const LazyPartnersStep = () => null;
export const LazyDetailsStep = () => null;
export const LazyReviewStep = () => null;