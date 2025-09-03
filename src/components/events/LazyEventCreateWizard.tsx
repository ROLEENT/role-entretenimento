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

// Componentes de step individuais para lazy loading
export const LazyBasicInfoStep = (props: any) => (
  <Suspense fallback={<StepLoadingFallback />}>
    <BasicInfoStep {...props} />
  </Suspense>
);

export const LazyLocationStep = (props: any) => (
  <Suspense fallback={<StepLoadingFallback />}>
    <LocationStep {...props} />
  </Suspense>
);

export const LazyLineupStep = (props: any) => (
  <Suspense fallback={<StepLoadingFallback />}>
    <LineupStep {...props} />
  </Suspense>
);

export const LazyPartnersStep = (props: any) => (
  <Suspense fallback={<StepLoadingFallback />}>
    <PartnersStep {...props} />
  </Suspense>
);

export const LazyDetailsStep = (props: any) => (
  <Suspense fallback={<StepLoadingFallback />}>
    <DetailsStep {...props} />
  </Suspense>
);

export const LazyReviewStep = (props: any) => (
  <Suspense fallback={<StepLoadingFallback />}>
    <ReviewStep {...props} />
  </Suspense>
);