import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { createProfileSchema, type CreateProfile } from './schemas';
import { createProfile } from './services';
import { BasicInfoStep } from './components/form-steps/BasicInfoStep';
import { MediaStep } from './components/form-steps/MediaStep';
import { SpecificFieldsStep } from './components/form-steps/SpecificFieldsStep';
import { ReviewStep } from './components/form-steps/ReviewStep';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type Step = 'basic' | 'media' | 'specific' | 'review';

const steps: { key: Step; label: string; description: string }[] = [
  { key: 'basic', label: 'Informações Básicas', description: 'Nome, handle e localização' },
  { key: 'media', label: 'Imagens', description: 'Avatar e capa do perfil' },
  { key: 'specific', label: 'Detalhes Específicos', description: 'Campos do tipo de perfil' },
  { key: 'review', label: 'Revisão', description: 'Confirme os dados antes de criar' }
];

export function ProfileForm() {
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CreateProfile>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      type: 'artista',
      visibility: 'public',
      country: 'BR',
      tags: [],
      links: [],
    },
    mode: 'onChange'
  });

  const watchedType = form.watch('type');
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const onSubmit = async (data: CreateProfile) => {
    if (currentStep !== 'review') return;
    
    setIsSubmitting(true);
    try {
      const profileId = await createProfile(data as any);
      toast({
        title: 'Perfil criado com sucesso!',
        description: 'Redirecionando para o seu perfil...'
      });
      navigate(`/perfil/${data.handle}`);
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar perfil',
        description: error instanceof Error ? error.message : 'Tente novamente'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = async () => {
    const fields = getStepFields(currentStep, watchedType);
    const isValid = await form.trigger(fields);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  const getStepFields = (step: Step, type: string): (keyof CreateProfile)[] => {
    switch (step) {
      case 'basic':
        return ['type', 'name', 'handle', 'city', 'state', 'country', 'bio_short'];
      case 'media':
        return ['avatar_file', 'cover_file'];
      case 'specific':
        if (type === 'artista') {
          return ['genres' as keyof CreateProfile];
        } else if (type === 'local') {
          return ['capacity' as keyof CreateProfile, 'age_policy' as keyof CreateProfile];
        }
        return [];
      case 'review':
        return [];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return <BasicInfoStep form={form} />;
      case 'media':
        return <MediaStep form={form} />;
      case 'specific':
        return <SpecificFieldsStep form={form} type={watchedType} />;
      case 'review':
        return <ReviewStep form={form} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 'review') return true;
    const fields = getStepFields(currentStep, watchedType);
    const errors = form.formState.errors;
    return fields.every(field => !errors[field]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Criar Novo Perfil</CardTitle>
              <p className="text-muted-foreground mt-1">
                {steps.find(s => s.key === currentStep)?.description}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Etapa {currentStepIndex + 1} de {steps.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className={`flex items-center gap-2 text-sm ${
                    index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-current" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              {currentStep === 'review' ? (
                <Button
                  type="submit"
                  disabled={isSubmitting || !canProceed()}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Perfil'}
                  <Check className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileForm;